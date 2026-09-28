/** Side-panel cards for the invasive-lines module. */
import { useEffect, useRef, useState } from 'react';
import { useUI } from '../app/store';
import { lines, ACTIONS, type LineId, type Action } from './session';
import { SCENARIOS, type LinesScenario } from './hemo';
import { FAULTS, classify, type Fault } from './transducer';
import { useLinesUI, toast } from './linesStore';

const r0 = (x: number) => Math.round(x); const r1 = (x: number) => (Math.round(x * 10) / 10).toFixed(1);
const bump = () => useUI.getState().set({ pulse: useUI.getState().pulse + 1 });

export function ScenarioPicker({ onPick }: { onPick?: (s: LinesScenario) => void }) {
  useUI((s) => s.pulse); const groups = [...new Set(SCENARIOS.map((s) => s.group))];
  return (
    <section className="card">
      <div className="card-h"><h3>Patient</h3><span className="muted small">{lines.sc.blurb}</span></div>
      {groups.map((g) => (
        <div key={g} className="ln-group"><div className="eyebrow">{g}</div>
          <div className="chips">{SCENARIOS.filter((s) => s.group === g).map((s) => <button key={s.id} className={`chip${lines.sc.id === s.id ? ' on' : ''}`} onClick={() => { lines.load(s.id); onPick?.(s); bump(); }}>{s.short}</button>)}</div>
        </div>
      ))}
    </section>
  );
}

