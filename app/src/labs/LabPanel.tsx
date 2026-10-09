import { Picker, Fold } from '../scene/pane';
import { useEffect, useRef } from 'react';
import { bench } from './bench';
import { useLabUI } from './labStore';
import { useUI } from '../app/store';
import { LABS, LAB, LAB_GROUPS, flagOf, type Lab } from '../knowledge/labs';
import { cellSpec } from './cellSpec';
import { ecgShape, ecgAt } from '../physiology/ecg';
import { restingPotential, thresholdPotential, drugEffect, type DrugId } from '../physiology/patient';
import { Seg } from '../vent/VentPanel';
import { sceneOf } from './cell/model';

const bump = () => useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
export const fmt = (l: Lab, v: number) => (l.step < 0.1 ? v.toFixed(2) : l.step < 1 ? v.toFixed(1) : Math.round(v).toString());

export function LabList() {
  useUI((s) => s.pulse); const sel = useLabUI((s) => s.lab);
  const abnormal = LABS.filter((l) => flagOf(l, bench.value(l.id)) !== 'normal');
  return <Picker label="Lab" value={sel} onPick={(id) => useLabUI.getState().set({ lab: id })}
    sub={abnormal.length ? <>Abnormal now: {abnormal.slice(0, 6).map((l) => `${l.abbr} ${fmt(l, bench.value(l.id))}`).join(' · ')}{abnormal.length > 6 ? ' …' : ''}</> : 'All values in the normal range'}
    groups={LAB_GROUPS.map((g) => ({ label: g, items: LABS.filter((l) => l.group === g).map((l) => { const v = bench.value(l.id); const f = flagOf(l, v); return { id: l.id, name: `${l.name} (${l.abbr})`, right: fmt(l, v), tone: f === 'normal' ? undefined : 'bad' as const }; }) }))} />;
}

export function LabCard() {
  useUI((s) => s.pulse); const id = useLabUI((s) => s.lab); const l = LAB[id]; const v = bench.value(id); const f = flagOf(l, v);
  const spec = cellSpec(id, bench.snap, bench.pt);
  return (
    <section className="card labcard">
      <div className="card-h"><div><div className="eyebrow">{l.group}</div><h2 className="h2">{l.name} <span className="muted">({l.abbr})</span></h2></div><span className={`pill ${f === 'normal' ? 'ok' : 'bad'}`}>{f.replace('-', ' ')}</span></div>
      <div className="labslider">
        <div className="ls-top"><b className={`lv f-${f}`}>{fmt(l, v)}</b><span className="muted">{l.unit}</span><span className="muted small">normal {l.normal[0]}–{l.normal[1]}</span></div>
        <input type="range" min={l.range[0]} max={l.range[1]} step={l.step} value={v} aria-label={l.name} onChange={(e) => { bench.set(id, +e.target.value); bump(); }} />
        <div className="ls-band" aria-hidden="true"><span style={{ left: `${((l.normal[0] - l.range[0]) / (l.range[1] - l.range[0])) * 100}%`, width: `${((l.normal[1] - l.normal[0]) / (l.range[1] - l.range[0])) * 100}%` }} /><i style={{ left: `${((v - l.range[0]) / (l.range[1] - l.range[0])) * 100}%` }} /></div>
        <div className="actions"><button className="act" onClick={() => { bench.set(id, l.normal[0] - (l.normal[1] - l.normal[0]) * 0.8 - l.step); bump(); }}>Make it low</button><button className="act" onClick={() => { bench.set(id, (l.normal[0] + l.normal[1]) / 2); bump(); }}>Normal</button><button className="act" onClick={() => { bench.set(id, l.normal[1] + (l.normal[1] - l.normal[0]) * 1.2 + l.step); bump(); }}>Make it high</button>
          <button className={`act${useLabUI.getState().view === 'cell' ? ' primary' : ''}`} onClick={() => useLabUI.getState().set({ view: useLabUI.getState().view === 'cell' ? 'body' : 'cell' })}>{useLabUI.getState().view === 'cell' ? '← Back to the body' : 'Zoom into the cells →'}</button></div>
      </div>
      <Fold group="labcard" id="about" title="About this lab" summary="causes of high and low, bedside">
      <dl className="chain">
        <dt>What it is</dt><dd>{l.what}</dd>
        <dt>Where it comes from</dt><dd>{l.source}</dd>
        <dt>What it does</dt><dd>{l.does}</dd>
        <dt className={f.includes('high') ? 'hot' : ''}>High · {l.high.label}</dt><dd className={f.includes('high') ? 'hot' : ''}><ul>{l.high.causes.map((c) => <li key={c}>{c}</li>)}</ul>{l.high.effects}</dd>
        <dt className={f.includes('low') ? 'hot' : ''}>Low · {l.low.label}</dt><dd className={f.includes('low') ? 'hot' : ''}><ul>{l.low.causes.map((c) => <li key={c}>{c}</li>)}</ul>{l.low.effects}</dd>
        <dt>At the bedside</dt><dd>{l.bedside}</dd>
      </dl>
      </Fold>
      {sceneOf(id) ? <p className="muted small">In the cell view: a cell sliced open with all its organelles — switch between a heart muscle cell, a nerve cell and a textbook cell, or zoom into the membrane to watch individual ions cross.</p> : <p className="muted small">In the cell view: {spec.caption} {spec.species.length > 0 && <>Dots: {spec.species.map((s) => <span key={s.key} className="sp"><i style={{ background: s.color }} />{s.label}</span>)}</>}</p>}
    </section>
  );
}

