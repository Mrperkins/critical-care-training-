/**
 * SyntheticPatient — the shared physiology engine every module reads from.
 *
 * State variables that have real time constants (body CO₂ stores, lactate, renal HCO₃⁻
 * compensation, potassium balance and shifts, brain osmolyte adaptation, creatinine) are
 * integrated in minutes. Everything else (oxygen transport, ABG/VBG, SpO₂, EtCO₂, anion
 * gap, membrane potential) is derived from the state by pure functions, so each number on
 * screen can be traced to an equation.
 *
 * Gas exchange uses three parallel lung compartments (normal V/Q, low V/Q, shunt) with an
 * iterated mixed-venous content, so supplemental O₂ corrects V/Q mismatch but not shunt,
 * anaemia lowers CaO₂ without touching SaO₂, and falling cardiac output lowers ScvO₂.
 */
import { PATM, PH2O, sat, p50, o2Content, alveolarPO2, solveAcidBase, po2ForSat, satStd } from './blood';
import { stepCoag, coagLabs, type CoagState, type CoagLabs } from './coag';

/* ================================================================== types */
export interface PatientParams {
  sex: 'M' | 'F'; age: number; heightCm: number; weightKg: number;
  tempC: number;
  vo2: number;            // mL/min O₂ demand
  vco2: number;           // mL/min CO₂ production
  hb: number;             // g/dL
  cohb: number;           // fraction
  dpg: number;            // 2,3-DPG factor on P50
  shunt: number;          // fraction of cardiac output through unventilated lung (0–0.6)
  lowVQ: number;          // fraction of cardiac output to low-V/Q units (0–0.5)
  vqLow: number;          // V/Q of those units (≈0.1)
  vdAlv: number;          // alveolar dead-space fraction of Vt (0–0.6)
  co: number;             // L/min baseline cardiac output
  hr: number; svr: number; cvp: number;
  drive: number;          // respiratory drive (1 normal, <1 opioid/sedation, >1 anxiety/sepsis/salicylate)
  setCO2: number;         // chemoreceptor set point (40, higher in chronic retainers)
  maxVE: number;          // L/min ventilatory capacity (fatigue / obstruction limit)
  spontVt: number;        // L preferred spontaneous tidal volume
  fio2: number;           // when not on the ventilator (room air 0.21, nasal cannula etc.)
  // metabolic / chemistry
  na: number; cl: number; albumin: number; otherUA: number; ketoneProd: number; lactateProd: number; hepatic: number; renal: number;
  ca: number; mg: number; phos: number; glucose: number; bun: number; cr: number;
  wbc: number; plt: number; inr: number; ptt: number; fibrinogen: number; trop: number; bnp: number;
  ast: number; alt: number; alp: number; bili: number;
  volume: number;         // intravascular volume status (1 normal, <1 depleted)
  acidIsMineral: number;  // 0–1: how much of the metabolic acidosis is inorganic (drives K shift)
}

export interface Drug { id: DrugId; t0: number; dose: number }
export type DrugId = 'calcium' | 'insulin' | 'albuterol' | 'bicarb' | 'naloxone' | 'binder' | 'dialysis' | 'fluids' | 'hypertonic' | 'bronchodilator' | 'diuretic' | 'transfusion';

export interface PatientState {
  p: PatientParams;
  t: number;              // minutes
  paco2: number;          // mmHg, integrated (body CO₂ stores)
  lactate: number;        // mmol/L
  ketones: number;        // mmol/L
  renalAdj: number;       // mEq/L of SBE generated/retained by the kidney (slow)
  bicarbGiven: number;    // mEq/L of SBE from exogenous HCO₃⁻, excreted over hours
  kBal: number;           // extracellular K⁺ set by total-body balance (before shifts)
  naBrain: number;        // Na the brain is adapted to (osmolytes; ~48 h)
  naHist: { t: number; na: number }[];
  drugs: Drug[];
  /** optional coagulation engine (physiology/coag.ts); when present it drives inr / ptt / fibrinogen / plt */
  coag?: CoagState;
  vent: VentInput | null;
}

/** What the ventilator (or the patient's own breathing) delivers to the gas-exchange model. */
export interface VentInput { vte: number; rr: number; fio2: number; peep: number; pmean: number; pplat: number; autoPeep: number }

