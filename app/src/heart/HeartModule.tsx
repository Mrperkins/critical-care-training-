/** Congenital heart module: shunt physiology on a live four-chamber heart. */
import { MiniSelect } from '../scene/pane';
import { useEffect, useMemo } from 'react';
import { NEO_TRANSITION_LESSON } from '../director/lessons/populations';
import { NeoCard } from '../populations/Cards';
function NeoSlot() { const neo = useHeartUI((s) => (s.input.qs ?? 5) < 2); return neo ? <NeoCard /> : null; }
import { CaseChallenge } from '../challenge/CaseChallenge';
import { useHideFindings } from '../challenge/caseStore';
import { useUI } from '../app/store';
import { Knob, Seg } from '../vent/VentPanel';
import { HeartScene } from './HeartScene';
import { useHeartUI, loadHeartPreset, setHeartInput, type FlowMode, type CutMode } from './heartStore';
import { autoCut, CUT_LABEL } from './HeartScene';
import { RealCase } from '../scene/imaging/RealCase';
import { Picker, Fold } from '../scene/pane';
import { useRealCount } from '../scene/imaging/RealExamples';
import { solveShunt, type HeartPresetId, type LesionKind } from './shunt';
import { director, useDirector } from '../director/director';
import { DirectorPlayer } from '../director/Player';
import { HEART_LESSONS } from '../director/lessons/heart';
import { SAT_PALETTE } from '../scene/effects';
import { useLabUI, type VisualTier } from '../labs/labStore';
import { SceneWrap } from '../scene/labels';

const PRESETS: [HeartPresetId, string][] = [['normal', 'Normal'], ['vsdSmall', 'Small VSD'], ['vsdLarge', 'Large VSD'], ['vsdEisen', 'VSD · Eisenmenger'], ['asd', 'ASD'], ['pfo', 'PFO'], ['pfoValsalva', 'PFO · Valsalva'], ['pda', 'PDA'],
  ['tof', 'Tetralogy'], ['pinkTet', 'Tetralogy · "pink"'], ['tetSpell', 'Tet spell'], ['coarct', 'Coarctation'], ['coarctNeoDuct', 'Newborn coarctation · duct open'], ['coarctNeoClosed', 'Newborn coarctation · duct closing'], ['newborn', 'Newborn · closing duct'], ['pphn', 'Newborn · PPHN']];
const FOCUS: [string, string][] = [['heart.four_chamber', '4-chamber'], ['heart.vsd', 'VSD'], ['heart.asd', 'ASD / PFO'], ['heart.lv', 'LV'], ['heart.rv', 'RV'], ['heart.pulmonary_outflow', 'RV outflow'], ['heart.pda', 'Duct'], ['heart.coarct', 'Isthmus']];
const CUTS: [CutMode, string][] = [['auto', 'Auto'], ['slice', '4-chamber slice'], ['rv', 'RV open'], ['ra', 'RA open'], ['lv', 'LV open'], ['closed', 'Closed']];
/** the best focus for a lesion, used when the lesion changes */
const LESION_FOCUS: Record<LesionKind, string> = { none: 'heart.four_chamber', vsd: 'heart.vsd', asd: 'heart.asd', pfo: 'heart.pfo', pda: 'heart.pda', tof: 'heart.vsd', coarct: 'heart.coarct' };

export function HeartModule() {
  const mode = useUI((s) => s.mode);
  const dTarget = useDirector((s) => s.target);
  useEffect(() => { if (dTarget?.startsWith('heart.')) useHeartUI.getState().set({ target: dTarget }); }, [dTarget]);
  useEffect(() => { (window as unknown as { __CCHeart: unknown }).__CCHeart = { store: useHeartUI, load: loadHeartPreset, set: setHeartInput, focus: (id: string) => useHeartUI.getState().set({ target: id }) }; }, []);
  return (
    <main className="stage">
      <section className="scene-pane">
        <SceneWrap><HeartScene /><HeartOverlay /></SceneWrap>
      </section>
      <aside id="controls" tabIndex={-1} className="side-pane" aria-label="Controls and readings"><h2 className="sr-only">Controls and readings</h2>
        {mode === 'challenge' ? <CaseChallenge module="heart" /> : mode === 'learn' ? <HeartLearn /> : <>
          <PresetCard />
          <ControlsCard />
          <NeoSlot />
          <Fold group="heart" id="circ" title="Circulation" summary="PVR, SVR, patient size"><CirculationCard /></Fold>
          <Fold group="heart" id="nums" title="Pressures & saturations" summary={<HemoSummary />}><HemoCard /></Fold>
          <Fold group="heart" id="why" title="Why it happens"><WhyCard /></Fold>
          <RealHeartImaging />
        </>}
        <details className="credit"><summary>Sources & model notes</summary>3D heart: HuBMAP 3D Reference Organs, Visible Human Male heart (CC BY 4.0) — an adult heart at true scale, cut open in the app; the defects are carved into its own septa and vessels (sizes drawn to scale; newborn defects drawn relative to a heart about 2.5× smaller). Flows, pressures and saturations come from a simplified circulation model (orifice flow across restrictive defects, conductance across atrial defects, parallel outlets in tetralogy, an isthmus resistance with collaterals and duct in coarctation) — a teaching model, not a patient calculator.</details>
      </aside>
    </main>
  );
}

