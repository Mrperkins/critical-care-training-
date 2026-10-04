/** Asset-pipeline voxel tools: iso-surfacing lives in src/scene/iso.ts (shared with the app); rasterisers need a BVH. */
import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { type Grid, idx } from '../src/scene/iso';
export * from '../src/scene/iso';

/** Mark voxels inside ANY of the meshes (union). Each mesh is treated independently with even-odd parity along z. */
export function rasterUnion(g: Grid, geos: THREE.BufferGeometry[], value = 1) {
  const ray = new THREE.Ray(); const dir = new THREE.Vector3(0, 0, 1);
  for (const geo of geos) {
    const bvh = new MeshBVH(geo); geo.computeBoundingBox(); const bb = geo.boundingBox!;
    const i0 = Math.max(0, Math.floor((bb.min.x - g.origin.x) / g.h)), i1 = Math.min(g.nx - 1, Math.ceil((bb.max.x - g.origin.x) / g.h));
    const j0 = Math.max(0, Math.floor((bb.min.y - g.origin.y) / g.h)), j1 = Math.min(g.ny - 1, Math.ceil((bb.max.y - g.origin.y) / g.h));
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const x = g.origin.x + i * g.h + 1e-5, y = g.origin.y + j * g.h + 2e-5;
      ray.origin.set(x, y, bb.min.z - 1); ray.direction.copy(dir);
      const hits = bvh.raycast(ray, THREE.DoubleSide).map((h) => h.point.z).sort((a, b) => a - b);
      // dedupe near-coincident hits (shared edges)
      const zs: number[] = []; for (const z of hits) if (!zs.length || z - zs[zs.length - 1] > 1e-6) zs.push(z);
      for (let q = 0; q + 1 < zs.length; q += 2) {
        const k0 = Math.max(0, Math.ceil((zs[q] - g.origin.z) / g.h)), k1 = Math.min(g.nz - 1, Math.floor((zs[q + 1] - g.origin.z) / g.h));
        for (let k = k0; k <= k1; k++) g.f[idx(g, i, j, k)] = value;
      }
    }
  }
}

/**
 * Robust solid voxelisation for non-watertight meshes: mark a surface band (distance < band),
 * flood-fill the exterior from the grid boundary; everything not reached is inside.
 */
export function rasterSolid(g: Grid, geos: THREE.BufferGeometry[], band = 1.2) {
  const wall = new Uint8Array(g.f.length);
  const tgt = { point: new THREE.Vector3(), distance: 0, faceIndex: 0 } as any; const p = new THREE.Vector3();
  for (const geo of geos) {
    const bvh = new MeshBVH(geo); geo.computeBoundingBox(); const bb = geo.boundingBox!;
    const r = band * g.h;
    const i0 = Math.max(0, Math.floor((bb.min.x - r - g.origin.x) / g.h)), i1 = Math.min(g.nx - 1, Math.ceil((bb.max.x + r - g.origin.x) / g.h));
    const j0 = Math.max(0, Math.floor((bb.min.y - r - g.origin.y) / g.h)), j1 = Math.min(g.ny - 1, Math.ceil((bb.max.y + r - g.origin.y) / g.h));
    const k0 = Math.max(0, Math.floor((bb.min.z - r - g.origin.z) / g.h)), k1 = Math.min(g.nz - 1, Math.ceil((bb.max.z + r - g.origin.z) / g.h));
    for (let k = k0; k <= k1; k++) for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const q = idx(g, i, j, k); if (wall[q]) continue;
      p.set(g.origin.x + i * g.h, g.origin.y + j * g.h, g.origin.z + k * g.h);
      const h = bvh.closestPointToPoint(p, tgt, 0, r); if (h && h.distance < r) wall[q] = 1;
    }
  }
  const out = new Uint8Array(g.f.length); const stack: number[] = [];
  const push = (i: number, j: number, k: number) => { if (i < 0 || j < 0 || k < 0 || i >= g.nx || j >= g.ny || k >= g.nz) return; const q = idx(g, i, j, k); if (out[q] || wall[q]) return; out[q] = 1; stack.push(q); };
  for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) { push(i, j, 0); push(i, j, g.nz - 1); }
  for (let k = 0; k < g.nz; k++) for (let i = 0; i < g.nx; i++) { push(i, 0, k); push(i, g.ny - 1, k); }
  for (let k = 0; k < g.nz; k++) for (let j = 0; j < g.ny; j++) { push(0, j, k); push(g.nx - 1, j, k); }
  while (stack.length) { const q = stack.pop()!; const i = q % g.nx, j = Math.floor(q / g.nx) % g.ny, k = Math.floor(q / (g.nx * g.ny)); push(i + 1, j, k); push(i - 1, j, k); push(i, j + 1, k); push(i, j - 1, k); push(i, j, k + 1); push(i, j, k - 1); }
  for (let q = 0; q < g.f.length; q++) if (!out[q]) g.f[q] = 1;
}
