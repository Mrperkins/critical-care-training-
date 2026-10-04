/**
 * Ventilator graphics: synchronised pressure / flow / volume (and optional patient-effort)
 * scalars, plus pressure–volume and flow–volume loops. Drawn straight from the session's
 * ring buffer every animation frame.
 */
import { useEffect, useRef } from 'react';
import { session } from './session';
import { useUI } from '../app/store';
import { IS_PHONE } from '../scene/Studio';

export const COL = { p: '#e9b949', q: '#5cc8b0', v: '#9fb2ff', mus: '#e0645a', grid: 'rgba(255,255,255,0.06)', axis: 'rgba(255,255,255,0.16)', text: '#8e8a84', insp: 'rgba(233,185,73,0.05)', hold: 'rgba(159,178,255,0.10)' };
const FONT = '500 10px "IBM Plex Mono", ui-monospace, monospace';

function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!; let raf = 0; let w = 0, h = 0;
    const ro = new ResizeObserver(() => { const r = c.getBoundingClientRect(); const d = Math.min(2, window.devicePixelRatio || 1); w = r.width; h = r.height; c.width = Math.round(w * d); c.height = Math.round(h * d); ctx.setTransform(d, 0, 0, d, 0, 0); });
    ro.observe(c);
    const loop = () => { raf = requestAnimationFrame(loop); if (w > 0 && h > 0) { ctx.clearRect(0, 0, w, h); draw(ctx, w, h); } };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [draw]);
  return ref;
}
const niceMax = (x: number, step: number, min: number) => Math.max(min, Math.ceil(x / step) * step);

