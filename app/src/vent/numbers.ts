import type { VentSession } from './session';
import type { VentNumbers } from '../knowledge/ventExplain';
import { ventilationWeight } from '../physiology/patient';

/** The monitored numbers, exactly as a ventilator would display them (Pplat only from a pause/hold, else estimated). */
export function ventNumbers(S: VentSession): VentNumbers {
  const m = S.m; const h = m.history; const last = h[h.length - 1]; const s = m.s;
  const peep = s.mode === 'APRV' ? s.plow : s.peep;
  const recentPlat = [...h].slice(-3).reverse().find((b) => b.pplat != null)?.pplat ?? null;
  const recentPeepTot = [...h].slice(-4).reverse().find((b) => b.peepTotal != null)?.peepTotal ?? null;
  const v = m.ventilation(); const r = m.recent(6);
  const autoPeep = recentPeepTot != null ? Math.max(0, recentPeepTot - peep) : r.autoPeep;
  const peepTot = peep + autoPeep;
  const pplat = recentPlat ?? m.estPlateau();
  const vte = last ? last.vte : 0; const pip = last ? last.pip : peep;
  const dp = Math.max(0, pplat - peepTot);
  const ti = last?.ti ?? 1; const te = last ? Math.max(0.1, last.te) : 2;
  const reg = m.regional(); const snap = S.snap;
  const kg = ventilationWeight(S.pt.p);
  return {
    pip, pplat, pplatMeasured: recentPlat != null, peep, peepTot, autoPeep, dp,
    cstat: dp > 0.5 ? (last?.vti ?? 0) / dp * 1000 : 0, cdyn: (last?.cdyn ?? 0) * 1000,
    raw: last?.raw ?? (s.mode === 'VC' && s.pattern === 'square' && pip > pplat ? (pip - pplat) / (s.flow / 60) : null),
    tau: m.tau(), vte: vte * 1000, vtPerKg: (last?.vti ?? s.vt) * 1000 / kg, rr: v.rr, mv: v.mv, ie: `1:${(te / Math.max(0.1, ti)).toFixed(1)}`, pmean: v.pmean,
    spo2: snap.spo2, etco2: snap.etco2, pH: snap.pH, paco2: snap.paco2, pao2: snap.pao2, map: snap.map, fio2: s.fio2, pf: snap.pf,
    overdist: Math.max(...reg.map((x) => x.overdist)), openFrac: (reg[0].open + reg[1].open) / 2, te,
  };
}
