/**
 * Real cerebral arteries for the neuro module (cerebral-arteries.glb), replacing the schematic tree drawn from a
 * normalised brain frame (src/neuro/anatomy.ts keeps the tree's ids, parents and territories; this supplies the
 * geometry and the measured centrelines).
 *
 * Source: Z-Anatomy CardioVascular (CC BY-SA 4.0; BodyParts3D-derived): internal carotid, ophthalmic, vertebral,
 * basilar + pontine branches, SCA, AICA, PICA, P-comm, A-comm, ACA (A1), pericallosal, callosomarginal + frontal and
 * orbitofrontal branches, MCA M1 + lenticulostriate branches, insular M2, M3, temporal and parietal branches, PCA.
 *
 * Placement: Z-Anatomy → BodyParts3D → Visible Human Male (pipeline/zanatomy.ts), then a 12-dof affine ICP of the
 * Z-Anatomy cortex + cerebellum onto this body's brain (body.glb) so the pial arteries lie on our cortex.
 *
 * Each Z-Anatomy mesh is assigned to the app's vessel ids (ica_R, m1_L, m2s_L, p2_R, …). Per vessel:
 *  - a centreline measured from the mesh (geodesic main path, cross-section centroids) with measured radii;
 *  - per-vertex `_vt` = position along that centreline (0 proximal → 1 distal), so the app can colour flow up to a clot.
 *
 *   npm run asset:cerebral   (needs body.glb, skeleton fit, Z-Anatomy FBX in assets/source/z-anatomy)
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ROOT, log, readGLBDecoded, writeGLB, mergeGeos, simplify, MeshoptSimplifier, type OutPart, V3 } from './common';
import { readFBX, verts, mean, zToBody } from './zanatomy';
await MeshoptSimplifier.ready;

/* ------------------------------------------------------------------ 1. sources into the body */
const ART = readFBX('CardioVascular41.fbx', /cerebr|carotid|basilar|vertebral_artery|communicating|ophthalmic_artery|callos|pontine|cerebellar_artery|striate|Insular_branches|M3|Temporal_branches_of_middle|Parietal_branches_of_middle/i);
const CTX = readFBX('NervousSystem100.fbx', /gyr|sulc|pole|lobule|Insula_|Cuneus|Precuneus|Paracentral|Tonsil_of_cerebellum|cerebell(?!ar_peduncle)/i);
log('Z-Anatomy arteries', ART.size, 'cortex/cerebellum pieces', CTX.size);
for (const g of ART.values()) zToBody(g);
const brain = (await readGLBDecoded('public/models/body.glb')).get('brain')!; brain.computeBoundingBox(); const brainBox = brain.boundingBox!.clone().expandByScalar(0.12);
// only pieces that land inside the cranium (the name filter also catches a few spinal/other sulci)
const zCortex = mergeGeos([...CTX.values()].map((g) => zToBody(g)).filter((g) => { g.computeBoundingBox(); return brainBox.containsBox(g.boundingBox!); }));

