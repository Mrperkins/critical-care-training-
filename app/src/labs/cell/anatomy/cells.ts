/**
 * Builds a sliced-open cell: membrane (with a rounded lip at the cut), the glassy cytosol surface,
 * and organelles at textbook proportions for three cell types.
 *  - cardiac: branched brick joined to neighbours by intercalated discs; myofibrils with sarcomeres
 *    in register, T-tubules at every Z line, SR, rows of mitochondria, central elongated nucleus.
 *  - neuron: soma with a large pale nucleus and prominent nucleolus, Nissl bodies (rough ER) that
 *    stop at the axon hillock, perinuclear Golgi, spiny branching dendrites, myelinated axon.
 *  - round: generic animal cell (nucleus, rough/smooth ER, Golgi, mitochondria, lysosomes,
 *    peroxisomes, centrioles, vesicles, cytoskeleton).
 */
import * as THREE from 'three';
import type { CellType } from '../model';
import { CELL_DEFS, type CellDef } from './shapes';
import { sdfMesh, sliceLoops, lipGeometry, capGeometry } from './mesh';
import { wet, type WetMaterial } from './materials';
import { nucleus, roughER, smoothER, golgi, mitochondria, mitoRods, lysosomes, peroxisomes, centrioles, dots, microtubules, sweep, merge, rng, V, UP, TRS, alignY, instanced, type Anchor, type Part } from './organelles';

export interface FireState { beat: number; spike: number; depol: number; hyper: number; swell: number; glow: number }
export interface BuiltCell { def: CellDef; root: THREE.Group; anchors: Anchor[]; membrane: WetMaterial[]; outline: THREE.Vector2[][]; tick: (t: number, s: FireState) => void; dispose: () => void }

export const MEMBRANE_T = 0.14; // drawn thickness (a real membrane is ~7 nm: invisible at this scale)

export function buildCell(type: CellType, clip: THREE.Plane): BuiltCell {
  const def = CELL_DEFS[type]; const root = new THREE.Group(); const anchors: Anchor[] = []; const ticks: ((t: number, s: FireState) => void)[] = [];
  const cut = def.cut; const inside = (p: THREE.Vector3, m = 0.12) => def.sdf(p) < -m; const drawn = def.meshSdf ?? def.sdf;
  // membrane
  const shellGeo = sdfMesh(drawn, def.box, type === 'neuron' ? 0.055 : 0.05, 0, 4);
  const mem = wet('#b96f68', { rough: 0.48, clear: 0.36, sheen: 0.28, sheenColor: '#f7c9bd', bump: 1.05, freq: 11, side: THREE.DoubleSide, inner: '#d9988b', sss: '#e58e7e', sssAmt: 0.18, clip: [clip] });
  const lipM = wet('#c98072', { rough: 0.46, clear: 0.32, sheen: 0.24, sheenColor: '#f4c5b9', bump: 0.92, freq: 12, sss: '#e8a092', sssAmt: 0.16});
  const shell = new THREE.Mesh(shellGeo, mem); root.add(shell);
  const lipLoops = sliceLoops(drawn, cut, def.box, 0.025, -MEMBRANE_T / 2); for (const g of lipGeometry(lipLoops, cut, MEMBRANE_T / 2 + 0.005)) root.add(new THREE.Mesh(g, lipM));
  // the cut face of the cytosol: clear, glossy gel
  const gel = wet('#83aaa7', { opacity: 0.16, rough: 0.2, clear: 0.28, sheen: 0.08, bump: 0.42, freq: 4.4, sss: '#b7d8d2', sssAmt: 0.08, depthWrite: false });
  const capLoops = sliceLoops(drawn, cut, def.box, 0.025, -MEMBRANE_T * 0.9); for (const g of capGeometry(capLoops, cut + 0.001)) { const m = new THREE.Mesh(g, gel); m.renderOrder = 5; root.add(m); }
  // soft contact shadow
  root.add(shadow(def));
  const add = (p: Part) => { root.add(p.obj); anchors.push(...p.anchors); if (p.tick) ticks.push((t) => p.tick!(t)); return p; };
  const edge = lipLoops[0]?.[Math.floor((lipLoops[0]?.length ?? 1) * 0.62)] ?? new THREE.Vector2(0, 1);
  anchors.push({ key: 'membrane', label: 'Cell membrane', pos: V(edge.x, cut + 0.12, edge.y) });

  if (type === 'round') buildRound(def, add, inside, anchors);
  if (type === 'cardiac') buildCardiac(def, add, inside, anchors, root, clip);
  if (type === 'neuron') buildNeuron(def, add, inside, anchors, root);

  const membrane = [mem, lipM];
  return {
    def, root, anchors, membrane, outline: lipLoops,
    tick: (t, s) => {
      for (const f of ticks) f(t, s);
      const hot = new THREE.Color('#ff8a4a'), cold = new THREE.Color('#9ab4ff'), base = new THREE.Color('#e7a090'), vol = new THREE.Color('#a9d6ff');
      for (const m of membrane) { m.color.copy(base).lerp(hot, s.depol * 0.7).lerp(cold, s.hyper * 0.55).lerp(vol, s.swell * 0.3); m.userData.u.uGlow.value = s.glow; }
    },
    dispose: () => root.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); }),
  };
}

