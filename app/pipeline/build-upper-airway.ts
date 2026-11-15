/**
 * Upper airway in the Visible Human Male body frame (decimetres, centred on the VHM skin; +X patient left, +Y up,
 * +Z anterior), lined up with body.glb, skeleton.glb and the tracheobronchial tree.
 *
 * Real anatomy (HuBMAP / Visible Human Male, CC BY 4.0): thyroid, cricoid, arytenoid and corniculate cartilages, the
 * epiglottic cartilage and the trachea with its cartilage rings.
 *
 * Landmark-positioned soft tissue (no open dataset has it for this body, so it is built here and labelled schematic):
 *  - vocal folds from the inner thyroid angle (anterior commissure) to each arytenoid's vocal process, vestibular
 *    folds above them, both measured from the cartilages;
 *  - the cricothyroid membrane between the thyroid's inferior border and the cricoid arch, with its skin depth;
 *  - the pharynx (naso-, oro-, laryngopharynx to the oesophageal inlet) whose posterior wall follows the anterior
 *    surfaces of the fitted C1–C6 vertebral bodies;
 *  - the tongue between the lower incisors, the hard palate and the vallecula, and the soft palate with the uvula.
 *
 *   npm run asset:upper-airway        (needs public/models/skeleton.glb built first)
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { ROOT, log, readGLB, simplify, writeGLB, mergeGeos, subdivide, MeshoptSimplifier, type OutPart, V3 } from './common';
import { taubin } from './voxel';
await MeshoptSimplifier.ready; await MeshoptDecoder.ready;

const body = await readGLB('assets/source/VH_M_United.glb', /^VH_M_(skin|hyoid)$/);
const skinSrc = body.get('VH_M_skin')!; skinSrc.computeBoundingBox();
const C = skinSrc.boundingBox!.getCenter(new V3()); const S = 10;
const M = new THREE.Matrix4().makeScale(S, S, S).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const tf = (g: THREE.BufferGeometry) => { const h = g.clone(); h.applyMatrix4(M); h.computeVertexNormals(); h.computeBoundingBox(); return h; };
const lar = await readGLB('assets/source/3d-vh-m-larynx.glb'); const tra = await readGLB('assets/source/3d-vh-m-trachea.glb');
const L = (n: string) => tf(lar.get('VH_M_' + n)!);
const thyroid = L('thyroid_cartilage'), cricoid = L('cricoid_cartilage'), epiglottis = L('epiglottic_cartilage');
const aryR = L('arytenoid_cartilage_R'), aryL = L('arytenoid_cartilage_L'), corR = L('corniculate_cartilage_R'), corL = L('corniculate_cartilage_L');
const skin = tf(skinSrc); const hyoid = tf(body.get('VH_M_hyoid')!);

/* the fitted skeleton (bones in the same frame) */
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const sdoc = await io.read(path.join(ROOT, 'public/models/skeleton.glb')); const bones: Record<string, THREE.Vector3[]> = {};
for (const node of sdoc.getRoot().listNodes()) { const mesh = node.getMesh(); if (!mesh) continue; const p = mesh.listPrimitives()[0].getAttribute('POSITION')!; const m = new THREE.Matrix4().fromArray(node.getWorldMatrix()); bones[node.getName()] = Array.from({ length: p.getCount() }, (_, i) => new V3().fromArray(p.getElement(i, [])).applyMatrix4(m)); }
const verts = (g: THREE.BufferGeometry) => { const a = g.attributes.position; return Array.from({ length: a.count }, (_, i) => new V3().fromBufferAttribute(a, i)); };
const bbox = (g: THREE.BufferGeometry) => { g.computeBoundingBox(); return g.boundingBox!.clone(); };
const r3 = (p: THREE.Vector3) => p.toArray().map((x) => +x.toFixed(3));
const mean = (ps: THREE.Vector3[]) => ps.reduce((a, p) => a.add(p), new V3()).divideScalar(Math.max(1, ps.length));

