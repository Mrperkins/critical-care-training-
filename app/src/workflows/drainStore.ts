import { create } from 'zustand';
import { session } from '../vent/session';
import { DRAIN_DEFAULT, type DrainConfig } from './chestDrain';

export interface DrainUI { cfg: DrainConfig; caseId: string | null; answer: string | null; test: string | null; set: (p: Partial<DrainUI>) => void }
export const useDrain = create<DrainUI>((set) => ({ cfg: { ...DRAIN_DEFAULT }, caseId: null, answer: null, test: null, set: (p) => set(p) }));

/** Apply a drain configuration, keeping the vent session's drain-occlusion in step with it. */
export function setDrain(p: Partial<DrainConfig>) {
  const cfg = { ...useDrain.getState().cfg, ...p }; useDrain.getState().set({ cfg, test: null });
  session.setDrainBlocked(cfg.kink || cfg.clot || cfg.clamped);
}

