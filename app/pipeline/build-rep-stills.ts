/**
 * Overlay geometry for the audio app's rendered 3D stills (public/models/_stills/*.glb): probe positions for the
 * eFAST / POCUS map, an IO needle at the proximal tibia, the right arm's veins with a cannula, an EVD catheter with the
 * levelling reference, and a pulmonary-artery catheter advanced to the RA, RV, PA and wedge positions. The stills
 * themselves are rendered from these plus the real anatomy models (scripts/render-rep-stills.mjs) — the audio app
 * shows rendered anatomy, not drawings.
 *   npm run asset:rep-stills
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { MeshBVH } from 'three-mesh-bvh';
import { ROOT, log, readGLBDecoded, writeGLB, mergeGeos, type OutPart, V3 } from './common';
import { readFBX, verts, mean, zToBody } from './zanatomy';
import { LM } from '../src/heart/heartGeometry';

const OUT = path.join(ROOT, 'public/models/_stills'); fs.mkdirSync(OUT, { recursive: true });
const body = await readGLBDecoded('public/models/body.glb'); const skel = await readGLBDecoded('public/models/skeleton.glb');
const skin = body.get('skin')!; const skinB = new MeshBVH(skin);
const IM = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/models/heart-internals.mapping.json'), 'utf8'));
const LINES = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/models/lines.mapping.json'), 'utf8'));
const v3 = (a: number[]) => new V3(a[0], a[1], a[2]);
const strip = (g: THREE.BufferGeometry) => { for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k); if (!g.attributes.normal) g.computeVertexNormals(); return g.index ? g : (g.setIndex([...Array(g.attributes.position.count).keys()]), g); };
const tube = (pts: THREE.Vector3[], r: number, seg = 10) => { const c = new THREE.CatmullRomCurve3(pts, false, 'centripetal'); return strip(new THREE.TubeGeometry(c, Math.max(16, Math.ceil(c.getLength() / 0.01)), r, seg, false)); };
const sphere = (p: THREE.Vector3, r: number) => strip(new THREE.SphereGeometry(r, 20, 14).translate(p.x, p.y, p.z));
/** first skin hit on the ray from `from` toward `to` */
const onSkin = (from: THREE.Vector3, to: THREE.Vector3) => { const d = to.clone().sub(from).normalize(); const h = skinB.raycastFirst(new THREE.Ray(from, d), THREE.DoubleSide); return h ? { p: h.point.clone(), n: d.clone().negate() } : { p: to.clone(), n: d.clone().negate() }; };
/** an ultrasound probe resting on the skin: footprint ~2 × 1 cm, body 6 cm along the normal */
function probe(at: { p: THREE.Vector3; n: THREE.Vector3 }, long: THREE.Vector3) {
  const n = at.n.clone().normalize(); const u = long.clone().sub(n.clone().multiplyScalar(long.dot(n))).normalize(); const w = n.clone().cross(u);
  const g = new THREE.BoxGeometry(0.22, 0.6, 0.1); g.translate(0, 0.32, 0); // y = along the normal
  const m = new THREE.Matrix4().makeBasis(u, n, w).setPosition(at.p); g.applyMatrix4(m); return strip(g);
}
const save = async (name: string, parts: OutPart[]) => { await writeGLB(path.join('public/models/_stills', name + '.glb'), parts, { default: { color: [0.9, 0.9, 0.9], rough: 0.4 } }); log('still overlay', name, parts.map((p) => p.id).join(' ')); };

/* ---------------------------------------------------------------- eFAST / POCUS probe map */
{
  const out = (dir: THREE.Vector3, to: THREE.Vector3) => onSkin(to.clone().addScaledVector(dir.normalize(), 3), to);
  const ps: [string, { p: THREE.Vector3; n: THREE.Vector3 }, THREE.Vector3][] = [
    ['probe_ruq', out(new V3(-1, 0.1, 0.15), new V3(-0.78, 3.3, -0.05)), new V3(0, 1, 0)],
    ['probe_luq', out(new V3(1, 0.15, -0.25), new V3(0.95, 3.6, -0.4)), new V3(0, 1, 0)],
    ['probe_subxiphoid', out(new V3(0, -0.45, 1), new V3(0.05, 4.3, 0.4)), new V3(1, 0, 0)],
    ['probe_pelvis', out(new V3(0, 0.15, 1), new V3(0, 0.75, 0.2)), new V3(1, 0, 0)],
    ['probe_lung_R', out(new V3(0, 0.05, 1), new V3(-0.55, 5.75, 0.4)), new V3(0, 1, 0)],
    ['probe_lung_L', out(new V3(0, 0.05, 1), new V3(0.55, 5.75, 0.4)), new V3(0, 1, 0)],
  ];
  await save('efast', ps.map(([id, at, long]) => ({ id, role: 'probe', geo: probe(at, long) })));
}

