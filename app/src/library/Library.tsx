/**
 * The library: browse shelves of modules (Home), read a module before starting it, see everything on one
 * shelf, and follow a learning path. Playing a step hands off to the clinical workspace (see launch.ts).
 */
import { lazy, Suspense, useState, type ReactNode } from 'react';
import { useUI, type Module } from '../app/store';
import { useProgress } from '../curriculum/progress';
import { CHALLENGE_CONCEPTS, challengeModule } from '../curriculum/catalog';
import { titleOf } from '../curriculum/titles';
import { BLUEPRINT, TOTAL_ITEMS } from '../fpc/blueprint';
import { FPC_DOMAIN_OF, KIND_LABEL, MODULES, MODULE_BY_ID, PATHS, PATH_BY_ID, SHELVES, SHELF_BY_ID, minutesOf, moduleProgress, modulesOn, stepDone, type LibraryModule, type ShelfId, type Step } from './modules';
import { useLibrary } from './libraryStore';
import { ContentFormatIcon } from './ContentFormatIcon';
import { CLINICAL_THUMBS } from './clinicalThumbs';
import { openLibrary, playModule, playStep, runCase } from './launch';

/* ---------------------------------------------------------------- shared bits */
function useModuleProgress() {
  const completed = useProgress((s) => s.completed); const attempts = useProgress((s) => s.attempts); const passed = useLibrary((s) => s.passed);
  return (id: string) => moduleProgress(id, completed, attempts, passed);
}
export const stepTitle = (s: Step) => (s.kind === 'simulator' ? s.title : titleOf(s.ref));
const pct = (done: number, total: number) => (total ? Math.round((done / total) * 100) : 0);

function Play() { return <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 4l14 8-14 8z" fill="currentColor" /></svg>; }
function Motif({ shelf }: { shelf: ShelfId }) {
  const s = SHELF_BY_ID[shelf];
  return <svg className="lib-motif" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true"><path d={s.motif} fill="none" stroke={s.line} strokeWidth="2.5" /></svg>;
}
/** Own 3D screenshots by default; seven pre-cleared real studies for disease/imaging modules.
 * If clinical art fails to load, fall back to the module's native scene screenshot.
 */
function Thumb({ id, shelf }: { id: string; shelf: ShelfId }) {
  const [failed, setFailed] = useState(0);
  const real = CLINICAL_THUMBS[id];
  const src = real && failed === 0 ? `imaging/real/${real.file}` : `thumbs/${id}.jpg`;
  return failed > (real ? 1 : 0)
    ? <Motif shelf={shelf} />
    : <><img className={`lib-thumb${real && failed === 0 ? ' lib-thumb-clinical' : ''}`} src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed((n) => n + 1)} />
        {real && failed === 0 && <span className="lib-study-marker">Real clinical image</span>}</>;
}
function Bar({ value, label }: { value: number; label: string }) {
  return <span className="lib-bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}><span style={{ width: `${value}%` }} /></span>;
}

function ModuleCard({ m, wide }: { m: LibraryModule; wide?: boolean }) {
  const prog = useModuleProgress()(m.id); const p = pct(prog.done, prog.total);
  return (
    <button className={`lib-card${wide ? ' wide' : ''}`} onClick={() => openLibrary({ page: 'module', id: m.id })}>
      <span className={`lib-art thumb-${m.id}`} style={{ background: SHELF_BY_ID[m.shelf].tone }}>
        <Thumb id={m.id} shelf={m.shelf} />
        {prog.done > 0 && prog.done < prog.total && <span className="lib-chip">In progress</span>}
        {prog.done === prog.total && prog.total > 0 && <span className="lib-chip done">Done</span>}
        {m.isNew && prog.done === 0 && <span className="lib-chip new">New</span>}
        <span className="lib-art-title">{m.art}</span>
        {prog.done > 0 && <Bar value={p} label={`${m.title} progress`} />}
      </span>
      <span className="lib-card-meta"><span className="lib-format-mark" title="Visual learning"><ContentFormatIcon kind="visual" size={16} /><span className="sr-only">Visual learning</span></span><b className="k-module">Module</b><span>{m.steps.length} steps · {minutesOf(m)} min</span></span>
      {wide && <span className="lib-card-title">{m.title}</span>}
    </button>
  );
}

