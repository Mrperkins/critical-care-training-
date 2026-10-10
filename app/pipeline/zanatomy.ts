/**
 * Z-Anatomy (CC BY-SA 4.0; BodyParts3D-derived) → this body. Shared by build-nerves.ts and build-cerebral.ts.
 *  1. Z-Anatomy FBX bones are registered to the BodyParts3D STLs of the same bones (Umeyama similarity + 20 ICP steps);
 *  2. BodyParts3D → Visible Human Male with the skeleton's own fit (pipeline/bp3d-fit.json).
 * `zToBody(g)` applies both, in place.
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ROOT, log, V3 } from './common';
/* ------------------------------------------------------------------ FBX in node */
(globalThis as any).self = globalThis; (globalThis as any).window = globalThis;
(globalThis as any).document = { createElementNS: () => ({ style: {} }), createElement: () => ({ style: {}, getContext: () => null }) };
const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
THREE.TextureLoader.prototype.load = () => new THREE.Texture();
const ZDIR = path.join(ROOT, 'assets/source/z-anatomy');
export function readFBX(file: string, keep: RegExp) {
  const buf = fs.readFileSync(path.join(ZDIR, file)); const root = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), ''); root.updateMatrixWorld(true);
  const out = new Map<string, THREE.BufferGeometry>();
  root.traverse((o: THREE.Object3D) => { const m = o as THREE.Mesh; if (!m.isMesh || !keep.test(m.name)) return; const g = (m.geometry as THREE.BufferGeometry).clone(); g.deleteAttribute('uv'); g.deleteAttribute('color'); g.deleteAttribute('skinIndex'); g.deleteAttribute('skinWeight'); g.applyMatrix4(m.matrixWorld); const w = mergeVertices(new THREE.BufferGeometry().setAttribute('position', g.attributes.position).setIndex(g.index ?? [...Array(g.attributes.position.count).keys()]), 1e-6); out.set(m.name, w); });
  return out;
}
export const verts = (g: THREE.BufferGeometry) => { const a = g.attributes.position; return Array.from({ length: a.count }, (_, i) => new V3().fromBufferAttribute(a, i)); };
export const mean = (ps: THREE.Vector3[]) => ps.reduce((a, p) => a.add(p), new V3()).divideScalar(Math.max(1, ps.length));
export const r3 = (p: THREE.Vector3) => p.toArray().map((x) => +x.toFixed(4));

/* ------------------------------------------------------------------ 1. register Z-Anatomy → BodyParts3D frame */
const BONES: [string, string][] = [['Sacrum', 'sacrum'], ['Axis_(C2)', 'axis'], ['Atlas_(C1)', 'atlas'], ['Hyoid_bone', 'hyoid bone'], ['Mandible', 'mandible'], ['First_ribl', 'left first rib'], ['First_ribr', 'right first rib'],
  ['Seventh_ribl', 'left seventh rib'], ['Seventh_ribr', 'right seventh rib'], ['Manubrium_of_sternum', 'manubrium'], ['Body_of_sternum', 'body of sternum'], ['Scapulal', 'left scapula'], ['Scapular', 'right scapula'],
  ['Claviclel', 'left clavicle'], ['Clavicler', 'right clavicle'], ['Hip_bonel', 'left hip bone'], ['Hip_boner', 'right hip bone']];