export interface Snapshot {
  /** present when the patient has a coagulation engine */
  coag?: CoagLabs;
  // ventilation
  rr: number; vt: number; ve: number; va: number; vdvt: number; spontaneous: boolean;
  // gases
  pao2: number; paco2: number; pAO2: number; aaGrad: number; pf: number; sao2: number; spo2: number; etco2: number;
  pH: number; hco3: number; sbe: number; cao2: number; do2: number; vo2: number; o2debt: number;
  pvo2: number; svo2: number; cvo2: number; p50: number;
  /** end-capillary saturation leaving normal and low-V/Q lung units */
  ccNormal: number; ccLow: number; demandVO2: number;
  vbg: { site: 'peripheral venous'; pH: number; pco2: number; po2: number; so2: number; hco3: number; lactate: number };
  // circulation
  co: number; hr: number; map: number; sbp: number; dbp: number;
  // chemistry
  lactate: number; ketones: number; ag: number; agCorr: number; na: number; naCorr: number; k: number; cl: number; ca: number; mg: number; phos: number; glucose: number;
  bun: number; cr: number; egfr: number; albumin: number;
  hb: number; hct: number; wbc: number; plt: number; inr: number; ptt: number; pt: number; fibrinogen: number; trop: number; bnp: number; ast: number; alt: number; alp: number; bili: number;
  // cells & membranes
  rmp: number; threshold: number; gap: number; kEffective: number; cellVolume: number; odsRisk: number; naRate24: number;
  // effects of therapy on the time axis
  active: { id: DrugId; effect: number }[];
}

/* ================================================================== defaults */
export const NORMAL: PatientParams = {
  sex: 'M', age: 50, heightCm: 175, weightKg: 75, tempC: 37,
  vo2: 250, vco2: 200, hb: 14, cohb: 0.01, dpg: 1,
  shunt: 0.03, lowVQ: 0.02, vqLow: 0.1, vdAlv: 0.05,
  co: 5, hr: 75, svr: 1150, cvp: 5,
  drive: 1, setCO2: 40, maxVE: 90, spontVt: 0.5, fio2: 0.21,
  na: 140, cl: 104, albumin: 4, otherUA: 0, ketoneProd: 0, lactateProd: 1, hepatic: 1, renal: 1,
  ca: 1.2, mg: 2.0, phos: 3.5, glucose: 100, bun: 14, cr: 0.9,
  wbc: 7, plt: 250, inr: 1.0, ptt: 30, fibrinogen: 300, trop: 0.005, bnp: 40,
  ast: 25, alt: 22, alp: 80, bili: 0.6,
  volume: 1, acidIsMineral: 0.3,
};

export function pbw(sex: 'M' | 'F', heightCm: number) { return (sex === 'M' ? 50 : 45.5) + 0.91 * (heightCm - 152.4); }
/** Adult PBW formulas are not valid for children. Pediatric teaching uses scenario weight. */
export function ventilationWeight(p: Pick<PatientParams, 'age' | 'weightKg' | 'sex' | 'heightCm'>) { return p.age < 18 ? p.weightKg : pbw(p.sex,p.heightCm); }

export function createPatient(over: Partial<PatientParams> = {}, init: Partial<Pick<PatientState, 'paco2' | 'lactate' | 'ketones' | 'renalAdj' | 'kBal' | 'naBrain'>> & { k?: number } = {}): PatientState {
  const p = { ...NORMAL, ...over };
  const st: PatientState = {
    p, t: 0, paco2: init.paco2 ?? p.setCO2, lactate: init.lactate ?? 1, ketones: init.ketones ?? 0, renalAdj: init.renalAdj ?? 0, bicarbGiven: 0,
    kBal: 4.2, naBrain: init.naBrain ?? p.na, naHist: [{ t: 0, na: p.na }], drugs: [], vent: null,
  };
  if (init.k != null) { const s0 = derive(st); st.kBal += init.k - s0.k; }
  else if (init.kBal != null) st.kBal = init.kBal;
  return st;
}

