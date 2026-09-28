/**
 * Respiratory asset pipeline (npm run asset:resp)
 *
 *  HuBMAP VH Male lung / bronchi / trachea / larynx / United-body GLBs
 *   → canonical ids, heart-centred decimetre frame (+X patient left, +Y head, +Z anterior)
 *   → lobes rebuilt from bronchopulmonary segments (voxel union → marching cubes → Taubin), per-vertex segment id,
 *     gravity-dependence and apex→base coordinates for regional mechanics
 *   → airway tree tagged by generation and lobe (for bronchoconstriction, mucus plugging, flow animation)
 *   → diaphragm fitted to the lung bases, thoracic skin shell, heart context, kidneys
 *   → endotracheal tube + cuff authored along the measured tracheal centreline
 *   → public/models/resp.glb + resp.mapping.json
 */
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshBVH } from 'three-mesh-bvh';
import { ROOT, V3, log, readGLB, mergeGeos, simplify, centroid, orientOutward, writeGLB, MeshoptSimplifier, type OutPart } from './common';
import { makeGrid, rasterSolid, blur, marchingCubes, taubin } from './voxel';

const SRC = 'assets/source/';
export const LOBES = ['RUL', 'RML', 'RLL', 'LUL', 'LLL'] as const;
const LOBE_RE: Record<string, RegExp> = {
  RUL: /right_(apical|posterior|anterior)_bronchopulmonary/, RML: /right_(lateral|medial)_bronchopulmonary/,
  RLL: /right_(superior|medial_basal|anterior_basal|lateral_basal|posterior_basal)_bronchopulmonary/,
  LUL: /left_(apical|posterior|anterior|lingula_superior|lingula_inferior)_bronchopulmonary/,
  LLL: /left_(superior|anterior_basal|medial_basal|lateral_basal|posetrior_basal)_bronchopulmonary/,
};
/** Airway → lobe served (−1 = central airway). */
const AIRWAY_LOBE: [RegExp, number, number][] = [
  [/trachea$|carina$/, -1, 0], [/right_main_bronchus$|left_main_bronchus$|VH_M_bronchus$/, -1, 1],
  [/right_superior_lobar|right_(apical|posterior|anterior)_bronchus$/, 0, 2], [/right_middle_lobar|right_(lateral|medial)_bronchus$/, 1, 2],
  [/right_intermediate/, -1, 1], [/right_lower_lobar|right_superior_bronchus$|right_.*basal/, 2, 2],
  [/left_superior_lobar|left_(apical|anterior|lingular|lingula_superior|lingula_inferior)_bronchus$|left_superior_bronchus$/, 3, 2],
  [/left_inferior_lobar|left_.*basal/, 4, 2],
];

