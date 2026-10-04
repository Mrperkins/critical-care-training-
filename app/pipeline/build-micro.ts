/**
 * Microanatomy asset: an alveolar sac with its capillary basket, a systemic muscle capillary
 * bed, and a red blood cell — built from histological dimensions (1 unit = 100 µm).
 *
 *  - Alveoli: ~200 µm spheres (radius 0.85–1.0) packed around an alveolar duct, blended with a
 *    smooth-union signed distance field and iso-surfaced (marching cubes + Taubin).
 *  - Capillaries: 7 µm lumen (radius 0.035) running over each alveolus from a pulmonary
 *    arteriole to a venule; every capillary is also an RBC path for the app.
 *  - Muscle bed: 50 µm fibres (radius 0.25) with capillaries in the grooves between them.
 *  - RBC: Evans–Fung biconcave profile, 7.8 µm diameter (0.078).
 * Output: public/models/micro.glb + micro.mapping.json (paths, centres, mitochondria).
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, log, V3, writeGLB, type OutPart, simplify, MeshoptSimplifier } from './common';
await MeshoptSimplifier.ready;
import { makeGrid, marchingCubes, taubin } from '../src/scene/iso';
import { mergeVertices, mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type V = THREE.Vector3;
let seed = 11; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const smin = (a: number, b: number, k: number) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };

/* ================================================================== alveolar sac */
const alv: { c: V; r: number }[] = [];
const ring = (y: number, n: number, rad: number, off: number, r: number) => { for (let i = 0; i < n; i++) { const a = off + (i * 2 * Math.PI) / n; alv.push({ c: new V3(Math.cos(a) * rad, y + (rnd() - 0.5) * 0.15, Math.sin(a) * rad), r: r * (0.93 + 0.14 * rnd()) }); } };
ring(1.55, 4, 1.02, 0.35, 0.74); ring(0.25, 5, 1.22, 0, 0.9); ring(-1.2, 5, 1.2, Math.PI / 5, 0.9); alv.push({ c: new V3(0.1, -2.35, -0.05), r: 0.86 });
const DUCT_TOP = new V3(0, 3.9, 0), DUCT_BOT = new V3(0, -2.0, 0);
function ductSDF(p: V) { const ab = DUCT_BOT.clone().sub(DUCT_TOP); const t = THREE.MathUtils.clamp(p.clone().sub(DUCT_TOP).dot(ab) / ab.lengthSq(), 0, 1); const q = DUCT_TOP.clone().addScaledVector(ab, t); const rad = THREE.MathUtils.lerp(0.26, 0.46, Math.min(1, t * 1.6)); return p.distanceTo(q) - rad; }
function sacSDF(p: V) { let d = ductSDF(p); for (const a of alv) d = smin(d, p.distanceTo(a.c) - a.r, 0.22); return d; }
function nearestAlv(p: V) { let best = -1, bd = ductSDF(p) + 0.05; alv.forEach((a, i) => { const d = p.distanceTo(a.c) - a.r; if (d < bd) { bd = d; best = i; } }); return best; }
const grad = (f: (p: V) => number, p: V, e = 0.01) => new V3(f(new V3(p.x + e, p.y, p.z)) - f(new V3(p.x - e, p.y, p.z)), f(new V3(p.x, p.y + e, p.z)) - f(new V3(p.x, p.y - e, p.z)), f(new V3(p.x, p.y, p.z + e)) - f(new V3(p.x, p.y, p.z - e))).normalize();
/** Push a point onto the iso-surface offset `off` (outside). */
function toSurface(p: V, off: number) { const q = p.clone(); for (let i = 0; i < 24; i++) { const d = sacSDF(q) - off; if (Math.abs(d) < 1e-4) break; q.addScaledVector(grad(sacSDF, q), -d * 0.9); } return q; }

function buildSac() {
  const box = new THREE.Box3(new V3(-2.6, -3.4, -2.6), new V3(2.6, 4.0, 2.6));
  const g = makeGrid(box, 0.034, 2);
  const p = new V3();
  for (let k = 0; k < g.nz; k++) for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) { p.set(g.origin.x + i * g.h, g.origin.y + j * g.h, g.origin.z + k * g.h); g.f[i + g.nx * (j + g.ny * k)] = -sacSDF(p); }
  let geo = marchingCubes(g, 0); taubin(geo, 3);
  geo = simplify(geo, 0.35, 0.0008); geo = mergeVertices(geo, 1e-5); geo.computeVertexNormals();
  const a = geo.attributes.position; const A = new Float32Array(a.count);
  for (let i = 0; i < a.count; i++) A[i] = nearestAlv(new V3().fromBufferAttribute(a, i));
  geo.setAttribute('_alv', new THREE.BufferAttribute(A, 1));
  return geo;
}

