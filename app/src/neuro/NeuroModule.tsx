import { useExploreMemory } from '../app/exploreMemory';
import { MiniSelect, Picker, Fold } from '../scene/pane';
import { useEffect, useState } from 'react';
import { CaseChallenge } from '../challenge/CaseChallenge';
import { loadBodyAsset, type BodyAsset } from '../asset/body';
import { Knob, Seg } from '../vent/VentPanel';
import { NeuroScene } from './NeuroScene';
import { EvolutionCard, useEvolutionClock, useStageCT } from './EvolutionCard';
import { courseOf, fmtTime } from './evolution';
import { NeuroExamCard } from './ExamCard';
import { useNeuroUI, NEURO_PRESETS, loadNeuroPreset, setNeuroMinutes, recanalize, type NeuroPreset } from './neuroStore';
import { neuroSummary, hemorrhageShape, effectiveHemorrhage, sbpOf, type CollateralGrade } from './perfusion';
import { TERRITORIES, TERRITORY_NAME } from './anatomy';
import { useLabUI, type VisualTier } from '../labs/labStore';
import { useUI } from '../app/store';
import { director, useDirector } from '../director/director';
import { DirectorPlayer } from '../director/Player';
import { NEURO_LESSONS as BASE_NEURO } from '../director/lessons/neuro';
import { ICP_LESSON } from '../director/lessons/icp';
import { IcpCard } from './IcpCard';
import { SceneWrap } from '../scene/labels';
const NEURO_LESSONS = [...BASE_NEURO, ICP_LESSON];

const hm = (m: number) => (m < 60 ? `${Math.round(m)} min` : `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')} min`);

export function NeuroModule() {
  const [body, setBody] = useState<BodyAsset | null>(null); const [err, setErr] = useState<string | null>(null);
  useEffect(() => { loadBodyAsset().then(setBody).catch((e) => { console.error(e); setErr(String(e?.message || e)); }); }, []);
  useEffect(() => { (window as unknown as { __CCNeuro: unknown }).__CCNeuro = { store: useNeuroUI, load: loadNeuroPreset, minutes: setNeuroMinutes, recanalize, focus: (id: string) => useNeuroUI.getState().set({ target: id }), body: () => body }; }, [body]);
  useEvolutionClock();
  const mode = useUI((s) => s.mode); const view = useNeuroUI((s) => s.view);
  useExploreMemory('neuro', () => { const s = useNeuroUI.getState(); return { preset: s.preset, state: structuredClone(s.state), sys: { ...s.sys }, target: s.target, view: s.view, playing: false }; }, (m) => useNeuroUI.getState().set(m));
  // the Lesson Director's camera target drives the brain camera
  const dTarget = useDirector((s) => s.target);
  useEffect(() => { if (dTarget?.startsWith('brain.')) useNeuroUI.getState().set({ target: dTarget }); }, [dTarget]);
  return (
    <main className="stage">
      <section className="scene-pane">
        <SceneWrap className="neuro-wrap">
          {view === 'imaging' ? <RealCtView /> : body ? <NeuroScene body={body} /> : <div className="loading">{err ? `Could not load anatomy: ${err}` : 'Loading anatomy…'}</div>}
          <NeuroOverlay />
        </SceneWrap>
      </section>
      <aside id="controls" tabIndex={-1} className="side-pane" aria-label="Controls and readings"><h2 className="sr-only">Controls and readings</h2>
        {mode === 'challenge' ? <CaseChallenge module="neuro" /> : mode === 'learn' ? <NeuroLearn /> : <>
        <PresetCard />
        <EvolutionCard />
        <TissueFold />
        <Fold group="neuro" id="exam" title="Bedside exam" summary="NIHSS, deficits"><NeuroExamCard /></Fold>
        <Fold group="neuro" id="sys" title="Blood pressure & CO₂" summary="drive collateral flow"><SystemicCard /></Fold>
        <IcpIfMass />
        <Fold group="neuro" id="why" title="Why"><NeuroExplain /></Fold>
        </>}
        {body && <details className="credit"><summary>Sources & model notes</summary>Brain: {body.mapping.attribution.creators}, {body.mapping.attribution.data} — CC BY 4.0. Cerebral arteries are drawn from standard neurovascular anatomy onto that brain (schematic; calibres ×1.6). Perfusion thresholds (CBF ≈ 50 normal, &lt;20 penumbra, &lt;10 core) and infarct timing are teaching approximations, not a prediction for any patient.</details>}
      </aside>
    </main>
  );
}

