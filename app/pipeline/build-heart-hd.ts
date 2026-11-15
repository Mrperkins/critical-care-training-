/**
 * High-detail heart chambers for the cardiac module: the HuBMAP / Visible Human Male chamber shells (CC BY 4.0) at full
 * source resolution (LV subdivided twice, RV once — the coarsest source shells), with the endocardial relief sculpted
 * into the inner surface only, so cut walls show a compact outer myocardium and a trabeculated inner layer:
 *
 *   LV   fine, mostly longitudinal trabecular network over the apical ~two-thirds; the upper septum and the outflow
 *        below the aortic valve stay smooth
 *   RV   coarse trabeculation of the inflow and apex; the infundibulum (outflow) stays smooth
 *   RA   crista terminalis (ridge) and the pectinate comb running from it across the free wall into the auricle; the
 *        sinus venarum and septal surface stay smooth
 *   LA   smooth, pectinate relief confined to the auricle
 *
 * Shape is measured; the relief is placed by measured landmarks (crista path, appendage, valve positions from
 * heart-internals.mapping.json) and is schematic in its exact pattern. Shells keep the mesh ids of lines.glb
 * (ra, la, rv, lv) so the scene swaps them in place; the septum is the LV and RV shells' own septal walls.
 *
 *   npm run asset:heart-hd        (needs heart-internals.mapping.json; source assets/source/VH_M_United.glb)
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ROOT, log, readGLB, writeGLB, subdivide, simplify, orientOutward, mergeGeos, MeshoptSimplifier, type OutPart, V3 } from './common';
import { taubin, makeGrid, rasterUnion, blur, marchingCubes, idx } from './voxel';
import { LM } from '../src/heart/heartGeometry';
await MeshoptSimplifier.ready;

const IM = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/models/heart-internals.mapping.json'), 'utf8'));
const v3 = (a: number[]) => new V3(a[0], a[1], a[2]);
const CRISTA: THREE.Vector3[] = IM.landmarks.crista.map(v3); const RAA = v3(IM.landmarks.raAppendage), LAA = v3(IM.landmarks.laAppendage);
const IVC_O = v3(IM.landmarks.ivcOrifice), SVC_O = v3(IM.landmarks.svcOrifice);

const body = await readGLB('assets/source/VH_M_United.glb', /^VH_M_(skin|heart_left_ventricle|heart_right_ventricle|interventricular_septum|left_cardiac_atrium|right_cardiac_atrium)$/);
const skin = body.get('VH_M_skin')!; skin.computeBoundingBox(); const C = skin.boundingBox!.getCenter(new V3());
const M = new THREE.Matrix4().makeScale(10, 10, 10).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const get = (n: string) => { const g = body.get('VH_M_' + n)!.clone(); g.applyMatrix4(M); return mergeVertices(g, 1e-7); };

/* ------------------------------------------------------------------ deterministic gradient noise */
const perm = new Uint8Array(512); { let s = 99; const p = Array.from({ length: 256 }, (_, i) => i); for (let i = 255; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) perm[i] = p[i & 255]; }
const G = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
function noise(x: number, y: number, z: number) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255; x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z); const g = (h: number, a: number, b: number, c: number) => { const q = G[h % 12]; return q[0] * a + q[1] * b + q[2] * c; };
  const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z, Bq = perm[X + 1] + Y, BA = perm[Bq] + Z, BB = perm[Bq + 1] + Z;
  const L = (t: number, a: number, b: number) => a + t * (b - a);
  return L(w, L(v, L(u, g(perm[AA], x, y, z), g(perm[BA], x - 1, y, z)), L(u, g(perm[AB], x, y - 1, z), g(perm[BB], x - 1, y - 1, z))),
    L(v, L(u, g(perm[AA + 1], x, y, z - 1), g(perm[BA + 1], x - 1, y, z - 1)), L(u, g(perm[AB + 1], x, y - 1, z - 1), g(perm[BB + 1], x - 1, y - 1, z - 1))));
}
/** ridged noise in [0,1]: thin raised ridges where the noise crosses zero (a trabecular network) */
const ridge = (x: number, y: number, z: number, sharp = 3) => Math.pow(1 - Math.min(1, Math.abs(noise(x, y, z)) * 2.2), sharp);
const ss = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ------------------------------------------------------------------ frames */
const LAX = LM.lvApex.clone().sub(LM.mitral).normalize(); const H = LM.lvApex.clone().sub(LM.mitral).dot(LAX);
const hFrac = (p: THREE.Vector3) => p.clone().sub(LM.mitral).dot(LAX) / H;
const E1 = new V3(1, 0, 0).addScaledVector(LAX, -LAX.x).normalize(); const E2 = LAX.clone().cross(E1);
/** coordinates stretched along the long axis (λa) vs around it (λc) → longitudinal trabeculae */
const anis = (p: THREE.Vector3, la: number, lc: number) => { const d = p.clone().sub(LM.mitral); return [d.dot(LAX) / la, d.dot(E1) / lc, d.dot(E2) / lc] as const; };
const rvApex = LM.rv.clone().add(LM.lvApex.clone().sub(LM.lv).multiplyScalar(0.9));
const SEEDS: Record<string, THREE.Vector3[]> = {
  lv: [LM.lv.clone().lerp(LM.lvApex, 0.25), LM.lv.clone().lerp(LM.lvApex, 0.6), LM.lv.clone().lerp(LM.mitral, 0.4)],
  rv: [LM.rv.clone(), LM.rvot.clone(), LM.rv.clone().lerp(rvApex, 0.5), LM.rv.clone().lerp(LM.tricuspid, 0.5)],
  ra: [LM.ra.clone(), LM.ra.clone().lerp(RAA, 0.6), LM.ra.clone().lerp(IVC_O, 0.5), LM.ra.clone().lerp(SVC_O, 0.5)],
  la: [LM.la.clone(), LM.la.clone().lerp(LAA, 0.6)],
};

