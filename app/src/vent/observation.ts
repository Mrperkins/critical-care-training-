import type { VentSession } from './session';
import { ventNumbers } from './numbers';

/** An observation, not a success score. Each value comes from the shared engine. */
export function captureObservation(s: VentSession) {
  const n = ventNumbers(s);
  return { breath: s.breathN, time: s.m.t, settings: { ...s.m.s },
    spo2: n.spo2 * 100, paco2: n.paco2, pH: n.pH, map: n.map,
    pip: n.pip, pplat: n.pplat, measured: n.pplatMeasured, autoPeep: n.autoPeep, vte: n.vte, mv: n.mv,
    circuit: s.circuitFault };
}
export type Observation = ReturnType<typeof captureObservation>;
export const OBSERVATION_FIELDS = [
  { key: 'spo2', label: 'SpO₂', unit: '%', digits: 0 },
  { key: 'paco2', label: 'PaCO₂', unit: 'mmHg', digits: 0 },
  { key: 'pH', label: 'pH', unit: '', digits: 2 },
  { key: 'map', label: 'Perfusion MAP', unit: 'mmHg', digits: 0 },
  { key: 'pip', label: 'Peak pressure', unit: 'cmH₂O', digits: 0 },
  { key: 'pplat', label: 'Plateau pressure', unit: 'cmH₂O', digits: 0 },
  { key: 'autoPeep', label: 'Auto-PEEP', unit: 'cmH₂O', digits: 1 },
  { key: 'vte', label: 'Exhaled volume', unit: 'mL', digits: 0 },
  { key: 'mv', label: 'Minute volume', unit: 'L/min', digits: 1 },
] as const;
export function observationReady(baseline: Observation, s: VentSession) {
  return s.breathN - Math.max(baseline.breath, s.changedAt) >= 3;
}
