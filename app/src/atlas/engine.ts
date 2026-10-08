import type { DiseaseDefinition, DiseaseState, Decision } from './types';
import { stepTimeline, type Timeline } from '../director/timeline';

export const HEALTHY: Readonly<DiseaseState> = Object.freeze({ obstruction: 0, collapse: 0, overdistension: 0, fluid: 0, bleeding: 0, edema: 0, inflammation: 0, ischemia: 0, pressure: 0, flowLoss: 0, volumeLoss: 0, pumpLoss: 0, shunt: 0, electrical: 0, metabolic: 0, endocrine: 0 });
const fraction = (v: number) => Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
/** Deterministic, seekable state. Severity is a visual progression, not elapsed disease time. */
export function diseaseState(disease: DiseaseDefinition, severity: number): DiseaseState {
  const state = { ...HEALTHY }; const u = fraction(severity);
  for (const key of Object.keys(state) as (keyof DiseaseState)[]) state[key] = fraction((disease.peak[key] ?? 0) * u);
  return state;
}
export function applyDecision(state: DiseaseState, decision: Decision): DiseaseState {
  const next = { ...state };
  for (const key of Object.keys(state) as (keyof DiseaseState)[]) next[key] = fraction(state[key] + (decision.change[key] ?? 0));
  return next;
}
export function stageIndex(severity: number) { return severity < 0.34 ? 0 : severity < 0.7 ? 1 : 2; }
/** Same Lesson Director transport and semantic cameras as the existing organ lessons. */
export function diseaseLesson(d: DiseaseDefinition, set: (severity: number, target: string) => void): Timeline {
  const tl = stepTimeline(`atlas-${d.id}`, d.title, [
    { id: `${d.id}-see`, title: 'See · the patient', target: 'body.whole', say: `${d.title}. Locate the affected ${d.anatomy.replaceAll('-', ' ')} within the patient. ${d.distinction}`, apply: () => set(0.15, 'body.whole') },
    { id: `${d.id}-zoom`, title: 'Zoom · the affected anatomy', target: d.target, say: d.mechanism, apply: () => set(0.4, d.target) },
    { id: `${d.id}-understand`, title: 'Understand · the mechanism', target: d.target, say: `Follow the highlighted changes: ${d.findings.map(f => f.label.toLowerCase()).join(', ')}. Compare the baseline with the progressive state.`, apply: () => set(0.4, d.target), tween: u => set(0.4 + 0.5 * u, d.target) },
    { id: `${d.id}-apply`, title: 'Apply · predict a consequence', target: d.target, say: d.question, apply: () => set(0.75, d.target) },
  ], () => set(0.15, 'body.whole'));
  return { ...tl, module: d.domain, blurb: d.mechanism };
}
