/**
 * Heart interior architecture and conduction system on the HuBMAP / Visible Human Male heart (CC BY 4.0), in the
 * shared body frame (decimetres, centred on the VHM skin; +X patient left, +Y up, +Z anterior). Everything is placed
 * on the real chamber walls (closed myocardial shells: LV ~14 mm, RV ~6, LA ~5, RA ~3 mm in this heart) and anchored to
 * measured landmarks:
 *
 *   measured from HuBMAP          SA node and AV node tissue blocks (three independent groups: HuBMAP, SPARC, Pei —
 *                                 averaged), RA/LA appendage and sinus venarum blocks, SVC / IVC / coronary-sinus
 *                                 orifices (vessel vertices touching the RA), valve annuli, papillary muscles, fossa
 *                                 ovalis (closest approach of the two atrial septal walls)
 *   built on the real walls       trabeculae carneae (fine in the LV, coarse in the RV, apical two-thirds), pectinate
 *   (anatomically placed,         muscles (RA free wall from the crista terminalis into the auricle; LA auricle only),
 *    schematic in pattern)        crista terminalis, septomarginal trabecula (moderator band), supraventricular crest,
 *                                 limbus of the fossa ovalis, Eustachian and Thebesian valves, tendon of Todaro,
 *                                 chordae tendineae
 *   conduction system             SA node (spindle ~15×5 mm, subepicardial in the sulcus terminalis), Bachmann's bundle,
 *                                 internodal preferential pathways, compact AV node (~5×3 mm) at the apex of Koch's
 *                                 triangle with its inferior extension, penetrating + branching His bundle along the crest
 *                                 of the muscular septum, left bundle as a fanning subendocardial sheet with anterior,
 *                                 posterior and septal fascicles, right bundle (intramyocardial, then inside the moderator
 *                                 band), dense subendocardial Purkinje network incl. false tendons
 *
 * Every conduction vertex carries `_ACT` = normal activation time (ms after SA firing): atrial 1 m/s, AV node 0.05,
 * His/bundles 2, Purkinje 3 (standard physiology).
 *
 *   npm run asset:heart-internals        (source: assets/source/VH_M_United.glb, HuBMAP v1.1)
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { ROOT, log, readGLB, readGLBDecoded, writeGLB, mergeGeos, subdivide, MeshoptSimplifier, type OutPart, V3 } from './common';
import { taubin } from './voxel';
import { LM, SEPTUM_N, ATRIAL_N } from '../src/heart/heartGeometry';
await MeshoptSimplifier.ready;

let seed = 4242; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const rs = (a: number, b: number) => a + (b - a) * rnd();

const body = await readGLB('assets/source/VH_M_United.glb', /^VH_M_(skin|heart_.*|papillary_.*|left_cardiac_atrium|right_cardiac_atrium|interventricular_septum|mitral_valve|tricuspid_valve|aortic_valve|pulmonary_valve|superior_vena_cava|inferior_vena_cava_a|coronary_sinus)$/);
const pick = (re: RegExp) => [...body.entries()].filter(([n]) => re.test(n)).map(([, g]) => g);
const skinSrc = pick(/VH_M_skin$/)[0]; skinSrc.computeBoundingBox();
const C = skinSrc.boundingBox!.getCenter(new V3()); const S = 10;
const M = new THREE.Matrix4().makeScale(S, S, S).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
const tf = (g: THREE.BufferGeometry) => { const h = g.clone(); h.applyMatrix4(M); h.computeVertexNormals(); h.computeBoundingBox(); return h; };
const T = (re: RegExp) => { const gs = pick(re).map(tf); if (!gs.length) throw new Error('missing ' + re); return gs.length > 1 ? mergeGeos(gs) : gs[0]; };
const verts = (g: THREE.BufferGeometry) => { const a = g.attributes.position; return Array.from({ length: a.count }, (_, i) => new V3().fromBufferAttribute(a, i)); };
const mean = (ps: THREE.Vector3[]) => ps.reduce((a, p) => a.add(p), new V3()).divideScalar(Math.max(1, ps.length));
const bcen = (g: THREE.BufferGeometry) => { g.computeBoundingBox(); return g.boundingBox!.getCenter(new V3()); };
const r3 = (p: THREE.Vector3) => p.toArray().map((x) => +x.toFixed(4));

const lv = T(/VH_M_heart_left_ventricle$/), rv = T(/VH_M_heart_right_ventricle$/), septum = T(/VH_M_interventricular_septum$/);
const ra = T(/VH_M_right_cardiac_atrium$/), la = T(/VH_M_left_cardiac_atrium$/);
const mitral = T(/VH_M_mitral_valve$/), tricuspid = T(/VH_M_tricuspid_valve$/), aorticV = T(/VH_M_aortic_valve$/), pulmV = T(/VH_M_pulmonary_valve$/);
const svc = T(/VH_M_superior_vena_cava$/), ivc = T(/VH_M_inferior_vena_cava_a$/), cs = T(/VH_M_coronary_sinus$/);
const B = (gs: THREE.BufferGeometry[]) => gs.map((g) => new MeshBVH(g));
// second pass: once heart-hd.glb exists, everything is placed on the sculpted (trabeculated) walls the app shows
const HD = fs.existsSync(path.join(ROOT, 'public/models/heart-hd.glb')) ? await readGLBDecoded('public/models/heart-hd.glb') : null;
const wall = (id: string, src: THREE.BufferGeometry) => HD?.get(id) ?? src;
log(HD ? 'placing on the sculpted HD walls (heart-hd.glb)' : 'first pass: placing on the source walls');
// the septal endocardium is the LV / RV shells' own (the separate septum slab bulges into the LV cavity; not used)
const W = { LV: B([wall('lv', lv)]), RV: B([wall('rv', rv)]), RA: B([wall('ra', ra)]), LA: B([wall('la', la)]), ALL: B([wall('lv', lv), wall('rv', rv), wall('ra', ra), wall('la', la)]) };
const tq = { point: new V3(), distance: 0, faceIndex: 0 } as any;
const near = (bs: MeshBVH[], p: THREE.Vector3) => { let d = Infinity; let q = p.clone(); for (const b of bs) { b.closestPointToPoint(p, tq); if (tq.distance < d) { d = tq.distance; q = tq.point.clone(); } } return { q, d }; };

/* ------------------------------------------------------------------ measured landmarks */
const avgBlocks = (res: RegExp[]) => mean(res.flatMap((re) => pick(re).map((g) => bcen(tf(g)))));
const SA_BLOCK = avgBlocks([/VH_M_heart_HuBMAP_RA_SA_node$/, /VH_M_heart_Pei_RA_SA_node$/]);
const AV_BLOCK = avgBlocks([/VH_M_heart_HuBMAP_RA_AV_node$/, /VH_M_heart_Pei_RA_AV_node$/, /VH_M_heart_SPARC_AVN$/]);
const RAA = avgBlocks([/VH_M_heart_HuBMAP_RA_appendage$/, /VH_M_heart_SPARC_RAA$/]);
const LAA = avgBlocks([/VH_M_heart_HuBMAP_LA_appendage$/, /VH_M_heart_SPARC_LAA$/]);
const raBvh = W.RA[0];
const orifice = (g: THREE.BufferGeometry, tol = 0.06) => { const ps = verts(g).filter((v) => near([raBvh], v).d < tol); return mean(ps); };
const SVC_O = orifice(svc), IVC_O = orifice(ivc);
const CS_O = (() => { let best = new V3(), bd = 1e9; for (const v of verts(cs)) { const d = near([raBvh], v).d; if (d < bd) { bd = d; best = v; } } return best; })();
// central fibrous body (right fibrous trigone): where the mitral, tricuspid and aortic annuli meet, on the septal side
const annulusPoint = (g: THREE.BufferGeometry, toward: THREE.Vector3) => verts(g).reduce((a, v) => (v.distanceTo(toward) < a.distanceTo(toward) ? v : a));
const avgValves = mean([bcen(mitral), bcen(tricuspid), bcen(aorticV)]);
const CFB = mean([annulusPoint(mitral, avgValves), annulusPoint(tricuspid, avgValves), annulusPoint(aorticV, avgValves)]);
log('landmarks: SA block', r3(SA_BLOCK), 'AV block', r3(AV_BLOCK), 'SVC', r3(SVC_O), 'IVC', r3(IVC_O), 'CS ostium', r3(CS_O), 'CFB', r3(CFB));
log('Koch triangle: AV block→CS ostium', (AV_BLOCK.distanceTo(CS_O) * 100).toFixed(1), 'mm, AV block→CFB', (AV_BLOCK.distanceTo(CFB) * 100).toFixed(1), 'mm');

