import { create } from 'zustand';
export interface MoaUI { defId: string; /** patient context for state-dependent drugs */ ctx: string | null; /** highest graph rank currently lit (−1 = none) */ lit: number; /** drug exposure 0–1 of the demo dose */ exposure: number; hover: string | null; set: (p: Partial<MoaUI>) => void }
export const useMoa = create<MoaUI>((set) => ({ defId: 'norepinephrine', ctx: null, lit: -1, exposure: 0, hover: null, set: (p) => set(p) }));
