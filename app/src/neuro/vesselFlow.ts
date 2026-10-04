/** Per-vessel flow for drawing (3D tubes, CTA): pure function of the vascular state. */
import type { CerebralVessel } from './anatomy';
import { territoryFlow, type NeuroState } from './perfusion';

export type VesselFlow = Record<string, { up: number; down: number; clotT: number | null }>;
export function vesselPerfusion(vs: CerebralVessel[], st: NeuroState): VesselFlow {
  const reopened = st.recanalizedAt != null && st.minutes >= st.recanalizedAt;
  const tf = territoryFlow(st, !reopened); const byId = new Map(vs.map((v) => [v.id, v]));
  const occ = (id: string) => (reopened ? 0 : Math.min(1, st.occlusion[id] ?? 0));
  const blockedAbove = (v: CerebralVessel): boolean => !!v.parent && (occ(v.parent) > 0.05 || blockedAbove(byId.get(v.parent)!));
  // what reaches a vessel's territory: antegrade flow plus (drawn at half strength) retrograde collateral filling
  const refill = (v: CerebralVessel) => { if (!v.territory) return 1; const t = tf[v.territory];
    // a division occlusion only starves that division's branches
    if (v.territory.startsWith('MCA') && t.region !== 'all') { const div = t.region === 'sup' ? 'm2s' : 'm2i'; const mine = v.id.startsWith(div) || v.id.startsWith(div === 'm2s' ? 'm4s' : 'm4i'); if (!mine) return 1; }
    return Math.min(1, t.direct + 0.5 * t.collateral); };
  const out: Record<string, { up: number; down: number; clotT: number | null }> = {};
  for (const v of vs) {
    const o = occ(v.id); const inflow = blockedAbove(v) || (v.kind !== 'neck' && v.kind !== 'circle' && !!v.territory) ? refill(v) : 1;
    // circle vessels keep flowing (in whichever direction) unless they are themselves occluded
    const up = v.kind === 'circle' && !v.territory ? 1 : inflow;
    const sp = 1 - Math.min(0.95, st.spasm?.[v.id] ?? 0); // spasm narrows without a clot
    out[v.id] = o > 0.05 ? { up: v.kind === 'neck' || !v.parent ? 1 : Math.max(up, 0.9), down: v.territory ? refill(v) : 0.1, clotT: 0.35 } : { up: up * sp, down: up * sp, clotT: null };
  }
  return out;
}

