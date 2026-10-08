/**
 * Interactive bedside scene for the equipment simulator.
 *
 * Uses the licensed 3D HuBMAP whole-body mesh already shipped by the app.
 * All lung excursion comes from the same VentSession as the waveforms,
 * alarms, ABG and ventilator console. No SVG/2D patient substitute.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { loadBodyAsset, type BodyAsset } from '../asset/body';
import { loadMeshes } from '../asset/gltf';

declare global { interface Window { __AIRWAY_GLB__?: string; __VENTILATOR_GLB__?: string } }
let airwayCache: Promise<Record<string,THREE.Mesh>> | null = null;
const loadAirway = () => airwayCache ??= loadMeshes(window.__AIRWAY_GLB__, 'models/bedside-airway.glb').catch(e=>{airwayCache=null;throw e;});
let ventilatorCache: Promise<Record<string,THREE.Mesh>> | null = null;
const loadVentilator = () => ventilatorCache ??= loadMeshes(window.__VENTILATOR_GLB__, 'models/medical-ventilator.glb').catch(e=>{ventilatorCache=null;throw e;});
import { StudioCanvas } from '../scene/Studio';
import { session } from './session';
import { ventNumbers } from './numbers';
import { EquipmentScreen } from './EquipmentScreen';

type View = 'bedside' | 'lungs' | 'ventilator' | 'airway';
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

function BreathingLung({ body, id, side, focus, revealAirway }: {
  body: BodyAsset; id: string; side: 0 | 1; focus: () => void; revealAirway: boolean;
}) {
  const centre = body.mapping.centres[id] ?? [0,4.9,0];
  const geometry = useMemo(
    () => body.meshes[id].geometry.clone().translate(-centre[0],-centre[1],-centre[2]),
    [body,id,centre[0],centre[1],centre[2]],
  );
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:LUNG, roughness:.67, clearcoat:.14, transparent:true, opacity:.94, depthWrite:true,
  }), []);
  useEffect(()=>{material.opacity=revealAirway?.18:.94;material.depthWrite=!revealAirway;},[material,revealAirway]);
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

function AnatomicalPatient({ body, child, focus, transparent, airway }: {
  body: BodyAsset; child: boolean; focus: () => void; transparent: boolean; airway: Record<string,THREE.Mesh> | null;
}) {
  const factor = child ? .18 : .245;
  const ids = ['heart','brain','aorta','vena_cava'];
  return <group position={[-1.2,child?.64:.74,0]} rotation={[-Math.PI/2,0,0]} scale={factor}>
    <group position={[0,0,0]}>
      {body.meshes.skin && <mesh geometry={body.meshes.skin.geometry} dispose={null}>
        <meshPhysicalMaterial color={SKIN} transparent={transparent} opacity={transparent?(airway?.06:.25):1} depthWrite={!transparent} roughness={.79} side={THREE.DoubleSide} />
      </mesh>}
      {(['lung_R','lung_L'] as const).map((id,index) => body.meshes[id]
        ? <BreathingLung key={id} id={id} body={body} side={index as 0|1} focus={focus} revealAirway={!!airway} />
        : null)}
      {airway && ['airway','cartilage'].map(id=>airway[id] && <mesh key={id} geometry={airway[id].geometry} material={airway[id].material} onClick={focus} dispose={null} />)}
      {!airway && ids.map(id => body.meshes[id]
        ? <mesh key={id} geometry={body.meshes[id].geometry} dispose={null}>
          <meshStandardMaterial color={id==='heart'?'#965260':id==='brain'?'#a78693':'#86565e'} roughness={.72} />
        </mesh>
        : null)}
    </group>
  </group>;
}

function EquipmentCabinet({ model, onFocus }: { model: Record<string,THREE.Mesh>; onFocus: () => void }) {
  return <group position={[1.6,-1.55,.32]} rotation={[0,-Math.PI/2,0]} scale={2.2} onClick={onFocus}>
    {Object.entries(model).map(([id,m])=><mesh key={id} geometry={m.geometry} material={m.material} dispose={null} />)}
    {/* Mounted inside the authored display bezel, with its measured face tilt. */}
    <group position={[.132,1.03,-.009]} rotation={[0,0,.154]}>
      <group rotation={[0,Math.PI/2,0]}>
        <EquipmentScreen kind="vent" position={[0,0,0]} size={[.194,.105]} />
      </group>
    </group>
  </group>;
}

