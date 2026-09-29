/**
 * MOA product modes as pure functions over the SAME mechanism graph: view levels (which node kinds are
 * emphasised), receptor branches (a receptor and everything downstream of it), upstream / downstream
 * exploration from any node, adverse-effect highlighting, and a side-by-side comparison of two drugs on
 * their own patient adapters. The UI only renders what these return.
 */
import type { MechanismDefinition, MechKind, Readout } from './types';

export type Level = 'quick' | 'cellular' | 'organ' | 'patient';
export const LEVELS: [Level, string][] = [['quick', 'Quick'], ['cellular', 'Cellular'], ['organ', 'Organ'], ['patient', 'Whole patient']];
const LEVEL_KINDS: Record<Level, MechKind[]> = {
  quick: ['drug', 'receptor', 'vital'],
  cellular: ['drug', 'receptor', 'transducer', 'messenger', 'channel', 'enzyme', 'cell'],
  organ: ['drug', 'receptor', 'cell', 'organ', 'vital'],
  patient: ['drug', 'organ', 'vital'],
};
export const levelKinds = (l: Level) => LEVEL_KINDS[l];

const children = (d: MechanismDefinition, id: string) => d.edges.filter((e) => e.from === id && e.effect !== 'none').map((e) => e.to);
const parents = (d: MechanismDefinition, id: string) => d.edges.filter((e) => e.to === id && e.effect !== 'none').map((e) => e.from);
function walk(start: string, next: (id: string) => string[]) { const seen = new Set<string>(); const q = [start]; while (q.length) { const x = q.shift()!; for (const y of next(x)) if (!seen.has(y)) { seen.add(y); q.push(y); } } return seen; }
export const descendants = (d: MechanismDefinition, id: string) => walk(id, (x) => children(d, x));
export const ancestors = (d: MechanismDefinition, id: string) => walk(id, (x) => parents(d, x));

/** The main drug node (first drug-kind node; antidotes are later drug nodes). */
export const mainDrug = (d: MechanismDefinition) => d.nodes.find((n) => n.kind === 'drug')!.id;
export interface Branch { id: string; label: string; nodes: Set<string> }
/** Receptor branches: the targets the main drug acts on directly; only offered when there are two or more. */
export function branches(d: MechanismDefinition): Branch[] {
  const drug = mainDrug(d); const targets = d.edges.filter((e) => e.from === drug && e.effect !== 'none').map((e) => d.nodes.find((n) => n.id === e.to)!).filter((n) => n && (n.kind === 'receptor' || n.kind === 'channel' || n.kind === 'enzyme'));
  if (targets.length < 2) return [];
  return targets.map((t) => ({ id: t.id, label: t.label.replace(/ receptor$/, ''), nodes: new Set([drug, t.id, ...descendants(d, t.id)]) }));
}

export interface ViewState { level: Level; branch: string | null; focus: string | null; adverse: boolean; adverseIds: string[] }
export type Emphasis = 'on' | 'dim' | 'adverse' | 'focus';
/** How strongly to draw each node given the mode settings. Everything stays in place; only emphasis changes. */
export function emphasis(d: MechanismDefinition, v: ViewState): Record<string, Emphasis> {
  const kinds = new Set(levelKinds(v.level)); const br = v.branch ? branches(d).find((b) => b.id === v.branch) : null;
  const path = v.focus ? new Set([v.focus, ...ancestors(d, v.focus), ...descendants(d, v.focus)]) : null; const adv = new Set(v.adverseIds);
  const out: Record<string, Emphasis> = {};
  for (const n of d.nodes) {
    let e: Emphasis = kinds.has(n.kind) ? 'on' : 'dim';
    if (br && !br.nodes.has(n.id)) e = 'dim';
    if (path) e = n.id === v.focus ? 'focus' : path.has(n.id) ? 'on' : 'dim';
    if (v.adverse) e = adv.has(n.id) ? 'adverse' : 'dim';
    out[n.id] = e;
  }
  return out;
}

export interface CompareRow { id: string; label: string; unit: string; a: number; b: number }
/** Change in each shared read-out from no drug to the demo dose, for two drugs on their own patients. Runs A to completion before B (adapters may share an engine instance). */
export function compare(a: MechanismDefinition, b: MechanismDefinition): { rows: CompareRow[]; sameScenario: boolean } {
  const delta = (d: MechanismDefinition) => { const p = d.patient!; p.setup(); p.exposure(0); const r0 = p.readouts(); p.exposure(1); const r1 = p.readouts(); return new Map(r1.map((r) => [r.id, { r, d: r.value - (r0.find((x) => x.id === r.id)?.value ?? NaN) }])); };
  if (!a.patient || !b.patient) return { rows: [], sameScenario: false };
  const da = delta(a), db = delta(b); const rows: CompareRow[] = [];
  for (const [id, x] of da) { const y = db.get(id); if (y && Number.isFinite(x.d) && Number.isFinite(y.d)) rows.push({ id, label: x.r.label, unit: x.r.unit, a: x.d, b: y.d }); }
  return { rows, sameScenario: a.patient.scenario === b.patient.scenario };
}
export type { Readout };