export function StoryCard() {
  useUI((s) => s.pulse); const sc = lines.sc;
  return (
    <section className="card cellstory">
      <div className="card-h"><h3>{sc.name}</h3></div>
      <ol className="story">{sc.story.map((t, i) => <li key={i}><button>{t}</button></li>)}</ol>
      <div className="eyebrow">Look for</div>
      <ul className="look">{sc.look.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </section>
  );
}

export function SetupCard() {
  useUI((s) => s.pulse); const st = lines.setup; const err = lines.levelErr; const mm = lines.hydro();
  const set = (p: Partial<typeof st>) => { Object.assign(lines.setup, p); lines.version++; bump(); };
  const ok = Math.abs(err) < 1.5;
  return (
    <section className="card">
      <div className="card-h"><h3>Bed & transducer level</h3><span className={`badge ${ok ? 'ok' : 'bad'}`}>{ok ? 'Levelled' : `${Math.abs(err).toFixed(0)} cm ${err > 0 ? 'below' : 'above'} axis`}</span></div>
      <label className="sl"><span>Bed height</span><input type="range" min={50} max={110} step={1} value={st.bedH} onChange={(e) => set({ bedH: +e.target.value })} /><b>{r0(st.bedH)} cm</b></label>
      <label className="sl"><span>Head of bed</span><input type="range" min={0} max={60} step={1} value={st.hob} onChange={(e) => set({ hob: +e.target.value })} /><b>{r0(st.hob)}°</b></label>
      <label className="sl"><span>Transducer height</span><input type="range" min={60} max={180} step={1} value={st.transH} onChange={(e) => set({ transH: +e.target.value })} /><b>{r0(st.transH)} cm</b></label>
      <div className="ln-level">
        <div>Phlebostatic axis <b>{r0(lines.axis)} cm</b> above the floor (4th intercostal space, mid-axillary line)</div>
        <div className={ok ? 'ok' : 'bad'}>{ok ? 'Air–fluid interface at the axis: no hydrostatic error.' : `Every reading is ${mm > 0 ? '+' : '−'}${Math.abs(mm).toFixed(1)} mmHg ${mm > 0 ? 'too high' : 'too low'} (${Math.abs(err).toFixed(0)} cm × 0.74 mmHg/cm) — the CVP error matters most.`}</div>
      </div>
      <button className="act primary" onClick={() => { lines.levelToAxis(); toast('Transducer levelled to the phlebostatic axis', 'good'); bump(); }}>Level transducer to the axis</button>
    </section>
  );
}

export function LineCard({ id, faults = true }: { id: LineId; faults?: boolean }) {
  useUI((s) => s.pulse); const L = lines.line(id); const name = id === 'art' ? 'Arterial line (right radial)' : 'Central line (right IJ) — CVP';
  const faultList = (Object.keys(FAULTS) as Fault[]).filter((f) => FAULTS[f].line === 'both' || FAULTS[f].line === id);
  const acts = (Object.keys(ACTIONS) as Action[]).filter((a) => a !== 'withdraw' || id === 'cvp');
  return (
    <section className="card">
      <div className="card-h"><h3>{name}</h3><span className="muted small">bag {r0(L.bag)} mmHg</span></div>
      <div className="ln-row">
        <span className="muted small">Stopcock</span>
        <div className="seg small">{([['patient', 'Open to patient'], ['air', 'Open to air']] as const).map(([k, l]) => <button key={k} className={L.stopcock === k ? 'on' : ''} onClick={() => { lines.setStopcock(id, k); bump(); }}>{l}</button>)}</div>
      </div>
      <div className="actions">
        <button className="act" onClick={() => { lines.zero(id); toast(L.stopcock === 'air' ? 'Zeroed to atmosphere ✓' : 'Zeroed while open to the patient — the monitor now subtracts the patient’s pressure!', L.stopcock === 'air' ? 'good' : 'bad'); bump(); }}>Zero</button>
        <button className="act" onClick={() => { lines.flush(id); useLinesUI.getState().set({ flushLine: id }); bump(); }}>Fast-flush test</button>
      </div>
      {faults && <label className="sl sel"><span>Introduce a problem</span><select value={L.fault} onChange={(e) => { lines.setFault(id, e.target.value as Fault); bump(); }}>{faultList.map((f) => <option key={f} value={f}>{FAULTS[f].name}</option>)}</select></label>}
      {faults && L.fault !== 'none' && <p className="muted small">{FAULTS[L.fault].what} <b>Sign:</b> {FAULTS[L.fault].sign}</p>}
      <details className="fixes"><summary>Bedside fixes</summary>
        <div className="chips">{acts.map((a) => <button key={a} className="chip" onClick={() => { const r = lines.act(id, a); toast(r.text, r.ok ? 'good' : 'bad'); bump(); }}>{ACTIONS[a].label}</button>)}</div>
      </details>
    </section>
  );
}

export function BreathingCard() {
  useUI((s) => s.pulse); const m = lines.resp.mode;
  return (
    <section className="card">
      <div className="card-h"><h3>Breathing</h3><span className="muted small">{m === 'ppv' ? `Ventilated, ${lines.resp.rr}/min` : `Spontaneous, ${lines.resp.rr}/min`}</span></div>
      <div className="seg small">{([['spont', 'Spontaneous'], ['ppv', 'Ventilator (PPV)']] as const).map(([k, l]) => <button key={k} className={m === k ? 'on' : ''} onClick={() => { lines.setVent(k); bump(); }}>{l}</button>)}</div>
      {m === 'ppv' && <div className="ln-row"><span className="muted small">Tidal volume</span><div className="seg small">{[6, 8, 10].map((v) => <button key={v} className={lines.vt === v ? 'on' : ''} onClick={() => { lines.setVt(v); bump(); }}>{v} mL/kg</button>)}</div></div>}
      <p className="muted small">{m === 'ppv' ? 'Each breath raises intrathoracic pressure: CVP rises in inspiration, and an under-filled heart ejects less a few beats later → pulse-pressure variation. PPV predicts fluid response only with controlled breaths ≥ 8 mL/kg and no spontaneous effort, a regular rhythm, a closed chest, heart rate/breathing rate > 3.6, compliance > 30 mL/cmH₂O, and no RV failure or raised abdominal pressure.' : 'Each breath in lowers intrathoracic pressure: CVP falls and systolic dips slightly (< 10 mmHg). Read the CVP at end-expiration, just before the breath in.'}</p>
    </section>
  );
}

export function TreatCard() {
  useUI((s) => s.pulse);
  return (
    <section className="card">
      <div className="card-h"><h3>Treat & check</h3></div>
      <div className="actions">
        <button className="act" onClick={() => { lines.fluid(); bump(); }}>Fluid 500 mL</button>
        <label className="sl sel nore"><span>Norepinephrine</span><select value={lines.noreDose} onChange={(e) => { lines.setNore(+e.target.value); bump(); }}>{[0, 0.05, 0.1, 0.2, 0.3].map((d) => <option key={d} value={d}>{d === 0 ? 'Off' : `${d} µg/kg/min`}</option>)}</select></label>
        {lines.sc.morph.tamponade ? <button className="act" onClick={() => { lines.pericardiocentesis(); bump(); }}>Pericardiocentesis</button> : null}
        <button className="act" onClick={() => { lines.startNibp(); bump(); }}>Cycle NIBP cuff</button>
      </div>
      {lines.log.length > 0 && <ul className="ln-log">{lines.log.slice(0, 4).map((l, i) => <li key={i}>{l.text}</li>)}</ul>}
    </section>
  );
}

export function NumbersCard({ hideTrue }: { hideTrue?: boolean } = {}) {
  useUI((s) => s.pulse); const n = lines.num; if (hideTrue) return <MonitorOnlyCard />; const d = (a: number, b: number) => Math.abs(a - b) > 5;
  return (
    <section className="card">
      <div className="card-h"><h3>Monitor vs true pressure</h3><span className="muted small">what the screen says vs what is in the vessel</span></div>
      <table className="ln-tab"><thead><tr><th /><th>Monitor</th><th>True (radial / tip)</th><th>Central aorta</th></tr></thead><tbody>
        <tr><td>Systolic</td><td className={d(n.sys, n.tSys) ? 'bad' : ''}>{r0(n.sys)}</td><td>{r0(n.tSys)}</td><td>{r0(n.aoSys)}</td></tr>
        <tr><td>Diastolic</td><td className={d(n.dia, n.tDia) ? 'bad' : ''}>{r0(n.dia)}</td><td>{r0(n.tDia)}</td><td>{r0(n.aoDia)}</td></tr>
        <tr><td>MAP</td><td className={d(n.map, n.tMap) ? 'bad' : ''}>{r0(n.map)}</td><td>{r0(n.tMap)}</td><td>{r0(n.aoMap)}</td></tr>
        <tr><td>CVP (mean)</td><td className={Math.abs(n.cvp - n.tCvp) > 2 ? 'bad' : ''}>{r1(n.cvp)}</td><td>{r1(n.tCvp)}</td><td /></tr>
        <tr><td>CVP end-expiration</td><td className={Math.abs(n.cvpEE - n.tCvpEE) > 2 ? 'bad' : ''}>{r1(n.cvpEE)}</td><td>{r1(n.tCvpEE)}</td><td /></tr>
        <tr><td>Pulse-pressure variation</td><td>{n.ppv == null ? '—' : `${r0(n.ppv)} %`}</td><td colSpan={2} className="muted small">{lines.resp.mode === 'ppv' ? (lines.circ.rhythm !== 'sinus' ? 'irregular rhythm — PPV not valid' : n.ppv != null && n.ppv > 13 ? '> 13 %: likely fluid-responsive' : n.ppv != null && n.ppv > 9 ? '9–13 %: grey zone' : '< 9 %: unlikely to respond') : 'spontaneous breathing — PPV not valid'}</td></tr>
      </tbody></table>
      <label className="tgl-line"><input type="checkbox" checked={useLinesUI((s) => s.showTrue)} onChange={(e) => useLinesUI.getState().set({ showTrue: e.target.checked })} /> Overlay the true pressure on the monitor (dashed)</label>
    </section>
  );
}

function MonitorOnlyCard() {
  const n = lines.num; const nb = lines.nibp;
  return (
    <section className="card">
      <div className="card-h"><h3>Monitor readings</h3><span className="muted small">the true pressures are hidden until you fix it</span></div>
      <table className="ln-tab"><tbody>
        <tr><td>Arterial</td><td>{r0(n.sys)}/{r0(n.dia)} ({r0(n.map)})</td></tr>
        <tr><td>CVP (monitor mean)</td><td>{r1(n.cvp)}</td></tr>
        <tr><td>NIBP cuff</td><td>{lines.nibpDue > 0 ? 'measuring…' : nb ? `${nb.s}/${nb.d} (${nb.m})` : <button className="chip" onClick={() => { lines.startNibp(); bump(); }}>Cycle cuff</button>}</td></tr>
      </tbody></table>
    </section>
  );
}

/** Square-wave (fast-flush) test: the captured ring-down and how to read it. */
export function FlushCard() {
  useUI((s) => s.pulse); const id = useLinesUI((s) => s.flushLine); const ref = useRef<HTMLCanvasElement>(null);
  const r = lines.flushReading(id); const L = lines.line(id); const [, force] = useState(0);
  useEffect(() => {
    const c = ref.current; if (!c || !r) return; const ctx = c.getContext('2d')!; const d = Math.min(2, devicePixelRatio || 1); const w = c.clientWidth, h = c.clientHeight; c.width = w * d; c.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, w, h);
    const pre = 60; const all = [...Array(pre).fill(r.bagP), ...r.cap]; const lo = Math.min(...all) - 5, hi = Math.max(...all) + 5;
    const X = (i: number) => 6 + (i / (all.length - 1)) * (w - 12); const Y = (v: number) => h - 8 - ((v - lo) / (hi - lo)) * (h - 22);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; for (let k = 0; k <= all.length; k += 40) { ctx.beginPath(); ctx.moveTo(X(k), 10); ctx.lineTo(X(k), h - 6); ctx.stroke(); }
    ctx.strokeStyle = id === 'art' ? '#ff5a57' : '#57b6ff'; ctx.lineWidth = 1.6; ctx.beginPath(); all.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)))); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '500 10px "IBM Plex Mono", monospace'; ctx.fillText(`flush ${r0(r.bagP)} mmHg → release`, 8, 12); ctx.fillText('grid = 40 ms', w - 86, 12);
    r.ext?.forEach((e, k) => { const i = e.i + pre; ctx.fillStyle = '#e9b949'; ctx.beginPath(); ctx.arc(X(i), Y(r.cap[e.i]), 2.6, 0, 7); ctx.fill(); if (k < 6) ctx.fillText(String(k + 1), X(i) - 3, Y(r.cap[e.i]) + (e.v > 0 ? -6 : 13)); });
  }, [r?.at, id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setInterval(() => force((x) => x + 1), 1500); return () => clearInterval(t); }, []);
  const g = r && r.fn ? classify(r.zeta, r.fn) : null;
  return (
    <section className="card">
      <div className="card-h"><h3>Fast-flush (square-wave) test</h3><div className="seg small">{(['art', 'cvp'] as const).map((k) => <button key={k} className={id === k ? 'on' : ''} onClick={() => useLinesUI.getState().set({ flushLine: k })}>{k === 'art' ? 'ART' : 'CVP'}</button>)}</div></div>
      {!r ? <p className="muted small">Pull the flush device for a second, then let go. The trace jumps to the bag pressure and falls back: count the oscillations before the waveform resumes.</p> : <>
        <canvas ref={ref} className="flushcv" />
        <div className="ln-flush">
          <div><span>Oscillations</span><b>{r.osc?.toFixed(1)}</b></div>
          <div><span>Natural freq.</span><b>{r.fn ? `${r.fn.toFixed(0)} Hz` : '—'}</b></div>
          <div><span>Damping ζ</span><b>{r.fn ? r.zeta!.toFixed(2) : '> 1'}</b></div>
          <div><span>Verdict</span><b className={r.verdict === 'optimal' ? 'ok' : 'bad'}>{r.verdict === 'optimal' ? 'Optimally damped' : r.verdict === 'underdamped' ? 'Underdamped' : 'Overdamped'}</b></div>
        </div>
        <p className="muted small">{r.verdict === 'optimal' ? '1.5–2 oscillations then a clean waveform: trust the systolic and diastolic numbers.' : r.verdict === 'underdamped' ? 'More than 2 oscillations: the system rings — systolic reads too high, diastolic a little low. Look for long tubing, extra stopcocks or a small bubble.' : 'The trace slides back with no bounce: overdamped — systolic reads low, diastolic high. Look for air, a clot, a kink or a soft bag.'} MAP is the least affected value either way.{g ? ` (Gardner chart: ${g}.)` : ''}{r.bagP < 250 ? ` The flush only reached ${r0(r.bagP)} mmHg — the bag is under-inflated.` : ''}</p>
        <p className="muted small">Line now: {L.fault === 'none' ? 'no fault' : 'see troubleshooting'}.</p>
      </>}
    </section>
  );
}

