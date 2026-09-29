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

export const LESSON_HOSTS: { module: Module; timelines: Timeline[] }[] = [
  { module: 'vent', timelines: [...VENT_TIMELINES, NEEDLE_LESSON] },
  { module: 'abg', timelines: ABG_TIMELINES },
  { module: 'labs', timelines: LAB_TIMELINES },
  { module: 'lines', timelines: [...LINES_TIMELINES, IABP_LESSON, CENTRAL_LINE_LESSON] },
  { module: 'neuro', timelines: [...NEURO_LESSONS, ICP_LESSON] },
  { module: 'heart', timelines: HEART_LESSONS },
  { module: 'abdomen', timelines: [...ABDOMEN_LESSONS, DISSECTION_LESSON] },
];
export const lessonById = (id: string) => { for (const h of LESSON_HOSTS) { const tl = h.timelines.find((t) => t.id === id); if (tl) return { tl, module: h.module }; } return null; };
