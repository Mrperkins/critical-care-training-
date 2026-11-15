/**
 * Validates public/models/coronary-heart.glb + coronary-heart.mapping.json after any rebuild.
 *   npm run asset:coronary:validate
 * Checks: required named structures, baked attributes, coronary centerlines,
 * and that every territory mask faces the leads that are supposed to see it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { TERRITORIES } from '../src/infarct/data/territories';
import { VESSELS } from '../src/infarct/data/vessels';
import { averageView } from '../src/infarct/data/leads';
import type { LeadId } from '../src/infarct/data/types';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const GLB = path.join(ROOT, 'public/models/coronary-heart.glb');
const MAP = path.join(ROOT, 'public/models/coronary-heart.mapping.json');

/** Lead groups each mask must face (dot of mean outward normal with the group's view ≥ 0.45). */
export const MASK_FACING: Record<string, LeadId[]> = {
  anterior: ['V3', 'V4'], lateral: ['I', 'aVL', 'V5', 'V6'], highLateral: ['I', 'aVL'],
  inferior: ['II', 'III', 'aVF'], posterior: ['V7', 'V8', 'V9'], rv: ['V3R', 'V4R'],
};

export interface AssetReport { ok: boolean; errors: string[]; notes: string[] }

export async function validateAsset(): Promise<AssetReport> {
  const errors: string[] = []; const notes: string[] = [];
  if (!fs.existsSync(GLB)) return { ok: false, errors: [`missing ${GLB}`], notes };
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const doc = await io.read(GLB);
  const map = JSON.parse(fs.readFileSync(MAP, 'utf8'));
  const nodes = new Map(doc.getRoot().listNodes().filter((n) => n.getMesh()).map((n) => [n.getName(), n]));
  const need = ['myocardium_LV', 'myocardium_RV', 'myocardium_septum', 'atrium_LA', 'atrium_RA',
    ...VESSELS.map((v) => map.vessels?.[v.id]?.mesh ?? `coronary_${v.id}`), ...TERRITORIES.map((t) => `territory_${t.id}`)];
  for (const id of need) if (!nodes.has(id)) errors.push(`missing mesh ${id}`);
  const attr = (id: string, a: string) => nodes.get(id)?.getMesh()!.listPrimitives()[0].getAttribute(a);
  for (const v of VESSELS) {
    const id = map.vessels?.[v.id]?.mesh ?? `coronary_${v.id}`; if (!id.startsWith('coronary_')) errors.push(`${v.id} mesh is not named coronary_*`); if (!nodes.has(id)) continue;
    if (!attr(id, '_S')) errors.push(`${id} has no arc-length attribute _S (flow/occlusion)`);
    const cl = map.vessels?.[v.id]?.centerline; if (!cl || cl.length < 8) errors.push(`${v.id} centerline missing in mapping`);
  }
  for (const id of ['myocardium_LV', 'myocardium_RV', 'myocardium_septum']) for (const a of ['_REGA', '_REGB', '_AO']) if (nodes.has(id) && !attr(id, a)) errors.push(`${id} missing ${a}`);
  for (const t of TERRITORIES) {
    const id = `territory_${t.id}`; const n = nodes.get(id); if (!n) continue;
    const p = n.getMesh()!.listPrimitives()[0]; const P = p.getAttribute('NORMAL')!, W = p.getAttribute('_W');
    if (!W) { errors.push(`${id} missing mask weights _W`); continue; }
    const s = [0, 0, 0]; const q = [0, 0, 0], w = [0]; let cnt = 0;
    for (let i = 0; i < P.getCount(); i++) { W.getElement(i, w); if (w[0] < 0.5) continue; P.getElement(i, q); s[0] += q[0]; s[1] += q[1]; s[2] += q[2]; cnt++; }
    if (cnt < 50) { errors.push(`${id} mask is nearly empty (${cnt} weighted vertices)`); continue; }
    const l = Math.hypot(s[0], s[1], s[2]); const mean = s.map((x) => x / l);
    const leads = MASK_FACING[t.id];
    if (leads) {
      const v = averageView(leads); const d = mean[0] * v[0] + mean[1] * v[1] + mean[2] * v[2];
      notes.push(`${t.id.padEnd(18)} faces ${leads.join('/').padEnd(14)} dot=${d.toFixed(2)}`);
      if (d < 0.45) errors.push(`${id} does not face ${leads.join(', ')} (dot ${d.toFixed(2)})`);
    }
  }
  if (!map.attribution?.license) errors.push('attribution/license missing from mapping');
  return { ok: errors.length === 0, errors, notes };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await validateAsset();
  r.notes.forEach((n) => console.log('  ', n));
  if (r.ok) console.log('✓ heart asset valid'); else { r.errors.forEach((e) => console.error('✗', e)); process.exit(1); }
}
