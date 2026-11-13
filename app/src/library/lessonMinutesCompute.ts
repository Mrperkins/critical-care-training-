/** Real lesson lengths for the library (used by the generator script and its test; not shipped in the home bundle). */
import { timelineFor } from '../director/lessonTimeline';
import { courseFor, trackSummary } from '../director/course';
import '../director/courses';
import { MODULES } from './modules';

export async function computeLessonMinutes(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const m of MODULES) for (const s of m.steps) {
    if (s.kind !== 'lesson' || out[s.ref] != null) continue;
    const tl = timelineFor(s.ref); if (!tl) continue;
    out[s.ref] = trackSummary(tl, courseFor(tl)).full.min;
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}
