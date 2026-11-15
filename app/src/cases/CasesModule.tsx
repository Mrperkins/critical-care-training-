import {useMemo,useState} from 'react';
import {CONFERENCES,CASE_BY_ID} from './catalog';
import {CasePlayer,sceneImage} from './CasePlayer';
import {estimatedMinutes} from './buildConference';
import {useCases} from './state';
import {ATLAS_COVERAGE,BLUEPRINT_SOURCES,COVERAGE_NOTICE,EXAM_EXPANSION,LESSON_COVERAGE} from './coverage';
import {useUI,type Module} from '../app/store';
import {DISEASE_BY_ID} from '../atlas/registry';
import {FPC_BY_ID} from '../fpc/index';
import {useFpc} from '../fpc/FpcModule';
import type {CasePopulation,ConferenceCase,ExamTrack} from './types';

const populations:CasePopulation[]=['Pediatric','Obstetric','Neonatal','Adult'];
const exams:ExamTrack[]=['FP-C','CCP-C','CCRN Adult','CCRN Pediatric','CCRN Neonatal'];
export default function CasesModule(){
  const {selected,lesson,disease}=useCases();
  const [query,setQuery]=useState(''),[population,setPopulation]=useState('All'),[exam,setExam]=useState('All'),[view,setView]=useState<'library'|'coverage'>('library');
  const c=selected?CASE_BY_ID[selected]:null;
  const related=(x:ConferenceCase)=>(!lesson&&!disease)||(lesson&&x.lessonIds.includes(lesson))||(disease&&x.diseaseIds.includes(disease));
  const cases=useMemo(()=>CONFERENCES.filter(x=>(population==='All'||x.population===population)&&(exam==='All'||x.exams.includes(exam as ExamTrack))&&`${x.title} ${x.topic} ${x.variant} ${x.patient}`.toLowerCase().includes(query.toLowerCase())),[query,population,exam]);
  const goLesson=(x:ConferenceCase)=>{
    const atlas=disease?DISEASE_BY_ID[disease]:null;
    if(atlas){useUI.getState().set({module:atlas.domain as Module,mode:'learn',atlasDisease:atlas.id});return;}
    const id=lesson&&FPC_BY_ID[lesson]?lesson:x.lessonIds.find(id=>FPC_BY_ID[id]);
    if(id){useFpc.getState().set({lesson:id,domain:FPC_BY_ID[id].domain,track:'full'});useUI.getState().set({module:'fpc',atlasDisease:null});}
  };
  return <main id="controls" tabIndex={-1} className="stage conferences-stage"><div className="conferences-page">
    {c?<CasePlayer key={c.id} c={c} onBack={()=>useCases.getState().set({selected:null})} onContinue={()=>goLesson(c)} onNext={()=>{const siblings=CONFERENCES.filter(x=>x.topicId===c.topicId);const n=siblings[(siblings.findIndex(x=>x.id===c.id)+1)%siblings.length];useCases.getState().set({selected:n.id});}}/>:<>
      <header className="conferences-hero"><div><p className="eyebrow">Clinical stories · Critical thinking</p><h2>Case conference</h2><p>Meet the patient.<br/>Follow the findings.<br/><em>Understand the decision.</em></p><span>{CONFERENCES.length} synthetic drafts · Narrated slides &amp; audio</span></div><figure><img src={sceneImage('Pediatric')} alt="AI-generated pediatric care setting"/><figcaption>Illustrative setting · AI generated</figcaption></figure></header>
      <div className="conferences-toolbar"><nav aria-label="Case library view"><button aria-pressed={view==='library'} onClick={()=>setView('library')}>Case library</button><button aria-pressed={view==='coverage'} onClick={()=>setView('coverage')}>Coverage &amp; development</button></nav><p>Clinical review pending</p></div>
      <div className="conferences-filters"><label>Population<select value={population} onChange={e=>setPopulation(e.target.value)}><option>All</option>{populations.map(p=><option key={p}>{p}</option>)}</select></label><label>Exam alignment<select value={exam} onChange={e=>setExam(e.target.value)}><option>All</option>{exams.map(e=><option key={e}>{e}</option>)}</select></label><label className="conferences-search">Search<input type="search" placeholder="Disease, presentation or case…" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
      {view==='coverage'?<Coverage population={population} query={query} exam={exam}/>:<>
        {(lesson||disease)&&<section className="conference-context"><p>Cases linked to <b>{lesson?FPC_BY_ID[lesson]?.title:DISEASE_BY_ID[disease!]?.title}</b>: {CONFERENCES.filter(related).length} drafts.</p><button className="act" onClick={()=>useCases.getState().set({lesson:null,disease:null})}>Clear lesson context</button></section>}
        <div className="conferences-results"><h3>{population==='All'?'All presentations':`${population} presentations`}</h3><span>{cases.length} cases</span></div>
        <div className="conferences-grid">{[...cases].sort((a,b)=>Number(related(b))-Number(related(a))).map(x=><article className={`conference-card population-${x.population.toLowerCase()}`} key={x.id}><div><span className="eyebrow">{x.population} / {x.topic}</span><small>≈ {estimatedMinutes(x)} min</small></div><h3>{x.title}</h3><p>{x.variant}</p><p className="conference-card-patient">{x.patient}</p><button onClick={()=>useCases.getState().set({selected:x.id})}>Open case conference <span aria-hidden="true">↗</span></button></article>)}</div>
        {!cases.length&&<p role="status">No matching cases. Change the population, exam or search.</p>}
        <p className="conference-editorial-note">Each topic has distinct presentation variants. These drafts are a starting library; complete disease-by-disease exam coverage is still in development.</p>
      </>}
    </>}
  </div></main>;
}

