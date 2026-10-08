import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useUI } from '../app/store';
import { director, useDirector } from '../director/director';
import { DirectorPlayer } from '../director/Player';
import { DISEASE_BY_ID, conditionsFor } from './registry';
import { applyDecision, diseaseLesson, diseaseState, stageIndex } from './engine';
import { DiseaseDiagram, PatientDiagram } from './Diagrams';
import type { AtlasDomain, Decision, DiseaseState } from './types';
import { ATLAS_MEDIA } from './media';

const PatientScene = lazy(() => import('./PatientScene'));
const ClinicalMedia = lazy(() => import('./ClinicalMedia'));
export function AtlasModule({ domain, onExit, onOpenVent }: { domain: AtlasDomain; onExit?: () => void; onOpenVent?: (scenario:string) => void }) {
  const conditions = useMemo(() => conditionsFor(domain), [domain]);
  const selected = useUI(s=>s.atlasDisease);
  const disease = conditions.find(d => d.id === selected) ?? conditions[0];
  const severity = useUI(s=>s.atlasSeverity);
  const target = useUI(s=>s.atlasTarget);
  const setSeverity=(atlasSeverity:number)=>useUI.getState().set({atlasSeverity});
  const setTarget=(atlasTarget:string)=>useUI.getState().set({atlasTarget});
  const [view, setView] = useState<'diagram' | 'patient'>('diagram');
  const [mediaOpen,setMediaOpen] = useState(false);
  const [result, setResult] = useState<{ decision: Decision; before: DiseaseState; after: DiseaseState } | null>(null);
  const mode = useUI(s => s.mode);
  const tl = useDirector(s => s.tl);
  const active = tl?.id === `atlas-${disease.id}` && mode === 'learn';
  const state = result?.after ?? diseaseState(disease, severity);
  const lesson = useMemo(() => diseaseLesson(disease, (value, next) => { setSeverity(value); setTarget(next); }), [disease]);
  const reset = () => { setResult(null); setSeverity(.5); setTarget('body.whole'); };
  useEffect(() => { reset();setMediaOpen(false); if (useDirector.getState().tl?.id.startsWith('atlas-')) director.unload(); }, [disease.id, mode]);
  useEffect(() => () => { if (useDirector.getState().tl?.id.startsWith('atlas-')) director.unload(); }, []);
  const practice = mode === 'challenge' || mode === 'sim';
  const choose = (decision: Decision) => {
    if (result) return;
    const before = diseaseState(disease, .75); setSeverity(.75); setTarget(disease.target);
    setResult({ decision, before, after: applyDecision(before, decision) });
  };
  useEffect(() => { if (practice) { setSeverity(.75); setTarget(disease.target); } }, [practice, disease.id]);
  const openContext = () => document.querySelector<HTMLButtonElement>('[data-context-button]')?.click();
  const order = useMemo(() => {
    const options = [...disease.decisions]; const offset = [...disease.id].reduce((a,c) => a + c.charCodeAt(0), 0) % options.length;
    return [...options.slice(offset), ...options.slice(0,offset)];
  }, [disease]);
  return <main className="stage atlas-stage">
    <section className="scene-pane atlas-scene" aria-label="Disease visualization">
      <div className="atlas-scene-head"><div><span className="eyebrow">Pathophysiology atlas · {disease.population}</span><h2>{disease.title}</h2></div>
        <div className="atlas-view-switch" role="group" aria-label="Visualization modality"><button aria-pressed={view === 'diagram'} onClick={() => setView('diagram')}>Mechanism</button>{disease.population === 'adult' && <button aria-pressed={view === 'patient'} onClick={() => setView('patient')}>3D patient</button>}</div>
      </div>
      <div className="atlas-visual">
        {view === 'patient' ? <Suspense fallback={<p className="loading">Loading patient anatomy…</p>}><PatientScene disease={disease} state={state} target={target} /></Suspense> : target === 'body.whole' ? <PatientDiagram disease={disease} /> : <DiseaseDiagram disease={disease} state={state} />}
      </div>
      <div className="atlas-camera-actions" role="group" aria-label="Clinical focus"><button aria-pressed={target === 'body.whole'} onClick={() => { director.pause(); setTarget('body.whole'); }}>Whole patient</button><button aria-pressed={target === disease.target} onClick={() => { director.pause(); setTarget(disease.target); }}>Affected anatomy</button>{mode === 'learn' && <button onClick={openContext}>Lesson &amp; progress</button>}</div>
      <p className="atlas-caption">{target === 'body.whole' ? disease.distinction : disease.mechanism}</p>
      <div className="atlas-findings" aria-label="Visual findings">{disease.findings.map(f => <div key={f.channel}><span>{f.label}</span><meter min="0" max="1" value={state[f.channel]} aria-label={`${f.label}, illustrative intensity`} /><span className="sr-only">{Math.round(state[f.channel] * 100)}% of illustrative range</span></div>)}</div>
      <p className="credit">Schematic teaching model. Relative visual intensity is not a measured clinical value or a prediction for a patient. Each visual finding also appears in the written lesson.</p>
    </section>
    <aside id="controls" tabIndex={-1} className="side-pane atlas-context" aria-label="Disease lessons and controls">
      {onExit && <button className="back" onClick={onExit}>← Core curriculum &amp; organ scene</button>}
      <label className="atlas-condition-select">Clinical condition<select value={disease.id} onChange={e => useUI.getState().set({atlasDisease:e.target.value})}>{[...new Set(conditions.map(d => d.group))].map(group => <optgroup key={group} label={group}>{conditions.filter(d => d.group === group).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</optgroup>)}</select></label>
      {mode === 'learn' ? active ? <DirectorPlayer onExit={() => director.unload()} /> : <section className="card"><span className="eyebrow">Guided understanding</span><h3>See → Zoom → Understand → Apply</h3><p>{disease.mechanism}</p><p className="muted">{disease.distinction}</p><button className="act primary" onClick={() => { setResult(null); director.load(lesson, true); }}>Start 4-step lesson</button></section> : !practice ? <section className="card"><h3>Explore the mechanism</h3><label className="atlas-range">Visual progression: {disease.stages[stageIndex(severity)]}<input type="range" min="0" max="1" step=".01" value={severity} onChange={e => { setSeverity(+e.target.value); setTarget(disease.target); }} /></label><p>{disease.mechanism}</p><p className="muted">{disease.distinction}</p><button className="act" onClick={reset}>Reset to comparison</button></section> : <section className="card atlas-case"><span className="eyebrow">Patient → data → decision → consequence</span><h3>Predict the response</h3><p>{disease.question}</p><p className="muted">Current findings: {disease.findings.map(f => f.label.toLowerCase()).join('; ')}.</p>
        {!result ? <div className="atlas-decisions">{order.map(decision => <button key={decision.id} onClick={() => choose(decision)}>{decision.label}</button>)}</div> : <div aria-live="polite"><h4>{result.decision.label}</h4><p>{result.decision.explanation}</p><dl className="atlas-consequence">{disease.findings.map(f => <div key={f.channel}><dt>{f.label}</dt><dd>{result.after[f.channel] < result.before[f.channel] ? 'Decreased' : result.after[f.channel] > result.before[f.channel] ? 'Increased' : 'Persists'}</dd></div>)}</dl><button className="act" onClick={() => { setResult(null); setSeverity(.75); }}>Replay decision</button></div>}
      </section>}
      {active && <button className="act" onClick={()=>useUI.getState().set({mode:'challenge'})}>Apply in Practice</button>}
      {ATLAS_MEDIA[disease.id] && <section className="atlas-real"><button className="act" aria-expanded={mediaOpen} onClick={()=>setMediaOpen(!mediaOpen)}>{mediaOpen?'Close':'Compare'} real imaging</button>{mediaOpen && <Suspense fallback={<p>Loading imaging…</p>}><ClinicalMedia diseaseId={disease.id}/></Suspense>}</section>}
      <details className="atlas-reference"><summary>References &amp; clinical distinction</summary><p>{disease.distinction}</p>{disease.sources.map(source => <p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></p>)}{disease.relatedScenario && onOpenVent && <button className="act" onClick={() => onOpenVent(disease.relatedScenario!)}>Open ventilation scenario</button>}</details>
    </aside>
  </main>;
}

/** Only existing clinical domains receive this secondary curriculum entry. */
export function AtlasEntry({ domain, onOpen }: { domain: AtlasDomain; onOpen: () => void }) {
  const count = conditionsFor(domain).length;
  return <button className="atlas-entry" onClick={onOpen}>Clinical conditions <span>{count}</span></button>;
}
export { DISEASE_BY_ID };
