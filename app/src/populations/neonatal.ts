/**
 * Newborn transition on the two-circuit heart model (qs ≈ 0.6 L/min, SVR ≈ 60 Wood units → mean aortic
 * pressure ≈ 40 mmHg at term). The ductus arteriosus joins the pulmonary artery to the aorta BELOW the
 * right subclavian: blood crossing right-to-left reaches the legs, not the right hand. So in pulmonary
 * hypertension of the newborn (PPHN) the right hand (pre-ductal) is pinker than a foot (post-ductal).
 * PVR values are relative teaching numbers on the model's scale, not measurements.
 */
import type { ShuntInput } from '../heart/shunt';

const N = (p: Partial<ShuntInput>): ShuntInput => ({ lesion: 'pda', sizeMm: 4, pvr: 8, svr: 60, qs: 0.6, ...p });
export const NEO = {
  /** before the first breath: fluid-filled lungs, very high PVR — blood bypasses the lungs */ fetal: N({ sizeMm: 6, pvr: 140 }),
  /** first breaths: air and oxygen dilate the pulmonary vessels */ firstBreaths: N({ sizeMm: 5, pvr: 18 }),
  /** hours later: PVR low, ductus constricting */ closingDuct: N({ sizeMm: 2.5, pvr: 8 }),
  /** days later: ductus closed, two circuits in series */ closed: N({ lesion: 'none', sizeMm: 0, pvr: 6 }),
  /** PVR fails to fall */ pphn: N({ sizeMm: 4, pvr: 80 }),
  /** hypoxia, acidosis, cold: PVR climbs further */ pphnWorse: N({ sizeMm: 4, pvr: 110 }),
  /** oxygen, gentle ventilation to normal CO₂, surfactant, inhaled nitric oxide */ pphnTreated: N({ sizeMm: 4, pvr: 22 }),
  /** a failing right heart raises right-atrial pressure: right-to-left at the foramen ovale too */ pphnAtrial: N({ lesion: 'pfo', sizeMm: 4, pvr: 80, raLoad: 5 }),
} satisfies Record<string, ShuntInput>;

/** Pre-ductal (right-hand) SpO₂ targets in the first ten minutes after birth, % (NRP / ILCOR teaching table). */
export const NEO_SPO2_TARGETS: { min: number; lo: number; hi: number }[] = [
  { min: 1, lo: 60, hi: 65 }, { min: 2, lo: 65, hi: 70 }, { min: 3, lo: 70, hi: 75 }, { min: 4, lo: 75, hi: 80 }, { min: 5, lo: 80, hi: 85 }, { min: 10, lo: 85, hi: 95 },
];
/** Target band at a minute after birth (linear between the table points). */
export function neoTarget(min: number): { lo: number; hi: number } {
  const T = NEO_SPO2_TARGETS; if (min <= T[0].min) return T[0]; if (min >= T[T.length - 1].min) return T[T.length - 1];
  for (let i = 1; i < T.length; i++) if (min <= T[i].min) { const u = (min - T[i - 1].min) / (T[i].min - T[i - 1].min); return { lo: T[i - 1].lo + u * (T[i].lo - T[i - 1].lo), hi: T[i - 1].hi + u * (T[i].hi - T[i - 1].hi) }; }
  return T[T.length - 1];
}
