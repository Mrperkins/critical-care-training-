import { create } from 'zustand';
import type { Dominance, LeadId, VesselId } from '../data/types';

export type Mode = 'explore' | 'lesson' | 'quiz';
export type Focus = 'split' | 'heart' | 'ecg';

/** Everything the 3D scene and ECG need to render one moment of the story. */
export interface SceneDirectives {
  highlightVessel: boolean;
  flow: boolean;
  occlusion: number;      // 0..1 thrombus growth
  perfusionLoss: number;  // 0..1 downstream flow stops
  injury: number;         // 0..1 myocardial ischemia → injury appearance
  ecgMorph: number;       // 0 normal → 1 evolved STEMI
  emphasizeAffected: boolean;
  emphasizeReciprocal: boolean;
  showExtraLeads: boolean;
  camera: 'overview' | 'territory' | 'vessel' | 'free';
}

export const NORMAL_SCENE: SceneDirectives = {
  highlightVessel: false, flow: false, occlusion: 0, perfusionLoss: 0, injury: 0, ecgMorph: 0,
  emphasizeAffected: false, emphasizeReciprocal: false, showExtraLeads: false, camera: 'overview',
};

interface State {
  mode: Mode;
  territoryId: string | null;
  culpritIndex: number;
  vesselId: VesselId | null;
  hoverVessel: VesselId | null;
  hoverTerritory: string | null;
  leadId: LeadId | null;
  dominance: Dominance;
  showLeads: boolean;
  showExtra: boolean;
  cutaway: boolean;
  focus: Focus;
  paused: boolean;
  scene: SceneDirectives;
  /** Explore-mode MI sequence playhead (0..1) and whether it is auto-playing. */
  seq: number;
  seqPlaying: boolean;
  lessonStep: number;
  cameraNonce: number;
  quiz: { caseIndex: number; answers: Record<string, string | string[]>; revealed: boolean; qIndex: number };
  set: (p: Partial<State>) => void;
  setScene: (p: Partial<SceneDirectives>) => void;
  recenter: () => void;
}

export const useApp = create<State>((set) => ({
  mode: 'explore',
  territoryId: null,
  culpritIndex: 0,
  vesselId: null,
  hoverVessel: null,
  hoverTerritory: null,
  leadId: null,
  dominance: 'right',
  showLeads: false,
  showExtra: false,
  cutaway: false,
  focus: 'split',
  paused: false,
  scene: { ...NORMAL_SCENE },
  seq: 0,
  seqPlaying: false,
  lessonStep: 0,
  cameraNonce: 0,
  quiz: { caseIndex: 0, answers: {}, revealed: false, qIndex: 0 },
  set: (p) => set(p),
  setScene: (p) => set((s) => ({ scene: { ...s.scene, ...p } })),
  recenter: () => set((s) => ({ cameraNonce: s.cameraNonce + 1 })),
}));

/**
 * Explore-mode MI sequence: the ten steps from the brief, laid out on a 0..1 playhead
 * so it can auto-play and be scrubbed from the timeline.
 */
export const SEQ_KEYS = [
  { at: 0.0, label: 'Normal' },
  { at: 0.12, label: 'Culprit artery' },
  { at: 0.26, label: 'Occlusion' },
  { at: 0.4, label: 'Perfusion falls' },
  { at: 0.55, label: 'Injury' },
  { at: 0.72, label: 'ECG changes' },
  { at: 0.86, label: 'Facing leads' },
  { at: 0.96, label: 'Reciprocal' },
];
const ss = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function sequenceScene(p: number): SceneDirectives {
  return {
    highlightVessel: p > 0.08,
    flow: p > 0.1,
    occlusion: ss(0.22, 0.36, p),
    perfusionLoss: ss(0.36, 0.5, p),
    injury: ss(0.48, 0.66, p),
    ecgMorph: ss(0.6, 0.92, p),
    emphasizeAffected: p > 0.84,
    emphasizeReciprocal: p > 0.94,
    showExtraLeads: p > 0.84,
    camera: p < 0.2 ? 'vessel' : 'territory',
  };
}