/** 12-dof affine ICP (symmetric closest points): Z cortex → body brain */
function solveAffine(src: THREE.Vector3[], dst: THREE.Vector3[]) {
  // least squares for [x y z 1] · M = dst, per output axis (4×4 normal equations)
  const N = Array.from({ length: 4 }, () => [0, 0, 0, 0]); const B = Array.from({ length: 4 }, () => [0, 0, 0]);
  src.forEach((p, i) => { const a = [p.x, p.y, p.z, 1]; const d = dst[i]; for (let r = 0; r < 4; r++) { for (let c = 0; c < 4; c++) N[r][c] += a[r] * a[c]; B[r][0] += a[r] * d.x; B[r][1] += a[r] * d.y; B[r][2] += a[r] * d.z; } });
  // Gauss-Jordan
  const Mx = N.map((r, i) => [...r, ...B[i]]);
  for (let c = 0; c < 4; c++) { let p = c; for (let r = c + 1; r < 4; r++) if (Math.abs(Mx[r][c]) > Math.abs(Mx[p][c])) p = r; [Mx[c], Mx[p]] = [Mx[p], Mx[c]]; const d = Mx[c][c]; for (let k = 0; k < 7; k++) Mx[c][k] /= d; for (let r = 0; r < 4; r++) if (r !== c) { const f = Mx[r][c]; for (let k = 0; k < 7; k++) Mx[r][k] -= f * Mx[c][k]; } }
  const X = Mx.map((r) => r.slice(4)); // 4×3
  return new THREE.Matrix4().set(X[0][0], X[1][0], X[2][0], X[3][0], X[0][1], X[1][1], X[2][1], X[3][1], X[0][2], X[1][2], X[2][2], X[3][2], 0, 0, 0, 1);
}
const zc = verts(zCortex).filter((_, i) => i % 3 === 0); const bv = verts(brain).filter((_, i) => i % 3 === 0);
const bB = new MeshBVH(brain); const tq = { point: new V3(), distance: 0 } as any;
let AFF = new THREE.Matrix4();
{ // start from the box-to-box map, then ICP
  const b1 = new THREE.Box3().setFromPoints(zc), b2 = new THREE.Box3().setFromPoints(bv); const s1 = b1.getSize(new V3()), s2 = b2.getSize(new V3()), c1 = b1.getCenter(new V3()), c2 = b2.getCenter(new V3());
  AFF = new THREE.Matrix4().makeTranslation(c2.x, c2.y, c2.z).multiply(new THREE.Matrix4().makeScale(s2.x / s1.x, s2.y / s1.y, s2.z / s1.z)).multiply(new THREE.Matrix4().makeTranslation(-c1.x, -c1.y, -c1.z));
  log('Z cortex box', b1.min.toArray().map((x) => x.toFixed(2)).join(','), b1.max.toArray().map((x) => x.toFixed(2)).join(','), 'brain box', b2.min.toArray().map((x) => x.toFixed(2)).join(','), b2.max.toArray().map((x) => x.toFixed(2)).join(','));
  log('box map scale', (s2.x / s1.x).toFixed(3), (s2.y / s1.y).toFixed(3), (s2.z / s1.z).toFixed(3));
}
for (let it = 0; it < 30; it++) {
  const cur = zCortex.clone().applyMatrix4(AFF); const cB = new MeshBVH(cur); const src: THREE.Vector3[] = [], dst: THREE.Vector3[] = []; const res: number[] = [];
  zc.forEach((p) => { const q = p.clone().applyMatrix4(AFF); bB.closestPointToPoint(q, tq); src.push(p); dst.push(tq.point.clone()); res.push(tq.distance); });
  const inv = AFF.clone().invert();
  bv.forEach((p) => { cB.closestPointToPoint(p, tq); src.push(tq.point.clone().applyMatrix4(inv)); dst.push(p); });
  AFF = solveAffine(src, dst); if (it % 10 === 9) { res.sort((a, b) => a - b); log('cortex ICP', it + 1, 'median', (res[res.length >> 1] * 100).toFixed(2), 'mm'); }
}
for (const g of ART.values()) { g.applyMatrix4(AFF); g.computeVertexNormals(); }

/* ------------------------------------------------------------------ 2. centrelines */
type Geo = THREE.BufferGeometry;
const z = (name: string) => { const g = ART.get(name); if (!g) throw new Error('missing Z-Anatomy mesh ' + name); return g; };
const zAny = (...names: string[]) => { for (const n of names) if (ART.has(n)) return ART.get(n)!; throw new Error('missing ' + names.join(' / ')); };
function graph(g: Geo) { const P = g.attributes.position; const n = P.count; const adj: Map<number, number>[] = Array.from({ length: n }, () => new Map()); const ix = g.index!.array; const a = new V3(), b = new V3();
  for (let t = 0; t < ix.length; t += 3) for (const [i, j] of [[ix[t], ix[t + 1]], [ix[t + 1], ix[t + 2]], [ix[t + 2], ix[t]]]) { a.fromBufferAttribute(P, i); b.fromBufferAttribute(P, j); const d = a.distanceTo(b); adj[i].set(j, d); adj[j].set(i, d); }
  return adj; }
