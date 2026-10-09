/**
 * Heart internals on the HuBMAP / Visible Human Male heart (CC BY 4.0), in the body frame shared by lines.glb
 * (decimetres, centred on the VHM skin; +X patient left, +Y up, +Z anterior).
 *
 *  - Papillary muscles: the five HuBMAP meshes (LV anterolateral / posteromedial; RV anterior / posterior / septal),
 *    smoothed by subdivision.
 *  - Chordae tendineae: from each papillary tip to the free (ventricular) edge of its valve, fanned around the leaflets
 *    by angular sector. Placement is measured from the meshes; the chordal pattern itself is schematic.
 *  - Conduction system: SA and AV node at the HuBMAP node tissue-block sites (projected onto the right atrium), His
 *    bundle through the central fibrous body to the crest of the muscular septum, right bundle branch down the RV
 *    septal surface and along the moderator band to the anterior papillary muscle, left bundle fanning into anterior,
 *    posterior and septal fascicles toward the two LV papillary muscles, and a Purkinje network grown over the lower
 *    two-thirds of both ventricular endocardia. Routes follow the real endocardial surfaces; the fibre pattern is
 *    schematic (no imaging source resolves it).
 *
 * Every conduction vertex carries `_ACT` = normal activation time in ms after the SA node fires (nodes, AV delay and
 * conduction velocities from standard physiology), so the app can sweep the impulse and model blocks by delaying a
 * branch.  Velocities (m/s): atrial 1.0, AV node 0.05, His–bundles 2, Purkinje 3.
 *
 *   npm run asset:heart-internals        (source: assets/source/VH_M_United.glb, HuBMAP v1.1)
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { ROOT, log, readGLB, writeGLB, mergeGeos, MeshoptSimplifier, type OutPart, V3 } from './common';
import { taubin } from './voxel';
import { LM, SEPTUM_N } from '../src/heart/heartGeometry';
await MeshoptSimplifier.ready;

let seed = 4242; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const body = await readGLB('assets/source/VH_M_United.glb', /^VH_M_(skin|heart_.*|papillary_.*|left_cardiac_atrium|right_cardiac_atrium|interventricular_septum|mitral_valve|tricuspid_valve)$/);
const pick = (re: RegExp) => [...body.entries()].filter(([n]) => re.test(n)).map(([, g]) => g);
const skinSrc = pick(/VH_M_skin$/)[0]; skinSrc.computeBoundingBox();
const C = skinSrc.boundingBox!.getCenter(new V3()); const S = 10;
const M = new THREE.Matrix4().makeScale(S, S, S).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const tf = (g: THREE.BufferGeometry) => { const h = g.clone(); h.applyMatrix4(M); h.computeVertexNormals(); h.computeBoundingBox(); return h; };
const T = (re: RegExp) => { const gs = pick(re).map(tf); if (!gs.length) throw new Error('missing ' + re); return gs.length > 1 ? mergeGeos(gs) : gs[0]; };
const centroid = (g: THREE.BufferGeometry) => { const a = g.attributes.position; const c = new V3(); for (let i = 0; i < a.count; i++) c.add(new V3().fromBufferAttribute(a, i)); return c.divideScalar(a.count); };
const verts = (g: THREE.BufferGeometry) => { const a = g.attributes.position; return Array.from({ length: a.count }, (_, i) => new V3().fromBufferAttribute(a, i)); };

const lv = T(/VH_M_heart_left_ventricle$/), rv = T(/VH_M_heart_right_ventricle$/), septum = T(/VH_M_interventricular_septum$/), ra = T(/VH_M_right_cardiac_atrium$/);
const mitral = T(/VH_M_mitral_valve$/), tricuspid = T(/VH_M_tricuspid_valve$/);
const B = (gs: THREE.BufferGeometry[]) => gs.map((g) => new MeshBVH(g));
const LVW = B([lv, septum]), RVW = B([rv, septum]), RAW = B([ra]);
const tq = { point: new V3(), distance: 0, faceIndex: 0 } as any;
const closestOn = (bs: MeshBVH[], p: THREE.Vector3) => { let best = Infinity; let q = p.clone(); for (const b of bs) { b.closestPointToPoint(p, tq); if (tq.distance < best) { best = tq.distance; q = tq.point.clone(); } } return { q, d: best }; };
/** snap a point to the endocardium seen from inside the cavity, lifted `lift` toward the cavity */
const onWall = (bs: MeshBVH[], p: THREE.Vector3, lift = 0.008) => { const { q } = closestOn(bs, p); const n = p.clone().sub(q); const l = n.length(); return l > 1e-6 ? q.add(n.multiplyScalar(lift / l)) : q; };