/* ------------------------------------------------------------------ wall projection */
/** cavity seeds (several per chamber: the RV is a crescent, the RA has an auricle) */
const rvApex = LM.rv.clone().add(LM.lvApex.clone().sub(LM.lv).multiplyScalar(0.9));
const SEEDS: Record<'LV' | 'RV' | 'RA' | 'LA', THREE.Vector3[]> = {
  LV: [LM.lv.clone().lerp(LM.lvApex, 0.25), LM.lv.clone().lerp(LM.lvApex, 0.6), LM.lv.clone().lerp(LM.mitral, 0.4)],
  RV: [LM.rv.clone(), LM.rvot.clone(), LM.rv.clone().lerp(rvApex, 0.5), LM.rv.clone().lerp(LM.tricuspid, 0.5)],
  RA: [LM.ra.clone(), LM.ra.clone().lerp(RAA, 0.6), LM.ra.clone().lerp(IVC_O, 0.5), LM.ra.clone().lerp(SVC_O, 0.5)],
  LA: [LM.la.clone(), LM.la.clone().lerp(LAA, 0.6)],
};
type Ch = keyof typeof SEEDS;
const ray = new THREE.Ray();
/** endocardial point under p (from the nearest cavity seed), moved `lift` into the cavity (negative = into the wall) */
function endo(ch: Ch, p: THREE.Vector3, lift = 0.004) {
  const seeds = [...SEEDS[ch]].sort((a, b) => a.distanceTo(p) - b.distanceTo(p));
  for (const s of seeds) {
    const d = p.clone().sub(s); const L = d.length(); if (L < 1e-5) continue; ray.set(s, d.divideScalar(L));
    let hd = Infinity; for (const b of W[ch]) { const h = b.raycastFirst(ray, THREE.DoubleSide); if (h && h.distance < hd) hd = h.distance; }
    if (Number.isFinite(hd)) return s.clone().addScaledVector(ray.direction, Math.max(0.002, hd - lift));
  }
  return near(W[ch], p).q;
}
const heartC = mean([LM.lv, LM.rv, LM.la, LM.ra]);
/** epicardial point over p (first hit coming in from outside the heart), moved `depth` under the epicardium */
function epi(p: THREE.Vector3, depth = 0.002) {
  const d = p.clone().sub(heartC).normalize(); ray.set(heartC.clone().addScaledVector(d, 1.2), d.clone().negate());
  let hd = Infinity; for (const b of W.ALL) { const h = b.raycastFirst(ray, THREE.DoubleSide); if (h && h.distance < hd) hd = h.distance; }
  return Number.isFinite(hd) ? ray.origin.clone().addScaledVector(ray.direction, hd + depth) : p.clone();
}
/** a smooth path through control points, densified (~2 mm) and each point re-projected */
function onSurf(ctrl: THREE.Vector3[], proj: (p: THREE.Vector3) => THREE.Vector3, step = 0.02, relax = 2) {
  const c = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal'); const n = Math.max(4, Math.ceil(c.getLength() / step));
  let pts = c.getSpacedPoints(n).map(proj);
  for (let k = 0; k < relax; k++) pts = pts.map((p, i) => (i === 0 || i === pts.length - 1 ? p : proj(pts[i - 1].clone().add(pts[i + 1]).multiplyScalar(0.25).addScaledVector(p, 0.5))));
  return pts;
}

