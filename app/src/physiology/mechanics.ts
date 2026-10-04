/**
 * Respiratory mechanics simulator.
 *
 * Two lung compartments (right, left) in parallel, each with its own airway resistance
 * and a recruitable, overdistensible elastance, behind a shared endotracheal tube and
 * chest wall. A patient's inspiratory (and optionally expiratory) muscle pressure acts
 * on the chest wall. The ventilator either controls flow (volume modes) or airway
 * pressure (pressure modes), and triggers/cycles from the same signals a real
 * ventilator senses. Dyssynchrony is not scripted: it emerges from the mismatch between
 * the patient's neural timing and the machine's.
 *
 *   Palv_i = Ptp_i(V_i) + Pcw,   Pcw = V_total / C_cw − P_mus
 *   Q_i    = (P_carina − Palv_i) / R_i            (R_i ↑ on expiration if obstructed)
 *   P_aw   = P_carina + R_ett(Q) · Q
 *
 * Units: cmH₂O, litres, L/s, seconds. Compliance in L/cmH₂O internally.
 */

export type Mode = 'VC' | 'PC' | 'PRVC' | 'PSV' | 'SIMV' | 'CPAP' | 'APRV';
export type Phase = 'exp' | 'insp' | 'pause' | 'ihold' | 'ehold' | 'high' | 'low';

export interface VentSettings {
  mode: Mode;
  vt: number;        // L
  rr: number;        // /min
  peep: number;      // cmH2O
  fio2: number;      // 0.21–1
  flow: number;      // L/min (VC peak flow)
  pattern: 'square' | 'decel';
  ti: number;        // s (PC/PRVC)
  pinsp: number;     // cmH2O above PEEP (PC)
  ps: number;        // cmH2O above PEEP (PSV/SIMV)
  trigType: 'flow' | 'pressure';
  trigFlow: number;  // L/min
  trigPressure: number; // cmH2O
  rise: number;      // s, time to reach pressure target
  cyclePct: number;  // % of peak flow (PSV)
  pause: number;     // s end-inspiratory pause (VC)
  phigh: number; plow: number; thigh: number; tlow: number; // APRV
}

export interface Compartment {
  name: 'right' | 'left';
  C: number;           // L/cmH2O, lung (transpulmonary) compliance when fully open
  R: number;           // cmH2O/L/s inspiratory
  rExp: number;        // expiratory resistance multiplier (dynamic airway collapse)
  flowLimit: number;   // 0 = none; >0 caps expiratory flow ≈ flowLimit × volume (COPD)
  recruitable: number; // 0–1 fraction of units that can collapse
  openP: number; closeP: number; // mean opening / closing transpulmonary pressures of collapsible units
  overdistP: number;   // transpulmonary pressure where overdistension stiffening begins
  connected: boolean;  // false = excluded (mainstem intubation of the other side, complete plug)
  collapsed: number;   // 0–1 pneumothorax: lung collapse toward the hilum
}
export interface LungModel {
  comps: [Compartment, Compartment];
  Ccw: number;         // chest wall compliance L/cmH2O
  Rett: number;        // ETT linear resistance cmH2O/L/s
  RettQ: number;       // ETT quadratic term cmH2O/(L/s)^2
  leak: number;        // cuff leak coefficient (L/s at 1 cmH2O^0.5)
  tension: number;     // pleural pressure added by a tension pneumothorax (cmH2O)
}
export interface PatientEffort {
  pmax: number;   // cmH2O peak inspiratory muscle pressure (0 = passive)
  rate: number;   // neural breaths/min
  ti: number;     // neural inspiratory time s
  expPush: number; // cmH2O active expiration after neural Ti (delayed-cycling fights)
  demand?: number; // L/min peak inspiratory flow the patient wants (default ≈ 6 × pmax)
}

export interface BreathStats {
  vti: number; vte: number; pip: number; pplat: number | null; peepTotal: number | null; pmean: number;
  peakFlow: number; ti: number; te: number; rr: number; mv: number;
  cdyn: number; cstat: number | null; raw: number | null; autoPeepTrue: number; driving: number | null;
  triggered: 'patient' | 'time' | 'backup'; ineffective: number; doubleTriggered: boolean;
  pressureCycled: boolean; fightingEnd: boolean; stackedVolume: boolean; effortDuringInsp: number; kind: 'mand' | 'spont';
  /** machine inspiratory end − neural inspiratory end (s). <0 premature cycling, >0 delayed cycling. null if not patient-triggered. */
  cycleLag: number | null;
  /** expiratory flow (L/min, negative = still exhaling) at the moment the NEXT breath began */
  endExpFlow: number;
  /** cmH₂O the patient pulled airway pressure below the passive trace during inflation (flow starvation) */
  scoop: number;
  /** lung volume above end-expiratory equilibrium at end-inspiration (L) — breath stacking */
  volAbove: number;
}

