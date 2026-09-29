import type { MechanismDefinition } from './types';
import { NOREPINEPHRINE } from './defs/norepinephrine';
import { EPINEPHRINE, VASOPRESSIN, PHENYLEPHRINE, DOBUTAMINE } from './defs/vasoactive';
import { CALCIUM, INSULIN } from './defs/electrolyte';
import { NICARDIPINE, ALBUTEROL, KETAMINE, ROCURONIUM, HYPERTONIC } from './defs/second';
export const MECHANISMS: MechanismDefinition[] = [NOREPINEPHRINE, EPINEPHRINE, VASOPRESSIN, PHENYLEPHRINE, DOBUTAMINE, NICARDIPINE, ALBUTEROL, KETAMINE, ROCURONIUM, HYPERTONIC, CALCIUM, INSULIN];
export const MECH: Record<string, MechanismDefinition> = Object.fromEntries(MECHANISMS.map((m) => [m.id, m]));

/** a definition with its patient replaced by one of its contexts (state-dependent response) */
export function withContext(def: MechanismDefinition, ctxId: string | null): MechanismDefinition {
  const c = def.contexts?.find((x) => x.id === ctxId) ?? def.contexts?.[0];
  return c ? { ...def, patient: c.patient } : def;
}
