/**
 * LinesSession — the invasive-monitoring bedside. Owns the patient (shared SyntheticPatient
 * engine), the beat synthesiser, one transducer per line, the bed/transducer geometry, and a
 * 250 Hz display buffer that the monitor draws. Monitor numbers are measured FROM the displayed
 * waveform, exactly as a bedside monitor does — so a badly damped or badly levelled line gives
 * wrong numbers on screen, while the "true" values stay available for teaching.
 */
import { createPatient, derive, advance, type PatientState, type Snapshot } from '../physiology/patient';
import { SCENARIO, circFrom, type LinesScenario, type Morph, type Circ } from './hemo';
import { Heart, DT, type Resp } from './synth';
import { Transducer, CM_H2O_TO_MMHG, readFlush, FAULTS, type Fault, type Stopcock } from './transducer';

export type LineId = 'art' | 'cvp';
export type PushKind = 'phenylephrine' | 'epinephrine';
export type Action = 'aspirate' | 'flushForward' | 'straighten' | 'inflateBag' | 'closeStopcock' | 'reconnect' | 'shortenTubing' | 'withdraw';
export const ACTIONS: Record<Action, { label: string; fixes: Fault[] }> = {
  aspirate: { label: 'Off to patient: aspirate / flush to waste, re-flush', fixes: ['smallBubble', 'largeBubble', 'clot'] },
  flushForward: { label: 'Flush toward the patient', fixes: [] },
  straighten: { label: 'Straighten tubing / splint the wrist', fixes: ['kink', 'wall'] },
  inflateBag: { label: 'Inflate bag to 300 mmHg', fixes: ['lowBag'] },
  closeStopcock: { label: 'Cap the port, stopcock back to patient', fixes: ['openAir'] },
  reconnect: { label: 'Occlude hub, new sterile set, aspirate, flush', fixes: ['disconnect'] },
  shortenTubing: { label: 'Swap for a short, stiff line', fixes: ['longTubing'] },
  withdraw: { label: 'Provider repositions tip (after CXR)', fixes: ['migrated'] },
};
export interface Setup { bedH: number; hob: number; transH: number }
/** Phlebostatic axis (4th intercostal space, mid-axillary line ≈ half the chest's AP depth) height above the floor, cm. */
export const axisHeight = (bedH: number, hob: number) => { const r = (hob * Math.PI) / 180; return bedH + 57 * Math.sin(r) + 12 * Math.cos(r); };

export interface Numbers {
  hr: number; sys: number; dia: number; map: number; pp: number; cvp: number; cvpEE: number; ppv: number | null; spv: number | null;
  /** the same measurements on the TRUE radial / catheter-tip pressure (what a perfect system would show) */
  tSys: number; tDia: number; tMap: number; tCvp: number; tCvpEE: number;
  aoSys: number; aoDia: number; aoMap: number;
}
export interface Alarm { id: string; text: string; level: 'high' | 'med' }

const N = 250 * 24;
/**
 * Norepinephrine vasoconstriction: saturating (Hill/Emax) dose–response on SVR.
 * Effect = Emax · D^n / (EC50^n + D^n), D in µg/kg/min. Teaching parameters: at 0.1 the SVR rises
 * ~55 %, and by 0.5 it approaches its ceiling (≈ +120 %). Replaces an unbounded linear response.
 */
export const NORE_EMAX = 1.25, NORE_EC50 = 0.12, NORE_HILL = 1.3;
export function noreEffect(dose: number) { if (dose <= 0) return 0; const x = dose ** NORE_HILL; return (NORE_EMAX * x) / (NORE_EC50 ** NORE_HILL + x); }

