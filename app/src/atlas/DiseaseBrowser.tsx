import { useState } from 'react';
import { DISEASES } from './registry';
import { EXPLAINERS } from './explainers';
import type { AtlasDomain } from './types';
import { useUI } from '../app/store';
import { director } from '../director/director';
import { diseaseLesson } from './engine';
import { DISEASE_BY_ID } from './registry';
import { courseFor, trackSummary } from '../director/course';

const lengths = new Map<string, { full: number; tldr: number }>();
/** full and TL;DR length of a disease explainer, computed once */
function DiseaseLength({ id }: { id: string }) {
  let l = lengths.get(id);
  if (!l) { const tl = diseaseLesson(DISEASE_BY_ID[id], () => undefined); const s = trackSummary(tl, courseFor(tl)); l = { full: s.full.min, tldr: s.tldr.min }; lengths.set(id, l); }
  return <>{l.full} min<small className="ci-tldr">TL;DR {l.tldr} min</small></>;
}
const ALIASES:Record<string,string> = {'pulmonary-embolism':'PE clot dead space','pulmonary-edema':'CHF heart failure fluid','auto-peep':'asthma COPD air trapping intrinsic PEEP','ards':'acute respiratory distress syndrome','septic-shock':'sepsis infection','tamponade':'pericardial effusion','anaphylaxis':'allergy allergic shock'};
export const matchesDisease = (d:typeof DISEASES[number], query:string) => {
  const q=query.trim().toLowerCase(); const words=`${d.title} ${d.mechanism} ${ALIASES[d.id] ?? ''}`.toLowerCase();
  return q.length > 3 ? words.includes(q) : !q || words.split(/[^a-z0-9]+/).some(word=>word===q || (q.length===1 && word.startsWith(q)));
};
export function DiseaseBrowser({ domain, query }: {domain?:AtlasDomain;query?:string}) {
  const [search,setSearch] = useState(''); const q = query ?? search;
  const conditions = DISEASES.filter(d => (!domain || d.domain === domain) && matchesDisease(d,q));
  const featured = conditions.filter(d => EXPLAINERS[d.id]);
  const primary = q ? conditions : featured.slice(0,4);
  const remaining = conditions.filter(d => !primary.includes(d));
  const row = (d:typeof DISEASES[number]) => <button className="disease-row" key={d.id} onClick={() => {
    director.unload(); useUI.getState().set({module:d.domain,mode:'learn',atlasDisease:d.id,atlasFrame:null,atlasTarget:'body.whole'});
  }}><span><b>{d.title}</b><small>{EXPLAINERS[d.id]?.outcome ?? d.mechanism}</small></span><span className="disease-count"><DiseaseLength id={d.id} /></span></button>;
  return <details className="lesson-group disease-browser" open><summary>Disease explainers <span>{conditions.length}</span></summary>
    <p className="muted small">Follow cause, anatomy and consequence. Pause, predict and replay each mechanism.</p>
    {query === undefined && <label className="lesson-search">Find a disease<input type="search" placeholder="Try PE, ARDS, shock…" value={search} onChange={e=>setSearch(e.target.value)} /></label>}
    {primary.map(row)}
    {remaining.length > 0 && <details><summary>{remaining.length} more conditions</summary>{remaining.map(row)}</details>}
    {conditions.length === 0 && <p role="status">No diseases match “{q}”. Try a disease name or common abbreviation.</p>}
  </details>;
}