/* ------------------------------------------------------------------ geometry builders */
interface Geo { g: THREE.BufferGeometry; t1: number; len: number }
/** tube with a radius profile r(u) and per-vertex activation time (t0 + arc / vel); vel 0 → constant t0 */
function tube(pts: THREE.Vector3[], r: number | ((u: number) => number), t0 = 0, vel = 0, seg = 8, flat = 1): Geo {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'); const len = curve.getLength(); const n = Math.max(4, Math.ceil(len / 0.008));
  const g = new THREE.TubeGeometry(curve, n, 1, seg, false); const p = g.attributes.position; const ring = seg + 1; const c = new V3(); const v = new V3();
  const frames = curve.computeFrenetFrames(n, false); const act = new Float32Array(p.count);
  for (let i = 0; i <= n; i++) {
    const u = i / n; const rr = typeof r === 'number' ? r : r(u); curve.getPointAt(u, c); const bn = frames.binormals[i];
    for (let j = 0; j < ring; j++) { const o = i * ring + j; v.fromBufferAttribute(p, o).sub(c); const along = v.dot(bn); v.addScaledVector(bn, along * (flat - 1)); v.multiplyScalar(rr).add(c); p.setXYZ(o, v.x, v.y, v.z); act[o] = vel > 0 ? t0 + (u * len * 100) / vel : t0; }
  }
  g.deleteAttribute('uv'); g.setAttribute('_act', new THREE.BufferAttribute(act, 1)); g.computeVertexNormals();
  return { g, t1: vel > 0 ? t0 + (len * 100) / vel : t0, len };
}
const spindle = (u: number, a: number, b = 0.25) => a * Math.max(b, Math.sin(Math.PI * Math.min(1, Math.max(0, u)))) ;
/** ellipsoid with constant activation time */
function blob(c: THREE.Vector3, axis: THREE.Vector3, rLong: number, rA: number, rB: number, side: THREE.Vector3, t: number) {
  const g = new THREE.SphereGeometry(1, 24, 16); g.deleteAttribute('uv');
  const y = axis.clone().normalize(); const x = side.clone().addScaledVector(y, -side.dot(y)).normalize(); const z = x.clone().cross(y);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(x.multiplyScalar(rA), y.multiplyScalar(rLong), z.multiplyScalar(rB)).setPosition(c));
  g.setAttribute('_act', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(t), 1)); g.computeVertexNormals(); return g;
}
/** a sheet that follows a wall: rows across a centreline, width w(u); activation = t0 + distance from the origin / vel */
function sheet(center: THREE.Vector3[], across: (p: THREE.Vector3, u: number) => THREE.Vector3, w: (u: number) => number, proj: (p: THREE.Vector3) => THREE.Vector3, thick: number, t0: number, vel: number, cols = 9) {
  const n = center.length; const pos: number[] = []; const act: number[] = []; const idx: number[] = []; const o = center[0];
  let arc = 0; const arcs = center.map((p, i) => (i ? (arc += p.distanceTo(center[i - 1])) : 0));
  const top: THREE.Vector3[][] = [];
  for (let i = 0; i < n; i++) { const u = i / (n - 1); const a = across(center[i], u).normalize(); const row: THREE.Vector3[] = [];
    for (let j = 0; j < cols; j++) { const s = (j / (cols - 1) - 0.5) * w(u); row.push(proj(center[i].clone().addScaledVector(a, s))); }
    top.push(row); }
  const nrm = (i: number, j: number) => { const a = top[Math.min(n - 1, i + 1)][j].clone().sub(top[Math.max(0, i - 1)][j]); const b = top[i][Math.min(cols - 1, j + 1)].clone().sub(top[i][Math.max(0, j - 1)]); return a.cross(b).normalize(); };
  for (const side of [1, -1]) for (let i = 0; i < n; i++) for (let j = 0; j < cols; j++) { const p = top[i][j].clone().addScaledVector(nrm(i, j), side * thick * 0.5); pos.push(p.x, p.y, p.z); act.push(t0 + ((arcs[i] + Math.abs(j / (cols - 1) - 0.5) * w(i / (n - 1))) * 100) / vel); }
  const off = n * cols;
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < cols - 1; j++) { const a = i * cols + j, b = a + 1, c = a + cols, d = c + 1; idx.push(a, c, b, b, c, d, off + a, off + b, off + c, off + b, off + d, off + c); }
  for (let i = 0; i < n - 1; i++) for (const j of [0, cols - 1]) { const a = i * cols + j, c = a + cols; idx.push(a, off + a, c, c, off + a, off + c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('_act', new THREE.Float32BufferAttribute(act, 1)); g.setIndex(idx); g.computeVertexNormals();
  void o; return { g, t1: t0 + (arc * 100) / vel };
}
const join = (gs: THREE.BufferGeometry[]) => {
  const pos: number[] = [], act: number[] = [], idx: number[] = []; let off = 0;
  for (const g of gs) { const p = g.attributes.position, a = g.attributes._act; for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); act.push(a ? a.getX(i) : 0); } const ix = g.index!.array; for (let i = 0; i < ix.length; i++) idx.push(ix[i] + off); off += p.count; }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setAttribute('_act', new THREE.Float32BufferAttribute(act, 1)); r.setIndex(idx); r.computeVertexNormals(); return r;
};
const parts: OutPart[] = [];
const add = (id: string, role: string, geo: THREE.BufferGeometry, label: string, extras: Record<string, unknown> = {}) => { parts.push({ id, role, geo, extras: { label, ...extras } }); log(id.padEnd(22), String(geo.index!.count / 3).padStart(6), 'tris'); };
const smooth = (g: THREE.BufferGeometry) => { const s = subdivide(g); taubin(s, 6); s.computeVertexNormals(); return s; };

/* ================================================================== interior architecture */
const LAX = LM.lvApex.clone().sub(LM.mitral).normalize(); // LV long axis, base → apex
const hFrac = (p: THREE.Vector3) => p.clone().sub(LM.mitral).dot(LAX) / LM.lvApex.clone().sub(LM.mitral).dot(LAX); // 0 base … 1 apex

