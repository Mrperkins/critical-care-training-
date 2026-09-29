/**
 * Ventilator scenario data. Pure data + small builders — no rendering, no UI.
 * A scenario describes the patient's respiratory system (as mechanics parameters), the
 * patient's own effort, the starting ventilator settings, the gas-exchange parameters the
 * shared SyntheticPatient uses, and the teaching points.
 */
import type { LungModel, PatientEffort, VentSettings, Compartment } from '../physiology/mechanics';
import { normalLung, DEFAULT_SETTINGS } from '../physiology/mechanics';
import type { PatientParams } from '../physiology/patient';

export interface LungSpec {
  /** per-compartment multipliers/overrides applied to the normal lung */
  cFactor?: number; rFixed?: number; rSpasm?: number; rExp?: number; flowLimit?: number;
  recruitable?: number; openP?: number; closeP?: number; overdistP?: number;
  Ccw?: number; Rett?: number; RettQ?: number;
  right?: Partial<Compartment> & { rFixed?: number }; left?: Partial<Compartment> & { rFixed?: number };
  tension?: number;
}
export type Fix = 'bronchodilator' | 'suction' | 'decompress' | 'bronchoscopy' | 'paralyse' | 'chestTube';
export interface VentScenario {
  id: string; name: string; short: string; story: string;
  lung: LungSpec; spasm: number; effort: PatientEffort; settings: Partial<VentSettings>;
  /** gas exchange: base shunt and how much shunt collapsed (recruitable) lung adds */
  gas: Partial<PatientParams> & { recruitShunt?: number };
  fixes: Fix[];
  look: string[];   // what to notice on the waveforms / 3D
  teach: string[];  // key physiology
}

export const PASSIVE: PatientEffort = { pmax: 0, rate: 0, ti: 1, expPush: 0 };

