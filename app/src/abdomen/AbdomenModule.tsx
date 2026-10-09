import { useExploreMemory } from '../app/exploreMemory';
/** Abdomen module: trauma / vascular / surgical abdomen on the shared body, driven by one pure state. */
import { MiniSelect, Picker, Fold } from '../scene/pane';
import { CtaScene } from './CtaScene';
import { CaseChallenge } from '../challenge/CaseChallenge';
import { useHideFindings } from '../challenge/caseStore';
import { useEffect, useMemo, useState } from 'react';
import { loadBodyAsset, type BodyAsset } from '../asset/body';
import { Knob } from '../vent/VentPanel';
import { director, useDirector } from '../director/director';
import { DirectorPlayer } from '../director/Player';
import { ABDOMEN_LESSONS as BASE_LESSONS } from '../director/lessons/abdomen';
import { DISSECTION_LESSON } from '../director/lessons/dissection';
import { ImpulseCard } from './ImpulseCard';
const ABDOMEN_LESSONS = [...BASE_LESSONS, DISSECTION_LESSON, ...ABDOMEN_LESSONS_2];
import { ABDOMEN_LESSONS_2 } from '../director/lessons/abdomen2';
import { useUI } from '../app/store';
import { AbdomenScene } from './AbdomenScene';
import { UltrasoundScene } from './UltrasoundScene';
import { useAbdUI, loadAbdPreset, currentAbdomen, ABD_PRESETS, type AbdPreset, type AbdView } from './abdomenStore';
import { fastExam, shockClass, abdomenFindings, type AbdomenState } from './state';
import { SceneWrap } from '../scene/labels';

const FOCUS: [string, string][] = [['abdomen.whole', 'Whole'], ['abdomen.ruq', 'RUQ'], ['abdomen.luq', 'LUQ'], ['abdomen.pelvis', 'Pelvis'], ['abdomen.aorta', 'Aorta'], ['abdomen.retroperitoneum', 'Retroperitoneum'], ['abdomen.pancreas', 'Pancreas'], ['abdomen.bowel', 'Bowel'], ['abdomen.diaphragm', 'Diaphragm']];
const useAbdomen = () => { const base = useAbdUI((s) => s.base); const minutes = useAbdUI((s) => s.minutes); return useMemo(() => currentAbdomen({ base, minutes }), [base, minutes]); };
const setBase = (p: Partial<AbdomenState>) => { const s = useAbdUI.getState(); s.set({ base: { ...s.base, ...p } }); };

export function AbdomenModule() {
  const [body, setBody] = useState<BodyAsset | null>(null); const [err, setErr] = useState<string | null>(null);
  useEffect(() => { loadBodyAsset().then(setBody).catch((e) => { console.error(e); setErr(String(e?.message || e)); }); }, []);
  useEffect(() => { (window as unknown as { __CCAbd: unknown }).__CCAbd = { store: useAbdUI, load: loadAbdPreset, minutes: (m: number) => useAbdUI.getState().set({ minutes: m }), focus: (id: string) => useAbdUI.getState().set({ target: id }), state: () => currentAbdomen(), view: (v: AbdView) => useAbdUI.getState().set({ view: v }) }; }, []);
  const view = useAbdUI((s) => s.view); const mode = useUI((s) => s.mode);
  useExploreMemory('abd', () => { const s = useAbdUI.getState(); return { preset: s.preset, base: structuredClone(s.base), minutes: s.minutes, target: s.target, view: s.view }; }, (m) => useAbdUI.getState().set(m));
  const dTarget = useDirector((s) => s.target);
  useEffect(() => { if (dTarget?.startsWith('abdomen.')) useAbdUI.getState().set({ target: dTarget }); }, [dTarget]);
  return (
    <main className="stage">
      <section className="scene-pane">
        <SceneWrap>{view === 'us' ? <UltrasoundScene /> : view === 'cta' ? <CtaScene /> : body ? <AbdomenScene body={body} /> : <div className="loading">{err ? `Could not load anatomy: ${err}` : 'Loading anatomy…'}</div>}<AbdOverlay /></SceneWrap>
      </section>
      <aside id="controls" tabIndex={-1} className="side-pane" aria-label="Controls and readings"><h2 className="sr-only">Controls and readings</h2>
        {mode === 'challenge' ? <CaseChallenge module="abdomen" /> : mode === 'learn' ? <AbdLearn /> : <><PresetCard /><TimeCard /><Fold group="abd" id="find" title="Findings" defaultOpen><FindingsCard /></Fold><Fold group="abd" id="shock" title="Haemodynamics" summary="bleeding, shock class"><ShockCard /></Fold><Fold group="abd" id="fast" title="FAST" summary="where to look for fluid"><FastCard /></Fold></>}
        <details className="credit"><summary>Sources & model notes</summary>Solid organs: HuBMAP 3D reference organs (CC BY 4.0) via the shared body model. Stomach, bowel, diaphragm, peritoneal fluid and pathology are drawn procedurally. Bleeding rates, FAST thresholds and the haemorrhage-class table are teaching approximations, not clinical rules.</details>
      </aside>
    </main>
  );
}

