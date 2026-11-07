/**
 * STEMI equivalents: high-risk occlusion or near-occlusion patterns that do not meet the classic ST-elevation rules.
 * They use the same shape as a coronary territory (so the heart, the coronaries, the ECG and the timeline work the same
 * way) plus what makes them different: which ECG criteria define them, how much of the wall thickness is ischaemic
 * (shown in the short-axis slice) and whether the culprit is an occlusion, a near-occlusion or a stenosis.
 *
 * They are kept out of TERRITORIES on purpose: territory lessons and practice cases are generated from that list.
 * Lessons and cases for these patterns are written separately (see EQUIVALENTS below for the data they can use).
 */
import type { CoronaryTerritory, LeadId, Vec3 } from './types';
import type { SceneDirectives } from '../engine/store';

const n = (v: Vec3): Vec3 => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const ss = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** a subendocardial injury vector points from the injured inner layer into the cavity: toward aVR (up and right) */
const TOWARD_AVR = n([-0.8, 0.5, -0.12]);
const ANTERIOR = n([0.12, 0.02, 1]);

export interface STEMIEquivalent extends CoronaryTerritory {
  kind: 'equivalent';
  /** the defining ECG criteria, each with the leads that show it (for highlighting and lesson/case writing) */
  criteria: { text: string; leads: LeadId[] }[];
  /** how far through the wall the ischaemia reaches at its worst: 0 inner layer only → 1 transmural */
  transmural: number;
  /** what the culprit lesion is at the moment the ECG is recorded */
  lesion: 'occlusion' | 'near-occlusion' | 'stenosis';
  /** what to do (one line) */
  action: string;
  /** Normal → pattern timeline labels and scene (defaults to the territory sequence) */
  seqKeys?: { at: number; label: string }[];
  sequence?: (p: number) => Partial<SceneDirectives>;
}