/* ------------------------------------------------------------------ landmarks, measured */
const tb = bbox(thyroid), cb = bbox(cricoid), eb = bbox(epiglottis), hb = bbox(hyoid);
const thyV = verts(thyroid), criV = verts(cricoid);
// palate: lowest midline skull surface between the posterior palate edge and the alveolar ridge
const skullMid = bones.skull.filter((p) => Math.abs(p.x) < 0.03 && p.y < 7.6 && p.y > 7.1);
const palate = skullMid.filter((p) => p.z > 0.4 && p.z < 0.8); const palY = palate.reduce((s, p) => s + p.y, 0) / palate.length;
const palPostZ = Math.min(...palate.map((p) => p.z)); const incisorZ = Math.max(...skullMid.map((p) => p.z));
/** most anterior point of a vertebral body near the midline */
const antFace = (id: string) => { const ps = bones[id].filter((p) => Math.abs(p.x) < 0.06); const z = Math.max(...ps.map((p) => p.z)); const top = ps.filter((p) => p.z > z - 0.03); return mean(top); };
const VB = Object.fromEntries(['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'].map((id) => [id, antFace(id)]));
log('palate y', palY.toFixed(3), 'posterior edge z', palPostZ.toFixed(3), 'incisors z', incisorZ.toFixed(3));
log('vertebral anterior faces z', Object.entries(VB).map(([k, v]) => `${k}:${v.z.toFixed(2)}@${v.y.toFixed(2)}`).join(' '));

// vocal folds run (near-)horizontally from each arytenoid's vocal process to the anterior commissure, which sits on the
// inner surface of the thyroid angle at the same level (+1.5 mm). Measured, not textbook: this larynx's arytenoids sit
// forward, so its glottis is short (~8 mm vs 15–20 mm typical for an adult male) — reported in the mapping.
const vocalProcess = (ary: THREE.BufferGeometry) => { const vs = verts(ary); const b = bbox(ary); const low = vs.filter((p) => p.y < b.min.y + 0.45 * (b.max.y - b.min.y)); return low.reduce((a, p) => (p.z > a.z ? p : a)); };
const vpR = vocalProcess(aryR), vpL = vocalProcess(aryL);
const vfY = (vpR.y + vpL.y) / 2 + 0.015;
const angle = thyV.filter((p) => Math.abs(p.x) < 0.015 && Math.abs(p.y - vfY) < 0.015);
const commissure = new V3(0, vfY, Math.min(...angle.map((p) => p.z)) - 0.003);
// cricothyroid membrane: thyroid inferior border and cricoid arch superior border, anterior midline
const thyLow = thyV.filter((p) => Math.abs(p.x) < 0.012 && p.z > tb.getCenter(new V3()).z).reduce((a, p) => (p.y < a.y ? p : a));
const criUp = criV.filter((p) => Math.abs(p.x) < 0.012 && p.z > cb.getCenter(new V3()).z).reduce((a, p) => (p.y > a.y ? p : a));
log('commissure', r3(commissure), 'vocal processes', r3(vpR), r3(vpL), 'glottis length mm', (commissure.distanceTo(vpR.clone().lerp(vpL, 0.5)) * 100).toFixed(0));
log('thyroid lower border', r3(thyLow), 'cricoid upper border', r3(criUp), 'membrane height mm', ((thyLow.y - criUp.y) * 100).toFixed(1));

