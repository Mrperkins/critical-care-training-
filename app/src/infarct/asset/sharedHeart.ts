/**
 * One heart for the whole Cardiac tab.
 *
 * The MI Locator's coronary heart (coronary-heart.glb) and the cardiac module's high-detail heart (heart-hd.glb) are
 * the same HuBMAP / Visible Human Male chambers in the same body frame: measured against each other the surfaces sit
 * within ~2 mm (95th percentile). The coronary heart carries the teaching data — per-vertex coronary territory
 * weights (aRegA/aRegB), baked occlusion and epicardial fat — on a light mesh; the high-detail heart carries the
 * anatomy. Here the teaching attributes are transferred onto the high-detail chambers (inverse-distance blend of the
 * nearest source vertices) so MI Locator draws the same full-resolution heart as the rest of the Cardiac tab.
 *
 * Registration is measured before anything is swapped. If any chamber is further apart than the tolerance the
 * original coronary heart is kept, whole, rather than mixing hearts. The coronary arteries and veins are the
 * authored MI vessels (they sit within ~1.5 mm of the high-detail epicardium), so occlusion, flow and picking keep
 * working unchanged. Territory weights are teaching approximations of usual perfusion, not a patient perfusion map.
 */
import * as THREE from 'three';
import { loadHeartHD } from '../../asset/anatomy';
import type { HeartAsset } from './heartAsset';

/** high-detail chamber ← coronary-heart meshes it takes its teaching attributes from (the HD LV includes the septum) */
export const SHARED_CHAMBERS: Record<string, { hd: string; from: string[] }> = {
  myocardium_LV: { hd: 'lv', from: ['myocardium_LV', 'myocardium_septum'] },
  myocardium_RV: { hd: 'rv', from: ['myocardium_RV'] },
  atrium_LA: { hd: 'la', from: ['atrium_LA'] },
  atrium_RA: { hd: 'ra', from: ['atrium_RA'] },
};
/** source meshes the high-detail chambers replace */
export const REPLACED = ['myocardium_LV', 'myocardium_septum', 'myocardium_RV', 'atrium_LA', 'atrium_RA'];
const BLEND = ['aRegA', 'aRegB', 'aAO', 'aFat'] as const; // continuous: inverse-distance blend
const NEAREST = ['aCh'] as const;                       // categorical: nearest vertex
/** decimetres (body frame): 95% of high-detail vertices must lie within 4 mm of the coronary heart's surface */
export const P95_LIMIT_DM = 0.04;
export const COVERAGE_LIMIT_DM = 0.06;
export const COVERAGE_MIN = 0.97;
const CELL = 0.03;

export interface TransferStats { id: string; vertices: number; p50Mm: number; p95Mm: number; maxMm: number; coverage: number }

