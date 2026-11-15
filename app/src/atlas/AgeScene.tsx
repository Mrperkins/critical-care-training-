/**
 * Adult, child and infant side by side at true scale (public/models/ages.glb: MakeHuman body surface, CC0).
 * These are real body-surface models with each age's own proportions, not a scaled adult. They carry no internal
 * anatomy, so organ views stay on the adult reference and say so.
 */
import { useEffect, useMemo, useState } from 'react';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { loadMeshes } from '../asset/gltf';
import { StudioCanvas } from '../scene/Studio';

let cache: Promise<Record<string, THREE.Mesh>> | null = null;
const load = () => (cache ??= loadMeshes(undefined, 'models/ages.glb').then((m) => { for (const x of Object.values(m)) { x.geometry.computeVertexNormals(); x.geometry.computeBoundingBox(); } return m; }));
const WHO = [
  { id: 'adult', x: -0.9, label: 'Adult', note: '166 cm · head ≈ 1/8' },
  { id: 'child', x: 0.1, label: 'Child', note: '131 cm · ~8 yr · head ≈ 1/6' },
  { id: 'infant', x: 0.95, label: 'Infant', note: '60 cm · ~3 mo · head ≈ 1/4' },
] as const;

export function AgeScene({ focus }: { focus: 'child' | 'infant' }) {
  const [m, setM] = useState<Record<string, THREE.Mesh> | null>(null); const [err, setErr] = useState(false);
  useEffect(() => { let on = true; load().then((x) => on && setM(x)).catch(() => on && setErr(true)); return () => { on = false; }; }, []);
  const mat = useMemo(() => ({ on: new THREE.MeshStandardMaterial({ color: '#d9b49c', roughness: 0.62 }), off: new THREE.MeshStandardMaterial({ color: '#8f97a6', roughness: 0.8, transparent: true, opacity: 0.55 }) }), []);
  if (err) return <p className="loading">The body models could not be loaded.</p>;
  if (!m) return <p className="loading">Loading the body models…</p>;
  return (
    <StudioCanvas camera={{ position: [0.05, 1.0, 5.3], fov: 24 }} label="Adult, child and infant bodies at true scale">
      <hemisphereLight args={['#dfe8ff', '#20242c', 1.1]} /><directionalLight position={[2, 4, 5]} intensity={2.1} /><directionalLight position={[-3, 2, -4]} intensity={1.1} color="#88aaff" />
      <gridHelper args={[6, 12, '#334055', '#1a2230']} />
      {WHO.map((w) => { const mesh = m[w.id]; if (!mesh) return null; const h = mesh.geometry.boundingBox?.max.y ?? (mesh.geometry.computeBoundingBox(), mesh.geometry.boundingBox!.max.y);
        return <group key={w.id} position={[w.x, 0, 0]}>
          <mesh geometry={mesh.geometry} material={w.id === 'adult' || w.id === focus ? mat.on : mat.off} />
          <Html position={[0, h + 0.16, 0]} center zIndexRange={[5, 0]}><div className={`age-tag${w.id === focus ? ' on' : ''}`}><b>{w.label}</b><span>{w.note}</span></div></Html>
        </group>; })}
      <OrbitControls target={[0.05, 0.92, 0]} enablePan={false} minDistance={1.6} maxDistance={7} maxPolarAngle={Math.PI / 2} />
    </StudioCanvas>
  );
}
