/**
 * Explore is the learner's own patient. Learn, Challenge and Simulate load patients of their own into the same
 * module state, so when the learner leaves Explore we keep a copy of their patient and put it back when they
 * return (also after visiting another module in between). Pure bookkeeping — each module supplies save/restore.
 */
import { useEffect, useRef } from 'react';
import { useUI } from './store';

const mem = new Map<string, unknown>();
export function useExploreMemory<T>(key: string, save: () => T, restore: (t: T) => void) {
  const mode = useUI((s) => s.mode); const prev = useRef<string | null>(null);
  const fns = useRef({ save, restore }); fns.current = { save, restore };
  useEffect(() => {
    const was = prev.current; prev.current = mode;
    if (mode === 'explore') {
      if ((was === null || was !== 'explore') && mem.has(key)) { const t = mem.get(key) as T; mem.delete(key); fns.current.restore(t); }
    } else if (was === 'explore') mem.set(key, fns.current.save());
  }, [mode, key]);
}
/** tests */
export const _exploreMemory = mem;
