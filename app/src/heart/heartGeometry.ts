/**
 * Congenital lesions drawn into the real heart: landmarks, defects and deformations on the HuBMAP / Visible Human
 * Male heart (models/lines.glb, CC BY 4.0). Body frame, decimetres: +X patient left, +Y up, +Z anterior.
 *
 * Every landmark was measured from the meshes themselves (chamber and valve centroids, the septal slab's principal
 * axes, the closest approach of the right- and left-atrial walls at the fossa ovalis, the aortic centreline at the
 * isthmus). The model is an adult heart at true scale, so a 10 mm defect is drawn 0.10 dm across; for a newborn the
 * holes are drawn relative to a heart about 2.5× smaller.
 *
 * Pure functions only (no React, no WebGL) so the geometry can be tested.
 */
import * as THREE from 'three';
import type { ShuntInput, ShuntState } from './shunt';

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** heart bounding-box centre and the display scale (scene units per decimetre) */
export const CENTRE = v(0.187, 4.761, 0.376);
export const SCALE = 2.6;
export const toScene = (p: THREE.Vector3) => p.clone().sub(CENTRE).multiplyScalar(SCALE);

/** septal normal (principal axis of least extent of the interventricular septum mesh), pointing from LV into RV */
export const SEPTUM_N = v(-0.782, 0.049, 0.621).normalize();
/** through the fossa ovalis, right atrium → left atrium */
export const ATRIAL_N = v(0.609, 0.327, -0.723).normalize();

export const LM = {
  ra: v(-0.2, 4.79, 0.36), la: v(0.11, 4.96, 0.04), rv: v(0.22, 4.55, 0.62), lv: v(0.45, 4.62, 0.42),
  tricuspid: v(-0.021, 4.598, 0.472), mitral: v(0.245, 4.741, 0.152), aorticValve: v(0.096, 4.966, 0.28), pulmValve: v(0.181, 5.081, 0.434),
  lvApex: v(0.73, 4.357, 0.831), septum: v(0.332, 4.638, 0.53),
  /** perimembranous: just below the aortic valve, where the septum, LV and RV walls meet */
  vsdPerimembranous: v(0.21, 4.84, 0.36).addScaledVector(SEPTUM_N, 0.027),
  /** mid-muscular septum (septum ≈ 10 mm thick here) */
  vsdMuscular: v(0.4, 4.58, 0.56).addScaledVector(SEPTUM_N, 0.035),
  /** fossa ovalis: between the septal walls of the two atria */
  fossa: v(-0.05, 4.82, 0.128).addScaledVector(ATRIAL_N, 0.038),
  /** ductus arteriosus: aortic isthmus (underside, beyond the left subclavian) → proximal left pulmonary artery */
  pdaAorta: v(0.19, 5.43, -0.128), pdaPa: v(0.31, 5.345, -0.044),
  /** aortic isthmus centreline point and the local axis of the aorta there (coarctation site) */
  isthmus: v(0.158, 5.48, -0.115), isthmusAxis: v(0, -0.56, -0.83).normalize(),
  /** right-ventricular outflow (infundibulum) just below the pulmonary valve and its axis toward the valve */
  rvot: v(0.22, 4.95, 0.5), rvotAxis: v(-0.26, 0.87, -0.44).normalize(),
};

/* ------------------------------------------------------------------ defects (holes) */
/** A cylindrical (optionally slit-shaped) hole: fragments of the listed meshes inside it are discarded and a short
 *  tube lines the tunnel. `u`/`squash` stretch the cross-section along u into a slit (PFO). */
export interface Hole { id: 'vsd' | 'asd' | 'pfo'; c: THREE.Vector3; ax: THREE.Vector3; r: number; half: number; u?: THREE.Vector3; squash?: number; meshes: string[] }

/** mm → drawing radius in decimetres; newborn defects drawn relative to a heart ~2.5× smaller */
export const holeRadius = (mm: number, neo: boolean) => Math.max(0.008, (mm / 200) * (neo ? 2.5 : 1));

