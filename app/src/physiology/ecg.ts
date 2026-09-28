/**
 * Lead II ECG synthesised from electrolyte state. Morphology is driven by the *effective*
 * potassium (the K⁺ that would give the same resting-potential-to-threshold gap at normal
 * calcium), so IV calcium visibly narrows the QRS while the measured K⁺ is unchanged.
 * Calcium and magnesium set the ST/QT length; low K⁺ flattens T and adds a U wave.
 */
export interface EcgState { kEff: number; k: number; ca: number; mg: number; hr?: number }
export interface EcgShape { pAmp: number; pr: number; qrs: number; tAmp: number; tWidth: number; st: number; qt: number; u: number; hr: number; sine: number; label: string }

export function ecgShape(e: EcgState): EcgShape {
  const K = e.kEff; const hi = Math.max(0, K - 5.2), lo = Math.max(0, 3.6 - e.k);
  const sine = Math.min(1, Math.max(0, (K - 7.8) / 1.2));
  const hr = (e.hr ?? 75) * (K > 7 ? Math.max(0.55, 1 - (K - 7) * 0.18) : 1);
  const qtBase = 0.40 * Math.sqrt(60 / hr);
  const qt = qtBase + 0.12 * Math.max(0, 1.12 - e.ca) / 0.3 - 0.07 * Math.max(0, e.ca - 1.32) / 0.3 + 0.05 * Math.max(0, 1.6 - e.mg) + 0.04 * lo;
  const shape: EcgShape = {
    pAmp: 0.15 * Math.max(0, 1 - Math.max(0, K - 6.3) / 1.4), pr: 0.16 + 0.03 * Math.max(0, K - 6.2),
    qrs: 0.09 + 0.035 * Math.max(0, K - 6.4) ** 1.25 + 0.12 * sine,
    tAmp: lo > 0 ? 0.28 * Math.max(0.12, 1 - lo / 1.6) : 0.28 + 0.34 * hi, tWidth: Math.max(0.05, 0.1 - 0.012 * hi),
    st: -0.07 * Math.min(1, lo / 1.2), qt: Math.max(0.28, qt), u: 0.12 * Math.min(1.4, lo / 1.1), hr, sine, label: '',
  };
  shape.label = sine > 0.2 ? 'Sine-wave pattern — peri-arrest' : K > 7 ? 'Wide QRS, absent P waves' : K > 6.3 ? 'P waves flattening, PR lengthening' : K > 5.6 ? 'Tall, peaked T waves' : e.k < 3 ? 'Flat T waves, prominent U waves, ST depression' : e.ca < 1.0 ? 'Long QT (long ST segment)' : e.ca > 1.45 ? 'Short QT' : e.mg < 1.4 ? 'QT prolongation — torsades risk' : 'Normal sinus rhythm';
  return shape;
}
const g = (t: number, c: number, w: number) => Math.exp(-((t - c) ** 2) / (2 * w * w));
/** Voltage (mV) at time t (s) into a beat. */
export function ecgAt(t: number, s: EcgShape): number {
  const pC = 0.08, qrsC = pC + s.pr, rw = s.qrs / 5;
  let v = s.pAmp * g(t, pC, 0.022);
  const q = -0.12 * g(t, qrsC - s.qrs * 0.32, rw * 0.8), r = 1.25 * (1 - 0.55 * s.sine) * g(t, qrsC, rw), sw = -0.28 * g(t, qrsC + s.qrs * 0.34, rw * 1.1);
  v += q + r + sw;
  const tC = qrsC + s.qt - 0.1; const stOn = qrsC + s.qrs / 2, stOff = tC - s.tWidth * 1.6;
  if (t > stOn && t < stOff) v += s.st;
  v += s.tAmp * g(t, tC, s.tWidth * (1 + 0.8 * s.sine)) * (s.sine > 0.3 ? 1.4 : 1);
  v += s.u * g(t, tC + 0.16, 0.04);
  return v;
}
