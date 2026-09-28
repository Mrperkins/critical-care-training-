/**
 * Semantic camera targets shared by lessons, MOA, procedures and scene cameras.
 * An anchor is a semantic identifier resolved by the scene that owns the geometry — never a
 * screen coordinate. Scenes pass their current anchor positions to `resolve`.
 */
import type * as THREE from 'three';

export interface TargetDef { scene: 'cell' | 'body' | 'vent' | 'lines'; anchor: string; view?: 'whole' | 'zoom' }
export const CAMERA_TARGETS = Object.freeze({
  'cell.whole': { scene: 'cell', anchor: 'whole', view: 'whole' },
  'cell.nucleus': { scene: 'cell', anchor: 'nucleus', view: 'whole' },
  'cell.mitochondria': { scene: 'cell', anchor: 'mito', view: 'whole' },
  'cell.er': { scene: 'cell', anchor: 'rer', view: 'whole' },
  'cell.golgi': { scene: 'cell', anchor: 'golgi', view: 'whole' },
  'membrane.overview': { scene: 'cell', anchor: 'membrane', view: 'zoom' },
  'membrane.nak_atpase': { scene: 'cell', anchor: 'pump', view: 'zoom' },
  'membrane.nav': { scene: 'cell', anchor: 'nachan', view: 'zoom' },
  'membrane.kir': { scene: 'cell', anchor: 'kchan', view: 'zoom' },
  'membrane.aqp': { scene: 'cell', anchor: 'aqp', view: 'zoom' },
  'heart.whole': { scene: 'body', anchor: 'heart' },
  'lung.whole': { scene: 'vent', anchor: 'lung', view: 'whole' },
  'lung.alveolus': { scene: 'vent', anchor: 'alveolus', view: 'zoom' },
  'lung.capillary': { scene: 'vent', anchor: 'capillary', view: 'zoom' },
  'lung.rbc': { scene: 'vent', anchor: 'rbc', view: 'zoom' },
  'lung.membrane': { scene: 'vent', anchor: 'membrane', view: 'zoom' },
  'lung.edema': { scene: 'vent', anchor: 'edema', view: 'zoom' },
  'lung.collapsed': { scene: 'vent', anchor: 'collapsed', view: 'zoom' },
  'lung.recruited': { scene: 'vent', anchor: 'recruited', view: 'zoom' },
  'brain.whole': { scene: 'body', anchor: 'brain' },
} satisfies Record<string, TargetDef>);
export type TargetId = keyof typeof CAMERA_TARGETS;

/** Scenes register a live anchor lookup so lessons can resolve a target without knowing the geometry. */
const ANCHOR_SOURCES: Partial<Record<TargetDef['scene'], () => Record<string, THREE.Vector3>>> = {};
export function registerAnchors(scene: TargetDef['scene'], get: () => Record<string, THREE.Vector3>) { ANCHOR_SOURCES[scene] = get; }

export function resolveTarget(id: string, anchors?: Record<string, THREE.Vector3>) {
  const d = (CAMERA_TARGETS as Record<string, TargetDef>)[id]; if (!d) return null;
  const a = anchors ?? ANCHOR_SOURCES[d.scene]?.();
  return { id, scene: d.scene, view: d.view ?? null, anchor: d.anchor, position: a?.[d.anchor] ?? null };
}

// kept on window for tools and older patches that call it directly
declare global { interface Window { __CCCameraTargets?: { definitions: typeof CAMERA_TARGETS; resolve: typeof resolveTarget } } }
if (typeof window !== 'undefined') window.__CCCameraTargets = Object.freeze({ definitions: CAMERA_TARGETS, resolve: resolveTarget });
