/**
 * Skeleton for the whole-body views, in the same body frame as body.glb (decimetres, centred on the VHM skin;
 * +X patient left, +Y up, +Z anterior).
 *
 * Two sources:
 *  - HuBMAP / Visible Human Male (CC BY 4.0) where the reference body already has the bone: hip bones, sacrum,
 *    coccyx, femora, tibiae, fibulae, patellae. These are the same subject as every other organ in the app, so they
 *    need no fitting.
 *  - BodyParts3D 3.0 (CC BY-SA 2.1 JP) for everything the reference body lacks: skull, mandible, hyoid, the spine
 *    C1–L5, all 24 ribs and their costal cartilages, sternum, clavicles, scapulae, humeri. BodyParts3D is a different
 *    man, so its bones are fitted onto the VHM body: a 12-parameter affine ICP followed by a smooth non-rigid
 *    correction, both driven only by structures the two bodies share (skin, lungs, liver, kidneys, heart, pelvis,
 *    sacrum, femora). The bones are never used as their own target, so the fit cannot hide a skeleton/organ mismatch:
 *    the build prints how much rib sits inside lung and how much bone sits outside skin.
 *
 * Output: public/models/skeleton.glb + skeleton.mapping.json. Because part of the geometry is BodyParts3D-derived,
 * the GLB as a whole is distributed under CC BY-SA 2.1 JP (the app code is not affected).
 *
 *   npm run asset:skeleton
 *   sources: assets/source/VH_M_United.glb (HuBMAP v1.1), assets/source/bp3d/{stl,parts_list_e.txt}
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ROOT, log, readGLB, simplify, writeGLB, mergeGeos, MeshoptSimplifier, type OutPart, V3 } from './common';
await MeshoptSimplifier.ready;

/* ------------------------------------------------------------------ deterministic RNG */
let seed = 1234567;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

/* ------------------------------------------------------------------ HuBMAP target, in the body frame of build-body.ts */
const body = await readGLB('assets/source/VH_M_United.glb');
// the neck has no bone in the reference body, so its own laryngeal cartilages, hyoid and trachea anchor the cervical fit
const larynx = await readGLB('assets/source/3d-vh-m-larynx.glb'); const trachea = await readGLB('assets/source/3d-vh-m-trachea.glb');
const pick = (re: RegExp) => [...body.entries()].filter(([n]) => re.test(n)).map(([, g]) => g);
const skinSrc = pick(/VH_M_skin$/)[0]; skinSrc.computeBoundingBox();
const C = skinSrc.boundingBox!.getCenter(new V3()); const S = 10;
const M = new THREE.Matrix4().makeScale(S, S, S).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const tf = (g: THREE.BufferGeometry) => { const h = g.clone(); h.applyMatrix4(M); h.computeVertexNormals(); h.computeBoundingBox(); return h; };
const T = (re: RegExp) => { const gs = pick(re).map(tf); if (!gs.length) throw new Error('no target ' + re); return gs.length > 1 ? mergeGeos(gs) : gs[0]; };

const target = {
  skin: T(/VH_M_skin$/),
  lung_R: T(/VH_M_right_.*bronchopulmonary_segment$/),
  lung_L: T(/VH_M_left_.*bronchopulmonary_segment$/),
  liver: T(/VH_M_liver_capsule$/),
  kidney_R: T(/VH_M_kidney_capsule_R$/),
  kidney_L: T(/VH_M_kidney_capsule_L$/),
  heart: T(/VH_M_(heart_left_ventricle|heart_right_ventricle|left_cardiac_atrium|right_cardiac_atrium|interventricular_septum)$/),
  hip_R: T(/VH_M_(ilium|ischium|pubis)_compact_bone_R$/),
  hip_L: T(/VH_M_(ilium|ischium|pubis)_compact_bone_L$/),
  sacrum: T(/VH_M_sacrum$/),
  femur_R: T(/VH_M_femur_R$/),
  femur_L: T(/VH_M_femur_L$/),
  hyoid: T(/VH_M_hyoid$/),
  thyroid: tf(larynx.get('VH_M_thyroid_cartilage')!),
  trachea: tf(trachea.get('VH_M_trachea')!),
};
type Key = keyof typeof target;
const bvh: Record<string, MeshBVH> = {};
for (const [k, g] of Object.entries(target)) bvh[k] = new MeshBVH(g);

/* ------------------------------------------------------------------ BodyParts3D source */
const BP = path.join(ROOT, 'assets/source/bp3d');
const names = new Map<string, string>(); // english name → FMA id (only ids that ship an STL)
const have = new Set(fs.readdirSync(path.join(BP, 'stl')).map((f) => f.replace(/\.stl$/, '')));
for (const line of fs.readFileSync(path.join(BP, 'parts_list_e.txt'), 'utf8').split('\n').slice(1)) {
  const [id, en] = line.split('\t'); if (id && en && have.has(id)) names.set(en.trim(), id);
}
const fma = (en: string) => { const id = names.get(en); if (!id) throw new Error('BodyParts3D has no STL for "' + en + '"'); return id; };

