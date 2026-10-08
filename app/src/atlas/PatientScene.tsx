import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CameraControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { loadBodyAsset, type BodyAsset } from '../asset/body';
import { StudioCanvas } from '../scene/Studio';
import { resolveTarget } from '../scene/cameraTargets';
import type { DiseaseDefinition, DiseaseState } from './types';

const COLORS: Record<string,string> = { heart: '#96535b', lung_L: '#bb8790', lung_R: '#bb8790', brain: '#ad8c9a', liver: '#763e35', kidney_L: '#986f6b', kidney_R: '#986f6b', aorta: '#b6595f', vena_cava: '#5d739b' };
function affected(d: DiseaseDefinition): string[] {
  if (['airway', 'alveoli', 'pleura'].includes(d.anatomy)) return ['lung_L', 'lung_R'];
  if (d.anatomy === 'pulmonary-vessels') return ['lung_L', 'lung_R', 'heart'];
  if (d.anatomy === 'heart') return ['heart'];
  if (d.anatomy === 'aorta') return ['aorta'];
  if (d.anatomy === 'brain') return ['brain'];
  return ['heart', 'aorta', 'kidney_L', 'kidney_R'];
}
function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const q = window.matchMedia('(prefers-reduced-motion: reduce)'); const f = () => setReduced(q.matches); q.addEventListener('change', f); return () => q.removeEventListener('change', f); }, []);
  return reduced;
}
function focusPoint(body: BodyAsset, disease: DiseaseDefinition, target: string) {
  const centres = body.mapping.centres;
  const point = (key: string, fallback: [number,number,number]) => new THREE.Vector3(...(centres[key] ?? fallback));
  const region = disease.anatomy === 'brain' ? point('brain',[0,8.3,0]) : disease.anatomy === 'heart' || disease.anatomy === 'pulmonary-vessels' ? point('heart',[0,4.8,0]) : disease.anatomy === 'aorta' ? new THREE.Vector3(0, disease.target === 'aorta.thoracic' ? 5 : 2.4, 0) : ['airway','alveoli','pleura'].includes(disease.anatomy) ? point('lung_R',[-.65,5,0]) : new THREE.Vector3(0,2.6,0);
  const resolved = resolveTarget(target);
  // Scene-local anchors retain semantic names and use the actual source anatomy's centres.
  const anchors: Record<string, THREE.Vector3> = { whole: new THREE.Vector3(), head: point('brain',[0,8.3,0]), chest: point('heart',[0,4.8,0]), abdomen: new THREE.Vector3(0,2.5,0), pelvis: new THREE.Vector3(0,.5,0) };
  if (resolved && !anchors[resolved.anchor]) anchors[resolved.anchor] = region;
  return resolveTarget(target, anchors)?.position ?? region;
}
function Camera({ body, disease, target }: { body: BodyAsset; disease: DiseaseDefinition; target: string }) {
  const controls = useRef<CameraControls>(null); const reduced = useReducedMotion();
  const aspect = useThree(s => s.size.width / Math.max(1,s.size.height));
  useEffect(() => {
    const p = focusPoint(body, disease, target); const whole = target === 'body.whole';
    const size = whole ? 19 : disease.anatomy === 'brain' ? 3.1 : 4.1;
    const distance = size / (2 * Math.tan(THREE.MathUtils.degToRad(17))) * Math.max(1,1/aspect);
    controls.current?.setLookAt(p.x+.12,p.y+.15,p.z+distance,p.x,p.y,p.z,!reduced);
  },[body,disease,target,aspect,reduced]);
  return <CameraControls ref={controls} makeDefault smoothTime={.65} minDistance={2} maxDistance={50} />;
}
function Organ({ body, name, active, state, disease }: { body: BodyAsset; name: string; active: boolean; state: DiseaseState; disease: DiseaseDefinition }) {
  const mesh = useRef<THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial>>(null);
  const centre = body.mapping.centres[name] ?? [0,0,0]; const reduced = useReducedMotion();
  const geometry = useMemo(() => body.meshes[name].geometry.clone().translate(-centre[0],-centre[1],-centre[2]),[body,name]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS[name], roughness: .65, transparent: true }),[name]);
  const nextScale = useMemo(() => new THREE.Vector3(), []);
  const nextColor = useMemo(() => {
    const color = new THREE.Color(COLORS[name]);
    if (active) color.lerp(new THREE.Color('#623149'),state.ischemia*.65).lerp(new THREE.Color('#6985a6'),state.fluid*.55);
    return color;
  }, [name,active,state.ischemia,state.fluid]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); },[geometry,material]);
  useFrame((_,dt) => {
    if (!mesh.current) return;
    const lung = name.startsWith('lung');
    const unilateral = ['tension','pleural-air','pleural-blood'].includes(disease.variant);
    const changed = active && (!unilateral || name === 'lung_R');
    const size = changed && lung ? 1 - .48 * state.collapse + .18 * state.overdistension : changed && name === 'brain' ? 1 + .035 * state.edema : 1;
    const u = reduced ? 1 : 1 - Math.exp(-4*Math.min(dt,.1));
    mesh.current.scale.lerp(nextScale.set(size,size,size),u);
    mesh.current.material.color.lerp(nextColor,u); mesh.current.material.opacity = active ? 1 : .12;
  });
  material.depthWrite = active;
  return <mesh ref={mesh} geometry={geometry} material={material} position={centre} dispose={null} />;
}
function Skin({ body, whole }: { body: BodyAsset; whole: boolean }) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b99b87', transparent: true, depthWrite: false }),[]);
  material.opacity = whole ? .35 : .06;
  useEffect(() => () => material.dispose(),[material]);
  return <mesh geometry={body.meshes.skin.geometry} material={material} dispose={null} />;
}
function Pathology({ body, disease, state }: { body: BodyAsset; disease: DiseaseDefinition; state: DiseaseState }) {
  const point = focusPoint(body,disease,disease.target); const anterior = point.clone().add(new THREE.Vector3(.18,0,.55));
  const brain = disease.anatomy === 'brain';
  return <group>
    {state.bleeding > .02 && <mesh position={anterior} scale={[.15+state.bleeding*.4,.12+state.bleeding*.35,.15]}><sphereGeometry args={[1,20,14]} /><meshStandardMaterial color="#9b263e" roughness={.48} /></mesh>}
    {brain && state.edema > .02 && <mesh position={anterior} scale={[.2+state.edema*.45,.2+state.edema*.4,.19]}><sphereGeometry args={[1,20,14]} /><meshStandardMaterial color="#ddbc82" transparent opacity={.16} depthWrite={false} /></mesh>}
    {state.ischemia > .05 && <mesh position={anterior.clone().add(new THREE.Vector3(-.22,.12,.01))} scale={[.12+state.ischemia*.25,.15+state.ischemia*.25,.12]}><sphereGeometry args={[1,20,14]} /><meshStandardMaterial color="#58334c" roughness={.8} /></mesh>}
    {disease.variant === 'clot' && <mesh position={point.clone().add(new THREE.Vector3(-.35,.25,.5))} scale={[.18,.25,.17]}><sphereGeometry args={[1,18,12]} /><meshStandardMaterial color="#962b3c" /></mesh>}
    {disease.anatomy === 'aorta' && ['aneurysm','rupture'].includes(disease.variant) && <mesh position={point} scale={[.17+state.overdistension*.3,.6,.17+state.overdistension*.3]}><sphereGeometry args={[1,24,16]} /><meshStandardMaterial color="#b6595f" roughness={.65} /></mesh>}
    {disease.variant === 'pericardial' && <mesh position={point} scale={[.67,.95,.67]}><sphereGeometry args={[1,24,16]} /><meshStandardMaterial color="#75a3c7" transparent opacity={state.fluid*.28} depthWrite={false} /></mesh>}
    {['diffuse-fluid','focal-fluid','hydrostatic-fluid'].includes(disease.variant) && Array.from({length: disease.variant === 'focal-fluid' ? 5 : 10},(_,i) => <mesh key={i} position={[((i%2) ? .65 : -.65)+(i%3)*.12,4.5+Math.floor(i/2)*.18,.5]} scale={[.12,.1+.15*state.fluid,.1]}><sphereGeometry args={[1,12,8]} /><meshStandardMaterial color="#709fc1" transparent opacity={state.fluid*.65} /></mesh>)}
  </group>;
}
export default function PatientScene({ disease, state, target }: { disease: DiseaseDefinition; state: DiseaseState; target: string }) {
  const [body,setBody] = useState<BodyAsset|null>(null); const [error,setError] = useState(false);
  useEffect(() => { let cancelled = false; loadBodyAsset().then(asset => { if (!cancelled) setBody(asset); }).catch(() => { if (!cancelled) setError(true); }); return () => { cancelled = true; }; },[]);
  if (error) return <p>The patient asset could not load. Use the Mechanism view for the same disease findings.</p>;
  if (!body) return <p className="loading">Loading patient anatomy…</p>;
  const organs = affected(disease);
  return <><StudioCanvas camera={{position:[0,1,34],fov:34}} fog={false} label={`${disease.title}, whole patient and affected anatomy`}>
    <Skin body={body} whole={target === 'body.whole'} />
    {Object.keys(COLORS).filter(name => body.meshes[name]).map(name => <Organ key={name} body={body} name={name} active={organs.includes(name)} state={state} disease={disease} />)}
    <Pathology body={body} disease={disease} state={state} /><Camera body={body} disease={disease} target={target} />
  </StudioCanvas><p className="credit">Adult anatomy: {body.mapping.attribution.creators} · <a href={body.mapping.attribution.licenseUrl} target="_blank" rel="noreferrer">{body.mapping.attribution.license}</a>. Pathology overlays are procedural, schematic and not to scale. Pediatric and reproductive teaching use separate schematic anatomy.</p></>;
}
