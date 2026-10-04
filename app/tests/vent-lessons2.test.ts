import { describe, it, expect } from 'vitest';
import { resolve } from '../src/director/timeline';
import { COMPLIANCE_VS_RESISTANCE, TENSION_PTX } from '../src/director/lessons/vent';
import { session } from '../src/vent/session';
import { ventNumbers } from '../src/vent/numbers';
import { useUI } from '../src/app/store';

const n = (tl: typeof TENSION_PTX, t: number) => { resolve(tl, t); return { ...ventNumbers(session), tension: session.m.lung.tension, view: useUI.getState().ventView }; };
describe('ventilator flagship lessons', () => {
  it('ARDS = high plateau, normal gap; asthma = wide gap with auto-PEEP; treatment closes both', () => {
    const nl = n(COMPLIANCE_VS_RESISTANCE, 1), ar = n(COMPLIANCE_VS_RESISTANCE, 13), as = n(COMPLIANCE_VS_RESISTANCE, 39), tx = n(COMPLIANCE_VS_RESISTANCE, 52), cp = n(COMPLIANCE_VS_RESISTANCE, 64);
    expect(ar.pplat).toBeGreaterThan(nl.pplat + 10); expect(ar.pip - ar.pplat).toBeLessThan(10);
    expect(as.pip - as.pplat).toBeGreaterThan(2 * (ar.pip - ar.pplat)); expect(as.autoPeep).toBeGreaterThan(2);
    expect(tx.pip).toBeLessThan(as.pip - 6); expect(tx.autoPeep).toBeLessThan(as.autoPeep); expect(cp.autoPeep).toBeGreaterThan(0.5); expect(as.view).toBe('airway');
  });
  it('tension PTX: pleural tension, desaturation, hypotension; decompression reverses it', () => {
    const b = n(TENSION_PTX, 1), p = n(TENSION_PTX, 35), d = n(TENSION_PTX, 47);
    expect(p.tension).toBeGreaterThan(3); expect(p.spo2).toBeLessThan(b.spo2 - 0.04); expect(p.map).toBeLessThan(b.map - 20); expect(p.pip).toBeGreaterThan(b.pip);
    expect(d.tension).toBeLessThan(0.5); expect(d.map).toBeGreaterThan(p.map + 20); expect(d.spo2).toBeGreaterThan(p.spo2);
    n(TENSION_PTX, 24); expect(useUI.getState().ventView).toBe('alveolus');
  });
  it('seeks exactly', () => { const a = n(TENSION_PTX, 35).map; n(TENSION_PTX, 2); expect(n(TENSION_PTX, 35).map).toBeCloseTo(a, 9); });
});
