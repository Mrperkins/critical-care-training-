import { beforeEach, describe, expect, it } from 'vitest';
import { studyCycleMs, teachingLeadII, useStudyClock } from '../src/heart/studyClock';

describe('linked cardiac study clock', () => {
  beforeEach(() => useStudyClock.getState().set({ seconds: 0, running: true, speed: 1, enabled: true, heartRate: 84 }));
  it('preserves original full-speed behavior when study mode is disabled', () => {
    useStudyClock.getState().set({ enabled: false, running: false, speed: 0.1 });
    expect(useStudyClock.getState().advance(0.02)).toBeCloseTo(0.02);
  });
  it('pauses and advances all visuals from one deterministic time', () => {
    useStudyClock.getState().set({ running: false });
    expect(useStudyClock.getState().advance(0.02)).toBe(0);
    useStudyClock.getState().set({ running: true, speed: 0.25 });
    expect(useStudyClock.getState().advance(0.02)).toBeCloseTo(0.005);
  });
  it('changes playback speed without changing physiological HR', () => {
    useStudyClock.getState().set({ speed: 2, heartRate: 84 });
    expect(useStudyClock.getState().advance(0.02)).toBeCloseTo(0.04);
    expect(useStudyClock.getState().heartRate).toBe(84);
  });
  it('wraps cycle time correctly, including at negative scrub times', () => {
    const rr = 60000 / 84;
    expect(studyCycleMs(0, 84)).toBeCloseTo(190);
    expect(studyCycleMs(rr / 1000, 84)).toBeCloseTo(190);
    expect(studyCycleMs(-0.19, 84)).toBeCloseTo(0);
  });
  it('produces finite illustrative samples across the cycle', () => {
    for (let i = 0; i < 800; i += 4) expect(Number.isFinite(teachingLeadII(i, 84))).toBe(true);
    expect(teachingLeadII(194, 84)).toBeGreaterThan(teachingLeadII(140, 84));
  });
});
