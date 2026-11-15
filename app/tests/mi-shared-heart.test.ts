/**
 * MI Locator draws the same high-detail heart as the rest of the Cardiac tab. These tests run the real transfer on the
 * real assets (coronary-heart.glb → heart-hd.glb) and check registration and that every territory still faces the
 * leads that should see it.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import * as THREE from 'three';
import { buildSharedHeart, transferTeachingAttributes, registrationAccepted, REPLACED, type SharedHeart } from '../src/infarct/asset/sharedHeart';
import type { HeartAsset } from '../src/infarct/asset/heartAsset';
import { TERRITORIES } from '../src/infarct/data/territories';
import { averageView } from '../src/infarct/data/leads';
import { MASK_FACING } from '../pipeline/validate-coronary';
import { loadHearts } from './helpers/heartAssets';
import { REGION_ORDER } from '../src/infarct/engine/derive';

let shared: SharedHeart; let original: HeartAsset;
beforeAll(async () => { ({ original, shared } = await loadHearts()); }, 120000);

describe('MI Locator on the shared high-detail heart', () => {
  it('registers every high-detail chamber to the coronary heart within tolerance', () => {
    expect(shared.reason).toBeUndefined();
    expect(shared.shared).toBe(true);
    expect(shared.stats.map((s) => s.id).sort()).toEqual(['atrium_LA', 'atrium_RA', 'myocardium_LV', 'myocardium_RV']);
    for (const s of shared.stats) { expect(s.p95Mm).toBeLessThan(4); expect(s.coverage).toBeGreaterThan(0.97); expect(registrationAccepted(s)).toBe(true); }
  });
  it('swaps in full-resolution chambers and drops the light septum; vessels and masks are kept', () => {
    const m = shared.asset.meshes;
    expect(m.myocardium_LV.geometry.getAttribute('position').count).toBeGreaterThan(40000);
    expect(m.myocardium_RV.geometry.getAttribute('position').count).toBeGreaterThan(40000);
    expect(m.myocardium_septum).toBeUndefined();
    for (const id of ['coronary_LAD', 'coronary_RCA', 'coronary_LCx', 'territory_inferior']) expect(m[id]).toBe(original.meshes[id]);
    for (const id of REPLACED.filter((r) => r !== 'myocardium_septum')) expect(m[id].userData.role).toBe(original.meshes[id].userData.role);
  });
  it('keeps the beat channels: ventricles beat as ventricles, atria as atria', () => {
    const ch = (id: string) => { const a = shared.asset.meshes[id].geometry.getAttribute('aCh'); let s = 0; for (let i = 0; i < a.count; i++) s += a.getX(i); return s / a.count; };
    expect(ch('myocardium_LV')).toBeCloseTo(1, 1); expect(ch('myocardium_RV')).toBeCloseTo(1, 1);
    expect(ch('atrium_LA')).toBeCloseTo(2, 1); expect(ch('atrium_RA')).toBeCloseTo(2, 1);
  });
  it('every territory on the new surface faces the leads that should see it', () => {
    for (const t of TERRITORIES) {
      const want = MASK_FACING[t.id]; if (!want) continue;
      const w = REGION_ORDER.map((r) => t.heartHighlightRegion[r] ?? 0);
      const acc = new THREE.Vector3(); let total = 0;
      for (const id of ['myocardium_LV', 'myocardium_RV']) {
        const g = shared.asset.meshes[id].geometry; const A = g.getAttribute('aRegA'), B = g.getAttribute('aRegB'), N = g.getAttribute('normal');
        for (let i = 0; i < A.count; i += 3) {
          const k = Math.min(1, A.getX(i) * w[0] + A.getY(i) * w[1] + A.getZ(i) * w[2] + A.getW(i) * w[3] + B.getX(i) * w[4] + B.getY(i) * w[5] + B.getZ(i) * w[6] + B.getW(i) * w[7]);
          if (k < 0.5) continue; acc.addScaledVector(new THREE.Vector3().fromBufferAttribute(N, i), k); total += k;
        }
      }
      expect(total, t.id).toBeGreaterThan(50);
      const facing = acc.normalize().dot(new THREE.Vector3(...averageView(want)));
      expect(facing, `${t.id} faces ${want.join(',')}`).toBeGreaterThan(0.45);
    }
  });
  it('refuses to mix hearts when a chamber is out of register', () => {
    const hd: Record<string, THREE.Mesh> = {};
    for (const id of ['lv', 'rv', 'la', 'ra']) { const m = shared.asset.meshes[{ lv: 'myocardium_LV', rv: 'myocardium_RV', la: 'atrium_LA', ra: 'atrium_RA' }[id]!]; hd[id] = new THREE.Mesh(m.geometry.clone()); }
    hd.rv.geometry.translate(0.1, 0, 0); // 10 mm off
    const r = buildSharedHeart(original, hd);
    expect(r.shared).toBe(false); expect(r.asset).toBe(original); expect(r.reason).toMatch(/myocardium_RV/);
  });
  it('rejects sources without teaching attributes', () => {
    const g = new THREE.BoxGeometry(); expect(() => transferTeachingAttributes([g], g.clone())).toThrow(/Teaching attribute/);
  });
});