export const VENT_SCENARIOS: VentScenario[] = [
  {
    id: 'normal', name: 'Normal lungs', short: 'Post-op, healthy lungs', story: '48-year-old after an uncomplicated laparotomy, sedated, healthy lungs. PBW 70 kg.',
    lung: {}, spasm: 0, effort: PASSIVE, settings: { mode: 'VC', vt: 0.45, rr: 14, peep: 5, fio2: 0.4, flow: 50, pattern: 'square' },
    gas: {}, fixes: [],
    look: ['PIP ≈ 18–20, Pplat ≈ 12: small resistive gap, small elastic load.', 'Expiratory flow returns to zero well before the next breath.'],
    teach: ['Every pressure on the screen is the equation of motion: Paw = R·V̇ + V/C + PEEP.', 'Driving pressure (Pplat − PEEP) = Vt / Crs.'],
  },
  {
    id: 'ards', name: 'ARDS', short: 'Small, stiff, recruitable lung', story: '36-year-old with pneumonia → ARDS. SpO₂ 86% on FiO₂ 0.8. PBW 70 kg.',
    lung: { cFactor: 0.4, rFixed: 6, recruitable: 0.55, openP: 22, closeP: 9, overdistP: 24 }, spasm: 0, effort: PASSIVE,
    settings: { mode: 'VC', vt: 0.55, rr: 18, peep: 5, fio2: 0.8, flow: 55, pattern: 'square' },
    gas: { shunt: 0.08, lowVQ: 0.1, vdAlv: 0.2, recruitShunt: 0.42, vco2: 230 }, fixes: [],
    look: ['High Pplat and driving pressure at a normal tidal volume — the "baby lung".', 'Dependent (posterior) lung is dark and airless at low PEEP.', 'The P–V loop bends over at the top (overdistension "beak").'],
    teach: ['Low Vt (6 mL/kg PBW), Pplat ≤ 30, driving pressure ≤ 15.', 'PEEP recruits collapsed units — watch the posterior lung open and shunt fall.', 'Too much PEEP overdistends the open units and can drop cardiac output.'],
  },
  {
    id: 'asthma', name: 'Severe asthma', short: 'Bronchospasm, dynamic hyperinflation', story: '24-year-old with status asthmaticus, intubated, paralysed. Wheeze audible across the room.',
    lung: { rFixed: 5, rSpasm: 32, rExp: 1.6 }, spasm: 1, effort: PASSIVE,
    settings: { mode: 'VC', vt: 0.5, rr: 22, peep: 5, fio2: 0.5, flow: 50, pattern: 'square' },
    gas: { lowVQ: 0.18, vdAlv: 0.15, volume: 0.8 }, fixes: ['bronchodilator'],
    look: ['Huge PIP–Pplat gap = airway resistance.', 'Expiratory flow is still flowing when the next breath starts → auto-PEEP.', 'Lungs never deflate back to their resting size.'],
    teach: ['Give time to exhale: lower RR, shorter Ti (higher flow), smaller Vt.', 'Bronchodilator widens the airways: R ∝ 1/r⁴.', 'Measure intrinsic PEEP with an expiratory hold.'],
  },
  {
    id: 'copd', name: 'COPD', short: 'Floppy airways, flow limitation', story: '71-year-old with severe COPD, hypercapnic failure, now on the ventilator and breathing over it.',
    lung: { cFactor: 1.5, rFixed: 12, rSpasm: 6, rExp: 2.4, flowLimit: 1.1 }, spasm: 1, effort: { pmax: 5, rate: 20, ti: 0.9, expPush: 0 },
    settings: { mode: 'VC', vt: 0.5, rr: 16, peep: 5, fio2: 0.35, flow: 50, pattern: 'square', trigFlow: 3 },
    gas: { lowVQ: 0.25, vdAlv: 0.25, setCO2: 55, shunt: 0.04 }, fixes: ['bronchodilator'],
    look: ['Scooped, flow-limited expiratory flow that never reaches zero.', 'Small upward blips in expiratory flow = efforts that fail to trigger.'],
    teach: ['Intrinsic PEEP is a threshold load the patient must overcome before the vent sees an effort.', 'Applied PEEP ≈ 80 % of intrinsic PEEP can "counterbalance" it and restore triggering.', 'Longer expiratory time beats everything.'],
  },
  {
    id: 'edema', name: 'Pulmonary oedema', short: 'Wet, heavy lungs', story: '66-year-old with acute cardiogenic pulmonary oedema, frothy secretions, intubated.',
    lung: { cFactor: 0.55, rFixed: 7, recruitable: 0.35, openP: 16, closeP: 6, overdistP: 30 }, spasm: 0, effort: PASSIVE,
    settings: { mode: 'VC', vt: 0.45, rr: 18, peep: 5, fio2: 0.8, flow: 55, pattern: 'square' },
    gas: { shunt: 0.12, lowVQ: 0.12, recruitShunt: 0.3, co: 3.8 }, fixes: [],
    look: ['Stiffer lungs (higher Pplat) and slightly higher resistance.', 'Dependent lung floods and collapses.'],
    teach: ['PEEP pushes fluid back, recruits alveoli and unloads the left ventricle (lower afterload & preload).'],
  },
  {
    id: 'obesity', name: 'Obesity / stiff chest wall', short: 'The chest wall is the problem', story: '52-year-old, BMI 48, after abdominal surgery. Pplat 29 — but are the lungs stiff?',
    lung: { Ccw: 0.05, recruitable: 0.3, openP: 18, closeP: 11 }, spasm: 0, effort: PASSIVE,
    settings: { mode: 'VC', vt: 0.5, rr: 16, peep: 5, fio2: 0.5, flow: 55, pattern: 'square' },
    gas: { shunt: 0.06, recruitShunt: 0.3, vco2: 260, vo2: 320 }, fixes: [],
    look: ['High Pplat, but the pressure across the LUNG (transpulmonary) is normal.', 'Dependent atelectasis at low PEEP.'],
    teach: ['Pplat = lung + chest-wall recoil. A heavy chest wall raises Pplat without lung injury risk.', 'Higher PEEP keeps the dependent lung open against the abdominal load.'],
  },
  {
    id: 'ptx', name: 'Tension pneumothorax (R)', short: 'Right lung collapsed, pleural pressure up', story: 'Ventilated trauma patient — sudden high-pressure alarm, SpO₂ falling, BP 70/40.',
    lung: { right: { collapsed: 0.8 }, tension: 9 }, spasm: 0, effort: PASSIVE,
    settings: { mode: 'VC', vt: 0.45, rr: 16, peep: 5, fio2: 0.6, flow: 55, pattern: 'square' },
    gas: { shunt: 0.05 }, fixes: ['decompress'],
    look: ['PIP AND Pplat rise together (elastic load, not resistance).', 'Right lung small and immobile; volume goes to the left.'],
    teach: ['Pleural pressure compresses the lung and the great veins: hypoxaemia + obstructive shock.', 'Treatment is decompression, not ventilator changes.'],
  },
  {
    id: 'ett', name: 'ETT obstruction', short: 'Secretions in the tube', story: 'Day 5 of ventilation, thick secretions. Pressure alarms keep ringing.',
    lung: { Rett: 18, RettQ: 9 }, spasm: 0, effort: PASSIVE,
    settings: { mode: 'VC', vt: 0.45, rr: 16, peep: 5, fio2: 0.4, flow: 55, pattern: 'square' },
    gas: {}, fixes: ['suction'],
    look: ['PIP up, Pplat normal: the gap is resistance.', 'In PC mode the same problem shows as a falling Vt instead of a rising PIP.'],
    teach: ['High PIP + normal Pplat → airway/tube: kink, bite, secretions, bronchospasm.', 'High PIP + high Pplat → lung/chest: pneumothorax, mainstem intubation, oedema, abdomen.'],
  },
  {
    id: 'plug', name: 'Mucus plug (R main bronchus)', short: 'One lung does all the work', story: 'Sudden desaturation after turning. Breath sounds absent on the right.',
    lung: { right: { rFixed: 150 } as never }, spasm: 0, effort: PASSIVE,
    settings: { mode: 'VC', vt: 0.45, rr: 16, peep: 5, fio2: 0.5, flow: 55, pattern: 'square' },
    gas: { shunt: 0.05, lowVQ: 0.05 }, fixes: ['bronchoscopy'],
    look: ['Pplat rises: the whole tidal volume goes into one lung.', 'Right lung does not move; right-sided shunt drops the SpO₂.'],
    teach: ['Absorption atelectasis behind a plug creates shunt — O₂ helps little.', 'Suction / bronchoscopy, then recruit.'],
  },
];
export const VENT_SCENARIO = Object.fromEntries(VENT_SCENARIOS.map((s) => [s.id, s])) as Record<string, VentScenario>;

