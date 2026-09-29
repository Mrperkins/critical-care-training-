/**
 * VentSession — the running ventilator: one Mechanics instance + the scenario's lung, the
 * patient's gas exchange (shared SyntheticPatient) and a ring buffer of samples that the
 * waveform canvas, the 3D lungs and the numbers all read from. There is one source of truth:
 * everything on screen is sampled from this object.
 */
import { Mechanics, type VentSettings, type PatientEffort, type SimFrame, type Phase } from '../physiology/mechanics';
import { VENT_SCENARIO, buildLung, scenarioSettings, type VentScenario, type Fix } from '../scenarios/vent';
import { DYSS, type DyssId } from '../scenarios/dyssynchrony';
import { createPatient, advance, derive, type PatientState, type Snapshot, type VentInput } from '../physiology/patient';

const N = 4096; // ring buffer (≈ 41 s at 10 ms)
export const PHASE_CODE: Record<Phase, number> = { exp: 0, insp: 1, pause: 2, ihold: 3, ehold: 4, high: 5, low: 6 };

export interface LoopPoint { p: number; q: number; v: number }

export class VentSession {
  m!: Mechanics; sc!: VentScenario; dyss: DyssId | null = null;
  effort: PatientEffort = { pmax: 0, rate: 0, ti: 1, expPush: 0 };
  // interventions / time-varying lung state
  spasm = 0; bdT = -1; suctionT = -1; decompT = -1; bronchT = -1; tubeT = -1; paralysed = false;
  /** chest drain occluded (kink / clot / clamp) while the lung still leaks air: tension re-accumulates */ drainBlocked = false; reTension = 0;
  baseRett = 4; baseRettQ = 1.5; baseTension = 0; baseCollapsed: [number, number] = [0, 0]; plugR: number | null = null;
  // buffers
  t = new Float64Array(N); paw = new Float32Array(N); flow = new Float32Array(N); vol = new Float32Array(N); pmus = new Float32Array(N); ph = new Uint8Array(N); palv = new Float32Array(N);
  head = 0; count = 0; private acc = 0; private sampleEvery = 0.01;
  loop: LoopPoint[] = []; prevLoop: LoopPoint[] = []; private lastPhase: Phase = 'exp';
  // ventilation-share tracking for the gas-exchange link
  private vMin: [number, number] = [9, 9]; private vMax: [number, number] = [-9, -9]; share: [number, number] = [0.55, 0.45];
  // gas exchange
  pt!: PatientState; snap!: Snapshot; private ptAcc = 0; physioSpeed = 10; baseCO = 5;
  speed = 1; paused = false; version = 0; breathN = 0; changedAt = 0;

  constructor(id = 'normal') { this.load(id); }

  load(id: string, dyss: DyssId | null = null) {
    const sc = VENT_SCENARIO[id] ?? VENT_SCENARIO.normal; this.sc = sc; this.dyss = dyss;
    const d = dyss ? DYSS[dyss] : null;
    this.effort = { ...(d ? d.effort : sc.effort) };
    this.spasm = sc.spasm; this.bdT = -1; this.suctionT = -1; this.decompT = -1; this.bronchT = -1; this.tubeT = -1; this.paralysed = false; this.drainBlocked = false; this.reTension = 0; this.circuitFault = 'none';
    const lung = buildLung(sc, this.spasm);
    this.baseRett = lung.Rett; this.baseRettQ = lung.RettQ; this.baseTension = lung.tension; this.baseCollapsed = [lung.comps[0].collapsed, lung.comps[1].collapsed];
    this.plugR = sc.lung.right && (sc.lung.right as { rFixed?: number }).rFixed != null ? (sc.lung.right as { rFixed?: number }).rFixed! : null;
    const s: VentSettings = { ...scenarioSettings(sc), ...(d ? d.bad : {}) };
    this.m = new Mechanics(s, lung, this.effort);
    this.head = 0; this.count = 0; this.loop = []; this.prevLoop = []; this.breathN = 0; this.changedAt = 0;
    const { recruitShunt: _r, ...gas } = sc.gas; this.baseCO = sc.gas.co ?? 5;
    this.pt = createPatient({ ...gas, fio2: s.fio2 }, { paco2: sc.gas.setCO2 ?? 40, renalAdj: sc.gas.setCO2 ? 0.4 * (sc.gas.setCO2 - 40) : 0 });
    // warm up so the screen opens on a steady state
    for (let i = 0; i < 6000; i++) this.stepOnce(0.002, false);
    this.pt.vent = this.ventInput(); this.updateGasParams(); advance(this.pt, 20); this.snap = derive(this.pt);
    this.version++;
  }

