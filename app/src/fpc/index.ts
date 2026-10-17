/** The FP-C curriculum: lessons by blueprint domain, in blueprint order. */
import type { DomainId } from './blueprint';
import type { FpcLesson } from './types';
import { AIRWAY_ASSESSMENT, AIRWAY_ANATOMY } from './lessons/airway1';
import { AIRWAY_PHARM, PASSIVE_OXYGENATION } from './lessons/airway2';
import { FAILED_AIRWAY, SURGICAL_AIRWAY } from './lessons/airway3';
import { MECH_VENT, ALT_AIRWAY } from './lessons/airway4';
import { PERI_ARREST, TRACH, TUBE_CONFIRM } from './lessons/airway5';
import { SUCTION, CAPNOGRAPHY, NIPPV } from './lessons/airway6';
import { AIRWAY_EXTRAS } from './lessons/airwayCases';
import { ENDOCRINE, ADRENAL, RENAL } from './lessons/medical1';
import { METABOLIC, SEPSIS, INFECTIOUS } from './lessons/medical2';
import { TOX, BLOOD, GI } from './lessons/medical3';
import { LABS, ADV_ASSESS, TREATMENT } from './lessons/medical4';
import { LINES_FPC, RADIOLOGY, RESP_SYS } from './lessons/medical5';
import { MEDICAL_EXTRAS } from './lessons/medicalCases';

/** a lesson plus its transport case(s) and extra questions (the case closes the teaching, before the questions) */
const withExtras = (l: FpcLesson, x: Record<string, { sections: FpcLesson['sections']; questions: FpcLesson['questions'] }>) => (x[l.id] ? { ...l, sections: [...l.sections, ...x[l.id].sections], questions: [...l.questions, ...x[l.id].questions] } : l);

export const FPC_LESSONS: FpcLesson[] = [
  AIRWAY_ASSESSMENT, AIRWAY_ANATOMY, AIRWAY_PHARM, PASSIVE_OXYGENATION, FAILED_AIRWAY, SURGICAL_AIRWAY, MECH_VENT,
  ALT_AIRWAY, PERI_ARREST, TRACH, TUBE_CONFIRM, SUCTION, CAPNOGRAPHY, NIPPV,
].map((l) => withExtras(l, AIRWAY_EXTRAS)).concat([
  ...[ENDOCRINE, ADRENAL, RENAL, METABOLIC, SEPSIS, INFECTIOUS, TOX, BLOOD, GI, LABS, ADV_ASSESS, TREATMENT, LINES_FPC, RADIOLOGY, RESP_SYS].map((l) => withExtras(l, MEDICAL_EXTRAS)),
]);
export const FPC_BY_ID: Record<string, FpcLesson> = Object.fromEntries(FPC_LESSONS.map((l) => [l.id, l]));
export const lessonsFor = (d: DomainId) => FPC_LESSONS.filter((l) => l.domain === d);
