/**
 * Organelles, built procedurally at textbook proportions. Each builder returns an Object3D plus
 * label anchors. Local frame of the cell: y up, the slice at y = cut.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { wet, type WetMaterial } from './materials';

export interface Anchor { label: string; pos: THREE.Vector3; key: string }
export interface Part { obj: THREE.Object3D; anchors: Anchor[]; mats: WetMaterial[]; tick?: (t: number) => void }
export type Rng = () => number;
export const rng = (seed: number): Rng => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const clean = (g: THREE.BufferGeometry) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv', 'aS'].includes(k)) n.deleteAttribute(k); if (!n.attributes.uv) n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2)); return n; };
export const merge = (gs: THREE.BufferGeometry[]) => { const m = mergeGeometries(gs.map(clean))!; m.computeVertexNormals(); return m; };

/** Sweep an elliptical cross-section (w sideways, h along `up`) along a path. rs scales the section along the path. */
export function sweep(pts: THREE.Vector3[], o: { w: number; h: number; closed?: boolean; seg?: number; radial?: number; rs?: (t: number) => number; up?: THREE.Vector3; s0?: number }): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(pts, !!o.closed, 'centripetal'); const N = o.seg ?? Math.max(12, Math.round(curve.getLength() / 0.03)); const R = o.radial ?? 10;
  const pos: number[] = [], idx: number[] = []; const up0 = o.up ?? UP; const rings = o.closed ? N : N + 1;
  for (let i = 0; i < rings; i++) {
    const t = i / N; const P = curve.getPointAt(t), T = curve.getTangentAt(t); const up = up0.clone().addScaledVector(T, -up0.dot(T)).normalize(); if (up.lengthSq() < 0.5) up.set(0, 0, 1); const side = T.clone().cross(up).normalize();
    const sc = o.rs ? o.rs(t) : 1;
    for (let a = 0; a < R; a++) { const ang = (a / R) * Math.PI * 2; const v = P.clone().addScaledVector(side, Math.cos(ang) * o.w * sc).addScaledVector(up, Math.sin(ang) * o.h * sc); pos.push(v.x, v.y, v.z); }
  }
  for (let i = 0; i < N; i++) { const i1 = o.closed ? (i + 1) % rings : i + 1; for (let a = 0; a < R; a++) { const b = (a + 1) % R; const p0 = i * R + a, p1 = i * R + b, p2 = i1 * R + a, p3 = i1 * R + b; idx.push(p0, p2, p1, p1, p2, p3); } }
  if (!o.closed) for (const [ring, flip] of [[0, true], [N, false]] as [number, boolean][]) { const c = pos.length / 3; let cx = 0, cy = 0, cz = 0; for (let a = 0; a < R; a++) { cx += pos[(ring * R + a) * 3]; cy += pos[(ring * R + a) * 3 + 1]; cz += pos[(ring * R + a) * 3 + 2]; } pos.push(cx / R, cy / R, cz / R); for (let a = 0; a < R; a++) { const b = (a + 1) % R; if (flip) idx.push(c, ring * R + a, ring * R + b); else idx.push(c, ring * R + b, ring * R + a); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function instanced(geo: THREE.BufferGeometry, mat: THREE.Material, mats: THREE.Matrix4[]) { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, mats.length)); mats.forEach((x, i) => m.setMatrixAt(i, x)); m.count = mats.length; m.instanceMatrix.needsUpdate = true; m.frustumCulled = false; return m; }
const TRS = (p: THREE.Vector3, q: THREE.Quaternion, s: THREE.Vector3 | number) => new THREE.Matrix4().compose(p, q, typeof s === 'number' ? V(s, s, s) : s);
const alignY = (d: THREE.Vector3) => new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize());
const blobGeo = (r: number, amp: number, seed: number, detail = 3) => { const g = new THREE.IcosahedronGeometry(r, detail); const p = g.attributes.position as THREE.BufferAttribute; const R = rng(seed); const k = [R() * 6, R() * 6, R() * 6]; for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)); const n = v.clone().normalize(); const d = 1 + amp * (Math.sin(n.x * 5 + k[0]) * Math.sin(n.y * 6 + k[1]) * Math.sin(n.z * 4 + k[2]) + 0.5 * Math.sin(n.x * 11 + n.z * 9 + k[1])); v.copy(n).multiplyScalar(r * d); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; };

