/** Deterministic layered layout for a mechanism graph (left → right by causal depth). */
import type { MechanismDefinition, MechNode } from './types';

export interface Placed { node: MechNode; rank: number; row: number; x: number; y: number }
export function ranks(def: MechanismDefinition): Record<string, number> {
  const r: Record<string, number> = {}; const inDeg: Record<string, number> = {};
  def.nodes.forEach((n) => { inDeg[n.id] = 0; }); def.edges.forEach((e) => { inDeg[e.to] = (inDeg[e.to] ?? 0) + 1; });
  const q = def.nodes.filter((n) => !inDeg[n.id]).map((n) => n.id); q.forEach((id) => { r[id] = 0; });
  // longest-path layering (graphs are small and acyclic)
  for (let guard = 0; guard < 200 && q.length; guard++) {
    const id = q.shift()!; for (const e of def.edges.filter((x) => x.from === id)) { r[e.to] = Math.max(r[e.to] ?? 0, r[id] + 1); if (--inDeg[e.to] === 0) q.push(e.to); }
  }
  def.nodes.forEach((n) => { if (n.rank != null) r[n.id] = n.rank; r[n.id] ??= 0; });
  return r;
}
export function layout(def: MechanismDefinition, W = 1000, H = 520, vertical = false): Placed[] {
  const r = ranks(def); const maxR = Math.max(...Object.values(r)); const cols: MechNode[][] = Array.from({ length: maxR + 1 }, () => []);
  def.nodes.forEach((n) => cols[r[n.id]].push(n));
  // order rows by the mean row of parents (one barycentre sweep keeps edges from crossing much)
  const rowOf: Record<string, number> = {};
  cols.forEach((col, c) => {
    if (c > 0) col.sort((a, b) => bary(a.id) - bary(b.id));
    col.forEach((n, i) => { rowOf[n.id] = (i + 0.5) / col.length; });
  });
  function bary(id: string) { const ps = def.edges.filter((e) => e.to === id).map((e) => rowOf[e.from]).filter((x) => x != null); return ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length : 0.5; }
  const padX = 90, padY = 36; const along = (k: number) => (maxR ? k / maxR : 0.5);
  return def.nodes.map((n) => vertical
    ? { node: n, rank: r[n.id], row: rowOf[n.id], x: padX + rowOf[n.id] * (W - 2 * padX), y: padY + along(r[n.id]) * (H - 2 * padY) }
    : { node: n, rank: r[n.id], row: rowOf[n.id], x: padX + along(r[n.id]) * (W - 2 * padX), y: padY + rowOf[n.id] * (H - 2 * padY) });
}
