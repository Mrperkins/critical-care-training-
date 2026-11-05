/** Search across modules, lessons and procedures, cases, conditions and drugs. Pure: index built once. */
import { CATALOG, CHALLENGE_CONCEPTS, CONCEPTS } from '../curriculum/catalog';
import { titleOf } from '../curriculum/titles';
import { DISEASES } from '../atlas/registry';
import { MECHANISMS } from '../moa/registry';
import { MODULES, SHELF_BY_ID } from './modules';

export type HitKind = 'module' | 'lesson' | 'procedure' | 'case' | 'condition' | 'drug';
export interface Hit { kind: HitKind; id: string; title: string; sub: string; text: string }
export const HIT_LABEL: Record<HitKind, string> = { module: 'Modules', lesson: 'Lessons', procedure: 'Procedures', case: 'Cases', condition: 'Conditions', drug: 'Drugs' };
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[₀-₉]/g, (d) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(d)));

let INDEX: Hit[] | null = null;
export function searchIndex(): Hit[] {
  if (INDEX) return INDEX;
  const hits: Hit[] = [];
  for (const m of MODULES) hits.push({ kind: 'module', id: m.id, title: m.title, sub: `${SHELF_BY_ID[m.shelf].title} · ${m.steps.length} steps`, text: `${m.blurb} ${m.outcomes.join(' ')}` });
  for (const e of CATALOG) {
    if (e.id.startsWith('atlas-')) continue;
    hits.push({ kind: e.kind === 'workflow' ? 'procedure' : 'lesson', id: e.id, title: titleOf(e.id), sub: e.domains.join(' · '), text: e.objectives.join(' ') });
  }
  for (const id of Object.keys(CHALLENGE_CONCEPTS)) hits.push({ kind: 'case', id, title: titleOf(id), sub: (CHALLENGE_CONCEPTS[id] ?? []).map((c) => CONCEPTS[c]?.name).filter(Boolean).join(' · '), text: '' });
  for (const d of DISEASES) hits.push({ kind: 'condition', id: `atlas-${d.id}`, title: d.title, sub: 'Condition explainer', text: d.distinction });
  for (const m of MECHANISMS) hits.push({ kind: 'drug', id: m.id, title: m.drug, sub: m.drugClass, text: m.blurb });
  INDEX = hits.map((h) => ({ ...h, text: norm(`${h.title} ${h.sub} ${h.text}`) }));
  return INDEX;
}

/** Every word of the query must appear; titles that start with or contain the query rank first. */
export function search(query: string, perKind = 6): { kind: HitKind; hits: Hit[] }[] {
  const q = norm(query.trim()); if (q.length < 2) return [];
  const words = q.split(/\s+/).filter(Boolean);
  const scored = searchIndex().filter((h) => words.every((w) => h.text.includes(w))).map((h) => {
    const t = norm(h.title); const score = t.startsWith(q) ? 0 : t.includes(q) ? 1 : words.every((w) => t.includes(w)) ? 2 : 3;
    return { h, score };
  }).sort((a, b) => a.score - b.score || a.h.title.length - b.h.title.length);
  const order: HitKind[] = ['module', 'lesson', 'case', 'procedure', 'condition', 'drug'];
  return order.map((kind) => ({ kind, hits: scored.filter((x) => x.h.kind === kind).slice(0, perKind).map((x) => x.h) })).filter((g) => g.hits.length);
}