export class LinesSession {
  pt!: PatientState; snap!: Snapshot; sc!: LinesScenario; morph!: Morph; circ!: Circ;
  heart!: Heart; art!: Transducer; cvp!: Transducer;
  resp: Resp = { mode: 'spont', rr: 14, swing: 3.5 }; vt = 8;
  setup: Setup = { bedH: 70, hob: 30, transH: axisHeight(70, 30) };
  pressor = 0; pressorTarget = 0; /** dobutamine effect level (1 ≙ 5 µg/kg/min) */ ino = 0; inoTarget = 0; relief = 0; reliefTarget = 0; /** push-dose vasopressor boluses (screen seconds on the heart clock) */ boluses: { kind: PushKind; mcg: number; t0: number }[] = []; physioSpeed = 30; private bolusAcc = 0; private acc = 0; private numAcc = 0;
  version = 0; frozen = false;
  // display ring buffer
  t = new Float64Array(N); ecg = new Float32Array(N); artD = new Float32Array(N); cvpD = new Float32Array(N); artT = new Float32Array(N); cvpT = new Float32Array(N); ao = new Float32Array(N); pit = new Float32Array(N); insp = new Uint8Array(N);
  head = 0; count = 0; private sub = 0;
  beats: { tq: number; pvc: boolean; cannon: boolean }[] = []; breaths: number[] = []; atria: { tp: number; cannon: boolean }[] = [];
  num: Numbers = { hr: 0, sys: 0, dia: 0, map: 0, pp: 0, cvp: 0, cvpEE: 0, ppv: null, spv: null, tSys: 0, tDia: 0, tMap: 0, tCvp: 0, tCvpEE: 0, aoSys: 0, aoDia: 0, aoMap: 0 };
  nibp: { s: number; d: number; m: number; at: number } | null = null; nibpDue = -1;
  alarms: Alarm[] = []; log: { t: number; text: string }[] = [];

  constructor() { this.load('normal'); }

  load(id: string) {
    const sc = SCENARIO[id] ?? SCENARIO.normal; this.sc = sc; this.morph = { ...sc.morph };
    this.setup = { bedH: 70, hob: 30, transH: axisHeight(70, 30) };
    this.pt = createPatient({ ...sc.params }); this.pressor = this.pressorTarget = 0; this.ino = this.inoTarget = 0; this.acc = 0; this.numAcc = 0; this.sub = 0; this.relief = this.reliefTarget = 0; this.boluses = []; this.bolusAcc = 0; // accumulators and therapies restart with the patient so a reload is reproducible
    const onVent = id === 'hypovol' || id === 'sepsis' || id === 'cardiogenic';
    this.setVent(onVent ? 'ppv' : 'spont', false);
    this.recompute(true);
    this.heart = new Heart(this.circ, this.resp);
    const map0 = this.circ.cvp + (this.circ.sv * this.circ.hr / 60) * this.circ.R;
    this.art = new Transducer(map0); this.cvp = new Transducer(this.circ.cvp);
    this.head = 0; this.count = 0; this.beats = []; this.breaths = []; this.atria = []; this.nibp = null; this.nibpDue = -1; this.alarms = []; this.log = [];
    // settle the circulation and fill the display
    for (let i = 0; i < 6000; i++) this.stepOnce();
    this.measure(); this.version++;
  }

  setVent(mode: 'spont' | 'ppv', rebuild = true) {
    this.resp = mode === 'ppv' ? { mode, rr: 16, swing: 6 * (this.vt / 8) } : { mode, rr: 14, swing: 3.5 * (1 + 0.7 * (this.morph?.tamponade ?? 0)) };
    if (this.pt) this.pt.vent = mode === 'ppv' ? { vte: this.vt * 0.07, rr: 16, fio2: 0.4, peep: 5, pmean: 9 + (this.vt - 8) * 0.6, pplat: 16 + (this.vt - 8) * 1.8, autoPeep: 0 } : null;
    if (rebuild && this.heart) { this.heart.resp = this.resp; this.recompute(); }
  }
  setVt(vt: number) { this.vt = vt; if (this.resp.mode === 'ppv') this.setVent('ppv'); }

