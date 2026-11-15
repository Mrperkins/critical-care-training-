/** Actual real clinical media beside the app's anatomical model. No scan-to-model registration. */
import { Suspense, useState } from 'react';
import type {RealItem} from '../../scene/imaging/RealExamples';
import type {ImagingLesson} from './courseCurriculum';
import {modalityOf, sourceFor, needsMirrorFallback} from './catalog';
import {AnatomyCorrelation} from './AnatomyCorrelation';

function MediaPane({it}:{it:RealItem}) {
  const movie=it.file.endsWith('.mp4');
  const [still,setStill]=useState(false);
  const [failed,setFailed]=useState(false);
  const [original,setOriginal]=useState(false);
  const fileSrc=(file:string)=>original && needsMirrorFallback(file) ? file : sourceFor(file);
  const mediaError=()=>{if(!original && needsMirrorFallback(it.file))setOriginal(true);else setFailed(true);};
  const [playing,setPlaying]=useState(false);
  const poster=it.poster||(!movie?it.file:null);
  return <section className="img-correlation-panel" aria-label="Real clinical imaging">
    <div className="img-correlation-top"><b>Real clinical image or clip</b>
      {movie&&poster&&<div className="img-view-switch" role="group" aria-label="Ultrasound clip or freeze-frame">
        <button aria-pressed={!still} onClick={()=>{setStill(false);setFailed(false)}}>Motion</button>
        <button aria-pressed={still} onClick={()=>{setStill(true);setFailed(false)}}>Still</button>
      </div>}
    </div>
    <div className="img-correlation-frame">
      {failed?<p role="status">This original study could not load. <a href={it.provenance?.pageUrl??it.licenseUrl} target="_blank" rel="noreferrer">View source</a></p>
        :movie&&!still?<video key={it.id} poster={poster?fileSrc(poster):undefined} controls muted playsInline loop preload="metadata"
          onError={mediaError} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} aria-label={'Real ultrasound: '+it.title}>
          {it.webm&&<source src={fileSrc(it.webm)} type="video/webm"/>}
          <source src={fileSrc(it.file)} type="video/mp4"/>
          </video>:poster?<img src={fileSrc(poster)} alt={it.title} onError={mediaError} loading="lazy"/>:<p>No still provided for this clip.</p>}
    </div>
    <p className="img-correlation-caption"><b>{it.title}.</b> {it.caption}</p>
    {movie&&!still&&<p className="img-correlation-hint">{playing?'Pause, replay or scrub to examine motion.':'Play the clip and inspect the entire sequence; still frames cannot show sliding or collapse reliably.'}</p>}
    <p className="img-correlation-license">{it.credit??it.author+' · '+it.license} · <a href={it.provenance?.pageUrl??it.licenseUrl} target="_blank" rel="noreferrer">Original source</a> · <a href={it.licenseUrl} target="_blank" rel="noreferrer">License</a></p>
  </section>;
}

export function AnatomyCompare({it,lesson}:{it:RealItem;lesson:ImagingLesson}){
  const modality=modalityOf(it)??'ultrasound';
  return <div className="img-correlation" aria-label="Real clinical image alongside interactive 3D anatomy">
    <MediaPane key={it.id} it={it}/>
    <Suspense fallback={<section className="img-correlation-panel" role="status">Loading the app's 3D anatomy…</section>}>
      <AnatomyCorrelation key={`${lesson.id}:${it.id}`} lesson={lesson} modality={modality} study={it}/>
    </Suspense>
  </div>;
}
