/**
 * Cardiac and thoracic autonomic nerves in the shared Visible Human Male body frame (decimetres, centred on the VHM
 * skin; +X patient left, +Y up, +Z anterior).
 *
 *  Real meshes — Z-Anatomy (CC BY-SA 4.0; itself derived from BodyParts3D, CC BY-SA 2.1 JP): right and left vagus
 *  nerves, sympathetic trunks with their ganglia, and the sympathetic nerves. Z-Anatomy's bones are BodyParts3D bones,
 *  so its export is registered to the BodyParts3D frame by a similarity transform (Umeyama on bone centroids, refined by
 *  ICP on bone surfaces), then carried into the VHM body by the skeleton's own fit (pipeline/bp3d-fit.json).
 *
 *  Built on measured landmarks (schematic course, labelled so): cardiac branches of the vagus and of the cervical
 *  sympathetic ganglia converging on the deep cardiac plexus (in front of the tracheal bifurcation, behind the arch) and
 *  the superficial cardiac plexus (under the arch at the ligamentum arteriosum), with extensions to the SA and AV
 *  nodes and the right and left coronary plexuses; right and left phrenic nerves (Z-Anatomy has none) from C4, down
 *  over the SVC / right-atrial and left-ventricular pericardium to the diaphragm.
 *
 *   npm run asset:nerves      (needs skeleton.glb + bp3d-fit.json, heart-internals, pericardium, coronary-heart built;
 *                              Z-Anatomy FBX in assets/source/z-anatomy/, BodyParts3D STLs in assets/source/bp3d/)
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ROOT, log, readGLB, readGLBDecoded, simplify, writeGLB, mergeGeos, MeshoptSimplifier, type OutPart, V3 } from './common';
await MeshoptSimplifier.ready;

import { readFBX, verts, mean, r3, zToBody, T, zBones, tq } from './zanatomy';

/* check: the registered + fitted Z-Anatomy sternum against the shipped skeleton */
const skel = await readGLBDecoded('public/models/skeleton.glb');
{ const zs = zToBody(zBones.get('Body_of_sternum')!.clone()); const sb = new MeshBVH(skel.get('sternum_body')!); const d = verts(zs).map((v) => { sb.closestPointToPoint(v, tq); return tq.distance; }).sort((a, b) => a - b); log('check: Z-Anatomy sternum vs skeleton.glb sternum, median', (d[d.length >> 1] * 100).toFixed(2), 'mm'); }

/* ------------------------------------------------------------------ 3. nerves */
const zN = readFBX('NervousSystem100.fbx', /^(Vagus_nerve_\(X\)[lr]|Sympathetic_trunk[lr]|Ganglia_of_sympathetic_trunk[lr]|Sympathetic_nerves[lr])$/);
const parts: OutPart[] = [];
const add = (id: string, role: string, geo: THREE.BufferGeometry, label: string, extras: Record<string, unknown> = {}) => { geo.computeVertexNormals(); parts.push({ id, role, geo, extras: { label, ...extras } }); log(id.padEnd(26), String(geo.index!.count / 3).padStart(6), 'tris'); };
const ZN: [string, string, string, string, number][] = [
  ['Vagus_nerve_(X)r', 'vagus_R', 'nerve', 'Right vagus nerve (X)', 16000], ['Vagus_nerve_(X)l', 'vagus_L', 'nerve', 'Left vagus nerve (X)', 9000],
  ['Sympathetic_trunkr', 'sympathetic_trunk_R', 'sympathetic', 'Right sympathetic trunk', 9000], ['Sympathetic_trunkl', 'sympathetic_trunk_L', 'sympathetic', 'Left sympathetic trunk', 9000],
  ['Ganglia_of_sympathetic_trunkr', 'sympathetic_ganglia_R', 'ganglion', 'Ganglia of the right sympathetic trunk', 9000], ['Ganglia_of_sympathetic_trunkl', 'sympathetic_ganglia_L', 'ganglion', 'Ganglia of the left sympathetic trunk', 9000],
  ['Sympathetic_nervesr', 'sympathetic_nerves_R', 'sympathetic', 'Right sympathetic nerves', 9000], ['Sympathetic_nervesl', 'sympathetic_nerves_L', 'sympathetic', 'Left sympathetic nerves', 9000],
];
const nerve: Record<string, THREE.BufferGeometry> = {};
for (const [z, id, role, label, tri] of ZN) { const g = zN.get(z); if (!g) { log('missing in Z-Anatomy:', z); continue; } let b = zToBody(g.clone()); b = simplify(b, Math.min(1, tri / (b.index!.count / 3)), 0.0005); nerve[id] = b; add(id, role, b, label, { source: 'Z-Anatomy' }); }