  /** Rebuild the circulation from the patient + therapy (called ~1/s and after any change). */
  recompute(first = false) {
    const p0 = this.pt.p; const lvF = this.morph.lvFail ?? 0; const tam = (this.sc.morph.tamponade ?? 0) * (1 - this.relief);
    this.morph.tamponade = tam;
    // pericardiocentesis: lift the compression
    const relieved = this.relief;
    const nr = this.noreReflex(p0); const bo = this.bolusEffect();
    const p = { ...p0,
      // norepinephrine (α1 ≫ β1) saturates (Emax); the baroreflex slows the heart as pressure rises;
      // dobutamine (β1 ≫ β2): contractility ↑ → output ↑, mild arteriolar dilation, some tachycardia
      svr: p0.svr * this.noreSvrFactor() * (1 - 0.14 * this.ino) * bo.svr,
      hr: p0.hr * nr.hr * (1 + 0.1 * this.ino) * (1 - 0.22 * relieved) * bo.hr,
      co: p0.co * nr.co * (1 + 0.38 * this.ino) * bo.co + (5 - p0.co) * relieved * (this.sc.morph.tamponade ? 1 : 0),
      cvp: p0.cvp + (7 - p0.cvp) * relieved * (this.sc.morph.tamponade ? 1 : 0),
    };
    const s = derive({ ...this.pt, p });
    this.snap = s;
    const vol = Math.min(1.25, p.volume);
    this.circ = circFrom(s, p, { ...this.morph, lvFail: lvF }, { volume: vol, pressor: this.pressor });
    if (!first && this.heart) this.heart.setCirc(this.circ);
  }

