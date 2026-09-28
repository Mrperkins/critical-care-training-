/**
 * Loads the respiratory anatomy asset (public/models/resp.glb + resp.mapping.json), built by
 * pipeline/build-resp.ts from the HuBMAP Visible Human Male reference organs (CC BY 4.0).
 * Scenes only use canonical mesh ids (lung_RUL, airway_wall, ett, diaphragm, …) and the mapping.
 */
import * as THREE from 'three';
import { loadMeshes } from './gltf';

export type V3 = [number, number, number];
export interface RespMapping {
  units: string; frame: string;
  lobes: Record<'RUL' | 'RML' | 'RLL' | 'LUL' | 'LLL', { hilum: V3; segments: string[]; volume: number }>;
  ett: { centreline: V3[]; radius: number; trachealRadius: number; tip: V3; carina: V3 };
  lungBox: { min: V3; max: V3 };
  attribution: { title: string; creators: string; data: string; license: string; licenseUrl: string; sourceUrl: string; changes: string };
  meshes: { id: string; role: string; vertices: number }[];
}
export interface RespAsset { meshes: Record<string, THREE.Mesh>; mapping: RespMapping }

declare global { interface Window { __RESP_GLB__?: string; __RESP_MAP__?: RespMapping } }
const REQUIRED = ['lung_RUL', 'lung_RML', 'lung_RLL', 'lung_LUL', 'lung_LLL', 'airway_wall', 'ett', 'diaphragm'];

let cache: Promise<RespAsset> | null = null;
export function loadRespAsset(): Promise<RespAsset> {
  if (cache) return cache;
  cache = (async () => {
    const mapping: RespMapping = window.__RESP_MAP__ ?? (await (await fetch('models/resp.mapping.json')).json());
    const meshes = await loadMeshes(window.__RESP_GLB__, 'models/resp.glb', ['aDep', 'aBase', 'aLobe', 'aGen', 'aS', 'aDome']);
    const missing = REQUIRED.filter((id) => !meshes[id]);
    if (missing.length) throw new Error('Respiratory asset is missing: ' + missing.join(', '));
    return { meshes, mapping };
  })();
  return cache;
}

export function polylineAt(line: V3[], s: number, out = new THREE.Vector3()) {
  const n = line.length - 1; const f = Math.min(n - 1e-6, Math.max(0, s * n)); const i = Math.floor(f); const t = f - i; const a = line[i], b = line[i + 1];
  return out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}
