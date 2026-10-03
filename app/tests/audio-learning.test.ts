import { describe, expect, it } from 'vitest';
import { parseHandsFree } from '../src/audio/handsfree';
import { duePrompts, nextIntervalDays, reviewDue } from '../src/audio/review';
import { recommendedEpisode, recommendedRep } from '../src/audio/recommend';
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
    expect(reviewDue(undefined)).toBe(true);
  });
  it('builds a due queue', () => {
    expect(duePrompts({}).length).toBeGreaterThan(0);
  });
  it('can recommend both listening and procedural rehearsal from mastery state', () => {
    const mastery: Record<string, MasteryState> = {
      'rv-failure': { concept:'rv-failure', exposures:4, correct:1, confidence:[90], lastSeen:'2020-01-01T00:00:00.000Z' },
    };
    expect(recommendedEpisode(mastery, {})).toBeTruthy();
    expect(recommendedRep(mastery, {})).toBeTruthy();
  });
});