function AbdOverlay() {
  const target = useAbdUI((s) => s.target); const view = useAbdUI((s) => s.view); const set = useAbdUI.getState().set; const st = useAbdomen(); const sc = shockClass(st); const hide = useHideFindings();
  return (<>
    <div className="view-btns">{([['3d', '3D anatomy'], ['us', 'Ultrasound · FAST'], ['cta', 'CT angiogram']] as [AbdView, string][]).map(([k, l]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => set({ view: k })}>{l}</button>)}</div>
    {view !== '3d' ? null : <>
    {!hide && <div className="alv-hud">
      <div className="alv-row"><span>Time</span><b>{Math.round(st.minutes)} min</b></div>
      <div className="alv-row"><span>Free fluid</span><b>{Math.round(st.freeFluidMl)} mL</b></div>
      {st.retroMl > 0 && <div className="alv-row"><span>Retroperitoneal</span><b>{Math.round(st.retroMl)} mL</b></div>}
      <div className="alv-row"><span>Haemorrhage class</span><b>{['I', 'II', 'III', 'IV'][sc.cls - 1]}</b></div>
    </div>}
    <div className="alv-focus"><MiniSelect label="View" value={target} options={FOCUS as [string, string][]} onChange={(v) => set({ target: v })} className="ch-focus" /></div>
    <div className="legend"><span><i style={{ background: '#b0101f' }} />Blood</span><span><i style={{ background: '#8a7a3a' }} />Enteric</span><span><i style={{ background: '#d9c77a' }} />Ascites</span><span><i style={{ background: '#dff4ff' }} />Free air</span></div>
  </>}</>);
}

