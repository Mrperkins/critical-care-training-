import { NEO } from '../populations/neonatal';
/**
 * Congenital shunt physiology — a simplified two-circuit model (pure, deterministic).
 *
 * Systemic flow Qs is held at its target (the body's compensation); the shunt adds to or takes from
 * pulmonary flow Qp. Pressures come from flows and resistances (Wood units: mmHg per L/min), filling
 * pressures from how much each ventricle must fill and how stiff it is. Flow across a defect:
 *   restrictive holes (VSD, PDA): orifice flow Q = Cd · A · v, v from Bernoulli (ΔP = 4v²), for the
 *     phase of the cycle the gradient exists (systole, diastole, or both for a duct);
 *   atrial holes (ASD, PFO): low-pressure conductance proportional to area; a PFO is a flap that opens
 *     only when right atrial pressure exceeds left.
 * The fixed point is found by damped iteration. Teaching model: shapes and directions are right; the
 * numbers are illustrative, not patient-specific.
 */
export type LesionKind = 'none' | 'vsd' | 'asd' | 'pfo' | 'pda' | 'tof' | 'coarct';
/** where a VSD sits in the septum (drawn in 3D; perimembranous is the commonest and the ToF type) */
export type VsdSite = 'perimembranous' | 'muscular';
export interface ShuntInput {
  lesion: LesionKind;
  /** defect diameter, mm */ sizeMm: number;
  /** pulmonary vascular resistance, Wood units (normal ≈ 1–2) */ pvr: number;
  /** systemic vascular resistance, Wood units (normal ≈ 15–20) */ svr: number;
  /** extra right-atrial pressure, mmHg (Valsalva, cough, PE) */ raLoad?: number;
  /** left-ventricular stiffness factor (1 = normal) */ lvStiff?: number;
  /** systemic flow target, L/min */ qs?: number;
  /** VSD position (drawing only) */ vsdSite?: VsdSite;
  /** Tetralogy: right-ventricular outflow obstruction, 0 (none) – 1 (near atresia) */ rvot?: number;
  /** Coarctation: narrowing at the isthmus, 0 – 1 (critical) */ coarct?: number;
  /** Coarctation: ductus arteriosus diameter, mm (0 = closed) */ ductMm?: number;
}
export type Direction = 'none' | 'L→R' | 'bidirectional' | 'R→L';
export interface ShuntState {
  input: ShuntInput;
  qp: number; qs: number; qpqs: number;
  /** left→right and right→left components, L/min (both ≥ 0), net = lr − rl */ lr: number; rl: number; net: number;
  direction: Direction;
  /** peak defect velocity (m/s) and the gradient that drives it (mmHg) for the dominant phase */ velocity: number; gradient: number;
  p: { ra: number; rvSys: number; rvEdp: number; paSys: number; paDia: number; paMean: number; la: number; lvSys: number; lvEdp: number; aoSys: number; aoDia: number; aoMean: number };
  sat: { ra: number; rv: number; pa: number; la: number; lv: number; ao: number; aoPost: number; sv: number };
  /** relative volume each chamber handles (1 = normal) */ load: { ra: number; rv: number; la: number; lv: number };
  flags: { lvVolume: boolean; rvVolume: boolean; rvPressure: boolean; overcirculation: boolean; pulmHypertension: boolean; eisenmenger: boolean; cyanosis: boolean; lvPressure?: boolean; spell?: boolean; lowerHypoperfusion?: boolean };
  murmur: string;
  /** Tetralogy: RV outflow gradient (mmHg) and peak velocity (m/s) */ rvot?: { gradient: number; velocity: number };
  /** Coarctation: arm vs leg pressures, the isthmus gradient and lower-body flow */ coarct?: { gradient: number; armSys: number; armDia: number; legSys: number; legDia: number; lowerFlow: number; lowerFrac: number; ductFlow: number };
}

