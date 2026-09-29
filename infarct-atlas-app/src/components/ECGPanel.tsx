import { useEffect, useRef } from 'react';
import { useApp } from '../engine/store';
import { clock } from '../engine/clock';
import { sample, stDeviationMm, RR } from '../ecg/ecgModel';
import { STANDARD_GRID, EXTRA_LEADS, LEAD } from '../data/leads';
import { TERRITORY } from '../data/territories';
import { QUIZ_CASES } from '../data/lessons';
import type { LeadId } from '../data/types';
import { selectLead } from './HeartScene';

/** Portrait phones: limb leads left, chest leads right (6 × 2). */
const NARROW_GRID: LeadId[][] = [['I', 'V1'], ['II', 'V2'], ['III', 'V3'], ['aVR', 'V4'], ['aVL', 'V5'], ['aVF', 'V6']];

interface Cell { id: LeadId; x: number; y: number; w: number; h: number; secs: number }

/** 12-lead ECG on paper (25 mm/s, 10 mm/mV) plus posterior and right-sided leads, swept in sync with the heart. */
export function ECGPanel() {
  const cv = useRef<HTMLCanvasElement>(null!);
  const cells = useRef<Cell[]>([]);
  const morph = useRef(0);
  const extraOpen = useApp((s) => s.scene.showExtraLeads || s.showExtra);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const c = cv.current; if (!c || c.offsetParent === null) return;
      const st = useApp.getState();
      const r = c.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c.width !== Math.round(r.width * dpr) || c.height !== Math.round(r.height * dpr)) { c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); }
      const ctx = c.getContext('2d')!; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = r.width, H = r.height;
      const quizCase = st.mode === 'quiz' ? QUIZ_CASES[st.quiz.caseIndex] : null;
      const tid = quizCase ? quizCase.territoryId : st.territoryId;
      const T = tid ? TERRITORY[tid] : null;
      const target = quizCase ? (st.quiz.revealed ? st.scene.ecgMorph : 0.82) : st.scene.ecgMorph;
      morph.current += (target - morph.current) * (1 - Math.exp(-0.05 * 16));
      const m = T ? morph.current : 0;
      const hideAnswers = !!quizCase && !st.quiz.revealed;
      const affected = new Set<LeadId>(T && st.scene.emphasizeAffected && !hideAnswers ? T.affectedLeads : []);
      const recip = new Set<LeadId>(T && st.scene.emphasizeReciprocal && !hideAnswers ? T.reciprocalLeads : []);
      const showExtra = st.scene.showExtraLeads || st.showExtra;

      // layout
      const narrow = W < 560;
      const grid = narrow ? NARROW_GRID : STANDARD_GRID; const cols = grid[0].length; const mm = W / (cols * 2.5 * 25);
      const rowH = Math.max(mm * 24, narrow ? 66 : 70);
      const extraRows = showExtra ? (narrow ? 3 : 1) : 0;
      const rows = grid.length + 1 + extraRows;
      const needH = rowH * rows + 26;
      if (Math.abs(H - needH) > 2) { c.style.height = `${needH}px`; }
      ctx.fillStyle = '#f7f1e8'; ctx.fillRect(0, 0, W, H);
      // paper grid
      ctx.lineWidth = 1;
      for (let x = 0, i = 0; x < W; x += mm, i++) { ctx.strokeStyle = i % 5 ? 'rgba(221,141,122,0.16)' : 'rgba(205,104,86,0.34)'; ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); ctx.stroke(); }
      for (let y = 0, i = 0; y < H; y += mm, i++) { ctx.strokeStyle = i % 5 ? 'rgba(221,141,122,0.16)' : 'rgba(205,104,86,0.34)'; ctx.beginPath(); ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); ctx.stroke(); }

      const list: Cell[] = [];
      grid.forEach((row, ri) => row.forEach((id, ci) => list.push({ id, x: (ci * W) / cols, y: ri * rowH, w: W / cols, h: rowH, secs: 2.5 })));
      const gr = grid.length;
      list.push({ id: 'II', x: 0, y: gr * rowH, w: W, h: rowH, secs: narrow ? 5 : 10 });
      if (showExtra) {
        if (narrow) (['V7', 'V8', 'V9', 'V3R', 'V4R'] as LeadId[]).forEach((id, i) => list.push({ id, x: (i % 2) * W / 2, y: (gr + 1 + Math.floor(i / 2)) * rowH, w: W / 2, h: rowH, secs: 2.5 }));
        else EXTRA_LEADS.forEach((id, i) => list.push({ id, x: (i * W) / 5, y: (gr + 1) * rowH, w: W / 5, h: rowH, secs: 2.0 }));
      }
      cells.current = list;

      const now = clock.time;
      for (const cell of list) {
        const isA = affected.has(cell.id), isR = recip.has(cell.id), sel = st.leadId === cell.id && cell.secs < 5;
        if (isA || isR) { ctx.fillStyle = isA ? 'rgba(214,72,52,0.10)' : 'rgba(60,110,190,0.10)'; ctx.fillRect(cell.x + 1, cell.y + 1, cell.w - 2, cell.h - 2); }
        if (sel) { ctx.strokeStyle = '#2a7f95'; ctx.lineWidth = 2; ctx.strokeRect(cell.x + 2, cell.y + 2, cell.w - 4, cell.h - 4); }
        const base = cell.y + cell.h * 0.58; const pxPerMv = mm * 10; const pxPerS = cell.w / cell.secs;
        const win = Math.floor(now / cell.secs) * cell.secs; const cursor = (now - win) * pxPerS;
        const dim = (affected.size || recip.size) && !isA && !isR;
        ctx.strokeStyle = isA ? '#8e1d10' : isR ? '#1d3f7a' : dim ? 'rgba(30,28,26,0.55)' : '#1d1b19';
        ctx.lineWidth = isA || isR ? 1.9 : 1.25; ctx.lineJoin = 'round';
        ctx.save(); ctx.beginPath(); ctx.rect(cell.x, cell.y, cell.w, cell.h); ctx.clip();
        ctx.beginPath(); let pen = false;
        for (let x = 0; x <= cell.w; x += 1) {
          if (Math.abs(x - cursor) < 10 && x > cursor) { pen = false; continue; }
          let t = win + x / pxPerS; if (t > now) t -= cell.secs;
          const tb = ((t % RR) + RR) % RR;
          const v = sample(cell.id, tb, T?.ecgPattern ?? null, m);
          const y = base - v * pxPerMv;
          if (!pen) { ctx.moveTo(cell.x + x, y); pen = true; } else ctx.lineTo(cell.x + x, y);
        }
        ctx.stroke(); ctx.restore();
        // label + measurement
        ctx.font = `600 ${Math.max(11, mm * 3.2)}px "IBM Plex Mono", ui-monospace, monospace`;
        ctx.fillStyle = isA ? '#a3240f' : isR ? '#23498c' : '#3a3632'; ctx.fillText(LEAD[cell.id].label, cell.x + 6, cell.y + Math.max(13, mm * 3.6));
        if ((isA || isR) && T && cell.secs < 5) {
          const d = stDeviationMm(cell.id, T.ecgPattern, m);
          ctx.font = `500 ${Math.max(10, mm * 2.7)}px "IBM Plex Mono", ui-monospace, monospace`;
          const full = `ST ${d >= 0 ? '↑' : '↓'}${Math.abs(d).toFixed(1)} mm`, short = `${d >= 0 ? '↑' : '↓'}${Math.abs(d).toFixed(1)}`;
          const lw = ctx.measureText(LEAD[cell.id].label + '  ').width + 10;
          const txt = cell.w - lw > ctx.measureText(full).width + 12 ? full : cell.w - lw > ctx.measureText(short).width + 8 ? short : '';
          if (txt) { ctx.textAlign = 'right'; ctx.fillText(txt, cell.x + cell.w - 6, cell.y + Math.max(13, mm * 3.6)); ctx.textAlign = 'left'; }
        }
        if (cell.secs < 5 && cell.x > 0) { ctx.strokeStyle = 'rgba(60,40,30,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cell.x + 0.5, cell.y + 4); ctx.lineTo(cell.x + 0.5, cell.y + cell.h - 4); ctx.stroke(); }
      }
      if (showExtra) { ctx.font = `500 ${Math.max(10, mm * 2.6)}px "IBM Plex Sans", system-ui, sans-serif`; ctx.fillStyle = '#6d5f55'; ctx.fillText('Posterior (V7–V9) and right-sided (V3R–V4R) leads', 6, (grid.length + 1) * rowH - 4); }
      ctx.font = `500 ${Math.max(10, mm * 2.6)}px "IBM Plex Mono", ui-monospace, monospace`; ctx.fillStyle = '#6d5f55';
      ctx.fillText(narrow ? '25 mm/s · 10 mm/mV' : '25 mm/s · 10 mm/mV · HR 72', 6, rows * rowH + 17);
      if (T && !hideAnswers) { const lbl = m < 0.05 ? 'Normal ECG' : m < 0.4 ? 'Hyperacute phase' : m < 0.8 ? 'Acute ST elevation' : narrow ? 'Evolving STEMI' : 'Evolving STEMI (Q waves forming)'; ctx.textAlign = 'right'; ctx.fillText(lbl, W - 8, rows * rowH + 17); ctx.textAlign = 'left'; }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const onClick = (e: React.MouseEvent) => {
    const r = cv.current.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = cells.current.find((c) => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h && c.secs < 5);
    if (hit) { selectLead(hit.id); if (window.matchMedia('(max-width: 640px)').matches) document.querySelector('.heart-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };
  return (
    <div className="ecg-wrap">
      <canvas ref={cv} className="ecg-canvas" onClick={onClick} aria-label="12-lead ECG. Click a lead to see where it looks at the heart." />
      <button className="ecg-extra" onClick={() => useApp.getState().set({ showExtra: !useApp.getState().showExtra })}>{extraOpen ? 'Hide' : 'Show'} posterior &amp; right-sided leads</button>
    </div>
  );
}
