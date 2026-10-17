/** Registers every course. Imported once by the Director. */
import { registerCourses } from '../course';
import { VENT_COURSES } from './vent';
import { ABG_COURSES } from './abg';
import { LINES_COURSES } from './lines';
import { ORGAN_COURSES } from './organs';
import { CHECKPOINTS } from './checkpoints';
import type { CourseMeta } from '../course';
import './derived';

const ALL: Record<string, CourseMeta> = { ...VENT_COURSES, ...ABG_COURSES, ...LINES_COURSES, ...ORGAN_COURSES };
// full-course checkpoints: the course's own prompts win over the shared list
for (const [id, cps] of Object.entries(CHECKPOINTS)) if (ALL[id]) ALL[id] = { ...ALL[id], checkpoints: { ...cps, ...ALL[id].checkpoints } };
registerCourses(ALL);
export const AUTHORED_COURSE_IDS = Object.keys(ALL);