function Row({ title, sub, action, children }: { title: string; sub?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="lib-row" aria-label={title}>
      <div className="lib-row-h"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>{action}</div>
      <div className="lib-scroller">{children}</div>
    </section>
  );
}

function Crumbs({ items }: { items: { label: string; go?: () => void }[] }) {
  return <nav className="lib-crumbs" aria-label="Breadcrumb">{items.map((it, i) => <span key={i}>{i > 0 && <span aria-hidden="true">/</span>}{it.go ? <button onClick={it.go}>{it.label}</button> : <span aria-current="page">{it.label}</span>}</span>)}</nav>;
}

/** Open a clinical workspace directly, outside any module. */
function openFree(module: Module, mode: 'explore' | 'sim' | 'challenge' = 'explore') {
  useLibrary.getState().setPlaying(null); useUI.getState().set({ module, mode, atlasDisease: null });
}

/* ---------------------------------------------------------------- pages */
function Home() {
  const progressOf = useModuleProgress(); const lastPlayed = useLibrary((s) => s.lastPlayed); const myList = useLibrary((s) => s.myList);
  const featured = MODULES.find((m) => m.isNew) ?? MODULES[0];
  const fp = progressOf(featured.id);
  const going = MODULES.filter((m) => { const p = progressOf(m.id); return (p.done > 0 || lastPlayed[m.id]) && p.done < p.total; })
    .sort((a, b) => (lastPlayed[b.id] ?? '').localeCompare(lastPlayed[a.id] ?? ''));
  const starters = ['vent-foundations', 'gas-basics', 'lines-artline', 'neuro-stroke'].map((id) => MODULE_BY_ID[id]);
  return (
    <>
      <section className="lib-hero" style={{ background: SHELF_BY_ID[featured.shelf].tone }}>
        <div className="lib-hero-copy">
          <p className="lib-kicker">{featured.isNew ? 'New module' : 'Featured'} · {SHELF_BY_ID[featured.shelf].title}</p>
          <h1 className="lib-display">{featured.title}</h1>
          <p className="lib-lede">{featured.blurb}</p>
          <div className="lib-actions">
            <button className="lib-btn primary" onClick={() => playModule(featured.id, fp.next)}><Play />{fp.done ? 'Continue module' : 'Start module'}</button>
            <button className="lib-btn" onClick={() => openLibrary({ page: 'module', id: featured.id })}>What’s inside</button>
          </div>
        </div>
        <div className="lib-hero-art" aria-hidden="true"><Thumb id={featured.id} shelf={featured.shelf} /></div>
      </section>

      {going.length > 0
        ? <Row title="Continue learning" sub="Pick up where you left off">{going.map((m) => <ModuleCard key={m.id} m={m} wide />)}</Row>
        : <Row title="Start here" sub="Four short modules that the rest build on">{starters.map((m) => <ModuleCard key={m.id} m={m} wide />)}</Row>}
      {myList.length > 0 && <Row title="My list">{myList.map((id) => MODULE_BY_ID[id]).filter(Boolean).map((m) => <ModuleCard key={m.id} m={m} />)}</Row>}

      {SHELVES.map((s) => (
        <Row key={s.id} title={s.title} action={<button className="lib-link" onClick={() => openLibrary({ page: 'shelf', id: s.id })}>View all<span className="sr-only"> {s.title}</span></button>}>
          {modulesOn(s.id).map((m) => <ModuleCard key={m.id} m={m} />)}
          <SimCard shelf={s.id} />
        </Row>
      ))}

      <Row title="Learning paths" sub="Modules in order, start to finish" action={<button className="lib-link" onClick={() => openLibrary({ page: 'paths' })}>View all<span className="sr-only"> learning paths</span></button>}>
        {PATHS.map((p) => <PathPoster key={p.id} id={p.id} />)}
      </Row>

      <section className="lib-tiles" aria-label="More ways to study">
        <a className="lib-tile" href="audio/"><span><b>Expert audio &amp; Mental Reps</b><small>Listen on the drive in</small></span><ContentFormatIcon kind="audio" size={26} /></a>
        <button className="lib-tile" onClick={() => openFree('fpc')}><span><b>FP-C exam prep</b><small>Blueprint and practice questions</small></span><Play /></button>
        <button className="lib-tile" onClick={() => openFree('videos')}><span><b>Videos &amp; skills</b><small>Equipment, pumps and procedures</small></span><ContentFormatIcon kind="visual" size={26} /></button>
        <button className="lib-tile" onClick={() => openFree('cases')}><span><b>Case conference</b><small>Slides and audio</small></span><Play /></button>
      </section>
    </>
  );
}

