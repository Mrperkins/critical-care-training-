/**
 * Deep brain structures for the neuro module, from the Allen Institute brain regions placed in the HuBMAP / Visible
 * Human Male united body (CC BY 4.0) — the same brain that body.glb fuses into one surface, so everything lines up with
 * the existing brain, skull (skeleton.glb) and skin in the shared body frame (decimetres, centred on the VHM skin;
 * +X patient left, +Y up, +Z anterior).
 *
 * Groups (one solid each, voxel-fused from the Allen sub-regions):
 *   ventricular system  — lateral ventricles L/R (all horns + atrium), third ventricle, cerebral aqueduct, fourth ventricle
 *   basal ganglia        — caudate L/R (head/body/tail), putamen L/R, globus pallidus L/R (external + internal)
 *   diencephalon         — thalamus L/R (all nuclei), hypothalamus
 *   limbic               — hippocampus L/R, amygdala L/R, fornix
 *   commissure           — corpus callosum
 *   brainstem            — midbrain, pons, medulla
 *   cerebellum           — hemispheres L/R, vermis
 *   internal capsule L/R — DERIVED: the Allen set has no internal-capsule label (it sits in "white matter of
 *                          forebrain"), so it is reconstructed as the white-matter band between the lentiform nucleus
 *                          and the caudate/thalamus, limited to the lentiform's height. Labelled as derived in the app.
 *
 *   npm run asset:neuro        (source: assets/source/VH_M_United.glb, HuBMAP v1.1)
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { ROOT, log, readGLB, simplify, writeGLB, mergeGeos, MeshoptSimplifier, type OutPart, V3 } from './common';
import { makeGrid, rasterSolid, blur, marchingCubes, taubin, idx } from './voxel';
await MeshoptSimplifier.ready;

const body = await readGLB('assets/source/VH_M_United.glb', /^(Allen_|VH_M_skin$)/);
const pick = (re: RegExp) => [...body.entries()].filter(([n]) => re.test(n)).map(([, g]) => g);
const skinSrc = pick(/VH_M_skin$/)[0]; skinSrc.computeBoundingBox();
const C = skinSrc.boundingBox!.getCenter(new V3()); const S = 10;
const M = new THREE.Matrix4().makeScale(S, S, S).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const tf = (g: THREE.BufferGeometry) => { const h = g.clone(); h.applyMatrix4(M); h.computeVertexNormals(); h.computeBoundingBox(); return h; };
/* The Allen regions placed in the HuBMAP united body carry mirrored side labels: "Allen_*_L" lies at −X, which is the
   patient's RIGHT in this frame (+X = patient left; kidney_L, lung_L, liver confirm it). Sides here are assigned by
   position, so every "_L" id in neuro.glb is on the patient's left. Detected, not assumed: */
const allenLx = (() => { const g = pick(/^Allen_putamen_L$/).map(tf)[0]; g.computeBoundingBox(); return g.boundingBox!.getCenter(new V3()).x; })();
const MIRRORED = allenLx < 0; log('Allen side labels', MIRRORED ? 'mirrored (Allen L = patient right) — corrected by position' : 'match the body frame');
const A = (names: string[], sides: ('L' | 'R')[]) => {
  const src = sides.map((x) => (MIRRORED ? (x === 'L' ? 'R' : 'L') : x));
  const re = new RegExp('^Allen_(' + names.join('|') + ')_(' + src.join('|') + ')$'); const gs = pick(re).map(tf);
  if (!gs.length) throw new Error('no Allen regions for ' + names.join(',')); return gs;
};
function fuse(gs: THREE.BufferGeometry[], h: number, tri: number, blurPasses = 1) {
  const bb = new THREE.Box3(); gs.forEach((g) => { g.computeBoundingBox(); bb.union(g.boundingBox!); });
  const grid = makeGrid(bb, h, 3); rasterSolid(grid, gs, 1.3); blur(grid, blurPasses, 1);
  let geo = marchingCubes(grid, 0.5); taubin(geo, 4); geo = simplify(geo, Math.min(1, tri / (geo.index!.count / 3)), 0.001); taubin(geo, 1); geo.computeVertexNormals(); return geo;
}