  set(patch: Partial<VentSettings>) {
    const s = this.m.s; const modeChanged = patch.mode && patch.mode !== s.mode;
    Object.assign(s, patch);
    if (modeChanged) { this.m.prvcP = null; if (s.mode === 'APRV') { this.m.phase = 'high'; this.m.phT = 0; } }
    if (patch.fio2 != null) this.pt.p.fio2 = patch.fio2;
    this.version++; this.changedAt = this.breathN;
  }
  hold(kind: 'i' | 'e') { this.m.holdReq = kind; }
  /** Circuit faults for the low-pressure alarm: none, a cuff leak (gas escapes around the cuff), or a disconnection at the wye. */
  circuitFault: 'none' | 'cuffLeak' | 'disconnect' | 'both' = 'none';
  circuit(f: 'none' | 'cuffLeak' | 'disconnect' | 'both') {
    this.circuitFault = f; this.m.disconnected = f === 'disconnect' || f === 'both'; this.m.lung.leak = f === 'cuffLeak' || f === 'both' ? 0.12 : 0;
    this.version++; this.changedAt = this.breathN;
  }
  /** Occlude / reopen an inserted chest drain (kink, clot, clamp). Only matters once a drain is in. */
  setDrainBlocked(b: boolean) { this.drainBlocked = b; this.version++; this.changedAt = this.breathN; }
  /** Pleural pressure now (cmH₂O, relative to the relaxed chest): chest-wall recoil − muscle effort + trapped air. */
  pleural() { return this.m.pcw(); }

  intervene(f: Fix | 'bronchodilator') {
    if (f === 'bronchodilator') this.bdT = 0;
    if (f === 'suction') this.suctionT = 0;
    if (f === 'decompress') this.decompT = 0;
    if (f === 'bronchoscopy') this.bronchT = 0;
    if (f === 'chestTube') this.tubeT = 0;
    if (f === 'paralyse') { this.paralysed = true; this.m.pt = { pmax: 0, rate: 0, ti: 1, expPush: 0 }; }
    this.version++; this.changedAt = this.breathN;
  }
  /** Bronchodilator effect 0–1. Time-compressed for teaching: full effect in ~12 s of screen time (≈15 min at the bedside). */
  bdEffect() { return this.bdT < 0 ? 0 : Math.min(1, this.bdT / 12) ** 1.4; }
  /** Current bronchospasm 0–1 (drives resistance AND airway calibre in 3D). */
  spasmNow() { return this.spasm * (1 - 0.85 * this.bdEffect()); }

  private applyTimeVarying(dt: number) {
    const l = this.m.lung; const sc = this.sc;
    if (this.bdT >= 0) this.bdT += dt;
    const sp = this.spasmNow(); const rs = sc.lung.rSpasm ?? 0;
    l.comps.forEach((c, k) => {
      const fixed = k === 0 && this.plugR != null ? this.plugR : (sc.lung.rFixed ?? (k === 0 ? 4 : 4.5));
      c.R = fixed + rs * sp;
    });
    if (this.suctionT >= 0) { this.suctionT += dt; const f = Math.min(1, this.suctionT / 2); l.Rett = this.baseRett + (4 - this.baseRett) * f; l.RettQ = this.baseRettQ + (1.5 - this.baseRettQ) * f; }
    if (this.decompT >= 0) { this.decompT += dt; const f = Math.min(1, this.decompT / 6); l.tension = this.baseTension * (1 - Math.min(1, f * 3)); l.comps.forEach((c, k) => (c.collapsed = this.baseCollapsed[k] * (1 - 0.85 * f))); }
    // chest drain: definitive — pleural air evacuated, tension gone and the lung fully re-expands (over ~10 s of screen time)
    if (this.tubeT >= 0) { this.tubeT += dt; const f = Math.min(1, this.tubeT / 10); const needle = this.decompT >= 0 ? Math.min(1, this.decompT / 6) : 0;
      l.tension = this.baseTension * (1 - Math.max(Math.min(1, f * 3), Math.min(1, needle * 3))); l.comps.forEach((c, k) => (c.collapsed = this.baseCollapsed[k] * (1 - Math.max(f, 0.85 * needle))));
      // an occluded drain on positive pressure with an ongoing leak: air accumulates again (~20 s of screen time to full tension); clears over ~6 s once patent
      this.reTension = this.drainBlocked ? Math.min(1, this.reTension + dt / 20) : Math.max(0, this.reTension - dt / 6);
      if (this.reTension > 0) { l.tension = Math.max(l.tension, this.baseTension * this.reTension); l.comps.forEach((c, k) => (c.collapsed = Math.max(c.collapsed, 0.8 * this.baseCollapsed[k] * this.reTension))); } }
    if (this.bronchT >= 0 && this.plugR != null) { this.bronchT += dt; const f = Math.min(1, this.bronchT / 3); this.plugR = 150 + (4 - 150) * f; if (f >= 1) this.plugR = 4; }
  }

