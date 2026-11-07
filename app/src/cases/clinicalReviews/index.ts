import type { ClinicalReview } from '../types';
import { PEDIATRIC_REVIEWS } from './pediatric';
import { OBSTETRIC_REVIEWS } from './obstetric';
import { NEONATAL_REVIEWS } from './neonatal';
import { ADULT_REVIEWS } from './adult';
export const CLINICAL_REVIEWS:Record<string,ClinicalReview>={...PEDIATRIC_REVIEWS,...OBSTETRIC_REVIEWS,...NEONATAL_REVIEWS,...ADULT_REVIEWS};
