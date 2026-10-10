/** One shared cardiac clock drives both the ECG sweep and the 3D contraction. */
import { RR, T_P, T_QRS, T_TEND } from '../ecg/ecgModel';
import { useStudyClock } from '../../heart/studyClock';

let t = 0;
let last = performance.now();
let paused = false;
let linkedToHost = false;
/** Use the same SA-relative cycle as the main 3D cardiac model in embedded MI Locator. */
export function synchronizedMIClock(seconds: number, heartRate: number): number {
  const cycleSeconds = 60 / Math.max(20,heartRate);
  // Preserve absolute time and normalize the 190ms SA→mechanical offset.
  return (seconds + 0.19) * (RR / cycleSeconds) - 0.19;
}
export const clock = {
  get time() { return linkedToHost ? synchronizedMIClock(useStudyClock.getState().seconds,useStudyClock.getState().heartRate) : t; },
  tick(now = performance.now()) {
    if(linkedToHost) return this.time;
    const dt = Math.min(0.1, (now - last) / 1000); last = now; if (!paused) t += dt; return t;
  },
  setPaused(p: boolean) { paused = p; if(linkedToHost) { const st=useStudyClock.getState(); if (!st.enabled || st.running === p) st.set({enabled:true,running:!p}); } },
  followHost(v: boolean) { linkedToHost=v; last=performance.now(); },
  get followingHost() { return linkedToHost; },
};
const ss = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

/** Mechanical activation (0..1) for atria and ventricles at time t. Electrical events precede mechanical ones. */
export function mechanics(time: number) {
  const tb = ((time % RR) + RR) % RR;
  const atria = ss(T_P + 0.04, T_P + 0.11, tb) * (1 - ss(T_P + 0.14, T_P + 0.24, tb));
  const vent = ss(T_QRS + 0.04, T_QRS + 0.19, tb) * (1 - ss(T_TEND - 0.05, T_TEND + 0.1, tb));
  return { atria, vent, beat: tb };
}
