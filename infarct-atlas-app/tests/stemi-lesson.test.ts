import { describe, it, expect } from 'vitest';
import { STEMI_CULPRIT } from '../src/lesson/stemi';
import { resolve, duration } from '../src/lesson/timeline';
import { useApp } from '../src/engine/store';
import { TERRITORY } from '../src/data/territories';
import { primaryCulprit } from '../src/data/lessons';
import { stDeviationMm, qDepthMm, sample } from '../src/ecg/ecgModel';

const at = (id: string) => { const c = STEMI_CULPRIT.cues.find((x) => x.id === id)!; resolve(STEMI_CULPRIT, c.at + 0.1); return useApp.getState(); };
describe('STEMI culprit lesson', () => {
  it('inferior STEMI: culprit is the RCA when right-dominant and the circumflex when left-dominant', () => {
    const r = at('dom1'), l = at('dom2');
    expect(primaryCulprit(TERRITORY[r.territoryId!], r.dominance).vessel).toMatch(/RCA/);
    expect(primaryCulprit(TERRITORY[l.territoryId!], l.dominance).vessel).toMatch(/LCx/);
  });
  it('reciprocal and posterior/RV extra leads are shown when taught', () => { expect(at('inf2').scene.emphasizeReciprocal).toBe(true); expect(at('post').scene.showExtraLeads).toBe(true); expect(at('rv').territoryId).toBe('rv'); });
  it('reperfusion: artery open, ST elevation resolves, Q waves remain, T inverts', () => {
    const s = at('rep'); const p = TERRITORY[s.territoryId!].ecgPattern; const lead = TERRITORY[s.territoryId!].affectedLeads[1];
    expect(s.scene.occlusion).toBe(0); expect(s.scene.reperfusion).toBe(1);
    const stOcc = stDeviationMm(lead, p, 1, 0), stRep = stDeviationMm(lead, p, 1, 1);
    expect(stOcc).toBeGreaterThan(1); expect(stRep).toBeLessThan(stOcc * 0.4);
    expect(qDepthMm(lead, p, 1, 1)).toBeCloseTo(qDepthMm(lead, p, 1, 0), 2);
    const tPeak = (rep: number) => { let m = 0; for (let t = 0.3; t < 0.5; t += 0.002) { const v = sample(lead, t, p, 1, rep) - sample(lead, 0.3, null, 0, 0); if (Math.abs(v) > Math.abs(m)) m = v; } return m; };
    expect(tPeak(1)).toBeLessThan(tPeak(0));
  });
  it('seeks exactly and lasts about two minutes', () => { resolve(STEMI_CULPRIT, 60); const a = JSON.stringify(useApp.getState().scene); resolve(STEMI_CULPRIT, 5); resolve(STEMI_CULPRIT, 60); expect(JSON.stringify(useApp.getState().scene)).toBe(a); expect(duration(STEMI_CULPRIT)).toBeGreaterThan(100); });
});