export function holesFor(inp: ShuntInput, s?: ShuntState): Hole[] {
  const neo = (inp.qs ?? 5) < 2; const out: Hole[] = [];
  if (inp.lesion === 'vsd' || inp.lesion === 'tof') {
    const muscular = inp.lesion === 'vsd' && inp.vsdSite === 'muscular';
    out.push({ id: 'vsd', c: muscular ? LM.vsdMuscular : LM.vsdPerimembranous, ax: SEPTUM_N, r: holeRadius(inp.lesion === 'tof' ? Math.max(12, inp.sizeMm) : inp.sizeMm, neo), half: muscular ? 0.075 : 0.08, meshes: ['septum', 'lv', 'rv'] });
  }
  if (inp.lesion === 'asd') out.push({ id: 'asd', c: LM.fossa, ax: ATRIAL_N, r: holeRadius(inp.sizeMm, neo), half: 0.05, meshes: ['ra', 'la'] });
  if (inp.lesion === 'pfo') {
    const open = s ? Math.min(1, s.rl / 0.3) : 0;
    out.push({ id: 'pfo', c: LM.fossa, ax: ATRIAL_N, r: holeRadius(Math.max(2, inp.sizeMm * (0.25 + 0.75 * open)), neo) * 0.55, half: 0.05, u: v(0.0, 1, 0.45).normalize(), squash: 3.2, meshes: ['ra', 'la'] });
  }
  return out;
}

/** is a point inside a hole (same test as the shader) */
export function inHole(p: THREE.Vector3, h: Hole) {
  const d = p.clone().sub(h.c); const along = d.dot(h.ax); if (Math.abs(along) > h.half) return false;
  const e = d.addScaledVector(h.ax, -along);
  if (!h.u) return e.length() < h.r;
  const ru = e.dot(h.u); const rv = e.addScaledVector(h.u, -ru).length(); const sq = h.squash ?? 1;
  return Math.hypot(ru / sq, rv) < h.r;
}

/* ------------------------------------------------------------------ deformations (on copies of the mesh positions) */
type P3 = Float32Array;
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/** narrow a tube toward its local axis: radius × (1 − amount) at the centre, easing out over ±len */
export function pinch(pos: P3, c: THREE.Vector3, axis: THREE.Vector3, len: number, maxR: number, amount: number) {
  if (amount <= 0) return pos; const out = pos.slice(); const d = new THREE.Vector3();
  for (let i = 0; i < out.length; i += 3) {
    d.set(out[i] - c.x, out[i + 1] - c.y, out[i + 2] - c.z); const al = d.dot(axis); if (Math.abs(al) > len) continue;
    const ex = d.x - axis.x * al, ey = d.y - axis.y * al, ez = d.z - axis.z * al; const r = Math.hypot(ex, ey, ez); if (r > maxR) continue;
    const k = 1 - amount * Math.exp(-((al / (len * 0.55)) ** 2)) * (1 - smooth((r - maxR * 0.7) / (maxR * 0.3)));
    out[i] = c.x + axis.x * al + ex * k; out[i + 1] = c.y + axis.y * al + ey * k; out[i + 2] = c.z + axis.z * al + ez * k;
  }
  return out;
}

/** move part of a mesh (weight 0–1 per vertex) by a vector */
export function shift(pos: P3, by: THREE.Vector3, weight: (x: number, y: number, z: number) => number) {
  const out = pos.slice();
  for (let i = 0; i < out.length; i += 3) { const w = weight(out[i], out[i + 1], out[i + 2]); if (w <= 0) continue; out[i] += by.x * w; out[i + 1] += by.y * w; out[i + 2] += by.z * w; }
  return out;
}

/** thicken a wall shell: every vertex moves along its outward normal (outer surface grows out, inner surface grows in) */
export function thicken(pos: P3, nrm: P3, amount: number) {
  if (amount <= 0) return pos; const out = pos.slice();
  for (let i = 0; i < out.length; i++) out[i] += nrm[i] * amount * (i % 3 === 1 ? 0.6 : 1);
  return out;
}

/** aortic root moves toward the right ventricle so that it straddles the septal crest (ToF) */
export const OVERRIDE = SEPTUM_N.clone().multiplyScalar(0.05).add(v(0, 0.008, 0));
export const overrideWeight = (x: number, y: number, z: number) => (z > 0.1 && y < 5.4 && y > 4.8 ? 1 - smooth((y - 5.0) / 0.35) : 0);