  /** SVR multiplier from the current norepinephrine level */
  noreSvrFactor() { return 1 + noreEffect(this.pressor * 0.15); }
  /**
   * Baroreflex to norepinephrine: vagal slowing in proportion to how far the vasoconstriction would push
   * MAP (≈ CVP + CO·SVR/80) above the reflex set point (~88 mmHg). A hypotensive patient being restored
   * toward the set point gets little slowing; a normotensive one slows markedly. Returns the reflex
   * heart-rate factor and the output factor (β1 push, fewer beats only partly offset by bigger strokes,
   * and the afterload cost of a higher SVR).
   */
  noreReflex(p0: { co: number; svr: number; cvp: number }) {
    const e = noreEffect(this.pressor * 0.15); if (e <= 0) return { hr: 1, co: 1 };
    const SET = 88; const map0 = p0.cvp + (p0.co * p0.svr) / 80, map1 = p0.cvp + (p0.co * p0.svr * (1 + e)) / 80;
    const over = Math.max(0, map1 - Math.max(map0, SET)) / SET;
    const vagal = 0.45 * Math.min(0.6, over);
    return { hr: (1 + 0.05 * e / NORE_EMAX) * (1 - vagal), co: (1 + 0.04 * e / NORE_EMAX) * (1 - 0.5 * vagal) * (1 - 0.05 * e) };
  }
  /** SVR the circulation is running with (all therapies applied) */
  effectiveSvr() { return this.pt.p.svr * this.noreSvrFactor() * (1 - 0.14 * this.ino) * this.bolusEffect().svr; }
  /**
   * Push-dose vasopressor bolus (teaching model, time-compressed: onset ≈ 8 s, fades over ~1 min of screen time).
   * Phenylephrine (pure α1): SVR ↑, reflex slowing, output slightly ↓. Epinephrine (α + β): SVR ↑ less, HR and output ↑.
   * Effects scale with dose relative to a typical bolus (phenylephrine 100 µg, epinephrine 10 µg) and saturate.
   */
  pushDose(kind: PushKind, mcg: number) { this.boluses.push({ kind, mcg, t0: this.heart?.t ?? 0 }); this.note(`${kind === 'phenylephrine' ? 'Phenylephrine' : 'Epinephrine'} ${mcg} µg IV push`); this.recompute(); this.version++; }
  bolusEffect(t = this.heart?.t ?? 0) {
    let svr = 1, hr = 1, co = 1;
    for (const b of this.boluses) {
      const dt = t - b.t0; if (dt < 0) continue; const std = b.kind === 'phenylephrine' ? 100 : 10; const tau = b.kind === 'phenylephrine' ? 60 : 35;
      const a = Math.min(2, b.mcg / std) * (1 - Math.exp(-dt / 8)) * Math.exp(-dt / tau); if (a < 1e-3) continue;
      if (b.kind === 'phenylephrine') { svr *= 1 + 0.45 * a; hr *= 1 - 0.12 * a; co *= 1 - 0.04 * a; }
      else { svr *= 1 + 0.18 * a; hr *= 1 + 0.12 * a; co *= 1 + 0.18 * a; }
    }
    return { svr, hr, co };
  }
  /** 500 mL crystalloid. Preload-responsive patients gain stroke volume; a full or failing heart only gains CVP. */
  fluid() {
    const p = this.pt.p; const noReserve = (this.morph.lvFail ?? 0) > 0.3 || (this.morph.rvLoad ?? 0) > 0.3 || (this.morph.tamponade ?? 0) > 0.3;
    if (!noReserve && p.volume < 1.1) { const dv = Math.min(0.1, 1.1 - p.volume); p.volume += dv; p.cvp += dv * 18; p.hr = Math.max(70, p.hr - dv * 90); p.svr = Math.max(p.svr - dv * 1200, 900); }
    else p.cvp += 3;
    this.note('500 mL fluid bolus given'); this.recompute(); this.version++;
  }
  /** norepinephrine µg/kg/min (0.1 ≈ the effect level 0.67) */
  get noreDose() { return Math.round(this.pressorTarget * 0.15 * 100) / 100; }
  setNore(dose: number) { const was = this.noreDose; this.pressorTarget = dose / 0.15; this.note(dose === 0 ? 'Norepinephrine stopped' : was === 0 ? `Norepinephrine started at ${dose} µg/kg/min` : `Norepinephrine ${dose > was ? 'increased' : 'decreased'} to ${dose} µg/kg/min`); this.version++; }
  setPressor(on: boolean) { this.setNore(on ? 0.1 : 0); }
  get dobutamineDose() { return Math.round(this.inoTarget * 5 * 10) / 10; }
  setDobutamine(dose: number) { const was = this.dobutamineDose; this.inoTarget = Math.max(0, Math.min(2, dose / 5)); this.note(dose === 0 ? 'Dobutamine stopped' : was === 0 ? `Dobutamine started at ${dose} µg/kg/min` : `Dobutamine ${dose > was ? 'increased' : 'decreased'} to ${dose} µg/kg/min`); this.version++; }
  /** 1 unit packed red cells: the volume effect of a bolus plus ≈ 1 g/dL haemoglobin */
  transfuse() { const p = this.pt.p; p.hb = Math.min(16, p.hb + 1); this.fluid(); this.log[0] = { ...this.log[0], text: 'PRBC 1 unit given' }; }
  /** jump therapy responses to their targets (used by lessons for a deterministic steady state) */
  settleTherapy() { this.pressor = this.pressorTarget; this.ino = this.inoTarget; this.relief = this.reliefTarget; this.recompute(); }
  pericardiocentesis() { if (!this.sc.morph.tamponade) return; this.reliefTarget = 1; this.note('Pericardiocentesis — 120 mL of blood-stained fluid drained'); this.version++; }
  note(text: string) { this.log.unshift({ t: this.heart?.t ?? 0, text }); if (this.log.length > 12) this.log.pop(); }

  get axis() { return axisHeight(this.setup.bedH, this.setup.hob); }
  /** Level error in cm: + = transducer BELOW the axis (reads high). */
  get levelErr() { return this.axis - this.setup.transH; }
  hydro() { return this.levelErr * CM_H2O_TO_MMHG; }
  levelToAxis() { this.setup.transH = this.axis; this.version++; }

