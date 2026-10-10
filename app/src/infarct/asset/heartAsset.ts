/**
 * Loads the processed anatomical heart (public/models/heart/heart.glb + heart.mapping.json).
 * The scene never depends on how the source model was built: it only uses the
 * canonical mesh ids (myocardium_LV, coronary_LAD, territory_inferior …) and the mapping.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { Vec3, VesselId, RegionId } from '../data/types';

/** The coronary heart lives in the shared body frame (app/pipeline/build-coronary.ts), next to body.glb / lines.glb. */
export const HEART_ASSET_URL = 'models/coronary-heart.glb';
export const HEART_MAPPING_URL = 'models/coronary-heart.mapping.json';

export interface HeartMapping {
  attribution: { title: string; creators: string; data: string; license: string; licenseUrl: string; doi: string; sourceUrl: string; changes: string };
  lvAxis: { base: Vec3; apex: Vec3; length: number };
  regions: RegionId[];
  vessels: Record<VesselId, { mesh: string; authored: boolean; radius: number; centerline: Vec3[] }>;
  origins: Partial<Record<VesselId, number>>;
  originsLeft: Partial<Record<VesselId, number>>;
  territories: Record<string, { mesh: string }>;
  meshes: { id: string; role: string; vessel: VesselId | null; vertices: number }[];
}

export interface HeartAsset {
  meshes: Record<string, THREE.Mesh>;
  mapping: HeartMapping;
  center: THREE.Vector3;
  radius: number;
  atriaCenter: THREE.Vector3;
}

declare global { interface Window { __CORONARY_GLB__?: string; __CORONARY_MAP__?: HeartMapping; __B64_MODELS__?: boolean } }

const b64ToBuf = (b64: string) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };

const RENAME: Record<string, string> = { _rega: 'aRegA', _regb: 'aRegB', _ao: 'aAO', _fat: 'aFat', _s: 'aS', _ch: 'aCh', _w: 'aW' };

let cache: Promise<HeartAsset> | null = null;
/** cached: the cardiac module and the Atlas share one load */
export function loadHeartAsset(): Promise<HeartAsset> { if (!cache) { cache = loadOnce(); cache.catch(() => { cache = null; }); } return cache; }
async function loadOnce(): Promise<HeartAsset> {
  // published pages serve binary models as base64 text (.glb.txt), like every other model in the app
  const buf = window.__CORONARY_GLB__ ? b64ToBuf(window.__CORONARY_GLB__) : window.__B64_MODELS__ ? b64ToBuf((await (await fetch(HEART_ASSET_URL + '.txt')).text()).trim()) : await (await fetch(HEART_ASSET_URL)).arrayBuffer();
  const mapping: HeartMapping = window.__CORONARY_MAP__ ?? (await (await fetch(HEART_MAPPING_URL)).json());
  await MeshoptDecoder.ready;
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.parseAsync(buf, '');
  const meshes: Record<string, THREE.Mesh> = {};
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return;
    const m = o as THREE.Mesh; const g = m.geometry;
    for (const [from, to] of Object.entries(RENAME)) { const a = g.getAttribute(from); if (a) { g.setAttribute(to, a); g.deleteAttribute(from); } }
    const n = g.getAttribute('position').count;
    if (!g.getAttribute('aAO')) g.setAttribute('aAO', new THREE.BufferAttribute(new Float32Array(n).fill(1), 1));
    if (!g.getAttribute('aFat')) g.setAttribute('aFat', new THREE.BufferAttribute(new Float32Array(n), 1));
    if (!g.getAttribute('aCh')) g.setAttribute('aCh', new THREE.BufferAttribute(new Float32Array(n), 1));
    if (!g.getAttribute('aRegA')) g.setAttribute('aRegA', new THREE.BufferAttribute(new Float32Array(n * 4), 4));
    if (!g.getAttribute('aRegB')) g.setAttribute('aRegB', new THREE.BufferAttribute(new Float32Array(n * 4), 4));
    if (!g.getAttribute('aS')) g.setAttribute('aS', new THREE.BufferAttribute(new Float32Array(n), 1));
    if (!g.getAttribute('aW')) g.setAttribute('aW', new THREE.BufferAttribute(new Float32Array(n), 1));
    g.computeBoundingSphere();
    m.userData = { ...(m.userData || {}), ...(m.parent?.userData ?? {}) };
    meshes[m.name || (m.parent?.name ?? '')] = m;
  });
  const box = new THREE.Box3();
  Object.entries(meshes).forEach(([id, m]) => { if (id.startsWith('myocardium') || id.startsWith('atrium')) box.expandByObject(m); });
  const center = box.getCenter(new THREE.Vector3()); const radius = box.getSize(new THREE.Vector3()).length() / 2;
  const atria = new THREE.Box3(); ['atrium_LA', 'atrium_RA'].forEach((id) => meshes[id] && atria.expandByObject(meshes[id]));
  return { meshes, mapping, center, radius, atriaCenter: atria.getCenter(new THREE.Vector3()) };
}

/** Point on a vessel centerline at fraction s. */
export function centerlineAt(line: Vec3[], s: number, out = new THREE.Vector3()) {
  const n = line.length - 1; const f = Math.min(n - 1e-6, Math.max(0, s * n)); const i = Math.floor(f); const t = f - i;
  const a = line[i], b = line[i + 1];
  return out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}
