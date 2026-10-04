import { describe, it, expect } from 'vitest';
import { resolve } from '../src/director/timeline';
import { OXYGEN_DELIVERY, HAEMORRHAGE_TRANSFUSION } from '../src/director/lessons/lines';
import { lines } from '../src/lines/session';

const g = (tl: typeof OXYGEN_DELIVERY, t: number) => { resolve(tl, t); const s = lines.snap; const co = (lines.circ.sv * lines.circ.hr) / 1000; const hb = lines.pt.p.hb; const ca = 1.34 * hb * s.sao2 + 0.003 * s.pao2; return { hb, sao2: s.sao2, co, do2: co * ca * 10, svo2: s.svo2, lac: s.lactate, map: lines.num.map, pp: lines.num.pp, cvp: lines.num.cvp }; };
describe('oxygen delivery and transfusion lessons on the Lines engine', () => {
  it('anaemia leaves SaO₂ unchanged but cuts DO₂; a failing heart cannot compensate; shunt lowers SaO₂', () => {
    const n = g(OXYGEN_DELIVERY, 1), a = g(OXYGEN_DELIVERY, 13), f = g(OXYGEN_DELIVERY, 25), h = g(OXYGEN_DELIVERY, 36), c = g(OXYGEN_DELIVERY, 47), s = g(OXYGEN_DELIVERY, 59);
    expect(Math.abs(a.sao2 - n.sao2)).toBeLessThan(0.02); expect(a.do2).toBeLessThan(n.do2 * 0.7); expect(a.co).toBeGreaterThan(n.co);
    expect(f.do2).toBeLessThan(a.do2 * 0.75); expect(f.svo2).toBeLessThan(a.svo2);
    expect(h.sao2).toBeLessThan(n.sao2 - 0.05); expect(c.do2).toBeLessThan(n.do2 * 0.7); expect(s.do2).toBeGreaterThan(n.do2); expect(s.lac).toBeGreaterThan(2);
  });
  it('haemorrhage: Hb normal early, diluted by crystalloid, restored by blood with better DO₂', () => {
    const n = g(HAEMORRHAGE_TRANSFUSION, 1), e = g(HAEMORRHAGE_TRANSFUSION, 11), d = g(HAEMORRHAGE_TRANSFUSION, 24), b = g(HAEMORRHAGE_TRANSFUSION, 37);
    expect(e.hb).toBeGreaterThan(13); expect(e.do2).toBeLessThan(n.do2 * 0.7); expect(e.cvp).toBeLessThan(n.cvp);
    expect(d.hb).toBeLessThan(e.hb - 3); expect(d.map).toBeGreaterThan(e.map);
    expect(b.hb).toBeGreaterThan(d.hb + 2); expect(b.do2).toBeGreaterThan(d.do2 * 1.2); expect(b.pp).toBeGreaterThan(e.pp);
  });
  it('seeks exactly', () => { const a = g(HAEMORRHAGE_TRANSFUSION, 37).do2; g(HAEMORRHAGE_TRANSFUSION, 2); expect(g(HAEMORRHAGE_TRANSFUSION, 37).do2).toBeCloseTo(a, 9); });
});
