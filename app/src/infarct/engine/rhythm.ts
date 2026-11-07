/**
 * Beat-by-beat rhythm for the MI Locator.
 *
 * A rhythm is a repeating schedule of atrial events (SA node fires → P wave) and ventricular events (QRS), each QRS
 * either conducted from a P through the AV node (with its own PR) or arising from an escape focus. The ECG, the
 * contraction and the conduction-system impulse are all read from the same schedule at the same clock time, so a
 * dropped beat is a P wave with no QRS, an impulse that stops at the AV node, and a ventricle that does not contract.
 */
import { pPart, ventricularPart, T_P, T_QRS, QRS_EXTRA, type QrsKind } from '../ecg/ecgModel';
import type { ECGPattern, LeadId } from '../data/types';

export type RhythmId = 'sinus' | 'sinusBrady' | 'sinusTach' | 'firstDegree' | 'wenckebach' | 'mobitz2' | 'chbJunctional' | 'chbVentricular' | 'rbbb' | 'lbbb';

export interface VentricularEvent { at: number; kind: QrsKind; origin: 'conducted' | 'junctional' | 'ventricular'; fromP: number | null }
export interface RhythmDef {
  id: RhythmId; name: string; short: string;
  /** repeating period (s) and the events inside it */
  period: number; atrial: number[]; ventricular: VentricularEvent[];
  /** MI territories this rhythm commonly complicates (for suggestions) */
  seenWith: string[];
  explanation: string; pearl: string;
}

/** P onset → QRS onset (s) of a normal conducted beat in this model */
export const PR_NORMAL = 0.14;
/** the beat-timeline offsets the ECG components are drawn against: P onset ≈ T_P − 0.05, QRS onset = T_QRS */
const P_ONSET = T_P - 0.05;

const every = (period: number, interval: number, start = 0) => { const out: number[] = []; for (let t = start; t < period - 1e-9; t += interval) out.push(+t.toFixed(6)); return out; };
const conducted = (atrial: number[], prs: (number | null)[], kind: QrsKind = 'narrow'): VentricularEvent[] =>
  atrial.flatMap((p, i) => (prs[i % prs.length] == null ? [] : [{ at: p + prs[i % prs.length]!, kind, origin: 'conducted' as const, fromP: i }]));
const sinus = (rate: number, pr = PR_NORMAL, kind: QrsKind = 'narrow') => { const period = 60 / rate; return { period, atrial: [0], ventricular: conducted([0], [pr], kind) }; };

const INFERIOR = ['inferior', 'rv', 'posterior'];
const ANTERIOR = ['anterior', 'anteroseptal', 'extensiveAnterior', 'septal', 'deWinter', 'leftMain'];

