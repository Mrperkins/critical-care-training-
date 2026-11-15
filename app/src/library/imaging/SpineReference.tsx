/** Real vertebral meshes from BodyParts3D (the app's skeleton.glb), not a generated MRI or canal segmentation.
 * The highlighted vertebral level is illustrative; no patient image registration is implied.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CameraControls } from '@react-three/drei';
import { loadSkeleton, SPINE, type Layer } from '../../asset/anatomy';
import { StudioCanvas } from '../../scene/Studio';

type Skel = Awaited<ReturnType<typeof loadSkeleton>>;
const LUMBAR = ['L1', 'L2', 'L3', 'L4', 'L5'] as const;
type Level = typeof LUMBAR[number];
function Rig({level}:{level:Level}) {
  const controls=useRef<CameraControls>(null);
  useEffect(()=>{
    const y={L1:2.95,L2:2.646,L3:2.32,L4:2.009,L5:1.659}[level];
    controls.current?.setLookAt(2.9,y+0.15,-6.4,0,y,-0.35,true);
  },[level]);
  return <CameraControls ref={controls} makeDefault minDistance={1.8} maxDistance={14} smoothTime={0.55} />;
}
function Vertebrae({asset,level}:{asset:Skel;level:Level}) {
  const materials=useMemo(()=>({
    bone:new THREE.MeshStandardMaterial({color:'#cbbfad',roughness:.7,transparent:true,opacity:.42,depthWrite:false}),
    focus:new THREE.MeshStandardMaterial({color:'#e7d8b4',roughness:.42,emissive:'#8c6744',emissiveIntensity:.12,metalness:.02}),
  }),[]);
  useEffect(()=>()=>{materials.bone.dispose();materials.focus.dispose()},[materials]);
  const ids=SPINE.filter(id=>!!asset.meshes[id]);
  const current=LUMBAR.indexOf(level);
  const highlight=new Set<string>([level,...(current<4?[LUMBAR[current+1]]:[])]);
  return <group>{ids.map(id=><mesh key={id} geometry={asset.meshes[id].geometry} material={highlight.has(id)?materials.focus:materials.bone} dispose={null}/>)}</group>;
}
export function SpineReference(){
  const [asset,setAsset]=useState<Skel|null>(null);
  const [error,setError]=useState(false);
  const [level,setLevel]=useState<Level>('L4');
  useEffect(()=>{let alive=true;loadSkeleton().then(s=>{if(alive)setAsset(s)}).catch(()=>{if(alive)setError(true)});return()=>{alive=false}},[]);
  return <>
    <div className="imc-model-viewport" aria-label="Actual 3D lumbar vertebrae from the app skeleton model">
      {error?<p role="status">Source skeleton could not be loaded. The MRI remains accessible on the left.</p>:
        !asset?<p role="status">Loading original vertebral meshes…</p>:
        <StudioCanvas camera={{position:[3.1,2.5,-7.5],fov:35}} fog={false} label="Three dimensional vertebral anatomy, not reconstructed from this MRI">
          <Vertebrae asset={asset} level={level}/>
          <Rig level={level}/>
        </StudioCanvas>}
    </div>
    <label className="imc-slice-slider">Explore the lumbar vertebral level
      <select value={level} onChange={e=>setLevel(e.target.value as Level)} aria-label="Vertebral level">{LUMBAR.map(x=><option key={x} value={x}>{x}</option>)}</select>
      <span>{level}{level==='L5'?' to sacrum':`–L${Number(level[1])+1}`} highlighted · real vertebral surfaces, schematic level selection</span>
    </label>
    <p className="imc-model-note">The vertebral column shows bony landmarks only. Epidural fluid, thecal sac compression and nerve roots are visible on the original MRI, not in this 3D reference. No MRI slice or patient-specific lesion has been inferred.</p>
    <p className="imc-model-note">Vertebral geometry: BodyParts3D 3.0, © Database Center for Life Science, <a href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en" target="_blank" rel="noreferrer">CC BY-SA 2.1 Japan</a>. Converted and fitted to the app's reference body, then simplified. <a href="https://doi.org/10.18908/lsdba.nbdc00837-000" target="_blank" rel="noreferrer">Original dataset</a>.</p>
  </>;
}
