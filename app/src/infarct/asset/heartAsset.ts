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

/**
 * The GLB stores quantised positions under a per-node de-quantisation matrix. Every shader here (beat, hypokinesis,
 * lead facing) and the coronary centerlines work in the body frame, so bake that matrix into float positions and
 * normals and leave each mesh with an identity transform. Without this the beat was computed in quantised space
 * and sheared the heart instead of contracting it toward the LV long axis.
 */
export function bakeToBodyFrame(m: THREE.Mesh) {
  const g = m.geometry; m.updateWorldMatrix(true, false);
  for (const name of ['position', 'normal']) {
    const a = g.getAttribute(name) as THREE.BufferAttribute | undefined; if (!a) continue;
    const f = new Float32Array(a.count * 3);
    for (let i = 0; i < a.count; i++) { f[i * 3] = a.getX(i); f[i * 3 + 1] = a.getY(i); f[i * 3 + 2] = a.getZ(i); }
    g.setAttribute(name, new THREE.BufferAttribute(f, 3));
  }
  g.applyMatrix4(m.matrixWorld);
  const n = g.getAttribute('normal') as THREE.BufferAttribute | undefined;
  if (n) for (let i = 0; i < n.count; i++) { const x = n.getX(i), y = n.getY(i), z = n.getZ(i); const l = Math.hypot(x, y, z) || 1; n.setXYZ(i, x / l, y / l, z / l); }
  m.position.set(0, 0, 0); m.quaternion.identity(); m.scale.set(1, 1, 1); m.updateMatrix(); m.matrixWorld.identity();
}

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
  const found: THREE.Mesh[] = [];
  gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) found.push(o as THREE.Mesh); });
  for (const m of found) {
    const g = m.geometry;
    const id = m.name || (m.parent?.name ?? ''); const parentData = m.parent?.userData ?? {};
    bakeToBodyFrame(m); m.removeFromParent(); // world coordinates now live in the geometry
    for (const [from, to] of Object.entries(RENAME)) { const a = g.getAttribute(from); if (a) { g.setAttribute(to, a); g.deleteAttribute(from); } }
    const n = g.getAttribute('position').count;
    if (!g.getAttribute('aAO')) g.setAttribute('aAO', new THREE.BufferAttribute(new Float32Array(n).fill(1), 1));
    if (!g.getAttribute('aFat')) g.setAttribute('aFat', new THREE.BufferAttribute(new Float32Array(n), 1));
    if (!g.getAttribute('aCh')) g.setAttribute('aCh', new THREE.BufferAttribute(new Float32Array(n), 1));
    if (!g.getAttribute('aRegA')) g.setAttribute('aRegA', new THREE.BufferAttribute(new Float32Array(n * 4), 4));
    if (!g.getAttribute('aRegB')) g.setAttribute('aRegB', new THREE.BufferAttribute(new Float32Array(n * 4), 4));
    if (!g.getAttribute('aS')) g.setAttribute('aS', new THREE.BufferAttribute(new Float32Array(n), 1));
    if (!g.getAttribute('aW')) g.setAttribute('aW', new THREE.BufferAttribute(new Float32Array(n), 1));
    g.computeBoundingSphere(); g.computeBoundingBox();
    m.userData = { ...(m.userData || {}), ...parentData };
    meshes[id] = m;
  }
  const box = new THREE.Box3();
  Object.entries(meshes).forEach(([id, m]) => { if (id.startsWith('myocardium') || id.startsWith('atrium')) box.union(m.geometry.boundingBox!); });
  const center = box.getCenter(new THREE.Vector3()); const radius = box.getSize(new THREE.Vector3()).length() / 2;
  const atria = new THREE.Box3(); ['atrium_LA', 'atrium_RA'].forEach((id) => meshes[id] && atria.union(meshes[id].geometry.boundingBox!));
  return { meshes, mapping, center, radius, atriaCenter: atria.getCenter(new THREE.Vector3()) };
}

/** Point on a vessel centerline at fraction s. */
export function centerlineAt(line: Vec3[], s: number, out = new THREE.Vector3()) {
  const n = line.length - 1; const f = Math.min(n - 1e-6, Math.max(0, s * n)); const i = Math.floor(f); const t = f - i;
  const a = line[i], b = line[i + 1];
  return out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}