/* sides: Z-Anatomy's r/l must land at −X/+X (patient right/left) */
const cx = (id: string) => (nerve[id] ? mean(verts(nerve[id]).filter((p) => p.y > 5.2)).x : NaN); // cervical + upper thoracic course
log('side check (above the hila): vagus_R x', cx('vagus_R').toFixed(3), 'vagus_L x', cx('vagus_L').toFixed(3), 'trunk_R x', cx('sympathetic_trunk_R').toFixed(3));

/* ------------------------------------------------------------------ 4. cardiac plexus + phrenic nerves (landmark-built) */
const IM = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/models/heart-internals.mapping.json'), 'utf8'));
const CM = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/models/coronary-heart.mapping.json'), 'utf8'));
const v3 = (a: number[]) => new V3(a[0], a[1], a[2]);
const tra = await readGLB('assets/source/3d-vh-m-trachea.glb', /carina/);
const skinB = await readGLB('assets/source/VH_M_United.glb', /^VH_M_(skin|aortic_arch|superior_vena_cava|pulmonary_artery_L|pulmonary_trunk|diaphragm.*)$/);
const skin = skinB.get('VH_M_skin')!; skin.computeBoundingBox(); const C = skin.boundingBox!.getCenter(new V3());
const M = new THREE.Matrix4().makeScale(10, 10, 10).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const tf = (g: THREE.BufferGeometry) => { const h = g.clone(); h.applyMatrix4(M); h.computeBoundingBox(); return h; };
const carina = mean(verts(tf([...tra.values()][0])));
const arch = tf(skinB.get('VH_M_aortic_arch')!); const archV = verts(arch); const archLow = archV.reduce((a, p) => (p.y < a.y ? p : a));
const svcV = verts(tf(skinB.get('VH_M_superior_vena_cava')!));
const pericardium = (await readGLBDecoded('public/models/pericardium.glb')).get('pericardium')!; const periB = new MeshBVH(pericardium); periB.geometry.computeBoundingBox(); const periBox = periB.geometry.boundingBox!;
const heartC = periBox.getCenter(new V3());
const SA = v3(IM.parts.sa_node.centre), AV = v3(IM.parts.av_node.centre);
const RCA0 = v3(CM.vessels.RCA.centerline[0]), LM0 = v3(CM.vessels.LM?.centerline?.[0] ?? CM.vessels.LAD.centerline[0]);
const deep = carina.clone().lerp(archLow, 0.45).add(new V3(0, -0.04, 0.03));        // deep plexus: in front of the bifurcation, behind the arch
const superficial = archLow.clone().add(new V3(0.04, -0.05, -0.02));                // under the arch, at the ligamentum arteriosum
log('plexus: carina', r3(carina), 'arch underside', r3(archLow), 'deep', r3(deep), 'superficial', r3(superficial));
/** nearest vertex of a nerve to a body height (its course at that level) */
const atLevel = (id: string, y: number) => verts(nerve[id]).reduce((a, p) => (Math.abs(p.y - y) < Math.abs(a.y - y) ? p : a));
const vert = (id: string) => mean(verts(skel.get(id)!));
const lvl = { C3: vert('C3').y, C6: vert('C6').y, C7: vert('C7').y, T1: vert('T1').y, T2: vert('T2').y, T4: vert('T4').y };
function tube(pts: THREE.Vector3[], r: number, seg = 6) { const c = new THREE.CatmullRomCurve3(pts, false, 'centripetal'); const g = new THREE.TubeGeometry(c, Math.max(8, Math.ceil(c.getLength() / 0.01)), r, seg, false); g.deleteAttribute('uv'); return g; }
const branch = (a: THREE.Vector3, b: THREE.Vector3, sag: THREE.Vector3, r = 0.006) => tube([a, a.clone().lerp(b, 0.5).add(sag), b], r);
/** cervical/thoracic cardiac nerve: from its origin it descends beside the trachea (posterior to the carotid sheath),
 *  crossing the thoracic inlet at T1 before converging on the plexus — a curve, not a straight chord */
