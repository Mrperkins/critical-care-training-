/**
 * Cerebral perfusion primitives — pure functions, no hidden state, deterministic in time so a
 * lesson can seek to any minute. Systemic inputs (MAP, PaCO₂, SaO₂) are passed in from the one
 * shared patient; this file only turns them plus the vascular state into territory blood flow and
 * tissue fate. Teaching approximations (documented, not patient-specific):
 *  - normal CBF ≈ 50 mL/100 g/min; below ~20 neurons stop firing (penumbra), below ~10 they die
 *    within minutes (core). Tissue between 10 and 20 survives for a time that shrinks as flow falls
 *    (τ ≈ 20 min at CBF 8, ≈ 70 min at 12, ≈ 5 h at 17).
 *  - Circle of Willis collaterals (ACoA, PCoA) and leptomeningeal collaterals refill a territory
 *    from its border inward; collateral flow is pressure-passive (∝ MAP) because ischaemic
 *    vessels have lost autoregulation.
 *  - CO₂ reactivity ≈ 3 %/mmHg around 40 mmHg; autoregulation keeps normal tissue flat for MAP 60–150.
 */
import { TERRITORIES, TERRITORY_ML, type TerritoryId } from './anatomy';

export type CollateralGrade = 'poor' | 'moderate' | 'good';
export interface NeuroState {
  /** fractional occlusion per vessel id (1 = complete) */
  occlusion: Record<string, number>;
  /** minutes since occlusion onset */
  minutes: number;
  /** minute at which flow was restored (thrombectomy / lysis); null = still occluded */
  recanalizedAt: number | null;
  collaterals: CollateralGrade;
  /** anatomical variants: hypoplastic communicating arteries */
  variants?: { acomHypoplastic?: boolean; pcomHypoplastic?: { R?: boolean; L?: boolean }; fetalPCA?: { R?: boolean; L?: boolean } };
  hemorrhage?: Hemorrhage | null;
  /** vasospasm: fractional narrowing per vessel id (after SAH); unlike a clot it is not removed by recanalization */
  spasm?: Record<string, number>;
}
export interface Hemorrhage { kind: 'ich' | 'sah'; /** local brain coordinates */ at: [number, number, number]; volumeMl: number }
export interface Systemic { map: number; paco2: number; sao2: number; icp?: number }
export const DEFAULT_SYSTEMIC: Systemic = { map: 90, paco2: 40, sao2: 0.98, icp: 10 };
export const emptyNeuro = (): NeuroState => ({ occlusion: {}, minutes: 0, recanalizedAt: null, collaterals: 'moderate', hemorrhage: null });

const LEPTO: Record<CollateralGrade, number> = { poor: 0.2, moderate: 0.45, good: 0.7 };
export const CBF_NORMAL = 50, CBF_PENUMBRA = 20, CBF_CORE = 10;

