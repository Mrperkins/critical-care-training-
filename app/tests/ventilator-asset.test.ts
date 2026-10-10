// @vitest-environment node
import { expect, it } from 'vitest';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'node:fs';

it('retains the licensed ventilator geometry, UVs and embedded PBR materials', async () => {
  await MeshoptDecoder.ready;
  const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public/models/medical-ventilator.glb');
  const root = doc.getRoot();
  expect(root.listMeshes().map(m=>m.getName()).sort()).toEqual(['Base','Other','Tubes']);
  let triangles=0, vertices=0;
  for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) {
    const pos=p.getAttribute('POSITION')!, uv=p.getAttribute('TEXCOORD_0')!;
    const normal=p.getAttribute('NORMAL')!, indices=p.getIndices()!;
    vertices+=pos.getCount(); triangles+=indices.getCount()/3;
    expect(uv.getCount()).toBe(pos.getCount()); expect(normal.getCount()).toBe(pos.getCount());
    expect(Math.max(...indices.getArray()!)).toBeLessThan(pos.getCount());
    expect(Array.from(pos.getArray()!).every(Number.isFinite)).toBe(true);
    const mat=p.getMaterial()!;
    expect(mat.getBaseColorTexture()).toBeTruthy();
    expect(mat.getNormalTexture()).toBeTruthy();
    expect(mat.getMetallicRoughnessTexture()).toBeTruthy();
    expect(mat.getOcclusionTexture()).toBeTruthy();
  }
  expect(triangles).toBe(66944); expect(vertices).toBe(51012);
  expect(root.listTextures()).toHaveLength(12);
  expect(root.listTextures().every(t=>t.getImage()?.byteLength && !t.getURI())).toBe(true);
  expect(root.listTextures().every(t=>t.getMimeType()==='image/webp')).toBe(true);
  expect(fs.statSync('public/models/medical-ventilator.glb').size).toBeLessThan(2.5e6); // delivery copy (original kept as .src.glb)
  const credit=JSON.parse(fs.readFileSync('public/models/medical-ventilator.provenance.json','utf8'));
  expect(credit.creator).toBe('lazarys'); expect(credit.license).toBe('CC BY 4.0');
  expect(credit.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
});