export const DEFAULT_SETTINGS: VentSettings = {
  mode: 'VC', vt: 0.45, rr: 14, peep: 5, fio2: 0.4, flow: 60, pattern: 'decel', ti: 1.0, pinsp: 15, ps: 10,
  trigType: 'flow', trigFlow: 2, trigPressure: 2, rise: 0.1, cyclePct: 25, pause: 0,
  phigh: 28, plow: 0, thigh: 4.5, tlow: 0.5,
};

export const normalLung = (): LungModel => ({
  comps: [
    { name: 'right', C: 0.055, R: 4, rExp: 1, flowLimit: 0, recruitable: 0, openP: 20, closeP: 8, overdistP: 32, connected: true, collapsed: 0 },
    { name: 'left', C: 0.045, R: 4.5, rExp: 1, flowLimit: 0, recruitable: 0, openP: 20, closeP: 8, overdistP: 32, connected: true, collapsed: 0 },
  ],
  Ccw: 0.2, Rett: 4, RettQ: 1.5, leak: 0, tension: 0,
});

const N_UNITS = 48;
/** Deterministic per-unit opening/closing pressure scatter (so results are reproducible). */
const UNIT_Z = Array.from({ length: N_UNITS }, (_, i) => { const u = (i + 0.5) / N_UNITS; return Math.sqrt(2) * erfinv(2 * u - 1); });
function erfinv(x: number) { const a = 0.147; const ln = Math.log(1 - x * x); const t = 2 / (Math.PI * a) + ln / 2; return Math.sign(x) * Math.sqrt(Math.sqrt(t * t - ln / a) - t); }

export interface SimFrame { t: number; paw: number; flow: number; vol: number; palv: [number, number]; pmus: number; phase: Phase }

export class Mechanics {
  s: VentSettings; lung: LungModel; pt: PatientEffort;
  t = 0; phase: Phase = 'exp'; phT = 0;
  V: [number, number] = [0, 0];                // L above relaxed volume
  open: [Uint8Array, Uint8Array];               // per-unit open state
  breathStart = 0; lastMand = -99; mandCount = 0;
  bVolIn = 0; bVolOut = 0; bPip = 0; bPeakQ = 0; bPmeanAcc = 0; bPmeanT = 0; bTi = 0; bKind: 'mand' | 'spont' = 'mand'; bTrig: BreathStats['triggered'] = 'time';
  dispVol = 0; target = 0; prvcP: number | null = null; pRamp = 0;
  qPrev = 0; lastInspEnd = -99; ineffective = 0; pendingPlat: number | null = null; pendingPeepTot: number | null = null; holdReq: 'i' | 'e' | null = null;
  stats: BreathStats | null = null; history: BreathStats[] = [];
  apnea = false; lastQ = 0; lastPaw = 0; lastPmus = 0; lastPalv: [number, number] = [0, 0];
  breathTimes: number[] = [];
  /** circuit open at the patient wye / ETT connector: the machine keeps cycling into the room and the lung empties to atmosphere */
  disconnected = false;

  constructor(s: VentSettings = { ...DEFAULT_SETTINGS }, lung: LungModel = normalLung(), pt: PatientEffort = { pmax: 0, rate: 0, ti: 1, expPush: 0 }) {
    this.s = s; this.lung = lung; this.pt = pt;
    this.open = [new Uint8Array(N_UNITS).fill(1), new Uint8Array(N_UNITS).fill(1)];
    this.equilibrate();
  }

  /** Start from end-expiratory equilibrium at the set PEEP. */
  equilibrate() {
    const pe = this.s.mode === 'APRV' ? this.s.plow : this.s.peep;
    for (let it = 0; it < 8; it++) {
      let csum = 0; for (let k = 0; k < 2; k++) if (this.lung.comps[k].connected) csum += this.effC(k);
      const x = pe / (1 + csum / this.lung.Ccw); // transpulmonary pressure at equilibrium
      for (let k = 0; k < 2; k++) this.V[k] = this.lung.comps[k].connected ? this.effC(k) * x : 0;
      this.updateUnits();
    }
    this.Veq = this.V[0] + this.V[1];
    this.phase = this.s.mode === 'APRV' ? 'high' : 'exp'; this.phT = 0; this.breathStart = this.t - 60;
  }

