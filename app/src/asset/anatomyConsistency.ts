/**
 * Rigid translation-only registration of the same HuBMAP/Visible Human Male heart
 * across the respiratory (lung-centred) and cardiac (body-centred) export frames.
 * No rescaling, rotation, morphing or fabricated anatomical geometry is allowed.
 */
import * as THREE from 'three';

export type HeartRegistration = {
  translation: THREE.Vector3; sizeError: number; accepted: boolean;
};
export const HEART_CHAMBERS = ['lv', 'rv', 'la', 'ra'] as const;

export function registerHeartContext(reference: THREE.BufferGeometry, chambers: Record<string, THREE.Mesh>): HeartRegistration {
  reference.computeBoundingBox();
  const ref = reference.boundingBox!.clone();
  const source = new THREE.Box3();
  let found = 0;
  for (const id of HEART_CHAMBERS) {
    const m = chambers[id];
    if (!m) continue;
    m.geometry.computeBoundingBox();
    source.union(m.geometry.boundingBox!);
    found++;
  }
  if (found !== HEART_CHAMBERS.length || source.isEmpty() || ref.isEmpty()) {
    return { translation: new THREE.Vector3(), sizeError: Infinity, accepted: false };
  }
  const a = ref.getSize(new THREE.Vector3()), b = source.getSize(new THREE.Vector3());
  const sizeError = Math.max(
    Math.abs(a.x - b.x) / Math.max(0.01, a.x),
    Math.abs(a.y - b.y) / Math.max(0.01, a.y),
    Math.abs(a.z - b.z) / Math.max(0.01, a.z),
  );
  const translation = ref.getCenter(new THREE.Vector3()).sub(source.getCenter(new THREE.Vector3()));
  // Distinct VHM exports may have different surface detail, but should not
  // diverge by more than 25% in any dimension if this is the same adult heart.
  return { translation, sizeError, accepted: Number.isFinite(sizeError) && sizeError < 0.25 };
}