const parts: OutPart[] = [];
const add = (id: string, role: string, geo: THREE.BufferGeometry, label: string, extras: Record<string, unknown> = {}) => { parts.push({ id, role, geo, extras: { label, ...extras } }); log(id, geo.index!.count / 3); };
const Side = { L: 'Left', R: 'Right' } as const;

const LAT_V = ['anterior_horn_of_lateral_ventricle', 'body_of_lateral_ventricle', 'posterior_horn_of_lateral_ventricle', 'inferior_horn_of_lateral_ventricle', 'atrium_of_lateral_ventricle'];
const CAUDATE = ['head_of_caudate', 'body_of_caudate', 'tail_of_caudate'];
// 'posteroventral_putamen' is a broad 82 mm Allen region (10 mL) that would double the putamen; the core label is used
const PUTAMEN = ['putamen'];
const PALLIDUS = ['external_segment_of_globus_pallidus', 'internal_segment_of_globus_pallidus'];
const THAL = ['thalamus', 'anterior_nuclear_complex_of_thalamus', 'lateral_dorsal_nucleus_of_thalamus', 'mediodorsal_nucleus_of_thalamus', 'reuniens_nucleus_medioventral_nucleus_of_thalamus', 'lateral_posterior_nucleus_of_thalamus', 'pulvinar_of_thalamus', 'ventral_anterior_nucleus_of_thalamus', 'ventral_lateral_nucleus_of_thalamus', 'ventral_posterior_lateral_nucleus', 'ventral_posterior_medial_nucleus', 'dorsal_lateral_geniculate_nucleus', 'medial_geniculate_nuclei', 'centromedian_nucleus_of_thalamus', 'parafascicular_nucleus_of_thalamus', 'midline_nuclear_complex'];
const HIPPO = ['head_of_hippocampus', 'body_of_hippocampus', 'tail_of_hippocampus'];
const AMYG = ['amygdaloid_complex', 'anterior_amygdaloid_area', 'central_nuclear_group', 'lateral_nucleus', 'basolateral_nucleus_basal_nucleus', 'basomedial_nucleus_accessory_basal_nucleus', 'anterior_cortical_nucleus', 'posterior_cortical_nucleus', 'medial_nucleus', 'amygdalohippocampal_area'];
const HTH = ['hypothalamus', 'supraoptic_region_of_HTH', 'preoptic_region_of_HTH', 'tuberal_region_of_HTH', 'mammillary_region_of_HTH'];
const MID = ['midbrain_tegmentum', 'substantia_nigra', 'red_nucleus', 'superior_colliculus', 'inferior_colliculus', 'cerebral_peduncle_crus_cerebri', 'pretectal_region'];
const PONS = ['basilar_part_of_pons', 'pontine_tegmentum'];
const MED = ['pyramidal_part_of_medulla_oblongata', 'tegmentum_of_medulla_oblongata', 'inferior_olive'];
const CBL = ['lateral_hemisphere_of_cerebellum', 'paravermis_of_cerebellum', 'cerebellar_deep_nuclei'];

