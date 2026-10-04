/**
 * The three cells as signed-distance functions (units ≈ 15 µm, so the cells sit at a similar size
 * on screen). Each is sliced by a horizontal plane at `cut`: the simulator keeps cytosolic ions in a
 * layer just under the slice (where the camera can see them) and extracellular ions in a band
 * around the rim.
 */
import * as THREE from 'three';
import type { Shape } from '../sim';
import type { CellType } from '../model';

const V = () => new THREE.Vector3();
export const smin = (a: number, b: number, k: number) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
export function sdRoundBox(x: number, y: number, z: number, bx: number, by: number, bz: number, r: number) {
  const qx = Math.abs(x) - bx + r, qy = Math.abs(y) - by + r, qz = Math.abs(z) - bz + r;
  const ox = Math.max(qx, 0), oy = Math.max(qy, 0), oz = Math.max(qz, 0);
  return Math.sqrt(ox * ox + oy * oy + oz * oz) + Math.min(Math.max(qx, qy, qz), 0) - r;
}
export function sdEllipsoid(x: number, y: number, z: number, a: number, b: number, c: number) {
  const k0 = Math.sqrt((x / a) ** 2 + (y / b) ** 2 + (z / c) ** 2), k1 = Math.sqrt((x / (a * a)) ** 2 + (y / (b * b)) ** 2 + (z / (c * c)) ** 2);
  return k1 < 1e-9 ? -Math.min(a, b, c) : (k0 * (k0 - 1)) / k1;
}
/** distance to a tapered capsule a→b (radius ra→rb) */
export function sdTaper(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number) {
  const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z; const L2 = abx * abx + aby * aby + abz * abz;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby + (p.z - a.z) * abz) / L2));
  const dx = p.x - (a.x + abx * t), dy = p.y - (a.y + aby * t), dz = p.z - (a.z + abz * t);
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * t);
}

export interface Limb { a: THREE.Vector3; b: THREE.Vector3; ra: number; rb: number; kind: 'dendrite' | 'branch' | 'hillock' | 'axon' }
export interface Disc { pos: THREE.Vector3; dir: THREE.Vector3; hw: number; hh: number }
export interface CellDef {
  type: CellType; name: string;
  /** the cell itself (ions inside / outside) */
  sdf: (p: THREE.Vector3) => number;
  /** what is drawn: the cell plus pieces of its neighbours (heart); defaults to sdf */
  meshSdf?: (p: THREE.Vector3) => number;
  cut: number; box: THREE.Box3;
  /** outside region: ellipse in x–z (centre cx) */
  out: { cx: number; rx: number; rz: number };
  shape: Shape;
  /** where transporters may sit (visible on the rim just under the slice) */
  siteBand: [number, number];
  limbs?: Limb[]; discs?: Disc[];
  /** what the camera looks at (x, z) */
  centre: [number, number];
  /** camera frame [w, h] wide / narrow screens */
  frame: { wide: [number, number]; narrow: [number, number] };
}

const MARGIN = 0.1;
function makeShape(sdf: (p: THREE.Vector3) => number, cut: number, box: THREE.Box3, out: CellDef['out'], drawn = sdf): Shape {
  const inLo = cut - 0.8, inHi = cut - 0.06, outLo = cut - 1.0, outHi = cut + 0.75;
  return {
    margin: MARGIN, scalable: true,
    sdf: drawn,
    sdfIn: (p) => Math.max(sdf(p), p.y - inHi, inLo - p.y),
    outer: (p) => ((p.x - out.cx) / out.rx) ** 2 + (p.z / out.rz) ** 2 < 1 && p.y > outLo && p.y < outHi,
    sampleIn: (r, o) => o.set(box.min.x + r() * (box.max.x - box.min.x), inLo + r() * (inHi - inLo), box.min.z + r() * (box.max.z - box.min.z)),
    sampleOut: (r, o) => { const a = r() * Math.PI * 2, k = Math.sqrt(0.3 + 0.7 * r()); return o.set(out.cx + Math.cos(a) * out.rx * k, outLo + r() * (outHi - outLo), Math.sin(a) * out.rz * k); },
    sampleEdge: (r, o) => { const a = r() * Math.PI * 2, k = 0.9 + 0.08 * r(); return o.set(out.cx + Math.cos(a) * out.rx * k, outLo + 0.2 + r() * (outHi - outLo - 0.3), Math.sin(a) * out.rz * k); },
  };
}