const CD: Record<LesionKind, number> = { none: 0, vsd: 0.7, pda: 0.5, asd: 0, pfo: 0, tof: 0, coarct: 0 };
const area = (mm: number) => Math.PI * (mm / 20) ** 2; // cm²
/** orifice flow, L/min, for gradient ΔP (mmHg) present for fraction `frac` of the cycle */
const orifice = (A: number, cd: number, dp: number, frac: number) => (dp > 0 ? A * cd * 50 * Math.sqrt(dp) * frac * 0.06 : 0);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export function solveShunt(inp: ShuntInput): ShuntState {
  if (inp.lesion === 'tof') return solveTof(inp);
  if (inp.lesion === 'coarct') return solveCoarct(inp);
  const Qs = inp.qs ?? 5; const A = inp.lesion === 'none' ? 0 : area(inp.sizeMm); const L = inp.lesion;
  const lvK = inp.lvStiff ?? 1; const raLoad = inp.raLoad ?? 0;
  let lr = 0, rl = 0; let out = null as unknown as ReturnType<typeof pressures>;
  function pressures(lr: number, rl: number) {
    const net = lr - rl; const Qp = clamp(Qs + net, 0.25 * Qs, 4 * Qs);
    // who fills with what: VSD / PDA return the extra pulmonary flow to the LEFT heart; an ASD sends it through the RIGHT heart
    const lvIn = L === 'asd' || L === 'pfo' ? Qs : Qp;
    const rvIn = L === 'asd' || L === 'pfo' ? Qp : Qs;
    const la = 3 + 4.2 * (lvIn / 5) * lvK;
    const lvEdp = la + 1;
    const aoMean = 3 + Qs * inp.svr; const aoSys = aoMean * 1.28, aoDia = aoMean * 0.84;
    const paMean = la + Qp * inp.pvr; const paSys = paMean * 1.55, paDia = paMean * 0.62;
    const rvSys = paSys; // no outflow obstruction
    const rvK = 1 + 0.035 * Math.max(0, rvSys - 30);
    const ra = 1 + 2.2 * (rvIn / 5) * rvK + raLoad; const rvEdp = ra + 1;
    return { Qp, lvIn, rvIn, la, lvEdp, aoMean, aoSys, aoDia, paMean, paSys, paDia, rvSys, ra, rvEdp, lvSys: aoSys };
  }
  if (L === 'asd' || L === 'pfo') {
    // atrial level: solve net flow q = G·(LA − RA)(q) by bisection (monotone; the damped iteration oscillates for big holes)
    const G = (L === 'asd' ? 2.0 : 0.45) * A;
    const f = (q: number) => { const o = pressures(Math.max(0, q), Math.max(0, -q)); const d = o.la - o.ra; return (L === 'pfo' ? -G * Math.max(0, -d) : G * d) - q; };
    let lo = -3 * Qs, hi = 3 * Qs; for (let it = 0; it < 80; it++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; }
    const q = (lo + hi) / 2; lr = Math.max(0, q); rl = Math.max(0, -q);
    // near-equal atrial pressures: flow crosses both ways within each cycle (phasic bidirectional shunt)
    if (L === 'asd') { const d = Math.abs(pressures(lr, rl).la - pressures(lr, rl).ra); const phasic = G * 0.1 * Math.max(0, 1.0 - d); lr += phasic; rl += phasic; }
  }
  for (let it = 0; it < (L === 'asd' || L === 'pfo' ? 0 : 200); it++) {
    out = pressures(lr, rl); const o = out; let nlr = 0, nrl = 0;
    if (L === 'vsd') {
      const dSys = o.lvSys - o.rvSys, dDia = o.rvEdp - o.lvEdp;
      nlr = orifice(A, CD.vsd, dSys, 0.35); nrl = orifice(A, CD.vsd, -dSys, 0.35) + 0.3 * orifice(A, CD.vsd, dDia, 0.55);
    } else if (L === 'pda') {
      const dS = o.aoSys - o.paSys, dD = o.aoDia - o.paDia;
      nlr = orifice(A, CD.pda, dS, 0.35) + orifice(A, CD.pda, dD, 0.65); nrl = orifice(A, CD.pda, -dS, 0.35) + orifice(A, CD.pda, -dD, 0.65);
    }
    lr += 0.2 * (nlr - lr); rl += 0.2 * (nrl - rl);
    // respect the output ceiling
    const net = lr - rl; if (Qs + net > 4 * Qs) { const k = (3 * Qs) / net; lr *= k; rl *= k; }
  }
  out = pressures(lr, rl); const o = out; const net = lr - rl; const Qp = o.Qp;

  // saturations: pulmonary veins 98 %; systemic venous from extraction at the systemic flow
  const PV = 0.98; let ao = PV;
  let s = { ra: 0, rv: 0, pa: 0, la: PV, lv: PV, ao: PV, aoPost: PV, sv: 0 };
  for (let it = 0; it < 30; it++) {
    const sv = Math.max(0.2, ao - 0.25 * (5 / Qs));
    let ra = sv, rv = sv, pa = sv, la = PV, lv = PV, aoS = PV, post = PV;
    if (L === 'vsd') { rv = (Qs * sv + lr * PV) / (Qs + lr); pa = rv; lv = (Math.max(0.1, Qp) * PV + rl * rv) / (Math.max(0.1, Qp) + rl); aoS = lv; post = aoS; }
    else if (L === 'asd' || L === 'pfo') { ra = (Qs * sv + lr * la) / (Qs + lr); rv = ra; pa = ra; la = (Math.max(0.1, Qp) * PV + rl * sv) / (Math.max(0.1, Qp) + rl); lv = la; aoS = la; post = la; }
    else if (L === 'pda') { pa = (Qs * sv + lr * PV) / (Qs + lr); rv = sv; aoS = PV; const lower = 0.6 * Qs; post = (lower * PV + rl * pa) / (lower + rl); }
    ao = L === 'pda' ? 0.4 * aoS + 0.6 * post : aoS;
    s = { ra, rv, pa, la, lv, ao: aoS, aoPost: post, sv };
  }
  const direction: Direction = Math.max(lr, rl) < 0.15 ? 'none' : net < -0.15 && rl > 1.4 * lr ? 'R→L' : net > 0.15 && lr > 4 * rl ? 'L→R' : lr > 0.15 && rl > 0.15 ? 'bidirectional' : net > 0 ? 'L→R' : 'R→L';
  const dom = L === 'vsd' ? (net >= 0 ? o.lvSys - o.rvSys : o.rvSys - o.lvSys) : L === 'pda' ? (net >= 0 ? o.aoSys - o.paSys : o.paSys - o.aoSys) : Math.abs(o.la - o.ra);
  const gradient = direction === 'none' ? 0 : Math.max(0, dom); const velocity = Math.sqrt(gradient / 4);
  const load = { ra: o.rvIn / Qs, rv: o.rvIn / Qs, la: o.lvIn / Qs, lv: o.lvIn / Qs };
  const qpqs = Qp / Qs; const cyan = Math.min(s.ao, s.aoPost) < 0.92;
  const flags = {
    lvVolume: load.lv > 1.35, rvVolume: load.rv > 1.35, rvPressure: o.rvSys > 40, overcirculation: qpqs > 1.5,
    pulmHypertension: o.paMean > 20, eisenmenger: net < -0.15 && inp.pvr > 6, cyanosis: cyan,
  };
  return { input: inp, qp: Qp, qs: Qs, qpqs, lr, rl, net, direction, velocity, gradient,
    p: { ra: o.ra, rvSys: o.rvSys, rvEdp: o.rvEdp, paSys: o.paSys, paDia: o.paDia, paMean: o.paMean, la: o.la, lvSys: o.lvSys, lvEdp: o.lvEdp, aoSys: o.aoSys, aoDia: o.aoDia, aoMean: o.aoMean },
    sat: s, load, flags, murmur: murmurFor(L, direction, velocity, qpqs) };
}

