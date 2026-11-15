/**
 * Heart asset pipeline.
 *
 *   source GLB ──► inspect & rename (assets/asset-map.json)
 *              ──► normalise frame / scale, simplify, weld, smooth normals
 *              ──► extract coronary centerlines, author missing branches along the model's grooves
 *              ──► bake per-vertex attributes (region weights, epicardial fat, AO, arc position)
 *              ──► generate territory mask meshes
 *              ──► PBR materials, meshopt compression ──► public/models/heart/heart.glb (+ mapping JSON)
 *
 * Run: npm run asset
 */
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { computeBoundsTree, acceleratedRaycast, MeshBVH } from 'three-mesh-bvh';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { reorder, quantize } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { TERRITORIES } from '../src/infarct/data/territories';
import { VESSEL } from '../src/infarct/data/vessels';
import type { LeadId, RegionId, VesselId } from '../src/infarct/data/types';
import { averageView } from '../src/infarct/data/leads';

(THREE.BufferGeometry.prototype as any).computeBoundsTree = computeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const MAP = JSON.parse(fs.readFileSync(path.join(ROOT, 'pipeline/coronary-map.json'), 'utf8'));
const OUT_DIR = path.join(ROOT, 'public/models');
const V3 = THREE.Vector3;
const log = (...a: unknown[]) => console.log('[asset]', ...a);

export const REGIONS: RegionId[] = ['septum', 'anterior', 'apex', 'lateral', 'highLateral', 'inferior', 'posterior', 'rvFreeWall'];

interface Part { id: string; role: string; vessel?: VesselId; geo: THREE.BufferGeometry; authored?: boolean }

/* ---------------------------------------------------------------- 1. read + rename */
async function readSource(): Promise<Part[]> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(path.join(ROOT, MAP.source));
  const parts: Part[] = [];
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh(); if (!mesh) continue;
    const name = node.getName();
    const rule = (MAP.rules as any[]).find((r) => new RegExp(r.match).test(name));
    if (!rule || rule.role === 'drop') continue;
    const id = name.replace(new RegExp(rule.match), rule.id);
    const m = new THREE.Matrix4().fromArray(node.getWorldMatrix());
    const prims = mesh.listPrimitives();
    const geos = prims.map((p) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(p.getAttribute('POSITION')!.getArray()!), 3));
      const idx = p.getIndices(); if (idx) g.setIndex(Array.from(idx.getArray()!));
      g.applyMatrix4(m);
      return g;
    });
    const geo = geos[0];
    let g2 = simplify(geo, rule.simplify ?? 1);
    g2.deleteAttribute('normal');
    g2 = mergeVertices(g2, 1e-6);
    g2.computeVertexNormals();
    parts.push({ id, role: rule.role, vessel: rule.vessel, geo: g2 });
    log('source', name.padEnd(60), '→', id, g2.attributes.position.count, 'verts');
  }
  return parts;
}

function simplify(g: THREE.BufferGeometry, ratio: number) {
  if (ratio >= 1 || !g.index) return g;
  const pos = g.attributes.position.array as Float32Array;
  const idx = new Uint32Array(g.index.array);
  const target = Math.floor((idx.length * ratio) / 3) * 3;
  const [out] = MeshoptSimplifier.simplify(idx, pos, 3, target, 0.002, []);
  // compact
  const remap = new Map<number, number>(); const np: number[] = []; const ni: number[] = [];
  for (const i of out) { let j = remap.get(i); if (j === undefined) { j = remap.size; remap.set(i, j); np.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); } ni.push(j); }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(np, 3)); r.setIndex(ni); return r;
}

/* ---------------------------------------------------------------- 2. frame */
function normalise(parts: Part[]) {
  const box = new THREE.Box3();
  parts.filter((p) => p.role === 'myocardium' || p.role === 'atrium').forEach((p) => { p.geo.computeBoundingBox(); box.union(p.geo.boundingBox!); });
  const c = box.getCenter(new V3());
  const s = MAP.scale as number;
  const m = new THREE.Matrix4().makeScale(s, s, s).multiply(new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z));
  parts.forEach((p) => { p.geo.applyMatrix4(m); p.geo.computeBoundingBox(); p.geo.computeBoundingSphere(); });
  log('centre (source units)', c.toArray().map((x) => x.toFixed(4)).join(', '), 'scale', s);
  HEART_CENTRE.copy(c);
}

/** heart-bbox centre in source units (set by normalise); the output is moved into the shared body frame at the end */
const HEART_CENTRE = new THREE.Vector3();
const get = (parts: Part[], id: string) => { const p = parts.find((q) => q.id === id); if (!p) throw new Error('missing part ' + id); return p; };
const centroid = (g: THREE.BufferGeometry) => { const a = g.attributes.position; const c = new V3(); for (let i = 0; i < a.count; i++) c.add(new V3().fromBufferAttribute(a, i)); return c.divideScalar(a.count); };

