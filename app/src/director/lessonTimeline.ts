/** Any lesson id → its timeline (Director lessons as authored; step lessons as the player builds them). For lengths and previews. */
import { lessonById } from './lessonIndex';
import { stepTimeline, type Timeline } from './timeline';
import { VENT_LESSONS } from '../lessons/vent';
import { ABG_LESSONS } from '../lessons/abg';
import { LAB_LESSONS } from '../lessons/labs';
import { LINES_LESSONS } from '../lines/lessons';

type StepLesson = { id: string; title: string; blurb?: string; steps: { id: string; title: string; say: string }[] };
const STEP: StepLesson[] = [...VENT_LESSONS, ...ABG_LESSONS, ...LAB_LESSONS, ...LINES_LESSONS];
export function timelineFor(id: string): Timeline | null {
  const hit = lessonById(id); if (hit) return hit.tl;
  const l = STEP.find((x) => x.id === id); if (!l) return null;
  return { ...stepTimeline(l.id, l.title, l.steps.map((s) => ({ id: s.id, title: s.title, say: s.say }))), blurb: l.blurb };
}