export const RHYTHMS: RhythmDef[] = [
  { id: 'sinus', name: 'Normal sinus rhythm', short: 'Sinus 72', ...sinus(72), seenWith: [],
    explanation: 'The SA node fires 72 times a minute. Each impulse crosses the atria (P wave), pauses in the AV node (PR interval) and races down the His bundle, bundle branches and Purkinje fibres (QRS).', pearl: 'Every P is followed by a QRS at a constant PR.' },
  { id: 'sinusBrady', name: 'Sinus bradycardia', short: 'Sinus brady', ...sinus(46), seenWith: INFERIOR,
    explanation: 'Common early in inferior MI: the RCA usually supplies the SA node, and the inferior wall is rich in vagal afferents (the Bezold–Jarisch reflex), so the SA node slows.', pearl: 'Treat only if it causes hypotension: atropine works because the problem is vagal and nodal.' },
  { id: 'sinusTach', name: 'Sinus tachycardia', short: 'Sinus tach', ...sinus(112, 0.12), seenWith: ANTERIOR,
    explanation: 'In a large anterior MI, sinus tachycardia is often the heart compensating for a failing pump — a warning sign of shock rather than a rhythm to slow down.', pearl: 'Look for the cause (pump failure, pain, hypovolaemia); do not simply rate-control it.' },
  { id: 'firstDegree', name: 'First-degree AV block', short: '1st-degree', ...sinus(70, 0.3), seenWith: INFERIOR,
    explanation: 'Every impulse gets through the AV node, but slowly: the PR interval is longer than 200 ms. The AV nodal artery comes from the RCA in most people, so ischaemia in an inferior MI slows the node.', pearl: 'Usually benign and transient after inferior MI; watch for progression.' },
  { id: 'wenckebach', name: 'Second-degree AV block, Mobitz I (Wenckebach)', short: 'Wenckebach',
    period: 3.0, atrial: every(3.0, 0.75), ventricular: conducted(every(3.0, 0.75), [0.16, 0.27, 0.33, null]), seenWith: INFERIOR,
    explanation: 'The AV node tires a little more with each beat: the PR lengthens until one P wave is not conducted, then the cycle restarts. The block is in the AV node itself — typical of inferior MI.', pearl: 'Nodal block: usually transient, responds to atropine, rarely needs pacing.' },
  { id: 'mobitz2', name: 'Second-degree AV block, Mobitz II', short: 'Mobitz II',
    period: 3.0, atrial: every(3.0, 0.75), ventricular: conducted(every(3.0, 0.75), [0.16, 0.16, 0.16, null], 'rbbb'), seenWith: ANTERIOR,
    explanation: 'The PR stays the same, then a P wave suddenly fails to conduct. The block is below the AV node, in the bundle branches — which is why the conducted QRS complexes are wide. In anterior MI it means the septum and its bundles are ischaemic.', pearl: 'Infranodal block can progress to complete heart block without warning: pads on, prepare to pace. Atropine does not help.' },
  { id: 'chbJunctional', name: 'Complete heart block, junctional escape', short: 'CHB · junctional',
    period: 12, atrial: every(12, 0.75), ventricular: every(12, 12 / 9).map((at) => ({ at: +(at + 0.31).toFixed(6), kind: 'narrow' as QrsKind, origin: 'junctional' as const, fromP: null })), seenWith: INFERIOR,
    explanation: 'No impulse crosses the AV node. The atria keep their own rate (P waves marching through) while a backup pacemaker in the AV junction drives the ventricles at about 45 a minute with narrow QRS complexes. In inferior MI the block is nodal.', pearl: 'Narrow escape, often haemodynamically tolerated and transient after inferior MI; pace if unstable.' },
  { id: 'chbVentricular', name: 'Complete heart block, ventricular escape', short: 'CHB · ventricular',
    period: 9, atrial: every(9, 0.75), ventricular: every(9, 1.8).map((at) => ({ at: +(at + 0.47).toFixed(6), kind: 'ventricular' as QrsKind, origin: 'ventricular' as const, fromP: null })), seenWith: ANTERIOR,
    explanation: 'The block is below the AV node, so the only backup left is a slow focus in the ventricle itself: about 33 a minute with wide, bizarre QRS complexes, unrelated to the P waves. In anterior MI this means extensive septal necrosis.', pearl: 'Unstable and unreliable escape: pace now.' },
  { id: 'rbbb', name: 'Right bundle branch block', short: 'RBBB', ...sinus(76, PR_NORMAL, 'rbbb'), seenWith: ANTERIOR,
    explanation: 'The right bundle runs through the septum, fed by the LAD’s septal branches. When it fails, the right ventricle is activated late and slowly through muscle: a wide QRS with an R′ in V1 and a slurred S in I and V6.', pearl: 'A new RBBB in anterior MI marks a proximal LAD occlusion and a large territory at risk. ST elevation is still readable.' },
  { id: 'lbbb', name: 'Left bundle branch block', short: 'LBBB', ...sinus(76, PR_NORMAL, 'lbbb'), seenWith: ANTERIOR,
    explanation: 'The left bundle fails, so the septum is activated from right to left and the left ventricle slowly through muscle: a broad, notched R in I, aVL, V5–V6, deep QS in V1–V3, and ST–T changes opposite to the QRS.', pearl: 'LBBB hides the usual ST criteria — look for concordant ST changes (Sgarbossa) and treat the patient, not the ECG.' },
];
export const RHYTHM: Record<RhythmId, RhythmDef> = Object.fromEntries(RHYTHMS.map((r) => [r.id, r])) as Record<RhythmId, RhythmDef>;
export const rhythmsFor = (focusId: string | null | undefined) => RHYTHMS.filter((r) => focusId && r.seenWith.includes(focusId));

/** The rhythm state at the current clock time, updated once per frame by the MI Locator view (read by the heart). */
export const live: { id: RhythmId; state: RhythmState } = { id: 'sinus', state: { atria: 0, vent: 0, msSinceP: -1, msVent: -1000, avHold: 0, avBlocked: 0, kind: 'narrow', origin: null, phase: '' } };

export interface Events { atrial: { at: number; index: number; conducted: boolean }[]; ventricular: VentricularEvent[] }
/** All events between t0 and t1 (absolute seconds), unrolled from the repeating schedule. */
export function eventsBetween(r: RhythmDef, t0: number, t1: number): Events {
  const out: Events = { atrial: [], ventricular: [] };
  const n0 = Math.floor(t0 / r.period) - 1, n1 = Math.floor(t1 / r.period) + 1;
  const conductedP = new Set(r.ventricular.filter((v) => v.fromP != null).map((v) => v.fromP));
  for (let n = n0; n <= n1; n++) {
    const off = n * r.period;
    r.atrial.forEach((a, i) => { const at = a + off; if (at >= t0 && at <= t1) out.atrial.push({ at, index: i, conducted: conductedP.has(i) }); });
    for (const v of r.ventricular) { const at = v.at + off; if (at >= t0 && at <= t1) out.ventricular.push({ ...v, at }); }
  }
  out.atrial.sort((a, b) => a.at - b.at); out.ventricular.sort((a, b) => a.at - b.at);
  return out;
}

