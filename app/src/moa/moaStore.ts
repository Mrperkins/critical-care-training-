import { create } from 'zustand';
import type { Level } from './modes';
export type MoaMode = 'guided' | 'explore' | 'compare';
export interface MoaUI {
  defId: string; /** patient context for state-dependent drugs */ ctx: string | null; /** highest graph rank currently lit (−1 = none) */ lit: number; /** drug exposure 0–1 of the demo dose */ exposure: number; hover: string | null;
  mode: MoaMode; level: Level; /** receptor branch shown alone (null = all) */ branch: string | null; /** explore: node whose upstream / downstream path is highlighted */ focus: string | null;
  adverse: boolean; compareId: string | null;
  /** came here from a lesson: where to go back to */ returnTo: { lessonId: string; t: number; title: string } | null;
  set: (p: Partial<MoaUI>) => void;
}
export const useMoa = create<MoaUI>((set) => ({ defId: 'norepinephrine', ctx: null, lit: -1, exposure: 0, hover: null, mode: 'guided', level: 'cellular', branch: null, focus: null, adverse: false, compareId: null, returnTo: null, set: (p) => set(p) }));