interface Frame { base: THREE.Vector3; apex: THREE.Vector3; axis: THREE.Vector3; len: number; e1: THREE.Vector3; e2: THREE.Vector3 }
function lvFrame(parts: Part[]): Frame {
  const base = centroid(get(parts, 'landmark_mitral').geo).lerp(centroid(get(parts, 'landmark_aortic').geo), 0.35);
  const lv = get(parts, 'myocardium_LV').geo.attributes.position; let apex = new V3(); let dmax = 0;
  for (let i = 0; i < lv.count; i++) { const p = new V3().fromBufferAttribute(lv, i); const d = p.distanceTo(base); if (d > dmax) { dmax = d; apex = p; } }
  const axis = apex.clone().sub(base).normalize();
  const perp = (v: THREE.Vector3) => v.clone().sub(axis.clone().multiplyScalar(v.dot(axis))).normalize();
  const e1 = perp(new V3(0, 0, 1)); // anterior
  const rvDir = perp(centroid(get(parts, 'myocardium_RV').geo).sub(base));
  let e2 = rvDir.clone().negate(); e2.sub(e1.clone().multiplyScalar(e2.dot(e1))).normalize(); // lateral (away from RV)
  log('LV axis len', dmax.toFixed(3), 'axis', axis.toArray().map((x) => x.toFixed(2)).join(','));
  return { base, apex, axis, len: dmax, e1, e2 };
}
function cyl(f: Frame, p: THREE.Vector3) {
  const d = p.clone().sub(f.base); const h = d.dot(f.axis) / f.len; const r = d.sub(f.axis.clone().multiplyScalar(d.dot(f.axis)));
  const th = (Math.atan2(r.dot(f.e2), r.dot(f.e1)) * 180) / Math.PI; // 0 anterior, +90 lateral, ±180 inferior
  return { h, th, rho: r.length() };
}
function fromCyl(f: Frame, h: number, thDeg: number, rho: number) {
  const t = (thDeg * Math.PI) / 180; const dir = f.e1.clone().multiplyScalar(Math.cos(t)).add(f.e2.clone().multiplyScalar(Math.sin(t)));
  return f.base.clone().add(f.axis.clone().multiplyScalar(h * f.len)).add(dir.multiplyScalar(rho));
}

/* ---------------------------------------------------------------- 3. regions */
const angDiff = (a: number, b: number) => { let d = ((a - b + 540) % 360) - 180; return Math.abs(d); };
const win = (d: number, half: number) => (d >= half ? 0 : 0.5 + 0.5 * Math.cos((Math.PI * d) / half));
const ss = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function regionWeights(parts: Part[], f: Frame) {
  // Each LV wall is defined by the leads that look at it: the epicardial surface whose
  // outward normal faces a lead group's viewing direction belongs to that wall.
  const C = (ids: LeadId[]) => new V3(...averageView(ids));
  const dirs = { anterior: C(['V3', 'V4']), lateral: C(['I', 'aVL', 'V5', 'V6']), highLateral: C(['I', 'aVL']), inferior: C(['II', 'III', 'aVF']), posterior: C(['V7', 'V8', 'V9']) };
  log('region directions', Object.entries(dirs).map(([k, v]) => `${k}:${v.toArray().map((x) => x.toFixed(2)).join(',')}`).join(' '));
  const septum = get(parts, 'myocardium_septum').geo;
  const sepBVH = new MeshBVH(septum);
  for (const p of parts.filter((q) => q.role === 'myocardium')) {
    const a = p.geo.attributes.position, nrm = p.geo.attributes.normal; const W = new Float32Array(a.count * 8);
    for (let i = 0; i < a.count; i++) {
      const v = new V3().fromBufferAttribute(a, i); const n = new V3().fromBufferAttribute(nrm, i).normalize(); const c = cyl(f, v);
      const w: Record<RegionId, number> = { septum: 0, anterior: 0, apex: 0, lateral: 0, highLateral: 0, inferior: 0, posterior: 0, rvFreeWall: 0 };
      // outward radial direction from the LV long axis (epicardium faces outward; endocardium and basal caps do not)
      const d = v.clone().sub(f.base); const radial = d.sub(f.axis.clone().multiplyScalar(d.dot(f.axis))).normalize();
      const facing = ss(0.05, 0.4, n.dot(radial));
      if (p.id === 'myocardium_septum') w.septum = 1;
      else if (p.id === 'myocardium_RV') {
        const hit = sepBVH.closestPointToPoint(v); const dd = hit ? hit.distance : 1;
        w.rvFreeWall = ss(0.03, 0.12, dd) * ss(-0.2, 0.2, n.dot(radial));
      } else {
        const h = c.h; const face = (dir: THREE.Vector3, lo = 0.3, hi = 0.78) => ss(lo, hi, n.dot(dir)) * facing;
        w.anterior = face(dirs.anterior) * (1 - 0.3 * ss(0.85, 1, h));
        w.lateral = face(dirs.lateral, 0.35, 0.8) * ss(0.08, 0.25, h);
        w.highLateral = face(dirs.highLateral, 0.3, 0.75) * (1 - ss(0.4, 0.58, h));
        w.inferior = face(dirs.inferior, 0.35, 0.8);
        w.posterior = face(dirs.posterior, 0.35, 0.8) * (1 - ss(0.55, 0.78, h));
        w.apex = ss(0.74, 0.92, h) * ss(-0.1, 0.3, n.dot(f.axis));
      }
      REGIONS.forEach((r, k) => { W[i * 8 + k] = Math.min(1, w[r]); });
    }
    p.geo.setAttribute('_reg', new THREE.BufferAttribute(W, 8));
  }
}