/** Build the mechanics lung for a scenario at a given bronchospasm level (0–1, after any bronchodilator). */
export function buildLung(sc: VentScenario, spasm: number): LungModel {
  const l = normalLung(); const L = sc.lung;
  l.comps.forEach((c, k) => {
    const side = (k === 0 ? L.right : L.left) as (Partial<Compartment> & { rFixed?: number }) | undefined;
    c.C *= L.cFactor ?? 1;
    c.R = (side?.rFixed ?? L.rFixed ?? c.R) + (L.rSpasm ?? 0) * spasm;
    c.rExp = L.rExp ?? 1; c.flowLimit = L.flowLimit ?? 0;
    c.recruitable = L.recruitable ?? 0; c.openP = L.openP ?? 20; c.closeP = L.closeP ?? 8; c.overdistP = L.overdistP ?? 32;
    if (side) { const { rFixed: _r, ...rest } = side; Object.assign(c, rest); }
  });
  if (L.Ccw) l.Ccw = L.Ccw; if (L.Rett) l.Rett = L.Rett; if (L.RettQ) l.RettQ = L.RettQ; if (L.tension) l.tension = L.tension;
  return l;
}
export const scenarioSettings = (sc: VentScenario): VentSettings => ({ ...DEFAULT_SETTINGS, pause: 0, ...sc.settings });
