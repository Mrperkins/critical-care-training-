/** Whole-body organ map (pipeline/build-body.ts, HuBMAP Visible Human Male, CC BY 4.0). */
import type * as THREE from 'three';
import { loadMeshes } from './gltf';
export interface BodyMapping { units: string; centres: Record<string, [number, number, number]>; attribution: { title: string; creators: string; data: string; license: string; licenseUrl: string; sourceUrl: string; changes: string } }
export interface BodyAsset { meshes: Record<string, THREE.Mesh>; mapping: BodyMapping }
declare global { interface Window { __BODY_GLB__?: string; __BODY_MAP__?: BodyMapping; __BODYF_GLB__?: string; __BODYF_MAP__?: BodyMapping } }
export type BodySex = 'male' | 'female';
const caches: Partial<Record<BodySex, Promise<BodyAsset>>> = {};
/** male: Visible Human Male (body.glb); female: Visible Human Female with pelvic organs and the term placenta (body-f.glb). */
export function loadBodyAsset(sex: BodySex = 'male') {
  const hit = caches[sex]; if (hit) return hit;
  const f = sex === 'female'; const base = f ? 'models/body-f' : 'models/body';
  const cache = caches[sex] = (async () => {
    const mapping: BodyMapping = (f ? window.__BODYF_MAP__ : window.__BODY_MAP__) ?? (await (await fetch(base + '.mapping.json')).json());
    const meshes = await loadMeshes(f ? window.__BODYF_GLB__ : window.__BODY_GLB__, base + '.glb');
    for (const id of ['skin', 'heart', 'liver', 'kidney_L', 'brain']) if (!meshes[id]) throw new Error('Body asset missing ' + id);
    return { meshes, mapping };
  })();
  cache.catch(() => { delete caches[sex]; });
  return cache;
}