/** ECG voltage (mV) at absolute time t: every P and every QRS–T near t, summed. */
export function rhythmVoltage(lead: LeadId, t: number, r: RhythmDef, pattern: ECGPattern | null, morph: number, rep = 0): number {
  return voltageFrom(eventsBetween(r, t - 1.0, t + 0.3), lead, t, pattern, morph, rep);
}
/** Same, from events gathered once for a whole trace (the ECG paper draws hundreds of samples per lead). */
export function voltageFrom(e: Events, lead: LeadId, t: number, pattern: ECGPattern | null, morph: number, rep = 0): number {
  let v = 0;
  for (const a of e.atrial) { const d = t - a.at; if (d > -0.1 && d < 0.3) v += pPart(lead, d + P_ONSET); }
  for (const q of e.ventricular) { const d = t - q.at; if (d > -0.05 && d < 0.75) v += ventricularPart(lead, d + T_QRS, pattern, morph, rep, q.kind); }
  return v;
}

/** Ventricular rate (beats/min) of a rhythm. */
export const ventricularRate = (r: RhythmDef) => Math.round((r.ventricular.length / r.period) * 60);
export const atrialRate = (r: RhythmDef) => Math.round((r.atrial.length / r.period) * 60);

const ss = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

export interface RhythmState {
  /** mechanical activation 0..1 */ atria: number; vent: number;
  /** ms since the SA node last fired (−1: none yet) */ msSinceP: number;
  /** ms on the ventricular conduction clock: His lights at 117, so this is (t − QRS onset) + 130 */ msVent: number;
  /** the most recent impulse is held in the AV node (0..1) or was blocked there (0..1) */ avHold: number; avBlocked: number;
  kind: QrsKind; origin: VentricularEvent['origin'] | null;
  /** plain-language phase for the overlay */ phase: string;
}

/** Everything the heart and the conduction overlay need at time t. */
export function rhythmState(r: RhythmDef, t: number, saToAvMs = 40): RhythmState {
  const e = eventsBetween(r, t - 4, t);
  const p = e.atrial[e.atrial.length - 1]; const last = e.ventricular[e.ventricular.length - 1];
  // the His bundle fires just before the QRS: look a few ms ahead so the ventricular impulse leaves on time
  const soon = eventsBetween(r, t, t + 0.03).ventricular[0];
  const q = last && t - last.at < 0.3 ? last : soon ?? last;
  const dp = p ? t - p.at : Infinity; const dq = q ? t - q.at : Infinity; // dq may be slightly negative (His before QRS)
  const kind = q?.kind ?? 'narrow'; const x = QRS_EXTRA[kind];
  const atria = ss(0.09, 0.16, dp) * (1 - ss(0.19, 0.29, dp));
  const vent = ss(0.04 + x, 0.19 + x, Math.max(0, dq)) * (1 - ss(0.32 + x, 0.47 + x, dq)) * (q?.origin === 'ventricular' ? 0.85 : 1);
  // the AV node: holding the latest impulse until it conducts, or blocking it
  const avAt = saToAvMs / 1000;
  const next = p ? eventsBetween(r, p.at, p.at + 1.2).ventricular.find((v) => v.fromP === p.index) : undefined;
  let avHold = 0, avBlocked = 0;
  if (p && dp >= avAt) {
    if (next) { const hisAt = next.at - p.at - 0.013; if (dp < hisAt) avHold = 1; }
    else if (dp < avAt + 0.35) avBlocked = 1 - ss(avAt + 0.2, avAt + 0.35, dp);
  }
  let phase = 'Electrical diastole';
  if (dq < 0.09 + x) phase = q?.origin === 'ventricular' ? 'Escape impulse from the ventricle — slow, wide QRS' : q?.origin === 'junctional' ? 'Junctional escape — His–Purkinje fires on its own (narrow QRS)' : kind === 'rbbb' ? 'QRS — right bundle blocked: RV activated late' : kind === 'lbbb' ? 'QRS — left bundle blocked: LV activated late' : 'QRS — His bundle, bundle branches, Purkinje fibres';
  else if (dq < 0.45 + x) phase = 'ST–T — ventricles contract, then repolarise';
  if (dp < avAt) phase = 'P wave — impulse spreading across the atria';
  else if (avHold) phase = (next && next.at - p!.at > 0.2) ? 'PR — impulse held in the AV node (prolonged)' : 'PR — impulse delayed in the AV node';
  else if (avBlocked > 0.3) phase = 'Blocked — the impulse stops at the AV node: no QRS';
  return { atria, vent, msSinceP: p ? dp * 1000 : -1, msVent: q ? dq * 1000 + 130 : -1000, avHold, avBlocked, kind, origin: q?.origin ?? null, phase };
}