function SimCard({ shelf }: { shelf: ShelfId }) {
  const s = SHELF_BY_ID[shelf];
  return (
    <button className="lib-card" onClick={() => openFree(s.module, 'explore')}>
      <span className="lib-art sim" style={{ background: s.tone }}><Motif shelf={shelf} /><span className="lib-art-title">Open the simulator</span></span>
      <span className="lib-card-meta"><b className="k-simulator">Simulator</b><span>Free play, nothing graded</span></span>
    </button>
  );
}

function PathPoster({ id }: { id: string }) {
  const p = PATH_BY_ID[id]; const progressOf = useModuleProgress();
  const done = p.modules.filter((m) => { const x = progressOf(m); return x.total > 0 && x.done === x.total; }).length;
  return (
    <button className="lib-poster" style={{ background: p.tone }} onClick={() => openLibrary({ page: 'path', id })}>
      <span className="lib-poster-k">{p.modules.length} modules{done ? ` · ${done} done` : ''}</span>
      <span><span className="lib-display sm">{p.title}</span><span className="lib-poster-sub">{p.blurb}</span></span>
    </button>
  );
}

function ModulePage({ id }: { id: string }) {
  const m = MODULE_BY_ID[id]; const progressOf = useModuleProgress();
  const completed = useProgress((s) => s.completed); const attempts = useProgress((s) => s.attempts); const passed = useLibrary((s) => s.passed);
  const myList = useLibrary((s) => s.myList);
  if (!m) return <p className="lib-empty">That module no longer exists.</p>;
  const prog = progressOf(id); const shelf = SHELF_BY_ID[m.shelf];
  const paths = PATHS.filter((p) => p.modules.includes(id));
  const saved = myList.includes(id);
  return (
    <>
      <section className="lib-hero" style={{ background: shelf.tone }}>
        <div className="lib-hero-copy">
          <Crumbs items={[{ label: 'Browse', go: () => openLibrary({ page: 'home' }) }, { label: shelf.title, go: () => openLibrary({ page: 'shelf', id: m.shelf }) }, { label: m.title }]} />
          <p className="lib-kicker">Module · {m.steps.length} steps · about {minutesOf(m)} min{prog.done ? ` · ${prog.done} of ${prog.total} done` : ''}</p>
          <h1 className="lib-display">{m.title}</h1>
          <p className="lib-lede">{m.blurb}</p>
          <div className="lib-actions">
            <button className="lib-btn primary" onClick={() => playModule(id, prog.next)}><Play />{prog.done === prog.total ? 'Review module' : prog.done ? `Continue: step ${prog.next + 1}` : 'Start module'}</button>
            <button className="lib-btn" aria-pressed={saved} onClick={() => useLibrary.getState().toggleList(id)}>{saved ? '✓ In my list' : '+ My list'}</button>
          </div>
        </div>
      </section>
      <div className="lib-columns">
        <section className="lib-col-main" aria-labelledby="inside-h">
          <h2 id="inside-h">What’s inside</h2>
          <ol className="lib-steps">
            {m.steps.map((s, i) => {
              const done = stepDone(id, i, completed, attempts, passed);
              return <li key={i}><button className={`lib-step${done ? ' done' : ''}`} onClick={() => playStep(id, i)}>
                <span className="lib-step-n" aria-hidden="true">{done ? '✓' : i + 1}</span>
                <span className="lib-step-body"><b className={`k-${s.kind}`}>{KIND_LABEL[s.kind]}</b><span>{stepTitle(s)}</span></span>
                <span className="lib-step-time">{s.minutes} min{done ? <span className="sr-only">, done</span> : ''}</span>
              </button></li>;
            })}
          </ol>
        </section>
        <aside className="lib-col-side">
          <div className="lib-panel"><h2>You’ll be able to</h2><ul>{m.outcomes.map((o) => <li key={o}>{o}</li>)}</ul></div>
          {CLINICAL_THUMBS[id] && <div className="lib-panel lib-reference-credit">
            <h2>Thumbnail: real clinical reference</h2>
            <p>Different patient, illustrative only — not the simulated patient.</p>
            <p>{CLINICAL_THUMBS[id].title} · {CLINICAL_THUMBS[id].credit}</p>
            <a href={CLINICAL_THUMBS[id].sourceUrl} target="_blank" rel="noreferrer">Original source</a>
            <a href={CLINICAL_THUMBS[id].licenseUrl} target="_blank" rel="noreferrer">{CLINICAL_THUMBS[id].license} license</a>
          </div>}
          {paths.length > 0 && <div className="lib-panel"><h2>Part of</h2>{paths.map((p) => <button key={p.id} className="lib-link" onClick={() => openLibrary({ page: 'path', id: p.id })}>{p.title} · module {p.modules.indexOf(id) + 1} of {p.modules.length}</button>)}</div>}
        </aside>
      </div>
    </>
  );
}

