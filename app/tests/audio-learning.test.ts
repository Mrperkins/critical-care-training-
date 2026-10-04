import { describe, expect, it } from 'vitest';
import { parseHandsFree } from '../src/audio/handsfree';
import { duePrompts, nextIntervalDays, reviewDue } from '../src/audio/review';
import { recommendedEpisode, recommendedRep } from '../src/audio/recommend';
import { buildLearningPath } from '../src/audio/pathway';
import type { MasteryState } from '../src/audio/types';

describe('audio adaptive learning', () => {
  it('parses core hands-free commands deterministically', () => {
    expect(parseHandsFree('pause please')).toBe('pause');
    expect(parseHandsFree('say that again')).toBe('repeat');
    expect(parseHandsFree('go deeper')).toBe('deeper');
    expect(parseHandsFree('quiz me on that')).toBe('review');
    expect(parseHandsFree('something unrelated')).toBe('unknown');
  });
  it('reviews weak or uncertain concepts sooner', () => {
    const weak: MasteryState = { concept:'x', exposures:4, correct:1, confidence:[90], lastSeen:new Date().toISOString() };
    const strong: MasteryState = { concept:'x', exposures:7, correct:7, confidence:[90,100], lastSeen:new Date().toISOString() };
    expect(nextIntervalDays(weak)).toBe(1);
    expect(nextIntervalDays(strong)).toBe(30);
    expect(reviewDue(undefined)).toBe(false);
  });
  it('only schedules review after a concept has been exposed', () => {
    expect(duePrompts({})).toHaveLength(0);
    const old: MasteryState = { concept:'rv-failure', exposures:1, correct:0, confidence:[], lastSeen:'2020-01-01T00:00:00.000Z' };
    expect(duePrompts({ 'rv-failure': old }).some((q) => q.concept === 'rv-failure')).toBe(true);
  });
  it('builds a multimodal path around a mastery concept', () => {
    const steps = buildLearningPath('rv-failure');
    expect(steps.length).toBeGreaterThan(1);
    expect(steps.some((x) => x.kind === 'listen')).toBe(true);
    expect(steps.some((x) => x.kind === 'visual')).toBe(true);
  });

  it('can recommend both listening and procedural rehearsal from mastery state', () => {
    const mastery: Record<string, MasteryState> = {
      'rv-failure': { concept:'rv-failure', exposures:4, correct:1, confidence:[90], lastSeen:'2020-01-01T00:00:00.000Z' },
    };
    expect(recommendedEpisode(mastery, {})).toBeTruthy();
    expect(recommendedRep(mastery, {})).toBeTruthy();
  });
});