/* ------------------------------------------------------------------ relief */
function sculpt(id: 'lv' | 'rv' | 'ra' | 'la' | 'septum', g0: THREE.BufferGeometry, subdivs: number, relief: (p: THREE.Vector3, side: string) => number, smoothPasses = 2, sideOf?: Map<THREE.Vector3, string>) {
  let g = g0; for (let i = 0; i < subdivs; i++) { g = subdivide(g); taubin(g, 2); }
  g = mergeVertices(g, 1e-7); g.computeVertexNormals();
  const p = g.attributes.position; const n = p.count; const bvh = new MeshBVH(g); const ray = new THREE.Ray();
  const seedsFor = id === 'septum' ? [...SEEDS.lv.map((s) => ({ s, side: 'lv' })), ...SEEDS.rv.map((s) => ({ s, side: 'rv' }))] : SEEDS[id].map((s) => ({ s, side: sideOf?.get(s) ?? id }));
  const amp = new Float32Array(n); const dir = new Float32Array(n * 3); const v = new V3(); let inner = 0;
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(p, i); let best: { s: THREE.Vector3; side: string } | null = null; let bd = Infinity;
    for (const c of seedsFor) { const d = v.distanceTo(c.s); if (d < bd) { bd = d; best = c; } }
    // an inner (endocardial) vertex is the first surface met from a cavity seed
    let isInner = false; let src = best!;
    for (const c of [...seedsFor].sort((a, b) => a.s.distanceTo(v) - b.s.distanceTo(v)).slice(0, 3)) {
      const d = v.clone().sub(c.s); const L = d.length(); ray.set(c.s, d.divideScalar(L)); const h = bvh.raycastFirst(ray, THREE.DoubleSide);
      if (h && Math.abs(h.distance - L) < 0.0015) { isInner = true; src = c; break; }
    }
    if (!isInner) continue; inner++;
    // displace along the surface normal (oriented into the cavity); pushing toward the seed grazes the wall and folds triangles
    const toward = src.s.clone().sub(v).normalize(); const nv = new V3().fromBufferAttribute(g.attributes.normal, i); if (nv.dot(toward) < 0) nv.negate();
    dir[i * 3] = nv.x; dir[i * 3 + 1] = nv.y; dir[i * 3 + 2] = nv.z;
    amp[i] = relief(v, src.side);
  }
  // smooth the relief over the mesh graph (no single-vertex spikes)
  const ix = g.index!.array; const nb: number[][] = Array.from({ length: n }, () => []);
  for (let t = 0; t < ix.length; t += 3) for (let e = 0; e < 3; e++) { nb[ix[t + e]].push(ix[t + (e + 1) % 3]); }
  let a = amp; for (let k = 0; k < smoothPasses; k++) { const b = new Float32Array(a); for (let i = 0; i < n; i++) { if (!nb[i].length || a[i] === 0 && amp[i] === 0) continue; let s = a[i]; for (const j of nb[i]) s += a[j]; b[i] = s / (nb[i].length + 1); } a = b; }
  for (let i = 0; i < n; i++) if (a[i] > 0) p.setXYZ(i, p.getX(i) + dir[i * 3] * a[i], p.getY(i) + dir[i * 3 + 1] * a[i], p.getZ(i) + dir[i * 3 + 2] * a[i]);
  p.needsUpdate = true; g.computeVertexNormals();
  log(id.padEnd(7), String(g.index!.count / 3).padStart(7), 'tris,', inner, 'endocardial vertices, max relief', (a.reduce((m, x) => Math.max(m, x), 0) * 100).toFixed(1), 'mm');
  return g;
}