/* ================================================================== drugs (time courses, minutes) */
const bump = (t: number, onset: number, peak: number, dur: number) => { if (t < 0) return 0; if (t < peak) return Math.min(1, t / Math.max(0.1, peak)) * (t > onset * 0.2 ? 1 : 0.5); if (t > dur) return 0; return Math.max(0, 1 - (t - peak) / (dur - peak)); };
export const DRUGS: Record<DrugId, { name: string; course: (t: number) => number; what: string }> = {
  calcium: { name: 'Calcium gluconate / chloride', course: (t) => bump(t, 1, 3, 50), what: 'Raises the threshold potential of cardiac cells — restores the gap between resting potential and threshold. Does NOT lower potassium.' },
  insulin: { name: 'Insulin 10 U + dextrose', course: (t) => bump(t, 10, 45, 300), what: 'Activates Na⁺/K⁺-ATPase: shifts K⁺ into cells (~0.6–1.0 mEq/L). Total-body K⁺ unchanged.' },
  albuterol: { name: 'Nebulised albuterol', course: (t) => bump(t, 15, 60, 180), what: 'β₂ stimulation drives Na⁺/K⁺-ATPase: shifts K⁺ into cells (~0.5 mEq/L). Also bronchodilates.' },
  bicarb: { name: 'Sodium bicarbonate', course: () => 0, what: 'Adds HCO₃⁻ (raises SBE). Generates CO₂ that must be exhaled; small K⁺ shift in acidosis.' },
  naloxone: { name: 'Naloxone', course: (t) => (t < 0 ? 0 : t < 2 ? t / 2 : t < 45 ? 1 : Math.max(0, 1 - (t - 45) / 45)), what: 'Reverses opioid respiratory depression — restores drive for 30–90 min.' },
  binder: { name: 'K⁺ binder (SZC / patiromer)', course: (t) => bump(t, 60, 240, 1440), what: 'Binds K⁺ in the gut — removes K⁺ from the body over hours.' },
  dialysis: { name: 'Haemodialysis (4 h)', course: (t) => (t >= 0 && t <= 240 ? 1 : 0), what: 'Removes K⁺, urea, acid and volume directly from blood.' },
  fluids: { name: 'Balanced crystalloid 1 L', course: (t) => bump(t, 0, 20, 180), what: 'Restores intravascular volume and preload.' },
  hypertonic: { name: '3% saline 100 mL', course: () => 0, what: 'Raises serum Na⁺ ≈2 mEq/L per 100 mL — pulls water out of swollen brain cells.' },
  bronchodilator: { name: 'Bronchodilator', course: (t) => bump(t, 3, 15, 240), what: 'Relaxes bronchial smooth muscle: airway radius ↑ → resistance ↓ (R ∝ 1/r⁴).' },
  diuretic: { name: 'Loop diuretic', course: (t) => bump(t, 5, 60, 360), what: 'Natriuresis and kaliuresis; unloads pulmonary oedema.' },
  transfusion: { name: 'PRBC 1 unit', course: () => 0, what: 'Raises Hb ≈1 g/dL — raises CaO₂ and DO₂.' },
};
export function drugEffect(st: PatientState, id: DrugId) { let e = 0; for (const d of st.drugs) if (d.id === id) e += DRUGS[id].course(st.t - d.t0) * d.dose; return e; }

export function give(st: PatientState, id: DrugId, dose = 1) {
  st.drugs.push({ id, t0: st.t, dose });
  if (id === 'bicarb') st.bicarbGiven += 4 * dose, st.paco2 += 2 * dose; // 50 mEq ≈ +4 SBE in 75 kg; generated CO₂
  if (id === 'hypertonic') st.p.na += 2 * dose;
  if (id === 'transfusion') st.p.hb += 1 * dose;
}

/* ================================================================== derived physiology */
function effectiveDrive(st: PatientState) { return Math.max(0.05, st.p.drive + (st.p.drive < 1 ? (1 - st.p.drive) * Math.min(1, drugEffect(st, 'naloxone')) : 0)); }
function cardiacOutput(st: PatientState, v: VentInput | null) {
  const p = st.p; const vol = Math.min(1.25, p.volume + 0.15 * drugEffect(st, 'fluids'));
  const pm = v ? v.pmean + v.autoPeep * 0.6 : 0;
  // positive intrathoracic pressure impedes venous return (worse when volume depleted)
  const venous = Math.max(0.2, 1 - Math.max(0, pm - 8) * (0.012 + 0.03 * Math.max(0, 1 - vol)));
  const anaemia = 1 + Math.max(0, 10 - p.hb) * 0.06; // compensatory rise in cardiac output below Hb ~10
  return p.co * Math.min(1.2, vol) * venous * anaemia;
}

