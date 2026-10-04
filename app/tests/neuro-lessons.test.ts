import { describe, it, expect } from 'vitest';
import { resolve, duration } from '../src/director/timeline';
import { LVO_LESSON, ICH_LESSON, SAH_LESSON, NEURO_LESSONS } from '../src/director/lessons/neuro';
import { useNeuroUI } from '../src/neuro/neuroStore';
import { neuroSummary, effectiveHemorrhage, hemorrhageVolume, territoryStates } from '../src/neuro/perfusion';

const S = () => useNeuroUI.getState();
const core = () => neuroSummary(S().state, S().sys).coreMl;

describe('flagship neuro lessons', () => {
  it('LVO: poor collaterals leave a bigger core than good at the same time', () => {
    resolve(LVO_LESSON, 38); const poor = core(); resolve(LVO_LESSON, 48); const good = core(); expect(poor).toBeGreaterThan(good * 2);
    resolve(LVO_LESSON, 12); expect(S().state.occlusion.m1_R).toBe(1);
  });
  it('ICH: the haematoma grows more at high blood pressure', () => {
    resolve(ICH_LESSON, 31); const hi = effectiveHemorrhage(S().state, S().sys)!.volumeMl;
    resolve(ICH_LESSON, 44); const lo = effectiveHemorrhage(S().state, S().sys)!.volumeMl;
    expect(hi).toBeGreaterThan(lo + 4); expect(lo).toBeGreaterThan(30);
    expect(hemorrhageVolume({ kind: 'ich', at: [0, 0, 0], volumeMl: 30 }, 0)).toBe(30);
  });
  it('SAH: vasospasm causes delayed ischaemia in the spastic territory (no clot)', () => {
    resolve(SAH_LESSON, 31); const t = territoryStates(S().state, S().sys); expect(t.MCA_L.penumbraMl + t.MCA_L.coreMl).toBeGreaterThan(20); expect(Object.keys(S().state.occlusion)).toHaveLength(0);
  });
  it('every neuro lesson seeks deterministically', () => {
    for (const tl of NEURO_LESSONS) { const e = duration(tl); resolve(tl, e * 0.7); const a = JSON.stringify([S().state, S().sys, S().view]); resolve(tl, e * 0.2); resolve(tl, e * 0.7); expect(JSON.stringify([S().state, S().sys, S().view]), tl.id).toBe(a); }
  });
});