/* LV: fine longitudinal network (λ 9 mm along the axis, 3 mm around), apical two-thirds; upper septum + LVOT smooth */
const lvRelief = (p: THREE.Vector3) => {
  const h = hFrac(p); const [a, b, c] = anis(p, 0.09, 0.03); const r = 0.75 * ridge(a, b, c, 3) + 0.35 * ridge(a * 2.1 + 7, b * 2.1, c * 2.1, 4);
  const toAo = p.distanceTo(LM.aorticValve); return 0.02 * r * ss(0.3, 0.6, h) * ss(0.25, 0.4, toAo);
};
/* RV: coarse (λ 12 mm along, 6 mm around), inflow + apex; infundibulum smooth */
const rvRelief = (p: THREE.Vector3) => {
  const h = hFrac(p); const [a, b, c] = anis(p, 0.12, 0.06); const r = 0.8 * ridge(a + 3, b, c, 2.5) + 0.3 * ridge(a * 1.9, b * 1.9 + 5, c * 1.9, 3);
  return 0.032 * r * ss(0.15, 0.4, h) * ss(0.22, 0.4, p.distanceTo(LM.pulmValve));
};
/* septum: each side follows its own ventricle's pattern */
void ((p: THREE.Vector3, side: string) => (side === 'lv' ? lvRelief(p) * 0.7 : rvRelief(p) * 0.8));
/* RA: crista ridge + pectinate comb toward the auricle (free wall in front of the crista) */
const cristaArc = (() => { let s = 0; return CRISTA.map((q, i) => (i ? (s += q.distanceTo(CRISTA[i - 1])) : 0)); })();
const raRelief = (p: THREE.Vector3) => {
  let bi = 0, bd = Infinity; for (let i = 0; i < CRISTA.length; i++) { const d = p.distanceTo(CRISTA[i]); if (d < bd) { bd = d; bi = i; } }
  const cr = 0.03 * Math.exp(-((bd / 0.035) ** 2)); // the crista: ~3 mm high, ~7 mm wide
  const freeWall = p.clone().sub(CRISTA[bi]).dot(RAA.clone().sub(CRISTA[bi]).normalize()) > 0.01; const toAur = p.distanceTo(RAA);
  const comb = Math.pow(0.5 + 0.5 * Math.cos((2 * Math.PI * cristaArc[bi]) / 0.045 + noise(p.x * 8, p.y * 8, p.z * 8) * 1.2), 6);
  const pect = freeWall ? 0.016 * comb * ss(0.03, 0.07, bd) * (1 - ss(0.35, 0.5, toAur)) : 0;
  const aur = 0.012 * ridge(p.x * 25, p.y * 25, p.z * 25, 3) * (1 - ss(0.12, 0.2, toAur)); // auricle: interlacing network
  return Math.max(cr, pect, aur);
};
/* LA: pectinate relief only inside the auricle */
const laRelief = (p: THREE.Vector3) => 0.011 * ridge(p.x * 28 + 2, p.y * 28, p.z * 28, 3) * (1 - ss(0.1, 0.18, p.distanceTo(LAA)));

