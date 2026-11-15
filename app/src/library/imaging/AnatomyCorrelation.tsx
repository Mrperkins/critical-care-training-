/**
 * Spatial comparison of licensed, real patient imaging with this app's genuine HuBMAP/
 * BodyParts3D/Z-Anatomy reference meshes. Never imply registration across patients.
 *
 * Brain: real neuro scene, axial cut slider and anatomical deep structures.
 * Abdomen: real abdominal organs, camera focus by probe window/CT target.
 * Thorax/vascular: existing Atlas patient model focused on target organs.
 */
import { lazy, Suspense, useEffect, useState } from 'react';
import type { BodyAsset } from '../../asset/body';
import { loadBodyAsset } from '../../asset/body';
import { useNeuroUI, presetState } from '../../neuro/neuroStore';
import { useAbdUI, ABD_PRESETS } from '../../abdomen/abdomenStore';
import { DISEASE_BY_ID } from '../../atlas/registry';
import { diseaseState } from '../../atlas/engine';
import type { ImagingModality } from './catalog';
import type { ImagingLesson } from './courseCurriculum';
import type { RealItem } from '../../scene/imaging/RealExamples';

const NeuroScene = lazy(() => import('../../neuro/NeuroScene').then(m => ({ default: m.NeuroScene })));
const AbdomenScene = lazy(() => import('../../abdomen/AbdomenScene').then(m => ({ default: m.AbdomenScene })));
const AtlasPatientScene = lazy(() => import('../../atlas/PatientScene'));
const SpineReference = lazy(() => import('./SpineReference').then(m=>({default:m.SpineReference})));
const NeckReference = lazy(() => import('./NeckReference').then(m=>({default:m.NeckReference})));

function useBody(): { body: BodyAsset | null; error: boolean } {
  const [body, setBody] = useState<BodyAsset | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let mounted=true;
    loadBodyAsset().then(value => { if (mounted) setBody(value); }).catch(() => { if (mounted) setError(true); });
    return () => { mounted=false; };
  }, []);
  return { body, error };
}

function BrainReference({ plane }: { plane?: ImagingLesson['plane'] }) {
  const {body,error}=useBody();
  const [slice,setSlice]=useState(-0.15);
  useEffect(() => {
    const store=useNeuroUI.getState();
    const previous = {preset:store.preset,state:store.state,cut:store.cut,glass:store.glass,deep:store.deep,slice:store.slice,target:store.target,playing:store.playing,view:store.view};
    store.set({preset:'none',state:presetState('none'),cut:true,glass:false,deep:true,slice:-0.15,target:'brain.whole',playing:false,view:'3d'});
    return () => useNeuroUI.getState().set(previous);
  }, []);
  const move=(v:number)=>{setSlice(v);useNeuroUI.getState().set({slice:v,cut:true,target:'brain.whole'});};
  return <>
    <div className="imc-model-viewport" aria-label="Interactive 3D reference brain with axial section">
      {error ? <p role="status">3D reference anatomy unavailable.</p> : !body ? <p>Loading original 3D brain model…</p> : <Suspense fallback={<p>Preparing 3D cross section…</p>}><NeuroScene body={body}/></Suspense>}
    </div>
    {plane === 'axial' && <label className="imc-slice-slider">Axial section through reference brain
      <input aria-label="3D reference axial slice level" type="range" min={-0.45} max={0.3} step={0.05} value={slice} onChange={e=>move(Number(e.target.value))}/>
      <span>{slice < -0.30 ? 'Brainstem' : slice < -0.03 ? 'Basal ganglia' : slice < 0.19 ? 'Ventricular level' : 'High cortex'} · schematic correspondence</span>
    </label>}
    {plane !== 'axial' && <p className="imc-model-note">3D section is illustrative; use the original image labels for scan plane and laterality.</p>}
  </>;
}

