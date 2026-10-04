/**
 * Patient adapters onto the EXISTING Lines haemodynamic session (the same class the Lines module runs).
 * A private instance is used so a drug demo never disturbs the Lines module's patient. Exposure is
 * applied as a steady state (parameters set directly, circulation rebuilt) so a seek is exact.
 * The drug layer only moves the session's own inputs (pressor level, SVR, HR, contractility→CO);
 * the Windkessel circulation and the shared patient compute everything else.
 */
import { LinesSession } from '../lines/session';
import type { PatientParams } from '../physiology/patient';
import type { PatientAdapter, Readout } from './types';

let inst: LinesSession | null = null; const base: Record<string, PatientParams> = {};
const S = () => (inst ??= new LinesSession());
/** load the scenario once, then always restart from its untouched parameters */
function fresh(scenario: string) {
  const s = S(); if (!base[scenario]) { s.load(scenario); base[scenario] = structuredClone(s.pt.p); }
  else if (s.sc.id !== scenario) s.load(scenario);
  Object.assign(s.pt.p, structuredClone(base[scenario])); s.pressor = s.pressorTarget = 0; s.recompute(); return s;
}
export function linesVitals(s: LinesSession): Readout[] {
  const c = s.circ; const co = (c.sv * c.hr) / 1000; const map = c.cvp + (co * 1000 / 60) * c.R;
  return [
    { id: 'map', label: 'MAP', value: map, unit: 'mmHg' },
    { id: 'hr', label: 'Heart rate', value: c.hr, unit: '/min' },
    { id: 'co', label: 'Cardiac output', value: co, unit: 'L/min', digits: 1 },
    { id: 'svr', label: 'SVR', value: s.effectiveSvr(), unit: 'dyn·s/cm⁵' },
    { id: 'cvp', label: 'CVP', value: c.cvp, unit: 'mmHg' },
  ];
}
/** Norepinephrine on the Lines engine: `setNore` semantics (0.15 µg/kg/min ≙ pressor effect 1). */
export function noreAdapter(scenario = 'sepsis', maxDose = 0.3): PatientAdapter {
  return {
    engine: 'Lines circulation (Windkessel + shared patient)', scenario,
    setup: () => { fresh(scenario); },
    exposure: (u) => { const s = fresh(scenario); s.pressor = s.pressorTarget = (maxDose * Math.max(0, Math.min(1, u))) / 0.15; s.recompute(); },
    readouts: () => linesVitals(S()),
    doseLabel: (u) => `${(maxDose * u).toFixed(2)} µg/kg/min`,
  };
}
/**
 * Any other vasoactive drug: fractional change of the session's SVR, heart rate and contractile output
 * at the demo dose (data in the drug definition), scaled by exposure.
 */
export function hemoAdapter(o: { scenario: string; svr?: number; hr?: number; co?: number; /** fractional change of the filling pressure (venodilation / preload) */ cvp?: number; dose: (u: number) => string }): PatientAdapter {
  return {
    engine: 'Lines circulation (Windkessel + shared patient)', scenario: o.scenario,
    setup: () => { fresh(o.scenario); },
    exposure: (u) => {
      const s = fresh(o.scenario); const b = base[o.scenario]; const x = Math.max(0, Math.min(1, u));
      s.pt.p.svr = b.svr * (1 + (o.svr ?? 0) * x); s.pt.p.hr = b.hr * (1 + (o.hr ?? 0) * x); s.pt.p.co = b.co * (1 + (o.co ?? 0) * x); s.pt.p.cvp = b.cvp * (1 + (o.cvp ?? 0) * x); s.recompute();
    },
    readouts: () => linesVitals(S()),
    doseLabel: o.dose,
  };
}
export const moaLines = () => S();
