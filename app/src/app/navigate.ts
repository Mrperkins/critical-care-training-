/**
 * Cross-module navigation for linked content: a lesson opens a drug's mechanism, and the drug page can
 * send the learner back to the SAME lesson at the SAME moment (the Director rebuilds the patient for that
 * time, so it is the same patient). Module switches happen first; the lesson loads after the new module
 * mounts (the old module unloads its own timeline on unmount).
 */
import { useUI } from './store';
import { director, useDirector } from '../director/director';
import { lessonById } from '../director/lessonIndex';
import { useMoa } from '../moa/moaStore';
import { create } from 'zustand';
import { CATALOG_BY_ID, challengeModule } from '../curriculum/catalog';

/** A step lesson or workflow to open once its module's LessonShell mounts (they keep their own local state). */
export const usePendingOpen = create<{ kind: 'step' | 'workflow' | 'challenge' | null; id: string | null; set: (p: { kind: 'step' | 'workflow' | 'challenge' | null; id: string | null }) => void }>((set) => ({ kind: null, id: null, set: (p) => set(p) }));

export function openDrug(defId: string) {
  const tl = useDirector.getState().tl; const t = useDirector.getState().t;
  const back = tl && lessonById(tl.id) ? { lessonId: tl.id, t, title: tl.title } : null;
  useMoa.getState().set({ defId, ctx: null, returnTo: back, mode: 'guided', focus: null, branch: null, adverse: false });
  useUI.getState().set({ module: 'moa', mode: 'explore' });
}
export function openLesson(lessonId: string, t = 0) {
  const hit = lessonById(lessonId);
  if (!hit) { // a step lesson or a workflow: switch module, let its LessonShell open it
    const e = CATALOG_BY_ID[lessonId]; if (!e || e.kind === 'director') return;
    usePendingOpen.getState().set({ kind: e.kind, id: lessonId }); useUI.getState().set({ module: e.module, mode: 'learn', atlasDisease:null }); return;
  }
  useUI.getState().set({ module: hit.module, mode: 'learn', atlasDisease:lessonId.startsWith('atlas-') ? lessonId.slice(6) : null });
  setTimeout(() => { director.load(hit.tl, false); director.seek(t, false); }, 0);
}

/** Open a challenge in its module; the module's challenge view starts that exact case when it can (pending store). */
export function openChallenge(id: string) { usePendingOpen.getState().set({ kind: 'challenge', id }); useUI.getState().set({ module: challengeModule(id), mode: 'challenge', atlasDisease: null }); }
/** For challenge views: take the pending challenge id if it matches `accept`, clearing it. */
export function takePendingChallenge(accept: (id: string) => boolean): string | null {
  const p = usePendingOpen.getState(); if (p.kind !== 'challenge' || !p.id || !accept(p.id)) return null;
  const id = p.id; p.set({ kind: null, id: null }); return id;
}
