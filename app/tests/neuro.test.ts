import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { emptyNeuro, neuroSummary, territoryStates, timeToInfarct, hemorrhageShape, type NeuroState } from '../src/neuro/perfusion';
import { buildCerebralVessels, territoryAt, DEFAULT_BRAIN_FRAME, toLocal } from '../src/neuro/anatomy';

const st = (p: Partial<NeuroState>): NeuroState => ({ ...emptyNeuro(), ...p });

describe('cerebral anatomy', () => {
  const vs = buildCerebralVessels();
  it('has the named Circle of Willis and posterior circulation vessels', () => {
    for (const id of ['ica_R', 'ica_L', 'a1_R', 'a1_L', 'acom', 'pcom_R', 'pcom_L', 'p1_R', 'p1_L', 'p2_L', 'm1_L', 'm2s_L', 'm2i_L', 'a2_L', 'basilar', 'vert_R', 'vert_L'])
      expect(vs.find((v) => v.id === id), id).toBeTruthy();
  });
  it('circle vessels sit at the base of the brain and cortical branches stay inside it', () => {
    vs.filter((v) => v.kind === 'circle').forEach((v) => v.pts.forEach((p) => expect(toLocal(DEFAULT_BRAIN_FRAME, p).y).toBeLessThan(-0.45)));
    vs.filter((v) => v.kind === 'cortical').forEach((v) => expect(toLocal(DEFAULT_BRAIN_FRAME, v.pts[v.pts.length - 1]).length(), v.id).toBeLessThan(1.02));
  });
  it('maps points to the expected territories', () => {
    expect(territoryAt(new THREE.Vector3(0.85, 0, 0.1))).toBe('MCA_L');
    expect(territoryAt(new THREE.Vector3(-0.85, 0, 0.1))).toBe('MCA_R');
    expect(territoryAt(new THREE.Vector3(0.1, 0.3, 0.5))).toBe('ACA_L');
    expect(territoryAt(new THREE.Vector3(-0.2, -0.1, -0.85))).toBe('PCA_R');
    expect(territoryAt(new THREE.Vector3(0.1, -0.8, -0.5))).toBe('VB');
  });
});

describe('cerebral perfusion primitives', () => {
  it('no occlusion → no core, no penumbra', () => {
    const s = neuroSummary(st({ minutes: 600 })); expect(s.coreMl).toBe(0); expect(s.penumbraMl).toBe(0);
  });
  it('left M1 occlusion: penumbra first, core grows with time', () => {
    const early = neuroSummary(st({ occlusion: { m1_L: 1 }, minutes: 30 })); const late = neuroSummary(st({ occlusion: { m1_L: 1 }, minutes: 360 }));
    expect(early.territories.MCA_L.penumbraMl).toBeGreaterThan(early.territories.MCA_L.coreMl);
    expect(late.territories.MCA_L.coreMl).toBeGreaterThan(early.territories.MCA_L.coreMl);
    expect(late.territories.MCA_R.coreMl).toBe(0);
  });
  it('good collaterals leave less core than poor ones', () => {
    const good = territoryStates(st({ occlusion: { m1_L: 1 }, minutes: 180, collaterals: 'good' })).MCA_L;
    const poor = territoryStates(st({ occlusion: { m1_L: 1 }, minutes: 180, collaterals: 'poor' })).MCA_L;
    expect(good.coreMl).toBeLessThan(poor.coreMl);
  });
  it('recanalization freezes the core and ends the penumbra', () => {
    const at = territoryStates(st({ occlusion: { m1_L: 1 }, minutes: 90 })).MCA_L;
    const after = territoryStates(st({ occlusion: { m1_L: 1 }, minutes: 600, recanalizedAt: 90 })).MCA_L;
    expect(after.coreMl).toBeCloseTo(at.coreMl, 5); expect(after.penumbraMl).toBe(0);
  });
  it('an intact circle protects against ICA occlusion; hypoplastic communicators do not', () => {
    const intact = neuroSummary(st({ occlusion: { ica_L: 1 }, minutes: 240 }));
    const isolated = neuroSummary(st({ occlusion: { ica_L: 1 }, minutes: 240, variants: { acomHypoplastic: true, pcomHypoplastic: { L: true } } }));
    expect(isolated.coreMl).toBeGreaterThan(intact.coreMl + 20);
  });
  it('basilar occlusion threatens the brainstem and both PCAs', () => {
    const t = territoryStates(st({ occlusion: { basilar: 1 }, minutes: 60 }));
    expect(t.VB.coreMl + t.VB.penumbraMl).toBeGreaterThan(50);
    expect(t.PCA_L.cbfDeep).toBeLessThan(40);
  });
  it('low blood pressure enlarges the core (pressure-passive collaterals)', () => {
    const hi = territoryStates(st({ occlusion: { m1_L: 1 }, minutes: 180 }), { map: 110, paco2: 40, sao2: 0.98 }).MCA_L;
    const lo = territoryStates(st({ occlusion: { m1_L: 1 }, minutes: 180 }), { map: 60, paco2: 40, sao2: 0.98 }).MCA_L;
    expect(lo.coreMl).toBeGreaterThan(hi.coreMl);
  });
  it('infarct time shrinks as flow falls; haemorrhage volume sets the radius', () => {
    expect(timeToInfarct(25)).toBe(Infinity); expect(timeToInfarct(12)).toBeLessThan(timeToInfarct(17));
    expect(hemorrhageShape({ kind: 'ich', at: [0, 0, 0], volumeMl: 30 }).rCm).toBeCloseTo(1.93, 1);
  });
});