/** BodyParts3D STL (mm, +X patient left, +Z up, −Y anterior) → body-frame decimetres, before fitting */
function readSTL(id: string) {
  const b = fs.readFileSync(path.join(BP, 'stl', id + '.stl')); const n = b.readUInt32LE(80); const pos = new Float32Array(n * 9);
  for (let t = 0; t < n; t++) for (let v = 0; v < 3; v++) {
    const o = 84 + t * 50 + 12 + v * 12; const x = b.readFloatLE(o), y = b.readFloatLE(o + 4), z = b.readFloatLE(o + 8);
    pos.set([x / 100, z / 100, -y / 100], t * 9 + v * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = mergeVertices(g, 1e-6); m.computeVertexNormals(); return m;
}
const src = (...en: string[]) => mergeGeos(en.map((e) => readSTL(fma(e))));

const source: Record<Key, THREE.BufferGeometry> = {
  skin: readSTL(fma('skin')),
  lung_R: src('upper lobe of right lung', 'middle lobe of lung', 'lower lobe of right lung'),
  lung_L: src('upper lobe of left lung', 'lower lobe of left lung'),
  liver: readSTL(fma('liver')),
  kidney_R: readSTL(fma('right kidney')),
  kidney_L: readSTL(fma('left kidney')),
  heart: readSTL(fma('wall of heart')),
  hip_R: readSTL(fma('right hip bone')),
  hip_L: readSTL(fma('left hip bone')),
  sacrum: readSTL(fma('sacrum')),
  femur_R: readSTL(fma('right femur')),
  femur_L: readSTL(fma('left femur')),
  hyoid: readSTL(fma('hyoid bone')),
  thyroid: readSTL(fma('thyroid cartilage')),
  trachea: readSTL(fma('trachea')),
};

/* ------------------------------------------------------------------ surface sampling */
function sample(g: THREE.BufferGeometry, n: number) {
  const p = g.attributes.position; const ix = g.index!.array; const tri = ix.length / 3; const cum = new Float64Array(tri);
  const a = new V3(), b = new V3(), c = new V3(); let s = 0;
  for (let t = 0; t < tri; t++) { a.fromBufferAttribute(p, ix[t * 3]); b.fromBufferAttribute(p, ix[t * 3 + 1]); c.fromBufferAttribute(p, ix[t * 3 + 2]); s += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2; cum[t] = s; }
  const out: THREE.Vector3[] = [];
  for (let k = 0; k < n; k++) {
    const r = rnd() * s; let lo = 0, hi = tri - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < r) lo = mid + 1; else hi = mid; }
    let u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
    a.fromBufferAttribute(p, ix[lo * 3]); b.fromBufferAttribute(p, ix[lo * 3 + 1]); c.fromBufferAttribute(p, ix[lo * 3 + 2]);
    out.push(a.clone().multiplyScalar(1 - u - v).addScaledVector(b, u).addScaledVector(c, v));
  }
  return out;
}

/** sample counts and weights: the chest wall structures (skin, lungs) and the pelvis set the bone envelope */
const PLAN: [Key, number, number][] = [
  ['skin', 6000, 1], ['lung_R', 1500, 2], ['lung_L', 1500, 2], ['liver', 600, 1], ['kidney_R', 300, 1], ['kidney_L', 300, 1],
  ['heart', 500, 1], ['hip_R', 700, 2], ['hip_L', 700, 2], ['sacrum', 400, 2], ['femur_R', 500, 1], ['femur_L', 500, 1],
  ['hyoid', 300, 4], ['thyroid', 500, 4], ['trachea', 600, 3],
];
interface Pt { p: THREE.Vector3; k: Key; w: number }
const pts: Pt[] = PLAN.flatMap(([k, n, w]) => sample(source[k], n).map((p) => ({ p, k, w })));

/* skin of the arms and below the knees is posed differently in the two bodies and carries no bone we fit — drop it */
const torsoSkin = (p: THREE.Vector3) => p.y > -1.2 && (Math.abs(p.x) < 1.75 || p.y > 6.2);

/* ------------------------------------------------------------------ fitting */
const tgt = { point: new V3(), distance: 0, faceIndex: 0 } as any;
const closest = (k: Key, p: THREE.Vector3) => { bvh[k].closestPointToPoint(p, tgt); return tgt.point.clone() as THREE.Vector3; };

/** Least-squares affine x' = A x + t from weighted pairs (three independent 4×4 normal systems). */
function solveAffine(P: THREE.Vector3[], Q: THREE.Vector3[], W: number[]) {
  const N = Array.from({ length: 4 }, () => new Float64Array(4)); const R = [new Float64Array(4), new Float64Array(4), new Float64Array(4)];
  for (let i = 0; i < P.length; i++) {
    const h = [P[i].x, P[i].y, P[i].z, 1]; const q = [Q[i].x, Q[i].y, Q[i].z]; const w = W[i];
    for (let r = 0; r < 4; r++) { for (let c = 0; c < 4; c++) N[r][c] += w * h[r] * h[c]; for (let d = 0; d < 3; d++) R[d][r] += w * h[r] * q[d]; }
  }
  const sol = R.map((rhs) => gauss(N.map((r) => Array.from(r)), Array.from(rhs)));
  return new THREE.Matrix4().set(sol[0][0], sol[0][1], sol[0][2], sol[0][3], sol[1][0], sol[1][1], sol[1][2], sol[1][3], sol[2][0], sol[2][1], sol[2][2], sol[2][3], 0, 0, 0, 1);
}
function gauss(A: number[][], b: number[]) {
  const n = b.length; for (let i = 0; i < n; i++) A[i][i] += 1e-9;
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
    for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
  }
  const x = new Array(n).fill(0); for (let r = n - 1; r >= 0; r--) { let s = b[r]; for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k]; x[r] = s / A[r][r]; } return x;
}

