/**
 * Cell geometries as signed-distance functions, shared by the simulator (who is inside?) and the
 * renderer (membrane mesh, where transporters sit). Units: 1 ≈ 10 µm for the whole cells,
 * 1 ≈ 1 nm for the membrane patch.
 */
import * as THREE from 'three';
import type { Shape, SiteSpec } from './sim';
import type { TransporterKind } from './model';

const V = () => new THREE.Vector3();
export function segDist(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) {
  const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z; const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby + (p.z - a.z) * abz) / (abx * abx + aby * aby + abz * abz)));
  const dx = p.x - (a.x + abx * t), dy = p.y - (a.y + aby * t), dz = p.z - (a.z + abz * t); return { d: Math.sqrt(dx * dx + dy * dy + dz * dz), t };
}
const smin = (a: number, b: number, k: number) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };

/* ------------------------------------------------------------------ membrane patch: outside is +y, inside −y */
/** membrane patch: half-width, half-depth, half-height, half-thickness; lipids end at z = front (a cut face toward the viewer) */
export const SLAB = { w: 6.4, d: 2.4, h: 3.3, half: 0.5, front: 1.6 };
export const slabShape: Shape = {
  margin: SLAB.half + 0.12, scalable: false,
  sdf(p) { return p.y; },
  outer(p) { return Math.abs(p.x) < SLAB.w && Math.abs(p.z) < SLAB.d && Math.abs(p.y) < SLAB.h; },
  sampleIn(r, out) { return out.set((r() * 2 - 1) * SLAB.w * 0.95, -SLAB.half - 0.2 - r() * (SLAB.h - SLAB.half - 0.4), (r() * 2 - 1) * SLAB.d * 0.9); },
  sampleOut(r, out) { return out.set((r() * 2 - 1) * SLAB.w * 0.95, SLAB.half + 0.2 + r() * (SLAB.h - SLAB.half - 0.4), (r() * 2 - 1) * SLAB.d * 0.9); },
  sampleEdge(r, out) { return out.set((r() * 2 - 1) * SLAB.w * 0.95, SLAB.h - 0.25 - 0.2 * r(), (r() * 2 - 1) * SLAB.d * 0.9); },
};

/* ------------------------------------------------------------------ transporter placement */
/** Points spread over the membrane by casting rays from the centre (the shapes are star-shaped around it). */
export function surfaceSites(shape: Shape, kinds: [TransporterKind, number][], seed: number, accept: (p: THREE.Vector3) => boolean = () => true): SiteSpec[] {
  let s = seed >>> 0; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const all: SiteSpec[] = []; const total = kinds.reduce((a, [, n]) => a + n, 0);
  const pts: THREE.Vector3[] = []; const minD = 0.55;
  for (let tries = 0; pts.length < total && tries < 6000; tries++) {
    const u = r() * 2 - 1, a = r() * Math.PI * 2, q = Math.sqrt(1 - u * u); const d = V().set(q * Math.cos(a), u, q * Math.sin(a));
    let lo = 0, hi = 6; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (shape.sdf(d.clone().multiplyScalar(m)) < 0) lo = m; else hi = m; }
    const p = d.multiplyScalar((lo + hi) / 2); if (!accept(p)) continue;
    const md = tries > 3000 ? minD * 0.6 : minD; if (pts.some((q) => q.distanceTo(p) < md)) continue; pts.push(p);
  }
  // interleave kinds so each is spread over the whole cell
  const order: TransporterKind[] = []; const left = new Map(kinds); while (order.length < pts.length) { let added = false; for (const [k] of kinds) { const n = left.get(k)!; if (n > 0) { order.push(k); left.set(k, n - 1); added = true; } } if (!added) break; }
  pts.forEach((p, i) => { const e = 0.01; const g = new THREE.Vector3(shape.sdf(V().set(p.x + e, p.y, p.z)) - shape.sdf(V().set(p.x - e, p.y, p.z)), shape.sdf(V().set(p.x, p.y + e, p.z)) - shape.sdf(V().set(p.x, p.y - e, p.z)), shape.sdf(V().set(p.x, p.y, p.z + e)) - shape.sdf(V().set(p.x, p.y, p.z - e))).normalize(); all.push({ kind: order[i] ?? kinds[0][0], pos: p, n: g }); });
  return all;
}

/** Protein positions along the membrane patch. */
export function slabSites(kinds: TransporterKind[]): SiteSpec[] {
  const n = kinds.length; return kinds.map((kind, i) => ({ kind, pos: new THREE.Vector3(-SLAB.w * 0.74 + (i * SLAB.w * 1.48) / Math.max(1, n - 1), 0, SLAB.front - 0.95), n: new THREE.Vector3(0, 1, 0) }));
}