export function Scalars({ height }: { height?: number }) {
  const showPmus = useUI((s) => s.showPmus);
  const scale = useRef({ p: 30, q: 60, v: 600, m: 10 });
  const ref = useCanvas((ctx, w, h) => {
    const S = session; const win = IS_PHONE ? 8 : 11; const n = S.count; if (n < 2) return;
    const tNew = S.t[S.at(0)];
    const channels = showPmus ? 4 : 3; const padL = 44, padR = 54, gap = 6; const ch = (h - gap * (channels - 1)) / channels;
    // autoscale over the window (smoothly)
    let pMax = 0, qMax = 0, vMax = 0, mMax = 0; const maxBack = Math.min(n, Math.round(win / 0.01));
    for (let b = 0; b < maxBack; b++) { const i = S.at(b); pMax = Math.max(pMax, S.paw[i]); qMax = Math.max(qMax, Math.abs(S.flow[i])); vMax = Math.max(vMax, S.vol[i]); mMax = Math.max(mMax, S.pmus[i]); }
    const sc = scale.current; sc.p += (niceMax(pMax * 1.1, 10, 30) - sc.p) * 0.08; sc.q += (niceMax(qMax * 1.1, 30, 60) - sc.q) * 0.08; sc.v += (niceMax(vMax * 1.1, 200, 600) - sc.v) * 0.08; sc.m += (niceMax(mMax * 1.2, 5, 10) - sc.m) * 0.08;
    const X = (t: number) => padL + (w - padL - padR) * (1 - (tNew - t) / win);
    const strips: { key: 'p' | 'q' | 'v' | 'm'; lo: number; hi: number; col: string; label: string; unit: string; arr: Float32Array; zero?: boolean }[] = [
      { key: 'p', lo: 0, hi: sc.p, col: COL.p, label: 'Paw', unit: 'cmH₂O', arr: S.paw },
      { key: 'q', lo: -sc.q, hi: sc.q, col: COL.q, label: 'Flow', unit: 'L/min', arr: S.flow, zero: true },
      { key: 'v', lo: 0, hi: sc.v, col: COL.v, label: 'Vol', unit: 'mL', arr: S.vol },
    ];
    if (showPmus) strips.push({ key: 'm', lo: 0, hi: sc.m, col: COL.mus, label: 'Pmus', unit: 'cmH₂O', arr: S.pmus });
    ctx.font = FONT; ctx.textBaseline = 'middle';
    strips.forEach((st, si) => {
      const y0 = si * (ch + gap), y1 = y0 + ch; const Y = (v: number) => y1 - ((v - st.lo) / (st.hi - st.lo)) * (ch - 8) - 4;
      // phase bands
      let bandStart = -1, bandCode = 0;
      for (let b = maxBack - 1; b >= 0; b--) {
        const i = S.at(b); const c = S.ph[i]; const x = X(S.t[i]);
        const on = c === 1 || c === 5 || c === 2 || c === 3 || c === 4;
        if (on && bandStart < 0) { bandStart = x; bandCode = c; }
        if ((!on || b === 0) && bandStart >= 0) { ctx.fillStyle = bandCode >= 2 && bandCode <= 4 ? COL.hold : COL.insp; ctx.fillRect(bandStart, y0, x - bandStart, ch); bandStart = -1; }
      }
      // grid
      ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.beginPath();
      for (let g = 0; g <= 4; g++) { const yy = y0 + 4 + (ch - 8) * g / 4; ctx.moveTo(padL, yy); ctx.lineTo(w - padR, yy); } ctx.stroke();
      if (st.zero) { ctx.strokeStyle = COL.axis; ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(w - padR, Y(0)); ctx.stroke(); }
      if (st.key === 'p') { const pe = S.m.s.mode === 'APRV' ? S.m.s.plow : S.m.s.peep; ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(233,185,73,0.35)'; ctx.beginPath(); ctx.moveTo(padL, Y(pe)); ctx.lineTo(w - padR, Y(pe)); ctx.stroke(); ctx.setLineDash([]); }
      // trace
      ctx.strokeStyle = st.col; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.beginPath();
      if (st.key === 'm') ctx.setLineDash([4, 3]);
      for (let b = maxBack - 1; b >= 0; b--) { const i = S.at(b); const x = X(S.t[i]); const y = Y(st.arr[i]); if (b === maxBack - 1) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke(); ctx.setLineDash([]);
      // labels
      ctx.fillStyle = st.col; ctx.textAlign = 'left'; ctx.fillText(st.label, 4, y0 + 10);
      ctx.fillStyle = COL.text; ctx.fillText(st.unit, 4, y0 + 23);
      ctx.textAlign = 'right'; ctx.fillText(String(Math.round(st.hi)), padL - 6, y0 + 6); ctx.fillText(String(Math.round(st.lo)), padL - 6, y1 - 6);
      const cur = st.arr[S.at(0)]; ctx.fillStyle = st.col; ctx.textAlign = 'left'; ctx.font = '600 13px "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillText(st.key === 'v' ? Math.round(cur).toString() : cur.toFixed(st.key === 'q' ? 0 : 1), w - padR + 8, y0 + ch / 2); ctx.font = FONT;
      // sweep head
      ctx.fillStyle = st.col; ctx.beginPath(); ctx.arc(X(tNew), Y(cur), 2.6, 0, Math.PI * 2); ctx.fill();
    });
  });
  return <canvas ref={ref} className="scalars" style={{ height: height ?? (showPmus ? 300 : 240) }} aria-label="Pressure, flow and volume waveforms" />;
}

export function Loops() {
  const ref = useCanvas((ctx, w, h) => {
    const S = session; const gap = 14; const side = Math.min(h, (w - gap) / 2);
    const drawLoop = (x0: number, title: string, xs: (p: { p: number; q: number; v: number }) => number, ys: (p: { p: number; q: number; v: number }) => number, xr: [number, number], yr: [number, number], xl: string, yl: string, col: string, zeroY: boolean) => {
      const pad = 22; const X = (v: number) => x0 + pad + (side - pad - 6) * (v - xr[0]) / (xr[1] - xr[0]); const Y = (v: number) => side - pad - (side - pad - 8) * (v - yr[0]) / (yr[1] - yr[0]);
      ctx.strokeStyle = COL.grid; ctx.strokeRect(x0 + pad, 8, side - pad - 6, side - pad - 8);
      if (zeroY) { ctx.strokeStyle = COL.axis; ctx.beginPath(); ctx.moveTo(x0 + pad, Y(0)); ctx.lineTo(x0 + side - 6, Y(0)); ctx.stroke(); }
      const path = (arr: typeof S.loop, a: number, lw: number) => { if (arr.length < 2) return; ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); arr.forEach((p, i) => { const x = X(xs(p)), y = Y(ys(p)); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke(); ctx.globalAlpha = 1; };
      path(S.prevLoop, 0.28, 1.4); path(S.loop, 1, 1.8);
      ctx.font = FONT; ctx.fillStyle = COL.text; ctx.textAlign = 'center'; ctx.fillText(xl, x0 + pad + (side - pad) / 2, side - 7);
      ctx.save(); ctx.translate(x0 + 8, (side - pad) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(yl, 0, 0); ctx.restore();
      ctx.textAlign = 'left'; ctx.fillStyle = col; ctx.fillText(title, x0 + pad + 6, 18);
    };
    const all = [...S.prevLoop, ...S.loop]; const pM = niceMax(Math.max(20, ...all.map((p) => p.p)) * 1.05, 10, 20); const vM = niceMax(Math.max(300, ...all.map((p) => p.v)) * 1.05, 200, 400); const qM = niceMax(Math.max(40, ...all.map((p) => Math.abs(p.q))) * 1.05, 30, 60);
    drawLoop(0, 'P–V', (p) => p.p, (p) => p.v, [0, pM], [0, vM], 'Paw cmH₂O', 'Vol mL', COL.v, false);
    drawLoop(side + gap, 'F–V', (p) => p.v, (p) => p.q, [0, vM], [-qM, qM], 'Vol mL', 'Flow L/min', COL.q, true);
  });
  return <canvas ref={ref} className="loops" aria-label="Pressure–volume and flow–volume loops" />;
}
