/**
 * Procedural workflows: an ordered set of bedside actions performed on an EXISTING engine (vent
 * session, lines session, labs bench …). The workflow never computes physiology itself: each action
 * may call an `effect` that drives the engine, and the learner watches the real model respond.
 * Pure evaluation (order, omissions, harmful actions) so it is testable and replayable.
 */
export interface WfAction {
  id: string; label: string;
  /** shown after the action is chosen: why it matters / why it is wrong */ why: string;
  /** for a step: omitting it is a critical error; for a distractor: choosing it is a critical error */ critical?: boolean;
}
export interface Workflow {
  id: string; title: string; level: 'core' | 'advanced'; blurb: string; module: string;
  /** situation shown before the first action */ context: string;
  setup: () => void;
  /** the correct sequence */ steps: WfAction[];
  /** groups of step ids whose order among themselves does not matter */ anyOrder?: string[][];
  /** plausible wrong actions */ distractors: WfAction[];
  /** engine effects, keyed by action id (steps or distractors) */ effects?: Record<string, () => void>;
  debrief: string;
}
export interface WfResult {
  /** ids of chosen steps that were in the right place */ ok: string[];
  /** chosen steps performed after a step that should come later */ outOfOrder: string[];
  /** distractors chosen */ wrong: string[]; harmful: string[];
  /** steps not (yet) done */ missing: string[]; criticalMissing: string[];
  next: string | null; done: boolean; score: number;
}

/** rank of each step (steps in the same any-order group share the rank of the group's first member) */
export function ranks(wf: Workflow) {
  const r: Record<string, number> = {}; wf.steps.forEach((s, i) => (r[s.id] = i));
  for (const g of wf.anyOrder ?? []) { const m = Math.min(...g.map((id) => r[id])); g.forEach((id) => (r[id] = m)); }
  return r;
}

/** Evaluate a sequence of chosen action ids. `finished` = the learner says they are done (omissions count). */
export function evaluate(wf: Workflow, chosen: string[], finished = false): WfResult {
  const r = ranks(wf); const stepIds = new Set(wf.steps.map((s) => s.id)); const dis = new Map(wf.distractors.map((d) => [d.id, d]));
  const ok: string[] = [], outOfOrder: string[] = [], wrong: string[] = [], harmful: string[] = []; let hi = -1; const seen = new Set<string>();
  for (const id of chosen) {
    if (seen.has(id)) continue; seen.add(id);
    if (stepIds.has(id)) { if (r[id] < hi) outOfOrder.push(id); else ok.push(id); hi = Math.max(hi, r[id]); }
    else if (dis.has(id)) { wrong.push(id); if (dis.get(id)!.critical) harmful.push(id); }
  }
  const missing = wf.steps.filter((s) => !seen.has(s.id)).map((s) => s.id);
  const criticalMissing = finished ? wf.steps.filter((s) => s.critical && !seen.has(s.id)).map((s) => s.id) : [];
  const next = missing.length ? missing.reduce((a, b) => (r[b] < r[a] ? b : a)) : null;
  const done = missing.length === 0 || finished;
  const score = Math.max(0, Math.round(100 - 8 * outOfOrder.length - 6 * (wrong.length - harmful.length) - 25 * harmful.length - (finished ? 10 * missing.length + 20 * criticalMissing.length : 0)));
  return { ok, outOfOrder, wrong, harmful, missing, criticalMissing, next, done, score };
}

/** All actions in a stable shuffled order (so the correct order is not given away, but the list does not jump around). */
export function options(wf: Workflow): WfAction[] {
  const h = (s: string) => { let x = 2166136261; for (const c of wf.id + s) x = Math.imul(x ^ c.charCodeAt(0), 16777619); return x >>> 0; };
  return [...wf.steps, ...wf.distractors].sort((a, b) => h(a.id) - h(b.id));
}
