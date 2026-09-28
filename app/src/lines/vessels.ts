/**
 * The limb, neck and head vessels (not in the source anatomy) laid out from skin landmarks:
 * each vessel is a list of points expressed as a fraction across the local limb / neck
 * cross-section (medial–lateral, anterior–posterior), so it always stays inside the body.
 * Right side is described; the left is its mirror image. Arteries carry their distance from the
 * aortic root so a pulse wave can travel through the whole tree at a realistic speed.
 */
import * as THREE from 'three';
import type { LinesAsset } from '../asset/lines';

type Sl = { y: number; c: [number, number, number]; xr: [number, number]; zr: [number, number] };
/** which vessels get a label in the whole-body view: veins on the patient's right (screen left), arteries on the left (screen right) */
export const VESSEL_LABELS: { id: string; t: number; text?: string }[] = [
  { id: 'ijR', t: 0.15 }, { id: 'ejR', t: 0.5 }, { id: 'subvR', t: 0.92, text: 'Subclavian → axillary vein' }, { id: 'cephR', t: 0.78 }, { id: 'basR', t: 0.15 }, { id: 'mcvR', t: 0.5 }, { id: 'fvR', t: 0.2, text: 'Femoral vein' }, { id: 'gsvR', t: 0.72 }, { id: 'ssvR', t: 0.45 },
  { id: 'ccaL', t: 0.6, text: 'Common carotid artery' }, { id: 'subaL', t: 0.55, text: 'Subclavian artery' }, { id: 'brL', t: 0.45 }, { id: 'radL', t: 0.95 }, { id: 'ulnL', t: 0.7 }, { id: 'ciaL', t: 0.6 }, { id: 'femL', t: 0.3 }, { id: 'popL', t: 0.5 }, { id: 'atL', t: 0.93 }, { id: 'ptL', t: 0.5 },
];
export interface Vessel { id: string; name: string; kind: 'artery' | 'vein'; pts: THREE.Vector3[]; r0: number; r1: number; s0: number; label?: THREE.Vector3; side: 'R' | 'L' }

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
function interp(sl: Sl[], y: number): Sl {
  const s = [...sl].sort((a, b) => a.y - b.y); if (y <= s[0].y) return s[0]; if (y >= s[s.length - 1].y) return s[s.length - 1];
  for (let i = 1; i < s.length; i++) if (s[i].y >= y) { const a = s[i - 1], b = s[i]; const f = (y - a.y) / (b.y - a.y || 1); const L = (u: number, v: number) => u + (v - u) * f;
    return { y, c: [L(a.c[0], b.c[0]), y, L(a.c[2], b.c[2])], xr: [L(a.xr[0], b.xr[0]), L(a.xr[1], b.xr[1])], zr: [L(a.zr[0], b.zr[0]), L(a.zr[1], b.zr[1])] }; }
  return s[0];
}
/** point in a horizontal cross-section: fm = medial(+)/lateral(−) fraction, fa = anterior(+)/posterior(−) fraction (right side, medial = +x) */
function inSec(sl: Sl[], y: number, fm: number, fa: number) {
  const s = interp(sl, y); const hx = (s.xr[1] - s.xr[0]) / 2, hz = (s.zr[1] - s.zr[0]) / 2; const cx = (s.xr[0] + s.xr[1]) / 2, cz = (s.zr[0] + s.zr[1]) / 2;
  return V(cx + fm * hx, y, cz + fa * hz);
}
const along = (sl: Sl[], y0: number, y1: number, n: number, f: (t: number) => [number, number]) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; const [fm, fa] = f(t); return inSec(sl, y0 + (y1 - y0) * t, fm, fa); });
const plen = (p: THREE.Vector3[]) => p.reduce((s, q, i) => (i ? s + q.distanceTo(p[i - 1]) : 0), 0);

export const WRIST_Y = 0.75; const ELBOW_Y = 2.55;

