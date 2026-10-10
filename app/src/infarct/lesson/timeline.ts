/**
 * Deterministic lesson timeline (same model as the main app's Lesson Director, kept local so the two
 * apps stay independently buildable). Each cue SETS state; the world at time t = setup + every cue
 * with at ≤ t applied in order. Narration is best-effort and never gates the clock.
 */
export interface Cue { id: string; at: number; dur: number; title: string; say: string; apply: () => void }
export interface Timeline { id: string; title: string; blurb: string; cues: Cue[]; setup: () => void }
export const duration = (tl: Timeline) => Math.max(...tl.cues.map((c) => c.at + c.dur));
export function resolve(tl: Timeline, t: number) { tl.setup(); for (const c of [...tl.cues].sort((a, b) => a.at - b.at)) { if (c.at > t + 1e-9) break; c.apply(); } }
export function stepAt(tl: Timeline, t: number) { let k = 0; tl.cues.forEach((c, i) => { if (c.at <= t + 1e-9) k = i; }); return k; }
