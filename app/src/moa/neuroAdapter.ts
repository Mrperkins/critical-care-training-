/**
 * Patient adapters onto the EXISTING neuro models (pure): the Monro–Kellie ICP model (`neuro/icp.ts`)
 * and territory perfusion (`neuro/perfusion.ts`). Exposure maps to the model's own inputs, so seeking is exact.
 */
import { icpState, ICP_DEFAULT } from '../neuro/icp';
import { presetState } from '../neuro/neuroStore';
import { DEFAULT_SYSTEMIC, neuroSummary, territoryStates, type NeuroState } from '../neuro/perfusion';
import type { PatientAdapter, Readout } from './types';

/** Osmotherapy: brain water drawn out (mL) in a patient with a haematoma past the knee of the curve. */
export function osmoAdapter(o: { scenario: string; ml: number; maxMl: number }): PatientAdapter {
  let u = 0; const st = (): NeuroState => { const s = presetState('ich'); return { ...s, hemorrhage: { ...s.hemorrhage!, volumeMl: o.ml } }; };
  const now = () => icpState(st(), DEFAULT_SYSTEMIC, { ...ICP_DEFAULT, headUp: 30, osmoMl: o.maxMl * u });
  return {
    engine: 'Neuro ICP model (Monro–Kellie, same brain state)', scenario: o.scenario,
    setup: () => { u = 0; }, exposure: (x) => { u = Math.max(0, Math.min(1, x)); },
    readouts: (): Readout[] => { const s = now(); return [
      { id: 'icp', label: 'ICP', value: s.icp, unit: 'mmHg' }, { id: 'cpp', label: 'CPP', value: s.cpp, unit: 'mmHg' },
      { id: 'shift', label: 'Midline shift', value: s.shiftMm, unit: 'mm', digits: 1 }, { id: 'gcs', label: 'GCS ceiling', value: s.gcsCap, unit: '' }]; },
    doseLabel: (x) => (x <= 0 ? 'before the bolus' : `≈ ${Math.round(o.maxMl * x)} mL brain water drawn out`),
  };
}

/** Fibrinolysis of an M1 clot: exposure = how much of the occlusion has lysed by the time of the scan. */
export function lysisAdapter(o: { scenario: string; minutes: number; maxLysis: number }): PatientAdapter {
  let u = 0; const st = (): NeuroState => ({ ...presetState('m1_L'), minutes: o.minutes, occlusion: { m1_L: 1 - o.maxLysis * u } });
  return {
    engine: 'Cerebral perfusion model (territory flow, collaterals, core / penumbra)', scenario: o.scenario,
    setup: () => { u = 0; }, exposure: (x) => { u = Math.max(0, Math.min(1, x)); },
    readouts: (): Readout[] => { const s = st(); const t = territoryStates(s, DEFAULT_SYSTEMIC).MCA_L; const n = neuroSummary(s, DEFAULT_SYSTEMIC); return [
      { id: 'occl', label: 'M1 occlusion', value: (s.occlusion.m1_L ?? 0) * 100, unit: '%' }, { id: 'cbf', label: 'MCA core-region CBF', value: t.cbfDeep, unit: 'mL/100 g/min' },
      { id: 'core', label: 'Core', value: n.coreMl, unit: 'mL' }, { id: 'pen', label: 'Penumbra', value: n.penumbraMl, unit: 'mL' }]; },
    doseLabel: (x) => (x <= 0 ? 'before the bolus' : `${Math.round(o.maxLysis * x * 100)} % of the clot lysed`),
  };
}