const FOCUS: [string, string][] = [['brain.whole', 'Brain'], ['brain.cow', 'Circle of Willis'], ['brain.mca_l', 'L MCA'], ['brain.mca_r', 'R MCA'], ['brain.aca', 'ACA'], ['brain.pca', 'PCA'], ['brain.basilar', 'Basilar'], ['brain.ica_l', 'L ICA']];
function NeuroOverlay() {
  const target = useNeuroUI((s) => s.target); const glass = useNeuroUI((s) => s.glass); const cut = useNeuroUI((s) => s.cut); const slice = useNeuroUI((s) => s.slice); const deep = useNeuroUI((s) => s.deep); const set = useNeuroUI.getState().set;
  const tier = useLabUI((s) => s.visualTier); const view3d = useNeuroUI((s) => s.view) === '3d';
  return (<>
    <div className="view-btns"><button className={view3d ? 'on' : ''} onClick={() => set({ view: '3d' })}>3D brain</button><button className={!view3d ? 'on' : ''} onClick={() => set({ view: 'imaging' })}>Real CT</button></div>
    {!view3d ? null : <>
    <div className="scene-tools">
      <button className={`tgl${cut ? ' on' : ''}`} aria-pressed={cut} onClick={() => set({ cut: !cut })}>{cut ? 'Cut open' : 'Whole brain'}</button>
      {cut ? <MiniSelect label="Level" value={String(slice)} options={[['-0.45', 'Brainstem'], ['-0.15', 'Basal ganglia'], ['0.05', 'Ventricles'], ['0.3', 'Above ventricles']]} onChange={(v) => set({ slice: +v })} />
        : <button className={`tgl${glass ? ' on' : ''}`} onClick={() => set({ glass: !glass })}>{glass ? 'Glass brain' : 'Solid brain'}</button>}
      {(cut || glass) && <button className={`tgl${deep ? ' on' : ''}`} aria-pressed={deep} onClick={() => set({ deep: !deep })}>{deep ? 'Deep structures' : 'Surface only'}</button>}
    </div>
    <div className="alv-focus">
      <MiniSelect label="View" value={target} options={FOCUS as [string, string][]} onChange={(v) => set({ target: v })} className="ch-focus" />
    </div>
    <div className="legend"><span><i style={{ background: '#c81e2a' }} />Perfused</span><span><i style={{ background: '#3a2a3e' }} />No flow</span><span><i style={{ background: '#ed9e2e' }} />Penumbra</span><span><i style={{ background: '#c71f52' }} />Core</span><span><i style={{ background: '#4b0c12' }} />Clot / blood</span>{deep && (glass || cut) && <><span><i style={{ background: '#5d9fdc' }} />CSF (ventricles)</span><span><i style={{ background: '#a07a94' }} />Basal ganglia</span><span><i style={{ background: '#9483a8' }} />Thalamus</span></>}</div>
  </>}
  </>);
}

function PresetCard() {
  const preset = useNeuroUI((s) => s.preset); const cur = NEURO_PRESETS.find((p) => p.id === preset)!;
  const G: [string, NeuroPreset[]][] = [['', ['none']], ['Ischaemic', ['m1_L', 'm1_R', 'm2s_L', 'ica_L', 'ica_L_iso', 'basilar', 'p2_R']], ['Haemorrhagic', ['ich', 'sah']]];
  const it = (id: NeuroPreset) => { const p = NEURO_PRESETS.find((x) => x.id === id)!; return { id, name: p.name, hint: p.short }; };
  return <Picker label="Scenario" value={preset} sub={cur.short} onPick={(id) => loadNeuroPreset(id as NeuroPreset)} groups={G.map(([label, ids]) => ({ label: label || undefined, items: ids.filter((i) => NEURO_PRESETS.some((p) => p.id === i)).map(it) }))} />;
}

