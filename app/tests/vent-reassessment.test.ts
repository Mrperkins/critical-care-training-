import { describe, expect, it } from 'vitest';
import { VentSession } from '../src/vent/session';
import { captureObservation, observationReady } from '../src/vent/observation';

describe('reassessment records the engine rather than scoring a setting', () => {
  it('retains independent before values when settings and circuit change', () => {
    const s = new VentSession('normal'); const before = captureObservation(s);
    s.set({ vt: .25 }); s.circuit('disconnect');
    for (let i=0;i<200;i++) s.tick(.1);
    const after = captureObservation(s);
    expect(before.settings.vt).not.toBe(.25); expect(before.circuit).toBe('none');
    expect(after.settings.vt).toBe(.25); expect(after.circuit).toBe('disconnect');
    expect(after.vte).toBeLessThan(before.vte); expect(after.time).toBeGreaterThan(before.time);
  });
  it('cannot advance the observation checkpoint while the engine is paused', () => {
    const s = new VentSession('normal'); const before = captureObservation(s); s.paused = true;
    for (let i=0;i<200;i++) s.tick(.1);
    expect(observationReady(before,s)).toBe(false);
    s.paused = false; for (let i=0;i<200;i++) s.tick(.1);
    expect(observationReady(before,s)).toBe(true);
    s.set({ fio2: .5 }); expect(observationReady(before,s)).toBe(false);
    for (let i=0;i<200;i++) s.tick(.1);
    expect(observationReady(before,s)).toBe(true);
  });
});
