/** ICP monitoring on the same brain: pressure–volume curve, waveform, CPP, pupils and posture, Cushing response, EVD. */
import { useEffect } from 'react';
import { useNeuroUI } from './neuroStore';
import { Pupils3D } from './Pupils3D';
import { useIcpUI, setIcp, setEvd } from './icpStore';
import { icpState, icpOfVolume, icpWave, icpFindings } from './icp';
import { Knob } from '../vent/VentPanel';

export function useIcp() { const st = useNeuroUI((s) => s.state); const sys = useNeuroUI((s) => s.sys); const inp = useIcpUI((s) => s.input); return icpState(st, sys, inp); }

export function IcpCard() {
  const s = useIcp(); const inp = useIcpUI((x) => x.input); const sys = useNeuroUI((x) => x.sys);
  // the brain's perfusion sees this ICP (CPP = MAP − ICP): one-directional, so no loop
  useEffect(() => { const cur = useNeuroUI.getState().sys; if (Math.abs((cur.icp ?? 10) - s.icp) > 0.5) useNeuroUI.getState().set({ sys: { ...cur, icp: Math.round(s.icp * 2) / 2 } }); }, [s.icp]);
  const W = 250, H = 120; const X = (dv: number) => 22 + ((dv + 15) / 90) * (W - 30), Y = (p: number) => H - 14 - (Math.min(80, p) / 80) * (H - 24);
  const curve = Array.from({ length: 91 }, (_, i) => i - 15).map((dv, i) => `${i ? 'L' : 'M'}${X(dv).toFixed(1)},${Y(icpOfVolume(dv, s.vol.buffer, inp.decompressed)).toFixed(1)}`).join('');
  const wave = [0, 1, 2].flatMap(() => icpWave(s, 60)); const WW = 250, WH = 70; const lo = Math.min(...wave) - 2, hi = Math.max(...wave) + 2;
  const wpath = wave.map((v, i) => `${i ? 'L' : 'M'}${((i / wave.length) * WW).toFixed(1)},${(WH - 6 - ((v - lo) / Math.max(1, hi - lo)) * (WH - 14)).toFixed(1)}`).join('');
  const e = inp.evd;
  return (
    <section className="card icp">
      <div className="card-h"><h3>Intracranial pressure</h3><span className="muted small">Monro–Kellie · same brain</span></div>
      <div className="ln-flush">
        <div><span>ICP</span><b className={s.icp > 22 ? 'bad' : 'ok'}>{Math.round(s.icp)}</b></div>
        <div><span>CPP</span><b className={s.cpp < 60 ? 'bad' : 'ok'}>{Math.round(s.cpp)}</b></div>
        <div><span>MAP · HR</span><b className={s.cushing ? 'bad' : ''}>{Math.round(s.map)} · {Math.round(s.hr)}</b></div>
        <div><span>GCS ≤ · breathing</span><b className={s.gcsCap <= 8 ? 'bad' : ''}>{s.gcsCap} · {s.resp}</b></div>
      </div>
      <div className="icp-figs">
        <svg viewBox={`0 0 ${W} ${H}`} className="dr-svg" role="img" aria-label={`Pressure–volume curve, ICP ${Math.round(s.icp)}`}>
          <path d={curve} className="icp-curve" /><circle cx={X(s.vol.total)} cy={Y(s.icp)} r={5} className="icp-pt" />
          <text x={24} y={12} className="dr-lab">ICP</text><text x={W - 4} y={H - 3} className="dr-lab" textAnchor="end">added volume →</text>
          <line x1={22} x2={W - 8} y1={Y(20)} y2={Y(20)} className="icp-thr" /><text x={W - 8} y={Y(20) - 3} className="dr-lab" textAnchor="end">20</text>
        </svg>
        <svg viewBox={`0 0 ${WW} ${WH}`} className="dr-svg" role="img" aria-label={`ICP waveform, P2 ${s.p2p1 > 1 ? 'above' : 'below'} P1`}>
          <path d={wpath} className="icp-wave" /><text x={4} y={11} className="dr-lab">ICP waveform · P2/P1 {s.p2p1.toFixed(2)}</text>
        </svg>
      </div>
      <Pupils3D R={s.pupils.R} L={s.pupils.L} />
      {s.posture !== 'none' && <p className="explain bad">Posture: {s.posture}. Herniation: {s.herniation}.</p>}
      <ul className="dr-find">{icpFindings(s).map((f) => <li key={f} className={/herniation|Cushing|overdrain|clamped|below about 60/i.test(f) ? 'bad' : ''}>{f}</li>)}</ul>
      <details className="icp-controls" open>
        <summary>Treat</summary>
        <div className="chips">
          <button className={`chip${inp.headUp >= 30 ? ' on' : ''}`} onClick={() => setIcp({ headUp: inp.headUp >= 30 ? 0 : 30 })}>Head up 30°</button>
          <button className="chip" onClick={() => setIcp({ osmoMl: inp.osmoMl + 15 })}>Osmotherapy bolus</button>
          <button className={`chip${inp.decompressed ? ' on' : ''}`} onClick={() => setIcp({ decompressed: !inp.decompressed })}>Evacuate / decompress</button>
          <button className={`chip${e ? ' on' : ''}`} onClick={() => setEvd(e ? null : { open: true })}>EVD</button>
          {e && <button className={`chip${e.open ? ' on' : ''}`} onClick={() => setEvd({ open: !e.open })}>{e.open ? 'Open' : 'Clamped'}</button>}
          {e && <button className={`chip${e.levelErrorCm ? ' on' : ''}`} onClick={() => setEvd({ levelErrorCm: e.levelErrorCm ? 0 : 15 })}>Head raised, not re-levelled</button>}
        </div>
        {e && <Knob label="EVD chamber above the tragus" value={e.heightCm} min={0} max={25} step={1} unit=" cmH₂O" onChange={(v) => setEvd({ heightCm: v })} hint={`≈ ${Math.round(e.heightCm / 1.36)} mmHg`} />}
        <p className="muted small">PaCO₂ and MAP are in the Patient card; brief hyperventilation lowers ICP by constricting vessels — and lowers blood flow too.</p>
      </details>
      <p className="muted small" style={{ marginTop: 6 }}>Teaching model: volumes, thresholds and pupil sizes are illustrative, not predictions for a patient.</p>
      <span className="sr-only">{sys.paco2}</span>
    </section>
  );
}
