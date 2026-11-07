import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStudyClock } from './studyClock';
import { ECG_EVENTS, studyECG, studyPhase, STUDY_LEADS } from './studyECG';
import type { LeadId } from '../infarct/data/types';
import { IS_PHONE } from '../scene/Studio';

/**
 * The bedside-monitor strip under the 3D heart. It sweeps left to right like a real monitor (several beats,
 * erase bar ahead of the trace), draws any of the 12 leads from the same vector model as the 3D activation,
 * and opens a paper 12-lead printout. Time is the shared study clock, so the beating heart, the conduction
 * shader and the trace stay in step (and slow down together in study mode).
 */
const SA_OFFSET_MS = 190; // studyCycleMs: SA discharge sits 190 ms before the clock's beat origin
const saMs = (seconds: number) => seconds * 1000 + SA_OFFSET_MS;
/** A little of what a real electrode picks up: baseline wander with breathing and a trace of muscle noise. */
function artefact(ms: number) {
  const s = ms / 1000;
  const wander = 0.035 * Math.sin(2 * Math.PI * 0.23 * s) + 0.015 * Math.sin(2 * Math.PI * 0.61 * s + 1.3);
  const k = Math.floor(ms / 4); const h = Math.sin(k * 12.9898) * 43758.5453; const noise = (h - Math.floor(h) - 0.5) * 0.022;
  return wander + noise;
}
export const ecgAt = (lead: LeadId, ms: number, bpm: number, clean = false) => studyECG(lead, ms, bpm) + (clean ? 0 : artefact(ms));
const GREEN = '#3cf07c';

