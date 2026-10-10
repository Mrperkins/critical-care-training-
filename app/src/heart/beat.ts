/**
 * Cardiac mechanics for the real heart (body frame, decimetres). One continuous deformation field drives every heart
 * mesh — chambers, valves, great-vessel roots, coronaries, papillary muscles, conduction system, pericardium — so parts
 * attached to each other move together and no gaps open:
 *
 *  - long-axis shortening toward a fixed apex (the AV plane descends toward the apex in systole, the atria are pulled
 *    down with it and the great-vessel roots follow with a fall-off above the base),
 *  - radial squeeze toward the long axis over the ventricles, with a small base/apex counter-rotation (torsion),
 *  - atrial contraction about each atrium's centre,
 *  - valve motion: AV valves swing open toward the ventricle in diastole, semilunar cusps part to the sinus walls in
 *    ejection; annuli stay attached.
 *
 * Timing follows the Wiggers diagram as fractions of the R–R interval, so the rate can change without the phases
 * drifting (diastole shortens first, as it does physiologically).
 */
import * as THREE from 'three';
import { LM } from './heartGeometry';

/** Ventricular contraction, atrial contraction and valve openness (0–1) for a time (s) at a heart rate (/min). */
export function wiggers(t: number, hr: number) {
  const rr = 60 / Math.max(20, hr); const tc = ((t % rr) + rr) % rr;
  // systole lasts ~0.37 s at 70/min and shortens far less than diastole with rate (Bazett-like √RR scaling)
  const sys = 0.37 * Math.sqrt(rr / (60 / 70)); const ivc = 0.05, ivr = 0.07; const atr0 = rr - Math.min(0.13, 0.16 * rr);
  const ss = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  // volume-driven contraction: nothing moves while both valves are shut (isovolumic contraction / relaxation);
  // the ventricle empties during ejection and refills from AV opening (rapid filling, diastasis, atrial kick)
  const v = tc < ivc ? 0 : tc < sys + ivr ? ss(ivc, sys, tc) : 1 - ss(sys + ivr, sys + ivr + 0.14, tc);
  const sl = tc > ivc && tc < sys ? Math.min(ss(ivc, ivc + 0.03, tc), 1 - ss(sys - 0.03, sys, tc)) : 0; // aortic/pulmonary open in ejection
  const av = tc > sys + ivr ? Math.min(ss(sys + ivr, sys + ivr + 0.05, tc), 1 - 0.55 * ss(atr0 - 0.12, atr0, tc) * (1 - ss(atr0, atr0 + 0.04, tc))) : 0;
  const avClose = tc > rr - 0.02 ? ss(rr - 0.02, rr, tc) : 0;                                     // closes at the start of systole
  const atr = tc > atr0 ? Math.sin(((tc - atr0) / (rr - atr0)) * Math.PI) : 0;
  return { v, atr, avOpen: Math.max(0, av - avClose), slOpen: sl, phase: tc / rr, rr, systole: sys };
}

/* ------------------------------------------------------------------ geometry of the field */
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export const APEX = LM.lvApex.clone();
/** base centre: middle of the AV junction (between the mitral and tricuspid annuli) */
export const BASE = LM.mitral.clone().lerp(LM.tricuspid, 0.5);
export const AXIS = BASE.clone().sub(APEX).normalize(); // apex → base
export const H_BASE = BASE.distanceTo(APEX);

export interface ValveSpec { c: THREE.Vector3; ax: THREE.Vector3; r: number; kind: 1 | 2 } // kind 1 = AV, 2 = semilunar
/** Valve centres and flow axes from the landmarks; the radius is measured from the valve mesh when available. */
export function valveSpecs(geos: Partial<Record<'mitral' | 'tricuspid' | 'aortic_valve' | 'pulm_valve', THREE.BufferGeometry>>): Record<string, ValveSpec> {
  const rvApex = LM.rv.clone().add(LM.lvApex.clone().sub(LM.lv).multiplyScalar(0.9));
  const spec: Record<string, Omit<ValveSpec, 'r'>> = {
    mitral: { c: LM.mitral, ax: APEX.clone().sub(LM.mitral).normalize(), kind: 1 },
    tricuspid: { c: LM.tricuspid, ax: rvApex.sub(LM.tricuspid).normalize(), kind: 1 },
    aortic_valve: { c: LM.aorticValve, ax: v3(-0.004, 5.061, 0.274).sub(LM.aorticValve).normalize(), kind: 2 },
    pulm_valve: { c: LM.pulmValve, ax: v3(0.165, 5.182, 0.357).sub(LM.pulmValve).normalize(), kind: 2 },
  };
  const out: Record<string, ValveSpec> = {};
  for (const [id, s] of Object.entries(spec)) {
    const g = geos[id as keyof typeof geos]; let r = s.kind === 1 ? 0.14 : 0.11;
    if (g) { const p = g.attributes.position; const d = new THREE.Vector3(); let m = 0; for (let i = 0; i < p.count; i++) { d.fromBufferAttribute(p, i).sub(s.c); const al = d.dot(s.ax); m = Math.max(m, d.addScaledVector(s.ax, -al).length()); } if (m > 0.03) r = m; }
    out[id] = { ...s, c: s.c.clone(), ax: s.ax.clone(), r };
  }
  return out;
}

