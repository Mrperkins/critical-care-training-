/**
 * Beat-by-beat pressure synthesis at 1 kHz.
 *
 *  Aorta   — three-element Windkessel (characteristic impedance Zc, compliance C, resistance R)
 *            driven by a skewed ejection-flow pulse, a brief valve-closure backflow (incisura) and
 *            a delayed reflected wave. Mean pressure = CVP + CO × R exactly.
 *  Radial  — the aortic pulse delayed by the pulse transit time and "amplified" (its fast
 *            components boosted), so systolic rises, diastolic falls slightly and MAP is unchanged.
 *  RA/CVP  — a, c, x, v, y components timed from atrial and ventricular events, plus
 *            intrathoracic pressure from breathing.
 *  RV      — used when the CVP catheter has migrated through the tricuspid valve.
 *  ECG II  — P waves from the atrial clock, QRS-T from the ventricular events.
 */
import type { Circ } from './hemo';
import { ecgShape, ecgAt, type EcgShape } from '../physiology/ecg';

export const DT = 0.001;
export interface Resp { mode: 'spont' | 'ppv'; rr: number; swing: number }

interface VBeat { tq: number; pep: number; et: number; sv: number; a: number; b: number; norm: number; pvc: boolean; escape: boolean; inc: number }
interface ABeat { tp: number; cannon: boolean }

const gauss = (x: number, w: number) => Math.exp(-(x * x) / (2 * w * w));
function betaNorm(a: number, b: number) { let s = 0; const n = 200; for (let i = 0; i < n; i++) { const x = (i + 0.5) / n; s += x ** a * (1 - x) ** b; } return s / n; }

