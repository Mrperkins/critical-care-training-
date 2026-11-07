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

/** de Winter: depressed at the J point, rising steadily (upsloping) to the baseline before the T peak. */
function jUpslope(t: number) { return sstep(T_J - 0.025, T_J + 0.004, t) * (1 - sstep(T_J + 0.004, T_TPEAK - 0.03, t)); }
/** Tall, broad-based, symmetric T wave (de Winter; replaces the normal asymmetric shape's height). */
function tTall(t: number) { return g(t, T_TPEAK - 0.005, 0.046); }
/** Deep symmetric inversion (Wellens type B). Sized to cancel the normal T and invert it. */
function tInverted(t: number) { return g(t, T_TPEAK, 0.044); }
/** Wellens type A: an initial positive limb then a terminal negative limb. */
function tBiphasic(t: number) { return 0.35 * g(t, T_TPEAK - 0.05, 0.026) - g(t, T_TPEAK + 0.03, 0.034); }

/** How the ventricles are activated: normally (narrow), with a right or left bundle branch block, or from an escape focus in the ventricle. */
export type QrsKind = 'narrow' | 'rbbb' | 'lbbb' | 'ventricular';
/** extra QRS duration (s): repolarisation (ST–T) starts this much later */
export const QRS_EXTRA: Record<QrsKind, number> = { narrow: 0, rbbb: 0.045, lbbb: 0.06, ventricular: 0.075 };
const RBBB_TERM = nrm([-0.78, 0.1, 0.62]);   // late, slow activation of the RV: R' in V1, slurred S in I and V6
const LBBB_SEPT = nrm([0.7, -0.1, -0.7]);    // septum activated right → left
const LBBB_MAIN = nrm([0.82, -0.22, -0.53]); // slow, notched LV activation toward the lateral wall
const VENT_MAIN = nrm([0.25, 0.72, -0.65]);  // escape focus low in the ventricle: wide, superiorly directed

/** P wave only (atrial depolarisation), t relative to the beat's timeline (P peak at T_P). */
export function pPart(leadId: LeadId, t: number): number {
  const lead = LEAD[leadId];
  return 0.14 * proj(P_DIR, lead) * g(t, T_P, 0.022) * (lead.group === 'limb' ? 1 : 0.6);
}

/**
 * QRS–ST–T only (ventricular activation and recovery), t relative to the beat's timeline (QRS onset at T_QRS).
 * The MI pattern rides on repolarisation; with a wide QRS the ST–T is shifted later and the T wave is discordant.
 */
export function ventricularPart(leadId: LeadId, t: number, pattern: ECGPattern | null, morph: number, rep = 0, kind: QrsKind = 'narrow'): number {
  const lead = LEAD[leadId];
  const k = lead.gain;
  const q0 = T_QRS;
  const tr = t - QRS_EXTRA[kind]; // repolarisation clock
  let v = 0;
  if (kind === 'narrow' || kind === 'rbbb') {
    v += k * 0.22 * proj(Q_SEPT, lead) * g(t, q0 + 0.016, 0.0075);
    v += k * 1.35 * proj(Q_MAIN, lead) * g(t, q0 + 0.045, 0.0115);
  }
  if (kind === 'narrow') {
    v += k * 0.38 * proj(Q_TERM, lead) * g(t, q0 + 0.071, 0.009);
    v += k * 0.3 * proj(T_DIR, lead) * tWave(t);
  } else if (kind === 'rbbb') {
    v += k * 0.72 * proj(RBBB_TERM, lead) * g(t, q0 + 0.1, 0.021);
    v += k * 0.3 * proj(T_DIR, lead) * tWave(tr);
    v -= k * 0.24 * localProj(RBBB_TERM, lead) * tWave(tr); // secondary T inversion in the right precordial leads
  } else if (kind === 'lbbb') {
    v += k * 0.26 * proj(LBBB_SEPT, lead) * g(t, q0 + 0.02, 0.012);
    v += k * 1.25 * proj(LBBB_MAIN, lead) * (g(t, q0 + 0.055, 0.02) + 0.85 * g(t, q0 + 0.108, 0.02));
    v -= k * 0.34 * proj(LBBB_MAIN, lead) * tWave(tr);                 // discordant T
    v -= k * 0.1 * proj(LBBB_MAIN, lead) * stShape(tr);                 // discordant ST
  } else {
    v += k * 1.3 * proj(VENT_MAIN, lead) * (g(t, q0 + 0.06, 0.03) + 0.4 * g(t, q0 + 0.11, 0.022));
    v -= k * 0.38 * proj(VENT_MAIN, lead) * tWave(tr);
    v -= k * 0.1 * proj(VENT_MAIN, lead) * stShape(tr);
  }

  if (pattern && morph > 0) {
    const s = stages(morph);
    const inj = (u: Vec3, mv: number) => {
      const lp = localProj(u, lead) * k;
      let w = 0;
      w += s.st * (1 - 0.85 * rep) * mv * lp * stShape(tr);
      w += s.hyper * (1 - rep) * pattern.hyperacuteMv * lp * tWave(tr) * 1.6;
      w -= rep * s.st * 0.55 * mv * lp * tWave(tr) * 1.3; // reperfusion T-wave inversion
      // Necrosis: early forces toward the infarct are lost (Q waves), R height falls.
      w -= s.q * pattern.necrosisMv * lp * (g(t, q0 + 0.022, 0.011) * 1.4 + 0.55 * g(t, q0 + 0.045, 0.012));
      return w;
    };
    v += inj(pattern.injury, pattern.injuryMv);
    // STEMI-equivalent morphologies: present once the ischaemia is established, no Q-wave evolution
    const pres = sstep(0.15, 0.75, morph);
    if (pattern.jDep) v -= pres * pattern.jDep.mv * localProj(pattern.jDep.dir, lead) * k * jUpslope(tr);
    if (pattern.tWave) {
      const lp = localProj(pattern.tWave.dir, lead) * k * pres * pattern.tWave.mv;
      v += lp * (pattern.tWave.shape === 'tall' ? tTall(tr) : pattern.tWave.shape === 'inverted' ? -tInverted(tr) : tBiphasic(tr));
    }
    if (pattern.injury2 && pattern.injury2Mv) {
      const lp = localProj(pattern.injury2, lead) * k;
      v += s.st * (1 - 0.85 * rep) * pattern.injury2Mv * lp * stShape(tr) + s.hyper * (1 - rep) * pattern.hyperacuteMv * 0.6 * lp * tWave(tr);
    }
  }
  return v;
}

