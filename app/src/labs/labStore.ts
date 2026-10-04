import { create } from 'zustand';
import type { CellView } from './cell/build';
import type { Focus, CellType } from './cell/model';

export interface Picked { sim: 'cell' | 'patch'; id: number }
export type VisualTier = 'high' | 'medium' | 'low';
export type LabelMode = 'organelles' | 'transport' | 'off';
const phone = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 760px)').matches;
export interface LabUI {
  lab: string; view: 'body' | 'cell';
  /** cell scenes: the sliced-open cell, or the membrane close-up */
  cellView: CellView;
  /** which cell is drawn (null = the lab's default: heart for K⁺/Ca²⁺/Mg²⁺…, nerve for Na⁺) */
  cellType: CellType | null;
  /** semantic camera target (see scene/cameraTargets.ts); null = the view's default framing */
  cameraTargetId: string | null;
  /** visual quality tier for the cell scenes (physiology is identical at every tier) */
  visualTier: VisualTier;
  labelMode: LabelMode;
  /** master labels on/off for every microscopic view */
  labelsOn: boolean;
  /** readout panel (membrane potential / cell volume / blood) expanded */
  gaugeOpen: boolean;
  /** cause → effect step on show (auto-advances), and a focus the learner picked by tapping a legend chip */
  step: number; autoplay: boolean; chipFocus: Focus | null;
  picked: Picked | null;
  /** 0–1 dark veil during the zoom into the membrane */
  veil: number;
  set: (p: Partial<Omit<LabUI, 'set'>>) => void;
}
export const useLabUI = create<LabUI>((set) => ({ lab: 'k', view: 'body', cellView: 'whole', cellType: null, cameraTargetId: null, visualTier: phone ? 'low' : 'high', labelMode: 'organelles', labelsOn: true, gaugeOpen: !phone, step: 0, autoplay: true, chipFocus: null, picked: null, veil: 0, set: (p) => set(p) }));

/** the label mode actually in force (master switch applied) */
export const useLabelMode = () => useLabUI((s) => (s.labelsOn ? s.labelMode : 'off'));
