// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (window as unknown as { matchMedia: unknown }).matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} }); });
import { CASE_BY_ID } from '../src/challenge/sceneCases';
import { EXTENDED, reviewGroups } from '../src/library/ReviewPage';

describe('clinical review list', () => {
  it('lists every new decision, every patient vignette and every mission', () => {
    const g = Object.fromEntries(reviewGroups().map((x) => [x.key, x.items]));
    const added = Object.entries(EXTENDED).reduce((n, [id, from]) => n + CASE_BY_ID[id].questions.length - from, 0);
    expect(added).toBeGreaterThan(15); expect(g.cases).toHaveLength(added); expect(g.patients).toHaveLength(84); expect(g.missions).toHaveLength(5);
    const ids = reviewGroups().flatMap((x) => x.items.map((i) => i.id)); expect(new Set(ids).size).toBe(ids.length);
  });
});
