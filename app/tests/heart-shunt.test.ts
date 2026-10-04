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

import * as THREE from 'three';
import { holesFor, inHole, lesionShape, pinch, LM, SEPTUM_N, ATRIAL_N, flowPaths, holeRadius } from '../src/heart/heartGeometry';
import { autoCut } from '../src/heart/HeartScene';

describe('tetralogy and coarctation physiology', () => {
  it('ToF: parallel outlets — more outflow narrowing or lower SVR → less lung flow, lower saturation; RV at systemic pressure', () => {
    const pink = solveShunt(HEART_PRESETS.pinkTet), tof = solveShunt(HEART_PRESETS.tof), spell = solveShunt(HEART_PRESETS.tetSpell);
    expect(pink.qpqs).toBeGreaterThan(tof.qpqs); expect(tof.qpqs).toBeGreaterThan(spell.qpqs);
    expect(pink.sat.ao).toBeGreaterThan(0.94); expect(tof.flags.cyanosis).toBe(true); expect(spell.flags.spell).toBe(true); expect(spell.sat.ao).toBeLessThan(0.6);
    expect(tof.p.rvSys).toBeCloseTo(tof.p.lvSys, 5); expect(tof.rvot!.gradient).toBeGreaterThan(50);
    const squat = solveShunt({ ...HEART_PRESETS.tetSpell, svr: 24 }); expect(squat.sat.ao).toBeGreaterThan(spell.sat.ao + 0.15); // raising SVR (knee-chest, phenylephrine) helps
  });
  it('coarctation: arm > leg pressure, gradient rises with severity; LV pressure load', () => {
    const mild = solveShunt({ ...HEART_PRESETS.coarct, coarct: 0.3 }), sev = solveShunt({ ...HEART_PRESETS.coarct, coarct: 0.75 });
    expect(sev.coarct!.armSys).toBeGreaterThan(sev.coarct!.legSys + 20); expect(sev.coarct!.gradient).toBeGreaterThan(mild.coarct!.gradient); expect(sev.flags.lvPressure).toBe(true);
  });
  it('newborn critical coarctation: open duct feeds the lower body right-to-left (differential cyanosis); closing duct → hypoperfusion', () => {
    const open = solveShunt(HEART_PRESETS.coarctNeoDuct), closed = solveShunt(HEART_PRESETS.coarctNeoClosed);
    expect(open.direction).toBe('R→L'); expect(open.sat.aoPost).toBeLessThan(open.sat.ao - 0.1); expect(open.coarct!.lowerFrac).toBeGreaterThan(closed.coarct!.lowerFrac + 0.3);
    expect(closed.flags.lowerHypoperfusion).toBe(true);
  });
});

describe('defects drawn into the real heart', () => {
  it('VSD sits in the septum, between the ventricles, sized to scale', () => {
    const h = holesFor(HEART_PRESETS.vsdLarge)[0]; expect(h.id).toBe('vsd'); expect(h.meshes).toEqual(['septum', 'lv', 'rv']);
    expect(h.r).toBeCloseTo(0.06, 3); expect(inHole(h.c.clone(), h)).toBe(true); expect(inHole(h.c.clone().addScaledVector(SEPTUM_N, 0.2), h)).toBe(false);
    const mus = holesFor({ ...HEART_PRESETS.vsdLarge, vsdSite: 'muscular' })[0]; expect(mus.c.distanceTo(LM.vsdMuscular)).toBe(0); expect(mus.c.y).toBeLessThan(h.c.y); // muscular is lower, toward the apex
  });
  it('ASD goes through both atrial walls at the fossa ovalis; a closed PFO is a narrow slit', () => {
    const a = holesFor(HEART_PRESETS.asd)[0]; expect(a.meshes).toEqual(['ra', 'la']); expect(a.ax.dot(ATRIAL_N)).toBeCloseTo(1, 5);
    const pfo = holesFor(HEART_PRESETS.pfo, solveShunt(HEART_PRESETS.pfo))[0], open = holesFor(HEART_PRESETS.pfoValsalva, solveShunt(HEART_PRESETS.pfoValsalva))[0];
    expect(pfo.squash).toBeGreaterThan(1); expect(open.r).toBeGreaterThan(pfo.r);
    expect(holeRadius(5, true)).toBeCloseTo(holeRadius(5, false) * 2.5, 6); // newborn defects drawn relative to a smaller heart
  });
  it('ToF and coarctation reshape the anatomy; normal heart is untouched', () => {
    const n = lesionShape(HEART_PRESETS.normal, solveShunt(HEART_PRESETS.normal)); expect(n).toEqual({ coarct: 0, rvot: 0, override: 0, rvWall: 0 });
    const t = lesionShape(HEART_PRESETS.tof, solveShunt(HEART_PRESETS.tof)); expect(t.override).toBe(1); expect(t.rvot).toBeGreaterThan(0.3); expect(t.rvWall).toBeGreaterThan(0.02);
    const c = lesionShape(HEART_PRESETS.coarct, solveShunt(HEART_PRESETS.coarct)); expect(c.coarct).toBeGreaterThan(0.5);
  });
  it('pinch narrows a tube around its axis and leaves far vertices alone', () => {
    // a ring at the centre of the narrowing and one far away along a test axis
    const ax = new THREE.Vector3(0, 1, 0); const ring = (dy: number) => { const p: number[] = []; for (let a = 0; a < 12; a++) { const t = (a / 12) * Math.PI * 2; p.push(0.06 * Math.cos(t), dy, 0.06 * Math.sin(t)); } return p; };
    const out = pinch(new Float32Array([...ring(0), ...ring(0.5)]), new THREE.Vector3(), ax, 0.07, 0.12, 0.6);
    expect(Math.hypot(out[0], out[2])).toBeLessThan(0.03); expect(Math.hypot(out[36], out[38])).toBeCloseTo(0.06, 5);
  });
  it('every flow path is a usable polyline, and the camera opens the heart to suit the focus', () => {
    for (const [k, ws] of Object.entries(flowPaths({ coarct: 0.5, rvot: 0.4, override: 1, rvWall: 0.02 }))) { expect(ws.length, k).toBeGreaterThan(2); for (const w of ws) expect(Number.isFinite(w.p.x + w.p.y + w.p.z) && w.r > 0, k).toBe(true); }
    expect(autoCut('heart.vsd')).toBe('rv'); expect(autoCut('heart.asd')).toBe('ra'); expect(autoCut('heart.pda')).toBe('closed'); expect(autoCut('heart.coarct')).toBe('closed'); expect(autoCut('heart.four_chamber')).toBe('slice');
  });
});