/* ================================================================== nucleus: double envelope with pores, nucleoplasm, nucleolus, chromatin; a wedge cut away */
export function nucleus(c: THREE.Vector3, r: THREE.Vector3, seed: number, opts: { color?: string } = {}): Part & { wedge: THREE.Plane[] } {
  const g = new THREE.Group(); g.position.copy(c); const R = rng(seed); const mats: WetMaterial[] = [];
  const wedge = [new THREE.Plane(V(0, 0, -1), 0), new THREE.Plane(V(0, -1, 0), 0)]; // updated each frame to world space
  const env = wet(opts.color ?? '#756376', { opacity: 0.5, rough: 0.48, clear: 0.24, bump: 0.58, freq: 19, side: THREE.DoubleSide, inner: '#a98fa2', clip: wedge, clipIntersection: true, sss: '#8f7487', sssAmt: 0.12});
  const env2 = wet('#8e7a8c', { opacity: 0.22, rough: 0.55, bump: 0.32, side: THREE.DoubleSide, clip: wedge, clipIntersection: true });
  const plasm = wet('#a8798e', { rough: 0.62, clear: 0.1, bump: 1.05, freq: 9, side: THREE.DoubleSide, inner: '#c6a1b2', clip: wedge, clipIntersection: true, sss: '#b78c9f', sssAmt: 0.08});
  mats.push(env, env2, plasm);
  const sph = (k: number) => { const s = new THREE.SphereGeometry(1, 72, 54); s.scale(r.x * k, r.y * k, r.z * k); return s; };
  const e1 = new THREE.Mesh(sph(1), env); e1.renderOrder = 4; const e2 = new THREE.Mesh(sph(0.965), env2); e2.renderOrder = 3; const pl = new THREE.Mesh(sph(0.94), plasm);
  g.add(pl, e2, e1);
  // nuclear pores: ~ 2000–4000 per nucleus in life; drawn sparser
  const pores: THREE.Matrix4[] = []; for (let i = 0; i < 260; i++) { const d = V(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1).normalize(); const p = V(d.x * r.x, d.y * r.y, d.z * r.z); const n = V(d.x / r.x, d.y / r.y, d.z / r.z).normalize(); pores.push(TRS(p.addScaledVector(n, 0.004), alignY(n), 1)); }
  const poreG = new THREE.TorusGeometry(0.03, 0.011, 6, 14); poreG.rotateX(Math.PI / 2);
  const poreM = wet('#b5a9b7', { rough: 0.62, bump: 0, clip: wedge, clipIntersection: true }); mats.push(poreM); g.add(instanced(poreG, poreM, pores));
  // nucleolus (dense fibrillar + granular components) near the opening
  const nuc = new THREE.Mesh(blobGeo(0.3 * Math.min(r.x, r.y, r.z) / 0.5, 0.12, seed + 1, 4), wet('#55354f', { rough: 0.72, clear: 0.06, bump: 1.25, freq: 32, sss: '#70495f', sssAmt: 0.08}));
  nuc.position.set(r.x * 0.1, r.y * 0.25, r.z * 0.22); g.add(nuc); mats.push(nuc.material as WetMaterial);
  const fc: THREE.Matrix4[] = []; for (let i = 0; i < 7; i++) fc.push(TRS(nuc.position.clone().add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.18 * r.x)), new THREE.Quaternion(), 1)); const fcM = wet('#8a7187', { rough: 0.62, bump: 0 }); mats.push(fcM); g.add(instanced(new THREE.SphereGeometry(0.035, 10, 8), fcM, fc));
  // heterochromatin clumps against the inner envelope, euchromatin threads inside
  const het: THREE.Matrix4[] = []; for (let i = 0; i < 70; i++) { const d = V(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1).normalize(); const k = 0.8 + 0.1 * R(); het.push(TRS(V(d.x * r.x * k, d.y * r.y * k, d.z * r.z * k), new THREE.Quaternion().setFromEuler(new THREE.Euler(R() * 3, R() * 3, R() * 3)), V(1 + R(), 0.6 + 0.4 * R(), 1).multiplyScalar(0.8))); }
  const hetM = wet('#5e4a60', { rough: 0.74, bump: 1.05, freq: 42, clip: wedge, clipIntersection: true }); mats.push(hetM); g.add(instanced(blobGeo(0.05 * r.x / 0.5, 0.25, seed + 2, 1), hetM, het));
  const threads: THREE.BufferGeometry[] = []; for (let i = 0; i < 9; i++) { let p = V((R() - 0.5) * r.x, (R() - 0.2) * r.y, (R() - 0.5) * r.z).multiplyScalar(0.9); const pts = [p.clone()]; for (let k = 0; k < 6; k++) { p = p.clone().add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.22 * r.x)); const q = V(p.x / r.x, p.y / r.y, p.z / r.z); if (q.length() > 0.8) p.multiplyScalar(0.8 / q.length()); pts.push(p.clone()); } threads.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.011, 5, false)); }
  const thM = wet('#756174', { rough: 0.68, bump: 0, clip: wedge, clipIntersection: true }); mats.push(thM); g.add(new THREE.Mesh(merge(threads), thM));
  const anchors: Anchor[] = [
    { key: 'nucleus', label: 'Nucleus', pos: c.clone().add(V(-r.x * 0.55, r.y * 0.85, -r.z * 0.2)) },
    { key: 'nucleolus', label: 'Nucleolus', pos: c.clone().add(nuc.position).add(V(0, 0.12, 0)) },
    { key: 'envelope', label: 'Nuclear envelope & pores', pos: c.clone().add(V(r.x * 0.75, r.y * 0.55, -r.z * 0.35)) },
  ];
  return { obj: g, anchors, mats, wedge, tick: () => { const w = g.matrixWorld; const o = V().setFromMatrixPosition(w); wedge[0].constant = o.z + 0.0; wedge[1].constant = o.y + 0.02; } };
}