export function buildVessels(asset: LinesAsset): Vessel[] {
  const L = asset.mapping.landmarks;
  const arm = (L.arm as Sl[]).filter((a) => !(a.y > 0.7 && a.y < 1.1));
  const leg = L.leg as Sl[]; const out: Vessel[] = [];
  const add = (v: Omit<Vessel, 'side'>) => out.push({ ...v, side: 'R' });
  // distances from the aortic root along the arterial tree (dm)
  const ROOT = V(0.068, 4.99, 0.29), BRACH_TOP = V(-0.2, 6.08, 0.24);
  const dBrach = plen([ROOT, V(-0.02, 5.32, 0.3), V(-0.08, 5.62, 0.24), BRACH_TOP]);

  /* --------------------------- neck & head (right) */
  const carotid = [BRACH_TOP, V(-0.28, 6.5, 0.22), V(-0.33, 6.85, 0.2), V(-0.35, 7.05, 0.18)];
  add({ id: 'ccaR', name: 'Common carotid artery', kind: 'artery', pts: carotid, r0: 0.04, r1: 0.036, s0: dBrach, label: V(-0.25, 6.6, 0.3) });
  const dBif = dBrach + plen(carotid);
  add({ id: 'icaR', name: 'Internal carotid artery', kind: 'artery', pts: [carotid[3], V(-0.37, 7.4, 0.08), V(-0.36, 7.75, -0.02), V(-0.3, 8.0, 0.02)], r0: 0.03, r1: 0.026, s0: dBif });
  const eca = [carotid[3], V(-0.38, 7.25, 0.3), V(-0.5, 7.55, 0.28), V(-0.62, 7.95, 0.18), V(-0.66, 8.35, 0.2), V(-0.6, 8.75, 0.25)];
  add({ id: 'ecaR', name: 'External carotid → superficial temporal', kind: 'artery', pts: eca, r0: 0.024, r1: 0.013, s0: dBif });
  add({ id: 'facR', name: 'Facial artery', kind: 'artery', pts: [V(-0.4, 7.3, 0.34), V(-0.5, 7.35, 0.65), V(-0.42, 7.6, 0.95), V(-0.28, 7.9, 1.05)], r0: 0.014, r1: 0.01, s0: dBif + 0.3 });
  add({ id: 'ijR', name: 'Internal jugular vein', kind: 'vein', pts: [V(-0.44, 7.75, -0.08), V(-0.5, 7.25, 0.05), V(-0.47, 6.8, 0.2), V(-0.45, 6.4, 0.26), V(-0.38, 5.95, 0.26)], r0: 0.06, r1: 0.085, s0: 0, label: V(-0.72, 6.9, 0.25) });
  add({ id: 'ejR', name: 'External jugular vein', kind: 'vein', pts: [V(-0.62, 7.45, 0.2), V(-0.68, 7.05, 0.42), V(-0.74, 6.6, 0.42), V(-0.8, 6.2, 0.3), V(-0.72, 6.02, 0.24)], r0: 0.018, r1: 0.026, s0: 0 });
  add({ id: 'facvR', name: 'Facial vein', kind: 'vein', pts: [V(-0.3, 7.95, 1.0), V(-0.45, 7.6, 0.85), V(-0.52, 7.32, 0.55), V(-0.5, 7.2, 0.2)], r0: 0.012, r1: 0.018, s0: 0 });

  /* --------------------------- arm (right) */
  const sub = [BRACH_TOP, V(-0.62, 6.16, 0.18), V(-1.2, 5.92, 0.02), V(-1.75, 5.2, -0.08)];
  add({ id: 'subaR', name: 'Subclavian → axillary artery', kind: 'artery', pts: sub, r0: 0.045, r1: 0.04, s0: dBrach });
  let d = dBrach + plen(sub);
  const top = arm.reduce((a, b) => (a.y > b.y ? a : b)); const dir = V(top.c[0] - interp(arm, top.y - 0.6).c[0], 0.6, 0).normalize();
  const shoulder = V(top.c[0], top.y, top.c[2]).add(dir.clone().multiplyScalar(0.8)).add(V(0.25, 0, 0.05));
  const brach = [sub[3], shoulder, ...along(arm, top.y, ELBOW_Y, 6, (t) => [0.5 - 0.35 * t, 0.2 + 0.2 * t])];
  add({ id: 'brR', name: 'Brachial artery', kind: 'artery', pts: brach, r0: 0.035, r1: 0.028, s0: d, label: brach[3].clone().add(V(0.1, 0, 0.25)) });
  d += plen(brach); const cubital = brach[brach.length - 1];
  const radial = [cubital, ...along(arm, ELBOW_Y - 0.15, WRIST_Y, 8, (t) => [-0.1 - 0.35 * t, 0.3 + 0.12 * t])];
  add({ id: 'radR', name: 'Radial artery', kind: 'artery', pts: radial, r0: 0.024, r1: 0.02, s0: d, label: radial[5].clone().add(V(-0.25, 0, 0.3)) });
  const ulnar = [cubital, ...along(arm, ELBOW_Y - 0.15, WRIST_Y, 8, (t) => [0.2 + 0.25 * t, 0.28 + 0.12 * t])];
  add({ id: 'ulnR', name: 'Ulnar artery', kind: 'artery', pts: ulnar, r0: 0.024, r1: 0.02, s0: d, label: ulnar[5].clone().add(V(0.3, 0, 0.3)) });
  const rW = radial[radial.length - 1], uW = ulnar[ulnar.length - 1];
  // veins of the arm
  const subv = [V(-0.38, 6.02, 0.3), V(-0.7, 6.02, 0.32), V(-1.2, 5.85, 0.16), V(-1.72, 5.15, 0.05)];
  add({ id: 'subvR', name: 'Subclavian → axillary vein', kind: 'vein', pts: subv, r0: 0.06, r1: 0.05, s0: 0 });
  add({ id: 'brvR', name: 'Brachial vein', kind: 'vein', pts: [subv[3], shoulder.clone().add(V(0.08, 0, 0.06)), ...along(arm, top.y, ELBOW_Y, 5, (t) => [0.62 - 0.3 * t, 0.05 + 0.15 * t])], r0: 0.04, r1: 0.025, s0: 0 });
  const ceph = [...along(arm, WRIST_Y + 0.05, ELBOW_Y - 0.1, 6, () => [-0.68, 0.3]), ...along(arm, ELBOW_Y + 0.1, top.y, 6, (t) => [-0.7 + 0.2 * t, 0.45 + 0.15 * t]), V(-1.55, 5.45, 0.45), V(-1.25, 5.85, 0.3), subv[2]];
  add({ id: 'cephR', name: 'Cephalic vein', kind: 'vein', pts: ceph, r0: 0.02, r1: 0.028, s0: 0, label: ceph[9].clone().add(V(-0.35, 0, 0.3)) });
  const basil = [...along(arm, WRIST_Y + 0.05, ELBOW_Y - 0.1, 6, () => [0.7, 0.12]), ...along(arm, ELBOW_Y + 0.1, ELBOW_Y + 1.2, 4, (t) => [0.7 - 0.2 * t, 0.15 - 0.1 * t])];
  add({ id: 'basR', name: 'Basilic vein', kind: 'vein', pts: basil, r0: 0.02, r1: 0.028, s0: 0, label: basil[4].clone().add(V(0.35, 0, 0.2)) });
  add({ id: 'mcvR', name: 'Median cubital vein', kind: 'vein', pts: [inSec(arm, ELBOW_Y - 0.25, -0.66, 0.32), inSec(arm, ELBOW_Y - 0.05, 0.0, 0.52), inSec(arm, ELBOW_Y + 0.12, 0.66, 0.25)], r0: 0.02, r1: 0.02, s0: 0 });

  /* --------------------------- abdomen → legs (right) */
  const bif = V(0.1, 1.9, 0.25); const dBif2 = plen([ROOT, V(0.0, 5.55, 0.2), V(0.1, 5.45, -0.3), V(0.13, 4.2, -0.3), V(0.12, 2.8, 0.05), bif]);
  const cia = [bif, V(-0.2, 1.55, 0.25), V(-0.45, 1.2, 0.2)];
  add({ id: 'ciaR', name: 'Common iliac artery', kind: 'artery', pts: cia, r0: 0.05, r1: 0.045, s0: dBif2 });
  let dl = dBif2 + plen(cia);
  const groin = V(-0.85, 0.05, 0.62);
  const eia = [cia[2], V(-0.62, 0.7, 0.35), groin];
  add({ id: 'eiaR', name: 'External iliac artery', kind: 'artery', pts: eia, r0: 0.045, r1: 0.042, s0: dl }); dl += plen(eia);
  add({ id: 'iiaR', name: 'Internal iliac artery', kind: 'artery', pts: [cia[2], V(-0.55, 0.9, -0.2), V(-0.55, 0.45, -0.45)], r0: 0.03, r1: 0.02, s0: dl - plen(eia) });
  const fem = [groin, ...along(leg, -0.8, -3.6, 7, (t) => [0.3 + 0.25 * t, 0.45 - 0.45 * t])];
  add({ id: 'femR', name: 'Femoral artery', kind: 'artery', pts: fem, r0: 0.042, r1: 0.036, s0: dl, label: fem[2].clone().add(V(-0.15, 0, 0.45)) }); dl += plen(fem);
  add({ id: 'pfaR', name: 'Deep femoral (profunda) artery', kind: 'artery', pts: [fem[1], inSec(leg, -1.4, -0.05, -0.05), inSec(leg, -2.4, -0.15, -0.25)], r0: 0.03, r1: 0.018, s0: dl - plen(fem) + 0.4 });
  const pop = [fem[fem.length - 1], ...along(leg, -3.9, -5.3, 4, (t) => [0.2 - 0.15 * t, -0.3 - 0.25 * Math.sin(Math.PI * Math.min(1, t * 1.3))])];
  add({ id: 'popR', name: 'Popliteal artery', kind: 'artery', pts: pop, r0: 0.034, r1: 0.03, s0: dl, label: pop[2].clone().add(V(-0.35, 0, -0.3)) }); dl += plen(pop);
  const tri = pop[pop.length - 1];
  const at = [tri, ...along(leg, -5.45, -8.25, 8, (t) => [-0.1 - 0.12 * t, 0.2 + 0.35 * t]), V(inSec(leg, -8.6, 0.05, 0).x, -8.7, -0.2), V(inSec(leg, -8.6, 0.12, 0).x, -8.78, -0.02)];
  add({ id: 'atR', name: 'Anterior tibial → dorsalis pedis', kind: 'artery', pts: at, r0: 0.024, r1: 0.014, s0: dl, label: at[10].clone().add(V(-0.3, 0, 0.35)) });
  const pt = [tri, ...along(leg, -5.45, -8.3, 8, (t) => [0.25 + 0.3 * t, -0.35 + 0.15 * t]), V(inSec(leg, -8.6, 0.3, 0).x, -8.92, -0.6)];
  add({ id: 'ptR', name: 'Posterior tibial artery', kind: 'artery', pts: pt, r0: 0.024, r1: 0.016, s0: dl, label: pt[8].clone().add(V(0.4, 0, -0.2)) });
  // veins of the leg
  const fv = [V(-0.55, 0.62, 0.3), V(-0.78, 0.05, 0.55), ...along(leg, -0.8, -3.6, 7, (t) => [0.45 + 0.2 * t, 0.35 - 0.45 * t]), ...along(leg, -3.9, -5.3, 4, (t) => [0.3 - 0.1 * t, -0.35 - 0.2 * Math.sin(Math.PI * t)])];
  add({ id: 'fvR', name: 'Femoral → popliteal vein', kind: 'vein', pts: fv, r0: 0.05, r1: 0.036, s0: 0, label: fv[4].clone().add(V(0.35, 0, 0.3)) });
  add({ id: 'tibvR', name: 'Tibial veins', kind: 'vein', pts: [fv[fv.length - 1], ...along(leg, -5.45, -8.3, 7, (t) => [0.35 + 0.35 * t, -0.3 + 0.1 * t])], r0: 0.022, r1: 0.016, s0: 0 });
  const gsv = [V(inSec(leg, -8.3, 0.5, 0).x, -8.3, inSec(leg, -8.3, 0, 0.3).z), ...along(leg, -8.1, -4.6, 8, (t) => [0.72 - 0.02 * t, 0.15 - 0.3 * t]), ...along(leg, -4.3, -0.9, 7, (t) => [0.7 - 0.25 * t, -0.1 + 0.62 * t]), V(-0.75, 0.0, 0.55)];
  add({ id: 'gsvR', name: 'Great saphenous vein', kind: 'vein', pts: gsv, r0: 0.018, r1: 0.028, s0: 0, label: gsv[6].clone().add(V(0.45, 0, 0.2)) });
  add({ id: 'ssvR', name: 'Small saphenous vein', kind: 'vein', pts: [...along(leg, -8.2, -5.0, 6, (t) => [-0.45 + 0.45 * t, -0.62 + 0.05 * t])], r0: 0.015, r1: 0.022, s0: 0 });

  // mirror to the left
  const left: Vessel[] = out.map((v) => ({ ...v, id: v.id.replace(/R$/, 'L'), side: 'L', label: undefined, pts: v.pts.map((p) => V(-p.x, p.y, p.z)) }));
  // left carotid and subclavian come straight off the arch
  const lc = left.find((v) => v.id === 'ccaL')!; lc.pts = [V(0.3, 6.78, 0.28), V(0.33, 6.9, 0.22), V(0.35, 7.05, 0.18)]; lc.s0 = dBrach + 0.6;
  const ls = left.find((v) => v.id === 'subaL')!; ls.pts = [V(0.24, 6.12, 0.07), V(0.62, 6.16, 0.12), ...ls.pts.slice(2)];
  return [...out, ...left];
}

