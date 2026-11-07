/** Native 3D right-IJ and carotid reference for ultrasound-guided access.
 * Reuses the app's original LinesScene, anatomy, vessel paths and catheter models.
 * This reference is not derived from the real ultrasound patient's anatomy.
 */
import { lazy, Suspense, useEffect, useState } from 'react';
import { loadBodyAsset, type BodyAsset } from '../../asset/body';
import { loadLinesAsset, type LinesAsset } from '../../asset/lines';
import { useLinesUI, type LinesView } from '../../lines/linesStore';

const LinesScene=lazy(()=>import('../../lines/LinesScene').then(m=>({default:m.LinesScene})));
type Assets={body:BodyAsset;lines:LinesAsset};
export function NeckReference(){
 const [assets,setAssets]=useState<Assets|null>(null);
 const [error,setError]=useState(false);
 const [view,setView]=useState<LinesView>('neck');
 useEffect(()=>{
  let on=true;
  Promise.all([loadBodyAsset(),loadLinesAsset()]).then(([body,lines])=>{if(on)setAssets({body,lines});}).catch(()=>{if(on)setError(true)});
  const ui=useLinesUI.getState();const prior={view:ui.view,skin:ui.skin,labels:ui.labels};
  ui.set({view:'neck',skin:'see',labels:true});
  return()=>{on=false;useLinesUI.getState().set(prior);};
 },[]);
 const select=(next:LinesView)=>{setView(next);useLinesUI.getState().set({view:next});};
 return <>
   <div className="imc-model-viewport" aria-label="Original interactive three-dimensional right internal jugular and carotid vessel model">
     {!assets? <p role="status">{error?'Original 3D vascular anatomy could not load.':'Loading original internal jugular anatomy…'}</p>:
       <Suspense fallback={<p>Preparing source model…</p>}><LinesScene body={assets.body} asset={assets.lines}/></Suspense>}
   </div>
   <div className="imc-model-toolbar" role="group" aria-label="Vascular anatomy viewpoint">
     <button aria-pressed={view==='neck'} onClick={()=>select('neck')}>IJ and carotid detail</button>
     <button aria-pressed={view==='vessels'} onClick={()=>select('vessels')}>Vessel pathways</button>
   </div>
   <p className="imc-model-note">The right internal jugular central-line insertion, carotid artery and superior vena cava are shown using the app's reference body and vessel path model. Actual vein and artery positions vary considerably; verify the real ultrasound image and probe orientation before any procedure.</p>
   {assets&&<p className="imc-model-note">3D anatomy: {assets.lines.mapping.attribution.creators}. <a href={assets.lines.mapping.attribution.licenseUrl} target="_blank" rel="noreferrer">{assets.lines.mapping.attribution.license}</a>. {assets.lines.mapping.attribution.changes}</p>}
 </>;
}
