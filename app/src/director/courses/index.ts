/** Registers every course. Imported once by the Director. */
import { registerCourses } from '../course';
import { VENT_COURSES } from './vent';
import { ABG_COURSES } from './abg';
import { LINES_COURSES } from './lines';
import { ORGAN_COURSES } from './organs';
import './derived';

registerCourses({ ...VENT_COURSES, ...ABG_COURSES, ...LINES_COURSES, ...ORGAN_COURSES });
export const AUTHORED_COURSE_IDS = [...Object.keys(VENT_COURSES), ...Object.keys(ABG_COURSES), ...Object.keys(LINES_COURSES), ...Object.keys(ORGAN_COURSES)];