/* 1. initial similarity from shared-structure centroids (scale from the trunk height: sacrum → lung apices) */
const cen = (g: THREE.BufferGeometry) => { g.computeBoundingBox(); return g.boundingBox!.getCenter(new V3()); };
const sKeys: Key[] = ['lung_R', 'lung_L', 'liver', 'kidney_R', 'kidney_L', 'heart', 'hip_R', 'hip_L', 'sacrum'];
let A = solveAffine(sKeys.map((k) => cen(source[k])), sKeys.map((k) => cen(target[k])), sKeys.map(() => 1));

/* 2. affine ICP with trimming */
const cur = (p: THREE.Vector3, m: THREE.Matrix4) => p.clone().applyMatrix4(m);
function residuals(m: THREE.Matrix4, field?: (p: THREE.Vector3) => THREE.Vector3) {
  const out: { i: number; q: THREE.Vector3; d: number; x: THREE.Vector3 }[] = [];
  pts.forEach((pt, i) => {
    let x = cur(pt.p, m); if (field) x = x.add(field(x));
    if (pt.k === 'skin' && !torsoSkin(x)) return;
    const q = closest(pt.k, x); out.push({ i, q, d: q.distanceTo(x), x });
  });
  return out;
}
for (let it = 0; it < 40; it++) {
  const r = residuals(A); const sorted = r.map((x) => x.d).sort((a, b) => a - b); const cut = sorted[Math.floor(sorted.length * 0.9)];
  const keep = r.filter((x) => x.d <= cut);
  A = solveAffine(keep.map((x) => pts[x.i].p), keep.map((x) => x.q), keep.map((x) => pts[x.i].w));
  if (it % 10 === 9) log('affine ICP', it + 1, 'median residual', (sorted[sorted.length >> 1] * 100).toFixed(1), 'mm');
}

/* 3. non-rigid correction: coarse-to-fine Gaussian-weighted displacement field (Nadaraya–Watson), accumulated */
interface Kern { c: THREE.Vector3[]; d: THREE.Vector3[]; w: number[]; s: number; hash: Map<string, number[]> }
const kernels: Kern[] = [];
const hkey = (x: number, y: number, z: number) => x + ',' + y + ',' + z;
function fieldAt(p: THREE.Vector3) {
  const out = new V3();
  for (const K of kernels) {
    let sw = 0; const acc = new V3(); const s2 = 2 * K.s * K.s; const h = 3 * K.s;
    const gx = Math.floor(p.x / h), gy = Math.floor(p.y / h), gz = Math.floor(p.z / h);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) {
      const list = K.hash.get(hkey(gx + a, gy + b, gz + c)); if (!list) continue;
      for (const i of list) { const d2 = K.c[i].distanceToSquared(p); if (d2 > h * h) continue; const w = K.w[i] * Math.exp(-d2 / s2); sw += w; acc.addScaledVector(K.d[i], w); }
    }
    // ε keeps the field from extrapolating far from the data (it decays to zero there)
    out.add(acc.divideScalar(sw + 0.15));
  }
  return out;
}
const field = (p: THREE.Vector3) => fieldAt(p);
for (const s of [0.9, 0.55, 0.35]) {
  const r = residuals(A, kernels.length ? field : undefined).filter((x) => x.d < 0.45);
  // thin the kernel centres so the field stays smooth and cheap
  const K: Kern = { c: [], d: [], w: [], s, hash: new Map() }; const seen = new Set<string>(); const cell = s / 2.5;
  for (const x of r) { const key = [Math.floor(x.x.x / cell), Math.floor(x.x.y / cell), Math.floor(x.x.z / cell), pts[x.i].k].join(); if (seen.has(key)) continue; seen.add(key); K.c.push(x.x); K.d.push(x.q.clone().sub(x.x)); K.w.push(pts[x.i].w); }
  K.c.forEach((c, i) => { const h = 3 * s; const k = hkey(Math.floor(c.x / h), Math.floor(c.y / h), Math.floor(c.z / h)); (K.hash.get(k) ?? K.hash.set(k, []).get(k)!).push(i); });
  kernels.push(K);
  const after = residuals(A, field).map((x) => x.d).sort((a, b) => a - b);
  const by: Record<string, number[]> = {}; for (const x of residuals(A, field)) (by[pts[x.i].k] ??= []).push(x.d);
  log('  per structure median mm', Object.entries(by).map(([k, v]) => k + ':' + (v.sort((a, b) => a - b)[v.length >> 1] * 100).toFixed(0)).join(' '));
  log('non-rigid σ', s, 'kernels', K.c.length, 'median residual', (after[after.length >> 1] * 100).toFixed(1), 'mm, p90', (after[Math.floor(after.length * 0.9)] * 100).toFixed(1), 'mm');
}
/* the fit (BodyParts3D frame → VHM body frame) is saved so other BodyParts3D-derived assets (Z-Anatomy nerves) can reuse it */
fs.writeFileSync(path.join(ROOT, 'pipeline/bp3d-fit.json'), JSON.stringify({
  note: 'BodyParts3D 3.0 → Visible Human Male body frame. p_bp (decimetres; x=X/100, y=Z/100, z=-Y/100 of the STL mm) → A·p, then add the sum over levels of the Gaussian-weighted displacement field (see fieldAt in build-skeleton.ts).',
  A: A.elements.map((x) => +x.toFixed(7)),
  kernels: kernels.map((K) => ({ s: K.s, c: K.c.map((v) => v.toArray().map((x) => +x.toFixed(5))), d: K.d.map((v) => v.toArray().map((x) => +x.toFixed(5))), w: K.w })),
}));
const fit = (g: THREE.BufferGeometry) => {
  const p = g.attributes.position; const v = new V3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(A); v.add(fieldAt(v)); p.setXYZ(i, v.x, v.y, v.z); }
  p.needsUpdate = true; g.computeVertexNormals(); return g;
};

