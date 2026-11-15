import { describe, expect, it } from 'vitest';
import { FPC_LESSONS } from '../src/fpc';
import { BLUEPRINT, TOTAL_ITEMS } from '../src/fpc/blueprint';
import { allocation, bank, domainStats, plan, readiness, record, score, type History } from '../src/fpc/exam';

const all = bank(FPC_LESSONS);
describe('FP-C exam practice', () => {
  it('the bank holds every lesson question once', () => {
    expect(all.length).toBe(FPC_LESSONS.reduce((n, l) => n + l.questions.length, 0)); expect(all.length).toBeGreaterThan(1500);
    expect(new Set(all.map((b) => b.key)).size).toBe(all.length);
  });
  it('questions are allocated in the exam’s proportions', () => {
    const full = allocation(TOTAL_ITEMS); for (const d of BLUEPRINT) expect(full[d.id]).toBe(d.items);
    for (const n of [10, 55]) { const a = allocation(n); expect(Object.values(a).reduce((x, y) => x + y, 0)).toBe(n); expect(a.airway).toBeGreaterThanOrEqual(a.flightphys); }
  });
  it('a mock is 110 questions over 150 minutes with each domain at its blueprint count; a quick set is 10', () => {
    const m = plan('mock', all, {}, 7); expect(m.items).toHaveLength(TOTAL_ITEMS); expect(m.minutes).toBe(150);
    for (const d of BLUEPRINT) expect(m.items.filter((b) => b.domain === d.id)).toHaveLength(d.items);
    expect(new Set(m.items.map((b) => b.key)).size).toBe(TOTAL_ITEMS);
    expect(plan('quick', all, {}, 7).items).toHaveLength(10); expect(plan('half', all, {}, 7)).toMatchObject({ minutes: 75 }); expect(plan('half', all, {}, 7).items).toHaveLength(55);
    expect(plan('quick', all, {}, 7).items.map((b) => b.key)).toEqual(plan('quick', all, {}, 7).items.map((b) => b.key));
  });
  it('scores by domain, records the history, and brings missed questions back first', () => {
    const q = plan('quick', all, {}, 3).items; const picks = q.map((b, i) => (i < 6 ? b.q.answer : (b.q.answer + 1) % 4));
    const res = score(q, picks); expect(res).toMatchObject({ right: 6, total: 10, pct: 60 }); expect(res.missed).toHaveLength(4);
    expect(res.byDomain.reduce((n, d) => n + d.total, 0)).toBe(10);
    const h: History = record({}, q, picks, 1000); expect(Object.keys(h)).toHaveLength(10);
    const weak = plan('weak', all, h, 5).items; expect(weak.length).toBeLessThanOrEqual(15);
    const missed = new Set(res.missed.map((m) => m.item.key)); expect(weak.slice(0, 4).every((b) => missed.has(b.key))).toBe(true);
    // unanswered questions are not recorded
    expect(Object.keys(record({}, q, q.map(() => null)))).toHaveLength(0);
    // seen questions are asked last next time
    const again = plan('quick', all, record({}, all.slice(0, all.length - 10), all.slice(0, all.length - 10).map((b) => b.q.answer), 5), 3).items;
    expect(again.filter((b) => all.slice(-10).includes(b)).length).toBeGreaterThan(0);
  });
  it('readiness weights each domain by its exam items and counts unseen domains as zero', () => {
    expect(readiness(domainStats(all, {})).pct).toBe(0);
    const h = record({}, all, all.map((b) => b.q.answer)); expect(readiness(domainStats(all, h))).toEqual({ pct: 100, coverage: 100 });
    const air = all.filter((b) => b.domain === 'airway'); const r = readiness(domainStats(all, record({}, air, air.map((b) => b.q.answer))));
    expect(r.pct).toBe(Math.round((17 / TOTAL_ITEMS) * 100));
  });
});
