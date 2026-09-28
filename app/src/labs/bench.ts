/**
 * LabBench — the lab module's patient. The selected lab's value is written into the shared
 * SyntheticPatient (not a separate toy model), so consequences — membrane potential, ECG,
 * cell volume, oxygen content, anion gap, eGFR — come from the same physiology engine.
 */
import { createPatient, derive, advance, give, type PatientState, type Snapshot, type DrugId } from '../physiology/patient';
import { LAB, type Lab } from '../knowledge/labs';

export class LabBench {
  pt!: PatientState; snap!: Snapshot; sel = 'k'; naMode: 'acute' | 'chronic' = 'acute'; version = 0; physioSpeed = 30; running = false; private acc = 0;
  constructor() { this.reset(); }
  reset() { this.pt = createPatient({}); this.snap = derive(this.pt); this.version++; }
  lab(): Lab { return LAB[this.sel]; }
  /** Current value of any lab, read from the patient. */
  value(id: string): number {
    const s = this.snap, p = this.pt.p;
    switch (id) {
      case 'na': return s.na; case 'k': return s.k; case 'cl': return s.cl; case 'hco3': return s.hco3; case 'ca': return p.ca; case 'mg': return p.mg; case 'phos': return p.phos;
      case 'bun': return p.bun; case 'cr': return p.cr; case 'egfr': return s.egfr; case 'glu': return p.glucose; case 'ag': return s.ag; case 'lac': return s.lactate; case 'ket': return s.ketones;
      case 'hb': return p.hb; case 'hct': return p.hb * 3; case 'rbc': return p.hb / 3.05; case 'wbc': return p.wbc; case 'plt': return p.plt;
      case 'pt': return s.pt; case 'inr': return p.inr; case 'aptt': return p.ptt; case 'fib': return p.fibrinogen;
      case 'trop': return p.trop * 1000; case 'bnp': return p.bnp; case 'ast': return p.ast; case 'alt': return p.alt; case 'alp': return p.alp; case 'bili': return p.bili; case 'alb': return p.albumin;
    }
    return NaN;
  }
  /** Move a lab to value v by changing the patient (the cause), then re-derive. */
  set(id: string, v: number) {
    const p = this.pt.p; const st = this.pt;
    switch (id) {
      case 'na': p.cl -= p.na - v; p.na = v; // teaching simplification: strong-ion difference held constant so the acid–base state does not change
        if (this.naMode === 'chronic') st.naBrain = v; st.naHist = [{ t: st.t, na: v }]; break;
      case 'k': { const now = derive(st).k; st.kBal += v - now; break; }
      case 'cl': p.cl = v; break;
      case 'hco3': { const now = derive(st).hco3; p.cl -= v - now; break; } // bicarbonate gained/lost against chloride
      case 'ca': p.ca = v; break; case 'mg': p.mg = v; break; case 'phos': p.phos = v; break;
      case 'bun': p.bun = v; break;
      case 'cr': p.cr = v; break;
      case 'egfr': { let lo = 0.3, hi = 15; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; p.cr = m; if (derive(st).egfr > v) lo = m; else hi = m; } break; }
      case 'glu': p.glucose = v; break;
      case 'ag': { for (let i = 0; i < 6; i++) { const now = derive(st).ag; p.otherUA = Math.max(0, p.otherUA + (v - now)); } break; }
      case 'lac': st.lactate = v; p.lactateProd = Math.max(0.3, v); break;
      case 'ket': st.ketones = v; p.ketoneProd = v > 1 ? v / 8 : 0; break;
      case 'hb': p.hb = v; break; case 'hct': p.hb = v / 3; break; case 'rbc': p.hb = v * 3.05; break;
      case 'wbc': p.wbc = v; break; case 'plt': p.plt = v; break;
      case 'pt': p.inr = v / 12.5; break; case 'inr': p.inr = v; break; case 'aptt': p.ptt = v; break; case 'fib': p.fibrinogen = v; break;
      case 'trop': p.trop = v / 1000; break; case 'bnp': p.bnp = v; break;
      case 'ast': p.ast = v; break; case 'alt': p.alt = v; break; case 'alp': p.alp = v; break; case 'bili': p.bili = v; break; case 'alb': p.albumin = v; break;
    }
    this.snap = derive(st); this.version++;
  }
  give(d: DrugId, dose = 1) { give(this.pt, d, dose); this.running = true; this.snap = derive(this.pt); this.version++; }
  tick(realDt: number) { if (!this.running) return; this.acc += Math.min(0.1, realDt) * this.physioSpeed; if (this.acc > 3) { advance(this.pt, this.acc / 60); this.snap = derive(this.pt); this.acc = 0; this.version++; } }
  fastForward(min: number) { advance(this.pt, min); this.snap = derive(this.pt); this.version++; }
}
export const bench = new LabBench();