/* ------------------------------------------------------------------ bones */
const parts: OutPart[] = [];
const tris = (g: THREE.BufferGeometry) => g.index!.count / 3;
const toTris = (g: THREE.BufferGeometry, n: number) => simplify(g, Math.min(1, n / tris(g)), 0.02);
const add = (id: string, role: string, geo: THREE.BufferGeometry, extras: Record<string, unknown> = {}) => { geo.computeVertexNormals(); parts.push({ id, role, geo, extras }); };

const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const SIDE = { L: 'left', R: 'right' } as const;
const bp: { id: string; role: string; en: string[]; tri: number; label: string }[] = [];
bp.push({ id: 'skull', role: 'bone', en: ['frontal bone', 'occipital bone', 'sphenoid bone', 'right parietal bone', 'left parietal bone', 'right temporal bone', 'left temporal bone', 'right zygomatic bone', 'left zygomatic bone', 'right maxilla', 'left maxilla', 'right nasal bone', 'left nasal bone', 'right lacrimal bone', 'left lacrimal bone', 'right palatine bone', 'left palatine bone'], tri: 30000, label: 'Skull' });
bp.push({ id: 'mandible', role: 'bone', en: ['mandible'], tri: 4000, label: 'Mandible' });
bp.push({ id: 'C1', role: 'vertebra', en: ['atlas'], tri: 2000, label: 'C1 (atlas)' });
bp.push({ id: 'C2', role: 'vertebra', en: ['axis'], tri: 2000, label: 'C2 (axis)' });
for (let i = 3; i <= 7; i++) bp.push({ id: 'C' + i, role: 'vertebra', en: [ORD[i - 1] + ' cervical vertebra'], tri: 1800, label: 'C' + i });
for (let i = 1; i <= 12; i++) bp.push({ id: 'T' + i, role: 'vertebra', en: [ORD[i - 1] + ' thoracic vertebra'], tri: 2200, label: 'T' + i });
for (let i = 1; i <= 5; i++) bp.push({ id: 'L' + i, role: 'vertebra', en: [ORD[i - 1] + ' lumbar vertebra'], tri: 2600, label: 'L' + i });
for (const s of ['R', 'L'] as const) for (let i = 1; i <= 12; i++) {
  bp.push({ id: `rib_${s}${i}`, role: 'rib', en: [`${SIDE[s]} ${ORD[i - 1]} rib`], tri: 1600, label: `${SIDE[s] === 'left' ? 'Left' : 'Right'} rib ${i}` });
  const cc = `${SIDE[s]} ${ORD[i - 1]} costal cartilage`; if (names.has(cc)) bp.push({ id: `costal_${s}${i}`, role: 'cartilage', en: [cc], tri: 600, label: `${SIDE[s] === 'left' ? 'Left' : 'Right'} costal cartilage ${i}` });
}
bp.push({ id: 'manubrium', role: 'bone', en: ['manubrium'], tri: 1500, label: 'Manubrium' });
bp.push({ id: 'sternum_body', role: 'bone', en: ['body of sternum'], tri: 1800, label: 'Body of sternum' });
bp.push({ id: 'xiphoid', role: 'cartilage', en: ['xiphoid process'], tri: 400, label: 'Xiphoid process' });
for (const s of ['R', 'L'] as const) {
  const side = SIDE[s]; const Side = side === 'left' ? 'Left' : 'Right';
  bp.push({ id: 'clavicle_' + s, role: 'bone', en: [side + ' clavicle'], tri: 1500, label: Side + ' clavicle' });
  bp.push({ id: 'scapula_' + s, role: 'bone', en: [side + ' scapula'], tri: 3500, label: Side + ' scapula' });
  bp.push({ id: 'humerus_' + s, role: 'bone', en: [side + ' humerus'], tri: 3000, label: Side + ' humerus' });
}
const missing: string[] = [];
for (const b of bp) {
  const ok = b.en.filter((e) => names.has(e)); if (ok.length < b.en.length) missing.push(...b.en.filter((e) => !names.has(e)));
  if (!ok.length) continue;
  // simplify first (in source space), then fit — the fit is smooth, so the order does not change the shape
  const g = toTris(ok.length > 1 ? mergeGeos(ok.map((e) => readSTL(fma(e)))) : readSTL(fma(ok[0])), b.tri);
  add(b.id, b.role, fit(g), { label: b.label, source: 'BodyParts3D' });
}
if (missing.length) log('BodyParts3D lacks', missing.join(', '));
const part = (id: string) => parts.find((p) => p.id === id);
const box = (g: THREE.BufferGeometry, keep?: (v: THREE.Vector3) => boolean) => { const b = new THREE.Box3(); const a = g.attributes.position; const v = new V3(); for (let i = 0; i < a.count; i++) { v.fromBufferAttribute(a, i); if (!keep || keep(v)) b.expandByPoint(v); } return b; };
const smooth01 = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/* --- head: the cranial vault is fitted to the VHM brain (inner table ≈ brain + 3 mm; vault ≈ 6.5 mm thick).
       No shared head structure exists in BodyParts3D 3.0 (no cortex surface), so this replaces the skin-only fit above
       the skull base; the correction fades out over C1–C3 so the craniocervical junction stays connected. */
{
  const brain = mergeGeos(pick(/^Allen_/).map(tf)); const bb = box(brain); const bc = bb.getCenter(new V3()); const bh = bb.getSize(new V3()).multiplyScalar(0.5);
  const skull = part('skull')!; const vaultTest = (v: THREE.Vector3) => v.y > bc.y - 0.15 * bh.y;
  const vb = box(skull.geo, vaultTest); const vc = vb.getCenter(new V3()); const vh = vb.getSize(new V3()).multiplyScalar(0.5);
  const T_IN = 0.065, GAP = 0.03;
  const sx = (bh.x + GAP) / (vh.x - T_IN), sz = (bh.z + GAP) / (vh.z - T_IN);
  const topNeed = bb.max.y + GAP + T_IN; const base = bc.y - bh.y; // vertical: keep the skull base, move the vertex to clear the brain
  const sy = (topNeed - base) / Math.max(0.5, vb.max.y - base);
  log('head fit: brain half-extent mm', bh.toArray().map((x) => (x * 100).toFixed(0)).join('/'), 'vault scale x/y/z', sx.toFixed(3), sy.toFixed(3), sz.toFixed(3));
  const c3 = part('C3') ? box(part('C3')!.geo).max.y : base - 0.6; const c1 = part('C1') ? box(part('C1')!.geo).getCenter(new V3()).y : base - 0.2;
  const head = (v: THREE.Vector3) => {
    const w = smooth01((v.y - c3) / Math.max(0.05, c1 - c3)); if (w <= 0) return v;
    const x = bc.x + (v.x - vc.x) * sx, y = base + (v.y - base) * sy, z = bc.z + (v.z - vc.z) * sz;
    return v.set(v.x + (x - v.x) * w, v.y + (y - v.y) * w, v.z + (z - v.z) * w);
  };
  for (const id of ['skull', 'mandible', 'hyoid', 'C1', 'C2', 'C3']) { const p = part(id); if (!p) continue; const a = p.geo.attributes.position; const v = new V3(); for (let i = 0; i < a.count; i++) { head(v.fromBufferAttribute(a, i)); a.setXYZ(i, v.x, v.y, v.z); } a.needsUpdate = true; p.geo.computeVertexNormals(); }

  /* radial refinement of the vault: in ~400 directions from the brain centre, the inner table is moved to sit GAP
     outside the cortex (snug both ways), smoothed over ~15°; it fades out below the orbits so the face is untouched */
  const brainBvh = new MeshBVH(brain); const dirs: THREE.Vector3[] = []; const ND = 400;
  for (let k = 0; k < ND; k++) { const yy = 1 - (2 * (k + 0.5)) / ND; const r = Math.sqrt(1 - yy * yy); const th = k * Math.PI * (3 - Math.sqrt(5)); dirs.push(new V3(Math.cos(th) * r, yy, Math.sin(th) * r)); }
  const sk = skull.geo.attributes.position; const sv: THREE.Vector3[] = []; for (let i = 0; i < sk.count; i++) sv.push(new V3().fromBufferAttribute(sk, i));
  const wV = (v: THREE.Vector3) => smooth01((v.y - (bc.y - 0.45 * bh.y)) / (0.35 * bh.y));
  const ray = new THREE.Ray(); const scale = dirs.map((d) => {
    ray.set(bc, d); const hits = brainBvh.raycast(ray, THREE.DoubleSide); if (!hits.length) return NaN; const rb = Math.max(...hits.map((h) => h.distance));
    let rin = Infinity; for (const v of sv) { if (wV(v) < 0.5) continue; const o = v.clone().sub(bc); const r = o.length(); if (o.dot(d) / r > Math.cos(0.12)) rin = Math.min(rin, r); }
    return Number.isFinite(rin) ? Math.min(1.2, Math.max(0.88, (rb + GAP) / rin)) : NaN;
  });
  const fac = (u: THREE.Vector3) => { let sw = 0, acc = 0; dirs.forEach((d, k) => { if (Number.isNaN(scale[k])) return; const c = d.dot(u); if (c < 0.85) return; const w = Math.exp((c - 1) / 0.035); sw += w; acc += w * scale[k]; }); return sw ? acc / sw : 1; };
  const ok = scale.filter((x) => !Number.isNaN(x)); log('vault radial scale range', Math.min(...ok).toFixed(3), '…', Math.max(...ok).toFixed(3));
  for (let i = 0; i < sk.count; i++) { const v = sv[i]; const w = wV(v); if (w <= 0) continue; const o = v.clone().sub(bc); const f = 1 + (fac(o.clone().normalize()) - 1) * w; o.multiplyScalar(f).add(bc); sk.setXYZ(i, o.x, o.y, o.z); }
  sk.needsUpdate = true; skull.geo.computeVertexNormals();
  let poke = 0, n = 0; const ray2 = new THREE.Ray(); const skB = new MeshBVH(skull.geo); const bp2 = brain.attributes.position; const q = new V3();
  for (let i = 0; i < bp2.count; i += 7) { q.fromBufferAttribute(bp2, i); if (q.y < bc.y - 0.3 * bh.y) continue; n++; ray2.set(bc, q.clone().sub(bc).normalize()); const h = skB.raycast(ray2, THREE.DoubleSide); const rq = q.distanceTo(bc); if (h.length && Math.min(...h.map((x) => x.distance)) < rq) poke++; }
  log('upper brain samples outside the inner table', (100 * poke / n).toFixed(1), '%');
}