/* ventricles: HuBMAP's LV and RV shells interpenetrate ~1 mm inside the septum (buried surfaces z-fight on a cut), so the
   two myocardial solids are voxelised together (even-odd parity per shell → myocardium only, not the cavities) at
   0.5 mm and re-surfaced as one solid; the surface is then labelled lv / rv by the nearest source shell. */
function ventricularUnion(lvG: THREE.BufferGeometry, rvG: THREE.BufferGeometry) {
  const box = new THREE.Box3(); [lvG, rvG].forEach((g) => { g.computeBoundingBox(); box.union(g.boundingBox!); });
  const grid = makeGrid(box, 0.005, 3); rasterUnion(grid, [lvG, rvG], 1); blur(grid, 1, 1);
  let geo = marchingCubes(grid, 0.5); taubin(geo, 8); log('ventricular union', geo.index!.count / 3, 'tris (before simplify)');
  geo = simplify(geo, Math.min(1, 260000 / (geo.index!.count / 3)), 0.0005); taubin(geo, 2); orientOutward(geo); geo.computeVertexNormals();
  void idx; return geo;
}
function splitByNearest(g: THREE.BufferGeometry, a: THREE.BufferGeometry, b: THREE.BufferGeometry) {
  const A = new MeshBVH(a), Bv = new MeshBVH(b); const t = { point: new V3(), distance: 0 } as any; const p = g.attributes.position; const ix = g.index!.array; const ia: number[] = [], ib: number[] = []; const c = new V3();
  for (let k = 0; k < ix.length; k += 3) { c.set(0, 0, 0); for (let q = 0; q < 3; q++) c.add(new V3().fromBufferAttribute(p, ix[k + q])); c.divideScalar(3); A.closestPointToPoint(c, t); const da = t.distance; Bv.closestPointToPoint(c, t); (da <= t.distance ? ia : ib).push(ix[k], ix[k + 1], ix[k + 2]); }
  const sub = (list: number[]) => { const remap = new Map<number, number>(); const pos: number[] = []; const out: number[] = []; for (const i of list) { let j = remap.get(i); if (j === undefined) { j = remap.size; remap.set(i, j); pos.push(p.getX(i), p.getY(i), p.getZ(i)); } out.push(j); } const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setIndex(out); r.computeVertexNormals(); return r; };
  return [sub(ia), sub(ib)];
}
const lvSrc = get('heart_left_ventricle'), rvSrc = get('heart_right_ventricle');
SEEDS.ventricles = [...SEEDS.lv, ...SEEDS.rv];
const SIDE = new Map<THREE.Vector3, string>([...SEEDS.lv.map((s) => [s, 'lv'] as const), ...SEEDS.rv.map((s) => [s, 'rv'] as const)]);
const vent = sculpt('ventricles' as never, ventricularUnion(lvSrc, rvSrc), 0, (p, side) => (side === 'lv' ? lvRelief(p) : rvRelief(p)), 2, SIDE);
const [lvG, rvG] = splitByNearest(vent, lvSrc, rvSrc);
const parts: OutPart[] = [
  { id: 'lv', role: 'ventricle', geo: lvG },
  { id: 'rv', role: 'ventricle', geo: rvG },
  // no separate septum: the LV and RV shells already form the whole septum (8–9 mm together); HuBMAP's extra septum
  // slab sits between them and bulges up to 1 mm into the LV cavity, hiding the real LV septal endocardium
  { id: 'ra', role: 'atrium', geo: sculpt('ra', get('right_cardiac_atrium'), 0, raRelief, 1) },
  { id: 'la', role: 'atrium', geo: sculpt('la', get('left_cardiac_atrium'), 0, laRelief, 1) },
];
/* ------------------------------------------------------------------ epicardial vessels at true calibre */
// The named coronary tree (centrelines from the coronary model, pipeline/coronary-map.json) laid onto these epicardial
// surfaces, half-sunk in the groove, at adult calibres (LM ≈ 4.5 mm, proximal LAD ≈ 3.6 mm, RCA ≈ 3.8 mm … tapering).
// Cardiac veins follow their companion arteries as in Gray's: great cardiac vein with the LAD then the LCx, coronary
// sinus in the posterior AV groove to its ostium, middle cardiac vein with the PDA, small cardiac vein with the distal
// RCA, posterior LV vein, and anterior cardiac veins crossing the RV to the right atrium.
const CMv = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/models/coronary-heart.mapping.json'), 'utf8')).vessels as Record<string, { centerline: number[][] }>;
const surf = mergeGeos(parts.map((p) => { const h = p.geo.clone(); for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k); return h; }));
const epiBvh = new MeshBVH(surf); surf.computeBoundingBox(); const HC = surf.boundingBox!.getCenter(new V3());
/** first hit of a ray from outside toward the heart centre (the epicardium), or null if far from p (vessel off the heart) */
const epiHit = (p: THREE.Vector3) => { const d = p.clone().sub(HC).normalize(); const h = epiBvh.raycastFirst(new THREE.Ray(HC.clone().addScaledVector(d, 3), d.clone().negate()), THREE.DoubleSide); return h && h.point.distanceTo(p) < 0.1 ? { p: h.point.clone(), n: d } : null; };
function lay(ctrl: THREE.Vector3[], r: (t: number) => number, sink = 0.45, offset = 0, n = 0) {
  const c = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal'); const N = n || Math.max(12, Math.ceil(c.getLength() / 0.012)); let pts = c.getSpacedPoints(N);
  for (let it = 0; it < 3; it++) pts = pts.map((p, i) => { const q = i === 0 || i === pts.length - 1 ? p : p.clone().add(pts[i - 1]).add(pts[i + 1]).multiplyScalar(1 / 3); const h = epiHit(q); return h ? h.p.addScaledVector(h.n, r(i / N) * (1 - 2 * sink)) : q; });
  if (offset) pts = pts.map((p, i) => { const tng = pts[Math.min(i + 1, N)].clone().sub(pts[Math.max(i - 1, 0)]).normalize(); const nrm = p.clone().sub(HC).normalize(); const q = p.clone().addScaledVector(tng.cross(nrm).normalize(), offset); const h = epiHit(q); return h ? h.p.addScaledVector(h.n, r(i / N) * (1 - 2 * sink)) : q; });
  return varTube(pts, r);
}
/** tube with a radius that varies along it (parallel-transport frames, closed rings, capped ends) */
function varTube(pts: THREE.Vector3[], r: (t: number) => number, seg = 10) {
  const c = new THREE.CatmullRomCurve3(pts, false, 'centripetal'); const N = Math.max(8, Math.ceil(c.getLength() / 0.004)); const F = c.computeFrenetFrames(N, false);
  const pos: number[] = []; const idx: number[] = [];
  for (let i = 0; i <= N; i++) { const t = i / N; const p = c.getPointAt(t); const rr = r(t); for (let j = 0; j < seg; j++) { const a = (j / seg) * Math.PI * 2; const v = F.normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(F.binormals[i], Math.sin(a)); pos.push(p.x + v.x * rr, p.y + v.y * rr, p.z + v.z * rr); } }
  for (let i = 0; i < N; i++) for (let j = 0; j < seg; j++) { const a = i * seg + j, b = i * seg + ((j + 1) % seg), c2 = a + seg, d = b + seg; idx.push(a, c2, b, b, c2, d); }
  for (const [i, flip] of [[0, true], [N, false]] as const) { const p = c.getPointAt(i / N); const ci = pos.length / 3; pos.push(p.x, p.y, p.z); for (let j = 0; j < seg; j++) { const a = i * seg + j, b = i * seg + ((j + 1) % seg); if (flip) idx.push(ci, b, a); else idx.push(ci, a, b); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  // outward winding: the app paints back faces as cut myocardium
  const A = new V3(), B = new V3(), Cc = new V3(); A.fromArray(pos, idx[0] * 3); B.fromArray(pos, idx[1] * 3); Cc.fromArray(pos, idx[2] * 3);
  const fn = B.clone().sub(A).cross(Cc.clone().sub(A)); const out = A.clone().add(B).add(Cc).divideScalar(3).sub(c.getPointAt(0));
  if (fn.dot(out) < 0) { for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]]; g.setIndex(idx); }
  g.computeVertexNormals(); return g;
}
const cl = (id: string, a = 0, b = 1) => { const L = CMv[id].centerline.map(v3); return L.slice(Math.round(a * (L.length - 1)), Math.round(b * (L.length - 1)) + 1); };
const taper = (r0: number, r1: number) => (t: number) => r0 + (r1 - r0) * Math.pow(t, 0.8);
const ART: [string, number, number][] = [['LM', 0.0225, 0.02], ['LAD', 0.018, 0.006], ['LCx', 0.016, 0.007], ['RCA', 0.019, 0.008], ['D1', 0.011, 0.004], ['D2', 0.009, 0.0035], ['OM1', 0.011, 0.0045], ['OM2', 0.009, 0.0035], ['PDA', 0.011, 0.0045], ['PLB', 0.009, 0.0035], ['AM', 0.009, 0.0035]];
const arteries = ART.filter(([id]) => CMv[id]).map(([id, r0, r1]) => (id === 'LM' ? varTube(cl(id), taper(r0, r1)) : lay(cl(id), taper(r0, r1))));
for (const id of ['S1', 'S2', 'S3']) if (CMv[id]) arteries.push(varTube(cl(id), taper(0.007, 0.003))); // septal perforators: intramyocardial, left in place
const CS_O = v3(IM.landmarks.csOstium);
const lcxEnd = cl('LCx').at(-1)!; const csPath = [lcxEnd, lcxEnd.clone().lerp(CS_O, 0.5), CS_O];
const veins = [
  lay([...cl('LAD', 0.12, 0.9).reverse(), ...cl('LCx', 0.08, 1)], (t) => 0.009 + 0.016 * t, 0.4, 0.035),            // great cardiac vein
  lay(csPath, (t) => 0.03 + 0.012 * t, 0.35),                                                                         // coronary sinus
  lay([...cl('PDA', 0, 1).reverse(), CS_O], (t) => 0.007 + 0.013 * t, 0.4, -0.03),                                    // middle cardiac vein
  lay([...cl('RCA', 0.55, 1), CS_O], (t) => 0.006 + 0.006 * t, 0.4, 0.03),                                             // small cardiac vein
  ...(CMv.PLB ? [lay([...cl('PLB').reverse(), lcxEnd.clone().lerp(CS_O, 0.25)], (t) => 0.006 + 0.008 * t, 0.4, 0.03)] : []), // posterior vein of the LV
  ...(CMv.OM1 ? [lay([...cl('OM1').reverse(), cl('LCx', 0.45, 0.45)[0]], (t) => 0.005 + 0.006 * t, 0.4, 0.03)] : []),       // left marginal vein
  ...(CMv.AM ? [0.25, 0.6].map((f) => { const a = cl('AM'); const st = a[Math.round(f * (a.length - 1))]; const rca = cl('RCA', 0.15 + f * 0.2, 0.15 + f * 0.2)[0]; return lay([st.clone().lerp(rca, 0.1), st.clone().lerp(rca, 0.6), rca, rca.clone().add(new V3(-0.02, 0.06, 0.01))], () => 0.005, 0.4, 0.02); }) : []), // anterior cardiac veins → RA
];
// `_ch` per vessel vertex: the chamber whose epicardium it lies on (1 LV, 2 RV, 3 LA, 4 RA, 0 off the heart), so the app
// can carry the vessels with chronic chamber dilation and RV wall thickening instead of burying them
const chB = (['lv', 'rv', 'la', 'ra'] as const).map((id) => new MeshBVH(parts.find((p) => p.id === id)!.geo)); const cq = { point: new V3(), distance: 0 } as any;
const tagCh = (g: THREE.BufferGeometry) => { const P = g.attributes.position; const ch = new Float32Array(P.count); const q = new V3();
  for (let i = 0; i < P.count; i++) { q.fromBufferAttribute(P, i); let best = 0, bd = 0.06; chB.forEach((bv, k) => { bv.closestPointToPoint(q, cq); if (cq.distance < bd) { bd = cq.distance; best = k + 1; } }); ch[i] = best; }
  g.setAttribute('_ch', new THREE.BufferAttribute(ch, 1)); return g; };
