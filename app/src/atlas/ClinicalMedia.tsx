import { useEffect, useState } from 'react';
import { loadReal, type RealItem } from '../scene/imaging/RealExamples';
import { RealCaseCard } from '../scene/imaging/RealCase';
import { ATLAS_MEDIA } from './media';

export default function ClinicalMedia({ diseaseId }: { diseaseId:string }) {
  const reference=ATLAS_MEDIA[diseaseId];
  const [items,setItems]=useState<RealItem[]>([]), [index,setIndex]=useState(0), [loaded,setLoaded]=useState(false);
  useEffect(()=>{let active=true; setLoaded(false);setIndex(0);setItems([]);loadReal().then(all=>{if(active){setItems(reference.ids.flatMap(id=>all.filter(item=>item.id===id)));setLoaded(true);}});return()=>{active=false;};},[reference]);
  return <section className="atlas-media"><p>{reference.context}</p><p className="muted small">A separate reference patient, not a predicted image for this model.</p>
    {items.length>1 && <label>Reference image<select value={index} onChange={e=>setIndex(+e.target.value)}>{items.map((it,i)=><option key={it.id} value={i}>{it.title}</option>)}</select></label>}
    {items[index] ? <RealCaseCard key={items[index].id} it={items[index]} /> : <p>{loaded?'Reference media unavailable offline.':'Loading attributed clinical media…'}</p>}
  </section>;
}