export interface SpontOut { rr: number; vt: number; ve: number }
/** Spontaneous breathing: chemoreflex set point (Winter's in metabolic acidosis) scaled by drive, capped by capacity. */
export function spontaneous(st: PatientState, hco3: number, pao2: number): SpontOut {
  const p = st.p; const d = effectiveDrive(st);
  let setp = hco3 < 22 ? 1.5 * hco3 + 8 : hco3 > 26 ? 40 + 0.7 * (hco3 - 24) : 40; // expected compensation
  setp += p.setCO2 - 40;
  setp = setp + (1 / d - 1) * 30;
  if (pao2 < 60) setp -= (60 - pao2) * 0.25; // hypoxic drive
  setp = Math.max(18, setp);
  const vd = vdTotal(st, p.spontVt);
  const vaNeed = 0.863 * p.vco2 / setp; // L/min
  let vt = p.spontVt * Math.min(1.4, Math.max(0.7, d ** 0.15)); // drive changes rate far more than depth
  let rr = vaNeed / Math.max(0.05, vt - vd);
  if (rr > 34) { rr = 34 + (rr - 34) * 0.3; }
  let ve = rr * vt;
  if (ve > p.maxVE) { const f = p.maxVE / ve; ve = p.maxVE; vt *= Math.sqrt(f); rr = ve / vt; }
  return { rr: Math.max(2, rr), vt, ve: Math.max(0.5, ve) };
}
function vdTotal(st: PatientState, vt: number) { const anat = 2.2 * ventilationWeight(st.p) / 1000; return anat + vt * alvDeadFrac(st, st.vent); }
function alvDeadFrac(st: PatientState, v: VentInput | null) {
  const co = cardiacOutput(st, v);
  let f = st.p.vdAlv + Math.max(0, (3.5 - co) / 3.5) ** 0.8 * 0.8; // low flow → unperfused alveoli (arrest, PE, shock)
  if (v) f += Math.max(0, v.pplat - 28) * 0.012 + v.autoPeep * 0.006; // overdistension compresses capillaries
  return Math.min(0.9, f);
}

/** Three-compartment O₂ exchange with an iterated mixed-venous content. */
function oxygen(st: PatientState, fio2: number, paco2: number, va: number, co: number, pH: number, extraShunt = 0) {
  const p = st.p; const P50 = p50(pH, p.tempC, p.dpg); const PIO2 = fio2 * (PATM - PH2O);
  const pAO2 = alveolarPO2(fio2, paco2);
  const shunt = Math.min(0.8, p.shunt + extraShunt); const low = Math.min(1 - shunt, p.lowVQ);
  const Qs = shunt * co, Ql = low * co, Qn = Math.max(0.01, co - Qs - Ql);
  const VAl = p.vqLow * Ql;
  const content = (po2: number) => o2Content(p.hb, sat(po2, P50), po2, p.cohb);
  const Cn = content(Math.max(1, pAO2 - 4));
  const cvMin = content(12);
  let cv = content(40), vo2 = p.vo2, ca = Cn, cl = Cn;
  for (let it = 0; it < 50; it++) {
    // low-V/Q unit: O₂ inflow by ventilation = O₂ uptake by blood
    let lo = 1, hi = Math.max(2, PIO2);
    for (let b = 0; b < 40; b++) { const m = (lo + hi) / 2; const up = VAl * 1000 * (PIO2 - m) / (PATM - PH2O); const bl = Ql * 10 * (content(m) - cv); if (up > bl) lo = m; else hi = m; }
    cl = content((lo + hi) / 2);
    ca = (Qn * Cn + Ql * cl + Qs * cv) / co;
    vo2 = Math.min(p.vo2 * (1 + 0.1 * (p.tempC - 37)), Math.max(0, (ca - cvMin) * co * 10));
    const cvNew = ca - vo2 / (co * 10);
    cv = cv + 0.5 * (cvNew - cv);
  }
  // PaO₂ from content (invert)
  let lo = 1, hi = 700; for (let b = 0; b < 50; b++) { const m = (lo + hi) / 2; if (content(m) < ca) lo = m; else hi = m; }
  const pao2 = (lo + hi) / 2;
  let lv = 1, hv = 200; for (let b = 0; b < 50; b++) { const m = (lv + hv) / 2; if (content(m) < cv) lv = m; else hv = m; }
  const pvo2 = (lv + hv) / 2;
  const demand = p.vo2 * (1 + 0.1 * (p.tempC - 37));
  const ccNormal = sat(Math.max(1, pAO2 - 4), P50); const ccLow = Math.min(1, Math.max(0, (cl - 0.003 * 40) / Math.max(0.1, 1.34 * p.hb * (1 - p.cohb))));
  return { pAO2, pao2, ca, cv, pvo2, svo2: sat(pvo2, P50), sao2: sat(pao2, P50), vo2, debt: Math.max(0, demand - vo2), P50, do2: ca * co * 10, ccNormal, ccLow };
}

