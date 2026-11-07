import { ADULT_SCRIPTS } from './adult';
import { NEONATAL_SCRIPTS } from './neonatal';
import { OBSTETRIC_SCRIPTS } from './obstetric';
import { PEDIATRIC_SCRIPTS } from './pediatric';
import type { ConferenceScript } from '../types';

/** Required per-case editorial tracks; missing work cannot silently become slide read-aloud. */
export const CONFERENCE_SCRIPTS: Record<string, ConferenceScript> = {
  ...ADULT_SCRIPTS, ...NEONATAL_SCRIPTS, ...OBSTETRIC_SCRIPTS, ...PEDIATRIC_SCRIPTS,
};
