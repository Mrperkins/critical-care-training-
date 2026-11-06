/**
 * Lesson player chrome (the redesigned module player). The narrated lesson reads in the reader column,
 * everything else a module shows beside its scene lives in the Details drawer, and the step list opens
 * from the dots in the top bar. Scene-level hints (which waveform matters, the key numbers) come from the
 * module that is playing.
 */
import { create } from 'zustand';

export type Trace = 'p' | 'q' | 'v';
export interface Chip { label: string; value: string; tone?: 'hot' | 'bad' | 'ok' }
const PREF = 'ccp.player.v1';
const loadPrefs = (): { practice: boolean } => { try { return { practice: false, ...JSON.parse(globalThis.localStorage?.getItem(PREF) ?? '{}') }; } catch { return { practice: false }; } };

interface PlayerUI {
  /** the reader column, when the player is showing (a lesson portals its transport and narration into it) */
  reader: HTMLElement | null;
  /** how many lesson players are rendering into the reader right now */
  readers: number;
  details: boolean; steps: boolean;
  /** the waveforms this scene is about (null: all of them), and whether the learner asked for all anyway */
  traces: Trace[] | null; allTraces: boolean;
  /** what the current lesson scene asks the learner to watch (module-specific words: pressure, lungs, gas…) */
  focus: string[] | null;
  /** practice mode: no clock, points or patient decline in cases */
  practice: boolean;
  set: (p: Partial<PlayerUI>) => void;
  setPractice: (on: boolean) => void;
}
export const usePlayerUI = create<PlayerUI>((set) => ({
  reader: null, readers: 0, details: false, steps: false, traces: null, allTraces: false, focus: null, ...loadPrefs(),
  set: (p) => set(p),
  setPractice: (practice) => { set({ practice }); try { globalThis.localStorage?.setItem(PREF, JSON.stringify({ practice })); } catch { /* storage unavailable */ } },
}));