function dijkstra(adj: Map<number, number>[], src: number[]) { const n = adj.length; const d = new Float64Array(n).fill(Infinity); const prev = new Int32Array(n).fill(-1);
  // binary heap
  const h: [number, number][] = []; const push = (x: [number, number]) => { h.push(x); let i = h.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (h[p][0] <= h[i][0]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } };
  const pop = () => { const top = h[0]; const last = h.pop()!; if (h.length) { h[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < h.length && h[l][0] < h[m][0]) m = l; if (r < h.length && h[r][0] < h[m][0]) m = r; if (m === i) break; [h[m], h[i]] = [h[i], h[m]]; i = m; } } return top; };
  for (const s of src) { d[s] = 0; push([0, s]); }
  while (h.length) { const [du, u] = pop(); if (du > d[u]) continue; for (const [v, w] of adj[u]) if (du + w < d[v]) { d[v] = du + w; prev[v] = u; push([d[v], v]); } }
  return { d, prev }; }
const nearestV = (g: Geo, p: THREE.Vector3, filter?: (i: number) => boolean) => { const P = g.attributes.position; let best = 0, bd = Infinity; const q = new V3(); for (let i = 0; i < P.count; i++) { if (filter && !filter(i)) continue; q.fromBufferAttribute(P, i); const d = q.distanceToSquared(p); if (d < bd) { bd = d; best = i; } } return best; };
interface CL { pts: THREE.Vector3[]; rad: number[] }
/** centreline of the main path from `start` to `end` (or the geodesically farthest vertex, optionally chosen by `pickEnd`) */
function centreline(g0: Geo, start: THREE.Vector3, end?: THREE.Vector3 | ((P: THREE.BufferAttribute, d: Float64Array) => number), step = 0.012): CL {
  const g = mergeVertices(g0.clone(), 1e-6); const P = g.attributes.position as THREE.BufferAttribute; const adj = graph(g);
  const s = nearestV(g, start); const { d, prev } = dijkstra(adj, [s]);
  let e: number; if (end instanceof V3) e = nearestV(g, end, (i) => Number.isFinite(d[i])); else if (typeof end === 'function') e = end(P, d); else { e = s; for (let i = 0; i < P.count; i++) if (Number.isFinite(d[i]) && d[i] > d[e]) e = i; }
  if (e < 0 || !Number.isFinite(d[e])) e = s;
  const path: number[] = []; for (let v = e; v !== -1; v = prev[v]) path.push(v); path.reverse();
  // the path runs along the wall: from each path vertex cast inward across the lumen; the centre is half-way to the
  // opposite wall and the radius is half that chord (robust where branches leave, unlike cross-section centroids)
  g.computeVertexNormals(); const N = g.attributes.normal as THREE.BufferAttribute; const bvh = new MeshBVH(g); const ray = new THREE.Ray(); const p = new V3(), n = new V3();
  const L = d[path[path.length - 1]]; const pts: THREE.Vector3[] = [], rad: number[] = []; let nextAt = 0;
  for (const vi of path) {
    if (d[vi] < nextAt && vi !== path[path.length - 1]) continue; nextAt = d[vi] + step;
    p.fromBufferAttribute(P, vi); n.fromBufferAttribute(N, vi).normalize(); let best = Infinity;
    for (const sgn of [-1, 1]) { ray.set(p.clone().addScaledVector(n, sgn * 0.0003), n.clone().multiplyScalar(sgn)); const hits = bvh.raycast(ray, THREE.DoubleSide); for (const h of hits) if (h.distance > 0.001 && h.distance < 0.08 && h.distance < best) best = h.distance; if (best < Infinity && sgn === -1) break; }
    if (!Number.isFinite(best)) continue; const dir = sgn0(n, p, bvh); pts.push(p.clone().addScaledVector(dir, best / 2)); rad.push(best / 2);
  }
  if (pts.length < 2) { const a = new V3().fromBufferAttribute(P, path[0]), b = new V3().fromBufferAttribute(P, path[path.length - 1]); pts.splice(0, pts.length, a, b); rad.splice(0, rad.length, 0.01, 0.01); }
  void L;
  // light smoothing of the polyline + radii
  for (let it = 0; it < 2; it++) for (let i = 1; i < pts.length - 1; i++) pts[i] = pts[i - 1].clone().add(pts[i]).add(pts[i + 1]).multiplyScalar(1 / 3);
  const rs = rad.map((_, i) => [rad[Math.max(0, i - 2)], rad[Math.max(0, i - 1)], rad[i], rad[Math.min(rad.length - 1, i + 1)], rad[Math.min(rad.length - 1, i + 2)]].sort((a, b) => a - b)[2]);
  return { pts, rad: rs };
}
/** which way across the lumen from a wall point: the side whose ray meets the opposite wall first */
function sgn0(n: THREE.Vector3, p: THREE.Vector3, bvh: MeshBVH) { const r = new THREE.Ray(); let bd = Infinity, bs = -1;
  for (const s of [-1, 1]) { r.set(p.clone().addScaledVector(n, s * 0.0003), n.clone().multiplyScalar(s)); for (const h of bvh.raycast(r, THREE.DoubleSide)) if (h.distance > 0.001 && h.distance < 0.08 && h.distance < bd) { bd = h.distance; bs = s; } }
  return n.clone().multiplyScalar(bs); }
