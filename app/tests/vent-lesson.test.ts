import { describe, it, expect } from 'vitest';
import { resolve } from '../src/director/timeline';
import { ARDS_SIGNATURE } from '../src/director/lessons/vent';
import { session } from '../src/vent/session';
import { ventNumbers } from '../src/vent/numbers';
import { alveolarState, DEPENDENCY_RANKS } from '../src/vent/alveolarMap';
import { useUI } from '../src/app/store';

const R = DEPENDENCY_RANKS(12);
describe('ARDS signature lesson', () => {
  it('PEEP 5 → 16 recruits and lowers shunt; PEEP 24 overdistends', () => {
    resolve(ARDS_SIGNATURE, 22); const lo = alveolarState(session, R); expect(useUI.getState().ventView).toBe('alveolus'); expect(useUI.getState().ventTarget).toBe('lung.collapsed');
    resolve(ARDS_SIGNATURE, 44); const mid = alveolarState(session, R); const nMid = ventNumbers(session);
    resolve(ARDS_SIGNATURE, 56); const hi = alveolarState(session, R); const nHi = ventNumbers(session);
    expect(mid.collapsedFrac).toBeLessThan(lo.collapsedFrac); expect(mid.shunt).toBeLessThan(lo.shunt);
    expect(Math.max(...hi.units.map((u) => u.over))).toBeGreaterThan(0); expect(nHi.pplat).toBeGreaterThan(nMid.pplat);
    resolve(ARDS_SIGNATURE, 67); expect(useUI.getState().ventView).toBe('front');
  });
  it('seeks exactly', () => { resolve(ARDS_SIGNATURE, 44); const a = session.m.regional()[0].open; resolve(ARDS_SIGNATURE, 5); resolve(ARDS_SIGNATURE, 44); expect(session.m.regional()[0].open).toBeCloseTo(a, 10); });
});
