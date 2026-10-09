/**
 * Pupil examination on the HuBMAP Visible Human eyes (CC BY 4.0): the real sclera, cornea and lens, with the iris
 * opening set to the examined pupil size. "Shine a light" makes reactive pupils constrict; fixed ones do not move.
 * Facing the patient: their right eye is on your left.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { loadMeshes } from '../asset/gltf';
import { StudioCanvas } from '../scene/Studio';

declare global { interface Window { __EYES_GLB__?: string } }
let cache: Promise<Record<string, THREE.Mesh>> | null = null;
const loadEyes = () => (cache ??= loadMeshes(window.__EYES_GLB__, 'models/eyes.glb').catch((e) => { cache = null; throw e; }));

export interface PupilExam { mm: number; reactive: boolean }
const IRIS_R = 0.525; // cm (10.5 mm iris)

function Eye({ meshes, side, exam, light }: { meshes: Record<string, THREE.Mesh>; side: 'R' | 'L'; exam: PupilExam; light: boolean }) {
  const ring = useRef<THREE.Mesh>(null); const cur = useRef(exam.mm); const drawn = useRef(exam.mm);
  const target = light && exam.reactive ? Math.max(1.5, exam.mm * 0.5) : exam.mm;
  const mats = useMemo(() => ({
    sclera: new THREE.MeshStandardMaterial({ color: '#efe9df', roughness: 0.45 }),
    cornea: new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.12, roughness: 0.02, clearcoat: 1, depthWrite: false }),
    lens: new THREE.MeshStandardMaterial({ color: '#0b0b0d', roughness: 0.3 }),
    iris: new THREE.MeshStandardMaterial({ color: '#6b4a32', roughness: 0.7, side: THREE.DoubleSide }),
  }), []);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  useFrame((_, dt) => {
    cur.current += (target - cur.current) * (1 - Math.exp(-(light ? 9 : 3) * Math.min(dt, 0.1)));
    const inner = cur.current / 20; // mm diameter → cm radius
    if (ring.current && Math.abs(drawn.current - cur.current) > 0.02) { drawn.current = cur.current; ring.current.geometry.dispose(); ring.current.geometry = new THREE.RingGeometry(inner, IRIS_R, 64, 1); }
  });
  const x = side === 'R' ? -3.15 : 3.15;
  return <group position={[x, 0, 0]}>
    <mesh geometry={meshes[`sclera_${side}`].geometry} material={mats.sclera} dispose={null} />
    <mesh geometry={meshes[`lens_${side}`].geometry} material={mats.lens} dispose={null} />
    <mesh ref={ring} position={[0, 0, 0.02]} material={mats.iris}><ringGeometry args={[exam.mm / 20, IRIS_R, 64, 1]} /></mesh>
    <mesh position={[0, 0, -0.01]}><circleGeometry args={[IRIS_R, 48]} /><meshBasicMaterial color="#050506" /></mesh>
    <mesh geometry={meshes[`cornea_${side}`].geometry} material={mats.cornea} dispose={null} />
  </group>;
}

export function Pupils3D({ R, L }: { R: PupilExam; L: PupilExam }) {
  const [meshes, setMeshes] = useState<Record<string, THREE.Mesh> | null>(null); const [err, setErr] = useState(false); const [light, setLight] = useState(false);
  useEffect(() => { let on = true; loadEyes().then((m) => on && setMeshes(m)).catch(() => on && setErr(true)); return () => { on = false; }; }, []);
  useEffect(() => { if (!light) return; const t = setTimeout(() => setLight(false), 1600); return () => clearTimeout(t); }, [light]);
  const say = (s: string, e: PupilExam) => `${s} ${e.mm} mm, ${e.reactive ? 'reactive' : 'fixed'}`;
  return <figure className="pupils3d" aria-label={`Pupils: ${say('right', R)}; ${say('left', L)}`}>
    <div className="pupils3d-stage">
      {err ? <p className="muted small">The 3D eyes could not load.</p> : meshes && <StudioCanvas camera={{ position: [0, 0, 9.5], fov: 34 }} fog={false} label="Both pupils, facing the patient">
        <Eye meshes={meshes} side="R" exam={R} light={light} /><Eye meshes={meshes} side="L" exam={L} light={light} />
      </StudioCanvas>}
    </div>
    <figcaption><span>Right {R.mm} mm · {R.reactive ? 'reactive' : 'fixed'}</span><button className="act" onClick={() => setLight(true)} disabled={light}>Shine a light</button><span>Left {L.mm} mm · {L.reactive ? 'reactive' : 'fixed'}</span></figcaption>
  </figure>;
}
