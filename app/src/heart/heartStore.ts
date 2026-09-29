import { create } from 'zustand';
import { HEART_PRESETS, type HeartPresetId, type ShuntInput } from './shunt';

export type FlowMode = 'sat' | 'doppler';
export interface HeartUI {
  preset: HeartPresetId | 'custom'; input: ShuntInput;
  /** colour flow by oxygen saturation, or Doppler-style by velocity toward/away from an apical probe */ mode: FlowMode;
  target: string; labels: boolean;
  set: (p: Partial<HeartUI>) => void;
}
export const useHeartUI = create<HeartUI>((set) => ({ preset: 'vsdLarge', input: { ...HEART_PRESETS.vsdLarge }, mode: 'sat', target: 'heart.four_chamber', labels: true, set: (p) => set(p) }));
export const loadHeartPreset = (id: HeartPresetId) => useHeartUI.getState().set({ preset: id, input: { ...HEART_PRESETS[id] } });
export const setHeartInput = (p: Partial<ShuntInput>) => { const s = useHeartUI.getState(); s.set({ input: { ...s.input, ...p }, preset: 'custom' }); };
