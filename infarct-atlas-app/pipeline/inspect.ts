/** Step 1–2 of the asset pipeline: import source GLBs and inspect mesh names + world-space extents. */
import { NodeIO } from '@gltf-transform/core';
import { mat4, vec3 } from './mathlite';
const io = new NodeIO();
for (const f of process.argv.slice(2)) {
  const doc = await io.read(f);
  console.log('==', f);
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh(); if (!mesh) continue;
    const M = node.getWorldMatrix();
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9], c = [0, 0, 0], n = 0;
    for (const p of mesh.listPrimitives()) {
      const a = p.getAttribute('POSITION')!; const v = [0, 0, 0];
      for (let i = 0; i < a.getCount(); i++) { a.getElement(i, v); const w = vec3.transform(v, M as any); for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], w[k]); mx[k] = Math.max(mx[k], w[k]); c[k] += w[k]; } n++; }
    }
    console.log(node.getName().padEnd(70), 'c', c.map((x) => (x / n).toFixed(3)).join(','), ' size', mx.map((x, k) => (x - mn[k]).toFixed(3)).join(','));
  }
}