const head = (c: CL) => c.pts[0], tail = (c: CL) => c.pts[c.pts.length - 1];
const lowest = (g: Geo) => verts(g).reduce((a, p) => (p.y < a.y ? p : a));

const V: Record<string, { cl: CL; geos: Geo[] }> = {};
const set = (id: string, cl: CL, ...geos: Geo[]) => { V[id] = { cl, geos }; };
/** split a mesh's vertices between several centrelines (nearest), returning one triangle soup per centreline */
function splitBy(g: Geo, cls: CL[]) { const P = g.attributes.position; const ix = g.index!.array; const own = new Int32Array(P.count); const q = new V3();
  for (let i = 0; i < P.count; i++) { q.fromBufferAttribute(P, i); let best = 0, bd = Infinity; cls.forEach((c, k) => { for (const p of c.pts) { const dd = p.distanceToSquared(q); if (dd < bd) { bd = dd; best = k; } } }); own[i] = best; }
  return cls.map((_, k) => { const keep: number[] = []; for (let t = 0; t < ix.length; t += 3) { const o = [own[ix[t]], own[ix[t + 1]], own[ix[t + 2]]]; const m = o[0] === o[1] || o[0] === o[2] ? o[0] : o[1]; if (m === k) keep.push(ix[t], ix[t + 1], ix[t + 2]); } const h = g.clone(); h.setIndex(keep); return h; }); }
/** k-means (k=3) on the vertices of a branched mesh → three sub-meshes, ordered anterior → posterior */
function kmeans3(g: Geo) { const vs = verts(g); vs.sort((a, b) => b.z - a.z); let C = [vs[0], vs[vs.length >> 1], vs[vs.length - 1]].map((p) => p.clone());
  const own = new Int32Array(vs.length); const P = g.attributes.position; const q = new V3();
  for (let it = 0; it < 15; it++) { const S = C.map(() => ({ s: new V3(), n: 0 })); for (let i = 0; i < P.count; i++) { q.fromBufferAttribute(P, i); let b = 0; C.forEach((c, k) => { if (c.distanceToSquared(q) < C[b].distanceToSquared(q)) b = k; }); own[i] = b; S[b].s.add(q); S[b].n++; } C = S.map((s, k) => (s.n ? s.s.divideScalar(s.n) : C[k])); }
  const order = [0, 1, 2].sort((a, b) => C[b].z - C[a].z); const ix = g.index!.array;
  return order.map((k) => { const keep: number[] = []; for (let t = 0; t < ix.length; t += 3) if (own[ix[t]] === k && own[ix[t + 1]] === k && own[ix[t + 2]] === k) keep.push(ix[t], ix[t + 1], ix[t + 2]); const h = g.clone(); h.setIndex(keep); return h; }); }