function Coverage({population,query,exam}:{population:string;query:string;exam:string}){
  const inPop=(p:string)=>population==='All'||population===p;
  const rows=ATLAS_COVERAGE.filter(r=>inPop(r.population)&&r.title.toLowerCase().includes(query.toLowerCase()));
  return <section className="conference-coverage"><h3>Coverage is a visible checklist</h3><p>{COVERAGE_NOTICE}</p><div className="coverage-stats"><div><b>{ATLAS_COVERAGE.filter(r=>r.count>0).length} / {ATLAS_COVERAGE.length}</b><span>Atlas conditions with linked drafts</span></div><div><b>{LESSON_COVERAGE.filter(r=>r.count>0).length} / {LESSON_COVERAGE.length}</b><span>FP-C lessons with linked drafts</span></div><div><b>0 / {CONFERENCES.length}</b><span>Cases with completed clinical sign-off</span></div></div>
    <p>Editorial targets: at least 3 distinct presentations per adult topic and 5 per pediatric, neonatal or OB topic. These are production targets, not counts required by an exam board. A broad lesson can contain several diseases; a linked case does not cover them all.</p>
    <details open><summary>Current atlas conditions · {rows.length} shown</summary><div className="conference-table-scroll"><table><caption>Existing atlas coverage by condition. Exam filters apply to the expansion list below, not to this atlas inventory.</caption><thead><tr><th>Condition</th><th>Population</th><th>Linked drafts</th><th>Target variants</th><th>Review</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><th scope="row">{r.title}</th><td>{r.population}</td><td>{r.count||'In preparation'}</td><td>{r.target}</td><td>Pending</td></tr>)}</tbody></table></div></details>
    <details><summary>FP-C lesson links · {LESSON_COVERAGE.length} lessons</summary><ul>{LESSON_COVERAGE.filter(r=>r.title.toLowerCase().includes(query.toLowerCase())).map(r=><li key={r.id}>{r.title} — {r.count?r.count+' linked drafts':'In preparation'}</li>)}</ul></details>
    <h4>Additional exam content to build</h4><p>This selected expansion list is not an exhaustive blueprint crosswalk. It must be checked against the linked official outlines before full-coverage claims are made.</p>{EXAM_EXPANSION.filter(r=>inPop(r.population)&&(exam==='All'||r.exam===exam)).map(r=><details key={r.exam}><summary>{r.population} · {r.exam}</summary><ul>{r.topics.filter(t=>t.toLowerCase().includes(query.toLowerCase())).map(t=><li key={t}>{t} — in preparation</li>)}</ul></details>)}
    <h4>Official blueprint references</h4><p>Checked October 21, 2026.</p><ul>{BLUEPRINT_SOURCES.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
  </section>;
}