/* ================================================================== vessels */
function vesselLine(theta: number, off: number) {
  const pts: V[] = [];
  for (let y = 4.3; y >= -3.05; y -= 0.12) {
    const dir = new V3(Math.cos(theta), 0, Math.sin(theta));
    let lo = 0, hi = 3.5; for (let b = 0; b < 30; b++) { const m = (lo + hi) / 2; if (sacSDF(new V3(dir.x * m, y, dir.z * m)) < off) lo = m; else hi = m; }
    pts.push(new V3(dir.x * lo, y, dir.z * lo));
  }
  const curve = new THREE.CatmullRomCurve3(pts); return curve.getSpacedPoints(160);
}
const TA = -0.62, TV = TA + Math.PI * 0.92;
const arteriole = vesselLine(TA, 0.16), venule = vesselLine(TV, 0.16);
const nearestOn = (line: V[], p: V) => { let bi = 0, bd = Infinity; line.forEach((q, i) => { const d = q.distanceToSquared(p); if (d < bd) { bd = d; bi = i; } }); return bi; };

interface Path { alv: number; pts: V[]; aIdx: number; vIdx: number; m0: number; m1: number }
const paths: Path[] = []; const capLines: { pts: V[]; alv: number; s0: number; s1: number; kind: number }[] = [];
alv.forEach((A, i) => {
  const ai = nearestOn(arteriole, A.c), vi = nearestOn(venule, A.c);
  const e1 = arteriole[ai].clone().sub(A.c).normalize(), e3 = venule[vi].clone().sub(A.c).normalize();
  let axis = e3.clone().sub(e1); if (axis.lengthSq() < 1e-4) axis = new V3(0, 1, 0); axis.normalize();
  let mid = e1.clone().add(e3); if (mid.lengthSq() < 1e-3) mid = new V3(0, 1, 0).cross(axis); mid.normalize();
  const NM = 5;
  for (let k = 0; k < NM; k++) {
    const phi = -1.25 + (2.5 * k) / (NM - 1);
    const m = mid.clone().applyAxisAngle(axis, phi);
    const arc: V[] = [];
    for (let t = 0; t <= 1.0001; t += 1 / 40) { const d = e1.clone().multiplyScalar((1 - t) ** 2).addScaledVector(m, 2 * t * (1 - t) * 1.7).addScaledVector(e3, t * t).normalize(); arc.push(toSurface(A.c.clone().addScaledVector(d, A.r), 0.04)); }
    const conA = new THREE.QuadraticBezierCurve3(arteriole[ai], toSurface(arteriole[ai].clone().lerp(arc[0], 0.5), 0.1), arc[0]).getPoints(8);
    const conV = new THREE.QuadraticBezierCurve3(arc[arc.length - 1], toSurface(arc[arc.length - 1].clone().lerp(venule[vi], 0.5), 0.1), venule[vi]).getPoints(8);
    const pts = [...conA, ...arc.slice(1), ...conV.slice(1)];
    const n = pts.length; paths.push({ alv: i, pts, aIdx: ai, vIdx: vi, m0: conA.length / n, m1: (conA.length + arc.length - 1) / n });
    capLines.push({ pts, alv: i, s0: conA.length / n, s1: (conA.length + arc.length - 1) / n, kind: 1 });
  }
  // two cross-linking rings around each alveolus (the capillary mesh look); no RBC traffic
  for (const lat of [-0.35, 0.35]) {
    const ringPts: V[] = []; const u = new V3(0, 1, 0).cross(axis).normalize(); const w = axis.clone().cross(u).normalize();
    for (let t = 0; t <= Math.PI * 2 + 1e-3; t += Math.PI / 30) { const d = axis.clone().multiplyScalar(lat).addScaledVector(u, Math.cos(t) * Math.sqrt(1 - lat * lat)).addScaledVector(w, Math.sin(t) * Math.sqrt(1 - lat * lat)).normalize(); const q = toSurface(A.c.clone().addScaledVector(d, A.r), 0.04); if (nearestAlv(q) === i || q.distanceTo(A.c) < A.r + 0.25) ringPts.push(q); }
    // split where the ring dives into a neighbour
    let seg: V[] = []; for (let k = 0; k < ringPts.length; k++) { if (seg.length && ringPts[k].distanceTo(seg[seg.length - 1]) > 0.25) { if (seg.length > 4) capLines.push({ pts: seg, alv: i, s0: 0.5, s1: 0.5, kind: 2 }); seg = []; } seg.push(ringPts[k]); }
    if (seg.length > 4) capLines.push({ pts: seg, alv: i, s0: 0.5, s1: 0.5, kind: 2 });
  }
});