/** trabeculae carneae: ridges and bridges along the apical endocardium; mostly along the long axis, interlacing */
function trabeculae(ch: 'LV' | 'RV', n: number, rMin: number, rMax: number, hMin: number) {
  const out: THREE.BufferGeometry[] = []; const sd = SEEDS[ch][0]; let made = 0, tries = 0;
  while (made < n && tries++ < n * 30) {
    const dir0 = new V3(rs(-1, 1), rs(-1, 1), rs(-1, 1)).normalize(); const p0 = endo(ch, sd.clone().addScaledVector(dir0, 0.5), 0);
    if (hFrac(p0) < hMin) continue; if (ch === 'RV' && near(B([septum]), p0).d < 0.01 && rnd() < 0.6) continue; // the RV septal surface is smoother above the moderator band
    let d = LAX.clone().multiplyScalar(rnd() < 0.5 ? 1 : -1).applyAxisAngle(new V3(rs(-1, 1), rs(-1, 1), rs(-1, 1)).normalize(), rs(-0.7, 0.7));
    const L = rs(0.1, ch === 'LV' ? 0.28 : 0.35); const steps = Math.ceil(L / 0.02); const pts = [p0]; let p = p0.clone();
    for (let k = 0; k < steps; k++) { const q = endo(ch, p.clone().addScaledVector(d, 0.02), 0); d = q.clone().sub(p).normalize().applyAxisAngle(new V3(rs(-1, 1), rs(-1, 1), rs(-1, 1)).normalize(), rs(-0.25, 0.25)); p = q; pts.push(q); }
    if (pts[0].distanceTo(pts[pts.length - 1]) < 0.06) continue;
    const r = rs(rMin, rMax); const bridge = rnd() < 0.3; // some trabeculae leave the wall in their middle (columns)
    const cav = SEEDS[ch][0]; const lifted = pts.map((q, i) => { const u = i / (pts.length - 1); const up = bridge ? Math.sin(Math.PI * u) * r * 2.4 : 0; return q.clone().addScaledVector(cav.clone().sub(q).normalize(), up - r * 0.35); });
    out.push(tube(lifted, (u) => r * (0.55 + 0.45 * Math.sin(Math.PI * u)), 0, 0, 6).g); made++;
  }
  return join(out);
}
// trabeculae carneae, pectinate muscles and the crista terminalis are sculpted into the endocardium itself by
// build-heart-hd.ts (wall relief); trabeculae() is kept for reference but not shipped
void trabeculae;

// crista terminalis: from the anterior rim of the SVC orifice down the lateral RA wall to the front of the IVC orifice
const lateralRA = LM.ra.clone().add(new V3(-0.12, 0, 0.04));
const cristaCtrl = [SVC_O.clone().lerp(RAA, 0.35), SVC_O.clone().lerp(lateralRA, 0.6), lateralRA, IVC_O.clone().lerp(lateralRA, 0.45), IVC_O.clone().lerp(LM.tricuspid, 0.2)];
const crista = onSurf(cristaCtrl, (p) => endo('RA', p, -0.003));



// fossa ovalis and its limbus (RA septal surface; the limbus is a horseshoe open inferiorly into the Eustachian ridge)
const fossaRA = endo('RA', LM.fossa.clone().addScaledVector(ATRIAL_N, -0.05), 0.0);
{
  const nrm = ATRIAL_N.clone(); const up = new V3(0, 1, 0).addScaledVector(nrm, -nrm.y).normalize(); const side = up.clone().cross(nrm).normalize();
  const ring: THREE.Vector3[] = []; for (let k = 0; k <= 24; k++) { const a = -Math.PI * 0.8 + (k / 24) * Math.PI * 1.6; ring.push(endo('RA', fossaRA.clone().addScaledVector(side, Math.sin(a) * 0.1).addScaledVector(up, Math.cos(a) * 0.12).addScaledVector(nrm, -0.02), -0.003)); }
  add('limbus_fossa_ovalis', 'ridge', tube(ring, (u) => 0.018 * (0.5 + 0.5 * Math.sin(Math.PI * u)), 0, 0, 8).g, 'Limbus of the fossa ovalis', { schematic: true });
  const disc = new THREE.CircleGeometry(1, 32); disc.deleteAttribute('uv'); disc.applyMatrix4(new THREE.Matrix4().makeBasis(side.clone().multiplyScalar(0.09), up.clone().multiplyScalar(0.11), nrm.clone()).setPosition(fossaRA.clone().addScaledVector(nrm, 0.003)));
  add('fossa_ovalis', 'fossa', disc, 'Fossa ovalis (septum primum)', { schematic: true });
}

// Eustachian valve (IVC) and Thebesian valve (coronary sinus): crescentic folds; tendon of Todaro joins them to the CFB
const valveFold = (o: THREE.Vector3, toward: THREE.Vector3, span: number, depth: number) => {
  const d = toward.clone().sub(o).normalize(); const sd = d.clone().cross(new V3(0, 1, 0)).normalize(); const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 10; k++) { const a = (k / 10 - 0.5) * Math.PI; pts.push(endo('RA', o.clone().addScaledVector(sd, Math.sin(a) * span).addScaledVector(d, Math.cos(a) * depth * 0.4), 0.002)); }
  return tube(pts, (u) => 0.008 * Math.sin(Math.PI * u) + 0.002, 0, 0, 6, 0.35).g;
};
add('valve_eustachian', 'fold', valveFold(IVC_O, fossaRA, 0.16, 0.1), 'Valve of the IVC (Eustachian valve)', { schematic: true });
add('valve_thebesian', 'fold', valveFold(CS_O, LM.tricuspid, 0.06, 0.05), 'Valve of the coronary sinus (Thebesian valve)', { schematic: true });
const todaroStart = endo('RA', IVC_O.clone().lerp(CS_O, 0.55).addScaledVector(ATRIAL_N, 0.03), -0.001);
const todaro = onSurf([todaroStart, todaroStart.clone().lerp(CFB, 0.5).addScaledVector(ATRIAL_N, 0.02), CFB], (p) => endo('RA', p, -0.001), 0.01);
add('tendon_todaro', 'tendon', tube(todaro, 0.004, 0, 0, 6).g, 'Tendon of Todaro', { schematic: true });

