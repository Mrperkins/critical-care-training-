/** Shared GLB loading: meshopt decode, bake the de-quantisation node transforms, rename custom attributes. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export const b64ToBuf = (b64: string) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };
/** glTF custom attributes arrive lower-cased with a leading underscore; give them shader-friendly names. */
const RENAME: Record<string, string> = { _seg: 'aSeg', _dep: 'aDep', _base: 'aBase', _lobe: 'aLobe', _gen: 'aGen', _s: 'aS', _dome: 'aDome', _alv: 'aAlv', _kind: 'aKind', _eff: 'aEff', _act: 'aAct', _ch: 'aCh', _vt: 'aT' };

/** Meshopt-quantised glTF stores positions in a normalised box with the de-quantisation in the node matrix: bake it into float geometry. */
function bakeWorld(m: THREE.Mesh) {
  const g = m.geometry; const toFloat = (name: string, size: number) => {
    const a = g.getAttribute(name) as THREE.BufferAttribute | undefined; if (!a) return;
    const f = new Float32Array(a.count * size); for (let i = 0; i < a.count; i++) { f[i * size] = a.getX(i); if (size > 1) f[i * size + 1] = a.getY(i); if (size > 2) f[i * size + 2] = a.getZ(i); }
    g.setAttribute(name, new THREE.BufferAttribute(f, size));
  };
  toFloat('position', 3); toFloat('normal', 3);
  g.applyMatrix4(m.matrixWorld);
  const n = g.getAttribute('normal') as THREE.BufferAttribute | undefined;
  if (n) for (let i = 0; i < n.count; i++) { const v = new THREE.Vector3(n.getX(i), n.getY(i), n.getZ(i)).normalize(); n.setXYZ(i, v.x, v.y, v.z); }
  m.matrix.identity(); m.matrixWorld.identity();
}

export async function loadMeshes(inline: string | undefined, url: string, attrs: string[] = []): Promise<Record<string, THREE.Mesh>> {
  const w = window as unknown as { __B64_MODELS__?: boolean };
  // published pages serve binary models as base64 text files (.glb.txt)
  const buf = inline ? b64ToBuf(inline) : w.__B64_MODELS__ ? b64ToBuf((await (await fetch(url + '.txt')).text()).trim()) : await (await fetch(url)).arrayBuffer();
  await MeshoptDecoder.ready;
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.parseAsync(buf, '');
  const meshes: Record<string, THREE.Mesh> = {};
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((o) => {
    const m = o as THREE.Mesh; if (!m.isMesh) return;
    const g = m.geometry; bakeWorld(m);
    for (const [from, to] of Object.entries(RENAME)) { const a = g.getAttribute(from); if (a) { g.setAttribute(to, a); g.deleteAttribute(from); } }
    const n = g.getAttribute('position').count;
    for (const a of attrs) if (!g.getAttribute(a)) g.setAttribute(a, new THREE.BufferAttribute(new Float32Array(n), 1));
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    g.computeBoundingSphere();
    meshes[m.name || m.parent?.name || `mesh${Object.keys(meshes).length}`] = m;
  });
  return meshes;
}
