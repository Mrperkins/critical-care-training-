/**
 * FP-C exam practice over the whole question bank (every lesson's exam-style questions).
 *  - Quick 10: ten questions spread across the domains by exam weight.
 *  - Weak spots: questions missed last time first, then questions never seen from the weakest domains.
 *  - Mock exam: the blueprint's item counts per domain, timed, no feedback until the end.
 * Pure selection and scoring live here so they can be tested; the history is kept in the browser.
 */
import { BLUEPRINT, TOTAL_ITEMS, type DomainId } from './blueprint';
import type { FpcLesson, Question } from './types';

export interface BankItem { key: string; lesson: string; lessonTitle: string; domain: DomainId; q: Question }
export interface Seen { n: number; right: number; lastOk: boolean; at: number }
export type History = Record<string, Seen>;
export type ExamKind = 'quick' | 'weak' | 'mock' | 'half';
export interface ExamPlan { kind: ExamKind; items: BankItem[]; minutes: number | null }

export const bank = (lessons: FpcLesson[]): BankItem[] => lessons.flatMap((l) => l.questions.map((q, i) => ({ key: `${l.id}:${i}`, lesson: l.id, lessonTitle: l.title, domain: l.domain, q })));

/** a small seeded generator so a session can be rebuilt and tests are repeatable */
export function rng(seed: number) { let s = seed >>> 0 || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
export function shuffle<T>(a: T[], r: () => number) { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

/** How many of `total` questions each domain gets, in proportion to its exam weight (largest remainders). */
export function allocation(total: number): Record<DomainId, number> {
  const raw = BLUEPRINT.map((d) => ({ id: d.id, x: (d.items / TOTAL_ITEMS) * total }));
  const out = Object.fromEntries(raw.map((r) => [r.id, Math.floor(r.x)])) as Record<DomainId, number>;
  let left = total - Object.values(out).reduce((a, b) => a + b, 0);
  for (const r of [...raw].sort((a, b) => (b.x % 1) - (a.x % 1))) { if (left-- <= 0) break; out[r.id]++; }
  return out;
}
/** Questions for each domain by weight; within a domain, never-seen first, then least recently seen. */
function weighted(all: BankItem[], h: History, total: number, r: () => number): BankItem[] {
  const want = allocation(total); const picked: BankItem[] = [];
  for (const d of BLUEPRINT) {
    const pool = shuffle(all.filter((b) => b.domain === d.id), r).sort((a, b) => (h[a.key]?.at ?? 0) - (h[b.key]?.at ?? 0));
    picked.push(...pool.slice(0, want[d.id]));
  }
  return shuffle(picked, r);
}
export interface DomainStat { id: DomainId; title: string; items: number; seen: number; total: number; pct: number | null }
export function domainStats(all: BankItem[], h: History): DomainStat[] {
  return BLUEPRINT.map((d) => { const qs = all.filter((b) => b.domain === d.id); const seen = qs.filter((b) => h[b.key]); const ok = seen.filter((b) => h[b.key].lastOk).length;
    return { id: d.id, title: d.title, items: d.items, seen: seen.length, total: qs.length, pct: seen.length ? Math.round((ok / seen.length) * 100) : null }; });
}
/** Exam readiness: each domain's last-answer accuracy, weighted by its item count; unseen domains count as zero. */
export function readiness(stats: DomainStat[]) {
  const pct = Math.round(stats.reduce((a, d) => a + d.items * (d.pct ?? 0), 0) / TOTAL_ITEMS);
  const coverage = Math.round((stats.reduce((a, d) => a + d.seen, 0) / Math.max(1, stats.reduce((a, d) => a + d.total, 0))) * 100);
  return { pct, coverage };
}
export function plan(kind: ExamKind, all: BankItem[], h: History, seed = Date.now()): ExamPlan {
  const r = rng(seed);
  if (kind === 'quick') return { kind, items: weighted(all, h, 10, r), minutes: null };
  if (kind === 'mock') return { kind, items: weighted(all, h, TOTAL_ITEMS, r), minutes: 150 };
  if (kind === 'half') return { kind, items: weighted(all, h, 55, r), minutes: 75 };
  // weak spots: missed last time, then unseen questions from the three weakest domains
  const missed = shuffle(all.filter((b) => h[b.key] && !h[b.key].lastOk), r);
  const weak = [...domainStats(all, h)].sort((a, b) => (a.pct ?? -1) - (b.pct ?? -1)).slice(0, 3).map((d) => d.id);
  const fresh = shuffle(all.filter((b) => !h[b.key] && weak.includes(b.domain)), r);
  return { kind, items: [...missed, ...fresh].slice(0, 15), minutes: null };
}
export interface ExamResult { right: number; total: number; pct: number; byDomain: { id: DomainId; title: string; right: number; total: number }[]; missed: { item: BankItem; pick: number | null }[] }
export function score(items: BankItem[], picks: (number | null)[]): ExamResult {
  const ok = (i: number) => picks[i] === items[i].q.answer; const right = items.filter((_, i) => ok(i)).length;
  const byDomain = BLUEPRINT.map((d) => { const idx = items.map((b, i) => (b.domain === d.id ? i : -1)).filter((i) => i >= 0); return { id: d.id, title: d.title, right: idx.filter(ok).length, total: idx.length }; }).filter((d) => d.total);
  return { right, total: items.length, pct: items.length ? Math.round((right / items.length) * 100) : 0, byDomain, missed: items.map((item, i) => ({ item, pick: picks[i] ?? null })).filter((_, i) => !ok(i)) };
}
export function record(h: History, items: BankItem[], picks: (number | null)[], now = Date.now()): History {
  const out = { ...h };
  items.forEach((b, i) => { if (picks[i] == null) return; const p = out[b.key]; const ok = picks[i] === b.q.answer; out[b.key] = { n: (p?.n ?? 0) + 1, right: (p?.right ?? 0) + (ok ? 1 : 0), lastOk: ok, at: now }; });
  return out;
}
const KEY = 'cc.fpc.bank.v1'; const MOCKS = 'cc.fpc.mocks.v1';
export const loadHistory = (): History => { try { return JSON.parse(globalThis.localStorage?.getItem(KEY) ?? '{}'); } catch { return {}; } };
export const saveHistory = (h: History) => { try { globalThis.localStorage?.setItem(KEY, JSON.stringify(h)); } catch { /* storage unavailable */ } };
export interface MockRecord { at: number; kind: ExamKind; pct: number; right: number; total: number; ms: number }
export const loadMocks = (): MockRecord[] => { try { return JSON.parse(globalThis.localStorage?.getItem(MOCKS) ?? '[]'); } catch { return []; } };
export const saveMock = (m: MockRecord) => { try { globalThis.localStorage?.setItem(MOCKS, JSON.stringify([...loadMocks(), m].slice(-20))); } catch { /* storage unavailable */ } };
/** the published passing standard is scaled; 70 % is the usual study target and is labelled as a target, not a pass mark */
export const TARGET = 70;