/* --- humeri: the two bodies hold their arms differently (VHM is abducted), so each humerus is rotated rigidly about
       its own head (which stays in the glenoid of the fitted scapula) onto the axis of the VHM upper-arm skin. */
const pca = (pts: THREE.Vector3[]) => {
  const c = pts.reduce((a, p) => a.add(p), new V3()).divideScalar(pts.length); const m = [0, 0, 0, 0, 0, 0];
  for (const p of pts) { const d = p.clone().sub(c); m[0] += d.x * d.x; m[1] += d.x * d.y; m[2] += d.x * d.z; m[3] += d.y * d.y; m[4] += d.y * d.z; m[5] += d.z * d.z; }
  let v = new V3(1, 1, 1).normalize(); for (let k = 0; k < 60; k++) v = new V3(m[0] * v.x + m[1] * v.y + m[2] * v.z, m[1] * v.x + m[3] * v.y + m[4] * v.z, m[2] * v.x + m[4] * v.y + m[5] * v.z).normalize();
  return { c, v };
};
for (const s of ['R', 'L'] as const) {
  const hum = part('humerus_' + s); if (!hum) continue; const sign = s === 'L' ? 1 : -1;
  const a = hum.geo.attributes.position; const verts: THREE.Vector3[] = []; for (let i = 0; i < a.count; i++) verts.push(new V3().fromBufferAttribute(a, i));
  const ax0 = pca(verts); if (ax0.v.y < 0) ax0.v.negate(); // points up the shaft
  const along = verts.map((v) => v.clone().sub(ax0.c).dot(ax0.v)); const top = Math.max(...along); const len = top - Math.min(...along);
  const headC = verts.filter((_, i) => along[i] > top - 0.12 * len).reduce((acc, v) => acc.add(v), new V3()).divideScalar(verts.filter((_, i) => along[i] > top - 0.12 * len).length);
  // VHM upper-arm skin: skin vertices lateral to the trunk, within one humerus length of the shoulder
  const sk = target.skin.attributes.position; const arm: THREE.Vector3[] = []; const v = new V3();
  for (let i = 0; i < sk.count; i++) { v.fromBufferAttribute(sk, i); if (v.x * sign < 1.75) continue; const d = v.distanceTo(headC); if (d > 0.35 && d < len * 0.92) arm.push(v.clone()); }
  const armAx = pca(arm); const dir = armAx.c.clone().sub(headC).normalize(); // from shoulder toward the elbow
  const down = ax0.v.clone().negate(); const q = new THREE.Quaternion().setFromUnitVectors(down, dir);
  for (let i = 0; i < a.count; i++) { v.fromBufferAttribute(a, i).sub(headC).applyQuaternion(q).add(headC); a.setXYZ(i, v.x, v.y, v.z); }
  a.needsUpdate = true; hum.geo.computeVertexNormals();
  log('humerus', s, 'rotated', (down.angleTo(dir) * 180 / Math.PI).toFixed(0), '° onto the arm axis; arm skin samples', arm.length);
}

