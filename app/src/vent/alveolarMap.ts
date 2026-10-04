/**
 * Alveolar close-up: a pure READ of the running VentSession. Nothing here models physiology —
 * it maps the numbers the ventilator engine and the shared SyntheticPatient already compute
 * (regional volume, open fraction, transpulmonary pressure, overdistension, pleural collapse,
 * shunt, low-V/Q fraction, end-capillary contents) onto a small cluster of drawn alveoli.
 *
 * Each drawn unit has a dependency rank (0 = least dependent, 1 = most dependent). Collapse
 * fills from the most dependent unit upward, flooding sits in the dependent open units, low-V/Q
 * units sit next to them and overdistension appears in the least dependent units — the same
 * gravitational ordering the 3D lungs use.
 */
import type { VentSession } from './session';

export type UnitKind = 'open' | 'lowvq' | 'flooded' | 'collapsed';
export interface AlveolarUnitState {
  /** 0 = fully aerated, 1 = fully collapsed (continuous, so recruitment animates) */
  collapse: number;
  /** 0–1 fluid fill (edema / exudate) */
  flood: number;
  /** 0–1 reduced ventilation relative to perfusion */
  lowvq: number;
  /** 0–1 overdistension */
  over: number;
  /** display kind for labels / focus targets */
  kind: UnitKind;
  /** end-capillary O₂ saturation of blood leaving this unit */
  endSat: number;
}
export interface AlveolarState {
  units: AlveolarUnitState[];
  /** mean inflation (drawn radius scale, 1 = FRC-ish), live through each breath */
  inflate: number;
  /** interstitial thickening 0–1 (stiff / wet lung) */
  wet: number;
  /** surfactant function 0–1 (1 = normal) */
  surfactant: number;
  /** fraction of the region that is collapsed / flooded (for readouts) */
  collapsedFrac: number; floodFrac: number; lowvqFrac: number;
  shunt: number; svo2: number; ccNormal: number; ccLow: number; sao2: number;
  pAO2: number; pvo2: number; paco2: number; peep: number; ptp: number;
}

export const DEPENDENCY_RANKS = (n: number) => Array.from({ length: n }, (_, i) => (i + 0.5) / n);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Share of cardiac output each lung receives (right, left) — matches VentSession.updateGasParams. */
const PERF = [0.55, 0.45];
/** Functional residual capacity per lung, L — matches LungScene. */
const FRC = [1.3, 1.1];

/**
 * @param ranks dependency rank of each drawn unit (0–1). Order is preserved in the result.
 */
export function alveolarState(S: VentSession, ranks: number[]): AlveolarState {
  const m = S.m; const reg = m.regional(); const sc = S.sc; const snap = S.snap; const p = S.pt.p;
  // regional collapse: recruitable units that are shut, lung compressed by pleural air, or lung disconnected (plug → absorption)
  let collapsedFrac = 0, ptp = 0, over = 0, wsum = 0, vol = 0;
  for (let k = 0; k < 2; k++) {
    const r = reg[k]; const w = PERF[k];
    const unvent = Math.max(0, 1 - S.share[k] / w) * 0.55; // lung that is perfused but not ventilated (plug, compressed lung) — as in updateGasParams
    const col = Math.max(1 - r.open, r.collapsed * 0.95, r.connected ? 0 : 0.85, unvent);
    collapsedFrac += w * col;
    const live = (1 - r.collapsed) * (r.connected ? 1 : 0);
    ptp += w * r.ptp * live; vol += w * Math.cbrt(Math.max(0.2, (FRC[k] + r.volume) / FRC[k])) * live; over += w * Math.min(1, r.overdist / 6) * live; wsum += w * live;
  }
  ptp = wsum > 0 ? ptp / wsum : 0; vol = wsum > 0 ? vol / wsum : 1; over = wsum > 0 ? over / wsum : 0;
  // flooded / consolidated alveoli: the part of the scenario's fixed shunt above normal, in wet (low-compliance, recruitable) lungs
  const wetLung = (sc.lung.recruitable ?? 0) > 0 && (sc.lung.cFactor ?? 1) < 1;
  const baseShunt = sc.gas.shunt ?? 0.03;
  const floodFrac = wetLung ? clamp01((baseShunt - 0.03) * 2.6) : 0;
  const lowvqFrac = clamp01(p.lowVQ);
  const wet = wetLung ? clamp01(1 - (sc.lung.cFactor ?? 1)) : 0;
  const surfactant = wetLung ? clamp01(0.25 + (sc.lung.cFactor ?? 1) * 0.6) : 1;

  const n = ranks.length;
  // order: most dependent first
  const order = ranks.map((d, i) => ({ d, i })).sort((a, b) => b.d - a.d);
  const units: AlveolarUnitState[] = ranks.map(() => ({ collapse: 0, flood: 0, lowvq: 0, over: 0, kind: 'open', endSat: snap.ccNormal }));
  const nCol = collapsedFrac * n; const nFlood = floodFrac * n; const nLow = lowvqFrac * n;
  order.forEach(({ i }, j) => {
    const u = units[i];
    u.collapse = clamp01(nCol - j);
    // flooded units sit just above the collapsed ones (continuous so the fill level animates)
    const jf = j - Math.floor(nCol);
    u.flood = jf >= 0 ? clamp01(nFlood - jf) * (1 - u.collapse) : 0;
    const jl = jf - Math.ceil(nFlood);
    u.lowvq = jl >= 0 ? clamp01(nLow - jl) : 0;
    u.over = over * clamp01(1 - (j / Math.max(1, n - 1)) * 2.2) * (1 - u.collapse);
    u.kind = u.collapse > 0.5 ? 'collapsed' : u.flood > 0.5 ? 'flooded' : u.lowvq > 0.5 ? 'lowvq' : 'open';
    // blood leaving a shunt unit keeps its mixed-venous saturation; low V/Q units reach the model's low-V/Q end-capillary value
    const shuntW = Math.max(u.collapse, u.flood);
    const aer = snap.ccNormal + (snap.ccLow - snap.ccNormal) * u.lowvq;
    u.endSat = aer + (snap.svo2 - aer) * shuntW;
  });
  // inflation: regional gas volume (PEEP holds it up; each breath adds to it), same scaling as the whole-lung view
  const inflate = 0.9 + (vol - 1) * 2.2;
  return {
    units, inflate, wet, surfactant, collapsedFrac: clamp01(collapsedFrac), floodFrac, lowvqFrac,
    shunt: p.shunt, svo2: snap.svo2, ccNormal: snap.ccNormal, ccLow: snap.ccLow, sao2: snap.sao2,
    pAO2: snap.pAO2, pvo2: snap.pvo2, paco2: snap.paco2, peep: m.s.peep, ptp,
  };
}