const SIDES = [['R', 'r'], ['L', 'l']] as const;
const basilarG = z('Basilar_artery'); const basCl = centreline(basilarG, lowest(basilarG)); set('basilar', basCl, basilarG, ...(['Medial_pontine_branches_of_basilar_artery', 'Lateral_pontine_branches_of_basilar_artery', 'Anterior_inferior_cerebellar_artery'].flatMap((n) => SIDES.map(([, zs]) => ART.get(n + zs)).filter(Boolean) as Geo[])));
for (const [S, zs] of SIDES) {
  const ica = z('Internal_carotid_artery' + zs); const icaCl = centreline(ica, lowest(ica)); const extras = [ART.get('Ophthalmic_artery' + zs)].filter(Boolean) as Geo[];
  set(`ica_${S}`, icaCl, ica, ...extras);
  const va = z('Vertebral_artery' + zs); const vaCl = centreline(va, lowest(va), head(basCl)); set(`vert_${S}`, vaCl, va);
  const T = tail(icaCl);
  const a1 = z('Anterior_cerebral_artery' + zs); const a1Cl = centreline(a1, T); set(`a1_${S}`, a1Cl, a1);
  const pc = z('Posterior_communicating_artery' + zs); const pcCl = centreline(pc, T); set(`pcom_${S}`, pcCl, pc);
  const m1 = zAny('Middle_cerebral_artery_(M1-segment)' + zs); const m1Cl = centreline(m1, T);
  set(`m1_${S}`, m1Cl, m1, ...['Proximal_lateral_striate_branches', 'Distal_lateral_striate_branches'].map((n) => ART.get(n + zs)).filter(Boolean) as Geo[]);
  // M2 divisions: insular M2 + M3 together; superior division ends highest, inferior division ends lowest
  const m2 = mergeGeos([zAny('Insular_branches_of_middle_cerebral_artery_(M2)' + zs, 'Insular_branches_of_middle_cerebral_artery_(M2-segment)' + zs), zAny('Middle_cerebral_artery_(M3-segment)' + zs, 'Middle_cerebral_artery_(M3_segment)' + zs)].map((g) => { const h = g.clone(); for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k); return h; }));
  const far = (sign: 1 | -1) => (P: THREE.BufferAttribute, d: Float64Array) => { let mx = 0; for (let i = 0; i < P.count; i++) if (Number.isFinite(d[i])) mx = Math.max(mx, d[i]); let b = -1; for (let i = 0; i < P.count; i++) if (d[i] > 0.45 * mx && Number.isFinite(d[i]) && (b < 0 || sign * P.getY(i) > sign * P.getY(b))) b = i; return b; };
  const m2sCl = centreline(m2, tail(m1Cl), far(1)), m2iCl = centreline(m2, tail(m1Cl), far(-1));
  const [m2sG, m2iG] = splitBy(m2, [m2sCl, m2iCl]); set(`m2s_${S}`, m2sCl, m2sG); set(`m2i_${S}`, m2iCl, m2iG);
  kmeans3(z('Parietal_branches_of_middle_cerebral_artery' + zs)).forEach((g, i) => set(`m4s${i}_${S}`, centreline(g, tail(m2sCl)), g));
  kmeans3(z('Temporal_branches_of_middle_cerebral_artery' + zs)).forEach((g, i) => set(`m4i${i}_${S}`, centreline(g, tail(m2iCl)), g));
  const peri = z('Pericallosal_artery' + zs); const a2Cl = centreline(peri, tail(a1Cl)); set(`a2_${S}`, a2Cl, peri, ...['Orbitofrontal_branches_of_anterior_cerebral_artery'].map((n) => ART.get(n + zs)).filter(Boolean) as Geo[]);
  const cm = z('Callosomarginal_artery' + zs); set(`cm_${S}`, centreline(cm, a2Cl.pts[Math.floor(a2Cl.pts.length * 0.3)]), cm, ...[ART.get('Frontal_branches_of_callosomarginal_artery' + zs)].filter(Boolean) as Geo[]);
  // PCA: P1 from the basilar tip to the P-comm junction, P2 on round the midbrain to the occipital lobe, temporal branch laterally
  const pca = z('Posterior_cerebral_artery' + zs); const J = tail(pcCl);
  const p1Cl = centreline(pca, tail(basCl), J);
  const p2Cl = centreline(pca, J, (P, d) => { let b = -1; for (let i = 0; i < P.count; i++) if (Number.isFinite(d[i]) && (b < 0 || P.getZ(i) < P.getZ(b))) b = i; return b; });
  const pcxCl = centreline(pca, J, (P, d) => { let b = -1; const sx = S === 'R' ? -1 : 1; for (let i = 0; i < P.count; i++) if (Number.isFinite(d[i]) && P.getZ(i) > J.z - 0.6 && (b < 0 || sx * P.getX(i) - 0.5 * P.getY(i) > sx * P.getX(b) - 0.5 * P.getY(b))) b = i; return b; });
  const [p1G, p2G, pcxG] = splitBy(pca, [p1Cl, p2Cl, pcxCl]); set(`p1_${S}`, p1Cl, p1G); set(`p2_${S}`, p2Cl, p2G); set(`pcx_${S}`, pcxCl, pcxG);
  const sca = z('Superior_cerebellar_artery' + zs); set(`sca_${S}`, centreline(sca, tail(basCl)), sca);
  const pica = z('Posterior_inferior_cerebellar_artery' + zs); set(`pica_${S}`, centreline(pica, vaCl.pts[Math.floor(vaCl.pts.length * 0.8)]), pica);
}
const acom = z('Anterior_communicating_artery'); set('acom', centreline(acom, tail(V.a1_R.cl)), acom);

