/**
 * Brain label volume for the neuro slice cap (brain-volume.json): the cut face is painted from the real structures
 * (neuro.glb — HuBMAP/Allen ventricles, caudate, putamen, pallidum, thalamus, internal capsule, hippocampus, corpus
 * callosum, brainstem, cerebellum) and the real cortical ribbon (depth below this brain's own surface), instead of the
 * ellipsoids it used to draw.
 *
 * One byte per voxel: high nibble = label, low nibble = distance to the pial surface in 0.5 mm steps (15 = farther than
 * 7 mm). The pial surface is the registered Z-Anatomy cortex (gyri and sulci, from build-cerebral.ts) when present, so the
 * grey ribbon follows real folding; otherwise this brain's own (smooth) hull. zlib-deflated and base64'd (≈1 MB). Frame: body decimetres.
 *   npm run asset:brain-volume   (needs body.glb + neuro.glb)
 */
import * as THREE from 'three';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { MeshBVH } from 'three-mesh-bvh';
import { ROOT, log, readGLBDecoded, V3 } from './common';

export const LABELS = { none: 0, csf: 1, caudate: 2, putamen: 3, pallidus: 4, thalamus: 5, capsule: 6, brainstem: 7, cerebellum: 8, hippocampus: 9, callosum: 10, amygdala: 11 } as const;
const MAP: [RegExp, number][] = [
  [/ventricle|aqueduct/, LABELS.csf], [/^caudate/, LABELS.caudate], [/^putamen/, LABELS.putamen], [/^pallidus/, LABELS.pallidus], [/^thalamus|hypothalamus/, LABELS.thalamus],
  [/^internal_capsule/, LABELS.capsule], [/^(midbrain|pons|medulla)$/, LABELS.brainstem], [/^cerebellum|vermis/, LABELS.cerebellum], [/^hippocampus/, LABELS.hippocampus],
  [/^corpus_callosum|fornix/, LABELS.callosum], [/^amygdala/, LABELS.amygdala],
];
// later entries win where structures overlap (CSF last so ventricles are never painted over)
const ORDER = [LABELS.cerebellum, LABELS.brainstem, LABELS.callosum, LABELS.capsule, LABELS.thalamus, LABELS.putamen, LABELS.pallidus, LABELS.caudate, LABELS.hippocampus, LABELS.amygdala, LABELS.csf];

const brain = (await readGLBDecoded('public/models/body.glb')).get('brain')!; brain.computeBoundingBox();
const neuro = await readGLBDecoded('public/models/neuro.glb');
const box = brain.boundingBox!.clone().expandByScalar(0.02); const size = box.getSize(new V3());
const H = 0.008; // 0.8 mm voxels
const dims = [Math.ceil(size.x / H), Math.ceil(size.y / H), Math.ceil(size.z / H)]; const [nx, ny, nz] = dims;
log('grid', dims.join('×'), (nx * ny * nz / 1e6).toFixed(2), 'M voxels');
const lab = new Uint8Array(nx * ny * nz); const dep = new Uint8Array(nx * ny * nz).fill(15);
const at = (i: number, j: number, k: number) => new V3(box.min.x + (i + 0.5) * H, box.min.y + (j + 0.5) * H, box.min.z + (k + 0.5) * H);
const idx = (i: number, j: number, k: number) => i + nx * (j + ny * k);

/** inside test by ray parity along +X, one ray per (j,k) row, filling the crossings */
function fillSolid(g: THREE.BufferGeometry, write: (i: number, j: number, k: number) => void) {
  const b = new MeshBVH(g); g.computeBoundingBox(); const bb = g.boundingBox!;
  const j0 = Math.max(0, Math.floor((bb.min.y - box.min.y) / H)), j1 = Math.min(ny - 1, Math.ceil((bb.max.y - box.min.y) / H));
  const k0 = Math.max(0, Math.floor((bb.min.z - box.min.z) / H)), k1 = Math.min(nz - 1, Math.ceil((bb.max.z - box.min.z) / H));
  const ray = new THREE.Ray(); let n = 0;
  for (let k = k0; k <= k1; k++) for (let j = j0; j <= j1; j++) {
    const o = at(0, j, k); o.x = box.min.x - 0.1; ray.set(o, new V3(1, 0, 0));
    const xs = b.raycast(ray, THREE.DoubleSide).map((h) => h.point.x).sort((a, c) => a - c);
    const dedup: number[] = []; for (const x of xs) if (!dedup.length || x - dedup[dedup.length - 1] > 1e-5) dedup.push(x);
    for (let s = 0; s + 1 < dedup.length; s += 2) { const i0 = Math.max(0, Math.ceil((dedup[s] - box.min.x) / H - 0.5)), i1 = Math.min(nx - 1, Math.floor((dedup[s + 1] - box.min.x) / H - 0.5)); for (let i = i0; i <= i1; i++) { write(i, j, k); n++; } }
  }
  return n;
}

// brain interior + depth below the cortical surface
const inside = new Uint8Array(nx * ny * nz); log('brain voxels', fillSolid(brain, (i, j, k) => (inside[idx(i, j, k)] = 1)));
const zPath = path.join(ROOT, 'assets/source/derived-z-cortex.glb'); const pial = fs.existsSync(zPath) ? (await readGLBDecoded('assets/source/derived-z-cortex.glb')).get('z_cortex')! : brain;
log('pial surface:', pial === brain ? 'brain hull (run asset:cerebral for folded cortex)' : 'Z-Anatomy folded cortex');
const bB = new MeshBVH(pial); const tq = { point: new V3(), distance: 0 } as any;
for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const v = idx(i, j, k); if (!inside[v]) continue; const p = at(i, j, k); const hit = bB.closestPointToPoint(p, tq, 0, 0.075); dep[v] = hit ? Math.min(15, Math.round(hit.distance / 0.005)) : 15; }
// structures
for (const L of ORDER) for (const [id, g] of neuro) { const m = MAP.find(([re]) => re.test(id)); if (!m || m[1] !== L) continue; const n = fillSolid(g, (i, j, k) => (lab[idx(i, j, k)] = L)); log(id.padEnd(20), n, 'voxels'); }

// encode: byte = label<<4 | depth (outside the brain: 0xFF), RLE
const bytes = new Uint8Array(nx * ny * nz); for (let v = 0; v < bytes.length; v++) bytes[v] = inside[v] || lab[v] ? (lab[v] << 4) | dep[v] : 0xff;
const b64 = zlib.deflateSync(bytes, { level: 9 }).toString('base64');
fs.writeFileSync(path.join(ROOT, 'public/models/brain-volume.json'), JSON.stringify({
  units: 'decimetres, body-centred', min: box.min.toArray().map((x) => +x.toFixed(5)), voxel: H, dims, labels: LABELS, encoding: 'zlib (deflate) of bytes, x fastest: label<<4 | distance to the pial surface (0.5 mm steps, 15 = ≥7 mm); 0xFF = outside the brain', data: b64,
  attribution: { title: '3D Reference Organs: Visible Human Male (brain; Allen Institute regions)', creators: 'HuBMAP / Human Reference Atlas consortium', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', sourceUrl: 'https://github.com/hubmapconsortium/ccf-3d-reference-object-library', changes: 'Voxelised (1.6 mm) structure labels and cortical depth.' },
}));
log('brain-volume.json', (b64.length / 1024).toFixed(0), 'KB');
