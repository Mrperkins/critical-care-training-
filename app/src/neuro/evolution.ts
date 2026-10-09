/**
 * How a stroke evolves from onset to two weeks — pure, deterministic in time (so a slider or a lesson can seek
 * to any minute), on the same NeuroState as the rest of the brain module.
 *
 * Ischaemic (large-vessel occlusion): core and penumbra come from perfusion.ts (collaterals, blood pressure,
 * reperfusion time). Added here: CT visibility of the infarct, swelling (cytotoxic → vasogenic, peaking around
 * days 2–5, then subsiding), midline shift, and haemorrhagic transformation of a large reperfused infarct.
 * Haemorrhagic (ICH): haematoma volume and expansion come from perfusion.ts (first hours, more at high systolic
 * pressure). Added here: an "actively bleeding" phase, perihaematomal oedema that keeps rising for days after
 * the clot has stopped growing, ventricular extension and hydrocephalus, the clot's CT density as it ages.
 *
 * Teaching approximations with the right shapes and time courses — not predictions for a patient.
 */
import { neuroSummary, effectiveHemorrhage, DEFAULT_SYSTEMIC, type NeuroState, type Systemic } from './perfusion';

export const EVO_MAX = 20160; // 14 days, minutes
/** log time axis: the first hours get as much of the slider as the following days */
export const toU = (m: number) => Math.log1p(Math.max(0, m)) / Math.log1p(EVO_MAX);
export const fromU = (u: number) => Math.expm1(Math.max(0, Math.min(1, u)) * Math.log1p(EVO_MAX));
const sat = (x: number) => Math.max(0, Math.min(1, x));
const sig = (x: number) => 1 / (1 + Math.exp(-x));

export type Course = 'ischemic' | 'ich' | 'none';
export const courseOf = (st: NeuroState): Course => (st.hemorrhage?.kind === 'ich' ? 'ich' : Object.keys(st.occlusion).length ? 'ischemic' : 'none');

export interface Evolution {
  course: Course; minutes: number;
  coreMl: number; penumbraMl: number;
  /** how clearly the infarct shows on plain CT (0 normal → 1 obvious hypodensity) */ ctVisible: number;
  /** swelling relative to its peak (0–1) and its volume */ swelling: number; edemaMl: number;
  /** haemorrhagic transformation intensity (0–1), ischaemic course only */ ht: number;
  hematomaMl: number; /** unclotted blood still entering the haematoma (swirl / spot sign phase), 0–1 */ active: number;
  /** clot brightness on CT relative to acute (1 = fresh ≈ 60–80 HU; ≈ 0.45 = isodense with brain) */ clotDensity: number;
  pheMl: number; /** blood in the ventricles (0–1) */ ivh: number; /** trapped CSF / ventricular enlargement (0–1) */ hydro: number;
  midlineShiftMm: number;
}

/** swelling after infarction: starts after ~12 h, peaks days 2–5, mostly gone by day 14 */
export const swellingCurve = (m: number) => sig((m - 1440) / 600) * Math.exp(-Math.max(0, m - 5760) / 4320);
/** clot density on CT: slightly heterogeneous and less dense while still liquid, densest after retraction (day 1–3), then falls to isodense by ~2–3 weeks */
export const clotDensityCurve = (m: number) => (m < 180 ? 0.82 + 0.18 * (m / 180) : m < 4320 ? 1 : Math.max(0.45, 1 - 0.55 * ((m - 4320) / (25920 - 4320))));

export function evolve(st: NeuroState, sys: Systemic = DEFAULT_SYSTEMIC): Evolution {
  const m = st.minutes; const course = courseOf(st);
  const base: Evolution = { course, minutes: m, coreMl: 0, penumbraMl: 0, ctVisible: 0, swelling: 0, edemaMl: 0, ht: 0, hematomaMl: 0, active: 0, clotDensity: 0, pheMl: 0, ivh: 0, hydro: 0, midlineShiftMm: 0 };
  if (course === 'ischemic') {
    const s = neuroSummary(st, sys); const core = s.coreMl;
    const ctVisible = Math.pow(sat((m - 60) / (720 - 60)), 0.7) * sat(core / 5);
    const sw = swellingCurve(m); const edema = core * 0.26 * sw;
    const reperfused = st.recanalizedAt != null && m >= st.recanalizedAt;
    // haemorrhagic transformation: large infarcts, more so after reperfusion; appears days 1–3, fades by day 14
    const risk = Math.min(1, core / (reperfused ? 110 : 220)) * (core > (reperfused ? 35 : 90) ? 1 : 0);
    const ht = risk * sig((m - 2160) / 700) * (1 - sig((m - 13000) / 2500));
    return { ...base, coreMl: core, penumbraMl: s.penumbraMl, ctVisible, swelling: sw, edemaMl: edema, ht, midlineShiftMm: Math.min(18, Math.max(0, edema - 6) * 0.3) };
  }
  if (course === 'ich') {
    const h = effectiveHemorrhage(st, sys)!; const v = h.volumeMl;
    const active = Math.exp(-m / 90) * sat(m / 5 + 0.2);
    const phe = v * (0.15 * sat(m / 360) + 0.95 * (1 - Math.exp(-m / 5000)));
    const deep = Math.hypot(h.at[0], h.at[1] + 0.1, h.at[2]) < 0.5; // deep haematomas sit next to the ventricles
    const ivh = deep ? sat((v - 25) / 20) * sat(m / 45) : 0;
    const hydro = ivh > 0.3 ? ivh * sat((m - 60) / 360) : 0;
    return { ...base, hematomaMl: v, active, clotDensity: clotDensityCurve(m), pheMl: phe, ivh, hydro, midlineShiftMm: Math.min(18, Math.max(0, (v + 0.6 * phe - 10) * 0.22)) };
  }
  return base;
}

