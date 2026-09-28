/**
 * Ventilator challenges (data). Three kinds:
 *  - dyss: read the waveform → name the dyssynchrony → change settings until the metric resolves
 *  - alarm: high-pressure alarm → use holds to separate resistance from compliance → choose the fix
 *  - goal: reach a set of lung-protective / gas-exchange targets from a bad starting point
 */
import type { DyssId } from './dyssynchrony';
import type { VentNumbers } from '../knowledge/ventExplain';
import type { Snapshot } from '../physiology/patient';

export interface Goal { label: string; test: (n: VentNumbers, g: Snapshot) => boolean }
export interface VentChallenge {
  id: string; kind: 'dyss' | 'alarm' | 'goal'; title: string; level: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
  scenario: string; dyss?: DyssId; brief: string;
  question?: string; options?: string[]; answer?: number; explain?: string;
  action?: { question: string; options: string[]; answer: number; explain: string };
  goals?: Goal[];
  settings?: Partial<import('../physiology/mechanics').VentSettings>;
}

export const VENT_CHALLENGES: VentChallenge[] = [
  { id: 'alarm-ett', kind: 'alarm', level: 'Novice', title: 'High-pressure alarm #1', scenario: 'ett',
    brief: 'The high-pressure alarm keeps sounding. Do an inspiratory hold and compare PIP with Pplat.',
    question: 'Where is the extra pressure going?', options: ['Resistance — the airway or tube (PIP ↑, Pplat normal)', 'Compliance — the lung or chest (PIP ↑ and Pplat ↑)', 'Auto-PEEP', 'It is a sensor fault'], answer: 0,
    explain: 'PIP rose but Pplat did not: the gap (PIP − Pplat = R × flow) widened. The problem is between the ventilator and the alveoli.',
    action: { question: 'What do you do first?', options: ['Suction the ETT / check for kinks or biting', 'Increase PEEP', 'Needle decompression', 'Reduce FiO₂'], answer: 0, explain: 'Secretions in the tube raise resistance. Suction — and watch PIP fall back to baseline while Pplat stays the same.' } },
  { id: 'alarm-ptx', kind: 'alarm', level: 'Intermediate', title: 'High-pressure alarm #2', scenario: 'ptx',
    brief: 'Sudden high-pressure alarm, SpO₂ falling, BP dropping. Use a hold and look at the lungs.',
    question: 'Where is the extra pressure going?', options: ['Resistance — the airway or tube', 'Compliance — the lung/pleura/chest (PIP ↑ and Pplat ↑ together)', 'Flow starvation', 'Leak'], answer: 1,
    explain: 'PIP and Pplat rose together with a normal gap: it now takes more pressure to fit the same volume into the chest. With hypotension that is a tension pneumothorax until proven otherwise.',
    action: { question: 'Next step?', options: ['Needle decompression / chest tube', 'Bronchodilator', 'Suction', 'Increase the tidal volume'], answer: 0, explain: 'Decompression lets the lung re-expand, Pplat falls and venous return — and blood pressure — recover.' } },
  { id: 'alarm-plug', kind: 'alarm', level: 'Intermediate', title: 'Desaturation after turning', scenario: 'plug',
    brief: 'SpO₂ dropped after a turn. Breath sounds absent on the right. Look at the lungs and do a hold.',
    question: 'What best explains the numbers?', options: ['Whole Vt going into one lung — right main bronchus plugged', 'Bronchospasm', 'ETT in the oesophagus', 'Pulmonary embolus'], answer: 0,
    explain: 'One lung receives the whole tidal volume, so Pplat rises. The unventilated right lung is still perfused: a large shunt that FiO₂ barely touches.',
    action: { question: 'Fix?', options: ['Suction / bronchoscopy to clear the plug, then recruit', 'FiO₂ 1.0 and wait', 'Lower PEEP', 'Increase RR'], answer: 0, explain: 'Clearing the plug restores ventilation to the right lung; watch both lungs move and the shunt fall.' } },
  { id: 'dys-autopeep', kind: 'dyss', dyss: 'autopeep', level: 'Novice', title: 'Waveform detective: asthma', scenario: 'asthma', brief: 'Paralysed asthmatic on VC. Look at the flow trace between breaths.' },
  { id: 'dys-fs', kind: 'dyss', dyss: 'flow-starvation', level: 'Intermediate', title: 'Waveform detective: air hunger', scenario: 'normal', brief: 'Agitated patient on volume control, breathing hard. Look at the shape of the pressure curve during inflation.' },
  { id: 'dys-dt', kind: 'dyss', dyss: 'double', level: 'Intermediate', title: 'Waveform detective: two for one', scenario: 'normal', brief: 'The set rate is 12 but the vent counts 24. Watch the breaths come in pairs.' },
  { id: 'dys-ie', kind: 'dyss', dyss: 'ineffective', level: 'Advanced', title: 'Waveform detective: COPD', scenario: 'copd', brief: 'The patient’s chest is moving more often than the vent is breathing. Look at the expiratory flow.' },
  { id: 'dys-pc', kind: 'dyss', dyss: 'premature', level: 'Advanced', title: 'Waveform detective: pressure support #1', scenario: 'normal', brief: 'Patient on PSV looks uncomfortable. Toggle "Patient effort" only after you decide.' },
  { id: 'dys-dc', kind: 'dyss', dyss: 'delayed', level: 'Advanced', title: 'Waveform detective: pressure support #2', scenario: 'copd', brief: 'COPD patient on PSV 14 is fighting the vent at the end of each breath.' },
  { id: 'dys-st', kind: 'dyss', dyss: 'stacking', level: 'Expert', title: 'Waveform detective: ARDS', scenario: 'ards', brief: 'ARDS patient with high drive on low-Vt VC. Look at the exhaled volumes.' },
  { id: 'goal-ards', kind: 'goal', level: 'Advanced', title: 'Protect the ARDS lung', scenario: 'ards',
    brief: 'PBW 70 kg. Make this ventilation lung-protective AND keep the patient oxygenated. Use "+30 min" to see the gas.',
    goals: [
      { label: 'Vt ≤ 6.5 mL/kg PBW', test: (n) => n.vtPerKg <= 6.6 },
      { label: 'Plateau ≤ 30 cmH₂O', test: (n) => n.pplat <= 30.5 },
      { label: 'Driving pressure ≤ 15', test: (n) => n.dp <= 15.5 },
      { label: 'SpO₂ ≥ 88 %', test: (_, g) => g.spo2 >= 0.875 },
      { label: 'pH ≥ 7.25', test: (_, g) => g.pH >= 7.245 },
    ] },
  { id: 'goal-asthma', kind: 'goal', level: 'Advanced', title: 'Let the asthmatic exhale', scenario: 'asthma', settings: { rr: 26, vt: 0.55, flow: 45 },
    brief: 'Dynamic hyperinflation is dropping the blood pressure. Get the trapped gas out without letting the pH crash.',
    goals: [
      { label: 'Auto-PEEP < 3 cmH₂O', test: (n) => n.autoPeep < 3 },
      { label: 'Plateau ≤ 30', test: (n) => n.pplat <= 30.5 },
      { label: 'MAP ≥ 65', test: (_, g) => g.map >= 64.5 },
      { label: 'pH ≥ 7.20 (permissive hypercapnia)', test: (_, g) => g.pH >= 7.195 },
    ] },
];
