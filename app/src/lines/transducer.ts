/**
 * Fluid-filled pressure-monitoring system: catheter → tubing → stopcock → transducer.
 *
 * Dynamic response is a second-order system (natural frequency fn, damping coefficient ζ):
 *   x'' + 2ζω x' + ω² x = ω² u,  ω = 2π fn
 * so an underdamped system overshoots and rings, an overdamped one blunts — and the fast-flush
 * (square-wave) test shows the same ringing. Static errors add on top:
 *   hydrostatic  (axis height − transducer height) × 0.736 mmHg per cm of saline
 *   zero offset  (what was captured when "zero" was pressed, vs the transducer's own drift)
 */
export type Fault = 'none' | 'longTubing' | 'smallBubble' | 'largeBubble' | 'clot' | 'kink' | 'wall' | 'lowBag' | 'openAir' | 'disconnect' | 'migrated' | 'drift';
export type Stopcock = 'patient' | 'air';

export const FAULTS: Record<Fault, { name: string; short: string; line: 'both' | 'art' | 'cvp'; what: string; fix: string; sign: string }> = {
  none: { name: 'No fault', short: 'None', line: 'both', what: 'Short, stiff, bubble-free tubing and a fully inflated bag.', fix: '', sign: '' },
  longTubing: { name: 'Long / compliant tubing and extra stopcocks', short: 'Long tubing', line: 'both', what: 'Extension sets and stopcocks lower the natural frequency until it sits close to the harmonics of the pulse.', fix: 'Use one short (< 120 cm), non-compliant pressure line with the fewest stopcocks.', sign: 'Underdamped: systolic overshoot "spike", ringing; SBP reads high, DBP low, MAP right. Square wave > 2 oscillations.' },
  smallBubble: { name: 'Small air bubble in the line', short: 'Small bubble', line: 'both', what: 'A tiny bubble is compliant: it lowers the natural frequency sharply while adding little damping.', fix: 'Turn the stopcock off to the patient and flush the bubble out of the side port to waste (or aspirate it); never flush air toward the patient.', sign: 'Underdamped / resonant: exaggerated systolic peak and ringing.' },
  largeBubble: { name: 'Large air bubble', short: 'Large bubble', line: 'both', what: 'A big bubble absorbs the pressure pulse.', fix: 'Stopcock off to the patient; aspirate / flush the air out of the side port to waste; re-prime the line if needed.', sign: 'Overdamped: blunted slurred waveform, no dicrotic notch; SBP low, DBP high, MAP right. Square wave < 1.5 oscillations.' },
  clot: { name: 'Clot at the catheter tip', short: 'Clot', line: 'both', what: 'Partial occlusion of the catheter lumen.', fix: 'Aspirate the clot (never flush it forward into the artery), then flush. Replace the catheter if it will not clear.', sign: 'Overdamped, and it gets worse; blood hard to draw back.' },
  kink: { name: 'Kinked catheter or tubing', short: 'Kink', line: 'both', what: 'A kink (often a flexed wrist) narrows the lumen.', fix: 'Straighten the tubing; splint the wrist in slight extension.', sign: 'Overdamped; may vary with arm position.' },
  wall: { name: 'Catheter tip against the vessel wall', short: 'Tip on wall', line: 'art', what: 'The tip intermittently abuts the arterial wall (positional).', fix: 'Reposition the limb or withdraw the catheter slightly; splint.', sign: 'Intermittent damping that comes and goes with position or breathing.' },
  lowBag: { name: 'Pressure bag under-inflated', short: 'Low bag', line: 'both', what: 'Bag at 90 mmHg — below arterial systolic — so blood backs up into the tubing and the continuous flush (≈ 3 mL/h) stops.', fix: 'Inflate the pressure bag to 300 mmHg and flush the blood out of the line.', sign: 'Blood in the tubing, progressive damping, and the flush square wave only reaches the bag pressure.' },
  openAir: { name: 'Stopcock left open to air', short: 'Open stopcock', line: 'both', what: 'After a blood draw the sampling port was left uncapped with the stopcock off to the patient and open to air: the transducer reads atmosphere. (Left open toward the patient instead, blood runs out or air is drawn in.)', fix: 'Cap the port and turn the stopcock back to the patient; check for blood loss. If a central-line port was open to the patient: clamp, lie the patient left side down and head-down, give 100 % O₂ (air embolism).', sign: 'Flat line near 0 mmHg — a disconnection alarm. Look at the patient and the line before believing a pressure of zero.' },
  disconnect: { name: 'Line disconnected at the hub', short: 'Disconnect', line: 'both', what: 'The tubing has separated from the catheter.', fix: 'Occlude the hub and stop the bleeding (arterial!). The set is contaminated: attach a new sterile set (or at least disinfect), aspirate, then flush. On a central line treat it as a possible air embolism.', sign: 'Flat trace near 0; arterial disconnection can exsanguinate a patient in minutes.' },
  migrated: { name: 'CVP catheter tip migrated into the RV', short: 'Tip in RV', line: 'cvp', what: 'The catheter has advanced through the tricuspid valve.', fix: 'Notify the provider; stop vasoactive infusions through that lumen if the tip position is in doubt; chest X-ray; the provider withdraws the tip to the cavo-atrial junction. Watch for ectopy.', sign: 'Waveform becomes ventricular: systolic ≈ 25 mmHg, diastolic near 0, plus ectopic beats.' },
  drift: { name: 'Zero offset (new transducer / cable reconnected, not zeroed)', short: 'Not zeroed', line: 'both', what: 'The transducer or its cable was changed or reconnected and not zeroed, so it carries an electrical offset. (Moving the transducer calls for re-LEVELLING, not re-zeroing.)', fix: 'Turn the stopcock off to the patient, open to air, zero, and close.', sign: 'Whole waveform shifted by the same amount; shape is normal.' },
};