function shadow(def: CellDef) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 8, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv); const sz = def.box.getSize(V()); const m = new THREE.Mesh(new THREE.PlaneGeometry(sz.x * 1.25, sz.z * 1.25), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; const c = def.box.getCenter(V()); m.position.set(c.x, def.box.min.y - 0.05, c.z); m.renderOrder = -1; return m;
}

/* ================================================================== round textbook cell */
function buildRound(def: CellDef, add: (p: Part) => Part, inside: (p: THREE.Vector3, m?: number) => boolean, anchors: Anchor[]) {
  const cut = def.cut; const y = cut - 0.04; const R = rng(21);
  const nc = V(0.35, cut - 0.12, -0.3); const nr = V(0.82, 0.66, 0.8);
  add(nucleus(nc, nr, 3));
  add(roughER(nc, nr.x, nr.z, 4, y, 0.1, (p) => inside(p, 0.25), 5, { start: 1.03, step: 0.17 }));
  add(smoothER(V(-1.55, 0, 0.55), 0.9, y, (p) => inside(p, 0.25), 7));
  const gu = V(0.15, 0, 1).normalize(); const cs = nc.clone().addScaledVector(gu, 1.42).setY(y - 0.05); const gc = nc.clone().addScaledVector(gu, 1.98);
  add(golgi(gc, Math.atan2(-gu.z, -gu.x), y, 9, 0.95));
  const mito = [{ p: V(-1.1, y, 1.45), yaw: 0.5, s: 1.05 }, { p: V(-1.9, y, -0.55), yaw: 1.4, s: 0.95 }, { p: V(1.95, y, 0.6), yaw: -0.9, s: 1 }, { p: V(-0.2, y, 2.15), yaw: 0.1, s: 0.9 }, { p: V(1.6, y, -1.5), yaw: 2.3, s: 0.85 }];
  add(mitochondria(mito.filter((m) => inside(m.p, 0.4))));
  add(lysosomes([{ p: V(-1.95, y, 0.35), r: 0.13 }, { p: V(2.1, y, -0.35), r: 0.12 }, { p: V(-0.7, y, -1.95), r: 0.11 }, { p: V(1.35, y, 1.9), r: 0.1 }]));
  add(peroxisomes([{ p: V(-1.25, y, -1.3), r: 0.1 }, { p: V(0.4, y, -2.15), r: 0.09 }]));
  add(centrioles(cs, 0.8)); // the centrosome sits between the nucleus and the Golgi
  const ves: THREE.Vector3[] = []; for (let i = 0; i < 26; i++) { const a = R() * Math.PI * 2, r = 1.9 + R() * 0.7; const p = V(Math.cos(a) * r, y + 0.02, Math.sin(a) * r); if (inside(p, 0.25)) ves.push(p); }
  add(dots(ves, 0.035, '#f4b7c9', { label: ['vesicle', 'Transport vesicles'], sizes: ves.map(() => 0.8 + R() * 0.8) }));
  const ribo: THREE.Vector3[] = []; for (let i = 0; i < 560; i++) { const p = V((R() * 2 - 1) * 2.7, y - R() * 0.25, (R() * 2 - 1) * 2.7); if (inside(p, 0.2) && p.distanceTo(nc) > 1.0) ribo.push(p); }
  add(dots(ribo, 0.012, '#7f3f48', { label: ['ribo', 'Free ribosomes'], sizes: ribo.map(() => 0.72 + R() * 0.65) }));
  add(microtubules(cs, 28, 2.4, y - 0.02, (p) => inside(p, 0.25), 13));
  anchors.push({ key: 'cytosol', label: 'Cytosol', pos: V(-1.6, cut + 0.05, 1.6) });
}

