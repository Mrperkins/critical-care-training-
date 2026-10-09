import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { computeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { reorder, quantize } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

(THREE.BufferGeometry.prototype as any).computeBoundsTree = computeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const log = (...a: unknown[]) => console.log('[asset]', ...a);
export const V3 = THREE.Vector3;

/** Read every mesh node of a GLB into world-space geometries keyed by node name. */
export async function readGLB(file: string, filter?: RegExp): Promise<Map<string, THREE.BufferGeometry>> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(path.join(ROOT, file));
  const out = new Map<string, THREE.BufferGeometry>();
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh(); if (!mesh) continue;
    const name = node.getName(); if (filter && !filter.test(name)) continue;
    const m = new THREE.Matrix4().fromArray(node.getWorldMatrix());
    const geos = mesh.listPrimitives().map((p) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(p.getAttribute('POSITION')!.getArray()!), 3));
      const idx = p.getIndices(); if (idx) g.setIndex(Array.from(idx.getArray()!)); else g.setIndex([...Array(g.attributes.position.count).keys()]);
      g.applyMatrix4(m); return g;
    });
    let g = geos.length === 1 ? geos[0] : mergeGeos(geos);
    g = mergeVertices(g, 1e-7); g.computeVertexNormals();
    out.set(name, g);
  }
  return out;
}

export function mergeGeos(gs: THREE.BufferGeometry[]) {
  const pos: number[] = []; const idx: number[] = []; let off = 0;
  for (const g of gs) { const a = g.attributes.position; for (let i = 0; i < a.count; i++) pos.push(a.getX(i), a.getY(i), a.getZ(i)); const ix = g.index ? g.index.array : [...Array(a.count).keys()]; for (let i = 0; i < ix.length; i++) idx.push(ix[i] + off); off += a.count; }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setIndex(idx); return r;
}

export function simplify(g: THREE.BufferGeometry, ratio: number, err = 0.01) {
  if (ratio >= 1 || !g.index) return g;
  const pos = g.attributes.position.array as Float32Array; const idx = new Uint32Array(g.index.array);
  const target = Math.floor((idx.length * ratio) / 3) * 3;
  const [out] = MeshoptSimplifier.simplify(idx, pos, 3, target, err, []);
  const remap = new Map<number, number>(); const np: number[] = []; const ni: number[] = [];
  for (const i of out) { let j = remap.get(i); if (j === undefined) { j = remap.size; remap.set(i, j); np.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); } ni.push(j); }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(np, 3)); r.setIndex(ni); r.computeVertexNormals(); return r;
}

/** Midpoint subdivision (each triangle → 4) without moving original vertices; follow with Taubin smoothing. */
export function subdivide(g: THREE.BufferGeometry) {
  const p = g.attributes.position; const ix = g.index!.array; const pos: number[] = Array.from(p.array as Float32Array); const mid = new Map<string, number>(); const out: number[] = [];
  const m = (a: number, b: number) => { const k = a < b ? a + '_' + b : b + '_' + a; let v = mid.get(k); if (v === undefined) { v = pos.length / 3; pos.push((pos[a * 3] + pos[b * 3]) / 2, (pos[a * 3 + 1] + pos[b * 3 + 1]) / 2, (pos[a * 3 + 2] + pos[b * 3 + 2]) / 2); mid.set(k, v); } return v; };
  for (let t = 0; t < ix.length; t += 3) { const a = ix[t], b = ix[t + 1], c = ix[t + 2]; const ab = m(a, b), bc = m(b, c), ca = m(c, a); out.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca); }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setIndex(out); r.computeVertexNormals(); return r;
}

export const centroid = (g: THREE.BufferGeometry) => { const a = g.attributes.position; const c = new V3(); for (let i = 0; i < a.count; i++) c.add(new V3().fromBufferAttribute(a, i)); return c.divideScalar(a.count); };

/** Flip triangle winding if normals point inward on average. */
export function orientOutward(g: THREE.BufferGeometry) {
  g.computeVertexNormals(); const c = centroid(g); const a = g.attributes.position, n = g.attributes.normal; let s = 0;
  for (let i = 0; i < a.count; i++) s += new V3().fromBufferAttribute(n, i).dot(new V3().fromBufferAttribute(a, i).sub(c));
  if (s < 0) { const ix = g.index!.array as any; for (let t = 0; t < ix.length; t += 3) { const tmp = ix[t + 1]; ix[t + 1] = ix[t + 2]; ix[t + 2] = tmp; } g.index!.needsUpdate = true; g.computeVertexNormals(); }
}

export interface OutPart { id: string; role: string; geo: THREE.BufferGeometry; extras?: Record<string, unknown>; attrs?: string[] }

/** Write parts to a meshopt-compressed GLB. Custom float attributes named `_foo` are carried as `_FOO`. */
export async function writeGLB(file: string, parts: OutPart[], materials: Record<string, { color: [number, number, number]; rough: number }>) {
  await MeshoptEncoder.ready;
  const doc = new Document(); const buf = doc.createBuffer(); const scene = doc.createScene('root'); const root = doc.createNode('root'); scene.addChild(root);
  const mats: Record<string, any> = {};
  for (const [k, m] of Object.entries(materials)) mats[k] = doc.createMaterial(k).setBaseColorFactor([...m.color, 1]).setRoughnessFactor(m.rough).setMetallicFactor(0);
  for (const p of parts) {
    const g = p.geo; const prim = doc.createPrimitive();
    const acc = (arr: ArrayLike<number>, type: any) => doc.createAccessor().setBuffer(buf).setType(type).setArray(arr instanceof Float32Array ? arr : new Float32Array(arr));
    prim.setAttribute('POSITION', acc(g.attributes.position.array, 'VEC3'));
    if (!g.attributes.normal) g.computeVertexNormals();
    prim.setAttribute('NORMAL', acc(g.attributes.normal.array, 'VEC3'));
    for (const [name, a] of Object.entries(g.attributes)) {
      if (!name.startsWith('_')) continue; const it = (a as THREE.BufferAttribute).itemSize;
      prim.setAttribute(name.toUpperCase(), acc((a as THREE.BufferAttribute).array, it === 1 ? 'SCALAR' : it === 2 ? 'VEC2' : it === 3 ? 'VEC3' : 'VEC4'));
    }
    prim.setIndices(doc.createAccessor().setBuffer(buf).setType('SCALAR').setArray(new Uint32Array(g.index!.array)));
    prim.setMaterial(mats[p.role] ?? mats.default);
    const mesh = doc.createMesh(p.id).addPrimitive(prim); const node = doc.createNode(p.id).setMesh(mesh).setExtras({ role: p.role, ...(p.extras ?? {}) }); root.addChild(node);
  }
  await doc.transform(reorder({ encoder: MeshoptEncoder }), quantize({ pattern: /^(POSITION|NORMAL)$/, quantizePosition: 14, quantizeNormal: 10 }));
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  await io.write(path.join(ROOT, file), doc);
  log(file, (fs.statSync(path.join(ROOT, file)).size / 1e6).toFixed(2), 'MB,', parts.length, 'meshes');
}
export { MeshoptSimplifier, MeshoptEncoder };