const NOFLAGS = { lvVolume: false, rvVolume: false, rvPressure: false, overcirculation: false, pulmHypertension: false, eisenmenger: false, cyanosis: false };
/** systemic venous saturation from oxygen extraction at systemic flow Qs (scaled to the patient's size) */
const venous = (ao: number, Qs: number, neo: boolean) => Math.max(0.2, ao - 0.25 * ((neo ? 0.6 : 5) / Qs));

/**
 * Tetralogy of Fallot: a large malaligned VSD lets both ventricles eject into a shared pressure chamber, so the
 * two outlets act in parallel: Qp/Qs = SVR / (PVR + RV-outflow resistance). More obstruction, a fall in SVR
 * (crying, fever, vasodilators) or infundibular spasm → less lung flow and more deoxygenated blood to the aorta
 * (a "tet spell"); squatting / knee-chest or phenylephrine raise SVR and push blood back to the lungs.
 */
function solveTof(inp: ShuntInput): ShuntState {
  const neo = (inp.qs ?? 5) < 2; const Qs = inp.qs ?? 5; const sev = clamp(inp.rvot ?? 0.55, 0, 1);
  const Rrv = neo ? 20 + 260 * sev * sev : 6 + 80 * sev * sev; // Wood units on the patient's scale (fixed infundibular part + the variable narrowing)
  const qpqs = clamp(inp.svr / (inp.pvr + Rrv + 1e-6), 0.08, 3); const Qp = Qs * qpqs;
  const la = 3 + 4.2 * (Qp / (neo ? 0.6 : 5)) * 0.9; const lvEdp = la + 1;
  const aoMean = 3 + Qs * inp.svr; const aoSys = aoMean * 1.28, aoDia = aoMean * 0.84;
  const paMean = la + Qp * inp.pvr; const paSys = paMean * 1.3, paDia = paMean * 0.65;
  const rvSys = aoSys; // unrestrictive VSD: the RV is at systemic pressure
  const ra = 4 + 2.2 * Math.max(0, (rvSys - 30) / 60); const rvEdp = ra + 1;
  const gradient = Math.max(0, rvSys - paSys); const velocity = Math.sqrt(gradient / 4);
  const PV = 0.98; let ao = PV, sv = 0.7, pa = 0.7;
  const rl = Math.max(0, Qs - Qp), lr = Math.max(0, Qp - Qs);
  for (let it = 0; it < 40; it++) { sv = venous(ao, Qs, neo); ao = rl > 0 ? (Qp * PV + rl * sv) / Qs : PV; pa = lr > 0 ? (Qs * sv + lr * PV) / (Qs + lr) : sv; }
  const net = lr - rl; const direction: Direction = Math.abs(net) < 0.04 * Qs ? 'bidirectional' : net < 0 ? 'R→L' : 'L→R';
  const flags = { ...NOFLAGS, rvPressure: true, cyanosis: ao < 0.92, spell: qpqs < 0.45, overcirculation: qpqs > 1.5 };
  const murmur = qpqs < 0.45
    ? 'The murmur gets SOFTER or disappears: almost no blood is crossing the narrowed outflow (tet spell). Deepening cyanosis.'
    : sev < 0.25 ? 'Harsh systolic ejection murmur at the upper left sternal border; mostly left-to-right ("pink tet"), so little cyanosis.'
    : 'Harsh systolic ejection murmur at the upper left sternal border from the narrowed right-ventricular outflow (the VSD itself is quiet — no gradient across it); single S2.';
  return { input: inp, qp: Qp, qs: Qs, qpqs, lr, rl, net, direction, velocity: 0.6, gradient: 0,
    p: { ra, rvSys, rvEdp, paSys, paDia, paMean, la, lvSys: aoSys, lvEdp, aoSys, aoDia, aoMean },
    sat: { ra: sv, rv: sv, pa, la: PV, lv: PV, ao, aoPost: ao, sv }, load: { ra: 1, rv: 1, la: Math.max(0.5, qpqs), lv: 1 }, flags, murmur,
    rvot: { gradient, velocity } };
}

