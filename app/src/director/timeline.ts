/**
 * Lesson Director — timeline model (pure, no DOM). A lesson is a list of cues on a clock.
 * Determinism rule: a cue's `apply` must SET state (idempotent), never nudge it, and `tween(u)`
 * must be a pure function of u. Then the scene at time t is always `setup(); apply every cue with
 * at ≤ t in order; tween the active ones` — whether you played there, scrubbed there or jumped.
 */
export interface Cue {
  id: string;
  /** start time, seconds */ at: number;
  /** length of the cue's tween / hold window, seconds (0 = instant) */ dur?: number;
  /** narration shown as caption and spoken (pre-rendered clip id in `voice`, else speech synthesis) */ say?: string;
  voice?: string;
  title?: string;
  /** semantic camera target (see scene/cameraTargets.ts) */ target?: string;
  /** set the world into this cue's state (idempotent) */ apply?: () => void;
  /** continuous change across the cue, u ∈ [0,1] (pure in u) */ tween?: (u: number) => void;
  /** during playback, wait at the end of this cue until its narration has finished */ hold?: boolean;
}
export interface Timeline {
  id: string; title: string; level?: string; blurb?: string;
  cues: Cue[];
  /** reset the world to the lesson's starting state */ setup?: () => void;
  /** where the lesson lives (module id) so the shell can switch to it */ module?: string;
  /** every cue's `apply` fully defines the world (step lessons): seeking only needs the latest one */ absolute?: boolean;
}

export const cueEnd = (c: Cue) => c.at + (c.dur ?? 0);
export const duration = (tl: Timeline) => Math.max(0, ...tl.cues.map(cueEnd));
export const sorted = (tl: Timeline) => [...tl.cues].sort((a, b) => a.at - b.at);
/** steps = cues that carry narration or a title (what the player shows as chapters) */
export const steps = (tl: Timeline) => sorted(tl).filter((c) => c.say || c.title);
export function stepIndexAt(tl: Timeline, t: number) { const s = steps(tl); let k = -1; s.forEach((c, i) => { if (c.at <= t + 1e-9) k = i; }); return k; }
export function currentStep(tl: Timeline, t: number) { const k = stepIndexAt(tl, t); return k >= 0 ? steps(tl)[k] : null; }
/** the camera target in force at t (the latest cue at or before t that sets one) */
export function targetAt(tl: Timeline, t: number) { let id: string | null = null; for (const c of sorted(tl)) if (c.at <= t + 1e-9 && c.target) id = c.target; return id; }

/** Rebuild the world at time t from scratch (used by seek). */
export function resolve(tl: Timeline, t: number) {
  tl.setup?.();
  if (tl.absolute) { const past = sorted(tl).filter((c) => c.at <= t + 1e-9); const a = [...past].reverse().find((c) => c.apply); a?.apply?.(); past.forEach((c) => c.tween?.(c.dur ? Math.min(1, (t - c.at) / c.dur) : 1)); return; }
  for (const c of sorted(tl)) {
    if (c.at > t + 1e-9) break;
    c.apply?.();
    if (c.tween) c.tween(c.dur ? Math.min(1, (t - c.at) / c.dur) : 1);
  }
}
/** Advance from t0 to t1 during playback: apply cues that start in (t0, t1], tween those running. Returns the cues that started. */
export function advance(tl: Timeline, t0: number, t1: number) {
  const started: Cue[] = [];
  for (const c of sorted(tl)) {
    if (c.at > t0 + 1e-9 && c.at <= t1 + 1e-9) { c.apply?.(); started.push(c); }
    if (c.tween && c.at <= t1 + 1e-9 && cueEnd(c) >= t0 - 1e-9) c.tween(c.dur ? Math.min(1, Math.max(0, (t1 - c.at) / c.dur)) : 1);
  }
  return started;
}

/** Rough spoken length of a caption, seconds (≈150 wpm plus a breath). */
export const sayDuration = (text: string) => Math.max(3.5, text.trim().split(/\s+/).length / 2.5 + 1.2);

/** Build a step-by-step timeline from narrated steps (each step lasts as long as it takes to say). */
export function stepTimeline(id: string, title: string, items: { id: string; title?: string; say: string; voice?: string; target?: string; apply?: () => void; tween?: (u: number) => void; dur?: number }[], setup?: () => void): Timeline {
  let t = 0; const cues: Cue[] = [];
  for (const it of items) { const d = it.dur ?? sayDuration(it.say); cues.push({ ...it, at: t, dur: d, hold: true }); t += d + 0.6; }
  return { id, title, cues, setup, absolute: true };
}