/* --- keep fitted bone under the VHM skin: any BodyParts3D vertex within MARGIN of the skin (or outside it) is pulled
       in along the skin normal; the pull is diffused to neighbouring vertices so prominences flatten, not crimp. */
{
  const MARGIN = 0.025; const skin = target.skin; const sp = skin.attributes.position; const six = skin.index!.array;
  const fn = (f: number) => { const a = new V3().fromBufferAttribute(sp, six[f * 3]), b = new V3().fromBufferAttribute(sp, six[f * 3 + 1]), c = new V3().fromBufferAttribute(sp, six[f * 3 + 2]); return b.sub(a).cross(c.sub(a)).normalize(); };
  const probe = new V3(0, 4.5, 0); bvh.skin.closestPointToPoint(probe, tgt); const outward = probe.clone().sub(tgt.point).dot(fn(tgt.faceIndex)) < 0 ? 1 : -1;
  let moved = 0;
  for (const p of parts) {
    if (p.extras?.source !== 'BodyParts3D') continue; const a = p.geo.attributes.position; const n = a.count; const push = new Float32Array(n * 3); const v = new V3();
    for (let i = 0; i < n; i++) { v.fromBufferAttribute(a, i); bvh.skin.closestPointToPoint(v, tgt); const nn = fn(tgt.faceIndex).multiplyScalar(outward); const depth = -v.clone().sub(tgt.point).dot(nn); // >0 inside
      if (depth < MARGIN && tgt.distance < 0.6) { const d = nn.multiplyScalar(-(MARGIN - depth)); push[i * 3] = d.x; push[i * 3 + 1] = d.y; push[i * 3 + 2] = d.z; moved++; } }
    // diffuse the push over the mesh graph (3 passes), never weakening a vertex's own required push
    const ix = p.geo.index!.array; const nb: number[][] = Array.from({ length: n }, () => []);
    for (let t = 0; t < ix.length; t += 3) for (let e = 0; e < 3; e++) { nb[ix[t + e]].push(ix[t + (e + 1) % 3]); nb[ix[t + (e + 1) % 3]].push(ix[t + e]); }
    let cur = push; for (let pass = 0; pass < 3; pass++) { const nx = new Float32Array(cur); for (let i = 0; i < n; i++) { if (!nb[i].length) continue; let x = 0, y = 0, z = 0; for (const j of nb[i]) { x += cur[j * 3]; y += cur[j * 3 + 1]; z += cur[j * 3 + 2]; } const k = nb[i].length; const own = push[i * 3] ** 2 + push[i * 3 + 1] ** 2 + push[i * 3 + 2] ** 2; const avg = [x / k, y / k, z / k]; const al = avg[0] ** 2 + avg[1] ** 2 + avg[2] ** 2; if (al > own) { nx[i * 3] = 0.5 * (cur[i * 3] + avg[0]); nx[i * 3 + 1] = 0.5 * (cur[i * 3 + 1] + avg[1]); nx[i * 3 + 2] = 0.5 * (cur[i * 3 + 2] + avg[2]); } } cur = nx; }
    for (let i = 0; i < n; i++) a.setXYZ(i, a.getX(i) + cur[i * 3], a.getY(i) + cur[i * 3 + 1], a.getZ(i) + cur[i * 3 + 2]);
    a.needsUpdate = true; p.geo.computeVertexNormals();
  }
  log('vertices pulled under the skin', moved);
}