function HeartOverlay() {
  const target = useHeartUI((s) => s.target); const flow = useHeartUI((s) => s.mode); const cut = useHeartUI((s) => s.cut); const set = useHeartUI.getState().set;
  const input = useHeartUI((s) => s.input); const s = useMemo(() => solveShunt(input), [input]); const tier = useLabUI((s) => s.visualTier);
  const pct = (x: number) => `${Math.round(x * 100)}%`; const hide = useHideFindings();
  return (<>
    <div className="scene-tools">
      <div className="seg small" role="group" aria-label="Flow colour">{([['sat', 'O₂ saturation'], ['doppler', 'Flow direction']] as [FlowMode, string][]).map(([k, l]) => <button key={k} className={flow === k ? 'on' : ''} onClick={() => set({ mode: k })}>{l}</button>)}</div>
      <MiniSelect label="Open" value={cut} options={CUTS.map(([k, l]) => [k, k === 'auto' ? `Auto · ${CUT_LABEL[autoCut(target)]}` : l]) as [CutMode, string][]} onChange={(v) => set({ cut: v })} />
    </div>
    {!hide && <div className="alv-hud">
      <div className="alv-row"><span>Shunt</span><b className={`dir dir-${s.direction === 'L→R' ? 'lr' : s.direction === 'R→L' ? 'rl' : s.direction === 'bidirectional' ? 'bi' : 'none'}`}>{s.direction === 'none' ? 'none' : s.direction}</b></div>
      <div className="alv-row"><span>Qp : Qs</span><b>{s.qpqs.toFixed(1)} : 1</b></div>
      {s.gradient > 0 && !['asd', 'coarct', 'tof'].includes(s.input.lesion) && <div className="alv-row"><span>Jet velocity</span><b>{s.velocity.toFixed(1)} m/s</b></div>}
      {s.rvot && <div className="alv-row"><span>RV outflow gradient</span><b>{Math.round(s.rvot.gradient)} mmHg</b></div>}
      {s.coarct && <div className="alv-row"><span>Arm / leg BP</span><b>{Math.round(s.coarct.armSys)} / {Math.round(s.coarct.legSys)}</b></div>}
      <div className="alv-row"><span>RV / LV systolic</span><b>{Math.round(s.p.rvSys)} / {Math.round(s.p.lvSys)}</b></div>
      <div className="alv-row"><span>PA mean</span><b>{Math.round(s.p.paMean)} mmHg</b></div>
      <div className="alv-row"><span>SpO₂ (pre / post)</span><b>{pct(s.sat.ao)}{s.input.lesion === 'pda' || s.input.lesion === 'coarct' ? ` / ${pct(s.sat.aoPost)}` : ''}</b></div>
    </div>}
    <div className="alv-focus">
      <MiniSelect label="View" value={target} options={FOCUS as [string, string][]} onChange={(v) => set({ target: v })} className="ch-focus" />
    </div>
    <div className="legend">{flow === 'sat'
      ? <><span><i style={{ background: SAT_PALETTE.teachArterial }} />Oxygenated</span><span><i style={{ background: SAT_PALETTE.teachVenous }} />Deoxygenated</span><span>▲ jet = shunt</span></>
      : <><span><i style={{ background: '#e0322b' }} />Toward apical probe</span><span><i style={{ background: '#2f6be0' }} />Away</span><span><i style={{ background: 'linear-gradient(90deg,#e8c224,#4fd04a)' }} />Aliasing (fast jet)</span></>}</div>
  </>);
}

