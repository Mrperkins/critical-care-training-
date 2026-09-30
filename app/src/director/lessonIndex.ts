/** Every Director lesson and the module that hosts it — for cross-links (lesson ↔ drug mechanism) and returning to a lesson. */
import type { Timeline } from './timeline';
import type { Module } from '../app/store';
import { VENT_TIMELINES } from './lessons/vent';
import { NEEDLE_LESSON } from './lessons/needle';
import { ABG_TIMELINES } from './lessons/abg';
import { LAB_TIMELINES } from './lessons/hyperkalemia';
import { LINES_TIMELINES } from './lessons/lines';
import { IABP_LESSON } from './lessons/iabp';
import { CENTRAL_LINE_LESSON } from '../procedures/centralLineFlow';
import { NEURO_LESSONS } from './lessons/neuro';
import { ICP_LESSON } from './lessons/icp';
import { HEART_LESSONS } from './lessons/heart';
import { ABDOMEN_LESSONS } from './lessons/abdomen';
import { DISSECTION_LESSON } from './lessons/dissection';
import { COAG_LESSON } from './lessons/coag';
import { ABDOMEN_LESSONS_2 } from './lessons/abdomen2';
import { APNOEA_LESSON, PEDS_AIRWAY_LESSON, NEO_TRANSITION_LESSON, OB_GAS_LESSON, OB_CIRCULATION_LESSON, PEDS_SHOCK_LESSON } from './lessons/populations';

export const LESSON_HOSTS: { module: Module; timelines: Timeline[] }[] = [
  { module: 'vent', timelines: [...VENT_TIMELINES, NEEDLE_LESSON, PEDS_AIRWAY_LESSON] },
  { module: 'abg', timelines: [...ABG_TIMELINES, OB_GAS_LESSON, APNOEA_LESSON] },
  { module: 'labs', timelines: [...LAB_TIMELINES, COAG_LESSON] },
  { module: 'lines', timelines: [...LINES_TIMELINES, IABP_LESSON, CENTRAL_LINE_LESSON, OB_CIRCULATION_LESSON, PEDS_SHOCK_LESSON] },
  { module: 'neuro', timelines: [...NEURO_LESSONS, ICP_LESSON] },
  { module: 'heart', timelines: [...HEART_LESSONS, NEO_TRANSITION_LESSON] },
  { module: 'abdomen', timelines: [...ABDOMEN_LESSONS, DISSECTION_LESSON, ...ABDOMEN_LESSONS_2] },
];
export const lessonById = (id: string) => { for (const h of LESSON_HOSTS) { const tl = h.timelines.find((t) => t.id === id); if (tl) return { tl, module: h.module }; } return null; };