export function HeartECGSceneStrip() {
  const enabled = useStudyClock((s) => s.enabled);
  const running = useStudyClock((s) => s.running);
  const speed = useStudyClock((s) => s.speed);
  const bpm = useStudyClock((s) => s.heartRate);
  const [lead, setLead] = useState<LeadId>('II');
  const [twelve, setTwelve] = useState(false);
  const [phaseName, setPhaseName] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);
  const windowS = IS_PHONE ? 4 : 6;
  const view = useRef({ lead, bpm, windowS }); view.current = { lead, bpm, windowS };

  useEffect(() => {
    let raf = 0; let last = -Infinity; let lastLabel = 0;
    const paint = (now: number) => {
      raf = requestAnimationFrame(paint);
      if (now - last < 33) return; last = now;
      const c = canvas.current; if (!c) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1); const w = c.clientWidth, h = c.clientHeight;
      if (!w || !h) return;
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      const ctx = c.getContext('2d'); if (!ctx) return;
      const { lead: L, bpm: B, windowS: W } = view.current;
      const sec = useStudyClock.getState().seconds; const nowMs = saMs(sec);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#020403'; ctx.fillRect(0, 0, w, h);
      // faint monitor graticule: 0.2 s columns, 0.5 mV rows
      const mid = h * 0.56; const gain = h * 0.3; // px per mV
      ctx.strokeStyle = 'rgba(60,240,124,.07)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let t = 0; t <= W; t += 0.2) { const x = Math.round((t / W) * w) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let mv = -2; mv <= 2; mv += 0.5) { const y = Math.round(mid - mv * gain) + 0.5; ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
      // 1 mV calibration pulse
      ctx.strokeStyle = 'rgba(60,240,124,.55)'; ctx.lineWidth = 1.2; ctx.beginPath();
      ctx.moveTo(4, mid); ctx.lineTo(8, mid); ctx.lineTo(8, mid - gain); ctx.lineTo(16, mid - gain); ctx.lineTo(16, mid); ctx.lineTo(20, mid); ctx.stroke();
      // sweep: the head moves across the screen; to its right is the previous sweep, behind an erase gap
      const head = ((nowMs / 1000) % W) / W * w; const gap = 14;
      ctx.strokeStyle = GREEN; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(60,240,124,.55)'; ctx.shadowBlur = 4;
      const drawSpan = (x0: number, x1: number, back: number) => {
        if (x1 - x0 < 1) return; ctx.beginPath();
        for (let x = x0; x <= x1; x += 1) {
          const t = nowMs - ((head - x) / w) * W * 1000 - back;
          const y = mid - Math.max(-2.6, Math.min(2.6, ecgAt(L, t, B))) * gain;
          if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };
      drawSpan(24, Math.floor(head), 0);
      drawSpan(Math.max(24, Math.ceil(head + gap)), w, W * 1000);
      ctx.shadowBlur = 0;
      ctx.fillStyle = GREEN; ctx.beginPath(); ctx.arc(head, mid - Math.max(-2.6, Math.min(2.6, ecgAt(L, nowMs, B))) * gain, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.font = '600 12px "Atkinson Hyperlegible Mono", ui-monospace, monospace'; ctx.fillStyle = GREEN; ctx.textBaseline = 'top';
      ctx.fillText(L, 26, 6); ctx.fillStyle = 'rgba(60,240,124,.6)'; ctx.font = '11px "Atkinson Hyperlegible Mono", ui-monospace, monospace'; ctx.fillText('x1  1 mV', 26 + ctx.measureText(L).width + 22, 7);
      if (now - lastLabel > 250) { lastLabel = now; setPhaseName(studyPhase(nowMs, B).name); }
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, []);

  const patch = useStudyClock.getState().set;
  const seek = (fraction: number) => {
    const s = useStudyClock.getState(); const nowMs = saMs(s.seconds); const w = 1; const head = ((nowMs / 1000) % windowS) / windowS;
    const x = Math.max(0, Math.min(0.999, fraction));
    const back = x <= head ? (head - x) * windowS : (head - x + w) * windowS;
    patch({ enabled: true, running: false, seconds: Math.max(0, s.seconds - back) });
  };
  const step = (d: number) => setLead(STUDY_LEADS[(STUDY_LEADS.indexOf(lead) + d + STUDY_LEADS.length) % STUDY_LEADS.length]);
  return <section className="heart-ecg-strip ecg-monitor" aria-label="Cardiac monitor ECG">
    <div className="heart-strip-info">
      <strong>ECG <span>· monitor · lead {lead}</span></strong>
      <div className="ecg-hr" aria-label={`Heart rate ${bpm}`}><b>{bpm}</b><small>HR</small></div>
      <small>{phaseName || 'Sinus rhythm'}</small>
    </div>
    <div className="ecg-wave-col">
      <canvas ref={canvas} className="heart-strip-wave" role="img" aria-label={`Lead ${lead} ECG sweeping in step with the 3D beating heart. Tap to freeze at a moment.`}
        onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width); }} />
      <div className="ecg-leads" role="group" aria-label="ECG lead">
        <button type="button" onClick={() => step(-1)} aria-label="Previous lead">‹</button>
        <select value={lead} aria-label="Lead" onChange={(e) => setLead(e.target.value as LeadId)}>{STUDY_LEADS.map((id) => <option key={id} value={id}>{id}</option>)}</select>
        <button type="button" onClick={() => step(1)} aria-label="Next lead">›</button>
        <button type="button" className="ecg-12" onClick={() => setTwelve(true)}>12-lead</button>
      </div>
    </div>
    <div className="heart-strip-actions">
      <button type="button" onClick={() => patch({ enabled: true, running: !running })} aria-label={running ? 'Pause cardiac study' : 'Play cardiac study'}>{running ? 'Pause' : 'Play'}</button>
      <select value={speed} aria-label="Cardiac study playback speed" onChange={(e) => patch({ enabled: true, speed: Number(e.target.value) })}>
        {[0.05, 0.1, 0.25, 0.5, 1, 2].map((x) => <option value={x} key={x}>{x}×</option>)}
      </select>
      <button type="button" className="heart-strip-conduction" aria-pressed={enabled} onClick={() => patch({ enabled: !enabled, running: true })}>{enabled ? 'Conduction study on' : 'Conduction study'}</button>
    </div>
    {twelve && <TwelveLead bpm={bpm} onClose={() => setTwelve(false)} onPick={(l) => { setLead(l); setTwelve(false); }} />}
  </section>;
}

