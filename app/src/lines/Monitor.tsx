/**
 * Bedside monitor: ECG II, arterial (ART) and central venous (CVP) pressure on a sweep-erase
 * display with the numbers a monitor would compute from those traces. Freeze + a measuring
 * cursor let the learner read the CVP at end-expiration by hand. Annotations (labels toggle)
 * name the waves of the latest beat.
 */
import { useEffect, useRef } from 'react';
import { lines } from './session';
import { useLinesUI } from './linesStore';
import { useLabels } from '../scene/labels';

const COL = { ecg: '#46e08a', art: '#ff5a57', cvp: '#57b6ff', grid: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.55)', trueA: 'rgba(255,190,188,0.75)', trueC: 'rgba(190,225,255,0.75)', insp: 'rgba(255,255,255,0.04)', ee: 'rgba(87,182,255,0.12)' };
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const N = 250 * 24;

interface Src { t: Float64Array; ecg: Float32Array; art: Float32Array; cvp: Float32Array; artT: Float32Array; cvpT: Float32Array; insp: Uint8Array; head: number; count: number }
const live = (): Src => ({ t: lines.t, ecg: lines.ecg, art: lines.artD, cvp: lines.cvpD, artT: lines.artT, cvpT: lines.cvpT, insp: lines.insp, head: lines.head, count: lines.count });
const copy = (s: Src): Src => ({ t: s.t.slice(), ecg: s.ecg.slice(), art: s.art.slice(), cvp: s.cvp.slice(), artT: s.artT.slice(), cvpT: s.cvpT.slice(), insp: s.insp.slice(), head: s.head, count: s.count });
const at = (s: Src, back: number) => (s.head - 1 - back + N * 2) % N;

