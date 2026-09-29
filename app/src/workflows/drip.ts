/**
 * Infusion arithmetic (pure). Units are explicit in every name; rounding only at display.
 * Teaching helpers — always follow local concentration standards and independent double-checks.
 */
/** concentration in µg/mL from drug mass (mg) in a volume (mL) */
export const concMcgPerMl = (mg: number, ml: number) => (mg * 1000) / ml;
/** weight-based dose (µg/kg/min) → pump rate (mL/h) */
export const mlPerHour = (mcgKgMin: number, kg: number, mcgPerMl: number) => (mcgKgMin * kg * 60) / mcgPerMl;
/** pump rate (mL/h) → weight-based dose (µg/kg/min) */
export const mcgKgMin = (mlH: number, kg: number, mcgPerMl: number) => (mlH * mcgPerMl) / (kg * 60);
/** non-weight-based dose (µg/min) → mL/h */
export const mlPerHourFlat = (mcgMin: number, mcgPerMl: number) => (mcgMin * 60) / mcgPerMl;
/** volume to push for a bolus (mL) */
export const bolusMl = (mcg: number, mcgPerMl: number) => mcg / mcgPerMl;
/** dilution: take `drawMl` of stock at `stockMcgPerMl` into a syringe made up to `totalMl` → µg/mL */
export const dilute = (stockMcgPerMl: number, drawMl: number, totalMl: number) => (stockMcgPerMl * drawMl) / totalMl;
/** the classic slip: µg/min entered as µg/kg/min (or the reverse) — factor of error for a given weight */
export const unitSlipFactor = (kg: number) => kg;
