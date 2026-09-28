/**
 * Reference values for the ventilator module (adult; typical teaching targets — local protocols
 * and laboratories differ). Each row may read the live value from the simulation so the learner
 * sees where the current patient sits.
 */
import type { VentNumbers } from './ventExplain';
import type { Snapshot } from '../physiology/patient';

export interface RefRow {
  label: string; normal: string; unit: string; note?: string;
  /** numeric band for flagging the live value (null = open ended) */
  band?: [number | null, number | null];
  live?: (n: VentNumbers, g: Snapshot) => number | string | null;
  digits?: number;
}
export interface RefGroup { title: string; blurb?: string; rows: RefRow[] }

export const VENT_NORMALS: RefGroup[] = [
  {
    title: 'Settings — adult, lung-protective starting point',
    blurb: 'Where most adult patients start after intubation; titrate to the gas and the mechanics.',
    rows: [
      { label: 'Tidal volume', normal: '6–8', unit: 'mL/kg PBW', note: 'ARDS 4–6 (start at 6). Always per predicted body weight, never actual weight.', band: [4, 8], live: (n) => n.vtPerKg, digits: 1 },
      { label: 'Predicted body weight', normal: 'from height', unit: 'kg', note: 'Men 50 + 0.91 × (height cm − 152.4); women 45.5 + 0.91 × (height cm − 152.4). Height, not weight, sets lung size.' },
      { label: 'Respiratory rate', normal: '12–20', unit: '/min', note: 'ARDS up to 35 to hold pH; obstructive disease lower (8–12) to allow exhalation.', band: [8, 35], live: (n) => n.rr },
      { label: 'Minute ventilation', normal: '5–8', unit: 'L/min', note: '≈ 100 mL/kg PBW/min. Higher needs (sepsis, acidosis) push it up.', band: [4, 12], live: (n) => n.mv, digits: 1 },
      { label: 'PEEP', normal: '5', unit: 'cmH₂O', note: 'Physiological minimum. ARDS: higher per the PEEP/FiO₂ table (often 8–18).', band: [5, 24], live: (n) => n.peep },
      { label: 'FiO₂', normal: '0.21–1.0', unit: '', note: 'Start 1.0 after intubation, then the lowest FiO₂ that meets the SpO₂ target; aim < 0.6.', band: [0.21, 0.6], live: (n) => n.fio2, digits: 2 },
      { label: 'I:E ratio', normal: '1:2', unit: '', note: 'Obstructive disease 1:3 to 1:5 to give time to exhale.', live: (n) => n.ie },
      { label: 'Inspiratory time', normal: '0.8–1.2', unit: 's' },
      { label: 'Peak inspiratory flow (VC)', normal: '40–60', unit: 'L/min', note: 'Higher (60–80+) in obstruction to shorten inspiration.' },
    ],
  },
  {
    title: 'Measured mechanics',
    blurb: 'What the ventilator measures back. Plateau and driving pressure are the lung-protection limits.',
    rows: [
      { label: 'Plateau pressure', normal: '≤ 30 (ideally < 28)', unit: 'cmH₂O', note: 'Alveolar pressure at end-inspiration — needs an inspiratory hold to measure.', band: [null, 30], live: (n) => n.pplat },
      { label: 'Driving pressure (Pplat − PEEP)', normal: '≤ 15', unit: 'cmH₂O', note: 'The strongest single predictor of ventilator-induced lung injury.', band: [null, 15], live: (n) => n.dp },
      { label: 'Peak inspiratory pressure', normal: '< 35', unit: 'cmH₂O', note: 'PIP − Pplat ≤ 5 is normal; > 10 = high airway resistance (kinked tube, secretions, bronchospasm).', band: [null, 35], live: (n) => n.pip },
      { label: 'PIP − Pplat', normal: '≤ 5', unit: 'cmH₂O', note: 'Resistive pressure. Rises with airway problems; Pplat rises with lung/chest-wall problems.', band: [null, 10], live: (n) => Math.max(0, n.pip - n.pplat) },
      { label: 'Auto-PEEP (intrinsic)', normal: '0', unit: 'cmH₂O', note: 'Any value means exhalation is not finishing — measure with an expiratory hold.', band: [null, 1], live: (n) => n.autoPeep, digits: 1 },
      { label: 'Static compliance', normal: '50–100', unit: 'mL/cmH₂O', note: 'Vt ÷ (Pplat − PEEP). ARDS, oedema, obesity, pneumothorax often < 40.', band: [40, null], live: (n) => (n.cstat > 0 ? n.cstat : null) },
      { label: 'Airway resistance', normal: '5–10', unit: 'cmH₂O/L/s', note: 'Intubated adult (the tube adds resistance). > 15–20 is high.', band: [null, 15], live: (n) => n.raw, digits: 1 },
      { label: 'Time constant τ (R × C)', normal: '≈ 0.5', unit: 's', note: 'Exhalation needs about 3τ; long τ (obstruction) → air trapping.', band: [null, 0.8], live: (n) => n.tau, digits: 2 },
    ],
  },
  {
    title: 'Gas exchange & monitoring',
    rows: [
      { label: 'SpO₂', normal: '95–100 (target 92–96)', unit: '%', note: 'Chronic hypercapnia / COPD: 88–92 %.', band: [92, 100], live: (_, g) => g.spo2 * 100 },
      { label: 'PaO₂', normal: '80–100', unit: 'mmHg', note: 'On room air; falls slightly with age. Target on the ventilator ≈ 55–80 (ARDSnet).', band: [60, null], live: (_, g) => g.pao2 },
      { label: 'P/F ratio (PaO₂ ÷ FiO₂)', normal: '> 400', unit: '', note: 'ARDS (Berlin, PEEP ≥ 5): mild 200–300, moderate 100–200, severe ≤ 100.', band: [300, null], live: (_, g) => g.pf },
      { label: 'A–a gradient', normal: '< age/4 + 4', unit: 'mmHg', note: '≈ 5–15 on room air. Wide gradient = V/Q mismatch, shunt or diffusion problem.', band: [null, 20], live: (_, g) => g.aaGrad },
      { label: 'PaCO₂', normal: '35–45', unit: 'mmHg', note: 'Set by alveolar ventilation. Permissive hypercapnia is accepted in ARDS if pH ≥ 7.20–7.25.', band: [35, 45], live: (_, g) => g.paco2 },
      { label: 'EtCO₂', normal: '35–45', unit: 'mmHg', note: 'Normally 2–5 below PaCO₂; the gap widens with dead space (PE, low cardiac output, over-distension).', band: [35, 45], live: (_, g) => g.etco2 },
      { label: 'pH', normal: '7.35–7.45', unit: '', band: [7.35, 7.45], live: (_, g) => g.pH, digits: 2 },
      { label: 'HCO₃⁻', normal: '22–26', unit: 'mEq/L', band: [22, 26], live: (_, g) => g.hco3 },
      { label: 'Base excess', normal: '−2 to +2', unit: 'mEq/L', band: [-2, 2], live: (_, g) => g.sbe },
      { label: 'Dead space (Vd/Vt)', normal: '0.2–0.35', unit: '', note: 'Rises with PE, low cardiac output, over-distension, high PEEP.', band: [null, 0.4], live: (_, g) => g.vdvt, digits: 2 },
      { label: 'Lactate', normal: '< 2', unit: 'mmol/L', note: '≥ 2 in sepsis is abnormal; ≥ 4 with hypotension = septic shock.', band: [null, 2], live: (_, g) => g.lactate, digits: 1 },
      { label: 'SvO₂ / ScvO₂', normal: '65–75 / ≥ 70', unit: '%', note: 'Low = oxygen delivery not meeting demand.', band: [65, null], live: (_, g) => g.svo2 * 100 },
      { label: 'Mean arterial pressure', normal: '≥ 65', unit: 'mmHg', note: 'High PEEP and air trapping lower venous return and MAP.', band: [65, null], live: (_, g) => g.map },
    ],
  },
];

export function flag(v: number, band?: [number | null, number | null]): 'low' | 'high' | 'ok' | 'none' {
  if (!band) return 'none'; if (band[0] != null && v < band[0]) return 'low'; if (band[1] != null && v > band[1]) return 'high'; return 'ok';
}
