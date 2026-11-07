/**
 * Delivery-size optimisation for the two heaviest licensed models. Geometry is NOT simplified: vertices, triangles,
 * UVs and normals are kept; positions/normals/UVs are quantised (sub-0.01 % of the model extent) and meshopt-compressed,
 * and textures are re-encoded as WebP at their original resolution. The original files stay in the repository for
 * provenance; the app loads the optimised copies.
 *
 *   npm run asset:optimize
 *
 *  - models/cell/markdragan-human-cell/cell.glb  (12.0 MB, CC BY 4.0)  → cell.opt.glb
 *  - public/models/medical-ventilator.glb         (7.4 MB, CC BY 4.0)   → medical-ventilator.glb (in place; the
 *    unoptimised conversion is kept as medical-ventilator.src.glb)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { reorder, quantize, textureCompress, prune, dedup } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import { ROOT, log } from './common';

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const sha = (f: string) => createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const mb = (f: string) => (fs.statSync(f).size / 1e6).toFixed(2) + ' MB';

async function optimise(src: string, dst: string, textures: boolean) {
  const doc = await io.read(src);
  const before = doc.getRoot().listMeshes().flatMap((m) => m.listPrimitives()).reduce((n, p) => n + (p.getIndices()?.getCount() ?? 0) / 3, 0);
  const steps = [dedup(), prune(), reorder({ encoder: MeshoptEncoder }), quantize({ quantizePosition: 16, quantizeNormal: 12, quantizeTexcoord: 14 })];
  if (textures) steps.push(textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 90 }));
  await doc.transform(...steps);
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  await io.write(dst, doc);
  const after = doc.getRoot().listMeshes().flatMap((m) => m.listPrimitives()).reduce((n, p) => n + (p.getIndices()?.getCount() ?? 0) / 3, 0);
  if (after !== before) throw new Error(`${path.basename(src)}: triangle count changed ${before} → ${after}`);
  log(path.basename(src), mb(src), '→', path.basename(dst), mb(dst), '·', after, 'triangles kept');
  return { triangles: after, sha256: sha(dst), bytes: fs.statSync(dst).size };
}

const REPO = path.resolve(ROOT, '..');
const cellSrc = path.join(REPO, 'models/cell/markdragan-human-cell/cell.glb'); const cellDst = path.join(REPO, 'models/cell/markdragan-human-cell/cell.opt.glb');
const cell = await optimise(cellSrc, cellDst, false);

const ventDst = path.join(ROOT, 'public/models/medical-ventilator.glb'); const ventSrc = path.join(ROOT, 'public/models/medical-ventilator.src.glb');
if (!fs.existsSync(ventSrc)) fs.copyFileSync(ventDst, ventSrc); // keep the unoptimised conversion once
const vent = await optimise(ventSrc, ventDst, true);

fs.writeFileSync(path.join(ROOT, 'public/models/optimized.json'), JSON.stringify({
  note: 'Delivery copies: geometry not simplified (triangle counts asserted equal); quantised + meshopt; ventilator textures WebP q90 at original resolution.',
  cell: { source: 'models/cell/markdragan-human-cell/cell.glb', sourceSha256: sha(cellSrc), optimized: 'models/cell/markdragan-human-cell/cell.opt.glb', ...cell },
  ventilator: { source: 'app/public/models/medical-ventilator.src.glb', sourceSha256: sha(ventSrc), optimized: 'app/public/models/medical-ventilator.glb', ...vent },
}, null, 1));
