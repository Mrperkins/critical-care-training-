/**
 * Geometry from signed-distance functions: the cell surface (marching cubes), and at the slice the
 * outline of the cut (marching squares) turned into a rounded membrane lip and a flat cytosol face.
 */
import * as THREE from 'three';
import { makeGrid, marchingCubes, taubin } from '../../../scene/iso';

export function sdfMesh(sdf: (p: THREE.Vector3) => number, box: THREE.Box3, h: number, iso = 0, smooth = 4): THREE.BufferGeometry {
  const g = makeGrid(box, h, 2); const p = new THREE.Vector3();
  for (let k = 0; k < g.nz; k++) for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) { p.set(g.origin.x + i * h, g.origin.y + j * h, g.origin.z + k * h); g.f[i + g.nx * (j + g.ny * k)] = iso - sdf(p); }
  // anything above the box top is outside: keeps the mesh open at the slice
  const geo = marchingCubes(g, 0); if (smooth) taubin(geo, smooth); return geo;
}

/** Closed outline loops of sdf(x, y, z) = iso in the plane y. */
export function sliceLoops(sdf: (p: THREE.Vector3) => number, y: number, box: THREE.Box3, h: number, iso: number): THREE.Vector2[][] {
  const x0 = box.min.x - 2 * h, z0 = box.min.z - 2 * h; const nx = Math.ceil((box.max.x - box.min.x) / h) + 5, nz = Math.ceil((box.max.z - box.min.z) / h) + 5;
  const f = new Float32Array(nx * nz); const p = new THREE.Vector3();
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { p.set(x0 + i * h, y, z0 + j * h); f[i + j * nx] = sdf(p) - iso; }
  const F = (i: number, j: number) => f[i + j * nx];
  const pt = (i0: number, j0: number, i1: number, j1: number) => { const a = F(i0, j0), b = F(i1, j1); const t = Math.abs(b - a) < 1e-9 ? 0.5 : a / (a - b); return new THREE.Vector2(x0 + (i0 + (i1 - i0) * t) * h, z0 + (j0 + (j1 - j0) * t) * h); };
  // edge keys: bottom (i,j)-(i+1,j) = 'b', left (i,j)-(i,j+1) = 'l'
  const segs: [string, string][] = []; const pos = new Map<string, THREE.Vector2>();
  const E = (kind: 'b' | 'l', i: number, j: number) => { const k = `${kind}${i},${j}`; if (!pos.has(k)) pos.set(k, kind === 'b' ? pt(i, j, i + 1, j) : pt(i, j, i, j + 1)); return k; };
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const c = (F(i, j) < 0 ? 1 : 0) | (F(i + 1, j) < 0 ? 2 : 0) | (F(i + 1, j + 1) < 0 ? 4 : 0) | (F(i, j + 1) < 0 ? 8 : 0);
    if (c === 0 || c === 15) continue;
    const B = () => E('b', i, j), R = () => E('l', i + 1, j), T = () => E('b', i, j + 1), L = () => E('l', i, j);
    const S = (a: string, b: string) => segs.push([a, b]);
    switch (c) {
      case 1: case 14: S(L(), B()); break; case 2: case 13: S(B(), R()); break; case 3: case 12: S(L(), R()); break;
      case 4: case 11: S(R(), T()); break; case 6: case 9: S(B(), T()); break; case 7: case 8: S(L(), T()); break;
      case 5: S(L(), T()); S(B(), R()); break; case 10: S(L(), B()); S(R(), T()); break;
    }
  }
  const adj = new Map<string, string[]>(); for (const [a, b] of segs) { (adj.get(a) ?? adj.set(a, []).get(a)!).push(b); (adj.get(b) ?? adj.set(b, []).get(b)!).push(a); }
  const seen = new Set<string>(); const loops: THREE.Vector2[][] = [];
  for (const start of adj.keys()) {
    if (seen.has(start)) continue; const loop: string[] = [start]; seen.add(start); let prev = '', cur = start;
    for (;;) { const nb = (adj.get(cur) ?? []).find((n) => n !== prev && !seen.has(n)); if (!nb) break; loop.push(nb); seen.add(nb); prev = cur; cur = nb; }
    if (loop.length > 8) loops.push(loop.map((k) => pos.get(k)!.clone()));
  }
  return loops.map((l) => chaikin(l, 2));
}
function chaikin(pts: THREE.Vector2[], it: number) { let p = pts; for (let k = 0; k < it; k++) { const q: THREE.Vector2[] = []; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; q.push(a.clone().lerp(b, 0.25), a.clone().lerp(b, 0.75)); } p = q; } return p; }
function resample(loop: THREE.Vector2[], step: number) { const out: THREE.Vector2[] = []; let acc = 0; for (let i = 0; i < loop.length; i++) { const a = loop[i], b = loop[(i + 1) % loop.length]; const d = a.distanceTo(b); acc += d; if (acc >= step) { out.push(a.clone()); acc = 0; } } return out.length > 8 ? out : loop; }

/** Rounded membrane lip along the cut outline. */
export function lipGeometry(loops: THREE.Vector2[][], y: number, r: number) {
  const gs = loops.map((l) => { const pts = resample(l, 0.05).map((v) => new THREE.Vector3(v.x, y, v.y)); return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), Math.max(40, pts.length * 2), r, 12, true); });
  return gs;
}
/** Flat face of the cytosol at the cut. */
export function capGeometry(loops: THREE.Vector2[][], y: number) {
  return loops.map((l) => { const shape = new THREE.Shape(resample(l, 0.04).map((v) => new THREE.Vector2(v.x, -v.y))); const g = new THREE.ShapeGeometry(shape, 1); g.rotateX(-Math.PI / 2); g.translate(0, y, 0); g.computeVertexNormals(); return g; });
}