function BedsideMonitor() {
  return <group position={[1.65,2.45,-1.48]}>
    <mesh position={[0,-.45,-.14]}><boxGeometry args={[.10,1.65,.10]} /><meshStandardMaterial color="#96a6b0" metalness={.64} roughness={.37} /></mesh>
    <mesh position={[0,0,0]}><boxGeometry args={[1.05,.76,.2]} /><meshStandardMaterial color="#748896" metalness={.42} roughness={.41} /></mesh>
    <mesh position={[0,0,.112]}><boxGeometry args={[.89,.61,.016]} /><meshStandardMaterial color="#05161d" emissive="#0d242d" emissiveIntensity={.3} /></mesh>
    <EquipmentScreen kind="monitor" position={[0,0,.13]} size={[.87,.59]} />
  </group>;
}

function Tubing({ disconnected, child, onToggle }: { disconnected: boolean; child: boolean; onToggle: () => void }) {
  // Path from the ventilator inspiratory limb to the Y-piece, then to the ETT.
  const offset = child ? 1 : 1.2;
  const pts = useMemo(() => [
    new THREE.Vector3(1.53,.32,.64),
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
    <mesh position={pts[2]} onClick={e=>{e.stopPropagation();onToggle();}}>
      <sphereGeometry args={[.12,24,16]} /><meshStandardMaterial color={disconnected?'#d86368':'#80c6bd'} emissive={disconnected?'#672b36':'#163b3b'} emissiveIntensity={.3}/>
    </mesh>
    {!disconnected
      ? <mesh geometry={complete}><meshPhysicalMaterial color="#a0d9d9" roughness={.31} metalness={.08} transparent opacity={.83} /></mesh>
      : <>
        <mesh geometry={limb}><meshPhysicalMaterial color="#d78a87" roughness={.31} transparent opacity={.85} /></mesh>
        <mesh geometry={ett}><meshPhysicalMaterial color="#c7d3d9" roughness={.3} transparent opacity={.87} /></mesh>
        <mesh position={pts[2]}><sphereGeometry args={[.09,16,12]} /><meshStandardMaterial color="#d86368" emissive="#672b36" emissiveIntensity={.4} /></mesh>
      </>}
  </group>;
}

function Camera({ view, revision, child }: { view: View; revision: number; child: boolean }) {
  const { size } = useThree();
  const controls = useRef<CameraControls>(null);
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (view === 'airway') c.setLookAt(.0,1.8,-.55,-1.2,.84,-1.35,true);
    else if (view === 'lungs') c.setLookAt(1.1,2.7,.7,-1.2,child?.7:.8,child?-.9:-1.25,true);
    else if (view === 'ventilator') c.setLookAt(2.2,1.3,2.25,1.62,.72,.61,true);
    else { const distance=Math.max(1,1.25/(size.width/size.height)); c.setLookAt(4.0*distance,5.8*distance,6.1*distance,0,.45,0,true); }
  },[view,revision,child,size.width,size.height]);
  return <CameraControls
    ref={controls} makeDefault minDistance={1.1} maxDistance={15}
    dollySpeed={.45} truckSpeed={.35} smoothTime={.55}
  />;
}