  /* ------------------------------------------------------------------ elastic model */
  openFrac(k: number) { const c = this.lung.comps[k]; if (!c.recruitable) return 1; let n = 0; const o = this.open[k]; for (let i = 0; i < N_UNITS; i++) n += o[i]; return 1 - c.recruitable + c.recruitable * (n / N_UNITS); }
  effC(k: number) { const c = this.lung.comps[k]; return Math.max(0.002, c.C * this.openFrac(k) * (1 - 0.92 * c.collapsed)); }
  /** Transpulmonary recoil pressure with overdistension stiffening. */
  ptp(k: number, V = this.V[k]) { const c = this.lung.comps[k]; const lin = V / this.effC(k); const over = Math.max(0, lin - c.overdistP); return lin + 0.09 * over * over; }
  pmus(t = this.t) {
    const p = this.pt; if (!(p.pmax > 0) || !(p.rate > 0)) return 0;
    const per = 60 / p.rate; const ph = ((t % per) + per) % per; const ti = Math.min(p.ti, per * 0.85);
    if (ph < ti) return p.pmax * 0.5 * (1 - Math.cos(Math.PI * ph / ti)) * this.reflex; // neural inspiration: smooth rise to peak at Ti
    const rel = ph - ti; let r = p.pmax * Math.exp(-rel / 0.12);                 // muscle relaxation
    if (p.expPush > 0 && rel < 0.6) r -= p.expPush * Math.sin(Math.PI * rel / 0.6); // active expiration
    return r;
  }
  /**
   * Load-compensation reflex: when delivered inspiratory flow meets the patient's demand the
   * inspiratory muscles unload (effort ↓); when flow is short of demand they keep pulling.
   * This is what makes flow starvation visible as a scooped pressure trace — and fixable.
   */
  reflex = 1;
  private updateReflex(dt: number) {
    const p = this.pt; let target = 1;
    if (this.phase === 'insp' && p.pmax > 0) { const dem = (p.demand ?? p.pmax * 6) / 60; target = Math.max(0.2, Math.min(1, 0.2 + 1.6 * (dem - this.lastQ) / dem)); }
    this.reflex += (target - this.reflex) * Math.min(1, dt / 0.08);
  }
  pcw() { return (this.V[0] + this.V[1]) / this.lung.Ccw - this.pmus() + this.lung.tension; }
  palv(k: number) { return this.ptp(k) + this.pcw(); }
  updateUnits() {
    for (let k = 0; k < 2; k++) {
      const c = this.lung.comps[k]; if (!c.recruitable) continue; const p = this.ptp(k); const o = this.open[k];
      for (let i = 0; i < N_UNITS; i++) { const z = UNIT_Z[i]; const po = c.openP + z * 5, pc = c.closeP + z * 2.5; if (!o[i] && p >= po) o[i] = 1; else if (o[i] && p < pc) o[i] = 0; }
    }
  }

  /* ------------------------------------------------------------------ airway network */
  private rComp(k: number, q: number) { const c = this.lung.comps[k]; return q < 0 ? c.R * c.rExp : c.R; }
  private rEtt(q: number) { return this.lung.Rett + this.lung.RettQ * Math.abs(q); }
  /** Solve compartment flows for a given airway pressure (pressure-controlled / expiratory). */
  private flowsForPaw(paw: number, extraR = 0) {
    let q = this.qPrev; let qs: [number, number] = [0, 0];
    for (let it = 0; it < 3; it++) {
      const re = this.rEtt(q) + extraR; let gs = 1 / re, ps = paw / re;
      const g = [0, 0];
      for (let k = 0; k < 2; k++) { if (!this.lung.comps[k].connected) continue; const guess = (paw - this.palv(k)); g[k] = 1 / this.rComp(k, guess); gs += g[k]; ps += this.palv(k) * g[k]; }
      const pc = ps / gs; qs = [0, 1].map((k) => (this.lung.comps[k].connected ? (pc - this.palv(k)) * g[k] : 0)) as [number, number];
      q = (paw - pc) / re;
    }
    return { q, qs };
  }
  /** Solve compartment flows for a delivered flow (volume-controlled). */
  private flowsForQ(q: number) {
    let gs = 0, ps = 0; const g = [0, 0];
    for (let k = 0; k < 2; k++) { if (!this.lung.comps[k].connected) continue; g[k] = 1 / this.rComp(k, q); gs += g[k]; ps += this.palv(k) * g[k]; }
    const pc = gs > 0 ? (q + ps) / gs : 0; const qs = [0, 1].map((k) => (this.lung.comps[k].connected ? (pc - this.palv(k)) * g[k] : 0)) as [number, number];
    return { paw: pc + this.rEtt(q) * q, qs };
  }
  /** Closed circuit (holds): compartments equilibrate with each other (pendelluft). */
  private flowsClosed() {
    let gs = 0, ps = 0; const g = [0, 0];
    for (let k = 0; k < 2; k++) { if (!this.lung.comps[k].connected) continue; g[k] = 1 / this.lung.comps[k].R; gs += g[k]; ps += this.palv(k) * g[k]; }
    const pc = gs > 0 ? ps / gs : 0; return { paw: pc, qs: [0, 1].map((k) => (this.lung.comps[k].connected ? (pc - this.palv(k)) * g[k] : 0)) as [number, number] };
  }