/** GHK-style resting membrane potential of a cardiac myocyte (mV). */
export const restingPotential = (k: number) => 61.5 * Math.log10((k + 0.015 * 140) / (140 + 0.015 * 12));
/** Threshold potential (mV): raised (less negative) by ionised calcium and by a calcium dose. */
export const thresholdPotential = (ca: number, caDose = 0) => -65 + (ca - 1.2) * 12 + 7 * Math.min(1.5, caDose);
/** Potassium that would produce the same RMP–threshold gap at normal calcium: what the ECG "sees". */
export function kEffective(k: number, ca: number, caDose: number) {
  const gap = thresholdPotential(ca, caDose) - restingPotential(k);
  let lo = 1, hi = 12; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (thresholdPotential(1.2) - restingPotential(m) > gap) lo = m; else hi = m; } return (lo + hi) / 2;
}

/** CKD-EPI 2021 (race-free). */
export function egfr(cr: number, age: number, sex: 'M' | 'F') {
  const k = sex === 'F' ? 0.7 : 0.9, a = sex === 'F' ? -0.241 : -0.302;
  return 142 * Math.min(cr / k, 1) ** a * Math.max(cr / k, 1) ** -1.2 * 0.9938 ** age * (sex === 'F' ? 1.012 : 1);
}

/** Chloride after renal compensation: the kidney retains HCO₃⁻ by excreting Cl⁻ (and vice-versa). */
export const clEff = (st: PatientState) => st.p.cl - st.renalAdj - st.bicarbGiven;
/** Standard base excess from its causes (Stewart-style partition): strong-ion difference, lactate, ketones, unmeasured anions, albumin. */
export function sbeOfState(st: PatientState) {
  const p = st.p;
  return (p.na - clEff(st) - 36) - (st.lactate - 1) - st.ketones - p.otherUA + 2.5 * (4 - p.albumin);
}

