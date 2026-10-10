import type { CoronaryTerritory, Vec3 } from './types';

const n = (v: Vec3): Vec3 => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

/**
 * Injury vectors are outward normals of the injured wall (body frame).
 * The ECG model projects them onto every lead, so elevation in facing leads
 * and reciprocal depression in opposing leads emerge from the same physics.
 */
export const TERRITORIES: CoronaryTerritory[] = [
  {
    id: 'septal', name: 'Septal', short: 'Septal',
    affectedLeads: ['V1', 'V2'], reciprocalLeads: [], extraLeads: [],
    commonCulpritVessels: [
      { vessel: 'S1', at: 0.08, likelihood: 'common', note: 'Occlusion of a major septal perforator branch of the LAD.' },
      { vessel: 'LAD', at: 0.17, likelihood: 'possible', note: 'Proximal LAD occlusion involving the septal perforators usually also produces anterior changes.' },
    ],
    myocardialRegion: ['septum'],
    cameraPosition: { dir: [-0.35, 0.25, 1], distance: 4.3 },
    heartHighlightRegion: { septum: 1 },
    ecgPattern: { id: 'septal', injury: n([-0.5, 0.12, 0.86]), injuryMv: 0.14, necrosisMv: 0.14, hyperacuteMv: 0.1 },
    cutaway: true,
    explanation: 'V1 and V2 sit either side of the sternum, right in front of the interventricular septum. When septal myocardium is injured, its current of injury points forward toward those two electrodes, so they record ST elevation. The septum is supplied mainly by septal perforators from the LAD, with the lower posterior septum supplied by the PDA.',
    clinicalPearls: [
      'Isolated septal STEMI is uncommon; it usually travels with anterior involvement (anteroseptal).',
      'Septal perforators run inside the septum, so they are only visible with the cutaway view.',
      'Loss of the small septal r wave in V1–V2 can be an early clue.',
    ],
  },
  {
    id: 'anterior', name: 'Anterior', short: 'Anterior',
    affectedLeads: ['V3', 'V4'], reciprocalLeads: [], extraLeads: [],
    commonCulpritVessels: [
      { vessel: 'LAD', at: 0.33, likelihood: 'common', note: 'Mid LAD occlusion, beyond the first septal and first diagonal branches.' },
      { vessel: 'D2', at: 0.2, likelihood: 'possible', note: 'A large diagonal branch can produce a limited anterior pattern.' },
    ],
    myocardialRegion: ['anterior', 'apex'],
    cameraPosition: { dir: [0.35, 0.05, 1], distance: 4.1 },
    heartHighlightRegion: { anterior: 1, apex: 0.8 },
    ecgPattern: { id: 'anterior', injury: n([0.42, 0.12, 0.9]), injuryMv: 0.14, necrosisMv: 0.16, hyperacuteMv: 0.12 },
    explanation: 'V3 and V4 face the anterior wall of the left ventricle. Injury of that wall pushes the ST vector forward and slightly left, straight at those electrodes. The anterior wall and apex are supplied by the LAD, which runs down the anterior interventricular groove.',
    clinicalPearls: [
      'Hyperacute T waves in V2–V4 can precede ST elevation by minutes.',
      'A "wraparound" LAD also supplies the inferior apex, so II, III and aVF may elevate too.',
      'Reciprocal inferior depression is less consistent than in inferior MI.',
    ],
  },
  {
    id: 'anteroseptal', name: 'Anteroseptal', short: 'Anteroseptal',
    affectedLeads: ['V1', 'V2', 'V3', 'V4'], reciprocalLeads: [], extraLeads: [],
    commonCulpritVessels: [
      { vessel: 'LAD', at: 0.17, likelihood: 'common', note: 'LAD occlusion beyond the diagonal branch but before the septal perforators.' },
    ],
    myocardialRegion: ['septum', 'anterior', 'apex'],
    cameraPosition: { dir: [0.05, 0.12, 1], distance: 4.2 },
    heartHighlightRegion: { septum: 1, anterior: 1, apex: 0.7 },
    ecgPattern: { id: 'anteroseptal', injury: n([0.1, 0.08, 0.99]), injuryMv: 0.15, necrosisMv: 0.18, hyperacuteMv: 0.12 },
    cutaway: true,
    explanation: 'Septal and anterior myocardium both sit behind the V1–V4 electrodes. When both are injured, the combined ST vector points straight forward, so all four precordial leads from V1 to V4 elevate.',
    clinicalPearls: [
      'Poor R-wave progression across V1–V4 suggests Q-wave evolution or old anterior infarction.',
      'Watch for new right bundle branch block: the right bundle is supplied by the LAD’s septal branches.',
    ],
  },
  {
    id: 'extensiveAnterior', name: 'Extensive anterior / anterolateral', short: 'Extensive anterior',
    affectedLeads: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'I', 'aVL'], reciprocalLeads: ['III', 'aVF'], extraLeads: [],
    commonCulpritVessels: [
      { vessel: 'LAD', at: 0.08, likelihood: 'common', note: 'Proximal LAD occlusion, before the first septal perforator and the main diagonal: the “widow-maker”.' },
      { vessel: 'LM', at: 0.6, likelihood: 'possible', note: 'Left main occlusion (often with shock); may show diffuse depression with aVR elevation instead.' },
    ],
    myocardialRegion: ['septum', 'anterior', 'apex', 'lateral', 'highLateral'],
    cameraPosition: { dir: [0.6, 0.2, 0.85], distance: 4.4 },
    heartHighlightRegion: { septum: 1, anterior: 1, apex: 1, lateral: 0.75, highLateral: 0.85 },
    ecgPattern: { id: 'extensiveAnterior', injury: n([0.45, 0.35, 0.82]), injuryMv: 0.23, injury2: n([0.9, 0.4, 0.1]), injury2Mv: 0.1, necrosisMv: 0.22, hyperacuteMv: 0.14 },
    cutaway: true,
    explanation: 'A proximal LAD occlusion stops flow to the septum, the whole anterior wall, the apex and — through the diagonals — the anterolateral wall. The injury vector points forward, left and upward, so every precordial lead plus I and aVL elevate, and the inferior leads, which look from the opposite direction, show reciprocal depression.',
    clinicalPearls: [
      'This is the largest territory at risk from a single vessel. Expect heart failure and shock.',
      'Reciprocal depression is usually most obvious in III and aVF.',
      'ST elevation in aVR with diffuse depression elsewhere suggests left main or severe multivessel ischemia instead.',
    ],
  },
  {
    id: 'lateral', name: 'Lateral', short: 'Lateral',
    affectedLeads: ['I', 'aVL', 'V5', 'V6'], reciprocalLeads: ['III', 'aVF'], extraLeads: [],
    commonCulpritVessels: [
      { vessel: 'LCx', at: 0.2, likelihood: 'common', note: 'Circumflex occlusion before the obtuse marginal branches.' },
      { vessel: 'OM1', at: 0.2, likelihood: 'common', note: 'Obtuse marginal branch occlusion.' },
      { vessel: 'D1', at: 0.2, likelihood: 'possible', note: 'A large diagonal can supply the lateral wall.' },
    ],
    myocardialRegion: ['lateral', 'highLateral'],
    cameraPosition: { dir: [1, 0.15, 0.05], distance: 4.1 },
    heartHighlightRegion: { lateral: 1, highLateral: 0.6 },
    ecgPattern: { id: 'lateral', injury: n([0.95, 0.5, -0.2]), injuryMv: 0.15, necrosisMv: 0.16, hyperacuteMv: 0.1 },
    explanation: 'I and aVL look at the heart from the patient’s left shoulder; V5 and V6 look from the left side of the chest. All four face the lateral wall of the left ventricle, which is supplied mostly by the circumflex and its obtuse marginal branches.',
    clinicalPearls: [
      'Circumflex occlusions are the most frequently missed STEMIs: the lateral wall is electrically “quiet”.',
      'ST elevation can be subtle (1 mm). Look hard at aVL.',
      'Always check posterior leads V7–V9 when you suspect circumflex disease.',
    ],
  },
  {
    id: 'highLateral', name: 'High lateral', short: 'High lateral',
    affectedLeads: ['I', 'aVL'], reciprocalLeads: ['III', 'aVF'], extraLeads: [],
    commonCulpritVessels: [
      { vessel: 'D1', at: 0.15, likelihood: 'common', note: 'First diagonal branch occlusion.' },
      { vessel: 'OM1', at: 0.15, likelihood: 'possible', note: 'High obtuse marginal branch.' },
      { vessel: 'LCx', at: 0.2, likelihood: 'possible', note: 'Proximal circumflex occlusion.' },
    ],
    myocardialRegion: ['highLateral'],
    cameraPosition: { dir: [0.85, 0.7, 0.35], distance: 4.1 },
    heartHighlightRegion: { highLateral: 1 },
    ecgPattern: { id: 'highLateral', injury: n([0.62, 0.78, 0.12]), injuryMv: 0.16, necrosisMv: 0.12, hyperacuteMv: 0.08 },
    explanation: 'The basal lateral wall sits high and to the left. Only the leads that look down from the left shoulder — I and aVL — face it directly. Lead III looks from the opposite direction, so it shows the mirror image: reciprocal ST depression.',
    clinicalPearls: [
      'Isolated aVL elevation with reciprocal III depression is easy to dismiss. Treat it seriously.',
      'A first diagonal (D1) occlusion is a classic cause (the "South African flag" pattern: I, aVL, V2 elevation).',
    ],
  },
  {
    id: 'inferior', name: 'Inferior', short: 'Inferior',
    affectedLeads: ['II', 'III', 'aVF'], reciprocalLeads: ['I', 'aVL'], extraLeads: ['V4R', 'V7', 'V8', 'V9'],
    commonCulpritVessels: [
      { vessel: 'RCA', at: 0.55, likelihood: 'common', dominance: 'right', note: 'Mid-to-distal RCA occlusion in a right-dominant system (most inferior STEMIs).' },
      { vessel: 'LCx', at: 0.57, likelihood: 'possible', dominance: 'left', note: 'Circumflex occlusion in a left-dominant system.' },
    ],
    myocardialRegion: ['inferior'],
    cameraPosition: { dir: [0.15, -0.78, 0.6], distance: 4.3 },
    heartHighlightRegion: { inferior: 1 },
    ecgPattern: { id: 'inferior', injury: n([-0.3, -0.95, -0.05]), injuryMv: 0.2, necrosisMv: 0.2, hyperacuteMv: 0.12 },
    explanation: 'The inferior wall rests on the diaphragm. Leads II, III and aVF all have their positive electrode on the left leg, so they look up at that wall from below. When it is injured, the ST vector points down toward them and they elevate. I and aVL look from above and to the left, the opposite direction, so they show reciprocal depression.',
    clinicalPearls: [
      'ST elevation greater in III than II, with depression in I, favours the RCA; II ≥ III without I depression favours the circumflex.',
      'Always record right-sided leads (V4R). RV involvement changes management: avoid nitrates and give fluid.',
      'Bradycardia and AV block are common. The RCA usually supplies the SA and AV nodes.',
    ],
  },
  {
    id: 'posterior', name: 'Posterior (inferobasal)', short: 'Posterior',
    affectedLeads: ['V7', 'V8', 'V9'], reciprocalLeads: ['V1', 'V2', 'V3'], extraLeads: ['V7', 'V8', 'V9'],
    commonCulpritVessels: [
      { vessel: 'LCx', at: 0.58, likelihood: 'common', note: 'Distal circumflex occlusion, beyond the obtuse marginal branches.' },
      { vessel: 'PLB', at: 0.2, likelihood: 'possible', dominance: 'right', note: 'Posterolateral branch from a dominant RCA.' },
      { vessel: 'PDA', at: 0.2, likelihood: 'possible', note: 'PDA territory, from the RCA or LCx depending on dominance.' },
    ],
    myocardialRegion: ['posterior'],
    cameraPosition: { dir: [0.35, -0.1, -1], distance: 4.3 },
    heartHighlightRegion: { posterior: 1 },
    ecgPattern: { id: 'posterior', injury: n([0.4, -0.1, -0.91]), injuryMv: 0.12, necrosisMv: 0.26, hyperacuteMv: 0.1 },
    explanation: 'No standard lead faces the back of the heart. V1–V3 look at it from the front, through the heart, so a posterior injury appears upside down: ST depression instead of elevation, and tall R waves instead of Q waves. Posterior leads V7–V9 placed on the back face the injury directly and show the ST elevation.',
    clinicalPearls: [
      'Horizontal ST depression maximal in V1–V3 is posterior STEMI until proven otherwise.',
      'Flip the ECG: the mirror image of V1–V3 looks like a STEMI.',
      'Only 0.5 mm of elevation in V7–V9 is significant, because these electrodes sit far from the heart.',
    ],
  },
  {
    id: 'rv', name: 'Right ventricular (with inferior)', short: 'RV + inferior',
    affectedLeads: ['II', 'III', 'aVF', 'V3R', 'V4R'], reciprocalLeads: ['I', 'aVL'], extraLeads: ['V3R', 'V4R'],
    commonCulpritVessels: [
      { vessel: 'RCA', at: 0.14, likelihood: 'common', note: 'Proximal RCA occlusion, before the RV (acute marginal) branch.' },
    ],
    myocardialRegion: ['rvFreeWall', 'inferior'],
    cameraPosition: { dir: [-0.75, -0.45, 0.6], distance: 4.3 },
    heartHighlightRegion: { rvFreeWall: 1, inferior: 0.85 },
    ecgPattern: { id: 'rv', injury: n([-0.3, -0.95, -0.05]), injuryMv: 0.19, injury2: n([-0.95, -0.2, 0.25]), injury2Mv: 0.12, necrosisMv: 0.16, hyperacuteMv: 0.1 },
    explanation: 'The right ventricle wraps around the front and right of the heart. Standard leads barely see it, so you move the chest electrodes to the mirror-image positions on the right chest. V4R faces the RV free wall directly: ST elevation of 1 mm or more there means RV infarction, almost always from a proximal RCA occlusion.',
    clinicalPearls: [
      'RV infarction is preload-dependent. Avoid nitrates and diuretics, and give careful fluid boluses.',
      'Clues on the standard ECG: inferior STEMI with ST elevation in V1, and ST elevation in III greater than II.',
      'V4R elevation can resolve within hours, so record it early.',
    ],
  },
];

export const TERRITORY: Record<string, CoronaryTerritory> = Object.fromEntries(TERRITORIES.map((t) => [t.id, t]));
