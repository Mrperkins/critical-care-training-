import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { session } from './session';
import { ventNumbers } from './numbers';

/** A live display texture on the physical 3D screen, not a substitute equipment illustration. */
export function EquipmentScreen({ kind, position, size }: { kind: 'vent' | 'monitor'; position: [number,number,number]; size: [number,number] }) {
  const canvas = useMemo(() => { const c = document.createElement('canvas'); c.width=640; c.height=440; return c; }, []);
  const texture = useMemo(() => { const t = new THREE.CanvasTexture(canvas); t.colorSpace=THREE.SRGBColorSpace; return t; }, [canvas]);
  const elapsed = useRef(1);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame((_, dt) => {
    elapsed.current += dt; if (elapsed.current < .2) return; elapsed.current=0;
    const ctx=canvas.getContext('2d'); if (!ctx) return;
    const n=ventNumbers(session), g=session.snap;
    ctx.fillStyle='#05151f'; ctx.fillRect(0,0,640,440);
    ctx.font='24px monospace'; ctx.fillStyle='#a7c5ce';
    ctx.fillText(kind==='vent'?`ASTRA  |  ${session.m.s.mode}`:'BEDSIDE MONITOR',24,38);
    const rows=kind==='vent'?[['Ppeak',n.pip.toFixed(0),'cmH2O'],['Vte',n.vte.toFixed(0),'mL'],['PEEP',n.peep.toFixed(0),'cmH2O']]:[['HR',g.hr.toFixed(0),'/min'],['SpO2',(g.spo2*100).toFixed(0),'%'],['MAP',g.map.toFixed(0),'mmHg']];
    rows.forEach(([label,value,unit],i)=>{
      const y=92+i*95; ctx.fillStyle=['#99d9b3','#8ac9e7','#ecc28a'][i]; ctx.font='20px monospace'; ctx.fillText(label,24,y);
      ctx.font='bold 48px monospace'; ctx.fillText(value,24,y+48); ctx.font='18px monospace'; ctx.fillText(unit,150,y+48);
    });
    // The ventilator traces read the actual ring buffer used by the separate scalar view.
    if(kind==='vent') ['paw','flow','vol'].forEach((key,row)=>{
      ctx.strokeStyle=['#99d9b3','#8ac9e7','#ecc28a'][row]; ctx.lineWidth=2; ctx.beginPath();
      const data=session[key as 'paw'|'flow'|'vol']; const length=Math.min(session.count,600);
      for(let i=0;i<length;i++) { const index=(session.head-length+i+data.length)%data.length; const x=285+i/Math.max(1,length-1)*325; const scale=row===0?1.1:row===1?30:65; const y=130+row*95-data[index]*scale; if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y); } ctx.stroke();
    });
    else { ctx.font='24px monospace';ctx.fillStyle='#8ac9e7';ctx.fillText(`EtCO2 ${g.etco2.toFixed(0)}`,320,140);ctx.fillText('mmHg',320,175); }
    ctx.fillStyle=session.circuitFault==='none'?'#aac1cc':'#f3ae8d';ctx.font='20px monospace';ctx.fillText(session.circuitFault==='none'?'LIVE SIMULATED VALUES':`CIRCUIT: ${session.circuitFault.toUpperCase()}`,24,408);
    texture.needsUpdate=true;
  });
  return <mesh position={position}><planeGeometry args={size}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>;
}
