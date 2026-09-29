/**
 * Intra-aortic balloon pump timing (teaching model). Takes the patient's beat from the Lines session
 * (heart rate, aortic systolic / diastolic) and draws the aortic pressure at 1:2 assist, with the
 * balloon inflating and deflating at the chosen times. Pure: settings → samples + measured features,
 * so the classic timing errors are testable by their waveform signatures.
 *
 * 1:2 display, left to right: unassisted systole → dicrotic notch → (balloon inflates) diastolic
 * augmentation → (balloon deflates) balloon-assisted end-diastolic dip → ASSISTED systole → notch →
 * unassisted diastole → patient end-diastolic pressure → next unassisted systole.
 */
export interface IabpBase { hr: number; sys: number; dia: number }
export interface IabpTiming {
  /** inflation relative to the dicrotic notch, s (− early, + late) */ inflate: number;
  /** deflation relative to the onset of the next systole, s (− = before; ideal ≈ −0.04) */ deflate: number;
  /** balloon augmentation strength 0–1.2 (volume / position) */ gain?: number;
}
export const IDEAL: IabpTiming = { inflate: 0, deflate: -0.04 };
export type IabpError = 'ideal' | 'earlyInflation' | 'lateInflation' | 'earlyDeflation' | 'lateDeflation';
export const IABP_PRESETS: Record<IabpError, { name: string; t: IabpTiming; sign: string; risk: string }> = {
  ideal: { name: 'Correct timing', t: IDEAL, sign: 'Inflation at the dicrotic notch makes a sharp V; the augmented diastolic peak is at or above systole; balloon-assisted end-diastolic pressure is lower than the patient’s own, and the assisted systole is lower than the unassisted one.', risk: 'Coronary perfusion up in diastole, afterload down for the next beat.' },
  earlyInflation: { name: 'Early inflation', t: { inflate: -0.09, deflate: -0.04 }, sign: 'Augmentation starts before the dicrotic notch — the notch disappears and systole runs straight into the balloon wave.', risk: 'The balloon inflates while the ventricle is still ejecting: premature aortic valve closure, less stroke volume, more wall stress.' },
  lateInflation: { name: 'Late inflation', t: { inflate: 0.1, deflate: -0.04 }, sign: 'A visible dicrotic notch and a gap before the augmentation; the augmented peak is lower.', risk: 'Less diastolic augmentation — less coronary perfusion benefit.' },
  earlyDeflation: { name: 'Early deflation', t: { inflate: 0, deflate: -0.2 }, sign: 'Augmentation falls away sharply in mid-diastole, then pressure climbs back: the assisted end-diastolic pressure is about the same as the unassisted, and the assisted systole is not lower.', risk: 'No afterload reduction; possible retrograde coronary / carotid flow in the dip.' },
  lateDeflation: { name: 'Late deflation', t: { inflate: 0, deflate: 0.05 }, sign: 'The assisted end-diastolic pressure is HIGHER than the patient’s own; the assisted systole starts late and rises slowly (widened augmentation).', risk: 'The ventricle ejects against an inflated balloon: afterload and oxygen demand go UP — the most dangerous error.' },
};

export interface IabpTrace { t: number[]; p: number[]; T: number; tEj: number; marks: { inflate: number; deflate: number; notch1: number; sys2: number; sys3: number } }
export interface IabpFeatures { unassistedSys: number; augPeak: number; baedp: number; paedp: number; assistedSys: number; notchDepth: number; augOnsetAfterNotch: number }

const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/**
 * One aortic beat without the balloon: ejection 0 → tEj (fast upstroke, rounded peak, late fall),
 * a dicrotic notch at aortic-valve closure, then exponential diastolic run-off that reaches `dia` at T.
 */
function beat(b: IabpBase, T: number, tEj: number, t: number, sysScale = 1) {
  const sys = b.dia + (b.sys - b.dia) * sysScale; const u = t / tEj;
  const shape = (x: number) => (x < 0.35 ? Math.sin((Math.PI / 2) * (x / 0.35)) : 1 - 0.15 * Math.pow((x - 0.35) / 0.65, 1.3));
  const notch = -6 * Math.exp(-(((t - tEj - 0.012) / 0.012) ** 2));
  if (u <= 1) return b.dia + (sys - b.dia) * shape(Math.max(0, u)) + notch;
  const pn = b.dia + (sys - b.dia) * shape(1); const floor = 0.6 * b.dia; const tau = (T - tEj) / Math.log((pn - floor) / (b.dia - floor));
  return floor + (pn - floor) * Math.exp(-(t - tEj) / tau) + notch;
}

