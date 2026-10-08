/**
 * Interactive bedside scene for the equipment simulator.
 *
 * Uses the licensed 3D HuBMAP whole-body mesh already shipped by the app.
 * All lung excursion comes from the same VentSession as the waveforms,
 * alarms, ABG and ventilator console. No SVG/2D patient substitute.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { loadBodyAsset, type BodyAsset } from '../asset/body';
import { StudioCanvas } from '../scene/Studio';
import { session } from './session';
import { ventNumbers } from './numbers';

type View = 'bedside' | 'lungs' | 'ventilator';
const SKIN = '#c7a18d';
const LUNG = '#c48983';

function Bed({ child }: { child: boolean }) {
  const length = child ? 3.65 : 4.85;
  return <group position={[-1.2, 0, 0]}>
    <mesh position={[0, .11, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.84, .26, length]} />
      <meshStandardMaterial color="#405465" roughness={.78} metalness={.15} />
    </mesh>
    <mesh position={[0, .27, 0]}>
      <boxGeometry args={[1.68, .14, length - .20]} />
      <meshStandardMaterial color="#a7bcc4" roughness={.94} />
    </mesh>
    <mesh position={[0, .39, -length / 2 + .52]}>
      <boxGeometry args={[1.12, .16, .72]} />
      <meshStandardMaterial color="#d2dee1" roughness={.92} />
    </mesh>
    {[-1,1].map(side => <group key={side}>
      <mesh position={[side * .94, -.19, .55]}>
        <boxGeometry args={[.09, .8, length * .55]} />
        <meshStandardMaterial color="#879da8" metalness={.55} roughness={.4} />
      </mesh>
      <mesh position={[side * .84, -.86, -.82]}>
        <boxGeometry args={[.12, 1.32, .12]} />
        <meshStandardMaterial color="#a2b4bd" metalness={.65} roughness={.3} />
      </mesh>
      <mesh position={[side * .84, -.86, 1]}>
        <boxGeometry args={[.12, 1.32, .12]} />
        <meshStandardMaterial color="#a2b4bd" metalness={.65} roughness={.3} />
      </mesh>
      {[-.82,1].map(z => <mesh key={z} position={[side * .84,-1.5,z]} rotation={[0,0,Math.PI/2]}>
        <cylinderGeometry args={[.20,.20,.10,18]} />
        <meshStandardMaterial color="#1e303d" roughness={.7} />
      </mesh>)}
    </group>)}
    <mesh position={[0,-.7,0]}>
      <boxGeometry args={[.12,.12,length * .72]} />
      <meshStandardMaterial color="#8197a4" metalness={.55} roughness={.4} />
    </mesh>
  </group>;
}

function BreathingLung({ body, id, side, focus }: {
  body: BodyAsset; id: string; side: 0 | 1; focus: () => void;
}) {
  const centre = body.mapping.centres[id] ?? [0,4.9,0];
  const geometry = useMemo(
    () => body.meshes[id].geometry.clone().translate(-centre[0],-centre[1],-centre[2]),
    [body,id,centre[0],centre[1],centre[2]],
  );
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:LUNG, roughness:.67, clearcoat:.14, transparent:true, opacity:.94, depthWrite:true,
  }), []);
  const mesh = useRef<THREE.Mesh>(null);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry,material]);
  useFrame((_,dt) => {
    if (!mesh.current) return;
    const volume = Number.isFinite(session.m.V[side]) ? session.m.V[side] : 1;
    const c = session.m.lung.comps[side];
    const collapse = Math.max(0,Math.min(1,c.collapsed));
    const target = Math.max(.56,Math.min(1.23,.91 + volume*.11 - collapse*.35));
    const a = 1-Math.exp(-7*Math.min(.07,dt));
    const next = THREE.MathUtils.lerp(mesh.current.scale.x,target,a);
    mesh.current.scale.set(next,next,next);
    material.color.setRGB(
      .68 - .24*collapse,
      .35 - .20*collapse,
      .34 - .17*collapse,
    );
  });
  return <mesh
    ref={mesh} geometry={geometry} material={material} position={centre}
    onClick={focus} dispose={null}
  />;
}

function AnatomicalPatient({ body, child, focus }: {
  body: BodyAsset; child: boolean; focus: () => void;
}) {
  const factor = child ? .30 : .42;
  const ids = ['heart','brain','aorta','vena_cava'];
  return <group position={[-1.2,.49,0]} rotation={[-Math.PI/2,0,0]} scale={factor}>
    <group position={[0,-4.6,0]}>
      {body.meshes.skin && <mesh geometry={body.meshes.skin.geometry} dispose={null}>
        <meshPhysicalMaterial color={SKIN} transparent opacity={.43} depthWrite={false} roughness={.79} side={THREE.DoubleSide} />
      </mesh>}
      {(['lung_R','lung_L'] as const).map((id,index) => body.meshes[id]
        ? <BreathingLung key={id} id={id} body={body} side={index as 0|1} focus={focus} />
        : null)}
      {ids.map(id => body.meshes[id]
        ? <mesh key={id} geometry={body.meshes[id].geometry} dispose={null}>
          <meshStandardMaterial color={id==='heart'?'#965260':id==='brain'?'#a78693':'#86565e'} roughness={.72} />
        </mesh>
        : null)}
    </group>
  </group>;
}

function EquipmentCabinet({ onFocus }: { onFocus: () => void }) {
  return <group position={[1.57,0,.32]} onClick={onFocus}>
    <mesh position={[0,.57,0]}><boxGeometry args={[.92,1.05,.62]} /><meshStandardMaterial color="#657986" metalness={.45} roughness={.48} /></mesh>
    <mesh position={[0,1.34,.17]}><boxGeometry args={[1.13,.95,.30]} /><meshStandardMaterial color="#9eafb8" metalness={.45} roughness={.36} /></mesh>
    <mesh position={[0,1.36,.338]}><boxGeometry args={[.96,.73,.03]} /><meshStandardMaterial color="#071a24" emissive="#08242d" emissiveIntensity={.35} /></mesh>
    {[.23,.06,-.11].map((y,i)=><mesh key={i} position={[-.18,1.42+y,.365]}><boxGeometry args={[.42,.027,.012]} /><meshBasicMaterial color={['#65c6ae','#71aada','#d1bd7b'][i]} /></mesh>)}
    <mesh position={[.37,1.08,.38]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.13,.13,.045,32]} /><meshStandardMaterial color="#d3dce1" metalness={.65} roughness={.32} /></mesh>
    {[.55,-.55].map(z=><mesh key={z} position={[0,-.01,z*.46]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.17,.17,.10,20]} /><meshStandardMaterial color="#27313c" roughness={.74} />
    </mesh>)}
    <mesh position={[-.35,.89,.34]}><sphereGeometry args={[.05,16,12]} /><meshStandardMaterial color="#75b8ba" emissive="#23575f" emissiveIntensity={.45} /></mesh>
  </group>;
}

function BedsideMonitor() {
  return <group position={[1.65,2.45,-1.48]}>
    <mesh position={[0,-.45,-.14]}><boxGeometry args={[.10,1.65,.10]} /><meshStandardMaterial color="#96a6b0" metalness={.64} roughness={.37} /></mesh>
    <mesh position={[0,0,0]}><boxGeometry args={[1.05,.76,.2]} /><meshStandardMaterial color="#748896" metalness={.42} roughness={.41} /></mesh>
    <mesh position={[0,0,.112]}><boxGeometry args={[.89,.61,.016]} /><meshStandardMaterial color="#05161d" emissive="#0d242d" emissiveIntensity={.3} /></mesh>
    {[.17,.03,-.11].map((y,i)=><mesh key={i} position={[0,y,.126]}><boxGeometry args={[.66,.018,.006]} /><meshBasicMaterial color={['#73c58a','#6ebad0','#e1b46f'][i]} /></mesh>)}
  </group>;
}

function Tubing({ disconnected, child }: { disconnected: boolean; child: boolean }) {
  // Path from the ventilator inspiratory limb to the Y-piece, then to the ETT.
  const offset = child ? .52 : .90;
  const pts = useMemo(() => [
    new THREE.Vector3(1.12,1.43,.64),
    new THREE.Vector3(.85,1.7,.9),
    new THREE.Vector3(.16,1.58,.76),
    new THREE.Vector3(-.36,1.25,-.06),
    new THREE.Vector3(-1.2,.55,-offset*1.63),
  ],[offset]);
  const complete = useMemo(() => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(pts),64,.048,10,false,
  ),[pts]);
  const limb = useMemo(() => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(pts.slice(0,3)),36,.048,10,false,
  ),[pts]);
  const ett = useMemo(() => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(pts.slice(3)),36,.048,10,false,
  ),[pts]);
  useEffect(() => () => { complete.dispose(); limb.dispose(); ett.dispose(); },[complete,limb,ett]);
  return <group>
    {!disconnected
      ? <mesh geometry={complete}><meshPhysicalMaterial color="#a0d9d9" roughness={.31} metalness={.08} transparent opacity={.83} /></mesh>
      : <>
        <mesh geometry={limb}><meshPhysicalMaterial color="#d78a87" roughness={.31} transparent opacity={.85} /></mesh>
        <mesh geometry={ett}><meshPhysicalMaterial color="#c7d3d9" roughness={.3} transparent opacity={.87} /></mesh>
        <mesh position={pts[2]}><sphereGeometry args={[.09,16,12]} /><meshStandardMaterial color="#d86368" emissive="#672b36" emissiveIntensity={.4} /></mesh>
      </>}
  </group>;
}

function Camera({ view }: { view: View }) {
  const controls = useRef<CameraControls>(null);
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (view === 'lungs') c.setLookAt(1.5,3.1,2.3,-1.2,.54,-.25,true);
    else if (view === 'ventilator') c.setLookAt(3.5,2.45,3,1.4,1.25,.2,true);
    else c.setLookAt(4.0,5.8,6.1,0,.45,0,true);
  },[view]);
  return <CameraControls
    ref={controls} makeDefault minDistance={1.1} maxDistance={15}
    dollySpeed={.45} truckSpeed={.35} smoothTime={.55}
  />;
}

export function EquipmentPatient() {
  const [body,setBody]=useState<BodyAsset|null>(null);
  const [error,setError]=useState(false);
  const [view,setView]=useState<View>('bedside');
  useEffect(() => {
    let active=true;
    loadBodyAsset().then(asset=>{if(active)setBody(asset);}).catch(()=>{if(active)setError(true);});
    return ()=>{active=false;};
  },[]);
  const n=ventNumbers(session), g=session.snap;
  const disconnected=session.circuitFault==='disconnect'||session.circuitFault==='both';
  const child=session.pt.p.age<18;
  return <div className="equipment-patient">
    <div className="equipment-patient-3d" style={{
      position:'relative',height:'clamp(300px,34vw,470px)',width:'100%',
      overflow:'hidden',borderRadius:12,background:'#07121c',
      border:'1px solid #304553',
    }}>
      {body
        ? <StudioCanvas camera={{position:[4,5,6],fov:39}} fog={false} label="Interactive 3D ventilated patient, bed, circuit and medical equipment">
            <Bed child={child} />
            <AnatomicalPatient body={body} child={child} focus={()=>setView('lungs')} />
            <EquipmentCabinet onFocus={()=>setView('ventilator')} />
            <BedsideMonitor />
            <Tubing child={child} disconnected={disconnected} />
            <Camera view={view} />
          </StudioCanvas>
        : <p className="loading" role="status">{error
          ? 'The licensed 3D patient mesh could not load. Check the anatomy asset and retry.'
          : 'Loading 3D patient anatomy…'}</p>}
    </div>
    <div className="actions" role="group" aria-label="3D bedside camera views" style={{marginTop:10,flexWrap:'wrap'}}>
      {(['bedside','lungs','ventilator'] as const).map(v=>
        <button key={v} className={view===v?'act primary':'act'} aria-pressed={view===v}
          onClick={()=>setView(v)}>{v==='bedside'?'Whole bedside':v==='lungs'?'Focus lungs':'Inspect ventilator'}</button>)}
    </div>
    {child && <p className="muted small">Pediatric scenario · {session.pt.p.weightKg} kg. The available whole-body 3D mesh is adult-derived and scaled; it is not a pediatric anatomical reference.</p>}
    <dl className="equipment-vitals">
      <div><dt>SpO₂</dt><dd>{Math.round(g.spo2*100)}%</dd></div>
      <div><dt>HR</dt><dd>{Math.round(g.hr)}/min</dd></div>
      <div><dt>MAP</dt><dd>{Math.round(g.map)} mmHg</dd></div>
      <div><dt>EtCO₂</dt><dd>{Math.round(g.etco2)} mmHg</dd></div>
    </dl>
    <p className="muted small">3D lung motion follows live simulated regional volume and collapse. Monitor values, ventilator controls and circuit faults share one physiology session. Motion is amplified for teaching and is not a validated bedside prediction.</p>
    {body && <p className="credit">3D patient anatomy: {body.mapping.attribution.creators} · <a href={body.mapping.attribution.licenseUrl} target="_blank" rel="noreferrer">{body.mapping.attribution.license}</a>. The ventilator, stretcher and circuit are original 3D training models. <span className="sr-only">Vte {Math.round(n.vte)} mL</span></p>}
  </div>;
}
