/** Microanatomy asset (alveolar sac + capillaries, muscle capillary bed, RBC) from pipeline/build-micro.ts. */
import type * as THREE from 'three';
import { loadMeshes } from './gltf';
export type P3 = [number, number, number];
export interface MicroMapping {
  units: string;
  alveoli: { c: P3; r: number }[]; duct: { top: P3; bottom: P3 };
  arteriole: P3[]; venule: P3[];
  paths: { alv: number; a: number; v: number; m0: number; m1: number; pts: P3[] }[];
  tissue: { centre: P3; fibres: { c: P3; r: number }[]; length: number; paths: P3[][]; mito: number[] };
  attribution: { title: string; creators: string; data: string; license: string };
}
export interface MicroAsset { meshes: Record<string, THREE.Mesh>; mapping: MicroMapping }
declare global { interface Window { __MICRO_GLB__?: string; __MICRO_MAP__?: MicroMapping } }
let cache: Promise<MicroAsset> | null = null;
export function loadMicroAsset() {
  if (cache) return cache;
  cache = (async () => {
    const mapping: MicroMapping = window.__MICRO_MAP__ ?? (await (await fetch('models/micro.mapping.json')).json());
    const meshes = await loadMeshes(window.__MICRO_GLB__, 'models/micro.glb', ['aAlv', 'aS', 'aKind']);
    for (const id of ['alveolar_sac', 'pulm_capillaries', 'muscle_fibres', 'tissue_capillaries', 'rbc']) if (!meshes[id]) throw new Error('Micro asset missing ' + id);
    return { meshes, mapping };
  })();
  return cache;
}