/* ------------------------------------------------------------------ geometry helpers */
const parts: OutPart[] = [];
const subdiv = (g: THREE.BufferGeometry) => { // midpoint subdivision + Taubin: smooth, non-shrinking
  const p = g.attributes.position; const ix = g.index!.array; const pos: number[] = Array.from(p.array as Float32Array); const mid = new Map<string, number>(); const out: number[] = [];
  const m = (a: number, b: number) => { const k = a < b ? a + '_' + b : b + '_' + a; let v = mid.get(k); if (v === undefined) { v = pos.length / 3; pos.push((pos[a * 3] + pos[b * 3]) / 2, (pos[a * 3 + 1] + pos[b * 3 + 1]) / 2, (pos[a * 3 + 2] + pos[b * 3 + 2]) / 2); mid.set(k, v); } return v; };
  for (let t = 0; t < ix.length; t += 3) { const a = ix[t], b = ix[t + 1], c = ix[t + 2]; const ab = m(a, b), bc = m(b, c), ca = m(c, a); out.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca); }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setIndex(out); taubin(r, 6); r.computeVertexNormals(); return r;
};
/** a tube along a polyline with per-vertex activation time (ms) interpolated from t0 → t1 by arc length */
function tube(pts: THREE.Vector3[], r: number, t0: number, velMs: number, seg = 6) {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'); const len = curve.getLength();
  const n = Math.max(4, Math.ceil(len / 0.01)); const g = new THREE.TubeGeometry(curve, n, r, seg, false);
  const act = new Float32Array(g.attributes.position.count); const ring = seg + 1;
  for (let i = 0; i <= n; i++) for (let j = 0; j < ring; j++) act[i * ring + j] = t0 + ((i / n) * len * 100) / velMs; // dm→mm ÷ (mm/ms)
  g.setAttribute('_act', new THREE.BufferAttribute(act, 1)); g.deleteAttribute('uv'); return { g, len, t1: t0 + (len * 100) / velMs };
}
const blob = (c: THREE.Vector3, axis: THREE.Vector3, rLong: number, rShort: number, t: number) => {
  const g = new THREE.SphereGeometry(1, 18, 12); g.deleteAttribute('uv'); const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), axis.clone().normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(c, q, new V3(rShort, rLong, rShort))); g.setAttribute('_act', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(t), 1)); return g;
};
const join = (gs: THREE.BufferGeometry[]) => { // merge keeping _act
  const pos: number[] = [], act: number[] = [], idx: number[] = []; let off = 0;
  for (const g of gs) { const p = g.attributes.position, a = g.attributes._act; for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); act.push(a ? a.getX(i) : 0); } const ix = g.index!.array; for (let i = 0; i < ix.length; i++) idx.push(ix[i] + off); off += p.count; }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setAttribute('_act', new THREE.Float32BufferAttribute(act, 1)); r.setIndex(idx); r.computeVertexNormals(); return r;
};
const add = (id: string, role: string, geo: THREE.BufferGeometry, label: string, extras: Record<string, unknown> = {}) => { parts.push({ id, role, geo, extras: { label, ...extras } }); log(id, geo.index!.count / 3, 'tris'); };
/** densify a polyline (step ~3 mm) and keep it on a wall */
/** densify a control polyline (~3 mm) and project it RADIALLY from the chamber's cavity centre onto the endocardium
    (closest-point snapping can jump between walls); then relax once and re-project so the route stays smooth */