/** Pure: compute everything shown on screen from the state. */
export function derive(st: PatientState): Snapshot {
  const p = st.p; const v = st.vent;
  const sbe = sbeOfState(st);
  let ab = solveAcidBase(st.paco2, sbe);
  const co = cardiacOutput(st, v);
  // ventilation
  let rr: number, vt: number, spontaneousFlag = !v; let fio2 = p.fio2;
  if (v) { rr = v.rr; vt = v.vte; fio2 = v.fio2; }
  else { const pre = oxygen(st, fio2, st.paco2, 4, co, ab.pH); const s = spontaneous(st, ab.hco3, pre.pao2); rr = s.rr; vt = s.vt; }
  const vd = vdTotal(st, vt); const va = Math.max(0, (vt - vd)) * rr; const ve = vt * rr;
  // PEEP recruits shunt units; a low PEEP in a recruitable lung leaves them closed (the vent module passes its own shunt modifier via p.shunt)
  const ox = oxygen(st, fio2, st.paco2, va, co, ab.pH);
  const sao2 = ox.sao2;
  // SpO₂: two-wavelength oximetry reads COHb as oxyhaemoglobin
  const spo2 = Math.min(1, sat(ox.pao2, ox.P50) * (1 - p.cohb) + p.cohb * 0.9);
  const fAlv = alvDeadFrac(st, v);
  const etco2 = ve > 0.3 ? st.paco2 * (1 - fAlv) * Math.min(1, vt / 0.25) : 0;
  // VBG (peripheral venous): higher PCO₂, lower pH, venous PO₂ — NOT an oxygenation measure
  const gap = Math.min(30, Math.max(3, 5 * (p.vco2 / 200) * (5 / Math.max(0.5, co))));
  const vab = solveAcidBase(st.paco2 + gap, sbe + 0.5);
  const pvPer = Math.max(15, Math.min(60, ox.pvo2 + 3));
  // circulation
  const map = co * p.svr / 80 + p.cvp; const pp = 40 * Math.min(1.5, co / 5);
  // chemistry
  const k = kNow(st, ab.pH);
  const hco3 = ab.hco3;
  const cl = clEff(st); const ag = p.na - cl - hco3; const agCorr = ag + 2.5 * (4 - p.albumin);
  const naCorr = p.na + 1.6 * Math.max(0, p.glucose - 100) / 100;
  const caDose = drugEffect(st, 'calcium');
  const rmp = restingPotential(k), thr = thresholdPotential(p.ca, caDose);
  const cellVolume = st.naBrain / p.na;
  const hist = st.naHist; const past = hist.find((h) => h.t >= st.t - 1440) ?? hist[0];
  const naRate24 = (p.na - past.na) * 1440 / Math.max(60, st.t - past.t);
  const odsRisk = Math.max(0, Math.min(1, (p.na - st.naBrain - 8) / 10)) * (st.naBrain < 125 ? 1 : 0.4);
  const active = (Object.keys(DRUGS) as DrugId[]).map((id) => ({ id, effect: drugEffect(st, id) })).filter((a) => a.effect > 0.01);
  return {
    rr, vt, ve, va, vdvt: vt > 0 ? vd / vt : 0, spontaneous: spontaneousFlag,
    pao2: ox.pao2, paco2: st.paco2, pAO2: ox.pAO2, aaGrad: ox.pAO2 - ox.pao2, pf: ox.pao2 / fio2, sao2, spo2, etco2,
    pH: ab.pH, hco3, sbe, cao2: ox.ca, do2: ox.do2, vo2: ox.vo2, o2debt: ox.debt, pvo2: ox.pvo2, svo2: ox.svo2, cvo2: ox.cv, p50: ox.P50, ccNormal: ox.ccNormal, ccLow: ox.ccLow, demandVO2: p.vo2 * (1 + 0.1 * (p.tempC - 37)),
    vbg: { site: 'peripheral venous', pH: vab.pH, pco2: st.paco2 + gap, po2: pvPer, so2: sat(pvPer, ox.P50), hco3: vab.hco3, lactate: st.lactate },
    co, hr: p.hr * (co < 3.5 * bsaRatio(p) ? 1 + (3.5 * bsaRatio(p) - co) / bsaRatio(p) * 0.15 : 1), map, sbp: map + pp * 2 / 3, dbp: map - pp / 3,
    lactate: st.lactate, ketones: st.ketones, ag, agCorr, na: p.na, naCorr, k, cl, ca: p.ca, mg: p.mg, phos: p.phos, glucose: p.glucose,
    bun: p.bun, cr: p.cr, egfr: egfr(p.cr, p.age, p.sex), albumin: p.albumin,
    hb: p.hb, hct: p.hb * 3, wbc: p.wbc, plt: p.plt, inr: p.inr, ptt: p.ptt, pt: 12.5 * p.inr ** (1 / 1.0), fibrinogen: p.fibrinogen, trop: p.trop, bnp: p.bnp, ast: p.ast, alt: p.alt, alp: p.alp, bili: p.bili,
    rmp, threshold: thr, gap: thr - rmp, kEffective: kEffective(k, p.ca, caDose), cellVolume, odsRisk, naRate24,
    active,
    ...(st.coag ? { coag: coagLabs(st.coag) } : {}),
  };
}

/** Plasma K⁺ = balance + transcellular shifts (acidaemia, insulin, β₂). */
function kNow(st: PatientState, pH: number) {
  const shiftAcid = pH < 7.4 ? (7.4 - pH) * 10 * (0.2 + 0.5 * st.p.acidIsMineral) : -(pH - 7.4) * 10 * 0.25;
  const shiftIn = 0.9 * drugEffect(st, 'insulin') + 0.55 * drugEffect(st, 'albuterol');
  return Math.max(1.5, st.kBal + shiftAcid - shiftIn);
}

