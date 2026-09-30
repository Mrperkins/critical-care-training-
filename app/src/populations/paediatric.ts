/**
 * A 4-year-old (16 kg) on the shared SyntheticPatient and the Lines beat model (now size-scaled: smaller aortic
 * compliance, BSA-scaled normal output, refractory period that allows fast sinus rates). Haemorrhage is graded
 * by the fraction of circulating volume lost (≈ 80 mL/kg); compensation — a strong rise in heart rate and
 * vasoconstriction — holds the pressure until ≈ a third is lost, then fails abruptly; bradycardia is pre-arrest.
 * Teaching values, not a paediatric protocol.
 */
import type { PatientParams } from '../physiology/patient';

export const CHILD = { ageY: 4, weightKg: 16, heightCm: 102 };
export const CHILD_BLOOD_ML = 80 * CHILD.weightKg; // ≈ 1.3 L
export const CHILD_BASE: Partial<PatientParams> = { age: CHILD.ageY, weightKg: CHILD.weightKg, heightCm: CHILD.heightCm, co: 2.6, hr: 105, svr: 2000, cvp: 4, vo2: 110, vco2: 90, hb: 12 };
/** Teaching ranges for a 4-year-old; lower limit of systolic pressure 70 + 2 × age (1–10 years). */
export const CHILD_NORMS = { hr: [80, 130] as [number, number], rr: [22, 34] as [number, number], sbpLow: 70 + 2 * CHILD.ageY };

/** Parameters after losing `lossFrac` of circulating volume, then receiving `bloodMlKg` of blood. */
export function childParams(lossFrac: number, bloodMlKg = 0): Partial<PatientParams> {
  const x = Math.max(0, lossFrac - (bloodMlKg * CHILD.weightKg) / CHILD_BLOOD_ML);
  const comp = Math.min(x, 0.3) / 0.3; // how hard compensation is working (0–1)
  const fail = Math.max(0, x - 0.3) / 0.15; // beyond ≈ 30 %: vasoconstriction and heart rate give out
  const hr = x > 0.42 ? 70 : 105 * (1 + 0.6 * comp) * (1 - 0.15 * Math.min(1, fail));
  return { ...CHILD_BASE, volume: Math.max(0.3, 1 - 1.15 * x), hr: Math.round(hr), svr: Math.round(2000 * (1 + 1.1 * comp) * (1 - 0.45 * Math.min(1, fail))), cvp: Math.max(0.5, 4 - 9 * x) };
}
/** Capillary refill (s) from vasoconstriction and output — a bedside sign, not a model output of the heart. */
export const capRefill = (lossFrac: number) => Math.round(10 * (2 + 3 * Math.min(1, lossFrac / 0.35) + 2 * Math.max(0, Math.min(1, (lossFrac - 0.35) / 0.1)))) / 10;
export const shockStage = (lossFrac: number, sbp: number) => (sbp < CHILD_NORMS.sbpLow ? (lossFrac > 0.42 ? 'pre-arrest' : 'decompensated') : lossFrac > 0.12 ? 'compensated' : 'none');
