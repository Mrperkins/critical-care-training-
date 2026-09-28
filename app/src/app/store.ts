import { create } from 'zustand';

export type Module = 'vent' | 'abg' | 'labs' | 'lines';
export type Mode = 'explore' | 'learn' | 'challenge' | 'sim';
export type VentView = 'front' | 'side' | 'airway' | 'base';

export interface UIState {
  module: Module; mode: Mode;
  ventScenario: string; ventView: VentView; labels: boolean; showPmus: boolean; showLoops: boolean;
  /** increments ~8×/s so number panels re-render from the running session */
  pulse: number;
  set: (p: Partial<UIState>) => void;
}
export const useUI = create<UIState>((set) => ({
  module: 'vent', mode: 'explore',
  ventScenario: 'normal', ventView: 'front', labels: true, showPmus: false, showLoops: true,
  pulse: 0,
  set: (p) => set(p),
}));