export function EquipmentPatient({ onCircuitChange, onVentilator }: { onCircuitChange: () => void; onVentilator: () => void }) {
  const [body,setBody]=useState<BodyAsset|null>(null);
  const [error,setError]=useState(false);
  const [view,setView]=useState<View>('bedside');
  const [revision,setRevision]=useState(0);
  const [transparent,setTransparent]=useState(true);
  const [airway,setAirway]=useState<Record<string,THREE.Mesh>|null>(null);
  const [airwayError,setAirwayError]=useState(false);
  const [revealAirway,setRevealAirway]=useState(false);
  const [ventilator,setVentilator]=useState<Record<string,THREE.Mesh>|null>(null);
  const [ventilatorError,setVentilatorError]=useState(false);
  const focus=(v:View)=>{setView(v);setRevision(r=>r+1);};
  useEffect(() => {
    let active=true;
    loadBodyAsset().then(asset=>{if(active)setBody(asset);}).catch(()=>{if(active)setError(true);});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{let active=true;loadAirway().then(a=>{if(!a.airway||!a.cartilage)throw new Error('Missing airway surfaces');if(active)setAirway(a);}).catch(()=>{if(active)setAirwayError(true);});return()=>{active=false;};},[]);
  useEffect(()=>{let active=true;loadVentilator().then(a=>{if(!a.Base||!a.Tubes||!a.Other)throw new Error('Missing ventilator surfaces');if(active)setVentilator(a);}).catch(()=>{if(active)setVentilatorError(true);});return()=>{active=false;};},[]);
  const n=ventNumbers(session), g=session.snap;
  const disconnected=session.circuitFault==='disconnect'||session.circuitFault==='both';
  const child=session.pt.p.age<18;
  const toggleCircuit=()=>{session.circuit(disconnected?(session.circuitFault==='both'?'cuffLeak':'none'):(session.circuitFault==='cuffLeak'?'both':'disconnect'));onCircuitChange();};
  return <div className="equipment-patient">
    <div className="equipment-patient-3d" style={{
      position:'relative',height:'clamp(300px,34vw,470px)',width:'100%',
      overflow:'hidden',borderRadius:12,background:'#07121c',
      border:'1px solid #304553',
    }}>
      {body
        ? <StudioCanvas camera={{position:[4,5,6],fov:39}} fog={false} label="Interactive 3D ventilated patient, bed, circuit and medical equipment">
            <Bed child={child} />
            <AnatomicalPatient body={body} child={child} transparent={transparent} airway={!child&&revealAirway?airway:null} focus={()=>focus('lungs')} />
            {ventilator && <EquipmentCabinet model={ventilator} onFocus={()=>focus('ventilator')} />}
            <BedsideMonitor />
            {!(revealAirway&&!child) && <Tubing child={child} disconnected={disconnected} onToggle={toggleCircuit} />}
            <Camera view={view} revision={revision} child={child} />
          </StudioCanvas>
        : <p className="loading" role="status">{error
          ? 'The licensed 3D patient mesh could not load. Check the anatomy asset and retry.'
          : 'Loading 3D patient anatomy…'}</p>}
    </div>
    {!ventilator && <p className="muted small" role="status">{ventilatorError?'The licensed 3D ventilator model could not load. Reload to retry.':'Loading licensed 3D ventilator…'}</p>}
    <div className="actions" role="group" aria-label="3D bedside camera views" style={{marginTop:10,flexWrap:'wrap'}}>
      {(['bedside','lungs','ventilator'] as const).map(v=>
        <button key={v} className={view===v?'act primary':'act'} aria-pressed={view===v}
          onClick={()=>focus(v)}>{v==='bedside'?'Whole bedside':v==='lungs'?'Focus lungs':'Inspect ventilator'}</button>)}
      <button className="act" aria-pressed={transparent} onClick={()=>{setTransparent(v=>!v);setRevealAirway(false);}}>{transparent?'Show skin surface':'Reveal organs'}</button>
    {!child && <button className="act" aria-pressed={revealAirway} disabled={!airway} onClick={()=>{setRevealAirway(v=>!v);setTransparent(true);focus(revealAirway?'lungs':'airway');}}>{airwayError?'Airway model unavailable':!airway?'Loading airway…':revealAirway?'Hide airway anatomy':'Inspect airway anatomy'}</button>}
    </div>
    {revealAirway&&!child&&<p className="muted small">Adult trachea, branching bronchi and cartilage · lungs are translucent; other organs and the external circuit are hidden for inspection. Airway surfaces show reference anatomy; bronchospasm is represented by the physiology and waveforms.</p>}
    <p className="muted small">Drag to orbit · pinch or scroll to zoom · tap the green/red circuit connector to disconnect or reconnect. Camera buttons restore their views.</p>
    <div className="actions"><button className="act" onClick={toggleCircuit}>{disconnected?'Reconnect 3D circuit':'Disconnect 3D circuit'}</button><button className="act" onClick={onVentilator}>Operate ventilator controls</button></div>
    {child && <p className="muted small">Pediatric scenario · {session.pt.p.weightKg} kg. The available whole-body 3D mesh is adult-derived and scaled; it is not a pediatric anatomical reference.</p>}
    <dl className="equipment-vitals">
      <div><dt>SpO₂</dt><dd>{Math.round(g.spo2*100)}%</dd></div>
      <div><dt>HR</dt><dd>{Math.round(g.hr)}/min</dd></div>
      <div><dt>MAP</dt><dd>{Math.round(g.map)} mmHg</dd></div>
      <div><dt>EtCO₂</dt><dd>{Math.round(g.etco2)} mmHg</dd></div>
    </dl>
    <p className="muted small">3D lung motion follows live simulated regional volume and collapse. Monitor values, ventilator controls and circuit faults share one physiology session. Motion is amplified for teaching and is not a validated bedside prediction.</p>
    {body && <p className="credit">3D patient anatomy: {body.mapping.attribution.creators} · <a href={body.mapping.attribution.licenseUrl} target="_blank" rel="noreferrer">{body.mapping.attribution.license}</a>. Airway: HRA Visible Human Male, CC BY 4.0. <a href="https://skfb.ly/oSHxK" target="_blank" rel="noreferrer">Medical Ventilator by lazarys</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · converted from USDZ; live training display added. Authored hanging hoses are static; the highlighted patient connection follows the simulated circuit fault. Device markings are visual reference only. Stretcher, monitor and patient circuit remain original 3D prototypes. <span className="sr-only">Vte {Math.round(n.vte)} mL</span></p>}
  </div>;
}
