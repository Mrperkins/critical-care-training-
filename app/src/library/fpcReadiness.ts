/**
 * FP-C readiness for the Today page: each exam domain counts by its item weight, and a domain's share is the
 * fraction of its lessons whose quiz the learner has passed (80 %). Loads the FP-C lessons only when asked.
 */
import { useEffect, useState } from 'react';
import { BLUEPRINT, TOTAL_ITEMS, type DomainId } from '../fpc/blueprint';

export interface Readiness { pct: number; domains: { id: DomainId; title: string; items: number; pct: number; lessons: number }[] }
const PASS = 80;
export function computeReadiness(lessons: { id: string; domain: DomainId }[], sc: Record<string, number>): Readiness {
  const domains = BLUEPRINT.map((d) => { const ls = lessons.filter((l) => l.domain === d.id); const ok = ls.filter((l) => (sc[l.id] ?? 0) >= PASS).length; return { id: d.id, title: d.title, items: d.items, lessons: ls.length, pct: ls.length ? Math.round((ok / ls.length) * 100) : 0 }; });
  return { pct: Math.round(domains.reduce((a, d) => a + d.items * d.pct, 0) / TOTAL_ITEMS), domains };
}
export function useReadiness(): Readiness | null {
  const [r, setR] = useState<Readiness | null>(null);
  // the same number the Exam prep page shows: last answer on every question seen, weighted by exam items
  useEffect(() => { let on = true; void Promise.all([import('../fpc'), import('../fpc/exam')]).then(([m, x]) => {
    if (!on) return; const stats = x.domainStats(x.bank(m.FPC_LESSONS), x.loadHistory());
    setR({ pct: x.readiness(stats).pct, domains: stats.map((d) => ({ id: d.id, title: d.title, items: d.items, pct: d.pct ?? 0, lessons: d.total })) });
  }).catch(() => undefined); return () => { on = false; }; }, []);
  return r;
}