/* ------------------------------------------------------------------ cardiac myocyte: branched brick with intercalated discs */
function limbBox(p: THREE.Vector3, o: THREE.Vector3, ang: number, len: number, hh: number, hw: number, r: number) {
  const c = Math.cos(ang), s = Math.sin(ang); const dx = p.x - o.x, dz = p.z - o.z;
  const lx = dx * c + dz * s, lz = -dx * s + dz * c; return sdRoundBox(lx - len / 2, p.y, lz, len / 2, hh, hw, r);
}
const CARD = { cut: 0.26, oA: new THREE.Vector3(2.15, 0, 0.42), angA: 0.36, lenA: 2.1, oB: new THREE.Vector3(2.15, 0, -0.48), angB: -0.46, lenB: 1.85 };
export const cardiacSdf = (p: THREE.Vector3) => {
  const main = sdRoundBox(p.x + 0.55, p.y, p.z, 2.95, 0.74, 1.02, 0.4);
  const a = limbBox(p, CARD.oA, CARD.angA, CARD.lenA, 0.66, 0.52, 0.34), b = limbBox(p, CARD.oB, CARD.angB, CARD.lenB, 0.62, 0.48, 0.32);
  return smin(smin(main, a, 0.45), b, 0.45);
};
const dir = (a: number) => new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
const CARD_DISCS: Disc[] = [
  { pos: new THREE.Vector3(-3.5, 0, 0), dir: new THREE.Vector3(-1, 0, 0), hw: 0.98, hh: 0.7 },
  { pos: CARD.oA.clone().addScaledVector(dir(CARD.angA), CARD.lenA), dir: dir(CARD.angA), hw: 0.5, hh: 0.62 },
  { pos: CARD.oB.clone().addScaledVector(dir(CARD.angB), CARD.lenB), dir: dir(CARD.angB), hw: 0.46, hh: 0.58 },
];
/** the neighbouring heart cells, joined at each intercalated disc (drawn for context, 1 unit long) */
export const NEIGHBOUR_LEN = 1.0;
const neighbours = (p: THREE.Vector3) => { let d = 1e9; for (const c of CARD_DISCS) { const q = p.clone().sub(c.pos); const along = q.dot(c.dir); const side = new THREE.Vector3(-c.dir.z, 0, c.dir.x); d = Math.min(d, sdRoundBox(along - 0.03 - NEIGHBOUR_LEN / 2, q.y, q.dot(side), NEIGHBOUR_LEN / 2, c.hh, c.hw, 0.3)); } return d; };
export const cardiacDrawn = (p: THREE.Vector3) => Math.min(cardiacSdf(p), neighbours(p));
const cardBox = new THREE.Box3(new THREE.Vector3(-4.75, -0.95, -2.5), new THREE.Vector3(5.3, CARD.cut + 0.14, 2.5));
export const CARDIAC: CellDef = {
  type: 'cardiac', name: 'Heart muscle cell (cardiomyocyte)', sdf: cardiacSdf, meshSdf: cardiacDrawn, cut: CARD.cut, box: cardBox,
  out: { cx: 0.35, rx: 5.2, rz: 3.0 }, shape: makeShape(cardiacSdf, CARD.cut, cardBox, { cx: 0.35, rx: 5.2, rz: 3.0 }, cardiacDrawn), siteBand: [CARD.cut - 0.55, CARD.cut - 0.12],
  discs: CARD_DISCS,
  centre: [0.25, 0], frame: { wide: [10.6, 5.6], narrow: [8.4, 5.2] },
};