/* ------------------------------------------------------------------ 2b. pial arteries onto this brain's surface */
// After the affine fit a few distal pial branches still stand proud of our (smoother, voxel-fused) cortex. Each
// centreline point outside the surface is pulled in radially to lie on it; the vessel's vertices follow their nearest
// centreline point, so the tube keeps its shape.
{
  const bvhB = new MeshBVH(brain); const BC = brainBox.getCenter(new V3()); const ray = new THREE.Ray();
  const surfR = (p: THREE.Vector3) => { const dir = p.clone().sub(BC).normalize(); ray.set(BC.clone().addScaledVector(dir, 3), dir.clone().negate()); const h = bvhB.raycastFirst(ray, THREE.DoubleSide); return h ? h.point.distanceTo(BC) : Infinity; };
  let moved = 0;
  for (const [id, v] of Object.entries(V)) {
    if (!/^(m2|m4|a2|cm|p2|pcx|sca|pica)/.test(id)) continue;
    const shiftOf = new Map<THREE.Vector3, THREE.Vector3>(); let any = false;
    for (const g of v.geos) {
      // per-vertex inward pull for vertices proud of the cortex, then smoothed over the mesh so tubes keep their section
      const gi = g.index ? g : mergeVertices(g, 1e-7); const P = gi.attributes.position; const n = P.count; const q = new V3();
      let disp = Array.from({ length: n }, (_, i) => { q.fromBufferAttribute(P, i); const out = q.distanceTo(BC) - surfR(q) + 0.002; return out > 0 ? q.clone().sub(BC).normalize().multiplyScalar(-out) : new V3(); });
      if (!disp.some((d) => d.lengthSq() > 1e-8)) continue; any = true;
      const adj: Set<number>[] = Array.from({ length: n }, () => new Set()); const ix = gi.index!.array; for (let t = 0; t < ix.length; t += 3) { const [a1, b1, c1] = [ix[t], ix[t + 1], ix[t + 2]]; adj[a1].add(b1).add(c1); adj[b1].add(a1).add(c1); adj[c1].add(a1).add(b1); }
      for (let it = 0; it < 12; it++) disp = disp.map((d, i) => { const m = d.clone(); let k = 1; for (const j of adj[i]) { m.add(disp[j]); k++; } m.divideScalar(k); return m.lengthSq() > d.lengthSq() ? m : d.clone().lerp(m, 0.5); });
      for (let i = 0; i < n; i++) { q.fromBufferAttribute(P, i).add(disp[i]); P.setXYZ(i, q.x, q.y, q.z); } P.needsUpdate = true;
      if (gi !== g) { g.copy(gi); }
      // carry the centreline with its nearest vertices
      for (const c of v.cl.pts) { let b = 0, bd = Infinity; for (let i = 0; i < n; i += 3) { q.fromBufferAttribute(P, i); const dd = q.distanceToSquared(c); if (dd < bd) { bd = dd; b = i; } } const cur = shiftOf.get(c); const d = disp[b]; if (!cur || d.lengthSq() > cur.lengthSq()) shiftOf.set(c, d); }
    }
    if (!any) continue; moved++;
    v.cl.pts = v.cl.pts.map((p) => p.clone().add(shiftOf.get(p) ?? new V3()));
  }
  log('pial branches seated on the cortex:', moved, 'vessels adjusted');
}