function TissueCard() {
  const st = useNeuroUI((s) => s.state); const sys = useNeuroUI((s) => s.sys);
  const s = neuroSummary(st, sys); const affected = TERRITORIES.filter((t) => s.territories[t].coreMl + s.territories[t].penumbraMl > 0.5);
  const eh = effectiveHemorrhage(st, sys); const h = eh ? hemorrhageShape(eh) : null;
  if (!affected.length && !h) return null;
  // time machine: the same patient's final core for different reperfusion times (pure — nothing is changed)
  const occl = Object.keys(st.occlusion).length > 0 && st.recanalizedAt == null;
  const finalCore = (at: number | null) => neuroSummary({ ...st, minutes: 1440, recanalizedAt: at }, sys).coreMl;
  const whatIf: [string, number][] | null = occl ? [['now', finalCore(st.minutes)], ['in 1 h', finalCore(st.minutes + 60)], ['in 3 h', finalCore(st.minutes + 180)], ['never', finalCore(null)]] : null;
  const fx = (v: number) => (v >= 10 ? Math.round(v) : v.toFixed(1));
  return (
    <section className="card nums">
      {affected.length > 0 && <div className="numgrid">
        <div className="num"><span className="nl">Core</span><span className="nv">{fx(s.coreMl)}</span><span className="nu">mL</span></div>
        <div className="num"><span className="nl">Penumbra</span><span className="nv">{fx(s.penumbraMl)}</span><span className="nu">mL</span></div>
        <div className="num"><span className="nl">Mismatch</span><span className="nv">{Number.isFinite(s.mismatch) ? s.mismatch.toFixed(1) : '∞'}</span><span className="nu">ratio</span></div>
        <div className="num"><span className="nl">Worst CBF</span><span className="nv">{Math.round(Math.min(...affected.map((t) => s.territories[t].cbfDeep)))}</span><span className="nu">mL/100 g/min</span></div>
      </div>}
      {whatIf && <div className="whatif"><div className="eyebrow">Final core if the artery is reopened…</div><div className="numgrid">{whatIf.map(([l, v]) => <div key={l} className="num"><span className="nl">{l}</span><span className="nv">{fx(v)}</span><span className="nu">mL</span></div>)}</div></div>}
      {affected.map((t) => <p key={t} className="muted small">{TERRITORY_NAME[t]}: deep CBF {Math.round(s.territories[t].cbfDeep)}, border {Math.round(s.territories[t].cbfBorder)} — core {fx(s.territories[t].coreMl)} mL, penumbra {fx(s.territories[t].penumbraMl)} mL</p>)}
      {h && st.hemorrhage && <div className="numgrid">
        <div className="num"><span className="nl">{st.hemorrhage.kind === 'ich' ? 'ICH volume' : 'SAH blood'}</span><span className="nv">{Math.round(eh!.volumeMl)}</span><span className="nu">mL{st.hemorrhage.kind === 'ich' ? ` · SBP ≈ ${Math.round(sbpOf(sys))}` : ''}</span></div>
        <div className="num"><span className="nl">Radius</span><span className="nv">{h.rCm.toFixed(1)}</span><span className="nu">cm</span></div>
        {st.hemorrhage.kind === 'ich' && <div className="num"><span className="nl">Midline shift</span><span className="nv">{h.shiftMm.toFixed(0)}</span><span className="nu">mm (est.)</span></div>}
      </div>}
    </section>
  );
}

function SystemicCard() {
  const sys = useNeuroUI((s) => s.sys); const set = useNeuroUI.getState().set;
  return (
    <section className="card">
      <div className="card-h"><h3>Patient</h3><span className="muted small">drives collateral flow</span></div>
      <Knob label="MAP" value={sys.map} min={40} max={160} step={5} unit=" mmHg" onChange={(v) => set({ sys: { ...sys, map: v } })} hint="Collateral flow into ischaemic tissue is pressure-passive" />
      <Knob label="PaCO₂" value={sys.paco2} min={20} max={70} step={1} unit=" mmHg" onChange={(v) => set({ sys: { ...sys, paco2: v } })} hint="CBF changes ≈3% per mmHg" />
    </section>
  );
}

