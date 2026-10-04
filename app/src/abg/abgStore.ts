import { create } from 'zustand';
export type Station = 'lung' | 'alveolus' | 'capillary' | 'tissue' | 'kidney';
export const useAbgUI = create<{ station: Station; sample: 'abg' | 'vbg'; set: (p: Partial<{ station: Station; sample: 'abg' | 'vbg' }>) => void }>((set) => ({ station: 'alveolus', sample: 'abg', set: (p) => set(p) }));