/* ---------------------------------------------------------------- 4. centerlines */
function extractCenterline(g: THREE.BufferGeometry, cell: number): THREE.Vector3[] {
  const a = g.attributes.position; const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  const cells = new Map<string, { s: THREE.Vector3; n: number; ijk: [number, number, number]; id: number }>();
  for (let i = 0; i < a.count; i++) {
    const v = new V3().fromBufferAttribute(a, i); const ijk: [number, number, number] = [Math.floor(v.x / cell), Math.floor(v.y / cell), Math.floor(v.z / cell)];
    const k = key(...ijk); let c = cells.get(k); if (!c) { c = { s: new V3(), n: 0, ijk, id: cells.size }; cells.set(k, c); } c.s.add(v); c.n++;
  }
  const nodes = [...cells.values()]; const P = nodes.map((c) => c.s.clone().divideScalar(c.n));
  const adj: number[][] = nodes.map(() => []);
  nodes.forEach((c) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) { if (!dx && !dy && !dz) continue; const o = cells.get(key(c.ijk[0] + dx, c.ijk[1] + dy, c.ijk[2] + dz)); if (o) adj[c.id].push(o.id); } });
  const dijkstra = (src: number) => { const d = new Float64Array(P.length).fill(Infinity); const prev = new Int32Array(P.length).fill(-1); d[src] = 0; const done = new Uint8Array(P.length);
    for (let it = 0; it < P.length; it++) { let u = -1, best = Infinity; for (let j = 0; j < P.length; j++) if (!done[j] && d[j] < best) { best = d[j]; u = j; } if (u < 0) break; done[u] = 1; for (const w of adj[u]) { const nd = d[u] + P[u].distanceTo(P[w]); if (nd < d[w]) { d[w] = nd; prev[w] = u; } } }
    return { d, prev }; };
  const far = (d: Float64Array) => { let m = -1, id = 0; d.forEach((x, i) => { if (isFinite(x) && x > m) { m = x; id = i; } }); return id; };
  const u = far(dijkstra(0).d); const r = dijkstra(u); const v = far(r.d);
  const path: THREE.Vector3[] = []; for (let x = v; x >= 0; x = r.prev[x]) path.push(P[x]);
  return resample(smoothPath(path, 2), 48);
}
function smoothPath(p: THREE.Vector3[], k: number) { return p.map((_, i) => { const s = new V3(); let n = 0; for (let j = Math.max(0, i - k); j <= Math.min(p.length - 1, i + k); j++) { s.add(p[j]); n++; } return i === 0 || i === p.length - 1 ? p[i].clone() : s.divideScalar(n); }); }
function resample(p: THREE.Vector3[], n: number) { const c = new THREE.CatmullRomCurve3(p, false, 'centripetal'); return c.getSpacedPoints(n - 1); }
function nearestParam(line: THREE.Vector3[], q: THREE.Vector3) { let best = Infinity, s = 0; const n = line.length - 1; for (let i = 0; i < n; i++) { const a = line[i], b = line[i + 1]; const ab = b.clone().sub(a); const t = Math.min(1, Math.max(0, q.clone().sub(a).dot(ab) / ab.lengthSq())); const d = a.clone().add(ab.multiplyScalar(t)).distanceTo(q); if (d < best) { best = d; s = (i + t) / n; } } return { s, d: best }; }
const at = (line: THREE.Vector3[], s: number) => { const n = line.length - 1; const f = Math.min(n - 1e-6, Math.max(0, s * n)); const i = Math.floor(f); return line[i].clone().lerp(line[i + 1], f - i); };
function meanRadius(g: THREE.BufferGeometry, line: THREE.Vector3[]) { const a = g.attributes.position; let s = 0; const step = Math.max(1, Math.floor(a.count / 400)); let n = 0; for (let i = 0; i < a.count; i += step) { s += nearestParam(line, new V3().fromBufferAttribute(a, i)).d; n++; } return s / n; }

/* ---------------------------------------------------------------- 5. surface projection & authored vessels */
function surfaceProjector(meshes: THREE.Mesh[], f: Frame) {
  const rc = new THREE.Raycaster(); (rc as any).firstHitOnly = false;
  /** Outermost surface point along a ray from the LV axis at (h, θ). */
  return (h: number, th: number) => {
    const o = fromCyl(f, h, th, 0); const dir = fromCyl(f, h, th, 1).sub(o).normalize();
    rc.set(o.clone().add(dir.clone().multiplyScalar(2.5)), dir.clone().negate()); rc.far = 5;
    const hits = rc.intersectObjects(meshes, false);
    return hits.length ? { p: hits[0].point.clone(), n: dir, rho: hits[0].point.clone().sub(o).length() } : null;
  };
}
function tube(points: THREE.Vector3[], r0: number, r1: number, radial = 12) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const segs = Math.max(24, Math.round(curve.getLength() / 0.012));
  const g = new THREE.TubeGeometry(curve, segs, 1, radial, false);
  const pa = g.attributes.position; const c = new V3();
  for (let i = 0; i <= segs; i++) { curve.getPointAt(i / segs, c); const r = THREE.MathUtils.lerp(r0, r1, i / segs) * (i === segs ? 0.4 : 1); for (let j = 0; j <= radial; j++) { const k = i * (radial + 1) + j; const v = new V3().fromBufferAttribute(pa, k).sub(c).multiplyScalar(r).add(c); pa.setXYZ(k, v.x, v.y, v.z); } }
  g.deleteAttribute('uv'); const m = mergeVertices(g, 1e-7); m.computeVertexNormals(); return m;
}

