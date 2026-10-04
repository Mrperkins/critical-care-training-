/** Builds the simulator for a story, cell type and view — shared by the renderer and the tests. */
import { CellSim } from './sim';
import { slabShape, surfaceSites, slabSites } from './shapes';
import { CELL_DEFS } from './anatomy/shapes';
import type { Story, CellType, TransporterKind } from './model';

export type CellView = 'whole' | 'zoom';

/** Proteins along the membrane close-up (left → right). */
export function patchKinds(story: Story, type: CellType): TransporterKind[] {
  if (story === 'membrane') return type === 'cardiac' ? ['pump', 'kchan', 'nachan', 'nachan', 'cachan'] : type === 'neuron' ? ['pump', 'kchan', 'nachan', 'kchan', 'nachan'] : ['pump', 'kchan', 'pump', 'kchan'];
  return type === 'round' ? ['pump', 'aqp', 'vrac', 'aqp'] : ['pump', 'aqp', 'vrac', 'nachan', 'aqp'];
}
/** How many of each transporter stud the whole cell carries. */
function cellKinds(story: Story, type: CellType): [TransporterKind, number][] {
  if (story === 'membrane') return type === 'cardiac' ? [['pump', 12], ['kchan', 10], ['nachan', 10], ['cachan', 5]] : type === 'neuron' ? [['pump', 11], ['kchan', 10], ['nachan', 11]] : [['pump', 13], ['kchan', 13]];
  return type === 'round' ? [['pump', 8], ['aqp', 13], ['vrac', 6]] : [['pump', 8], ['aqp', 12], ['vrac', 6], ['nachan', 5]];
}

export function makeSim(story: Story, type: CellType, view: 'cell' | 'patch', seed = 11): CellSim {
  if (view === 'patch') return new CellSim(slabShape, { speed: 2.6, sigma: 0.9, mouth: 0.95, transit: 0.4, pumpCycle: 0.5, exchange: 2.5, flow: 1.6, sites: slabSites(patchKinds(story, type)), scale: 0.42 }, seed);
  const def = CELL_DEFS[type]; const [lo, hi] = def.siteBand;
  const sites = surfaceSites(def.shape, cellKinds(story, type), seed, (p) => p.y > lo && p.y < hi && Math.abs(def.sdf(p)) < 0.05 && (type !== 'neuron' || Math.hypot(p.x, p.z) < 2.0));
  return new CellSim(def.shape, { speed: 1.6, sigma: 0.6, mouth: 0.17, transit: 0.3, pumpCycle: 0.16, exchange: 5, flow: story === 'volume' ? 6 : 5, sites, scale: 1 }, seed);
}