/** Natural frequency (Hz) and damping coefficient for each physical state of the line. */
export function dynamics(f: Fault, wallPhase = 0, age = 60): { fn: number; zeta: number } {
  switch (f) {
    case 'longTubing': return { fn: 7, zeta: 0.12 };
    case 'smallBubble': return { fn: 5.5, zeta: 0.15 };
    case 'largeBubble': return { fn: 3.2, zeta: 1.4 };
    case 'clot': return { fn: 4, zeta: 1.8 };
    case 'kink': return { fn: 3.6, zeta: 2 };
    case 'lowBag': { const k = Math.min(1, age / 45); return { fn: 22 - 17 * k, zeta: 0.45 + 1.3 * k }; }
    case 'wall': { const k = Math.max(0, Math.sin(wallPhase)) ** 2; return { fn: 24 - 16 * k, zeta: 0.4 + 1.6 * k }; }
    default: return { fn: 24, zeta: 0.4 };
  }
}

/** Gardner-style classification from what the fast-flush test shows. */
export function classify(zeta: number, fn: number): 'optimal' | 'adequate' | 'underdamped' | 'overdamped' {
  if (zeta >= 1) return 'overdamped';
  if (zeta < 0.3 || fn < 10) return zeta > 0.8 ? 'overdamped' : 'underdamped';
  if (zeta > 0.8) return 'overdamped';
  return fn >= 18 && zeta >= 0.35 ? 'optimal' : 'adequate';
}

export const CM_H2O_TO_MMHG = 0.7356;

export class Transducer {
  fault: Fault = 'none'; stopcock: Stopcock = 'patient'; bag = 300;
  /** the transducer's own electrical offset (mmHg) and the value captured at the last zero */
  drift = 0; zeroRef = 0;
  x = 0; private v = 0; private flushUntil = -1; private wall = 0;
  /** shadow system that never sees the flush: x − shadow is the pure step response (linear system) */
  private sx = 0; private sv = 0;
  /** high-resolution capture of the last fast-flush release (1 kHz), with what the patient signal was */
  flush = { t0: -1, cap: [] as number[], ideal: [] as number[], fn: 0, zeta: 0, bagP: 300 };
  private capturing = false;

