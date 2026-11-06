/**
 * Library navigation and player state. The page being browsed (home, a module, a shelf, a path) and the
 * module being played live here; which step the engines show is still the shared UI store's job.
 * "passed" records steps the learner moved past in the player (simulator steps have no engine completion).
 * Storage is optional: every access is wrapped, so private windows and tests start empty.
 */
import { create } from 'zustand';
import type { ShelfId } from './modules';

export type LibraryPage =
  | { page: 'home' }
  | { page: 'module'; id: string }
  | { page: 'shelf'; id: ShelfId | 'all'; filter?: 'all' | 'module' | 'simulator' | 'case' }
  | { page: 'paths' }
  | { page: 'path'; id: string };

/** browse mode: guided visual lessons, or the audio library (remembered between visits) */
export type BrowseMode = 'lessons' | 'audio';
interface Saved { passed: Record<string, string>; lastPlayed: Record<string, string>; myList: string[]; mode: BrowseMode }
const KEY = 'ccp.library.v1';
const EMPTY = (): Saved => ({ passed: {}, lastPlayed: {}, myList: [], mode: 'lessons' });
function load(): Saved { try { const s = globalThis.localStorage?.getItem(KEY); if (s) return { ...EMPTY(), ...JSON.parse(s) }; } catch { /* storage unavailable */ } return EMPTY(); }
function save(d: Saved) { try { globalThis.localStorage?.setItem(KEY, JSON.stringify(d)); } catch { /* storage unavailable or full */ } }

interface LibraryState extends Saved {
  view: LibraryPage;
  /** the module being played and the index of its current step; null when browsing or working freely */
  playing: { moduleId: string; step: number } | null;
  /** a case opened on its own (from Cases or search), outside any module */
  solo: string | null;
  go: (view: LibraryPage) => void;
  setPlaying: (p: LibraryState['playing']) => void;
  setSolo: (id: string | null) => void;
  pass: (key: string) => void;
  touch: (moduleId: string) => void;
  toggleList: (moduleId: string) => void;
  setMode: (mode: BrowseMode) => void;
  resetLibrary: () => void;
}
export const useLibrary = create<LibraryState>((set, get) => {
  const commit = (p: Partial<Saved>) => { set(p); const s = get(); save({ passed: s.passed, lastPlayed: s.lastPlayed, myList: s.myList, mode: s.mode }); };
  return {
    ...load(), view: { page: 'home' }, playing: null, solo: null,
    go: (view) => set({ view }),
    setPlaying: (playing) => set(playing ? { playing, solo: null } : { playing }),
    setSolo: (solo) => set(solo ? { solo, playing: null } : { solo }),
    pass: (key) => { if (!get().passed[key]) commit({ passed: { ...get().passed, [key]: new Date().toISOString() } }); },
    touch: (moduleId) => commit({ lastPlayed: { ...get().lastPlayed, [moduleId]: new Date().toISOString() } }),
    toggleList: (id) => commit({ myList: get().myList.includes(id) ? get().myList.filter((x) => x !== id) : [id, ...get().myList] }),
    setMode: (mode) => commit({ mode }),
    resetLibrary: () => { set({ playing: null, solo: null, view: { page: 'home' } }); commit(EMPTY()); },
  };
});
