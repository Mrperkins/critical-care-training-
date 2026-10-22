import {casesForDisease,casesForLesson} from './catalog';
import {openConference} from './state';
/** Deliberately present before teaching even when a case is still missing. No invented coverage. */
export function CasePrimer({lessonId,diseaseId}:{lessonId?:string;diseaseId?:string}){
  const cases=lessonId?casesForLesson(lessonId):casesForDisease(diseaseId??'');
  return <section className="case-primer" aria-label="Start with a case conference">
    <span className="eyebrow">Patient first</span><h3>Start with a case conference</h3>
    <p>{cases.length?`${cases.length} synthetic case drafts · narrated slides or audio listening`:'A complete conference for this topic is in preparation.'}</p>
    {cases.length?<ul>{cases.map(c=><li key={c.id}><button onClick={()=>openConference(c.id,{lesson:lessonId,disease:diseaseId})}><b>{c.title}</b><small>{c.variant}</small></button></li>)}</ul>:<button className="act" onClick={()=>openConference(null,{lesson:lessonId,disease:diseaseId})}>View case coverage &amp; available cases</button>}
  </section>;
}
