/**
 * Whole-body map for the Visible Human Female (HuBMAP Human Reference Atlas 3D reference organs, CC BY 4.0):
 * the same organ set as body.glb plus the airway (larynx, trachea, main bronchi) and the female pelvic organs
 * (uterus, ovaries, uterine tubes) and the term placenta with amnion and umbilical cord.
 * Frame and units match body.glb: decimetres, centred on the skin box; +X patient left, +Y up, +Z anterior.
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, log, readGLB, simplify, writeGLB, mergeGeos, MeshoptSimplifier, type OutPart, V3 } from './common';
import { makeGrid, rasterSolid, blur, marchingCubes, taubin } from './voxel';
await MeshoptSimplifier.ready;

const src = (f: string) => readGLB(`assets/source/${f}`);
const [skinM, brainM, heartM, lungM, larynxM, tracheaM, bronchusM, liverM, kidLM, kidRM, spleenM, bladderM, vascM, uterusM, ovLM, ovRM, tubeLM, tubeRM, placentaM] = await Promise.all([
  'VH_F_skin.glb', 'Allen_F_Brain.glb', 'VH_F_Heart.glb', '3d-vh-f-lung.glb', '3d-vh-f-larynx.glb', '3d-vh-f-trachea.glb', '3d-vh-f-main-bronchus.glb',
  'VH_F_Liver.glb', 'VH_F_Kidney_L.glb', 'VH_F_Kidney_R.glb', 'VH_F_Spleen.glb', 'VH_F_Urinary_Bladder.glb', 'VH_F_Blood_Vasculature.glb',
  'VH_F_Uterus.glb', 'VH_F_Ovary_L.glb', 'VH_F_Ovary_R.glb', 'VH_F_Fallopian_Tube_L.glb', 'VH_F_Fallopian_Tube_R.glb', 'VH_F_Placenta.glb',
].map(src));
const all = (m: Map<string, THREE.BufferGeometry>) => [...m.values()];
const pick = (m: Map<string, THREE.BufferGeometry>, re: RegExp) => [...m.entries()].filter(([n]) => re.test(n)).map(([, g]) => g);

const skin = all(skinM)[0]; skin.computeBoundingBox();
const C = skin.boundingBox!.getCenter(new V3()); const S = 10;
const M = new THREE.Matrix4().makeScale(S, S, S).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const tf = (g: THREE.BufferGeometry) => { const h = g.clone(); h.applyMatrix4(M); h.computeVertexNormals(); h.computeBoundingBox(); return h; };

function fuse(gs: THREE.BufferGeometry[], h: number, ratio: number, blurPasses = 1) {
  const bb = new THREE.Box3(); gs.forEach((g) => { g.computeBoundingBox(); bb.union(g.boundingBox!); });
  const grid = makeGrid(bb, h, 3); rasterSolid(grid, gs, 1.3); blur(grid, blurPasses, 1);
  let geo = marchingCubes(grid, 0.5); taubin(geo, 4); geo = simplify(geo, ratio, 0.001); taubin(geo, 1); return geo;
}
const direct = (gs: THREE.BufferGeometry[], ratio: number, err = 0.002) => { const g = gs.length > 1 ? mergeGeos(gs) : gs[0]; return simplify(g, ratio, err); };

const parts: OutPart[] = [];
const add = (id: string, role: string, geo: THREE.BufferGeometry) => { geo.computeVertexNormals(); parts.push({ id, role, geo }); log(id, geo.attributes.position.count); };
add('skin', 'skin', direct([tf(skin)], 0.06, 0.004));
add('brain', 'brain', fuse(all(brainM).map(tf), 0.035, 0.35));
add('heart', 'heart', fuse(pick(heartM, /VH_F_(left_ventricle|right_ventricle|left_cardiac_atrium|right_cardiac_atrium|interventricular_septum)$/).map(tf), 0.03, 0.4));
const segs = [...lungM.entries()].filter(([n]) => /bronchopulmonary_segm/.test(n));
add('lung_R', 'lung', fuse(segs.filter(([n]) => /right/.test(n)).map(([, g]) => tf(g)), 0.05, 0.3, 2));
add('lung_L', 'lung', fuse(segs.filter(([n]) => /left|lingula/.test(n)).map(([, g]) => tf(g)), 0.05, 0.3, 2));
add('airway', 'airway', fuse([...all(larynxM), ...pick(tracheaM, /VH_F_trachea$|carina/), ...pick(bronchusM, /main_bronchus$/)].map(tf), 0.012, 0.4));
add('liver', 'liver', direct(pick(liverM, /capsule_of_the_liver$/).map(tf), 0.3));
add('kidney_L', 'kidney', direct(pick(kidLM, /kidney_capsule_L$/).map(tf), 0.4));
add('kidney_R', 'kidney', direct(pick(kidRM, /kidney_capsule_R$/).map(tf), 0.4));
add('spleen', 'spleen', fuse(all(spleenM).map(tf), 0.03, 0.5));
add('bladder', 'bladder', fuse(all(bladderM).map(tf), 0.02, 0.5));
add('aorta', 'artery', direct(pick(vascM, /VH_F_(ascending_aorta|aortic_arch|descending_aorta_a|descending_aorta_b)$/).map(tf), 0.5));
add('vena_cava', 'vein', direct(pick(vascM, /VH_F_(superior_vena_cava|inferior_vena_cava_a|inferior_vena_cava_b)$/).map(tf), 0.5));
add('uterus', 'uterus', fuse(all(uterusM).filter((g) => { g.computeBoundingBox(); return g.boundingBox!.getSize(new V3()).length() > 0.01; }).map(tf), 0.012, 0.5));
add('ovary_L', 'ovary', direct(all(ovLM).map(tf), 0.8));
add('ovary_R', 'ovary', direct(all(ovRM).map(tf), 0.8));
add('tube_L', 'tube', fuse(all(tubeLM).map(tf), 0.008, 0.5));
add('tube_R', 'tube', fuse(all(tubeRM).map(tf), 0.008, 0.5));
add('placenta', 'placenta', fuse(pick(placentaM, /basal_plate|chorionic_plate/).map(tf), 0.04, 0.4));
add('amnion', 'amnion', direct(pick(placentaM, /amnion/).map(tf), 0.15, 0.004));
add('cord', 'cord', fuse(pick(placentaM, /umbilical/).map(tf), 0.012, 0.5));

await writeGLB('public/models/body-f.glb', parts, { default: { color: [0.8, 0.7, 0.65], rough: 0.5 } });
const centres: Record<string, number[]> = {};
for (const p of parts) { p.geo.computeBoundingBox(); centres[p.id] = p.geo.boundingBox!.getCenter(new V3()).toArray().map((x) => +x.toFixed(3)); }
fs.writeFileSync(path.join(ROOT, 'public/models/body-f.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior', centres,
  attribution: { title: '3D Reference Organs: Visible Human Female (skin, organs, airway, uterus, ovaries, uterine tubes, placenta)', creators: 'HuBMAP / Human Reference Atlas consortium (brain: Allen Institute regions)', data: 'Visible Human Female, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Multi-part organs fused into single surfaces; meshes simplified; renamed by organ. The placenta, amnion and cord are the library’s term-pregnancy models in their published position; the skin is the non-pregnant reference.' },
}, null, 1));
log('done');