type Filter = 'all' | 'module' | 'simulator' | 'case';
const FILTERS: { key: Filter; label: string }[] = [{ key: 'all', label: 'All' }, { key: 'module', label: 'Modules' }, { key: 'simulator', label: 'Simulators' }, { key: 'case', label: 'Cases' }];
const SHELF_CASE_MODULES: Record<ShelfId, string[]> = { resp: ['vent'], gas: ['abg', 'labs'], hemo: ['lines'], cardiac: ['heart'], neuro: ['neuro'], abdomen: ['abdomen'], special: [], pharm: [] };
/** Cases on a shelf: those its modules use, plus every challenge that runs in the shelf's engines. */
export function casesOn(shelf: ShelfId | 'all'): string[] {
  const mods = shelf === 'all' ? MODULES : modulesOn(shelf);
  const fromModules = mods.flatMap((m) => m.steps.filter((s) => s.kind === 'case').map((s) => (s as { ref: string }).ref));
  const fromEngines = Object.keys(CHALLENGE_CONCEPTS).filter((id) => shelf === 'all' || SHELF_CASE_MODULES[shelf].includes(challengeModule(id)));
  return [...new Set([...fromModules, ...fromEngines])];
}

function ShelfPage({ id, initial }: { id: ShelfId | 'all'; initial?: Filter }) {
  const [filter, setFilter] = useState<Filter>(initial ?? 'all');
  const attempts = useProgress((s) => s.attempts);
  const shelf = id === 'all' ? null : SHELF_BY_ID[id];
  const mods = id === 'all' ? MODULES : modulesOn(id);
  const sims = (id === 'all' ? SHELVES : [shelf!]).map((s) => s.id);
  const cases = casesOn(id);
  const heading = shelf?.title ?? (initial === 'case' ? 'Cases' : 'Everything');
  const count = (filter === 'all' || filter === 'module' ? mods.length : 0) + (filter === 'all' || filter === 'simulator' ? sims.length : 0) + (filter === 'all' || filter === 'case' ? cases.length : 0);
  return (
    <div className="lib-page">
      <Crumbs items={[{ label: 'Browse', go: () => openLibrary({ page: 'home' }) }, { label: heading }]} />
      <h1 className="lib-display">{heading}</h1>
      <p className="lib-lede">{shelf?.blurb ?? (initial === 'case' ? 'Every patient case in the app. Each one ends with a debrief.' : 'Every module, simulator and case in the app.')}</p>
      <div className="lib-filters" role="group" aria-label="Filter by type">
        {FILTERS.map((f) => <button key={f.key} aria-pressed={filter === f.key} className={filter === f.key ? 'on' : ''} onClick={() => setFilter(f.key)}>{f.label}</button>)}
      </div>
      <p className="lib-count" aria-live="polite">{count} items</p>
      <div className="lib-grid">
        {(filter === 'all' || filter === 'module') && mods.map((m) => <ModuleCard key={m.id} m={m} wide />)}
        {(filter === 'all' || filter === 'simulator') && sims.map((s) => <SimCard key={s} shelf={s} />)}
        {(filter === 'all' || filter === 'case') && cases.map((c) => {
          const passedCase = attempts[c]?.some((a) => a.ok);
          return <button key={c} className="lib-case" onClick={() => runCase(c)}>
            <b className="k-case">Case{passedCase ? ' · passed' : ''}</b><span>{titleOf(c)}</span>
          </button>;
        })}
      </div>
    </div>
  );
}

