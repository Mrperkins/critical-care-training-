/**
 * Patient adapter onto the EXISTING Lines haemodynamic session (the same class the Lines module runs).
 * A private instance is used so a drug demo never disturbs the Lines module's patient. Exposure is
 * applied as a steady state (pressor level set directly, circulation rebuilt) so a seek is exact.
 */
import { LinesSession } from '../lines/session';
import type { PatientAdapter, Readout } from './types';

let inst: LinesSession | null = null;
const S = () => (inst ??= new LinesSession());
export function linesVitals(s: LinesSession): Readout[] {
  const c = s.circ; const p = s.pt.p; const co = (c.sv * c.hr) / 1000; const map = c.cvp + (co * 1000 / 60) * c.R;
  return [
    { id: 'map', label: 'MAP', value: map, unit: 'mmHg' },
    { id: 'hr', label: 'Heart rate', value: c.hr, unit: '/min' },
    { id: 'co', label: 'Cardiac output', value: co, unit: 'L/min', digits: 1 },
    { id: 'svr', label: 'SVR', value: p.svr * (1 + 0.85 * s.pressor), unit: 'dyn·s/cm⁵' },
    { id: 'cvp', label: 'CVP', value: c.cvp, unit: 'mmHg' },
  ];
}
/** Norepinephrine on the Lines engine: `setNore` semantics (0.15 µg/kg/min ≙ pressor effect 1). */
export function noreAdapter(scenario = 'sepsis', maxDose = 0.3): PatientAdapter {
  return {
    engine: 'Lines circulation (Windkessel + shared patient)', scenario,
    setup: () => { const s = S(); if (s.sc.id !== scenario) s.load(scenario); s.pressor = s.pressorTarget = 0; s.recompute(); },
    exposure: (u) => { const s = S(); const lvl = (maxDose * Math.max(0, Math.min(1, u))) / 0.15; s.pressor = s.pressorTarget = lvl; s.recompute(); },
    readouts: () => linesVitals(S()),
    doseLabel: (u) => `${(maxDose * u).toFixed(2)} µg/kg/min`,
  };
}
export const moaLines = () => S();
