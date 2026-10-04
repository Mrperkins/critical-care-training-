import { NodeIO } from '@gltf-transform/core';
const io = new NodeIO();
const pat = process.argv[3] ? new RegExp(process.argv[3]) : /.*/;
const doc = await io.read(process.argv[2]);
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh(); if (!mesh || !pat.test(node.getName())) continue;
  const M = node.getWorldMatrix(); let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9], c = [0, 0, 0], n = 0;
  for (const p of mesh.listPrimitives()) { const a = p.getAttribute('POSITION')!; const v = [0, 0, 0];
    for (let i = 0; i < a.getCount(); i++) { a.getElement(i, v); const [x, y, z] = v; const w = [M[0] * x + M[4] * y + M[8] * z + M[12], M[1] * x + M[5] * y + M[9] * z + M[13], M[2] * x + M[6] * y + M[10] * z + M[14]];
      for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], w[k]); mx[k] = Math.max(mx[k], w[k]); c[k] += w[k]; } n++; } }
  console.log(node.getName().replace('VH_M_', '').padEnd(52), 'c', c.map((x) => (x / n).toFixed(3)).join(','), ' size', mx.map((x, k) => (x - mn[k]).toFixed(3)).join(','));
}
