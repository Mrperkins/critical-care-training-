import { create } from 'zustand';

export type LinesView = 'bed' | 'heart' | 'wrist' | 'neck' | 'level' | 'vessels';
export type SkinMode = 'see' | 'solid' | 'off';
export interface LinesUI {
  view: LinesView;
  /** 3D labels + waveform annotations */
  labels: boolean;
  /** skin: solid (default; close anatomical views cut away), see-through, or hidden */
  skin: SkinMode;
  /** overlay the true (perfect-system) pressure on the monitor traces */
  showTrue: boolean;
  frozen: boolean;
  /** which line the fast-flush card shows */
  flushLine: 'art' | 'cvp';
  /** transient message from an action (e.g. "flushing a clot forward can embolise") */
  toast: { text: string; tone: 'good' | 'bad' | 'info'; at: number } | null;
  set: (p: Partial<Omit<LinesUI, 'set'>>) => void;
}
export const useLinesUI = create<LinesUI>((set) => ({ view: 'bed', labels: true, skin: 'solid', showTrue: false, frozen: false, flushLine: 'art', toast: null, set: (p) => set(p) }));
export const toast = (text: string, tone: 'good' | 'bad' | 'info' = 'info') => useLinesUI.getState().set({ toast: { text, tone, at: Date.now() } });