/* ================================================================== rough ER: fenestrated sheets curving around the nucleus, studded with ribosomes */
export function roughER(c: THREE.Vector3, rx: number, rz: number, bands: number, y: number, h: number, inside: (p: THREE.Vector3) => boolean, seed: number, opts: { gap?: number; step?: number; start?: number } = {}): Part {
  const R = rng(seed); const sheets: THREE.BufferGeometry[] = []; const ribo: THREE.Matrix4[] = []; const q = new THREE.Quaternion();
  for (let b = 0; b < bands; b++) {
    const k = (opts.start ?? 1.04) + b * (opts.step ?? 0.2); let th = R() * 6; // the first sheet is continuous with the outer nuclear membrane
    const end = th + Math.PI * 2 - 0.3;
    while (th < end) {
      const span = 0.7 + R() * 1.3; const pts: THREE.Vector3[] = []; const ph = R() * 6;
      for (let a = th; a < Math.min(th + span, end); a += 0.06) { const rr = 1 + 0.05 * Math.sin(a * 6 + ph + b); const p = V(c.x + Math.cos(a) * rx * k * rr, y, c.z + Math.sin(a) * rz * k * rr); if (!inside(p)) break; pts.push(p); }
      if (pts.length > 4) {
        sheets.push(sweep(pts, { w: 0.026, h, radial: 8, rs: (t) => 0.75 + 0.25 * Math.sin(t * Math.PI) }));
        for (let i = 0; i < pts.length - 1; i++) for (let s = 0; s < 2; s++) for (const side of [-1, 1]) { if (R() < 0.25) continue; const a = pts[i].clone().lerp(pts[i + 1], R()); const T = pts[i + 1].clone().sub(pts[i]).normalize(); const N = T.clone().cross(UP).normalize(); ribo.push(TRS(a.addScaledVector(N, side * 0.036).add(V(0, (s ? 0.45 : -0.2) * h * (0.6 + 0.8 * R()), 0)), q, 0.8 + 0.4 * R())); }
      }
      th += span + (opts.gap ?? 0.18) + R() * 0.3;
    }
  }
  const m = wet('#655b73', { rough: 0.56, clear: 0.2, bump: 0.72, freq: 22, sss: '#80748c', sssAmt: 0.1}); const rm = wet('#873942', { rough: 0.58, clear: 0.16, bump: 0, sss: '#a44d59', sssAmt: 0.06});
  const grp = new THREE.Group(); if (sheets.length) grp.add(new THREE.Mesh(merge(sheets), m)); grp.add(instanced(new THREE.SphereGeometry(0.017, 8, 6), rm, ribo));
  return { obj: grp, mats: [m, rm], anchors: [{ key: 'rer', label: 'Rough ER + ribosomes', pos: V(c.x + rx * ((opts.start ?? 1.04) + (bands - 1) * (opts.step ?? 0.2)) * 0.72, y + h + 0.05, c.z - rz * ((opts.start ?? 1.04) + (bands - 1) * (opts.step ?? 0.2)) * 0.72) }] };
}