export interface LesionShape { coarct: number; rvot: number; override: number; rvWall: number }
/** how much of each deformation the current physiology asks for (0–1, RV wall in decimetres) */
export function lesionShape(inp: ShuntInput, s: ShuntState): LesionShape {
  const tof = inp.lesion === 'tof';
  return {
    coarct: inp.lesion === 'coarct' ? 0.2 + 0.72 * (inp.coarct ?? 0.6) : 0,
    rvot: tof ? 0.15 + 0.6 * (inp.rvot ?? 0.5) : 0,
    override: tof ? 1 : 0,
    rvWall: Math.min(0.035, Math.max(0, (s.p.rvSys - 32) / 90) * 0.035),
  };
}

/* ------------------------------------------------------------------ flow paths (body frame; r = local lumen radius) */
export interface Way { p: THREE.Vector3; r: number }
const w = (x: number, y: number, z: number, r: number): Way => ({ p: v(x, y, z), r });
const AV = (d: THREE.Vector3) => w(LM.aorticValve.x + d.x, LM.aorticValve.y + d.y, LM.aorticValve.z + d.z, 0.05);
/** Measured vessel centrelines (body frame; r = lumen radius) for drawing pathology inside the real vessels:
 *  ascending aorta + arch, descending thoracic aorta, pulmonary trunk (from the valve), right and left pulmonary arteries. */