  /* ------------------------------------------------------------------ breath control */
  private mandatoryKind(): 'vc' | 'pc' { return this.s.mode === 'VC' || this.s.mode === 'SIMV' ? 'vc' : 'pc'; }
  private startBreath(kind: 'mand' | 'spont', trig: BreathStats['triggered']) {
    this.bEndExpQ = this.lastQ * 60;
    if (this.bTi > 0 || this.bVolIn > 0) { this.bEndExpQNext = this.bEndExpQ; this.finishBreath(); }
    const dt = this.t - this.lastInspEnd;
    this.phase = 'insp'; this.phT = 0; this.bKind = kind; this.bTrig = trig; this.breathStart = this.t;
    this.bVolIn = 0; this.bVolOut = 0; this.bPip = -99; this.bPeakQ = 0; this.bPmeanAcc = 0; this.bPmeanT = 0; this.dispVol = 0; this.pRamp = this.s.mode === 'APRV' ? this.s.plow : this.s.peep;
    // an effort is "answered" if any breath starts while the patient is still in neural inspiration
    const neuralInsp = this.pt.pmax > 0 && this.pt.rate > 0 && (() => { const per = 60 / this.pt.rate; const ph = this.t - Math.floor(this.t / per) * per; return ph < Math.min(this.pt.ti, per * 0.85); })();
    const prevEffort = this.bNIdx;
    if (trig === 'patient' || neuralInsp) { this.nTrig = true; this.bNIdx = this.nIdx; } else this.bNIdx = -1;
    // double triggering = a second machine breath inside the same neural effort
    this.doubleFlag = this.history.length > 0 && ((this.bNIdx >= 0 && prevEffort === this.bNIdx) || (this.pt.pmax <= 0 && trig === 'patient' && dt < 0.35));
    if (kind === 'mand') { this.lastMand = this.t; this.mandCount++; }
    this.breathTimes.push(this.t); if (this.breathTimes.length > 10) this.breathTimes.shift();
    if (this.s.mode === 'PRVC' && kind === 'mand' && this.prvcP == null) this.prvcP = Math.min(25, Math.max(5, this.s.vt / Math.max(0.005, this.systemC())));
  }
  private doubleFlag = false;
  systemC() { let c = 0; for (let k = 0; k < 2; k++) if (this.lung.comps[k].connected) c += this.effC(k); return c > 0 ? 1 / (1 / c + 1 / this.lung.Ccw) : 0.001; }
  private endInsp() {
    this.bTi = this.phT; this.lastInspEnd = this.t; this.lastPlatTrue = this.meanPalvPassive();
    this.bVolAbove = this.V[0] + this.V[1] - this.Veq;
    if (this.bNIdx >= 0 && this.pt.rate > 0) { const per = 60 / this.pt.rate; this.bCycleLag = this.t - (this.bNIdx * per + Math.min(this.pt.ti, per * 0.85)); }
    if (this.s.mode === 'PRVC' && this.bKind === 'mand' && this.prvcP != null) { const err = this.s.vt - this.bVolIn; this.prvcP = Math.min(35, Math.max(3, this.prvcP + Math.max(-3, Math.min(3, err / Math.max(0.005, this.systemC()) * 0.7)))); }
    if (this.holdReq === 'i' && this.bKind === 'mand') { this.phase = 'ihold'; this.holdReq = null; }
    else if (this.bKind === 'mand' && this.mandatoryKind() === 'vc' && this.s.pause > 0) this.phase = 'pause';
    else this.phase = 'exp';
    this.phT = 0;
  }
  private finishBreath() {
    const te = this.t - this.breathStart - this.bTi; const rr = this.breathTimes.length >= 2 ? 60 * (this.breathTimes.length - 1) / (this.breathTimes[this.breathTimes.length - 1] - this.breathTimes[0]) : this.s.rr;
    const peep = this.s.mode === 'APRV' ? this.s.plow : this.s.peep;
    const palvMean = (this.palv(0) * (this.lung.comps[0].connected ? 1 : 0) + this.palv(1) * (this.lung.comps[1].connected ? 1 : 0)) / Math.max(1, (this.lung.comps[0].connected ? 1 : 0) + (this.lung.comps[1].connected ? 1 : 0));
    const vt = this.bVolIn;
    const st: BreathStats = {
      vti: this.bVolIn, vte: this.bVolOut, pip: this.bPip, pplat: this.pendingPlat, peepTotal: this.pendingPeepTot, pmean: this.bPmeanT > 0 ? this.bPmeanAcc / this.bPmeanT : peep,
      peakFlow: this.bPeakQ * 60, ti: this.bTi, te, rr, mv: this.bVolOut * rr,
      cdyn: vt / Math.max(0.5, this.bPip - peep), cstat: this.pendingPlat != null ? vt / Math.max(0.5, this.pendingPlat - (this.pendingPeepTot ?? peep)) : null,
      raw: this.pendingPlat != null && this.bKind === 'mand' && this.mandatoryKind() === 'vc' && this.s.pattern === 'square' ? (this.bPip - this.pendingPlat) / (this.s.flow / 60) : null,
      autoPeepTrue: Math.max(0, palvMean - peep), driving: this.pendingPlat != null ? this.pendingPlat - (this.pendingPeepTot ?? peep) : null,
      triggered: this.bTrig, ineffective: this.ineffective, doubleTriggered: this.doubleFlag,
      pressureCycled: this.bPressureCycled, fightingEnd: this.bReversed, stackedVolume: this.doubleFlag && this.bVolAbove > 1.4 * Math.max(0.2, this.s.mode === 'VC' || this.s.mode === 'SIMV' ? this.s.vt : this.history[this.history.length - 1]?.vti ?? 0.4), effortDuringInsp: this.bEffortInsp, scoop: this.bScoop, kind: this.bKind, cycleLag: this.bCycleLag, endExpFlow: this.bEndExpQNext, volAbove: this.bVolAbove,
    };
    this.bEndExpQNext = 0; this.bReversed = false; this.bPressureCycled = false; this.bEffortInsp = 0; this.bScoop = 0; this.bCycleLag = null;
    this.stats = st; this.history.push(st); if (this.history.length > 30) this.history.shift();
    this.pendingPlat = null; this.pendingPeepTot = null; this.ineffective = 0; this.bTi = 0;
  }

