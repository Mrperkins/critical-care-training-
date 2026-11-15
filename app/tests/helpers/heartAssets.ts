/** Test helper: reads the shipped heart GLBs into body-frame Three meshes (same result as the browser loaders). */
import path from 'node:path';
import fs from 'node:fs';
import * as THREE from 'three';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import type { HeartAsset, HeartMapping } from '../../src/infarct/asset/heartAsset';
import { buildSharedHeart, type SharedHeart } from '../../src/infarct/asset/sharedHeart';

const MODELS = path.resolve(__dirname, '../../public/models');
const RENAME: Record<string, string> = { _REGA: 'aRegA', _REGB: 'aRegB', _AO: 'aAO', _FAT: 'aFat', _S: 'aS', _CH: 'aCh', _W: 'aW', _rega: 'aRegA', _regb: 'aRegB', _ao: 'aAO', _fat: 'aFat', _s: 'aS', _ch: 'aCh', _w: 'aW' };

/** Reads a GLB into body-frame Three meshes (same result as the browser loaders, which bake node matrices). */
export async function readMeshes(file: string): Promise<Record<string, THREE.Mesh>> {
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const doc = await io.read(path.join(MODELS, file)); const out: Record<string, THREE.Mesh> = {};
  for (const n of doc.getRoot().listNodes()) {
    const mesh = n.getMesh(); if (!mesh) continue; const prim = mesh.listPrimitives()[0];
    const g = new THREE.BufferGeometry(); const e: number[] = [];
    for (const sem of prim.listSemantics()) {
      const a = prim.getAttribute(sem)!; const size = a.getElementSize(); const f = new Float32Array(a.getCount() * size);
      for (let i = 0; i < a.getCount(); i++) { a.getElement(i, e); for (let k = 0; k < size; k++) f[i * size + k] = e[k]; }
      g.setAttribute(sem === 'POSITION' ? 'position' : sem === 'NORMAL' ? 'normal' : RENAME[sem] ?? sem, new THREE.BufferAttribute(f, size));
    }
    const idx = prim.getIndices(); if (idx) g.setIndex(Array.from(idx.getArray()!));
    g.applyMatrix4(new THREE.Matrix4().fromArray(n.getWorldMatrix()));
    const nrm = g.getAttribute('normal'); if (nrm) for (let i = 0; i < nrm.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(nrm, i).normalize(); nrm.setXYZ(i, v.x, v.y, v.z); }
    const cnt = g.getAttribute('position').count;
    for (const [k, s, fill] of [['aRegA', 4, 0], ['aRegB', 4, 0], ['aAO', 1, 1], ['aFat', 1, 0], ['aCh', 1, 0], ['aS', 1, 0], ['aW', 1, 0]] as const) if (!g.getAttribute(k)) g.setAttribute(k, new THREE.BufferAttribute(new Float32Array(cnt * s).fill(fill), s));
    const m = new THREE.Mesh(g); m.name = n.getName(); out[n.getName()] = m;
  }
  return out;
}


let cache: Promise<{ original: HeartAsset; shared: SharedHeart }> | null = null;
/** the coronary heart and the shared high-detail heart built from it (cached across a test file) */
export function loadHearts() {
  cache ??= (async () => {
    const meshes = await readMeshes('coronary-heart.glb');
    const mapping = JSON.parse(fs.readFileSync(path.join(MODELS, 'coronary-heart.mapping.json'), 'utf8')) as HeartMapping;
    const original: HeartAsset = { meshes, mapping, center: new THREE.Vector3(), radius: 1, atriaCenter: new THREE.Vector3() };
    return { original, shared: buildSharedHeart(original, await readMeshes('heart-hd.glb')) };
  })();
  return cache;
}