  private stepOnce(dt: number, record = true) {
    this.applyTimeVarying(dt);
    const f = this.m.step(dt);
    // loops: one breath at a time
    if (f.phase === 'insp' && this.lastPhase !== 'insp' && this.lastPhase !== 'high') { this.prevLoop = this.loop; this.loop = []; this.trackShare(); }
    if (this.m.s.mode === 'APRV' && f.phase === 'high' && this.lastPhase === 'low') { this.prevLoop = this.loop; this.loop = []; this.trackShare(); }
    this.lastPhase = f.phase;
    for (let k = 0; k < 2; k++) { this.vMin[k] = Math.min(this.vMin[k], this.m.V[k]); this.vMax[k] = Math.max(this.vMax[k], this.m.V[k]); }
    if (!record) return;
    this.acc += dt;
    if (this.acc >= this.sampleEvery - 1e-9) { this.acc = 0; this.push(f); if (this.loop.length < 1200) this.loop.push({ p: f.paw, q: f.flow, v: f.vol }); }
  }
  private trackShare() {
    this.breathN++;
    const sw = [0, 1].map((k) => Math.max(0, this.vMax[k] - this.vMin[k])); const tot = sw[0] + sw[1];
    if (tot > 0.02) this.share = [sw[0] / tot, sw[1] / tot];
    this.vMin = [9, 9]; this.vMax = [-9, -9];
  }
  private push(f: SimFrame) {
    const i = this.head; this.t[i] = f.t; this.paw[i] = f.paw; this.flow[i] = f.flow; this.vol[i] = f.vol; this.pmus[i] = f.pmus; this.ph[i] = PHASE_CODE[f.phase]; this.palv[i] = (f.palv[0] + f.palv[1]) / 2;
    this.head = (i + 1) % N; this.count = Math.min(N, this.count + 1);
  }
  /** Sample i steps back from the newest (0 = newest). */
  at(back: number) { return (this.head - 1 - back + N * 4) % N; }

  /** Advance by wall-clock seconds. */
  tick(realDt: number) {
    if (this.paused) return;
    const sim = Math.min(0.1, realDt) * this.speed; const n = Math.max(1, Math.round(sim / 0.002));
    for (let i = 0; i < n; i++) this.stepOnce(0.002);
    this.ptAcc += sim;
    if (this.ptAcc > 0.25) { this.updateGasParams(); advance(this.pt, this.ptAcc * this.physioSpeed / 60, this.ventInput()); this.snap = derive(this.pt); this.ptAcc = 0; }
  }

  ventInput(): VentInput {
    const v = this.m.ventilation(); const s = this.m.s;
    return { vte: v.vte, rr: v.rr, fio2: s.fio2, peep: s.mode === 'APRV' ? s.plow : s.peep, pmean: v.pmean, pplat: this.m.estPlateau(), autoPeep: v.autoPeep };
  }
  /** Link mechanics → gas exchange: collapsed recruitable lung and unventilated lung become shunt; tension lowers cardiac output. */
  updateGasParams() {
    const sc = this.sc; const g = sc.gas; const reg = this.m.regional(); const rec = sc.lung.recruitable ?? 0;
    let shunt = g.shunt ?? 0.03;
    if (rec > 0 && g.recruitShunt) { const collapsed = reg.reduce((a, r) => a + (1 - r.open), 0) / 2; shunt += g.recruitShunt * collapsed / rec; }
    const perf = [0.55, 0.45]; for (let k = 0; k < 2; k++) shunt += perf[k] * Math.max(0, 1 - this.share[k] / perf[k]) * 0.55;
    this.pt.p.shunt = Math.min(0.75, shunt);
    this.pt.p.co = this.baseCO * Math.max(0.3, 1 - 0.06 * this.m.lung.tension); // tension compresses the great veins
    this.pt.p.fio2 = this.m.s.fio2;
  }
  /** Put an existing patient (e.g. one you just watched breathing on their own) on this ventilator. */
  attachPatient(pt: PatientState) { this.pt = pt; this.baseCO = pt.p.co; pt.p.fio2 = this.m.s.fio2; this.updateGasParams(); pt.vent = this.ventInput(); this.snap = derive(pt); this.version++; }
  /** Fast-forward the patient's physiology (not the waveforms) on the current settings. */
  fastForward(minutes: number) { this.updateGasParams(); advance(this.pt, minutes, this.ventInput()); this.snap = derive(this.pt); this.version++; }
}

export const session = new VentSession('normal');
