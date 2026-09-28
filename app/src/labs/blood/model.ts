/**
 * Blood scenes (Hb/Hct/RBC/WBC/Plt and PT/INR/aPTT/fibrinogen): what to draw, computed from the
 * shared patient. Counts are LINEAR in the lab value so anaemia, polycythaemia, leukocytosis or
 * thrombocytopenia are obvious at a glance (white cells and platelets are over-represented
 * relative to red cells so a handful are always on screen; the HUD prints the real numbers).
 */
import type { Snapshot, PatientState } from '../../physiology/patient';
import { LAB } from '../../knowledge/labs';

export type BloodKind = 'blood' | 'clot';
export type BloodFocus = 'rbc' | 'wbc' | 'plt' | 'o2' | 'plasma' | 'wall' | 'tissue' | 'injury' | 'plug' | 'fibrin' | 'bleed' | 'none';
export interface BloodStep { text: string; focus: BloodFocus; tone?: 'bad' | 'good' | 'info' }
export interface BloodModel {
  kind: BloodKind; labId: string;
  hb: number; hct: number; sao2: number; svo2: number; cao2: number; co: number; do2: number;
  wbc: number; plt: number; inr: number; ptt: number; fib: number;
  nRbc: number; nWbc: number; nPlt: number; flow: number;
  /** seconds until the platelet + fibrin plug stops the bleeding in this model (Infinity = does not seal) */
  seal: number; plug: number; fibrin: number; coag: number;
  chain: BloodStep[]; headline: string;
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const bloodKindOf = (labId: string): BloodKind | null => { const s = LAB[labId]?.scene; return s === 'blood' ? 'blood' : s === 'clot' ? 'clot' : null; };
export const NORMAL_SEAL = 4;

export function bloodModel(labId: string, s: Snapshot, pt: PatientState): BloodModel | null {
  const kind = bloodKindOf(labId); if (!kind) return null; const p = pt.p;
  const hct = p.hb * 3;
  const pf = clamp(p.plt / 250, 0, 2), cf = 1 / Math.max(1, p.inr, p.ptt / 30), ff = clamp(p.fibrinogen / 300, 0.05, 2);
  const seal = pf < 0.06 ? Infinity : NORMAL_SEAL / (Math.pow(pf, 0.8) * cf * Math.pow(ff, 0.45));
  const m: BloodModel = {
    kind, labId, hb: p.hb, hct, sao2: s.sao2, svo2: s.svo2, cao2: s.cao2, co: s.co, do2: s.do2,
    wbc: p.wbc, plt: p.plt, inr: p.inr, ptt: p.ptt, fib: p.fibrinogen,
    nRbc: Math.round(clamp(2.6 * hct, 4, 190)), nWbc: Math.round(clamp(p.wbc / 2.3, 0, 22)), nPlt: Math.round(clamp(p.plt / 11, 0, 80)),
    flow: clamp(s.co / 5, 0.35, 2), seal: seal > 40 ? Infinity : seal, plug: clamp(pf, 0, 1.4), fibrin: clamp(ff, 0.05, 1.6), coag: cf,
    chain: [], headline: '',
  };
  const c = kind === 'blood' ? bloodChain(m) : clotChain(m); m.chain = c.chain; m.headline = c.headline;
  return m;
}

const f0 = (x: number) => x.toFixed(0), f1 = (x: number) => x.toFixed(1);
function bloodChain(m: BloodModel): { chain: BloodStep[]; headline: string } {
  const ch: BloodStep[] = []; const push = (text: string, focus: BloodFocus, tone?: BloodStep['tone']) => ch.push({ text, focus, tone });
  const sat = Math.round(m.sao2 * 100), sv = Math.round(m.svo2 * 100);
  if (m.labId === 'wbc') {
    if (m.wbc > 11) { push(`WBC ${f1(m.wbc)} — more white cells in every drop (normal 4–11)`, 'wbc', 'bad'); push('They roll along the vessel wall (margination), then squeeze out into infected tissue', 'wbc'); push('Causes: infection, steroids, stress, leukaemia. Very high counts thicken the blood (leukostasis)', 'wbc', 'info'); }
    else if (m.wbc < 4) { push(`WBC ${f1(m.wbc)} — few white cells patrolling (normal 4–11)`, 'wbc', 'bad'); push('Neutrophils < 1.5 → bacterial infection risk; < 0.5 → neutropenic fever is an emergency', 'wbc', 'bad'); push('Causes: chemotherapy, marrow failure, overwhelming sepsis, some drugs and viruses', 'wbc', 'info'); }
    else { push(`WBC ${f1(m.wbc)} — about 1 white cell for every 700 red cells`, 'wbc'); push('Neutrophils (lobed nucleus) fight bacteria; lymphocytes (round nucleus) drive immunity', 'wbc'); push('They travel slowly along the wall, ready to leave the vessel where they are needed', 'wall'); }
    return { chain: ch, headline: `WBC ${f1(m.wbc)} ×10⁹/L` };
  }
  if (m.labId === 'plt') return clotChain(m);
  push(`Hb ${f1(m.hb)} g/dL · Hct ${f0(m.hct)} % — ${m.hb < 12 ? 'fewer' : m.hb > 17 ? 'more' : 'a normal number of'} red cells in each drop`, 'rbc', m.hb < 12 || m.hb > 17 ? 'bad' : undefined);
  push(`Each red cell is still ${sat} % full of O₂ — the pulse oximeter only sees that percentage`, 'o2');
  push(`O₂ content = 1.34 × ${f1(m.hb)} × ${(m.sao2).toFixed(2)} + dissolved ≈ ${f1(m.cao2)} mL/dL (normal ≈ 19)`, 'o2', m.cao2 < 15 ? 'bad' : undefined);
  if (m.hb < 12) {
    push(`The heart pumps harder to compensate: cardiac output ${f1(m.co)} L/min`, 'rbc', 'info');
    push(`Tissues strip more O₂ from each cell: blood leaves at ${sv} % saturation (normal ≈ 70 %) — see it darken along the vessel`, 'tissue', sv < 60 ? 'bad' : 'info');
  } else if (m.hb > 17) {
    push('Thicker blood flows more slowly and clots more easily (stroke, DVT) — causes: dehydration, COPD, polycythaemia vera', 'rbc', 'bad');
  } else push(`Blood gives up about a quarter of its O₂ to the tissue: in at ${sat} %, out at ${sv} %`, 'tissue');
  return { chain: ch, headline: `Hb ${f1(m.hb)} · CaO₂ ${f1(m.cao2)} mL/dL · SvO₂ ${sv} %` };
}

function clotChain(m: BloodModel): { chain: BloodStep[]; headline: string } {
  const ch: BloodStep[] = []; const push = (text: string, focus: BloodFocus, tone?: BloodStep['tone']) => ch.push({ text, focus, tone });
  const seal = isFinite(m.seal) ? `${f1(m.seal)} s` : 'does not stop';
  push('The vessel wall tears: collagen under the lining is exposed and blood escapes', 'injury');
  if (m.plt < 150) push(`Platelets ${f0(m.plt)} ×10⁹/L — ${m.plt < 20 ? 'almost none' : 'fewer'} reach the tear, so the first plug is ${m.plt < 50 ? 'tiny' : 'small'}`, 'plt', 'bad');
  else push(`Platelets ${f0(m.plt)} ×10⁹/L stick to the collagen (via von Willebrand factor) and pile up: the platelet plug`, 'plug');
  if (m.inr > 1.3 || m.ptt > 40) push(`${m.inr > 1.3 ? `INR ${f1(m.inr)}` : ''}${m.inr > 1.3 && m.ptt > 40 ? ' and ' : ''}${m.ptt > 40 ? `aPTT ${f0(m.ptt)} s` : ''}: clotting factors are ${m.inr > 1.3 ? 'low (warfarin, liver disease, DIC)' : 'slow (heparin, haemophilia, DIC)'} → thrombin is made late`, 'fibrin', 'bad');
  else push('The clotting cascade makes thrombin on the platelet surface', 'fibrin');
  if (m.fib < 150) push(`Fibrinogen ${f0(m.fib)} mg/dL — too little to weave a strong mesh: the plug stays fragile (give cryo / fibrinogen < 150)`, 'fibrin', 'bad');
  else push(`Thrombin turns fibrinogen (${f0(m.fib)} mg/dL) into a fibrin mesh that locks the plug in place`, 'fibrin');
  push(`Bleeding stops after ${seal} in this model (normal ≈ ${NORMAL_SEAL} s)`, 'bleed', isFinite(m.seal) && m.seal < NORMAL_SEAL * 1.5 ? 'good' : 'bad');
  return { chain: ch, headline: `Bleeding stops: ${seal}` };
}
