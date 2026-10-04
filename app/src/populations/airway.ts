/**
 * Airway calibre and resistance (pure physics). Laminar flow (Hagen–Poiseuille): R ∝ 1 / r⁴.
 * Turbulent flow (crying, high flow): pressure drop ∝ 1 / r⁵ at the same flow.
 * Classic comparison: 1 mm of circumferential swelling in a 4 mm infant airway vs an 8 mm adult airway.
 */
export const resistanceRatio = (dBefore: number, dAfter: number, turbulent = false) => (dBefore / Math.max(0.01, dAfter)) ** (turbulent ? 5 : 4);
/** Diameter left after `swellMm` of swelling all the way round. */
export const afterSwelling = (d: number, swellMm: number) => Math.max(0, d - 2 * swellMm);
export interface AirwayCompare { label: string; d: number; swollen: number; laminar: number; turbulent: number; areaLeft: number }
export function compareAirways(swellMm = 1): AirwayCompare[] {
  return [{ label: 'Infant', d: 4 }, { label: 'Adult', d: 8 }].map(({ label, d }) => {
    const s = afterSwelling(d, swellMm);
    return { label, d, swollen: s, laminar: resistanceRatio(d, s), turbulent: resistanceRatio(d, s, true), areaLeft: (s / d) ** 2 };
  });
}
/** Endotracheal tube internal diameters used to show the effect on the ventilator (reference 8.0 mm). */
export const ETT_SIZES = [8, 7, 6] as const;