  line(id: LineId) { return id === 'art' ? this.art : this.cvp; }
  setFault(id: LineId, f: Fault) { this.line(id).setFault(f); this.version++; }
  setStopcock(id: LineId, s: Stopcock) { this.line(id).stopcock = s; this.version++; }
  zero(id: LineId) {
    // monitors average the signal for ~1 s when zeroing: wait for the trace to settle at 0 after opening to air
    const L = this.line(id); const arr = id === 'art' ? this.artD : this.cvpD; let sum = 0, n = 0; for (let b = 0; b < Math.min(this.count, 250); b++) { sum += arr[this.at(b)]; n++; }
    L.zero(n ? sum / n + L.zeroRef : undefined); if (L.fault === 'drift' && L.stopcock === 'air') L.fault = 'none'; this.note(`${id === 'art' ? 'Arterial' : 'CVP'} transducer zeroed ${L.stopcock === 'air' ? '(open to air ✓)' : '— WHILE OPEN TO THE PATIENT ✗'}`); this.version++; }
  flush(id: LineId) { this.line(id).fastFlush(this.heart.t); this.version++; }
  /** Carry out a bedside fix. Returns what happened (right fix, wrong fix, or a harmful one). */
  act(id: LineId, a: Action): { ok: boolean; text: string } {
    const L = this.line(id); const f = L.fault; const name = id === 'art' ? 'arterial' : 'CVP';
    let res: { ok: boolean; text: string };
    if (a === 'flushForward' && f === 'clot') res = { ok: false, text: 'Never flush a clot forward: it can embolise into the hand (radial) or the lungs. Aspirate first.' };
    else if (a === 'flushForward' && (f === 'largeBubble' || f === 'smallBubble')) res = { ok: false, text: `Never flush air toward the patient: from a radial line it can travel back up to the brain; from a central line it is a venous air embolism. Turn the stopcock off to the patient and flush the bubble out of the side port to waste.` };
    else if (ACTIONS[a].fixes.includes(f)) { res = { ok: true, text: `${ACTIONS[a].label}: ${FAULTS[f].name.toLowerCase()} fixed on the ${name} line.` }; if (a === 'inflateBag') L.bag = 300; L.setFault('none'); }
    else res = { ok: false, text: `${ACTIONS[a].label} did not change the ${name} trace — that was not the problem.` };
    if (a === 'inflateBag') L.bag = 300;
    this.note(res.text); this.version++; return res;
  }
  startNibp() { this.nibpDue = this.heart.t + 7; this.version++; }

  private stepOnce() {
    const h = this.heart; h.step();
    const hydro = this.hydro();
    const a = this.art.step(h.t, DT, h.rad, hydro);
    const cvTip = this.cvp.fault === 'migrated' ? h.rv : h.ra;
    const c = this.cvp.step(h.t, DT, cvTip, hydro);
    if (++this.sub >= 4) {
      this.sub = 0; const i = this.head;
      this.t[i] = h.t; this.ecg[i] = h.ecg; this.artD[i] = a; this.cvpD[i] = c; this.artT[i] = h.rad; this.cvpT[i] = cvTip; this.ao[i] = h.ao; this.pit[i] = h.pit; this.insp[i] = h.insp ? 1 : 0;
      this.head = (i + 1) % N; this.count = Math.min(N, this.count + 1);
    }
    const lv = h.v[h.v.length - 1]; if (lv && (!this.beats.length || this.beats[this.beats.length - 1].tq !== lv.tq)) { this.beats.push({ tq: lv.tq, pvc: lv.pvc, cannon: false }); if (this.beats.length > 80) this.beats.shift(); }
    const la = h.a[h.a.length - 1]; if (la && (!this.atria.length || this.atria[this.atria.length - 1].tp !== la.tp)) { this.atria.push({ ...la }); if (this.atria.length > 80) this.atria.shift(); }
    if (h.phase < 0.002 && (!this.breaths.length || h.t - this.breaths[this.breaths.length - 1] > 1)) { this.breaths.push(h.t); if (this.breaths.length > 20) this.breaths.shift(); }
  }

