import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { clampFlow, makeFlowColumn } from '../src/scene/VolumeFlow';
import { registerHeartContext } from '../src/asset/anatomyConsistency';
import { useHeartUI } from '../src/heart/heartStore';
import { useUI } from '../src/app/store';

describe('clinical 3D volume-flow rendering', () => {
  it('fits the 3D fluid tube inside the locally supplied lumen radius', () => {
    const path = [
      {p: new THREE.Vector3(0,0,0),r:0.1},
      {p: new THREE.Vector3(0,0,0.5),r:0.1},
      {p: new THREE.Vector3(0,0,1),r:0.1},
    ];
    const geo = makeFlowColumn(path,0.7);
    geo.computeBoundingBox();
    expect(geo.boundingBox!.max.x).toBeLessThanOrEqual(0.071);
    expect(geo.boundingBox!.min.x).toBeGreaterThanOrEqual(-0.071);
    expect(geo.boundingBox!.max.z).toBeGreaterThan(0.95);
    expect(geo.getAttribute('normal').count).toBeGreaterThan(0);
    geo.dispose();
  });
  it('rejects invalid paths and sanitizes non-finite flow values', () => {
    expect(() => makeFlowColumn([])).toThrow(/two points/);
    expect(clampFlow(NaN)).toBe(0);
    expect(clampFlow(Infinity)).toBe(0);
    expect(clampFlow(-2)).toBe(0);
    expect(clampFlow(2)).toBe(1);
  });
  it('uses bulk flow by default without changing physiology or removing tracer mode', () => {
    expect(useHeartUI.getState().flowDisplay).toBe('volume');
    expect(useUI.getState().ventFlowDisplay).toBe('volume');
    useHeartUI.getState().set({flowDisplay:'both'});
    expect(useHeartUI.getState().flowDisplay).toBe('both');
    useHeartUI.getState().set({flowDisplay:'volume'});
  });
  it('performs rigid translation only when two anatomical bounds agree', () => {
    const ref = new THREE.BoxGeometry(1,2,1);
    const high = Object.fromEntries(['lv','rv','la','ra'].map((id) =>
      [id,new THREE.Mesh(new THREE.BoxGeometry(1,2,1).translate(4,5,6))])) as Record<string,THREE.Mesh>;
    const registration = registerHeartContext(ref,high);
    expect(registration.accepted).toBe(true);
    expect(registration.translation.toArray()).toEqual([-4,-5,-6]);
    ref.dispose(); Object.values(high).forEach((m) => m.geometry.dispose());
  });
  it('rejects incompatible meshes rather than stretching an organ to fit', () => {
    const ref = new THREE.BoxGeometry(1,2,1);
    const high = Object.fromEntries(['lv','rv','la','ra'].map((id) =>
      [id,new THREE.Mesh(new THREE.BoxGeometry(4,5,3))])) as Record<string,THREE.Mesh>;
    expect(registerHeartContext(ref,high).accepted).toBe(false);
    ref.dispose(); Object.values(high).forEach((m) => m.geometry.dispose());
  });
});
