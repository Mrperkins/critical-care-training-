// @vitest-environment node
import { expect, it } from 'vitest';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import * as THREE from 'three';

it('ships a detailed self-contained airway aligned inside the adult body frame', async () => {
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
  const doc = await io.read('public/models/bedside-airway.glb');
  expect(doc.getRoot().listMeshes().map(m=>m.getName()).sort()).toEqual(['airway','cartilage']);
  const bounds = new THREE.Box3(); let vertices = 0;
  for(const node of doc.getRoot().listNodes()) {
    const matrix = new THREE.Matrix4().fromArray(node.getWorldMatrix());
    for(const p of node.getMesh()?.listPrimitives()??[]) {
      const position=p.getAttribute('POSITION')!; const indices=p.getIndices()!.getArray()!;
      vertices+=position.getCount(); expect(indices.reduce((max,n)=>Math.max(max,n),0)).toBeLessThan(position.getCount());
      for(let i=0;i<position.getCount();i++) {
        const v=new THREE.Vector3().fromArray(position.getElement(i,[])).applyMatrix4(matrix);
        expect(Number.isFinite(v.x+v.y+v.z)).toBe(true);bounds.expandByPoint(v);
      }
    }
  }
  expect(vertices).toBeGreaterThan(120000);
  // The source is in decimetres, body-centred: thorax/neck, not metres or a second translated patient.
  expect(bounds.min.y).toBeGreaterThan(3);expect(bounds.max.y).toBeLessThan(8.5);
  expect(bounds.min.x).toBeGreaterThan(-1.6);expect(bounds.max.x).toBeLessThan(1.6);
  expect(doc.getRoot().listTextures()).toHaveLength(0);
},30000);
