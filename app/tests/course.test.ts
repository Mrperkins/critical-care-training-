/**
 * Every lesson offers a full course and an 80/20 TL;DR. These checks keep the course content in step with
 * the lessons it summarises: the TL;DR scenes exist, it is genuinely shorter, it replays the same world
 * state the full lesson has at each kept scene, and the self-check answers point at real options.
 */
import { describe, it, expect } from 'vitest';
import { VENT_LESSONS } from '../src/lessons/vent';
import { ABG_LESSONS } from '../src/lessons/abg';
import { LAB_LESSONS } from '../src/lessons/labs';
import { LINES_LESSONS } from '../src/lines/lessons';
import { LESSON_HOSTS } from '../src/director/lessonIndex';
import { DISEASES } from '../src/atlas/registry';
import { diseaseLesson } from '../src/atlas/engine';
import { MECHANISMS } from '../src/moa/registry';
import { moaTimeline } from '../src/moa/moaTimeline';
import { stepTimeline, steps, duration, type Timeline } from '../src/director/timeline';
import { courseFor, courseTimeline, hasAuthoredCourse } from '../src/director/course';
import '../src/director/courses';

const stepLessons: Timeline[] = [...VENT_LESSONS, ...ABG_LESSONS, ...LAB_LESSONS, ...LINES_LESSONS].map((l: { id: string; title: string; steps: { id: string; title: string; say: string }[] }) => stepTimeline(l.id, l.title, l.steps.map((s) => ({ ...s }))));
const core: Timeline[] = [...LESSON_HOSTS.flatMap((h) => h.timelines), ...stepLessons];

describe('courses', () => {
  it('every core lesson has a hand-written course', () => {
    const missing = core.filter((tl) => !hasAuthoredCourse(tl.id)).map((tl) => tl.id);
    expect(missing).toEqual([]);
  });
  const all = [...core, ...DISEASES.map((d) => diseaseLesson(d, () => undefined)), ...MECHANISMS.map((m) => moaTimeline(m))];
  it.each(all.map((tl) => [tl.id, tl] as const))('%s: TL;DR is a real, shorter subset with valid content', (_id, tl) => {
    const meta = courseFor(tl)!; expect(meta).toBeTruthy();
    const ids = new Set(steps(tl).map((c) => c.id));
    for (const e of meta.essentials) expect(ids.has(e), `${tl.id}: unknown scene ${e}`).toBe(true);
    expect(meta.keyPoints.length).toBeGreaterThanOrEqual(2);
    const tldr = courseTimeline(tl, 'tldr', meta);
    expect(steps(tldr).length).toBe(meta.essentials.length);
    if (steps(tl).length > 2) expect(duration(tldr)).toBeLessThan(duration(tl));
    for (const s of meta.selfCheck ?? []) { expect(s.answer).toBeGreaterThanOrEqual(0); expect(s.answer).toBeLessThan(s.options.length); }
    for (const k of Object.keys(meta.checkpoints ?? {})) expect(ids.has(k), `${tl.id}: checkpoint on unknown scene ${k}`).toBe(true);
    // the full track keeps every scene, in order, with the same ids
    expect(steps(courseTimeline(tl, 'full', meta)).map((c) => c.id)).toEqual(steps(tl).map((c) => c.id));
  });
  it('a TL;DR scene rebuilds the same world the full lesson has at that moment', () => {
    let world: number[] = [];
    const tl: Timeline = { id: 't', title: 't', setup: () => { world = []; }, cues: [
      { id: 'a', at: 0, dur: 2, say: 'one', apply: () => world.push(1) },
      { id: 'b', at: 3, dur: 2, say: 'two', apply: () => world.push(2) },
      { id: 'c', at: 6, dur: 2, say: 'three', apply: () => world.push(3) },
    ] };
    const tldr = courseTimeline(tl, 'tldr', { objectives: [], essentials: ['c'], keyPoints: ['x', 'y'] });
    tldr.cues[0].apply!(); expect(world).toEqual([1, 2, 3]);
  });
});

describe('full-course checkpoints', () => {
  it('every core lesson has at least one pause-and-predict prompt on a real scene', async () => {
    const { CHECKPOINTS } = await import('../src/director/courses/checkpoints');
    for (const tl of core) {
      const full = courseTimeline(tl, 'full', courseFor(tl));
      expect(steps(full).filter((c) => c.checkpoint).length, tl.id).toBeGreaterThanOrEqual(1);
    }
    const ids = new Map(core.map((tl) => [tl.id, new Set(steps(tl).map((c) => c.id))]));
    for (const [id, cps] of Object.entries(CHECKPOINTS)) { expect(ids.has(id), id).toBe(true); for (const k of Object.keys(cps)) expect(ids.get(id)!.has(k), `${id}/${k}`).toBe(true); }
  });
});