/** Tiny deterministic PRNG so runs are reproducible in tests. */
function prng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export class Heart {
  c: Circ; resp: Resp; t = 0; rnd = prng(7);
  // Windkessel state
  private pc: number;
  private qHist = new Float32Array(1024); private aoHist = new Float32Array(1024); private hi = 0;
  private lp = 0; private qMean = 0; private cardMean = 0; private regurgNow = 0; private regurgLast = 0;
  // events
  v: VBeat[] = []; a: ABeat[] = []; nBeats = 0;
  private nextA = 0; private nextV = 0; private conducted = 0; private pendingV: { t: number; pvc: boolean; escape: boolean }[] = [];
  private ecgS: EcgShape;
  // outputs (last step)
  q = 0; ao = 0; rad = 0; ra = 0; rv = 0; ecg = 0; pit = 0; phase = 0; insp = false;
  /** index of the breath (increments at each inspiration start) */
  breath = 0;

  constructor(c: Circ, resp: Resp) {
    this.c = c; this.resp = resp; this.pc = c.cvp + (c.sv * c.hr / 60) * c.R;
    this.lp = this.pc; this.aoHist.fill(this.pc); this.ecgS = ecgShape({ kEff: 4.2, k: 4.2, ca: 1.2, mg: 2, hr: c.hr });
    this.nextA = 0.05; this.nextV = c.rhythm === 'af' || c.rhythm === 'chb' ? 0.2 : 1e9; this.cardMean = 0;
  }
  setCirc(c: Circ) { const rChange = c.rhythm !== this.c.rhythm; this.c = c; this.ecgS = ecgShape({ kEff: 4.2, k: 4.2, ca: 1.2, mg: 2, hr: c.hr }); if (rChange) { this.pendingV = []; this.nextV = c.rhythm === 'af' || c.rhythm === 'chb' ? this.t + 0.3 : 1e9; this.nextA = this.t + 0.1; } }

  private rr() { return 60 / this.c.hr; }
  private hist(arr: Float32Array, lag: number) { const k = Math.round(lag / DT); return arr[(this.hi - k + arr.length * 4) % arr.length]; }

  /** Respiratory phase 0–1 (0 = start of inspiration) and intrathoracic pressure (mmHg). */
  private breathe() {
    const T = 60 / this.resp.rr; const ph = (this.t % T) / T; const ti = this.resp.mode === 'ppv' ? 1 / 3 : 0.4;
    if (ph < this.phase - 0.5) this.breath++;
    this.phase = ph; this.insp = ph < ti;
    const s = this.resp.swing;
    if (this.resp.mode === 'ppv') this.pit = ph < ti ? s * Math.pow(ph / ti, 0.85) : s * Math.exp(-((ph - ti) * T) / 0.45);
    else this.pit = ph < ti ? -s * Math.sin((Math.PI * ph) / ti) : 0.15 * s * Math.sin((Math.PI * (ph - ti)) / (1 - ti)) * Math.exp(-(ph - ti) * 3);
  }

  /** Stroke-volume multiplier from breathing (applied when a beat is ejected). */
  private respSV() {
    const k = Math.cos(2 * Math.PI * (this.phase - 0.3));
    return this.resp.mode === 'ppv' ? 1 + this.c.ppvA * k : 1 - this.c.spontA * k;
  }

  private schedule() {
    const c = this.c; const t = this.t; const RR = this.rr();
    // atrial clock (not in AF)
    if (c.rhythm !== 'af' && t >= this.nextA) {
      const lastV = this.v[this.v.length - 1];
      const inSys = !!lastV && t + 0.09 > lastV.tq + 0.01 && t + 0.09 < lastV.tq + lastV.pep + lastV.et + 0.04;
      const pending = this.pendingV.find((p) => p.t > t);
      const inSysPending = !!pending && Math.abs(t + 0.09 - pending.t) < 0.25 && pending.pvc;
      this.a.push({ tp: t, cannon: inSys || inSysPending });
      if (c.rhythm === 'sinus' || c.rhythm === 'pvc') {
        // ventricular refractory period shortens at fast rates (children, sinus tachycardia): 0.36 s at adult rates
        const refractory = !!lastV && t + 0.16 - lastV.tq < Math.min(0.36, Math.max(0.2, 0.62 * RR));
        if (!refractory) {
          this.conducted++;
          this.pendingV.push({ t: t + 0.16, pvc: false, escape: false });
          if (c.rhythm === 'pvc' && c.pvcEvery > 0 && this.conducted % c.pvcEvery === 0) this.pendingV.push({ t: t + 0.16 + 0.6 * RR, pvc: true, escape: false });
        }
        // respiratory sinus arrhythmia (spontaneous breathing)
        const rsa = this.resp.mode === 'spont' && c.rhythm === 'sinus' ? 1 - 0.035 * Math.sin(2 * Math.PI * this.phase) : 1;
        this.nextA = t + RR * rsa;
      } else this.nextA = t + 60 / c.atrialRate;
    }
    if (c.rhythm === 'af' || c.rhythm === 'chb') {
      if (t >= this.nextV) {
        const iv = c.rhythm === 'af' ? RR * (0.58 + 0.84 * this.rnd()) : RR;
        this.pendingV.push({ t, pvc: false, escape: c.rhythm === 'chb' }); this.nextV = t + iv;
      }
    }
    // fire due ventricular beats
    while (this.pendingV.length && this.pendingV[0].t <= t) {
      const pv = this.pendingV.shift()!; this.pendingV.sort((x, y) => x.t - y.t);
      this.fireV(pv.t, pv.pvc, pv.escape);
    }
  }

  private fireV(tq: number, pvc: boolean, escape: boolean) {
    const c = this.c; const RR = this.rr(); const prev = this.v[this.v.length - 1];
    const fill = prev ? tq - prev.tq : RR;
    // Frank–Starling on filling time (matters in AF, PVCs, pauses); post-extrasystolic potentiation
    let f = Math.min(1.35, Math.max(0.35, 0.5 + 0.5 * Math.pow(fill / RR, 0.9)));
    if (pvc) f *= 0.45;
    if (prev?.pvc) f *= 1.12;
    this.nBeats++; if (c.alternans > 0) f *= this.nBeats % 2 ? 1 - c.alternans : 1 + c.alternans;
    f *= this.respSV();
    const sv = c.sv * f + (c.ar > 0 ? this.regurgLast : 0);
    const a = pvc ? c.shapeA + 0.6 : c.shapeA, b = c.shapeB;
    this.v.push({ tq, pep: c.pep + (pvc ? 0.03 : 0), et: c.et * (pvc ? 0.8 : 1) * (0.85 + 0.15 * Math.min(1.3, fill / RR)), sv, a, b, norm: betaNorm(a, b), pvc, escape, inc: c.incisura * Math.min(1, f) });
    if (this.v.length > 12) this.v.shift();
    this.regurgLast = this.regurgNow; this.regurgNow = 0;
  }

  step() {
    const c = this.c; this.t += DT; const t = this.t;
    this.breathe(); this.schedule();
    while (this.a.length > 10 && t - this.a[0].tp > 4) this.a.shift();
    // ---- aortic flow
    let q = 0; let ejecting = false;
    for (let i = this.v.length - 1; i >= Math.max(0, this.v.length - 2); i--) {
      const b = this.v[i]; const u = t - (b.tq + b.pep);
      if (u >= 0 && u <= b.et) { const s = u / b.et; q += (b.sv / b.et) * (s ** b.a * (1 - s) ** b.b) / b.norm; ejecting = true; }
      const dc = t - (b.tq + b.pep + b.et + 0.012);
      if (Math.abs(dc) < 0.04) q -= (b.inc / (0.007 * Math.sqrt(2 * Math.PI))) * gauss(dc, 0.007);
    }
    const aoPrev = this.hist(this.aoHist, DT);
    if (c.ar > 0 && !ejecting) {
      // regurgitant jet back into the LV: sized so regurgitant fraction ≈ 0.5 × severity
      const rf = 0.5 * c.ar; const vr = (c.sv * rf) / (1 - rf); const mapEst = c.cvp + (c.sv * c.hr / 60) * c.R;
      const tdia = Math.max(0.2, this.rr() - c.pep - c.et); const Rreg = (Math.max(20, mapEst - 12) * tdia) / Math.max(1, vr);
      const back = Math.max(0, aoPrev - 8) / Rreg; q -= back; this.regurgNow += back * DT;
    }
    this.q = q;
    // ---- three-element Windkessel + reflected wave
    this.pc += (DT * (q - (this.pc - c.cvp) / c.R)) / c.C;
    this.hi = (this.hi + 1) % this.qHist.length; this.qHist[this.hi] = q;
    this.qMean += ((q - this.qMean) * DT) / 4;
    const refl = c.refl * c.Zc * (this.hist(this.qHist, c.tRefl) - this.qMean); // reflection reshapes the pulse; it does not change the mean
    this.ao = this.pc + c.Zc * q + refl + this.pit * 0.9;
    this.aoHist[this.hi] = this.ao;
    // ---- radial: transit delay + peripheral amplification (mean preserved)
    const d = this.hist(this.aoHist, c.ptt);
    this.lp += ((d - this.lp) * DT) / 0.05;
    this.rad = d + c.amp * (d - this.lp);
    // ---- right atrium (CVP)
    let card = 0; const last = this.v[this.v.length - 1];
    for (const ab of this.a) {
      const u = t - ab.tp; if (u < -0.1 || u > 0.5) continue;
      card += (ab.cannon ? c.aAmp * 2.5 + 9 : c.aAmp) * gauss(u - 0.1, 0.04) - (ab.cannon ? 0 : 0.6 * c.aAmp * gauss(u - 0.22, 0.05));
    }
    for (let i = Math.max(0, this.v.length - 2); i < this.v.length; i++) {
      const b = this.v[i]; const u = t - b.tq; if (u < 0 || u > 1.2) continue; const es = b.pep + b.et;
      card += c.cAmp * gauss(u - 0.06, 0.018);
      card -= c.xAmp * gauss(u - (b.pep + 0.13), 0.06);
      card += c.vAmp * gauss(u - (es + 0.03), 0.06);
      card -= c.yAmp * gauss(u - (es + 0.16), 0.055);
      if (c.trAmp > 0) { const s = (u - 0.04) / (es + 0.02); if (s > 0 && s < 1.25) card += c.trAmp * Math.sin(Math.min(1, s) * Math.PI * 0.62) ** 1.2 * (s > 1 ? Math.max(0, 1 - (s - 1) * 4) : 1); }
    }
    if (c.rhythm === 'af') card += 0.25 * Math.sin(2 * Math.PI * 6.3 * t) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 0.7 * t));
    this.cardMean += ((card - this.cardMean) * DT) / 3;
    this.ra = c.cvp + card - this.cardMean + this.pit * 0.85;
    // ---- right ventricle (only shown if the CVP catheter migrates)
    if (last) {
      const u = t - last.tq; const es = last.pep + last.et; const edp = Math.max(1, c.cvp + 1);
      let rv: number;
      if (u < 0.03) rv = edp;
      else if (u < es + 0.03) { const up = Math.min(1, (u - 0.03) / 0.06); const down = u > es - 0.02 ? Math.max(0, 1 - (u - es + 0.02) / 0.05) : 1; rv = edp + (c.rvsp - edp) * (up * up * (3 - 2 * up)) * down * (0.96 + 0.06 * Math.sin(Math.PI * Math.min(1, (u - 0.03) / es))); }
      else { const k = Math.min(1, (u - es - 0.03) / 0.3); rv = 1 + (edp - 1) * Math.sqrt(k); }
      for (const ab of this.a) rv += 0.7 * c.aAmp * gauss(t - ab.tp - 0.1, 0.035);
      this.rv = rv + this.pit * 0.85;
    }
    // ---- ECG lead II
    this.ecg = this.ecgAt(t);
  }

  private ecgAt(t: number) {
    const s = this.ecgS; let e = 0;
    if (this.c.rhythm === 'af') e += 0.05 * Math.sin(2 * Math.PI * 6.1 * t) + 0.03 * Math.sin(2 * Math.PI * 8.7 * t + 1);
    else for (const ab of this.a) { const u = t - ab.tp; if (u > -0.1 && u < 0.2) e += s.pAmp * gauss(u - 0.05, 0.022); }
    for (const b of this.v) {
      const u = t - b.tq; if (u < -0.1 || u > 0.7) continue;
      if (b.pvc) e += -1.4 * gauss(u - 0.01, 0.035) + 0.5 * gauss(u - 0.08, 0.03) + 0.45 * gauss(u - 0.32, 0.07);
      else if (b.escape) e += ecgAt(u + 0.08 + s.pr, { ...s, pAmp: 0, qrs: 0.13 });
      else e += ecgAt(u + 0.08 + s.pr, { ...s, pAmp: 0 });
    }
    return e;
  }
}