/** Uniforms shared by every heart material (same object references; update once per frame). */
export function beatUniforms() {
  return {
    uApex: { value: APEX.clone() }, uAxis: { value: AXIS.clone() }, uHb: { value: H_BASE },
    uV: { value: 0 }, uAtr: { value: 0 },
    /** fractional long-axis shortening, radial squeeze and peak torsion (rad) at full contraction */
    uLong: { value: 0.12 }, uRad: { value: 0.11 }, uTwist: { value: 0.12 },
    uAvOpen: { value: 0 }, uSlOpen: { value: 0 },
  };
}
export type BeatUniforms = ReturnType<typeof beatUniforms>;
/** Per-material uniforms: whether the part squeezes radially (ventricles), the atrial centre, and the valve it is. */
export function partUniforms(opts: { radial?: number; atrC?: THREE.Vector3; atr?: number; valve?: ValveSpec }) {
  return {
    uRadW: { value: opts.radial ?? 0 }, uAtrC: { value: (opts.atrC ?? v3(0, 0, 0)).clone() }, uAtrW: { value: opts.atr ?? 0 },
    uVc: { value: (opts.valve?.c ?? v3(0, 0, 0)).clone() }, uVa: { value: (opts.valve?.ax ?? v3(0, 1, 0)).clone() }, uVr: { value: opts.valve?.r ?? 1 }, uVk: { value: opts.valve?.kind ?? 0 },
  };
}

export const BEAT_HEAD = /* glsl */ `
uniform vec3 uApex, uAxis, uAtrC, uVc, uVa; uniform float uHb, uV, uAtr, uLong, uRad, uTwist, uAvOpen, uSlOpen, uRadW, uAtrW, uVr, uVk;
vec3 heartBeat(vec3 p) {
  // valve leaflets (in the rest frame, before the whole-heart field): annulus fixed, free edges move most
  if (uVk > 0.5) {
    vec3 d = p - uVc; float al = dot(d, uVa); vec3 e = d - uVa * al; float r = length(e); vec3 er = r > 1e-5 ? e / r : vec3(0.0);
    // hinge-like swing: displacement grows smoothly from the annulus (r = R, fixed) to the free edge (r → 0);
    // AV leaflets swing toward the ventricle and the walls, semilunar cusps fold back toward the sinus walls
    float f = 1.0 - smoothstep(0.35 * uVr, uVr, r); f = f * f;
    float o = uVk < 1.5 ? uAvOpen : uSlOpen;
    float along = uVk < 1.5 ? 0.28 : 0.16; float out_ = uVk < 1.5 ? 0.24 : 0.3;
    p += (uVa * along + er * out_) * uVr * o * f;
  }
  // atrial contraction about the atrium's centre
  p = mix(p, uAtrC + (p - uAtrC) * (1.0 - 0.07 * uAtr), uAtrW);
  // long axis: below the base everything shortens toward the apex; above it the AV-plane descent fades out over ~3 cm
  vec3 d = p - uApex; float h = dot(d, uAxis); vec3 rad = d - uAxis * h;
  float drop = uLong * uV * min(h, uHb) * (1.0 - smoothstep(uHb, uHb + 0.3, h)) + (h > uHb ? 0.0 : 0.0);
  float hb = h - drop;
  // radial squeeze over the ventricles (fades above the base and toward the very apex), with torsion about the axis
  float w = uRadW * (1.0 - smoothstep(uHb * 0.85, uHb * 1.05, h)) * smoothstep(0.0, 0.12, h);
  float s = 1.0 - uRad * uV * w;
  float ang = uTwist * uV * (h / uHb - 0.4) * w;
  vec3 x = normalize(abs(uAxis.y) < 0.9 ? cross(uAxis, vec3(0.0, 1.0, 0.0)) : cross(uAxis, vec3(1.0, 0.0, 0.0))); vec3 y = cross(uAxis, x);
  float rx = dot(rad, x), ry = dot(rad, y); float c = cos(ang), sn = sin(ang);
  vec3 r2 = (x * (c * rx - sn * ry) + y * (sn * rx + c * ry)) * s;
  return uApex + uAxis * hb + r2;
}
`;
/** Patch a built-in material: the beat runs on the (already loaded/dilated) position before projection. */
export function addBeat(m: THREE.Material, shared: BeatUniforms, part: ReturnType<typeof partUniforms>, key: string, chain?: (sh: THREE.WebGLProgramParametersWithUniforms) => void) {
  const prev = m.onBeforeCompile.bind(m);
  m.onBeforeCompile = (sh, r) => {
    prev(sh, r); Object.assign(sh.uniforms, shared, part);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + BEAT_HEAD).replace('#include <project_vertex>', 'transformed = heartBeat(transformed);\n#include <project_vertex>');
    chain?.(sh);
  };
  const prevKey = m.customProgramCacheKey.bind(m); m.customProgramCacheKey = () => prevKey() + '|beat-' + key;
  return m;
}

/** Heart rate for the congenital model: neonatal flows run at a neonatal rate. */
export const heartRateFor = (qs: number | undefined) => ((qs ?? 5) < 2 ? 140 : 84);