/* HuBMAP bones: the reference body's own (no fitting) */
const hub: [string, RegExp, number, string][] = [
  ['hip_R', /VH_M_(ilium|ischium|pubis)_compact_bone_R$/, 6000, 'Right hip bone'], ['hip_L', /VH_M_(ilium|ischium|pubis)_compact_bone_L$/, 6000, 'Left hip bone'],
  ['hyoid', /VH_M_hyoid$/, 1200, 'Hyoid'], ['sacrum', /VH_M_sacrum$/, 4000, 'Sacrum'], ['coccyx', /VH_M_coccyx$/, 600, 'Coccyx'],
  ['femur_R', /VH_M_femur_R$/, 5000, 'Right femur'], ['femur_L', /VH_M_femur_L$/, 5000, 'Left femur'],
  ['tibia_R', /VH_M_tibia_R$/, 3000, 'Right tibia'], ['tibia_L', /VH_M_tibia_L$/, 3000, 'Left tibia'],
  ['fibula_R', /VH_M_fibula_R$/, 1200, 'Right fibula'], ['fibula_L', /VH_M_fibula_L$/, 1200, 'Left fibula'],
  ['patella_R', /VH_M_patella_R$/, 600, 'Right patella'], ['patella_L', /VH_M_patella_L$/, 600, 'Left patella'],
];
for (const [id, re, n, label] of hub) { const gs = pick(re).map(tf); if (!gs.length) continue; add(id, 'bone', toTris(gs.length > 1 ? mergeGeos(gs) : gs[0], n), { label, source: 'HuBMAP' }); }

