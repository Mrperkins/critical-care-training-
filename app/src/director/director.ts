/**
 * Lesson Director — the clock. One rAF loop; time only moves forward by the frame delta × rate.
 * No setTimeout chains: holds for narration are a flag the clock respects, not timers.
 */
import { create } from 'zustand';
import { voice } from '../app/voice';
import { useCameraPolicy } from '../scene/cameraPolicy';
import { advance, cueEnd, currentStep, duration, resolve, steps, type Cue, type Timeline } from './timeline';
import { courseFor, courseTimeline, type CourseMeta, type Track } from './course';
import './courses';

export interface DirectorState {
  tl: Timeline | null; t: number; playing: boolean; rate: number; muted: boolean;
  /** waiting at a cue end for narration to finish */ holding: boolean; speaking: boolean;
  /** the camera target the lesson wants (scenes read this; the camera only follows it on request, see scene/cameraPolicy) */ target: string | null;
  /** the lesson as authored, its course content, and the track being played (null = the learner is still choosing) */
  source: Timeline | null; course: CourseMeta | null; track: Track | null;
  set: (p: Partial<DirectorState>) => void;
}
export const useDirector = create<DirectorState>((set) => ({ tl: null, t: 0, playing: false, rate: 1, muted: false, holding: false, speaking: false, target: null, source: null, course: null, track: null, set: (p) => set(p) }));
// a loaded lesson owns the model; the camera stays with the learner unless they follow the lesson camera
useDirector.subscribe((s, p) => { if (!!s.tl !== !!p.tl || s.tl?.id !== p.tl?.id) { const pol = useCameraPolicy.getState(); pol.own('director', false); if (s.tl) pol.own('director', true); } });

/* ------------------------------------------------------------------ narration: pre-rendered natural voice → captions only (never browser speech) */
let narrationToken = 0;
function stopNarration() { narrationToken++; voice.stop(); useDirector.getState().set({ speaking: false }); }
function narrate(c: Cue) {
  stopNarration(); const st = useDirector.getState(); if (!c.say || st.muted) return;
  const token = ++narrationToken; const done = () => { if (token === narrationToken) useDirector.getState().set({ speaking: false }); };
  st.set({ speaking: true });
  const clip = c.voice ?? c.id; // pre-rendered clips are keyed by cue id unless the cue names one
  if (voice.has(clip)) { voice.play(clip, done); return; }
  done(); // no clip yet: the caption carries the line
}

/* ------------------------------------------------------------------ clock */
let raf = 0, last = 0, holdFor = 0; const MAX_HOLD = 20; let nextTrack: Track | null = null;
function loop(now: number) {
  raf = requestAnimationFrame(loop);
  const st = useDirector.getState(); const tl = st.tl; if (!tl || !st.playing) return;
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  // hold: a narrated cue marked `hold` does not end while its narration is still playing
  const cur = currentStep(tl, st.t);
  // (bounded: blocked autoplay or a silent speech engine must never freeze a lesson)
  if (cur?.hold && st.speaking && st.t >= cueEnd(cur) - 1e-6 && (holdFor += dt) < MAX_HOLD) { if (!st.holding) st.set({ holding: true }); return; }
  holdFor = 0;
  if (st.holding) st.set({ holding: false });
  const end = duration(tl); let t1 = Math.min(end, st.t + dt * st.rate);
  if (cur?.hold && st.speaking && holdFor === 0 && st.t < cueEnd(cur)) t1 = Math.min(t1, cueEnd(cur));
  const started = advance(tl, st.t, t1);
  const target = [...started].reverse().find((c) => c.target)?.target ?? st.target;
  const say = [...started].reverse().find((c) => c.say); if (say) narrate(say);
  st.set({ t: t1, target, playing: t1 < end });
}
function ensureLoop() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }

export const director = {
  /**
   * Load a lesson. Lessons with a course open on the choice between the full course and the TL;DR
   * (the scene is set to the opening state meanwhile); pass `track` to skip the choice (resume, deep link).
   */
  load(tl: Timeline, autoplay = false, opts: { track?: Track } = {}) {
    const course = courseFor(tl); const preferred = nextTrack; nextTrack = null;
    const track = opts.track ?? (course ? preferred : 'full'); if (preferred && !opts.track) autoplay = true;
    useDirector.getState().set({ source: tl, course, track });
    this.run(courseTimeline(tl, track ?? 'full', course), !!track && autoplay);
  },
  /** the next lesson that loads skips the choice and plays this track (a "TL;DR" button outside the player) */
  prefer(track: Track | null) { nextTrack = track; },
  /** play the chosen track from the start (or switch track mid-lesson, landing on the same scene when it exists in both) */
  choose(track: Track) {
    const st = useDirector.getState(); if (!st.source) return;
    const here = st.tl && st.track ? currentStep(st.tl, st.t)?.id : null;
    st.set({ track }); const tl = courseTimeline(st.source, track, st.course); this.run(tl, true);
    const at = here ? tl.cues.find((c) => c.id === here)?.at : undefined; if (at != null && at > 0) this.seek(at, true);
  },
  run(tl: Timeline, autoplay: boolean) { stopNarration(); const st = useDirector.getState(); st.set({ tl, t: 0, holding: false, playing: false, target: null }); this.seek(0, autoplay); if (autoplay) this.play(); },
  unload() { stopNarration(); useDirector.getState().set({ tl: null, t: 0, playing: false, holding: false, target: null, source: null, course: null, track: null }); },
  play() { const st = useDirector.getState(); if (!st.tl) return; if (!st.track) { this.choose('full'); return; } if (st.t >= duration(st.tl) - 1e-6) this.seek(0, true); last = performance.now(); st.set({ playing: true }); ensureLoop(); },
  pause() { stopNarration(); useDirector.getState().set({ playing: false, holding: false }); },
  toggle() { useDirector.getState().playing ? this.pause() : this.play(); },
  /** jump to t: the world is rebuilt deterministically; narration restarts only when landing on a step start */
  seek(t: number, speak = false) {
    const st = useDirector.getState(); const tl = st.tl; if (!tl) return; const x = Math.max(0, Math.min(duration(tl), t));
    stopNarration(); resolve(tl, x);
    const target = [...tl.cues].filter((c) => c.at <= x + 1e-9 && c.target).sort((a, b) => a.at - b.at).pop()?.target ?? null;
    st.set({ t: x, holding: false, target });
    const cur = currentStep(tl, x); if (speak && cur && Math.abs(cur.at - x) < 1e-6) narrate(cur);
  },
  /** previous / next chapter */
  step(dir: 1 | -1) {
    const st = useDirector.getState(); const tl = st.tl; if (!tl) return; const s = steps(tl);
    const k = s.findIndex((c) => c.at > st.t + 1e-6); const cur = k < 0 ? s.length - 1 : k - 1;
    const to = dir > 0 ? Math.min(s.length - 1, cur + 1) : Math.max(0, st.t - (s[cur]?.at ?? 0) > 1.5 ? cur : cur - 1);
    this.seek(s[to].at, st.playing);
  },
  setRate(r: number) { useDirector.getState().set({ rate: r }); },
  setMuted(m: boolean) { if (m) stopNarration(); useDirector.getState().set({ muted: m }); },
};
declare global { interface Window { __CCDirector?: typeof director } }
if (typeof window !== 'undefined') window.__CCDirector = director;
