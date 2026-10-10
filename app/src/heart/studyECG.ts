/**
 * ECG teaching output derived from the existing Infarct Atlas vector/dipole model.
 * The model is deliberately simplified (not a forward torso-conductivity solution).
 * The 50-ms shift aligns the existing QRS loop with the conduction shader's
 * His–Purkinje timing and ventricular mechanics without modifying Infarct Atlas.
 * Signal generation and all animations share the same SA-relative time.
 */
import { sample } from '../infarct/ecg/ecgModel';
import type { LeadId } from '../infarct/data/types';

export const ECG_SHIFT_SECONDS = 0.05;
export const STUDY_LEADS: LeadId[] = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
export const ECG_EVENTS = [
  { id: 'sa', name: 'SA node', at: 0, end: 20, detail: 'The SA node fires; atrial depolarization is initiated.' },
  { id: 'p', name: 'P wave', at: 20, end: 105, detail: 'Depolarization spreads through the atrial myocardium.' },
  { id: 'pr', name: 'PR segment', at: 105, end: 132, detail: 'AV nodal conduction slows before rapid His–Purkinje activation.' },
  { id: 'qrs', name: 'QRS complex', at: 132, end: 220, detail: 'Ventricular myocardium depolarizes through bundle branches and Purkinje fibres.' },
  { id: 'st', name: 'ST segment', at: 220, end: 310, detail: 'Most ventricular myocardium is depolarized; ejection is underway.' },
  { id: 't', name: 'T wave', at: 310, end: 500, detail: 'Ventricular repolarization precedes mechanical relaxation.' },
] as const;

const RR_REFERENCE_MS = 60000 / 70;
const QT_ANCHOR_MS = 220;
/** Illustrative rate adaptation, not a patient-specific QT prediction or QTc calculator. */
export const qtScale = (bpm: number) => Math.max(0.68, Math.min(1.25, Math.sqrt((60000 / Math.max(20, bpm)) / RR_REFERENCE_MS)));
export const timeForECG = (ms: number, bpm: number) => ms <= QT_ANCHOR_MS ? ms : QT_ANCHOR_MS + (ms - QT_ANCHOR_MS) / qtScale(bpm);
export const eventTime = (ms: number, bpm: number) => ms <= QT_ANCHOR_MS ? ms : QT_ANCHOR_MS + (ms - QT_ANCHOR_MS) * qtScale(bpm);
export function studyECG(lead: LeadId, saMs: number, heartRate: number): number {
  const rr = 60000 / Math.max(20, heartRate);
  // Include adjacent beats so the trace stays continuous at each R–R boundary.
  const phase = ((saMs % rr) + rr) % rr;
  let v = 0;
  for (const beat of [-1, 0, 1]) {
    v += sample(lead, timeForECG(phase - beat * rr, heartRate) / 1000 + ECG_SHIFT_SECONDS, null, 0);
  }
  return Number.isFinite(v) ? v : 0;
}
export function studyPhase(saMs: number, bpm: number) {
  const rr = 60000 / Math.max(20, bpm);
  const ms = ((saMs % rr) + rr) % rr;
  const hit = ECG_EVENTS.find((e) => ms >= eventTime(e.at, bpm) && ms < Math.min(rr, eventTime(e.end, bpm)));
  if (hit) return hit;
  return { id: 'tp', name: 'TP interval', at: eventTime(500, bpm), end: rr, detail: 'Electrical diastole: ventricular filling continues.' };
}
export function studyECGPath(lead: LeadId, bpm: number, w = 340, center = 61, gain = 40, points = 260): string {
  const rr = 60000 / Math.max(20, bpm);
  const p: string[] = [];
  for (let i = 0; i < points; i++) {
    const at = rr * i / (points - 1);
    const y = center - Math.max(-2.2, Math.min(2.2, studyECG(lead, at, bpm))) * gain;
    p.push((w * i / (points - 1)).toFixed(1) + ',' + y.toFixed(1));
  }
  return p.join(' ');
}
