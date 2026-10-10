/**
 * Pericardium from the HuBMAP / Visible Human Male heart (CC BY 4.0), in the body frame shared by body.glb, lines.glb
 * and skeleton.glb (decimetres, centred on the VHM skin; +X patient left, +Y up, +Z anterior).
 *
 * The sac is grown from the real epicardial surface: the four chambers, the coronary vessels that run in the
 * epicardial fat, and the great vessels up to the pericardial reflections — ascending aorta to just below the
 * brachiocephalic trunk, pulmonary trunk to its bifurcation, the lower SVC, and short stumps of the IVC and the four
 * pulmonary veins. The union is voxelised, offset ~3 mm (serous pericardium + a normal film of fluid), then closed with
 * a ~9 mm morphological closing so the fibrous sac bridges the grooves the way the real one does, and iso-surfaced.
 *
 * Per vertex `_EFF` (0–1) is how freely an effusion can push the sac outward there: 0 at the reflections (the sac is
 * tethered to the great vessels), rising to 1 over the free wall, weighted toward the dependent (posterior/inferior,
 * supine) surface where fluid collects first. The mapping stores ∫EFF·dA so the app converts an effusion volume to a
 * physically consistent sac displacement:  thickness_dm = (mL / 1000) / effArea_dm2.
 *
 *   npm run asset:pericardium        (source: assets/source/VH_M_United.glb, HuBMAP v1.1)
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { ROOT, log, readGLB, simplify, writeGLB, mergeGeos, MeshoptSimplifier, type OutPart, V3 } from './common';
import { makeGrid, rasterSolid, marchingCubes, taubin, idx, type Grid } from './voxel';
await MeshoptSimplifier.ready;

const body = await readGLB('assets/source/VH_M_United.glb');
const pick = (re: RegExp) => [...body.entries()].filter(([n]) => re.test(n)).map(([, g]) => g);
const skinSrc = pick(/VH_M_skin$/)[0]; skinSrc.computeBoundingBox();
const C = skinSrc.boundingBox!.getCenter(new V3()); const S = 10;
const M = new THREE.Matrix4().makeScale(S, S, S).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const tf = (g: THREE.BufferGeometry) => { const h = g.clone(); h.applyMatrix4(M); h.computeVertexNormals(); h.computeBoundingBox(); return h; };
const T = (re: RegExp) => { const gs = pick(re).map(tf); if (!gs.length) throw new Error('missing ' + re); return gs.length > 1 ? mergeGeos(gs) : gs[0]; };

const chambers = T(/VH_M_(heart_left_ventricle|heart_right_ventricle|left_cardiac_atrium|right_cardiac_atrium|interventricular_septum)$/);
const coronaries = T(/VH_M_(left_anterior_descending_artery|right_marginal_artery|right_posterior_descending_artery|diagonal_branch_of_anterior_descending_branch_of_left_coronary_artery|left_coronary_artery|right_coronary_artery|diagonal_branch_of_left_anterior_descending_artery|left_marginal_branch|great_cardiac_vein|middle_cardiac_vein|anterior_cardiac_vein|coronary_sinus|posterior_vein_of_left_ventricle|small_cardiac_vein)$/);
const ascAorta = T(/VH_M_ascending_aorta$/);
const pulmTrunk = T(/VH_M_pulmonary_trunk$/);
const svc = T(/VH_M_superior_vena_cava$/);
const ivc = T(/VH_M_inferior_vena_cava_(a|b)$/);
const pvs = T(/VH_M_pulmonary_vein_(R|L)_(inf|sup)$/);
const brachio = T(/VH_M_brachiocephalic_artery_a$/);

const bbox = (g: THREE.BufferGeometry) => { g.computeBoundingBox(); return g.boundingBox!.clone(); };
const hb = bbox(chambers); const hc = hb.getCenter(new V3());

/** keep the triangles of g whose centroid passes `keep` */
function clip(g: THREE.BufferGeometry, keep: (c: THREE.Vector3) => boolean) {
  const p = g.attributes.position; const ix = g.index!.array; const out: number[] = []; const a = new V3(), b = new V3(), c = new V3();
  for (let t = 0; t < ix.length; t += 3) { a.fromBufferAttribute(p, ix[t]); b.fromBufferAttribute(p, ix[t + 1]); c.fromBufferAttribute(p, ix[t + 2]); if (keep(a.add(b).add(c).divideScalar(3))) out.push(ix[t], ix[t + 1], ix[t + 2]); }
  const r = g.clone(); r.setIndex(out); return r;
}
/* reflection levels, measured from the meshes */
const brachioBase = bbox(brachio).min.y;                       // aortic reflection just below the brachiocephalic trunk
const yAorta = brachioBase - 0.08;
const yPulm = bbox(pulmTrunk).max.y;                           // the trunk ends at the bifurcation, inside the sac
const raTop = bbox(T(/VH_M_right_cardiac_atrium$/)).max.y;
const ySvc = raTop + 0.22;                                     // ~2 cm of SVC lies within the sac
const la = T(/VH_M_left_cardiac_atrium$/); const laBvh = new MeshBVH(la); const ra = T(/VH_M_right_cardiac_atrium$/); const raBvh = new MeshBVH(ra);
const near = (b: MeshBVH, r: number) => { const t = { point: new V3(), distance: 0 } as any; return (c: THREE.Vector3) => { b.closestPointToPoint(c, t); return t.distance < r; }; };
const pieces = [
  chambers, coronaries,
  clip(ascAorta, (c) => c.y < yAorta),
  clip(pulmTrunk, (c) => c.y <= yPulm),
  clip(svc, (c) => c.y < ySvc),
  clip(ivc, near(raBvh, 0.12)),
  clip(pvs, near(laBvh, 0.1)),
];
log('reflections (dm): aorta', yAorta.toFixed(2), 'pulmonary', yPulm.toFixed(2), 'SVC', ySvc.toFixed(2));

