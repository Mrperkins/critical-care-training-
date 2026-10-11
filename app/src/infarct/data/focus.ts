/**
 * What the MI Locator can be showing: a coronary territory (classic STEMI) or a STEMI equivalent. Renderers (heart,
 * coronaries, ECG, timeline) look the selection up here; lessons and practice cases still use TERRITORIES only.
 */
import type { CoronaryTerritory } from './types';
import { TERRITORY } from './territories';
import { EQUIVALENT, type STEMIEquivalent } from './patterns';
import { sequenceScene, SEQ_KEYS, NORMAL_SCENE, type SceneDirectives } from '../engine/store';

export type Focus = CoronaryTerritory | STEMIEquivalent;
export const FOCUS: Record<string, Focus> = { ...TERRITORY, ...EQUIVALENT };
export const focusOf = (id: string | null | undefined): Focus | null => (id ? FOCUS[id] ?? null : null);
export const asEquivalent = (f: Focus | null): STEMIEquivalent | null => (f && (f as STEMIEquivalent).kind === 'equivalent' ? (f as STEMIEquivalent) : null);

/** how far through the wall the ischaemia reaches at its worst (classic STEMI: transmural) */
export const transmuralOf = (f: Focus | null) => asEquivalent(f)?.transmural ?? 1;
/** culprit lesion kind (classic STEMI: an occluding thrombus) */
export const lesionOf = (f: Focus | null) => asEquivalent(f)?.lesion ?? 'occlusion';

/** The Normal → MI playhead scene for a selection. */
export function sceneFor(id: string | null | undefined, p: number): SceneDirectives {
  const e = asEquivalent(focusOf(id));
  return e?.sequence ? { ...NORMAL_SCENE, ...e.sequence(p) } : sequenceScene(p);
}
export const seqKeysFor = (id: string | null | undefined) => asEquivalent(focusOf(id))?.seqKeys ?? SEQ_KEYS;
