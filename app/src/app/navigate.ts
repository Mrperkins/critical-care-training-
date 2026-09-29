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

export function openDrug(defId: string) {
  const tl = useDirector.getState().tl; const t = useDirector.getState().t;
  const back = tl && lessonById(tl.id) ? { lessonId: tl.id, t, title: tl.title } : null;
  useMoa.getState().set({ defId, ctx: null, returnTo: back, mode: 'guided', focus: null, branch: null, adverse: false });
  useUI.getState().set({ module: 'moa', mode: 'explore' });
}
export function openLesson(lessonId: string, t = 0) {
  const hit = lessonById(lessonId); if (!hit) return;
  useUI.getState().set({ module: hit.module, mode: 'learn' });
  setTimeout(() => { director.load(hit.tl, false); director.seek(t, false); }, 0);
}
