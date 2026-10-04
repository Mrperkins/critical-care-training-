/**
 * Intracranial pressure (Monro–Kellie) on the SAME neuro state: the extra volume inside the fixed skull
 * — haematoma (as it grows), perihaematomal / infarct oedema, CSF trapped by obstructive hydrocephalus,
 * cerebral blood volume from PaCO₂ — is buffered at first by displacing CSF and venous blood, then ICP
 * rises exponentially. Treatments act on the same terms (head-up, ventilation, osmotherapy, CSF drainage
 * through an EVD, evacuation). Pure and seekable; values are illustrative teaching numbers.
 */
import { effectiveHemorrhage, neuroSummary, DEFAULT_SYSTEMIC, type NeuroState, type Systemic } from './perfusion';

export interface EvdSettings { open: boolean; /** drip-chamber height above the reference (tragus ≈ foramen of Monro), cmH₂O */ heightCm: number;
  /** the reference moved without re-levelling: + = the tragus is now ABOVE the zero (head of bed raised), so the chamber is effectively lower */ levelErrorCm: number }
export interface IcpInput {
  /** head-of-bed elevation, degrees */ headUp: number; /** brain water removed by osmotherapy, mL */ osmoMl: number;
  /** obstructive hydrocephalus (blood in the ventricles / aqueduct after SAH or IVH) */ hydrocephalus: boolean;
  /** minutes since CSF outflow blocked (default: the state's minutes, at least 2 h — so switching it on for a fresh bleed shows established hydrocephalus) */ hydroMin?: number;
  evd: EvdSettings | null; /** the haematoma has been evacuated / decompressive craniectomy */ decompressed: boolean; age: 'young' | 'old';
}
export const ICP_DEFAULT: IcpInput = { headUp: 30, osmoMl: 0, hydrocephalus: false, evd: null, decompressed: false, age: 'young' };

const P0 = 10;
/** pressure–volume curve: flat while CSF and venous blood can be displaced, exponential after the "knee" */
export function icpOfVolume(dv: number, buffer: number, decompressed = false) {
  if (dv < 0) return Math.max(0, P0 + 0.25 * dv); // below the resting volume (CSF drained away): pressure falls toward zero
  if (decompressed) return P0 + 0.06 * dv; // the skull is no longer a closed box
  if (dv <= buffer) return P0 + 0.08 * dv;
  return (P0 + 0.08 * buffer) * Math.exp(0.055 * (dv - buffer));
}
/** elastance dP/dV (mmHg/mL) at this volume: small on the flat part, large past the knee */
export const elastance = (dv: number, buffer: number, dec = false) => (icpOfVolume(dv + 0.5, buffer, dec) - icpOfVolume(dv - 0.5, buffer, dec));

export interface IcpVolumes { mass: number; edema: number; csf: number; cbv: number; relief: number; total: number; buffer: number }
/** Extra intracranial volume (mL) from the neuro state and the treatments. */
export function icpVolumes(st: NeuroState, sys: Systemic, inp: IcpInput, evdRemoved = 0): IcpVolumes {
  const h = effectiveHemorrhage(st, sys); const ich = h && h.kind === 'ich' && !inp.decompressed ? h.volumeMl : 0;
  const hrs = st.minutes / 60;
  const periHaem = ich * 0.6 * (1 - Math.exp(-hrs / 24)); // perihaematomal oedema over the first day(s)
  const core = neuroSummary(st, { ...sys, icp: 10 }).coreMl; // infarct swelling from the stroke itself — not fed back from this ICP (that would be circular)
  const infarctOedema = core * 0.22 * Math.max(0, Math.min(1, (hrs - 12) / 48)); // malignant swelling after large infarcts, day 2–4
  const csf = inp.hydrocephalus ? Math.min(60, 0.3 * (inp.hydroMin ?? Math.max(st.minutes, 120))) : 0; // CSF keeps being made (~20 mL/h) with nowhere to go
  const cbv = 1.2 * ((sys.paco2 ?? 40) - 40); // CO₂ dilates or constricts the cerebral vessels
  const relief = Math.min(8, inp.headUp * 0.2) + inp.osmoMl + evdRemoved;
  const buffer = inp.age === 'old' ? 40 : 25; // atrophy leaves more room
  return { mass: ich, edema: periHaem + infarctOedema, csf, cbv, relief, total: ich + periHaem + infarctOedema + csf + cbv - relief, buffer };
}

