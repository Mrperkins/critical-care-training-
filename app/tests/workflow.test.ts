import { describe, it, expect } from 'vitest';
import { evaluate, options, ranks } from '../src/workflows/workflow';
import { CHEST_TUBE } from '../src/workflows/chestTube';
import { session } from '../src/vent/session';
import { ventNumbers } from '../src/vent/numbers';

const ids = CHEST_TUBE.steps.map((s) => s.id);
const run = (secs: number) => { for (let i = 0; i < secs * 20; i++) session.tick(0.05); return { ...ventNumbers(session), tension: session.m.lung.tension, collapsed: session.m.lung.comps.map((c) => c.collapsed) }; };

describe('workflow evaluation', () => {
  it('perfect sequence scores 100 with nothing missing', () => {
    const r = evaluate(CHEST_TUBE, ids, true); expect(r.score).toBe(100); expect(r.missing).toEqual([]); expect(r.outOfOrder).toEqual([]); expect(r.next).toBeNull();
  });
  it('any-order group: site and prep can swap without penalty', () => {
    const swapped = [...ids]; const a = swapped.indexOf('site'), b = swapped.indexOf('prep'); [swapped[a], swapped[b]] = [swapped[b], swapped[a]];
    expect(evaluate(CHEST_TUBE, swapped, true).outOfOrder).toEqual([]); expect(ranks(CHEST_TUBE).site).toBe(ranks(CHEST_TUBE).prep);
  });
  it('out-of-order, harmful choices and omissions are penalised; critical omissions flagged', () => {
    const r = evaluate(CHEST_TUBE, ['recognise', 'xray', 'tube', 'needle'], true);
    expect(r.harmful).toContain('xray'); expect(r.outOfOrder).toContain('needle'); expect(r.criticalMissing).toContain('dissect'); expect(r.score).toBeLessThan(50);
  });
  it('next expected step follows the order', () => {
    expect(evaluate(CHEST_TUBE, []).next).toBe('recognise'); expect(evaluate(CHEST_TUBE, ['recognise', 'fio2']).next).toBe('needle');
  });
  it('options contain every action once, in a stable order', () => {
    const o = options(CHEST_TUBE).map((a) => a.id); expect(new Set(o).size).toBe(CHEST_TUBE.steps.length + CHEST_TUBE.distractors.length); expect(options(CHEST_TUBE).map((a) => a.id)).toEqual(o);
    expect(o.slice(0, 3)).not.toEqual(ids.slice(0, 3));
  });
});

describe('chest tube workflow drives the real vent session', () => {
  it('needle decompression relieves tension; the drain re-expands the lung fully', () => {
    CHEST_TUBE.setup(); const base = run(10);
    expect(base.tension).toBeGreaterThan(5);
    CHEST_TUBE.effects!.fio2(); CHEST_TUBE.effects!.needle(); const nd = run(12);
    expect(nd.tension).toBeLessThan(0.5); expect(nd.map).toBeGreaterThan(base.map + 15); expect(nd.pip).toBeLessThan(base.pip);
    expect(Math.max(...nd.collapsed)).toBeGreaterThan(0.05); // needle alone leaves some lung down
    CHEST_TUBE.effects!.tube(); const tb = run(14);
    expect(Math.max(...tb.collapsed)).toBeLessThan(0.02); expect(tb.spo2).toBeGreaterThanOrEqual(nd.spo2);
  });
  it('raising PEEP in tension makes pressures and blood pressure worse', () => {
    CHEST_TUBE.setup(); const a = run(10); CHEST_TUBE.effects!.peep(); const b = run(10);
    expect(b.pip).toBeGreaterThan(a.pip); expect(b.map).toBeLessThanOrEqual(a.map + 0.5);
  });
});
