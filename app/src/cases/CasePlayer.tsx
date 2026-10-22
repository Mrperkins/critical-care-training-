import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {conferenceAudioKey} from './audioKey';
import type {ConferenceAudio,ConferenceCase} from './types';
const ClinicalMedia=lazy(()=>import('../atlas/ClinicalMedia'));
const mmss=(t:number)=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const key=(c:ConferenceCase)=>`cc.conference.${c.id}.${conferenceAudioKey(c)}`;
export const chapterAt=(asset:ConferenceAudio,t:number)=>{const i=asset.chapters.findIndex(ch=>t>=ch.start&&t<ch.end);return i>=0?i:t>=asset.seconds?asset.chapters.length-1:0;};
export const sceneImage=(population:string)=>`conferences/images/${population.toLowerCase()}.webp`;
function readPosition(c:ConferenceCase){try{return Math.max(0,Number(localStorage.getItem(key(c)))||0);}catch{return 0;}}

export function CasePlayer({c,onBack,onContinue,onNext}:{c:ConferenceCase;onBack:()=>void;onContinue:()=>void;onNext?:()=>void}){
  const audio=useRef<HTMLAudioElement>(null),saved=useRef(0);
  const [asset,setAsset]=useState<ConferenceAudio|null>(null),[error,setError]=useState('');
  const [t,setT]=useState(0),[index,setIndex]=useState(0),[listening,setListening]=useState(false),[playing,setPlaying]=useState(false),[rate,setRate]=useState(1);
  const [reference,setReference]=useState(false),[completed,setCompleted]=useState(false),[retry,setRetry]=useState(0);
  const slide=c.slides[index];
  useEffect(()=>{
    let alive=true;
    fetch('conferences/manifest.json').then(r=>{if(!r.ok)throw new Error('Narration is unavailable.');return r.json();}).then(m=>{
      const a=m.assets?.[c.id] as ConferenceAudio|undefined;
      if(!a||a.transcriptHash!==conferenceAudioKey(c)||a.chapters.length!==c.slides.length)throw new Error('Current narration is not available for this draft.');
      if(alive){setAsset(a);setError('');}
    }).catch(e=>alive&&setError(`${e.message} You can read the complete slides and transcript below.`));
    return()=>{alive=false;};
  },[c.id,retry]);
  useEffect(()=>{const element=audio.current;return()=>element?.pause();},[asset]);
  useEffect(()=>{
    if(!('mediaSession' in navigator)||!asset)return;
    const ms=navigator.mediaSession;
    if(typeof MediaMetadata!=='undefined')ms.metadata=new MediaMetadata({title:c.title,artist:'Critical Care · Synthetic case conference',album:c.topic});
    const seek=(value:number)=>{const a=audio.current;if(a){a.currentTime=Math.max(0,Math.min(a.duration||asset.seconds,value));setT(a.currentTime);setIndex(chapterAt(asset,a.currentTime));}};
    const handlers:Partial<Record<MediaSessionAction,MediaSessionActionHandler>>={play:()=>{audio.current?.play().catch(()=>setError('Tap the audio play button to resume.'));},pause:()=>audio.current?.pause(),seekbackward:e=>seek((audio.current?.currentTime??0)-(e.seekOffset??15)),seekforward:e=>seek((audio.current?.currentTime??0)+(e.seekOffset??15)),seekto:e=>seek(e.seekTime??0)};
    for(const [action,handler] of Object.entries(handlers))try{ms.setActionHandler(action as MediaSessionAction,handler);}catch{/* optional browser support */}
    return()=>{for(const action of Object.keys(handlers))try{ms.setActionHandler(action as MediaSessionAction,null);}catch{}ms.metadata=null;ms.playbackState='none';};
  },[asset,c.id]);
  const seekSlide=(n:number)=>{
    if(n<0||n>=c.slides.length)return;
    setIndex(n);setReference(false);
    if(asset&&audio.current){audio.current.currentTime=asset.chapters[n].start;setT(asset.chapters[n].start);}
  };
  const update=()=>{
    const a=audio.current;if(!a||!asset)return;
    setT(a.currentTime);setIndex(chapterAt(asset,a.currentTime));
    if(Math.abs(a.currentTime-saved.current)>3){saved.current=a.currentTime;try{localStorage.setItem(key(c),String(a.currentTime));}catch{}}
    if('mediaSession' in navigator&&Number.isFinite(a.duration))try{navigator.mediaSession.setPositionState({duration:a.duration,playbackRate:a.playbackRate,position:Math.min(a.duration,a.currentTime)});}catch{}
  };
  const changePlayback=(isPlaying:boolean)=>{setPlaying(isPlaying);if('mediaSession' in navigator)navigator.mediaSession.playbackState=isPlaying?'playing':'paused';};
  return <article className={`conference-player${listening?' listening':''}`} aria-labelledby="conference-title">
    <div className="conference-top"><button className="course-back" onClick={onBack}>← Case library</button><div className="conference-mode" role="group" aria-label="Presentation mode"><button aria-pressed={!listening} onClick={()=>setListening(false)}>Watch slides</button><button aria-pressed={listening} onClick={()=>setListening(true)}>Listen</button></div></div>
    <header className="conference-heading"><p className="eyebrow">{c.population} · Synthetic case conference</p><h2 id="conference-title">{c.title}</h2><p>{c.variant}</p><small className="conference-review">Clinical review pending · Fictional patient</small></header>
    {listening?<section className="conference-listening" aria-label="Audio listening view"><span className="conference-headphones" aria-hidden="true">◉</span><p className="eyebrow">Audio case conference</p><h3>{playing?'Now playing':'Ready when you are'}</h3><p>All clinical findings and reasoning are narrated. Set up playback while parked; no responses or screen interaction are required.</p><p className="conference-current">Chapter {index+1} of {c.slides.length} · {slide.title}</p></section>:<>
      <div className={`conference-slide kind-${slide.kind}`}>
        <div className="conference-slide-text"><p className="eyebrow">{slide.label}</p><h3>{slide.title}</h3>
          {slide.paragraphs?.map(p=><p key={p}>{p}</p>)}
          {slide.data&&<dl className={`conference-data ${slide.kind==='vitals'?'vital-grid':'lab-grid'}`}>{slide.data.map(d=><div key={d.label}><dt>{d.label}</dt><dd>{d.value}<small>{d.unit}</small></dd></div>)}</dl>}
          {slide.bullets&&<ul className="conference-evidence">{slide.bullets.map(p=><li key={p}>{p}</li>)}</ul>}
          {slide.focus&&<aside className="conference-focus"><span>{slide.focus.label}</span><p>{slide.focus.text}</p></aside>}
          {slide.pauseAfterSeconds&&<p className="conference-reflection">Brief reflection pause · Narration continues automatically</p>}
          {slide.kind==='diagnostics'&&c.referenceDisease&&<div><button className="act" aria-expanded={reference} onClick={()=>setReference(!reference)}>{reference?'Hide':'Open'} real comparison image</button>{reference&&<Suspense fallback={<p>Loading reference…</p>}><ClinicalMedia diseaseId={c.referenceDisease}/></Suspense>}</div>}
        </div>
        {index===0&&<figure className="conference-scene"><img src={sceneImage(c.population)} alt={`Illustrative ${c.population.toLowerCase()} care setting, AI generated; not the fictional case patient`} onError={e=>e.currentTarget.style.display='none'}/><figcaption>AI-generated setting · Not the case patient</figcaption></figure>}
      </div>
      <nav className="conference-slide-nav" aria-label="Slide navigation"><button className="act" disabled={index===0} onClick={()=>seekSlide(index-1)}>← Previous slide</button><span>{index+1} / {c.slides.length}</span><button className="act" disabled={index===c.slides.length-1} onClick={()=>seekSlide(index+1)}>Next slide →</button></nav>
    </>}
    <section className="conference-audio" aria-label="Case narration">
      <div><b>{playing?'Playing':'Narration'}</b><span>{mmss(t)}{asset?` / ${mmss(asset.seconds)}`:''}</span><label>Speed<select aria-label="Narration speed" value={rate} onChange={e=>{const v=Number(e.target.value);setRate(v);if(audio.current)audio.current.playbackRate=v;}}>{[0.75,1,1.25,1.5,1.75,2].map(v=><option value={v} key={v}>{v}×</option>)}</select></label></div>
      {asset&&<audio ref={audio} controls preload="metadata" src={`conferences/${asset.file}`} onLoadedMetadata={()=>{const a=audio.current;if(!a)return;const resume=readPosition(c);if(resume>0&&resume<a.duration-2){a.currentTime=resume;setT(resume);setIndex(chapterAt(asset,resume));}a.playbackRate=rate;}} onTimeUpdate={update} onSeeked={update} onPlay={()=>changePlayback(true)} onPause={()=>changePlayback(false)} onEnded={()=>{setCompleted(true);setIndex(c.slides.length-1);try{localStorage.removeItem(key(c));}catch{}}} onError={()=>setError('The audio file could not be loaded. Retry or use the full transcript.')} />}
      {!asset&&!error&&<p role="status">Loading narration…</p>}
      {error&&<p className="conference-error" role="status">{error} <button className="act" onClick={()=>{setError('');setRetry(v=>v+1);audio.current?.load();}}>Retry audio</button></p>}
      {asset&&<p className="conference-downloads"><a href={`conferences/${asset.file}`} download={`${c.id}.mp3`}>Download audio</a><a href={`conferences/transcripts/${c.id}.txt`} download>Download transcript</a><span>One continuous file · {mmss(asset.seconds)}</span></p>}
    </section>
    <details className="conference-chapters"><summary>Chapters &amp; full transcript</summary><nav aria-label="Conference chapters">{c.slides.map((s,i)=><button key={s.id} aria-current={i===index?'step':undefined} onClick={()=>seekSlide(i)}><span>{asset?mmss(asset.chapters[i].start):String(i+1).padStart(2,'0')}</span>{s.title}</button>)}</nav>{c.slides.map(s=><section key={s.id}><h4>{s.title}</h4><p>{s.narration}</p>{s.pauseAfterSeconds&&<p className="conference-reflection">{s.pauseAfterSeconds}-second reflection pause; playback continues automatically.</p>}</section>)}</details>
    {(completed||index===c.slides.length-1)&&<div className="conference-complete"><p>{completed?'Playback complete.':'Case synopsis.'} Continue into the physiology or compare a different presentation.</p><button className="act primary" onClick={onContinue}>Continue to the lesson</button>{onNext&&<button className="act" onClick={onNext}>Next presentation</button>}</div>}
    <details className="conference-sources"><summary>Clinical sources &amp; exam alignment</summary><p>{c.exams.join(' · ')}. Tags indicate intended relevance, not complete exam coverage or endorsement.</p><p>Patient history, measurements and outcome are synthetic. Clinical review is pending.</p><ul>{c.sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul></details>
  </article>;
}
