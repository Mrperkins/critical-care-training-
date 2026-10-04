/**
 * Patient–ventilator dyssynchrony challenges. Each one is a lung + a patient effort + a
 * "bad" ventilator setting. Nothing is scripted: the problem emerges from the mechanics
 * model, and it is judged resolved from the same bedside metrics (Mechanics.recent()).
 */
import type { PatientEffort, VentSettings } from '../physiology/mechanics';
import type { Mechanics } from '../physiology/mechanics';

export type DyssId = 'flow-starvation' | 'ineffective' | 'double' | 'stacking' | 'premature' | 'delayed' | 'autopeep';
export type Recent = ReturnType<Mechanics['recent']>;

export interface Dyssynchrony {
  id: DyssId; name: string; scenario: string; effort: PatientEffort; bad: Partial<VentSettings>;
  clue: string;            // what the waveform shows
  why: string;             // mechanism
  fixes: string[];         // bedside fixes
  metric: (r: Recent) => number; threshold: number; label: string; // present when metric > threshold
}

export const DYSSYNCHRONIES: Dyssynchrony[] = [
  {
    id: 'flow-starvation', name: 'Flow starvation', scenario: 'normal', effort: { pmax: 12, rate: 22, ti: 0.7, expPush: 0, demand: 65 },
    bad: { mode: 'VC', vt: 0.45, rr: 14, flow: 35, pattern: 'square', trigFlow: 2 },
    clue: 'The inspiratory pressure curve is "scooped" (concave) instead of rising straight — the patient is sucking against a fixed flow.',
    why: 'In volume control the flow is fixed. When the patient wants more flow than the vent gives, their inspiratory muscles pull the airway pressure down.',
    fixes: ['Switch to a pressure-targeted mode (PC, PRVC, PSV) so flow follows demand', 'Increase peak flow — but watch Ti: a very short inflation makes this patient double-trigger', 'Treat the drive: pain, anxiety, acidosis, fever'],
    metric: (r) => r.scoop, threshold: 5, label: 'pressure scooped by the patient (cmH₂O)',
  },
  {
    id: 'ineffective', name: 'Ineffective triggering', scenario: 'copd', effort: { pmax: 5, rate: 18, ti: 0.9, expPush: 0 },
    bad: { mode: 'VC', vt: 0.55, rr: 14, flow: 45, pattern: 'square', trigFlow: 6, peep: 3 },
    clue: 'Small upward bumps in expiratory flow (and dips in pressure) that are not followed by a breath.',
    why: 'Auto-PEEP means the patient must first drop alveolar pressure below the trapped pressure before any flow reaches the sensor. Weak effort + insensitive trigger = missed breaths.',
    fixes: ['Make the trigger more sensitive (flow trigger 1–2 L/min)', 'Reduce auto-PEEP: smaller Vt, lower RR, higher flow, bronchodilator', 'Counterbalance with external PEEP (~80 % of intrinsic PEEP) when flow-limited trapping is the barrier'],
    metric: (r) => r.ineffectivePerMin, threshold: 3, label: 'missed efforts per minute',
  },
  {
    id: 'double', name: 'Double triggering', scenario: 'normal', effort: { pmax: 10, rate: 16, ti: 1.7, expPush: 0 },
    bad: { mode: 'VC', vt: 0.4, rr: 12, flow: 60, pattern: 'square' },
    clue: 'Two breaths back-to-back with little or no exhalation between them.',
    why: 'The machine breath ends while the patient is still inhaling (neural Ti longer than set Ti). The ongoing effort triggers a second breath.',
    fixes: ['Lengthen inspiration: lower flow, decelerating pattern, or larger Vt if lung-protective limits allow', 'Pressure support / PC with longer Ti', 'Address high drive (sedation, analgesia, acidosis)'],
    metric: (r) => r.doubleTrigger, threshold: 1, label: 'double-triggered breaths / 6',
  },
  {
    id: 'stacking', name: 'Breath stacking', scenario: 'ards', effort: { pmax: 12, rate: 18, ti: 1.6, expPush: 0 },
    bad: { mode: 'VC', vt: 0.42, rr: 16, flow: 60, pattern: 'square', peep: 10 },
    clue: 'Double triggering where the second breath is delivered on top of the first — exhaled volume ≈ 2× set Vt and a pressure spike.',
    why: 'Stacked tidal volumes defeat lung protection: 800+ mL in an ARDS lung is injurious.',
    fixes: ['Match inspiratory time to the patient (lower flow / longer Ti)', 'Change to a mode that lets the patient set Ti (PSV / PC)', 'If drive is overwhelming: deeper sedation ± neuromuscular blockade'],
    metric: (r) => r.stacked, threshold: 1, label: 'stacked breaths / 6',
  },
  {
    id: 'premature', name: 'Premature cycling', scenario: 'normal', effort: { pmax: 5, rate: 18, ti: 1.3, expPush: 0 },
    bad: { mode: 'PSV', ps: 14, cyclePct: 60, peep: 5, rise: 0.1 },
    clue: 'Flow drops to the cycle threshold early and the patient is still pulling: a dip in expiratory flow (or a second trigger) right after cycling.',
    why: 'The cycle-off threshold (% of peak flow) is too high, so the vent stops before the patient’s neural inspiration ends.',
    fixes: ['Lower the cycle-off threshold (expiratory trigger %) to ~25 %', 'Or switch to PC and set Ti to match the patient (~1.3 s here)'],
    metric: (r) => r.prematureCycle, threshold: 1, label: 'breaths cycled before the patient finished',
  },
  {
    id: 'delayed', name: 'Delayed cycling', scenario: 'copd', effort: { pmax: 6, rate: 16, ti: 0.8, expPush: 6 },
    bad: { mode: 'PSV', ps: 14, cyclePct: 5, peep: 5, rise: 0.1 },
    clue: 'Inspiration continues after the patient has stopped — a pressure bump at the end of inspiration and a slow flow decay that never reaches the cycle threshold.',
    why: 'In obstructive lungs flow decays slowly (long time constant). With a low cycle %, the vent keeps inflating while the patient tries to exhale.',
    fixes: ['Raise cycle % (40–60 % in COPD)', 'Lower pressure support', 'Treat bronchospasm'],
    metric: (r) => r.delayedCycle, threshold: 1, label: 'breaths that ran past the patient’s effort',
  },
  {
    id: 'autopeep', name: 'Auto-PEEP', scenario: 'asthma', effort: { pmax: 0, rate: 0, ti: 1, expPush: 0 },
    bad: { mode: 'VC', vt: 0.5, rr: 24, flow: 45, pattern: 'square' },
    clue: 'Expiratory flow is still negative when the next breath starts. An expiratory hold shows total PEEP above set PEEP.',
    why: 'Expiration takes ~3 time constants (3·R·C). If the next breath comes sooner, gas is trapped and alveolar pressure stays high.',
    fixes: ['Lower RR', 'Shorter inspiration: higher peak flow / square wave', 'Smaller Vt (permissive hypercapnia)', 'Bronchodilator'],
    metric: (r) => r.autoPeep, threshold: 3, label: 'intrinsic PEEP (cmH₂O)',
  },
];
export const DYSS = Object.fromEntries(DYSSYNCHRONIES.map((d) => [d.id, d])) as Record<DyssId, Dyssynchrony>;