export interface TerritoryFlow {
  direct: number; collateral: number;
  /** fraction of the territory downstream of the lowest occlusion, and which part (MCA divisions) */
  affected: number; region: 'all' | 'sup' | 'inf';
}
/** Fraction of normal inflow reaching each territory (direct antegrade vs collateral). Pure graph logic. */
export function territoryFlow(st: NeuroState, occluded = true): Record<TerritoryId, TerritoryFlow> {
  const p = (id: string) => (occluded ? 1 - Math.min(1, st.occlusion[id] ?? 0) : 1) * (1 - Math.min(0.95, st.spasm?.[id] ?? 0));
  const v = st.variants ?? {};
  const acom = v.acomHypoplastic ? 0.15 : 0.85;
  const pcom = (S: 'R' | 'L') => (v.pcomHypoplastic?.[S] ? 0.08 : 0.45);
  // supply at the vertebrobasilar tip and each ICA terminus
  const vb = Math.min(1, 0.62 * (p('vert_R') + p('vert_L'))) * p('basilar');
  const ica = { R: p('ica_R'), L: p('ica_L') };
  const out = {} as Record<TerritoryId, TerritoryFlow>;
  // ICA terminus can be refilled through ACoA (from the other ICA) and PCoA (from the basilar)
  const term = { R: 0, L: 0 };
  for (let it = 0; it < 3; it++) (['R', 'L'] as const).forEach((S) => {
    const O = S === 'R' ? 'L' : 'R';
    const viaA = Math.max(ica[O], term[O] * 0.9) * p(`a1_${O}`) * p(`a1_${S}`) * p('acom') * acom;
    const viaP = vb * p(`p1_${S}`) * p(`pcom_${S}`) * pcom(S);
    term[S] = Math.max(ica[S], Math.min(1, viaA + viaP));
  });
  (['R', 'L'] as const).forEach((S) => {
    const O = S === 'R' ? 'L' : 'R'; const lepto = LEPTO[st.collaterals];
    // ACA: own A1, or across the ACoA from the other side
    const acaDirect = Math.max(term[S] * p(`a1_${S}`), term[O] * p(`a1_${O}`) * p('acom') * acom) * p(`a2_${S}`);
    // PCA: basilar via P1, or the carotid via PCoA (fetal PCA gets most of its flow this way)
    const fetal = v.fetalPCA?.[S] ? 0.95 : pcom(S) * 1.2;
    const pcaDirect = Math.max(vb * p(`p1_${S}`), term[S] * p(`pcom_${S}`) * fetal) * p(`p2_${S}`);
    out[`ACA_${S}`] = { direct: Math.min(1, acaDirect), collateral: lepto * 0.6 * Math.max(0, 1 - acaDirect), affected: 1, region: 'all' };
    out[`PCA_${S}`] = { direct: Math.min(1, pcaDirect), collateral: lepto * 0.6 * Math.max(0, 1 - pcaDirect), affected: 1, region: 'all' };
    // MCA: a trunk (ICA/M1) occlusion affects the whole territory; a division (M2) occlusion only its part.
    // Leptomeningeal collaterals come from ACA and PCA pial arteries (and the other division) across the border zone.
    const trunk = term[S] * p(`m1_${S}`); const sup = p(`m2s_${S}`), inf = p(`m2i_${S}`); const pial = (acaDirect + pcaDirect) / 2;
    if (trunk < 0.95 || (sup < 0.95 && inf < 0.95)) {
      const d = trunk * (0.55 * sup + 0.45 * inf);
      out[`MCA_${S}`] = { direct: Math.min(1, d), collateral: lepto * pial * Math.max(0, 1 - d), affected: 1, region: 'all' };
    } else if (sup < 0.95 || inf < 0.95) {
      const isSup = sup < inf; const d = trunk * Math.min(sup, inf);
      out[`MCA_${S}`] = { direct: d, collateral: lepto * (0.5 * pial + 0.5 * trunk) * Math.max(0, 1 - d), affected: isSup ? 0.55 : 0.45, region: isSup ? 'sup' : 'inf' };
    } else out[`MCA_${S}`] = { direct: Math.min(1, trunk), collateral: 0, affected: 1, region: 'all' };
  });
  // posterior fossa: pial cerebellar collaterals plus retrograde filling of the upper basilar through the PCoAs
  const retro = Math.max(term.R * p('pcom_R') * pcom('R'), term.L * p('pcom_L') * pcom('L'));
  out.VB = { direct: vb, collateral: (LEPTO[st.collaterals] * 0.5 + 0.25 * retro) * Math.max(0, 1 - vb), affected: 1, region: 'all' };
  return out;
}

/** Global scaling of CBF by CO₂, oxygen and perfusion pressure. `ischaemic` tissue is pressure-passive. */
export function systemicFactor(sys: Systemic, ischaemic: boolean) {
  const cpp = sys.map - (sys.icp ?? 10);
  const co2 = Math.max(0.45, Math.min(1.9, 1 + 0.03 * (sys.paco2 - 40)));
  const hypox = sys.sao2 < 0.9 ? 1 + (0.9 - sys.sao2) * 2.5 : 1;
  const auto = ischaemic ? cpp / 80 : cpp < 50 ? cpp / 50 : cpp > 140 ? 1 + (cpp - 140) / 100 : 1;
  return Math.max(0, co2 * hypox * auto);
}

/** Minutes for tissue at a given CBF to infarct (Infinity when above the penumbral threshold). */
export function timeToInfarct(cbf: number) {
  if (cbf >= CBF_PENUMBRA) return Infinity; if (cbf < CBF_CORE * 0.3) return 3;
  return 20 * Math.exp((cbf - 8) / 3.2);
}

export type TissueClass = 'normal' | 'oligemia' | 'penumbra' | 'core';
export interface TerritoryState {
  id: TerritoryId; flow: TerritoryFlow;
  /** CBF (mL/100 g/min) at the territory's deepest point and at its collateral-fed border */
  cbfDeep: number; cbfBorder: number;
  /** periphery (0 deep → 1 border) inside which tissue is core / penumbra — the scene shades by these */
  coreW: number; penW: number;
  coreMl: number; penumbraMl: number;
}
const SAMPLES = 60;
/** CBF across a territory: deepest tissue gets only antegrade flow; the border also gets collaterals. */
export const cbfAt = (t: TerritoryState | { cbfDeep: number; cbfBorder: number }, w: number) => t.cbfDeep + (t.cbfBorder - t.cbfDeep) * Math.pow(w, 0.6);

