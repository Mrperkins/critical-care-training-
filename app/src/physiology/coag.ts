/**
 * Coagulation inside the SyntheticPatient. Optional per patient (`st.coag`); when present it DRIVES the
 * patient's INR, aPTT, fibrinogen and platelet values (synced into `st.p` after every step), so every
 * existing reader — Labs bench, clot scene, blood panel, MOA read-outs — shows the engine's result.
 *
 * State (teaching resolution, not a full cascade):
 *   f7   factor VII activity (half-life ≈ 6 h)            fx   factors II / IX / X lumped (≈ 24 h for the PT-relevant pool)
 *   other non-vitamin-K factors (V, VIII, XI…)            fib  fibrinogen (mg/dL)      plt  platelets (×10⁹/L)
 *   warfarin: VKOR block 0–1;  vitK: vitamin K available to bypass the block (IV ≈ immediate supply, oral depot slower)
 *   hep: UFH anti-Xa (IU/mL, t½ ≈ 90 min, infusion target `hepRate`);  lmwh: anti-Xa (t½ ≈ 4.5 h);  protFree: excess protamine
 *   lysis: steady fibrinolytic drive (trauma hyperfibrinolysis);  tpa: transient fibrinolytic drug;  txa: antifibrinolytic level
 *
 * Laboratory read-outs:
 *   extrinsic activity a = √(f7·fx) · fibrinogen factor;     INR = a^−0.7   (≈ 2.5 at 25 % factor activity, ≈ 6 at 7 %)
 *   aPTT = 30 · (fx·other)^−0.35 · fibrinogen factor^−0.3 · (1 + 2.3·UFH + 0.6·LMWH + 1.2·excess protamine)
 *   clot firmness (viscoelastic MCF, mm) from fibrinogen and platelets;  LY30 (% lysis at 30 min) from net fibrinolysis
 *   clotting capacity 0–1: thrombin generation × clot strength × (1 − lysis)
 * Kinetics: factors relax toward synthesis = hepatic × carboxylation, carboxylation = 1 − warfarin·(1 − vitK).
 * Values are teaching approximations; they reproduce the clinical time courses, not any one assay.
 */
export interface CoagState {
  f7: number; fx: number; other: number; fib: number; plt: number;
  warfarin: number; vitK: number; vitKGut: number;
  hep: number; hepRate: number; lmwh: number; protFree: number;
  lysis: number; tpa: number; txa: number;
  /** fibrinogen the liver returns to */ fib0: number;
}
export interface CoagLabs { inr: number; aptt: number; fib: number; plt: number; mcf: number; ly30: number; capacity: number; factorPct: number }

export const normalCoag = (): CoagState => ({ f7: 1, fx: 1, other: 1, fib: 300, plt: 250, warfarin: 0, vitK: 0, vitKGut: 0, hep: 0, hepRate: 0, lmwh: 0, protFree: 0, lysis: 0, tpa: 0, txa: 0, fib0: 300 });

export type CoagPresetId = 'normal' | 'warfarinBleed' | 'heparin' | 'heparinHigh' | 'lmwh' | 'traumaLysis';
export const COAG_PRESETS: Record<CoagPresetId, { name: string; story: string; make: () => CoagState }> = {
  normal: { name: 'Normal', story: 'Healthy adult, no anticoagulant.', make: normalCoag },
  warfarinBleed: { name: 'Warfarin, bleeding', story: 'On warfarin for atrial fibrillation; INR far above range after an antibiotic course.', make: () => ({ ...normalCoag(), warfarin: 0.93, f7: 0.06, fx: 0.08 }) },
  heparin: { name: 'Heparin infusion', story: 'Unfractionated heparin infusion for a pulmonary embolism, anti-Xa ≈ 0.6.', make: () => ({ ...normalCoag(), hep: 0.6, hepRate: 0.6 }) },
  heparinHigh: { name: 'Heparin, bleeding', story: 'Bleeding from the line sites after a large heparin bolus; infusion now stopped.', make: () => ({ ...normalCoag(), hep: 1.2 }) },
  lmwh: { name: 'LMWH', story: 'Treatment-dose low-molecular-weight heparin given 3 hours ago.', make: () => ({ ...normalCoag(), lmwh: 1.0 }) },
  traumaLysis: { name: 'Trauma: hyperfibrinolysis', story: 'Major trauma, 1 hour after injury: clots are breaking down as fast as they form.', make: () => ({ ...normalCoag(), lysis: 0.3, fib: 160, plt: 150, other: 0.8, f7: 0.85, fx: 0.85 }) },
};

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const TAU = { f7: 360 / Math.LN2, fx: 1440 / Math.LN2, other: 900 / Math.LN2, hep: 90 / Math.LN2, lmwh: 270 / Math.LN2, prot: 10, vitK: 7200, gut: 180, tpa: 10, txa: 120 / Math.LN2, fib: 5760 };
const txaEff = (c: CoagState) => c.txa / (c.txa + 0.12);
const netLysis = (c: CoagState) => (c.lysis + c.tpa) * (1 - 0.9 * txaEff(c));