/* ================================================================== smooth ER: branching tubules */
export function smoothER(c: THREE.Vector3, spread: number, y: number, inside: (p: THREE.Vector3) => boolean, seed: number): Part {
  const R = rng(seed); const tubes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    let p = c.clone().add(V((R() - 0.5) * spread, 0, (R() - 0.5) * spread)); p.y = y + (R() - 0.5) * 0.06; let d = V(R() - 0.5, 0, R() - 0.5).normalize(); const pts = [p.clone()];
    for (let k = 0; k < 7; k++) { d.add(V(R() - 0.5, 0, R() - 0.5).multiplyScalar(0.9)).normalize(); const nx = p.clone().addScaledVector(d, 0.14); nx.y = y + 0.03 * Math.sin(k + i); if (!inside(nx)) break; p = nx; pts.push(p.clone()); }
    if (pts.length > 2) tubes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 8, 0.03, 8, false));
  }
  const m = wet('#74697d', { rough: 0.55, clear: 0.18, bump: 0.44, freq: 20, sss: '#8a7d94', sssAmt: 0.09});
  return { obj: new THREE.Mesh(merge(tubes), m), mats: [m], anchors: [{ key: 'ser', label: 'Smooth ER', pos: c.clone().setY(y + 0.12) }] };
}

/* ================================================================== Golgi apparatus: stacked curved cisternae with swollen rims and budding vesicles */
export function golgi(c: THREE.Vector3, toNucleus: number, y: number, seed: number, scale = 1): Part {
  const R = rng(seed); const n = 6; const sheets: THREE.BufferGeometry[] = []; const ves: THREE.Matrix4[] = []; const q = new THREE.Quaternion();
  const u = V(Math.cos(toNucleus), 0, Math.sin(toNucleus));
  // centre of curvature on the trans side (away from the nucleus): the stack is convex toward the nucleus (cis) and concave away (trans)
  const r0 = 0.34 * scale, dr = 0.075 * scale; const pivot = c.clone().addScaledVector(u, -(r0 + dr * (n - 1) / 2));
  for (let k = 0; k < n; k++) {
    const rad = r0 + k * dr; const span = 0.8 + k * 0.07; const pts: THREE.Vector3[] = []; // k = 0 trans (innermost), k = n-1 cis (outermost, faces the nucleus)
    for (let a = -span / 2; a <= span / 2 + 1e-6; a += 0.05) { const ang = toNucleus + a; pts.push(V(pivot.x + Math.cos(ang) * rad, y + 0.01 * Math.sin(a * 5 + k), pivot.z + Math.sin(ang) * rad)); }
    sheets.push(sweep(pts, { w: 0.024 * scale, h: 0.075 * scale, radial: 10, rs: (t) => 1 + 0.9 * Math.exp(-((t / 0.07) ** 2)) + 0.9 * Math.exp(-(((1 - t) / 0.07) ** 2)) }));
    for (const end of [0, 1]) if (R() < 0.8) { const e = end ? pts[pts.length - 1] : pts[0]; const out = e.clone().sub(pivot).normalize(); ves.push(TRS(e.clone().addScaledVector(out, 0.03).add(V((R() - 0.5) * 0.08, 0.02, (R() - 0.5) * 0.08)), q, (0.028 + R() * 0.02) * scale / 0.035)); }
  }
  // transport vesicles arriving from the ER at the cis face; secretory vesicles leaving the concave trans face
  for (let i = 0; i < 4; i++) { const ang = toNucleus + (R() - 0.5) * 0.9; const rad = r0 + dr * n + 0.05 * scale + R() * 0.1 * scale; ves.push(TRS(V(pivot.x + Math.cos(ang) * rad, y + 0.02, pivot.z + Math.sin(ang) * rad), q, (0.025 + R() * 0.012) * scale / 0.035)); }
  for (let i = 0; i < 6; i++) { const ang = toNucleus + (R() - 0.5) * 0.9; const rad = r0 - 0.08 * scale - R() * 0.18 * scale; ves.push(TRS(V(pivot.x + Math.cos(ang) * rad, y + 0.02, pivot.z + Math.sin(ang) * rad), q, (0.045 + R() * 0.03) * scale / 0.035)); }
  const m = wet('#a35b52', { rough: 0.52, clear: 0.2, bump: 0.56, freq: 18, sss: '#b97569', sssAmt: 0.09}); const vm = wet('#bd7e70', { rough: 0.5, clear: 0.18, bump: 0, sss: '#cb9589', sssAmt: 0.08});
  const grp = new THREE.Group(); grp.add(new THREE.Mesh(merge(sheets), m), instanced(new THREE.SphereGeometry(0.035, 12, 10), vm, ves));
  return { obj: grp, mats: [m, vm], anchors: [{ key: 'golgi', label: 'Golgi apparatus', pos: c.clone().setY(y + 0.14) }] };
}

