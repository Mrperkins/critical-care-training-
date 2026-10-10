/**
 * ECG teaching output derived from the existing Infarct Atlas vector/dipole model.
 * The model is deliberately simplified (not a forward torso-conductivity solution).
 * The 30-ms shift aligns the existing QRS loop with the conduction shader's
 * His–Purkinje timing and ventricular mechanics without modifying Infarct Atlas.
 * Signal generation and all animations share the same SA-relative time.
 */
import { sample } from '../infarct/ecg/ecgModel';
import type { LeadId } from '../infarct/data/types';

export const ECG_SHIFT_SECONDS = 0.03;
export const STUDY_LEADS: LeadId[] = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
export const ECG_EVENTS = [
  { id: 'p', name: 'P wave', at: 70, end: 125, detail: 'Atrial depolarization propagates from the sinoatrial node.' },
  { id: 'pr', name: 'PR segment', at: 125, end: 165, detail: 'The impulse is delayed in the AV node, then travels down the His bundle.' },
  { id: 'qrs', name: 'QRS complex', at: 165, end: 245, detail: 'Ventricular myocardium depolarizes via the bundle branches and Purkinje network.' },
  { id: 'st', name: 'ST segment', at: 245, end: 335, detail: 'Most ventricular cells remain depolarized as ejection proceeds.' },
  { id: 't', name: 'T wave', at: 335, end: 510, detail: 'Ventricular myocardium repolarizes; mechanical relaxation follows.' },
] as const;

export function studyECG(lead: LeadId, saMs: number, heartRate: number): number {
  const rr = 60000 / Math.max(20, heartRate);
  // Include adjacent beats so the trace stays continuous at each R–R boundary.
  let v = 0;
  for (const beat of [-1, 0, 1]) {
    v += sample(lead, (saMs - beat * rr) / 1000 + ECG_SHIFT_SECONDS, null, 0);
  }
  return Number.isFinite(v) ? v : 0;
}
export function studyPhase(saMs: number, bpm: number) {
  const rr = 60000 / Math.max(20, bpm);
  const ms = ((saMs % rr) + rr) % rr;
  const hit = ECG_EVENTS.find((e) => ms >= e.at && ms < Math.min(rr, e.end));
  if (hit) return hit;
  if (ms < ECG_EVENTS[0].at) return { id: 'sa', name: 'SA node / atrial conduction', at: 0, end: 70, detail: 'The sinoatrial node initiates the next impulse.' };
  return { id: 'tp', name: 'TP interval', at: 510, end: rr, detail: 'Electrical diastole; ventricular filling continues.' };
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
