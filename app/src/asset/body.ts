/** Whole-body organ map (pipeline/build-body.ts, HuBMAP Visible Human Male, CC BY 4.0). */
import type * as THREE from 'three';
import { loadMeshes } from './gltf';
export interface BodyMapping { units: string; centres: Record<string, [number, number, number]>; attribution: { title: string; creators: string; data: string; license: string; licenseUrl: string; sourceUrl: string; changes: string } }
export interface BodyAsset { meshes: Record<string, THREE.Mesh>; mapping: BodyMapping }
declare global { interface Window { __BODY_GLB__?: string; __BODY_MAP__?: BodyMapping } }
let cache: Promise<BodyAsset> | null = null;
export function loadBodyAsset() {
  if (cache) return cache;
  cache = (async () => {
    const mapping: BodyMapping = window.__BODY_MAP__ ?? (await (await fetch('models/body.mapping.json')).json());
    const meshes = await loadMeshes(window.__BODY_GLB__, 'models/body.glb');
    for (const id of ['skin', 'heart', 'liver', 'kidney_L', 'brain']) if (!meshes[id]) throw new Error('Body asset missing ' + id);
    return { meshes, mapping };
  })();
  return cache;
}