/* ---------------------------------------------------------------- IO: proximal tibia */
{
  const tib = skel.get('tibia_R')!; const tv = verts(tib); const top = tv.reduce((a, p) => (p.y > a.y ? p : a)).y, bot = tv.reduce((a, p) => (p.y < a.y ? p : a)).y;
  const tub = tv.filter((p) => p.y > top - (top - bot) * 0.15).reduce((a, p) => (p.z > a.z ? p : a)); // tibial tuberosity: most anterior point of the upper shaft
  const site0 = tub.clone().add(new V3(0.12, -0.2, -0.05)); // 2 cm distal, ~1.5 cm medial (patient right leg: medial = +x)
  const tb = new MeshBVH(tib); const dir = new V3(-0.6, 0, -1).normalize(); const h = tb.raycastFirst(new THREE.Ray(site0.clone().addScaledVector(dir, -1), dir), THREE.DoubleSide);
  const p = h ? h.point : site0; const n = h?.face ? h.face.normal.clone().transformDirection(new THREE.Matrix4()).normalize() : dir.clone().negate();
  if (n.dot(dir) > 0) n.negate();
  await save('io', [{ id: 'io_needle', role: 'needle', geo: tube([p.clone().addScaledVector(n, -0.08), p.clone().addScaledVector(n, 0.25)], 0.009) }, { id: 'io_hub', role: 'needle', geo: strip(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 20).applyMatrix4(new THREE.Matrix4().makeBasis(new V3(1, 0, 0).cross(n).normalize(), n, new V3(1, 0, 0).cross(n).normalize().cross(n)).setPosition(p.clone().addScaledVector(n, 0.29)))) }, { id: 'io_site', role: 'marker', geo: sphere(p, 0.025) }]);
  fs.writeFileSync(path.join(OUT, 'io.json'), JSON.stringify({ site: p.toArray(), tuberosity: tub.toArray() }));
}

/* ---------------------------------------------------------------- PIV: right arm veins (Z-Anatomy) */
{
  const Z = readFBX('CardioVascular41.fbx', /^(Cephalic_veinr|Basilic_veinr|Median_cubital_veinr|Median_antebrachial_veinr|Brachial_arteryr|Radial_arteryr|Ulnar_arteryr|Dorsal_venous_network_of_handr)$/);
  const B = readFBX('SkeletalSystem100.fbx', /^(Radiusr|Ulnar|Humerusr)$/);
  for (const g of [...Z.values(), ...B.values()]) zToBody(g);
  const parts: OutPart[] = [...Z.entries()].map(([k, g]) => ({ id: k.replace(/r$/, '').toLowerCase(), role: /artery/i.test(k) ? 'artery' : 'vein', geo: strip(g) }));
  parts.push(...[...B.entries()].map(([k, g]) => ({ id: 'bone_' + k.replace(/r$/, '').toLowerCase(), role: 'bone', geo: strip(g) })));
  // a 20 G cannula entering the median cubital vein at a shallow angle, pointing proximally
  const mc = Z.get('Median_cubital_veinr'); if (mc) { const c = mean(verts(mc)); const ceph = Z.get('Cephalic_veinr')!; const up = mean(verts(ceph).filter((p) => p.y > c.y)).sub(c).normalize();
    const out = c.clone().sub(mean(verts(B.get('Humerusr')!))).setY(0).normalize(); const entry = c.clone().addScaledVector(out, 0.06).addScaledVector(up, -0.25);
    parts.push({ id: 'cannula', role: 'device', geo: tube([entry, c.clone().addScaledVector(up, 0.08)], 0.011) }, { id: 'cannula_hub', role: 'device', geo: sphere(entry.clone().addScaledVector(up, -0.06), 0.045) });
    fs.writeFileSync(path.join(OUT, 'piv.json'), JSON.stringify({ antecubital: c.toArray(), up: up.toArray(), out: out.toArray() })); }
  await save('arm', parts);
}

