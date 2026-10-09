/**
 * Both eyes from the HuBMAP Visible Human Female (CC BY 4.0) for the pupil examination: sclera, cornea, lens and
 * the iris plane. Units: centimetres; each eye centred on its own iris, +Z = forward (out of the face), +X = patient left.
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, log, readGLB, simplify, writeGLB, MeshoptSimplifier, type OutPart, V3 } from './common';
await MeshoptSimplifier.ready;

const parts: OutPart[] = []; const meta: Record<string, unknown> = {};
for (const side of ['R', 'L'] as const) {
  const m = await readGLB(`assets/source/VH_F_Eye_${side}.glb`);
  const get = (re: RegExp) => [...m.entries()].find(([n]) => re.test(n))![1];
  const iris = get(new RegExp(`iris_${side}$`)); iris.computeBoundingBox(); const c = iris.boundingBox!.getCenter(new V3());
  const T = new THREE.Matrix4().makeScale(100, 100, 100).multiply(new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z));
  const tf = (g: THREE.BufferGeometry, ratio: number) => { const h = g.clone(); h.applyMatrix4(T); const s = simplify(h, ratio, 0.0005); s.computeVertexNormals(); return s; };
  const add = (id: string, re: RegExp, ratio: number) => { const g = tf(get(re), ratio); parts.push({ id: `${id}_${side}`, role: id, geo: g }); log(`${id}_${side}`, g.attributes.position.count); };
  add('sclera', new RegExp(`sclera_${side}$`), 0.15); add('cornea', new RegExp(`cornea_${side}$`), 0.3); add('lens', new RegExp(`lens_${side}$`), 0.3);
  add('iris', new RegExp(`iris_${side}$`), 0.3);
  const ib = iris.boundingBox!; meta[side] = { irisDiameterMm: +((ib.max.x - ib.min.x) * 1000).toFixed(1), modelPupilMm: 3 };
}
await writeGLB('public/models/eyes.glb', parts, { default: { color: [0.95, 0.93, 0.9], rough: 0.4 } });
fs.writeFileSync(path.join(ROOT, 'public/models/eyes.mapping.json'), JSON.stringify({
  units: 'centimetres, each eye centred on its iris; +Z forward', eyes: meta,
  attribution: { title: '3D Reference Organs: Visible Human Female eyes', creators: 'HuBMAP / Human Reference Atlas consortium', data: 'Visible Human Female, U.S. National Library of Medicine', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Sclera, cornea, lens and iris kept; meshes simplified; each eye recentred on its iris. The pupil opening is drawn to the examined size.' },
}, null, 1));
log('done');