/* ---------------------------------------------------------------- 6. bake helpers */
function bakeS(g: THREE.BufferGeometry, line: THREE.Vector3[]) { const a = g.attributes.position; const S = new Float32Array(a.count); for (let i = 0; i < a.count; i++) S[i] = nearestParam(line, new V3().fromBufferAttribute(a, i)).s; g.setAttribute('_s', new THREE.BufferAttribute(S, 1)); }

function bakeAO(parts: Part[], rays = 20, maxD = 0.22) {
  const all = parts.filter((p) => p.role !== 'landmark' && p.role !== 'guide');
  const merged = new THREE.BufferGeometry(); const pos: number[] = []; const idx: number[] = []; let off = 0;
  for (const p of all) { const a = p.geo.attributes.position; for (let i = 0; i < a.count; i++) pos.push(a.getX(i), a.getY(i), a.getZ(i)); const ix = p.geo.index!.array; for (let i = 0; i < ix.length; i++) idx.push(ix[i] + off); off += a.count; }
  merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); merged.setIndex(idx);
  const bvh = new MeshBVH(merged); const mesh = new THREE.Mesh(merged); (merged as any).boundsTree = bvh;
  const rc = new THREE.Raycaster(); (rc as any).firstHitOnly = true; rc.far = maxD;
  const dirs: THREE.Vector3[] = []; for (let k = 0; k < rays; k++) { const y = 1 - (k + 0.5) / rays; const r = Math.sqrt(1 - y * y); const t = k * 2.399963; dirs.push(new V3(Math.cos(t) * r, y, Math.sin(t) * r)); }
  let done = 0;
  for (const p of all) {
    const a = p.geo.attributes.position, n = p.geo.attributes.normal; const AO = new Float32Array(a.count);
    for (let i = 0; i < a.count; i++) {
      const v = new V3().fromBufferAttribute(a, i), nn = new V3().fromBufferAttribute(n, i).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), nn); let occ = 0, wsum = 0;
      for (const d of dirs) { const dd = d.clone().applyQuaternion(q); const w = d.y; rc.set(v.clone().add(nn.clone().multiplyScalar(0.004)), dd); const h = rc.intersectObject(mesh, false)[0]; if (h) occ += w * (1 - h.distance / maxD); wsum += w; }
      AO[i] = 1 - Math.min(1, (occ / wsum) * 1.6);
    }
    p.geo.setAttribute('_ao', new THREE.BufferAttribute(AO, 1)); done += a.count;
  }
  log('AO baked for', done, 'vertices');
}

function bakeFat(parts: Part[], lines: THREE.Vector3[][], f: Frame) {
  const pts: THREE.Vector3[] = []; lines.forEach((l) => l.forEach((p) => pts.push(p)));
  for (const p of parts.filter((q) => q.role === 'myocardium' || q.role === 'atrium')) {
    const a = p.geo.attributes.position; const F = new Float32Array(a.count);
    for (let i = 0; i < a.count; i++) {
      const v = new V3().fromBufferAttribute(a, i); let d = Infinity; for (const q of pts) d = Math.min(d, q.distanceTo(v));
      const c = cyl(f, v);
      const avGroove = p.role === 'myocardium' ? 0.55 * (1 - ss(0.05, 0.22, c.h)) : 0.35 * (1 - ss(-0.05, 0.12, Math.abs(c.h))); // fat collar at the AV groove
      F[i] = Math.min(1, Math.max(1 - ss(0.012, 0.06, d), avGroove));
    }
    p.geo.setAttribute('_fat', new THREE.BufferAttribute(F, 1));
  }
}

/** Every mesh carries region weights + chamber id (for beating/hypokinesis) taken from the nearest myocardium vertex. */
function inheritRegions(parts: Part[]) {
  const myo = parts.filter((p) => p.role === 'myocardium');
  const bv = myo.map((p) => ({ p, bvh: new MeshBVH(p.geo) }));
  for (const p of parts) {
    const a = p.geo.attributes.position; const CH = new Float32Array(a.count);
    const chamber = p.role === 'myocardium' || p.role === 'coronary' ? 1 : p.role === 'atrium' ? 2 : p.role === 'cardiacVein' ? 1 : 0;
    CH.fill(chamber); p.geo.setAttribute('_ch', new THREE.BufferAttribute(CH, 1));
    if (p.role === 'myocardium') continue;
    const W = new Float32Array(a.count * 8);
    if (p.role === 'coronary' || p.role === 'cardiacVein') {
      for (let i = 0; i < a.count; i++) {
        const v = new V3().fromBufferAttribute(a, i); let best: any = null;
        for (const { p: m, bvh } of bv) { const h = bvh.closestPointToPoint(v); if (h && (!best || h.distance < best.h.distance)) best = { h, m }; }
        if (best && best.h.distance < 0.08) { const tri = best.h.faceIndex; const vi = best.m.geo.index!.array[tri * 3]; const R = best.m.geo.attributes._reg.array as Float32Array; for (let k = 0; k < 8; k++) W[i * 8 + k] = R[vi * 8 + k]; }
      }
    }
    p.geo.setAttribute('_reg', new THREE.BufferAttribute(W, 8));
  }
}

