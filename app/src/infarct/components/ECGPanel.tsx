import { useEffect, useRef } from 'react';
import { useApp } from '../engine/store';
import { clock } from '../engine/clock';
import { sample, stDeviationMm, jPointMm, tWaveMm, RR, HR } from '../ecg/ecgModel';
import type { ECGPattern } from '../data/types';
import { RHYTHM, eventsBetween, voltageFrom, ventricularRate, type Events } from '../engine/rhythm';
import { asEquivalent } from '../data/focus';
import { STANDARD_GRID, EXTRA_LEADS, LEAD } from '../data/leads';
import { TERRITORY } from '../data/territories';
import { FOCUS } from '../data/focus';
import { QUIZ_CASES } from '../data/lessons';
import type { LeadId } from '../data/types';
import { selectLead } from './HeartScene';

/** Limb leads left, chest leads right (6 × 2): used when the ECG column is too narrow for 3 × 4 at a readable scale. */
export const NARROW_GRID: LeadId[][] = [['I', 'V1'], ['II', 'V2'], ['III', 'V3'], ['aVR', 'V4'], ['aVL', 'V5'], ['aVF', 'V6']];
/** below this many pixels per millimetre of paper, 1 mm of ST elevation is too small to see: switch to 6 × 2 */
export const MIN_PX_PER_MM = 2.4;
export const NATURAL_QUERY = '(max-width: 1024px)';

export interface ECGCell { id: LeadId; x: number; y: number; w: number; h: number; secs: number }
export interface ECGLayout { narrow: boolean; mm: number; rowH: number; rows: number; height: number; cells: ECGCell[]; extraTop: number }

/**
 * Paper layout for a W × H box at 25 mm/s and 10 mm/mV. Prefers the conventional 3 × 4 + rhythm strip; falls back to
 * 6 × 2 when the box is narrow. Rows share the height (between 14 and 24 mm of paper each); if they cannot fit, the
 * layout grows taller than the box and the panel scrolls rather than squashing the complexes.
 */
export function ecgLayout(W: number, H: number, showExtra: boolean): ECGLayout {
  const narrow = W / (4 * 2.5 * 25) < MIN_PX_PER_MM;
  const grid = narrow ? NARROW_GRID : STANDARD_GRID; const cols = grid[0].length;
  const mm = W / (cols * 2.5 * 25);
  const extraRows = showExtra ? (narrow ? 3 : 1) : 0;
  const rows = grid.length + 1 + extraRows;
  const rowH = Math.max(Math.min(mm * 24, H / rows), Math.max(mm * 14, 48));
  const cells: ECGCell[] = [];
  grid.forEach((row, ri) => row.forEach((id, ci) => cells.push({ id, x: (ci * W) / cols, y: ri * rowH, w: W / cols, h: rowH, secs: 2.5 })));
  const gr = grid.length;
  cells.push({ id: 'II', x: 0, y: gr * rowH, w: W, h: rowH, secs: narrow ? 5 : 10 });
  if (showExtra) {
    if (narrow) EXTRA_LEADS.forEach((id, i) => cells.push({ id, x: (i % 2) * W / 2, y: (gr + 1 + Math.floor(i / 2)) * rowH, w: W / 2, h: rowH, secs: 2.5 }));
    else EXTRA_LEADS.forEach((id, i) => cells.push({ id, x: (i * W) / 5, y: (gr + 1) * rowH, w: W / 5, h: rowH, secs: 2 }));
  }
  return { narrow, mm, rowH, rows, height: rows * rowH, cells, extraTop: (gr + 1) * rowH };
}

/**
 * The measurement printed on a highlighted lead: ST at J+60 ms for STEMI patterns; the J point for de Winter (that is
 * where it is defined); the T wave for Wellens (deepest point for type B, the terminal negative limb for type A).
 */
export function leadMetric(id: LeadId, p: ECGPattern, morph: number, rep: number): [string, number] {
  if (p.jDep) return ['J', jPointMm(id, p, morph)];
  if (p.tWave && p.tWave.shape !== 'tall') { const t = tWaveMm(id, p, morph); return ['T', Math.abs(t.min) > Math.abs(t.max) || p.tWave.shape === 'inverted' ? t.min : t.max]; }
  return ['ST', stDeviationMm(id, p, morph, rep)];
}