function PathsPage() {
  return (
    <div className="lib-page">
      <Crumbs items={[{ label: 'Browse', go: () => openLibrary({ page: 'home' }) }, { label: 'Learning paths' }]} />
      <h1 className="lib-display">Learning paths</h1>
      <p className="lib-lede">Modules put in order, start to finish.</p>
      <div className="lib-grid posters">{PATHS.map((p) => <PathPoster key={p.id} id={p.id} />)}</div>
    </div>
  );
}

interface PathSection { key: string; title: string; note?: string; modules: LibraryModule[] }
/** The FP-C plan groups by blueprint domain (with exam weight); other paths group by body system. */
function pathSections(id: string, mods: LibraryModule[]): PathSection[] {
  if (id === 'fpc') return BLUEPRINT.map((d) => ({ key: d.id, title: `${d.num} · ${d.title}`, note: `${d.items} of ${TOTAL_ITEMS} exam items`, modules: mods.filter((m) => FPC_DOMAIN_OF[m.id] === d.id) }));
  return SHELVES.map((s) => ({ key: s.id, title: s.title, modules: mods.filter((m) => m.shelf === s.id) })).filter((s) => s.modules.length);
}

function PathPage({ id }: { id: string }) {
  const p = PATH_BY_ID[id]; const progressOf = useModuleProgress();
  const [section, setSection] = useState<string | null>(null);
  if (!p) return <p className="lib-empty">That learning path no longer exists.</p>;
  const mods = p.modules.map((m) => MODULE_BY_ID[m]).filter(Boolean);
  const isDone = (m: LibraryModule) => { const x = progressOf(m.id); return x.total > 0 && x.done === x.total; };
  const done = mods.filter(isDone).length;
  const next = mods.find((m) => !isDone(m));
  const sections = pathSections(id, mods);
  const cur = sections.find((s) => s.key === section) ?? null;
  const shown = cur ? cur.modules : mods;
  const sectionOf = (m: LibraryModule) => sections.find((s) => s.modules.includes(m))?.title ?? SHELF_BY_ID[m.shelf].title;
  return (
    <>
      <section className="lib-hero" style={{ background: p.tone }}>
        <div className="lib-hero-copy">
          <Crumbs items={[{ label: 'Browse', go: () => openLibrary({ page: 'home' }) }, { label: 'Learning paths', go: () => openLibrary({ page: 'paths' }) }, { label: p.title }]} />
          <p className="lib-kicker">Learning path · {mods.length} modules</p>
          <h1 className="lib-display">{p.title}</h1>
          <p className="lib-lede">{p.blurb}</p>
        </div>
        <div className="lib-path-progress">
          <div><span>Overall</span><b>{done} / {mods.length}</b></div>
          <Bar value={pct(done, mods.length)} label={`${p.title} progress`} />
          {next && <button className="lib-btn primary" onClick={() => playModule(next.id, progressOf(next.id).next)}><Play />Continue: {next.title}</button>}
        </div>
      </section>
      <div className="lib-columns">
        {sections.length > 1 && <aside className="lib-col-side first" aria-label="Sections">
          <h2>{id === 'fpc' ? 'By exam domain' : 'By section'}</h2>
          <button className={`lib-section${section === null ? ' on' : ''}`} aria-pressed={section === null} onClick={() => setSection(null)}><span>All {id === 'fpc' ? 'domains' : 'sections'}</span></button>
          {sections.map((s) => {
            const d = s.modules.filter(isDone).length;
            return <button key={s.key} className={`lib-section${section === s.key ? ' on' : ''}${s.modules.length ? '' : ' empty'}`} aria-pressed={section === s.key} onClick={() => setSection(s.key)}>
              <span>{s.title}<small>{s.modules.length ? `${d}/${s.modules.length}` : '—'}</small></span>
              {s.note && <small className="lib-section-note">{s.note}</small>}
              {s.modules.length > 0 && <Bar value={pct(d, s.modules.length)} label={`${s.title} progress`} />}
            </button>;
          })}
        </aside>}
        <section className="lib-col-main" aria-label="Modules in order">
          {cur && <h2>{cur.title}</h2>}
          {cur && !cur.modules.length && <div className="lib-panel">
            <p className="lib-lede">No module covers this domain yet. FP-C exam prep has its lessons and practice questions.</p>
            <button className="lib-btn primary" onClick={() => openFree('fpc')}>Open FP-C exam prep</button>
          </div>}
          <ol className="lib-steps">
            {shown.map((m) => {
              const x = progressOf(m.id); const n = mods.indexOf(m) + 1; const complete = isDone(m);
              return <li key={m.id}><button className={`lib-step${complete ? ' done' : ''}${next?.id === m.id ? ' now' : ''}`} onClick={() => openLibrary({ page: 'module', id: m.id })}>
                <span className="lib-step-n" aria-hidden="true">{complete ? '✓' : n}</span>
                <span className="lib-step-body"><b className="k-module">{sectionOf(m)}</b><span>{m.title}</span></span>
                <span className="lib-step-time">{x.done}/{x.total} steps</span>
              </button></li>;
            })}
          </ol>
          {id === 'fpc' && !cur && <p className="lib-count">Domains with no module yet ({sections.filter((s) => !s.modules.length).map((s) => s.title.split(' · ')[1]).join(', ')}) are covered in <button className="lib-link inline" onClick={() => openFree('fpc')}>FP-C exam prep</button>.</p>}
        </section>
      </div>
    </>
  );
}

