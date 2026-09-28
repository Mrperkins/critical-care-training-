/** Live state shared between the 3D scene (writes, every frame) and the HUD (reads, ~7×/s). */
import type { CellModel, Focus } from './model';
import type { CellSim } from './sim';

export const live = {
  model: null as CellModel | null,
  cell: null as CellSim | null,
  patch: null as CellSim | null,
  /** membrane potential trace: sim time (s) and mV, ring buffer */
  trace: { t: new Float32Array(600), v: new Float32Array(600), i: 0, n: 0 },
  /** current membrane potential (mV) including the action potential */
  vm: -83,
};

/** Cardiac action potential shape after a beat: upstroke, plateau, repolarisation back to rest. */
export function actionPotential(tSince: number, rmp: number, strength: number): number {
  if (strength <= 0.02 || tSince < 0) return rmp;
  const peak = rmp + (30 - rmp) * strength; // ~+30 mV overshoot when healthy, blunted when Na⁺ channels are inactivated
  const plateau = rmp + (10 - rmp) * strength * 0.95;
  if (tSince < 0.012) return rmp + (peak - rmp) * (tSince / 0.012);
  if (tSince < 0.05) return peak + (plateau - peak) * ((tSince - 0.012) / 0.038);
  if (tSince < 0.22) return plateau - 6 * ((tSince - 0.05) / 0.17);
  if (tSince < 0.34) { const u = (tSince - 0.22) / 0.12; return plateau - 6 + (rmp - plateau + 6) * (u * u * (3 - 2 * u)); }
  return rmp;
}

export function resolveFocus(m: CellModel | null, step: number, chip: Focus | null): Focus {
  if (chip) return chip; if (!m || !m.chain.length) return { kind: 'none' };
  return m.chain[((step % m.chain.length) + m.chain.length) % m.chain.length].focus;
}

/** Neuronal action potential (drawn ~10× slower than life so it can be seen): fast upstroke, overshoot, after-hyperpolarisation. */
export function neuronSpike(tSince: number, rmp: number, strength: number): number {
  if (strength <= 0.02 || tSince < 0) return rmp;
  const peak = rmp + (35 - rmp) * strength;
  if (tSince < 0.01) return rmp + (peak - rmp) * (tSince / 0.01);
  if (tSince < 0.035) { const u = (tSince - 0.01) / 0.025; return peak + (rmp - 10 * strength - peak) * u; }
  if (tSince < 0.12) { const u = (tSince - 0.035) / 0.085; return rmp - 10 * strength * (1 - u * u * (3 - 2 * u)); }
  return rmp;
}