export type Herniation = 'none' | 'early uncal' | 'uncal' | 'central' | 'tonsillar';
export interface IcpState {
  icp: number; cpp: number; map: number; hr: number; resp: 'regular' | 'irregular' | 'apnoeic';
  vol: IcpVolumes; elastance: number; /** ICP waveform P2 / P1 (> 1 = poor compliance) */ p2p1: number;
  herniation: Herniation; side: 'L' | 'R'; shiftMm: number;
  pupils: { L: { mm: number; reactive: boolean }; R: { mm: number; reactive: boolean } }; posture: 'none' | 'decorticate' | 'decerebrate' | 'flaccid'; gcsCap: number;
  cushing: boolean;
  evd: null | { drainingMlH: number; removedMl: number; readsIcp: number; overdrainage: boolean; clampedHigh: boolean; effectiveHeightMmHg: number };
}

/** The whole picture: ICP, CPP, Cushing response, herniation signs, EVD behaviour. `sys.map` is the patient's own MAP before any Cushing response. */
export function icpState(st: NeuroState, sys: Systemic = DEFAULT_SYSTEMIC, inp: IcpInput = ICP_DEFAULT): IcpState {
  // EVD: while open, CSF leaves whenever ICP exceeds the chamber height, until ICP settles at that height
  // (it can only remove what is there: trapped CSF + ~20 mL of the ventricles' own CSF)
  let removed = 0; let evdOut: IcpState['evd'] = null;
  const base = icpVolumes(st, sys, inp, 0);
  if (inp.evd) {
    const effH = (inp.evd.heightCm - inp.evd.levelErrorCm) / 1.36; // cmH₂O → mmHg, relative to the true foramen of Monro
    const avail = base.csf + 20;
    if (inp.evd.open) {
      const f = (r: number) => icpOfVolume(base.total - r, base.buffer, inp.decompressed) - Math.max(0, effH);
      if (f(0) > 0) { let lo = 0, hi = avail; if (f(hi) > 0) removed = hi; else { for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } removed = hi; } }
    }
    const vIcp = icpOfVolume(base.total - removed, base.buffer, inp.decompressed);
    evdOut = { drainingMlH: inp.evd.open && removed > 0 ? 20 : 0, removedMl: removed, readsIcp: vIcp, overdrainage: inp.evd.open && (effH < 3 || removed >= avail - 0.5), clampedHigh: !inp.evd.open && vIcp > 22, effectiveHeightMmHg: effH };
  }
  const vol = removed ? icpVolumes(st, sys, inp, removed) : base;
  const icp = icpOfVolume(vol.total, vol.buffer, inp.decompressed);
  const el = elastance(vol.total, vol.buffer, inp.decompressed);
  // Cushing: brainstem ischaemia drives the pressure up and the heart rate down (a late sign)
  const cushing = icp > 45 && sys.map - icp < 50;
  const map = cushing ? sys.map + Math.min(60, (icp - 40) * 2.5) : sys.map;
  const hr = cushing ? Math.max(38, 80 - (icp - 40) * 2) : 80;
  const cpp = map - icp;
  const h = effectiveHemorrhage(st, sys); const side: 'L' | 'R' = h && h.at[0] < 0 ? 'R' : 'L';
  const lateral = vol.mass + vol.edema > 5; // a one-sided mass shifts the midline; hydrocephalus alone pushes down (central)
  const shiftMm = lateral && !inp.decompressed ? Math.max(0, (vol.mass + vol.edema - vol.buffer * 0.3) * 0.25) : 0;
  let herniation: Herniation = 'none';
  if (icp > 55 || cpp < 25) herniation = 'tonsillar';
  else if (lateral ? icp > 38 || shiftMm > 12 : icp > 38) herniation = lateral ? 'uncal' : 'central';
  else if (lateral && (icp > 25 || shiftMm > 6)) herniation = 'early uncal';
  const ipsi = side; const contra = side === 'L' ? 'R' : 'L';
  const pupils = { L: { mm: 3, reactive: true }, R: { mm: 3, reactive: true } };
  if (herniation === 'early uncal') pupils[ipsi] = { mm: 4.5, reactive: true };
  if (herniation === 'uncal') pupils[ipsi] = { mm: 7, reactive: false };
  if (herniation === 'central') { pupils.L = { mm: 3, reactive: false }; pupils.R = { mm: 3, reactive: false }; }
  if (herniation === 'tonsillar') { pupils.L = { mm: 7, reactive: false }; pupils.R = { mm: 7, reactive: false }; }
  void contra;
  const posture = herniation === 'tonsillar' ? (icp > 70 ? 'flaccid' : 'decerebrate') : herniation === 'uncal' || herniation === 'central' ? 'decorticate' : 'none';
  const gcsCap = herniation === 'tonsillar' ? 4 : herniation === 'uncal' || herniation === 'central' ? 7 : herniation === 'early uncal' ? 11 : icp > 20 ? 13 : 15;
  const resp = herniation === 'tonsillar' ? (icp > 70 ? 'apnoeic' : 'irregular') : cushing ? 'irregular' : 'regular';
  const p2p1 = Math.min(1.8, 0.7 + el * 0.35);
  return { icp, cpp, map, hr, resp, vol, elastance: el, p2p1, herniation, side, shiftMm, pupils, posture, gcsCap, cushing, evd: evdOut };
}

