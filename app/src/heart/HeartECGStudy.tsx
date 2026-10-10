import { useEffect, useMemo, useState } from 'react';
import { studyECGPath, studyPhase, STUDY_LEADS, ECG_EVENTS } from './studyECG';
import type { LeadId } from '../infarct/data/types';
import { wiggers } from './beat';
import { studyCycleMs, useStudyClock } from './studyClock';

const SPEEDS = [0.05, 0.1, 0.25, 0.5, 1, 2];
/** The same clock drives 3D activation, chamber mechanics and the ECG cursor. */
export function HeartECGStudy() {
  const enabled = useStudyClock((s) => s.enabled);
  const running = useStudyClock((s) => s.running);
  const speed = useStudyClock((s) => s.speed);
  const bpm = useStudyClock((s) => s.heartRate);
  const rateOverride = useStudyClock((s) => s.rateOverride);
  const [seconds, setSeconds] = useState(() => useStudyClock.getState().seconds);
  const [lead, setLead] = useState<LeadId>('II');
  useEffect(() => {
    if (!enabled) return;
    let raf = 0; let last = -Infinity;
    const paint = (now: number) => {
      if (now - last >= 32) { setSeconds(useStudyClock.getState().seconds); last = now; }
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
  const ms = studyCycleMs(seconds, bpm);
  const rr = 60000 / Math.max(20, bpm);
  const p = ms / rr;
  const mechanics = wiggers(seconds, bpm);
  const valveState = mechanics.slOpen > 0.1 ? 'Aortic and pulmonary valves open' : mechanics.avOpen > 0.1 ? 'Mitral and tricuspid valves open' : 'All four valves in transition or closed';
  const points = useMemo(() => studyECGPath(lead, bpm), [lead, bpm]);
  const allPaths = useMemo(() => STUDY_LEADS.map((id) => ({id, points: studyECGPath(id, bpm, 340, 50, 22, 180)})), [bpm]);
  const event = studyPhase(ms, bpm);
  // Mechanical phase begins near the QRS, 190 ms after SA discharge in this model.
  // Reuse the exact Wiggers function used by the 3D mesh deformation.
  const wiggersTrace = (kind: 'aortic' | 'ventricular' | 'volume') => Array.from({length:220}, (_, i) => {
    const electricalMs = i * rr / 219;
    const mechanicalMs = ((electricalMs - 190) % rr + rr) % rr;
    const w = wiggers(mechanicalMs / 1000, bpm);
    // Display-only normalized pressure/volume proxies, NOT patient pressure values.
    const y = kind === 'ventricular' ? 91 - 67 * w.slOpen :
      kind === 'aortic' ? 80 - 25 * w.slOpen :
      36 + 49 * w.v;
    return (i * 340 / 219).toFixed(2) + ',' + y.toFixed(2);
  }).join(' ');
  const traceSet = useMemo(() => ({ aortic: wiggersTrace('aortic'), ventricular: wiggersTrace('ventricular'), volume: wiggersTrace('volume') }), [bpm]);
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
      <div className="nd-row"><label htmlFor="study-hr">Physiological HR</label><input id="study-hr" type="range" min={50} max={140} step={5} value={rateOverride ?? bpm} onChange={(e) => patch({rateOverride: Number(e.target.value)})} style={{flex:1,minWidth:80}}/><strong>{bpm} bpm</strong><button className="tgl" onClick={() => patch({rateOverride:null})}>Preset rate</button></div>
      <div className="nd-row" style={{flexWrap:'wrap',gap:8}}><label htmlFor="study-jump">Inspect event</label>
        <select id="study-jump" defaultValue="" onChange={(e) => {
          const entry = ECG_EVENTS.find((v) => v.id === e.target.value);
          if (entry) seek(entry.at / rr);
          e.currentTarget.value = '';
        }}>
          <option value="">Jump to…</option>{ECG_EVENTS.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>
      <div className="nd-row" style={{justifyContent:'space-between',gap:10}}>
        <label htmlFor="study-lead">ECG lead</label>
        <select id="study-lead" value={lead} onChange={(e) => setLead(e.target.value as LeadId)}>{STUDY_LEADS.map((id) => <option key={id} value={id}>{id}</option>)}</select>
        <span className="muted small">{bpm} bpm · {Math.round(ms)} ms since SA</span>
      </div>
      <svg role="img" aria-label={`Interactive illustrative lead ${lead} electrocardiogram with synchronized cursor`} viewBox="0 0 340 110" style={{width:'100%',maxWidth:560,display:'block',touchAction:'none',cursor:'crosshair'}} onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        const rect = e.currentTarget.getBoundingClientRect(); seek((e.clientX - rect.left) / rect.width);
      }} onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const rect = e.currentTarget.getBoundingClientRect(); seek((e.clientX - rect.left) / rect.width);
      }} onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}>
        {Array.from({length:18},(_,i)=><line key={'v'+i} x1={i*20} y1={0} x2={i*20} y2={110} stroke="#64748b" opacity={0.2}/>)}
        {Array.from({length:6},(_,i)=><line key={'h'+i} x1={0} y1={i*20} x2={340} y2={i*20} stroke="#64748b" opacity={0.2}/>)}
        <polyline points={points} fill="none" stroke="#16b8b5" strokeWidth="2" strokeLinejoin="round"/>
        {ECG_EVENTS.filter((e) => e.id === 'p' || e.id === 'qrs' || e.id === 't').map((e) =>
          <text key={e.id} x={Math.min(330, (e.at + e.end) / 2 / rr * 340)} y={12} fill="#cdbb94" fontSize={10} textAnchor="middle">{e.id.toUpperCase()}</text>
        )}
        <line x1={p*340} y1={0} x2={p*340} y2={110} stroke="#f59e0b" strokeWidth="2"/>
      </svg>
      <details className="study-details"><summary>Compare electrical activity with mechanical cycle</summary>
        <svg viewBox="0 0 340 110" role="img" aria-label="Illustrative aortic pressure, ventricular pressure and chamber volume with synchronized cursor" style={{width:'100%',maxWidth:560}}>
          <polyline points={traceSet.aortic} fill="none" stroke="#ef9c53" strokeWidth="2"/>
          <polyline points={traceSet.ventricular} fill="none" stroke="#e15c76" strokeWidth="2"/>
          <polyline points={traceSet.volume} fill="none" stroke="#70aeea" strokeWidth="2"/>
          <line x1={p*340} x2={p*340} y1="0" y2="110" stroke="#f59e0b" strokeWidth="2"/>
        </svg>
        <p className="muted small">Orange: aortic pressure proxy; pink: ventricular pressure proxy; blue: relative chamber emptying. All three use the heart model's Wiggers timing, aligned to the QRS. These are not calibrated measurements.</p>
      </details>
      <details className="study-details"><summary>View all 12 synchronized leads</summary>
        <div className="study-lead-grid">{allPaths.map((item) => <button type="button" key={item.id} className={lead === item.id ? 'study-lead active' : 'study-lead'} aria-label={`Select lead ${item.id}`} aria-pressed={lead === item.id} onClick={() => setLead(item.id)}>
          <span>{item.id}</span><svg viewBox="0 0 340 100" role="img" aria-label={`Lead ${item.id} schematic waveform`}>
            <polyline points={item.points} fill="none" stroke="#16b8b5" strokeWidth="3"/>
            <line x1={p*340} x2={p*340} y1="0" y2="100" stroke="#f59e0b" strokeWidth="2"/>
          </svg>
        </button>)}</div>
      </details>
      <input aria-label="Scrub cardiac cycle" type="range" min={0} max={1000} value={Math.round(p*1000)} onChange={(e)=>seek(Number(e.target.value)/1000)} style={{width:'100%'}}/>
      <p style={{margin:'6px 0'}}><strong>{event.name}:</strong> {event.detail}</p>
      <p className="muted small">Mechanical state: {valveState}. {mechanics.atr > 0.2 ? 'Atrial contraction is active.' : ''}</p>
      <p className="muted small">12-lead teaching waveform uses the existing Infarct Atlas vector-cardiographic projection model. It is not derived from distributed 3D myocardium or patient-specific anatomy and is not diagnostic. Playback speed does not alter the simulated rate. Node and muscle timing are approximate.</p>
    </>}
  </section>;
}
