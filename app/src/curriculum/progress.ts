/**
 * Learner progress: completions, bookmarks and challenge attempts. Kept in browser storage when it is
 * available (every access wrapped — private windows, blocked storage and tests simply start empty);
 * the app never depends on it. Analysis functions are pure.
 */
import { create } from 'zustand';
import { CATALOG, CHALLENGE_CONCEPTS, CONCEPTS, DOMAINS, type Domain, type Entry } from './catalog';
import { syncVisualConcepts } from '../audio/visualSync';

export interface Bookmark { lessonId: string; t: number; title: string; at: string }
export interface Attempt { ok: boolean; at: string }
export interface ProgressData { completed: Record<string, string>; bookmarks: Bookmark[]; attempts: Record<string, Attempt[]> }
const KEY = 'ccp.progress.v1'; const EMPTY = (): ProgressData => ({ completed: {}, bookmarks: [], attempts: {} });
function load(): ProgressData { try { const s = globalThis.localStorage?.getItem(KEY); if (s) { const d = JSON.parse(s); return { ...EMPTY(), ...d }; } } catch { /* storage unavailable */ } return EMPTY(); }
function save(d: ProgressData) { try { globalThis.localStorage?.setItem(KEY, JSON.stringify(d)); } catch { /* storage unavailable or full */ } }
const now = () => new Date().toISOString();

interface ProgressUI extends ProgressData {
  markComplete: (id: string) => void; toggleBookmark: (b: Omit<Bookmark, 'at'>) => void; removeBookmark: (i: number) => void;
  record: (challengeId: string, ok: boolean) => void; reset: () => void;
}
export const useProgress = create<ProgressUI>((set, get) => {
  const commit = (p: Partial<ProgressData>) => { set(p); const s = get(); save({ completed: s.completed, bookmarks: s.bookmarks, attempts: s.attempts }); };
  return {
    ...load(),
    markComplete: (id) => { if (!get().completed[id]) commit({ completed: { ...get().completed, [id]: now() } }); },
    toggleBookmark: (b) => { const bs = get().bookmarks; const i = bs.findIndex((x) => x.lessonId === b.lessonId && Math.abs(x.t - b.t) < 2); commit({ bookmarks: i >= 0 ? bs.filter((_, k) => k !== i) : [{ ...b, at: now() }, ...bs].slice(0, 50) }); },
    removeBookmark: (i) => commit({ bookmarks: get().bookmarks.filter((_, k) => k !== i) }),
    record: (id, ok) => {
      commit({ attempts: { ...get().attempts, [id]: [...(get().attempts[id] ?? []), { ok, at: now() }].slice(-10) } });
      syncVisualConcepts(CHALLENGE_CONCEPTS[id] ?? [], ok);
    },
    reset: () => commit(EMPTY()),
  };
});

export interface Weak { concept: string; name: string; tried: number; missed: number; challenges: string[] }
/** Concepts where the learner's LATEST attempt at a challenge was wrong, ranked by misses (then by share missed). */
export function weakTopics(attempts: Record<string, Attempt[]>): Weak[] {
  const acc: Record<string, Weak> = {};
  for (const [cid, list] of Object.entries(attempts)) {
    const last = list[list.length - 1]; if (!last) continue;
    for (const c of CHALLENGE_CONCEPTS[cid] ?? []) {
      const w = (acc[c] ??= { concept: c, name: CONCEPTS[c]?.name ?? c, tried: 0, missed: 0, challenges: [] }); w.tried++;
      if (!last.ok) { w.missed++; w.challenges.push(cid); }
    }
  }
  return Object.values(acc).filter((w) => w.missed > 0 && w.missed / w.tried >= 0.34).sort((a, b) => b.missed - a.missed || b.missed / b.tried - a.missed / a.tried);
}
export interface DomainProgress { domain: Domain; entries: Entry[]; done: number }
export function domainProgress(completed: Record<string, string>, filter: (e: Entry) => boolean = () => true): DomainProgress[] {
  return DOMAINS.map((d) => { const entries = CATALOG.filter((x) => x.domains.includes(d) && filter(x)); return { domain: d, entries, done: entries.filter((x) => completed[x.id]).length }; });
}
/** Prerequisites not yet completed for an entry. */
export const missingPrereqs = (e: Entry, completed: Record<string, string>) => e.prereq.filter((p) => !completed[p]);
