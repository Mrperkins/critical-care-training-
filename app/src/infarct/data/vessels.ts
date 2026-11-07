import type { CoronaryVessel, Dominance, VesselId } from './types';

export const VESSELS: CoronaryVessel[] = [
  { id: 'LM', name: 'Left main coronary artery', short: 'Left main', course: 'Leaves the left aortic sinus behind the pulmonary trunk and divides into the LAD and circumflex.', supplies: ['anterior', 'septum', 'lateral', 'apex', 'highLateral'], caliber: 1 },
  { id: 'LAD', name: 'Left anterior descending artery', short: 'LAD', parent: 'LM', course: 'Runs down the anterior interventricular groove toward the apex, often wrapping around it.', supplies: ['anterior', 'septum', 'apex'], caliber: 0.8, originAt: 1 },
  { id: 'D1', name: 'First diagonal branch', short: 'D1', parent: 'LAD', course: 'Crosses the anterolateral wall of the left ventricle.', supplies: ['highLateral', 'anterior'], caliber: 0.5, originAt: 0.15 },
  { id: 'D2', name: 'Second diagonal branch', short: 'D2', parent: 'LAD', course: 'Supplies the mid anterolateral wall.', supplies: ['anterior', 'lateral'], caliber: 0.42, originAt: 0.4 },
  { id: 'S1', name: 'First septal perforator', short: 'S1', parent: 'LAD', course: 'Dives from the LAD into the upper interventricular septum.', supplies: ['septum'], caliber: 0.34, originAt: 0.2 },
  { id: 'S2', name: 'Second septal perforator', short: 'S2', parent: 'LAD', course: 'Supplies the mid septum.', supplies: ['septum'], caliber: 0.3, originAt: 0.36 },
  { id: 'S3', name: 'Third septal perforator', short: 'S3', parent: 'LAD', course: 'Supplies the lower septum.', supplies: ['septum'], caliber: 0.26, originAt: 0.54 },
  { id: 'LCx', name: 'Left circumflex artery', short: 'LCx', parent: 'LM', course: 'Travels in the left atrioventricular groove around to the back of the heart.', supplies: ['lateral', 'highLateral', 'posterior'], caliber: 0.72, originAt: 1 },
  { id: 'OM1', name: 'First obtuse marginal branch', short: 'OM1', parent: 'LCx', course: 'Descends along the lateral wall of the left ventricle.', supplies: ['lateral', 'highLateral'], caliber: 0.48, originAt: 0.29 },
  { id: 'OM2', name: 'Second obtuse marginal branch', short: 'OM2', parent: 'LCx', course: 'Descends along the posterolateral wall.', supplies: ['lateral', 'posterior'], caliber: 0.42, originAt: 0.55 },
  { id: 'RCA', name: 'Right coronary artery', short: 'RCA', course: 'Leaves the right aortic sinus and runs in the right atrioventricular groove to the crux.', supplies: ['rvFreeWall', 'inferior', 'posterior'], caliber: 0.8 },
  { id: 'AM', name: 'Acute marginal branch (RV branch)', short: 'Acute marginal', parent: 'RCA', course: 'Crosses the right ventricular free wall.', supplies: ['rvFreeWall'], caliber: 0.44, originAt: 0.41 },
  { id: 'PDA', name: 'Posterior descending artery', short: 'PDA', course: 'Runs in the posterior interventricular groove from the crux toward the apex.', supplies: ['inferior', 'septum'], caliber: 0.5, originAt: 0.77, originAtLeft: 0.99 },
  { id: 'PLB', name: 'Posterolateral branch', short: 'PLB', course: 'Crosses the posterior (inferolateral) left ventricle beyond the crux.', supplies: ['posterior', 'inferior'], caliber: 0.44, originAt: 0.98, originAtLeft: 0.59 },
];

export const VESSEL: Record<VesselId, CoronaryVessel> = Object.fromEntries(VESSELS.map((v) => [v.id, v])) as Record<VesselId, CoronaryVessel>;

/** In ~80–85% of people the RCA gives the PDA (right dominance); in ~10% the LCx does. */
export const DOMINANCE_INFO: Record<Dominance, { name: string; text: string }> = {
  right: { name: 'Right dominant', text: 'The PDA and posterolateral branches arise from the RCA (about 80–85% of people).' },
  left: { name: 'Left dominant', text: 'The PDA and posterolateral branches arise from the circumflex (about 10% of people). An inferior MI may then be a circumflex occlusion.' },
};

export function parentOf(id: VesselId, dominance: Dominance): VesselId | undefined {
  if (id === 'PDA' || id === 'PLB') return dominance === 'right' ? 'RCA' : 'LCx';
  return VESSEL[id].parent;
}

/** All vessels downstream of (and including) a vessel, for the given dominance. */
export function downstream(id: VesselId, dominance: Dominance): VesselId[] {
  const out: VesselId[] = [id];
  let grew = true;
  while (grew) {
    grew = false;
    for (const v of VESSELS) {
      const p = parentOf(v.id, dominance);
      if (p && out.includes(p) && !out.includes(v.id)) { out.push(v.id); grew = true; }
    }
  }
  return out;
}

export type OriginTable = { right?: Partial<Record<VesselId, number>>; left?: Partial<Record<VesselId, number>> };

/** Branch origin along its parent. Measured asset origins (if supplied) take precedence over defaults. */
export function originOf(id: VesselId, dominance: Dominance, measured?: OriginTable): number {
  const v = VESSEL[id];
  if (dominance === 'left' && (id === 'PDA' || id === 'PLB')) return measured?.left?.[id] ?? v.originAtLeft ?? v.originAt ?? 0;
  return measured?.right?.[id] ?? v.originAt ?? 0;
}

/**
 * Vessels that lose flow when `id` is occluded at fraction `at`:
 * the occluded vessel itself (beyond `at`) and every branch that arises beyond it.
 */
export function ischemicBeyond(id: VesselId, at: number, dominance: Dominance, measured?: OriginTable): VesselId[] {
  const out: VesselId[] = [];
  for (const v of VESSELS) {
    if (parentOf(v.id, dominance) === id && originOf(v.id, dominance, measured) > at) out.push(...downstream(v.id, dominance));
  }
  return out;
}

/** Where the main vessels end in each dominance pattern (fraction of their full course). */
export const DOMINANCE_EXTENT: Record<Dominance, Partial<Record<VesselId, number>>> = {
  right: { LCx: 0.64 },
  left: { RCA: 0.62 },
};

/** The chain from the ostium to a vessel (for flow animation). */
export function upstream(id: VesselId, dominance: Dominance): VesselId[] {
  const chain: VesselId[] = [id];
  let p = parentOf(id, dominance);
  while (p) { chain.unshift(p); p = parentOf(p, dominance); }
  return chain;
}
