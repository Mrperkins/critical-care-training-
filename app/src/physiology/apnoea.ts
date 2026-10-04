/**
 * Oxygen stores during apnoea (no breathing, airway closed: no apnoeic oxygenation). Built on the SAME blood
 * chemistry as the SyntheticPatient (blood.ts: Severinghaus dissociation, Bohr-shifted P50, O₂ content,
 * Henderson–Hasselbalch) — it is the patient's oxygen bookkeeping with ventilation switched off, not a
 * separate physiology.
 *
 *   store(PAO₂) = FRC × PAO₂ / (PB − PH₂O)                    lung
 *               + arterial blood × CaO₂(PAO₂)                   (≈ 20 % of blood volume, equilibrated with the alveoli)
 *               + venous blood × (CaO₂ − VO₂ / CO)              (≈ 80 %, Fick)
 *   d(store)/dt = −VO₂, and PaCO₂ climbs (≈ 8 mmHg in the first minute, then ≈ 3.5 / min), shifting P50 (Bohr).
 *
 * Each step solves store(PAO₂) = remaining O₂ for PAO₂ (bisection). Because the dissociation curve is flat at
 * the top, SpO₂ barely moves while the lung store drains — then falls off a cliff once PAO₂ nears 60.
 * Profiles are teaching values (supine, anaesthetised FRC; resting VO₂). Published apnoea studies give ranges
 * around these times; individual patients differ widely.
 */
import { PATM, PH2O, sat, p50, o2Content, hh } from './blood';

export interface ApnoeaProfile {
  id: string; name: string; short: string;
  weightKg: number; /** functional residual capacity, L (supine, after induction) */ frcL: number;
  /** O₂ consumption, mL/min */ vo2: number; /** g/dL */ hb: number; /** blood volume, L */ bloodL: number; /** cardiac output, L/min */ co: number;
  why: string;
}
export const APNOEA_PROFILES: ApnoeaProfile[] = [
  { id: 'adult', name: 'Healthy adult (70 kg)', short: 'Adult', weightKg: 70, frcL: 2.5, vo2: 250, hb: 14.5, bloodL: 5, co: 5,
    why: 'FRC ≈ 35 mL/kg holds ≈ 2 L of oxygen after pre-oxygenation; VO₂ ≈ 3.5 mL/kg/min.' },
  { id: 'pregnant', name: 'Term pregnancy', short: 'Pregnancy', weightKg: 75, frcL: 1.95, vo2: 320, hb: 11.5, bloodL: 6.5, co: 6.8,
    why: 'The uterus pushes the diaphragm up: FRC ≈ 20 % lower. VO₂ ≈ 20–30 % higher (mother + fetus + placenta). Dilutional anaemia.' },
  { id: 'obese', name: 'Obesity (130 kg)', short: 'Obese', weightKg: 130, frcL: 1.35, vo2: 330, hb: 14.5, bloodL: 6.5, co: 6.5,
    why: 'Abdominal and chest-wall mass collapses FRC when supine; more tissue consumes more oxygen.' },
  { id: 'child', name: 'Child (4 y, 18 kg)', short: 'Child', weightKg: 18, frcL: 0.36, vo2: 108, hb: 12, bloodL: 1.4, co: 2.6,
    why: 'VO₂ ≈ 6 mL/kg/min — nearly twice the adult rate — from a smaller FRC per kilo.' },
  { id: 'infant', name: 'Infant (3 months, 6 kg)', short: 'Infant', weightKg: 6, frcL: 0.09, vo2: 48, hb: 11, bloodL: 0.48, co: 1.1,
    why: 'VO₂ ≈ 8 mL/kg/min; a compliant chest wall lets FRC collapse to ≈ 15 mL/kg after induction.' },
  { id: 'newborn', name: 'Term newborn (3.5 kg)', short: 'Newborn', weightKg: 3.5, frcL: 0.06, vo2: 28, hb: 16.5, bloodL: 0.3, co: 0.7,
    why: 'Highest VO₂ per kilo and the smallest FRC; fetal haemoglobin binds oxygen tightly (low P50).' },
];
export const APNOEA_BY_ID = Object.fromEntries(APNOEA_PROFILES.map((p) => [p.id, p])) as Record<string, ApnoeaProfile>;

export interface ApnoeaOptions {
  /** alveolar O₂ fraction at the start: ≈ 0.87 after good pre-oxygenation (FiO₂ 1.0, tight seal), ≈ 0.14 on room air */ fao2?: number;
  /** head-up / ramped position: FRC × 1.15 (most useful in obesity and pregnancy) */ headUp?: boolean;
  minutes?: number; stepS?: number;
}
export interface ApnoeaCurve { t: number[]; spo2: number[]; pao2: number[]; paco2: number[]; t90: number | null; t80: number | null; t70: number | null }

const PB = PATM - PH2O; const HB_F = (id: string) => (id === 'newborn' ? 0.72 : 1); // fetal Hb: P50 ≈ 19 vs 26.8

/** SpO₂ over time from the start of apnoea. Pure and deterministic. */
export function apnoeaCurve(p: ApnoeaProfile, o: ApnoeaOptions = {}): ApnoeaCurve {
  const fao2 = o.fao2 ?? 0.87; const minutes = o.minutes ?? 12; const dt = (o.stepS ?? 2) / 60;
  const frc = p.frcL * (o.headUp ? 1.15 : 1) * 1000; // mL
  const artDl = p.bloodL * 10 * 0.2, venDl = p.bloodL * 10 * 0.8; const avDiff = p.vo2 / (p.co * 10); // mL O₂ per dL
  const paco2At = (t: number) => 40 + 8 * Math.min(1, t) + 3.5 * Math.max(0, t - 1);
  const P50 = (t: number) => p50(hh(paco2At(t), 24), 37, HB_F(p.id));
  const store = (pao2: number, t: number) => {
    const ca = o2Content(p.hb, sat(pao2, P50(t)), pao2); const cv = Math.max(0, ca - avDiff);
    return (frc * pao2) / PB + artDl * ca + venDl * cv;
  };
  let o2 = store(fao2 * PB - 0, 0);
  const out: ApnoeaCurve = { t: [], spo2: [], pao2: [], paco2: [], t90: null, t80: null, t70: null };
  for (let t = 0; t <= minutes + 1e-9; t += dt) {
    let lo = 0, hi = 800; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (store(m, t) < o2) lo = m; else hi = m; }
    const pao2 = (lo + hi) / 2; const s = sat(pao2, P50(t));
    out.t.push(t); out.spo2.push(s); out.pao2.push(pao2); out.paco2.push(paco2At(t));
    if (out.t90 == null && s < 0.9) out.t90 = t; if (out.t80 == null && s < 0.8) out.t80 = t; if (out.t70 == null && s < 0.7) out.t70 = t;
    o2 = Math.max(0, o2 - p.vo2 * dt);
  }
  return out;
}
/** Minutes of apnoea until SpO₂ < 90 % (null if it stays above within the window). */
export const safeApnoea = (p: ApnoeaProfile, o: ApnoeaOptions = {}) => apnoeaCurve(p, { minutes: 15, ...o }).t90;
