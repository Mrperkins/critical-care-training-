/**
 * Membrane protein models. Two levels of detail:
 *  - studGeometry(): a small merged mesh per transporter kind, instanced over the whole cell;
 *  - buildProtein(): a detailed cartoon for the membrane close-up (rods = α-helices), with named
 *    parts the renderer animates (pump head rocking, channel filter glow, Na⁺ inactivation gate).
 * Local frame: +y points out of the cell; the membrane mid-plane is y = 0.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { TRANSPORTERS, type TransporterKind } from './model';

const cyl = (r: number, h: number, x = 0, y = 0, z = 0, seg = 10, tiltX = 0, tiltZ = 0) => { const g = new THREE.CylinderGeometry(r, r, h, seg, 1); g.rotateX(tiltX); g.rotateZ(tiltZ); g.translate(x, y, z); return g; };
const ball = (r: number, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => { const g = new THREE.SphereGeometry(r, 16, 12); g.scale(sx, sy, sz); g.translate(x, y, z); return g; };
const ring = (n: number, rad: number, fn: (x: number, z: number, a: number) => THREE.BufferGeometry, off = 0) => Array.from({ length: n }, (_, i) => { const a = off + (i / n) * Math.PI * 2; return fn(Math.cos(a) * rad, Math.sin(a) * rad, a); });
const merge = (gs: THREE.BufferGeometry[]) => { const clean = gs.map((g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k); return n; }); const m = mergeGeometries(clean)!; m.computeVertexNormals(); return m; };
function hourglass(h: number, rMax: number, rMin: number) { const pts: THREE.Vector2[] = []; for (let i = 0; i <= 12; i++) { const t = i / 12; const y = (t - 0.5) * h; pts.push(new THREE.Vector2(rMin + (rMax - rMin) * Math.pow(Math.abs(t - 0.5) * 2, 1.6), y)); } return new THREE.LatheGeometry(pts, 14); }

/* ------------------------------------------------------------------ whole-cell studs (≈ 0.2 tall) */
export function studGeometry(kind: TransporterKind): THREE.BufferGeometry {
  switch (kind) {
    case 'pump': return merge([cyl(0.07, 0.19, 0, 0, 0, 14), ball(0.075, 0, -0.13, 0, 1.2, 0.8, 1.1), ball(0.042, 0.045, 0.115, 0)]);
    case 'kchan': return merge(ring(4, 0.042, (x, z) => cyl(0.028, 0.2, x, 0, z, 8)));
    case 'nachan': return merge([...ring(4, 0.048, (x, z) => cyl(0.03, 0.21, x, 0, z, 8)), ...ring(4, 0.088, (x, z) => cyl(0.016, 0.15, x, 0.02, z, 6), Math.PI / 4)]);
    case 'cachan': return merge(ring(4, 0.046, (x, z) => cyl(0.029, 0.2, x, 0, z, 8)));
    case 'aqp': return merge(ring(4, 0.045, (x, z) => { const g = hourglass(0.2, 0.034, 0.016); g.translate(x, 0, z); return g; }, Math.PI / 4));
    case 'vrac': return merge(ring(6, 0.058, (x, z) => cyl(0.02, 0.2, x, 0.01, z, 6)));
  }
}

/* ------------------------------------------------------------------ close-up proteins */
export interface ProteinParts { group: THREE.Group; mats: THREE.MeshPhysicalMaterial[]; head?: THREE.Object3D; filter?: THREE.Mesh; gate?: THREE.Object3D; sensors?: THREE.Object3D; pore?: THREE.Mesh }
function mat(color: string, opts: Partial<THREE.MeshPhysicalMaterialParameters> = {}) { return new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35, sheen: 0.3, sheenColor: new THREE.Color('#ffffff'), ...opts }); }
/** α-helix rod bundle around an axis. */
function helices(n: number, rad: number, len: number, r: number, tilt: number, y = 0, off = 0) {
  return merge(ring(n, rad, (x, z, a) => { const g = new THREE.CylinderGeometry(r, r, len, 12, 1); g.rotateZ(tilt * Math.cos(a + 1.1)); g.rotateX(tilt * Math.sin(a + 1.1)); g.translate(x, y, z); return g; }, off));
}

