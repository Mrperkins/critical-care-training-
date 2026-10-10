import { EVO_MAX } from './evolution';
import { create } from 'zustand';
import { emptyNeuro, DEFAULT_SYSTEMIC, type NeuroState, type Systemic, type Hemorrhage } from './perfusion';

export type NeuroPreset = 'none' | 'm1_L' | 'm2s_L' | 'ica_L' | 'ica_L_iso' | 'm1_R' | 'basilar' | 'p2_R' | 'ich' | 'sah';
export const NEURO_PRESETS: { id: NeuroPreset; name: string; short: string }[] = [
  { id: 'none', name: 'Normal', short: 'Intact circulation' },
  { id: 'm1_L', name: 'Left M1 occlusion', short: 'Large-vessel occlusion — right hemiparesis, aphasia' },
  { id: 'm2s_L', name: 'Left M2 (superior)', short: 'Division occlusion — expressive aphasia, face/arm weakness' },
  { id: 'ica_L', name: 'Left ICA occlusion', short: 'Intact circle — collaterals fill the MCA and ACA' },
  { id: 'ica_L_iso', name: 'Left ICA, isolated', short: 'Hypoplastic ACoA and PCoA — nothing refills the hemisphere' },
  { id: 'm1_R', name: 'Right M1 occlusion', short: 'Left hemiparesis, neglect, gaze to the right' },
  { id: 'basilar', name: 'Basilar occlusion', short: 'Brainstem and cerebellum at risk; PCoAs feed the PCAs' },
  { id: 'p2_R', name: 'Right PCA (P2)', short: 'Left homonymous hemianopia' },
  { id: 'ich', name: 'Left basal ganglia ICH', short: '30 mL haematoma with mass effect' },
  { id: 'sah', name: 'Subarachnoid haemorrhage', short: 'Blood in the basal cisterns around the circle' },
];
export function presetState(id: NeuroPreset, prev?: NeuroState): NeuroState {
  const s: NeuroState = { ...emptyNeuro(), collaterals: prev?.collaterals ?? 'moderate', minutes: id === 'none' ? 0 : 60 };
  const h = (x: Hemorrhage) => ({ ...s, hemorrhage: x, minutes: 0 });
  switch (id) {
    case 'm1_L': return { ...s, occlusion: { m1_L: 1 } };
    case 'm2s_L': return { ...s, occlusion: { m2s_L: 1 } };
    case 'ica_L': return { ...s, occlusion: { ica_L: 1 } };
    case 'ica_L_iso': return { ...s, occlusion: { ica_L: 1 }, variants: { acomHypoplastic: true, pcomHypoplastic: { L: true } } };
    case 'm1_R': return { ...s, occlusion: { m1_R: 1 } };
    case 'basilar': return { ...s, occlusion: { basilar: 1 } };
    case 'p2_R': return { ...s, occlusion: { p2_R: 1 } };
    case 'ich': return h({ kind: 'ich', at: [0.33, -0.22, 0.08], volumeMl: 30 });
    case 'sah': return h({ kind: 'sah', at: [0, -0.6, 0.15], volumeMl: 15 });
    default: return s;
  }
}

export interface NeuroUI {
  preset: NeuroPreset; state: NeuroState; sys: Systemic;
  /** semantic camera target (brain.*) */ target: string;
  labels: boolean; glass: boolean; playing: boolean;
  /** ventricles, basal ganglia, thalamus, internal capsule and brainstem (neuro.glb) shown inside the glass or cut brain */ deep: boolean;
  /** brain cut open along the axial plane at `slice` (pathology painted on the cut face) */ cut: boolean;
  /** 3D anatomy or synthetic clinical imaging */ view: '3d' | 'imaging';
  /** axial slice level for imaging (local brain units, −1 base … +1 vertex) */ slice: number;
  set: (p: Partial<NeuroUI>) => void;
}
export const useNeuroUI = create<NeuroUI>((set) => ({
  preset: 'none', state: emptyNeuro(), sys: { ...DEFAULT_SYSTEMIC }, target: 'brain.whole', labels: true, glass: true, deep: true, playing: false, cut: false, view: '3d', slice: -0.15,
  set: (p) => set(p),
}));
/** Deterministic clock: lessons call this with a time; the play button calls it with dt. */
export function setNeuroMinutes(m: number) { const st = useNeuroUI.getState(); st.set({ state: { ...st.state, minutes: Math.max(0, Math.min(EVO_MAX, m)) } }); }
export function loadNeuroPreset(id: NeuroPreset) { const st = useNeuroUI.getState(); st.set({ preset: id, state: presetState(id, st.state), playing: false, cut: id !== 'none' && id !== 'sah' }); }
export function recanalize() { const st = useNeuroUI.getState(); if (!Object.keys(st.state.occlusion).length) return; st.set({ state: { ...st.state, recanalizedAt: st.state.recanalizedAt ?? st.state.minutes } }); }