  constructor(start: number) { this.x = start; this.sx = start; }
  /** seconds since the current fault began (low bag damps progressively as blood backs up) */
  age = 0;
  /** for tests / experiments: force a natural frequency and damping */
  dynOverride: { fn: number; zeta: number } | null = null;
  setFault(f: Fault) { this.fault = f; this.age = 0; if (f === 'lowBag') this.bag = 90; else if (this.bag < 300 && f === 'none') this.bag = 300; if (f === 'drift') this.drift = 9; }
  /** Press "zero": captures whatever the transducer is sensing now (correct only when open to air). */
  zero(avgRaw?: number) { this.zeroRef = avgRaw ?? this.x + this.drift; }
  fastFlush(t: number) { this.flushUntil = t + 0.45; }
  get flushing() { return this.flushUntil > 0; }

  /** Advance 1 ms. pTip = true pressure at the catheter tip (referenced to the phlebostatic axis); hydro = level error in mmHg. */
  step(t: number, dt: number, pTip: number, hydro: number) {
    this.wall += dt * 0.9; this.age += dt;
    const { fn, zeta } = this.dynOverride ?? dynamics(this.fault, this.wall, this.age);
    let u: number;
    const bagP = this.bag;
    if (this.flushUntil > 0 && t < this.flushUntil) u = bagP;
    else if (this.stopcock === 'air' || this.fault === 'openAir') u = 0;
    else if (this.fault === 'disconnect') u = hydro * 0.15 + 1;
    else u = pTip + hydro;
    if (this.flushUntil > 0 && t >= this.flushUntil) { this.flushUntil = -1; this.capturing = true; this.flush = { t0: t, cap: [], ideal: [], fn, zeta, bagP }; }
    const w = 2 * Math.PI * fn;
    const a = w * w * (u - this.x) - 2 * zeta * w * this.v;
    this.v += a * dt; this.x += this.v * dt;
    const us = this.flushUntil > 0 && t < this.flushUntil ? (this.stopcock === 'air' ? 0 : pTip + hydro) : u;
    const as = w * w * (us - this.sx) - 2 * zeta * w * this.sv; this.sv += as * dt; this.sx += this.sv * dt;
    if (this.capturing) { this.flush.cap.push(this.x); this.flush.ideal.push(this.sx); if (this.flush.cap.length >= 700) this.capturing = false; }
    return this.x + this.drift - this.zeroRef;
  }
}

/** Read the square-wave test the way a clinician does: count oscillations after release, measure the period and the amplitude ratio. */
export function readFlush(cap: number[], ideal: number[], dt = 0.001) {
  if (cap.length < 50) return null;
  const e = cap.map((x, i) => x - ideal[i]);
  const step = Math.max(1, Math.abs(e[0]));
  // extremes of the ringing (sign changes of the derivative) larger than 3 % of the step
  const ext: { i: number; v: number }[] = [];
  for (let i = 2; i < e.length - 1; i++) { const d0 = e[i] - e[i - 1], d1 = e[i + 1] - e[i]; if (d0 * d1 < 0 && Math.abs(e[i]) > Math.max(2, 0.03 * step)) ext.push({ i, v: e[i] }); }
  const osc = (ext.length + 1) / 2; // the fall from the flush plateau counts as the first half-oscillation
  let fn = 0, zeta = 1;
  if (ext.length >= 2) {
    const per = 2 * (ext[1].i - ext[0].i) * dt; fn = 1 / per;
    const ratio = Math.abs(ext[1].v / ext[0].v); const L = -Math.log(Math.max(1e-3, ratio)); zeta = L / Math.sqrt(Math.PI * Math.PI + L * L);
  }
  return { osc, fn, zeta, ext, verdict: osc > 2.25 ? 'underdamped' as const : osc < 1.25 ? 'overdamped' as const : 'optimal' as const };
}