const CAV = new Map<MeshBVH[], THREE.Vector3>();
const along = (bs: MeshBVH[], ctrl: THREE.Vector3[], lift = 0.008) => {
  const cav = CAV.get(bs)!; const ray = new THREE.Ray();
  const proj = (p: THREE.Vector3) => { const d = p.clone().sub(cav); const L = d.length(); if (L < 1e-6) return p.clone(); ray.set(cav, d.divideScalar(L)); let hd = Infinity; for (const b of bs) { const h = b.raycastFirst(ray, THREE.DoubleSide); if (h && h.distance < hd) hd = h.distance; } return Number.isFinite(hd) ? cav.clone().addScaledVector(ray.direction, Math.max(0, hd - lift)) : onWall(bs, p, lift); };
  const c = new THREE.CatmullRomCurve3(ctrl.length > 1 ? ctrl : [ctrl[0], ctrl[0].clone().add(new V3(1e-4, 0, 0))], false, 'centripetal'); const n = Math.max(3, Math.ceil(c.getLength() / 0.03));
  let out = c.getSpacedPoints(n).map(proj);
  for (let k = 0; k < 2; k++) out = out.map((p, i) => (i === 0 || i === out.length - 1 ? p : proj(out[i - 1].clone().add(out[i + 1]).multiplyScalar(0.25).addScaledVector(p, 0.5))));
  return out;
};

CAV.set(LVW, LM.lv.clone().lerp(LM.lvApex, 0.3)); CAV.set(RVW, LM.rv.clone());
/* ------------------------------------------------------------------ papillary muscles */
const PAP: [string, string, 'LV' | 'RV', string][] = [
  ['anterolateral', 'pap_lv_anterolateral', 'LV', 'Anterolateral papillary muscle (LV)'], ['posteromedial', 'pap_lv_posteromedial', 'LV', 'Posteromedial papillary muscle (LV)'],
  ['anterior', 'pap_rv_anterior', 'RV', 'Anterior papillary muscle (RV)'], ['posterior', 'pap_rv_posterior', 'RV', 'Posterior papillary muscle (RV)'], ['medial', 'pap_rv_septal', 'RV', 'Septal papillary muscle (RV)'],
];
const pap: Record<string, { tip: THREE.Vector3; base: THREE.Vector3; side: 'LV' | 'RV' }> = {};
for (const [src, id, side, label] of PAP) {
  const g = T(new RegExp('VH_M_papillary_muscle_of_heart_' + src + '$')); const valveC = centroid(side === 'LV' ? mitral : tricuspid);
  const vs = verts(g); const d = vs.map((v) => v.distanceTo(valveC)); const dmin = Math.min(...d), dmax = Math.max(...d);
  const tip = vs.filter((_, i) => d[i] < dmin + 0.1 * (dmax - dmin)).reduce((a, v) => a.add(v), new V3()).divideScalar(vs.filter((_, i) => d[i] < dmin + 0.1 * (dmax - dmin)).length);
  const base = vs.filter((_, i) => d[i] > dmax - 0.1 * (dmax - dmin)).reduce((a, v) => a.add(v), new V3()).divideScalar(vs.filter((_, i) => d[i] > dmax - 0.1 * (dmax - dmin)).length);
  pap[id] = { tip, base, side }; add(id, 'papillary', subdiv(g), label);
}

