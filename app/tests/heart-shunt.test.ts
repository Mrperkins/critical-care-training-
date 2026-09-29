import { describe, it, expect } from 'vitest';
import { solveShunt, HEART_PRESETS } from '../src/heart/shunt';

describe('congenital shunt model', () => {
  it('normal heart: no shunt, Qp = Qs, normal pressures and saturations', () => {
    const s = solveShunt(HEART_PRESETS.normal); expect(s.direction).toBe('none'); expect(s.qpqs).toBeCloseTo(1, 5);
    expect(s.p.paMean).toBeGreaterThan(10); expect(s.p.paMean).toBeLessThan(20); expect(s.sat.ao).toBeGreaterThan(0.96); expect(s.sat.pa).toBeLessThan(0.8);
  });
  it('VSD: LV → RV when LV pressure is higher; flow grows with defect size; small defects are fast jets', () => {
    const sizes = [2, 4, 8, 12, 18].map((sizeMm) => solveShunt({ lesion: 'vsd', sizeMm, pvr: 1.5, svr: 18 }));
    sizes.forEach((s) => expect(s.direction).toBe('L→R'));
    for (let i = 1; i < sizes.length; i++) expect(sizes[i].qpqs).toBeGreaterThan(sizes[i - 1].qpqs);
    expect(sizes[0].velocity).toBeGreaterThan(sizes[4].velocity); expect(sizes[1].velocity).toBeGreaterThan(4);
  });
  it('VSD: rising PVR narrows the gradient, then bidirectional, then right-to-left with cyanosis', () => {
    const r = [1.5, 4, 8, 11, 18].map((pvr) => solveShunt({ lesion: 'vsd', sizeMm: 12, pvr, svr: 18 }));
    for (let i = 1; i < r.length; i++) expect(r[i].p.lvSys - r[i].p.rvSys).toBeLessThan(r[i - 1].p.lvSys - r[i - 1].p.rvSys);
    expect(r[0].direction).toBe('L→R'); expect(r[3].direction).toBe('bidirectional'); expect(r[4].direction).toBe('R→L');
    expect(r[4].flags.eisenmenger).toBe(true); expect(r[4].sat.ao).toBeLessThan(0.92); expect(r[0].flags.overcirculation).toBe(true);
  });
  it('VSD loads the LEFT heart (LA/LV volume); ASD loads the RIGHT heart (RA/RV volume)', () => {
    const v = solveShunt(HEART_PRESETS.vsdLarge), a = solveShunt(HEART_PRESETS.asd);
    expect(v.flags.lvVolume).toBe(true); expect(v.flags.rvVolume).toBe(false); expect(v.flags.rvPressure).toBe(true);
    expect(a.flags.rvVolume).toBe(true); expect(a.flags.lvVolume).toBe(false); expect(a.sat.ra).toBeGreaterThan(a.sat.sv + 0.05);
  });
  it('ASD: low-velocity flow; reverses as PVR rises', () => {
    const lo = solveShunt({ lesion: 'asd', sizeMm: 16, pvr: 1.5, svr: 18 }), hi = solveShunt({ lesion: 'asd', sizeMm: 16, pvr: 16, svr: 18 });
    expect(lo.velocity).toBeLessThan(1.2); expect(lo.net).toBeGreaterThan(3); expect(hi.net).toBeLessThan(0); expect(lo.sat.ao).toBeGreaterThan(0.95);
  });
  it('PFO: closed at rest; right-to-left only when right atrial pressure rises', () => {
    const rest = solveShunt(HEART_PRESETS.pfo), val = solveShunt(HEART_PRESETS.pfoValsalva);
    expect(rest.direction).toBe('none'); expect(val.direction).toBe('R→L'); expect(val.lr).toBe(0); expect(val.sat.ao).toBeLessThan(rest.sat.ao);
  });
  it('PDA: continuous aorta → PA flow; with high PVR the lower body desaturates (differential cyanosis)', () => {
    const lo = solveShunt(HEART_PRESETS.pda), hi = solveShunt({ lesion: 'pda', sizeMm: 5, pvr: 20, svr: 18 });
    expect(lo.direction).toBe('L→R'); expect(lo.sat.pa).toBeGreaterThan(lo.sat.sv + 0.05); expect(lo.flags.lvVolume).toBe(true);
    expect(hi.sat.aoPost).toBeLessThan(hi.sat.ao - 0.02);
  });
});

import { resolve, duration } from '../src/director/timeline';
import { VSD_LESSON } from '../src/director/lessons/heart';
import { useHeartUI } from '../src/heart/heartStore';
import { CAMERA_TARGETS } from '../src/scene/cameraTargets';

describe('VSD lesson', () => {
  const st = (t: number) => { resolve(VSD_LESSON, t); return solveShunt(useHeartUI.getState().input); };
  it('small loud jet → large overcirculating shunt → reversal → repair', () => {
    const small = st(20), large = st(44), late = st(81), fixed = st(92);
    expect(small.velocity).toBeGreaterThan(large.velocity); expect(large.qpqs).toBeGreaterThan(small.qpqs + 0.8);
    expect(large.flags.lvVolume).toBe(true); expect(late.direction).toBe('R→L'); expect(late.flags.cyanosis).toBe(true); expect(fixed.direction).toBe('none');
    expect(useHeartUI.getState().mode).toBe('sat'); st(20); expect(useHeartUI.getState().mode).toBe('doppler');
  });
  it('progression tween is monotone and seek is exact', () => {
    const pv = [66, 70, 74, 78].map((t) => st(t).input.pvr); for (let i = 1; i < pv.length; i++) expect(pv[i]).toBeGreaterThan(pv[i - 1]);
    const a = JSON.stringify(st(72).input); st(10); expect(JSON.stringify(st(72).input)).toBe(a); expect(duration(VSD_LESSON)).toBeGreaterThan(90);
  });
  it('all semantic heart targets are registered', () => { for (const id of ['heart.septum', 'heart.vsd', 'heart.asd', 'heart.pfo', 'heart.lv', 'heart.rv', 'heart.pulmonary_outflow']) expect((CAMERA_TARGETS as Record<string, unknown>)[id], id).toBeTruthy(); });
});
