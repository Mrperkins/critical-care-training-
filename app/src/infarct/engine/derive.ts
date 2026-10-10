/**
 * Pure functions that turn app state + medical data into render targets.
 * Keeps clinical logic out of React components.
 */
import type { CoronaryTerritory, CulpritOption, Dominance, RegionId, VesselId } from '../data/types';
import { TERRITORY } from '../data/territories';
import { VESSELS, DOMINANCE_EXTENT, ischemicBeyond, upstream, downstream, parentOf, type OriginTable } from '../data/vessels';
import { primaryCulprit } from '../data/lessons';
import type { SceneDirectives } from './store';

export const REGION_ORDER: RegionId[] = ['septum', 'anterior', 'apex', 'lateral', 'highLateral', 'inferior', 'posterior', 'rvFreeWall'];

export function regionVector(t: CoronaryTerritory | null): number[] {
  return REGION_ORDER.map((r) => (t ? t.heartHighlightRegion[r] ?? 0 : 0));
}

export function culpritFor(t: CoronaryTerritory, dominance: Dominance, index = 0): CulpritOption {
  const opts = t.commonCulpritVessels.filter((c) => !c.dominance || c.dominance === dominance);
  if (index > 0 && opts[index]) return opts[index];
  return primaryCulprit(t, dominance);
}

export interface VesselRender { state: 0 | 1 | 2 | 3; occAt: number; perf: number; down: number; flow: number; maxS: number; dim: number }

export function vesselTargets(args: {
  territoryId: string | null; culpritIndex: number; vesselId: VesselId | null; hoverVessel: VesselId | null;
  dominance: Dominance; scene: SceneDirectives; origins?: OriginTable;
}): Record<VesselId, VesselRender> {
  const { territoryId, vesselId, hoverVessel, dominance, scene, origins } = args;
  const t = territoryId ? TERRITORY[territoryId] : null;
  const c = t ? culpritFor(t, dominance, args.culpritIndex) : null;
  const beyond = c ? ischemicBeyond(c.vessel, c.at, dominance, origins) : [];
  const chain = c ? upstream(c.vessel, dominance) : vesselId ? upstream(vesselId, dominance) : [];
  const selectedTree = vesselId ? downstream(vesselId, dominance) : [];
  const out = {} as Record<VesselId, VesselRender>;
  for (const v of VESSELS) {
    const isCulprit = c?.vessel === v.id;
    const r: VesselRender = { state: 0, occAt: 2, perf: 0, down: 0, flow: 0, maxS: DOMINANCE_EXTENT[dominance][v.id] ?? 2, dim: 0 };
    if (isCulprit && scene.highlightVessel) r.state = 3;
    else if (vesselId === v.id) r.state = 2;
    else if (hoverVessel === v.id) r.state = 1;
    if (isCulprit) { r.occAt = scene.occlusion > 0.01 ? c!.at : 2; r.perf = scene.perfusionLoss; }
    if (beyond.includes(v.id)) r.down = scene.perfusionLoss;
    const flowing = scene.flow && (chain.includes(v.id) || isCulprit || (c && parentOf(v.id, dominance) && chain.includes(parentOf(v.id, dominance)!) && !beyond.includes(v.id)));
    if (flowing || (vesselId && selectedTree.includes(v.id))) r.flow = 1;
    if (vesselId && !selectedTree.includes(v.id) && !chain.includes(v.id)) r.dim = 0.6;
    if (t && scene.highlightVessel && !chain.includes(v.id) && !isCulprit && !beyond.includes(v.id)) r.dim = 0.5;
    out[v.id] = r;
  }
  return out;
}

/** Territories supplied by a vessel (for vessel-selection highlighting). */
export function regionsOfVessel(id: VesselId, dominance: Dominance): Partial<Record<RegionId, number>> {
  const out: Partial<Record<RegionId, number>> = {};
  for (const v of downstream(id, dominance)) for (const r of VESSELS.find((x) => x.id === v)!.supplies) out[r] = 1;
  return out;
}

export const REGION_TO_TERRITORY: Record<RegionId, string> = {
  septum: 'septal', anterior: 'anterior', apex: 'anterior', lateral: 'lateral', highLateral: 'highLateral', inferior: 'inferior', posterior: 'posterior', rvFreeWall: 'rv',
};
