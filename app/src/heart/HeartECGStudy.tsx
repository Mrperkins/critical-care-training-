import { useEffect, useState } from 'react';
import { STUDY_EVENTS, studyCycleMs, teachingLeadII, useStudyClock } from './studyClock';

const SPEEDS = [0.05, 0.1, 0.25, 0.5, 1, 2];
/** The same clock drives 3D activation, chamber mechanics and the ECG cursor. */
export function HeartECGStudy() {
  const enabled = useStudyClock((s) => s.enabled);
  const running = useStudyClock((s) => s.running);
  const speed = useStudyClock((s) => s.speed);
  const bpm = useStudyClock((s) => s.heartRate);
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
  const event = [...STUDY_EVENTS].reverse().find((x) => x.offset <= ms) ?? STUDY_EVENTS[STUDY_EVENTS.length - 1];
  const patch = useStudyClock.getState().set;
  const seek = (position: number) => {
    const s = useStudyClock.getState();
    const beatStart = Math.floor((s.seconds * 1000 + 190) / rr) * rr - 190;
    patch({ seconds: Math.max(0, (beatStart + Math.max(0, Math.min(1, position)) * rr) / 1000), running: false });
  };
  return <section className="card" aria-label="Synchronized cardiac electrical study">
    <div className="card-h"><h3>Conduction · heartbeat · ECG</h3></div>
    <label className="nd-row"><span>Linked study mode</span><input type="checkbox" checked={enabled} onChange={(e) => patch({ enabled: e.target.checked, running: true })}/></label>
    {enabled && <>
      <div className="nd-row" style={{gap:8, flexWrap:'wrap'}}>
        <button className="tgl" onClick={() => patch({ running: !running })}>{running ? 'Pause' : 'Play'}</button>
        <button className="tgl" onClick={() => patch({ running: false, seconds: 0 })}>Reset</button>
        <button className="tgl" onClick={() => patch({ running: false, seconds: Math.max(0, seconds - 0.01) })}>−10 ms</button>
        <button className="tgl" onClick={() => patch({ running: false, seconds: seconds + 0.01 })}>+10 ms</button>
        <select aria-label="Playback speed" value={speed} onChange={(e) => patch({ speed: Number(e.target.value) })}>{SPEEDS.map((x) => <option key={x} value={x}>{x}× speed</option>)}</select>
      </div>
      <div style={{fontSize:12,marginBottom:6}}>Lead II · illustrative morphology · {bpm} bpm · {Math.round(ms)} ms after SA activation</div>
      <svg role="img" aria-label="Interactive illustrative lead II electrocardiogram with synchronized cursor" viewBox="0 0 340 110" style={{width:'100%',maxWidth:560,display:'block',touchAction:'none',cursor:'crosshair'}} onPointerDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect(); seek((e.clientX - rect.left) / rect.width);
      }}>
        {Array.from({length:18},(_,i)=><line key={'v'+i} x1={i*20} y1={0} x2={i*20} y2={110} stroke="#64748b" opacity={0.2}/>)}
        {Array.from({length:6},(_,i)=><line key={'h'+i} x1={0} y1={i*20} x2={340} y2={i*20} stroke="#64748b" opacity={0.2}/>)}
        <polyline points={points} fill="none" stroke="#16b8b5" strokeWidth="2" strokeLinejoin="round"/>
        <line x1={p*340} y1={0} x2={p*340} y2={110} stroke="#f59e0b" strokeWidth="2"/>
      </svg>
      <input aria-label="Scrub cardiac cycle" type="range" min={0} max={1000} value={Math.round(p*1000)} onChange={(e)=>seek(Number(e.target.value)/1000)} style={{width:'100%'}}/>
      <p style={{margin:'6px 0'}}><strong>{event.name}:</strong> {event.detail}</p>
      <p className="muted small">Educational lead-II waveform; not derived from patient-specific electrical dipoles. Playback speed does not alter the simulated rate. Node and muscle timing are approximate.</p>
    </>}
  </section>;
}
