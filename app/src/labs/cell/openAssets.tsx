/**
 * Optional high-fidelity visual assets for the cell scenes (visual only — the simulation,
 * transport state machines and physiology never depend on them). Each loader fails soft:
 * on any error the scene keeps its procedural geometry.
 *  - generic human cell: CC BY 4.0, markdragan (models/cell/markdragan-human-cell/, see SOURCE.md)
 *  - membrane proteins: C-alpha backbone meshes derived from CC0 PDB entries (models/molecular/, see SOURCE.md)
 */
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const OPEN_CELL_URL = 'models/cell/markdragan-human-cell/cell.glb';
export const OPEN_CELL_CREDIT = { title: 'Human Cell — markdragan', url: 'https://sketchfab.com/3d-models/human-cell-60ef7d2515b0403986ff9e8b7f234a66', license: 'CC BY 4.0' };
/** membrane site kind → PDB-derived mesh id */
export const PROTEIN_FOR_TARGET: Record<string, [site: string, pdb: string]> = {
  'membrane.nak_atpase': ['pump', '9ron'], 'membrane.nav': ['nachan', '9p24'], 'membrane.kir': ['kchan', '7zdz'], 'membrane.aqp': ['aqp', '3gd8'],
};

const proteinPromises: Record<string, Promise<THREE.Object3D | null>> = {};
export function loadProteinModel(id: string) {
  return (proteinPromises[id] ??= (async () => {
    try {
      const r = await fetch(`models/molecular/${id}-backbone.glb`); if (!r.ok) throw new Error('HTTP ' + r.status);
      return (await new GLTFLoader().parseAsync(await r.arrayBuffer(), '')).scene;
    } catch (e) { console.warn(`[visual] ${id} mesh unavailable; using procedural proxy.`, e); return null; }
  })());
}

let openCellPromise: Promise<THREE.Group | null> | null = null;
export function loadOpenCell() {
  return (openCellPromise ??= (async () => {
    try {
      const r = await fetch(OPEN_CELL_URL, { mode: 'cors', cache: 'force-cache' }); if (!r.ok) throw new Error('HTTP ' + r.status);
      const scene = (await new GLTFLoader().parseAsync(await r.arrayBuffer(), '')).scene.clone(true); scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(scene); const c = box.getCenter(new THREE.Vector3()); const size = box.getSize(new THREE.Vector3());
      const g = new THREE.Group(); scene.position.sub(c); g.add(scene); g.scale.setScalar(5.35 / Math.max(0.001, size.x, size.y, size.z));
      // tone the source materials toward the app's matte, wet-tissue look
      const tone = (m: THREE.Material) => { const v = m.clone() as THREE.MeshPhysicalMaterial; if ('roughness' in v) v.roughness = Math.max(0.48, v.roughness ?? 0.5); if ('metalness' in v) v.metalness = 0; if ('clearcoat' in v) v.clearcoat = Math.min(0.18, v.clearcoat ?? 0); if ('clearcoatRoughness' in v) v.clearcoatRoughness = Math.max(0.3, v.clearcoatRoughness ?? 0.3); return v; };
      g.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; m.frustumCulled = true; m.material = Array.isArray(m.material) ? m.material.map(tone) : tone(m.material); });
      return g;
    } catch (e) { console.warn('[visual] high-fidelity open cell unavailable; using procedural fallback.', e); return null; }
  })());
}

/** Renders the vendored generic cell and reports when it is on screen (so the procedural body can hide). */
export function OpenCell({ onReady }: { onReady: (ok: boolean) => void }) {
  const [obj, setObj] = useState<THREE.Object3D | null>(null);
  useEffect(() => { let alive = true; loadOpenCell().then((g) => { if (alive && g) { setObj(g.clone(true)); onReady(true); } }); return () => { alive = false; }; }, [onReady]);
  return obj ? <primitive object={obj} /> : null;
}