export const EQUIVALENTS: STEMIEquivalent[] = [
  {
    kind: 'equivalent', id: 'leftMain', name: 'Left main / three-vessel ischaemia (aVR pattern)', short: 'Left main · aVR',
    affectedLeads: ['aVR'], reciprocalLeads: ['I', 'II', 'aVL', 'aVF', 'V4', 'V5', 'V6'], extraLeads: [],
    criteria: [
      { text: 'ST elevation in aVR (≥ 1 mm), usually greater than in V1', leads: ['aVR'] },
      { text: 'Widespread horizontal or downsloping ST depression in six or more leads, most marked in I, II and V4–V6', leads: ['I', 'II', 'aVF', 'V4', 'V5', 'V6'] },
    ],
    commonCulpritVessels: [
      { vessel: 'LM', at: 0.5, likelihood: 'common', note: 'Critical left main stenosis or subtotal occlusion: the whole left ventricle is under-perfused.' },
      { vessel: 'LAD', at: 0.06, likelihood: 'possible', note: 'Severe proximal LAD disease, often with three-vessel disease. Supply–demand ischaemia (tachyarrhythmia, anaemia, hypotension) can give the same ECG.' },
    ],
    myocardialRegion: ['septum', 'anterior', 'apex', 'lateral', 'highLateral', 'inferior', 'posterior'],
    cameraPosition: { dir: [0.45, 0.25, 0.85], distance: 4.5 },
    heartHighlightRegion: { septum: 0.95, anterior: 0.95, apex: 0.9, lateral: 0.95, highLateral: 0.9, inferior: 0.75, posterior: 0.75 },
    ecgPattern: { id: 'leftMain', injury: TOWARD_AVR, injuryMv: 0.2, necrosisMv: 0, hyperacuteMv: 0 },
    transmural: 0.35, lesion: 'near-occlusion',
    explanation: 'When the whole left ventricle is starved at once, the inner layer (subendocardium) is injured all the way round. Its injury current points inward, toward the cavity — up and to the right, the direction aVR looks from. So aVR records ST elevation while every lead facing the left ventricle records ST depression. No single wall is injured through its full thickness, so there is no localised ST elevation.',
    clinicalPearls: [
      'aVR elevation with diffuse depression is a pattern of global subendocardial ischaemia, not of one territory: left main or three-vessel disease if it fits the story.',
      'The same ECG appears with demand ischaemia — fast arrhythmias, severe anaemia, shock — so read it with the patient.',
      'These patients often go on to need emergent angiography, and sometimes surgery rather than stenting.',
    ],
    action: 'Treat as high-risk ACS: urgent cardiology and angiography; look for and treat a demand cause.',
    cutaway: false,
  },
  {
    kind: 'equivalent', id: 'deWinter', name: 'de Winter T waves (proximal LAD occlusion)', short: 'de Winter',
    affectedLeads: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'], reciprocalLeads: [], extraLeads: [],
    criteria: [
      { text: '1–3 mm upsloping ST depression at the J point in the precordial leads', leads: ['V2', 'V3', 'V4', 'V5'] },
      { text: 'Tall, broad-based, symmetric T waves in the same leads', leads: ['V2', 'V3', 'V4'] },
      { text: 'Often slight ST elevation in aVR; no classic ST elevation', leads: ['aVR'] },
    ],
    commonCulpritVessels: [
      { vessel: 'LAD', at: 0.08, likelihood: 'common', note: 'Proximal LAD occlusion — the same artery and territory as an extensive anterior STEMI.' },
    ],
    myocardialRegion: ['septum', 'anterior', 'apex', 'lateral'],
    cameraPosition: { dir: [0.4, 0.15, 1], distance: 4.3 },
    heartHighlightRegion: { septum: 1, anterior: 1, apex: 0.9, lateral: 0.5, highLateral: 0.4 },
    ecgPattern: { id: 'deWinter', injury: TOWARD_AVR, injuryMv: 0.04, necrosisMv: 0, hyperacuteMv: 0, jDep: { dir: ANTERIOR, mv: 0.13 }, tWave: { dir: ANTERIOR, mv: 0.16, shape: 'tall' } },
    transmural: 0.55, lesion: 'occlusion',
    explanation: 'The LAD is occluded proximally, exactly as in an extensive anterior STEMI, but the ST segments do not lift. Instead the J point is pushed down and the ST segment slopes up into a tall, symmetric T wave across the chest leads. The pattern is thought to reflect injury that is concentrated in the inner layer and slowed conduction there. It is static: it can persist until the artery is opened.',
    clinicalPearls: [
      'de Winter T waves are a STEMI equivalent: the artery is occluded now.',
      'They are easy to mistake for hyperacute T waves or for “just ST depression”. The J point is depressed and the T waves are tall — both at once.',
      'Unlike hyperacute T waves, the pattern usually does not evolve into classic ST elevation while you watch.',
    ],
    action: 'Activate the cath lab as for an anterior STEMI.',
    cutaway: true,
  },
  {
    kind: 'equivalent', id: 'wellensA', name: 'Wellens syndrome, type A (biphasic T waves)', short: 'Wellens A',
    affectedLeads: ['V2', 'V3'], reciprocalLeads: [], extraLeads: [],
    criteria: [
      { text: 'Biphasic T waves in V2–V3: up first, then down', leads: ['V2', 'V3'] },
      { text: 'Isoelectric or minimally elevated ST (< 1 mm), preserved R waves, no Q waves', leads: ['V1', 'V2', 'V3', 'V4'] },
      { text: 'Recorded when the chest pain has settled', leads: [] },
    ],
    commonCulpritVessels: [
      { vessel: 'LAD', at: 0.1, likelihood: 'common', note: 'Critical proximal LAD stenosis that has re-opened: flow is restored for now, but the plaque can re-occlude.' },
    ],
    myocardialRegion: ['septum', 'anterior', 'apex'],
    cameraPosition: { dir: [0.3, 0.12, 1], distance: 4.2 },
    heartHighlightRegion: { septum: 0.9, anterior: 1, apex: 0.8 },
    ecgPattern: { id: 'wellensA', injury: ANTERIOR, injuryMv: 0.015, necrosisMv: 0, hyperacuteMv: 0, tWave: { dir: ANTERIOR, mv: 0.24, shape: 'biphasic' } },
    transmural: 0.15, lesion: 'stenosis',
    explanation: 'A tight plaque near the start of the LAD closed, caused chest pain, and opened again. The anterior wall it starved is now reperfused but stunned, and its repolarisation is disturbed: the T waves in V2 and V3 go up and then down. The ST segments are flat, the R waves are preserved and there are no Q waves, because little muscle has died — yet.',
    clinicalPearls: [
      'Wellens is a warning sign, not an infarct: the next occlusion may not re-open.',
      'Stress testing can provoke a large anterior MI. These patients need angiography.',
      'The pattern is seen in the pain-free period; during pain the T waves may pseudo-normalise or the ST segments may rise.',
    ],
    action: 'Admit for urgent angiography; avoid stress testing.',
    seqKeys: [{ at: 0, label: 'Normal' }, { at: 0.14, label: 'Plaque' }, { at: 0.3, label: 'Occludes' }, { at: 0.46, label: 'Ischaemic pain' }, { at: 0.62, label: 'Re-opens' }, { at: 0.8, label: 'T waves change' }, { at: 0.94, label: 'Pain-free' }],
    sequence: wellensSequence,
  },
  {
    kind: 'equivalent', id: 'wellensB', name: 'Wellens syndrome, type B (deep T-wave inversion)', short: 'Wellens B',
    affectedLeads: ['V1', 'V2', 'V3', 'V4'], reciprocalLeads: [], extraLeads: [],
    criteria: [
      { text: 'Deep, symmetric T-wave inversion in V2–V3, often extending to V1–V4 and beyond', leads: ['V1', 'V2', 'V3', 'V4'] },
      { text: 'Isoelectric or minimally elevated ST (< 1 mm), preserved R waves, no Q waves', leads: ['V2', 'V3'] },
      { text: 'Recorded when the chest pain has settled', leads: [] },
    ],
    commonCulpritVessels: [
      { vessel: 'LAD', at: 0.1, likelihood: 'common', note: 'Critical proximal LAD stenosis that has re-opened: flow is restored for now, but the plaque can re-occlude.' },
    ],
    myocardialRegion: ['septum', 'anterior', 'apex'],
    cameraPosition: { dir: [0.3, 0.12, 1], distance: 4.2 },
    heartHighlightRegion: { septum: 0.9, anterior: 1, apex: 0.8 },
    ecgPattern: { id: 'wellensB', injury: ANTERIOR, injuryMv: 0.015, necrosisMv: 0, hyperacuteMv: 0, tWave: { dir: ANTERIOR, mv: 0.5, shape: 'inverted' } },
    transmural: 0.15, lesion: 'stenosis',
    explanation: 'The same story as type A, a little further on: a critical proximal LAD plaque occluded and re-opened, and the stunned anterior wall now repolarises in reverse. The T waves in the anterior chest leads are deep and symmetric; ST segments flat, R waves preserved, no Q waves. Type B is the more common form.',
    clinicalPearls: [
      'Deep symmetric anterior T-wave inversion in a patient whose pain has settled is Wellens until proven otherwise.',
      'Do not stress test. Arrange angiography.',
      'Other causes of deep T inversion (raised intracranial pressure, pulmonary embolism, hypertrophic cardiomyopathy) look similar: the history decides.',
    ],
    action: 'Admit for urgent angiography; avoid stress testing.',
    seqKeys: [{ at: 0, label: 'Normal' }, { at: 0.14, label: 'Plaque' }, { at: 0.3, label: 'Occludes' }, { at: 0.46, label: 'Ischaemic pain' }, { at: 0.62, label: 'Re-opens' }, { at: 0.8, label: 'T waves invert' }, { at: 0.94, label: 'Pain-free' }],
    sequence: wellensSequence,
  },
];

/**
 * Wellens: the plaque grows, occludes briefly (pain, ischaemia), re-opens (flow back, wall stunned), and only then do
 * the T waves change. `occlusion` is the plaque/thrombus size, `reperfusion` the re-opening; the ECG change rides on
 * `ecgMorph` (the T-wave pattern) once flow is back.
 */
function wellensSequence(p: number): Partial<SceneDirectives> {
  const reopen = ss(0.58, 0.7, p);
  return {
    highlightVessel: p > 0.08, flow: p > 0.1,
    occlusion: ss(0.12, 0.34, p),
    perfusionLoss: ss(0.3, 0.42, p) * (1 - reopen),
    injury: ss(0.38, 0.52, p) * (1 - 0.7 * reopen),
    reperfusion: reopen,
    ecgMorph: ss(0.72, 0.92, p),
    emphasizeAffected: p > 0.86, emphasizeReciprocal: false, showExtraLeads: false,
    camera: p < 0.2 ? 'vessel' : 'territory',
  };
}

export const EQUIVALENT: Record<string, STEMIEquivalent> = Object.fromEntries(EQUIVALENTS.map((e) => [e.id, e]));
export const isEquivalent = (id: string | null | undefined): boolean => !!id && id in EQUIVALENT;
