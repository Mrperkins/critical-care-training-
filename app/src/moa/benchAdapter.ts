/**
 * Patient adapter onto the EXISTING labs bench (the shared patient the Labs module and the
 * hyperkalaemia lesson use). Exposure u = time since the dose as a fraction of `minutes`; each call
 * restores the pre-dose patient and fast-forwards, so seeking is exact.
 */
import { bench } from '../labs/bench';
import { derive, type DrugId, type PatientState } from '../physiology/patient';
import { cellModel } from '../labs/cell/model';
import { ecgShape } from '../physiology/ecg';
import type { PatientAdapter, Readout } from './types';

export function electrolyteAdapter(o: { scenario: string; k: number; drug: DrugId; minutes: number }): PatientAdapter {
  let pre: PatientState | null = null;
  const start = () => { bench.reset(); bench.pt.p.renal = 0.1; bench.set('k', o.k); bench.running = false; pre = structuredClone(bench.pt); };
  return {
    engine: 'Labs bench (shared patient, membrane and ECG model)', scenario: o.scenario,
    setup: start,
    exposure: (u) => {
      if (!pre) start(); bench.pt = structuredClone(pre!); const x = Math.max(0, Math.min(1, u));
      if (x > 0) { bench.give(o.drug); bench.fastForward(o.minutes * x); } bench.running = false; bench.snap = derive(bench.pt); bench.version++;
    },
    readouts: (): Readout[] => {
      const s = bench.snap; const m = cellModel('k', s, bench.pt); const e = ecgShape({ kEff: s.kEffective, k: s.k, ca: bench.pt.p.ca, mg: bench.pt.p.mg });
      return [
        { id: 'k', label: 'Plasma K⁺', value: s.k, unit: 'mEq/L', digits: 1 },
        { id: 'rmp', label: 'Resting potential', value: m?.rmp ?? NaN, unit: 'mV' },
        { id: 'thr', label: 'Threshold', value: m?.threshold ?? NaN, unit: 'mV' },
        { id: 'gap', label: 'Gap to threshold', value: m ? m.threshold - m.rmp : NaN, unit: 'mV' },
        { id: 'qrs', label: 'QRS', value: e.qrs * 1000, unit: 'ms' },
      ];
    },
    doseLabel: (u) => (u <= 0 ? 'before the dose' : `${Math.round(o.minutes * u)} min after the dose`),
  };
}