/* ================================================================== mitochondrion, sliced lengthwise: outer membrane, inner membrane folded into cristae */
function halfShell(r: number, len: number) {
  const g = new THREE.CapsuleGeometry(r, Math.max(0.01, len - 2 * r), 10, 24).toNonIndexed(); g.rotateZ(Math.PI / 2);
  const p = g.attributes.position.array as Float32Array; const keep: number[] = [];
  for (let i = 0; i < p.length; i += 9) { if ((p[i + 1] + p[i + 4] + p[i + 7]) / 3 <= 1e-4) for (let k = 0; k < 9; k++) keep.push(p[i + k]); }
  const h = new THREE.BufferGeometry(); h.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3)); h.computeVertexNormals(); return h;
}
let mitoCache: { outer: THREE.BufferGeometry; inner: THREE.BufferGeometry; cristae: THREE.BufferGeometry; rim: THREE.BufferGeometry } | null = null;
function mitoGeos() {
  if (mitoCache) return mitoCache;
  const r = 0.16, len = 0.62; const outer = halfShell(r, len), inner = halfShell(r * 0.84, len * 0.94);
  const cr: THREE.BufferGeometry[] = []; const n = 7;
  for (let i = 0; i < n; i++) { const x = -len * 0.36 + (i * len * 0.72) / (n - 1); const side = i % 2 ? 1 : -1; const depth = r * (1.05 + 0.2 * Math.sin(i * 2.1)); const b = new RoundedBoxGeometry(0.03, r * 0.7, depth, 2, 0.012); b.rotateY(0.18 * side); b.translate(x, -r * 0.35, side * (r * 0.84 - depth / 2)); cr.push(b); }
  const rim = new THREE.TorusGeometry(1, 0.012, 6, 64); rim.rotateX(Math.PI / 2); rim.scale((len / 2), 1, r);
  mitoCache = { outer, inner, cristae: merge(cr), rim }; return mitoCache;
}
export function mitochondria(list: { p: THREE.Vector3; yaw: number; s: number }[]): Part {
  const G = mitoGeos(); const mats = list.map((m) => TRS(m.p, new THREE.Quaternion().setFromAxisAngle(UP, m.yaw), m.s));
  const om = wet('#725b80', { rough: 0.43, clear: 0.34, bump: 0.62, freq: 22, side: THREE.DoubleSide, inner: '#9d85a7', sss: '#8a718e', sssAmt: 0.13});
  const im = wet('#b66c42', { rough: 0.46, clear: 0.28, bump: 0.64, freq: 26, side: THREE.DoubleSide, inner: '#d79669', sss: '#c27d57', sssAmt: 0.11});
  const cm = wet('#984f35', { rough: 0.5, clear: 0.22, bump: 0.82, freq: 30, sss: '#b5664b', sssAmt: 0.09});
  const grp = new THREE.Group(); grp.add(instanced(G.outer, om, mats), instanced(G.inner, im, mats), instanced(G.cristae, cm, mats), instanced(G.rim, om, mats));
  const a = list[0]; return { obj: grp, mats: [om, im, cm], anchors: a ? [{ key: 'mito', label: 'Mitochondrion (cristae)', pos: a.p.clone().add(V(0, 0.2 * a.s, 0)) }] : [] };
}
/** Closed mitochondria for crowded cells (heart, dendrites): cristae read as transverse bands. */
export function mitoRods(list: { p: THREE.Vector3; dir: THREE.Vector3; len: number; r: number }[]): Part {
  const g = new THREE.CapsuleGeometry(1, 1, 6, 12); // unit; per-instance scale
  const mats = list.map((m) => TRS(m.p, alignY(m.dir), V(m.r, m.len / 2 + m.r * 0.2, m.r)));
  const mat = wet('#e39a3e', { rough: 0.3, clear: 0.8, bump: 0.4, freq: 30, stripes: { axis: 'y', kind: 'cristae' }, sss: '#ffb04a', sssAmt: 0.3 });
  return { obj: instanced(g, mat, mats), mats: [mat], anchors: [] };
}