/* ------------------------------------------------------------------ consequence panels */
export const hasConsequences = (id: string) => ['k', 'ca', 'mg', 'na', 'hb', 'hct', 'rbc', 'lac', 'cr', 'egfr', 'bun', 'ag', 'hco3', 'cl', 'ket', 'glu'].includes(id);
export function Consequences() {
  useUI((s) => s.pulse); const id = useLabUI((s) => s.lab);
  if (['k', 'ca', 'mg'].includes(id)) return <><EcgStrip /><Membrane /><KTreat /></>;
  if (id === 'na') return <SodiumPanel />;
  if (['hb', 'hct', 'rbc'].includes(id)) return <OxygenPanel />;
  if (id === 'lac') return <LactatePanel />;
  if (['cr', 'egfr', 'bun'].includes(id)) return <RenalPanel />;
  if (['ag', 'hco3', 'cl', 'ket', 'glu'].includes(id)) return <GapPanel />;
  return null;
}

export function EcgStrip() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!; let raf = 0, w = 0, h = 0; const t0 = performance.now();
    const ro = new ResizeObserver(() => { const r = c.getBoundingClientRect(); const d = Math.min(2, devicePixelRatio || 1); w = r.width; h = r.height; c.width = w * d; c.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); }); ro.observe(c);
    const draw = () => {
      raf = requestAnimationFrame(draw); if (!w) return; const s = bench.snap; const p = bench.pt.p;
      const sh = ecgShape({ kEff: s.kEffective, k: s.k, ca: p.ca, mg: p.mg, hr: 72 }); const per = 60 / sh.hr;
      ctx.fillStyle = '#f7f1e8'; ctx.fillRect(0, 0, w, h);
      const pxs = w / 5; // 5 s window, 25 mm/s paper
      ctx.strokeStyle = 'rgba(214,84,63,0.18)'; ctx.lineWidth = 1; for (let x = 0; x < w; x += pxs / 25) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); } for (let y = 0; y < h; y += pxs / 25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(214,84,63,0.4)'; for (let x = 0; x < w; x += pxs / 5) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); } for (let y = 0; y < h; y += pxs / 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      const now = (performance.now() - t0) / 1000; const mv = pxs / 5 * 2; // 10 mm/mV
      ctx.strokeStyle = '#1b1b1f'; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let x = 0; x <= w; x += 1) { const tt = now - (w - x) / pxs; const ph = ((tt % per) + per) % per; const y = h * 0.62 - ecgAt(ph, sh) * mv; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke(); ctx.fillStyle = '#1b1b1f'; ctx.font = '600 11px "Atkinson Hyperlegible Mono", monospace'; ctx.fillText('II', 8, 16); ctx.font = '500 11px "Atkinson Hyperlegible Mono", monospace'; ctx.fillText(sh.label, 30, 16);
    };
    raf = requestAnimationFrame(draw); return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <section className="card"><div className="card-h"><h3>ECG · lead II</h3><span className="muted small">drawn from the membrane state, 25 mm/s</span></div><canvas ref={ref} className="ecg" aria-label="ECG lead II" /></section>;
}