/**
 * Coarctation: a narrowing just beyond the left subclavian artery. The heart and arms see the pressure needed
 * to push the lower body's flow through the narrowing (upper-limb hypertension, LV pressure load); the legs get
 * a damped, delayed pulse. In a newborn the open duct can feed the lower body from the pulmonary artery
 * (right-to-left: the feet are bluer than the right hand) — when it closes in a critical coarctation, lower-body
 * flow collapses (shock, acidosis, poor femoral pulses).
 */
function solveCoarct(inp: ShuntInput): ShuntState {
  const neo = (inp.qs ?? 5) < 2; const Qs = inp.qs ?? 5; const sev = clamp(inp.coarct ?? 0.6, 0, 1);
  const Ru = inp.svr / 0.35, Rl = inp.svr / 0.65; // head & arms vs trunk & legs, in parallel
  const Rc = inp.svr * 1.1 * sev ** 3 / Math.max(0.02, 1 - sev); // isthmus resistance; rises steeply near critical
  const Rcol = neo ? Infinity : inp.svr * (2.4 - 1.4 * sev); // older children grow collaterals around the narrowing
  const Rpath = 1 / (1 / Rc + 1 / Rcol);
  const pMax = neo ? 65 : 150; // the most mean pressure the LV can sustain
  const Gd = area(inp.ductMm ?? 0) * 2; // ductal conductance, L/min per mmHg
  const la = 3 + 4.2 * (Qs / (neo ? 0.6 : 5)); const paMean0 = la + Qs * inp.pvr;
  // lower aorta balance for a given upper pressure: (Pu−Pl)/Rpath + Gd(PA−Pl) = (Pl−3)/Rl  → closed form
  const lower = (Pu: number) => { const Pl = (3 / Rl + Pu / Rpath + Gd * paMean0) / (1 / Rl + 1 / Rpath + Gd); const qc = Math.max(0, (Pu - Pl) / Rpath); return { Pl, qc, qd: Gd * (paMean0 - Pl) }; };
  const total = (Pu: number) => { const l = lower(Pu); return (Pu - 3) / Ru + l.qc + l.qd; };
  // the LV raises upper-aortic pressure until total systemic flow reaches its target, up to its ceiling (bisection)
  let lo = 4, hi = pMax; for (let it = 0; it < 60; it++) { const m = (lo + hi) / 2; if (total(m) < Qs) lo = m; else hi = m; }
  const Pu = (lo + hi) / 2; const { Pl, qd } = lower(Pu); const qLow = (Pl - 3) / Rl;
  const qc = Math.max(0, (Pu - Pl) / Rpath); const lowerFrac = qLow / (0.65 * Qs);
  const pulseU = neo ? 1.35 : 1.45; const pulseL = 1.1 + 0.2 * (1 - sev);
  const armSys = Pu * pulseU, armDia = Pu * 0.78, legSys = Pl * pulseL, legDia = Pl * 0.85;
  const paMean = paMean0; const paSys = paMean * 1.55, paDia = paMean * 0.62;
  const ra = 1 + 2.2 * (Qs / (neo ? 0.6 : 5)) + (inp.raLoad ?? 0);
  const PV = 0.98; const sv = venous(PV, Qs, neo); const rl = Math.max(0, qd), lr = Math.max(0, -qd);
  const post = qLow > 0 ? (qc * PV + rl * sv) / Math.max(1e-6, qc + rl) : PV;
  const gradient = Math.max(0, armSys - legSys);
  const direction: Direction = rl > 0.03 * Qs ? 'R→L' : lr > 0.03 * Qs ? 'L→R' : 'none';
  const flags = { ...NOFLAGS, lvPressure: Pu > (neo ? 55 : 110), cyanosis: post < 0.92, lowerHypoperfusion: lowerFrac < 0.7, rvPressure: neo && paSys > 45 };
  const murmur = lowerFrac < 0.7 && neo
    ? 'Weak or absent femoral pulses, grey and mottled below the waist; murmur may be faint — the duct is closing on a critical narrowing.'
    : rl > 0.03 * Qs ? 'Differential cyanosis: right hand pinker than the feet (the duct is feeding the lower body); femoral pulses relatively preserved while the duct stays open.'
    : 'Systolic murmur between the shoulder blades; arm blood pressure higher than leg, radio-femoral delay; continuous murmurs over collaterals in older children.';
  return { input: inp, qp: Qs - qd, qs: Qs, qpqs: (Qs - qd) / Qs, lr, rl, net: lr - rl, direction, velocity: Math.sqrt(gradient / 4), gradient,
    p: { ra, rvSys: paSys, rvEdp: ra + 1, paSys, paDia, paMean, la, lvSys: armSys, lvEdp: la + 1 + (Pu > 110 ? 4 : 0), aoSys: armSys, aoDia: armDia, aoMean: Pu },
    sat: { ra: sv, rv: sv, pa: sv, la: PV, lv: PV, ao: PV, aoPost: post, sv }, load: { ra: 1, rv: 1, la: 1, lv: 1 }, flags, murmur,
    coarct: { gradient, armSys, armDia, legSys, legDia, lowerFlow: qLow, lowerFrac, ductFlow: qd } };
}

