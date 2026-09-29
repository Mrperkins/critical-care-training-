import { describe, it, expect } from 'vitest';
import { resolve, advance, stepIndexAt, stepTimeline, duration, targetAt, type Timeline } from '../src/director/timeline';
import { TIME_IS_BRAIN } from '../src/director/lessons/neuro';
import { useNeuroUI } from '../src/neuro/neuroStore';
import { neuroSummary } from '../src/neuro/perfusion';

function world() {
  const w = { a: 0, b: 0, log: [] as string[] };
  const tl: Timeline = { id: 't', title: 'T', setup: () => { w.a = 0; w.b = 0; w.log = []; }, cues: [
    { id: 'c1', at: 0, say: 'one', apply: () => { w.a = 1; w.log.push('c1'); } },
    { id: 'c2', at: 2, dur: 4, say: 'two', tween: (u) => { w.b = 10 * u; } },
    { id: 'c3', at: 7, say: 'three', target: 'lung.alveolus', apply: () => { w.a = 3; w.log.push('c3'); } },
  ] };
  return { w, tl };
}

describe('Lesson Director timeline', () => {
  it('seeking rebuilds the same world as playing there', () => {
    const { w, tl } = world();
    resolve(tl, 0); for (let i = 0; i < 50; i++) advance(tl, i * 0.1, (i + 1) * 0.1);
    const played = { a: w.a, b: w.b };
    resolve(tl, 5); expect({ a: w.a, b: w.b }).toEqual(played);
    expect(w.b).toBeCloseTo(7.5, 5);
  });
  it('seeking backwards undoes later cues', () => {
    const { w, tl } = world(); resolve(tl, 8); expect(w.a).toBe(3); resolve(tl, 1); expect(w.a).toBe(1); expect(w.b).toBe(0); expect(w.log).toEqual(['c1']);
  });
  it('steps, duration and camera targets', () => {
    const { tl } = world(); expect(duration(tl)).toBe(7); expect(stepIndexAt(tl, 3)).toBe(1); expect(targetAt(tl, 6.9)).toBeNull(); expect(targetAt(tl, 7)).toBe('lung.alveolus');
  });
  it('step lessons are absolute: seeking applies only the latest step', () => {
    const calls: number[] = []; const tl = stepTimeline('s', 'S', [0, 1, 2].map((k) => ({ id: `s${k}`, say: 'a few words here', apply: () => calls.push(k) })));
    resolve(tl, tl.cues[2].at + 0.1); expect(calls).toEqual([2]);
  });
  it('the Time-is-brain lesson is deterministic and freezes the core after reperfusion', () => {
    resolve(TIME_IS_BRAIN, 70); const a = JSON.stringify(useNeuroUI.getState().state);
    resolve(TIME_IS_BRAIN, 20); resolve(TIME_IS_BRAIN, 70); expect(JSON.stringify(useNeuroUI.getState().state)).toBe(a);
    const st = useNeuroUI.getState().state; expect(st.recanalizedAt).toBe(240); expect(st.minutes).toBeGreaterThan(240);
    const coreAt = (m: number) => neuroSummary({ ...st, minutes: m }).coreMl; expect(coreAt(300)).toBeCloseTo(coreAt(480), 6);
    resolve(TIME_IS_BRAIN, 50); expect(useNeuroUI.getState().sys.map).toBe(60); resolve(TIME_IS_BRAIN, 60); expect(useNeuroUI.getState().sys.map).toBe(90);
  });
});
