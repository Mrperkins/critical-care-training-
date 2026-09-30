/**
 * Pregnancy on the shared SyntheticPatient (causes, not typed-in numbers): a term woman's circulation, the
 * supine (aortocaval) position, and postpartum haemorrhage graded by loss. Blood volume ≈ 6.5 L at term
 * (+≈ 45 %), so a litre is only ≈ 15 %. Compensation (heart rate, vasoconstriction) is set from the loss;
 * the patient engine and the Lines beat model turn it into pressure. Teaching values, not clinical rules.
 */
import type { PatientParams } from '../physiology/patient';

export const TERM_BLOOD_L = 6.5;
export const PREGNANT: Partial<PatientParams> = { sex: 'F', age: 29, weightKg: 78, heightCm: 165, co: 6.8, hr: 88, svr: 950, cvp: 5, hb: 11.5, vo2: 300 };
/** supine at term: the uterus compresses the IVC (and aorta) — venous return and output fall */
export const SUPINE: Partial<PatientParams> = { ...PREGNANT, volume: 0.72, hr: 96, svr: 1050, cvp: 2 };
/** Parameters after `lossMl` of haemorrhage from the term state (compensation fails beyond ≈ a third). */
export function pphParams(lossMl: number): Partial<PatientParams> {
  const x = Math.max(0, lossMl) / (TERM_BLOOD_L * 1000);
  const svrF = x <= 0.33 ? 1 + 1.2 * x : 1 + 1.2 * 0.33 - 2 * (x - 0.33);
  return { ...PREGNANT, volume: Math.max(0.3, 1 - 1.1 * x), hr: Math.round(88 + 100 * x), svr: Math.round(950 * svrF), cvp: Math.max(0.5, 5 - 12 * x) };
}
export const lossPct = (lossMl: number) => (100 * lossMl) / (TERM_BLOOD_L * 1000);
/** Shock index = HR / SBP; in obstetrics ≥ 0.9–1.0 flags significant bleeding while the pressure still looks acceptable. */
export const shockIndex = (hr: number, sbp: number) => hr / Math.max(1, sbp);
