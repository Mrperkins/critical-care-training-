import type { MechanismDefinition } from './types';
import { NOREPINEPHRINE } from './defs/norepinephrine';
export const MECHANISMS: MechanismDefinition[] = [NOREPINEPHRINE];
export const MECH: Record<string, MechanismDefinition> = Object.fromEntries(MECHANISMS.map((m) => [m.id, m]));
