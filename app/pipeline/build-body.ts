/**
 * Whole-body map for the Labs module, from the HuBMAP Visible Human Male reference body (CC BY 4.0).
 * Organs that come as many sub-surfaces (brain regions, spleen surfaces, lung segments, bladder parts)
 * are fused into one solid with the same voxel/marching-cubes route as the lung lobes.
 * Frame: decimetres, centred on the body; +X patient left, +Y up, +Z anterior.
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, log, readGLB, simplify, writeGLB, mergeGeos, MeshoptSimplifier, type OutPart, V3 } from './common';
import { makeGrid, rasterSolid, blur, marchingCubes, taubin } from './voxel';
await MeshoptSimplifier.ready;

const body = await readGLB('assets/source/VH_M_United.glb');
const lung = await readGLB('assets/source/3d-vh-m-lung.glb');
const airwaySrc = [...(await readGLB('assets/source/3d-vh-m-larynx.glb')).values(), ...[...(await readGLB('assets/source/3d-vh-m-trachea.glb')).entries()].filter(([n]) => /trachea$|carina/.test(n)).map(([, g]) => g), ...[...(await readGLB('assets/source/3d-vh-m-main-bronchus.glb')).entries()].filter(([n]) => /main_bronchus$/.test(n)).map(([, g]) => g)];
const pick = (m: Map<string, THREE.BufferGeometry>, re: RegExp) => [...m.entries()].filter(([n]) => re.test(n)).map(([, g]) => g);
const skin = pick(body, /VH_M_skin$/)[0]; skin.computeBoundingBox();
const C = skin.boundingBox!.getCenter(new V3()); const S = 10;
const M = new THREE.Matrix4().makeScale(S, S, S).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const tf = (g: THREE.BufferGeometry) => { const h = g.clone(); h.applyMatrix4(M); h.computeVertexNormals(); h.computeBoundingBox(); return h; };

function fuse(gs: THREE.BufferGeometry[], h: number, ratio: number, blurPasses = 1) {
  const bb = new THREE.Box3(); gs.forEach((g) => { g.computeBoundingBox(); bb.union(g.boundingBox!); });
  const grid = makeGrid(bb, h, 3); rasterSolid(grid, gs, 1.3); blur(grid, blurPasses, 1);
  let geo = marchingCubes(grid, 0.5); taubin(geo, 4); geo = simplify(geo, ratio, 0.001); taubin(geo, 1); return geo;
}
const direct = (gs: THREE.BufferGeometry[], ratio: number) => { const g = gs.length > 1 ? mergeGeos(gs) : gs[0]; return simplify(g, ratio, 0.002); };

const parts: OutPart[] = [];
const add = (id: string, role: string, geo: THREE.BufferGeometry) => { geo.computeVertexNormals(); parts.push({ id, role, geo }); log(id, geo.attributes.position.count); };
add('skin', 'skin', direct([tf(skin)], 0.3));
add('brain', 'brain', fuse(pick(body, /^Allen_/).map(tf), 0.035, 0.35));
add('heart', 'heart', fuse(pick(body, /VH_M_(heart_left_ventricle|heart_right_ventricle|left_cardiac_atrium|right_cardiac_atrium|interventricular_septum)$/).map(tf), 0.03, 0.4));
const segs = [...lung.entries()].filter(([n]) => /bronchopulmonary_segment/.test(n));
add('lung_R', 'lung', fuse(segs.filter(([n]) => /_right_|_R_|right/.test(n)).map(([, g]) => tf(g)), 0.05, 0.3, 2));
add('lung_L', 'lung', fuse(segs.filter(([n]) => !/_right_|_R_|right/.test(n)).map(([, g]) => tf(g)), 0.05, 0.3, 2));
add('airway', 'airway', fuse(airwaySrc.map(tf), 0.012, 0.4));
add('liver', 'liver', direct(pick(body, /VH_M_liver_capsule$/).map(tf), 0.5));
add('gallbladder', 'gallbladder', direct(pick(body, /VH_M_gallbladder$/).map(tf), 0.8));
add('pancreas', 'pancreas', fuse(pick(body, /(head|neck|body)_of_pancreas|tail_of_pancreas|uncinate_process/).map(tf), 0.025, 0.5));
add('spleen', 'spleen', fuse(pick(body, /VH_M_(colic|diaphragmatic|gastric|renal)_surface_of_spleen$|VH_M_hilum_of_spleen$/).map(tf), 0.03, 0.5));
add('kidney_L', 'kidney', direct(pick(body, /VH_M_kidney_capsule_L$/).map(tf), 0.6));
add('kidney_R', 'kidney', direct(pick(body, /VH_M_kidney_capsule_R$/).map(tf), 0.6));
add('bladder', 'bladder', fuse(pick(body, /urinary_bladder|trigone_of_urinary/).map(tf), 0.025, 0.5));
add('colon', 'colon', direct(pick(body, /colon_HuBMAP_(ascending|transverse|descending|sigmoid)_colon$/).map(tf), 0.6));
add('bone_marrow', 'bone', direct(pick(body, /VH_M_(femur_[LR]|ilium_compact_bone_[LR]|sacrum)$/).map(tf), 0.35));
add('aorta', 'artery', direct(pick(body, /VH_M_(ascending_aorta|aortic_arch|descending_aorta_a|descending_aorta_b)$/).map(tf), 0.5));
add('vena_cava', 'vein', direct(pick(body, /VH_M_(superior_vena_cava|inferior_vena_cava_a|inferior_vena_cava_b)$/).map(tf), 0.5));

await writeGLB('public/models/body.glb', parts, { default: { color: [0.8, 0.7, 0.65], rough: 0.5 } });
const centres: Record<string, number[]> = {};
for (const p of parts) { p.geo.computeBoundingBox(); centres[p.id] = p.geo.boundingBox!.getCenter(new V3()).toArray().map((x) => +x.toFixed(3)); }
fs.writeFileSync(path.join(ROOT, 'public/models/body.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior', centres,
  attribution: { title: '3D Reference Organs: Visible Human Male (united body, lung, larynx, trachea, main bronchi)', creators: 'HuBMAP / Human Reference Atlas consortium (brain: Allen Institute regions)', data: 'Visible Human Male, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Multi-part organs fused into single surfaces; meshes simplified; renamed by organ.' },
}, null, 1));
log('done');