export function Monitor({ height, compact }: { height?: number; compact?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frozenSrc = useRef<Src | null>(null); const cursor = useRef<number | null>(null);
  const frozen = useLinesUI((s) => s.frozen);
  useEffect(() => { frozenSrc.current = frozen ? copy(live()) : null; cursor.current = null; }, [frozen]);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!; let raf = 0; let w = 0, h = 0;
    const ro = new ResizeObserver(() => { const r = c.getBoundingClientRect(); const d = Math.min(2, window.devicePixelRatio || 1); w = r.width; h = r.height; c.width = Math.round(w * d); c.height = Math.round(h * d); ctx.setTransform(d, 0, 0, d, 0, 0); });
    ro.observe(c);
    const scale = { art: 160, cvp: 20 };
    const draw = () => {
      raf = requestAnimationFrame(draw); if (!w || !h) return; const ui = useLinesUI.getState();
      const S = frozenSrc.current ?? live(); if (S.count < 10) return;
      const tNow = S.t[at(S, 0)]; const narrow = w < 560; const W = narrow ? 5 : 8;
      const numW = narrow ? 104 : 170; const padL = 38; const plotW = w - padL - numW - 8;
      ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, w, h);
      // alarm banner
      const alarm = lines.alarms[0]; const top = alarm ? 18 : 4;
      if (alarm) { const on = Math.floor(performance.now() / 500) % 2 === 0 || frozenSrc.current; ctx.fillStyle = alarm.level === 'high' ? (on ? '#c62828' : '#6d1414') : '#8a6d10'; ctx.fillRect(0, 0, w, 16); ctx.fillStyle = '#fff'; ctx.font = `600 10.5px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(alarm.text, 8, 8); }
      const gap = 5; const hh = h - top - 4; const hs = [hh * 0.26, hh * 0.42, hh * 0.32]; const ys = [top, top + hs[0] + gap, top + hs[0] + hs[1] + gap * 2];
      const X = (t: number) => padL + ((((t % W) + W) % W) / W) * plotW;
      const back = Math.min(S.count - 1, Math.round(W * 250) - 2);
      // autoscale pressure channels to sensible clinical scales
      let aMax = 0, cMax = 0; for (let b = 0; b < back; b += 3) { const i = at(S, b); aMax = Math.max(aMax, S.art[i], ui.showTrue ? S.artT[i] : 0); cMax = Math.max(cMax, S.cvp[i]); }
      const tgtA = aMax > 280 ? 320 : aMax > 190 ? 240 : aMax > 150 ? 200 : 160; const tgtC = cMax > 36 ? 60 : cMax > 18 ? 40 : 20;
      if (tgtA > scale.art || aMax < scale.art * 0.6) scale.art = tgtA; if (tgtC > scale.cvp || cMax < scale.cvp * 0.5) scale.cvp = tgtC;
      const chans = [
        { key: 'ecg', y0: ys[0], hgt: hs[0], lo: -0.6, hi: 1.6, col: COL.ecg, label: 'II', arr: S.ecg, tr: null as Float32Array | null, trc: '' },
        { key: 'art', y0: ys[1], hgt: hs[1], lo: 0, hi: scale.art, col: COL.art, label: 'ART', arr: S.art, tr: ui.showTrue ? S.artT : null, trc: COL.trueA },
        { key: 'cvp', y0: ys[2], hgt: hs[2], lo: -5, hi: scale.cvp, col: COL.cvp, label: 'CVP', arr: S.cvp, tr: ui.showTrue ? S.cvpT : null, trc: COL.trueC },
      ];
      ctx.textBaseline = 'middle';
      for (const ch of chans) {
        const Y = (v: number) => ch.y0 + ch.hgt - 3 - ((Math.max(ch.lo - 2, Math.min(ch.hi * 1.08, v)) - ch.lo) / (ch.hi - ch.lo)) * (ch.hgt - 6);
        // inspiration shading (pressure channels)
        if (ch.key !== 'ecg') { let st = -1; for (let b = back; b >= 0; b--) { const i = at(S, b); const x = X(S.t[i]); const on = S.insp[i] === 1; if (on && st < 0) st = x; if ((!on || b === 0 || (st >= 0 && x < st)) && st >= 0) { ctx.fillStyle = COL.insp; ctx.fillRect(st, ch.y0, Math.max(0, x - st), ch.hgt); st = on && x < st ? x : -1; } } }
        // grid & scale
        ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.beginPath();
        if (ch.key === 'art') for (const v of [0, 40, 80, 120, 160, 200, 240].filter((v) => v <= ch.hi)) { ctx.moveTo(padL, Y(v)); ctx.lineTo(padL + plotW, Y(v)); }
        if (ch.key === 'cvp') for (const v of [0, 10, 20, 30, 40].filter((v) => v <= ch.hi)) { ctx.moveTo(padL, Y(v)); ctx.lineTo(padL + plotW, Y(v)); }
        ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = ch.col; ctx.font = `600 10.5px ${MONO}`; ctx.textAlign = 'left'; ctx.fillText(ch.label, 4, ch.y0 + 9);
        if (ch.key !== 'ecg') { ctx.fillStyle = COL.text; ctx.font = `500 9px ${MONO}`; ctx.textAlign = 'right'; ctx.fillText(String(Math.round(ch.hi)), padL - 4, Y(ch.hi) + 14); ctx.fillText('0', padL - 4, Y(0)); }
        // traces (sweep-erase: break at the wrap and leave a gap ahead of the sweep)
        const drawArr = (arr: Float32Array, col: string, lw: number, dash: number[]) => {
          ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.lineJoin = 'round'; ctx.beginPath(); let px = -1;
          for (let b = back; b >= 0; b--) { const i = at(S, b); const tt = S.t[i]; if (tNow - tt > W - 0.3) continue; const x = X(tt); const y = Y(arr[i]); if (px < 0 || x < px) ctx.moveTo(x, y); else ctx.lineTo(x, y); px = x; }
          ctx.stroke(); ctx.setLineDash([]);
        };
        if (ch.tr) drawArr(ch.tr, ch.trc, 1.2, [3, 3]);
        drawArr(ch.arr, ch.col, 1.7, []);
        // sweep head
        ctx.fillStyle = '#05070a'; ctx.fillRect(X(tNow) + 1, ch.y0, 6, ch.hgt);
      }
      // annotations for the latest complete beat
      if (ui.labels && useLabels.getState().mode !== 'off') annotate(ctx, S, tNow, W, narrow, X, chans[1].y0, chans[1].hgt, scale.art, chans[2].y0, chans[2].hgt, scale.cvp);
      // measuring cursor (frozen)
      if (frozenSrc.current && cursor.current != null) {
        const cx = cursor.current; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, h - 2); ctx.stroke(); ctx.setLineDash([]);
        // find the sample under the cursor
        let best = -1, bd = 1e9; for (let b = 0; b < back; b++) { const i = at(S, b); if (tNow - S.t[i] > W - 0.3) break; const d = Math.abs(X(S.t[i]) - cx); if (d < bd) { bd = d; best = i; } }
        if (best >= 0) { ctx.font = `600 11px ${MONO}`; ctx.textAlign = cx > padL + plotW - 110 ? 'right' : 'left'; const ox = ctx.textAlign === 'right' ? -6 : 6; ctx.fillStyle = COL.art; ctx.fillText(`${S.art[best].toFixed(0)} mmHg`, cx + ox, ys[1] + 10); ctx.fillStyle = COL.cvp; ctx.fillText(`${S.cvp[best].toFixed(1)} mmHg${S.insp[best] ? ' · insp' : ' · exp'}`, cx + ox, ys[2] + 10); }
      }
      // numerics column
      numerics(ctx, w - numW, top, numW, h - top, ys, hs, narrow);
      if (frozenSrc.current) { ctx.fillStyle = 'rgba(233,185,73,0.95)'; ctx.font = `600 10px ${MONO}`; ctx.textAlign = 'right'; ctx.fillText('FROZEN — drag to measure', padL + plotW, top + 8); }
    };
    raf = requestAnimationFrame(draw);
    const move = (e: PointerEvent) => { if (!frozenSrc.current) return; const r = c.getBoundingClientRect(); cursor.current = e.clientX - r.left; };
    c.addEventListener('pointermove', move); c.addEventListener('pointerdown', move);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); c.removeEventListener('pointermove', move); c.removeEventListener('pointerdown', move); };
  }, []);
  return <canvas ref={ref} className={`monitor${compact ? ' compact' : ''}`} style={{ height: height ?? 250 }} aria-label="Bedside monitor: ECG, arterial and central venous pressure" />;
}

function annotate(ctx: CanvasRenderingContext2D, S: Src, tNow: number, W: number, narrow: boolean, X: (t: number) => number, ya: number, ha: number, sa: number, yc: number, hc: number, sc: number) {
  const c = lines.circ; const valAt = (arr: Float32Array, t: number) => { const back = Math.round((tNow - t) * 250); if (back < 0 || back >= S.count) return null; return arr[at(S, back)]; };
  const YA = (v: number) => ya + ha - 3 - (v / sa) * (ha - 6); const YC = (v: number) => yc + hc - 3 - ((v + 5) / (sc + 5)) * (hc - 6);
  const tag = (x: number, y: number, text: string, col: string, up = true) => { ctx.font = `600 ${narrow ? 8.5 : 9.5}px ${MONO}`; ctx.textAlign = 'center'; const tw = ctx.measureText(text).width + 8; const yy = up ? y - 12 : y + 12; ctx.fillStyle = 'rgba(5,7,10,0.8)'; ctx.fillRect(x - tw / 2, yy - 7, tw, 13); ctx.fillStyle = col; ctx.fillText(text, x, yy); ctx.strokeStyle = col; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(x, up ? yy + 6 : yy - 6); ctx.lineTo(x, y); ctx.stroke(); ctx.globalAlpha = 1; };
  const beats = lines.beats.filter((b) => b.tq > tNow - W + 0.6 && b.tq < tNow - 0.9 && !b.pvc);
  const b = beats[beats.length - 1]; if (!b) return;
  // arterial: systolic peak, dicrotic notch, end-diastole — found on the displayed trace
  const d0 = b.tq + c.ptt + c.pep; let tPk = d0, vPk = -1e9; for (let t = d0; t < d0 + c.et; t += 0.004) { const v = valAt(S.art, t); if (v != null && v > vPk) { vPk = v; tPk = t; } }
  const tNotch0 = b.tq + c.pep + c.et + 0.012 + c.ptt; let tN = tNotch0, vN = 1e9; for (let t = tNotch0 - 0.03; t < tNotch0 + 0.06; t += 0.004) { const v = valAt(S.art, t); if (v != null && v < vN) { vN = v; tN = t; } }
  const vD = valAt(S.art, d0 - 0.01);
  if (vPk > -1e8 && !narrow) {
    tag(X(tPk), YA(vPk), 'systolic peak', '#ffb3b1');
    if (lines.circ.ar < 0.5 && lines.circ.incisura > 0.4) tag(X(tN) + 2, YA(vN), 'dicrotic notch', '#ffb3b1', false);
    if (vD != null) tag(X(d0 - 0.01), YA(vD), 'end-diastole', '#ffb3b1', false);
  }
  if (lines.cvp.fault === 'migrated') return;
  // CVP a c x v y (from the timing of this beat and its P wave)
  const es = c.pep + c.et; const pa = lines.atria.filter((a) => a.tp < b.tq && a.tp > b.tq - 0.5).pop();
  const pts: [string, number, boolean][] = [];
  if (pa && c.rhythm !== 'af') pts.push([pa.cannon ? 'cannon a' : 'a', pa.tp + 0.1, true]);
  if (c.trAmp > 3) pts.push(['c-v', b.tq + es * 0.65, true]); else { pts.push(['c', b.tq + 0.06, true]); pts.push(['x', b.tq + c.pep + 0.13, false]); pts.push(['v', b.tq + es + 0.03, true]); }
  if (c.yAmp > 0.8) pts.push(['y', b.tq + es + 0.16, false]);
  for (const [txt, t, up] of pts) { const v = valAt(S.cvp, t); if (v != null && tNow - t < W - 0.35) tag(X(t), YC(v), txt, '#b9e0ff', up); }
}

function numerics(ctx: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, ys: number[], hs: number[], narrow: boolean) {
  const n = lines.num; const big = narrow ? 20 : 30; const mid = narrow ? 13 : 17; const sm = narrow ? 9 : 10;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + h); ctx.stroke();
  const L = x0 + 8; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  // HR
  ctx.fillStyle = COL.ecg; ctx.font = `500 ${sm}px ${MONO}`; ctx.fillText('HR', L, ys[0] + 12); ctx.font = `600 ${big}px ${MONO}`; ctx.fillText(String(Math.round(n.hr)), L, ys[0] + 12 + big);
  // ART
  const artFlat = n.pp < 6 && n.map < 20;
  ctx.fillStyle = COL.art; ctx.font = `500 ${sm}px ${MONO}`; ctx.fillText('ART  mmHg', L, ys[1] + 12);
  ctx.font = `600 ${mid + 2}px ${MONO}`; ctx.fillText(artFlat ? '—/—' : `${Math.round(n.sys)}/${Math.round(n.dia)}`, L, ys[1] + 14 + mid + 2);
  ctx.font = `600 ${big}px ${MONO}`; ctx.fillText(`(${Math.round(n.map)})`, L, ys[1] + 18 + mid + big);
  if (!narrow || hs[1] > 90) { ctx.font = `500 ${sm}px ${MONO}`; ctx.fillStyle = 'rgba(255,160,160,0.85)'; const extra = lines.resp.mode === 'ppv' ? `PPV ${n.ppv == null ? '—' : Math.round(n.ppv)}%  SPV ${n.spv == null ? '—' : Math.round(n.spv)}` : `SPV ${n.spv == null ? '—' : Math.round(n.spv)}`; ctx.fillText(extra, L, ys[1] + 22 + mid + big + sm); }
  // CVP
  ctx.fillStyle = COL.cvp; ctx.font = `500 ${sm}px ${MONO}`; ctx.fillText('CVP  mean', L, ys[2] + 12); ctx.font = `600 ${big}px ${MONO}`; ctx.fillText(String(Math.round(n.cvp)), L, ys[2] + 12 + big);
  if (lines.nibp || lines.nibpDue > 0) { ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = `500 ${sm}px ${MONO}`; const nb = lines.nibp; const txt = lines.nibpDue > 0 ? 'NIBP measuring…' : nb ? `NIBP ${nb.s}/${nb.d} (${nb.m})` : ''; ctx.fillText(txt, L, ys[2] + hs[2] - 4); }
}