const inlet = (side: number, y: number) => new V3(carina.x + side * 0.16, y, carina.z + 0.06);
const cardiacNerve = (a: THREE.Vector3, b: THREE.Vector3, side: number, k: number) => {
  const t1 = lvl.T1 + 0.05 - k * 0.04; const mid = inlet(side * (1 + 0.15 * k), t1);
  if (a.y < t1 + 0.1) return tube([a, a.clone().lerp(b, 0.5).add(new V3(0, 0.02, 0.03)), b], 0.005);
  return tube([a, a.clone().lerp(mid, 0.5).add(new V3(0, 0, 0.02)), mid, mid.clone().lerp(b, 0.55).add(new V3(side * 0.02, 0, 0.01)), b], 0.005);
};
/** a plexus as it dissects: a flat meshwork of fine interlacing fibres with small ganglia at the nodes */
function plexusNet(c: THREE.Vector3, rx: number, ry: number, rz: number, n: number, seed: number) {
  let st = seed; const rnd = () => ((st = (st * 1664525 + 1013904223) >>> 0) / 4294967296);
  const nodes: THREE.Vector3[] = [];
  while (nodes.length < n) { const q = new V3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1); if (q.lengthSq() > 1) continue; nodes.push(new V3(c.x + q.x * rx, c.y + q.y * ry, c.z + q.z * rz)); }
  const gs: THREE.BufferGeometry[] = []; const seen = new Set<string>();
  nodes.forEach((p, i) => {
    const nn = nodes.map((q, j) => [p.distanceTo(q), j] as const).filter(([, j]) => j !== i).sort((a, b) => a[0] - b[0]).slice(0, 3);
    for (const [, j] of nn) { const key = i < j ? i + ':' + j : j + ':' + i; if (seen.has(key)) continue; seen.add(key);
      const q = nodes[j]; const m = p.clone().lerp(q, 0.5).add(new V3((rnd() - 0.5) * 0.008, (rnd() - 0.5) * 0.008, (rnd() - 0.5) * 0.008));
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p, m, q]), 6, 0.0018 + rnd() * 0.0014, 5, false); g.deleteAttribute('uv'); gs.push(g); }
    if (i % 3 === 0) { const r = 0.0035 + rnd() * 0.003; const g = new THREE.SphereGeometry(r, 10, 8); g.scale(1.6, 1, 1); g.deleteAttribute('uv'); g.translate(p.x, p.y, p.z); gs.push(g); }
  });
  return mergeGeos(gs);
}
const cardiacBranches: THREE.BufferGeometry[] = [];
if (nerve.sympathetic_trunk_R && nerve.sympathetic_trunk_L) for (const s of ['R', 'L'] as const) {
  const t = 'sympathetic_trunk_' + s; for (const [lv, name] of [[lvl.C3, 'superior'], [lvl.C6, 'middle'], [(lvl.C7 + lvl.T1) / 2, 'inferior (cervicothoracic)']] as [number, string][]) { const a = atLevel(t, lv); const k = name === 'superior' ? 0 : name === 'middle' ? 1 : 2; cardiacBranches.push(cardiacNerve(a, s === 'R' ? deep : superficial.clone().lerp(deep, 0.4), s === 'R' ? -1 : 1, k)); }
}
for (const s of ['R', 'L'] as const) { const v = 'vagus_' + s; if (!nerve[v]) continue; for (const [lv, k] of [[lvl.C6, 1.5], [lvl.T2, 2.5]] as const) cardiacBranches.push(cardiacNerve(atLevel(v, lv), s === 'L' && lv === lvl.C6 ? superficial : deep, s === 'R' ? -1 : 1, k)); cardiacBranches.push(branch(atLevel(v, lvl.T4), deep, new V3(0, 0.02, 0.02))); }
add('cardiac_nerves', 'nerve', mergeGeos(cardiacBranches), 'Cardiac nerves (cervical sympathetic + vagal cardiac branches)', { schematic: true });
add('cardiac_plexus_deep', 'plexus', plexusNet(deep, 0.07, 0.035, 0.03, 34, 7), 'Deep cardiac plexus', { schematic: true });
add('cardiac_plexus_superficial', 'plexus', plexusNet(superficial, 0.03, 0.02, 0.015, 12, 11), 'Superficial cardiac plexus', { schematic: true });
// extensions run in the subepicardial fat, so their course is projected onto the epicardium of the full-resolution
// chambers (ray from outside toward the heart centre, first hit), 1.5 mm proud of it
const hd = await readGLBDecoded('public/models/heart-hd.glb'); const epiB = new MeshBVH(mergeGeos([...hd.values()].map((g) => { const h = g.clone(); for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k); return h; })));
const epi = (q: THREE.Vector3, proud = 0.015) => { const d = q.clone().sub(heartC).normalize(); const o = heartC.clone().addScaledVector(d, 3); const h = epiB.raycastFirst(new THREE.Ray(o, d.clone().negate()), THREE.DoubleSide); return h ? h.point.clone().addScaledVector(d, proud) : q; };
/** a path through control points, densified, with every point after `free` laid on the epicardium */
const epiPath = (ctrl: THREE.Vector3[], free = 1, n = 28) => { const c = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal'); const pts = c.getSpacedPoints(n); const k = Math.round((free / (ctrl.length - 1)) * n);
  const out = pts.map((p, i) => (i <= k ? p : epi(p))); for (let it = 0; it < 3; it++) for (let i = k + 1; i < out.length - 1; i++) out[i] = epi(out[i - 1].clone().add(out[i + 1]).multiplyScalar(0.5)); return out; };