function murmurFor(L: LesionKind, d: Direction, v: number, qpqs: number) {
  if (L === 'none' || d === 'none') return L === 'pfo' ? 'No murmur — the flap is closed while left atrial pressure is higher.' : 'No murmur.';
  if (L === 'vsd') {
    if (d === 'R→L') return 'Murmur fades: little gradient across the defect; single loud P2 (Eisenmenger). Cyanosis, clubbing.';
    if (d === 'bidirectional') return 'Soft or absent systolic murmur — the pressures on both sides are nearly equal; loud P2.';
    return v > 3.5 ? 'Loud harsh holosystolic murmur at the left lower sternal border, often with a thrill (small, restrictive defect).' : `Holosystolic murmur, softer than the size suggests; ${qpqs > 2 ? 'apical diastolic rumble from high mitral flow; ' : ''}loud P2 from raised pulmonary pressure.`;
  }
  if (L === 'asd') return d === 'R→L' ? 'Soft; cyanosis from right-to-left atrial flow.' : 'Widely and fixed split S2; soft systolic flow murmur at the upper left sternal border (the defect itself is silent).';
  if (L === 'pda') return d === 'L→R' ? 'Continuous "machinery" murmur under the left clavicle; bounding pulses, wide pulse pressure.' : 'Murmur disappears; the feet are bluer than the hands (differential cyanosis).';
  if (L === 'pfo') return 'Silent. Right-to-left flow only when right atrial pressure rises — the route for paradoxical embolism.';
  return '';
}

