import { useEffect, useMemo, useState } from 'react';
import { useStudyClock, studyCycleMs } from './studyClock';
import { studyECGPath, studyPhase } from './studyECG';

/**
 * Always-adjacent single-lead strip: the patient and its electrical trace remain
 * visible together on phones that put detailed lessons in a separate context tab.
 * Does not duplicate the detailed twelve-lead editor.
 */
export function HeartECGSceneStrip() {
  const enabled = useStudyClock((s) => s.enabled);
  const running = useStudyClock((s) => s.running);
  const speed = useStudyClock((s) => s.speed);
  const bpm = useStudyClock((s) => s.heartRate);
  const [seconds, setSeconds] = useState(() => useStudyClock.getState().seconds);
  useEffect(() => {
    let raf = 0; let last = -Infinity;
    const repaint = (now: number) => {
      if (now - last > 32) { setSeconds(useStudyClock.getState().seconds); last = now; }
      raf = requestAnimationFrame(repaint);
    };
    raf = requestAnimationFrame(repaint);
    return () => cancelAnimationFrame(raf);
  }, []);
  const points = useMemo(() => studyECGPath('II', bpm, 340, 39, 27, 220), [bpm]);
  const rr = 60000 / Math.max(20, bpm);
  const ms = studyCycleMs(seconds, bpm);
  const phase = studyPhase(ms, bpm);
  const patch = useStudyClock.getState().set;
  const seek = (fraction: number) => {
    const current = useStudyClock.getState();
    let beatStart = Math.floor((current.seconds * 1000 + 190) / rr) * rr - 190;
    if (beatStart < 0) beatStart += rr;
    patch({ enabled: true, seconds: (beatStart + Math.max(0, Math.min(0.999, fraction)) * rr) / 1000, running: false });
  };
  return <section className="heart-ecg-strip" aria-label="Cardiac live ECG strip">
    <>
      <div className="heart-strip-info">
        <strong>LIVE ECG <span>· Lead II · teaching model</span></strong>
        <small>{bpm} bpm · {phase.name}</small>
        <button type="button" className="heart-strip-conduction" aria-pressed={enabled} onClick={() => patch({enabled: !enabled, running:true})}>{enabled ? 'Conduction study on' : 'Enable conduction study'}</button>
      </div>
      <svg className="heart-strip-wave" viewBox="0 0 340 80" role="img" aria-label="ECG trace linked to the 3D beating heart" onPointerDown={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        seek((e.clientX - bounds.left) / bounds.width);
      }}>
        <line x1="0" x2="340" y1="39" y2="39" stroke="#94a3b8" strokeOpacity=".2"/>
        <polyline points={points} fill="none" stroke="#22c9bf" strokeWidth="2.5" strokeLinejoin="round" />
        <line x1={340*ms/rr} x2={340*ms/rr} y1="0" y2="80" stroke="#f2b94e" strokeWidth="2"/>
      </svg>
      <div className="heart-strip-actions">
        <button type="button" onClick={() => patch({enabled:true,running:!running})} aria-label={running?'Pause cardiac study':'Play cardiac study'}>{running ? 'Pause' : 'Play'}</button>
        <select value={speed} aria-label="Cardiac study playback speed" onChange={(e)=>patch({enabled:true,speed:Number(e.target.value)})}>
          {[0.05,0.1,0.25,0.5,1,2].map(x=><option value={x} key={x}>{x}×</option>)}
        </select>
      </div>
    </>
  </section>;
}
