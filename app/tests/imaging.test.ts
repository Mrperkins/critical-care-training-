import { describe, it, expect } from 'vitest';
import { type NeuroState } from '../src/neuro/perfusion';
import { presetState, useNeuroUI } from '../src/neuro/neuroStore';
import { STROKE_TIME_MACHINE } from '../src/director/lessons/neuro';
import { resolve, duration } from '../src/director/timeline';
import { selectNeuroRealFinding } from '../src/neuro/imaging/realReference';

const m1 = (min: number): NeuroState => ({ ...presetState('m1_L'), minutes: min });

describe('stroke time machine', () => {
  it('reperfusion at 150 min freezes the core; the lesson seeks exactly', () => {
    resolve(STROKE_TIME_MACHINE, duration(STROKE_TIME_MACHINE)); const s = useNeuroUI.getState().state; expect(s.recanalizedAt).toBe(150); expect(s.minutes).toBe(1440);
    const a = JSON.stringify(s); resolve(STROKE_TIME_MACHINE, 20); resolve(STROKE_TIME_MACHINE, duration(STROKE_TIME_MACHINE)); expect(JSON.stringify(useNeuroUI.getState().state)).toBe(a);
    resolve(STROKE_TIME_MACHINE, 30); expect(useNeuroUI.getState().view).toBe('imaging');
  });
});


describe('state-matched real neuro references', () => {
  it('moves an unreperfused MCA stroke through vessel, mismatch, early and established references', () => {
    expect(selectNeuroRealFinding(m1(20))?.id).toBe('stroke-hmcas-2025');
    expect(selectNeuroRealFinding(m1(120))?.id).toBe('stroke-ctp-mismatch-2025');
    expect(selectNeuroRealFinding(m1(300))?.id).toBe('stroke-early-change-2025');
    expect(selectNeuroRealFinding(m1(1440))?.id).toBe('stroke-infarct-24h-2025');
  });

  it('does not imply persistent perfusion mismatch after early reperfusion', () => {
    const st = { ...m1(240), recanalizedAt: 90 };
    expect(selectNeuroRealFinding(st)?.id).toBe('stroke-early-change-2025');
  });

  it('maps haemorrhage only to findings actually present in state', () => {
    expect(selectNeuroRealFinding(presetState('ich'))?.id).toBe('ich-deep-locations-2016');
    expect(selectNeuroRealFinding(presetState('sah'))?.id).toBe('sah-ct-mirza');
  });

  it('withholds MCA references from posterior-circulation states', () => {
    expect(selectNeuroRealFinding(presetState('basilar'))).toBeNull();
    expect(selectNeuroRealFinding(presetState('p2_R'))).toBeNull();
  });
});