/* ================================================================== cardiac myocyte */
function buildCardiac(def: CellDef, add: (p: Part) => Part, inside: (p: THREE.Vector3, m?: number) => boolean, anchors: Anchor[], root: THREE.Group, clip: THREE.Plane) {
  const cut = def.cut; const R = rng(31); const per = 0.26; const fr = 0.07; // sarcomere ≈ 2 µm, myofibril ≈ 1 µm across
  const nc = V(-0.45, cut - 0.1, 0.0), nr = V(0.62, 0.26, 0.3);
  const nuc = nucleus(nc, nr, 4, { color: '#6d56c4' }); nuc.anchors = nuc.anchors.filter((a) => a.key === 'nucleus'); add(nuc);
  const inNuc = (p: THREE.Vector3, pad: number) => ((p.x - nc.x) / (nr.x + pad)) ** 2 + ((p.y - nc.y) / (nr.y + pad)) ** 2 + ((p.z - nc.z) / (nr.z + pad)) ** 2 < 1;
  // myofibrils: rows along the cell axis (and along each branch), 3 layers; aS = position along the axis so Z lines stay in register
  const fib: THREE.BufferGeometry[] = []; const tops: { a: THREE.Vector3; b: THREE.Vector3; ax: THREE.Vector3; s0: number }[] = [];
  const regions = [
    { o: V(0, 0, 0), ax: V(1, 0, 0), from: -4.6, to: 2.35, zs: [-0.82, -0.62, -0.41, -0.2, 0, 0.2, 0.41, 0.62, 0.82] },
    ...def.discs!.slice(1).map((d, i) => { const o = i === 0 ? V(2.15, 0, 0.42) : V(2.15, 0, -0.48); return { o, ax: d.dir.clone(), from: 0.1, to: o.distanceTo(d.pos) + 1.05, zs: [-0.33, -0.12, 0.1, 0.31] }; }),
  ];
  const drawnIn = (p: THREE.Vector3, m: number) => (def.meshSdf ?? def.sdf)(p) < -m && !def.discs!.some((d) => Math.abs(p.clone().sub(d.pos).dot(d.dir)) < 0.07 && p.distanceTo(d.pos) < 1.4);
  for (const rg of regions) {
    const side = V().crossVectors(UP, rg.ax).normalize(); const s0 = rg.ax.x === 1 ? 0 : per * 0.5 + rg.o.dot(rg.ax);
    for (const [li, ly] of [cut - 0.05, cut - 0.23, cut - 0.41].entries()) for (const zz of rg.zs) {
      let seg: THREE.Vector3[] = []; const flush = () => { if (seg.length > 1) { const a = seg[0], b = seg[seg.length - 1]; const L = a.distanceTo(b); if (L > 0.2) { const g = new THREE.CylinderGeometry(fr, fr, L, 12, Math.max(1, Math.round(L / 0.05)), false); g.rotateZ(-Math.PI / 2); const q = new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), rg.ax); g.applyQuaternion(q); const mid = a.clone().add(b).multiplyScalar(0.5); g.translate(mid.x, mid.y, mid.z); const P = g.attributes.position; const aS = new Float32Array(P.count); for (let i = 0; i < P.count; i++) aS[i] = V(P.getX(i), P.getY(i), P.getZ(i)).sub(rg.o).dot(rg.ax) + s0; g.setAttribute('aS', new THREE.BufferAttribute(aS, 1)); fib.push(g); if (li === 0) tops.push({ a: a.clone(), b: b.clone(), ax: rg.ax, s0 }); } } seg = []; };
      for (let u = rg.from; u <= rg.to; u += 0.04) { const p = rg.o.clone().addScaledVector(rg.ax, u).addScaledVector(side, zz); p.y = ly; const ok = drawnIn(p, fr + 0.07) && !inNuc(p, 0.1) && (rg.ax.x === 1 || u > 0.25); if (ok) seg.push(p); else flush(); }
      flush();
    }
  }
  const fibM = wet('#b9474b', { rough: 0.42, clear: 0.55, bump: 0.25, freq: 45, stripes: { axis: 'attr', kind: 'sarcomere' }, sss: '#ff6f66', sssAmt: 0.3 }); fibM.userData.u.uPer.value = per;
  add({ obj: new THREE.Mesh(merge(fib), fibM), mats: [fibM], anchors: [{ key: 'myofibril', label: 'Myofibrils (sarcomeres)', pos: V(-2.4, cut + 0.12, 0.62) }] });
  // T-tubules at every Z line of the main body (Z line where fract(aS/per + 0.5) = 0)
  const tt: THREE.Matrix4[] = [], sr: THREE.Matrix4[] = [], jsr: THREE.Matrix4[] = [], mit: { p: THREE.Vector3; dir: THREE.Vector3; len: number; r: number }[] = [];
  for (let k = -18; k <= 10; k++) {
    const x = per * (k - 0.5); let z0 = 9, z1 = -9; for (let z = -1.1; z <= 1.1; z += 0.03) if (inside(V(x, cut - 0.02, z), 0.1)) { z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    if (z1 - z0 < 0.3 || inNuc(V(x, nc.y, 0), 0.05)) continue; tt.push(TRS(V(x, cut + 0.012, (z0 + z1) / 2), alignY(V(0, 0, 1)), V(1, z1 - z0, 1)));
  }
  // SR lace over each top myofibril: longitudinal tubules between Z lines, junctional cisternae at the Z lines; mitochondria between fibrils, one per sarcomere
  for (const t of tops) {
    const L = t.a.distanceTo(t.b); const side = V().crossVectors(UP, t.ax).normalize();
    for (let u = 0; u < L - per; u += per) {
      const s = t.a.clone().addScaledVector(t.ax, u).sub(new THREE.Vector3()); const sAx = s.dot(t.ax) - (t.ax.x === 1 ? 0 : 0);
      void sAx;
      for (const off of [-0.034, 0.034]) sr.push(TRS(s.clone().addScaledVector(t.ax, per / 2).addScaledVector(side, off).setY(t.a.y + fr * 0.95), alignY(t.ax), V(1, per * 0.78, 1)));
      jsr.push(TRS(s.clone().addScaledVector(side, 0).setY(t.a.y + fr * 0.9), alignY(side), V(1.4, 1, 1)));
      if (R() < 0.85) { const mp = s.clone().addScaledVector(t.ax, per / 2).addScaledVector(side, 0.102).setY(t.a.y + 0.01); if (inside(mp, 0.1) && !inNuc(mp, 0.08)) mit.push({ p: mp, dir: t.ax, len: per * 0.8, r: 0.036 }); }
    }
  }
  const ttM = wet('#f4e6da', { rough: 0.3, clear: 0.8, bump: 0, sss: '#fff3ea', sssAmt: 0.3 }); const srM = wet('#86c4f0', { rough: 0.25, clear: 0.9, bump: 0, opacity: 0.85, sss: '#bfe4ff', sssAmt: 0.35 });
  add({ obj: instanced(new THREE.CylinderGeometry(0.012, 0.012, 1, 6, 1), ttM, tt), mats: [ttM], anchors: [{ key: 'ttub', label: 'T-tubules (at each Z line)', pos: V(1.4, cut + 0.1, -0.85) }] });
  const srGrp = new THREE.Group(); srGrp.add(instanced(new THREE.CylinderGeometry(0.007, 0.007, 1, 5, 1), srM, sr), instanced(new THREE.SphereGeometry(0.018, 8, 6), srM, jsr));
  add({ obj: srGrp, mats: [srM], anchors: [{ key: 'sr', label: 'Sarcoplasmic reticulum', pos: V(-1.9, cut + 0.1, -0.35) }] });
  // perinuclear mitochondria at the nuclear poles; subsarcolemmal row
  for (const sx of [-1, 1]) for (let i = 0; i < 7; i++) mit.push({ p: V(nc.x + sx * (nr.x + 0.12 + R() * 0.25), cut - 0.04, (R() - 0.5) * 0.5), dir: V(1, 0, (R() - 0.5) * 0.4).normalize(), len: 0.16 + R() * 0.08, r: 0.045 });
  add({ ...mitoRods(mit), anchors: [{ key: 'mito', label: 'Mitochondria (~30 % of the cell)', pos: V(nc.x + nr.x + 0.3, cut + 0.12, 0.2) }] });
  add(golgi(V(nc.x - nr.x - 0.26, 0, 0.1), 0, cut - 0.04, 41, 0.42));
  const ly = lysosomes([{ p: V(nc.x + nr.x + 0.35, cut - 0.03, -0.25), r: 0.06 }, { p: V(nc.x - nr.x - 0.2, cut - 0.03, -0.3), r: 0.055 }]); ly.anchors = []; add(ly);
  const gly: THREE.Vector3[] = []; for (let i = 0; i < 360; i++) { const p = V(-3.3 + R() * 6.6, cut - 0.02 - R() * 0.05, (R() * 2 - 1) * 1.0); if (inside(p, 0.1) && !inNuc(p, 0.05)) gly.push(p); }
  add(dots(gly, 0.011, '#3a2426', { label: ['glycogen', 'Glycogen granules'] }));
  add(dots([V(1.25, cut - 0.03, 0.72), V(-2.7, cut - 0.03, -0.72)], 0.06, '#f6d07a', { opacity: 0.85 }));
  // intercalated discs: stepped (interdigitating) junctions with gap junction plaques; a stub of the next cell beyond each
  const discM = wet('#6c2536', { rough: 0.4, clear: 0.5, bump: 0.6, freq: 30, clip: [clip] }); const gjM = wet('#ffd5a8', { rough: 0.3, bump: 0, sss: '#ffd5a8', sssAmt: 0.6 });
  const stubM = wet('#e39b8b', { opacity: 0.4, rough: 0.35, clear: 0.7, bump: 0.5, freq: 7, side: THREE.DoubleSide, clip: [clip], depthWrite: false });
  const discG: THREE.BufferGeometry[] = [], gj: THREE.Matrix4[] = []; const stubs: THREE.BufferGeometry[] = [];
  for (const d of def.discs!) {
    const side = V().crossVectors(UP, d.dir).normalize(); const n = 7;
    for (let j = 0; j < n; j++) { const w = (2 * d.hw) / n; const off = (j % 2 ? 1 : -1) * 0.05; const b = new THREE.BoxGeometry(0.05, d.hh * 1.75, w * 1.02); const q = new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), d.dir); b.applyQuaternion(q); const c = d.pos.clone().addScaledVector(d.dir, off * 0.5).addScaledVector(side, -d.hw + w * (j + 0.5)); c.y = -0.04; b.translate(c.x, c.y, c.z); discG.push(b);
      for (let k = 0; k < 3; k++) gj.push(TRS(c.clone().add(V(0, (R() - 0.3) * d.hh, 0)).addScaledVector(d.dir, 0.02), alignY(d.dir), 1)); }
  }
  const discGrp = new THREE.Group(); discGrp.add(new THREE.Mesh(merge(discG), discM), instanced(new THREE.CylinderGeometry(0.028, 0.028, 0.012, 10), gjM, gj)); void stubs; void stubM;
  const d0 = def.discs![0]; add({ obj: discGrp, mats: [discM, gjM, stubM], anchors: [{ key: 'disc', label: 'Intercalated disc → next heart cell', pos: d0.pos.clone().add(V(0.1, cut + 0.2, 0.55)) }, { key: 'branch', label: 'Branch to a neighbouring cell', pos: def.discs![1].pos.clone().add(V(-0.3, cut + 0.15, 0.2)) }] });
  void root;
}