/** One ICP pulse (P1 percussion, P2 tidal, P3 dicrotic) scaled by compliance, for drawing. */
export function icpWave(s: IcpState, n = 120): number[] {
  const amp = Math.min(18, 1.5 + s.elastance * 4); const out: number[] = [];
  for (let i = 0; i < n; i++) { const t = i / n; const g = (c: number, w: number) => Math.exp(-(((t - c) / w) ** 2));
    out.push(s.icp - amp * 0.35 + amp * (0.8 * g(0.14, 0.05) + 0.8 * s.p2p1 * g(0.3, 0.07) + 0.45 * g(0.5, 0.06))); }
  return out;
}

export function icpFindings(s: IcpState): string[] {
  const f: string[] = [`ICP ${Math.round(s.icp)} mmHg, CPP ${Math.round(s.cpp)} mmHg (MAP ${Math.round(s.map)} − ICP).`];
  f.push(s.vol.total < s.vol.buffer ? 'On the flat part of the pressure–volume curve: CSF and venous blood are still being displaced.' : 'Past the knee of the curve: every extra millilitre raises the pressure more; the waveform’s second peak (P2) is taller than the first.');
  if (s.cpp < 60) f.push('CPP below about 60: the brain is at risk of ischaemia even without a blocked artery.');
  if (s.shiftMm > 2) f.push(`Midline shift about ${s.shiftMm.toFixed(0)} mm away from the ${s.side === 'L' ? 'left' : 'right'}-sided mass.`);
  if (s.herniation === 'early uncal') f.push(`Early uncal herniation: ${s.side === 'L' ? 'left' : 'right'} pupil enlarging and sluggish, drowsier.`);
  if (s.herniation === 'uncal') f.push(`Uncal herniation: ${s.side === 'L' ? 'left' : 'right'} pupil fixed and dilated (third nerve), opposite-side weakness, GCS ≤ 8.`);
  if (s.herniation === 'central') f.push('Central (downward) herniation: small, unreactive pupils, posturing, falling GCS.');
  if (s.herniation === 'tonsillar') f.push('Tonsillar herniation: both pupils fixed and dilated, extensor posturing, respiratory arrest imminent.');
  if (s.cushing) f.push(`Cushing response: hypertension (${Math.round(s.map)} mean), bradycardia (${Math.round(s.hr)}), irregular breathing — a late, pre-terminal sign.`);
  if (s.evd) {
    if (s.evd.overdrainage) f.push('EVD overdraining: the chamber is effectively too low (re-level after moving the head of the bed) — risk of ventricular collapse and bleeding.');
    else if (s.evd.clampedHigh) f.push('EVD clamped while the pressure climbs: open it at the ordered height.');
    else if (s.evd.drainingMlH > 0) f.push(`EVD draining CSF: ICP settles at the chamber height (${Math.round(s.evd.effectiveHeightMmHg)} mmHg).`);
  }
  return f;
}

/**
 * Relative size of the lateral ventricles on CT (1 = normal): trapped CSF enlarges them (drained CSF shrinks them
 * back); swelling from a mass or oedema compresses them toward slits.
 */
export function ventricleScale(st: NeuroState, sys: Systemic = DEFAULT_SYSTEMIC, inp: IcpInput = ICP_DEFAULT): number {
  const s = icpState(st, sys, inp); const trapped = Math.max(0, s.vol.csf - (s.evd?.removedMl ?? 0));
  const squeeze = Math.max(0, Math.min(1, (s.vol.mass + s.vol.edema - s.vol.buffer * 0.3) / 40));
  return Math.max(0.35, Math.min(2.4, (1 + trapped / 35) * (1 - 0.55 * squeeze)));
}