export function Membrane() {
  useUI((s) => s.pulse); const s = bench.snap; const p = bench.pt.p; const ca = drugEffect(bench.pt, 'calcium');
  const rmp = restingPotential(s.k), thr = thresholdPotential(p.ca, ca), rmpN = restingPotential(4.2), thrN = thresholdPotential(1.2);
  const Y = (mv: number) => `${((-40 - mv) / 60) * 100}%`;
  return (
    <section className="card">
      <div className="card-h"><h3>Membrane: resting potential vs threshold</h3><span className="muted small">gap {s.gap.toFixed(0)} mV (normal {(thrN - rmpN).toFixed(0)})</span></div>
      <div className="mem">
        <div className="mem-scale">{[-40, -50, -60, -70, -80, -90, -100].map((m) => <span key={m} style={{ top: Y(m) }}>{m}</span>)}</div>
        <div className="mem-col"><i className="thr" style={{ top: Y(thr) }}><b>threshold {thr.toFixed(0)}</b></i><i className="rmp" style={{ top: Y(rmp) }}><b>resting {rmp.toFixed(0)}</b></i><span className="gapbar" style={{ top: Y(thr), height: `calc(${Y(rmp)} - ${Y(thr)})` }} /></div>
        <p className="mem-t">High K⁺ raises the resting potential toward threshold; cells become easy to fire and then inexcitable. Calcium raises the threshold and restores the gap{ca > 0.05 ? ` — calcium is acting now (${Math.round(ca * 100)} %)` : ''}. Effective K⁺ for the heart: <b>{s.kEffective.toFixed(1)}</b> (measured {s.k.toFixed(1)}).</p>
      </div>
    </section>
  );
}

const K_STEPS: [DrugId, string, string][] = [['calcium', '1 · Stabilise', 'Calcium gluconate 3 g / chloride 1 g'], ['insulin', '2 · Shift', 'Insulin 10 U + dextrose'], ['albuterol', '2 · Shift', 'Nebulised salbutamol'], ['binder', '3 · Remove', 'K⁺ binder'], ['dialysis', '3 · Remove', 'Haemodialysis']];
export function KTreat() {
  useUI((s) => s.pulse); const id = useLabUI((s) => s.lab); if (id !== 'k') return null;
  const t = bench.pt.t;
  return (
    <section className="card">
      <div className="card-h"><h3>Treat it — and watch the clock</h3><span className="clock">{Math.floor(t / 60)} h {Math.round(t % 60)} min</span></div>
      <div className="actions">{K_STEPS.map(([d, s, l]) => <button key={d} className="act" onClick={() => { bench.give(d); bump(); }}><small className="muted">{s}</small> {l}</button>)}</div>
      <div className="actions" style={{ marginTop: 8 }}><button className="act" onClick={() => { bench.fastForward(15); bump(); }}>+15 min</button><button className="act" onClick={() => { bench.fastForward(60); bump(); }}>+1 h</button><button className="act" onClick={() => { bench.fastForward(240); bump(); }}>+4 h</button><button className="act" onClick={() => { bench.pt.p.renal = bench.pt.p.renal > 0.5 ? 0.1 : 1; bump(); }}>Kidneys: {bench.pt.p.renal > 0.5 ? 'working' : 'failed'}</button></div>
      <ul className="look">{bench.snap.active.filter((a) => ['calcium', 'insulin', 'albuterol', 'binder', 'dialysis'].includes(a.id)).map((a) => <li key={a.id}>{a.id}: {Math.round(a.effect * 100)} % effect</li>)}</ul>
    </section>
  );
}