  /** One integration step. Returns the monitored airway pressure and flow. */
  step(dt: number): SimFrame {
    const s = this.s; this.t += dt; this.phT += dt;
    const peep = s.mode === 'APRV' ? s.plow : s.peep; const pm = this.pmus(); this.lastPmus = pm;
    let paw = peep, qY = 0; let qs: [number, number] = [0, 0];
    const per = 60 / Math.max(1, s.rr);
    this.neural(); this.updateReflex(dt);

    if (s.mode === 'APRV' && (this.phase === 'exp' || this.phase === 'insp')) { this.phase = 'high'; this.phT = 0; }
    if (s.mode !== 'APRV' && (this.phase === 'high' || this.phase === 'low')) { this.phase = 'exp'; this.phT = 0; }
    // ---- expiration: trigger detection
    if (this.phase === 'exp') {
      const r = this.flowsForPaw(peep, 0.8); qs = r.qs; qY = r.q; paw = peep;
      const sinceStart = this.t - this.breathStart; const refractory = this.phT > 0.12;
      const closed = this.flowsClosed();
      const patientTrig = refractory && (s.trigType === 'flow' ? qY * 60 >= s.trigFlow : peep - closed.paw >= s.trigPressure);
      const m = s.mode;
      if (this.holdReq === 'e' && sinceStart >= per && ['VC', 'PC', 'PRVC', 'SIMV'].includes(m)) { this.phase = 'ehold'; this.phT = 0; this.holdReq = null; }
      else if (m === 'VC' || m === 'PC' || m === 'PRVC') {
        if (sinceStart >= per) this.startBreath('mand', 'time'); else if (patientTrig) this.startBreath('mand', 'patient');
      } else if (m === 'SIMV') {
        const sinceMand = this.t - this.lastMand;
        if (sinceMand >= per) this.startBreath('mand', 'time');
        else if (patientTrig) { if (sinceMand >= per * 0.7) this.startBreath('mand', 'patient'); else this.startBreath('spont', 'patient'); }
      } else if (m === 'PSV' || m === 'CPAP') {
        if (patientTrig) { this.apnea = false; this.startBreath('spont', 'patient'); }
        else if (sinceStart >= (this.apnea ? 5 : 20)) { this.apnea = true; this.startBreath('mand', 'backup'); }
      }
    }

    // ---- delivery
    if (this.phase === 'insp') {
      const mand = this.bKind === 'mand';
      const kind = mand ? (this.bTrig === 'backup' ? 'pc' : this.mandatoryKind()) : 'ps';
      if (kind === 'vc') {
        const qset = s.flow / 60; const tiNom = (s.pattern === 'square' ? 1 : 2) * s.vt / qset;
        const q = s.pattern === 'square' ? qset : qset * Math.max(0.05, 1 - this.phT / tiNom);
        const leakQ = this.lung.leak * Math.sqrt(Math.max(0, this.lastPaw));
        const r = this.flowsForQ(Math.max(0, q - leakQ)); paw = r.paw; qs = r.qs; qY = q;
        if (this.bVolIn >= s.vt || this.phT >= tiNom * 1.05) this.endInsp();
      } else {
        const tgt = kind === 'pc' ? (this.bTrig === 'backup' ? 15 : s.mode === 'PRVC' ? (this.prvcP ?? s.pinsp) : s.mode === 'APRV' ? 0 : s.pinsp) : (s.mode === 'CPAP' ? 0 : s.ps);
        const goal = peep + tgt; this.pRamp += (goal - this.pRamp) * Math.min(1, dt / Math.max(0.02, s.rise / 3));
        let r = this.flowsForPaw(this.pRamp); qs = r.qs; qY = r.q + this.lung.leak * Math.sqrt(Math.max(0, this.pRamp)); paw = this.pRamp;
        // the inspiratory valve cannot absorb gas: if the patient pushes back, the circuit is effectively closed and pressure rises above target
        if (r.q < 0) { const c = this.flowsClosed(); paw = Math.max(this.pRamp, c.paw); qs = c.qs; qY = 0; this.bReversed = true; }
        this.bPeakQ = Math.max(this.bPeakQ, qY);
        if (kind === 'pc') { if (this.phT >= (this.bTrig === 'backup' ? 1 : s.ti)) this.endInsp(); }
        else {
          const cyc = this.phT > 0.1 && qY < (s.cyclePct / 100) * this.bPeakQ;
          const pressureCycle = this.phT > 0.2 && this.flowsClosed().paw > goal + 3; // patient pushing to exhale
          if (pressureCycle) this.bPressureCycled = true;
          if (cyc || pressureCycle || this.phT >= 3 || (s.mode === 'CPAP' && qY < 0)) this.endInsp();
        }
      }
    } else if (this.phase === 'pause' || this.phase === 'ihold') {
      const r = this.flowsClosed(); paw = r.paw; qs = r.qs; qY = 0;
      const dur = this.phase === 'ihold' ? 0.9 : s.pause;
      if (this.phT >= dur) { this.pendingPlat = paw; this.phase = 'exp'; this.phT = 0; }
    } else if (this.phase === 'ehold') {
      const r = this.flowsClosed(); paw = r.paw; qs = r.qs; qY = 0;
      if (this.phT >= 1.2) { this.pendingPeepTot = paw; this.phase = 'exp'; this.phT = 0; this.startBreath('mand', 'time'); }
    } else if (this.phase === 'high' || this.phase === 'low') {
      const target = this.phase === 'high' ? s.phigh : s.plow; const r = this.flowsForPaw(target); paw = target; qs = r.qs; qY = r.q;
      if (this.phase === 'high' && this.phT >= s.thigh) { this.phase = 'low'; this.phT = 0; this.bPip = s.phigh; this.lastPlatTrue = this.meanPalvPassive(); }
      else if (this.phase === 'low' && this.phT >= s.tlow) { this.relRatio = this.relPeak < -0.05 ? qY / this.relPeak : NaN; this.relPeak = 0; this.bTi = s.thigh; this.finishBreath(); this.breathStart = this.t; this.breathTimes.push(this.t); if (this.breathTimes.length > 10) this.breathTimes.shift(); this.bVolIn = 0; this.bVolOut = 0; this.dispVol = 0; this.phase = 'high'; this.phT = 0; }
      if (this.phase === 'low') this.relPeak = Math.min(this.relPeak, qY);
    }

    // ---- disconnection: what the ventilator sees is its own flow escaping (a small open-circuit pressure, nothing returning
    // through the expiratory limb); the patient's lung empties to atmosphere through the tube and loses its PEEP
    if (this.disconnected) {
      const r = this.flowsForPaw(0); qs = r.qs;
      const machineQ = this.phase === 'insp' ? Math.max(0, qY) : 0;
      paw = 0.25 + 1.2 * machineQ; qY = machineQ;
    }
    // ---- integrate volumes (with expiratory flow limitation)
    for (let k = 0; k < 2; k++) {
      const c = this.lung.comps[k]; if (!c.connected) { this.V[k] = Math.max(0, this.V[k] - this.V[k] * dt * 2); qs[k] = 0; continue; }
      let q = qs[k]; if (q < 0 && c.flowLimit > 0) q = Math.max(q, -c.flowLimit * (this.V[k] + 0.03));
      const v0 = this.V[k]; let v1 = Math.max(-0.02, v0 + q * dt);
      if (c.collapsed > 0) v1 = Math.min(v1, Math.max(v0, (1 - c.collapsed) * 1.2));
      this.V[k] = v1; qs[k] = (v1 - v0) / dt; // flow at the airway is only what actually moved
    }
    const qPt = qs[0] + qs[1]; if (!this.disconnected && (this.phase === 'exp' || this.phase === 'low')) qY = qPt - (qPt < 0 ? 0 : 0);
    // measured exhaled volume excludes gas lost around the cuff
    if (qY > 0) this.bVolIn += qY * dt; else this.bVolOut += -qY * dt * (1 - Math.min(0.6, this.lung.leak * 2));
    this.dispVol += (qY > 0 ? qY : qY * (1 - Math.min(0.6, this.lung.leak * 2))) * dt;
    if (this.phase === 'insp' || this.phase === 'high') this.bPip = Math.max(this.bPip, paw);
    if (this.phase === 'insp') {
      this.bEffortInsp = Math.max(this.bEffortInsp, pm);
      // "scoop": how far the patient pulls airway pressure below the passive trace. In volume control that is Pmus itself;
      // in pressure-targeted breaths the ventilator adds flow to hold the target, so only a shortfall below target counts.
      const flowFixed = this.bKind === 'mand' && this.bTrig !== 'backup' && this.mandatoryKind() === 'vc';
      this.bScoop = Math.max(this.bScoop, flowFixed ? pm : this.phT > this.s.rise + 0.05 ? Math.max(0, this.pRamp - paw) : 0);
    }
    this.bPmeanAcc += paw * dt; this.bPmeanT += dt;
    this.qPrev = qY; this.lastQ = qY; this.lastPaw = paw; this.lastPalv = [this.palv(0), this.palv(1)];
    this.updateUnits();
    return { t: this.t, paw, flow: qY * 60, vol: this.dispVol * 1000, palv: this.lastPalv, pmus: pm, phase: this.phase };
  }
  /**
   * Neural-breath bookkeeping. Each patient effort is followed from onset to end so that
   * dyssynchrony is classified from timing, the way an oesophageal-pressure tracing would:
   *  - an effort that begins in expiration and never triggers = ineffective effort
   *  - machine cycles off before the effort ends = premature cycling (cycleLag < 0)
   *  - machine keeps inflating after the effort ends = delayed cycling (cycleLag > 0)
   */
  private neural() {
    const p = this.pt; if (!(p.pmax > 0) || !(p.rate > 0)) return;
    const per = 60 / p.rate; const idx = Math.floor(this.t / per); const ph = this.t - idx * per; const ti = Math.min(p.ti, per * 0.85);
    if (idx !== this.nIdx) {
      if (this.nIdx >= 0 && !this.nTrig && this.nStartedExp && p.pmax >= 2) this.ineffective++;
      this.nIdx = idx; this.nTrig = false; this.nEnded = false; this.nStartedExp = this.phase === 'exp' || this.phase === 'low' || this.phase === 'high';
    }
    if (!this.nEnded && ph >= ti) {
      this.nEnded = true; this.nEndT = this.t;
    }
  }
  private nIdx = -1; private nTrig = false; private nEnded = false; private nStartedExp = false; private nEndT = 0; private bNIdx = -1; bCycleLag: number | null = null;
  private bEndExpQ = 0; private bEndExpQNext = 0; bVolAbove = 0; Veq = 0; bScoop = 0;
  relRatio = NaN; private relPeak = 0; bReversed = false; bPressureCycled = false; bMinPawMid = 99; bEffortInsp = 0;