async function main() {
  await MeshoptSimplifier.ready;
  const lung = await readGLB(SRC + '3d-vh-m-lung.glb');
  const mainB = await readGLB(SRC + '3d-vh-m-main-bronchus.glb');
  const trach = await readGLB(SRC + '3d-vh-m-trachea.glb');
  const lar = await readGLB(SRC + '3d-vh-m-larynx.glb');
  const body = await readGLB(SRC + 'VH_M_United.glb', /VH_M_(skin|heart_left_ventricle|heart_right_ventricle|left_cardiac_atrium|right_cardiac_atrium|interventricular_septum|aortic_arch|ascending_aorta|descending_aorta_a|pulmonary_trunk|pulmonary_artery_[LR]|superior_vena_cava|inferior_vena_cava_a|diaphragmatic_surface|kidney_capsule_[LR]|outer_cortex_of_kidney_[LR]|renal_pelvis_[LR]|ureter_[LR])$/);

  // ------------------------------------------------------------- frame: centre on the lungs, metres → decimetres
  const segEntries = [...lung.entries()].filter(([n]) => /bronchopulmonary_segment/.test(n));
  const box = new THREE.Box3(); segEntries.forEach(([, g]) => { g.computeBoundingBox(); box.union(g.boundingBox!); });
  const C = box.getCenter(new V3()); const S = 10;
  const M = new THREE.Matrix4().makeScale(S, S, S).multiply(new THREE.Matrix4().makeTranslation(-C.x, -C.y, -C.z));
  const tf = (g: THREE.BufferGeometry) => { g.applyMatrix4(M); g.computeVertexNormals(); g.computeBoundingBox(); return g; };
  for (const m of [lung, mainB, trach, lar, body]) for (const g of m.values()) tf(g);
  log('lung centre (m)', C.toArray().map((x) => x.toFixed(3)).join(', '));
  const parts: OutPart[] = [];

  // ------------------------------------------------------------- lobes
  const segNames: string[] = []; const lobeInfo: Record<string, { hilum: number[]; segments: string[]; volume: number }> = {};
  const lungBox = box.clone().applyMatrix4(M);
  for (const [li, lobe] of LOBES.entries()) {
    const segs = segEntries.filter(([n]) => LOBE_RE[lobe].test(n));
    const gs = segs.map(([, g]) => g);
    const bb = new THREE.Box3(); gs.forEach((g) => bb.union(g.boundingBox!));
    const grid = makeGrid(bb, 0.018, 4); rasterSolid(grid, gs, 1.3); blur(grid, 2, 1);
    let vol = 0; for (let i = 0; i < grid.f.length; i++) if (grid.f[i] > 0.5) vol += grid.h ** 3;
    let geo = marchingCubes(grid, 0.5); orientOutward(geo); taubin(geo, 5);
    geo = simplify(geo, lobe === 'LUL' ? 0.45 : 0.55, 0.002); taubin(geo, 2);
    // per-vertex: nearest segment, dependency (posterior), apex→base
    const bvhs = gs.map((g) => new MeshBVH(g));
    const a = geo.attributes.position; const SEG = new Float32Array(a.count), DEP = new Float32Array(a.count), BASE = new Float32Array(a.count);
    const tgt = { point: new V3(), distance: 0, faceIndex: 0 } as any;
    for (let i = 0; i < a.count; i++) {
      const v = new V3().fromBufferAttribute(a, i); let best = 0, bd = Infinity;
      bvhs.forEach((b, k) => { const h = b.closestPointToPoint(v, tgt); if (h && h.distance < bd) { bd = h.distance; best = k; } });
      SEG[i] = segNames.length + best;
      DEP[i] = THREE.MathUtils.clamp((lungBox.max.z - v.z) / (lungBox.max.z - lungBox.min.z), 0, 1); // 0 anterior … 1 posterior (supine: dependent)
      BASE[i] = THREE.MathUtils.clamp((lungBox.max.y - v.y) / (lungBox.max.y - lungBox.min.y), 0, 1);
    }
    geo.setAttribute('_seg', new THREE.BufferAttribute(SEG, 1)); geo.setAttribute('_dep', new THREE.BufferAttribute(DEP, 1)); geo.setAttribute('_base', new THREE.BufferAttribute(BASE, 1));
    geo.setAttribute('_lobe', new THREE.BufferAttribute(new Float32Array(a.count).fill(li), 1));
    const hil = lung.get(li < 3 ? 'VH_M_hilum_R' : 'VH_M_hilum_L')!; const h = centroid(hil);
    lobeInfo[lobe] = { hilum: h.toArray().map((x) => +x.toFixed(4)), segments: segs.map(([n]) => n.replace('VH_M_', '').replace('_bronchopulmonary_segment', '')), volume: +(vol * 1000).toFixed(3) }; // dm³ ×1000 = mL? (1 dm³ = 1 L) → store litres ×1000 = mL
    segs.forEach(([n]) => segNames.push(n.replace('VH_M_', '').replace('_bronchopulmonary_segment', '')));
    parts.push({ id: `lung_${lobe}`, role: 'lung', geo, extras: { lobe: li } });
    log('lobe', lobe, segs.length, 'segments →', a.count, 'verts, volume', (vol).toFixed(3), 'L');
  }

  // ------------------------------------------------------------- airways
  const airwayWalls: THREE.BufferGeometry[] = []; const cart: THREE.BufferGeometry[] = [];
  const tagAir = (name: string, g: THREE.BufferGeometry) => {
    const rule = AIRWAY_LOBE.find(([re]) => re.test(name)); const lobe = rule ? rule[1] : -1; const gen = rule ? rule[2] : 3;
    const n = g.attributes.position.count;
    g.setAttribute('_lobe', new THREE.BufferAttribute(new Float32Array(n).fill(lobe), 1)); g.setAttribute('_gen', new THREE.BufferAttribute(new Float32Array(n).fill(gen), 1));
    return g;
  };
  const addAir = (src: Map<string, THREE.BufferGeometry>, re: RegExp, isCart: boolean, ratio: number) => {
    for (const [n, g] of src) { if (!re.test(n)) continue; const s = simplify(g, ratio, 0.004); tagAir(isCart ? n.replace(/cartilage_of_the_(lobar|tertiary|main)_bronchus_([LR])/, (_, __, s2) => (s2 === 'R' ? 'right_lower_lobar' : 'left_inferior_lobar')) : n, s); (isCart ? cart : airwayWalls).push(s); }
  };
  addAir(lung, /bronch(us)?$|_basal$/, false, 0.7);
  addAir(mainB, /main_bronchus$/, false, 1);
  addAir(trach, /trachea$|carina$/, false, 1);
  addAir(lung, /cartilage/, true, 0.22);
  addAir(mainB, /cartilage/, true, 0.5);
  addAir(trach, /cartilage/, true, 0.45);
  // cartilage lobe tags: tag per vertex by nearest wall mesh instead of the coarse name rule
  const walls = mergeAttr(airwayWalls, ['_lobe', '_gen']); const wallBVH = new MeshBVH(walls.geo);
  for (const c of cart) { const a = c.attributes.position; const L = c.attributes._lobe.array as Float32Array, Gn = c.attributes._gen.array as Float32Array; const tgt = { point: new V3(), distance: 0, faceIndex: 0 } as any;
    for (let i = 0; i < a.count; i++) { const h = wallBVH.closestPointToPoint(new V3().fromBufferAttribute(a, i), tgt); if (h) { const vi = walls.geo.index!.array[h.faceIndex * 3]; L[i] = (walls.geo.attributes._lobe.array as Float32Array)[vi]; Gn[i] = (walls.geo.attributes._gen.array as Float32Array)[vi]; } } }
  parts.push({ id: 'airway_wall', role: 'airway', geo: walls.geo });
  parts.push({ id: 'airway_cartilage', role: 'cartilage', geo: mergeAttr(cart, ['_lobe', '_gen']).geo });
  const larynx = mergeGeos([...lar.entries()].filter(([n]) => /thyroid|cricoid|arytenoid_cartilage|epiglottic/.test(n)).map(([, g]) => g)); larynx.computeVertexNormals();
  parts.push({ id: 'larynx', role: 'cartilage', geo: simplify(larynx, 0.6, 0.003) });
  log('airways', walls.geo.attributes.position.count, 'wall verts,', parts[parts.length - 2].geo.attributes.position.count, 'cartilage verts');

  // ------------------------------------------------------------- trachea centreline → ETT
  const tr = trach.get('VH_M_trachea')!; const car = centroid(trach.get('VH_M_carina')!);
  const ta = tr.attributes.position; let ymin = Infinity, ymax = -Infinity; for (let i = 0; i < ta.count; i++) { ymin = Math.min(ymin, ta.getY(i)); ymax = Math.max(ymax, ta.getY(i)); }
  const line: THREE.Vector3[] = [];
  for (let s = 0; s <= 10; s++) { const y = THREE.MathUtils.lerp(car.y + 0.15, ymax - 0.05, s / 10); const c = new V3(); let n = 0; for (let i = 0; i < ta.count; i++) if (Math.abs(ta.getY(i) - y) < 0.06) { c.add(new V3().fromBufferAttribute(ta, i)); n++; } if (n) line.push(c.divideScalar(n)); }
  let trR = 0; { const mid = line[5]; let n = 0; for (let i = 0; i < ta.count; i++) { const v = new V3().fromBufferAttribute(ta, i); if (Math.abs(v.y - mid.y) < 0.05) { trR += Math.hypot(v.x - mid.x, v.z - mid.z); n++; } } trR /= n; }
  const cric = centroid(lar.get('VH_M_cricoid_cartilage')!), thy = centroid(lar.get('VH_M_thyroid_cartilage')!);
  const tip = line[0].clone().setY(car.y + 0.3); // 3 cm above the carina
  const up = line[line.length - 1];
  const ettPts = [tip, ...line.filter((p) => p.y > tip.y + 0.05), up, cric.clone().add(new V3(0, 0, -0.05)), thy.clone().add(new V3(0, 0.25, -0.08)), thy.clone().add(new V3(0, 0.75, 0.05)), thy.clone().add(new V3(0, 1.1, 0.5)), thy.clone().add(new V3(0, 1.25, 1.2))];
  const ettCurve = new THREE.CatmullRomCurve3(ettPts, false, 'centripetal');
  const ettR = trR * 0.52; // ~7.5–8.0 mm ID tube in an adult trachea
  const ett = tubeAlong(ettCurve, ettR, 18, 180); const ettS = arcAttr(ett, ettCurve); ett.setAttribute('_s', ettS);
  parts.push({ id: 'ett', role: 'ett', geo: ett });
  const cuffC = new THREE.CatmullRomCurve3(ettPts.slice(0, 3)); const cuff = tubeAlong(cuffC, 1, 24, 40, (u) => ettR + (trR * 0.96 - ettR) * Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.1) / 0.65))) ** 0.6);
  parts.push({ id: 'ett_cuff', role: 'cuff', geo: cuff });
  const ettMeta = { centreline: ettCurve.getSpacedPoints(60).map((p) => p.toArray().map((x) => +x.toFixed(4))), radius: +ettR.toFixed(4), trachealRadius: +trR.toFixed(4), tip: tip.toArray().map((x) => +x.toFixed(4)), carina: car.toArray().map((x) => +x.toFixed(4)) };
  log('ETT radius', ettR.toFixed(3), 'dm; trachea radius', trR.toFixed(3));

  // ------------------------------------------------------------- diaphragm = offset of the diaphragmatic surfaces of the lungs (+ heart's inferior surface)
  const lungs = parts.filter((p) => p.role === 'lung');
  const heartIdsD = ['heart_left_ventricle', 'heart_right_ventricle', 'interventricular_septum'];
  const diaSrc = [...lungs.map((p) => p.geo), ...heartIdsD.map((id) => body.get('VH_M_' + id)!)];
  const dia = diaphragmFrom(diaSrc, lungBox);
  parts.push({ id: 'diaphragm', role: 'diaphragm', geo: dia });

  // ------------------------------------------------------------- heart context, vessels, chest wall, kidneys
  const heartIds = ['heart_left_ventricle', 'heart_right_ventricle', 'left_cardiac_atrium', 'right_cardiac_atrium', 'interventricular_septum'];
  const heart = mergeGeos(heartIds.map((id) => body.get('VH_M_' + id)!)); parts.push({ id: 'heart', role: 'heart', geo: simplify(mergeVertices(heart, 1e-4), 0.35, 0.004) });
  const vessels = cropY(mergeGeos(['aortic_arch', 'ascending_aorta', 'descending_aorta_a', 'pulmonary_trunk', 'pulmonary_artery_L', 'pulmonary_artery_R', 'superior_vena_cava', 'inferior_vena_cava_a'].map((id) => body.get('VH_M_' + id)!)), lungBox.min.y - 0.25, 99);
  parts.push({ id: 'great_vessels', role: 'vessel', geo: simplify(mergeVertices(vessels, 1e-4), 0.4, 0.004) });
  const skin = cropY(body.get('VH_M_skin')!, lungBox.min.y - 1.3, lungBox.max.y + 1.6); parts.push({ id: 'chest_wall', role: 'skin', geo: simplify(skin, 0.5, 0.004) });
  for (const s of ['L', 'R']) {
    const k = mergeGeos(['kidney_capsule_' + s].map((id) => body.get('VH_M_' + id)!)); parts.push({ id: `kidney_${s}`, role: 'kidney', geo: simplify(mergeVertices(k, 1e-4), 0.5, 0.004) });
  }
  log('context: heart', parts.find((p) => p.id === 'heart')!.geo.attributes.position.count, 'skin', parts.find((p) => p.id === 'chest_wall')!.geo.attributes.position.count);

  await writeGLB('public/models/resp.glb', parts, {
    lung: { color: [0.86, 0.55, 0.55], rough: 0.5 }, airway: { color: [0.85, 0.5, 0.48], rough: 0.4 }, cartilage: { color: [0.93, 0.9, 0.84], rough: 0.45 },
    ett: { color: [0.9, 0.93, 0.95], rough: 0.2 }, cuff: { color: [0.85, 0.9, 0.95], rough: 0.2 }, diaphragm: { color: [0.62, 0.22, 0.2], rough: 0.5 },
    heart: { color: [0.5, 0.14, 0.12], rough: 0.45 }, vessel: { color: [0.75, 0.5, 0.48], rough: 0.5 }, skin: { color: [0.8, 0.62, 0.52], rough: 0.6 }, kidney: { color: [0.5, 0.2, 0.18], rough: 0.5 }, default: { color: [0.7, 0.7, 0.7], rough: 0.5 },
  });
  const mapping = {
    generatedAt: new Date().toISOString(), units: 'decimetres, lung-centred', frame: '+X patient left, +Y superior, +Z anterior', sourceCentre: C.toArray(),
    lobes: lobeInfo, segments: segNames, ett: ettMeta, lungBox: { min: lungBox.min.toArray(), max: lungBox.max.toArray() },
    attribution: {
      title: '3D Reference Organs (lung, main bronchus, trachea, larynx, united body), Visible Human Male',
      creators: 'HuBMAP / Human Reference Atlas consortium', data: 'Visible Human Male, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library',
      changes: 'Lobes rebuilt as smooth surfaces from the bronchopulmonary segments; airway meshes simplified and tagged by lobe and generation; diaphragm fitted to the lung bases; endotracheal tube, cuff and teaching attributes added.',
    },
    meshes: parts.map((p) => ({ id: p.id, role: p.role, vertices: p.geo.attributes.position.count })),
  };
  fs.writeFileSync(path.join(ROOT, 'public/models/resp.mapping.json'), JSON.stringify(mapping));
}

