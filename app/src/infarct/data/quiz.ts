/** Challenge questions are generated from territory data, so every territory gets a quiz for free. */
import type { CoronaryTerritory, Dominance, LeadId } from './types';
import { TERRITORIES, TERRITORY } from './territories';
import { VESSEL } from './vessels';
import { primaryCulprit } from './lessons';
import { LEAD } from './leads';

export interface QuizOption { id: string; label: string }
export interface QuizQuestion { id: string; prompt: string; kind: 'single' | 'multi-lead'; options: QuizOption[]; correct: string | string[]; explain: string }

const seeded = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; };
const shuffle = <T,>(a: T[], r: () => number) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const leadList = (ids: LeadId[]) => ids.map((l) => LEAD[l].label).join(', ');

export function supportingLeads(t: CoronaryTerritory): LeadId[] { return [...t.affectedLeads, ...t.reciprocalLeads]; }

export function extraLeadAnswer(t: CoronaryTerritory): string {
  const r = t.extraLeads.some((l) => l.endsWith('R')); const p = t.extraLeads.some((l) => ['V7', 'V8', 'V9'].includes(l));
  return r && p ? 'both' : r ? 'right' : p ? 'posterior' : 'none';
}

export function buildQuestions(t: CoronaryTerritory, dominance: Dominance): QuizQuestion[] {
  const rnd = seeded(t.id);
  const others = shuffle(TERRITORIES.filter((x) => x.id !== t.id), rnd).slice(0, 3);
  const culprit = primaryCulprit(t, dominance);
  const vesselPool = shuffle((['LAD', 'LCx', 'RCA', 'D1', 'PDA', 'OM1'] as const).filter((v) => v !== culprit.vessel), rnd).slice(0, 3);
  const recipText = (x: CoronaryTerritory) => x.reciprocalLeads.length ? `ST depression in ${leadList(x.reciprocalLeads)}` : 'No consistent reciprocal changes';
  const recipOpts = Array.from(new Set([recipText(t), ...shuffle(TERRITORIES.filter((x) => x.id !== t.id).map(recipText), rnd)])).slice(0, 4);
  return [
    { id: 'territory', prompt: 'Which territory is involved?', kind: 'single', options: shuffle([t, ...others], rnd).map((x) => ({ id: x.id, label: x.name })), correct: t.id, explain: t.explanation },
    { id: 'leads', prompt: 'Which leads support your answer? Select them on the ECG or below.', kind: 'multi-lead', options: [], correct: supportingLeads(t), explain: `ST elevation in ${leadList(t.affectedLeads)}${t.reciprocalLeads.length ? `, with reciprocal depression in ${leadList(t.reciprocalLeads)}` : ''}.` },
    { id: 'vessel', prompt: 'What is the likely culprit vessel?', kind: 'single', options: shuffle([culprit.vessel, ...vesselPool], rnd).map((v) => ({ id: v, label: VESSEL[v].name })), correct: culprit.vessel, explain: `Common culprit vessel: ${VESSEL[culprit.vessel].name}. ${culprit.note} Coronary anatomy varies, so this is the usual pattern, not a rule.` },
    { id: 'reciprocal', prompt: 'What reciprocal changes would you expect?', kind: 'single', options: shuffle(recipOpts, rnd).map((x) => ({ id: x, label: x })), correct: recipText(t), explain: t.reciprocalLeads.length ? 'Leads that look at the injured wall from the opposite side record the same injury current as ST depression.' : 'No standard lead looks at this wall from directly opposite, so reciprocal changes are inconsistent.' },
    { id: 'extra', prompt: 'Is there another set of leads you would obtain?', kind: 'single', options: [
      { id: 'right', label: 'Right-sided leads (V3R–V4R)' }, { id: 'posterior', label: 'Posterior leads (V7–V9)' }, { id: 'both', label: 'Both right-sided and posterior leads' }, { id: 'none', label: 'The standard 12-lead is enough' }],
      correct: extraLeadAnswer(t), explain: t.extraLeads.length ? `Record ${leadList(t.extraLeads)}. ${t.clinicalPearls.find((p) => /V4R|V7|posterior|right-sided/i.test(p)) ?? ''}` : 'No additional leads are routinely needed, though a posterior set is cheap insurance when the circumflex is suspected.' },
  ];
}

export const territoryOf = (id: string) => TERRITORY[id];