/* ================================================================== neuron */
function buildNeuron(def: CellDef, add: (p: Part) => Part, inside: (p: THREE.Vector3, m?: number) => boolean, anchors: Anchor[], root: THREE.Group) {
  const cut = def.cut; const R = rng(51); const y = cut - 0.04; const limbs = def.limbs!;
  const nc = V(0.05, cut - 0.2, 0), nr = V(0.5, 0.44, 0.5);
  add(nucleus(nc, nr, 6, { color: '#7563d4' }));
  const hill = limbs.find((l) => l.kind === 'hillock')!; const hillAng = Math.atan2(hill.b.z, hill.b.x);
  // Nissl bodies: stacks of rough ER with polysomes, everywhere in the soma except the axon hillock
  const sheets: THREE.BufferGeometry[] = [], ribo: THREE.Matrix4[] = []; const q = new THREE.Quaternion(); const centres: THREE.Vector3[] = [];
  for (let tries = 0; centres.length < 24 && tries < 600; tries++) {
    const a = R() * Math.PI * 2, r = 0.62 + R() * 0.52; const c = V(Math.cos(a) * r, y, Math.sin(a) * r);
    let da = Math.abs(a - hillAng); da = Math.min(da, Math.PI * 2 - da); if (da < 0.55 || !inside(c, 0.2) || centres.some((o) => o.distanceTo(c) < 0.3)) continue; centres.push(c);
    const rot = R() * Math.PI; const dir = V(Math.cos(rot), 0, Math.sin(rot)); const side = V(-dir.z, 0, dir.x);
    for (let k = 0; k < 4; k++) { const o = c.clone().addScaledVector(side, (k - 1.5) * 0.045); const len = 0.18 + R() * 0.08; const pts = [o.clone().addScaledVector(dir, -len / 2), o.clone().addScaledVector(side, 0.01 * Math.sin(k)), o.clone().addScaledVector(dir, len / 2)]; sheets.push(sweep(pts, { w: 0.012, h: 0.05, radial: 8, seg: 10 }));
      for (let i = 0; i < 7; i++) for (const sd of [-1, 1]) if (R() < 0.7) ribo.push(TRS(o.clone().addScaledVector(dir, (i / 6 - 0.5) * len).addScaledVector(side, sd * 0.02).add(V(0, (R() - 0.3) * 0.06, 0)), q, 0.75)); }
  }
  // Nissl substance also extends into the bases of the dendrites (never into the hillock or axon)
  for (const l of limbs.filter((x) => x.kind === 'dendrite')) for (const t of [0.12, 0.26]) {
    const d = l.b.clone().sub(l.a).normalize(); const side = V(-d.z, 0, d.x); const c = l.a.clone().lerp(l.b, t); c.y = y; if (!inside(c, 0.12)) continue;
    for (let k = 0; k < 3; k++) { const o = c.clone().addScaledVector(side, (k - 1) * 0.04); const len = 0.14; sheets.push(sweep([o.clone().addScaledVector(d, -len / 2), o, o.clone().addScaledVector(d, len / 2)], { w: 0.011, h: 0.045, radial: 8, seg: 8 }));
      for (let i = 0; i < 5; i++) for (const sd of [-1, 1]) if (R() < 0.7) ribo.push(TRS(o.clone().addScaledVector(d, (i / 4 - 0.5) * len).addScaledVector(side, sd * 0.018), q, 0.75)); }
  }
  const nm = wet('#4c3db5', { rough: 0.3, clear: 0.8, bump: 0.4, freq: 20, sss: '#7f6bff', sssAmt: 0.3 }); const rm = wet('#cf2641', { rough: 0.35, bump: 0, sss: '#ff4d6a', sssAmt: 0.2 });
  const ng = new THREE.Group(); ng.add(new THREE.Mesh(merge(sheets), nm), instanced(new THREE.SphereGeometry(0.014, 6, 5), rm, ribo));
  add({ obj: ng, mats: [nm, rm], anchors: [{ key: 'nissl', label: 'Nissl bodies (rough ER)', pos: centres[2]?.clone().setY(cut + 0.12) ?? V(0.8, cut + 0.12, 0.3) }] });
  for (const [i, a] of [0.9, 2.5, -0.9].entries()) { const gp = golgi(V(Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62), a + Math.PI, y, 60 + i, 0.4); if (i) gp.anchors = []; add(gp); }
  // mitochondria: a few opened in the soma, rods elsewhere; neurofilament bundles run into the hillock and dendrites
  const mitoOpen = [0.3, 1.8, 3.6, 5.0].map((a, i) => ({ p: V(Math.cos(a) * 0.95, y, Math.sin(a) * 0.95), yaw: a + 1.2 + i * 0.3, s: 0.55 })).filter((m) => inside(m.p, 0.25));
  add(mitochondria(mitoOpen));
  const rods: { p: THREE.Vector3; dir: THREE.Vector3; len: number; r: number }[] = [];
  for (let i = 0; i < 16; i++) { const a = R() * Math.PI * 2, r = 0.7 + R() * 0.45; const p = V(Math.cos(a) * r, y - 0.02, Math.sin(a) * r); if (inside(p, 0.15)) rods.push({ p, dir: V(-Math.sin(a), 0, Math.cos(a)), len: 0.2 + R() * 0.1, r: 0.035 }); }
  for (const l of limbs.filter((x) => x.kind === 'dendrite' || x.kind === 'hillock')) for (let t = 0.05; t < 0.3; t += 0.12) { const p = l.a.clone().lerp(l.b, t); p.y = Math.min(y - 0.02, p.y + (l.ra - 0.1)); if (inside(p, 0.12)) rods.push({ p, dir: l.b.clone().sub(l.a).normalize(), len: 0.22, r: 0.03 }); }
  add(mitoRods(rods));
  const nf: number[] = []; for (const l of limbs.filter((x) => x.kind !== 'branch')) { const d = l.b.clone().sub(l.a).normalize(); const side = V(-d.z, 0, d.x); for (let k = 0; k < 7; k++) { const off = (k / 6 - 0.5) * l.ra * 1.2; let prev: THREE.Vector3 | null = null; for (let t = -0.25; t <= 0.45; t += 0.04) { const p = l.a.clone().lerp(l.b, t).addScaledVector(side, off); p.y = y - 0.03; if (!inside(p, 0.08)) { prev = null; continue; } if (prev) nf.push(prev.x, prev.y, prev.z, p.x, p.y, p.z); prev = p; } } }
  const nfG = new THREE.BufferGeometry(); nfG.setAttribute('position', new THREE.Float32BufferAttribute(nf, 3));
  add({ obj: new THREE.LineSegments(nfG, new THREE.LineBasicMaterial({ color: '#f0f6ff', transparent: true, opacity: 0.4, depthWrite: false })), mats: [], anchors: [{ key: 'nf', label: 'Neurofilaments & microtubules', pos: hill.a.clone().lerp(hill.b, 0.4).setY(cut + 0.1) }] });
  add(lysosomes([{ p: V(-0.75, y, 0.55), r: 0.06 }, { p: V(0.8, y, -0.6), r: 0.055 }]));
  add(dots([V(0.62, y, 0.78), V(-0.5, y, -0.85), V(0.95, y, -0.2)], 0.045, '#b98a3a', { label: ['lipofuscin', 'Lipofuscin (aging pigment)'], bump: 1 }));
  // dendritic spines (mushroom-shaped: thin neck, bulbous head) on the distal dendrites
  const necks: THREE.Matrix4[] = [], heads: THREE.Matrix4[] = [];
  for (const l of limbs.filter((x) => x.kind === 'branch' || x.kind === 'dendrite')) {
    const d = l.b.clone().sub(l.a); const L = d.length(); d.normalize(); const n = Math.round(L * (l.kind === 'branch' ? 22 : 9));
    for (let i = 0; i < n; i++) { const t = l.kind === 'branch' ? R() * 0.95 : 0.45 + R() * 0.55; const c = l.a.clone().lerp(l.b, t); const r = l.ra + (l.rb - l.ra) * t; const a = R() * Math.PI * 2; const perp = V(-d.z, 0, d.x).multiplyScalar(Math.cos(a)).add(V(0, Math.sin(a), 0)).normalize(); const base = c.clone().addScaledVector(perp, r * 0.92); if (base.y > cut - 0.02) continue; const len = 0.05 + R() * 0.05; necks.push(TRS(base.clone().addScaledVector(perp, len / 2), alignY(perp), V(1, len, 1))); heads.push(TRS(base.clone().addScaledVector(perp, len + 0.02), alignY(perp), V(1, 0.8, 1).multiplyScalar(0.8 + 0.5 * R()))); }
  }
  const spM = wet('#eba493', { rough: 0.35, clear: 0.7, sheen: 0.6, bump: 0.3, sss: '#ff9c86', sssAmt: 0.4 });
  const sg = new THREE.Group(); sg.add(instanced(new THREE.CylinderGeometry(0.011, 0.014, 1, 6, 1), spM, necks), instanced(new THREE.SphereGeometry(0.026, 10, 8), spM, heads));
  const br = limbs.find((l) => l.kind === 'branch')!;
  add({ obj: sg, mats: [spM], anchors: [{ key: 'spines', label: 'Dendritic spines (synapses land here)', pos: br.a.clone().lerp(br.b, 0.7).add(V(0, 0.35, 0)) }, { key: 'dendrite', label: 'Dendrite', pos: limbs[0].a.clone().lerp(limbs[0].b, 0.55).add(V(0, 0.45, 0)) }] });
  // myelin sheath (from a glial cell) in segments along the axon, with nodes of Ranvier between them
  const ax = limbs.find((l) => l.kind === 'axon')!; const dir = ax.b.clone().sub(ax.a); const L = dir.length(); dir.normalize();
  const segs: THREE.BufferGeometry[] = []; let s = 1.15; let node: THREE.Vector3 | null = null; // the axon initial segment is unmyelinated
  while (s + 1.2 < L) { const len = 2.0; const prof: THREE.Vector2[] = []; for (let i = 0; i <= 16; i++) { const u = i / 16; const r = 0.17 + 0.13 * Math.pow(Math.sin(u * Math.PI), 0.35); prof.push(new THREE.Vector2(r, (u - 0.5) * len)); } const g = new THREE.LatheGeometry(prof, 28); g.applyQuaternion(alignY(dir)); const c = ax.a.clone().addScaledVector(dir, s + len / 2); g.translate(c.x, c.y, c.z); segs.push(g); if (!node) node = ax.a.clone().addScaledVector(dir, s + len + 0.06); s += len + 0.12; }
  const myM = wet('#f3eee4', { rough: 0.22, clear: 1, sheen: 0.5, bump: 0.35, freq: 18, stripes: { axis: 'y', kind: 'rings' }, sss: '#ffffff', sssAmt: 0.25 });
  add({ obj: new THREE.Mesh(merge(segs), myM), mats: [myM], anchors: [{ key: 'myelin', label: 'Myelin sheath (glial cell)', pos: ax.a.clone().addScaledVector(dir, 1.6).add(V(0, 0.45, 0)) }, ...(node ? [{ key: 'node', label: 'Node of Ranvier', pos: node.clone().add(V(0, 0.38, 0.1)) }] : []), { key: 'hillock', label: 'Axon hillock', pos: hill.a.clone().lerp(hill.b, 0.45).add(V(0, 0.5, 0.2)) }, { key: 'ais', label: 'Initial segment (spike starts here)', pos: ax.a.clone().addScaledVector(dir, 0.55).add(V(0, 0.32, 0)) }, { key: 'axon', label: 'Axon', pos: ax.a.clone().addScaledVector(dir, 3.4).add(V(0, 0.4, 0)) }] });
  void root; void anchors;
}
