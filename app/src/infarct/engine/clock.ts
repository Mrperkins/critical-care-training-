/**
 * One cardiac clock drives the MI Locator's ECG sweep, the 3D contraction and the conduction wavefront.
 * It is advanced once per frame by the MI Locator view itself (not by the 3D canvas), so the ECG keeps running and
 * stays in phase whether or not the heart canvas is mounted, and nothing advances it twice.
 */
import { RR, T_P, T_QRS, T_TEND } from '../ecg/ecgModel';

let t = 0;
let paused = false;
export const clock = {
  get time() { return t; },
  get paused() { return paused; },
  /** advance by real seconds (clamped so a background tab cannot jump the beat) */
  advance(dt: number) { if (!paused && Number.isFinite(dt)) t += Math.max(0, Math.min(0.1, dt)); return t; },
  setPaused(p: boolean) { paused = p; },
  /** for tests and deterministic screenshots */
  seek(seconds: number) { t = seconds; },
};
const ss = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

/** Mechanical activation (0..1) for atria and ventricles at time t. Electrical events precede mechanical ones. */
export function mechanics(time: number) {
  const tb = ((time % RR) + RR) % RR;
  const atria = ss(T_P + 0.04, T_P + 0.11, tb) * (1 - ss(T_P + 0.14, T_P + 0.24, tb));
  const vent = ss(T_QRS + 0.04, T_QRS + 0.19, tb) * (1 - ss(T_TEND - 0.05, T_TEND + 0.1, tb));
  return { atria, vent, beat: tb };
}

/**
 * The SA node fires 50 ms into each modelled beat, as the P wave begins; His activation (117 ms after SA in
 * heart-internals.glb's activation map) lands at ~167 ms and the Purkinje network finishes by ~236 ms, inside the
 * QRS the ECG model draws (180–270 ms).
 */
export const SA_AT = 0.05;
/** milliseconds since the SA node last fired, for the conduction wavefront */
export function msSinceSA(time: number) {
  const tb = ((time % RR) + RR) % RR; const ms = (tb - SA_AT) * 1000;
  return ms < 0 ? ms + RR * 1000 : ms;
}
