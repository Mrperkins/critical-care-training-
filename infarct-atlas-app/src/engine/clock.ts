/** One shared cardiac clock drives both the ECG sweep and the 3D contraction. */
import { RR, T_P, T_QRS, T_TEND } from '../ecg/ecgModel';

let t = 0;
let last = performance.now();
let paused = false;
export const clock = {
  get time() { return t; },
  tick(now = performance.now()) { const dt = Math.min(0.1, (now - last) / 1000); last = now; if (!paused) t += dt; return t; },
  setPaused(p: boolean) { paused = p; },
};
const ss = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

/** Mechanical activation (0..1) for atria and ventricles at time t. Electrical events precede mechanical ones. */
export function mechanics(time: number) {
  const tb = ((time % RR) + RR) % RR;
  const atria = ss(T_P + 0.04, T_P + 0.11, tb) * (1 - ss(T_P + 0.14, T_P + 0.24, tb));
  const vent = ss(T_QRS + 0.04, T_QRS + 0.19, tb) * (1 - ss(T_TEND - 0.05, T_TEND + 0.1, tb));
  return { atria, vent, beat: tb };
}
