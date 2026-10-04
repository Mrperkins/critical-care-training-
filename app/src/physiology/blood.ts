/**
 * Blood chemistry: oxygen binding, oxygen content, and CO₂/acid–base.
 * Pure functions; every relationship here is a published equation and is unit-tested.
 */
export const PATM = 760;
export const PH2O = 47;
export const RQ = 0.8;

/** Severinghaus (1979) oxyhaemoglobin dissociation, standard conditions (P50 26.8). */
export function satStd(po2: number): number {
  const p = Math.max(0.1, po2);
  return 1 / (23400 / (p ** 3 + 150 * p) + 1);
}
/**
 * P50 shifted by pH (Bohr), temperature and 2,3-DPG. The Bohr coefficient
 * ∆log P50 / ∆pH ≈ −0.48; temperature ≈ +0.024 per °C.
 */
export function p50(pH = 7.4, tempC = 37, dpgFactor = 1): number {
  return 26.8 * 10 ** (-0.48 * (pH - 7.4) + 0.024 * (tempC - 37)) * dpgFactor;
}
/** Saturation (0–1) at a given PO₂ with a shifted curve. */
export function sat(po2: number, P50 = 26.8): number { return satStd(po2 * (26.8 / P50)); }
/** Inverse: PO₂ for a saturation (bisection). */
export function po2ForSat(s: number, P50 = 26.8): number {
  let lo = 0.5, hi = 800; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (sat(m, P50) < s) lo = m; else hi = m; } return (lo + hi) / 2;
}
/** Oxygen content, mL O₂ / dL blood. CaO₂ = 1.34 × Hb × SO₂ + 0.003 × PO₂. `cohb` = fraction of Hb bound to CO. */
export function o2Content(hb: number, so2: number, po2: number, cohb = 0): number {
  return 1.34 * hb * so2 * (1 - cohb) + 0.003 * po2;
}
/** Alveolar gas equation. */
export function alveolarPO2(fio2: number, paco2: number, patm = PATM): number {
  return Math.max(0, fio2 * (patm - PH2O) - paco2 / RQ + (1 - fio2) * 0 /* small correction term omitted */);
}

/* ---------------------------------------------------------------- acid–base */
const PK = 6.1, S_CO2 = 0.0307;
export const hh = (paco2: number, hco3: number) => PK + Math.log10(Math.max(0.1, hco3) / (S_CO2 * Math.max(0.5, paco2)));
export const hco3From = (paco2: number, pH: number) => S_CO2 * paco2 * 10 ** (pH - PK);

/**
 * Van Slyke equation (standard base excess, extracellular fluid, Hb 5 g/dL):
 *   SBE = 0.93 × (HCO₃⁻ − 24.4 + 14.8 × (pH − 7.4))
 * Given SBE (the metabolic state) and PaCO₂ (the respiratory state), solve for pH.
 * Because non-bicarbonate buffers are included, an acute rise in PaCO₂ raises
 * HCO₃⁻ by ~1 mEq/L per 10 mmHg — the classic "acute compensation" emerges.
 */
export function solveAcidBase(paco2: number, sbe: number): { pH: number; hco3: number } {
  let lo = 6.5, hi = 8.0;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2; const h = hco3From(paco2, m);
    const f = 0.93 * (h - 24.4 + 14.8 * (m - 7.4)) - sbe;
    if (f < 0) lo = m; else hi = m;
  }
  const pH = (lo + hi) / 2; return { pH, hco3: hco3From(paco2, pH) };
}
export const sbeOf = (pH: number, hco3: number) => 0.93 * (hco3 - 24.4 + 14.8 * (pH - 7.4));

/** [H⁺] in nmol/L. */
export const hPlus = (pH: number) => 10 ** (9 - pH);
