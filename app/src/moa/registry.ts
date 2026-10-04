import type { MechanismDefinition } from './types';
import { NOREPINEPHRINE } from './defs/norepinephrine';
import { EPINEPHRINE, VASOPRESSIN, PHENYLEPHRINE, DOBUTAMINE } from './defs/vasoactive';
import { CALCIUM, INSULIN } from './defs/electrolyte';
import { NICARDIPINE, ALBUTEROL, KETAMINE, ROCURONIUM, HYPERTONIC } from './defs/second';
import { CLEVIDIPINE, ESMOLOL, LABETALOL, NITROGLYCERIN, MILRINONE, DOPAMINE } from './defs/cardio2';
import { ETOMIDATE, PROPOFOL, MIDAZOLAM, FENTANYL, DEXMEDETOMIDINE, SUCCINYLCHOLINE } from './defs/sedation';
import { MANNITOL, NIMODIPINE, THROMBOLYTIC, IPRATROPIUM } from './defs/neuroResp';
import { TXA, PCC, VITAMIN_K, PROTAMINE } from './defs/coag';
export const MECHANISMS: MechanismDefinition[] = [
  NOREPINEPHRINE, EPINEPHRINE, VASOPRESSIN, PHENYLEPHRINE, DOBUTAMINE, DOPAMINE, MILRINONE,
  NICARDIPINE, CLEVIDIPINE, ESMOLOL, LABETALOL, NITROGLYCERIN,
  ETOMIDATE, PROPOFOL, KETAMINE, MIDAZOLAM, FENTANYL, DEXMEDETOMIDINE, ROCURONIUM, SUCCINYLCHOLINE,
  ALBUTEROL, IPRATROPIUM, HYPERTONIC, MANNITOL, NIMODIPINE, THROMBOLYTIC,
  CALCIUM, INSULIN, TXA, PCC, VITAMIN_K, PROTAMINE,
];
/** Drug families for the picker (every mechanism appears exactly once). */
export const MOA_GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Vasopressors & inotropes', ids: ['norepinephrine', 'epinephrine', 'vasopressin', 'phenylephrine', 'dobutamine', 'dopamine', 'milrinone'] },
  { label: 'Blood pressure & rate', ids: ['nicardipine', 'clevidipine', 'esmolol', 'labetalol', 'nitroglycerin'] },
  { label: 'Induction, sedation, analgesia, paralysis', ids: ['etomidate', 'propofol', 'ketamine', 'midazolam', 'fentanyl', 'dexmedetomidine', 'rocuronium', 'succinylcholine'] },
  { label: 'Airway, brain, osmotic', ids: ['albuterol', 'ipratropium', 'hypertonic', 'mannitol', 'nimodipine', 'thrombolytic'] },
  { label: 'Electrolytes & haemostasis', ids: ['calcium', 'insulin', 'txa', 'pcc', 'vitamink', 'protamine'] },
];
export const MECH: Record<string, MechanismDefinition> = Object.fromEntries(MECHANISMS.map((m) => [m.id, m]));

/** a definition with its patient replaced by one of its contexts (state-dependent response) */
export function withContext(def: MechanismDefinition, ctxId: string | null): MechanismDefinition {
  const c = def.contexts?.find((x) => x.id === ctxId) ?? def.contexts?.[0];
  return c ? { ...def, patient: c.patient } : def;
}
