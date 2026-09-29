import { create } from 'zustand';
import type { CtaLevel } from './cta';
/** CTA slice level on screen (shared by the scene, lessons and challenge cases). */
export const useCtaUI = create<{ level: CtaLevel; set: (l: CtaLevel) => void }>((set) => ({ level: 'infrarenal', set: (level) => set({ level }) }));
