/**
 * AbgLab — the running blood-gas patient. Holds a SyntheticPatient, lets the learner change
 * causes (ventilation, FiO₂, metabolism, Hb, V/Q, shunt, dead space, acid/base load), and
 * advances physiological time. The 3D scene, the ABG/VBG cards and the acid–base map all read
 * the same snapshot.
 */
import { createPatient, advance, derive, settle, type PatientState, type Snapshot, type PatientParams, type DrugId, give } from '../physiology/patient';
import { ABG_PRESET, type AbgPreset } from '../scenarios/abg';

export interface TrailPt { t: number; pH: number; paco2: number; hco3: number }
export type Knob = 'fio2' | 'vco2' | 'vo2' | 'hb' | 'lowVQ' | 'shunt' | 'vdAlv' | 'co' | 'drive';

export class AbgLab {
  preset!: AbgPreset; pt!: PatientState; snap!: Snapshot; base!: PatientParams;
  control: 'own' | 'set' = 'own'; rr = 14; vt = 0.5; metab = 0; // mEq/L added base (+) or acid (−)
  trail: TrailPt[] = []; physioSpeed = 20; version = 0; private acc = 0;
  constructor() { this.load('normal'); }

  load(id: string) {
    const p = ABG_PRESET[id] ?? ABG_PRESET.normal; this.preset = p; this.metab = 0;
    this.pt = createPatient(p.params, p.init ?? {}); this.base = { ...this.pt.p };
    if (p.vent) { this.control = 'set'; this.rr = p.vent.rr; this.vt = p.vent.vt; this.applyVent(); } else { this.control = 'own'; this.pt.vent = null; }
    settle(this.pt, p.settle); this.snap = derive(this.pt);
    if (!p.vent) { this.rr = Math.round(this.snap.rr); this.vt = Math.round(this.snap.vt * 100) / 100; }
    this.trail = [this.point()]; this.version++;
  }
  point(): TrailPt { return { t: this.pt.t, pH: this.snap.pH, paco2: this.snap.paco2, hco3: this.snap.hco3 }; }
  private applyVent() { this.pt.vent = this.control === 'set' ? { vte: this.vt, rr: this.rr, fio2: this.pt.p.fio2, peep: 5, pmean: 8, pplat: 15, autoPeep: 0 } : null; }
  setControl(c: 'own' | 'set') { this.control = c; if (c === 'set') { this.rr = Math.round(this.snap.rr); this.vt = Math.round(this.snap.vt * 100) / 100; } this.applyVent(); this.refresh(); }
  setVent(rr: number, vt: number) { this.rr = rr; this.vt = vt; this.control = 'set'; this.applyVent(); this.refresh(); }
  set(k: Knob, v: number) { (this.pt.p as unknown as Record<string, number>)[k] = v; if (k === 'fio2') this.applyVent(); this.refresh(); }
  /** Metabolic handle: add acid (unmeasured anion) or base (chloride loss) in mEq/L. */
  setMetab(d: number) { this.metab = d; this.pt.p.otherUA = (this.base.otherUA ?? 0) + Math.max(0, -d); this.pt.p.cl = (this.base.cl ?? 104) - Math.max(0, d); this.refresh(); }
  give(id: DrugId) { give(this.pt, id); this.refresh(); }
  private refresh() { this.snap = derive(this.pt); this.version++; }

  /** Real-time tick: physiology runs ×physioSpeed so a change is visible within seconds. */
  tick(realDt: number) {
    this.acc += Math.min(0.1, realDt) * this.physioSpeed;
    if (this.acc > 2) { this.step(this.acc / 60); this.acc = 0; }
  }
  step(minutes: number) {
    advance(this.pt, minutes); this.snap = derive(this.pt);
    const last = this.trail[this.trail.length - 1]; const pnt = this.point();
    if (!last || Math.abs(last.pH - pnt.pH) > 0.004 || Math.abs(last.paco2 - pnt.paco2) > 0.6 || Math.abs(last.hco3 - pnt.hco3) > 0.3) { this.trail.push(pnt); if (this.trail.length > 400) this.trail.shift(); }
    this.version++;
  }
  fastForward(minutes: number) { const n = Math.max(1, Math.ceil(minutes / 30)); for (let i = 0; i < n; i++) this.step(minutes / n); }
  /** Expected renal compensation target vs what the kidneys have achieved so far (for the kidney view). */
  kidney() { const target = 0.4 * (this.pt.paco2 - 40); return { target, done: this.pt.renalAdj, rate: (target - this.pt.renalAdj) / 1000 * this.pt.p.renal }; }
}

export const lab = new AbgLab();
