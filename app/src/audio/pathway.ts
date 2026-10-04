import { EPISODES, MENTAL_REPS } from './catalog';
import { bridgeFor } from './bridges';
import { MASTERY_BY_ID } from './mastery';
import { REVIEW_PROMPTS } from './review';

export type PathStep =
  | { kind: 'concept'; id: string; title: string; note: string }
  | { kind: 'listen'; id: string; title: string; note: string }
  | { kind: 'visual'; id: string; title: string; note: string; href: string }
  | { kind: 'rep'; id: string; title: string; note: string }
  | { kind: 'review'; id: string; title: string; note: string };

function prereqOrder(id: string, seen = new Set<string>(), out: string[] = []) {
  if (seen.has(id)) return out; seen.add(id);
  const c = MASTERY_BY_ID[id]; if (!c) return out;
  for (const p of c.prereq) prereqOrder(p, seen, out);
  if (id !== out[out.length - 1]) out.push(id);
  return out;
}

export function buildLearningPath(conceptId: string): PathStep[] {
  const c = MASTERY_BY_ID[conceptId]; if (!c) return [];
  const ordered = prereqOrder(conceptId).filter((id) => id !== conceptId);
  const steps: PathStep[] = ordered.map((id) => ({
    kind: 'concept', id, title: MASTERY_BY_ID[id]?.name ?? id,
    note: 'Prerequisite mental model — understand this before adding the target concept.',
  }));
  const audio = EPISODES.filter((e) => e.concepts.includes(conceptId)).sort((a,b) => a.level-b.level || a.minutes-b.minutes);
  for (const e of audio.slice(0,3)) steps.push({ kind:'listen', id:e.id, title:e.title, note:`${e.format.replace('-', ' ')} · ${e.minutes} min` });
  const bridge = bridgeFor(conceptId); if (bridge) steps.push({ kind:'visual', id:conceptId, title:bridge.label, note:bridge.note, href:bridge.href });
  const reps = MENTAL_REPS.filter((r) => r.concepts.includes(conceptId));
  for (const r of reps.slice(0,2)) steps.push({ kind:'rep', id:r.id, title:r.title, note:`Guided procedural visualization · ${r.minutes} min` });
  const review = REVIEW_PROMPTS.find((q) => q.concept === conceptId);
  if (review) steps.push({ kind:'review', id:review.id, title:'Prove you can retrieve it', note:review.question });
  if (!audio.length && !bridge && !reps.length && !review) steps.push({ kind:'concept', id:conceptId, title:c.name, note:c.performance[0] });
  return steps;
}
