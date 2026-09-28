/**
 * Blood-gas presets: each is a set of CAUSES (drive, dead space, shunt, acid production,
 * kidney function…) — never typed-in numbers. The SyntheticPatient turns them into the gas.
 */
import type { PatientParams } from '../physiology/patient';

export interface AbgPreset {
  id: string; name: string; story: string;
  params: Partial<PatientParams>; init?: { paco2?: number; lactate?: number; ketones?: number; renalAdj?: number; k?: number; kBal?: number };
  settle: number; // minutes to settle before showing
  /** controlled ventilation (bagging / ventilator) instead of the patient's own breathing */
  vent?: { rr: number; vt: number };
  teach: string[];
}

export const ABG_PRESETS: AbgPreset[] = [
  { id: 'normal', name: 'Normal', story: 'Healthy adult breathing room air.', params: {}, settle: 60, teach: ['pH 7.35–7.45 · PaCO₂ 35–45 · HCO₃⁻ 22–26 · PaO₂ 80–100 on room air.'] },
  { id: 'opioid', name: 'Opioid overdose', story: 'Found with pinpoint pupils, RR 6, on room air.', params: { drive: 0.32, fio2: 0.21 }, settle: 40,
    teach: ['Depressed drive → low alveolar ventilation → CO₂ accumulates: acute respiratory acidosis.', 'Hypoxaemia with a NORMAL A–a gradient: the alveoli are simply not refreshed (alveolar gas equation).', 'Kidneys have not had time: HCO₃⁻ up only ~1 per 10 mmHg.'] },
  { id: 'dka', name: 'DKA', story: 'Type 1 diabetic, vomiting, Kussmaul breathing, glucose 540.', params: { ketoneProd: 1.2, glucose: 540, acidIsMineral: 0, na: 133, cl: 98, volume: 0.8 }, init: { ketones: 16, k: 5.6 }, settle: 30,
    teach: ['Ketoacids consume HCO₃⁻ → high anion gap metabolic acidosis.', 'Respiratory compensation by Winter’s formula: PaCO₂ ≈ 1.5 × HCO₃⁻ + 8.', 'Potassium is high in the blood but total-body K⁺ is depleted.'] },
  { id: 'asthma', name: 'Severe asthma', story: 'Wheezing for hours, now quiet chest and tiring.', params: { lowVQ: 0.35, vdAlv: 0.3, maxVE: 9, drive: 1.3, fio2: 0.4, vco2: 260 }, settle: 30,
    teach: ['Early: hyperventilation → low PaCO₂. A "normal" PaCO₂ in severe asthma means fatigue.', 'Here dead space and a capped ventilatory capacity push PaCO₂ up: acute respiratory acidosis — impending arrest.'] },
  { id: 'sepsis', name: 'Septic shock', story: 'Fever, hypotension on vasopressors, mottled skin.', params: { co: 6.5, svr: 650, lactateProd: 3.5, tempC: 39.4, vo2: 330, vco2: 270, drive: 1.5, lowVQ: 0.12, hepatic: 0.6, fio2: 0.35 }, init: { lactate: 3 }, settle: 180,
    teach: ['Lactate rises from adrenergic glycolysis and impaired clearance — not only from lack of oxygen.', 'High-AG metabolic acidosis with respiratory compensation (often over-breathing).'] },
  { id: 'edema', name: 'Pulmonary oedema', story: 'Acute LV failure: frothy sputum, crackles to the apices.', params: { shunt: 0.2, lowVQ: 0.25, co: 3.2, drive: 1.6, fio2: 0.5 }, init: { lactate: 2.4 }, settle: 30,
    teach: ['Flooded alveoli = shunt + low V/Q: wide A–a gradient, partly FiO₂-responsive.', 'Early respiratory alkalosis from J-receptor stimulation and hypoxaemia.'] },
  { id: 'copd', name: 'COPD (chronic)', story: 'Stable severe COPD in clinic.', params: { setCO2: 55, lowVQ: 0.28, vdAlv: 0.2, maxVE: 11, shunt: 0.04 }, init: { paco2: 55, renalAdj: 6 }, settle: 60,
    teach: ['Chronic respiratory acidosis: kidneys have raised HCO₃⁻ ~3.5 per 10 mmHg, pH near normal.', 'Low PaO₂ from V/Q mismatch — corrects well with modest O₂.'] },
  { id: 'salicylate', name: 'Salicylate poisoning', story: 'Tinnitus, vomiting, deep rapid breathing after an overdose.', params: { drive: 2.3, otherUA: 12, vo2: 320, vco2: 280, tempC: 38.4 }, settle: 60,
    teach: ['Salicylate stimulates the respiratory centre directly → respiratory alkalosis.', 'It also uncouples oxidative phosphorylation → organic acids: high-AG metabolic acidosis.', 'Mixed: respiratory alkalosis + metabolic acidosis. A falling PaCO₂ is protective — never let it rise after intubation.'] },
  { id: 'arrest', name: 'Cardiac arrest (CPR)', story: 'VF arrest, CPR in progress, bag-valve ventilation 10/min.', params: { co: 1.4, hr: 100, svr: 900, drive: 0.05, maxVE: 30, fio2: 1, lactateProd: 2 }, init: { lactate: 6, paco2: 60 }, settle: 12, vent: { rr: 10, vt: 0.5 },
    teach: ['During CPR, cardiac output is ~25–30 % of normal: EtCO₂ is low because little CO₂ reaches the lungs — it tracks CPR quality.', 'Arterial and venous gases diverge widely: venous CO₂ is very high (CO₂ is stuck in the tissues).', 'Lactic acidosis from global ischaemia.'] },
  { id: 'rosc', name: 'ROSC', story: 'Return of spontaneous circulation 3 minutes ago.', params: { co: 4.2, svr: 1200, drive: 0.05, fio2: 1, lactateProd: 1.5 }, init: { lactate: 8, paco2: 60 }, settle: 5, vent: { rr: 10, vt: 0.5 },
    teach: ['With circulation restored, CO₂ washed out of the tissues arrives at the lungs: EtCO₂ jumps — often the first sign of ROSC.', 'Aim for normocapnia and SpO₂ 92–98 % (avoid hyperoxia).', 'Lactate clears over hours if perfusion is adequate.'] },
];
export const ABG_PRESET = Object.fromEntries(ABG_PRESETS.map((p) => [p.id, p])) as Record<string, AbgPreset>;
