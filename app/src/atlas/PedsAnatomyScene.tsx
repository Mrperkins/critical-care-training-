/**
 * Real pediatric anatomy: an infant, a one-year-old and a school-age child, each built from the organ outlines that
 * experts drew on that child's own CT scan (Pediatric-CT-SEG, The Cancer Imaging Archive, CC BY 4.0;
 * pipeline/build-peds-anatomy.py). Every organ is the size and in the place it was in that child — nothing here is
 * an adult organ scaled down. The scans cover the chest, abdomen and pelvis, so there is no head, neck or airway.
 */
import { useEffect, useMemo, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { loadMeshes } from '../asset/gltf';
import { StudioCanvas } from '../scene/Studio';
import { ORGANS, PEDS, type PedsBand } from './pedsAnatomy';

const cache: Partial<Record<PedsBand, Promise<Record<string, THREE.Mesh>>>> = {};
const load = (b: PedsBand) => (cache[b] ??= loadMeshes(undefined, `models/peds-${b}.glb`).then((m) => { for (const x of Object.values(m)) { x.geometry.computeVertexNormals(); x.geometry.computeBoundingBox(); } return m; }));
const BANDS: PedsBand[] = ['infant', 'toddler', 'child'];

function Body({ meshes, pick, skin, bones }: { meshes: Record<string, THREE.Mesh>; pick: string | null; skin: boolean; bones: boolean }) {
  const mats = useMemo(() => Object.fromEntries(Object.keys(meshes).map((k) => { const o = ORGANS[k]; const shell = k === 'skin';
    return [k, new THREE.MeshStandardMaterial({ color: o?.color ?? '#c8aa96', roughness: shell ? 0.8 : 0.55, transparent: true, opacity: 1, depthWrite: !shell, side: shell ? THREE.FrontSide : THREE.DoubleSide })]; })), [meshes]);
  useEffect(() => { for (const [k, m] of Object.entries(mats)) { const shell = k === 'skin'; const dim = !!pick && pick !== k;
    m.opacity = shell ? (pick ? 0.07 : 0.16) : k === 'bones' ? (dim ? 0.12 : 0.9) : dim ? 0.14 : 1; m.depthWrite = !shell && m.opacity > 0.5; m.needsUpdate = true; } }, [mats, pick]);
  const c = meshes.skin?.geometry.boundingBox?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3();
  return <group position={[-c.x, -c.y, -c.z]}>{Object.entries(meshes).map(([k, m]) => (k === 'skin' && !skin) || (k === 'bones' && !bones) ? null
    : <mesh key={k} geometry={m.geometry} material={mats[k]} renderOrder={k === 'skin' ? 3 : k === 'bones' ? 1 : 2} />)}</group>;
}

export function PedsAnatomyScene({ start }: { start: PedsBand }) {
  const [band, setBand] = useState<PedsBand>(start); const [m, setM] = useState<Record<string, THREE.Mesh> | null>(null); const [err, setErr] = useState(false);
  const [pick, setPick] = useState<string | null>(null); const [skin, setSkin] = useState(true); const [bones, setBones] = useState(true);
  useEffect(() => { let on = true; setM(null); setErr(false); load(band).then((x) => on && setM(x)).catch(() => on && setErr(true)); return () => { on = false; }; }, [band]);
  const info = PEDS[band]; const list = Object.keys(info.ml).filter((k) => ORGANS[k] && k !== 'skin' && k !== 'bones').sort((a, b) => info.ml[b] - info.ml[a]);
  return (
    <div className="peds-anat">
      <div className="peds-bar" role="group" aria-label="Which child">{BANDS.map((b) => <button key={b} type="button" aria-pressed={band === b} onClick={() => { setBand(b); setPick(null); }}><b>{PEDS[b].label}</b><span>{PEDS[b].who}</span></button>)}</div>
      <div className="peds-view">
        {err ? <p className="loading">The anatomy model could not be loaded.</p> : !m ? <p className="loading">Loading this child’s anatomy…</p> :
          <StudioCanvas camera={{ position: [0, 0, 1.3], fov: 26 }} fog={false} label={`${info.label}: chest, abdomen and pelvis from a real CT scan`}>
            <hemisphereLight args={['#dfe8ff', '#20242c', 1.15]} /><directionalLight position={[2, 3, 5]} intensity={2.2} /><directionalLight position={[-3, 2, -4]} intensity={1.0} color="#88aaff" />
            <Body meshes={m} pick={pick} skin={skin} bones={bones} />
            <OrbitControls enablePan={false} minDistance={0.3} maxDistance={2.2} />
          </StudioCanvas>}
        <div className="peds-toggles"><button type="button" aria-pressed={skin} onClick={() => setSkin(!skin)}>Skin</button><button type="button" aria-pressed={bones} onClick={() => setBones(!bones)}>Bones</button></div>
        <p className="peds-scale">{info.wholeChest ? 'Chest, abdomen and pelvis' : 'Abdomen and pelvis; this scan stops at the lower chest'} · {info.heightCm} cm of trunk, {info.widthCm} cm wide · same scale for all three</p>
      </div>
      <ul className="peds-organs" aria-label="Organs, with the volume measured on this scan">{list.map((k) => <li key={k}><button type="button" aria-pressed={pick === k} onClick={() => setPick(pick === k ? null : k)}><i style={{ background: ORGANS[k].color }} />{ORGANS[k].label}<span>{info.ml[k] >= 10 ? Math.round(info.ml[k]) : info.ml[k].toFixed(1)} mL</span></button></li>)}</ul>
    </div>
  );
}