/** Live "what is wrong with this picture" explanation (Explore only). */
export function ExplainCard() {
  useUI((s) => s.pulse); const out: { t: string; tone: 'bad' | 'ok' | 'info' }[] = [];
  const n = lines.num; const err = lines.levelErr;
  if (Math.abs(err) >= 1.5) out.push({ t: `Transducer is ${Math.abs(err).toFixed(0)} cm ${err > 0 ? 'below' : 'above'} the phlebostatic axis: ${err > 0 ? 'every' : 'every'} pressure reads ${Math.abs(lines.hydro()).toFixed(1)} mmHg ${err > 0 ? 'high' : 'low'}. On a CVP of ${r0(n.tCvp)} that is a ${r0((Math.abs(lines.hydro()) / Math.max(1, n.tCvp)) * 100)} % error.`, tone: 'bad' });
  for (const id of ['art', 'cvp'] as LineId[]) {
    const L = lines.line(id); const nm = id === 'art' ? 'Arterial' : 'CVP';
    if (L.stopcock === 'air') out.push({ t: `${nm} stopcock is open to air: the transducer reads atmosphere (0). Zero now, then turn it back to the patient.`, tone: 'info' });
    const zErr = L.drift - L.zeroRef; if (Math.abs(zErr) > 2) out.push({ t: `${nm} zero is off by ${zErr > 0 ? '+' : '−'}${Math.abs(zErr).toFixed(0)} mmHg${L.zeroRef > 10 ? ' — it was zeroed while open to the patient, so the patient’s own pressure is being subtracted' : ''}. Re-zero open to air.`, tone: 'bad' });
    if (L.fault !== 'none' && L.fault !== 'drift') out.push({ t: `${nm}: ${FAULTS[L.fault].name}. ${FAULTS[L.fault].sign} Fix: ${FAULTS[L.fault].fix}`, tone: 'bad' });
  }
  if (!out.length) out.push({ t: 'Both lines levelled, zeroed and optimally damped: the monitor matches the true pressures.', tone: 'ok' });
  if (lines.resp.mode === 'spont' && lines.circ.rhythm === 'sinus' && n.spv != null && n.spv > 10) out.push({ t: `Systolic falls ${r0(n.spv)} mmHg with each breath in: pulsus paradoxus (> 10 mmHg).`, tone: 'bad' });
  return (
    <section className="card">
      <div className="card-h"><h3>What the monitor is telling you</h3></div>
      <ul className="ln-explain">{out.map((o, i) => <li key={i} className={`tone-${o.tone}`}>{o.t}</li>)}</ul>
    </section>
  );
}

export function Toast() {
  const t = useLinesUI((s) => s.toast); const [, f] = useState(0);
  useEffect(() => { if (!t) return; const id = setTimeout(() => f((x) => x + 1), 4200); return () => clearTimeout(id); }, [t]);
  if (!t || Date.now() - t.at > 4000) return null;
  return <div className={`ln-toast tone-${t.tone}`}>{t.text}</div>;
}
