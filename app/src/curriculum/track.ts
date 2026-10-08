/** Marks a lesson complete when its timeline is played to the end (Director lessons and step lessons alike). */
import { useDirector } from '../director/director';
import { duration } from '../director/timeline';
import { CATALOG_BY_ID } from './catalog';
import { useProgress } from './progress';

let started = false;
export function initProgressTracking() {
  if (started) return; started = true;
  if (typeof window !== 'undefined') (window as unknown as { __CCProgress: unknown }).__CCProgress = useProgress; // automation / QA hook
  useDirector.subscribe((s) => {
    const tl = s.tl; if (!tl || !CATALOG_BY_ID[tl.id]) return;
    const progress = useProgress.getState(), recent = progress.recent[0];
    // Persist a new lesson, a paused moment or a ten-second checkpoint, never every animation frame.
    if (!recent || recent.lessonId !== tl.id || Math.abs(recent.t - s.t) >= 10 || (!s.playing && recent.t !== s.t))
      progress.rememberLesson({ lessonId: tl.id, t: s.t, title: tl.title });
    if (s.t >= duration(tl) - 0.5) progress.markComplete(tl.id);
  });
}
