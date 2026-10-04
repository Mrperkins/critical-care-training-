import { describe, it, expect } from 'vitest';
import { resolve } from '../src/director/timeline';
import { ACIDOSIS_LESSON, DKA_LESSON } from '../src/director/lessons/abg';
import { lab } from '../src/abg/lab';

const g = (tl: typeof ACIDOSIS_LESSON, t: number) => { resolve(tl, t); const s = lab.snap; return { pH: s.pH, co2: s.paco2, hco3: s.hco3, ag: s.ag, k: s.k, glu: lab.pt.p.glucose, rr: s.rr, etco2: s.etco2 }; };
describe('acid–base lessons on the ABG engine', () => {
  it('acute respiratory acidosis: high CO₂, small HCO₃ rise; chronic: kidneys add HCO₃ and pH recovers', () => {
    const n = g(ACIDOSIS_LESSON, 1), a = g(ACIDOSIS_LESSON, 12), c = g(ACIDOSIS_LESSON, 24);
    expect(a.co2).toBeGreaterThan(n.co2 + 30); expect(a.pH).toBeLessThan(7.25); expect(a.hco3 - n.hco3).toBeLessThan(6); expect(a.etco2).toBeGreaterThan(60);
    expect(c.hco3).toBeGreaterThan(a.hco3 + 8); expect(c.pH).toBeGreaterThan(a.pH);
  });
  it('metabolic acidosis is compensated by the lungs (Winter) unless the ventilator prevents it', () => {
    const m = g(ACIDOSIS_LESSON, 36), v = g(ACIDOSIS_LESSON, 48); const winter = 1.5 * m.hco3 + 8;
    expect(m.hco3).toBeLessThan(16); expect(Math.abs(m.co2 - winter)).toBeLessThan(5); expect(v.co2).toBeGreaterThan(m.co2 + 10); expect(v.pH).toBeLessThan(m.pH - 0.1);
  });
  it('DKA: anion-gap acidosis with high K; insulin lowers glucose, AG and K', () => {
    const d = g(DKA_LESSON, 1), i1 = g(DKA_LESSON, 62), i2 = g(DKA_LESSON, 75);
    expect(d.ag).toBeGreaterThan(20); expect(d.pH).toBeLessThan(7.3); expect(d.k).toBeGreaterThan(5);
    expect(i1.glu).toBeLessThan(d.glu); expect(i1.k).toBeLessThan(d.k); expect(i2.ag).toBeLessThan(i1.ag); expect(i2.pH).toBeGreaterThan(d.pH);
  });
  it('seeks exactly', () => { const a = g(DKA_LESSON, 62); g(DKA_LESSON, 5); const b = g(DKA_LESSON, 62); expect(b.pH).toBeCloseTo(a.pH, 9); });
});