function tubeFrom(pts: V[], r: number | ((t: number) => number), radial = 8, attrs: Record<string, (t: number) => number> = {}) {
  const curve = new THREE.CatmullRomCurve3(pts); const seg = Math.max(6, Math.round(curve.getLength() / 0.03));
  const g = new THREE.TubeGeometry(curve, seg, typeof r === 'number' ? r : 1, radial, false);
  if (typeof r !== 'number') { // variable radius: rescale rings
    const pos = g.attributes.position; const fr = curve.computeFrenetFrames(seg, false);
    for (let s = 0; s <= seg; s++) { const c = curve.getPointAt(s / seg); const rr = r(s / seg); for (let k = 0; k <= radial; k++) { const i = s * (radial + 1) + k; const v = new V3().fromBufferAttribute(pos, i).sub(c).multiplyScalar(rr).add(c); pos.setXYZ(i, v.x, v.y, v.z); } }
    void fr; g.computeVertexNormals();
  }
  const n = g.attributes.position.count;
  for (const [name, f] of Object.entries(attrs)) { const A = new Float32Array(n); for (let s = 0; s <= seg; s++) for (let k = 0; k <= radial; k++) A[s * (radial + 1) + k] = f(s / seg); g.setAttribute(name, new THREE.BufferAttribute(A, 1)); }
  g.deleteAttribute('uv');
  return g;
}

/* ================================================================== muscle bed (offset +x) */
const TISSUE = new V3(9, 0, 0);
const fibres: { c: V; r: number }[] = [];
for (let k = 0; k < 7; k++) { const a = (k / 6) * Math.PI * 2; const rad = k === 6 ? 0 : 0.52; fibres.push({ c: new V3(0, Math.sin(a) * rad, Math.cos(a) * rad).add(TISSUE), r: 0.25 * (0.94 + 0.12 * rnd()) }); }
const FL = 3.6;
function fibreGeo() {
  const gs = fibres.map((f) => { const g = new THREE.CapsuleGeometry(f.r, FL, 10, 28); g.rotateZ(Math.PI / 2); g.translate(f.c.x, f.c.y, f.c.z); return g; });
  const g = mergeVertices(mergeGeometries(gs.map((x) => { x.deleteAttribute('uv'); return x; }))); g.computeVertexNormals(); return g;
}
const tissuePaths: V[][] = [];
for (let k = 0; k < 6; k++) { // capillaries in the grooves between neighbouring outer fibres and the core
  const a = ((k + 0.5) / 6) * Math.PI * 2; const rad = 0.52 * Math.cos(Math.PI / 6) + 0.1;
  const pts: V[] = []; for (let x = -FL / 2 - 0.9; x <= FL / 2 + 0.9001; x += 0.1) { const wob = 0.04 * Math.sin(x * 3 + k); pts.push(new V3(x, Math.sin(a) * (rad + wob), Math.cos(a) * (rad + wob)).add(TISSUE)); }
  // gather to a shared arteriole (left) and venule (right)
  pts[0] = new V3(-FL / 2 - 1.3, 0.95, 0.2).add(TISSUE); pts[pts.length - 1] = new V3(FL / 2 + 1.3, -0.95, -0.2).add(TISSUE);
  tissuePaths.push(new THREE.CatmullRomCurve3(pts).getSpacedPoints(120));
}
const mitos: number[] = []; fibres.forEach((f) => { for (let n = 0; n < 60; n++) { const x = (rnd() - 0.5) * FL; const a = rnd() * Math.PI * 2; const r = f.r * (0.55 + 0.4 * rnd()); mitos.push(+(f.c.x + x).toFixed(3), +(f.c.y + Math.sin(a) * r).toFixed(3), +(f.c.z + Math.cos(a) * r).toFixed(3), +(rnd() * Math.PI).toFixed(2)); } });

/* ================================================================== RBC */
function rbcGeo() {
  const D = 0.078, C0 = 0.0518, C1 = 2.0026, C2 = -4.491; const pts: THREE.Vector2[] = [];
  const N = 24; for (let i = 0; i <= N; i++) { const r = (D / 2) * Math.sin((i / N) * Math.PI / 2); const x = (2 * r) / D; const z = (D / 2) * Math.sqrt(Math.max(0, 1 - x * x)) * (C0 + C1 * x * x + C2 * x ** 4); pts.push(new THREE.Vector2(r, z)); }
  for (let i = N - 1; i >= 0; i--) pts.push(new THREE.Vector2(pts[i].x, -pts[i].y));
  const g = new THREE.LatheGeometry(pts, 36); g.deleteAttribute('uv'); return mergeVertices(g, 1e-7);
}