function NeuroExplain() {
  const preset = useNeuroUI((s) => s.preset);
  const txt: Partial<Record<NeuroPreset, string>> = {
    none: 'Four arteries feed the brain: two internal carotids and two vertebrals (joining as the basilar). The Circle of Willis links them at the base, so one blocked feeder can often be bypassed.',
    m1_L: 'The deep MCA territory (lenticulostriate end-arteries) dies first. The cortex survives longer on leptomeningeal collaterals from the ACA and PCA — that is the penumbra, and it shrinks with time and with low blood pressure.',
    m2s_L: 'A division occlusion starves only its half of the MCA; the other division and the ACA feed the border.',
    ica_L: 'With an intact ACoA and PCoA the circle refills the left MCA and ACA — the patient may have no deficit at all.',
    ica_L_iso: 'Without communicating arteries the left hemisphere depends on leptomeningeal collaterals alone.',
    basilar: 'The posterior communicating arteries can back-fill the top of the basilar and the PCAs; the brainstem below the clot has little else.',
    ich: 'Intraparenchymal haemorrhage: volume (ABC/2) and location drive outcome; mass effect grows steeply beyond ~30 mL.',
    sah: 'Aneurysmal SAH: blood fills the basal cisterns around the circle and tracks up the Sylvian fissures.',
  };
  return <section className="card"><div className="card-h"><h3>Why</h3></div><p className="muted">{txt[preset] ?? 'Posterior circulation stroke: occipital cortex loses its supply; the MCA may partly cover the border.'}</p></section>;
}

function NeuroLearn() {
  const tl = useDirector((s) => s.tl); const active = tl && NEURO_LESSONS.some((l) => l.id === tl.id);
  useEffect(() => () => { if (NEURO_LESSONS.some((l) => l.id === useDirector.getState().tl?.id)) director.unload(); }, []);
  if (active) return <div className="chal-run"><DirectorPlayer onExit={() => undefined} />{tl!.id === ICP_LESSON.id ? <IcpCard /> : <><NeuroExamCard /><TissueCard /></>}</div>;
  return (
    <div className="chal-list">
      <section className="card"><div className="eyebrow">Guided learning</div><h2 className="h2">Narrated lessons on the live brain</h2><p className="muted">Each lesson is a timeline: scrub it, pause it, or jump between steps — the brain is rebuilt exactly for that moment.</p></section>
      {NEURO_LESSONS.map((l) => <button key={l.id} className="chal-item" onClick={() => director.load(l, true)}><span className={`lvl lvl-${l.level}`}>{l.level}</span><span className="ci-t">{l.title}<small className="ci-b">{l.blurb}</small></span><span className="ci-k">{l.cues.length} steps</span></button>)}
    </div>
  );
}

function TissueFold() {
  const occ = useNeuroUI((s) => Object.keys(s.state.occlusion).length > 0 || s.state.hemorrhage?.kind === 'ich');
  return occ ? <Fold group="neuro" id="tissue" title="Territories & what-if" summary="final core if reopened now / later"><TissueCard /></Fold> : null;
}

/** scene pane: the real CT for this moment, large */
function RealCtView() {
  const st = useNeuroUI((s) => s.state); const sah = st.hemorrhage?.kind === 'sah'; const course = courseOf(st);
  const ct = useStageCT(sah ? 'ich' : course === 'none' ? 'ischemic' : course, st.minutes, sah); const it = ct.now[0] ?? ct.all[0];
  if (!it) return <div className="loading">Loading real images…</div>;
  return (
    <div className="realct">
      <img src={`imaging/real/${it.file}`} alt={it.caption} />
      <div className="realct-cap"><span className="eyebrow">{course === 'none' && !sah ? 'Real CT · choose a stroke scenario' : `Real CT · ${fmtTime(st.minutes)} · ${it.stage?.label ?? ''}`}</span><b>{it.title}</b><span>{it.caption}</span><small>{it.credit} · different real patients illustrate different stages · teaching use only</small></div>
    </div>
  );
}

function IcpIfMass() { const h = useNeuroUI((s) => !!s.state.hemorrhage); return h ? <Fold group="neuro" id="icp" title="Intracranial pressure" summary="ICP, CPP, EVD"><IcpCard /></Fold> : null; }