/** Advance `dt` minutes (pure update in place). */
export function stepCoag(c: CoagState, dt: number, hepatic = 1) {
  const absorbed = c.vitKGut * (1 - Math.exp(-dt / TAU.gut)); c.vitKGut -= absorbed; c.vitK = clamp(c.vitK + absorbed);
  const carbox = 1 - c.warfarin * (1 - c.vitK); const synth = clamp(hepatic) * carbox;
  const relax = (x: number, target: number, tau: number) => x + (target - x) * (1 - Math.exp(-dt / tau));
  c.f7 = relax(c.f7, synth, TAU.f7); c.fx = relax(c.fx, synth, TAU.fx); c.other = relax(c.other, clamp(hepatic), TAU.other);
  c.hep = relax(c.hep, c.hepRate, TAU.hep); c.lmwh *= Math.exp(-dt / TAU.lmwh); c.protFree *= Math.exp(-dt / TAU.prot);
  c.vitK *= Math.exp(-dt / TAU.vitK); c.tpa *= Math.exp(-dt / TAU.tpa); c.txa *= Math.exp(-dt / TAU.txa);
  // fibrinolysis consumes fibrinogen; the liver restores it slowly
  const L = netLysis(c); c.fib = Math.max(20, c.fib - c.fib * L * dt / 45 + (c.fib0 * clamp(hepatic) - c.fib) * (1 - Math.exp(-dt / TAU.fib)));
}

export type CoagDrug = 'pcc' | 'vitkIV' | 'vitkOral' | 'protamine' | 'txa' | 'ffp' | 'cryo' | 'platelets' | 'tpa' | 'heparinStop';
/** Give a haemostatic drug or product (dose 1 = a standard adult dose). */
export function coagGive(c: CoagState, d: CoagDrug, dose = 1) {
  switch (d) {
    case 'pcc': c.f7 = Math.min(1.1, c.f7 + 0.75 * dose); c.fx = Math.min(1.2, c.fx + 0.85 * dose); break; // 4F-PCC ≈ 25–50 IU/kg
    case 'vitkIV': c.vitK = clamp(c.vitK + dose); break;                  // 10 mg IV
    case 'vitkOral': c.vitKGut += 0.8 * dose; break;                       // oral: absorbed over hours
    case 'protamine': { // 1 mg per ~100 units: dose 1 neutralises ≈ 1.2 IU/mL anti-Xa of UFH, ≈ 60 % of LMWH at most
      let cap = 1.2 * dose; const u = Math.min(c.hep, cap); c.hep -= u; cap -= u;
      const l = Math.min(c.lmwh * 0.6, cap); c.lmwh -= l; cap -= l; c.protFree += cap * 0.25; break;
    }
    case 'heparinStop': c.hepRate = 0; break;
    case 'txa': c.txa = Math.min(1.5, c.txa + dose); break;                 // 1 g IV
    case 'ffp': { const k = 0.18 * dose; c.f7 = Math.min(1, c.f7 + k * (1 - c.f7)); c.fx = Math.min(1, c.fx + k * (1 - c.fx)); c.other = Math.min(1, c.other + k * (1 - c.other)); c.fib += 30 * dose; break; } // 15 mL/kg: modest rise, large volume
    case 'cryo': c.fib += 80 * dose; break;                                 // pooled cryoprecipitate / fibrinogen concentrate
    case 'platelets': c.plt += 40 * dose; break;                            // one adult pool
    case 'tpa': c.tpa = Math.min(3, c.tpa + 1.6 * dose); break;
  }
}

/** Laboratory and viscoelastic read-outs. Pure. */
export function coagLabs(c: CoagState): CoagLabs {
  const fibF = Math.sqrt(clamp(c.fib / 100, 0.05, 1));
  const a = Math.sqrt(Math.max(0.005, c.f7) * Math.max(0.005, c.fx)) * fibF;
  const inr = Math.min(12, a ** -0.7 * (1 + 0.08 * Math.min(1, c.hep)));
  const aptt = Math.min(180, 30 * Math.max(0.01, c.fx * c.other) ** -0.35 * fibF ** -0.6 * (1 + 2.3 * c.hep + 0.6 * c.lmwh + 1.2 * c.protFree));
  const mcf = 20 + 25 * (1 - Math.exp(-c.fib / 250)) + 20 * (1 - Math.exp(-c.plt / 120));
  const ly30 = Math.min(100, 1 + 60 * netLysis(c));
  const thrombin = clamp(Math.min(a / fibF, 1) ** 0.8 * Math.min(1, 30 / aptt) ** 0.8);
  const strength = clamp((mcf - 20) / 35);
  const capacity = clamp(thrombin ** 0.6 * strength ** 0.8 * (1 - ly30 / 100));
  return { inr, aptt, fib: c.fib, plt: c.plt, mcf, ly30, capacity, factorPct: 100 * Math.sqrt(c.f7 * c.fx) };
}

/** A viscoelastic-style trace (amplitude, mm) for drawing: clot builds after a reaction time, then lyses. */
export function viscoTrace(c: CoagState, n = 90, minutes = 60): { t: number; a: number }[] {
  const L = coagLabs(c); const r = 5 * Math.min(4, L.inr ** 0.8) * Math.min(3, L.aptt / 30) ** 0.5; const k = 3 + 4 * (1 - (L.mcf - 20) / 50);
  const lysRate = -Math.log(1 - Math.min(0.99, L.ly30 / 100)) / 30;
  return Array.from({ length: n }, (_, i) => { const t = (i / (n - 1)) * minutes; const build = t < r ? 0 : L.mcf * (1 - Math.exp(-(t - r) / k)); const peakT = r + 3 * k; return { t, a: build * (t > peakT ? Math.exp(-lysRate * (t - peakT)) : 1) }; });
}
