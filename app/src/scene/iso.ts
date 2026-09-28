/**
 * Iso-surface utilities shared by the asset pipeline and the app: scalar grid, blur,
 * marching cubes (welded, indexed) and Taubin smoothing.
 */
import * as THREE from 'three';
import { edgeTable as ET0, triTable as TT0 } from 'three/examples/jsm/objects/MarchingCubes.js';
const edgeTable = ET0 as unknown as Int32Array; const triTable = TT0 as unknown as Int32Array;

export interface Grid { nx: number; ny: number; nz: number; origin: THREE.Vector3; h: number; f: Float32Array }

export function makeGrid(box: THREE.Box3, h: number, pad = 3): Grid {
  const origin = box.min.clone().subScalar(pad * h);
  const size = box.getSize(new THREE.Vector3()).addScalar(2 * pad * h);
  const nx = Math.ceil(size.x / h) + 1, ny = Math.ceil(size.y / h) + 1, nz = Math.ceil(size.z / h) + 1;
  return { nx, ny, nz, origin, h, f: new Float32Array(nx * ny * nz) };
}
export const idx = (g: Grid, i: number, j: number, k: number) => i + g.nx * (j + g.ny * k);

/** Separable box blur, repeated (≈ gaussian). */
export function blur(g: Grid, passes = 2, r = 1) {
  const tmp = new Float32Array(g.f.length);
  const axis = (src: Float32Array, dst: Float32Array, stride: number, n: number, other: (cb: (base: number) => void) => void) => {
    other((base) => { for (let t = 0; t < n; t++) { let s = 0, c = 0; for (let d = -r; d <= r; d++) { const u = t + d; if (u < 0 || u >= n) continue; s += src[base + u * stride]; c++; } dst[base + t * stride] = s / c; } });
  };
  for (let p = 0; p < passes; p++) {
    axis(g.f, tmp, 1, g.nx, (cb) => { for (let k = 0; k < g.nz; k++) for (let j = 0; j < g.ny; j++) cb(g.nx * (j + g.ny * k)); });
    axis(tmp, g.f, g.nx, g.ny, (cb) => { for (let k = 0; k < g.nz; k++) for (let i = 0; i < g.nx; i++) cb(i + g.nx * g.ny * k); });
    axis(g.f, tmp, g.nx * g.ny, g.nz, (cb) => { for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) cb(i + g.nx * j); });
    g.f.set(tmp);
  }
}

/** Marching cubes → welded, indexed geometry with gradient normals. Surface where field == iso (inside > iso). */
export function marchingCubes(g: Grid, iso = 0.5): THREE.BufferGeometry {
  const pos: number[] = []; const index: number[] = []; const cache = new Map<number, number>();
  const F = (i: number, j: number, k: number) => g.f[idx(g, i, j, k)];
  const corner = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
  // three.js table uses corner order: 0(0,0,0) 1(1,0,0) 2(0,1,0)... remap via its own polygonize ordering:
  // three's MarchingCubes bit order: 1:(0,0,0) 2:(1,0,0) 4:(1,1,0) 8:(0,1,0) 16:(0,0,1) 32:(1,0,1) 64:(1,1,1) 128:(0,1,1)
  const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  const vid = (i: number, j: number, k: number, e: number) => {
    const [a, b] = edges[e]; const ca = corner[a], cb = corner[b];
    const ia = idx(g, i + ca[0], j + ca[1], k + ca[2]), ib = idx(g, i + cb[0], j + cb[1], k + cb[2]);
    const key = ia < ib ? ia * 8 + (ib - ia === 1 ? 0 : ib - ia === g.nx ? 1 : 2) : ib * 8 + (ia - ib === 1 ? 0 : ia - ib === g.nx ? 1 : 2);
    let v = cache.get(key); if (v !== undefined) return v;
    const fa = g.f[ia], fb = g.f[ib]; const t = Math.abs(fb - fa) < 1e-9 ? 0.5 : (iso - fa) / (fb - fa);
    v = pos.length / 3;
    pos.push(g.origin.x + (i + ca[0] + (cb[0] - ca[0]) * t) * g.h, g.origin.y + (j + ca[1] + (cb[1] - ca[1]) * t) * g.h, g.origin.z + (k + ca[2] + (cb[2] - ca[2]) * t) * g.h);
    cache.set(key, v); return v;
  };
  for (let k = 0; k < g.nz - 1; k++) for (let j = 0; j < g.ny - 1; j++) for (let i = 0; i < g.nx - 1; i++) {
    let ci = 0; for (let c = 0; c < 8; c++) if (F(i + corner[c][0], j + corner[c][1], k + corner[c][2]) < iso) ci |= 1 << c;
    if (edgeTable[ci] === 0) continue;
    const o = ci << 4;
    for (let t = 0; triTable[o + t] !== -1; t += 3) {
      const a = vid(i, j, k, triTable[o + t]), b = vid(i, j, k, triTable[o + t + 1]), c = vid(i, j, k, triTable[o + t + 2]);
      if (a !== b && b !== c && a !== c) index.push(a, c, b);
    }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

/** Taubin λ|μ smoothing (shrink-free) on an indexed mesh. */
export function taubin(geo: THREE.BufferGeometry, iters = 6, lambda = 0.5, mu = -0.53) {
  const p = geo.attributes.position.array as Float32Array; const n = p.length / 3; const ix = geo.index!.array;
  const nb: Set<number>[] = Array.from({ length: n }, () => new Set());
  for (let t = 0; t < ix.length; t += 3) { const a = ix[t], b = ix[t + 1], c = ix[t + 2]; nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
  const step = (f: number) => { const q = new Float32Array(p); for (let v = 0; v < n; v++) { if (!nb[v].size) continue; let sx = 0, sy = 0, sz = 0; for (const u of nb[v]) { sx += q[u * 3]; sy += q[u * 3 + 1]; sz += q[u * 3 + 2]; } const m = nb[v].size; p[v * 3] = q[v * 3] + f * (sx / m - q[v * 3]); p[v * 3 + 1] = q[v * 3 + 1] + f * (sy / m - q[v * 3 + 1]); p[v * 3 + 2] = q[v * 3 + 2] + f * (sz / m - q[v * 3 + 2]); } };
  for (let i = 0; i < iters; i++) { step(lambda); step(mu); }
  geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
}

