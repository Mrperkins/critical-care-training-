import { create } from 'zustand';
/** Special-population teaching cards: what they show (lessons drive these; the cards read them). */
export interface PopUI {
  apnoea: { shown: string[]; highlight: string | null; preox: boolean; headUp: boolean };
  airway: { swellMm: number; crying: boolean };
  neo: { minute: number | null };
  ob: { lossMl: number | null; supine: boolean };
  peds: { lossFrac: number; bloodMlKg: number };
  set: (p: Partial<Omit<PopUI, 'set'>>) => void;
}
export const usePopUI = create<PopUI>((set) => ({
  apnoea: { shown: ['adult', 'pregnant', 'child', 'infant'], highlight: null, preox: true, headUp: false },
  airway: { swellMm: 1, crying: false }, neo: { minute: null }, ob: { lossMl: null, supine: false }, peds: { lossFrac: 0, bloodMlKg: 0 },
  set: (p) => set(p),
}));
export const setApnoea = (p: Partial<PopUI['apnoea']>) => usePopUI.getState().set({ apnoea: { ...usePopUI.getState().apnoea, ...p } });
export const setAirway = (p: Partial<PopUI['airway']>) => usePopUI.getState().set({ airway: { ...usePopUI.getState().airway, ...p } });
export const setNeo = (p: Partial<PopUI['neo']>) => usePopUI.getState().set({ neo: { ...usePopUI.getState().neo, ...p } });
export const setPeds = (p: Partial<PopUI['peds']>) => usePopUI.getState().set({ peds: { ...usePopUI.getState().peds, ...p } });
export const setOb = (p: Partial<PopUI['ob']>) => usePopUI.getState().set({ ob: { ...usePopUI.getState().ob, ...p } });
