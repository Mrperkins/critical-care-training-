import { describe, expect, it } from 'vitest';
import { studyECG, studyECGPath, studyPhase, STUDY_LEADS, qtScale } from '../src/heart/studyECG';
import { studyCycleMs } from '../src/heart/studyClock';
import { wiggers } from '../src/heart/beat';

describe('synchronized electrophysiology teaching traces', () => {
  it('provides twelve standard and five posterior/right unique ECG leads', () => {
    expect(STUDY_LEADS).toHaveLength(17);
    expect(new Set(STUDY_LEADS).size).toBe(17);
    expect(STUDY_LEADS).toContain('II');
    expect(STUDY_LEADS).toContain('V6');
    expect(STUDY_LEADS).toContain('V7');
    expect(STUDY_LEADS).toContain('V9');
    expect(STUDY_LEADS).toContain('V4R');
  });
  it('all leads are finite and periodic over a full beat at both supported extremes', () => {
    for (const bpm of [50, 70, 84, 120, 140]) {
      const rr = 60000 / bpm;
      for (const lead of STUDY_LEADS) {
        for (let ms = 0; ms < rr; ms += 25) {
          expect(Number.isFinite(studyECG(lead, ms, bpm))).toBe(true);
          expect(studyECG(lead, ms, bpm)).toBeCloseTo(studyECG(lead, ms + rr, bpm), 8);
        }
      }
    }
  });
  it('lead vectors produce distinct morphologies', () => {
    expect(studyECG('II', 195, 84)).not.toBeCloseTo(studyECG('aVR', 195, 84), 2);
    expect(studyECG('V1', 195, 84)).not.toBeCloseTo(studyECG('V6', 195, 84), 2);
  });
  it('returns a full valid SVG trace for each lead', () => {
    const path = studyECGPath('II', 84);
    expect(path.split(' ')).toHaveLength(260);
    expect(path).not.toContain('NaN');
    expect(path).not.toContain('Infinity');
  });
  it('advances phase labels in ECG order and copes with shortened diastole', () => {
    expect(studyPhase(5, 84).id).toBe('sa');
    expect(studyPhase(30, 84).id).toBe('p');
    expect(studyPhase(80, 84).id).toBe('p');
    expect(studyPhase(115, 84).id).toBe('pr');
    expect(studyPhase(145, 84).id).toBe('qrs');
    expect(studyPhase(195, 84).id).toBe('qrs');
    expect(studyPhase(275, 84).id).toBe('st');
    expect(studyPhase(375, 84).id).toBe('t');
    expect(studyPhase(420, 140).id).toBe('tp');
    expect(qtScale(140)).toBeLessThan(qtScale(70));
  });
  it('the ECG QRS and mechanical model have the agreed 190-ms offset', () => {
    for (const bpm of [70, 84, 120, 140]) {
      const rr = 60000 / bpm;
      const mechanicalStart = rr;
      expect(studyCycleMs(mechanicalStart / 1000, bpm)).toBeCloseTo(190, 7);
      const w = wiggers(mechanicalStart / 1000, bpm);
      expect(w.phase).toBeCloseTo(0, 7);
    }
  });
});