/* ---------------------------------------------------------------- 7. territory masks */
function territoryMasks(parts: Part[]): Part[] {
  const myo = parts.filter((p) => p.role === 'myocardium');
  const out: Part[] = [];
  for (const t of TERRITORIES) {
    const pos: number[] = [], nor: number[] = [], wts: number[] = [], reg: number[] = [], ch: number[] = [], idx: number[] = [];
    for (const p of myo) {
      const a = p.geo.attributes.position, n = p.geo.attributes.normal, R = p.geo.attributes._reg.array as Float32Array, ix = p.geo.index!.array;
      const w = new Float32Array(a.count);
      for (let i = 0; i < a.count; i++) { let m = 0; REGIONS.forEach((r, k) => { m = Math.max(m, (t.heartHighlightRegion[r] ?? 0) * R[i * 8 + k]); }); w[i] = m; }
      const map = new Map<number, number>();
      const add = (i: number) => { let j = map.get(i); if (j === undefined) { j = pos.length / 3; map.set(i, j); const off = 0.0045; pos.push(a.getX(i) + n.getX(i) * off, a.getY(i) + n.getY(i) * off, a.getZ(i) + n.getZ(i) * off); nor.push(n.getX(i), n.getY(i), n.getZ(i)); wts.push(w[i]); for (let k = 0; k < 8; k++) reg.push(R[i * 8 + k]); ch.push(1); } return j; };
      for (let f = 0; f < ix.length; f += 3) { const [i0, i1, i2] = [ix[f], ix[f + 1], ix[f + 2]]; if (Math.max(w[i0], w[i1], w[i2]) > 0.04) idx.push(add(i0), add(i1), add(i2)); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('_w', new THREE.Float32BufferAttribute(wts, 1)); g.setAttribute('_reg', new THREE.Float32BufferAttribute(reg, 8)); g.setAttribute('_ch', new THREE.Float32BufferAttribute(ch, 1)); g.setIndex(idx);
    out.push({ id: `territory_${t.id}`, role: 'territory', geo: g }); log('mask', t.id, idx.length / 3, 'tris');
  }
  return out;
}

/** Canonical mesh names: LAD branches are prefixed (coronary_LAD_D2, coronary_LAD_S1 …). */
const meshName = (id: VesselId) => (['D1', 'D2', 'S1', 'S2', 'S3'].includes(id) ? `coronary_LAD_${id}` : `coronary_${id}`);

/* ---------------------------------------------------------------- main */
async function main() {
  await MeshoptEncoder.ready; await MeshoptSimplifier.ready;
  const parts = await readSource();
  normalise(parts);
  const f = lvFrame(parts);
  regionWeights(parts, f);

  // centerlines of source coronaries
  const lines: Partial<Record<VesselId, THREE.Vector3[]>> = {}; const radii: Partial<Record<VesselId, number>> = {};
  function orientL(l: THREE.Vector3[]) { return l; }
  const aortaRoot = (() => { const g = get(parts, 'vessel_aorta_ascending').geo; const a = g.attributes.position; let lo = new V3(0, 1e9, 0); for (let i = 0; i < a.count; i++) { const v = new V3().fromBufferAttribute(a, i); if (v.y < lo.y) lo = v; } return centroid(g).lerp(lo, 0.8); })();
  const orient = (l: THREE.Vector3[], ref: THREE.Vector3) => (l[0].distanceTo(ref) <= l[l.length - 1].distanceTo(ref) ? l : l.slice().reverse());
  for (const p of parts.filter((q) => q.role === 'coronary')) {
    const l = extractCenterline(p.geo, 0.011); lines[p.vessel!] = l; radii[p.vessel!] = meanRadius(p.geo, l);
  }
  const guideLCx = orientL(extractCenterline(get(parts, 'guide_LCx').geo, 0.011));
  radii.LCx = meanRadius(get(parts, 'guide_LCx').geo, guideLCx);
  lines.LM = orient(lines.LM!, aortaRoot);
  lines.RCA = orient(lines.RCA!, aortaRoot);
  lines.LAD = orient(lines.LAD!, lines.LM!.at(-1)!);
  lines.D1 = orient(lines.D1!, closestOnLine(lines.LAD!, lines.D1!));
  lines.AM = orient(lines.AM!, closestOnLine(lines.RCA!, lines.AM!));
  lines.PDA = orient(lines.PDA!, lines.RCA!.at(-1)!);
  // OM1 proximal end = the end nearer the base (AV groove)
  { const l = lines.OM1!; lines.OM1 = cyl(f, l[0]).h <= cyl(f, l[l.length - 1]).h ? l : l.slice().reverse(); }
  log('radii', Object.entries(radii).map(([k, v]) => `${k}:${v!.toFixed(4)}`).join(' '));

  // authored vessels, traced along the model's own surface
  const surf = [get(parts, 'myocardium_LV'), get(parts, 'myocardium_RV'), get(parts, 'atrium_LA'), get(parts, 'myocardium_septum')].map((p) => { (p.geo as any).computeBoundsTree(); return new THREE.Mesh(p.geo); });
  const lvOnly = [new THREE.Mesh(get(parts, 'myocardium_LV').geo)];
  const proj = surfaceProjector(surf, f); const projLV = surfaceProjector(lvOnly, f);
  const rLAD = radii.LAD!;
  const R = (id: VesselId) => (rLAD * VESSEL[id].caliber) / VESSEL.LAD.caliber;
  const lift = (hit: { p: THREE.Vector3; n: THREE.Vector3 }, r: number) => hit.p.clone().add(hit.n.clone().multiplyScalar(r * 0.55));

  // LCx: from the LM bifurcation, through the left AV groove (the radial minimum near the base), past OM1's origin, to the crux.
  const lmEnd = lines.LM!.at(-1)!; const c0 = cyl(f, lmEnd); const om1 = cyl(f, lines.OM1![0]); const crux = cyl(f, lines.PDA![0]);
  let thEnd = crux.th; if (thEnd < c0.th) thEnd += 360;
  const g0 = guideLCx[0].distanceTo(lmEnd) < guideLCx.at(-1)!.distanceTo(lmEnd) ? guideLCx : guideLCx.slice().reverse();
  const lcx: THREE.Vector3[] = [lmEnd.clone(), ...g0.slice(2)];
  let thStart = cyl(f, g0.at(-1)!).th; if (thStart < c0.th - 180) thStart += 360;
  for (let th = thStart + 6; th <= thEnd - 4; th += 5) {
    let best: any = null;
    for (let h = -0.06; h <= 0.3; h += 0.012) { const hit = proj(h, th); if (hit && (!best || hit.rho < best.rho)) best = { ...hit, h }; }
    if (best) lcx.push(lift(best, R('LCx')));
  }
  lcx.push(lines.PDA![0].clone());
  lines.LCx = resample(smoothPath(lcx, 2), 64);

  const along = (from: THREE.Vector3, h1: number, th1: number, r: number, n = 14, projector = projLV) => {
    const a = cyl(f, from); const pts = [from.clone()]; while (th1 - a.th > 180) th1 -= 360; while (th1 - a.th < -180) th1 += 360;
    for (let i = 1; i <= n; i++) { const t = i / n; const hit = projector(THREE.MathUtils.lerp(a.h, h1, t), THREE.MathUtils.lerp(a.th, th1, t)); if (hit) pts.push(lift(hit, r)); }
    return resample(smoothPath(pts, 1), 40);
  };
  const pOM2 = at(lines.LCx!, 0.55); lines.OM2 = along(pOM2, 0.78, cyl(f, pOM2).th + 18, R('OM2'));
  const pPL = at(lines.RCA!, 0.985); const cPL = cyl(f, pPL); lines.PLB = along(pPL, 0.45, cPL.th - 45, R('PLB'));
  const pD2 = at(lines.LAD!, VESSEL.D2.originAt!); lines.D2 = along(pD2, 0.62, cyl(f, pD2).th + 62, R('D2'));

  // septal perforators: from the LAD into the septum's mid-plane
  const sep = get(parts, 'myocardium_septum').geo; const sepC = centroid(sep);
  const sepN = (() => { const a = sep.attributes.position; const m = [0, 0, 0, 0, 0, 0, 0, 0, 0]; for (let i = 0; i < a.count; i++) { const d = new V3().fromBufferAttribute(a, i).sub(sepC); const v = [d.x, d.y, d.z]; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) m[r * 3 + c] += v[r] * v[c]; } return smallestEigen(m); })();
  const sepBVH = new MeshBVH(sep);
  (['S1', 'S2', 'S3'] as VesselId[]).forEach((sid) => {
    const p0 = at(lines.LAD!, VESSEL[sid].originAt!); const q0 = p0.clone().sub(sepN.clone().multiplyScalar(p0.clone().sub(sepC).dot(sepN)));
    let dir = f.e1.clone().negate().add(f.axis.clone().multiplyScalar(0.35)); dir.sub(sepN.clone().multiplyScalar(dir.dot(sepN))).normalize();
    const pts = [p0.clone()]; const L = sid === 'S1' ? 0.3 : sid === 'S2' ? 0.26 : 0.2;
    for (let i = 1; i <= 10; i++) { const q = q0.clone().add(dir.clone().multiplyScalar((L * i) / 10)); const h = sepBVH.closestPointToPoint(q); pts.push(h && h.distance > 0.02 ? q.lerp(h.point, 0.5) : q); }
    lines[sid] = resample(smoothPath(pts, 1), 24);
  });

  const authored: Part[] = (MAP.authoredVessels as VesselId[]).map((id) => {
    const l = lines[id]!; const g = tube(l, R(id), R(id) * (id.startsWith('S') ? 0.5 : 0.62));
    log('authored', id, 'length', new THREE.CatmullRomCurve3(l).getLength().toFixed(3));
    return { id: meshName(id), role: 'coronary', vessel: id, geo: g, authored: true };
  });
  parts.push(...authored);

  // measured branch origins along parents (right-dominant parents; PDA/PLB also measured on LCx)
  const origins: Record<string, number> = {};
  const parentMap: Record<string, VesselId> = { LAD: 'LM', LCx: 'LM', D1: 'LAD', D2: 'LAD', S1: 'LAD', S2: 'LAD', S3: 'LAD', OM1: 'LCx', OM2: 'LCx', AM: 'RCA', PDA: 'RCA', PLB: 'RCA' };
  for (const [b, par] of Object.entries(parentMap)) origins[b] = +nearestParam(lines[par]!, lines[b as VesselId]![0]).s.toFixed(3);
  const originsLeft = { PDA: +nearestParam(lines.LCx!, lines.PDA![0]).s.toFixed(3), PLB: +nearestParam(lines.LCx!, lines.PLB![0]).s.toFixed(3) };
  log('origins', JSON.stringify(origins), 'left-dominant', JSON.stringify(originsLeft));

  // bakes
  for (const p of parts.filter((q) => q.role === 'coronary')) bakeS(p.geo, lines[p.vessel!]!);
  const veinLines = parts.filter((p) => p.role === 'cardiacVein').map((p) => extractCenterline(p.geo, 0.014));
  bakeFat(parts, [...(Object.values(lines) as THREE.Vector3[][]), ...veinLines], f);
  inheritRegions(parts);
  const masks = territoryMasks(parts);
  bakeAO(parts);
  masks.forEach((m) => m.geo.setAttribute('_ao', new THREE.BufferAttribute(new Float32Array(m.geo.attributes.position.count).fill(1), 1)));
  const finalParts = [...parts.filter((p) => p.role !== 'landmark' && p.role !== 'guide'), ...masks];

  /* Shared body frame. Every step above runs heart-centred (exactly as the standalone Infarct Atlas did); the finished
     geometry and every coordinate in the mapping are then translated into the Visible Human Male body frame used by
     body.glb, lines.glb, skeleton.glb … (decimetres, centred on the VHM skin). The standalone VH_M_Heart sits exactly
     where the united body places it (checked: chamber centroids agree to 0.1 mm), so this is a pure translation. */
  const united = new NodeIO().registerExtensions(ALL_EXTENSIONS); const udoc = await united.read(path.join(ROOT, 'assets/source/VH_M_United.glb'));
  const skinNode = udoc.getRoot().listNodes().find((n) => n.getName() === 'VH_M_skin')!; const sb = new THREE.Box3(); const sm = new THREE.Matrix4().fromArray(skinNode.getWorldMatrix());
  const sp = skinNode.getMesh()!.listPrimitives()[0].getAttribute('POSITION')!; const tv = new V3(); for (let i = 0; i < sp.getCount(); i++) sb.expandByPoint(tv.fromArray(sp.getElement(i, [])).applyMatrix4(sm));
  const OFFSET = HEART_CENTRE.clone().sub(sb.getCenter(new V3())).multiplyScalar(MAP.scale as number);
  log('body-frame offset (dm)', OFFSET.toArray().map((x) => x.toFixed(4)).join(', '));
  for (const p of finalParts) { p.geo.translate(OFFSET.x, OFFSET.y, OFFSET.z); p.geo.computeBoundingBox(); p.geo.computeBoundingSphere(); }
  f.base = f.base.clone().add(OFFSET); f.apex = f.apex.clone().add(OFFSET); // fresh vectors: a point shared by two centrelines must move once
  for (const k of Object.keys(lines) as VesselId[]) lines[k] = lines[k]!.map((q) => q.clone().add(OFFSET));

  await writeGLB(finalParts);
  const r3 = (v: THREE.Vector3) => v.toArray().map((x) => +x.toFixed(4));
  const mapping = {
    generatedAt: new Date().toISOString(),
    attribution: MAP.attribution,
    units: 'decimetres, body-centred (the shared Visible Human Male body frame of body.glb / lines.glb)',
    bodyOffset: OFFSET.toArray().map((x) => +x.toFixed(5)),
    frame: '+X patient left, +Y superior, +Z anterior',
    lvAxis: { base: r3(f.base), apex: r3(f.apex), length: +f.len.toFixed(4) },
    regions: REGIONS,
    vessels: Object.fromEntries(Object.entries(lines).map(([id, l]) => [id, { mesh: parts.find((p) => p.vessel === id)?.id ?? meshName(id as VesselId), authored: (MAP.authoredVessels as string[]).includes(id), radius: +(radii[id as VesselId] ?? R(id as VesselId)).toFixed(4), centerline: l!.map(r3) }])),
    origins, originsLeft,
    territories: Object.fromEntries(TERRITORIES.map((t) => [t.id, { mesh: `territory_${t.id}` }])),
    meshes: finalParts.map((p) => ({ id: p.id, role: p.role, vessel: p.vessel ?? null, vertices: p.geo.attributes.position.count })),
  };
  fs.writeFileSync(path.join(OUT_DIR, 'coronary-heart.mapping.json'), JSON.stringify(mapping));
  log('wrote', path.relative(ROOT, OUT_DIR));
}

function closestOnLine(line: THREE.Vector3[], branch: THREE.Vector3[]) { const a = nearestParam(line, branch[0]), b = nearestParam(line, branch[branch.length - 1]); return a.d <= b.d ? branch[0] : branch[branch.length - 1]; }
function nearestIdx(l: THREE.Vector3[], p: THREE.Vector3) { let b = 0, d = Infinity; l.forEach((q, i) => { const e = q.distanceTo(p); if (e < d) { d = e; b = i; } }); return b; }
function smallestEigen(m: number[]) { // power iteration on (tr·I − M) gives the smallest eigenvector of a 3×3 SPD matrix
  const tr = m[0] + m[4] + m[8]; const A = m.map((x, i) => (i % 4 === 0 ? tr - x : -x)); let v = new V3(1, 0.3, 0.2);
  for (let i = 0; i < 60; i++) { v = new V3(A[0] * v.x + A[1] * v.y + A[2] * v.z, A[3] * v.x + A[4] * v.y + A[5] * v.z, A[6] * v.x + A[7] * v.y + A[8] * v.z).normalize(); } return v; }

const MATERIALS: Record<string, { color: [number, number, number]; rough: number }> = {
  myocardium: { color: [0.46, 0.12, 0.1], rough: 0.45 }, atrium: { color: [0.42, 0.14, 0.14], rough: 0.5 }, greatArtery: { color: [0.78, 0.55, 0.5], rough: 0.5 },
  greatVein: { color: [0.36, 0.2, 0.3], rough: 0.5 }, coronary: { color: [0.62, 0.08, 0.08], rough: 0.35 }, cardiacVein: { color: [0.24, 0.12, 0.22], rough: 0.4 }, territory: { color: [0.5, 0.2, 0.5], rough: 0.6 },
};

async function writeGLB(parts: Part[]) {
  const doc = new Document(); const buf = doc.createBuffer(); const scene = doc.createScene('heart'); const root = doc.createNode('heart_root'); scene.addChild(root);
  const mats: Record<string, any> = {};
  for (const [k, m] of Object.entries(MATERIALS)) mats[k] = doc.createMaterial(k).setBaseColorFactor([...m.color, 1]).setRoughnessFactor(m.rough).setMetallicFactor(0);
  for (const p of parts) {
    const g = p.geo; const prim = doc.createPrimitive();
    const acc = (arr: ArrayLike<number>, type: any) => doc.createAccessor().setBuffer(buf).setType(type).setArray(arr instanceof Float32Array ? arr : new Float32Array(arr));
    prim.setAttribute('POSITION', acc(g.attributes.position.array, 'VEC3'));
    if (!g.attributes.normal) g.computeVertexNormals();
    prim.setAttribute('NORMAL', acc(g.attributes.normal.array, 'VEC3'));
    const R = g.attributes._reg?.array as Float32Array | undefined;
    if (R) { const n = R.length / 8; const A = new Float32Array(n * 4), B = new Float32Array(n * 4); for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) { A[i * 4 + k] = R[i * 8 + k]; B[i * 4 + k] = R[i * 8 + 4 + k]; } prim.setAttribute('_REGA', acc(A, 'VEC4')); prim.setAttribute('_REGB', acc(B, 'VEC4')); }
    for (const [src, dst] of [['_ao', '_AO'], ['_fat', '_FAT'], ['_s', '_S'], ['_ch', '_CH'], ['_w', '_W']]) if (g.attributes[src]) prim.setAttribute(dst, acc(g.attributes[src].array, 'SCALAR'));
    prim.setIndices(doc.createAccessor().setBuffer(buf).setType('SCALAR').setArray(new Uint32Array(g.index!.array)));
    prim.setMaterial(mats[p.role === 'coronary' ? 'coronary' : p.role]);
    const mesh = doc.createMesh(p.id).addPrimitive(prim); const node = doc.createNode(p.id).setMesh(mesh).setExtras({ role: p.role, vessel: p.vessel ?? null, authored: !!p.authored }); root.addChild(node);
  }
  await doc.transform(reorder({ encoder: MeshoptEncoder }), quantize({ pattern: /^(POSITION|NORMAL)$/, quantizePosition: 14, quantizeNormal: 10 }));
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  await io.write(path.join(OUT_DIR, 'coronary-heart.glb'), doc);
  log('coronary-heart.glb', (fs.statSync(path.join(OUT_DIR, 'coronary-heart.glb')).size / 1e6).toFixed(2), 'MB,', parts.length, 'meshes');
}

function attributionMd() {
  const a = MAP.attribution;
  return `# Heart model attribution\n\n**${a.title}**\n\n- Creators: ${a.creators}\n- Underlying data: ${a.data}\n- License: [${a.license}](${a.licenseUrl}); attribution is required wherever the model is shown.\n- DOI: ${a.doi}\n- Source: ${a.sourceUrl}\n\n## Changes made\n\n${a.changes}\n\n## Swapping the asset\n\n1. Put the new GLB in \`assets/source/\` and set \`source\` in \`assets/asset-map.json\`.\n2. Update the name-matching rules so the chambers, septum and coronaries map to the canonical ids.\n3. Run \`npm run asset\`, then \`npm run validate:asset\`.\n`;
}

main().catch((e) => { console.error(e); process.exit(1); });
