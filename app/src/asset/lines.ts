/** Invasive-lines asset (pipeline/build-lines.ts): heart chambers, valves, great vessels + skin landmarks. Same frame as body.glb. */
import type * as THREE from 'three';
import { loadMeshes } from './gltf';
export interface Slice { y: number; c: [number, number, number]; xr: [number, number]; zr: [number, number] }
export interface LinesMapping {
  units: string; centres: Record<string, [number, number, number]>; boxes: Record<string, [[number, number, number], [number, number, number]]>;
  landmarks: { arm: Slice[]; leg: Slice[]; neck: Slice[]; chestZ: [number, number]; sideX: number; neckX: [number, number]; neckZ: [number, number]; hipZ: [number, number]; skinMin: number[]; skinMax: number[] };
  attribution: { title: string; creators: string; data: string; license: string; licenseUrl: string; sourceUrl: string; changes: string };
}
export interface LinesAsset { meshes: Record<string, THREE.Mesh>; mapping: LinesMapping }
declare global { interface Window { __LINES_GLB__?: string; __LINES_MAP__?: LinesMapping } }
let cache: Promise<LinesAsset> | null = null;
export function loadLinesAsset() {
  if (cache) return cache;
  cache = (async () => {
    const mapping: LinesMapping = window.__LINES_MAP__ ?? (await (await fetch('models/lines.mapping.json')).json());
    const meshes = await loadMeshes(window.__LINES_GLB__, 'models/lines.glb');
    for (const id of ['ra', 'rv', 'svc', 'aorta', 'tricuspid']) if (!meshes[id]) throw new Error('Lines asset missing ' + id);
    return { meshes, mapping };
  })();
  return cache;
}
