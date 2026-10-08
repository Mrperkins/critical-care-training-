import { useUI, type Mode, type Module } from './store';

export type Experience = 'learn' | 'explore' | 'practice';
export const EXPERIENCES: { key: Experience; label: string }[] = [
  { key: 'learn', label: 'Learn' }, { key: 'explore', label: 'Explore' }, { key: 'practice', label: 'Practice' },
];
export function experienceFor(mode: Mode): Experience {
  return mode === 'challenge' || mode === 'sim' ? 'practice' : mode;
}
/** Global modes always enter a clinical workspace, including from Home or Resources. */
export function experienceDestination(module: Module, mode: Mode, next: Experience): { module: Module; mode: Mode } {
  const resource = module === 'curriculum' || module === 'videos';
  return { module: resource ? 'vent' : module, mode: next === 'practice' ? (!resource && mode === 'sim' ? 'sim' : 'challenge') : next };
}
export function selectExperience(next: Experience) {
  const state = useUI.getState();
  state.set({ ...experienceDestination(state.module, state.mode, next), ...(state.module === 'curriculum' || state.module === 'videos' ? { atlasDisease: null } : {}) });
}