/** Standard 3 × 4 layout (2.5 s per lead) with a 10 s lead II rhythm strip, on 1 mm / 5 mm paper at 25 mm/s, 10 mm/mV. */
const GRID: LeadId[][] = [['I', 'aVR', 'V1', 'V4'], ['II', 'aVL', 'V2', 'V5'], ['III', 'aVF', 'V3', 'V6']];
function TwelveLead({ bpm, onClose, onPick }: { bpm: number; onClose: () => void; onPick: (l: LeadId) => void }) {
  const [t0, setT0] = useState(() => saMs(useStudyClock.getState().seconds) - 10000);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [onClose]);
  const X0 = 10, ROW = 30, TOP = 16, W = 250; // mm; 10 s across 250 mm
  const path = (lead: LeadId, fromS: number, toS: number, base: number) => {
    const pts: string[] = [];
    for (let s = fromS; s <= toS + 1e-6; s += 0.004) pts.push(`${(X0 + s * 25).toFixed(2)},${(base - Math.max(-1.45, Math.min(1.45, ecgAt(lead, t0 + s * 1000, bpm))) * 10).toFixed(2)}`);
    return pts.join(' ');
  };
  const cal = (base: number) => `${X0 - 7},${base} ${X0 - 6},${base} ${X0 - 6},${base - 10} ${X0 - 1},${base - 10} ${X0 - 1},${base} ${X0},${base}`;
  const H = TOP + ROW * 4 + 6; const total = X0 + W + 4;
  const minor: string[] = []; const major: string[] = [];
  for (let x = 0; x <= total; x += 1) (x % 5 ? minor : major).push(`M${x} 0V${H}`);
  for (let y = 0; y <= H; y += 1) (y % 5 ? minor : major).push(`M0 ${y}H${total}`);
  const rr = 60000 / Math.max(20, bpm); const ev = (id: string) => ECG_EVENTS.find((e) => e.id === id)!; const pr = ev('qrs').at - ev('p').at; const qrs = ev('qrs').end - ev('qrs').at;
  return createPortal(
    <div className="ecg12-scrim" role="dialog" aria-modal="true" aria-label="12-lead ECG" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ecg12">
        <header>
          <div><b>12-lead ECG</b><span>Teaching model · sinus rhythm · {bpm} bpm · RR {Math.round(rr)} ms · PR ≈ {pr} ms · QRS ≈ {qrs} ms</span></div>
          <div className="ecg12-act"><button type="button" className="lib-btn" onClick={() => setT0(saMs(useStudyClock.getState().seconds) - 10000)}>Print again</button><button type="button" className="lib-btn primary" onClick={onClose}>Close</button></div>
        </header>
        <div className="ecg12-paper">
          <svg viewBox={`0 0 ${total} ${H}`} role="img" aria-label="Twelve-lead ECG printout on standard paper">
            <rect width={total} height={H} fill="#fff6f4" />
            <path d={minor.join('')} stroke="#f6c4c0" strokeWidth={0.1} />
            <path d={major.join('')} stroke="#e98f8a" strokeWidth={0.22} />
            {GRID.map((row, r) => { const base = TOP + ROW * r + ROW / 2; return <g key={r}>
              <polyline points={cal(base)} fill="none" stroke="#111" strokeWidth={0.32} />
              {row.map((lead, c) => <g key={lead} className="ecg12-lead" onClick={() => onPick(lead)} role="button" aria-label={`Show lead ${lead} on the monitor`}>
                <rect x={X0 + c * 62.5} y={base - ROW / 2} width={62.5} height={ROW} fill="transparent" />
                <polyline points={path(lead, c * 2.5, c * 2.5 + 2.5, base)} fill="none" stroke="#111" strokeWidth={0.34} strokeLinejoin="round" />
                {c > 0 && <line x1={X0 + c * 62.5} x2={X0 + c * 62.5} y1={base - 3} y2={base + 3} stroke="#111" strokeWidth={0.3} />}
                <text x={X0 + c * 62.5 + 1.5} y={base - ROW / 2 + 5} fontSize={3.6} fontFamily="ui-sans-serif, system-ui" fill="#111">{lead}</text>
              </g>)}
            </g>; })}
            <g className="ecg12-lead" onClick={() => onPick('II')} role="button" aria-label="Show lead II on the monitor">
              <polyline points={cal(TOP + ROW * 3 + ROW / 2)} fill="none" stroke="#111" strokeWidth={0.32} />
              <polyline points={path('II', 0, 10, TOP + ROW * 3 + ROW / 2)} fill="none" stroke="#111" strokeWidth={0.34} strokeLinejoin="round" />
              <text x={X0 + 1.5} y={TOP + ROW * 3 + 5} fontSize={3.6} fontFamily="ui-sans-serif, system-ui" fill="#111">II</text>
            </g>
            <text x={X0} y={8} fontSize={3.4} fontFamily="ui-monospace, monospace" fill="#5b2b2b">25 mm/s   10 mm/mV   0.05–150 Hz</text>
            <text x={total - 4} y={8} fontSize={3.4} fontFamily="ui-monospace, monospace" fill="#5b2b2b" textAnchor="end">Not diagnostic · vector teaching model</text>
          </svg>
        </div>
        <p className="ecg12-hint">Tap a lead to put it on the monitor. Each small box is 1 mm (0.04 s, 0.1 mV); each large box 5 mm (0.2 s, 0.5 mV).</p>
      </div>
    </div>, document.body);
}