/** Plain-language stage of the evolving ECG, shown under the paper. */
export function ecgStage(morph: number, reperfusion: number, narrow = false) {
  if (reperfusion > 0.5 && morph > 0.5) return narrow ? 'Reperfused' : 'Reperfused: ST resolving, T inversion, Q waves remain';
  if (morph < 0.05) return 'Normal ECG';
  if (morph < 0.4) return 'Hyperacute T waves';
  if (morph < 0.8) return 'Acute ST elevation';
  return narrow ? 'Evolving STEMI' : 'Evolving STEMI (Q waves forming)';
}

/** 12-lead ECG on paper plus posterior and right-sided leads, swept on the same clock as the beating heart. */
export function ECGPanel() {
  const box = useRef<HTMLDivElement>(null!);
  const cv = useRef<HTMLCanvasElement>(null!);
  const cells = useRef<ECGCell[]>([]);
  const morph = useRef(0); const rep = useRef(0);
  const extraOpen = useApp((s) => s.scene.showExtraLeads || s.showExtra);
  const stageRef = useRef<HTMLSpanElement>(null!); const rateRef = useRef<HTMLSpanElement>(null!);
  /** touch layouts stack the ECG under the heart: natural paper height (the page scrolls) instead of filling a box */
  const natural = useRef(false);
  useEffect(() => { const mq = window.matchMedia(NATURAL_QUERY); const f = () => { natural.current = mq.matches; }; f(); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f); }, []);

  useEffect(() => {
    let raf = 0; let last = performance.now();
    const draw = (frameNow: number) => {
      raf = requestAnimationFrame(draw);
      const dtf = Math.max(0, Math.min(0.25, (frameNow - last) / 1000)); last = frameNow;
      const c = cv.current, b = box.current; if (!c || !b || b.offsetParent === null) return;
      const st = useApp.getState();
      const W = b.clientWidth, H = natural.current ? Infinity : b.clientHeight; if (W < 40 || H < 40) return;
      const quizCase = st.mode === 'quiz' ? QUIZ_CASES[st.quiz.caseIndex] : null;
      const tid = quizCase ? quizCase.territoryId : st.territoryId;
      const T = tid ? FOCUS[tid] ?? TERRITORY[tid] ?? null : null;
      const target = quizCase ? (st.quiz.revealed ? st.scene.ecgMorph : 0.82) : st.scene.ecgMorph;
      const k = 1 - Math.exp(-6 * dtf); // ~0.5 s to settle
      morph.current += (target - morph.current) * k;
      rep.current += ((st.scene.reperfusion ?? 0) - rep.current) * k;
      const m = T ? morph.current : 0;
      const hideAnswers = !!quizCase && !st.quiz.revealed;
      const affected = new Set<LeadId>(T && st.scene.emphasizeAffected && !hideAnswers ? T.affectedLeads : []);
      const recip = new Set<LeadId>(T && st.scene.emphasizeReciprocal && !hideAnswers ? T.reciprocalLeads : []);
      const showExtra = st.scene.showExtraLeads || st.showExtra;

      const L = ecgLayout(W, H, showExtra); const { mm } = L; const Hc = Number.isFinite(H) ? Math.max(H, Math.ceil(L.height)) : Math.ceil(L.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c.width !== Math.round(W * dpr) || c.height !== Math.round(Hc * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(Hc * dpr); c.style.width = `${W}px`; c.style.height = `${Hc}px`; }
      const ctx = c.getContext('2d'); if (!ctx) return; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#f7f1e8'; ctx.fillRect(0, 0, W, Hc);
      ctx.lineWidth = 1;
      for (let x = 0, i = 0; x < W; x += mm, i++) { ctx.strokeStyle = i % 5 ? 'rgba(221,141,122,0.16)' : 'rgba(205,104,86,0.34)'; ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, Hc); ctx.stroke(); }
      for (let y = 0, i = 0; y < Hc; y += mm, i++) { ctx.strokeStyle = i % 5 ? 'rgba(221,141,122,0.16)' : 'rgba(205,104,86,0.34)'; ctx.beginPath(); ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); ctx.stroke(); }
      cells.current = L.cells;

      const now = clock.time; const R = RHYTHM[st.rhythm] ?? RHYTHM.sinus; const evCache = new Map<string, Events>();
      if (rateRef.current) { const lbl = R.id === 'sinus' ? `${ventricularRate(R)}/min` : `${ventricularRate(R)}/min · ${R.short}`; if (rateRef.current.textContent !== lbl) rateRef.current.textContent = lbl; }
      const font = (w: number, px: number, mono = true) => `${w} ${px}px ${mono ? '"Atkinson Hyperlegible Mono", ui-monospace, monospace' : '"Atkinson Hyperlegible Next", system-ui, sans-serif'}`;
      for (const cell of L.cells) {
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
        const evKey = `${win}:${cell.secs}`; let ev = evCache.get(evKey); if (!ev) { ev = eventsBetween(R, win - cell.secs - 1, win + cell.secs + 0.3); evCache.set(evKey, ev); }
        for (let x = 0; x <= cell.w; x += 1) {
          if (Math.abs(x - cursor) < 10 && x > cursor) { pen = false; continue; }
          let t = win + x / pxPerS; if (t > now) t -= cell.secs;
          const v = voltageFrom(ev, cell.id, t, T?.ecgPattern ?? null, m, rep.current);
          const y = base - v * pxPerMv;
          if (!pen) { ctx.moveTo(cell.x + x, y); pen = true; } else ctx.lineTo(cell.x + x, y);
        }
        ctx.stroke(); ctx.restore();
        const lab = Math.max(11, Math.min(15, mm * 3.2));
        ctx.font = font(700, lab); ctx.fillStyle = isA ? '#a3240f' : isR ? '#23498c' : '#3a3632'; ctx.fillText(LEAD[cell.id].label, cell.x + 6, cell.y + lab + 3);
        if ((isA || isR) && T && cell.secs < 5) {
          const [tag, d] = leadMetric(cell.id, T.ecgPattern, m, rep.current);
          ctx.font = font(500, Math.max(10, Math.min(13, mm * 2.7)));
          const full = `${tag} ${d >= 0 ? '↑' : '↓'}${Math.abs(d).toFixed(1)} mm`, short = `${d >= 0 ? '↑' : '↓'}${Math.abs(d).toFixed(1)}`;
          const lw = ctx.measureText(LEAD[cell.id].label + '  ').width + 10;
          const txt = cell.w - lw > ctx.measureText(full).width + 12 ? full : cell.w - lw > ctx.measureText(short).width + 8 ? short : '';
          if (txt) { ctx.textAlign = 'right'; ctx.fillText(txt, cell.x + cell.w - 6, cell.y + lab + 3); ctx.textAlign = 'left'; }
        }
        if (cell.secs < 5 && cell.x > 0) { ctx.strokeStyle = 'rgba(60,40,30,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cell.x + 0.5, cell.y + 4); ctx.lineTo(cell.x + 0.5, cell.y + cell.h - 4); ctx.stroke(); }
      }
      if (showExtra) { ctx.strokeStyle = 'rgba(60,40,30,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, L.extraTop + 0.5); ctx.lineTo(W, L.extraTop + 0.5); ctx.stroke(); }
      if (stageRef.current) { const eq = asEquivalent(T); const lbl = T && !hideAnswers ? (eq && m > 0.35 ? `${eq.short} pattern` : ecgStage(m, rep.current, L.narrow)) : quizCase ? 'Unknown ECG — read it' : 'Normal ECG'; if (stageRef.current.textContent !== lbl) stageRef.current.textContent = lbl; }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onClick = (e: React.MouseEvent) => {
    const r = cv.current.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = cells.current.find((c) => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h && c.secs < 5);
    if (hit) { selectLead(hit.id); if (window.matchMedia('(max-width: 760px)').matches) document.querySelector('.mi-heart')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };
  return (
    <section className="mi-ecg" aria-label="12-lead ECG">
      <div className="mi-ecg-paper" ref={box}>
        <canvas ref={cv} onClick={onClick} role="img" aria-label="Live 12-lead ECG, swept in time with the 3D heart. Click a lead to look at the heart from that lead." />
      </div>
      <footer className="mi-ecg-foot">
        <span className="mi-ecg-scale">25 mm/s · 10 mm/mV · <span ref={rateRef}>{HR}/min</span></span>
        <span className="mi-ecg-stage" ref={stageRef} aria-live="polite">Normal ECG</span>
        <button type="button" className={`tgl${extraOpen ? ' on' : ''}`} aria-pressed={extraOpen} onClick={() => useApp.getState().set({ showExtra: !useApp.getState().showExtra })}>V7–V9 · V3R–V4R</button>
      </footer>
    </section>
  );
}
