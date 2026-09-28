/**
 * Shared visual effects library: small, physiology-agnostic building blocks reused by every
 * scene (blood, lung, cell, lines, and future neuro/abdomen). Nothing here computes physiology —
 * callers pass in values read from the one physiology engine.
 */
import * as THREE from 'three';

/** Biconcave red cell (Evans–Fung profile), radius r, axis = +Y. */
export function rbcGeometry(r: number, segments = 28) {
  const C0 = 0.81 / 3.91, C2 = 7.83 / 3.91, C4 = -4.39 / 3.91; const n = Math.max(8, Math.round(segments)); const pts: THREE.Vector2[] = [];
  const h = (q: number) => 0.5 * Math.sqrt(Math.max(0, 1 - q * q)) * (C0 + C2 * q * q + C4 * q ** 4);
  for (let i = 0; i <= n; i++) { const q = Math.sin((i / n) * Math.PI / 2); pts.push(new THREE.Vector2(q * r, -h(q) * r)); }
  for (let i = n - 1; i >= 0; i--) { const q = Math.sin((i / n) * Math.PI / 2); pts.push(new THREE.Vector2(q * r, h(q) * r)); }
  pts[0].x = 0.0001; pts[pts.length - 1].x = 0.0001;
  const g = new THREE.LatheGeometry(pts, Math.max(12, Math.round(segments * 1.3))); g.computeVertexNormals(); g.computeBoundingSphere(); return g;
}

const OXY = new THREE.Color('#d8141a'), DEOXY = new THREE.Color('#5a0d24');
/** Teaching palette: deoxygenated blood drawn blue-violet so O₂ loading is obvious (textbook convention). */
const T_OXY = new THREE.Color('#e3262b'), T_DEOXY = new THREE.Color('#47307e');
export const SAT_PALETTE = { venous: '#5a0d24', arterial: '#d8141a', teachVenous: '#47307e', teachArterial: '#e3262b' } as const;
/** Blood colour for an O₂ saturation (0–1): dark venous → bright arterial (or the blue→red teaching palette). */
export function saturationColor(sat: number, out = new THREE.Color(), teaching = false) {
  const x = Math.max(0, Math.min(1, (sat - 0.45) / 0.53));
  return teaching ? out.copy(T_DEOXY).lerp(T_OXY, x ** 2.2) : out.copy(DEOXY).lerp(OXY, x ** 1.25);
}

/** Frame-rate independent exponential approach. */
export const approach = (cur: number, target: number, rate: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

/** Particle budget for a quality tier (visual density only — never physiology). */
export type Tier = 'high' | 'medium' | 'low';
export const budget = (tier: Tier, high: number) => Math.round(high * (tier === 'high' ? 1 : tier === 'medium' ? 0.55 : 0.22));

/** A pool of short-lived particles moving from a source point to a sink point along a gentle arc (diffusion, ion or fluid movement). */
export interface Mote { from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number; alive: boolean; bend: THREE.Vector3 }
export class MotePool {
  motes: Mote[];
  constructor(n: number) { this.motes = Array.from({ length: n }, () => ({ from: new THREE.Vector3(), to: new THREE.Vector3(), t: 0, dur: 1, alive: false, bend: new THREE.Vector3() })); }
  spawn(from: THREE.Vector3, to: THREE.Vector3, dur: number, bend = 0.1) {
    const m = this.motes.find((x) => !x.alive); if (!m) return;
    m.from.copy(from); m.to.copy(to); m.t = 0; m.dur = dur; m.alive = true; m.bend.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(bend);
  }
  /** advance and write instance matrices; returns the number alive */
  update(dt: number, mesh: THREE.InstancedMesh, size: number, tmp = new THREE.Object3D()) {
    let n = 0;
    this.motes.forEach((m, i) => {
      if (m.alive) { m.t += dt / m.dur; if (m.t >= 1) m.alive = false; }
      if (m.alive) { const s = m.t; tmp.position.copy(m.from).lerp(m.to, s).addScaledVector(m.bend, Math.sin(Math.PI * s)); tmp.scale.setScalar(size * Math.min(1, Math.min(s, 1 - s) * 8)); n++; }
      else tmp.scale.setScalar(0.00001);
      tmp.updateMatrix(); mesh.setMatrixAt(i, tmp.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true; return n;
  }
}
