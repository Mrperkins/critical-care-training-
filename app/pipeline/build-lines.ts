/**
 * Invasive-lines asset: heart chambers, valves and the great vessels from the HuBMAP Visible Human
 * Male united body (CC BY 4.0), in the same decimetre body frame as body.glb (so body.glb's skin
 * lines up), plus landmarks measured from the skin surface: the right arm's centreline (for the
 * brachial → radial artery path), the neck and the chest (phlebostatic axis).
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, log, readGLB, simplify, writeGLB, mergeGeos, subdivide, MeshoptSimplifier, type OutPart, V3 } from './common';
import { taubin } from './voxel';
await MeshoptSimplifier.ready;

const body = await readGLB('assets/source/VH_M_United.glb');
const pick = (re: RegExp) => [...body.entries()].filter(([n]) => re.test(n)).map(([, g]) => g);
const skin = pick(/VH_M_skin$/)[0]; skin.computeBoundingBox();
const C = skin.boundingBox!.getCenter(new V3()); const S = 10;
const M = new THREE.Matrix4().makeScale(S, S, S).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const tf = (g: THREE.BufferGeometry) => { const h = g.clone(); h.applyMatrix4(M); h.computeVertexNormals(); h.computeBoundingBox(); return h; };

const parts: OutPart[] = [];
const add = (id: string, role: string, re: RegExp, ratio: number) => {
  const gs = pick(re).map(tf); if (!gs.length) throw new Error('missing ' + id);
  const geo = simplify(gs.length > 1 ? mergeGeos(gs) : gs[0], ratio, 0.002); geo.computeVertexNormals(); parts.push({ id, role, geo }); log(id, geo.attributes.position.count);
};
add('ra', 'atrium', /VH_M_right_cardiac_atrium$/, 0.5);
add('la', 'atrium', /VH_M_left_cardiac_atrium$/, 0.45);
add('rv', 'ventricle', /VH_M_heart_right_ventricle$/, 0.5);
// the source LV is the coarsest chamber (9.3k triangles vs 24–48k for the atria), so it is kept whole, subdivided once
// and Taubin-smoothed (non-shrinking) instead of being halved like the others
add('lv', 'ventricle', /VH_M_heart_left_ventricle$/, 1);
{ const lvp = parts[parts.length - 1]; const g = subdivide(lvp.geo); taubin(g, 4); g.computeVertexNormals(); lvp.geo = g; log('lv (subdivided)', g.attributes.position.count); }
add('septum', 'ventricle', /VH_M_interventricular_septum$/, 0.5);
add('tricuspid', 'valve', /VH_M_tricuspid_valve$/, 0.6);
add('mitral', 'valve', /VH_M_mitral_valve$/, 0.6);
add('aortic_valve', 'valve', /VH_M_aortic_valve$/, 0.6);
add('pulm_valve', 'valve', /VH_M_pulmonary_valve$/, 0.6);
add('aorta', 'artery', /VH_M_(ascending_aorta|aortic_arch|descending_aorta_a|descending_aorta_b)$/, 0.6);
add('arch_branches', 'artery', /VH_M_(brachiocephalic_artery_a|brachiocephalic_artery_b|left_common_carotid_artery_a|left_common_carotid_artery_b|left_subclavian_artery_a|left_subclavian_artery_b)$/, 0.7);
add('pulm_art', 'pulmonary', /VH_M_(pulmonary_trunk|pulmonary_artery_L|pulmonary_artery_R)$/, 0.6);
add('svc', 'vein', /VH_M_superior_vena_cava$/, 0.8);
add('ivc', 'vein', /VH_M_inferior_vena_cava_(a|b)$/, 0.7);
add('brachio_veins', 'vein', /VH_M_brachiocephalic_vein_(L|R)$/, 0.7);
add('coronary_art', 'artery', /VH_M_(left_anterior_descending_artery|right_marginal_artery|right_posterior_descending_artery|diagonal_branch_of_anterior_descending_branch_of_left_coronary_artery|left_coronary_artery|right_coronary_artery|diagonal_branch_of_left_anterior_descending_artery|left_marginal_branch)$/, 0.6);
add('cardiac_veins', 'vein', /VH_M_(great_cardiac_vein|middle_cardiac_vein|anterior_cardiac_vein|coronary_sinus|posterior_vein_of_left_ventricle|small_cardiac_vein)$/, 0.6);
add('pulm_veins', 'pulmvein', /VH_M_pulmonary_vein_(R|L)_(inf|sup)$/, 0.7);
add('abd_arteries', 'artery', /VH_M_(celiac_trunk|splenic_artery|common_hepatic_artery|proper_hepatic_artery|left_hepatic_artery|right_hepatic_artery|superior_mesenteric_artery|inferior_mesenteric_artery|left_renal_artery|right_renal_artery|right_colic_artery|middle_colic_artery|left_colic_artery|ileocolic_artery|sigmoid_artery_a|sigmoid_artery_b|sigmoid_artery_c|marginal_artery_of_Drummond)$/, 0.5);
add('abd_veins', 'vein', /VH_M_(renal_vein_L|renal_vein_R|common_iliac_vein_L|common_iliac_vein_R|external_iliac_vein_L|external_iliac_vein_R|internal_iliac_vein_L|internal_iliac_vein_R|right_hepatic_vein|left_hepatic_vein|middle_hepatic_vein)$/, 0.5);
add('portal', 'portal', /VH_M_(portal_vein|hepatic_portal_vein|splenic_vein|superior_mesenteric_vein|inferior_mesenteric_vein|left_branch_of_portal_vein|right_branch_of_portal_vein|ileocolic_vein|right_colic_vein|left_colic_vein)$/, 0.5);

// ---- landmarks from the skin
const P: THREE.Vector3[] = []; { const a = skin.attributes.position; for (let i = 0; i < a.count; i++) P.push(new V3().fromBufferAttribute(a, i).applyMatrix4(M)); }
const arm: { y: number; c: number[]; xr: number[]; zr: number[] }[] = [];
for (let y = 3.4; y >= -0.8; y -= 0.1) {
  const sl = P.filter((p) => Math.abs(p.y - y) < 0.04 && p.x < -1.6); const xs = sl.map((p) => p.x).sort((a, b) => a - b); if (xs.length < 8) continue;
  let cut = xs[xs.length - 1]; for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > 0.25) { cut = xs[i - 1]; break; }
  const A = sl.filter((p) => p.x <= cut + 1e-6); const c = A.reduce((s, p) => s.add(p), new V3()).divideScalar(A.length);
  arm.push({ y: +y.toFixed(2), c: c.toArray().map((v) => +v.toFixed(3)), xr: [Math.min(...A.map((p) => p.x)), Math.max(...A.map((p) => p.x))].map((v) => +v.toFixed(3)), zr: [Math.min(...A.map((p) => p.z)), Math.max(...A.map((p) => p.z))].map((v) => +v.toFixed(3)) });
}
const leg: { y: number; c: number[]; xr: number[]; zr: number[] }[] = [];
for (let y = -0.8; y >= -9.1; y -= 0.1) {
  const sl = P.filter((p) => Math.abs(p.y - y) < 0.04 && p.x < 0 && p.x > -2.5); if (sl.length < 8) continue;
  const xs = sl.map((p) => p.x).sort((a, b) => b - a); // from the midline outward
  let lo = xs[xs.length - 1], hi = xs[0]; for (let i = 1; i < xs.length; i++) if (xs[i - 1] - xs[i] > 0.25) { lo = xs[i - 1]; break; } // stop at the hand if it is at this level
  const A = sl.filter((p) => p.x >= lo - 1e-6 && p.x <= hi + 1e-6); const c = A.reduce((s, p) => s.add(p), new V3()).divideScalar(A.length);
  leg.push({ y: +y.toFixed(2), c: c.toArray().map((v) => +v.toFixed(3)), xr: [Math.min(...A.map((p) => p.x)), Math.max(...A.map((p) => p.x))].map((v) => +v.toFixed(3)), zr: [Math.min(...A.map((p) => p.z)), Math.max(...A.map((p) => p.z))].map((v) => +v.toFixed(3)) });
}
const neckSl: { y: number; c: number[]; xr: number[]; zr: number[] }[] = [];
for (let y = 5.8; y <= 9.0; y += 0.1) { const A = P.filter((p) => Math.abs(p.y - y) < 0.04 && Math.abs(p.x) < 1.2); if (A.length < 8) continue; const c = A.reduce((s, p) => s.add(p), new V3()).divideScalar(A.length); neckSl.push({ y: +y.toFixed(2), c: c.toArray().map((v) => +v.toFixed(3)), xr: [Math.min(...A.map((p) => p.x)), Math.max(...A.map((p) => p.x))].map((v) => +v.toFixed(3)), zr: [Math.min(...A.map((p) => p.z)), Math.max(...A.map((p) => p.z))].map((v) => +v.toFixed(3)) }); }
const slice = (y: number, f: (p: THREE.Vector3) => boolean) => P.filter((p) => Math.abs(p.y - y) < 0.06 && f(p));
const chest = slice(4.8, (p) => Math.abs(p.x) < 0.4); const chestZ = [Math.min(...chest.map((p) => p.z)), Math.max(...chest.map((p) => p.z))];
const side = slice(4.8, (p) => p.x < 0 && p.x > -2.2 && Math.abs(p.z - (chestZ[0] + chestZ[1]) / 2) < 0.4); const sideX = Math.max(...side.map((p) => p.x).filter((x) => x < -1.2).concat([-1.7])) ;
const neck = slice(6.8, () => true); const neckX = [Math.min(...neck.map((p) => p.x)), Math.max(...neck.map((p) => p.x))]; const neckZ = [Math.min(...neck.map((p) => p.z)), Math.max(...neck.map((p) => p.z))];
const hip = slice(-0.9, (p) => Math.abs(p.x) < 1.5); const hipZ = [Math.min(...hip.map((p) => p.z)), Math.max(...hip.map((p) => p.z))];
const skinBox = new THREE.Box3().setFromPoints(P);

await writeGLB('public/models/lines.glb', parts, { default: { color: [0.8, 0.5, 0.45], rough: 0.5 } });
const centres: Record<string, number[]> = {}; const boxes: Record<string, number[][]> = {};
for (const p of parts) { p.geo.computeBoundingBox(); const b = p.geo.boundingBox!; centres[p.id] = b.getCenter(new V3()).toArray().map((x) => +x.toFixed(3)); boxes[p.id] = [b.min.toArray(), b.max.toArray()].map((v) => v.map((x) => +x.toFixed(3))); }
fs.writeFileSync(path.join(ROOT, 'public/models/lines.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred (same frame as body.glb)', frame: '+X patient left, +Y up, +Z anterior', centres, boxes,
  landmarks: { arm, leg, neck: neckSl, chestZ, sideX, neckX, neckZ, hipZ, skinMin: skinBox.min.toArray(), skinMax: skinBox.max.toArray() },
  attribution: { title: '3D Reference Organs: Visible Human Male (heart, blood vasculature)', creators: 'HuBMAP / Human Reference Atlas consortium', data: 'Visible Human Male, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Chambers, valves and great vessels simplified and renamed; limb and neck vessels drawn from skin landmarks.' },
}, null, 1));
log('done');
