import { create } from 'zustand';
import { ICP_DEFAULT, type IcpInput, type EvdSettings } from './icp';
export interface IcpUI { input: IcpInput; set: (p: Partial<IcpUI>) => void }
export const useIcpUI = create<IcpUI>((set) => ({ input: { ...ICP_DEFAULT }, set: (p) => set(p) }));
export const setIcp = (p: Partial<IcpInput>) => useIcpUI.getState().set({ input: { ...useIcpUI.getState().input, ...p } });
export const setEvd = (p: Partial<EvdSettings> | null) => { const cur = useIcpUI.getState().input.evd; setIcp({ evd: p === null ? null : { ...(cur ?? { open: true, heightCm: 15, levelErrorCm: 0 }), ...p } }); };