// papillary muscles (real meshes, smoothed) and the septomarginal trabecula (moderator band)
const PAP: [string, string, 'LV' | 'RV', string][] = [
  ['anterolateral', 'pap_lv_anterolateral', 'LV', 'Anterolateral papillary muscle (LV)'], ['posteromedial', 'pap_lv_posteromedial', 'LV', 'Posteromedial papillary muscle (LV)'],
  ['anterior', 'pap_rv_anterior', 'RV', 'Anterior papillary muscle (RV)'], ['posterior', 'pap_rv_posterior', 'RV', 'Posterior papillary muscle (RV)'], ['medial', 'pap_rv_septal', 'RV', 'Septal papillary muscle (RV)'],
];
const pap: Record<string, { tip: THREE.Vector3; base: THREE.Vector3; side: 'LV' | 'RV' }> = {}; const papGeo: Record<string, THREE.BufferGeometry> = {};
for (const [src, id, side, label] of PAP) {
  const g = T(new RegExp('VH_M_papillary_muscle_of_heart_' + src + '$')); const valveC = bcen(side === 'LV' ? mitral : tricuspid);
  const vs = verts(g); const d = vs.map((v) => v.distanceTo(valveC)); const lo = Math.min(...d), hi = Math.max(...d);
  pap[id] = { tip: mean(vs.filter((_, i) => d[i] < lo + 0.12 * (hi - lo))), base: mean(vs.filter((_, i) => d[i] > hi - 0.12 * (hi - lo))), side }; papGeo[id] = g;
  add(id, 'papillary', smooth(smooth(g)), label);
}
const septoOrigin = endo('RV', LM.septum.clone().lerp(LM.lvApex, 0.25).addScaledVector(SEPTUM_N, 0.08), 0);
const modBand = [septoOrigin, septoOrigin.clone().lerp(pap.pap_rv_anterior.base, 0.5).addScaledVector(LAX, 0.025), pap.pap_rv_anterior.base];
add('moderator_band', 'ridge', tube(modBand, (u) => 0.022 * (0.75 + 0.25 * Math.cos(Math.PI * (u - 0.5) * 2)), 0, 0, 10).g, 'Septomarginal trabecula (moderator band)', { schematic: true });
const svCrest = onSurf([endo('RV', LM.tricuspid.clone().lerp(LM.pulmValve, 0.35).addScaledVector(SEPTUM_N, -0.05), 0), endo('RV', LM.tricuspid.clone().lerp(LM.pulmValve, 0.5), 0), endo('RV', LM.tricuspid.clone().lerp(LM.pulmValve, 0.45).add(new V3(-0.08, 0, 0.08)), 0)], (p) => endo('RV', p, -0.004), 0.015);
add('supraventricular_crest', 'ridge', tube(svCrest, (u) => 0.03 * (0.4 + 0.6 * Math.sin(Math.PI * u)), 0, 0, 10).g, 'Supraventricular crest', { schematic: true });

// chordae tendineae: from each papillary tip, branching to the free edge (primary) and the belly (secondary)
function chordae(valve: THREE.BufferGeometry, apex: THREE.Vector3, ids: string[]) {
  const c = bcen(valve); const ax = apex.clone().sub(c).normalize(); const vs = verts(valve); const u = new V3(1, 0, 0).cross(ax).normalize(); const w = ax.clone().cross(u);
  const BINS = 48; const edge: (THREE.Vector3 | null)[] = Array(BINS).fill(null); const best = Array(BINS).fill(-Infinity);
  for (const v of vs) { const d = v.clone().sub(c); const h = d.dot(ax); const ang = Math.atan2(d.dot(w), d.dot(u)); const b = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * BINS) % BINS; if (h > best[b]) { best[b] = h; edge[b] = v; } }
  const out: THREE.BufferGeometry[] = [];
  // papillary heads: the vertex cloud of each muscle nearest its valve (chordae arise across the whole head)
  const heads = Object.fromEntries(ids.map((k) => { const g = papGeo[k]; const vs = verts(g); const d = vs.map((v) => v.distanceTo(c)); const lo = Math.min(...d); return [k, vs.filter((_, i) => d[i] < lo + 0.04)]; }));
  for (let b = 0; b < edge.length; b += 3) { // one first-order chorda per three edge bins; it fans to 3–4 insertions
    const e = edge[b]; if (!e) continue; const k = ids.reduce((a, q) => (pap[q].tip.distanceTo(e) < pap[a].tip.distanceTo(e) ? q : a));
    const hv = heads[k]; const start = hv[Math.floor(rnd() * hv.length)].clone();
    const split = start.clone().lerp(e, rs(0.45, 0.6)).addScaledVector(ax, -0.006);
    out.push(tube([start, start.clone().lerp(split, 0.5).add(new V3(rs(-0.004, 0.004), rs(-0.004, 0.004), rs(-0.004, 0.004))).addScaledVector(ax, 0.004), split], (u) => 0.0022 - 0.0006 * u, 0, 0, 6).g); // slight slack (sag toward the apex)
    const ins = [e, edge[(b + 1) % edge.length] ?? e, e.clone().lerp(c, 0.3), (edge[(b + 1) % edge.length] ?? e).clone().lerp(c, 0.45)]; // free edge (primary) + rough zone (secondary)
    for (const tgt of ins) { const t2 = tgt.clone().add(new V3(rs(-0.004, 0.004), rs(-0.004, 0.004), rs(-0.004, 0.004))); const mid = split.clone().lerp(t2, 0.5).addScaledVector(ax, 0.003); out.push(tube([split, mid, t2], (u) => 0.0013 - 0.0004 * u, 0, 0, 5).g); }
  }
  return join(out);
}
add('chordae_mitral', 'chordae', chordae(mitral, LM.lvApex, ['pap_lv_anterolateral', 'pap_lv_posteromedial']), 'Chordae tendineae (mitral)');
add('chordae_tricuspid', 'chordae', chordae(tricuspid, rvApex, ['pap_rv_anterior', 'pap_rv_posterior', 'pap_rv_septal']), 'Chordae tendineae (tricuspid)');

