import {useEffect,useState} from 'react';
import {loadReal,type RealItem} from '../scene/imaging/RealExamples';
import {RealCaseCard} from '../scene/imaging/RealCase';
/** Selected real studies are visible during the lecture, without a quiz or reveal step. */
export default function ConferenceMedia({ids}:{ids:string[]}){
  const [items,setItems]=useState<RealItem[]>([]),[loaded,setLoaded]=useState(false);
  useEffect(()=>{let active=true;setItems([]);setLoaded(false);loadReal().then(all=>{if(active){setItems(ids.flatMap(id=>all.filter(it=>it.id===id)));setLoaded(true);}});return()=>{active=false;};},[ids]);
  return <section className="conference-comparisons" aria-label="Real diagnostic comparison studies">
    <p className="conference-reference-note">Real studies from separate patients · Illustrate the diagnosis; these are not the synthetic patient’s images.</p>
    {items.map(it=><RealCaseCard key={it.id} it={it} teachingMode/>)}
    {loaded&&items.length!==ids.length&&<p role="status">A comparison study is unavailable. The narrated image description remains in the transcript.</p>}
    {!loaded&&<p role="status">Loading attributed diagnostic studies…</p>}
  </section>;
}