const LR = ['L', 'R'] as const;
for (const s of LR) add('lat_ventricle_' + s, 'csf', fuse(A(LAT_V, [s]), 0.008, 5000), Side[s] + ' lateral ventricle');
add('third_ventricle', 'csf', fuse(A(['third_ventricle'], ['L', 'R']), 0.006, 1500), 'Third ventricle');
add('aqueduct', 'csf', fuse(A(['cerebral_aqueduct'], ['L', 'R']), 0.004, 600, 0), 'Cerebral aqueduct');
add('fourth_ventricle', 'csf', fuse(A(['fourth_ventricle'], ['L', 'R']), 0.006, 1500), 'Fourth ventricle');
for (const s of LR) {
  add('caudate_' + s, 'basal_ganglia', fuse(A(CAUDATE, [s]), 0.008, 3000), Side[s] + ' caudate nucleus');
  add('putamen_' + s, 'basal_ganglia', fuse(A(PUTAMEN, [s]), 0.008, 2500), Side[s] + ' putamen');
  add('pallidus_' + s, 'pallidus', fuse(A(PALLIDUS, [s]), 0.006, 1500), Side[s] + ' globus pallidus');
  add('thalamus_' + s, 'thalamus', fuse(A(THAL, [s]), 0.008, 3000), Side[s] + ' thalamus');
  add('hippocampus_' + s, 'limbic', fuse(A(HIPPO, [s]), 0.006, 2500), Side[s] + ' hippocampus');
  add('amygdala_' + s, 'limbic', fuse(A(AMYG, [s]), 0.006, 1200), Side[s] + ' amygdala');
}
add('hypothalamus', 'diencephalon', fuse(A(HTH, ['L', 'R']), 0.006, 1500), 'Hypothalamus');
add('fornix', 'white', fuse(A(['fornix'], ['L', 'R']), 0.005, 2000, 0), 'Fornix');
add('corpus_callosum', 'white', fuse(A(['corpus_callosum'], ['L', 'R']), 0.008, 5000), 'Corpus callosum');
add('midbrain', 'brainstem', fuse(A(MID, ['L', 'R']), 0.008, 3000), 'Midbrain');
add('pons', 'brainstem', fuse(A(PONS, ['L', 'R']), 0.008, 3000), 'Pons');
add('medulla', 'brainstem', fuse(A(MED, ['L', 'R']), 0.008, 2500), 'Medulla oblongata');
for (const s of LR) add('cerebellum_' + s, 'cerebellum', fuse(A(CBL, [s]), 0.01, 6000), Side[s] + ' cerebellar hemisphere');
add('vermis', 'cerebellum', fuse(A(['cerebellar_vermis'], ['L', 'R']), 0.008, 2500), 'Cerebellar vermis');

/* ------------------------------------------------------------------ internal capsule (derived) */
for (const s of LR) {
  const lent = [...A(PUTAMEN, [s]), ...A(PALLIDUS, [s])]; const medial = [...A(CAUDATE, [s]), ...A(THAL, [s])];
  const wm = A(['white_matter_of_forebrain'], [s]);
  const gray = [...lent, ...medial, ...A(LAT_V, [s]), ...A(['third_ventricle'], [s])];
  const bb = new THREE.Box3(); [...lent, ...medial].forEach((g) => { g.computeBoundingBox(); bb.union(g.boundingBox!); });
  const lb = new THREE.Box3(); lent.forEach((g) => lb.union(g.boundingBox!));
  const grid = makeGrid(bb, 0.006, 2);
  void wm;
  const grG = makeGrid(bb, 0.006, 2); rasterSolid(grG, gray, 1.3);
  const lentB = lent.map((g) => new MeshBVH(g)); const medB = medial.map((g) => new MeshBVH(g)); const t = { point: new V3(), distance: 0 } as any;
  const dist = (bs: MeshBVH[], p: THREE.Vector3) => { let d = Infinity; let q: THREE.Vector3 | null = null; for (const b of bs) { b.closestPointToPoint(p, t); if (t.distance < d) { d = t.distance; q = t.point.clone(); } } return { d, q: q! }; };
  const p = new V3(); let n = 0;
  for (let k = 0; k < grid.nz; k++) for (let j = 0; j < grid.ny; j++) for (let i = 0; i < grid.nx; i++) {
    // the atlas nuclei nearly abut, so the capsule is mostly the unlabelled gap between them: only grey matter is excluded
    const o = idx(grid, i, j, k); if (grG.f[o] > 0.5) continue;
    p.set(grid.origin.x + i * grid.h, grid.origin.y + j * grid.h, grid.origin.z + k * grid.h);
    if (p.y < lb.min.y || p.y > lb.max.y + 0.05) continue;
    const a = dist(lentB, p); if (a.d > 0.09) continue; const b = dist(medB, p); if (b.d > 0.09) continue;
    // between the two: the point lies on the segment's side of both, i.e. the two nearest points are on opposite sides
    const qa = a.q.clone().sub(p), qb = b.q.clone().sub(p); if (qa.dot(qb) > 0.2 * qa.length() * qb.length()) continue;
    if (a.d + b.d > 0.11) continue; // a band, not the whole hemisphere
    grid.f[o] = 1; n++;
  }
  blur(grid, 1, 1); let geo = marchingCubes(grid, 0.5); taubin(geo, 6); geo = simplify(geo, Math.min(1, 3500 / (geo.index!.count / 3)), 0.001); taubin(geo, 1); geo.computeVertexNormals();
  add('internal_capsule_' + s, 'white', geo, Side[s] + ' internal capsule', { derived: true });
  log('internal capsule', s, 'voxels', n);
}

