/** Which scene-based challenge case is running, and whether its answers have been revealed. */
import { create } from 'zustand';
import { useUI } from '../app/store';
export const useCaseUI = create<{ active: string | null; revealed: boolean; set: (p: Partial<{ active: string | null; revealed: boolean }>) => void }>((set) => ({ active: null, revealed: false, set: (p) => set(p) }));
/** Imaging scenes hide their written findings / reading while a case is being answered: the learner reads the picture. */
export function useHideFindings() {
  const chal = useUI((s) => s.mode === 'challenge'); const active = useCaseUI((s) => s.active); const revealed = useCaseUI((s) => s.revealed);
  return chal && !!active && !revealed;
}
