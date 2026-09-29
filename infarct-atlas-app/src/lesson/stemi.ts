/** "STEMI: find the culprit" — the flagship coronary lesson. Every cue sets the atlas state explicitly. */
import { useApp, NORMAL_SCENE, type SceneDirectives } from '../engine/store';
import type { Timeline } from './timeline';
import type { Dominance } from '../data/types';

const MI: Partial<SceneDirectives> = { highlightVessel: true, flow: true, occlusion: 1, perfusionLoss: 1, injury: 1, ecgMorph: 1, emphasizeAffected: true, camera: 'territory', reperfusion: 0 };
function put(territoryId: string | null, dominance: Dominance, scene: Partial<SceneDirectives>, extra: { culpritIndex?: number; showExtra?: boolean } = {}) {
  useApp.getState().set({ territoryId, dominance, culpritIndex: extra.culpritIndex ?? 0, showExtra: !!extra.showExtra, seq: 0, seqPlaying: false, vesselId: null, leadId: null, scene: { ...NORMAL_SCENE, ...scene } });
}
const t0 = 0; let t = t0; const cue = (id: string, dur: number, title: string, say: string, apply: () => void) => { const c = { id, at: t, dur, title, say, apply }; t += dur + 0.5; return c; };

export const STEMI_CULPRIT: Timeline = {
  id: 'stemi-culprit', title: 'STEMI: find the culprit', blurb: 'From an occluded artery to the ECG it writes: which vessel, why the anatomy can make it ambiguous, what the reciprocal and posterior leads add, and what reperfusion changes.',
  setup: () => put(null, 'right', {}),
  cues: [
    cue('n', 9, 'A normal heart', 'Three arteries feed the heart: the left anterior descending down the front, the circumflex around the left side, and the right coronary around the right. Every wall is perfused and the ECG is normal.', () => put(null, 'right', {})),
    cue('inf1', 11, 'An inferior STEMI', 'Now a clot blocks the artery feeding the inferior wall. Blood stops beyond the clot, the wall turns dusky and stops contracting, and the ST segments rise in the leads that face it: two, three and aVF.', () => put('inferior', 'right', { ...MI, emphasizeReciprocal: false })),
    cue('inf2', 10, 'The mirror image', 'aVL looks at the heart from the opposite direction. It sees the same injury pointing away and records ST depression. Reciprocal change makes the diagnosis more certain.', () => put('inferior', 'right', { ...MI, emphasizeReciprocal: true })),
    cue('dom1', 12, 'Which artery? It depends on the anatomy', 'In most people the right coronary is dominant: it supplies the inferior wall through the posterior descending artery, so the culprit is usually the right coronary. ST elevation greater in three than two points that way.', () => put('inferior', 'right', { ...MI, emphasizeReciprocal: true })),
    cue('dom2', 11, 'In a left-dominant heart', 'In about one person in ten the circumflex gives the posterior descending artery. The same inferior ECG can then come from a circumflex occlusion. The ECG shows the wall; the angiogram shows the vessel.', () => put('inferior', 'left', { ...MI, emphasizeReciprocal: true })),
    cue('post', 12, 'Look behind: posterior extension', 'ST depression with tall R waves in V1 to V3 is not anterior ischaemia here: it is the back of the heart seen from the front. Posterior leads V7 to V9 show the ST elevation directly.', () => put('posterior', 'right', { ...MI, emphasizeReciprocal: true, showExtraLeads: true }, { showExtra: true })),
    cue('rv', 11, 'The right ventricle', 'A proximal right coronary occlusion can infarct the right ventricle too. Right-sided lead V4R shows ST elevation. These patients depend on preload: nitrates can drop the pressure sharply.', () => put('rv', 'right', { ...MI, emphasizeReciprocal: true, showExtraLeads: true }, { showExtra: true })),
    cue('ant', 11, 'Anterior: the LAD', 'An occluded left anterior descending artery lifts the ST segments across the chest leads. The more proximal the clot, the more leads involved and the larger the territory at risk.', () => put('extensiveAnterior', 'right', { ...MI, emphasizeReciprocal: true })),
    cue('rep', 12, 'Open the artery', 'Primary PCI reopens the artery. Flow returns downstream. The ST segments fall back toward the baseline and the T waves invert. Muscle that had already died stays dead: Q waves remain and that part of the wall stays weak.', () => put('extensiveAnterior', 'right', { ...MI, occlusion: 0, perfusionLoss: 0, injury: 0.45, ecgMorph: 1, reperfusion: 1, emphasizeReciprocal: false })),
    cue('sum', 9, 'Time is muscle', 'The ECG localises the wall; the culprit vessel depends on each patient’s anatomy; and every minute to reperfusion decides how much of that wall survives.', () => put('extensiveAnterior', 'right', { ...MI, occlusion: 0, perfusionLoss: 0, injury: 0.45, reperfusion: 1, emphasizeReciprocal: false })),
  ],
};
