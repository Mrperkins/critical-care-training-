/** Abdomen module: trauma / vascular / surgical abdomen on the shared body, driven by one pure state. */
import { useEffect, useMemo, useState } from 'react';
import { loadBodyAsset, type BodyAsset } from '../asset/body';
import { Knob } from '../vent/VentPanel';
import { useDirector } from '../director/director';
import { AbdomenScene } from './AbdomenScene';
import { useAbdUI, loadAbdPreset, currentAbdomen, ABD_PRESETS, type AbdPreset } from './abdomenStore';
import { fastExam, shockClass, abdomenFindings, type AbdomenState } from './state';

const FOCUS: [string, string][] = [['abdomen.whole', 'Whole'], ['abdomen.ruq', 'RUQ'], ['abdomen.luq', 'LUQ'], ['abdomen.pelvis', 'Pelvis'], ['abdomen.aorta', 'Aorta'], ['abdomen.retroperitoneum', 'Retroperitoneum'], ['abdomen.pancreas', 'Pancreas'], ['abdomen.bowel', 'Bowel'], ['abdomen.diaphragm', 'Diaphragm']];
const useAbdomen = () => { const base = useAbdUI((s) => s.base); const minutes = useAbdUI((s) => s.minutes); return useMemo(() => currentAbdomen({ base, minutes }), [base, minutes]); };
const setBase = (p: Partial<AbdomenState>) => { const s = useAbdUI.getState(); s.set({ base: { ...s.base, ...p } }); };

export function AbdomenModule() {
  const [body, setBody] = useState<BodyAsset | null>(null); const [err, setErr] = useState<string | null>(null);
  useEffect(() => { loadBodyAsset().then(setBody).catch((e) => { console.error(e); setErr(String(e?.message || e)); }); }, []);
  useEffect(() => { (window as unknown as { __CCAbd: unknown }).__CCAbd = { store: useAbdUI, load: loadAbdPreset, minutes: (m: number) => useAbdUI.getState().set({ minutes: m }), focus: (id: string) => useAbdUI.getState().set({ target: id }), state: () => currentAbdomen() }; }, []);
  const dTarget = useDirector((s) => s.target);
  useEffect(() => { if (dTarget?.startsWith('abdomen.')) useAbdUI.getState().set({ target: dTarget }); }, [dTarget]);
  return (
    <main className="stage">
      <section className="scene-pane">
        <div className="scene-wrap">{body ? <AbdomenScene body={body} /> : <div className="loading">{err ? `Could not load anatomy: ${err}` : 'Loading anatomy…'}</div>}<AbdOverlay /></div>
      </section>
      <aside className="side-pane">
        <PresetCard /><TimeCard /><FastCard /><ShockCard /><FindingsCard />
        <p className="credit">Solid organs: HuBMAP 3D reference organs (CC BY 4.0) via the shared body model. Stomach, bowel, diaphragm, peritoneal fluid and pathology are drawn procedurally. Bleeding rates, FAST thresholds and the haemorrhage-class table are teaching approximations, not clinical rules.</p>
      </aside>
    </main>
  );
}

function AbdOverlay() {
  const target = useAbdUI((s) => s.target); const labels = useAbdUI((s) => s.labels); const set = useAbdUI.getState().set; const st = useAbdomen(); const sc = shockClass(st);
  return (<>
    <div className="scene-tools"><button className={`tgl${labels ? ' on' : ''}`} onClick={() => set({ labels: !labels })}>Labels</button></div>
    <div className="alv-hud">
      <div className="alv-row"><span>Time</span><b>{Math.round(st.minutes)} min</b></div>
      <div className="alv-row"><span>Free fluid</span><b>{Math.round(st.freeFluidMl)} mL</b></div>
      {st.retroMl > 0 && <div className="alv-row"><span>Retroperitoneal</span><b>{Math.round(st.retroMl)} mL</b></div>}
      <div className="alv-row"><span>Haemorrhage class</span><b>{['I', 'II', 'III', 'IV'][sc.cls - 1]}</b></div>
    </div>
    <div className="alv-focus"><div className="seg small ch-focus" role="group" aria-label="Focus">{FOCUS.map(([id, l]) => <button key={id} className={target === id ? 'on' : ''} onClick={() => set({ target: id })}>{l}</button>)}</div></div>
    <div className="legend"><span><i style={{ background: '#6e0d14' }} />Blood</span><span><i style={{ background: '#8a7a3a' }} />Enteric</span><span><i style={{ background: '#d9c77a' }} />Ascites</span><span><i style={{ background: '#dff4ff' }} />Free air</span></div>
  </>);
}

function PresetCard() {
  const preset = useAbdUI((s) => s.preset); const p = ABD_PRESETS.find((x) => x.id === preset)!;
  return <section className="card story"><div className="chips" role="list">{ABD_PRESETS.map((x) => <button key={x.id} role="listitem" className={`chip${preset === x.id ? ' on' : ''}`} onClick={() => loadAbdPreset(x.id as AbdPreset)}>{x.name}</button>)}</div><p className="muted small" style={{ marginTop: 8 }}>{p.short}</p></section>;
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
