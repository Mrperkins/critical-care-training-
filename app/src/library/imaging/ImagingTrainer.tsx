/**
 * Clinical Imaging Trainer: one real study at a time, with a commit-before-reveal
 * interpretation question, source/license visibility, and saved review progress.
 * Uses the existing clinical media catalog rather than inventing new findings.
 */
import { useEffect, useMemo, useState } from 'react';
import { RealCaseCard } from '../../scene/imaging/RealCase';
import type { RealItem } from '../../scene/imaging/RealExamples';
import { MODULE_BY_ID } from '../modules';
import { openLibrary } from '../launch';
import { MODALITY_LABEL, loadImagingStudies, modalityOf, isRemoteStudy, studiesForCourse, type ImagingModality } from './catalog';

type Mode = ImagingModality | 'all';
interface Attempt { correct: boolean | null; attempts: number; updated: string }
type Progress = Record<string, Attempt>;
const STORE = 'ccp.imaging.trainer.v1';
function readProgress(): Progress {
  try {
    const data = JSON.parse(globalThis.localStorage?.getItem(STORE) ?? '{}') as Progress;
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch { return {}; }
}
function saveProgress(data: Progress) {
  try { globalThis.localStorage?.setItem(STORE, JSON.stringify(data)); } catch { /* private mode or full storage */ }
}
const MODES: Mode[] = ['all', 'xray', 'ct', 'mri', 'ultrasound'];
const labelOf = (m: Mode) => m === 'all' ? 'All studies' : MODALITY_LABEL[m];
const photoOf = (it: RealItem) => isRemoteStudy(it) ? it.file : `imaging/real/${it.poster || it.file}`;

export function ImagingTrainer({ initialModality, moduleId, initialId }: {
  initialModality?: ImagingModality; moduleId?: string; initialId?: string;
}) {
  const [items, setItems] = useState<RealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modality, setModality] = useState<Mode>(initialModality ?? 'all');
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<string | null>(initialId ?? null);
  const [showAll, setShowAll] = useState(false);
  const [progress, setProgress] = useState<Progress>(readProgress);
  useEffect(() => {
    let mounted = true;
    loadImagingStudies().then((all) => { if (mounted) { setItems(all); setLoading(false); } })
      .catch(() => { if (mounted) { setLoading(false); setError(true); } });
    return () => { mounted = false; };
  }, []);
  const course = moduleId ? MODULE_BY_ID[moduleId] : undefined;
  const relevant = useMemo(() => moduleId ? studiesForCourse(items, moduleId) : items, [items, moduleId]);
  const filtered = useMemo(() => relevant.filter((it) => {
    if (modality !== 'all' && modalityOf(it) !== modality) return false;
    if (!query.trim()) return true;
    const haystack = [it.title, it.modality, it.finding, it.caption, ...it.look].join(' ').toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  }), [relevant, modality, query]);
  const current = filtered.find((it) => it.id === chosen) ?? filtered[0];
  const currentIndex = current ? filtered.indexOf(current) : -1;
  const completed = relevant.filter((it) => progress[it.id]);
  const correct = completed.filter((it) => progress[it.id].correct === true).length;
  const answered = current ? progress[current.id] : undefined;
  const onComplete = (it: RealItem, result: boolean | null) => {
    setProgress((old) => {
      const previous = old[it.id];
      const next: Progress = { ...old, [it.id]: {
        correct: result, attempts: (previous?.attempts ?? 0) + 1, updated: new Date().toISOString(),
      }};
      saveProgress(next);
      return next;
    });
  };
  const goto = (idx: number) => setChosen(filtered[idx]?.id ?? null);
  const upcoming = filtered.find((it) => !progress[it.id]);
  const visibleList = showAll ? filtered : filtered.slice(0, 36);
  return (
    <div className="img-trainer lib-page">
      <nav className="lib-crumbs" aria-label="Breadcrumb">
        <button onClick={() => openLibrary({ page: 'home' })}>Browse</button>
        {course && <><span aria-hidden="true">/</span><button onClick={() => openLibrary({ page: 'module', id: course.id })}>{course.title}</button></>}
        <span aria-hidden="true">/</span><span aria-current="page">Imaging trainer</span>
      </nav>
      <header className="img-head">
        <p className="lib-kicker">Visual practice · real patient images</p>
        <h1 className="lib-display">Clinical imaging trainer</h1>
        <p className="lib-lede">Inspect an X-ray, CT, MRI, or ultrasound before reading the answer. Each study is a different real patient — not the patient in your simulator. Teaching only; never for patient diagnosis.</p>
        {course && <p className="img-course-label">Course collection: <b>{course.title}</b>
          <button className="lib-link" onClick={() => openLibrary({ page: 'imaging' })}>View entire imaging library</button></p>}
      </header>
      {loading && <p role="status" className="lib-empty">Loading verified clinical imaging studies…</p>}
      {error && <p role="alert" className="lib-empty">The clinical imaging catalog could not load. Reconnect and try again.</p>}
      {!loading && !error && <>
        <div className="img-progress" role="status" aria-live="polite">
          <span><b>{completed.length}</b> / {relevant.length} reviewed</span>
          <span>{correct} correct on latest attempts</span>
          <span>{items.filter((i) => modalityOf(i) === 'mri').length} MRI studies require an internet connection</span>
        </div>
        <div className="lib-filters" role="group" aria-label="Filter studies by imaging modality">
          {MODES.map((m) => <button key={m} className={modality === m ? 'on' : ''} aria-pressed={modality === m} onClick={() => { setModality(m); setChosen(null); setShowAll(false); }}>
            {labelOf(m)} <span className="img-filter-count">{relevant.filter((it) => m === 'all' || modalityOf(it) === m).length}</span>
          </button>)}
        </div>
        <label className="img-search-label">Find an imaging study
          <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setChosen(null); }} placeholder="Try stroke, pneumothorax, FAST, aneurysm…" />
        </label>
        <div className="img-layout">
          <aside className="img-study-list" aria-label="Imaging studies">
            <div className="img-study-list-top">
              <b>{filtered.length} studies</b>
              {upcoming && <button className="lib-link" onClick={() => setChosen(upcoming.id)}>Next unreviewed</button>}
            </div>
            {visibleList.map((it, idx) => <button key={it.id} type="button" className={`img-study-choice${current?.id === it.id ? ' on' : ''}`}
              aria-current={current?.id === it.id ? 'true' : undefined} onClick={() => setChosen(it.id)}>
              <span className="img-study-index">{String(idx + 1).padStart(2,'0')}</span>
              <span className="img-study-description"><b>{progress[it.id] ? it.title : `${MODALITY_LABEL[modalityOf(it)!]} study ${idx + 1}`}</b>
                <small>{MODALITY_LABEL[modalityOf(it)!]} {isRemoteStudy(it) ? '· Online' : ''} {progress[it.id] ? progress[it.id].correct === true ? '· Correct' : progress[it.id].correct === false ? '· Review' : '· Viewed' : '· Not attempted'}</small>
              </span>
            </button>)}
            {filtered.length > visibleList.length && <button className="lib-btn" onClick={() => setShowAll(true)}>Show all {filtered.length} studies</button>}
          </aside>
          <section className="img-study-workspace" aria-label="Imaging interpretation">
            {current ? <>
              <div className="img-current-top">
                <div><p className="lib-kicker">{MODALITY_LABEL[modalityOf(current)!]} · Study {currentIndex + 1} of {filtered.length}</p>
                  <h2>{answered ? current.title : 'What do you see?'}</h2></div>
                <span className={`img-status${answered ? ' reviewed' : ''}`}>{answered ? 'Reviewed' : 'Not yet answered'}</span>
              </div>
              {isRemoteStudy(current) && <p className="img-online-note">This openly licensed MRI is hosted by Wikimedia Commons and requires an internet connection. <a href={current.provenance?.pageUrl} target="_blank" rel="noreferrer">Source</a></p>}
              <RealCaseCard key={current.id} it={current} practice onComplete={(result) => onComplete(current, result)} />
              <div className="img-trainer-actions">
                <button className="lib-btn" disabled={currentIndex <= 0} onClick={() => goto(currentIndex - 1)}>Previous study</button>
                <button className="lib-btn primary" disabled={currentIndex >= filtered.length - 1} onClick={() => goto(currentIndex + 1)}>Next study</button>
              </div>
            </> : <div className="lib-empty">No matching studies. Try another modality or search term.</div>}
          </section>
        </div>
      </>}
    </div>
  );
}
