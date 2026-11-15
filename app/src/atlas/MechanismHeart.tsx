import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { loadHeartHD, type Layer, type HeartHDMapping } from '../asset/anatomy';
import type { DiseaseState } from './types';
import { chamberScale } from './mechanismPose';
/** Existing HuBMAP chambers in their original body frame. Scaling illustrates filling/strain, not beat mechanics. */
export function MechanismHeart({ diseaseId, state, onReady }: {diseaseId:string;state:DiseaseState;onReady:()=>void}) {
  const [asset,setAsset] = useState<Layer<HeartHDMapping>|null>(null);
  useEffect(()=> { let cancelled=false; loadHeartHD().then(a=>{if(!cancelled){setAsset(a);onReady();}}).catch(()=>undefined); return ()=>{cancelled=true;}; },[onReady]);
  const parts = useMemo(()=>asset ? ['lv','rv','la','ra'].filter(id=>asset.meshes[id]).map(id=> {
    const geometry=asset.meshes[id].geometry.clone();geometry.computeBoundingBox();const center=geometry.boundingBox!.getCenter(new THREE.Vector3());geometry.translate(-center.x,-center.y,-center.z);
    return {id,geometry,center};
  }):[],[asset]);
  useEffect(()=>()=>parts.forEach(p=>p.geometry.dispose()),[parts]);
  return <group>{parts.map(p=><mesh key={p.id} geometry={p.geometry} position={p.center} scale={chamberScale(p.id,diseaseId,state)} dispose={null}><meshStandardMaterial color={p.id==='rv'||p.id==='ra'?'#677da5':'#ad626d'} roughness={.58} transparent opacity={.86}/></mesh>)}</group>;
}