parts.push({ id: 'coronary_art', role: 'artery', geo: tagCh(mergeGeos(arteries)) }, { id: 'cardiac_veins', role: 'vein', geo: tagCh(mergeGeos(veins)) });
log('vessels: arteries', (parts.at(-2)!.geo.index!.count / 3) | 0, 'tris, veins', (parts.at(-1)!.geo.index!.count / 3) | 0, 'tris');
await writeGLB('public/models/heart-hd.glb', parts, { ventricle: { color: [0.55, 0.16, 0.13], rough: 0.5 }, atrium: { color: [0.6, 0.2, 0.18], rough: 0.5 }, artery: { color: [0.8, 0.2, 0.16], rough: 0.4 }, vein: { color: [0.25, 0.22, 0.5], rough: 0.4 }, default: { color: [0.55, 0.16, 0.13], rough: 0.5 } });
fs.writeFileSync(path.join(ROOT, 'public/models/heart-hd.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior', parts: parts.map((p) => ({ id: p.id, triangles: p.geo.index!.count / 3 })),
  vessels: 'coronary_art and cardiac_veins: the named coronary tree (LM, LAD, D1–2, septal S1–3, LCx, OM1–2, RCA, AM, PDA, PLB) laid half-sunk on this epicardium at adult calibres, and the cardiac veins along their companion arteries (great, coronary sinus, middle, small, posterior LV, left marginal, anterior cardiac). Courses follow the coronary model; calibres from adult angiographic norms.',
  relief: 'Endocardial surface only. LV: fine longitudinal trabeculation, apical two-thirds (upper septum and LVOT smooth). RV: coarse trabeculation of inflow and apex (infundibulum smooth). RA: crista terminalis + pectinate muscles to the auricle. LA: auricle only. Placement measured, pattern schematic.',
  attribution: { title: '3D Reference Organs: Visible Human Male (heart chambers)', creators: 'HuBMAP / Human Reference Atlas consortium', data: 'Visible Human Male, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Full source resolution (LV/septum subdivided twice, RV once); endocardial relief sculpted on the inner surface.' },
}, null, 1));
log('done');