function AbdomenReference({ lesson, modality, study }: {lesson:ImagingLesson;modality:ImagingModality;study?:RealItem}) {
  const {body,error}=useBody();
  const cue = `${study?.id ?? ''} ${study?.kind ?? ''}`.toLowerCase();
  const target = /aorta|aaa|dissection|ivc/.test(cue) || /aorta|aaa|dissection/.test(lesson.anatomy) ? 'abdomen.aorta'
    : /pelvis|suprapubic/.test(cue) ? 'abdomen.pelvis'
    : /luq|splen|left.upper/.test(cue) ? 'abdomen.luq'
    : /ruq|hepato|right.upper/.test(cue) ? 'abdomen.ruq'
    : /spleen|splen|trauma|hemorrhage|abdfluid/.test(lesson.id+' '+lesson.title) ? 'abdomen.luq'
    : /pelvis/.test(lesson.title) ? 'abdomen.pelvis' : 'abdomen.ruq';
  const [focused,setFocused]=useState(true);
  useEffect(() => {
    const state=useAbdUI.getState();
    const before={preset:state.preset,base:state.base,minutes:state.minutes,target:state.target,labels:state.labels,view:state.view};
    state.set({preset:'normal',base:ABD_PRESETS[0].make(),minutes:0,target,labels:true,view:'3d'});
    return () => useAbdUI.getState().set(before);
  }, [target]);
  return <>
    <div className="imc-model-viewport" aria-label="Interactive 3D anatomy of abdomen showing organ reference">
      <span className="imc-window-label">{target==='abdomen.aorta'?'Aorta/IVC landmark':target==='abdomen.luq'?'LUQ / splenorenal window':target==='abdomen.pelvis'?'Pelvic acoustic window':'RUQ / hepatorenal window'} · approximate</span>
      {error ? <p role="status">3D reference anatomy unavailable.</p> : !body ? <p>Loading original 3D abdominal anatomy…</p> : <Suspense fallback={<p>Loading anatomical model…</p>}><AbdomenScene body={body}/></Suspense>}
    </div>
    <div className="imc-model-toolbar">
      <button aria-pressed={focused} onClick={()=>{setFocused(true);useAbdUI.getState().set({target});}}>Focus organ/window</button>
      <button aria-pressed={!focused} onClick={()=>{setFocused(false);useAbdUI.getState().set({target:'abdomen.whole'});}}>Whole abdomen</button>
    </div>
    <p className="imc-model-note">{modality==='ultrasound'?'Probe-window location is conceptual. Ultrasound is a narrow 2D acoustic slice, not a projection of this full 3D model.':'The 3D organs orient you spatially; this is not a segmentation or reconstruction of the patient’s CT.'}</p>
  </>;
}

function AtlasReference({lesson,modality}:{lesson:ImagingLesson;modality:ImagingModality}) {
  const disease = DISEASE_BY_ID[lesson.anatomy] ?? DISEASE_BY_ID['pneumonia'];
  const [focus,setFocus]=useState(true);
  const target=focus?disease.target:'body.whole';
  return <>
    <div className="imc-model-viewport" aria-label="Interactive 3D organ model from app condition atlas">
      <Suspense fallback={<p>Loading original 3D anatomy…</p>}>
        <AtlasPatientScene disease={disease} state={diseaseState(disease,0)} target={target} />
      </Suspense>
    </div>
    <div className="imc-model-toolbar">
      <button aria-pressed={focus} onClick={()=>setFocus(true)}>Focus region</button>
      <button aria-pressed={!focus} onClick={()=>setFocus(false)}>Whole body</button>
    </div>
    <p className="imc-model-note">{modality==='xray'?'Three-dimensional reference anatomy shows physical structures, not radiographic attenuation.':'The model indicates the anatomical region and probe access, not the patient’s true acquisition plane or measured pathology.'}</p>
  </>;
}

export function AnatomyCorrelation({lesson,modality,study}:{lesson:ImagingLesson;modality:ImagingModality;study?:RealItem}) {
  const kind=study?.kind;
  const spineMri = modality==='mri' && /epidural|lumbar/.test(study?.id??'');
  const brain = !spineMri && (modality==='mri' || (modality==='ct' && /^(lvo|ich|tbi)$/.test(lesson.anatomy)));
  const cardiacUs=modality==='ultrasound' && (kind==='tamponade'||/pericardial/.test(study?.id??''));
  const neckUs=modality==='ultrasound' && kind==='ijv';
  const abdominal = !brain && !spineMri && !cardiacUs && (modality==='ct' || kind==='fast' || kind==='aorta-us' || kind==='ivc' || ['abdominal-hemorrhage','aaa','rupturing-aaa','aortic-dissection'].includes(lesson.anatomy));
  return <div className="imc-reference-3d">
    <div className="imc-media-topline"><span>Reference anatomy · actual app 3D model</span><span>Illustrative; different patient</span></div>
    {spineMri?<SpineReference/>:neckUs?<NeckReference/>:brain?<BrainReference key={lesson.id} plane={lesson.plane}/>:abdominal?<AbdomenReference key={study?.id??lesson.id} lesson={lesson} modality={modality} study={study}/>:<AtlasReference key={lesson.id} lesson={lesson} modality={modality}/>}
    {spineMri && <p className="imc-model-note">Spinal MRI: the selected lumbar vertebrae come from the app's BodyParts3D skeleton. No reconstructed canal, collection, or patient-specific MRI registration is claimed.</p>}
    <p className="imc-compare-disclaimer">No pixel-level registration or patient-specific 3D reconstruction is claimed. Compare organ position, orientation and structural relationships only. The probe plane is not tracked or synchronized to the source video.</p>
  </div>;
}