  /** Run for `seconds`, returning sampled frames every `every` seconds. */
  run(seconds: number, dt = 0.002, every = 0.02): SimFrame[] {
    const out: SimFrame[] = []; let acc = 0; const n = Math.round(seconds / dt);
    for (let i = 0; i < n; i++) { const f = this.step(dt); acc += dt; if (acc >= every - 1e-9) { out.push(f); acc = 0; } }
    return out;
  }

  /** Dyssynchrony summary over the recent breaths (what a clinician would notice at the bedside). */
  recent(n = 8) {
    const h = this.history.slice(-n); const dur = h.reduce((a, b) => a + b.ti + Math.max(0, b.te), 0) || 1;
    return {
      breaths: h.length,
      doubleTrigger: h.filter((b) => b.doubleTriggered).length,
      ineffectivePerMin: h.reduce((a, b) => a + b.ineffective, 0) / dur * 60,
      pressureCycled: h.filter((b) => b.pressureCycled || b.fightingEnd).length,
      patientTriggered: h.filter((b) => b.triggered === 'patient').length,
      autoPeep: h.length ? h.reduce((a, b) => a + b.autoPeepTrue, 0) / h.length : 0,
      prematureCycle: h.filter((b) => b.cycleLag != null && b.cycleLag < -0.15).length,
      delayedCycle: h.filter((b) => b.cycleLag != null && b.cycleLag > 0.3).length,
      meanCycleLag: (() => { const l = h.filter((b) => b.cycleLag != null).map((b) => b.cycleLag!); return l.length ? l.reduce((a, b) => a + b, 0) / l.length : 0; })(),
      stacked: h.filter((b) => b.stackedVolume).length,
      /** mean inspiratory muscle pressure during machine inflation — high = patient still pulling (flow starvation / under-assist) */
      effortInsp: h.length ? h.reduce((a, b) => a + b.effortDuringInsp, 0) / h.length : 0,
      /** breaths that started before expiratory flow returned to zero */
      scoop: h.length ? h.reduce((a, b) => a + b.scoop, 0) / h.length : 0,
      flowNotZero: h.filter((b) => b.endExpFlow < -4).length,
    };
  }
  /** Averages over the recent breaths — what the gas-exchange model consumes. */
  ventilation() {
    const h = this.history.slice(-5); if (!h.length) return { vte: 0, rr: 0, mv: 0, pmean: this.s.peep, pplatEst: this.s.peep, autoPeep: 0 };
    const avg = (f: (b: BreathStats) => number) => h.reduce((a, b) => a + f(b), 0) / h.length;
    const rr = this.breathTimes.length >= 2 ? 60 * (this.breathTimes.length - 1) / (this.breathTimes[this.breathTimes.length - 1] - this.breathTimes[0]) : this.s.rr;
    return { vte: avg((b) => b.vte), rr, mv: avg((b) => b.vte) * rr, pmean: avg((b) => b.pmean), pplatEst: this.estPlateau(), autoPeep: avg((b) => b.autoPeepTrue) };
  }
  /** "True" end-inspiratory alveolar pressure of the last breath (what a hold would show). */
  estPlateau() { return this.lastPlatTrue; }
  lastPlatTrue = 0;
  /** Per-compartment facts for the 3D view. */
  regional() {
    return [0, 1].map((k) => ({ volume: this.V[k], open: this.openFrac(k), ptp: this.ptp(k), palv: this.palv(k), overdist: Math.max(0, this.ptp(k) - this.lung.comps[k].overdistP * 0.85), collapsed: this.lung.comps[k].collapsed, connected: this.lung.comps[k].connected }));
  }
  meanPalvPassive() { let s = 0, n = 0; for (let k = 0; k < 2; k++) if (this.lung.comps[k].connected) { s += this.ptp(k); n++; } return (n ? s / n : 0) + (this.V[0] + this.V[1]) / this.lung.Ccw + this.lung.tension; }
  /** Time constant of the respiratory system, s. */
  tau() { let g = 0, c = 0; for (let k = 0; k < 2; k++) if (this.lung.comps[k].connected) { g += 1 / (this.lung.comps[k].R * this.lung.comps[k].rExp); c += this.effC(k); } return (1 / Math.max(1e-6, g) + this.lung.Rett) * this.systemC(); }
}