/* ------------------------------------------------------------------ quality report (honest numbers, not hidden by the fit) */
const inside = (b: MeshBVH, p: THREE.Vector3) => {
  const ray = new THREE.Ray(p, new V3(0.577, 0.577, 0.577)); const hits = b.raycast(ray, THREE.DoubleSide).map((h) => h.distance).sort((x, y) => x - y);
  let n = 0, last = -1; for (const d of hits) { if (d - last > 1e-6) n++; last = d; } return n % 2 === 1;
};
const frac = (ids: RegExp, test: (p: THREE.Vector3) => boolean) => {
  let n = 0, k = 0; const v = new V3();
  for (const p of parts) { if (!ids.test(p.id)) continue; const a = p.geo.attributes.position; for (let i = 0; i < a.count; i += 3) { v.fromBufferAttribute(a, i); n++; if (test(v)) k++; } }
  return n ? k / n : 0;
};
const report = {
  ribVerticesInsideLung: frac(/^rib_/, (p) => inside(bvh.lung_R, p) || inside(bvh.lung_L, p)),
  axialBoneVerticesOutsideSkin: frac(/^(skull|C\d|T\d|L\d|rib_|costal_|manubrium|sternum|xiphoid|clavicle|scapula)/, (p) => !inside(bvh.skin, p)),
  skullVerticesOutsideSkin: frac(/^(skull|mandible)$/, (p) => !inside(bvh.skin, p)),
  humerusVerticesOutsideSkin: frac(/^humerus/, (p) => !inside(bvh.skin, p)),
  l5ToSacrumGapMm: 0,
};
{ const l5 = parts.find((p) => p.id === 'L5'); const sac = parts.find((p) => p.id === 'sacrum');
  if (l5 && sac) { const b = new MeshBVH(sac.geo); let best = 1e9; const v = new V3(); const a = l5.geo.attributes.position; for (let i = 0; i < a.count; i++) { v.fromBufferAttribute(a, i); b.closestPointToPoint(v, tgt); best = Math.min(best, tgt.distance); } report.l5ToSacrumGapMm = +(best * 100).toFixed(1); } }
/* vertebral levels of the neck landmarks (textbook: hyoid C3, thyroid cartilage C4–C5, cricoid C6) */
{ const lev = (y: number) => { let best = '', d = Infinity; for (const p of parts) if (/^C\d$|^T1$/.test(p.id)) { const c = cen(p.geo).y; if (Math.abs(c - y) < d) { d = Math.abs(c - y); best = p.id; } } return best; };
  const yOf = (g: THREE.BufferGeometry) => cen(g).y;
  (report as Record<string, unknown>).levels = { hyoid: lev(yOf(target.hyoid)), thyroidCartilage: lev(yOf(target.thyroid)), cricoid: lev(yOf(tf(larynx.get('VH_M_cricoid_cartilage')!))) }; }
log('fit report', JSON.stringify(report));

/* humeri that poke out of the arm skin are dropped rather than shipped wrong */
if (report.humerusVerticesOutsideSkin > 0.05) { log('humeri dropped: arm pose differs between the two bodies'); for (let i = parts.length - 1; i >= 0; i--) if (/^humerus/.test(parts[i].id)) parts.splice(i, 1); }

await writeGLB('public/models/skeleton.glb', parts, {
  bone: { color: [0.89, 0.85, 0.76], rough: 0.55 }, vertebra: { color: [0.88, 0.84, 0.75], rough: 0.55 }, rib: { color: [0.9, 0.86, 0.77], rough: 0.5 },
  cartilage: { color: [0.78, 0.84, 0.86], rough: 0.35 }, default: { color: [0.89, 0.85, 0.76], rough: 0.55 },
});
const centres: Record<string, number[]> = {}; const labels: Record<string, string> = {};
for (const p of parts) { centres[p.id] = cen(p.geo).toArray().map((x) => +x.toFixed(3)); labels[p.id] = String(p.extras?.label ?? p.id); }
fs.writeFileSync(path.join(ROOT, 'public/models/skeleton.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior', centres, labels, fit: report,
  attribution: [
    { title: 'BodyParts3D 3.0 (skull, spine C1–L5, ribs, costal cartilages, sternum, clavicles, scapulae, humeri)', creators: 'Database Center for Life Science (DBCLS)', notice: 'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan', license: 'CC BY-SA 2.1 JP', licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en', sourceUrl: 'https://doi.org/10.18908/lsdba.nbdc00837-000', changes: 'Converted from STL; fitted onto the Visible Human Male body (affine + smooth non-rigid correction driven by shared organs and skin); simplified.' },
    { title: '3D Reference Organs: Visible Human Male (hip bones, sacrum, coccyx, femora, tibiae, fibulae, patellae)', creators: 'HuBMAP / Human Reference Atlas consortium', data: 'Visible Human Male, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Compact bone surfaces merged per bone; simplified.' },
  ],
  license: 'The skeleton.glb file as a whole is distributed under CC BY-SA 2.1 JP because it contains BodyParts3D-derived geometry.',
}, null, 1));
log('done', parts.length, 'bones,', parts.reduce((s, p) => s + tris(p.geo), 0), 'triangles');