/** Transfers the teaching attributes from `sources` (body frame) onto a copy of `target` (body frame). */
export function transferTeachingAttributes(sources: THREE.BufferGeometry[], target: THREE.BufferGeometry, id = 'chamber'): { geometry: THREE.BufferGeometry; stats: TransferStats } {
  for (const s of sources) for (const k of [...BLEND, ...NEAREST]) if (!s.getAttribute(k)) throw new Error(`Teaching attribute ${k} missing on ${id} source`);
  // flatten the sources: positions and every attribute into typed arrays
  const S = sources.reduce((n, g) => n + g.getAttribute('position').count, 0);
  const sp = new Float32Array(S * 3); const sv: Record<string, Float32Array> = {}; const size: Record<string, number> = {};
  for (const k of [...BLEND, ...NEAREST]) { size[k] = sources[0].getAttribute(k).itemSize; sv[k] = new Float32Array(S * size[k]); }
  let o = 0;
  for (const g of sources) {
    const p = g.getAttribute('position'); const n = p.count;
    for (let i = 0; i < n; i++) { sp[(o + i) * 3] = p.getX(i); sp[(o + i) * 3 + 1] = p.getY(i); sp[(o + i) * 3 + 2] = p.getZ(i); }
    for (const k of [...BLEND, ...NEAREST]) {
      const a = g.getAttribute(k); const z = size[k]; const d = sv[k];
      for (let i = 0; i < n; i++) { d[(o + i) * z] = a.getX(i); if (z > 1) d[(o + i) * z + 1] = a.getY(i); if (z > 2) d[(o + i) * z + 2] = a.getZ(i); if (z > 3) d[(o + i) * z + 3] = a.getW(i); }
    }
    o += n;
  }
  // dense uniform grid over the sources (CSR layout)
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let i = 0; i < S; i++) { const x = sp[i * 3], y = sp[i * 3 + 1], z = sp[i * 3 + 2]; if (x < x0) x0 = x; if (y < y0) y0 = y; if (z < z0) z0 = z; if (x > x1) x1 = x; if (y > y1) y1 = y; if (z > z1) z1 = z; }
  const nx = Math.max(1, Math.ceil((x1 - x0) / CELL) + 1), ny = Math.max(1, Math.ceil((y1 - y0) / CELL) + 1), nz = Math.max(1, Math.ceil((z1 - z0) / CELL) + 1);
  const cellOf = (i: number) => (Math.floor((sp[i * 3] - x0) / CELL) * ny + Math.floor((sp[i * 3 + 1] - y0) / CELL)) * nz + Math.floor((sp[i * 3 + 2] - z0) / CELL);
  const start = new Int32Array(nx * ny * nz + 1); const items = new Int32Array(S);
  for (let i = 0; i < S; i++) start[cellOf(i) + 1]++;
  for (let c = 0; c < nx * ny * nz; c++) start[c + 1] += start[c];
  const fill = start.slice(0, nx * ny * nz);
  for (let i = 0; i < S; i++) items[fill[cellOf(i)]++] = i;

  const geo = target.clone();
  const tp = geo.getAttribute('position'); const N = tp.count;
  const out: Record<string, Float32Array> = {};
  for (const k of [...BLEND, ...NEAREST]) out[k] = new Float32Array(N * size[k]);
  const dist = new Float32Array(N);
  const best = new Int32Array(4); const bd = new Float64Array(4); const w = new Float64Array(4);
  for (let i = 0; i < N; i++) {
    const x = tp.getX(i), y = tp.getY(i), z = tp.getZ(i);
    const cx = Math.floor((x - x0) / CELL), cy = Math.floor((y - y0) / CELL), cz = Math.floor((z - z0) / CELL);
    best.fill(-1); bd.fill(Infinity);
    for (let r = 1; r <= 4; r++) {
      for (let dx = -r; dx <= r; dx++) { const gx = cx + dx; if (gx < 0 || gx >= nx) continue;
        for (let dy = -r; dy <= r; dy++) { const gy = cy + dy; if (gy < 0 || gy >= ny) continue;
          for (let dz = -r; dz <= r; dz++) { const gz = cz + dz; if (gz < 0 || gz >= nz) continue;
            if (r > 1 && Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== r) continue;
            const c = (gx * ny + gy) * nz + gz;
            for (let q = start[c]; q < start[c + 1]; q++) {
              const j = items[q]; const ex = sp[j * 3] - x, ey = sp[j * 3 + 1] - y, ez = sp[j * 3 + 2] - z; const d = ex * ex + ey * ey + ez * ez;
              if (d >= bd[3]) continue;
              let s = 3; while (s > 0 && bd[s - 1] > d) { bd[s] = bd[s - 1]; best[s] = best[s - 1]; s--; }
              bd[s] = d; best[s] = j;
            }
          } } }
      // every cell within r·CELL has been searched: the 4th-nearest is final once it lies inside that radius
      if (best[3] >= 0 && bd[3] <= (r * CELL) ** 2) break;
    }
    if (best[0] < 0) { dist[i] = Infinity; continue; }
    dist[i] = Math.sqrt(bd[0]);
    let wsum = 0;
    for (let s = 0; s < 4; s++) { w[s] = best[s] >= 0 ? 1 / (Math.sqrt(bd[s]) + 0.002) ** 2 : 0; wsum += w[s]; }
    for (const k of BLEND) {
      const z = size[k]; const d = sv[k]; const ok = out[k];
      for (let s = 0; s < 4; s++) { if (best[s] < 0) continue; const f = w[s] / wsum; const j = best[s] * z; for (let c = 0; c < z; c++) ok[i * z + c] += d[j + c] * f; }
    }
    for (const k of NEAREST) out[k][i] = sv[k][best[0] * size[k]];
  }
  for (const k of [...BLEND, ...NEAREST]) geo.setAttribute(k, new THREE.BufferAttribute(out[k], size[k]));
  for (const k of ['aS', 'aW']) geo.setAttribute(k, new THREE.BufferAttribute(new Float32Array(N), 1));
  geo.computeBoundingSphere(); geo.computeBoundingBox();
  const sample: number[] = []; const step = Math.max(1, Math.floor(N / 4000)); let within = 0;
  for (let i = 0; i < N; i++) { if (dist[i] <= COVERAGE_LIMIT_DM) within++; if (i % step === 0) sample.push(dist[i]); }
  sample.sort((a, b) => a - b);
  const q = (f: number) => sample[Math.min(sample.length - 1, Math.floor(f * (sample.length - 1)))] * 100;
  return { geometry: geo, stats: { id, vertices: N, p50Mm: q(0.5), p95Mm: q(0.95), maxMm: q(1), coverage: within / N } };
}