  tick(realDt: number) {
    const dt = Math.min(0.1, realDt); const steps = Math.round(dt / DT);
    // therapy responses (seconds)
    const k = Math.min(1, dt / 12); const oldP = this.pressor, oldR = this.relief, oldI = this.ino;
    this.pressor += (this.pressorTarget - this.pressor) * k; this.ino += (this.inoTarget - this.ino) * k; this.relief += (this.reliefTarget - this.relief) * Math.min(1, dt / 6);
    for (let i = 0; i < steps; i++) this.stepOnce();
    // slow physiology on the shared engine
    this.acc += dt * this.physioSpeed;
    if (this.acc > 2 || Math.abs(this.pressor - oldP) > 0.004 || Math.abs(this.ino - oldI) > 0.004 || Math.abs(this.relief - oldR) > 0.004) { if (this.acc > 2) { advance(this.pt, this.acc / 60); this.acc = 0; } this.recompute(); }
    if (this.nibpDue > 0 && this.heart.t >= this.nibpDue) { this.nibpDue = -1; const n = this.num; const j = (x: number) => Math.round(x + (this.heart.rnd() - 0.5) * 4); this.nibp = { s: j(n.tSys - 6), d: j(n.tDia + 3), m: j(n.tMap), at: this.heart.t }; }
    if (this.boluses.length) { this.bolusAcc += dt; if (this.bolusAcc > 0.25) { this.bolusAcc = 0; const t = this.heart.t; this.boluses = this.boluses.filter((b) => t - b.t0 < (b.kind === 'phenylephrine' ? 60 : 35) * 7); this.recompute(); } }
    this.numAcc += dt; if (this.numAcc > 0.5) { this.numAcc = 0; this.measure(); }
  }

  /** index of the sample `back` samples before the newest */
  at(back: number) { return (this.head - 1 - back + N * 2) % N; }
  /** Samples in [t0, t1] of a channel → callback (oldest first). */
  private scan(t0: number, t1: number, f: (i: number) => void) {
    const n = this.count; const tNew = this.t[this.at(0)]; const back = Math.min(n - 1, Math.ceil((tNew - t0) * 250) + 2);
    for (let b = back; b >= 0; b--) { const i = this.at(b); const tt = this.t[i]; if (tt >= t0 && tt <= t1) f(i); }
  }

