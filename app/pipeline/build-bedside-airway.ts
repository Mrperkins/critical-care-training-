/** Preserve HRA airway surfaces in the existing whole-body frame.
 * Usage: node --import tsx pipeline/build-bedside-airway.ts lung.glb skin-v1.1.glb
 */
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { ROOT, readGLB, mergeGeos, writeGLB, type OutPart } from './common';
const [lungFile, skinFile] = process.argv.slice(2);
if (!lungFile || !skinFile) throw new Error('Pass HRA lung v1.2 and skin v1.1 source GLBs.');
const skin = await readGLB(path.relative(ROOT, path.resolve(skinFile)));
const geo = skin.get('VH_M_skin'); if (!geo) throw new Error('Missing reference skin');
geo.computeBoundingBox(); const centre = geo.boundingBox!.getCenter(new THREE.Vector3());
const transform = new THREE.Matrix4().makeScale(10,10,10).multiply(new THREE.Matrix4().makeTranslation(-centre.x,-centre.y,-centre.z));
const source = await readGLB(path.relative(ROOT, path.resolve(lungFile)));
const parts: OutPart[] = [];
for (const [id, pattern] of [['airway', /trachea$|bronchus$|bronchi$|right_posterior_basal$/], ['cartilage', /cartilage$|cartilage_[LR]$|carina$/]] as const) {
  const geos = [...source].filter(([name])=>pattern.test(name)).map(([,g])=>g.clone().applyMatrix4(transform));
  if (!geos.length) throw new Error('Missing '+id);
  const merged = mergeGeos(geos); merged.computeVertexNormals();
  parts.push({id,role:id,geo:merged});
}
await writeGLB('public/models/bedside-airway.glb',parts,{
  airway:{color:[.78,.58,.49],rough:.65},cartilage:{color:[.84,.79,.68],rough:.62}
});
fs.writeFileSync(path.join(ROOT,'public/models/bedside-airway.provenance.json'),JSON.stringify({
  title:'Visible Human Male tracheobronchial tree',creator:'HuBMAP / Human Reference Atlas consortium',
  source:'https://github.com/hubmapconsortium/ccf-3d-reference-object-library',
  revision:'f1a3a63f110e27ff0736047d52d04dba5d3087f9',sourceFile:'VH_Male/v1.2/VH_M_Lung.glb',
  license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
  changes:'Selected airway and cartilage surfaces, baked source transforms, grouped by material, aligned to existing body frame, meshopt compressed and quantized; no decimation or synthetic branching.',
  reference:'Adult male; not a pediatric anatomical reference.',
  vertices:parts.reduce((n,p)=>n+p.geo.attributes.position.count,0)
},null,2)+'\n');
