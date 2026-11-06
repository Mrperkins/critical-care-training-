/**
 * Course-grade clinical imaging education: read, acquire, compare real media with
 * spatial 3D anatomy, perform guided search and independently check understanding.
 * Practice bank is still available, but no longer substitutes for a course.
 */
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { openLibrary } from '../launch';
import type { RealItem } from '../../scene/imaging/RealExamples';
import { loadImagingStudies, modalityOf, MODALITY_LABEL, sourceFor, type ImagingModality } from './catalog';
import { COURSE_FOR_MODULE, IMAGING_COURSES, IMAGING_COURSE_BY_ID, type ImagingCourse, type ImagingLesson } from './courseCurriculum';
import { ImagingTrainer } from './ImagingTrainer';
import { MODULE_BY_ID } from '../modules';

const AnatomyCorrelation = lazy(() => import('./AnatomyCorrelation').then(m=>({default:m.AnatomyCorrelation})));
type Progress = Record<string,{answered:number;correct:boolean;at:string}>;
const SAVE = 'ccp.imaging.courses.v1';
function stored():Progress {
  try { const v=JSON.parse(globalThis.localStorage?.getItem(SAVE)||'{}');return v && typeof v==='object' && !Array.isArray(v)?v:{}; }
  catch{return{};}
}
function keep(v:Progress){try{globalThis.localStorage?.setItem(SAVE,JSON.stringify(v));}catch{/* storage not available */}}
const keyFor=(course:string,lesson:string)=>course+':'+lesson;
const isUltrasound=(it:RealItem)=>modalityOf(it)==='ultrasound';
const isClip=(it:RealItem)=>it.file.endsWith('.mp4');
function ClinicalMedia({it,mode}:{it:RealItem;mode:'video'|'still'}) {
  const [broken,setBroken]=useState(false);
  const still=it.poster||(!isClip(it)?it.file:null);
  return <div className="imc-real-media">
    {broken?<div className="img-unavailable" role="status">Media unavailable. <a href={it.provenance?.pageUrl||it.licenseUrl} target="_blank" rel="noreferrer">Open original source</a></div>
      : mode==='video' && isClip(it) ?
      <video key={it.file} controls playsInline muted preload="metadata" loop poster={still?sourceFor(still):undefined}
        onError={()=>setBroken(true)} aria-label={'Clinical ultrasound video: '+it.title}>
        {it.webm && <source src={sourceFor(it.webm)} type="video/webm"/>}
        <source src={sourceFor(it.file)} type="video/mp4"/>
        Video unavailable; use the still image.
      </video> : still ? <img src={sourceFor(still)} alt={it.title} loading="lazy" decoding="async" onError={()=>setBroken(true}/> :
      <span role="status">A still is not available for this clip.</span>}
  </div>;
}
function RealMediaLibrary({ids,items,modality}:{ids:readonly string[];items:readonly RealItem[];modality:ImagingModality}) {
  const resolved=useMemo(()=>{
    const map=new Map(items.map(x=>[x.id,x]));
    return ids.map(id=>map.get(id)).filter((x):x is RealItem=>!!x);
  },[ids,items]);
  const [index,setIndex]=useState(0);
  const selected=resolved[Math.min(index,resolved.length-1)];
  const [view,setView]=useState<'video'|'still'>('video');
  useEffect(()=>{setIndex(0);setView('video');},[ids.join('|')]);
  if(!selected) return <div className="imc-media-missing" role="status">No licensed image is currently available for this lesson. Continue with the source reading and 3D anatomy.</div>;
  const canStill=!!selected.poster||!isClip(selected);
  const canVideo=isClip(selected);
  return <div className="imc-clinical-pane" aria-label="Real clinical image or ultrasound video">
    <div className="imc-media-topline"><span>Actual clinical {modality==='ultrasound'?'ultrasound':'imaging'} · source study</span><span>{index+1} / {resolved.length}</span></div>
    <div className="imc-media-choice" role="group" aria-label="Choose clinical example">
      {resolved.map((it,i)=><button key={it.id} className={index===i?'on':''} aria-pressed={index===i} onClick={()=>{setIndex(i);setView('video')}}>
        {i+1}. {it.title}
      </button>)}
    </div>
    {canVideo && canStill && <div className="imc-media-tabs" role="group" aria-label="Display video clip or still">
      <button aria-pressed={view==='video'} onClick={()=>setView('video')}>Moving ultrasound clip</button>
      <button aria-pressed={view==='still'} onClick={()=>setView('still')}>Freeze-frame still</button>
    </div>}
    <ClinicalMedia key={selected.id+':'+view} it={selected} mode={canVideo?view:'still'}/>
    <p className="imc-source-caption">{selected.credit||selected.author+' · '+selected.license} · <a href={selected.provenance?.pageUrl||selected.licenseUrl} target="_blank" rel="noreferrer">Original / license</a></p>
    <p className="imc-source-warning">Different real patient from the model. The asset may contain annotations from its original published source; those are not measurements of the simulated patient.</p>
  </div>;
}
function Check({course,lesson,onDone,progress}:{course:ImagingCourse;lesson:ImagingLesson;onDone:(answer:number)=>void;progress:Progress}){
  const [picked,setPicked]=useState<number|null>(null);
  const [show,setShow]=useState(false);
  const question=lesson.check;
  const k=keyFor(course.id,lesson.id);
  const prior=progress[k];
  useEffect(()=>{setPicked(null);setShow(false)},[k]);
  return <section className="imc-check" aria-label="Knowledge checkpoint">
    <div><p className="lib-kicker">Knowledge checkpoint · {prior?'previously completed':'ready to try'}</p><h3>{question.q}</h3></div>
    <div className="imc-options">
      {question.choices.map((v,i)=><button key={v} className={picked===i?'on':''} aria-pressed={picked===i}
        disabled={show} onClick={()=>setPicked(i)}>{String.fromCharCode(65+i)}. {v}</button>)}
    </div>
    {!show?<button className="lib-btn primary" disabled={picked===null} onClick={()=>{if(picked!==null){setShow(true);onDone(picked);}}}>Submit answer &amp; see explanation</button>
      : <div className={'imc-feedback'+(picked===question.answer?' correct':' review')} role="status">
        <b>{picked===question.answer?'Correct.':'Review this concept.'}</b>
        <p>{question.why}</p>
        <button className="lib-link" onClick={()=>{setPicked(null);setShow(false)}}>Try again</button>
      </div>}
  </section>;
}
function Chapter({course,lesson,items,progress,onDone,onPractice}:{course:ImagingCourse;lesson:ImagingLesson;items:RealItem[];progress:Progress;onDone:(answer:number)=>void;onPractice:()=>void}){
 const [showAnatomy,setShowAnatomy]=useState(true);
 const [showPitfalls,setShowPitfalls]=useState(true);
 return <div className="imc-chapter" key={lesson.id}>
   <header className="imc-chapter-intro"><p className="lib-kicker">{MODALITY_LABEL[course.modality]} · Guided teaching · ~8 min</p>
    <h2>{lesson.title}</h2><p>{lesson.goal}</p></header>
   <section className="imc-principles" aria-label="Clinical principles">
     <h3>Understand the finding</h3>{lesson.narrative.map((p,i)=><p key={i}>{p}</p>)}
   </section>
   <div className="imc-side-head">
      <div><h3>Match the clinical image to the anatomy</h3><p>Compare real images or motion on the left with the app’s interactive organ model on the right.</p></div>
      <button className="lib-link" onClick={()=>setShowAnatomy(v=>!v)} aria-expanded={showAnatomy}>{showAnatomy?'Hide 3D anatomy':'Show 3D anatomy'}</button>
   </div>
   {lesson.probe && <p className="imc-probe"><b>Probe / view:</b> {lesson.probe}. The displayed source may use a different machine preset or scanning plane.</p>}
   <div className={'imc-compare'+(showAnatomy?'':' imc-no-anatomy')}>
     <RealMediaLibrary key={lesson.id} ids={lesson.media} items={items} modality={course.modality}/>
     {showAnatomy && <Suspense fallback={<div className="imc-reference-3d" role="status">Loading source anatomy model…</div>}><AnatomyCorrelation key={lesson.id} lesson={lesson} modality={course.modality}/></Suspense>}
   </div>
   <section className="imc-sequence" aria-label="Guided interpretation method">
      <h3>How to perform the interpretation</h3>
      <ol>{lesson.method.map((p,i)=><li key={i}>{p}</li>)}</ol>
   </section>
   <section className="imc-pitfalls"><button className="imc-disclosure" aria-expanded={showPitfalls} onClick={()=>setShowPitfalls(v=>!v)}>
     <b>Common traps and clinical limits</b><span>{showPitfalls?'Hide':'Expand'}</span>
   </button>{showPitfalls&&<ul>{lesson.pitfalls.map((p,i)=><li key={i}>{p}</li>)}</ul>}</section>
   <Check course={course} lesson={lesson} onDone={onDone} progress={progress}/>
   <section className="imc-case-handoff"><div><b>Apply it to a real imaging case</b><p>Practice independently on a source-attributed study, then read the published findings and limitations.</p></div>
     <button className="lib-btn" onClick={onPractice}>Open interpretation cases</button></section>
 </div>
}
function CourseContents({course,progress,active,choose}:{course:ImagingCourse;progress:Progress;active:number;choose:(idx:number)=>void}) {
 return <aside className="imc-course-rail">
   <p className="lib-kicker">{course.level} · {course.minutes} min guided study</p>
   <h2>Course contents</h2>
   <ol>{course.lesson.map((l,i)=>{
    const done=progress[keyFor(course.id,l.id)]?.correct;
    return <li key={l.id}><button className={active===i?'on':''} aria-current={active===i?'step':undefined} onClick={()=>choose(i)}>
      <span className="imc-lesson-num">{done?'✓':String(i+1).padStart(2,'0')}</span><span>{l.title}</span></button></li>;
   })}</ol>
 </aside>;
}
function CourseSession({course,items,progress,setProgress,onClose,onPractice}:{course:ImagingCourse;items:RealItem[];progress:Progress;setProgress:(v:Progress)=>void;onClose:()=>void;onPractice:()=>void}){
 const [idx,setIdx]=useState(0);
 const lesson=course.lesson[idx];
 const completed=course.lesson.filter(l=>progress[keyFor(course.id,l.id)]?.correct).length;
 const record=(answer:number)=>{
  const next={...progress,[keyFor(course.id,lesson.id)]:{answered:answer,correct:answer===lesson.check.answer,at:new Date().toISOString()}};
  setProgress(next);keep(next);
 };
 return <section className="imc-session" aria-label={course.title}>
   <nav className="lib-crumbs" aria-label="Imaging course navigation"><button onClick={onClose}>Imaging courses</button><span aria-hidden="true">/</span><span>{course.title}</span></nav>
   <div className="imc-session-hero"><div><p className="lib-kicker">{MODALITY_LABEL[course.modality]} · Full course</p>
     <h1 className="lib-display">{course.title}</h1><p className="lib-lede">{course.intro}</p>
   </div><span className="imc-progress">{completed} / {course.lesson.length} checkpoints correct</span></div>
   <details className="imc-outcomes"><summary>Course objectives</summary><ul>{course.outcomes.map(x=><li key={x}>{x}</li>)}</ul></details>
   <div className="imc-course-grid">
     <CourseContents course={course} progress={progress} active={idx} choose={setIdx}/>
     <div className="imc-content">
       <Chapter key={lesson.id} course={course} lesson={lesson} items={items} progress={progress} onDone={record} onPractice={onPractice}/>
       <div className="img-trainer-actions"><button className="lib-btn" disabled={idx===0} onClick={()=>setIdx(i=>i-1)}>Previous chapter</button>
         {idx<course.lesson.length-1 ? <button className="lib-btn primary" onClick={()=>setIdx(i=>i+1)}>Next chapter</button> :
          <button className="lib-btn primary" onClick={onPractice}>Apply: interpretation cases</button>}</div>
       <section className="imc-references"><h3>Evidence and further reading</h3><p>Original lessons based on published approaches; source illustrations are independently licensed. References are not a blanket reuse license.</p>
         <ul>{course.references.map(r=><li key={r.url}><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></li>)}</ul>
       </section>
     </div>
   </div>
 </section>;
}
function CourseDirectory({items,progress,open}:{items:RealItem[];progress:Progress;open:(course:string)=>void}) {
 const mods:ImagingModality[]=['xray','ct','mri','ultrasound'];
 return <div className="imc-directory">
   <header className="imc-dir-head"><p className="lib-kicker">Clinical imaging · Structured learning</p>
     <h1 className="lib-display">Learn to interpret imaging</h1>
     <p className="lib-lede">Start with anatomy and acquisition. Watch real ultrasound, compare it with the app’s 3D models, learn a systematic interpretation, then test yourself. These are teaching cases, not patient-specific simulations.</p>
   </header>
   {mods.map(m=><section className="imc-directory-group" key={m}>
     <h2>{MODALITY_LABEL[m]} <small>{items.filter(i=>modalityOf(i)===m).length} licensed studies</small></h2>
     <div className="imc-course-cards">{IMAGING_COURSES.filter(c=>c.modality===m).map(c=>{
       const done=c.lesson.filter(l=>progress[keyFor(c.id,l.id)]?.correct).length;
       return <button key={c.id} className="imc-course-card" onClick={()=>open(c.id)}>
         <span className="imc-course-brow">{c.level} · {c.lesson.length} guided chapters · ~{c.minutes} min</span>
         <b>{c.title}</b><span>{c.intro}</span><small>{done}/{c.lesson.length} completed · Open course</small>
       </button>;
     })}</div>
   </section>)}
 </div>;
}

export function ImagingExperience({initialModality,moduleId,initialId}:{initialModality?:ImagingModality;moduleId?:string;initialId?:string}) {
 const [items,setItems]=useState<RealItem[]>([]);
 const [loadErr,setLoadErr]=useState(false);
 const [loading,setLoading]=useState(true);
 const [progress,setProgress]=useState<Progress>(stored);
 const [mode,setMode]=useState<'courses'|'bank'>(initialId?'bank':'courses');
 const [courseId,setCourseId]=useState<string|null>(moduleId?COURSE_FOR_MODULE[moduleId]??null:null);
 useEffect(()=>{let alive=true;loadImagingStudies().then(v=>{if(alive){setItems(v);setLoading(false);}}).catch(()=>{if(alive){setLoadErr(true);setLoading(false);}});return()=>{alive=false}},[]);
 const course=courseId?IMAGING_COURSE_BY_ID[courseId]:undefined;
 const originalModule=moduleId?MODULE_BY_ID[moduleId]:undefined;
 if(mode==='bank')return <div className="imc-bank-wrap"><div className="imc-backtop">
     <button className="lib-btn" onClick={()=>{setMode('courses');setCourseId(moduleId?COURSE_FOR_MODULE[moduleId]??null:null);}}>Back to courses</button>
     <span>Independent practice · real source-attributed cases</span></div>
     <ImagingTrainer initialModality={initialModality??course?.modality} moduleId={moduleId} initialId={initialId}/></div>;
 return <div className="imc-experience lib-page">
   {originalModule && <p className="imc-linked-module">Related lesson: <button className="lib-link" onClick={()=>openLibrary({page:'module',id:originalModule.id})}>{originalModule.title}</button>
     <button className="lib-link" onClick={()=>{setCourseId(null);}}>All imaging courses</button></p>}
   {loading?<p className="lib-empty" role="status">Loading sourced imaging courses…</p>:loadErr?<p className="lib-empty" role="alert">Could not load local imaging sources. Please reconnect and retry.</p>:course?
     <CourseSession key={course.id} course={course} items={items} progress={progress} setProgress={setProgress} onClose={()=>setCourseId(null)} onPractice={()=>setMode('bank')}/>:
     <><CourseDirectory items={items} progress={progress} open={setCourseId}/>
       <button className="lib-btn imc-all-cases" onClick={()=>setMode('bank')}>Open the complete {items.length}-study independent practice bank</button></>}
 </div>;
}
