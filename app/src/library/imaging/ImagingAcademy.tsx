/**
 * Course-first clinical imaging education: objectives, original teaching chapters,
 * real-media/3D correlation, knowledge checkpoints and clinical case practicum.
 */
import {lazy,Suspense,useEffect,useMemo,useState} from 'react';
import {RealCaseCard} from '../../scene/imaging/RealCase';
import type {RealItem} from '../../scene/imaging/RealExamples';
import {openLibrary} from '../launch';
import {MODALITY_LABEL,loadImagingStudies,modalityOf,type ImagingModality} from './catalog';
import {AnatomyCompare} from './AnatomyCompare';
import {IMAGING_COURSES,COURSE_FOR_MODULE,type ImagingCourse,type ImagingLesson} from './courseCurriculum';

const ImagingTrainer = lazy(()=>import('./ImagingTrainer').then(m=>({default:m.ImagingTrainer})));
type Screen = 'catalog' | 'syllabus' | 'chapter' | 'practicum' | 'drills';
interface CourseProgress { completed:Record<string,string>; cases:Record<string,boolean> }
const STORAGE='ccp.imaging.courses.v2';
const blank=():CourseProgress=>({completed:{},cases:{}});
function loadProgress():CourseProgress {
  try {const raw=JSON.parse(localStorage.getItem(STORAGE)??'{}') as Partial<CourseProgress>;
    return {completed:raw.completed&&typeof raw.completed==='object'?raw.completed:{},cases:raw.cases&&typeof raw.cases==='object'?raw.cases:{}};
  }catch{return blank();}
}
function persist(v:CourseProgress) {try{localStorage.setItem(STORAGE,JSON.stringify(v));}catch{/* no storage */}}
const chapterKey=(course:ImagingCourse, lesson:ImagingLesson)=>course.id+':'+lesson.id;
function studiesFor(course:ImagingCourse,items:RealItem[]) {
  const index=new Map(items.map(i=>[i.id,i]));
  return [...new Set(course.lesson.flatMap(l=>l.media))].map(id=>index.get(id)).filter((i):i is RealItem=>!!i);
}
function progressFor(course:ImagingCourse, p:CourseProgress) {return course.lesson.filter(l=>p.completed[chapterKey(course,l)]).length;}
const FILTERS:Array<ImagingModality|'all'>=['all','ultrasound','xray','ct','mri'];

