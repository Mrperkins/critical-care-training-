/**
 * Playing a module: each step hands off to the engine that already owns it — Director/step lessons and
 * workflows through openLesson, cases through openChallenge, simulators by switching module and mode.
 */
import { useUI } from '../app/store';
import { openLesson } from '../app/navigate';
import { endCase, startCase } from './caseRun';
import { MODULE_BY_ID, stepKey } from './modules';
import { useLibrary } from './libraryStore';
import { MISSION_BY_ID, saveMission, useMission } from './missions';

export function playStep(moduleId: string, index: number) {
  const m = MODULE_BY_ID[moduleId]; const s = m?.steps[index]; if (!s) return;
  const lib = useLibrary.getState(); lib.setPlaying({ moduleId, step: index }); lib.touch(moduleId);
  if (s.kind === 'lesson' || s.kind === 'procedure') { endCase(); openLesson(s.ref); return; }
  if (s.kind === 'case') { startCase(s.ref); return; }
  endCase();
  if (s.kind !== 'simulator') return;
  useUI.getState().set({ module: s.module, mode: s.mode, atlasDisease: null });
  if (s.heart) { const section = s.heart; void import('../heart/heartStore').then((h) => h.useHeartUI.getState().set({ section })); }
  if (s.scenario && s.module === 'vent' && s.mode === 'explore') { const id = s.scenario; setTimeout(() => { void import('../vent/VentPanel').then((v) => v.loadVentScenario(id)); }, 0); }
}

/** Start a module where the learner left off (or at its first step). */
export function playModule(moduleId: string, from = 0) { playStep(moduleId, from); }

/** Next: mark the current step passed, then open the following step — or finish on the module page. */
export function nextStep() {
  const p = useLibrary.getState().playing; if (!p) return;
  const m = MODULE_BY_ID[p.moduleId]; useLibrary.getState().pass(stepKey(p.moduleId, p.step));
  if (p.step + 1 < m.steps.length) playStep(p.moduleId, p.step + 1);
  else exitPlayer(true);
}
export function previousStep() { const p = useLibrary.getState().playing; if (p && p.step > 0) playStep(p.moduleId, p.step - 1); }

/** Leave the player and go back to the module's page in the library. */
export function exitPlayer(finished = false) {
  const p = useLibrary.getState().playing; endCase(); useMission.getState().set({ id: null });
  useLibrary.getState().setPlaying(null); useLibrary.getState().setSolo(null);
  if (p) useLibrary.getState().go({ page: 'module', id: p.moduleId });
  useUI.getState().set({ module: 'library', atlasDisease: null });
  if (finished) setTimeout(() => document.getElementById('library-main')?.focus(), 0);
}

/** Browse to a library page (also leaves any free-roaming clinical workspace). */
export function openLibrary(view: Parameters<ReturnType<typeof useLibrary.getState>['go']>[0]) {
  endCase(); useLibrary.getState().setPlaying(null); useLibrary.getState().setSolo(null); useLibrary.getState().go(view);
  useUI.getState().set({ module: 'library', atlasDisease: null });
  setTimeout(() => { document.getElementById('library-main')?.scrollTo?.({ top: 0 }); }, 0);
}

/** Work one case in the case shell, outside any module (from Cases or search). */
export function runCase(id: string) { useMission.getState().set({ id: null }); useLibrary.getState().setSolo(id); startCase(id); }

/** Play a mission: its cases one after another, with a running result. */
export function runMission(id: string, leg = 0) {
  const m = MISSION_BY_ID[id]; if (!m?.legs[leg]) return;
  useMission.getState().set(leg === 0 ? { id, leg, right: 0, total: 0 } : { id, leg });
  useLibrary.getState().setSolo(m.legs[leg].caseId); startCase(m.legs[leg].caseId);
}
/** What the debrief's main button does: the next step of a module, the next leg of a mission, or back to the cases. */
export function afterCase(result?: { right: number; total: number }): { onNext: () => void; nextLabel: string } {
  const p = useLibrary.getState().playing;
  if (p) { const m = MODULE_BY_ID[p.moduleId]; return { onNext: () => nextStep(), nextLabel: p.step + 1 < m.steps.length ? 'Next step' : 'Finish module' }; }
  const ms = useMission.getState(); const m = ms.id ? MISSION_BY_ID[ms.id] : null;
  if (!m) return { onNext: () => exitPlayer(), nextLabel: 'Back to cases' };
  const right = ms.right + (result?.right ?? 0); const total = ms.total + (result?.total ?? 0);
  if (ms.leg + 1 < m.legs.length) return { onNext: () => { useMission.getState().set({ right, total }); runMission(m.id, ms.leg + 1); }, nextLabel: `Next call: ${m.legs[ms.leg + 1].label}` };
  return { onNext: () => { saveMission(m.id, right, total); useMission.getState().set({ id: null }); openLibrary({ page: 'practice' }); }, nextLabel: `Finish mission · ${right}/${total}` };
}

// semantic hook for automated checks (the same calls the buttons make)
if (typeof window !== 'undefined') (window as unknown as { __CCLibrary: unknown }).__CCLibrary = { playStep, openLibrary, exitPlayer, runCase, runMission };