const PRESET_GROUPS: { label: string; ids: HeartPresetId[] }[] = [
  { label: 'Shunts', ids: ['normal', 'vsdSmall', 'vsdLarge', 'vsdEisen', 'asd', 'pfo', 'pfoValsalva', 'pda'] },
  { label: 'Obstruction', ids: ['tof', 'pinkTet', 'tetSpell', 'coarct'] },
  { label: 'Newborn', ids: ['newborn', 'pphn', 'coarctNeoDuct', 'coarctNeoClosed'] },
];
const PRESET_NAME = Object.fromEntries(PRESETS) as Record<HeartPresetId, string>;
function PresetCard() {
  const preset = useHeartUI((s) => s.preset);
  const pick = (id: string) => { loadHeartPreset(id as HeartPresetId); useHeartUI.getState().set({ target: LESION_FOCUS[useHeartUI.getState().input.lesion] }); };
  return <Picker label="Scenario" value={preset === 'custom' ? 'custom' : preset} onPick={pick}
    groups={[...PRESET_GROUPS.map((g) => ({ label: g.label, items: g.ids.map((id) => ({ id, name: PRESET_NAME[id] })) })), ...(preset === 'custom' ? [{ items: [{ id: 'custom', name: 'Custom (adjusted)' }] }] : [])]} />;
}
function HemoSummary() { const inp = useHeartUI((s) => s.input); const s = useMemo(() => solveShunt(inp), [inp]); return <>Qp:Qs {s.qpqs.toFixed(1)} · SaO₂ {Math.round(s.sat.ao * 100)}%</>; }
function ControlsCard() {
  const inp = useHeartUI((s) => s.input); const neo = (inp.qs ?? 5) < 2;
  return (
    <section className="card">
      <div className="card-h"><h3>Adjust the defect</h3></div>
      {['vsd', 'asd', 'pfo', 'pda'].includes(inp.lesion) && <Knob label="Defect size" value={inp.sizeMm} min={1} max={inp.lesion === 'asd' ? 30 : 20} step={1} unit=" mm" onChange={(v) => setHeartInput({ sizeMm: v })} hint="Bigger hole → more flow for the same gradient (drawn to scale in the 3D heart)" />}
      {inp.lesion === 'vsd' && <div className="nd-row"><span className="muted small">Where</span><Seg small value={inp.vsdSite ?? 'perimembranous'} options={[['perimembranous', 'Perimembranous'], ['muscular', 'Muscular']]} onChange={(v) => setHeartInput({ vsdSite: v })} /></div>}
      {inp.lesion === 'tof' && <Knob label="RV outflow narrowing" value={Math.round((inp.rvot ?? 0.5) * 100)} min={0} max={95} step={5} unit=" %" onChange={(v) => setHeartInput({ rvot: v / 100 })} hint="Infundibular + valve narrowing. Spasm (crying, dehydration) makes it worse; beta-blockade relaxes it." />}
      {inp.lesion === 'coarct' && <>
        <Knob label="Isthmus narrowing" value={Math.round((inp.coarct ?? 0.55) * 100)} min={10} max={95} step={5} unit=" %" onChange={(v) => setHeartInput({ coarct: v / 100 })} hint="Older children grow collaterals around it; a newborn has none." />
        <Knob label="Duct" value={inp.ductMm ?? 0} min={0} max={6} step={0.5} unit=" mm" onChange={(v) => setHeartInput({ ductMm: v })} hint="Prostaglandin E1 keeps it open; closure in the first days unmasks a critical coarctation." />
      </>}
      {!['vsd', 'asd', 'pfo', 'pda', 'tof', 'coarct'].includes(inp.lesion) && <p className="muted small">No defect — pick one from Scenario, or change the circulation below.</p>}
    </section>
  );
}
function CirculationCard() {
  const inp = useHeartUI((s) => s.input); const neo = (inp.qs ?? 5) < 2;
  return (
    <section className="card">
      <div className="nd-row"><span className="muted small">Patient</span><Seg small value={neo ? 'neo' : 'adult'} options={[['adult', 'Adult'], ['neo', 'Newborn']]} onChange={(v) => setHeartInput(v === 'neo' ? { qs: 0.6, svr: 60, pvr: Math.min(150, inp.pvr * 3.3) } : { qs: 5, svr: 18, pvr: Math.max(0.5, Math.min(22, inp.pvr / 3.3)) })} /></div>
      {neo ? <>
        <Knob label="PVR" value={inp.pvr} min={2} max={150} step={1} unit=" WU" onChange={(v) => setHeartInput({ pvr: v })} hint="Newborn scale (output ≈ 0.6 L/min). Very high before the first breath; falls over hours to days. Stays high in PPHN." />
        <Knob label="SVR" value={inp.svr} min={30} max={100} step={1} unit=" WU" onChange={(v) => setHeartInput({ svr: v })} hint="Newborn scale: ≈ 60 gives a mean aortic pressure ≈ 40 mmHg at term" />
      </> : <>
      <Knob label="PVR" value={inp.pvr} min={0.5} max={22} step={0.5} unit=" WU" onChange={(v) => setHeartInput({ pvr: v })} hint="Pulmonary vascular resistance (normal 1–2). Rises with years of overcirculation." />
      <Knob label="SVR" value={inp.svr} min={8} max={30} step={1} unit=" WU" onChange={(v) => setHeartInput({ svr: v })} hint="Systemic vascular resistance (normal 15–20)" />
      </>}
      <Knob label="Right atrial load" value={inp.raLoad ?? 0} min={0} max={20} step={1} unit=" mmHg" onChange={(v) => setHeartInput({ raLoad: v })} hint="Valsalva, coughing, pulmonary embolism" />
    </section>
  );
}
function HemoCard() {
  const inp = useHeartUI((s) => s.input); const s = useMemo(() => solveShunt(inp), [inp]); const f = (x: number) => Math.round(x);
  const flags = [s.flags.spell && 'Tet spell — pulmonary flow collapsing', s.flags.lowerHypoperfusion && 'Lower-body hypoperfusion', s.flags.lvPressure && 'LV pressure load (hypertrophy), upper-limb hypertension', s.flags.overcirculation && 'Pulmonary overcirculation', s.flags.lvVolume && 'LA / LV volume load (dilated)', s.flags.rvVolume && 'RA / RV volume load (dilated)', s.flags.rvPressure && 'RV pressure load (hypertrophy)', s.flags.pulmHypertension && 'Pulmonary hypertension', s.flags.eisenmenger && 'Eisenmenger physiology', s.flags.cyanosis && 'Cyanosis'].filter(Boolean) as string[];
  return (
    <section className="card nums">
      <div className="numgrid">
        <div className="num"><span className="nl">Qp</span><span className="nv">{s.qp.toFixed(1)}</span><span className="nu">L/min</span></div>
        <div className="num"><span className="nl">Qs</span><span className="nv">{s.qs.toFixed(1)}</span><span className="nu">L/min</span></div>
        <div className="num"><span className="nl">L→R</span><span className="nv">{s.lr.toFixed(1)}</span><span className="nu">L/min</span></div>
        <div className="num"><span className="nl">R→L</span><span className="nv">{s.rl.toFixed(1)}</span><span className="nu">L/min</span></div>
        <div className="num"><span className="nl">RA / LA</span><span className="nv">{f(s.p.ra)}/{f(s.p.la)}</span><span className="nu">mmHg</span></div>
        <div className="num"><span className="nl">PA</span><span className="nv">{f(s.p.paSys)}/{f(s.p.paDia)}</span><span className="nu">mmHg</span></div>
        <div className="num"><span className="nl">Aorta</span><span className="nv">{f(s.p.aoSys)}/{f(s.p.aoDia)}</span><span className="nu">mmHg</span></div>
        <div className="num"><span className="nl">SaO₂ / PA sat</span><span className="nv">{f(s.sat.ao * 100)}/{f(s.sat.pa * 100)}</span><span className="nu">%</span></div>
        {s.rvot && <div className="num"><span className="nl">RV → PA gradient</span><span className="nv">{f(s.rvot.gradient)}</span><span className="nu">mmHg · {s.rvot.velocity.toFixed(1)} m/s</span></div>}
        {s.coarct && <><div className="num"><span className="nl">Arm BP</span><span className="nv">{f(s.coarct.armSys)}/{f(s.coarct.armDia)}</span><span className="nu">mmHg</span></div>
          <div className="num"><span className="nl">Leg BP</span><span className="nv">{f(s.coarct.legSys)}/{f(s.coarct.legDia)}</span><span className="nu">mmHg</span></div>
          <div className="num"><span className="nl">Lower-body flow</span><span className="nv">{f(s.coarct.lowerFrac * 100)}</span><span className="nu">% of normal</span></div>
          <div className="num"><span className="nl">SpO₂ hand / foot</span><span className="nv">{f(s.sat.ao * 100)}/{f(s.sat.aoPost * 100)}</span><span className="nu">%</span></div></>}
      </div>
      <p className="muted small" style={{ marginTop: 8 }}><b>Auscultation:</b> {s.murmur}</p>
      {flags.length > 0 && <ul className="ln-log">{flags.map((x) => <li key={x}>{x}</li>)}</ul>}
    </section>
  );
}
function WhyCard() {
  const L = useHeartUI((s) => s.input.lesion);
  const t: Record<LesionKind, string> = {
    none: 'Two circuits in series: the right heart pumps venous blood through the low-resistance lungs, the left heart pumps oxygenated blood through the high-resistance body. Equal flows, very different pressures.',
    vsd: 'Blood crosses the ventricular septum in systole from the higher-pressure side. A small hole keeps a big gradient (a fast, loud jet but little flow); a large hole lets the pressures equalise, so flow is set by the ratio of pulmonary to systemic resistance. The extra pulmonary flow returns to the LEFT atrium and ventricle, which dilate.',
    asd: 'Atrial pressures differ by only a few mmHg, so flow depends on the size of the hole and on how easily each ventricle fills. The thin, compliant right ventricle fills more easily, so blood goes left-to-right and the RIGHT atrium and ventricle take the volume load.',
    pfo: 'A flap left over from the fetal foramen ovale. Higher left atrial pressure normally holds it shut; anything that raises right atrial pressure (straining, coughing, pulmonary embolism) opens it right-to-left — the route for paradoxical embolism.',
    tof: 'Four features from one developmental shift (the outlet septum displaced forward): a large malaligned VSD, an aorta overriding it, a narrowed right-ventricular outflow, and a thick RV wall. Both ventricles eject at the same pressure into two parallel outlets, so the balance between outflow narrowing and systemic resistance decides how much blood reaches the lungs. A fall in SVR or outflow spasm starts a spell; knee-chest position, oxygen, morphine, fluids and phenylephrine raise SVR or relax the outflow.',
    coarct: 'A shelf narrows the aorta at the isthmus, just past the left subclavian. The heart and arms see high pressure; the legs get a weak, delayed pulse. Older children build collaterals around it. In a newborn the duct can fill the lower aorta from the pulmonary artery — the feet are bluer than the right hand — and when it closes a critical coarctation presents with shock. Keep the duct open with prostaglandin E1.',
    pda: 'The fetal ductus arteriosus stays open. Aortic pressure exceeds pulmonary pressure through the whole cycle, so flow is continuous from aorta to pulmonary artery. The extra pulmonary flow returns to the LEFT heart. If pulmonary resistance rises above systemic, flow reverses into the descending aorta and the feet turn blue before the hands.',
  };
  return <section className="card"><div className="card-h"><h3>Why</h3></div><p className="muted">{t[L]}</p></section>;
}