/* ================================================================== write */
log('alveoli', alv.length, 'paths', paths.length);
const sac = buildSac(); log('sac', sac.attributes.position.count, 'verts');
const capGeos = capLines.map((c) => tubeFrom(c.pts, 0.035, 7, { _alv: () => c.alv, _s: (t) => (c.kind === 2 ? 0.5 : THREE.MathUtils.clamp((t - c.s0) / Math.max(1e-3, c.s1 - c.s0), 0, 1)), _kind: () => c.kind }));
const caps = mergeVertices(mergeGeometries(capGeos), 1e-6); caps.computeVertexNormals();
const art = tubeFrom(arteriole, (t) => 0.095 * (1 - 0.35 * t), 12, { _s: () => 0, _alv: () => -1, _kind: () => 0 });
const ven = tubeFrom(venule, (t) => 0.11 * (1 - 0.3 * t), 12, { _s: () => 1, _alv: () => -1, _kind: () => 3 });
const tCaps = tissuePaths.map((p) => tubeFrom(p, 0.035, 7, { _s: (t) => THREE.MathUtils.clamp((t - 0.12) / 0.76, 0, 1) }));
const tissueCaps = mergeVertices(mergeGeometries(tCaps), 1e-6); tissueCaps.computeVertexNormals();
const tArt = tubeFrom([new V3(-FL / 2 - 3, 1.6, 0.6), new V3(-FL / 2 - 1.3, 0.95, 0.2)].map((v) => v.add(TISSUE)), 0.09, 12, { _s: () => 0 });
const tVen = tubeFrom([new V3(FL / 2 + 1.3, -0.95, -0.2), new V3(FL / 2 + 3, -1.6, -0.6)].map((v) => v.add(TISSUE)), 0.1, 12, { _s: () => 1 });
const parts: OutPart[] = [
  { id: 'alveolar_sac', role: 'alveolus', geo: sac },
  { id: 'pulm_capillaries', role: 'capillary', geo: caps },
  { id: 'pulm_arteriole', role: 'capillary', geo: art },
  { id: 'pulm_venule', role: 'capillary', geo: ven },
  { id: 'muscle_fibres', role: 'muscle', geo: fibreGeo() },
  { id: 'tissue_capillaries', role: 'capillary', geo: tissueCaps },
  { id: 'tissue_arteriole', role: 'capillary', geo: tArt },
  { id: 'tissue_venule', role: 'capillary', geo: tVen },
  { id: 'rbc', role: 'rbc', geo: rbcGeo() },
];
await writeGLB('public/models/micro.glb', parts, { alveolus: { color: [0.8, 0.5, 0.5], rough: 0.5 }, capillary: { color: [0.6, 0.1, 0.1], rough: 0.4 }, muscle: { color: [0.6, 0.2, 0.2], rough: 0.5 }, rbc: { color: [0.7, 0.1, 0.1], rough: 0.4 }, default: { color: [0.8, 0.8, 0.8], rough: 0.5 } });
const r3 = (v: V) => [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];
const mapping = {
  units: '1 unit = 100 µm', generatedAt: new Date().toISOString(),
  alveoli: alv.map((a) => ({ c: r3(a.c), r: +a.r.toFixed(3) })), duct: { top: r3(DUCT_TOP), bottom: r3(DUCT_BOT) },
  arteriole: arteriole.filter((_, i) => i % 2 === 0).map(r3), venule: venule.filter((_, i) => i % 2 === 0).map(r3),
  paths: paths.map((p) => ({ alv: p.alv, a: Math.floor(p.aIdx / 2), v: Math.floor(p.vIdx / 2), m0: +p.m0.toFixed(3), m1: +p.m1.toFixed(3), pts: p.pts.filter((_, i) => i % 2 === 0 || i === p.pts.length - 1).map(r3) })),
  tissue: { centre: r3(TISSUE), fibres: fibres.map((f) => ({ c: r3(f.c), r: +f.r.toFixed(3) })), length: FL, paths: tissuePaths.map((p) => p.filter((_, i) => i % 2 === 0).map(r3)), mito: mitos },
  attribution: { title: 'Alveolar sac, capillary network, muscle capillary bed and erythrocyte', creators: 'Built for this app from published histological dimensions', data: 'Alveolar diameter ~200 µm, capillary lumen ~7 µm, erythrocyte shape: Evans & Fung (1972)', license: 'Original work' },
};
fs.writeFileSync(path.join(ROOT, 'public/models/micro.mapping.json'), JSON.stringify(mapping));
log('mapping', (fs.statSync(path.join(ROOT, 'public/models/micro.mapping.json')).size / 1e3).toFixed(0), 'kB');