function PresetCard() {
  const preset = useAbdUI((s) => s.preset); const p = ABD_PRESETS.find((x) => x.id === preset)!;
  const G: [string, string[]][] = [['Trauma', ['normal', 'spleen4', 'liver3']], ['Aorta', ['aaa6', 'aaaContained', 'aaaFree', 'dissectB', 'dissectA']], ['Acute abdomen', ['perforation', 'sbo', 'mesenteric', 'pancreatitis']]];
  const it = (id: string) => { const x = ABD_PRESETS.find((y) => y.id === id); return x ? { id, name: x.name, hint: x.short } : null; };
  const placed = new Set(G.flatMap(([, i]) => i)); const extra = ABD_PRESETS.filter((x) => !placed.has(x.id));
  return <Picker label="Scenario" value={preset} onPick={(id) => loadAbdPreset(id as AbdPreset)} sub={p.short}
    groups={[...G.map(([label, ids]) => ({ label, items: ids.map(it).filter((x): x is NonNullable<typeof x> => !!x) })), ...(extra.length ? [{ label: 'More', items: extra.map((x) => ({ id: x.id, name: x.name, hint: x.short })) }] : [])]} />;
}
function TimeCard() {
  const minutes = useAbdUI((s) => s.minutes); const base = useAbdUI((s) => s.base);
  return (
    <section className="card">
      <div className="card-h"><h3>Time & severity</h3></div>
      <Knob label="Time since event" value={minutes} min={0} max={240} step={5} unit=" min" onChange={(v) => useAbdUI.getState().set({ minutes: v })} hint="Untreated bleeding accumulates; ischaemia progresses" />
      {base.injury.spleen != null && <Knob label="Splenic injury grade" value={base.injury.spleen} min={0} max={5} step={1} onChange={(v) => setBase({ injury: { ...base.injury, spleen: v } })} />}
      {base.injury.liver != null && <Knob label="Liver injury grade" value={base.injury.liver} min={0} max={5} step={1} onChange={(v) => setBase({ injury: { ...base.injury, liver: v } })} />}
      {base.aaa.diameterCm > 3 && <Knob label="Aneurysm diameter" value={base.aaa.diameterCm} min={3} max={10} step={0.5} unit=" cm" onChange={(v) => setBase({ aaa: { ...base.aaa, diameterCm: v } })} hint="Normal infrarenal aorta ≈ 2 cm; rupture risk climbs steeply above 5.5 cm" />}
    </section>
  );
}
export function FastCard() {
  const st = useAbdomen(); const w = fastExam(st); const any = w.some((x) => x.positive);
  return (
    <section className="card">
      <div className="card-h"><h3>FAST</h3><span className={`badge ${any ? "bad" : "ok"}`}>{any ? "Positive" : "Negative"}</span></div>
      <ul className="fast-list">{w.map((x) => <li key={x.id} className={x.positive ? 'pos' : ''}><span className="fw-dot" aria-hidden />{x.name}<small> — {x.positive ? `fluid (≈ ${Math.round(x.ml)} mL)` : 'no fluid seen'}</small><br /><small className="muted">{x.note}</small></li>)}</ul>
      {st.retroMl > 200 && <p className="muted small">FAST looks only for intraperitoneal fluid — this {Math.round(st.retroMl)} mL retroperitoneal bleed is invisible to it.</p>}
    </section>
  );
}
export function ShockCard() {
  const st = useAbdomen(); const s = shockClass(st);
  return (
    <section className="card nums">
      <div className="card-h"><h3>Haemorrhage class {['I', 'II', 'III', 'IV'][s.cls - 1]}</h3></div>
      <div className="numgrid">
        <div className="num"><span className="nl">Loss</span><span className="nv">{Math.round(s.lossMl)}</span><span className="nu">mL ({Math.round(s.lossPct)}%)</span></div>
        <div className="num"><span className="nl">HR</span><span className="nv">{s.hr}</span><span className="nu">/min</span></div>
        <div className="num"><span className="nl">SBP</span><span className="nv">{s.sbp}</span><span className="nu">mmHg</span></div>
        <div className="num"><span className="nl">RR</span><span className="nv">{s.rr}</span><span className="nu">/min</span></div>
        <div className="num"><span className="nl">Urine</span><span className="nv">{s.urine}</span><span className="nu">mL/h</span></div>
        <div className="num"><span className="nl">Mental</span><span className="nv small">{s.mental}</span><span className="nu" /></div>
      </div>
      <p className="muted small" style={{ marginTop: 8 }}>Classic teaching table for a 70 kg adult. Beta-blockers, pacemakers, age, pregnancy and athletes blunt or hide these signs; blood pressure falls late.</p>
    </section>
  );
}
function FindingsCard() {
  const st = useAbdomen(); const f = abdomenFindings(st);
  return <section className="card"><div className="card-h"><h3>Findings</h3></div>{f.length ? <ul className="ln-log">{f.map((x) => <li key={x}>{x}</li>)}</ul> : <p className="muted">Normal abdomen.</p>}</section>;
}

function AbdLearn() {
  const tl = useDirector((s) => s.tl); const active = tl && ABDOMEN_LESSONS.some((l) => l.id === tl.id);
  useEffect(() => () => { if (ABDOMEN_LESSONS.some((l) => l.id === useDirector.getState().tl?.id)) director.unload(); }, []);
  if (active) return <div className="chal-run"><DirectorPlayer onExit={() => undefined} />{tl!.id === DISSECTION_LESSON.id ? <><ImpulseCard /><FindingsCard /></> : ['abd-mesenteric', 'abd-obstruction'].includes(tl!.id) ? <FindingsCard /> : <><FastCard /><ShockCard /><FindingsCard /></>}</div>;
  return (
    <div className="chal-list">
      <section className="card"><div className="eyebrow">Guided learning</div><h2 className="h2">The abdomen as a source of shock</h2><p className="muted">Narrated lessons that move one abdominal state through time while the anatomy, the ultrasound windows and the haemorrhage estimate respond.</p></section>
      {ABDOMEN_LESSONS.map((l) => <button key={l.id} className="chal-item" onClick={() => director.load(l, true)}><span className={`lvl lvl-${l.level}`}>{l.level}</span><span className="ci-t">{l.title}<small className="ci-b">{l.blurb}</small></span><span className="ci-k">{l.cues.length} steps</span></button>)}
    </div>
  );
}
