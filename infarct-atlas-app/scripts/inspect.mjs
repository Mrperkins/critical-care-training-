import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(process.argv[2]);
const root = doc.getRoot();
for (const n of root.listNodes()) {
  const m = n.getMesh(); if (!m) { console.log('node', n.getName()); continue; }
  let v = 0, t = 0; const bb = [[1e9,1e9,1e9],[-1e9,-1e9,-1e9]];
  for (const p of m.listPrimitives()) { const a = p.getAttribute('POSITION'); v += a.getCount(); const i = p.getIndices(); t += (i ? i.getCount() : a.getCount()) / 3;
    const e=[]; for (let k=0;k<a.getCount();k++){a.getElement(k,e);for(let j=0;j<3;j++){bb[0][j]=Math.min(bb[0][j],e[j]);bb[1][j]=Math.max(bb[1][j],e[j]);}} }
  const mat = m.listPrimitives()[0].getMaterial();
  console.log(n.getName().padEnd(46), String(v).padStart(7), String(Math.round(t)).padStart(7), bb.map(b=>b.map(x=>x.toFixed(3)).join(',')).join(' | '), mat?.getName(), JSON.stringify(n.getTranslation()), JSON.stringify(n.getScale()));
}
console.log('materials', root.listMaterials().map(m=>m.getName()+':'+m.getBaseColorFactor().map(x=>x.toFixed(2))).join(' '));