/* ---------------------------------------------------------------- EVD: catheter to the foramen of Monro, levelling reference */
{
  const neuro = await readGLBDecoded('public/models/neuro.glb');
  const lv = verts(neuro.get('lat_ventricle_R')!); const third = mean(verts(neuro.get('third_ventricle')!));
  // foramen of Monro: the lateral-ventricle point nearest the top of the third ventricle
  const thirdTop = verts(neuro.get('third_ventricle')!).reduce((a, p) => (p.y + 0.3 * p.z > a.y + 0.3 * a.z ? p : a));
  const monro = lv.reduce((a, p) => (p.distanceTo(thirdTop) < a.distanceTo(thirdTop) ? p : a)).clone().lerp(thirdTop, 0.5);
  // Kocher's point: ~11 cm behind the nasion on the vertex, 3 cm right of midline → skin entry above it
  const brain = body.get('brain')!; brain.computeBoundingBox(); const bb = brain.boundingBox!;
  const kocher = onSkin(new V3(-0.3, bb.max.y + 2, bb.max.z - 0.8), new V3(-0.3, bb.max.y - 0.2, bb.max.z - 0.8)).p;
  const dir = monro.clone().sub(kocher).normalize();
  const tip = monro.clone().addScaledVector(dir, -0.05);
  const level = new THREE.CylinderGeometry(1.4, 1.4, 0.004, 64); level.translate(monro.x, monro.y, monro.z);
  const tragus = onSkin(new V3(-3, monro.y, monro.z - 0.1), new V3(0, monro.y, monro.z - 0.1)).p;
  await save('evd', [{ id: 'evd_catheter', role: 'device', geo: tube([kocher.clone().addScaledVector(dir, -0.6).add(new V3(0, 0.2, 0)), kocher.clone().addScaledVector(dir, -0.15), tip], 0.012) }, { id: 'evd_level', role: 'level', geo: strip(level) }, { id: 'evd_monro', role: 'marker', geo: sphere(monro, 0.03) }, { id: 'evd_tragus', role: 'marker', geo: sphere(tragus, 0.04) }]);
  fs.writeFileSync(path.join(OUT, 'evd.json'), JSON.stringify({ monro: monro.toArray(), kocher: kocher.toArray(), tragus: tragus.toArray(), third: third.toArray() }));
}

/* ---------------------------------------------------------------- PA catheter: RA → RV → PA → wedge */
{
  const svcTop = new V3(-0.25, 5.62, 0.2); const svcO = v3(IM.landmarks.svcOrifice);
  const paBox = LINES.boxes.pulm_art as number[][]; const rpa = new V3(paBox[0][0] + 0.12, (paBox[0][1] + paBox[1][1]) / 2, (paBox[0][2] + paBox[1][2]) / 2 + 0.05);
  const path0 = [new V3(-0.32, 6.6, 0.15), svcTop, svcO, LM.ra.clone(), LM.tricuspid.clone(), LM.rv.clone().lerp(LM.lvApex, 0.15), LM.rvot.clone(), LM.pulmValve.clone(), new V3(0.12, 5.22, 0.3), rpa, rpa.clone().add(new V3(-0.35, -0.08, -0.05))];
  const curve = new THREE.CatmullRomCurve3(path0, false, 'centripetal'); const L = curve.getLength();
  const tAt = (p: THREE.Vector3) => { let best = 0, bd = Infinity; for (let i = 0; i <= 400; i++) { const d = curve.getPointAt(i / 400).distanceTo(p); if (d < bd) { bd = d; best = i / 400; } } return best; };
  const stops: [string, number, number][] = [['ra', tAt(LM.ra), 0.04], ['rv', tAt(LM.rv.clone().lerp(LM.lvApex, 0.15)), 0.04], ['pa', tAt(new V3(0.12, 5.22, 0.3)), 0.04], ['wedge', 1, 0.05]];
  const parts: OutPart[] = [];
  for (const [id, t, br] of stops) { const pts = Array.from({ length: Math.max(8, Math.round(t * 120)) + 1 }, (_, i) => curve.getPointAt((i / Math.max(8, Math.round(t * 120))) * t)); parts.push({ id: 'pac_' + id, role: 'device', geo: tube(pts, 0.012) }, { id: 'balloon_' + id, role: 'balloon', geo: sphere(curve.getPointAt(t), br) }); }
  await save('pac', parts); log('PA catheter length in the model', (L * 10).toFixed(1), 'cm');
}
log('done');