await writeGLB('public/models/neuro.glb', parts, {
  csf: { color: [0.36, 0.62, 0.86], rough: 0.25 }, basal_ganglia: { color: [0.62, 0.48, 0.58], rough: 0.5 }, pallidus: { color: [0.74, 0.62, 0.66], rough: 0.5 },
  thalamus: { color: [0.58, 0.52, 0.66], rough: 0.5 }, diencephalon: { color: [0.66, 0.5, 0.6], rough: 0.5 }, limbic: { color: [0.72, 0.56, 0.48], rough: 0.5 },
  white: { color: [0.9, 0.88, 0.84], rough: 0.45 }, brainstem: { color: [0.7, 0.6, 0.6], rough: 0.5 }, cerebellum: { color: [0.66, 0.5, 0.52], rough: 0.5 },
  default: { color: [0.7, 0.6, 0.6], rough: 0.5 },
});
const centres: Record<string, number[]> = {}; const labels: Record<string, string> = {}; const volumesMl: Record<string, number> = {};
const vol = (g: THREE.BufferGeometry) => { const p = g.attributes.position, ix = g.index!.array; let s = 0; const a = new V3(), b = new V3(), c = new V3(); for (let t = 0; t < ix.length; t += 3) { a.fromBufferAttribute(p, ix[t]); b.fromBufferAttribute(p, ix[t + 1]); c.fromBufferAttribute(p, ix[t + 2]); s += a.dot(b.clone().cross(c)) / 6; } return Math.abs(s); };
for (const p of parts) { p.geo.computeBoundingBox(); centres[p.id] = p.geo.boundingBox!.getCenter(new V3()).toArray().map((x) => +x.toFixed(3)); labels[p.id] = String(p.extras!.label); volumesMl[p.id] = +(vol(p.geo) * 1000).toFixed(1); }
fs.writeFileSync(path.join(ROOT, 'public/models/neuro.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior', centres, labels, volumesMl,
  sides: 'By position: _L ids are on the patient\'s left (+X). The HuBMAP-placed Allen labels are mirrored and were corrected.',
  derived: { internal_capsule: 'Reconstructed: white matter of forebrain lying between the lentiform nucleus and the caudate/thalamus, within the lentiform height. Not an Allen label.' },
  attribution: { title: '3D Reference Organs: Visible Human Male — Allen Institute brain regions', creators: 'HuBMAP / Human Reference Atlas consortium; brain regions: Allen Institute for Brain Science', data: 'Visible Human Male, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Sub-regions voxel-fused into one solid per structure; internal capsule derived from the forebrain white matter (see derived); simplified.' },
}, null, 1));
log('done', parts.length, 'structures,', parts.reduce((s, p) => s + p.geo.index!.count / 3, 0), 'triangles');
