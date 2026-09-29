/**
 * Vector-cardiographic ECG synthesis.
 *
 * The heart's electrical activity is modelled as a time-varying 3D dipole
 * (P loop, QRS loop, T loop) in body frame. Each lead records the projection
 * of that dipole onto its viewing axis. MI adds:
 *   - an injury vector (ST segment) pointing out through the injured wall,
 *   - a necrosis vector (loss of early QRS forces → Q waves / tall R opposite),
 *   - a hyperacute T-wave vector.
 * Local effects are "sharpened" for chest leads (proximity effect), so
 * precordial changes stay regional as they do clinically.
 */
import type { ECGLead, ECGPattern, LeadId, Vec3 } from '../data/types';
import { LEAD } from '../data/leads';

export const HR = 72;
export const RR = 60 / HR;
/** Beat landmarks in seconds from beat start. */
export const T_P = 0.1;
export const T_QRS = 0.18;
export const QRS_DUR = 0.09;
export const T_J = T_QRS + QRS_DUR;
export const T_TPEAK = T_QRS + 0.27;
export const T_TEND = T_QRS + 0.37;
/** Where ST deviation is measured (J + 60 ms). */
export const T_ST = T_J + 0.06;

const nrm = (v: Vec3): Vec3 => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const g = (t: number, c: number, s: number) => Math.exp(-((t - c) ** 2) / (2 * s * s));
const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const P_DIR = nrm([0.55, -0.8, 0.15]);
const Q_SEPT = nrm([-0.35, 0.05, 0.85]);
const Q_MAIN = nrm([0.62, -0.62, -0.25]);
const Q_TERM = nrm([-0.35, 0.55, -0.55]);
const T_DIR = nrm([0.55, -0.6, 0.3]);

/** Global (far-field) projection. */
const proj = (v: Vec3, lead: ECGLead) => dot(v, lead.view);
/** Local (near-field) projection, sharpened for chest electrodes. */
function localProj(v: Vec3, lead: ECGLead) {
  const s = dot(v, lead.view);
  const p = lead.group === 'limb' ? 1 : 2.5;
  return Math.sign(s) * Math.abs(s) ** p;
}

/** Stage envelopes as a function of evolution (0 normal → 1 evolved STEMI). */
export function stages(morph: number) {
  const hyper = sstep(0.02, 0.3, morph) * (1 - 0.55 * sstep(0.55, 1, morph));
  const st = sstep(0.18, 0.72, morph);
  const q = sstep(0.72, 1, morph);
  return { hyper, st, q };
}

function tWave(t: number) {
  // Asymmetric T: slow upstroke, faster downstroke.
  return t < T_TPEAK ? g(t, T_TPEAK, 0.052) : g(t, T_TPEAK, 0.036);
}

function stShape(t: number) {
  // Rises at the J point, sustains through the ST segment, merges into the T wave.
  return sstep(T_J - 0.03, T_J + 0.015, t) * (1 - sstep(T_TEND - 0.02, T_TEND + 0.05, t)) * (1 + 0.35 * tWave(t));
}

/** ECG voltage (mV) for one lead at time t (s) within the beat. */
export function sample(leadId: LeadId, t: number, pattern: ECGPattern | null, morph: number): number {
  const lead = LEAD[leadId];
  const k = lead.gain;
  const q0 = T_QRS;
  let v = 0;
  // P wave
  v += 0.14 * proj(P_DIR, lead) * g(t, T_P, 0.022) * (lead.group === 'limb' ? 1 : 0.6);
  // QRS loop
  v += k * 0.22 * proj(Q_SEPT, lead) * g(t, q0 + 0.016, 0.0075);
  v += k * 1.35 * proj(Q_MAIN, lead) * g(t, q0 + 0.045, 0.0115);
  v += k * 0.38 * proj(Q_TERM, lead) * g(t, q0 + 0.071, 0.009);
  // T loop
  v += k * 0.3 * proj(T_DIR, lead) * tWave(t);

  if (pattern && morph > 0) {
    const s = stages(morph);
    const inj = (u: Vec3, mv: number) => {
      const lp = localProj(u, lead) * k;
      let w = 0;
      w += s.st * mv * lp * stShape(t);
      w += s.hyper * pattern.hyperacuteMv * lp * tWave(t) * 1.6;
      // Necrosis: early forces toward the infarct are lost (Q waves), R height falls.
      w -= s.q * pattern.necrosisMv * lp * (g(t, q0 + 0.022, 0.011) * 1.4 + 0.55 * g(t, q0 + 0.045, 0.012));
      return w;
    };
    v += inj(pattern.injury, pattern.injuryMv);
    if (pattern.injury2 && pattern.injury2Mv) {
      const lp = localProj(pattern.injury2, lead) * k;
      v += s.st * pattern.injury2Mv * lp * stShape(t) + s.hyper * pattern.hyperacuteMv * 0.6 * lp * tWave(t);
    }
  }
  return v;
}

/** ST deviation in millimetres (10 mm/mV) at J+60 ms. */
export function stDeviationMm(leadId: LeadId, pattern: ECGPattern | null, morph = 1): number {
  const base = sample(leadId, T_J - 0.12, pattern, morph); // PR baseline ≈ 0
  return (sample(leadId, T_ST, pattern, morph) - base) * 10;
}

/** Deepest negative deflection in the first 40 ms of the QRS (mm). */
export function qDepthMm(leadId: LeadId, pattern: ECGPattern | null, morph = 1): number {
  let m = 0;
  for (let t = T_QRS; t < T_QRS + 0.04; t += 0.001) m = Math.min(m, sample(leadId, t, pattern, morph));
  return -m * 10;
}

/** Tallest positive QRS deflection (mm). */
export function rHeightMm(leadId: LeadId, pattern: ECGPattern | null, morph = 1): number {
  let m = 0;
  for (let t = T_QRS; t < T_J; t += 0.001) m = Math.max(m, sample(leadId, t, pattern, morph));
  return m * 10;
}
