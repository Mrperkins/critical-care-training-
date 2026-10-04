/**
 * Patient adapter onto the coagulation engine inside the SAME Labs-bench patient (physiology/coag.ts).
 * Exposure u = time since the dose as a fraction of `minutes`; each call restores the pre-dose patient and
 * fast-forwards, so seeking is exact. The Drugs module snapshots/restores the learner's Labs patient around demos.
 */
import { bench } from '../labs/bench';
import { derive, type PatientState } from '../physiology/patient';
import type { CoagDrug, CoagPresetId } from '../physiology/coag';
import type { PatientAdapter, Readout } from './types';

const fmtT = (min: number) => (min < 1 ? 'at the dose' : min < 90 ? `${Math.round(min)} min after` : `${(min / 60).toFixed(min < 600 ? 1 : 0)} h after`);
export function coagReadouts(): Readout[] {
  const c = bench.snap.coag; if (!c) return [];
  return [
    { id: 'inr', label: 'INR', value: c.inr, unit: '', digits: 1 },
    { id: 'aptt', label: 'aPTT', value: c.aptt, unit: 's' },
    { id: 'fib', label: 'Fibrinogen', value: c.fib, unit: 'mg/dL' },
    { id: 'mcf', label: 'Clot strength (MCF)', value: c.mcf, unit: 'mm' },
    { id: 'ly30', label: 'Clot lysis at 30 min', value: c.ly30, unit: '%' },
    { id: 'cap', label: 'Clotting capacity', value: 100 * c.capacity, unit: '%' },
  ];
}
export function coagAdapter(o: { scenario: string; preset: CoagPresetId; drugs: CoagDrug[]; minutes: number }): PatientAdapter {
  let pre: PatientState | null = null;
  const start = () => { bench.reset(); bench.startCoag(o.preset); bench.running = false; pre = structuredClone(bench.pt); };
  return {
    engine: 'Labs bench — coagulation engine in the shared patient', scenario: o.scenario,
    setup: start,
    exposure: (u) => {
      if (!pre) start(); bench.pt = structuredClone(pre!); const x = Math.max(0, Math.min(1, u));
      if (x > 0) { for (const d of o.drugs) bench.coag(d); bench.fastForward(o.minutes * x); }
      bench.running = false; bench.snap = derive(bench.pt); bench.version++;
    },
    readouts: coagReadouts,
    doseLabel: (u) => (u <= 0 ? 'before the dose' : fmtT(o.minutes * u)),
  };
}
