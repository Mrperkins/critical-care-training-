import { create } from 'zustand';

export type Module = 'vent' | 'abg' | 'labs' | 'lines' | 'neuro' | 'moa' | 'heart' | 'abdomen' | 'pediatrics' | 'womens' | 'curriculum' | 'videos';
export type Mode = 'explore' | 'learn' | 'challenge' | 'sim';
export type VentView = 'front' | 'side' | 'airway' | 'base' | 'alveolus' | 'xray' | 'lus';

export interface UIState {
  module: Module; mode: Mode;
  atlasDisease: string | null; atlasSeverity: number; atlasTarget: string;
  ventScenario: string; ventView: VentView; ventFlowDisplay: 'volume' | 'particles' | 'both';
  /** semantic camera target inside the vent module (lung.whole, lung.alveolus, lung.membrane …) */
  ventTarget: string; labels: boolean; showPmus: boolean; showLoops: boolean;
  /** increments ~8×/s so number panels re-render from the running session */
  pulse: number;
  set: (p: Partial<UIState>) => void;
}
export const useUI = create<UIState>((set) => ({
  module: 'curriculum', mode: 'learn',
  atlasDisease: null, atlasSeverity: .5, atlasTarget: 'body.whole',
  ventScenario: 'normal', ventView: 'front', ventFlowDisplay: 'volume', ventTarget: 'lung.whole', labels: true, showPmus: false, showLoops: true,
  pulse: 0,
  set: (p) => set(p),
}));
