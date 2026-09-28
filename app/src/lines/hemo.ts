/**
 * Invasive-lines module: patient states and the circulation parameters that drive the pressure
 * waveforms. Each state is built from its CAUSES on the shared SyntheticPatient (cardiac output,
 * SVR, heart rate, CVP, volume), then a few morphology parameters describe what the patient engine
 * does not model (valve lesions, rhythm, pericardium, arterial stiffness).
 *
 * Units: pressure mmHg, volume mL, time s, resistance mmHg·s/mL (SVR dyn·s·cm⁻⁵ ÷ 1333),
 * compliance mL/mmHg.
 */
import type { PatientParams, Snapshot } from '../physiology/patient';

export type Rhythm = 'sinus' | 'af' | 'chb' | 'pvc';
export interface Morph {
  rhythm?: Rhythm;
  /** aortic stenosis 0–1 (slow, late upstroke; narrow pulse pressure) */
  as?: number;
  /** aortic regurgitation 0–1 (regurgitant fraction ≈ 0.5 × ar) */
  ar?: number;
  /** tricuspid regurgitation 0–1 (giant c-v wave, loss of x descent) */
  tr?: number;
  /** pericardial tamponade 0–1 (high equalised CVP, lost y descent, pulsus paradoxus) */
  tamponade?: number;
  /** stiff RV / RV pressure load 0–1 (big a wave, high RV systolic pressure) */
  rvLoad?: number;
  /** arterial stiffness 0–1 (low compliance, early wave reflection, wide pulse pressure) */
  stiff?: number;
  /** poor LV contractility 0–1 (slow upstroke, long pre-ejection period) */
  lvFail?: number;
  /** pulsus alternans 0–0.3 */
  alternans?: number;
  /** atrial rate in complete heart block */
  atrialRate?: number;
  /** a PVC every n beats */
  pvcEvery?: number;
}

export interface LinesScenario {
  id: string; name: string; short: string; group: 'Baseline' | 'Shock' | 'Rhythm' | 'Valves & pericardium' | 'Arteries';
  blurb: string; params: Partial<PatientParams>; morph: Morph;
  /** cause → effect, one line each; the monitor features the learner should find */
  story: string[];
  /** what to look for on the waveform (drives the wave annotations) */
  look: string[];
}