/**
 * ECG voltage (mV) for one lead at time t (s) within a normal sinus beat.
 * @param rep reperfusion 0–1: ST elevation resolves (most of it), hyperacute T waves go, Q waves from
 * necrosis that already happened remain, and the facing leads develop terminal T-wave inversion.
 */
export function sample(leadId: LeadId, t: number, pattern: ECGPattern | null, morph: number, rep = 0, kind: QrsKind = 'narrow'): number {
  return pPart(leadId, t) + ventricularPart(leadId, t, pattern, morph, rep, kind);
}

/** ST deviation in millimetres (10 mm/mV) at J+60 ms. */
export function stDeviationMm(leadId: LeadId, pattern: ECGPattern | null, morph = 1, rep = 0): number {
  const base = sample(leadId, T_J - 0.12, pattern, morph, rep); // PR baseline ≈ 0
  return (sample(leadId, T_ST, pattern, morph, rep) - base) * 10;
}

/** Deepest negative deflection in the first 40 ms of the QRS (mm). */
export function qDepthMm(leadId: LeadId, pattern: ECGPattern | null, morph = 1, rep = 0): number {
  let m = 0;
  for (let t = T_QRS; t < T_QRS + 0.04; t += 0.001) m = Math.min(m, sample(leadId, t, pattern, morph, rep));
  return -m * 10;
}

/** Tallest positive QRS deflection (mm). */
export function rHeightMm(leadId: LeadId, pattern: ECGPattern | null, morph = 1): number {
  let m = 0;
  for (let t = T_QRS; t < T_J; t += 0.001) m = Math.max(m, sample(leadId, t, pattern, morph));
  return m * 10;
}

/** J-point deviation in millimetres (de Winter is defined there, not at J+60). */
export function jPointMm(leadId: LeadId, pattern: ECGPattern | null, morph = 1): number {
  return (sample(leadId, T_J + 0.004, pattern, morph) - sample(leadId, T_J - 0.12, pattern, morph)) * 10;
}
/** Largest positive and negative T-wave deflections (mm, against the PR baseline). */
export function tWaveMm(leadId: LeadId, pattern: ECGPattern | null, morph = 1): { max: number; min: number } {
  const base = sample(leadId, T_J - 0.12, pattern, morph); let max = -Infinity, min = Infinity;
  for (let t = T_J + 0.07; t < T_TEND + 0.04; t += 0.002) { const v = (sample(leadId, t, pattern, morph) - base) * 10; if (v > max) max = v; if (v < min) min = v; }
  return { max, min };
}
