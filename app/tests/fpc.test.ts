/** FP-C curriculum: every lesson follows the blueprint, runs 15–25 minutes as a full course, and has fifteen valid exam-style questions. */
import { describe, it, expect } from 'vitest';
import { FPC_LESSONS } from '../src/fpc';
import { BLUEPRINT, DOMAIN, TOTAL_ITEMS } from '../src/fpc/blueprint';
import { lessonMinutes } from '../src/fpc/types';

describe('FP-C blueprint', () => {
  it('matches the IBSC outline: 10 domains, 110 scored items', () => { expect(BLUEPRINT).toHaveLength(10); expect(TOTAL_ITEMS).toBe(110); });
});
describe.each(FPC_LESSONS.map((l) => [l.id, l] as const))('%s', (_id, l) => {
  it('sits on a real blueprint subtopic', () => {
    const d = DOMAIN[l.domain]; expect(d).toBeTruthy();
    const [num, n] = l.ref.split('.'); expect(num).toBe(d.num); expect(+n).toBeGreaterThanOrEqual(1); expect(+n).toBeLessThanOrEqual(d.topics.length);
  });
  it('full course runs 15–25 minutes; TL;DR is short', () => {
    const full = lessonMinutes(l, 'full'); const tl = lessonMinutes(l, 'tldr');
    expect(full, `full ${full} min`).toBeGreaterThanOrEqual(15); expect(full).toBeLessThanOrEqual(25);
    expect(tl).toBeLessThan(full / 2);
  });
  it('has objectives, core sections, key points and fifteen valid questions', () => {
    expect(l.objectives.length).toBeGreaterThanOrEqual(2);
    expect(l.sections.filter((s) => s.core).length).toBeGreaterThanOrEqual(2);
    expect(l.keyPoints.length).toBeGreaterThanOrEqual(4);
    expect(l.questions).toHaveLength(15);
    for (const q of l.questions) { expect(q.options).toHaveLength(4); expect(new Set(q.options).size).toBe(4); expect(q.why.length).toBeGreaterThan(10); }
    expect(l.sources.length).toBeGreaterThanOrEqual(1);
    expect(new Set(l.sections.map((s) => s.id)).size).toBe(l.sections.length);
  });
});
it('lesson ids are unique and refs do not repeat', () => {
  expect(new Set(FPC_LESSONS.map((l) => l.id)).size).toBe(FPC_LESSONS.length);
  expect(new Set(FPC_LESSONS.map((l) => l.ref)).size).toBe(FPC_LESSONS.length);
});