/** Presets that make each lesion behave differently (size, PVR). */
export const HEART_PRESETS = {
  normal: { lesion: 'none', sizeMm: 0, pvr: 1.5, svr: 18 },
  vsdSmall: { lesion: 'vsd', sizeMm: 4, pvr: 1.5, svr: 18 },
  vsdLarge: { lesion: 'vsd', sizeMm: 12, pvr: 2.5, svr: 18 },
  vsdEisen: { lesion: 'vsd', sizeMm: 12, pvr: 18, svr: 18 },
  asd: { lesion: 'asd', sizeMm: 16, pvr: 1.5, svr: 18 },
  pfo: { lesion: 'pfo', sizeMm: 6, pvr: 1.5, svr: 18 },
  pfoValsalva: { lesion: 'pfo', sizeMm: 6, pvr: 1.5, svr: 18, raLoad: 12 },
  pda: { lesion: 'pda', sizeMm: 5, pvr: 1.5, svr: 18 },
  tof: { lesion: 'tof', sizeMm: 14, pvr: 1.5, svr: 18, rvot: 0.5, vsdSite: 'perimembranous' },
  pinkTet: { lesion: 'tof', sizeMm: 14, pvr: 1.5, svr: 18, rvot: 0.25, vsdSite: 'perimembranous' },
  tetSpell: { lesion: 'tof', sizeMm: 14, pvr: 1.5, svr: 13, rvot: 0.68, vsdSite: 'perimembranous' },
  coarct: { lesion: 'coarct', sizeMm: 0, pvr: 1.5, svr: 18, coarct: 0.55 },
  coarctNeoDuct: { lesion: 'coarct', sizeMm: 0, pvr: 50, svr: 60, qs: 0.6, coarct: 0.88, ductMm: 4 },
  coarctNeoClosed: { lesion: 'coarct', sizeMm: 0, pvr: 12, svr: 60, qs: 0.6, coarct: 0.88, ductMm: 0 },
  newborn: { ...NEO.closingDuct },
  pphn: { ...NEO.pphn },
} satisfies Record<string, ShuntInput>;
export type HeartPresetId = keyof typeof HEART_PRESETS;