const AudioHome = lazy(() => import('./audio/AudioHome'));

/** Lessons / Audio switch at the top of Browse: two separate home pages, the choice remembered */
function ModeToggle() {
  const mode = useLibrary((s) => s.mode);
  return (
    <div className="lib-mode">
      <div className="lib-mode-seg" role="group" aria-label="Browse mode">
        <button aria-pressed={mode === 'lessons'} className={mode === 'lessons' ? 'on' : ''} onClick={() => useLibrary.getState().setMode('lessons')}>
          <ContentFormatIcon kind="visual" />Lessons</button>
        <button aria-pressed={mode === 'audio'} className={mode === 'audio' ? 'on' : ''} onClick={() => useLibrary.getState().setMode('audio')}>
          <ContentFormatIcon kind="audio" />Audio</button>
      </div>
      <span className="lib-mode-hint">{mode === 'audio' ? 'Expert sessions and voice-guided Mental Reps' : 'Guided visual lessons, simulators and cases'}</span>
    </div>
  );
}

export function Library() {
  const view = useLibrary((s) => s.view); const mode = useLibrary((s) => s.mode);
  return (
    <main id="library-main" className="library" tabIndex={-1} aria-label="Library">
      {view.page === 'home' && <><ModeToggle />{mode === 'audio' ? <Suspense fallback={<div className="module-loading" role="status"><span>Loading</span></div>}><AudioHome /></Suspense> : <Home />}</>}
      {view.page === 'module' && <ModulePage id={view.id} />}
      {view.page === 'shelf' && <ShelfPage key={`${view.id}-${view.filter ?? ''}`} id={view.id} initial={view.filter} />}
      {view.page === 'paths' && <PathsPage />}
      {view.page === 'path' && <PathPage id={view.id} />}
    </main>
  );
}