/* ================================================================== time integration */
export interface AdvanceOpts { dtMax?: number }
/** Advance the patient `minutes` forward. `vent` = what the ventilator currently delivers (null = breathing spontaneously). */
export function advance(st: PatientState, minutes: number, vent: VentInput | null = st.vent, o: AdvanceOpts = {}) {
  st.vent = vent;
  let left = minutes; const dtMax = o.dtMax ?? 0.25;
  while (left > 1e-9) {
    const dt = Math.min(left, minutes > 600 ? 5 : minutes > 120 ? 1 : dtMax); left -= dt;
    const s = derive(st); const p = st.p;
    // CO₂ stores: capacity ≈ 60 mL per mmHg (fast+medium compartments)
    const vco2 = p.vco2 * (1 + 0.1 * (p.tempC - 37));
    const elim = s.va * st.paco2 / 0.863; // mL/min exhaled (PaCO₂ = 0.863·V̇CO₂/V̇A)
    st.paco2 = Math.max(10, Math.min(200, st.paco2 + (vco2 - elim) * dt / 60));
    // lactate: production (baseline × adrenergic factor + anaerobic from O₂ debt) − hepatic clearance
    const perf = Math.min(1, s.co / 4.5);
    const prod = 0.03 * p.lactateProd + s.o2debt * 0.0008 + 0.02 * Math.max(0, p.tempC - 38.5);
    st.lactate = Math.max(0.3, st.lactate + (prod - 0.03 * p.hepatic * perf * st.lactate) * dt);
    // ketones: production suppressed by insulin; oxidised when insulin present
    const ins = drugEffect(st, 'insulin') + (p.ketoneProd > 0 ? 0 : 1);
    st.ketones = Math.max(0, st.ketones + (p.ketoneProd * 0.02 * Math.max(0, 1 - ins) - 0.004 * st.ketones * (0.3 + ins)) * dt);
    // glucose falls with insulin
    p.glucose = Math.max(40, p.glucose - drugEffect(st, 'insulin') * 1.0 * dt * (p.glucose > 140 ? 1 : 0.2));
    // kidneys: chronic respiratory compensation ≈ +0.4 SBE per mmHg PaCO₂ above 40 (≈ days)
    const target = 0.4 * (st.paco2 - 40);
    st.renalAdj += (target - st.renalAdj) * Math.min(1, dt / 1000) * p.renal;
    st.bicarbGiven *= Math.exp(-dt / (360 / Math.max(0.2, p.renal)));
    // potassium balance: renal elimination toward 4.2, binders, dialysis
    const dial = drugEffect(st, 'dialysis');
    st.kBal += (-(st.kBal - 4.2) * p.renal / 400 - drugEffect(st, 'binder') * 0.0025 - dial * (st.kBal - 3.5) / 90 - drugEffect(st, 'diuretic') * 0.0015) * dt;
    if (dial > 0) { p.bun = Math.max(8, p.bun - p.bun * dt / 300); st.renalAdj += (6 - st.renalAdj) * dt / 400; p.otherUA = Math.max(0, p.otherUA - p.otherUA * dt / 240); }
    if (dial > 0) p.cr = Math.max(0.6, p.cr - p.cr * dt / 400);
    // brain osmolyte adaptation (≈ 48 h)
    st.naBrain += (p.na - st.naBrain) * Math.min(1, dt / 1700);
    if (st.coag) { stepCoag(st.coag, dt, p.hepatic); syncCoag(st); }
    st.t += dt;
    if (!st.naHist.length || st.t - st.naHist[st.naHist.length - 1].t >= 30) { st.naHist.push({ t: st.t, na: p.na }); if (st.naHist.length > 200) st.naHist.shift(); }
    // expire finished drugs
    st.drugs = st.drugs.filter((d) => st.t - d.t0 < 2000);
  }
  return derive(st);
}

/** Run to steady state (useful for building scenarios from causes rather than typed-in numbers). */
export function settle(st: PatientState, minutes = 240) { const keepT = st.t; advance(st, minutes); st.t = keepT; st.naHist = [{ t: keepT, na: st.p.na }]; return derive(st); }

export { satStd, po2ForSat };

/** Copy the coagulation engine's results into the patient's lab parameters (every existing reader uses these). */
export function syncCoag(st: PatientState) { if (!st.coag) return; const L = coagLabs(st.coag); st.p.inr = L.inr; st.p.ptt = L.aptt; st.p.fibrinogen = L.fib; st.p.plt = L.plt; }

/** Body surface area (Mosteller), m², and relative to the default adult (175 cm, 75 kg) — scales 'normal' output for children. */
export const bsa = (p: Pick<PatientParams, 'heightCm' | 'weightKg'>) => Math.sqrt((p.heightCm * p.weightKg) / 3600);
export const bsaRatio = (p: Pick<PatientParams, 'heightCm' | 'weightKg'>) => bsa(p) / Math.sqrt((175 * 75) / 3600);
