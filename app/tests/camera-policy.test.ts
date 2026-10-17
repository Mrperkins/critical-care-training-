/**
 * Lesson playback and the camera are separate: a loaded lesson may change the model, but the camera only
 * moves on the learner's request (or when they choose to follow the lesson camera).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCameraPolicy, gateControls, cameraFree } from '../src/scene/cameraPolicy';

const fakeControls = () => { const calls: (number | boolean)[][] = []; return { calls, setLookAt: vi.fn((...a: (number | boolean)[]) => { calls.push(a); return Promise.resolve(); }) as unknown as (...a: (number | boolean)[]) => Promise<void> }; };
const later = () => vi.advanceTimersByTime(2000);

describe('camera policy', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['setTimeout', 'performance', 'Date'] }); useCameraPolicy.setState({ follow: false, suggested: false, owners: [], frame: 0, rigs: 0 }); });
  it('without a lesson, the scene frames freely', () => {
    const c = fakeControls(); const undo = gateControls(c as never);
    c.setLookAt(1, 1, 1, 0, 0, 0, true); c.setLookAt(2, 2, 2, 0, 0, 0, true);
    expect(c.calls.length).toBe(2); undo();
  });
  it('while a lesson owns the model, framings become a suggestion; "Frame this view" takes it', () => {
    const c = fakeControls(); const undo = gateControls(c as never);
    c.setLookAt(1, 1, 1, 0, 0, 0, false); // the opening view
    useCameraPolicy.getState().own('director', true); later();
    expect(cameraFree()).toBe(false);
    c.setLookAt(5, 5, 5, 1, 0, 0, true);
    expect(c.calls.length).toBe(1); expect(useCameraPolicy.getState().suggested).toBe(true);
    useCameraPolicy.getState().frameNow();
    expect(c.calls.at(-1)!.slice(0, 6)).toEqual([5, 5, 5, 1, 0, 0]); expect(useCameraPolicy.getState().suggested).toBe(false);
    undo();
  });
  it('following the lesson camera restores guided framing', () => {
    const c = fakeControls(); const undo = gateControls(c as never); c.setLookAt(0, 0, 1, 0, 0, 0, false);
    useCameraPolicy.getState().own('director', true); later();
    useCameraPolicy.setState({ follow: true });
    c.setLookAt(3, 3, 3, 0, 0, 0, true); expect(c.calls.length).toBe(2); undo();
  });
  it('the first framing of a newly mounted scene always runs, and rigs are counted', () => {
    useCameraPolicy.getState().own('director', true); later();
    const c = fakeControls(); const undo = gateControls(c as never);
    expect(useCameraPolicy.getState().rigs).toBe(1);
    c.setLookAt(1, 2, 3, 0, 0, 0, false); expect(c.calls.length).toBe(1);
    undo(); expect(useCameraPolicy.getState().rigs).toBe(0);
  });
});