/** Tube along a smooth curve with a linearly tapering radius; `aS` = distance from the aortic root (for the pulse-wave shader). */
export function taperTube(v: Vessel, seg = 0, radial = 8) {
  const curve = new THREE.CatmullRomCurve3(v.pts, false, 'centripetal'); const len = curve.getLength(); const n = seg || Math.max(8, Math.round(len * 18));
  const frames = curve.computeFrenetFrames(n, false); const pos: number[] = [], nor: number[] = [], s: number[] = [], idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n; const p = curve.getPointAt(t); const r = v.r0 + (v.r1 - v.r0) * t; const N = frames.normals[i], B = frames.binormals[i];
    for (let j = 0; j <= radial; j++) { const a = (j / radial) * Math.PI * 2; const nx = Math.cos(a) * N.x + Math.sin(a) * B.x, ny = Math.cos(a) * N.y + Math.sin(a) * B.y, nz = Math.cos(a) * N.z + Math.sin(a) * B.z; pos.push(p.x + r * nx, p.y + r * ny, p.z + r * nz); nor.push(nx, ny, nz); s.push(v.s0 + t * len); }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < radial; j++) { const a = i * (radial + 1) + j, b = a + radial + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('aS', new THREE.Float32BufferAttribute(s, 1)); g.setIndex(idx); return g;
}
export function mergeTubes(vs: Vessel[]) {
  const gs = vs.map((v) => taperTube(v)); let nv = 0, ni = 0; gs.forEach((g) => { nv += g.attributes.position.count; ni += g.index!.count; });
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), s = new Float32Array(nv), idx = new Uint32Array(ni); let ov = 0, oi = 0;
  for (const g of gs) { pos.set(g.attributes.position.array as Float32Array, ov * 3); nor.set(g.attributes.normal.array as Float32Array, ov * 3); s.set(g.attributes.aS.array as Float32Array, ov); const ix = g.index!.array; for (let k = 0; k < ix.length; k++) idx[oi + k] = ix[k] + ov; ov += g.attributes.position.count; oi += ix.length; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1)); g.setIndex(new THREE.BufferAttribute(idx, 1)); return g;
}