/* ------------------------------------------------------------------ what is happening, and what matters, at each stage */
export interface Phase { id: string; from: number; to: number; title: string; text: string; act: string }
export const PHASES: Record<Exclude<Course, 'none'>, Phase[]> = {
  ischemic: [
    { id: 'occlusion', from: 0, to: 30, title: 'The artery blocks', text: 'Flow beyond the clot collapses. Tissue fed only by the blocked artery falls below 10 mL/100 g/min and starts dying within minutes; the rest is held in the penumbra by collaterals. Plain CT is normal — at most the artery itself looks bright.', act: 'Recognise it (face, arm, speech), note the last-known-well time, pre-alert a stroke centre.' },
    { id: 'core-grows', from: 30, to: 270, title: 'Core eats into penumbra', text: 'The dead core expands outward into the penumbra. Its speed is set by the collaterals and the blood pressure: good collaterals buy hours, poor ones minutes. Early CT signs — loss of grey–white contrast in the basal ganglia and insula — begin to appear.', act: 'CT/CTA (± perfusion) without delay. Thrombolysis within 4.5 h if eligible; do not drop the blood pressure — the collaterals are pressure-passive.' },
    { id: 'thrombectomy', from: 270, to: 1440, title: 'Thrombectomy window', text: 'Reopening the artery stops the core growing; what is already core stays lost. Beyond 6 h, patients are selected by imaging (small core, large mismatch) up to 24 h. The infarct turns clearly dark on CT by 12–24 h.', act: 'Large-vessel occlusion + salvageable tissue → thrombectomy. Then: tight BP targets after reperfusion, glucose, temperature, swallow screen.' },
    { id: 'swelling', from: 1440, to: 7200, title: 'Swelling peaks', text: 'Dead cells take on water, then the blood–brain barrier fails: the infarct swells, peaking around days 2–5. A large MCA infarct can push the midline across and herniate ("malignant MCA infarction"); haemorrhagic transformation appears in some, especially after reperfusion.', act: 'Neuro-observations, head up 30°, normocapnia, treat fever; early neurosurgical discussion for hemicraniectomy in large infarcts.' },
    { id: 'resolution', from: 7200, to: EVO_MAX + 1, title: 'Swelling settles', text: 'Oedema resolves over the second week. On CT the infarct may briefly look less dark ("fogging") before it shrinks into a fluid-filled cavity over the following weeks.', act: 'Secondary prevention (antithrombotics, statin, AF and carotid work-up), rehabilitation.' },
  ],
  ich: [
    { id: 'active', from: 0, to: 180, title: 'Still bleeding', text: 'In the first hours the haematoma often keeps growing — unclotted blood looks darker inside the clot (swirl sign) and contrast leaks on CTA (spot sign). Growth is greater at high systolic pressure and on anticoagulants.', act: 'Lower systolic BP promptly and smoothly (around 140 mmHg), reverse anticoagulation, platelets/coagulation as indicated, airway if GCS falls.' },
    { id: 'early', from: 180, to: 1440, title: 'Growth stops, ventricles at risk', text: 'Most expansion is over by 6 h. A deep haematoma can rupture into the ventricles; blood blocks CSF outflow and the ventricles enlarge (hydrocephalus) within hours.', act: 'Repeat CT if the patient worsens; external ventricular drain for hydrocephalus; cerebellar haematomas > 3 cm or with brainstem compression → surgery.' },
    { id: 'phe', from: 1440, to: 4320, title: 'Oedema rises around the clot', text: 'The clot itself no longer grows, but perihaematomal oedema builds from thrombin and iron toxicity: mass effect and ICP can worsen on days 2–3 even in a patient who was stable.', act: 'Neuro-observations, ICP-directed care where monitored, osmotherapy for herniation signs, normocapnia, head up.' },
    { id: 'peak', from: 4320, to: 10080, title: 'Peak mass effect', text: 'Oedema keeps creeping up through the first week to two. The clot starts to break down from its edges.', act: 'Watch for late deterioration; seizure and VTE prophylaxis decisions; early rehabilitation.' },
    { id: 'aging', from: 10080, to: EVO_MAX + 1, title: 'The clot fades', text: 'As haemoglobin breaks down the clot loses density on CT, becoming similar to brain around 2–3 weeks (a rim may enhance with contrast). Months later a slit-like cavity remains.', act: 'Blood-pressure control for secondary prevention; decide on restarting antithrombotics.' },
  ],
};
export const phaseAt = (course: Exclude<Course, 'none'>, m: number) => PHASES[course].find((p) => m >= p.from && m < p.to) ?? PHASES[course][PHASES[course].length - 1];

/** milestone ticks on the time slider */
export const MILESTONES: Record<Exclude<Course, 'none'>, [number, string][]> = {
  ischemic: [[0, 'Onset'], [270, '4.5 h · lysis'], [360, '6 h'], [1440, '24 h'], [4320, 'Day 3'], [10080, 'Day 7'], [EVO_MAX, 'Day 14']],
  ich: [[0, 'Onset'], [180, '3 h'], [360, '6 h'], [1440, '24 h'], [4320, 'Day 3'], [10080, 'Day 7'], [EVO_MAX, 'Day 14']],
};
export const fmtTime = (m: number) => (m < 60 ? `${Math.round(m)} min` : m < 1440 ? `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')} min` : `day ${(m / 1440).toFixed(m < 4320 ? 1 : 0)}`);
