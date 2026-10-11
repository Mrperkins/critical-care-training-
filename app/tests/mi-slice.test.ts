/**
 * The short-axis slice is cut from the real ventricular walls: an outer (epicardial) and an inner (endocardial)
 * boundary, a wall ring between them with depth 0 → 1 across the wall, and the coronary territory weights carried
 * onto the cut face so the inferior wall of the ring belongs to the inferior territory.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import * as THREE from 'three';
import { loadHearts } from './helpers/heartAssets';
import { sliceLoops, nesting, sliceSection } from '../src/infarct/engine/slice';
import type { HeartAsset } from '../src/infarct/asset/heartAsset';
import { REGION_ORDER } from '../src/infarct/engine/derive';

let original: HeartAsset; let P: THREE.Vector3; let N: THREE.Vector3; let base: THREE.Vector3; let axis: THREE.Vector3;
beforeAll(async () => {
  ({ original } = await loadHearts()); const m = original.mapping;
  base = new THREE.Vector3(...m.lvAxis.base); axis = new THREE.Vector3(...m.lvAxis.apex).sub(base).normalize();
  P = base.clone().addScaledVector(axis, m.lvAxis.length * 0.5); N = axis.clone().negate();
}, 120000);

describe('short-axis slice of the real ventricles', () => {
  it('the LV is cut into a wall ring: an epicardial loop around an endocardial cavity of plausible size', () => {
    const loops = sliceLoops(original.meshes.myocardium_LV.geometry, P, N); const d = nesting(loops);
    const outer = loops.filter((_, i) => d[i] === 0).sort((a, b) => Math.abs(b.area) - Math.abs(a.area))[0];
    const cavity = loops.filter((_, i) => d[i] === 1).sort((a, b) => Math.abs(b.area) - Math.abs(a.area))[0];
    expect(outer && cavity).toBeTruthy();
    const mm2 = (a: number) => Math.abs(a) * 1e4; // dm² → mm²
    expect(mm2(cavity.area)).toBeGreaterThan(300); expect(mm2(cavity.area)).toBeLessThan(1500);
    expect(mm2(outer.area)).toBeGreaterThan(mm2(cavity.area) * 2);
  });
  it('depth runs from the endocardium (0) to the outer boundary (1) through the wall', () => {
    const g = sliceSection(original.meshes.myocardium_LV.geometry, P, N)!; const D = g.getAttribute('aDepth');
    let lo = 0, mid = 0, hi = 0; for (let i = 0; i < D.count; i++) { const x = D.getX(i); if (x < 0.15) lo++; else if (x > 0.85) hi++; else mid++; }
    expect(lo).toBeGreaterThan(30); expect(hi).toBeGreaterThan(30); expect(mid / D.count).toBeGreaterThan(0.15);
  });
  it('the cut face carries the territories: the inferior wall of the ring is inferior territory', () => {
    const g = sliceSection(original.meshes.myocardium_LV.geometry, P, N)!;
    const pos = g.getAttribute('position'), B = g.getAttribute('aRegB'); const inf = REGION_ORDER.indexOf('inferior') - 4;
    const get = (i: number) => [B.getX(i), B.getY(i), B.getZ(i), B.getW(i)][inf];
    let low = 0, nLow = 0, up = 0, nUp = 0;
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) - P.y; if (y < -0.12) { low += get(i); nLow++; } else if (y > 0.12) { up += get(i); nUp++; } }
    expect(nLow).toBeGreaterThan(10); expect(low / nLow).toBeGreaterThan(up / Math.max(1, nUp) + 0.2);
  });
  it('the RV is cut too (a crescent), so a right-ventricular infarct shows in the slice', () => {
    const g = sliceSection(original.meshes.myocardium_RV.geometry, P, N); expect(g).not.toBeNull();
    expect(g!.getIndex()!.count / 3).toBeGreaterThan(200);
  });
});
