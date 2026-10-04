/**
 * Cerebral vascular anatomy, laid out relative to the brain mesh in body.glb (HuBMAP VHM, CC BY 4.0).
 * The source anatomy has no cerebral vessels, so they are drawn here from a normalized brain frame:
 * local coordinates are fractions of the brain's half-extents (x: patient's left +, y: superior +,
 * z: anterior +). The layout follows standard neurovascular anatomy (carotid siphon, Circle of Willis,
 * M1 → superior/inferior M2 divisions, pericallosal ACA, P1/P2 PCA, vertebrobasilar system) but is
 * schematic: calibres are drawn ×1.6 so the circle stays visible.
 */
import * as THREE from 'three';

export interface BrainFrame { c: THREE.Vector3; h: THREE.Vector3 }
/** Brain centre and half-extents in body decimetres (measured from body.glb; used when the mesh is not at hand). */
export const DEFAULT_BRAIN_FRAME: BrainFrame = { c: new THREE.Vector3(0, 8.29, -0.02), h: new THREE.Vector3(0.734, 0.766, 0.875) };
export function brainFrameFromMesh(mesh: THREE.Mesh): BrainFrame {
  // body.glb geometry is already baked into body space (asset/gltf.ts) — read the geometry box, not the node transform
  const g = mesh.geometry; g.computeBoundingBox(); const b = g.boundingBox!;
  return { c: b.getCenter(new THREE.Vector3()), h: b.getSize(new THREE.Vector3()).multiplyScalar(0.5) };
}
export const toBody = (f: BrainFrame, l: THREE.Vector3 | [number, number, number], out = new THREE.Vector3()) => {
  const v = Array.isArray(l) ? out.set(l[0], l[1], l[2]) : out.copy(l); return v.multiply(f.h).add(f.c);
};
export const toLocal = (f: BrainFrame, p: THREE.Vector3, out = new THREE.Vector3()) => out.copy(p).sub(f.c).divide(f.h);

export type Side = 'R' | 'L' | 'M';
export type TerritoryId = 'MCA_R' | 'MCA_L' | 'ACA_R' | 'ACA_L' | 'PCA_R' | 'PCA_L' | 'VB';
export const TERRITORIES: TerritoryId[] = ['MCA_R', 'MCA_L', 'ACA_R', 'ACA_L', 'PCA_R', 'PCA_L', 'VB'];
/** approximate adult territory volumes, mL (teaching values) */
export const TERRITORY_ML: Record<TerritoryId, number> = { MCA_R: 280, MCA_L: 280, ACA_R: 90, ACA_L: 90, PCA_R: 80, PCA_L: 80, VB: 150 };
export const TERRITORY_NAME: Record<TerritoryId, string> = { MCA_R: 'Right MCA', MCA_L: 'Left MCA', ACA_R: 'Right ACA', ACA_L: 'Left ACA', PCA_R: 'Right PCA', PCA_L: 'Left PCA', VB: 'Brainstem / cerebellum' };
/** deepest (least collateralised) point of each territory in local coordinates — tissue far from it is fed first by collaterals */
export const TERRITORY_CORE: Record<TerritoryId, [number, number, number]> = {
  MCA_R: [-0.5, -0.3, 0.05], MCA_L: [0.5, -0.3, 0.05], ACA_R: [-0.1, 0.15, 0.45], ACA_L: [0.1, 0.15, 0.45],
  PCA_R: [-0.25, -0.35, -0.72], PCA_L: [0.25, -0.35, -0.72], VB: [0, -0.8, -0.45],
};

/** Which arterial territory a point (local coordinates) belongs to — mirrored in the scene shader. */
export function territoryAt(l: THREE.Vector3): TerritoryId {
  const s = l.x < 0 ? '_R' : '_L'; const ax = Math.abs(l.x);
  if (l.y < -0.55 && l.z < -0.2 && ax < 0.72) return 'VB';
  if ((l.z < -0.6 && (l.y < 0.3 || ax < 0.45)) || (l.y < -0.32 && l.z < -0.12 && ax > 0.18)) return ('PCA' + s) as TerritoryId;
  if (l.z > -0.55 && l.y > -0.35 && (ax < 0.3 || (l.y > 0.55 && ax < 0.5))) return ('ACA' + s) as TerritoryId;
  return ('MCA' + s) as TerritoryId;
}
/** distance (local units) from each territory's deepest point to its watershed border */
export const TERRITORY_RADIUS: Record<TerritoryId, number> = { MCA_R: 1.1, MCA_L: 1.1, ACA_R: 0.85, ACA_L: 0.85, PCA_R: 0.75, PCA_L: 0.75, VB: 0.6 };
/** 0 at the territory's deepest point, 1 at its collateral-fed border zone */
export function peripheryAt(t: TerritoryId, l: THREE.Vector3) {
  const c = TERRITORY_CORE[t]; return Math.min(1, Math.hypot(l.x - c[0], l.y - c[1], l.z - c[2]) / TERRITORY_RADIUS[t]);
}