export function SodiumPanel() {
  useUI((s) => s.pulse); const s = bench.snap;
  return (
    <section className="card">
      <div className="card-h"><h3>Brain cell volume</h3><Seg value={bench.naMode} options={[['acute', 'Acute (< 48 h)'], ['chronic', 'Chronic (adapted)']]} onChange={(v) => { bench.naMode = v; if (v === 'chronic') bench.pt.naBrain = bench.pt.p.na; else bench.pt.naBrain = 140; bench.set('na', bench.pt.p.na); bump(); }} small /></div>
      <div className="gauge"><span style={{ width: `${Math.min(100, Math.max(0, (s.cellVolume - 0.8) / 0.4 * 100))}%` }} className={s.cellVolume > 1.06 ? 'bad' : s.cellVolume < 0.94 ? 'warn' : 'ok'} /><i style={{ left: '50%' }} /></div>
      <p className="muted small">Cell volume {Math.round(s.cellVolume * 100)} % of normal · brain adapted to Na⁺ {bench.pt.naBrain.toFixed(0)} · change over 24 h {s.naRate24 >= 0 ? '+' : ''}{s.naRate24.toFixed(0)} mEq/L</p>
      {s.odsRisk > 0.2 && <p className="warnline">Correction too fast for a brain that had adapted: osmotic demyelination risk.</p>}
      <div className="actions"><button className="act" onClick={() => { bench.give('hypertonic'); bump(); }}>3 % saline 100 mL (+2)</button><button className="act" onClick={() => { bench.set('na', bench.pt.p.na + 6); bench.pt.naHist = [{ t: bench.pt.t - 1440, na: bench.pt.p.na - 6 }]; bump(); }}>Correct +6 in 24 h</button><button className="act" onClick={() => { bench.set('na', bench.pt.p.na + 14); bench.pt.naHist = [{ t: bench.pt.t - 1440, na: bench.pt.p.na - 14 }]; bump(); }}>Correct +14 in 24 h</button><button className="act" onClick={() => { bench.fastForward(48 * 60); bump(); }}>+48 h (brain adapts)</button></div>
    </section>
  );
}

export function OxygenPanel() {
  useUI((s) => s.pulse); const s = bench.snap; const p = bench.pt.p;
  const bar = (v: number, max: number) => `${Math.min(100, (v / max) * 100)}%`;
  return (
    <section className="card">
      <div className="card-h"><h3>SpO₂ vs oxygen content</h3></div>
      <div className="o2bars">
        <div><span>SpO₂</span><div className="bar"><i style={{ width: bar(s.spo2, 1) }} className="c1" /></div><b>{Math.round(s.spo2 * 100)} %</b></div>
        <div><span>CaO₂</span><div className="bar"><i style={{ width: bar(s.cao2, 22) }} className="c2" /></div><b>{s.cao2.toFixed(1)} mL/dL</b></div>
        <div><span>DO₂</span><div className="bar"><i style={{ width: bar(s.do2, 1400) }} className="c3" /></div><b>{s.do2.toFixed(0)} mL/min</b></div>
        <div><span>SvO₂</span><div className="bar"><i style={{ width: bar(s.svo2, 1) }} className="c4" /></div><b>{Math.round(s.svo2 * 100)} %</b></div>
      </div>
      <p className="formula">CaO₂ = 1.34 × <b>{p.hb.toFixed(1)}</b> × {s.sao2.toFixed(2)} + 0.003 × {s.pao2.toFixed(0)} = <b>{s.cao2.toFixed(1)}</b> mL/dL</p>
      <p className="muted small">Cardiac output rises to compensate ({s.co.toFixed(1)} L/min). The oximeter only sees the saturation of the haemoglobin that is there.</p>
      <div className="actions"><button className="act" onClick={() => { bench.give('transfusion'); bump(); }}>Transfuse 1 unit (+1 g/dL)</button></div>
    </section>
  );
}