/* ------------------------------------------------------------------ geometry builders */
/** loft elliptical sections (half-width a along `side`, half-depth b along the in-plane normal) along a centreline */
function loft(ctrl: THREE.Vector3[], sec: (u: number) => { a: number; b: number; off?: number }, opts: { n?: number; seg?: number; caps?: boolean; side?: THREE.Vector3 } = {}) {
  const curve = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal'); const n = opts.n ?? 48, seg = opts.seg ?? 28; const side0 = opts.side ?? new V3(1, 0, 0);
  const pos: number[] = []; const idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n; const p = curve.getPointAt(u); const t = curve.getTangentAt(u).normalize(); const sd = side0.clone().addScaledVector(t, -side0.dot(t)).normalize(); const nm = t.clone().cross(sd).normalize();
    const { a, b, off = 0 } = sec(u);
    for (let j = 0; j < seg; j++) { const th = (j / seg) * Math.PI * 2; const q = p.clone().addScaledVector(sd, Math.cos(th) * a).addScaledVector(nm, Math.sin(th) * b + off); pos.push(q.x, q.y, q.z); }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < seg; j++) { const a = i * seg + j, b = i * seg + ((j + 1) % seg), c = (i + 1) * seg + j, d = (i + 1) * seg + ((j + 1) % seg); idx.push(a, c, b, b, c, d); }
  if (opts.caps) for (const [ring, flip] of [[0, true], [n, false]] as const) { const cIdx = pos.length / 3; const cp = curve.getPointAt(ring / n); pos.push(cp.x, cp.y, cp.z); for (let j = 0; j < seg; j++) { const a = ring * seg + j, b = ring * seg + ((j + 1) % seg); if (flip) idx.push(cIdx, b, a); else idx.push(cIdx, a, b); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
/** a fold: a wedge from `a` to `b`, its free edge pointing along `medial`, base toward `lateral` */
function fold(a: THREE.Vector3, b: THREE.Vector3, medial: THREE.Vector3, width: number, height: number) {
  const n = 16; const pos: number[] = []; const idx: number[] = []; const up = new V3(0, 1, 0);
  for (let i = 0; i <= n; i++) {
    const u = i / n; const p = a.clone().lerp(b, u); const taper = Math.sin(Math.PI * Math.min(1, u * 1.05)) * 0.6 + 0.4; const w = width * taper, h = height * taper;
    const edge = p.clone().addScaledVector(medial, w * 0.5); const top = p.clone().addScaledVector(medial, -w * 0.5).addScaledVector(up, h * 0.5); const bot = p.clone().addScaledVector(medial, -w * 0.5).addScaledVector(up, -h * 0.5);
    pos.push(edge.x, edge.y, edge.z, top.x, top.y, top.z, bot.x, bot.y, bot.z);
  }
  for (let i = 0; i < n; i++) { const k = i * 3, m = (i + 1) * 3; idx.push(k, m, k + 1, k + 1, m, m + 1, k, k + 2, m, k + 2, m + 2, m, k + 1, m + 1, k + 2, k + 2, m + 1, m + 2); }
  idx.push(0, 1, 2, n * 3, n * 3 + 2, n * 3 + 1);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const s = subdivide(g); taubin(s, 3); s.computeVertexNormals(); return s;
}
const smooth = (g: THREE.BufferGeometry, k = 1) => { let s = g; for (let i = 0; i < k; i++) s = subdivide(s); taubin(s, 4); s.computeVertexNormals(); return s; };

/* ------------------------------------------------------------------ parts */
const parts: OutPart[] = [];
const add = (id: string, role: string, geo: THREE.BufferGeometry, label: string, extras: Record<string, unknown> = {}) => { geo.computeVertexNormals(); parts.push({ id, role, geo, extras: { label, ...extras } }); log(id, geo.index!.count / 3); };
const real = { source: 'HuBMAP' }; const schematic = { source: 'landmark-positioned', schematic: true };

add('thyroid_cartilage', 'cartilage', thyroid, 'Thyroid cartilage', real);
add('cricoid_cartilage', 'cartilage', cricoid, 'Cricoid cartilage', real);
add('arytenoid_R', 'cartilage', aryR, 'Right arytenoid cartilage', real); add('arytenoid_L', 'cartilage', aryL, 'Left arytenoid cartilage', real);
add('corniculate_R', 'cartilage', corR, 'Right corniculate cartilage', real); add('corniculate_L', 'cartilage', corL, 'Left corniculate cartilage', real);
add('epiglottis', 'epiglottis', smooth(epiglottis, 0), 'Epiglottis', real);
add('trachea', 'airway', simplify(tf(tra.get('VH_M_trachea')!), 0.6, 0.002), 'Trachea', real);
add('tracheal_rings', 'cartilage', simplify(tf(tra.get('VH_M_tracheal_cartilage')!), 0.5, 0.002), 'Tracheal cartilages', real);

// vocal and vestibular folds (glottis held in quiet-breathing abduction; the app can rotate them about the arytenoids)
const midVP = vpR.clone().lerp(vpL, 0.5);
for (const [s, vp] of [['R', vpR], ['L', vpL]] as const) {
  const lateral = new V3(s === 'L' ? 1 : -1, 0, 0); const medial = lateral.clone().negate();
  const vp2 = vp.clone(); // vocal process tip
  add('vocal_fold_' + s, 'fold', fold(commissure.clone().addScaledVector(lateral, 0.004), vp2, medial, 0.05, 0.035), (s === 'L' ? 'Left' : 'Right') + ' vocal fold', schematic);
  const vestA = commissure.clone().add(new V3(0, 0.045, 0.004)).addScaledVector(lateral, 0.012); const vestB = vp2.clone().add(new V3(0, 0.05, -0.01)).addScaledVector(lateral, 0.02);
  add('vestibular_fold_' + s, 'fold', fold(vestA, vestB, medial, 0.04, 0.03), (s === 'L' ? 'Left' : 'Right') + ' vestibular (false) fold', schematic);
}

// cricothyroid membrane: a thin curved sheet between the two borders, ~2 cm wide
{
  const W = 0.1, nx = 12, ny = 6; const pos: number[] = []; const idx: number[] = []; const cc = cb.getCenter(new V3());
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const x = (i / nx - 0.5) * 2 * W; const v = j / ny; const y = criUp.y + (thyLow.y - criUp.y) * v;
    const zMid = criUp.z + (thyLow.z - criUp.z) * v; const r = Math.max(0.05, zMid - cc.z); const z = cc.z + Math.sqrt(Math.max(0, r * r - x * x)); // follows the cricoid's curvature
    pos.push(x, y, z);
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  add('cricothyroid_membrane', 'membrane', g, 'Cricothyroid membrane', schematic);
}
const ctm = thyLow.clone().lerp(criUp, 0.5);
const skinBvh = new MeshBVH(skin); const ray = new THREE.Ray(ctm.clone(), new V3(0, 0, 1)); const skinHit = skinBvh.raycastFirst(ray, THREE.DoubleSide);
const ctmDepthMm = skinHit ? skinHit.distance * 100 : null;
log('cricothyroid membrane centre', r3(ctm), 'skin depth', ctmDepthMm?.toFixed(1), 'mm');

// pharynx: posterior wall 4–8 mm in front of the vertebral bodies (prevertebral tissue), lumen centre in front of it
const prev = (y: number) => 0.04 + 0.04 * THREE.MathUtils.smoothstep(VB.C2.y - y, 0, VB.C2.y - VB.C6.y); // thicker lower down
const wallZ = (id: string) => VB[id].z + prev(VB[id].y);
const epiTip = verts(epiglottis).reduce((a, p) => (p.y > a.y ? p : a));
const nasoTop = new V3(0, palY + 0.3, (VB.C1.z + 0.1 + palPostZ) / 2);
const pharCtrl = [
  nasoTop,
  new V3(0, palY + 0.12, wallZ('C1') + 0.08),
  new V3(0, VB.C2.y, wallZ('C2') + 0.07),
  new V3(0, epiTip.y + 0.02, wallZ('C3') + 0.07),
  new V3(0, (VB.C4.y + VB.C5.y) / 2, wallZ('C4') + 0.05),
  new V3(0, cb.min.y + 0.04, Math.max(wallZ('C6') + 0.025, cb.min.z - 0.04)),
  new V3(0, cb.min.y - 0.12, wallZ('C7') + 0.02),
];
const pharynx = loft(pharCtrl, (u) => {
  // naso ≈ 2.8 × 1.6 cm, oro ≈ 3.4 × 1.4 cm, hypopharynx flattening behind the larynx, collapsed oesophageal inlet
  const k = [[0, 0.13, 0.07], [0.2, 0.15, 0.075], [0.45, 0.17, 0.07], [0.68, 0.16, 0.04], [0.86, 0.1, 0.02], [1, 0.08, 0.012]];
  let i = 0; while (i < k.length - 2 && u > k[i + 1][0]) i++; const f = (u - k[i][0]) / (k[i + 1][0] - k[i][0]);
  return { a: k[i][1] + (k[i + 1][1] - k[i][1]) * f, b: k[i][2] + (k[i + 1][2] - k[i][2]) * f };
}, { n: 60, seg: 32 });
add('pharynx', 'mucosa', pharynx, 'Pharynx', { ...schematic, regions: { naso: [0, 0.2], oro: [0.2, 0.55], laryngo: [0.55, 0.9], oesophageal_inlet: [0.9, 1] } });

// soft palate + uvula: from the posterior hard-palate edge, posteroinferiorly ~3.5 cm
const spA = new V3(0, palY - 0.01, palPostZ); const spDir = new V3(0, -0.62, -0.78).normalize();
const softPalate = loft([spA, spA.clone().addScaledVector(spDir, 0.18), spA.clone().addScaledVector(spDir, 0.33), spA.clone().addScaledVector(spDir, 0.42).add(new V3(0, -0.04, 0.01))],
  (u) => ({ a: u < 0.75 ? 0.17 - 0.06 * u : 0.11 * (1 - (u - 0.75) / 0.25) * 0.6 + 0.025, b: u < 0.75 ? 0.035 : 0.025 }), { n: 30, seg: 22, caps: true });
add('soft_palate', 'mucosa', softPalate, 'Soft palate and uvula', schematic);

// tongue: tip behind the lower incisors, dorsum under the hard palate, base facing the oropharynx, root to the vallecula/hyoid
const tongueCtrl = [
  new V3(0, palY - 0.1, incisorZ - 0.12),
  new V3(0, palY - 0.16, palPostZ + 0.2),
  new V3(0, palY - 0.24, palPostZ - 0.02),
  new V3(0, epiTip.y + 0.05, epiTip.z + 0.07),
  new V3(0, hb.max.y + 0.02, hb.getCenter(new V3()).z - 0.02),
];
const tongue = loft(tongueCtrl, (u) => ({ a: 0.1 + 0.15 * Math.sin(Math.PI * Math.min(1, u * 1.6 + 0.12)) * (1 - 0.35 * u), b: 0.07 + 0.12 * Math.sin(Math.PI * Math.min(1, u * 1.3 + 0.1)) }), { n: 40, seg: 28, caps: true, side: new V3(1, 0, 0) });
add('tongue', 'tongue', smooth(tongue, 0), 'Tongue', schematic);

/* ------------------------------------------------------------------ output */
await writeGLB('public/models/upper-airway.glb', parts, {
  cartilage: { color: [0.82, 0.86, 0.88], rough: 0.4 }, epiglottis: { color: [0.86, 0.72, 0.68], rough: 0.4 }, airway: { color: [0.8, 0.66, 0.62], rough: 0.45 },
  fold: { color: [0.94, 0.86, 0.8], rough: 0.35 }, membrane: { color: [0.62, 0.84, 0.9], rough: 0.3 }, mucosa: { color: [0.86, 0.52, 0.52], rough: 0.4 }, tongue: { color: [0.78, 0.4, 0.42], rough: 0.5 },
  default: { color: [0.8, 0.6, 0.6], rough: 0.5 },
});
const centres: Record<string, number[]> = {}; const labels: Record<string, string> = {};
for (const p of parts) { centres[p.id] = r3(bbox(p.geo).getCenter(new V3())); labels[p.id] = String(p.extras!.label); }
fs.writeFileSync(path.join(ROOT, 'public/models/upper-airway.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior', centres, labels,
  landmarks: {
    anteriorCommissure: r3(commissure), vocalProcessR: r3(vpR), vocalProcessL: r3(vpL), glottisLengthMm: +(commissure.distanceTo(midVP) * 100).toFixed(1), glottisNote: 'Measured from the HuBMAP cartilages: this larynx has forward-set arytenoids and a short membranous glottis (typical adult male 15–20 mm).',
    cricothyroidMembrane: { centre: r3(ctm), thyroidLowerBorder: r3(thyLow), cricoidUpperBorder: r3(criUp), heightMm: +((thyLow.y - criUp.y) * 100).toFixed(1), skinDepthMm: ctmDepthMm == null ? null : +ctmDepthMm.toFixed(1) },
    epiglottisTip: r3(epiTip), hyoid: r3(hb.getCenter(new V3())), palateY: +palY.toFixed(3), vertebralFaces: Object.fromEntries(Object.entries(VB).map(([k, v]) => [k, r3(v)])),
  },
  schematic: 'Cartilages, epiglottis and trachea are HuBMAP meshes. Vocal/vestibular folds, cricothyroid membrane, pharynx, tongue and soft palate are built from measured landmarks (cartilages, hyoid, fitted skull, mandible and cervical spine) and are schematic in shape.',
  attribution: { title: '3D Reference Organs: Visible Human Male (larynx, trachea, hyoid)', creators: 'HuBMAP / Human Reference Atlas consortium', data: 'Visible Human Male, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Cartilages and trachea used as published (simplified); soft tissue generated from landmarks measured on them and on the fitted skeleton.' },
}, null, 1));
log('done', parts.length, 'parts');