/* ================================================================== conduction system */
const V = { atrial: 1.0, internodal: 1.4, node: 0.05, his: 2.0, bundle: 2.0, purkinje: 3.0 }; // mm/ms (= m/s)
// SA node: subepicardial spindle in the sulcus terminalis, head at the SVC–RA junction, tail toward the IVC
const saHead = epi(SA_BLOCK, 0.0015); const saTailGuide = epi(SA_BLOCK.clone().lerp(IVC_O, 0.22).add(new V3(-0.03, 0, 0.02)), 0.0015);
const saPath = onSurf([saHead, saHead.clone().lerp(saTailGuide, 0.5), saTailGuide], (p) => epi(p, 0.0015), 0.01);
const sa = tube(saPath, (u) => spindle(u, 0.024, 0.3), 0, 0, 12, 0.4); // ~15 × 5 × 2 mm
add('sa_node', 'node', sa.g, 'Sinoatrial (SA) node', { lengthMm: +(sa.len * 100).toFixed(1) });
const saMid = saPath[Math.floor(saPath.length / 2)];
// Bachmann's bundle: subepicardial across the anterior interatrial groove to the left auricle
const atriaC = LM.ra.clone().lerp(LM.la, 0.5);
const epiA = (p: THREE.Vector3, depth = 0.0015) => { const d = p.clone().sub(atriaC).normalize(); ray.set(atriaC.clone().addScaledVector(d, 1.2), d.clone().negate()); let hd = Infinity; for (const b of [W.RA[0], W.LA[0]]) { const h = b.raycastFirst(ray, THREE.DoubleSide); if (h && h.distance < hd) hd = h.distance; } return Number.isFinite(hd) ? ray.origin.clone().addScaledVector(ray.direction, hd + depth) : p.clone(); };
const iaGroove = epiA(saHead.clone().lerp(LAA, 0.5).add(new V3(0, 0.04, -0.03)));
const bach = tube(onSurf([epiA(saHead), iaGroove, epiA(LAA)], (p) => epiA(p), 0.015), 0.006, 0, V.internodal, 8, 0.45);
add('bachmann_bundle', 'pathway', bach.g, "Bachmann's bundle (interatrial)", { t1: +bach.t1.toFixed(1) });
// AV node: compact node at the apex of Koch's triangle (averaged tissue blocks, on the RA septal endocardium)
const avC = endo('RA', AV_BLOCK.clone().lerp(CFB, 0.25), -0.0015);
const toCFB = CFB.clone().sub(avC).normalize();
// internodal preferential pathways (anterior, middle, posterior — functional routes, not insulated tracts) → AV node
const internodal = (via: THREE.Vector3[], id: string, label: string) => { const pts = onSurf([saMid, ...via, avC], (p) => endo('RA', p, -0.002), 0.015); const t = tube(pts, 0.0035, 0, V.internodal, 6, 0.5); add(id, 'pathway', t.g, label, { t1: +t.t1.toFixed(1) }); return t; };
const inA = internodal([SVC_O.clone().lerp(LM.aorticValve, 0.45), fossaRA.clone().add(new V3(0.02, 0.1, 0.03))], 'internodal_anterior', 'Anterior internodal pathway');
internodal([SVC_O.clone().lerp(fossaRA, 0.5), fossaRA.clone().add(new V3(0, 0.08, -0.02))], 'internodal_middle', 'Middle internodal pathway (Wenckebach)');
internodal([...crista.slice(Math.floor(crista.length * 0.4), Math.floor(crista.length * 0.85)).filter((_, i) => i % 3 === 0), todaroStart], 'internodal_posterior', 'Posterior internodal pathway (Thorel)');
const T_AV = Math.round(Math.max(30, inA.t1)); const T_HIS = T_AV + 80; // AV-nodal delay ≈ 80 ms
add('av_node', 'node', blob(avC, toCFB, 0.026, 0.015, 0.006, ATRIAL_N.clone().negate(), T_AV), 'Atrioventricular (AV) node', { t0: T_AV });
const infExt = tube(onSurf([avC, avC.clone().lerp(CS_O, 0.55).add(new V3(0, -0.01, 0.02))], (p) => endo('RA', p, -0.0015), 0.008), (u) => 0.006 * (1 - 0.5 * u), T_AV, 0, 6, 0.5);
add('av_node_inferior_extension', 'node', infExt.g, 'Inferior nodal extension (slow pathway)', { t0: T_AV });
// His: penetrating bundle through the central fibrous body to the crest of the muscular septum, then the branching bundle
const crest = endo('LV', LM.vsdPerimembranous.clone().addScaledVector(SEPTUM_N, -0.04).addScaledVector(LAX, 0.03), -0.003);
// the compact node's anterior tip abuts the central fibrous body; the bundle penetrates it (~2–3 mm) and runs ~10 mm
// along the crest of the muscular septum before branching
const nodeTip = avC.clone().lerp(CFB, 0.55);
const hisPts = [nodeTip, CFB, CFB.clone().lerp(crest, 0.6), crest];
const his = tube(hisPts, 0.008, T_HIS, V.his, 8); add('his', 'conduction', his.g, 'Bundle of His (penetrating + branching)', { t0: T_HIS, t1: +his.t1.toFixed(1), lengthMm: +(his.len * 100).toFixed(1) });
const bif = hisPts[hisPts.length - 1]; const tB = his.t1;
// left bundle: a broad subendocardial sheet fanning down the LV septal surface, then three fascicles
/** control points are pushed toward the LV side of the septum once; densified points then project plainly (idempotent) */
const lvSept = (p: THREE.Vector3) => endo('LV', p.clone().addScaledVector(SEPTUM_N, -0.06), 0.0015);
const lvE = (p: THREE.Vector3) => endo('LV', p, 0.0015);
const lbbCtr = onSurf([lvE(bif), lvSept(bif.clone().lerp(LM.lvApex, 0.12)), lvSept(LM.septum.clone().lerp(LM.lvApex, 0.25))], lvE, 0.012);
const sideOnSeptum = LAX.clone().cross(SEPTUM_N).normalize();
// the left bundle fans out as a broad band of fibres down the septal surface (as in dissection): ~13 diverging strands
const lbbStem = tube(lbbCtr, 0.0035, tB, V.bundle, 8, 0.45);
const fanEnd = lbbCtr[lbbCtr.length - 1]; const fanStrands: Geo[] = [];
for (let k = 0; k < 13; k++) { const sx = (k / 12 - 0.5) * 2; const end = lvSept(LM.septum.clone().lerp(LM.lvApex, 0.42 + 0.08 * Math.abs(sx)).addScaledVector(sideOnSeptum, sx * 0.22)); const pts = onSurf([fanEnd, fanEnd.clone().lerp(end, 0.5), end], lvE, 0.01); fanStrands.push(tube(pts, (u) => 0.0028 * (1 - 0.45 * u), lbbStem.t1, V.bundle, 6, 0.45)); }
const lbb = { g: join([lbbStem.g, ...fanStrands.map((f) => f.g)]), t1: lbbStem.t1 };
void sheet;
add('lbb', 'conduction', lbb.g, 'Left bundle branch (fanning sheet)', { t0: +tB.toFixed(1), t1: +lbb.t1.toFixed(1) });
const fan = lbbCtr[lbbCtr.length - 1];
const fascicle = (to: THREE.Vector3, edge: number) => { const st = lvE(fan.clone().addScaledVector(sideOnSeptum, edge * 0.09)); const pts = onSurf([st, st.clone().lerp(to, 0.5), to], (p) => endo('LV', p, 0.0015), 0.012); return tube(pts, 0.0045, lbb.t1, V.bundle, 6, 0.55); };
const laf = fascicle(endo('LV', pap.pap_lv_anterolateral.base, 0.002), 1), lpf = fascicle(endo('LV', pap.pap_lv_posteromedial.base, 0.002), -1), lsf = fascicle(lvSept(LM.septum.clone().lerp(LM.lvApex, 0.7)), 0);
add('lbb_anterior', 'conduction', laf.g, 'Left anterior fascicle', { t1: +laf.t1.toFixed(1) });
add('lbb_posterior', 'conduction', lpf.g, 'Left posterior fascicle', { t1: +lpf.t1.toFixed(1) });
add('lbb_septal', 'conduction', lsf.g, 'Left septal fascicle', { t1: +lsf.t1.toFixed(1) });
// right bundle: thin cord, intramyocardial under the RV septal endocardium, then inside the moderator band
const rvSeptDeep = (p: THREE.Vector3) => endo('RV', p.clone().addScaledVector(SEPTUM_N, 0.06), -0.002);
const rvDeep = (p: THREE.Vector3) => endo('RV', p, -0.002);
const rbb1Pts = onSurf([rvSeptDeep(bif), rvSeptDeep(bif.clone().lerp(septoOrigin, 0.5)), rvDeep(septoOrigin)], rvDeep, 0.012);
const rbb1 = tube(rbb1Pts, 0.0035, tB, V.bundle, 6); const rbb2 = tube(modBand, 0.0035, rbb1.t1, V.bundle, 6);
add('rbb', 'conduction', join([rbb1.g, rbb2.g]), 'Right bundle branch (through the moderator band)', { t0: +tB.toFixed(1), t1: +rbb2.t1.toFixed(1) });

