import { useEffect, useState } from 'react';
import { STUDY_EVENTS, studyCycleMs, teachingLeadII, useStudyClock } from './studyClock';

const SPEEDS = [0.05, 0.1, 0.25, 0.5, 1, 2];
/** The same clock drives 3D activation, chamber mechanics and the ECG cursor. */
export function HeartECGStudy() {
  const enabled = useStudyClock((s) => s.enabled);
  const running = useStudyClock((s) => s.running);
  const speed = useStudyClock((s) => s.speed);
  const bpm = useStudyClock((s) => s.heartRate);
  const rateOverride = useStudyClock((s) => s.rateOverride);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const paint = () => { setSeconds(useStudyClock.getState().seconds); raf = requestAnimationFrame(paint); };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
  const ms = studyCycleMs(seconds, bpm);
  const rr = 60000 / Math.max(20, bpm);
  const p = ms / rr;
  const points = Array.from({ length: 250 }, (_, i) => {
    const t = (i / 249) * rr;
    return `${i * 1.36},${55 - teachingLeadII(t, bpm) * 37}`;
  }).join(' ');
  const event = [...STUDY_EVENTS].reverse().find((x) => x.offset <= ms) ?? STUDY_EVENTS[0];
  // Schematic Wiggers relationships only. Timings share the cursor, not calibrated pressures.
  const wiggersTrace = (kind: 'aortic' | 'ventricular' | 'volume') => Array.from({length:250}, (_, i) => {
    const t = (i / 249) * rr;
    const sys = Math.min(0.37 * Math.sqrt(rr / (60000 / 70)) * 1000, rr * 0.55);
    const ivc = 50, ivr = 70, atr0 = rr - Math.min(130, 0.16 * rr);
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    const smooth = (v: number) => { const k = clamp(v); return k * k * (3 - 2 * k); };
    const eject = smooth((t - ivc) / Math.max(1, sys - ivc));
    const fill = smooth((t - sys - ivr) / 140);
    const isEject = t >= ivc && t <= sys;
    const lv = t < ivc ? 12 + 100 * smooth(t / ivc) : isEject ? 112 - 25 * eject : 12 + 75 * (1 - smooth((t - sys) / ivr));
    const ao = t < ivc ? 80 - 3 * t / ivc : isEject ? 78 + 42 * Math.sin(Math.PI * eject * 0.85) : 82 - 5 * smooth((t - sys) / Math.max(1, rr - sys));
    const vol = t < ivc ? 120 : t < sys ? 120 - 65 * eject : t < sys + ivr ? 55 : 55 + 55 * fill + 10 * smooth((t - atr0) / Math.max(1, rr - atr0));
    const y = kind === 'ventricular' ? 101 - lv * 0.73 : kind === 'aortic' ? 101 - ao * 0.73 : 101 - (vol - 35) * 0.8;
    return `${i * 1.36},${y.toFixed(2)}`;
  }).join(' ');
  const patch = useStudyClock.getState().set;
  const seek = (position: number) => {
    const s = useStudyClock.getState();
    let beatStart = Math.floor((s.seconds * 1000 + 190) / rr) * rr - 190;
    if (beatStart < 0) beatStart += rr;
    patch({ seconds: (beatStart + Math.max(0, Math.min(0.9999, position)) * rr) / 1000, running: false });
  };
  return <section className="card" aria-label="Synchronized cardiac electrical study">
    <div className="card-h"><h3>Conduction · heartbeat · ECG</h3></div>
    <label className="nd-row"><span>Linked study mode</span><input type="checkbox" checked={enabled} onChange={(e) => patch({ enabled: e.target.checked, running: true })}/></label>
    {enabled && <>
      <div className="nd-row" style={{gap:8, flexWrap:'wrap'}}>
        <button className="tgl" onClick={() => patch({ running: !running })}>{running ? 'Pause' : 'Play'}</button>
        <button className="tgl" onClick={() => patch({ running: false, seconds: Math.max(0, (rr - 190) / 1000) })}>Reset</button>
        <button className="tgl" onClick={() => patch({ running: false, seconds: Math.max(0, seconds - 0.01) })}>−10 ms</button>
        <button className="tgl" onClick={() => patch({ running: false, seconds: seconds + 0.01 })}>+10 ms</button>
        <select aria-label="Playback speed" value={speed} onChange={(e) => patch({ speed: Number(e.target.value) })}>{SPEEDS.map((x) => <option key={x} value={x}>{x}× speed</option>)}</select>
      </div>
      <div className="nd-row"><label htmlFor="study-hr">Physiological HR</label><input id="study-hr" type="number" min={50} max={140} step={5} value={rateOverride ?? bpm} onChange={(e) => patch({rateOverride: Math.max(50, Math.min(140, Number(e.target.value) || 84))})} style={{maxWidth:85}}/><button className="tgl" onClick={() => patch({rateOverride:null})}>Preset rate</button></div>
      <div style={{fontSize:12,marginBottom:6}}>Lead II · illustrative morphology · {bpm} bpm · {Math.round(ms)} ms after SA activation</div>
      <svg role="img" aria-label="Interactive illustrative lead II electrocardiogram with synchronized cursor" viewBox="0 0 340 110" style={{width:'100%',maxWidth:560,display:'block',touchAction:'none',cursor:'crosshair'}} onPointerDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect(); seek((e.clientX - rect.left) / rect.width);
      }}>
        {Array.from({length:18},(_,i)=><line key={'v'+i} x1={i*20} y1={0} x2={i*20} y2={110} stroke="#64748b" opacity={0.2}/>)}
        {Array.from({length:6},(_,i)=><line key={'h'+i} x1={0} y1={i*20} x2={340} y2={i*20} stroke="#64748b" opacity={0.2}/>)}
        <polyline points={points} fill="none" stroke="#16b8b5" strokeWidth="2" strokeLinejoin="round"/>
        <line x1={p*340} y1={0} x2={p*340} y2={110} stroke="#f59e0b" strokeWidth="2"/>
      </svg>
      <details><summary>Mechanical cycle comparison (illustrative)</summary>
        <svg viewBox="0 0 340 110" role="img" aria-label="Illustrative aortic pressure, ventricular pressure and chamber volume with synchronized cursor" style={{width:'100%',maxWidth:560}}>
          <polyline points={wiggersTrace('aortic')} fill="none" stroke="#ef9c53" strokeWidth="2"/>
          <polyline points={wiggersTrace('ventricular')} fill="none" stroke="#e15c76" strokeWidth="2"/>
          <polyline points={wiggersTrace('volume')} fill="none" stroke="#70aeea" strokeWidth="2"/>
          <line x1={p*340} x2={p*340} y1="0" y2="110" stroke="#f59e0b" strokeWidth="2"/>
        </svg>
        <p className="muted small">Orange: aortic pressure; pink: ventricular pressure; blue: ventricular volume (schematic normalized traces, not clinical measurements).</p>
      </details>
      <input aria-label="Scrub cardiac cycle" type="range" min={0} max={1000} value={Math.round(p*1000)} onChange={(e)=>seek(Number(e.target.value)/1000)} style={{width:'100%'}}/>
      <p style={{margin:'6px 0'}}><strong>{event.name}:</strong> {event.detail}</p>
      <p className="muted small">Educational lead-II waveform; not derived from patient-specific electrical dipoles. Playback speed does not alter the simulated rate. Node and muscle timing are approximate.</p>
    </>}
  </section>;
}
