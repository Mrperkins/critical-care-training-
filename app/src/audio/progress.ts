import { create } from 'zustand';
import type { MasteryState } from './types';

const KEY = 'cc.audio.progress.v1';
const now = () => new Date().toISOString();

interface AudioProgress {
  completed: Record<string, string>;
  repCompleted: Record<string, string>;
  position: Record<string, number>;
  mastery: Record<string, MasteryState>;
  completeEpisode: (id: string, concepts: string[]) => void;
  completeRep: (id: string, concepts: string[]) => void;
  setPosition: (id: string, seconds: number) => void;
  recordConcept: (concept: string, ok: boolean, confidence?: number) => void;
  reset: () => void;
}
type Persisted = Pick<AudioProgress, 'completed' | 'repCompleted' | 'position' | 'mastery'>;
const empty = (): Persisted => ({ completed: {}, repCompleted: {}, position: {}, mastery: {} });
function load(): Persisted {
  try { const raw = globalThis.localStorage?.getItem(KEY); return raw ? { ...empty(), ...JSON.parse(raw) } : empty(); }
  catch { return empty(); }
}
function save(s: Persisted) { try { globalThis.localStorage?.setItem(KEY, JSON.stringify(s)); } catch { /* unavailable */ } }

export const useAudioProgress = create<AudioProgress>((set, get) => {
  const commit = (p: Partial<Persisted>) => {
    set(p); const s = get();
    save({ completed: s.completed, repCompleted: s.repCompleted, position: s.position, mastery: s.mastery });
  };
  const expose = (concepts: string[]) => {
    const m = { ...get().mastery };
    for (const concept of concepts) {
      const x = m[concept] ?? { concept, exposures: 0, correct: 0, confidence: [] };
      m[concept] = { ...x, exposures: x.exposures + 1, lastSeen: now() };
    }
    return m;
  };
  return {
    ...load(),
    completeEpisode: (id, concepts) => commit({ completed: { ...get().completed, [id]: now() }, mastery: expose(concepts) }),
    completeRep: (id, concepts) => commit({ repCompleted: { ...get().repCompleted, [id]: now() }, mastery: expose(concepts) }),
    setPosition: (id, seconds) => commit({ position: { ...get().position, [id]: Math.max(0, seconds) } }),
    recordConcept: (concept, ok, confidence = 0) => {
      const m = { ...get().mastery }, x = m[concept] ?? { concept, exposures: 0, correct: 0, confidence: [] };
      m[concept] = { ...x, exposures: x.exposures + 1, correct: x.correct + (ok ? 1 : 0), confidence: [...x.confidence, Math.max(0, Math.min(100, confidence))].slice(-20), lastSeen: now() };
      commit({ mastery: m });
    },
    reset: () => commit(empty()),
  };
});

export function masteryScore(x?: MasteryState) {
  if (!x?.exposures) return 0;
  const accuracy = x.correct / x.exposures;
  const practice = Math.min(1, x.exposures / 6);
  return Math.round(100 * accuracy * (0.45 + 0.55 * practice));
}