export interface CerebralVessel {
  id: string; name: string; side: Side; parent: string | null;
  /** body-space points (dm) */ pts: THREE.Vector3[]; r0: number; r1: number;
  /** territory this vessel feeds (for colouring downstream flow) */ territory?: TerritoryId;
  kind: 'neck' | 'circle' | 'trunk' | 'cortical';
}
const K = 1.6; // calibre exaggeration
const r = (mm: number) => (mm / 2 / 100) * K; // diameter mm → radius dm

/** Build the arterial tree. Right side is patient's right (−x). */
export function buildCerebralVessels(f: BrainFrame = DEFAULT_BRAIN_FRAME): CerebralVessel[] {
  const out: CerebralVessel[] = [];
  const L = (x: number, y: number, z: number) => toBody(f, [x, y, z]);
  const add = (v: CerebralVessel) => { out.push(v); return v; };
  const onCortex = (x: number, y: number, z: number, rad = 0.93) => { const d = new THREE.Vector3(x, y, z).normalize().multiplyScalar(rad); return L(d.x, d.y, d.z); };
  const neckY = (y: number) => (y - f.c.y) / f.h.y; // body y → local y

  // posterior circulation (midline)
  const VBJ = L(0, -0.93, -0.1), BTIP = L(0, -0.66, -0.04);
  add({ id: 'basilar', name: 'Basilar artery', side: 'M', parent: null, pts: [VBJ, L(0, -0.85, -0.06), L(0, -0.75, -0.04), BTIP], r0: r(3.2), r1: r(3.0), kind: 'trunk', territory: 'VB' });

  for (const S of ['R', 'L'] as const) {
    const s = S === 'R' ? -1 : 1; const T = L(s * 0.2, -0.6, 0.18); const J = L(s * 0.15, -0.63, -0.06);
    // internal carotid: cervical → petrous → cavernous siphon → terminus
    add({ id: `ica_${S}`, name: `${S === 'R' ? 'Right' : 'Left'} internal carotid`, side: S, parent: null,
      pts: [L((s * 0.35) / f.h.x, neckY(7.05), 0.2), L((s * 0.37) / f.h.x, neckY(7.45), 0.05), L(s * 0.42, -1.05, 0.02), L(s * 0.3, -0.9, 0.12), L(s * 0.25, -0.76, 0.3), L(s * 0.21, -0.66, 0.26), T], r0: r(5), r1: r(4), kind: 'neck' });
    // vertebral
    add({ id: `vert_${S}`, name: `${S === 'R' ? 'Right' : 'Left'} vertebral`, side: S, parent: null,
      pts: [L((s * 0.24) / f.h.x, neckY(6.55), -0.08), L((s * 0.2) / f.h.x, neckY(7.1), -0.14), L(s * 0.22, -1.12, -0.3), L(s * 0.12, -1.0, -0.2), VBJ], r0: r(3.4), r1: r(3.0), kind: 'neck', territory: 'VB' });
    // Circle of Willis
    const AC = L(s * 0.05, -0.54, 0.33);
    add({ id: `a1_${S}`, name: `${S} A1 (ACA)`, side: S, parent: `ica_${S}`, pts: [T, L(s * 0.13, -0.57, 0.27), AC], r0: r(2.2), r1: r(2.0), kind: 'circle', territory: `ACA_${S}` });
    add({ id: `pcom_${S}`, name: `${S} posterior communicating`, side: S, parent: `ica_${S}`, pts: [T, L(s * 0.19, -0.62, 0.06), J], r0: r(1.3), r1: r(1.3), kind: 'circle' });
    add({ id: `p1_${S}`, name: `${S} P1 (PCA)`, side: S, parent: 'basilar', pts: [BTIP, L(s * 0.08, -0.65, -0.05), J], r0: r(2.2), r1: r(2.1), kind: 'circle', territory: `PCA_${S}` });
    // MCA
    const MB = L(s * 0.6, -0.5, 0.14);
    add({ id: `m1_${S}`, name: `${S} M1 (MCA)`, side: S, parent: `ica_${S}`, pts: [T, L(s * 0.36, -0.59, 0.2), L(s * 0.5, -0.55, 0.18), MB], r0: r(3.0), r1: r(2.8), kind: 'trunk', territory: `MCA_${S}` });
    const m2s = add({ id: `m2s_${S}`, name: `${S} M2 superior`, side: S, parent: `m1_${S}`, pts: [MB, L(s * 0.74, -0.34, 0.22), L(s * 0.84, -0.08, 0.2)], r0: r(2.1), r1: r(1.8), kind: 'trunk', territory: `MCA_${S}` });
    const m2i = add({ id: `m2i_${S}`, name: `${S} M2 inferior`, side: S, parent: `m1_${S}`, pts: [MB, L(s * 0.78, -0.48, 0.02), L(s * 0.86, -0.36, -0.22)], r0: r(2.0), r1: r(1.7), kind: 'trunk', territory: `MCA_${S}` });
    [[0.62, 0.52, 0.55], [0.78, 0.5, 0.05], [0.7, 0.55, -0.3]].forEach((d, i) => add({ id: `m4s${i}_${S}`, name: 'MCA cortical branch', side: S, parent: m2s.id, pts: [m2s.pts[2], onCortex(s * 0.92, (d[1] + (-0.08)) / 2, (d[2] + 0.2) / 2, 0.9), onCortex(s * d[0], d[1], d[2])], r0: r(1.2), r1: r(0.7), kind: 'cortical', territory: `MCA_${S}` }));
    [[0.85, -0.2, -0.5], [0.8, -0.45, 0.4], [0.82, 0.1, -0.62]].forEach((d, i) => add({ id: `m4i${i}_${S}`, name: 'MCA cortical branch', side: S, parent: m2i.id, pts: [m2i.pts[2], onCortex(s * 0.95, (d[1] - 0.36) / 2, (d[2] - 0.22) / 2, 0.9), onCortex(s * d[0], d[1], d[2])], r0: r(1.2), r1: r(0.7), kind: 'cortical', territory: `MCA_${S}` }));
    // ACA: A2 → pericallosal around the genu, on the medial surface
    const x = s * 0.05;
    add({ id: `a2_${S}`, name: `${S} A2 / pericallosal`, side: S, parent: `a1_${S}`, pts: [AC, L(x, -0.42, 0.42), L(x, -0.12, 0.66), L(x, 0.28, 0.6), L(x, 0.55, 0.22), L(x, 0.62, -0.2), L(x, 0.5, -0.5)], r0: r(2.0), r1: r(1.2), kind: 'trunk', territory: `ACA_${S}` });
    add({ id: `cm_${S}`, name: 'Callosomarginal branch', side: S, parent: `a2_${S}`, pts: [L(x, -0.12, 0.66), L(s * 0.1, 0.35, 0.78), L(s * 0.14, 0.78, 0.35), L(s * 0.16, 0.88, -0.05)], r0: r(1.3), r1: r(0.8), kind: 'cortical', territory: `ACA_${S}` });
    // PCA: P2 around the midbrain to the occipital lobe
    add({ id: `p2_${S}`, name: `${S} P2 (PCA)`, side: S, parent: `p1_${S}`, pts: [J, L(s * 0.3, -0.6, -0.25), L(s * 0.34, -0.5, -0.55), L(s * 0.2, -0.3, -0.85)], r0: r(2.0), r1: r(1.4), kind: 'trunk', territory: `PCA_${S}` });
    add({ id: `pcx_${S}`, name: 'PCA temporal branch', side: S, parent: `p2_${S}`, pts: [L(s * 0.3, -0.6, -0.25), L(s * 0.55, -0.62, -0.3), onCortex(s * 0.75, -0.6, -0.45, 0.9)], r0: r(1.2), r1: r(0.7), kind: 'cortical', territory: `PCA_${S}` });
    // cerebellar
    add({ id: `sca_${S}`, name: `${S} superior cerebellar`, side: S, parent: 'basilar', pts: [L(0, -0.7, -0.04), L(s * 0.2, -0.72, -0.2), L(s * 0.35, -0.72, -0.45)], r0: r(1.4), r1: r(0.9), kind: 'cortical', territory: 'VB' });
    add({ id: `pica_${S}`, name: `${S} PICA`, side: S, parent: `vert_${S}`, pts: [L(s * 0.14, -1.03, -0.22), L(s * 0.2, -0.95, -0.42), L(s * 0.28, -0.78, -0.55)], r0: r(1.3), r1: r(0.8), kind: 'cortical', territory: 'VB' });
  }
  add({ id: 'acom', name: 'Anterior communicating', side: 'M', parent: null, pts: [L(-0.05, -0.54, 0.33), L(0, -0.535, 0.34), L(0.05, -0.54, 0.33)], r0: r(1.5), r1: r(1.5), kind: 'circle' });
  return out;
}

/** Point along a vessel (0–1) in body space. */
export function vesselPoint(v: CerebralVessel, t: number, out = new THREE.Vector3()) {
  return out.copy(new THREE.CatmullRomCurve3(v.pts, false, 'centripetal').getPointAt(Math.max(0, Math.min(1, t))));
}
