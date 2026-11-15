/** What a case card shows: which system shelf it belongs to and its level (where the case defines one). */
import { challengeModule } from '../curriculum/catalog';
import { VENT_CHALLENGES } from '../scenarios/ventChallenges';
import { LINES_CASES } from '../lines/cases';
import { SCENE_CASES } from '../challenge/sceneCases';
import { LAB_CASES } from '../scenarios/labCases';
import type { ShelfId } from './modules';

export type CaseLevel = 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
const LEVEL: Record<string, CaseLevel> = {};
for (const c of VENT_CHALLENGES) LEVEL[`vent-${c.id}`] = c.level;
for (const c of LINES_CASES) LEVEL[`lines-${c.id}`] = c.level;
for (const c of SCENE_CASES) LEVEL[c.id] = c.level;
for (const c of LAB_CASES) LEVEL[`lab-${c.id}`] = c.level as CaseLevel;
const SHELF_OF: Record<string, ShelfId> = { vent: 'resp', abg: 'gas', labs: 'gas', lines: 'hemo', heart: 'cardiac', neuro: 'neuro', abdomen: 'abdomen' };
export const caseLevel = (id: string): CaseLevel | null => LEVEL[id] ?? null;
/** Scene cases about children and pregnancy run in other systems' scenes; they still file under their engine's shelf. */
export const caseShelf = (id: string): ShelfId => SHELF_OF[challengeModule(id)] ?? 'resp';
export const LEVELS: CaseLevel[] = ['Novice', 'Intermediate', 'Advanced', 'Expert'];

/** Best result per case saved by the case screen (stars 0–3). */
export function bestStars(): Record<string, number> {
  try { const b = JSON.parse(globalThis.localStorage?.getItem('ccp.game.best.v1') ?? '{}') as Record<string, { stars: number }>; return Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.stars])); } catch { return {}; }
}
/** The same case for everyone on a given day, preferring one not yet passed. */
export function dailyCase(all: string[], passed: (id: string) => boolean, day = new Date()): string | null {
  if (!all.length) return null;
  const n = Math.floor(day.getTime() / 864e5 - day.getTimezoneOffset() / 1440);
  const open = all.filter((c) => !passed(c)); const pool = open.length ? open : all;
  return pool[n % pool.length];
}
/** Days in a row (ending today or yesterday) with any recorded activity. */
export function streak(stamps: string[], now = new Date()): number {
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const days = new Set(stamps.map((s) => { const d = new Date(s); return isNaN(d.getTime()) ? '' : key(d); }));
  const d = new Date(now); if (!days.has(key(d))) d.setDate(d.getDate() - 1);
  let n = 0; while (days.has(key(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
