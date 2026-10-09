import { describe, it, expect } from 'vitest';
import { evolve, toU, fromU, phaseAt, swellingCurve, clotDensityCurve, EVO_MAX } from '../src/neuro/evolution';
import { presetState } from '../src/neuro/neuroStore';
import { DEFAULT_SYSTEMIC } from '../src/neuro/perfusion';
import { _exploreMemory } from '../src/app/exploreMemory';

const at = (id: Parameters<typeof presetState>[0], minutes: number, extra = {}) => evolve({ ...presetState(id), minutes, ...extra }, DEFAULT_SYSTEMIC);
describe('stroke evolution to day 14', () => {
  it('log time axis round-trips and spans onset → 14 days', () => {
    for (const m of [0, 30, 270, 1440, 10080]) expect(fromU(toU(m))).toBeCloseTo(m, 3);
    expect(toU(EVO_MAX)).toBeCloseTo(1, 6); expect(toU(360)).toBeGreaterThan(0.55); // the first 6 h get more than half the slider
  });
  it('ischaemic: core grows then plateaus; CT turns dark over hours; swelling peaks days 2–5 then settles', () => {
    const c = [30, 120, 360, 1440].map((m) => at('m1_L', m).coreMl); for (let i = 1; i < c.length; i++) expect(c[i]).toBeGreaterThanOrEqual(c[i - 1]);
    expect(at('m1_L', 30).ctVisible).toBeLessThan(0.1); expect(at('m1_L', 1440).ctVisible).toBeGreaterThan(0.9);
    expect(swellingCurve(4320)).toBeGreaterThan(0.9); expect(swellingCurve(600)).toBeLessThan(0.1); expect(swellingCurve(EVO_MAX)).toBeLessThan(0.15);
    expect(at('m1_L', 4320).midlineShiftMm).toBeGreaterThan(at('m1_L', 600).midlineShiftMm);
  });
  it('early reopening means a smaller final core, less swelling and less shift', () => {
    const early = at('m1_L', 4320, { recanalizedAt: 90 }), never = at('m1_L', 4320);
    expect(early.coreMl).toBeLessThan(never.coreMl); expect(early.midlineShiftMm).toBeLessThanOrEqual(never.midlineShiftMm);
  });
  it('ICH: actively bleeding early, expansion over hours, oedema keeps rising for days, clot fades by two weeks', () => {
    const h0 = at('ich', 10), h6 = at('ich', 360), d3 = at('ich', 4320), d14 = at('ich', EVO_MAX);
    expect(h0.active).toBeGreaterThan(0.5); expect(h6.active).toBeLessThan(0.1); expect(h6.hematomaMl).toBeGreaterThan(h0.hematomaMl);
    expect(d3.hematomaMl).toBeCloseTo(h6.hematomaMl, 0); expect(d3.pheMl).toBeGreaterThan(h6.pheMl * 2);
    expect(clotDensityCurve(1440)).toBe(1); expect(clotDensityCurve(EVO_MAX)).toBeLessThan(0.7);
  });
  it('every minute has exactly one phase, in order', () => {
    for (const c of ['ischemic', 'ich'] as const) { let last = -1; for (let m = 0; m <= EVO_MAX; m += 97) { const p = phaseAt(c, m); expect(m >= p.from && m < p.to).toBe(true); expect(p.from).toBeGreaterThanOrEqual(last); last = p.from; } }
  });
  it('explore memory starts empty', () => { expect(_exploreMemory.size).toBe(0); });
});
