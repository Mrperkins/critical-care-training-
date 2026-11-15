/**
 * FP-C readiness for the Today page: each exam domain counts by its item weight, and a domain's share is the
 * fraction of its lessons whose quiz the learner has passed (80 %). Loads the FP-C lessons only when asked.
 */
import { useEffect, useState } from 'react';
import { BLUEPRINT, TOTAL_ITEMS, type DomainId } from '../fpc/blueprint';

export interface Readiness { pct: number; domains: { id: DomainId; title: string; items: number; pct: number; lessons: number }[] }
const PASS = 80;
const scores = (): Record<string, number> => { try { return JSON.parse(globalThis.localStorage?.getItem('cc.fpc.scores.v1') ?? '{}'); } catch { return {}; } };
export function computeReadiness(lessons: { id: string; domain: DomainId }[], sc: Record<string, number>): Readiness {
  const domains = BLUEPRINT.map((d) => { const ls = lessons.filter((l) => l.domain === d.id); const ok = ls.filter((l) => (sc[l.id] ?? 0) >= PASS).length; return { id: d.id, title: d.title, items: d.items, lessons: ls.length, pct: ls.length ? Math.round((ok / ls.length) * 100) : 0 }; });
  return { pct: Math.round(domains.reduce((a, d) => a + d.items * d.pct, 0) / TOTAL_ITEMS), domains };
}
export function useReadiness(): Readiness | null {
  const [r, setR] = useState<Readiness | null>(null);
  useEffect(() => { let on = true; void import('../fpc').then((m) => { if (on) setR(computeReadiness(m.FPC_LESSONS, scores())); }).catch(() => undefined); return () => { on = false; }; }, []);
  return r;
}