/* ------------------------------------------------------------------ chordae tendineae */
function chordae(valve: THREE.BufferGeometry, apex: THREE.Vector3, ids: string[], label: string, id: string) {
  const c = centroid(valve); const ax = apex.clone().sub(c).normalize(); const vs = verts(valve);
  const u = new V3(1, 0, 0).cross(ax).normalize(); const w = ax.clone().cross(u);
  // free edge: per angular bin around the valve axis, the vertex reaching furthest into the ventricle
  const BINS = 36; const edge: (THREE.Vector3 | null)[] = Array(BINS).fill(null); const best = Array(BINS).fill(-Infinity);
  for (const v of vs) { const d = v.clone().sub(c); const h = d.dot(ax); const ang = Math.atan2(d.dot(w), d.dot(u)); const b = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * BINS) % BINS; if (h > best[b]) { best[b] = h; edge[b] = v; } }
  const tubes: THREE.BufferGeometry[] = []; let n = 0;
  for (const e of edge) {
    if (!e) continue; const owner = ids.map((k) => pap[k]).reduce((a, b) => (a.tip.distanceTo(e) < b.tip.distanceTo(e) ? a : b));
    const mid = owner.tip.clone().lerp(e, 0.45).addScaledVector(ax, -0.02);
    const start = owner.tip.clone().add(new V3((rnd() - 0.5) * 0.02, (rnd() - 0.5) * 0.02, (rnd() - 0.5) * 0.02));
    tubes.push(tube([start, mid, e], 0.0045, 0, 1, 5).g); n++;
  }
  add(id, 'chordae', join(tubes), label, { count: n });
}
chordae(mitral, LM.lvApex, ['pap_lv_anterolateral', 'pap_lv_posteromedial'], 'Chordae tendineae (mitral)', 'chordae_mitral');
const rvApex = onWall(RVW, LM.rv.clone().add(LM.lvApex.clone().sub(LM.lv).multiplyScalar(0.9)), 0);
chordae(tricuspid, rvApex, ['pap_rv_anterior', 'pap_rv_posterior', 'pap_rv_septal'], 'Chordae tendineae (tricuspid)', 'chordae_tricuspid');

/* ------------------------------------------------------------------ conduction system */
const V = { atrial: 1.0, node: 0.05, his: 2.0, bundle: 2.0, purkinje: 3.0 }; // mm/ms (= m/s)
const sa0 = centroid(T(/VH_M_heart_HuBMAP_RA_SA_node$/)); const av0 = centroid(T(/VH_M_heart_HuBMAP_RA_AV_node$/));
const saC = closestOn(RAW, sa0).q; const avC = onWall(RAW, closestOn(RAW, av0).q.lerp(LM.tricuspid, 0.0), 0.004);
const saAxis = new V3(0.15, 1, -0.2); // along the crista terminalis toward the SVC
const T_AV = 40; // ms: SA → AV node through atrial muscle (≈ interatrial conduction time)
const T_HIS = 40 + 80; // AV-nodal delay ≈ 80 ms → PR ≈ 160 ms including His–Purkinje
add('sa_node', 'node', blob(saC, saAxis, 0.075, 0.022, 0), 'Sinoatrial (SA) node');
add('av_node', 'node', blob(avC, new V3(0.6, 0.2, 0.75), 0.03, 0.014, T_AV), 'Atrioventricular (AV) node');

// His: AV node → central fibrous body → crest of the muscular septum just below the membranous septum
const crest = LM.vsdPerimembranous.clone().addScaledVector(SEPTUM_N, -0.027).add(new V3(0.02, -0.06, 0.02));
const hisPath = [avC, avC.clone().lerp(crest, 0.5).add(new V3(0, -0.01, 0)), crest];
const his = tube(hisPath, 0.012, T_HIS, V.his); add('his', 'conduction', join([his.g]), 'Bundle of His', { t0: T_HIS, t1: +his.t1.toFixed(1) });
const tB = his.t1;

// apex direction along the septum
const sepC = LM.septum; const apexDir = LM.lvApex.clone().sub(crest).normalize();
const onLV = (p: THREE.Vector3) => p.clone().addScaledVector(SEPTUM_N, -0.06); // nudge toward the LV cavity before snapping
const onRV = (p: THREE.Vector3) => p.clone().addScaledVector(SEPTUM_N, 0.06);

