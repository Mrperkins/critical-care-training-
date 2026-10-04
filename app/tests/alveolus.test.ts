import { describe, it, expect } from 'vitest';
import { VentSession } from '../src/vent/session';
import { alveolarState, DEPENDENCY_RANKS } from '../src/vent/alveolarMap';

const R = DEPENDENCY_RANKS(12);
const run = (S: VentSession, s: number) => { for (let i = 0; i < s * 20; i++) S.tick(0.05); };
/** smallest drawn size over a few breaths = end-expiratory size */
const endExp = (S: VentSession) => { let m = 9; for (let i = 0; i < 100; i++) { S.tick(0.05); m = Math.min(m, alveolarState(S, R).inflate); } return m; };
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

describe('alveolar close-up reads the vent engine', () => {
  it('normal lungs: all units aerated, end-capillary blood fully saturated', () => {
    const S = new VentSession('normal'); run(S, 6); const a = alveolarState(S, R);
    expect(sum(a.units.map((u) => u.collapse))).toBeLessThan(0.5);
    expect(a.units.every((u) => u.flood === 0)).toBe(true);
    expect(a.units.every((u) => u.endSat > 0.95)).toBe(true);
    expect(a.wet).toBe(0); expect(a.surfactant).toBe(1);
  });
  it('ARDS: collapse sits in dependent units and PEEP recruits them', () => {
    const S = new VentSession('ards'); S.set({ peep: 5 }); run(S, 12); const lo = alveolarState(S, R);
    const col = lo.units.map((u) => u.collapse);
    expect(sum(col)).toBeGreaterThan(1);
    expect(col[11]).toBeGreaterThanOrEqual(col[0]); // most dependent collapses first
    const eLo = endExp(S);
    S.set({ peep: 18 }); run(S, 12); const hi = alveolarState(S, R); const eHi = endExp(S);
    expect(sum(hi.units.map((u) => u.collapse))).toBeLessThan(sum(col));
    expect(eHi).toBeGreaterThan(eLo); // PEEP holds alveoli bigger at end-expiration
    expect(lo.wet).toBeGreaterThan(0); expect(lo.surfactant).toBeLessThan(1);
  });
  it('pulmonary oedema floods dependent units whose blood stays venous', () => {
    const S = new VentSession('edema'); run(S, 8); const a = alveolarState(S, R);
    const flooded = a.units.filter((u) => u.kind === 'flooded');
    expect(flooded.length).toBeGreaterThan(0);
    flooded.forEach((u) => expect(u.endSat).toBeLessThan(a.ccNormal - 0.05));
  });
  it('tension pneumothorax: the compressed lung shows as collapsed units', () => {
    const S = new VentSession('ptx'); run(S, 6); const a = alveolarState(S, R);
    expect(a.collapsedFrac).toBeGreaterThan(0.3);
  });
});