/* voxelise → offset (dilate) → close → iso-surface */
const H = 0.01; // 1 mm voxels
const all = new THREE.Box3(); pieces.forEach((g) => all.union(bbox(g)));
const grid = makeGrid(all, H, 16);
rasterSolid(grid, pieces, 1.3);
const N = grid.nx * grid.ny * grid.nz;
function morph(g: Grid, r: number, dilate: boolean) {
  // separable square-ball pass approximates a ball well enough at these radii; repeated for r voxels
  const f = g.f; let cur = new Uint8Array(N); for (let i = 0; i < N; i++) cur[i] = f[i] > 0.5 ? 1 : 0;
  for (let step = 0; step < r; step++) {
    const nx = new Uint8Array(cur);
    for (let k = 1; k < g.nz - 1; k++) for (let j = 1; j < g.ny - 1; j++) for (let i = 1; i < g.nx - 1; i++) {
      const o = idx(g, i, j, k); const v = cur[o];
      if (dilate ? v : !v) continue;
      const nb = cur[o - 1] | (cur[o + 1] << 1) | (cur[o - g.nx] << 2) | (cur[o + g.nx] << 3) | (cur[o - g.nx * g.ny] << 4) | (cur[o + g.nx * g.ny] << 5);
      if (dilate ? nb !== 0 : nb !== 63) nx[o] = dilate ? 1 : 0;
    }
    cur = nx;
  }
  for (let i = 0; i < N; i++) f[i] = cur[i];
}
morph(grid, 3, true);              // serous layer + normal fluid film ≈ 3 mm
morph(grid, 9, true); morph(grid, 9, false); // closing: the fibrous sac bridges the AV and interventricular grooves
let geo = marchingCubes(grid, 0.5); taubin(geo, 10); geo = simplify(geo, Math.min(1, 14000 / (geo.index!.count / 3)), 0.002); taubin(geo, 2); geo.computeVertexNormals();
log('sac triangles', geo.index!.count / 3);

/* outward orientation (marching cubes winding is grid-dependent) */
{ const p = geo.attributes.position, n = geo.attributes.normal; let s = 0; const c = bbox(geo).getCenter(new V3()); for (let i = 0; i < p.count; i++) s += new V3().fromBufferAttribute(n, i).dot(new V3().fromBufferAttribute(p, i).sub(c)); if (s < 0) { const ix = geo.index!.array as any; for (let t = 0; t < ix.length; t += 3) { const k = ix[t + 1]; ix[t + 1] = ix[t + 2]; ix[t + 2] = k; } geo.computeVertexNormals(); } }

/* effusion freedom: 0 within ~1.5 cm of the reflections, 1 on the free wall; dependent surface (posterior/inferior when
   supine) a little freer */
const tether = [clip(ascAorta, (c) => Math.abs(c.y - yAorta) < 0.06), clip(pulmTrunk, (c) => c.y > yPulm - 0.08), clip(svc, (c) => Math.abs(c.y - ySvc) < 0.06), clip(ivc, near(raBvh, 0.14)), clip(pvs, near(laBvh, 0.12))]
  .filter((g) => g.index!.count > 0).map((g) => new MeshBVH(g));
