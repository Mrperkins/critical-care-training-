import { EXPLAINERS } from './explainers';
import type { DiseaseDefinition, DiseaseState, Decision } from './types';
import { stepTimeline, type Timeline } from '../director/timeline';
import { lowerKeepAcronyms } from './registry';
import { PATIENTS } from './patients';

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
export function diseaseLesson(d: DiseaseDefinition, set: (severity: number, target: string, frame?: DiseaseState) => void): Timeline {
  const explainer = EXPLAINERS[d.id];
  if (explainer) {
    const frames = explainer.chapters.map(c => ({ ...HEALTHY, ...c.state }));
    const targets = explainer.chapters.map(c => c.focus === 'patient' ? 'body.whole' : c.focus === 'heart' ? 'heart.four_chamber' : c.focus === 'airway' ? 'lung.airway' : d.target);
    const setFrame = (i:number, u:number) => {
      const before = frames[Math.max(0, i - 1)], after = frames[i];
      const frame = { ...HEALTHY }; const blend = Math.min(1, Math.max(0, u) / .4);
      for (const key of Object.keys(frame) as (keyof DiseaseState)[]) frame[key] = before[key] + (after[key] - before[key]) * blend;
      set(Math.max(...Object.values(frame)), targets[i], frame);
    };
    const tl = stepTimeline(`atlas-${d.id}`, d.title, explainer.chapters.map((c, i) => ({
      id: `${d.id}-mechanism-${i + 1}`, title:c.title, say:c.say, target:targets[i], checkpoint:c.checkpoint,
      apply: () => setFrame(i, 0), tween: u => setFrame(i, u),
    })), () => setFrame(0, 0));
    return { ...tl, module:d.domain, blurb:explainer.outcome };
  }
  // conditions without a hand-written explainer: the patient, what goes wrong, what you would find, what makes it
  // worse and the first move — all from the condition's own reviewed fields (ids kept so progress still matches)
  const best = d.decisions.find((x) => x.outcome === 'stabilize'); const bad = d.decisions.find((x) => x.outcome === 'deteriorate');
  const findings = d.findings.map(f => lowerKeepAcronyms(f.label)); const list = findings.length > 1 ? `${findings.slice(0, -1).join(', ')} and ${findings[findings.length - 1]}` : findings[0];
  const patient = PATIENTS[d.id];
  const tl = stepTimeline(`atlas-${d.id}`, d.title, [
    { id: `${d.id}-see`, title: 'The patient', target: 'body.whole', say: patient ? `${patient} ${d.distinction}` : `${d.title}. ${d.distinction}`, apply: () => set(0.15, 'body.whole') },
    { id: `${d.id}-zoom`, title: 'What goes wrong', target: d.target, say: d.mechanism, apply: () => set(0.4, d.target) },
    { id: `${d.id}-understand`, title: 'What you would find', target: d.target, say: `Watch it progress. The picture is ${list}.`, apply: () => set(0.4, d.target), tween: u => set(0.4 + 0.5 * u, d.target),
      checkpoint: bad ? { prompt: `What would make this worse? Think about: ${lowerKeepAcronyms(bad.label)}.`, answer: bad.explanation } : undefined },
    { id: `${d.id}-apply`, title: 'The first move', target: d.target, say: best ? `${best.label}. ${best.explanation}` : d.question, apply: () => set(best ? 0.45 : 0.75, d.target) },
  ], () => set(0.15, 'body.whole'));
  return { ...tl, module: d.domain, blurb: d.mechanism };
}