export const SCENARIOS: LinesScenario[] = [
  { id: 'normal', name: 'Normal adult', short: 'Normal', group: 'Baseline', params: { svr: 1400, hr: 72 }, morph: {},
    blurb: 'Resting adult, sinus rhythm, breathing spontaneously.',
    story: ['Each heartbeat ejects ~65 mL into a stretchy aorta: pressure rises fast, then runs off through the arterioles', 'The aortic valve closes → dicrotic notch on the downstroke', 'Right atrial pressure follows the heart: a (atrial kick), c (tricuspid bulges), x, v (atrium fills), y (tricuspid opens)'],
    look: ['Sharp upstroke, rounded peak, dicrotic notch about one-third down the downstroke', 'CVP 2–8 mmHg with a > v', 'CVP dips with each spontaneous breath — read it at end-expiration'] },
  { id: 'hypovol', name: 'Haemorrhage (hypovolaemic shock)', short: 'Hypovolaemia', group: 'Shock', params: { volume: 0.62, hr: 118, svr: 1650, cvp: 1 }, morph: {},
    blurb: 'About 1.5 L blood loss. Intubated and on positive-pressure ventilation.',
    story: ['Less blood returns to the heart → smaller stroke volume → narrow pulse pressure', 'Vasoconstriction (high SVR) and tachycardia hold the mean pressure up for a while', 'On the ventilator each breath squeezes the underfilled heart → large pulse-pressure variation (fluid-responsive)', 'CVP is low, but a low CVP alone does not prove fluid will help — the variation is the better sign'],
    look: ['Narrow, peaked pulse', 'Pulse pressure swings beat to beat with each ventilator breath (PPV > 13 %)', 'Low CVP with small waves'] },
  { id: 'sepsis', name: 'Septic shock (vasodilated)', short: 'Sepsis', group: 'Shock', params: { svr: 650, co: 7.2, hr: 116, cvp: 4, volume: 0.85 }, morph: { stiff: -0.2 },
    blurb: 'Warm, vasodilated septic shock on the ventilator.',
    story: ['Arterioles dilate → systemic vascular resistance falls → blood runs off fast', 'Diastolic pressure falls and the dicrotic notch drops low on the downstroke', 'Cardiac output is high but MAP is low — perfusion pressure, not flow, is the problem', 'Norepinephrine raises SVR: watch the notch climb and diastolic pressure rise'],
    look: ['Low diastolic pressure, low MAP', 'Dicrotic notch low (near the diastolic level)', 'Moderate pulse-pressure variation — relative hypovolaemia'] },
  { id: 'cardiogenic', name: 'Cardiogenic shock (LV failure)', short: 'Cardiogenic', group: 'Shock', params: { co: 3.0, hr: 106, svr: 1500, cvp: 14 }, morph: { lvFail: 0.8 },
    blurb: 'Large anterior MI with a failing left ventricle.',
    story: ['The weak ventricle ejects slowly → sluggish upstroke and small stroke volume', 'Intense vasoconstriction keeps MAP near 65 at the cost of perfusion', 'Raised filling pressures (volume load, RV involvement) raise the CVP; fluids will not help (little variation)'],
    look: ['Slow upstroke, narrow pulse pressure', 'Little pulse-pressure variation despite shock', 'High CVP'] },
  { id: 'tamponade', name: 'Cardiac tamponade', short: 'Tamponade', group: 'Valves & pericardium', params: { co: 3.1, hr: 122, svr: 1500, cvp: 18 }, morph: { tamponade: 1 },
    blurb: 'Pericardial effusion compressing the heart. Breathing spontaneously.',
    story: ['Fluid in the pericardium squeezes all four chambers: the heart can only fill so far', 'Pressures rise and equalise (CVP ≈ 18) and the y descent disappears (no rapid early filling)', 'On inspiration the right heart fills and bulges the septum left → LV stroke volume falls', 'Pulsus paradoxus: systolic drops > 10 mmHg with every spontaneous breath', 'Pericardiocentesis removes the fluid and everything reverses'],
    look: ['High CVP with a prominent x descent and no y descent', 'Systolic falls > 10 mmHg on each breath in', 'Narrow pulse pressure, tachycardia'] },
  { id: 'rvfail', name: 'Massive PE / RV failure', short: 'RV failure', group: 'Shock', params: { co: 3.4, hr: 118, svr: 1350, cvp: 17 }, morph: { rvLoad: 1, tr: 0.45 },
    blurb: 'Large pulmonary embolus: the right ventricle is pressure-loaded and dilating.',
    story: ['The RV pumps against a blocked pulmonary circulation → RV pressure and CVP rise', 'The stiff, overloaded RV needs a strong atrial kick → large a wave', 'The dilating tricuspid ring leaks → big v wave', 'Less blood crosses the lungs → LV underfilled → low cardiac output and hypotension'],
    look: ['High CVP with large a and v waves', 'Narrow arterial pulse'] },
  { id: 'af', name: 'Atrial fibrillation with RVR', short: 'AF', group: 'Rhythm', params: { hr: 128, co: 4.3, svr: 1300, cvp: 8 }, morph: { rhythm: 'af' },
    blurb: 'New AF, fast ventricular rate.',
    story: ['The atria quiver instead of contracting → no P waves and no a wave on the CVP', 'Irregular R-R intervals: a short gap gives little filling time → a small beat', 'Some beats are too weak to feel at the wrist (pulse deficit): compare the ECG rate with the arterial pulse rate'],
    look: ['No a wave; CVP shows c and v only', 'Pulse height varies beat to beat with the R-R interval'] },
  { id: 'chb', name: 'Complete heart block', short: 'CHB', group: 'Rhythm', params: { hr: 38, co: 3.6, svr: 1500, cvp: 9 }, morph: { rhythm: 'chb', atrialRate: 82 },
    blurb: 'Third-degree AV block with a slow ventricular escape rhythm.',
    story: ['Atria and ventricles beat independently', 'Sometimes the atrium contracts while the tricuspid valve is shut (during ventricular systole)', 'Blood cannot go forward, so the pressure wave bounces back up the jugular: cannon a waves', 'Slow rate → long filling → large stroke volume and a wide pulse pressure'],
    look: ['Intermittent giant (cannon) a waves', 'Slow, big, wide arterial pulses'] },
  { id: 'pvc', name: 'Sinus rhythm with PVCs', short: 'PVCs', group: 'Rhythm', params: { hr: 84 }, morph: { rhythm: 'pvc', pvcEvery: 4 },
    blurb: 'Frequent premature ventricular beats.',
    story: ['A PVC fires early, before the ventricle has filled → a small (or absent) pulse', 'The compensatory pause lets the next beat fill more — and calcium builds up — so it is bigger (post-extrasystolic potentiation)', 'A normally timed atrial contraction that lands during the PVC\u2019s systole, with the tricuspid shut, gives a cannon a wave'],
    look: ['Small pulse after each wide QRS', 'Bigger pulse after the pause'] },
  { id: 'tr', name: 'Severe tricuspid regurgitation', short: 'TR', group: 'Valves & pericardium', params: { cvp: 14, co: 4.2 }, morph: { tr: 1, rhythm: 'af' },
    blurb: 'Torrential TR (often with AF).',
    story: ['The leaking tricuspid valve lets the RV pump backwards into the right atrium every systole', 'The x descent is filled in and replaced by a giant c-v wave', 'The CVP looks "ventricularised" — it can be mistaken for the catheter being in the RV'],
    look: ['Giant c-v wave in systole', 'No x descent; steep y descent'] },
  { id: 'as', name: 'Severe aortic stenosis', short: 'AS', group: 'Valves & pericardium', params: { co: 3.6, hr: 72, svr: 1700 }, morph: { as: 1 },
    blurb: 'Calcified, narrowed aortic valve (area < 1 cm²).',
    story: ['Blood is squeezed through a tight valve → the arterial pressure rises slowly (pulsus tardus)', 'The peak is small and late (pulsus parvus); an anacrotic shoulder appears on the upstroke', 'The dicrotic notch is faint because the valve barely moves'],
    look: ['Slow, late-peaking upstroke with a shoulder', 'Narrow pulse pressure'] },
  { id: 'ar', name: 'Severe aortic regurgitation', short: 'AR', group: 'Valves & pericardium', params: { co: 5.0, hr: 80, svr: 1100 }, morph: { ar: 1 },
    blurb: 'Leaking aortic valve with a dilated LV.',
    story: ['Blood falls back into the LV during diastole → diastolic pressure drops very low', 'The LV ejects the forward volume plus what leaked back → a big, fast systolic upstroke', 'Wide pulse pressure ("water-hammer" pulse), often with a double (bisferiens) peak; the notch is lost'],
    look: ['Very wide pulse pressure, low diastolic pressure', 'Steep upstroke, often two systolic peaks'] },
  { id: 'stiff', name: 'Stiff arteries (elderly, hypertensive)', short: 'Stiff arteries', group: 'Arteries', params: { age: 78, svr: 1500, hr: 70 }, morph: { stiff: 1 },
    blurb: 'Isolated systolic hypertension from arterial stiffening.',
    story: ['A stiff aorta cannot stretch to store each stroke volume → systolic pressure climbs, diastolic falls', 'The pressure wave travels faster and its reflection from the periphery returns during systole, adding a late systolic peak', 'Pulse pressure widens (> 60 mmHg) even with a normal mean'],
    look: ['Wide pulse pressure', 'Late systolic peak (reflected wave)'] },
];
export const SCENARIO = Object.fromEntries(SCENARIOS.map((s) => [s.id, s])) as Record<string, LinesScenario>;