const LMk = IM.landmarks; const ivc = v3(LMk.ivcOrifice), svc = v3(LMk.svcOrifice);
const laPost = new V3(heartC.x + 0.06, (SA.y + AV.y) / 2, heartC.z - 0.5);                   // behind the left atrium (posterior surface)
const ext: THREE.BufferGeometry[] = [
  // right atrial (SA) plexus: deep plexus → around the right side of the SVC → sinus node at the cavo-atrial junction
  tube(epiPath([deep, svc.clone().add(new V3(-0.06, 0.12, -0.05)), svc.clone().add(new V3(-0.06, 0, 0)), SA]), 0.004),
  // AV-nodal fat pad: down the posterior left atrium to the IVC–left atrial junction, then into the AV node
  tube([...epiPath([deep, laPost, ivc.clone().lerp(AV, 0.35).add(new V3(0.05, -0.02, -0.15))]), AV], 0.004),
  tube([superficial, superficial.clone().lerp(deep, 0.5).add(new V3(0, 0, 0.02)), deep], 0.005),
  // coronary plexuses: alongside the RCA and the left main / LAD
  tube(epiPath([deep, deep.clone().lerp(RCA0, 0.5).add(new V3(-0.02, 0, 0.04)), RCA0, ...CM.vessels.RCA.centerline.slice(1, 9).filter((_: unknown, i: number) => i % 2 === 1).map(v3)], 2), 0.0035),
  tube(epiPath([deep, deep.clone().lerp(LM0, 0.5).add(new V3(0.02, 0, 0.03)), LM0, ...CM.vessels.LAD.centerline.slice(1, 11).filter((_: unknown, i: number) => i % 2 === 1).map(v3)], 2), 0.0035),
];
add('cardiac_plexus_extensions', 'nerve', mergeGeos(ext), 'Plexus extensions: atrial (SA, AV) and coronary plexuses', { schematic: true });
// phrenic nerves: C4 (anterior to the scalenus anterior) → behind the subclavian vein → right: along the SVC and the
// right-atrial pericardium; left: over the arch and the left-ventricular pericardium → diaphragm
const lateralPeri = (y: number, side: 1 | -1, out = 0.012) => { const o = new V3(heartC.x + side * 2, y, heartC.z); const ray = new THREE.Ray(o, new V3(-side, 0, 0)); const h = periB.raycastFirst(ray, THREE.DoubleSide); return h ? h.point.clone().add(new V3(side * out, 0, 0)) : new V3(heartC.x + side * 0.6, y, heartC.z); };
const phr = (side: 1 | -1) => {
  const c4 = vert('C4'); const start = new V3(side * 0.32, c4.y, c4.z + 0.28); const subcl = new V3(side * 0.42, lvl.T1 + 0.02, c4.z + 0.55);
  const via = side < 0 ? [mean(svcV).clone().add(new V3(-0.09, 0.1, 0)), lateralPeri(heartC.y + 0.15, -1)] : [archLow.clone().add(new V3(0.18, 0.12, 0.06)), lateralPeri(heartC.y + 0.1, 1)];
  const dia = lateralPeri(periBox.min.y + 0.12, side); dia.y = periBox.min.y - 0.05;
  return tube([start, start.clone().lerp(subcl, 0.5), subcl, ...via, lateralPeri(heartC.y - 0.12, side), dia], 0.008, 8);
};
add('phrenic_R', 'nerve', phr(-1), 'Right phrenic nerve (C3–C5)', { schematic: true });
add('phrenic_L', 'nerve', phr(1), 'Left phrenic nerve (C3–C5)', { schematic: true });

