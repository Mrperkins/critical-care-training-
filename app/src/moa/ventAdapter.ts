/**
 * Patient adapters onto a private instance of the EXISTING ventilator engine (VentSession).
 * Exposure u maps to minutes since the drug; each call reloads the scenario, gives the drug and
 * runs a fixed number of fixed steps, so seeking is exact and the Ventilator module is untouched.
 */
import { VentSession } from '../vent/session';
import { ventNumbers } from '../vent/numbers';
import type { PatientAdapter, Readout } from './types';

let inst: VentSession | null = null; const S = () => (inst ??= new VentSession('normal'));
function run(s: VentSession, seconds: number) { for (let i = 0; i < Math.round(seconds * 20); i++) s.tick(0.05); }

/** Inhaled β2 agonist: the vent engine's own bronchodilator effect (spasm relaxes over ~12 s of drug effect). */
export function bronchodilatorAdapter(scenario = 'asthma', maxSeconds = 20): PatientAdapter {
  return {
    engine: 'Ventilator engine (airway resistance, flow, dynamic hyperinflation)', scenario,
    setup: () => { S().load(scenario); run(S(), 8); },
    exposure: (u) => { const s = S(); s.load(scenario); run(s, 8); const x = Math.max(0, Math.min(1, u)); if (x > 0) { s.intervene('bronchodilator'); run(s, maxSeconds * x); } else run(s, 0.01); },
    readouts: (): Readout[] => { const n = ventNumbers(S());
      return [{ id: 'pip', label: 'PIP', value: n.pip, unit: 'cmH₂O' }, { id: 'pplat', label: 'Pplat', value: n.pplat, unit: 'cmH₂O' }, { id: 'gap', label: 'PIP − Pplat', value: n.pip - n.pplat, unit: 'cmH₂O' },
        { id: 'raw', label: 'Airway resistance', value: n.raw ?? NaN, unit: 'cmH₂O/L/s' }, { id: 'autopeep', label: 'Auto-PEEP', value: n.autoPeep, unit: 'cmH₂O', digits: 1 }]; },
    doseLabel: (u) => (u <= 0 ? 'before the nebuliser' : `${Math.round(u * 15)} min after the nebuliser (compressed)`),
  };
}

/** Neuromuscular blockade: patient effort on the ventilator disappears. Readouts are effort and breathing — never sedation. */
export function paralysisAdapter(scenario = 'copd'): PatientAdapter {
  return {
    engine: 'Ventilator engine (patient effort, triggering)', scenario,
    setup: () => { S().load(scenario); run(S(), 10); },
    exposure: (u) => { const s = S(); s.load(scenario); run(s, 6); if (u > 0.35) s.intervene('paralyse'); run(s, 24); },
    readouts: (): Readout[] => { const s = S(); const n = ventNumbers(s);
      return [{ id: 'effort', label: 'Patient effort (Pmus max)', value: s.m.pt.pmax, unit: 'cmH₂O' }, { id: 'rr', label: 'Total RR', value: n.rr, unit: '/min' }, { id: 'setrr', label: 'Set RR', value: s.m.s.rr, unit: '/min' },
        { id: 'sed', label: 'Sedation from this drug', value: 0, unit: 'none — give a sedative' }]; },
    doseLabel: (u) => (u <= 0.35 ? 'before rocuronium' : 'after rocuronium 1.2 mg/kg'),
  };
}
