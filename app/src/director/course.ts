/**
 * Courses: every lesson is offered two ways.
 *
 *  - Full course — every scene, with learning objectives, pause-and-predict checkpoints, pearls,
 *    pitfalls and a short self-check at the end.
 *  - TL;DR — the 80/20 cut: only the scenes that carry most of the clinical weight, then the handful
 *    of points worth remembering if you remember nothing else.
 *
 * The TL;DR is built from the same cues (same narration clips), so nothing is re-recorded. Because
 * dropping cues would break lessons whose state accumulates cue by cue, each kept scene rebuilds the
 * world exactly as the full lesson has it at that moment (`resolve`), which keeps seeking exact.
 */
import { cueEnd, resolve, sorted, steps, duration, sayDuration, type Cue, type Timeline } from './timeline';

export type Track = 'full' | 'tldr';
export interface SelfCheck { q: string; options: string[]; answer: number; why: string }
export interface CourseMeta {
  /** what the learner can do after the full course */ objectives: string[];
  /** ids of the scenes that make up the TL;DR, in lesson order */ essentials: string[];
  /** the 80/20 takeaways: shown with the TL;DR and as the full course recap */ keyPoints: string[];
  pearls?: string[];
  pitfalls?: string[];
  /** the one thing to do differently at the bedside */ bedside?: string;
  /** extra pause-and-predict prompts for the full course, keyed by scene id */ checkpoints?: Record<string, { prompt: string; answer: string }>;
  selfCheck?: SelfCheck[];
}

const authored: Record<string, CourseMeta> = {};
const resolvers: ((tl: Timeline) => CourseMeta | null)[] = [];
/** register hand-written course content (by lesson id) */
export function registerCourses(c: Record<string, CourseMeta>) { Object.assign(authored, c); }
/** register a way to derive a course from a lesson's own data (disease explainers, drug mechanisms) */
export function registerCourseResolver(r: (tl: Timeline) => CourseMeta | null) { resolvers.push(r); }
export function courseFor(tl: Timeline): CourseMeta | null {
  const a = authored[tl.id]; if (a) return a;
  for (const r of resolvers) { const m = r(tl); if (m) return m; }
  return generic(tl);
}
export const hasAuthoredCourse = (id: string) => !!authored[id];

/** last resort for a lesson nobody has written a course for yet: opening, checkpoints and the close */
function generic(tl: Timeline): CourseMeta | null {
  const s = steps(tl); if (s.length < 3) return null;
  const keep = new Set<string>([s[0].id, s[s.length - 1].id]); s.filter((c) => c.checkpoint).forEach((c) => keep.add(c.id));
  if (keep.size < 3) keep.add(s[Math.floor(s.length / 2)].id);
  return { objectives: [], essentials: s.filter((c) => keep.has(c.id)).map((c) => c.id), keyPoints: s.filter((c) => keep.has(c.id) && c.title).map((c) => c.title!) };
}

const GAP = 0.6;
/** The timeline a track actually plays. Ids are kept so progress, bookmarks and narration still match. */
export function courseTimeline(tl: Timeline, track: Track, meta: CourseMeta | null): Timeline {
  if (!meta) return tl;
  if (track === 'full') {
    const cp = meta.checkpoints ?? {};
    return { ...tl, cues: tl.cues.map((c) => (cp[c.id] && !c.checkpoint ? { ...c, checkpoint: cp[c.id] } : c)) };
  }
  const all = sorted(tl); const want = new Set(meta.essentials);
  const picked = steps(tl).filter((c) => want.has(c.id)); if (!picked.length) return tl;
  const nextStepAt = (c: Cue) => { const s = steps(tl); const i = s.indexOf(c); return i >= 0 && i < s.length - 1 ? s[i + 1].at : duration(tl); };
  let t = 0; const cues: Cue[] = [];
  for (const c of picked) {
    // a kept scene runs until the next scene would have started, so silent cues inside it (a tween, a reveal) still play
    const from = c.at; const span = Math.max(cueEnd(c) - from, nextStepAt(c) - GAP - from, 1);
    // the scene itself: rebuild the world as the full lesson has it here, then let its own tween run
    cues.push({ ...c, at: t, hold: c.hold ?? !!c.say, apply: () => resolve(tl, from) });
    // silent cues inside the scene keep their relative timing (a reveal, a dose ramp); each one also rebuilds
    // its own starting world, so the TL;DR stays exact under seeking (`absolute`) and nothing is resolved per frame
    for (const x of all) if (x !== c && x.at > from + 1e-9 && x.at < from + span - 1e-9) cues.push({ ...x, at: t + (x.at - from), apply: () => resolve(tl, x.at) });
    t += span + GAP;
  }
  return { ...tl, cues, absolute: true, setup: () => resolve(tl, picked[0].at) };
}

/** minutes as the learner will experience them: narrated scenes hold until the narrator finishes, so a scene lasts
 * at least as long as its line takes to say */
export function minutes(tl: Timeline) {
  const extra = steps(tl).reduce((s, c) => s + (c.say && c.hold !== false ? Math.max(0, sayDuration(c.say) - (c.dur ?? 0)) : 0), 0);
  return Math.max(1, Math.round((duration(tl) + extra) / 60));
}
export function trackSummary(tl: Timeline, meta: CourseMeta | null) {
  const full = courseTimeline(tl, 'full', meta); const tldr = courseTimeline(tl, 'tldr', meta);
  return {
    // the full course also has things to do: checkpoints (~20 s), the recap (~30 s), each self-check question (~30 s)
    full: { min: Math.max(1, Math.round(minutes(full) + (steps(full).filter((c) => c.checkpoint).length * 20 + (meta ? 30 : 0) + (meta?.selfCheck?.length ?? 0) * 30) / 60)), scenes: steps(full).length, checkpoints: steps(full).filter((c) => c.checkpoint).length, quiz: meta?.selfCheck?.length ?? 0 },
    tldr: { min: minutes(tldr), scenes: steps(tldr).length, points: meta?.keyPoints.length ?? 0 },
  };
}