/* ------------------------------------------------------------------ output */
await writeGLB('public/models/nerves.glb', parts, { nerve: { color: [0.96, 0.9, 0.62], rough: 0.45 }, sympathetic: { color: [0.92, 0.82, 0.55], rough: 0.45 }, ganglion: { color: [0.86, 0.72, 0.45], rough: 0.45 }, plexus: { color: [0.98, 0.84, 0.5], rough: 0.4 }, default: { color: [0.96, 0.9, 0.62], rough: 0.45 } });
const centres: Record<string, number[]> = {}; const labels: Record<string, string> = {};
for (const p of parts) { p.geo.computeBoundingBox(); centres[p.id] = r3(p.geo.boundingBox!.getCenter(new V3())); labels[p.id] = String(p.extras!.label); }
/** label anchors: a point ON each nerve at the level where it is identified beside the heart (bbox centres fall off the nerve) */
const onNerve = (id: string, y: number) => { const g = parts.find((p) => p.id === id)?.geo; if (!g) return undefined; const vs = verts(g); const near = vs.filter((p) => Math.abs(p.y - y) < 0.03); const pool = near.length ? near : vs;
  // the most lateral/anterior point at that level: the nerve trunk, not a medial twig
  return r3(pool.reduce((a, p) => (Math.abs(p.x) + 0.5 * p.z > Math.abs(a.x) + 0.5 * a.z ? p : a))); };
const anchors: Record<string, number[] | undefined> = {
  vagus_R: onNerve('vagus_R', archLow.y + 0.25), vagus_L: onNerve('vagus_L', archLow.y + 0.12), phrenic_R: onNerve('phrenic_R', heartC.y + 0.1), phrenic_L: onNerve('phrenic_L', heartC.y),
  sympathetic_trunk_R: onNerve('sympathetic_trunk_R', lvl.T4), sympathetic_trunk_L: onNerve('sympathetic_trunk_L', lvl.T4), cardiac_nerves: onNerve('cardiac_nerves', lvl.T1),
  cardiac_plexus_deep: r3(deep), cardiac_plexus_superficial: r3(superficial),
};
fs.writeFileSync(path.join(ROOT, 'public/models/nerves.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior', centres, anchors, labels,
  registration: { similarityScale: +T.s.toFixed(5), reflection: T.det < 0 },
  schematic: 'Vagus nerves, sympathetic trunks, ganglia and sympathetic nerves are Z-Anatomy meshes registered to this body. Cardiac nerves, the deep and superficial cardiac plexuses, their atrial/coronary extensions and the phrenic nerves are placed on measured landmarks (vertebral levels, carina, aortic arch, SA/AV nodes, coronary origins, pericardium) and are schematic in course.',
  attribution: [
    { title: 'Z-Anatomy — the open source atlas of anatomy (vagus nerves, sympathetic trunks, ganglia, sympathetic nerves)', creators: 'Z-Anatomy (Lluís Vinent)', notice: 'Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0; BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', sourceUrl: 'https://github.com/LluisV/Z-Anatomy', changes: 'Registered to BodyParts3D (similarity + ICP on shared bones), fitted to the Visible Human Male with the skeleton fit, simplified.' },
    { title: 'Landmarks: HuBMAP / Visible Human Male (carina, aortic arch, SVC, heart)', creators: 'HuBMAP / Human Reference Atlas consortium', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Used only to place the schematic plexus and phrenic courses.' },
  ],
  license: 'nerves.glb as a whole is distributed under CC BY-SA 4.0 (Z-Anatomy-derived geometry).',
}, null, 1));
log('done', parts.length, 'parts');
