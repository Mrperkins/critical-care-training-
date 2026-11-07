/**
 * A case being worked in the library's case shell: Patient → Assess → Decide → Debrief.
 * Scene cases (case-*) are run here end to end (their questions are data); cases owned by an engine
 * (vent-*, abg-*, lab-*, lines-*) keep their own controls and this shell watches for the recorded attempt.
 */
import { create } from 'zustand';
import { CASE_BY_ID } from '../challenge/sceneCases';
import { useCaseUI } from '../challenge/caseStore';
import { useUI } from '../app/store';
import { openChallenge } from '../app/navigate';
import { challengeModule } from '../curriculum/catalog';
import { useProgress } from '../curriculum/progress';

export type Stage = 'patient' | 'assess' | 'decide' | 'debrief';
export const STAGES: { key: Stage; label: string }[] = [
  { key: 'patient', label: 'Patient' }, { key: 'assess', label: 'Assess' }, { key: 'decide', label: 'Decide' }, { key: 'debrief', label: 'Debrief' },
];
export interface Decision { q: number; pick: number; ok: boolean; atMs: number }
interface CaseRunState {
  id: string | null; stage: Stage; startedAt: number; qi: number; decisions: Decision[];
  /** attempts already on record when this run began (engine cases: a new one means the case was answered) */
  priorAttempts: number;
  set: (p: Partial<CaseRunState>) => void;
}
export const useCaseRun = create<CaseRunState>((set) => ({ id: null, stage: 'patient', startedAt: 0, qi: 0, decisions: [], priorAttempts: 0, set: (p) => set(p) }));

export const isSceneCase = (id: string) => !!CASE_BY_ID[id];

/** Open a case in the shell. Scene cases put their module on screen and run here; engine cases open in their engine. */
export function startCase(id: string) {
  useCaseRun.getState().set({ id, stage: 'patient', startedAt: Date.now(), qi: 0, decisions: [], priorAttempts: useProgress.getState().attempts[id]?.length ?? 0 });
  const c = CASE_BY_ID[id];
  if (c) {
    useCaseUI.getState().set({ active: id, revealed: false });
    useUI.getState().set({ module: c.module, mode: 'challenge', atlasDisease: null });
    c.setup();
  } else {
    useUI.getState().set({ module: challengeModule(id), atlasDisease: null });
    openChallenge(id);
  }
}
export function endCase() { useCaseRun.getState().set({ id: null }); useCaseUI.getState().set({ active: null, revealed: false }); }

/** Record one answer; the last answer records the attempt and opens the debrief. */
export function answer(pick: number) {
  const r = useCaseRun.getState(); const c = r.id ? CASE_BY_ID[r.id] : null; if (!c || r.stage !== 'decide') return;
  if (r.decisions.some((d) => d.q === r.qi)) return;
  const q = c.questions[r.qi];
  const decisions = [...r.decisions, { q: r.qi, pick, ok: pick === q.answer, atMs: Date.now() - r.startedAt }];
  r.set({ decisions });
  if (decisions.length === c.questions.length) useProgress.getState().record(c.id, decisions.every((d) => d.ok));
}
export function nextQuestion() {
  const r = useCaseRun.getState(); const c = r.id ? CASE_BY_ID[r.id] : null; if (!c) return;
  if (r.qi + 1 < c.questions.length) r.set({ qi: r.qi + 1 });
  else { r.set({ stage: 'debrief' }); useCaseUI.getState().set({ revealed: true }); }
}
export const fmtTime = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