/** Everything the beat engine needs, derived from the patient snapshot + morphology + therapy. */
export interface Circ {
  hr: number; sv: number; R: number; C: number; Zc: number; refl: number; tRefl: number;
  ptt: number; amp: number; pep: number; et: number; shapeA: number; shapeB: number; incisura: number;
  cvp: number; aAmp: number; cAmp: number; xAmp: number; vAmp: number; yAmp: number; trAmp: number;
  rvsp: number; rhythm: Rhythm; atrialRate: number; pvcEvery: number; alternans: number;
  ar: number; tamponade: number;
  /** stroke-volume change with breathing: positive-pressure (fluid responsiveness) and spontaneous (paradox) */
  ppvA: number; spontA: number;
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export function circFrom(s: Snapshot, p: PatientParams, m: Morph, extra: { volume: number; pressor: number }): Circ {
  const as = m.as ?? 0, ar = m.ar ?? 0, tr = m.tr ?? 0, tam = m.tamponade ?? 0, rv = m.rvLoad ?? 0, lv = m.lvFail ?? 0;
  const stiff = (m.stiff ?? 0) + Math.max(0, (p.age - 50) / 60);
  const rhythm = m.rhythm ?? 'sinus';
  const hr = rhythm === 'chb' ? p.hr : s.hr;
  const co = s.co;
  const sv = (co * 1000) / hr;
  // afterload: SVR in dyn·s·cm⁻⁵ → mmHg·s/mL. MAP = CVP + CO·R holds for the Windkessel exactly.
  const R = p.svr / 1333;
  const C = 1.6 * (1 - 0.5 * clamp(stiff, -0.5, 1)) * (1 + 0.25 * (1 - Math.min(1, p.svr / 1150)));
  const Zc = 0.05 * (1 + 0.6 * clamp(stiff, 0, 1));
  const et = Math.max(0.17, 0.413 - 0.0017 * hr + 0.07 * as - 0.03 * lv + 0.02 * ar);
  const vol = extra.volume;
  return {
    hr, sv, R, C, Zc,
    refl: 0.22 + 0.25 * clamp(stiff, 0, 1) + 0.1 * Math.max(0, p.svr / 1150 - 1),
    tRefl: 0.16 - 0.08 * clamp(stiff, 0, 1),
    ptt: 0.115 - 0.03 * clamp(stiff, 0, 1),
    amp: 0.62 * (1 - 0.6 * clamp(stiff, 0, 1)) * (0.8 + 0.2 * Math.min(1.6, p.svr / 1150)),
    pep: 0.065 + 0.045 * lv + 0.015 * as,
    et, shapeA: 0.75 + 1.25 * as + 0.4 * lv - 0.2 * ar, shapeB: 1.7 - 0.5 * as - 0.2 * lv,
    incisura: 1.4 * (1 - 0.8 * as) * (1 - 0.9 * ar),
    cvp: p.cvp, aAmp: rhythm === 'af' ? 0 : 2.6 + 4 * rv - 1.2 * (1 - vol) * 2, cAmp: 1.1, xAmp: (2.4 + 2 * tam) * (1 - 0.95 * tr), vAmp: 2.2 + 1.5 * rv, yAmp: 2.2 * (1 - tam) + 1.5 * tr,
    trAmp: 15 * tr, rvsp: 25 + 30 * rv + 5 * tr, rhythm, atrialRate: m.atrialRate ?? 80, pvcEvery: m.pvcEvery ?? 0, alternans: m.alternans ?? 0,
    ar, tamponade: tam,
    ppvA: Math.max(0.02, (0.03 + 0.1 * clamp((1 - vol) / 0.38) + 0.03 * tam) * (1 - 0.7 * lv)),
    spontA: 0.03 + 0.17 * tam,
  };
}