export function territoryStates(st: NeuroState, sys: Systemic = DEFAULT_SYSTEMIC): Record<TerritoryId, TerritoryState> {
  const reopened = st.recanalizedAt != null && st.minutes >= st.recanalizedAt;
  const ischaemicMinutes = reopened ? st.recanalizedAt! : st.minutes;
  const during = territoryFlow(st, true); const now = reopened ? territoryFlow(st, false) : during;
  const out = {} as Record<TerritoryId, TerritoryState>;
  for (const id of TERRITORIES) {
    const f = during[id]; const isch = f.direct < 0.95;
    const deep = CBF_NORMAL * f.direct * systemicFactor(sys, false);
    const border = CBF_NORMAL * Math.min(1, f.direct + f.collateral) * (isch ? (f.direct * systemicFactor(sys, false) + f.collateral * systemicFactor(sys, true)) / Math.max(1e-6, f.direct + f.collateral) : systemicFactor(sys, false));
    const t0 = { cbfDeep: deep, cbfBorder: Math.max(deep, border) };
    // tissue fate: core where it infarcted during the ischaemic interval; penumbra where still at risk (only while occluded)
    let core = 0, pen = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const w = (i + 0.5) / SAMPLES; const c = cbfAt(t0, w);
      if (ischaemicMinutes >= timeToInfarct(c)) core++;
      else if (!reopened && c < CBF_PENUMBRA) pen++;
    }
    // w-samples are equal steps from the deepest point outward; tissue volume grows ∝ w² (a territory is a
    // flattened wedge, not a sphere), so the border holds most of the tissue
    const shell = (a: number, b: number) => (b ** 2 - a ** 2);
    const coreW = core / SAMPLES, penW = (core + pen) / SAMPLES; const ml = TERRITORY_ML[id] * f.affected;
    const cur = now[id];
    out[id] = {
      id, flow: cur,
      cbfDeep: reopened ? CBF_NORMAL * cur.direct * systemicFactor(sys, false) : t0.cbfDeep,
      cbfBorder: reopened ? CBF_NORMAL * Math.min(1, cur.direct + cur.collateral) * systemicFactor(sys, false) : t0.cbfBorder,
      coreW, penW, coreMl: ml * shell(0, coreW), penumbraMl: ml * shell(coreW, penW),
    };
  }
  return out;
}

/**
 * Haematoma expansion (ICH): most growth happens in the first hours and more of it at high systolic
 * pressure. Teaching approximation: V(t) = V₀ · (1 + g · (1 − e^(−t/90))), g = 0.08 + 0.45 · clamp((SBP − 140)/80).
 * SBP is estimated from MAP (≈ MAP × 1.45). SAH volume is taken as given.
 */
export const sbpOf = (sys: Systemic) => sys.map * 1.45;
export function hemorrhageVolume(h: Hemorrhage, minutes: number, sys: Systemic = DEFAULT_SYSTEMIC) {
  if (h.kind !== 'ich') return h.volumeMl;
  const g = 0.08 + 0.45 * Math.max(0, Math.min(1, (sbpOf(sys) - 140) / 80));
  return h.volumeMl * (1 + g * (1 - Math.exp(-Math.max(0, minutes) / 90)));
}
export function effectiveHemorrhage(st: NeuroState, sys: Systemic = DEFAULT_SYSTEMIC): Hemorrhage | null {
  return st.hemorrhage ? { ...st.hemorrhage, volumeMl: hemorrhageVolume(st.hemorrhage, st.minutes, sys) } : null;
}

/** Hemorrhage geometry and a first-order mass-effect estimate (ABC/2 volume → sphere). */
export function hemorrhageShape(h: Hemorrhage) {
  const rCm = Math.cbrt((3 * h.volumeMl) / (4 * Math.PI));
  // midline shift rises steeply once volume passes ~30 mL; teaching approximation, capped
  const shiftMm = h.kind === 'ich' ? Math.min(15, Math.max(0, (h.volumeMl - 10) * 0.22)) : 0;
  return { rCm, shiftMm };
}

/** Summary used by HUDs / lessons. */
export function neuroSummary(st: NeuroState, sys: Systemic = DEFAULT_SYSTEMIC) {
  const t = territoryStates(st, sys); const all = Object.values(t);
  const coreMl = all.reduce((a, x) => a + x.coreMl, 0), penumbraMl = all.reduce((a, x) => a + x.penumbraMl, 0);
  return { territories: t, coreMl, penumbraMl, mismatch: coreMl > 0.5 ? (coreMl + penumbraMl) / coreMl : penumbraMl > 0 ? Infinity : 1 };
}