export const registrationAccepted = (s: TransferStats) => Number.isFinite(s.p95Mm) && s.p95Mm <= P95_LIMIT_DM * 100 && s.coverage >= COVERAGE_MIN;

export interface SharedHeart { asset: HeartAsset; shared: boolean; stats: TransferStats[]; reason?: string; ms?: number }

/** Builds the shared-heart asset from the coronary heart and the high-detail chambers (pure: no loading). */
export function buildSharedHeart(original: HeartAsset, hd: Record<string, THREE.Mesh>): SharedHeart {
  const stats: TransferStats[] = []; const made: THREE.Mesh[] = []; const t0 = performance.now();
  try {
    const replacements: Record<string, THREE.Mesh> = {};
    for (const [id, { hd: hdId, from }] of Object.entries(SHARED_CHAMBERS)) {
      const target = hd[hdId]; const src = from.map((f) => original.meshes[f]?.geometry);
      if (!target || src.some((g) => !g)) throw new Error(`missing chamber ${id}`);
      const { geometry, stats: st } = transferTeachingAttributes(src as THREE.BufferGeometry[], target.geometry, id);
      stats.push(st);
      const mesh = new THREE.Mesh(geometry); made.push(mesh);
      if (!registrationAccepted(st)) throw new Error(`${id} is ${st.p95Mm.toFixed(1)} mm (95th percentile) from the coronary heart; ${(st.coverage * 100).toFixed(1)}% within ${COVERAGE_LIMIT_DM * 100} mm`);
      mesh.name = id; mesh.userData = { ...original.meshes[id].userData, source: 'heart-hd.glb', teaching: 'territory weights transferred from coronary-heart.glb' };
      replacements[id] = mesh;
    }
    const meshes: Record<string, THREE.Mesh> = {};
    for (const [id, m] of Object.entries(original.meshes)) if (!REPLACED.includes(id)) meshes[id] = m;
    Object.assign(meshes, replacements);
    return { asset: { ...original, meshes }, shared: true, stats, ms: Math.round(performance.now() - t0) };
  } catch (e) {
    made.forEach((m) => m.geometry.dispose());
    return { asset: original, shared: false, stats, reason: String((e as Error)?.message ?? e) };
  }
}

let cache: Promise<SharedHeart> | null = null;
/** The MI Locator heart: high-detail chambers with coronary teaching data, or the coronary heart if registration fails. */
export function loadSharedHeart(original: HeartAsset): Promise<SharedHeart> {
  if (!cache) {
    cache = loadHeartHD().then((layer) => buildSharedHeart(original, layer.meshes)).catch((e) => ({ asset: original, shared: false, stats: [], reason: String(e?.message ?? e) }));
  }
  return cache;
}
