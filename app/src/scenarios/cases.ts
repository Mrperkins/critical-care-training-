/**
 * Integrated patient cases: one SyntheticPatient that you see breathing on its own first,
 * then intubate and ventilate. The repeat ABG is generated from the settings you chose.
 */
import type { PatientParams } from '../physiology/patient';
import type { VentSettings } from '../physiology/mechanics';
import type { VentNumbers } from '../knowledge/ventExplain';
import type { Snapshot } from '../physiology/patient';

export interface Feedback { level: 'ok' | 'warn' | 'bad'; text: string }
export interface SimCase {
  id: string; title: string; level: string; story: string; exam: string;
  pre: { params: Partial<PatientParams>; init: { paco2?: number; renalAdj?: number; lactate?: number; ketones?: number; k?: number } ; settleMin: number };
  scenario: string; startSettings: Partial<VentSettings>;
  targets: string[];
  review: (n: VentNumbers, g: Snapshot, s: VentSettings) => Feedback[];
}

export const SIM_CASES: SimCase[] = [
  {
    id: 'copd', title: 'Hypercapnic COPD exacerbation', level: 'Advanced',
    story: '68-year-old with severe COPD (home O₂ 2 L). Three days of increasing sputum and dyspnoea. Given oxygen at 6 L/min by ambulance crew. Now drowsy, GCS 9.',
    exam: 'Barrel chest, quiet breath sounds, prolonged expiration. RR 8, SpO₂ 88 % on 6 L, EtCO₂ 68.',
    pre: { params: { sex: 'M', age: 68, heightCm: 172, weightKg: 64, setCO2: 55, maxVE: 9, drive: 0.53, lowVQ: 0.3, vdAlv: 0.15, shunt: 0.05, fio2: 0.3, vco2: 210, spontVt: 0.5 }, init: { paco2: 82, renalAdj: 6 }, settleMin: 60 },
    scenario: 'copd', startSettings: { mode: 'VC', vt: 0.55, rr: 20, peep: 5, fio2: 0.6, flow: 50, pattern: 'square', pause: 0 },
    targets: ['pH 7.30–7.40 — not a "normal" PaCO₂', 'SpO₂ 88–92 %', 'Auto-PEEP < 3', 'Pplat < 30'],
    review: (n, g) => {
      const F: Feedback[] = [];
      if (g.pH > 7.45) F.push({ level: 'bad', text: `pH ${g.pH.toFixed(2)}: post-hypercapnic alkalosis. The kidneys have been holding bicarbonate for days — blowing PaCO₂ down to "normal" makes this patient alkalaemic (arrhythmias, seizures, low K⁺ and Ca²⁺). Aim for their usual PaCO₂.` });
      else if (g.pH < 7.25) F.push({ level: 'bad', text: `pH ${g.pH.toFixed(2)}: still severely acidaemic. Increase alveolar ventilation (Vt or RR) — while watching for trapping.` });
      else F.push({ level: 'ok', text: `pH ${g.pH.toFixed(2)} with PaCO₂ ${g.paco2.toFixed(0)}: acceptable for a chronic retainer.` });
      if (n.autoPeep > 3) F.push({ level: 'bad', text: `Auto-PEEP ≈ ${n.autoPeep.toFixed(0)} cmH₂O: expiratory time too short for this lung (τ ${n.tau.toFixed(1)} s). Lower RR, higher flow, smaller Vt.` });
      if (g.spo2 > 0.95) F.push({ level: 'warn', text: `SpO₂ ${Math.round(g.spo2 * 100)} %: more oxygen than needed. In COPD target 88–92 % — excess O₂ worsens V/Q matching and CO₂ retention.` });
      else if (g.spo2 < 0.87) F.push({ level: 'bad', text: `SpO₂ ${Math.round(g.spo2 * 100)} %: raise FiO₂.` });
      if (n.pplat > 30) F.push({ level: 'bad', text: `Plateau ${n.pplat.toFixed(0)} — reduce Vt or trapping.` });
      if (g.map < 65) F.push({ level: 'bad', text: `MAP ${g.map.toFixed(0)}: intrathoracic pressure is impeding venous return — check auto-PEEP.` });
      return F;
    },
  },
  {
    id: 'ards', title: 'Septic ARDS', level: 'Expert',
    story: '41-year-old with pneumococcal pneumonia, now in septic shock on norepinephrine. On a non-rebreather: SpO₂ 84 %, RR 38, working hard.',
    exam: 'Bilateral crackles, accessory muscles, cool peripheries. Height 170 cm (PBW 66 kg).',
    pre: { params: { sex: 'M', age: 41, heightCm: 170, weightKg: 88, spontVt: 0.34, shunt: 0.36, lowVQ: 0.15, vdAlv: 0.25, drive: 1.8, fio2: 0.7, co: 6.5, svr: 700, lactateProd: 3, tempC: 39.2, vo2: 320, vco2: 260, maxVE: 22 }, init: { lactate: 4.2 }, settleMin: 45 },
    scenario: 'ards', startSettings: { mode: 'VC', vt: 0.6, rr: 16, peep: 5, fio2: 1, flow: 55, pattern: 'square', pause: 0.3 },
    targets: ['Vt 6 mL/kg PBW (≈ 400 mL)', 'Pplat ≤ 30, ΔP ≤ 15', 'SpO₂ 88–95 %', 'pH ≥ 7.25'],
    review: (n, g) => {
      const F: Feedback[] = [];
      if (n.vtPerKg > 7) F.push({ level: 'bad', text: `Vt ${n.vtPerKg.toFixed(1)} mL/kg PBW: too big for an ARDS lung. Use predicted body weight (height), not actual weight.` });
      if (n.pplat > 30) F.push({ level: 'bad', text: `Plateau ${n.pplat.toFixed(0)} cmH₂O.` });
      if (n.dp > 15) F.push({ level: 'bad', text: `Driving pressure ${n.dp.toFixed(0)} — the breath is too big for the open lung. Recruit (PEEP) or reduce Vt.` });
      if (g.spo2 < 0.88) F.push({ level: 'bad', text: `SpO₂ ${Math.round(g.spo2 * 100)} %: shunt through collapsed lung. PEEP recruits; FiO₂ alone barely helps a shunt.` });
      if (g.pH < 7.25) F.push({ level: 'warn', text: `pH ${g.pH.toFixed(2)}: raise RR (up to ~35) to keep minute ventilation with a small Vt.` });
      if (g.map < 65) F.push({ level: 'warn', text: `MAP ${g.map.toFixed(0)}: high PEEP can reduce venous return in a vasodilated patient — balance PEEP against haemodynamics.` });
      if (!F.length) F.push({ level: 'ok', text: 'Lung-protective and adequately oxygenated. This is what the ARDSNet protocol is aiming for.' });
      return F;
    },
  },
];
