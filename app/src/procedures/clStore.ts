import { create } from 'zustand';
import { CL_DEFAULT, type ClInput } from './centralLine';
import { lines } from '../lines/session';

export interface ClUI { input: ClInput; wire: 'none' | 'inVein' | 'inArtery'; dilated: boolean; set: (p: Partial<ClUI>) => void }
export const useCl = create<ClUI>((set) => ({ input: { ...CL_DEFAULT }, wire: 'none', dilated: false, set: (p) => set(p) }));
export const setCl = (p: Partial<ClInput>) => useCl.getState().set({ input: { ...useCl.getState().input, ...p } });
/** the Lines patient's true pressures and saturations for the vessel check */
export const clPatient = () => ({ map: lines.num.tMap || 80, cvp: lines.num.tCvp || 8, sao2: lines.snap?.sao2 ?? 0.97, svo2: lines.snap?.svo2 ?? 0.7 });
