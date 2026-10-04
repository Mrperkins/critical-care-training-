import { create } from 'zustand';
import { IDEAL, type IabpTiming, type IabpError } from './iabp';
export interface IabpUI { timing: IabpTiming; quiz: IabpError | null; answer: IabpError | null; set: (p: Partial<IabpUI>) => void }
export const useIabp = create<IabpUI>((set) => ({ timing: { ...IDEAL }, quiz: null, answer: null, set: (p) => set(p) }));