// Purkinje: a dense subendocardial network grown from the fascicle/bundle ends, over the apical two-thirds and onto the
// papillary muscles, plus false tendons crossing the LV cavity
const DETOUR: number[] = [];
function purkinje(ch: 'LV' | 'RV', roots: { p: THREE.Vector3; t: number }[], n: number, hMin: number) {
  const targets: THREE.Vector3[] = []; const sd = SEEDS[ch][0];
  while (targets.length < n) { const d = new V3(rs(-1, 1), rs(-1, 1), rs(-1, 1)).normalize(); const p = endo(ch, sd.clone().addScaledVector(d, 0.5), 0.0015); if (hFrac(p) >= hMin) targets.push(p); }
  // earliest-arrival growth: targets join in order of distance from the roots, each to the node that reaches it first
  // (Purkinje fibres conduct in parallel from many branch points, so arrival is ~geodesic, not along one long chain)
  const tree = roots.map((r) => ({ p: r.p, t: r.t })); const tubes: THREE.BufferGeometry[] = [];
  const order = targets.map((p, i) => ({ i, d: Math.min(...roots.map((r) => r.p.distanceTo(p))) })).sort((a, b) => a.d - b.d);
  for (const { i: bi } of order) {
    // candidate parents by earliest arrival; a connection whose wall path detours (the RV crescent can make a projection
    // jump between the septal and free walls) is rejected for the next candidate
    const cands = tree.map((n, j) => ({ j, d: targets[bi].distanceTo(n.p) })).filter((c) => c.d < 0.3).map((c) => ({ ...c, arr: tree[c.j].t + (c.d * 100) / V.purkinje + c.d * 40 })).sort((a, b) => a.arr - b.arr).slice(0, 10);
    if (!cands.length) cands.push({ j: tree.reduce((a, n, j) => (n.p.distanceTo(targets[bi]) < tree[a].p.distanceTo(targets[bi]) ? j : a), 0), d: 0, arr: 0 });
    let chosen: { pts: THREE.Vector3[]; j: number } | null = null;
    for (const c of cands) { const pts = onSurf([tree[c.j].p, tree[c.j].p.clone().lerp(targets[bi], 0.5), targets[bi]], (p) => endo(ch, p, 0.0015), 0.012, 1); const arc = pts.reduce((a, p, i) => a + (i ? p.distanceTo(pts[i - 1]) : 0), 0); const st = tree[c.j].p.distanceTo(targets[bi]); if (arc <= 1.8 * st + 0.015) { chosen = { pts, j: c.j }; break; } }
    if (!chosen) { DETOUR.push(1); continue; } // unreachable along the wall without a detour: leave it out
    const bj = chosen.j; const tb = tube(chosen.pts, 0.0018, tree[bj].t, V.purkinje, 4); tubes.push(tb.g); tree.push({ p: targets[bi], t: tb.t1 });
    if (rnd() < 0.08 && tree.length > 6) { const k = Math.floor(rnd() * tree.length); if (tree[k].p.distanceTo(targets[bi]) < 0.12) tubes.push(tube(onSurf([targets[bi], tree[k].p], (p) => endo(ch, p, 0.0015), 0.012, 1), 0.0015, tb.t1, V.purkinje, 4).g); } // anastomoses
  }
  return { g: join(tubes), tMax: Math.max(...tree.map((x) => x.t)) };
}
const pkLV = purkinje('LV', [{ p: endo('LV', pap.pap_lv_anterolateral.base, 0.0015), t: laf.t1 }, { p: endo('LV', pap.pap_lv_posteromedial.base, 0.0015), t: lpf.t1 }, { p: lvSept(LM.septum.clone().lerp(LM.lvApex, 0.7)), t: lsf.t1 }], 340, 0.3);
// RV: the right bundle ramifies at the base of the anterior papillary muscle, with early branches along its septal course
const rbbPts = rbb1Pts.filter((_, i) => i > rbb1Pts.length * 0.5 && i % 4 === 0).map((p, k, a) => ({ p: endo('RV', p, 0.0015), t: tB + ((k + 1) / (a.length + 1)) * (rbb1.t1 - tB) }));
const pkRV = purkinje('RV', [{ p: pap.pap_rv_anterior.base, t: rbb2.t1 }, ...rbbPts], 200, 0.25);
// false tendons: free-running strands from the septum to the papillary muscles (they carry Purkinje fibres)
const ft = [lvSept(LM.septum.clone().lerp(LM.lvApex, 0.55)), lvSept(LM.septum.clone().lerp(LM.lvApex, 0.75))].flatMap((a, i) => { const b = i ? pap.pap_lv_posteromedial.base : pap.pap_lv_anterolateral.base; return [tube([a, a.clone().lerp(b, 0.5).addScaledVector(LAX, 0.02), b], 0.0022, lsf.t1, V.purkinje, 5).g]; });
add('purkinje_lv', 'purkinje', join([pkLV.g, ...ft]), 'Purkinje network (LV) incl. false tendons', { tMax: +pkLV.tMax.toFixed(1) });
add('purkinje_rv', 'purkinje', pkRV.g, 'Purkinje network (RV)', { tMax: +pkRV.tMax.toFixed(1) });
log('purkinje targets dropped (no clean wall path)', DETOUR.length, '| lengths mm: LBB', (lbbCtr.reduce((a, p, i) => a + (i ? p.distanceTo(lbbCtr[i - 1]) : 0), 0) * 100).toFixed(0), 'RBB', ((rbb1.len + rbb2.len) * 100).toFixed(0), 'Bachmann', (bach.len * 100).toFixed(0));
log('activation: SA→AV', T_AV, 'ms, His', T_HIS, '→', tB.toFixed(0), 'ms, last Purkinje LV', pkLV.tMax.toFixed(0), 'RV', pkRV.tMax.toFixed(0), 'ms; His length', (his.len * 100).toFixed(0), 'mm, SA length', (sa.len * 100).toFixed(0), 'mm');