export function ImagingAcademy({moduleId,initialModality,initialId}:{moduleId?:string;initialModality?:ImagingModality;initialId?:string}) {
  const recommended=moduleId?COURSE_FOR_MODULE[moduleId]:undefined;
  const targetCourse=IMAGING_COURSES.find(c=>c.id===recommended);
  const targetChapter=targetCourse?.lesson.findIndex(l=>l.media.includes(initialId??''))??-1;
  const [courseId,setCourseId]=useState<string|null>(recommended??null);
  const [screen,setScreen]=useState<Screen>(recommended ? (initialId ? (targetChapter>=0?'chapter':'drills') : 'syllabus') : (initialId?'drills':'catalog'));
  const [modality,setModality]=useState<ImagingModality|'all'>(initialModality??'all');
  const [chapter,setChapter]=useState(targetChapter>=0?targetChapter:0);
  const [sampleId,setSampleId]=useState<string|null>(initialId??null);
  const [answer,setAnswer]=useState<number|null>(null);
  const [feedback,setFeedback]=useState(false);
  const [progress,setProgress]=useState<CourseProgress>(loadProgress);
  const [items,setItems]=useState<RealItem[]>([]);
  const [busy,setBusy]=useState(true);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    let mounted=true;loadImagingStudies().then(xs=>{if(mounted){setItems(xs);setBusy(false);}})
      .catch(()=>{if(mounted){setBusy(false);setFailed(true);}});
    return()=>{mounted=false};
  },[]);
  const courses=IMAGING_COURSES.filter(c=>modality==='all'||c.modality===modality);
  const course=IMAGING_COURSES.find(c=>c.id===courseId);
  const lesson=course?.lesson[chapter];
  const selected=useMemo(()=>lesson?.media.map(id=>items.find(i=>i.id===id)).filter((i):i is RealItem=>!!i)??[],[lesson,items]);
  const media=selected.find(x=>x.id===sampleId)??selected[0];
  const cases=useMemo(()=>course?studiesFor(course,items).filter(i=>!!i.quiz):[],[course,items]);
  const [casePos,setCasePos]=useState(0);
  const selectedCases=cases.slice(0,Math.min(6,cases.length));
  const currentCase=selectedCases[casePos];
  const correct=selectedCases.filter(i=>progress.cases[course?.id+':'+i.id]===true).length;
  const done=selectedCases.filter(i=>Object.prototype.hasOwnProperty.call(progress.cases,course?.id+':'+i.id)).length;
  const passed=selectedCases.length>0&&done===selectedCases.length&&correct/selectedCases.length>=.8;
  const setScreenAndCourse=(c:ImagingCourse)=>{
    setCourseId(c.id);setScreen('syllabus');setChapter(0);setSampleId(null);setAnswer(null);setFeedback(false);setCasePos(0);
  };
  const openLesson=(index:number)=>{
    setChapter(index);setSampleId(null);setAnswer(null);setFeedback(false);setScreen('chapter');
  };
  const saveLesson=()=>{
    if(!course||!lesson)return;
    const value={...progress,completed:{...progress.completed,[chapterKey(course,lesson)]:new Date().toISOString()}};
    setProgress(value);persist(value);
  };
  const submitCheck=(pick:number)=>{setAnswer(pick);setFeedback(true);if(lesson&&pick===lesson.check.answer)saveLesson()};
  const saveCase=(it:RealItem,ok:boolean|null)=>{
    if(!course||ok===null)return;
    const value={...progress,cases:{...progress.cases,[course.id+':'+it.id]:ok}};
    setProgress(value);persist(value);
  };
  return <div className="img-academy lib-page">
    <nav className="lib-crumbs" aria-label="Breadcrumb">
      <button onClick={()=>openLibrary({page:'home'})}>Browse</button>
      <span aria-hidden="true">/</span>
      {screen!=='catalog'?<button onClick={()=>setScreen('catalog')}>Imaging courses</button>:<span aria-current="page">Imaging courses</span>}
      {course&&screen!=='catalog'&&<><span aria-hidden="true">/</span>{screen!=='syllabus'?<button onClick={()=>setScreen('syllabus')}>{course.title}</button>:<span aria-current="page">{course.title}</span>}</>}
    </nav>
    <header className="img-academy-heading">
      <p className="lib-kicker">Critical care · guided imaging education</p>
      <h1 className="lib-display">{screen==='catalog'?'Imaging academy':screen==='drills'?'Independent image practice':course?.title??'Imaging academy'}</h1>
      <p className="lib-lede">{screen==='catalog'?'Anatomy first, then technique, pattern recognition, interpretation and clinical application. Real ultrasound video, CT, MRI and X-ray examples with your existing 3D anatomy models.':
        screen==='drills'?'Revisit independent case drills after working through the lessons.':course?.intro}</p>
    </header>
    {screen==='catalog'&&<section className="img-course-catalog">
      <div className="lib-filters" role="group" aria-label="Filter imaging courses">
        {FILTERS.map(m=><button key={m} aria-pressed={modality===m} className={modality===m?'on':''} onClick={()=>setModality(m)}>{m==='all'?'All courses':MODALITY_LABEL[m]}</button>)}
      </div>
      <div className="img-academy-course-grid">{courses.map(c=>{
        const n=progressFor(c,progress);
        return <button key={c.id} className="img-academy-course" onClick={()=>setScreenAndCourse(c)}>
          <span className="lib-kicker">{MODALITY_LABEL[c.modality]} · {c.level} · {c.minutes} min</span>
          <h2>{c.title}</h2><p>{c.intro}</p><span>{n}/{c.lesson.length} lessons complete</span>
        </button>;
      })}</div>
      <div className="img-academy-library-link"><b>Already know the fundamentals?</b>
        <p>Practice independent real-patient studies by modality. The drill library does not replace these courses.</p>
        <button className="lib-btn" onClick={()=>setScreen('drills')}>Open study drills</button>
      </div>
    </section>}

    {course&&screen==='syllabus'&&<div className="img-academy-syllabus">
      <section className="lib-panel">
        <h2>After this course you can</h2><ul>{course.outcomes.map(s=><li key={s}>{s}</li>)}</ul>
        <p className="img-course-progress">{progressFor(course,progress)} of {course.lesson.length} learning chapters complete</p>
        <button className="lib-btn primary" onClick={()=>openLesson(Math.max(0,course.lesson.findIndex(l=>!progress.completed[chapterKey(course,l)])))}>
          Start or resume lessons</button>
      </section>
      <section className="img-academy-chapters" aria-label="Course syllabus">
        <h2>Teaching chapters</h2>
        <ol>{course.lesson.map((l,i)=><li key={l.id}><button onClick={()=>openLesson(i)}>
          <span className="img-chapter-number">{i+1}</span>
          <span><b>{l.title}</b><small>{l.goal}</small></span>
          <span className="img-chapter-check">{progress.completed[chapterKey(course,l)]?'Completed':'Learn'}</span>
        </button></li>)}</ol>
        <button className="lib-btn" disabled={progressFor(course,progress)!==course.lesson.length} onClick={()=>{setCasePos(0);setScreen('practicum')}}>Final interpretation practicum</button>
        {progressFor(course,progress)!==course.lesson.length&&<p className="img-academy-lock-note">Complete the chapter knowledge checkpoints to unlock the final case practicum.</p>}
      </section>
      <aside className="img-course-reading">
        <h2>Sources and further reading</h2>
        <p>Independently written lessons informed by clinical resources; no outside lesson graphics or videos copied.</p>
        {course.references.map(s=><a href={s.url} key={s.url} target="_blank" rel="noreferrer">{s.title}</a>)}
      </aside>
    </div>}

    {course&&lesson&&screen==='chapter'&&<article className="img-academy-chapter">
      <div className="img-chapter-top"><span>Chapter {chapter+1} of {course.lesson.length} · {MODALITY_LABEL[course.modality]}</span>
        <button className="lib-link" onClick={()=>setScreen('syllabus')}>See syllabus</button></div>
      <h2>{lesson.title}</h2><p className="img-chapter-goal">{lesson.goal}</p>
      <section className="img-chapter-text" aria-label="Explanation"><h3>Understand the finding</h3>
        {lesson.narrative.map((p,i)=><p key={i}>{p}</p>)}</section>
      {selected.length>0&&<section className="img-chapter-compare" aria-label="Real imaging and interactive anatomy comparison">
        <div className="img-chapter-section-heading"><h3>Read the image next to the anatomy</h3>
          <p>One real clinical study and a separate anatomy reference. Compare spatial landmarks, not simulated patient values.</p></div>
        {selected.length>1&&<div className="img-chapter-media-tabs" role="group" aria-label="Select image example">
          {selected.map((it,i)=><button key={it.id} aria-pressed={media?.id===it.id} onClick={()=>setSampleId(it.id)}>
            Example {i+1}{it.file.endsWith('.mp4')?' · clip':''}</button>)}</div>}
        {media&&<AnatomyCompare key={media.id} it={media} lesson={lesson}/>}
      </section>}
      <section className="img-chapter-method"><h3>How to interpret or acquire it</h3>
        <ol>{lesson.method.map((m,i)=><li key={i}>{m}</li>)}</ol></section>
      <section className="img-chapter-pitfalls"><h3>Do not miss</h3>
        <ul>{lesson.pitfalls.map(p=><li key={p}>{p}</li>)}</ul></section>
      <section className="img-chapter-checkpoint" aria-label="Knowledge checkpoint">
        <h3>Knowledge checkpoint</h3><p>{lesson.check.q}</p>
        <div className="img-check-answers">{lesson.check.choices.map((c,i)=><button key={c} disabled={feedback} aria-pressed={answer===i} onClick={()=>submitCheck(i)}>{c}</button>)}</div>
        {feedback&&<div role="status" className="img-check-feedback">
          <b>{answer===lesson.check.answer?'Correct — chapter recorded':'Review this point'}</b><p>{lesson.check.why}</p>
          {answer!==lesson.check.answer&&<button className="lib-btn" onClick={()=>{setAnswer(null);setFeedback(false)}}>Try again</button>}
        </div>}
      </section>
      <div className="img-trainer-actions">
        <button className="lib-btn" disabled={chapter===0} onClick={()=>openLesson(chapter-1)}>Previous chapter</button>
        <button className="lib-btn primary" disabled={!progress.completed[chapterKey(course,lesson)]} onClick={()=>chapter+1<course.lesson.length?openLesson(chapter+1):(setCasePos(0),setScreen('practicum'))}>
          {chapter+1<course.lesson.length?'Next chapter':'Go to case practicum'}</button>
      </div>
      <details className="img-academy-sources"><summary>Sources for these skills</summary>{course.references.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></p>)}</details>
    </article>}

    {course&&screen==='practicum'&&<section className="img-academy-practicum">
      <div className="img-chapter-top"><span>Applied interpretation · {course.title}</span><button className="lib-link" onClick={()=>setScreen('syllabus')}>Back to syllabus</button></div>
      <h2>Interpret real cases in clinical context</h2>
      <p>Examine each case before committing an answer. This quiz does not confer clinical competence or certification.</p>
      <p className="img-course-progress">{done}/{selectedCases.length} attempted · {correct} correct{passed?' · Self-test target reached':''}. Target: 80%.</p>
      {busy&&<p role="status">Loading licensed case media…</p>}
      {failed&&<p role="alert">Cannot load local imaging manifest.</p>}
      {!busy&&!failed&&currentCase&&<>
        <div className="img-current-top"><h3>Case {casePos+1} of {selectedCases.length}</h3>
          <span className="img-status">{MODALITY_LABEL[modalityOf(currentCase)!]}</span></div>
        <RealCaseCard key={currentCase.id} it={currentCase} practice onComplete={result=>saveCase(currentCase,result)}/>
        <div className="img-trainer-actions">
          <button className="lib-btn" disabled={casePos===0} onClick={()=>setCasePos(i=>i-1)}>Previous case</button>
          <button className="lib-btn primary" disabled={casePos===selectedCases.length-1} onClick={()=>setCasePos(i=>i+1)}>Next case</button>
        </div>
      </>}
      {!busy&&!failed&&!currentCase&&<p>No question-based cases have been cleared for this course. Use the chapter image reviews.</p>}
      {done===selectedCases.length&&selectedCases.length>0&&<div className="lib-panel"><h3>Practicum review</h3>
        <p>Score: {correct}/{selectedCases.length}. {passed?'Self-test threshold met.':"Review cases you missed and repeat relevant chapters."}</p>
        <p>This is educational progress, not diagnostic authorization or proof of clinical proficiency.</p>
      </div>}
    </section>}

    {screen==='drills'&&<Suspense fallback={<p role="status">Loading independent image drills…</p>}>
      <button className="lib-btn" onClick={()=>setScreen('catalog')}>Return to guided imaging courses</button>
      <ImagingTrainer initialModality={initialModality} moduleId={moduleId} initialId={initialId}/>
    </Suspense>}
  </div>;
}
