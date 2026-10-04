import { create } from 'zustand';
import { session } from '../vent/session';
import { useUI } from '../app/store';
import { needlePath, NEEDLE_DEFAULT, type NeedleInput } from './needle';

export interface NeedleUI { input: NeedleInput; inserted: boolean; set: (p: Partial<NeedleUI>) => void }
export const useNeedle = create<NeedleUI>((set) => ({ input: { ...NEEDLE_DEFAULT }, inserted: false, set: (p) => set(p) }));
export const setNeedle = (p: Partial<NeedleInput>) => useNeedle.getState().set({ input: { ...useNeedle.getState().input, ...p }, inserted: false });

/** Perform the insertion on the vent patient: only a needle that reaches tension air decompresses. */
export function insertNeedle() {
  const { input } = useNeedle.getState(); const r = needlePath(input);
  useNeedle.getState().set({ inserted: true });
  if (r.outcome === 'decompressed' && session.sc.id === 'ptx' && session.decompT < 0) session.intervene('decompress');
  const ui = useUI.getState(); ui.set({ pulse: ui.pulse + 1 });
  return r;
}

