import { create } from 'zustand';
import { HEART_PRESETS, type HeartPresetId, type ShuntInput } from './shunt';

export type FlowMode = 'sat' | 'doppler';
/** how the heart is opened: automatic for the focus, or a fixed cut */
export type CutMode = 'auto' | 'rv' | 'ra' | 'lv' | 'slice' | 'front' | 'closed' | 'sax_base' | 'sax_mid' | 'sax_apex' | 'lvot' | 'rvot';
export interface HeartUI {
  preset: HeartPresetId | 'custom'; input: ShuntInput;
  /** colour flow by oxygen saturation, or Doppler-style by velocity toward/away from an apical probe */ mode: FlowMode;
  /** which heart view: congenital structure & flow, or coronaries & ECG (the merged Infarct Atlas) */ section: 'structure' | 'coronary';
  target: string; labels: boolean; cut: CutMode;
  /** added anatomy: conduction system (animated) and the pericardial sac; papillary muscles + chordae are always drawn */ conduction: boolean; pericardium: boolean;
  set: (p: Partial<HeartUI>) => void;
}
export const useHeartUI = create<HeartUI>((set) => ({ preset: 'vsdLarge', input: { ...HEART_PRESETS.vsdLarge }, mode: 'sat', section: 'structure', target: 'heart.four_chamber', labels: true, cut: 'auto', conduction: false, pericardium: false, set: (p) => set(p) }));
export const loadHeartPreset = (id: HeartPresetId) => useHeartUI.getState().set({ preset: id, input: { ...HEART_PRESETS[id] } });
export const setHeartInput = (p: Partial<ShuntInput>) => { const s = useHeartUI.getState(); s.set({ input: { ...s.input, ...p }, preset: 'custom' }); };