// right bundle: down the RV septal surface, then the moderator band to the anterior papillary muscle base
const rbbWall = along(RVW, [crest, onRV(crest.clone().lerp(LM.lvApex, 0.3)), onRV(crest.clone().lerp(LM.lvApex, 0.62))]);
const modBand = [rbbWall[rbbWall.length - 1], rbbWall[rbbWall.length - 1].clone().lerp(pap.pap_rv_anterior.base, 0.5).addScaledVector(SEPTUM_N, 0.03), pap.pap_rv_anterior.base];
const rbb1 = tube(rbbWall, 0.009, tB, V.bundle); const rbb2 = tube(modBand, 0.008, rbb1.t1, V.bundle);
add('rbb', 'conduction', join([rbb1.g, rbb2.g]), 'Right bundle branch (with moderator band)', { t0: +tB.toFixed(1), t1: +rbb2.t1.toFixed(1) });

// left bundle: fans on the LV septal surface into three fascicles
const lbbStem = along(LVW, [crest, onLV(crest.clone().lerp(sepC, 0.35))]);
const stem = tube(lbbStem, 0.011, tB, V.bundle); const fork = lbbStem[lbbStem.length - 1];
const fasc = (to: THREE.Vector3, via: number) => tube(along(LVW, [fork, onLV(fork.clone().lerp(to, via)), to]), 0.008, stem.t1, V.bundle);
const lafT = fasc(pap.pap_lv_anterolateral.base, 0.5), lpfT = fasc(pap.pap_lv_posteromedial.base, 0.5), lsfT = fasc(onWall(LVW, onLV(crest.clone().lerp(LM.lvApex, 0.75))), 0.5);
add('lbb', 'conduction', join([stem.g]), 'Left bundle branch', { t0: +tB.toFixed(1), t1: +stem.t1.toFixed(1) });
add('lbb_anterior', 'conduction', join([lafT.g]), 'Left anterior fascicle', { t0: +stem.t1.toFixed(1), t1: +lafT.t1.toFixed(1) });
add('lbb_posterior', 'conduction', join([lpfT.g]), 'Left posterior fascicle', { t0: +stem.t1.toFixed(1), t1: +lpfT.t1.toFixed(1) });
add('lbb_septal', 'conduction', join([lsfT.g]), 'Left septal fascicle', { t0: +stem.t1.toFixed(1), t1: +lsfT.t1.toFixed(1) });