function orientUp(g: THREE.BufferGeometry) { g.computeVertexNormals(); const n = g.attributes.normal; let s = 0; for (let i = 0; i < n.count; i++) s += n.getY(i); if (s < 0) { const ix = g.index!.array as any; for (let t = 0; t < ix.length; t += 3) { const q = ix[t + 1]; ix[t + 1] = ix[t + 2]; ix[t + 2] = q; } g.computeVertexNormals(); } }
function mergeAttr(gs: THREE.BufferGeometry[], names: string[]) {
  const geo = mergeGeos(gs); for (const n of names) { const arr: number[] = []; gs.forEach((g) => { const a = g.attributes[n].array; for (let i = 0; i < a.length; i++) arr.push(a[i]); }); geo.setAttribute(n, new THREE.Float32BufferAttribute(arr, 1)); }
  geo.computeVertexNormals(); return { geo };
}
function tubeAlong(curve: THREE.Curve<THREE.Vector3>, r: number, radial: number, segs: number, rf?: (u: number) => number) {
  const g = new THREE.TubeGeometry(curve, segs, 1, radial, false); const pa = g.attributes.position; const c = new V3();
  for (let i = 0; i <= segs; i++) { curve.getPointAt(i / segs, c); const rr = rf ? rf(i / segs) : r; for (let j = 0; j <= radial; j++) { const k = i * (radial + 1) + j; const v = new V3().fromBufferAttribute(pa, k).sub(c).multiplyScalar(rr).add(c); pa.setXYZ(k, v.x, v.y, v.z); } }
  g.deleteAttribute('uv'); const m = mergeVertices(g, 1e-7); m.computeVertexNormals(); return m;
}
function arcAttr(g: THREE.BufferGeometry, curve: THREE.Curve<THREE.Vector3>) {
  const pts = curve.getSpacedPoints(200); const a = g.attributes.position; const S = new Float32Array(a.count);
  for (let i = 0; i < a.count; i++) { const v = new V3().fromBufferAttribute(a, i); let b = 0, d = Infinity; pts.forEach((p, k) => { const e = p.distanceToSquared(v); if (e < d) { d = e; b = k; } }); S[i] = b / 200; }
  return new THREE.BufferAttribute(S, 1);
}
function cropY(g: THREE.BufferGeometry, y0: number, y1: number) {
  const a = g.attributes.position, ix = g.index!.array; const keep: number[] = [];
  for (let t = 0; t < ix.length; t += 3) { const ys = [ix[t], ix[t + 1], ix[t + 2]].map((i) => a.getY(i)); if (Math.min(...ys) >= y0 && Math.max(...ys) <= y1) keep.push(ix[t], ix[t + 1], ix[t + 2]); }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', a.clone()); r.setIndex(keep); const m = compact(r); m.computeVertexNormals(); return m;
}
function compact(g: THREE.BufferGeometry) { const a = g.attributes.position, ix = g.index!.array; const map = new Map<number, number>(); const p: number[] = [], ni: number[] = []; for (let i = 0; i < ix.length; i++) { let j = map.get(ix[i]); if (j === undefined) { j = map.size; map.set(ix[i], j); p.push(a.getX(ix[i]), a.getY(ix[i]), a.getZ(ix[i])); } ni.push(j); } const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); r.setIndex(ni); return r; }
/** Diaphragm sheet: the downward-facing (diaphragmatic) triangles of the lungs and heart, offset 4 mm downward and smoothed. */
function diaphragmFrom(src: THREE.BufferGeometry[], lb: THREE.Box3) {
  const tris: number[] = []; const na = new V3(), nb = new V3(), nc = new V3(), e1 = new V3(), e2 = new V3(), n = new V3();
  for (const g of src) {
    const a = g.attributes.position, ix = g.index!.array;
    for (let t = 0; t < ix.length; t += 3) {
      na.fromBufferAttribute(a, ix[t]); nb.fromBufferAttribute(a, ix[t + 1]); nc.fromBufferAttribute(a, ix[t + 2]);
      n.crossVectors(e1.subVectors(nb, na), e2.subVectors(nc, na)).normalize();
      const cy = (na.y + nb.y + nc.y) / 3;
      if (n.y < -0.45 && cy < lb.min.y + (lb.max.y - lb.min.y) * 0.45) for (const v of [na, nb, nc]) tris.push(v.x, v.y - 0.045, v.z);
    }
  }
  const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(tris, 3));
  const g = mergeVertices(g0, 1e-4); taubin(g, 6);
  const a = g.attributes.position; const D = new Float32Array(a.count);
  for (let i = 0; i < a.count; i++) D[i] = THREE.MathUtils.clamp((a.getY(i) - lb.min.y) / 0.9, 0, 1);
  g.setAttribute('_dome', new THREE.BufferAttribute(D, 1)); g.computeVertexNormals();
  return g;
}

main().catch((e) => { console.error(e); process.exit(1); });
