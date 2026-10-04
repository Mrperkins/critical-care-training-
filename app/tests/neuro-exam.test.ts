import { describe, it, expect } from 'vitest';
import { neuroExam, examOutcomes } from '../src/neuro/exam';
import { presetState } from '../src/neuro/neuroStore';
import { emptyNeuro } from '../src/neuro/perfusion';

const ex = (id: Parameters<typeof presetState>[0], minutes = 60) => neuroExam({ ...presetState(id), minutes });
describe('synthetic neuro exam from the lesion state', () => {
  it('normal is normal', () => { const e = neuroExam(emptyNeuro()); expect(e.nihss.total).toBe(0); expect(e.findings).toHaveLength(0); });
  it('left M1: right hemiparesis, left gaze deviation, aphasia (dominant); right M1: left hemiparesis and neglect, no aphasia', () => {
    const l = ex('m1_L'), r = ex('m1_R');
    expect(l.power.armR).toBeLessThan(4); expect(l.power.armL).toBe(5); expect(l.gaze.deviation).toBe('L'); expect(l.aphasia).not.toBe('none'); expect(l.face.side).toBe('R');
    expect(r.power.armL).toBeLessThan(4); expect(r.neglect).toBe('L'); expect(r.aphasia).toBe('none'); expect(r.gaze.deviation).toBe('R');
  });
  it('MCA divisions differ: superior → expressive aphasia and arm > leg; inferior → receptive aphasia with field defect, strength spared', () => {
    const sup = ex('m2s_L'), inf = neuroExam({ ...presetState('m1_L'), occlusion: { m2i_L: 1 }, minutes: 60 });
    expect(sup.aphasia).toBe('expressive'); expect(sup.power.armR).toBeLessThan(sup.power.legR);
    expect(inf.aphasia).toBe('receptive'); expect(inf.power.armR).toBe(5); expect(inf.hemianopia).toBe('R');
  });
  it('PCA → isolated contralateral hemianopia; basilar → coma, bilateral weakness, gaze palsy', () => {
    const p = ex('p2_R'), b = ex('basilar');
    expect(p.hemianopia).toBe('L'); expect(p.power).toEqual({ armR: 5, legR: 5, armL: 5, legL: 5 });
    expect(b.gcs).toBeLessThan(9); expect(b.gaze.palsy).toBe(true); expect(b.power.armL).toBeLessThan(3); expect(b.power.armR).toBeLessThan(3);
  });
  it('reperfusion recovers the penumbra but the core deficit remains (identical starting state)', () => {
    const o = examOutcomes({ ...presetState('m1_L'), minutes: 90 });
    expect(o.reopened!.nihss.total).toBeLessThan(o.never!.nihss.total); expect(o.reopened!.nihss.total).toBeGreaterThan(0);
    const late = examOutcomes({ ...presetState('m1_L'), minutes: 360 }); expect(late.reopened!.nihss.total).toBeGreaterThan(o.reopened!.nihss.total);
  });
  it('collateral quality and haemorrhage change the exam', () => {
    const good = neuroExam({ ...presetState('m1_L'), collaterals: 'good', minutes: 60 }), poor = neuroExam({ ...presetState('m1_L'), collaterals: 'poor', minutes: 60 });
    expect(neuroExam({ ...presetState('m1_L'), collaterals: 'good', minutes: 1440, recanalizedAt: 60 }).nihss.total).toBeLessThan(neuroExam({ ...presetState('m1_L'), collaterals: 'poor', minutes: 1440, recanalizedAt: 60 }).nihss.total);
    expect(good.nihss.total).toBeGreaterThan(0); expect(poor.nihss.total).toBeGreaterThan(0);
    const ich = ex('ich', 0); expect(ich.power.armR).toBeLessThan(5); expect(ich.power.armL).toBe(5);
  });
});