/* ------------------------------------------------------------------ neuron: soma, branching spiny dendrites, hillock, myelinated axon */
function neuronLimbs(): Limb[] {
  const L: Limb[] = []; const deg = Math.PI / 180;
  const d = (ang: number, dy: number) => new THREE.Vector3(Math.cos(ang * deg), dy, Math.sin(ang * deg)).normalize();
  const prim: [number, number, number][] = [[40, 2.6, 0.4], [95, 2.4, 0.36], [150, 2.2, 0.34], [-30, 2.5, 0.38], [-95, 2.1, 0.33]]; // angle, length, base radius
  for (const [ang, len, r0] of prim) {
    const u = d(ang, -0.04); const a = u.clone().multiplyScalar(0.95), b = u.clone().multiplyScalar(0.95 + len); b.y -= 0.12;
    L.push({ a, b, ra: r0, rb: 0.12, kind: 'dendrite' });
    for (const s of [-1, 1]) { const v = d(ang + s * 28, -0.06); const c = b.clone().addScaledVector(v, 1.5 + 0.2 * s); c.y -= 0.1; L.push({ a: b.clone(), b: c, ra: 0.12, rb: 0.05, kind: 'branch' }); }
  }
  const ax = d(-160, 0); const h0 = ax.clone().multiplyScalar(1.05), h1 = ax.clone().multiplyScalar(1.85); h1.y -= 0.08; const a1 = ax.clone().multiplyScalar(6.4); a1.y -= 0.18;
  L.push({ a: h0, b: h1, ra: 0.5, rb: 0.17, kind: 'hillock' }, { a: h1, b: a1, ra: 0.17, rb: 0.15, kind: 'axon' });
  return L;
}
const NEU_LIMBS = neuronLimbs();
export const neuronSdf = (p: THREE.Vector3) => {
  let d = sdEllipsoid(p.x, p.y + 0.05, p.z, 1.3, 0.92, 1.2);
  for (const l of NEU_LIMBS) d = smin(d, sdTaper(p, l.a, l.b, l.ra, l.rb), l.kind === 'branch' ? 0.14 : 0.32);
  return d;
};
const neuBox = new THREE.Box3(new THREE.Vector3(-6.5, -1.05, -4.4), new THREE.Vector3(4.6, 0.3 + 0.14, 4.4));
export const NEURON: CellDef = {
  type: 'neuron', name: 'Nerve cell (neuron)', sdf: neuronSdf, cut: 0.3, box: neuBox,
  out: { cx: -0.3, rx: 4.6, rz: 3.9 }, shape: makeShape(neuronSdf, 0.3, neuBox, { cx: -0.3, rx: 4.6, rz: 3.9 }), siteBand: [0.3 - 0.5, 0.3 - 0.1],
  limbs: NEU_LIMBS, centre: [-0.35, 0.1], frame: { wide: [6.4, 4.4], narrow: [4.6, 4.4] },
};

/* ------------------------------------------------------------------ round textbook cell: a plump disc with an irregular outline */
export const roundR = (th: number) => 2.85 * (1 + 0.04 * Math.sin(5 * th + 0.3) + 0.025 * Math.sin(8 * th + 1.7) + 0.015 * Math.sin(13 * th + 0.4));
export const roundSdf = (p: THREE.Vector3) => {
  const rb = 0.5, H = 0.82; const R = roundR(Math.atan2(p.z, p.x));
  const qx = Math.hypot(p.x, p.z) - (R - rb), qy = Math.abs(p.y + 0.04) - (H - rb);
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - rb;
};
const rndBox = new THREE.Box3(new THREE.Vector3(-3.1, -0.9, -3.1), new THREE.Vector3(3.1, 0.32 + 0.14, 3.1));
export const ROUND: CellDef = {
  type: 'round', name: 'Generic animal cell', sdf: roundSdf, cut: 0.32, box: rndBox,
  out: { cx: 0, rx: 4.0, rz: 4.0 }, shape: makeShape(roundSdf, 0.32, rndBox, { cx: 0, rx: 4.0, rz: 4.0 }), siteBand: [0.32 - 0.5, 0.32 - 0.1],
  centre: [0, 0], frame: { wide: [7.6, 5.4], narrow: [6.6, 6.0] },
};

export const CELL_DEFS: Record<CellType, CellDef> = { cardiac: CARDIAC, neuron: NEURON, round: ROUND };
void V;