export function vesselCentrelines() {
  const f = flowPaths({ coarct: 0, rvot: 0, override: 0, rvWall: 0 });
  const ao = f.pvR.slice(-19); const pa = f.svc.slice(-13, -5); const rpa = f.svc.slice(-5); const lpa = f.ivc.slice(-7);
  return { asc: ao.slice(0, 10), desc: ao.slice(10), trunk: pa.slice(3), rpa, lpa };
}
export function flowPaths(shape: LesionShape) {
  const o = OVERRIDE.clone().multiplyScalar(shape.override);
  // centrelines traced through the vessel meshes (slice centroids); r ≈ lumen radius
  const ASC = [AV(o), w(-0.004 + o.x * 0.8, 5.061, 0.274 + o.z * 0.8, 0.065), w(-0.026 + o.x * 0.5, 5.141, 0.286 + o.z * 0.5, 0.07), w(-0.052, 5.22, 0.284, 0.07), w(-0.047, 5.342, 0.273, 0.07), w(-0.017, 5.456, 0.247, 0.065),
    w(0.052, 5.534, 0.181, 0.065), w(0.084, 5.579, 0.147, 0.065), w(0.127, 5.567, 0.074, 0.06), w(0.151, 5.557, 0.011, 0.06)];
  const nar = 1 - shape.coarct;
  const DESC = [w(0.159, 5.519, -0.048, 0.055), w(LM.isthmus.x, LM.isthmus.y, LM.isthmus.z, 0.055 * nar + 0.004), w(0.159, 5.451, -0.148, 0.055), w(0.15, 5.404, -0.187, 0.055), w(0.12, 5.302, -0.248, 0.05), w(0.111, 5.124, -0.298, 0.05), w(0.115, 4.943, -0.307, 0.048), w(0.133, 4.702, -0.313, 0.048), w(0.145, 4.3, -0.3, 0.048)];
  const RV_OUT = [w(0.22, 4.52, 0.62, 0.1), w(0.38, 4.42, 0.7, 0.05), w(0.24, 4.85, 0.53, 0.07 * (1 - shape.rvot * 0.8)), w(LM.pulmValve.x, LM.pulmValve.y, LM.pulmValve.z, 0.05 * (1 - shape.rvot * 0.7)),
    w(0.165, 5.182, 0.357, 0.07), w(0.155, 5.249, 0.296, 0.07), w(0.144, 5.304, 0.229, 0.07), w(0.17, 5.335, 0.16, 0.06)];
  const RPA = [w(0.092, 5.27, 0.143, 0.06), w(0.007, 5.251, 0.111, 0.06), w(-0.065, 5.242, 0.077, 0.055), w(-0.141, 5.229, 0.053, 0.05), w(-0.2, 5.21, 0.03, 0.04)];
  const LPA = [w(0.218, 5.328, 0.084, 0.06), w(0.274, 5.326, 0.023, 0.055), w(0.34, 5.325, -0.024, 0.055), w(0.401, 5.306, -0.075, 0.055), w(0.45, 5.271, -0.135, 0.05), w(0.484, 5.208, -0.181, 0.05), w(0.484, 5.131, -0.214, 0.04)];
  const LV_OUT = [w(0.245, 4.741, 0.152, 0.08), w(0.45, 4.6, 0.42, 0.1), w(0.62, 4.45, 0.68, 0.05), w(0.25, 4.8, 0.36, 0.06)];
  const RA = w(-0.2, 4.78, 0.33, 0.12), LA = w(0.1, 4.95, 0.03, 0.1);
  const TRI = w(LM.tricuspid.x, LM.tricuspid.y, LM.tricuspid.z, 0.09);
  const vsd = LM.vsdPerimembranous; const n = SEPTUM_N;
  const VL = (c: THREE.Vector3, k: number, r = 0.03): Way => ({ p: c.clone().addScaledVector(n, k), r });
  const f = LM.fossa; const a = ATRIAL_N; const FA = (k: number, r = 0.025): Way => ({ p: f.clone().addScaledVector(a, k), r });
  const SVC = [w(-0.237, 5.581, 0.235, 0.055), w(-0.263, 5.409, 0.189, 0.075), w(-0.279, 5.242, 0.198, 0.075), w(-0.28, 5.082, 0.196, 0.06), w(-0.26, 4.95, 0.26, 0.08), RA];
  const IVC = [w(-0.235, 4.213, -0.068, 0.07), w(-0.265, 4.326, -0.036, 0.07), w(-0.303, 4.432, 0.01, 0.055), w(-0.288, 4.519, 0.099, 0.06), RA];
  const PVR = [w(-0.38, 4.907, 0.016, 0.035), w(-0.127, 4.871, -0.117, 0.04), LA];
  const PVL = [w(0.47, 5.2, 0.062, 0.035), w(0.208, 4.947, -0.142, 0.04), LA];
  const AO = [...ASC, ...DESC];
  return {
    svc: [...SVC, TRI, ...RV_OUT, ...RPA], ivc: [...IVC, TRI, ...RV_OUT, ...LPA],
    pvR: [...PVR, ...LV_OUT, ...AO], pvL: [...PVL, ...LV_OUT, ...AO],
    vsdLR: [w(0.45, 4.6, 0.42, 0.08), VL(vsd, -0.12), VL(vsd, 0, 0.02), VL(vsd, 0.13), ...RV_OUT.slice(2), ...LPA],
    vsdRL: [w(0.22, 4.52, 0.62, 0.08), VL(vsd, 0.13), VL(vsd, 0, 0.02), VL(vsd, -0.12), w(0.25, 4.8, 0.36, 0.05), ...AO],
    tofRvAo: [w(0.22, 4.52, 0.62, 0.08), VL(vsd, 0.13), VL(vsd, 0.02, 0.03), ...AO],
    asdLR: [LA, FA(0.1), FA(0, 0.02), FA(-0.12), RA, TRI, ...RV_OUT, ...RPA],
    asdRL: [RA, FA(-0.12), FA(0, 0.02), FA(0.1), LA, ...LV_OUT, ...AO],
    pfoRL: [RA, FA(-0.12), FA(0, 0.008), FA(0.1), LA, ...LV_OUT, ...AO],
    pdaLR: [...ASC.slice(7), DESC[0], DESC[2], w(LM.pdaAorta.x, LM.pdaAorta.y, LM.pdaAorta.z, 0.012), w(LM.pdaPa.x, LM.pdaPa.y, LM.pdaPa.z, 0.012), ...LPA.slice(2)],
    pdaRL: [...RV_OUT.slice(4), LPA[0], LPA[1], w(LM.pdaPa.x, LM.pdaPa.y, LM.pdaPa.z, 0.012), w(LM.pdaAorta.x, LM.pdaAorta.y, LM.pdaAorta.z, 0.012), ...DESC.slice(3)],
  };
}
export type FlowPathId = keyof ReturnType<typeof flowPaths>;