/* ================================================================== small organelles */
export function lysosomes(list: { p: THREE.Vector3; r: number }[]): Part {
  const m = wet('#a58a4e', { rough: 0.58, clear: 0.16, bump: 1.05, freq: 27, sss: '#b9a06b', sssAmt: 0.08});
  const mats = list.map((l) => TRS(l.p, new THREE.Quaternion(), l.r));
  return { obj: instanced(blobGeo(1, 0.05, 7, 3), m, mats), mats: [m], anchors: list[0] ? [{ key: 'lyso', label: 'Lysosome', pos: list[0].p.clone().add(V(0, list[0].r + 0.08, 0)) }] : [] };
}
export function peroxisomes(list: { p: THREE.Vector3; r: number }[]): Part {
  const m = wet('#70866a', { opacity: 0.66, rough: 0.56, clear: 0.14, bump: 0.42, sss: '#899c82', sssAmt: 0.07}); const core = wet('#596a51', { rough: 0.66, bump: 0 });
  const grp = new THREE.Group(); grp.add(instanced(new THREE.BoxGeometry(0.9, 0.9, 0.9), core, list.map((l) => TRS(l.p, new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, 0.7, 0.2)), l.r * 0.45))), instanced(new THREE.SphereGeometry(1, 20, 16), m, list.map((l) => TRS(l.p, new THREE.Quaternion(), l.r))));
  return { obj: grp, mats: [m, core], anchors: list[0] ? [{ key: 'perox', label: 'Peroxisome', pos: list[0].p.clone().add(V(0, list[0].r + 0.08, 0)) }] : [] };
}
/** Pair of centrioles at right angles, each nine triplets of microtubules; pericentriolar material around. */
export function centrioles(c: THREE.Vector3, s = 1): Part {
  const mats: THREE.Matrix4[] = []; const L = 0.34 * s;
  const one = (axis: THREE.Vector3, at: THREE.Vector3) => { const q = alignY(axis); for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; for (let k = 0; k < 3; k++) { const rr = (0.062 + k * 0.021) * s; const off = V(Math.cos(a + k * 0.22) * rr, 0, Math.sin(a + k * 0.22) * rr).applyQuaternion(q); mats.push(TRS(at.clone().add(off), q, V(1, L, 1))); } } };
  one(UP, c.clone()); one(V(1, 0, 0.2), c.clone().add(V(0.02, 0.24 * s, 0.22 * s)));
  const m = wet('#a38a57', { rough: 0.58, clear: 0.14, bump: 0, sss: '#b7a171', sssAmt: 0.07});
  const cloud = new THREE.Mesh(new THREE.SphereGeometry(0.34 * s, 24, 18), wet('#b8a98a', { opacity: 0.12, rough: 0.72, clear: 0, bump: 0 })); cloud.position.copy(c).add(V(0, 0.1 * s, 0.1 * s));
  const grp = new THREE.Group(); grp.add(instanced(new THREE.CylinderGeometry(0.0105 * s, 0.0105 * s, 1, 6, 1), m, mats), cloud);
  return { obj: grp, mats: [m], anchors: [{ key: 'centriole', label: 'Centrioles', pos: c.clone().add(V(0, 0.4 * s, 0)) }] };
}
export function dots(list: THREE.Vector3[], r: number, color: string, o: { opacity?: number; label?: [string, string]; sizes?: number[]; bump?: number } = {}): Part {
  const m = wet(color, { rough: 0.54, clear: 0.18, bump: o.bump ?? 0, opacity: o.opacity, sss: color, sssAmt: 0.07 });
  const mesh = instanced(new THREE.SphereGeometry(r, 10, 8), m, list.map((p, i) => TRS(p, new THREE.Quaternion(), o.sizes?.[i] ?? 1)));
  return { obj: mesh, mats: [m], anchors: o.label && list[0] ? [{ key: o.label[0], label: o.label[1], pos: list[0].clone().add(V(0, r * 3 + 0.05, 0)) }] : [] };
}
/** Microtubules radiating from the centrosome (thin, translucent). */
export function microtubules(from: THREE.Vector3, n: number, len: number, y: number, inside: (p: THREE.Vector3) => boolean, seed: number): Part {
  const R = rng(seed); const pos: number[] = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + R() * 0.3; let p = from.clone(); p.y = y; let d = V(Math.cos(a), 0, Math.sin(a)); for (let k = 0; k < 14; k++) { d.add(V((R() - 0.5) * 0.25, 0, (R() - 0.5) * 0.25)).normalize(); const nx = p.clone().addScaledVector(d, len / 14); nx.y = y + 0.02 * Math.sin(k * 0.7 + i); if (!inside(nx)) break; pos.push(p.x, p.y, p.z, nx.x, nx.y, nx.z); p = nx; } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return { obj: new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#b8c9ce', transparent: true, opacity: 0.24, depthWrite: false })), mats: [], anchors: [{ key: 'mt', label: 'Microtubules (cytoskeleton)', pos: from.clone().add(V(len * 0.6, 0, len * 0.2)).setY(y + 0.06) }] };
}
export { V, UP, TRS, alignY, instanced, blobGeo };
