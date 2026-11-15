// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
vi.hoisted(() => { (window as unknown as { matchMedia: unknown }).matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} }); });
import { computeLessonMinutes } from '../src/library/lessonMinutesCompute';
import { LESSON_MINUTES } from '../src/library/lessonMinutes';
import { MODULES } from '../src/library/modules';

describe('library lesson lengths', () => {
  it('match what the player reports (run `npx tsx scripts/gen-lesson-minutes.ts` after editing scripts)', async () => {
    expect(LESSON_MINUTES).toEqual(await computeLessonMinutes());
  });
  it('every module lesson step uses its real length', () => {
    for (const m of MODULES) for (const s of m.steps) if (s.kind === 'lesson') expect(s.minutes, s.ref).toBe(LESSON_MINUTES[s.ref]);
  });
});