/** Aortic pressure over three beats at 1:2 (balloon inflates in beat-1 diastole; beat 2 is the assisted systole). */
export function iabpTrace(base: IabpBase, timing: IabpTiming, dt = 0.004): IabpTrace {
  const T = 60 / Math.max(40, Math.min(140, base.hr)); const tEj = Math.min(0.33, 0.16 + 0.2 * T); const gain = timing.gain ?? 1;
  const tInf = tEj + timing.inflate; const tDef = T + timing.deflate;
  const amp = (base.sys - base.dia) * 1.1 * gain; // balloon wave above the run-off
  const defl = Math.max(0, -timing.deflate), lateDef = Math.max(0, timing.deflate);
  // afterload reduction for the assisted beat needs deflation shortly BEFORE systole; too early and the aorta refills
  const reduce = gain * 0.16 * smooth(defl / 0.05) * (1 - smooth((defl - 0.1) / 0.08));
  const t: number[] = [], p: number[] = [];
  for (let s = 0; s < 3 * T - 1e-9; s += dt) {
    const k = Math.floor(s / T), tb = s - k * T;
    let v = k === 1 ? beat(base, T, tEj * (1 + 6 * lateDef), tb, 1 - reduce + 0.4 * lateDef) : beat(base, T, tEj, tb);
    if (s >= tInf && s < tDef + 0.3) {
      const off = 1 - smooth((s - tDef) / 0.06); // balloon empties over ~60 ms
      // the wave rides on whatever the aorta is doing: inflating late starts from a lower run-off and loses augmentation
      const wave = off > 0 ? off * amp * (1 - 2.5 * Math.max(0, timing.inflate)) * smooth((s - tInf) / 0.05) * Math.exp(-Math.max(0, s - tInf - 0.05) / 0.9) : 0;
      // deflation pulls the balloon volume out of the aorta: a dip that recovers over ~0.15 s (absent if deflation is late)
      const since = s - tDef; const dip = since >= 0 && lateDef === 0 ? -gain * 20 * Math.exp(-Math.max(0, since - 0.03) / 0.07) * smooth(since / 0.05) : 0;
      v += wave + dip;
    }
    t.push(s); p.push(v);
  }
  return { t, p, T, tEj, marks: { inflate: tInf, deflate: tDef, notch1: tEj, sys2: T, sys3: 2 * T } };
}

const at = (tr: IabpTrace, time: number) => tr.p[Math.max(0, Math.min(tr.p.length - 1, Math.round(time / (tr.t[1] - tr.t[0]))))];
const maxIn = (tr: IabpTrace, a: number, b: number) => { let m = -Infinity; tr.t.forEach((x, i) => { if (x >= a && x <= b) m = Math.max(m, tr.p[i]); }); return m; };
const minIn = (tr: IabpTrace, a: number, b: number) => { let m = Infinity; tr.t.forEach((x, i) => { if (x >= a && x <= b) m = Math.min(m, tr.p[i]); }); return m; };

/** The numbers a clinician reads off an IABP arterial trace. */
export function features(tr: IabpTrace): IabpFeatures {
  const { T, tEj } = tr;
  const unassistedSys = maxIn(tr, 2 * T, 2 * T + tEj);
  const augPeak = maxIn(tr, tEj - 0.12, T - 0.02);
  const baedp = minIn(tr, T - 0.1, T + 0.06); // lowest pressure just before the assisted systole
  const paedp = at(tr, 2 * T - 0.004);        // end-diastole before the unassisted beat
  const assistedSys = maxIn(tr, T + 0.02, T + tEj * 1.8);
  // notch: how far pressure falls between the systolic peak and the augmentation peak (≈ 0 when the waves merge)
  const idx = (a: number, b: number) => { let bi = -1, bv = -Infinity; tr.t.forEach((x, i) => { if (x >= a && x <= b && tr.p[i] > bv) { bv = tr.p[i]; bi = i; } }); return bi; };
  const iS = idx(0, tEj * 0.6), iA = idx(tr.t[iS] + 0.02, T - 0.02); let lo = Infinity; for (let i = iS; i <= iA; i++) lo = Math.min(lo, tr.p[i]);
  const notchDepth = Math.max(0, Math.min(tr.p[iS], tr.p[iA]) - lo);
  return { unassistedSys, augPeak, baedp, paedp, assistedSys, notchDepth, augOnsetAfterNotch: tr.marks.inflate - tEj };
}

/** Which timing error does a setting represent (for the quiz and the live label). */
export function classify(t: IabpTiming): IabpError {
  if (t.deflate > 0.005) return 'lateDeflation';
  if (t.inflate < -0.03) return 'earlyInflation';
  if (t.inflate > 0.05) return 'lateInflation';
  if (t.deflate < -0.12) return 'earlyDeflation';
  return 'ideal';
}
