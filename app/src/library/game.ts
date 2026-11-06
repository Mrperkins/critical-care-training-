/**
 * Case HUD state. A case driver (a scene case, a ventilator alarm, a target round) describes what is on
 * screen — the brief, the action tray, the question tiles, goals and controls — and the HUD draws it over
 * the 3D scene. Scoring lives here so every case plays by the same rules:
 *  - a right answer scores 100, plus up to 100 for answering quickly (the bonus fades over 30 s);
 *  - a streak counts right answers in a row across cases; a wrong answer or a harmful action resets it;
 *  - "patient" is a stability meter: it slips while an alarm goes unanswered and with harmful choices, and
 *    recovers when the problem is fixed (it is a game meter, not a physiological value);
 *  - practice mode hides the clock, points and the meter, and nothing slips.
 * Stars: all decisions right inside par time = 3, all right = 2, at least half right = 1.
 */
import type { ReactNode } from 'react';
import { create } from 'zustand';
import { usePlayerUI, type Chip, type Trace } from './playerUI';

export interface Tile { label: string; sub?: string; icon?: string }
export interface HudQuestion { key: string; q: string; tiles: Tile[]; answer: number; explain: string; picked: number | null; shownAt: number }
export interface HudAction { id: string; label: string; sub?: string; icon?: string; primary?: boolean; disabled?: boolean }
export interface HudControl { key: string; label: string; value: string; dec: () => void; inc: () => void }
export interface HudTool { label: string; icon?: string; onClick: () => void; primary?: boolean }
export interface DebriefLine { q: string; ok: boolean; yours?: string; best?: string; explain: string }
export interface Debrief { ok: boolean; right: number; total: number; ms: number; stars: number; prevBest?: number; tip?: string; lines?: DebriefLine[]; extra?: ReactNode; verdict?: string }

interface GameState {
  id: string | null; title: string; level?: string;
  startedAt: number; endedAt: number | null;
  score: number; streak: number; bestStreak: number; patient: number; decaying: boolean;
  banner: { tone: 'alarm' | 'info' | 'ok'; text: string } | null;
  chips: Chip[];
  card: { kicker?: string; title: string; text?: string; items?: [string, string][]; cta?: { label: string; onClick: () => void }; secondary?: { label: string; onClick: () => void }; compact?: boolean } | null;
  actions: HudAction[] | null; onAction?: (id: string) => void;
  toast: { ok: boolean | null; text: string; at: number } | null;
  question: HudQuestion | null; onAnswer?: (i: number) => void; onContinue?: () => void; continueLabel?: string;
  goals: { label: string; ok: boolean }[] | null; controls: HudControl[] | null; tools: HudTool[] | null;
  meter: { label: string; value: number; target: number; ok: boolean; note?: string } | null;
  debrief: Debrief | null; onReplay?: () => void; replayLabel?: string; onNext?: () => void; nextLabel?: string;
  onExit?: () => void; exitLabel?: string;
  /** on a phone there is room for one or two waveforms under the HUD: the ones this case is about */
  traces: Trace[] | null;
  set: (p: Partial<GameState>) => void;
}
const BLANK = { traces: null as Trace[] | null, banner: null, chips: [], card: null, actions: null, onAction: undefined, toast: null, question: null, onAnswer: undefined, onContinue: undefined, continueLabel: undefined, goals: null, controls: null, tools: null, meter: null, debrief: null, onReplay: undefined, replayLabel: undefined, onNext: undefined, nextLabel: undefined };
const BEST = 'ccp.game.best.v1';
const loadStreak = () => { try { return Number(globalThis.localStorage?.getItem('ccp.game.streak') ?? 0) || 0; } catch { return 0; } };
export const useGame = create<GameState>((set) => ({
  id: null, title: '', startedAt: 0, endedAt: null, score: 0, streak: loadStreak(), bestStreak: 0, patient: 1, decaying: false, ...BLANK,
  set: (p) => set(p),
}));
const saveStreak = (n: number) => { try { globalThis.localStorage?.setItem('ccp.game.streak', String(n)); } catch { /* storage unavailable */ } };

export function startGame(id: string, title: string, extra: Partial<GameState> = {}) {
  const streak = useGame.getState().streak;
  useGame.setState({ id, title, startedAt: Date.now(), endedAt: null, score: 0, bestStreak: streak, patient: 1, decaying: false, ...BLANK, ...extra });
}
export function endGame() { if (useGame.getState().id) useGame.setState({ id: null, ...BLANK, decaying: false }); }
export const practice = () => usePlayerUI.getState().practice;

/** A decision was made: score it, move the streak and the patient. Returns the points awarded. */
export function scoreDecision(ok: boolean, shownAt: number) {
  const g = useGame.getState();
  if (!ok) { saveStreak(0); g.set({ streak: 0, patient: practice() ? g.patient : Math.max(0.1, g.patient - 0.2) }); return 0; }
  const secs = (Date.now() - shownAt) / 1000; const pts = 100 + Math.round(100 * Math.max(0, 1 - secs / 30));
  const streak = g.streak + 1; saveStreak(streak);
  g.set({ score: g.score + pts, streak, bestStreak: Math.max(g.bestStreak, streak) });
  return pts;
}
/** A harmful move: the patient slips and the streak breaks. A neutral move costs nothing but time. */
export function harm(amount = 0.15) { const g = useGame.getState(); if (practice()) return; saveStreak(0); g.set({ streak: 0, patient: Math.max(0.1, g.patient - amount) }); }
export function bonus(pts: number) { const g = useGame.getState(); g.set({ score: g.score + pts }); }
export function toast(ok: boolean | null, text: string) { useGame.getState().set({ toast: { ok, text, at: Date.now() } }); }

export function starsFor(right: number, total: number, ms: number, parMs: number) {
  if (total === 0) return 0;
  if (right === total) return ms <= parMs ? 3 : 2;
  return right * 2 >= total ? 1 : 0;
}
/** Finish: work out the stars, keep the best result for this case, and show the debrief. */
export function finishGame(d: Omit<Debrief, 'prevBest'>, next?: { onNext?: () => void; nextLabel?: string; onReplay?: () => void; replayLabel?: string }) {
  const g = useGame.getState(); if (!g.id) return;
  let best: Record<string, { stars: number; score: number; ms: number }> = {};
  try { best = JSON.parse(globalThis.localStorage?.getItem(BEST) ?? '{}'); } catch { /* none */ }
  const prev = best[g.id];
  if (!prev || d.stars > prev.stars || (d.stars === prev.stars && g.score > prev.score)) { best[g.id] = { stars: d.stars, score: g.score, ms: d.ms }; try { globalThis.localStorage?.setItem(BEST, JSON.stringify(best)); } catch { /* full */ } }
  g.set({ ...BLANK, decaying: false, endedAt: Date.now(), patient: d.ok ? 1 : g.patient, debrief: { ...d, prevBest: prev?.stars }, ...next });
}
export const fmtClock = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
/** A stable shuffle so options don't always put the answer first, but the same case always looks the same. */
export const order = (n: number, seed: string) => { let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
