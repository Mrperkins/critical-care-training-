import { describe, it, expect } from 'vitest';
import { resolve } from '../src/director/timeline';
import { HYPERKALEMIA } from '../src/director/lessons/hyperkalemia';
import { bench } from '../src/labs/bench';
import { ecgShape } from '../src/physiology/ecg';

const at = (t: number) => { resolve(HYPERKALEMIA, t); const s = bench.snap; return { k: s.k, qrs: ecgShape({ kEff: s.kEffective, k: s.k, ca: bench.pt.p.ca, mg: bench.pt.p.mg }).qrs }; };

describe('hyperkalaemia signature lesson (labs bench, Lesson Director)', () => {
  it('walks K⁺ up to a sine wave and treats it in the right order', () => {
    const t0 = at(0), tHi = at(34), tSine = at(41.9), tCa = at(51.9), tIns = at(61.9), tRb = at(71.9), tHd = at(82.9);
    expect(t0.k).toBeCloseTo(4.2, 1);
    expect(tHi.k).toBeCloseTo(8.4, 1); expect(tHi.qrs).toBeGreaterThan(t0.qrs);
    expect(tSine.k).toBeGreaterThan(9);
    expect(Math.abs(tCa.k - tSine.k)).toBeLessThan(0.15);          // calcium does not lower potassium…
    expect(tCa.qrs).toBeLessThan(tSine.qrs);                          // …but narrows the QRS
    expect(tIns.k).toBeLessThan(tCa.k - 0.4);                         // insulin shifts K⁺ in
    expect(tRb.k).toBeGreaterThan(tIns.k);                            // rebound
    expect(tHd.k).toBeLessThan(6);                                    // dialysis removes it
  });
  it('seeking is exact', () => {
    const a = at(66.3); at(20); const b = at(66.3); expect(b.k).toBeCloseTo(a.k, 9);
  });
});