export function LactatePanel() {
  useUI((s) => s.pulse); const s = bench.snap; const p = bench.pt.p; const perf = Math.min(1, s.co / 4.5);
  const prod = 0.03 * p.lactateProd + s.o2debt * 0.0008, clear = 0.03 * p.hepatic * perf * s.lactate;
  return (
    <section className="card">
      <div className="card-h"><h3>Production vs clearance</h3><span className="clock">{Math.floor(bench.pt.t / 60)} h {Math.round(bench.pt.t % 60)} min</span></div>
      <div className="o2bars"><div><span>Made</span><div className="bar"><i style={{ width: `${Math.min(100, prod / 0.2 * 100)}%` }} className="c2" /></div><b>{(prod * 60).toFixed(1)}/h</b></div><div><span>Cleared</span><div className="bar"><i style={{ width: `${Math.min(100, clear / 0.2 * 100)}%` }} className="c3" /></div><b>{(clear * 60).toFixed(1)}/h</b></div></div>
      <p className="muted small">Level rises when production outruns clearance. Adrenergic drive ×{p.lactateProd.toFixed(1)}, liver clearance {Math.round(p.hepatic * 100)} %, perfusion {Math.round(perf * 100)} %.</p>
      <div className="actions">
        <button className="act" onClick={() => { p.co = 2.2; bench.running = true; bump(); }}>Shock (CO 2.2)</button><button className="act" onClick={() => { p.hepatic = 0.3; bench.running = true; bump(); }}>Liver failure</button><button className="act" onClick={() => { p.lactateProd = 3; bench.running = true; bump(); }}>Adrenaline / sepsis</button>
        <button className="act primary" onClick={() => { p.co = 5.5; p.lactateProd = 1; p.hepatic = 1; bench.running = true; bump(); }}>Resuscitate</button><button className="act" onClick={() => { bench.fastForward(60); bump(); }}>+1 h</button>
      </div>
    </section>
  );
}
export function RenalPanel() {
  useUI((s) => s.pulse); const s = bench.snap; const p = bench.pt.p;
  return <section className="card"><div className="card-h"><h3>Filtration</h3></div><p className="formula">eGFR (CKD-EPI 2021, {p.sex === 'M' ? 'male' : 'female'}, {p.age} y) from Cr {p.cr.toFixed(1)} = <b>{Math.round(s.egfr)}</b> mL/min/1.73 m²</p><p className="muted small">Creatinine and GFR are inversely related: halving GFR doubles creatinine at steady state, so a rise from 0.6 to 1.2 is as serious as 2 to 4. BUN : Cr = {(p.bun / p.cr).toFixed(0)} {p.bun / p.cr > 20 ? '(suggests pre-renal or GI bleeding)' : ''}.</p></section>;
}
export function GapPanel() {
  useUI((s) => s.pulse); const s = bench.snap;
  return <section className="card"><div className="card-h"><h3>Anion gap</h3></div><p className="formula">Na⁺ {s.na.toFixed(0)} − (Cl⁻ {s.cl.toFixed(0)} + HCO₃⁻ {s.hco3.toFixed(0)}) = <b>{s.ag.toFixed(0)}</b>; corrected for albumin {s.albumin.toFixed(1)}: <b>{s.agCorr.toFixed(0)}</b></p><p className="muted small">pH {s.pH.toFixed(2)} · PaCO₂ {s.paco2.toFixed(0)} · lactate {s.lactate.toFixed(1)} · ketones {s.ketones.toFixed(1)} · glucose {bench.pt.p.glucose.toFixed(0)} (corrected Na⁺ {s.naCorr.toFixed(0)})</p></section>;
}