  /** What the monitor would print, measured from the displayed traces (and the same on the true ones). */
  measure() {
    const tNow = this.heart.t; const ptt = this.circ.ptt + this.circ.pep;
    const bs = this.beats.filter((b) => b.tq > tNow - 8);
    type Acc = { s: number[]; d: number[]; pp: number[]; tq: number[] };
    const A: Acc = { s: [], d: [], pp: [], tq: [] }, T: Acc = { s: [], d: [], pp: [], tq: [] }, O: Acc = { s: [], d: [], pp: [], tq: [] };
    let sumA = 0, sumT = 0, sumO = 0, nM = 0;
    for (let k = 0; k < bs.length - 1; k++) {
      const t0 = bs[k].tq + ptt - 0.05, t1 = bs[k + 1].tq + ptt - 0.05; if (t1 > tNow - 0.02) break;
      if (this.flushOverlap(t0, t1)) continue; // monitors discard fast-flush artefact
      let aMax = -1e9, aMin = 1e9, tMax = -1e9, tMin = 1e9, oMax = -1e9, oMin = 1e9;
      this.scan(t0, t1, (i) => { const a = this.artD[i], tr = this.artT[i], o = this.ao[i]; aMax = Math.max(aMax, a); aMin = Math.min(aMin, a); tMax = Math.max(tMax, tr); tMin = Math.min(tMin, tr); oMax = Math.max(oMax, o); oMin = Math.min(oMin, o); sumA += a; sumT += tr; sumO += o; nM++; });
      if (aMax < -1e8) continue;
      A.s.push(aMax); A.d.push(aMin); A.pp.push(aMax - aMin); A.tq.push(bs[k].tq); T.s.push(tMax); T.d.push(tMin); T.pp.push(tMax - tMin); O.s.push(oMax); O.d.push(oMin);
    }
    const last = (arr: number[], n = 4) => { const s = arr.slice(-n); return s.length ? s.reduce((x, y) => x + y, 0) / s.length : 0; };
    const nb = this.circ.rhythm === 'af' ? 8 : 4;
    const n = this.num;
    n.sys = last(A.s, nb); n.dia = last(A.d, nb); n.map = nM ? sumA / nM : 0; n.pp = n.sys - n.dia;
    n.tSys = last(T.s, nb); n.tDia = last(T.d, nb); n.tMap = nM ? sumT / nM : 0; n.aoSys = last(O.s, nb); n.aoDia = last(O.d, nb); n.aoMap = nM ? sumO / nM : 0;
    const iv = bs.slice(-6).map((b, i, a) => (i ? b.tq - a[i - 1].tq : 0)).filter((x) => x > 0);
    n.hr = iv.length ? 60 / (iv.reduce((x, y) => x + y, 0) / iv.length) : this.circ.hr;
    // CVP: monitors average over several seconds (all phases of breathing)
    let cs = 0, ct = 0, cn = 0; this.scan(tNow - 6, tNow, (i) => { cs += this.cvpD[i]; ct += this.cvpT[i]; cn++; }); n.cvp = cn ? cs / cn : 0; n.tCvp = cn ? ct / cn : 0;
    // end-expiratory CVP: the last 20 % of each expiration (just before the next breath starts)
    const br = this.breaths.filter((b) => b > tNow - 14); let es = 0, et = 0, en = 0;
    for (const b of br) { const T0 = 60 / this.resp.rr; this.scan(b - 0.2 * T0 * 0.6, b - 0.02, (i) => { es += this.cvpD[i]; et += this.cvpT[i]; en++; }); }
    n.cvpEE = en ? es / en : n.cvp; n.tCvpEE = en ? et / en : n.tCvp;
    // pulse-pressure / systolic-pressure variation over the last full breath (valid only in controlled ventilation, regular rhythm)
    const Tb = 60 / this.resp.rr; const win = A.pp.map((pp, i) => ({ pp, s: A.s[i], t: A.tq[i] })).filter((x) => x.t > tNow - Tb * 1.6 - 1);
    if (win.length >= 3) { const pps = win.map((x) => x.pp), ss = win.map((x) => x.s); const mx = Math.max(...pps), mn = Math.min(...pps); n.ppv = (100 * (mx - mn)) / Math.max(1, (mx + mn) / 2); n.spv = Math.max(...ss) - Math.min(...ss); } else { n.ppv = null; n.spv = null; }
    this.alarms = this.checkAlarms();
    this.version++;
  }

  private flushOverlap(t0: number, t1: number) { for (const L of [this.art]) { const f = L.flush.t0; if (L.flushing) return t1 > this.heart.t - 1; if (f > 0 && t0 < f + 1.2 && t1 > f - 0.6) return true; } return false; }
  private checkAlarms(): Alarm[] {
    const n = this.num; const out: Alarm[] = [];
    if (n.pp < 6 && n.map < 20) out.push({ id: 'art-flat', text: 'ART — LOW PRESSURE / CHECK LINE', level: 'high' });
    else if (n.map < 65) out.push({ id: 'map-low', text: `ART MAP LOW ${Math.round(n.map)}`, level: 'high' });
    if (n.sys > 180) out.push({ id: 'sys-high', text: `ART SYS HIGH ${Math.round(n.sys)}`, level: 'med' });
    if (n.hr > 130) out.push({ id: 'hr-high', text: `HR HIGH ${Math.round(n.hr)}`, level: 'med' });
    if (n.hr < 45) out.push({ id: 'hr-low', text: `HR LOW ${Math.round(n.hr)}`, level: 'high' });
    return out;
  }

  flushReading(id: LineId) { const f = this.line(id).flush; if (f.t0 <= 0) return null; const r = readFlush(f.cap, f.ideal); return r ? { ...r, at: f.t0, bagP: f.bagP, cap: f.cap, ideal: f.ideal } : null; }
}

export const lines = new LinesSession();
declare global { interface Window { __lines?: LinesSession } }
if (typeof window !== 'undefined') window.__lines = lines;
