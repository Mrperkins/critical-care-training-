/** Marks a lesson complete when its timeline is played to the end (Director lessons and step lessons alike). */
import { useDirector } from '../director/director';
import { duration } from '../director/timeline';
import { CATALOG_BY_ID } from './catalog';
import { useProgress } from './progress';

let started = false;
export function initProgressTracking() {
  if (started) return; started = true;
  if (typeof window !== 'undefined') (window as unknown as { __CCProgress: unknown }).__CCProgress = useProgress; // automation / QA hook
  useDirector.subscribe((s) => { const tl = s.tl; if (!tl || !CATALOG_BY_ID[tl.id]) return; if (s.t >= duration(tl) - 0.5) useProgress.getState().markComplete(tl.id); });
}