/** real echocardiography / CT for the current lesion (shown only once licensed media is in imaging/real) */
function RealHeartImaging() {
  const L = useHeartUI((s) => s.input.lesion); const n = useRealCount(`echo-${L}`); if (L === 'none' || !n) return null;
  return <Fold group="heart" id="real" title="Real echo" summary={`${n} real ${n === 1 ? 'study' : 'studies'}`}><RealCase kind={`echo-${L}` as never} /></Fold>;
}

const HEART_LEARN = [...HEART_LESSONS, NEO_TRANSITION_LESSON];
function HeartLearn() {
  const tl = useDirector((s) => s.tl); const active = tl && HEART_LEARN.some((l) => l.id === tl.id);
  useEffect(() => () => { if (HEART_LEARN.some((l) => l.id === useDirector.getState().tl?.id)) director.unload(); }, []);
  if (active) return <div className="chal-run"><DirectorPlayer onExit={() => undefined} />{tl.id === NEO_TRANSITION_LESSON.id && <NeoCard />}<HemoCard /></div>;
  return (
    <div className="chal-list">
      <section className="card"><div className="eyebrow">Guided learning</div><h2 className="h2">Congenital heart on a live circulation</h2><p className="muted">Narrated lessons that change the defect and the resistances while the heart, the flow and the numbers respond.</p></section>
      {HEART_LEARN.map((l) => <button key={l.id} className="chal-item" onClick={() => director.load(l, true)}><span className={`lvl lvl-${l.level}`}>{l.level}</span><span className="ci-t">{l.title}<small className="ci-b">{l.blurb}</small></span><span className="ci-k">{l.cues.length} steps</span></button>)}
    </div>
  );
}
