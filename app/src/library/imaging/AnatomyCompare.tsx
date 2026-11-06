/**
 * Real clinical ultrasound video/still or CT/MRI image alongside the app's existing
 * interactive HuBMAP anatomy scene. The model is a teaching reference NOT a
 * patient-matched scan reconstruction or a registered slice/probe plane.
 */
import {lazy, Suspense, useState} from 'react';
import type {RealItem} from '../../scene/imaging/RealExamples';
import {DISEASE_BY_ID} from '../../atlas/registry';
import {diseaseState} from '../../atlas/engine';
import type {ImagingLesson} from './courseCurriculum';
import {isRemoteStudy, modalityOf, sourceFor} from './catalog';

const PatientScene = lazy(() => import('../../atlas/PatientScene'));

const MODEL_FOR_KIND:Readonly<Record<string,string>> = {
 'xray':'ards','cxr':'ards','peds-xray':'pneumonia','ptx':'simple-pneumothorax','ptxseries':'simple-pneumothorax',
 'ct-ischemic':'lvo','ct-ich':'ich','ct-aorta':'aaa','mri':'lvo',
 'lus':'ards','ptxlus':'simple-pneumothorax','pleuraleff':'pneumonia',
 'fast':'abdominal-hemorrhage','ivc':'cardiogenic-shock','ijv':'obstructive-shock','aorta-us':'aaa','tamponade':'tamponade'
};
function diseaseFor(it:RealItem, lesson?:ImagingLesson) {
  const id = lesson?.anatomy ?? MODEL_FOR_KIND[it.kind] ?? (modalityOf(it)==='ultrasound'?'abdominal-hemorrhage':'ards');
  return DISEASE_BY_ID[id] ?? DISEASE_BY_ID.ards;
}
function viewOf(it:RealItem) {
  return it.modality || (modalityOf(it)==='ultrasound'?'Ultrasound':modalityOf(it)==='ct'?'CT':modalityOf(it)==='mri'?'MRI':'X-ray');
}
function MediaPane({it}:{it:RealItem}) {
  const movie = it.file.endsWith('.mp4');
  const hasStill = !!it.poster && movie;
  const [still,setStill] = useState(false);
  const [failure,setFailure] = useState(false);
  const [playing,setPlaying] = useState(false);
  return <section className="img-correlation-panel" aria-label="Real clinical imaging">
    <div className="img-correlation-top"><b>Real patient · {viewOf(it)}</b>
      {hasStill && <div className="img-view-switch" role="group" aria-label="Ultrasound clip or still">
        <button aria-pressed={!still} onClick={()=>setStill(false)}>Motion</button>
        <button aria-pressed={still} onClick={()=>setStill(true)}>Still</button>
      </div>}
    </div>
    <div className="img-correlation-frame">
      {failure ? <p role="status">This clinical study could not load. <a href={it.provenance?.pageUrl ?? it.source} target="_blank" rel="noreferrer">View original source</a>.</p>
      : movie && !still ? <video key={it.id} poster={it.poster?sourceFor(it.poster):undefined} controls playsInline muted loop preload="metadata"
        onError={()=>setFailure(true)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}
        aria-label={it.title}><source src={sourceFor(it.file)} type="video/mp4"/>{it.webm && <source src={sourceFor(it.webm)} type="video/webm"/>}</video>
      : <img key={it.id} src={sourceFor(movie ? it.poster! : it.file)} onError={()=>setFailure(true)}
        alt={it.caption} loading="lazy"/>}
    </div>
    <p className="img-correlation-caption"><b>{it.title}.</b> {it.caption}</p>
    {movie && !still && <p className="img-correlation-hint">{playing?'Use pause or scrub to inspect motion.':'Paused. Move through frames to inspect anatomy.'} Original clip preserved.</p>}
    <p className="img-correlation-license">{it.credit ?? it.author+' · '+it.license} · <a href={it.provenance?.pageUrl ?? it.source} target="_blank" rel="noreferrer">Original</a> · <a href={it.licenseUrl} target="_blank" rel="noreferrer">License</a></p>
  </section>;
}

function AnatomyPane({it,lesson}:{it:RealItem;lesson?:ImagingLesson}) {
  const disease=diseaseFor(it,lesson);
  const [view,setView]=useState<'focused'|'whole'>('focused');
  const [active,setActive]=useState(true);
  const plane = lesson?.plane ?? (modalityOf(it)==='ct'||modalityOf(it)==='mri'?'axial':'surface');
  return <section className="img-correlation-panel" aria-label="Three-dimensional anatomy correlation">
    <div className="img-correlation-top"><b>3D reference anatomy</b>
      <div className="img-view-switch" role="group" aria-label="Anatomy view">
        <button aria-pressed={view==='focused'} onClick={()=>setView('focused')}>Focus</button>
        <button aria-pressed={view==='whole'} onClick={()=>setView('whole')}>Whole</button>
      </div>
    </div>
    <div className="img-model-frame">
      {active?<div className="img-model-inner"><Suspense fallback={<p className="loading">Loading app's 3D anatomy model…</p>}>
          <PatientScene key={disease.id} disease={disease} state={diseaseState(disease,0)} target={view==='whole'?'body.whole':disease.target}/>
        </Suspense></div>:
        <div className="img-model-placeholder">3D model paused to save graphics resources.</div>}
    </div>
    <div className="img-correlation-legend"><span>Anatomical topic: <b>{disease.title}</b></span><span>Reference plane: <b>{plane}</b></span></div>
    {lesson?.probe && <p className="img-correlation-hint"><b>Probe/approach:</b> {lesson.probe}</p>}
    <p className="img-correlation-disclaimer">Spatial reference only: this is a rotatable anatomy model, not a voxel-based reconstruction of this patient's scan, not a tracked probe, and not a slice-synchronized representation. Organ sizes and pathology in the model are illustrative. Use the clinical image for actual findings.</p>
    <button className="lib-link" onClick={()=>setActive(x=>!x)}>{active?'Pause 3D rendering':'Resume 3D anatomy'}</button>
  </section>;
}
export function AnatomyCompare({it,lesson}:{it:RealItem;lesson?:ImagingLesson}){
  return <div className="img-correlation" aria-label="Side-by-side clinical image and interactive 3D anatomy">
    <MediaPane key={it.id} it={it}/>
    <AnatomyPane key={lesson?.id??it.id} it={it} lesson={lesson}/>
  </div>;
}