/* ------------------------------------------------------------------ 3. output: one mesh per app vessel, `_vt` along its centreline */
const parts: OutPart[] = []; const vessels: Record<string, { pts: number[][]; r0: number; r1: number; lengthMm: number }> = {};
for (const [id, { cl, geos }] of Object.entries(V)) {
  if (cl.pts.length < 2) { log('WARN short centreline', id); continue; }
  const g0 = mergeGeos(geos.map((g) => { const h = g.clone(); for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k); return h.index ? h : mergeVertices(h, 1e-7); }));
  const g = (g0.index!.count / 3) > 6000 ? simplify(g0, 6000 / (g0.index!.count / 3), 0.0003) : g0;
  const arc = [0]; for (let i = 1; i < cl.pts.length; i++) arc.push(arc[i - 1] + cl.pts[i].distanceTo(cl.pts[i - 1])); const L = arc[arc.length - 1];
  const P = g.attributes.position; const vt = new Float32Array(P.count); const q = new V3();
  for (let i = 0; i < P.count; i++) { q.fromBufferAttribute(P, i); let b = 0, bd = Infinity; cl.pts.forEach((p, k) => { const dd = p.distanceToSquared(q); if (dd < bd) { bd = dd; b = k; } }); vt[i] = arc[b] / L; }
  g.setAttribute('_vt', new THREE.BufferAttribute(vt, 1)); g.computeVertexNormals();
  parts.push({ id, role: 'artery', geo: g });
  const rs = cl.rad; const r0 = rs.slice(0, Math.max(1, rs.length >> 2)).reduce((a, b) => a + b, 0) / Math.max(1, rs.length >> 2), r1 = rs.slice(-Math.max(1, rs.length >> 2)).reduce((a, b) => a + b, 0) / Math.max(1, rs.length >> 2);
  // centreline stored every ~3 mm
  const keep = cl.pts.filter((_, i) => i % 2 === 0 || i === cl.pts.length - 1);
  vessels[id] = { pts: keep.map((p) => p.toArray().map((x) => +x.toFixed(4))), r0: +r0.toFixed(4), r1: +r1.toFixed(4), lengthMm: +(L * 100).toFixed(1) };
}
log('vessels', Object.keys(vessels).length, Object.entries(vessels).map(([k, v]) => `${k}:${v.lengthMm}mm r${(v.r0 * 200).toFixed(1)}→${(v.r1 * 200).toFixed(1)}mm⌀`).join(' '));
await writeGLB('public/models/cerebral-arteries.glb', parts, { artery: { color: [0.78, 0.12, 0.16], rough: 0.35 }, default: { color: [0.78, 0.12, 0.16], rough: 0.35 } });
fs.writeFileSync(path.join(ROOT, 'public/models/cerebral-arteries.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior', vessels,
  note: 'Real arterial geometry; each app vessel id carries its measured centreline (pts, ~3 mm spacing) and proximal/distal radius (dm). Per-vertex _vt = 0 proximal → 1 distal along that centreline. MCA cortical branches are the real parietal (superior division) and temporal (inferior division) branch trees, each split into three groups.',
  attribution: { title: 'Z-Anatomy — the open source atlas of anatomy (cerebral arteries)', creators: 'Z-Anatomy (Lluís Vinent)', notice: 'Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0; BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', sourceUrl: 'https://github.com/LluisV/Z-Anatomy', changes: 'Registered to this body (bones → BodyParts3D → skeleton fit → affine ICP of the cortex onto the HuBMAP brain), grouped per vessel, simplified; centrelines measured.' },
}, null, 1));
log('done', parts.length, 'vessel meshes');
