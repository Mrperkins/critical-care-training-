import { describe, it, expect } from 'vitest';
import { iabpTrace, features, classify, IABP_PRESETS, IDEAL } from '../src/procedures/iabp';

const base = { hr: 80, sys: 100, dia: 60 };
const F = (k: keyof typeof IABP_PRESETS) => features(iabpTrace(base, IABP_PRESETS[k].t));
describe('IABP timing waveform', () => {
  it('ideal: augmentation ≥ systole, BAEDP < PAEDP, assisted systole < unassisted, notch visible', () => {
    const f = F('ideal');
    expect(f.augPeak).toBeGreaterThanOrEqual(f.unassistedSys); expect(f.baedp).toBeLessThan(f.paedp - 5); expect(f.assistedSys).toBeLessThan(f.unassistedSys - 3); expect(f.notchDepth).toBeGreaterThan(2);
  });
  it('early inflation hides the dicrotic notch', () => {
    expect(F('earlyInflation').notchDepth).toBeLessThan(F('ideal').notchDepth * 0.5);
  });
  it('late inflation: lower augmentation after a visible notch', () => {
    const l = F('lateInflation'), i = F('ideal'); expect(l.augPeak).toBeLessThan(i.augPeak - 5); expect(l.notchDepth).toBeGreaterThan(2);
  });
  it('early deflation: BAEDP ≈ PAEDP and no systolic unloading', () => {
    const e = F('earlyDeflation'), i = F('ideal'); expect(e.baedp).toBeGreaterThan(i.baedp + 5); expect(Math.abs(e.baedp - e.paedp)).toBeLessThan(6); expect(e.assistedSys).toBeGreaterThan(i.assistedSys + 2);
  });
  it('late deflation: BAEDP above PAEDP (ventricle ejects against the balloon)', () => {
    const l = F('lateDeflation'); expect(l.baedp).toBeGreaterThan(l.paedp + 5);
  });
  it('classify maps every preset to itself; features are deterministic', () => {
    for (const k of Object.keys(IABP_PRESETS) as (keyof typeof IABP_PRESETS)[]) expect(classify(IABP_PRESETS[k].t)).toBe(k);
    expect(features(iabpTrace(base, IDEAL))).toEqual(features(iabpTrace(base, IDEAL)));
  });
  it('works across heart rates', () => {
    for (const hr of [60, 100, 120]) { const f = features(iabpTrace({ ...base, hr }, IDEAL)); expect(f.baedp).toBeLessThan(f.paedp); expect(f.augPeak).toBeGreaterThan(f.paedp + 20); }
  });
});

import { resolve, duration } from '../src/director/timeline';
import { IABP_LESSON } from '../src/director/lessons/iabp';
import { useIabp } from '../src/procedures/iabpStore';
import { classify as cls } from '../src/procedures/iabp';
describe('IABP lesson', () => {
  it('walks ideal → four errors → quiz, and seeks exactly', () => {
    const at = (t: number) => { resolve(IABP_LESSON, t); const s = useIabp.getState(); return s.quiz ?? cls(s.timing); };
    expect(IABP_LESSON.cues.map((c) => at(c.at + 0.5))).toEqual(['ideal', 'ideal', 'ideal', 'earlyInflation', 'lateInflation', 'earlyDeflation', 'lateDeflation', 'lateInflation']);
    const a = at(55); at(duration(IABP_LESSON) - 1); expect(at(55)).toBe(a);
  });
});