export function buildProtein(kind: TransporterKind): ProteinParts {
  const g = new THREE.Group(); const base = TRANSPORTERS[kind].color; const mats: THREE.MeshPhysicalMaterial[] = [];
  const M = (c: string, o?: Partial<THREE.MeshPhysicalMaterialParameters>) => { const m = mat(c, o); mats.push(m); return m; };
  const add = (geo: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D = g) => { const mesh = new THREE.Mesh(geo, m); parent.add(mesh); return mesh; };
  const parts: ProteinParts = { group: g, mats };
  const dark = new THREE.Color(base).multiplyScalar(0.62).getStyle();
  if (kind === 'pump') {
    // α subunit: 10 transmembrane helices; cytoplasmic N, P and A domains (the part that rocks with each ATP)
    add(merge([helices(6, 0.36, 1.25, 0.11, 0.12), helices(4, 0.18, 1.3, 0.1, 0.08, 0, 0.4)]), M(base));
    const head = new THREE.Group(); head.position.y = -0.72; g.add(head); parts.head = head;
    add(ball(0.36, -0.28, -0.42, 0.05, 1.05, 0.95, 1), M(base), head); add(ball(0.3, 0.3, -0.36, -0.12, 1, 0.9, 1), M(dark), head); add(ball(0.26, 0.05, -0.72, 0.2), M(base), head);
    // β subunit: one helix + glycosylated ectodomain on the outside
    add(merge([cyl(0.09, 1.2, 0.5, 0.05, 0.28, 10, 0, -0.15), ball(0.26, 0.42, 0.85, 0.28, 1.2, 0.8, 1)]), M('#d9c38a'));
    add(merge([ball(0.07, 0.3, 1.15, 0.3), ball(0.06, 0.2, 1.28, 0.36), ball(0.06, 0.4, 1.3, 0.22), ball(0.055, 0.12, 1.4, 0.4)]), M('#bfe3b0'));
    parts.pore = add(cyl(0.16, 1.3, 0, 0, 0, 16), M('#fff2c8', { transparent: true, opacity: 0.0, emissive: new THREE.Color('#ffcf5a'), emissiveIntensity: 0 }));
  } else if (kind === 'kchan' || kind === 'cachan' || kind === 'nachan') {
    // four subunits (or domains) around a central pore; outer + inner helix each form an inverted teepee
    const n = 4; const col = kind === 'nachan' ? base : base;
    add(merge(ring(n, 0.36, (x, z, a) => { const o = cyl(0.12, 1.35, x * 1.1, 0, z * 1.1, 12); o.rotateY(0); const i = new THREE.CylinderGeometry(0.1, 0.1, 1.3, 12); i.rotateZ(0.22 * Math.cos(a)); i.rotateX(-0.22 * Math.sin(a)); i.translate(x * 0.62, -0.05, z * 0.62); return merge([o, i]); }, Math.PI / 4)), M(col));
    if (kind === 'nachan') { // voltage-sensor paddles (S1–S4) outside each domain
      const s = new THREE.Group(); g.add(s); parts.sensors = s;
      add(merge(ring(4, 0.78, (x, z) => merge([cyl(0.075, 1.0, x, 0, z, 10), cyl(0.07, 0.95, x * 1.14, 0.05, z * 1.14, 10)]))), M(dark), s);
    }
    // selectivity filter: a ring at the outer mouth that lights up as an ion passes
    parts.filter = add(new THREE.TorusGeometry(0.2, 0.05, 10, 28).rotateX(Math.PI / 2).translate(0, 0.52, 0), M(kind === 'kchan' ? '#d6c2ff' : kind === 'nachan' ? '#ffd2a6' : '#ffffff', { emissive: new THREE.Color(base), emissiveIntensity: 0.1 }));
    parts.pore = add(cyl(0.13, 1.3, 0, 0, 0, 16), M('#ffffff', { transparent: true, opacity: 0.0, emissive: new THREE.Color(base), emissiveIntensity: 0 }));
    if (kind === 'nachan') { // the inactivation gate: a ball on a tether under the pore (III–IV linker)
      const gate = new THREE.Group(); g.add(gate); parts.gate = gate;
      add(ball(0.2, 0, 0, 0), M('#ff6a3d', { emissive: new THREE.Color('#ff6a3d'), emissiveIntensity: 0.15 }), gate);
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.62, -0.62, 0.1), new THREE.Vector3(0.62, -1.0, 0.2), new THREE.Vector3(0.3, -1.05, 0.1), new THREE.Vector3(0, -0.95, 0)]), 20, 0.035, 6), M('#e39a6e'));
    }
  } else if (kind === 'aqp') {
    // tetramer; each monomer has its own hourglass-shaped water pore
    add(merge(ring(4, 0.42, (x, z) => { const h = hourglass(1.35, 0.34, 0.15); h.translate(x, 0, z); return h; }, Math.PI / 4)), M(base, { transparent: true, opacity: 0.92 }));
    add(merge(ring(4, 0.42, (x, z) => cyl(0.05, 1.4, x, 0, z, 8))), M('#dff1ff', { emissive: new THREE.Color('#7cc8ff'), emissiveIntensity: 0.4 }));
    parts.pore = add(cyl(0.3, 1.3, 0, 0, 0, 16), M('#ffffff', { transparent: true, opacity: 0.0, emissive: new THREE.Color(base), emissiveIntensity: 0 }));
  } else { // VRAC: LRRC8 hexamer with a wide pore
    add(merge(ring(6, 0.5, (x, z, a) => { const o = cyl(0.11, 1.35, x, 0, z, 10); const e = ball(0.16, x * 1.05, 0.72, z * 1.05); const c = ball(0.2, x * 0.95, -0.85, z * 0.95); void a; return merge([o, e, c]); })), M(base));
    parts.pore = add(cyl(0.25, 1.3, 0, 0, 0, 16), M('#ffffff', { transparent: true, opacity: 0.0, emissive: new THREE.Color(base), emissiveIntensity: 0 }));
  }
  return parts;
}
