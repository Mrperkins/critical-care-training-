/**
 * Gut + diaphragm for the abdomen module (gut.glb), replacing the procedurally drawn stomach tube, serpentine small
 * bowel and hemispherical diaphragm with real anatomy:
 *
 *  - HuBMAP / Visible Human Male (CC BY 4.0): duodenum (superior, descending, horizontal, ascending), jejunum, ileum,
 *    terminal ileum + ileocaecal valve, caecum, appendix, ascending colon, hepatic flexure, transverse colon, splenic flexure,
 *    descending and sigmoid colon, rectum; superior/inferior mesenteric arteries and veins, ileocolic vessels.
 *  - BodyParts3D 3.0 (CC BY-SA 2.1 JP): stomach (FMA7148) and diaphragm (FMA13295) — HuBMAP has neither. They are
 *    carried into this body by the skeleton's own BodyParts3D→VHM fit (pipeline/bp3d-fit.json), then seated on the
 *    VHM organs they touch with a translation-only ICP: the stomach on the gastric impression of the liver and the
 *    gastric surface of the spleen, the diaphragm on the liver's and spleen's diaphragmatic surfaces.
 *
 * Frame: decimetres, body-centred; +X patient left, +Y up, +Z anterior.
 *   npm run asset:gut     (needs pipeline/bp3d-fit.json from asset:skeleton, and the two BodyParts3D STLs)
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ROOT, log, readGLB, simplify, subdivide, writeGLB, mergeGeos, MeshoptSimplifier, type OutPart, V3 } from './common';
import { taubin } from './voxel';
await MeshoptSimplifier.ready;

const body = await readGLB('assets/source/VH_M_United.glb');
const pick = (re: RegExp) => [...body.entries()].filter(([n]) => re.test(n)).map(([, g]) => g);
const skin = pick(/VH_M_skin$/)[0]; skin.computeBoundingBox();
const C = skin.boundingBox!.getCenter(new V3());
const M = new THREE.Matrix4().makeScale(10, 10, 10).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const tf = (g: THREE.BufferGeometry) => { const h = g.clone(); for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k); h.applyMatrix4(M); return mergeVertices(h, 1e-7); };
const verts = (g: THREE.BufferGeometry) => { const a = g.attributes.position; return Array.from({ length: a.count }, (_, i) => new V3().fromBufferAttribute(a, i)); };
const mean = (ps: THREE.Vector3[]) => ps.reduce((a, p) => a.add(p), new V3()).divideScalar(Math.max(1, ps.length));

/* ------------------------------------------------------------------ BodyParts3D → body (the skeleton's fit) */
const BP = path.join(ROOT, 'assets/source/bp3d');
function readSTL(id: string) { // BodyParts3D STL (mm, +Z up, −Y anterior) → the pre-fit decimetre frame used by build-skeleton.ts
  const b = fs.readFileSync(path.join(BP, 'stl', id + '.stl')); const n = b.readUInt32LE(80); const pos = new Float32Array(n * 9);
  for (let t = 0; t < n; t++) for (let v = 0; v < 3; v++) { const o = 84 + t * 50 + 12 + v * 12; pos.set([b.readFloatLE(o) / 100, b.readFloatLE(o + 8) / 100, -b.readFloatLE(o + 4) / 100], t * 9 + v * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return mergeVertices(g, 1e-6);
}
const FIT = JSON.parse(fs.readFileSync(path.join(ROOT, 'pipeline/bp3d-fit.json'), 'utf8'));
const A = new THREE.Matrix4().fromArray(FIT.A);
const K = (FIT.kernels as { s: number; c: number[][]; d: number[][]; w: number[] }[]).map((k) => {
  const h = 3 * k.s; const hash = new Map<string, number[]>(); k.c.forEach((c, i) => { const key = [Math.floor(c[0] / h), Math.floor(c[1] / h), Math.floor(c[2] / h)].join(); (hash.get(key) ?? hash.set(key, []).get(key)!).push(i); });
  return { ...k, h, hash };
});
function toBody(p: THREE.Vector3) {
  const v = p.clone().applyMatrix4(A); const out = new V3();
  for (const k of K) { let sw = 0; const acc = new V3(); const s2 = 2 * k.s * k.s; const gx = Math.floor(v.x / k.h), gy = Math.floor(v.y / k.h), gz = Math.floor(v.z / k.h);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) { const list = k.hash.get([gx + a, gy + b, gz + c].join()); if (!list) continue; for (const i of list) { const q = k.c[i]; const d2 = (q[0] - v.x) ** 2 + (q[1] - v.y) ** 2 + (q[2] - v.z) ** 2; if (d2 > k.h * k.h) continue; const w = k.w[i] * Math.exp(-d2 / s2); sw += w; acc.x += k.d[i][0] * w; acc.y += k.d[i][1] * w; acc.z += k.d[i][2] * w; } }
    out.add(acc.divideScalar(sw + 0.15)); }
  return v.add(out);
}
const bpToBody = (g: THREE.BufferGeometry) => { const p = g.attributes.position; const v = new V3(); for (let i = 0; i < p.count; i++) { const q = toBody(v.fromBufferAttribute(p, i)); p.setXYZ(i, q.x, q.y, q.z); } p.needsUpdate = true; return g; };

/** translation-only ICP: move `g` so that the contact surfaces (`contacts`) lie on it (median of closest-point offsets) */
function seat(name: string, g: THREE.BufferGeometry, contacts: THREE.BufferGeometry[], iters = 12) {
  const pts = contacts.flatMap(verts).filter((_, i) => i % 2 === 0); const t = { point: new V3(), distance: 0 } as any; const total = new V3();
  const resid = () => { const b = new MeshBVH(g); const d = pts.map((p) => { b.closestPointToPoint(p, t); return t.distance; }).sort((a, c) => a - c); return d[d.length >> 1] * 100; };
  const before = resid();
  for (let it = 0; it < iters; it++) {
    const b = new MeshBVH(g); const off = pts.map((p) => { b.closestPointToPoint(p, t); return p.clone().sub(t.point); });
    const med = new V3(...[0, 1, 2].map((ax) => { const s = off.map((o) => o.getComponent(ax)).sort((a, c) => a - c); return s[s.length >> 1]; }) as [number, number, number]);
    if (med.length() < 1e-4) break; g.translate(med.x, med.y, med.z); total.add(med);
  }
  log(`${name}: seated by ICP, shift ${(total.length() * 100).toFixed(1)} mm, contact median ${before.toFixed(1)} → ${resid().toFixed(1)} mm`);
  return g;
}
const smooth = (g: THREE.BufferGeometry, sub: number, passes: number) => { let h = g; for (let i = 0; i < sub; i++) h = subdivide(h); h = mergeVertices(h, 1e-7); taubin(h, passes); h.computeVertexNormals(); return h; };

/* ------------------------------------------------------------------ parts */
const parts: OutPart[] = [];
const add = (id: string, role: string, geo: THREE.BufferGeometry, label: string, src: 'hubmap' | 'bp3d') => { geo.computeVertexNormals(); parts.push({ id, role, geo, extras: { label, source: src } }); log(id.padEnd(16), String((geo.index ? geo.index.count : geo.attributes.position.count) / 3 | 0).padStart(7), 'tris'); };
const H = (re: RegExp, ratio = 1) => { const gs = pick(re).map(tf); if (!gs.length) throw new Error('missing ' + re); const g = gs.length > 1 ? mergeGeos(gs) : gs[0]; return ratio < 1 ? simplify(g, ratio, 0.001) : g; };

const liverGastric = H(/VH_M_gastric_impression_of_liver$/), spleenGastric = H(/VH_M_gastric_surface_of_spleen$/);
const liverDia = H(/VH_M_diaphragmatic_surface$/), spleenDia = H(/VH_M_diaphragmatic_surface_of_spleen$/);

add('stomach', 'stomach', seat('stomach', smooth(bpToBody(readSTL('FMA7148')), 1, 6), [liverGastric, spleenGastric]), 'Stomach', 'bp3d');
add('diaphragm', 'diaphragm', seat('diaphragm', smooth(simplify(bpToBody(readSTL('FMA13295')), 0.35, 0.0005), 0, 4), [liverDia, spleenDia]), 'Diaphragm', 'bp3d');
add('duodenum', 'bowel', H(/VH_M_(duodenum_(superior|descending|horizonal|ascending)|duodenal_ampulla)$/), 'Duodenum', 'hubmap');
add('jejunum', 'bowel', H(/VH_M_jejunum$/), 'Jejunum', 'hubmap');
add('ileum', 'bowel', H(/VH_M_(ileum|ileum_terminal)$/), 'Ileum', 'hubmap');
add('colon', 'colon', H(/VH_M_(caecum|ascending_colon|hepatic_flexure_of_colon|transverse_colon|splenic_flexure_of_colon|descending_colon|sigmoid_colon|ileocecal_valve)$/), 'Colon', 'hubmap');
add('appendix', 'colon', H(/VH_M_vermiform_appendix$/), 'Appendix', 'hubmap');
add('rectum', 'colon', H(/VH_M_rectum$/), 'Rectum', 'hubmap');
add('mesenteric_art', 'artery', H(/VH_M_(superior_mesenteric_artery|inferior_mesenteric_artery|ileocolic_artery)$/), 'Mesenteric arteries (SMA, IMA, ileocolic)', 'hubmap');
add('mesenteric_vein', 'vein', H(/VH_M_(superior_mesenteric_vein|inferior_mesenteric_vein|ileocolic_vein)$/), 'Mesenteric veins (SMV, IMV, ileocolic)', 'hubmap');

/* sanity: stomach left of midline below the diaphragm; diaphragm dome above the liver dome */
const cen = (id: string) => { const g = parts.find((p) => p.id === id)!.geo; g.computeBoundingBox(); return g.boundingBox!.getCenter(new V3()); };
const st = cen('stomach'), lv = mean(verts(liverDia)); log('check: stomach centre x', st.x.toFixed(2), '(patient left > 0), y', st.y.toFixed(2), '; liver dome y', lv.y.toFixed(2));

await writeGLB('public/models/gut.glb', parts, {
  stomach: { color: [0.83, 0.62, 0.55], rough: 0.45 }, bowel: { color: [0.88, 0.66, 0.6], rough: 0.42 }, colon: { color: [0.79, 0.59, 0.54], rough: 0.45 },
  diaphragm: { color: [0.72, 0.36, 0.32], rough: 0.5 }, artery: { color: [0.78, 0.2, 0.17], rough: 0.4 }, vein: { color: [0.3, 0.28, 0.55], rough: 0.4 }, default: { color: [0.85, 0.65, 0.6], rough: 0.45 },
});
const centres: Record<string, number[]> = {}; const labels: Record<string, string> = {};
for (const p of parts) { p.geo.computeBoundingBox(); centres[p.id] = p.geo.boundingBox!.getCenter(new V3()).toArray().map((x) => +x.toFixed(3)); labels[p.id] = String(p.extras!.label); }
fs.writeFileSync(path.join(ROOT, 'public/models/gut.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior', centres, labels,
  sources: Object.fromEntries(parts.map((p) => [p.id, p.extras!.source])),
  attribution: [
    { title: '3D Reference Organs: Visible Human Male (small and large intestine, mesenteric vessels)', creators: 'HuBMAP / Human Reference Atlas consortium', data: 'Visible Human Male, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Placed in the body frame; segments merged.' },
    { title: 'BodyParts3D 3.0 (stomach FMA7148, diaphragm FMA13295)', creators: 'Database Center for Life Science (DBCLS)', notice: 'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan', license: 'CC BY-SA 2.1 JP', licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en', sourceUrl: 'https://lifesciencedb.jp/bp3d/', changes: 'Fitted to the Visible Human Male with the skeleton fit, seated on the liver/spleen contact surfaces (translation only), smoothed.' },
  ],
  license: 'gut.glb as a whole is distributed under CC BY-SA 2.1 JP (BodyParts3D-derived stomach and diaphragm); the HuBMAP parts are CC BY 4.0.',
}, null, 1));
log('done', parts.length, 'parts');
