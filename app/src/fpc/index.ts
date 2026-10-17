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
import { TWELVE_LEAD, CARDIAC_ANATOMY, ELECTROPHYS } from './lessons/cardiac1';
import { ACS, CARDIOGENIC, HEART_FAILURE } from './lessons/cardiac2';
import { MCS, CARDIAC_INFECT, ARRHYTHMIAS } from './lessons/cardiac3';
import { HTN_CRISIS, HEMO_INSTAB, CHRONIC_CARDIAC } from './lessons/cardiac4';
import { VASCULAR, CARDIAC_DX, CARDIAC_LABS } from './lessons/cardiac5';
import { CARDIAC_PHARM, CARDIAC_MONITOR } from './lessons/cardiac6';
import { CARDIAC_EXTRAS } from './lessons/cardiacCases';
import { TRAUMA_DX, TRAUMA_LABS, TRAUMA_PHARM } from './lessons/trauma1';
import { TRAUMA_MONITOR, SURGICAL_INTERVENTIONS, TRAUMA_BLOOD } from './lessons/trauma2';
import { LETHAL_TRIAD, BURN_FLUIDS } from './lessons/trauma3';
import { BURNS, TOXIC_INHALATION } from './lessons/trauma4';
import { TRAUMA_EXTRAS } from './lessons/traumaCases';
import { NEURO_ASSESS, SEIZURES, AMS } from './lessons/neuro1';
import { STROKE_LVO, NEUROPROTECTION, BRAIN_BLEED } from './lessons/neuro2';
import { TBI, SCI, NEURO_DX } from './lessons/neuro3';
import { NEURO_LABS, NEURO_PHARM, ICP_MONITOR } from './lessons/neuro4';
import { NEURO_EXTRAS } from './lessons/neuroCases';
import { AIRCRAFT_OPS, AERODYNAMICS, AIRCRAFT_PERFORMANCE } from './lessons/safety1';
import { AIR_EMERGENCIES, LZ_OPS, OBSTACLES } from './lessons/safety2';
import { SURVIVAL, WEATHER, REFUELLING } from './lessons/safety3';
import { WELLNESS, HAZARD_REPORTING, RADIO_COMMS } from './lessons/safety4';
import { RESTRAINTS, PREFLIGHT, PAX_BRIEFING } from './lessons/safety5';
import { RISK_ASSESSMENT, NVG, GPS_NAV } from './lessons/safety6';
import { SAFETY_EXTRAS } from './lessons/safetyCases';

/** a lesson plus its transport case(s) and extra questions (the case closes the teaching, before the questions) */
const withExtras = (l: FpcLesson, x: Record<string, { sections: FpcLesson['sections']; questions: FpcLesson['questions'] }>) => (x[l.id] ? { ...l, sections: [...l.sections, ...x[l.id].sections], questions: [...l.questions, ...x[l.id].questions] } : l);

export const FPC_LESSONS: FpcLesson[] = [
  AIRWAY_ASSESSMENT, AIRWAY_ANATOMY, AIRWAY_PHARM, PASSIVE_OXYGENATION, FAILED_AIRWAY, SURGICAL_AIRWAY, MECH_VENT,
  ALT_AIRWAY, PERI_ARREST, TRACH, TUBE_CONFIRM, SUCTION, CAPNOGRAPHY, NIPPV,
].map((l) => withExtras(l, AIRWAY_EXTRAS)).concat([
  ...[ENDOCRINE, ADRENAL, RENAL, METABOLIC, SEPSIS, INFECTIOUS, TOX, BLOOD, GI, LABS, ADV_ASSESS, TREATMENT, LINES_FPC, RADIOLOGY, RESP_SYS].map((l) => withExtras(l, MEDICAL_EXTRAS)),
  ...[TWELVE_LEAD, CARDIAC_ANATOMY, MCS, ACS, CARDIOGENIC, HEART_FAILURE, CARDIAC_INFECT, ARRHYTHMIAS, HTN_CRISIS, HEMO_INSTAB, CHRONIC_CARDIAC, VASCULAR, ELECTROPHYS, CARDIAC_DX, CARDIAC_LABS, CARDIAC_PHARM, CARDIAC_MONITOR].map((l) => withExtras(l, CARDIAC_EXTRAS)),
  ...[TRAUMA_DX, TRAUMA_LABS, TRAUMA_PHARM, TRAUMA_MONITOR, SURGICAL_INTERVENTIONS, TRAUMA_BLOOD, LETHAL_TRIAD, BURN_FLUIDS, BURNS, TOXIC_INHALATION].map((l) => withExtras(l, TRAUMA_EXTRAS)),
  ...[NEURO_ASSESS, SEIZURES, AMS, STROKE_LVO, NEUROPROTECTION, BRAIN_BLEED, TBI, SCI, NEURO_DX, NEURO_LABS, NEURO_PHARM, ICP_MONITOR].map((l) => withExtras(l, NEURO_EXTRAS)),
  ...[AIRCRAFT_OPS, AERODYNAMICS, AIRCRAFT_PERFORMANCE, AIR_EMERGENCIES, LZ_OPS, OBSTACLES, SURVIVAL, WEATHER, REFUELLING, WELLNESS, HAZARD_REPORTING, RADIO_COMMS, RESTRAINTS, PREFLIGHT, PAX_BRIEFING, RISK_ASSESSMENT, NVG, GPS_NAV].map((l) => withExtras(l, SAFETY_EXTRAS)),
]);
export const FPC_BY_ID: Record<string, FpcLesson> = Object.fromEntries(FPC_LESSONS.map((l) => [l.id, l]));
export const lessonsFor = (d: DomainId) => FPC_LESSONS.filter((l) => l.domain === d);