const P = geo.attributes.position; const Nn = geo.attributes.normal; const eff = new Float32Array(P.count); const tq = { point: new V3(), distance: 0 } as any; const v = new V3(); const nv = new V3();
const smooth01 = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
for (let i = 0; i < P.count; i++) {
  v.fromBufferAttribute(P, i); nv.fromBufferAttribute(Nn, i);
  let d = Infinity; for (const b of tether) { b.closestPointToPoint(v, tq); d = Math.min(d, tq.distance); }
  const free = smooth01((d - 0.05) / 0.15);
  const dependent = 0.75 + 0.25 * Math.max(0, -nv.z) + 0.1 * Math.max(0, -nv.y); // supine: posterior (−Z) first
  eff[i] = Math.min(1, free * dependent);
}
geo.setAttribute('_eff', new THREE.BufferAttribute(eff, 1));

/* ∫EFF dA, and volumes for the mapping */
let effArea = 0, area = 0;
{ const ix = geo.index!.array; const a = new V3(), b = new V3(), c = new V3();
  for (let t = 0; t < ix.length; t += 3) { a.fromBufferAttribute(P, ix[t]); b.fromBufferAttribute(P, ix[t + 1]); c.fromBufferAttribute(P, ix[t + 2]); const A = b.clone().sub(a).cross(c.clone().sub(a)).length() / 2; area += A; effArea += A * (eff[ix[t]] + eff[ix[t + 1]] + eff[ix[t + 2]]) / 3; } }
const vol = (g: THREE.BufferGeometry) => { const p = g.attributes.position, ix = g.index!.array; let s = 0; const a = new V3(), b = new V3(), c = new V3(); for (let t = 0; t < ix.length; t += 3) { a.fromBufferAttribute(p, ix[t]); b.fromBufferAttribute(p, ix[t + 1]); c.fromBufferAttribute(p, ix[t + 2]); s += a.dot(b.clone().cross(c)) / 6; } return Math.abs(s); };
const sacMl = vol(geo) * 1000;
log('sac area', (area * 100).toFixed(0), 'cm², ∫EFF dA', (effArea * 100).toFixed(0), 'cm², enclosed volume', sacMl.toFixed(0), 'mL');

/* subxiphoid approach landmark: the point on the sac's inferior surface met by a line from below the xiphoid toward
   the left shoulder (classic pericardiocentesis track); measured here so the app does not guess it */
const sacBvh = new MeshBVH(geo); const ray = new THREE.Ray(); const skin = tf(skinSrc); const skinBvh = new MeshBVH(skin);
const heartLow = hb.min.y; const xiphoidGuess = new V3(0.0, heartLow - 0.25, hb.max.z + 0.6);
ray.set(new V3(0, heartLow - 0.25, hb.max.z + 3), new V3(0, 0, -1)); const sk = skinBvh.raycastFirst(ray, THREE.DoubleSide);
const entry = sk ? sk.point.clone() : xiphoidGuess;
const dir = new V3(0.35, 0.55, -0.75).normalize(); // toward the left shoulder, ~30–45° to the skin
ray.set(entry, dir); const hit = sacBvh.raycastFirst(ray, THREE.DoubleSide);

const parts: OutPart[] = [{ id: 'pericardium', role: 'pericardium', geo, extras: { label: 'Pericardium' } }];
await writeGLB('public/models/pericardium.glb', parts, { pericardium: { color: [0.86, 0.8, 0.72], rough: 0.4 }, default: { color: [0.86, 0.8, 0.72], rough: 0.4 } });
const r3 = (p: THREE.Vector3) => p.toArray().map((x) => +x.toFixed(3));
fs.writeFileSync(path.join(ROOT, 'public/models/pericardium.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior',
  sac: { centre: r3(bbox(geo).getCenter(new V3())), areaDm2: +area.toFixed(4), effAreaDm2: +effArea.toFixed(4), enclosedMl: Math.round(sacMl) },
  reflections: { aortaY: +yAorta.toFixed(3), pulmonaryTrunkTopY: +yPulm.toFixed(3), svcY: +ySvc.toFixed(3) },
  subxiphoid: { skinEntry: r3(entry), direction: r3(dir), sacContact: hit ? r3(hit.point) : null, depthDm: hit ? +hit.distance.toFixed(3) : null },
  effusion: 'sac displacement (dm) = (effusion mL / 1000) / effAreaDm2, applied along the normal × _EFF',
  attribution: { title: '3D Reference Organs: Visible Human Male (heart, coronary and great vessels)', creators: 'HuBMAP / Human Reference Atlas consortium', data: 'Visible Human Male, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Pericardial sac derived from the epicardial surface: voxel union of chambers, coronary vessels and great-vessel roots to the reflections, offset ~3 mm, morphologically closed, iso-surfaced and simplified.' },
}, null, 1));
log('subxiphoid depth to sac', hit ? (hit.distance * 100).toFixed(0) + ' mm' : 'no hit');
