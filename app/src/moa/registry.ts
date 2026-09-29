import type { MechanismDefinition } from './types';
import { NOREPINEPHRINE } from './defs/norepinephrine';
import { EPINEPHRINE, VASOPRESSIN, PHENYLEPHRINE, DOBUTAMINE } from './defs/vasoactive';
import { CALCIUM, INSULIN } from './defs/electrolyte';
export const MECHANISMS: MechanismDefinition[] = [NOREPINEPHRINE, EPINEPHRINE, VASOPRESSIN, PHENYLEPHRINE, DOBUTAMINE, CALCIUM, INSULIN];
export const MECH: Record<string, MechanismDefinition> = Object.fromEntries(MECHANISMS.map((m) => [m.id, m]));