export const zBones = readFBX('SkeletalSystem100.fbx', new RegExp('^(' + BONES.map(([z]) => z.replace(/[()]/g, '\\$&')).join('|') + ')$'));
const BP = path.join(ROOT, 'assets/source/bp3d'); const names = new Map<string, string>();
for (const line of fs.readFileSync(path.join(BP, 'parts_list_e.txt'), 'utf8').split('\n').slice(1)) { const [id, en] = line.split('\t'); if (id && en) names.set(en.trim(), id); }
export function readSTL(en: string) { // BodyParts3D STL (mm, +Z up, −Y anterior) → the pre-fit body-frame decimetres used by build-skeleton.ts
  const b = fs.readFileSync(path.join(BP, 'stl', names.get(en)! + '.stl')); const n = b.readUInt32LE(80); const pos = new Float32Array(n * 9);
  for (let t = 0; t < n; t++) for (let v = 0; v < 3; v++) { const o = 84 + t * 50 + 12 + v * 12; pos.set([b.readFloatLE(o) / 100, b.readFloatLE(o + 8) / 100, -b.readFloatLE(o + 4) / 100], t * 9 + v * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return mergeVertices(g, 1e-6);
}
const pairs = BONES.filter(([z, e]) => zBones.has(z) && names.has(e)).map(([z, e]) => ({ z: zBones.get(z)!, b: readSTL(e), name: z }));
log('registration bones', pairs.length, '/', BONES.length);
/** Umeyama similarity (with reflection allowed and reported): dst ≈ s R src + t */
export function umeyama(src: THREE.Vector3[], dst: THREE.Vector3[]) {
  const ms = mean(src), md = mean(dst); let vs = 0; const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < src.length; i++) { const a = src[i].clone().sub(ms), b = dst[i].clone().sub(md); vs += a.lengthSq(); const A = a.toArray(), Bv = b.toArray(); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) S[r][c] += Bv[r] * A[c]; }
  // SVD of a 3×3 via Jacobi on SᵀS
  const StS = [0, 1, 2].map((r) => [0, 1, 2].map((c) => S[0][r] * S[0][c] + S[1][r] * S[1][c] + S[2][r] * S[2][c]));
  const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; const Am = StS.map((r) => [...r]);
  for (let sweep = 0; sweep < 50; sweep++) for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) { if (Math.abs(Am[p][q]) < 1e-15) continue; const th = 0.5 * Math.atan2(2 * Am[p][q], Am[q][q] - Am[p][p]); const c = Math.cos(th), s = Math.sin(th);
    for (let k = 0; k < 3; k++) { const ap = Am[k][p], aq = Am[k][q]; Am[k][p] = c * ap - s * aq; Am[k][q] = s * ap + c * aq; } for (let k = 0; k < 3; k++) { const pk = Am[p][k], qk = Am[q][k]; Am[p][k] = c * pk - s * qk; Am[q][k] = s * pk + c * qk; } for (let k = 0; k < 3; k++) { const vp = V[k][p], vq = V[k][q]; V[k][p] = c * vp - s * vq; V[k][q] = s * vp + c * vq; } }
  const sig = [0, 1, 2].map((i) => Math.sqrt(Math.max(1e-18, Am[i][i])));
  const Vc = [0, 1, 2].map((i) => new V3(V[0][i], V[1][i], V[2][i])); const Sm = new THREE.Matrix3().set(S[0][0], S[0][1], S[0][2], S[1][0], S[1][1], S[1][2], S[2][0], S[2][1], S[2][2]);
  const Uc = Vc.map((v, i) => v.clone().applyMatrix3(Sm).divideScalar(sig[i]));
  const R = new THREE.Matrix3(); const e = (u: THREE.Vector3, v: THREE.Vector3) => [u.x * v.x, u.x * v.y, u.x * v.z, u.y * v.x, u.y * v.y, u.y * v.z, u.z * v.x, u.z * v.y, u.z * v.z];
  const sum = [0, 0, 0, 0, 0, 0, 0, 0, 0]; for (let i = 0; i < 3; i++) e(Uc[i], Vc[i]).forEach((x, k) => (sum[k] += x)); R.set(sum[0], sum[1], sum[2], sum[3], sum[4], sum[5], sum[6], sum[7], sum[8]);
  const det = R.determinant(); const sc = (sig[0] + sig[1] + sig[2]) / vs; const t = md.clone().sub(ms.clone().applyMatrix3(R).multiplyScalar(sc));
  return { R, s: sc, t, det };
}
export const apply = (T: ReturnType<typeof umeyama>, p: THREE.Vector3) => p.clone().applyMatrix3(T.R).multiplyScalar(T.s).add(T.t);
export let T = umeyama(pairs.map((p) => mean(verts(p.z))), pairs.map((p) => mean(verts(p.b))));
log('initial similarity: scale', T.s.toFixed(4), 'det(R)', T.det.toFixed(3));
const bvhs = pairs.map((p) => new MeshBVH(p.b)); export const tq = { point: new V3(), distance: 0 } as any;
for (let it = 0; it < 20; it++) {
  const src: THREE.Vector3[] = [], dst: THREE.Vector3[] = []; const res: number[] = [];
  pairs.forEach((p, k) => { const vs = verts(p.z); for (let i = 0; i < vs.length; i += Math.max(1, Math.floor(vs.length / 300))) { const x = apply(T, vs[i]); bvhs[k].closestPointToPoint(x, tq); src.push(vs[i]); dst.push(tq.point.clone()); res.push(tq.distance); } });
  T = umeyama(src, dst); if (it % 5 === 4) { res.sort((a, b) => a - b); log('ICP', it + 1, 'median residual', (res[res.length >> 1] * 100).toFixed(2), 'mm'); }
}

/* ------------------------------------------------------------------ 2. BodyParts3D frame → VHM body (skeleton fit) */
const FIT = JSON.parse(fs.readFileSync(path.join(ROOT, 'pipeline/bp3d-fit.json'), 'utf8'));
const A = new THREE.Matrix4().fromArray(FIT.A);
const K = (FIT.kernels as { s: number; c: number[][]; d: number[][]; w: number[] }[]).map((k) => {
  const h = 3 * k.s; const hash = new Map<string, number[]>(); k.c.forEach((c, i) => { const key = [Math.floor(c[0] / h), Math.floor(c[1] / h), Math.floor(c[2] / h)].join(); (hash.get(key) ?? hash.set(key, []).get(key)!).push(i); });
  return { ...k, h, hash };
});
export function toBody(p: THREE.Vector3) {
  const v = p.clone().applyMatrix4(A); const out = new V3();
  for (const k of K) { let sw = 0; const acc = new V3(); const s2 = 2 * k.s * k.s; const gx = Math.floor(v.x / k.h), gy = Math.floor(v.y / k.h), gz = Math.floor(v.z / k.h);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) { const list = k.hash.get([gx + a, gy + b, gz + c].join()); if (!list) continue; for (const i of list) { const q = k.c[i]; const d2 = (q[0] - v.x) ** 2 + (q[1] - v.y) ** 2 + (q[2] - v.z) ** 2; if (d2 > k.h * k.h) continue; const w = k.w[i] * Math.exp(-d2 / s2); sw += w; acc.x += k.d[i][0] * w; acc.y += k.d[i][1] * w; acc.z += k.d[i][2] * w; } }
    out.add(acc.divideScalar(sw + 0.15)); }
  return v.add(out);
}
export const zToBody = (g: THREE.BufferGeometry) => { const p = g.attributes.position; const v = new V3(); for (let i = 0; i < p.count; i++) { const q = toBody(apply(T, v.fromBufferAttribute(p, i))); p.setXYZ(i, q.x, q.y, q.z); } p.needsUpdate = true; g.computeVertexNormals(); return g; };