/* ------------------------------------------------------------------ output */
await writeGLB('public/models/heart-internals.glb', parts, {
  papillary: { color: [0.6, 0.2, 0.17], rough: 0.5 }, chordae: { color: [0.95, 0.91, 0.84], rough: 0.4 }, trabecula: { color: [0.56, 0.17, 0.15], rough: 0.55 },
  ridge: { color: [0.6, 0.2, 0.17], rough: 0.5 }, fold: { color: [0.86, 0.72, 0.66], rough: 0.4 }, tendon: { color: [0.95, 0.92, 0.86], rough: 0.35 }, fossa: { color: [0.82, 0.6, 0.56], rough: 0.4 },
  node: { color: [1.0, 0.78, 0.25], rough: 0.4 }, pathway: { color: [0.98, 0.7, 0.3], rough: 0.4 }, conduction: { color: [1.0, 0.72, 0.2], rough: 0.4 }, purkinje: { color: [0.98, 0.82, 0.4], rough: 0.4 },
  default: { color: [0.8, 0.6, 0.5], rough: 0.5 },
});
const out: Record<string, unknown> = {};
for (const p of parts) { p.geo.computeBoundingBox(); out[p.id] = { label: p.extras!.label, role: p.role, centre: r3(p.geo.boundingBox!.getCenter(new V3())), ...Object.fromEntries(Object.entries(p.extras!).filter(([k]) => k !== 'label')) }; }
fs.writeFileSync(path.join(ROOT, 'public/models/heart-internals.mapping.json'), JSON.stringify({
  units: 'decimetres, body-centred', frame: '+X patient left, +Y up, +Z anterior', parts: out,
  landmarks: { crista: crista.filter((_, i) => i % 2 === 0).map(r3), saBlock: r3(SA_BLOCK), avBlock: r3(AV_BLOCK), svcOrifice: r3(SVC_O), ivcOrifice: r3(IVC_O), csOstium: r3(CS_O), centralFibrousBody: r3(CFB), raAppendage: r3(RAA), laAppendage: r3(LAA), fossaOvalis: r3(fossaRA), kochAvToCsMm: +(AV_BLOCK.distanceTo(CS_O) * 100).toFixed(1) },
  activation: { attribute: '_ACT (ms after SA firing)', saToAv: T_AV, avNodalDelay: T_HIS - T_AV, hisStart: T_HIS, velocitiesMmPerMs: V, lastVentricularActivation: +Math.max(pkLV.tMax, pkRV.tMax).toFixed(1) },
  schematic: 'Measured on HuBMAP: chamber walls, valves, papillary muscles, SA/AV node sites (three groups averaged), orifices, appendages, fossa ovalis. Built on those walls and landmarks (true size and position, schematic pattern): trabeculae, pectinate muscles, crista terminalis, moderator band, supraventricular crest, limbus, Eustachian/Thebesian valves, tendon of Todaro, chordae, and the conduction fibre routes.',
  attribution: { title: '3D Reference Organs: Visible Human Male (heart, papillary muscles, SA/AV node tissue blocks, appendages)', creators: 'HuBMAP / Human Reference Atlas consortium (tissue blocks: HuBMAP, SPARC, Pei et al.)', data: 'Visible Human Male, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Papillary muscles smoothed; interior architecture and conduction system generated on the HuBMAP endocardial/epicardial surfaces at measured landmarks.' },
}, null, 1));
log('done', parts.length, 'parts,', parts.reduce((s, p) => s + p.geo.index!.count / 3, 0), 'triangles');