// Purkinje: Prim-style growth from the fascicle / bundle ends over the endocardium, lower two-thirds of each ventricle
function purkinje(walls: MeshBVH[], cavity: THREE.Vector3, roots: { p: THREE.Vector3; t: number }[], n: number, baseY: number) {
  const ray = new THREE.Ray(); const targets: THREE.Vector3[] = [];
  while (targets.length < n) {
    const d = new V3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1); if (d.lengthSq() > 1) continue; d.normalize(); ray.set(cavity, d);
    let hit: THREE.Vector3 | null = null; let hd = Infinity; for (const b of walls) { const h = b.raycastFirst(ray, THREE.DoubleSide); if (h && h.distance < hd) { hd = h.distance; hit = h.point; } }
    if (!hit || hit.y > baseY) continue; targets.push(hit.clone().add(cavity.clone().sub(hit).setLength(0.008)));
  }
  const tree = roots.map((r) => ({ p: r.p, t: r.t })); const tubes: THREE.BufferGeometry[] = []; const left = new Set(targets.map((_, i) => i));
  while (left.size) {
    let bi = -1, bj = -1, bd = Infinity; for (const i of left) for (let j = 0; j < tree.length; j++) { const d = targets[i].distanceTo(tree[j].p); if (d < bd) { bd = d; bi = i; bj = j; } }
    const pts = along(walls, [tree[bj].p, tree[bj].p.clone().lerp(targets[bi], 0.5).lerp(cavity, 0.08), targets[bi]]);
    const tb = tube(pts, 0.0035, tree[bj].t, V.purkinje, 4); tubes.push(tb.g); tree.push({ p: targets[bi], t: tb.t1 }); left.delete(bi);
  }
  return { g: join(tubes), tMax: Math.max(...tree.map((x) => x.t)) };
}
const lvCav = LM.lv.clone().lerp(LM.lvApex, 0.25); const rvCav = LM.rv.clone();
const baseY = (LM.mitral.y + LM.lvApex.y) / 2 + 0.06;
const pkLV = purkinje(LVW, lvCav, [{ p: onWall(LVW, pap.pap_lv_anterolateral.base), t: lafT.t1 }, { p: onWall(LVW, pap.pap_lv_posteromedial.base), t: lpfT.t1 }, { p: onWall(LVW, onLV(crest.clone().lerp(LM.lvApex, 0.75))), t: lsfT.t1 }], 70, baseY);
const pkRV = purkinje(RVW, rvCav, [{ p: pap.pap_rv_anterior.base, t: rbb2.t1 }, { p: rbbWall[rbbWall.length - 1], t: rbb1.t1 }], 45, baseY + 0.05);
add('purkinje_lv', 'purkinje', pkLV.g, 'Purkinje fibres (LV)', { tMax: +pkLV.tMax.toFixed(1) });
add('purkinje_rv', 'purkinje', pkRV.g, 'Purkinje fibres (RV)', { tMax: +pkRV.tMax.toFixed(1) });
log('AV node', avC.toArray().map((x) => x.toFixed(3)).join(','), 'crest', crest.toArray().map((x) => x.toFixed(3)).join(','), 'His length mm', (his.len * 100).toFixed(0));
log('activation: AV', T_AV, 'ms, His', T_HIS, '→', tB.toFixed(0), 'ms, last Purkinje LV', pkLV.tMax.toFixed(0), 'RV', pkRV.tMax.toFixed(0), 'ms');

await writeGLB('public/models/heart-internals.glb', parts, {
  papillary: { color: [0.62, 0.2, 0.18], rough: 0.5 }, chordae: { color: [0.94, 0.9, 0.82], rough: 0.4 },
  node: { color: [1.0, 0.78, 0.25], rough: 0.4 }, conduction: { color: [1.0, 0.72, 0.2], rough: 0.4 }, purkinje: { color: [0.98, 0.82, 0.4], rough: 0.4 },
  default: { color: [0.8, 0.6, 0.5], rough: 0.5 },
});
const out: Record<string, unknown> = {};
for (const p of parts) { p.geo.computeBoundingBox(); out[p.id] = { label: p.extras!.label, centre: p.geo.boundingBox!.getCenter(new V3()).toArray().map((x) => +x.toFixed(3)), ...Object.fromEntries(Object.entries(p.extras!).filter(([k]) => k !== 'label')) }; }
fs.writeFileSync(path.join(ROOT, 'public/models/heart-internals.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior', parts: out,
  activation: { attribute: '_ACT (ms after SA firing)', saToAv: T_AV, avNodalDelay: T_HIS - T_AV, hisStart: T_HIS, velocitiesMmPerMs: V, lastVentricularActivation: +Math.max(pkLV.tMax, pkRV.tMax).toFixed(1) },
  schematic: 'Papillary muscles and node sites are measured from HuBMAP. Chordal fan and conduction fibre routes follow the real endocardial surfaces, but the branching pattern is schematic.',
  attribution: { title: '3D Reference Organs: Visible Human Male (heart, papillary muscles, SA/AV node sites)', creators: 'HuBMAP / Human Reference Atlas consortium', data: 'Visible Human Male, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Papillary muscles subdivided and smoothed; chordae and conduction system generated on the HuBMAP endocardial surfaces.' },
}, null, 1));
log('done', parts.length, 'parts');
