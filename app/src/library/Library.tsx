/**
 * The library: browse shelves of modules (Home), read a module before starting it, see everything on one
 * shelf, and follow a learning path. Playing a step hands off to the clinical workspace (see launch.ts).
 */
import { lazy, Suspense, useMemo, useState } from 'react';
import { useUI, type Module } from '../app/store';
import { useProgress } from '../curriculum/progress';
import { CHALLENGE_CONCEPTS, challengeModule } from '../curriculum/catalog';
import { titleOf } from '../curriculum/titles';
import { BLUEPRINT, TOTAL_ITEMS } from '../fpc/blueprint';
import { FPC_DOMAIN_OF, KIND_LABEL, MODULES, MODULE_BY_ID, PATHS, PATH_BY_ID, SHELVES, SHELF_BY_ID, minutesOf, moduleProgress, modulesOn, stepDone, type LibraryModule, type ShelfId, type Step } from './modules';
import { useLibrary } from './libraryStore';
import { ContentFormatIcon } from './ContentFormatIcon';
import { CourseImaging } from './imaging/CourseImaging';
import { CLINICAL_THUMBS } from './clinicalThumbs';
import { openLibrary, playModule, playStep, runCase, runMission } from './launch';
import { MISSIONS, missionResults } from './missions';
import { downloadBackup, readBackup, restoreBackup } from './backup';
import { OfflinePage } from './OfflinePage';
import { AccentTitle, Banner, HeroImage, PATH_ACCENT, PATH_HERO, Row, SHELF_ACCENT, coverStyle } from './Shelf';
import { LEVELS, bestStars, caseLevel, caseShelf, dailyCase, streak, type CaseLevel } from './caseMeta';
import { useReadiness } from './fpcReadiness';
import { conditionsFor } from '../atlas/registry';
import type { AtlasDomain } from '../atlas/types';

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

function ModuleCard({ m }: { m: LibraryModule }) {
  const prog = useModuleProgress()(m.id); const p = pct(prog.done, prog.total);
  const saved = useLibrary((s) => s.myList.includes(m.id));
  return (
    <div className="lib-tile-wrap">
      <button className="lib-card" onClick={() => openLibrary({ page: 'module', id: m.id })}>
        <span className={`lib-art cover thumb-${m.id}`} style={{ background: SHELF_BY_ID[m.shelf].tone, ...coverStyle(SHELF_ACCENT[m.shelf].c, SHELF_BY_ID[m.shelf].tone) }}>
          <Thumb id={m.id} shelf={m.shelf} />
          <span className="lib-edge" aria-hidden="true" />
          <span className="lib-art-kicker">{SHELF_ACCENT[m.shelf].label}</span>
          {prog.done > 0 && prog.done < prog.total && <span className="lib-chip">In progress</span>}
          {prog.done === prog.total && prog.total > 0 && <span className="lib-chip done">Done</span>}
          {m.isNew && prog.done === 0 && <span className="lib-chip new">New</span>}
          <span className="lib-art-text">
            <span className="lib-art-title"><AccentTitle text={m.art} /></span>
            <span className="lib-art-meta"><ContentFormatIcon kind="visual" size={13} /><span className="sr-only">Visual learning · </span><span className="lib-meta-kind">Module · </span>{m.steps.length} steps · {minutesOf(m)} min</span>
          </span>
          {prog.done > 0 && <Bar value={p} label={`${m.title} progress`} />}
        </span>
      </button>
      <button className="lib-save" aria-pressed={saved} aria-label={saved ? `Remove ${m.title} from My list` : `Add ${m.title} to My list`} title={saved ? 'In my list' : 'Add to my list'} onClick={() => useLibrary.getState().toggleList(m.id)}>{saved ? '✓' : '+'}</button>
    </div>
  );
}

function Crumbs({ items }: { items: { label: string; go?: () => void }[] }) {
  return <nav className="lib-crumbs" aria-label="Breadcrumb">{items.map((it, i) => <span key={i}>{i > 0 && <span aria-hidden="true">/</span>}{it.go ? <button onClick={it.go}>{it.label}</button> : <span aria-current="page">{it.label}</span>}</span>)}</nav>;
}

/** Open a clinical workspace directly, outside any module. */
function openFree(module: Module, mode: 'explore' | 'sim' | 'challenge' | 'learn' = 'explore') {
  useLibrary.getState().setPlaying(null); useUI.getState().set({ module, mode, atlasDisease: null });
}

/* ---------------------------------------------------------------- pages */
/** A still for each system (the hero render of one of its modules). */
const SYSTEM_ART: Record<ShelfId, string> = { resp: 'vent-ards', gas: 'gas-basics', hemo: 'lines-devices', cardiac: 'cardiac-mi', neuro: 'neuro-stroke', abdomen: 'abd-fast', special: 'peds-sick-child', pharm: 'gas-lytes' };
const SHELF_ATLAS: Record<ShelfId, AtlasDomain[]> = { resp: ['vent'], gas: ['labs'], hemo: ['lines'], cardiac: ['heart'], neuro: ['neuro'], abdomen: ['abdomen'], special: ['pediatrics', 'womens'], pharm: [] };
const ATLAS_MODULE: Record<AtlasDomain, Module> = { vent: 'vent', labs: 'labs', lines: 'lines', heart: 'heart', neuro: 'neuro', abdomen: 'abdomen', pediatrics: 'pediatrics', womens: 'womens' } as Record<AtlasDomain, Module>;
const openCondition = (domain: AtlasDomain, id: string) => { useLibrary.getState().setPlaying(null); useUI.getState().set({ module: ATLAS_MODULE[domain], mode: 'learn', atlasDisease: id }); };

function useCaseState() {
  const attempts = useProgress((s) => s.attempts);
  return useMemo(() => {
    const all = casesOn('all'); const passed = (id: string) => !!attempts[id]?.some((a) => a.ok);
    const due = all.filter((id) => { const a = attempts[id]; return !!a?.length && !a[a.length - 1].ok; });
    return { all, passed, due, today: dailyCase(all, passed) };
  }, [attempts]);
}
function useStreak() {
  const completed = useProgress((s) => s.completed); const attempts = useProgress((s) => s.attempts); const passed = useLibrary((s) => s.passed); const last = useLibrary((s) => s.lastPlayed);
  return useMemo(() => streak([...Object.values(completed), ...Object.values(attempts).flat().map((a) => a.at), ...Object.values(passed), ...Object.values(last)]), [completed, attempts, passed, last]);
}
function shelfProgress(id: ShelfId, progressOf: (id: string) => { done: number; total: number }) {
  const mods = modulesOn(id); const done = mods.filter((m) => { const p = progressOf(m.id); return p.total > 0 && p.done === p.total; }).length;
  return { done, total: mods.length };
}
function SystemTile({ id }: { id: ShelfId }) {
  const s = SHELF_BY_ID[id]; const progressOf = useModuleProgress(); const p = shelfProgress(id, progressOf);
  return (
    <button className="sys-tile" style={coverStyle(SHELF_ACCENT[id].c, s.tone)} onClick={() => openLibrary({ page: 'shelf', id })}>
      <HeroImage name={SYSTEM_ART[id]} sizes="(max-width: 760px) 50vw, 25vw" />
      <span className="sys-tile-copy"><b>{s.title}</b><small>{p.total} module{p.total === 1 ? '' : 's'}{p.done ? ` · ${p.done} done` : ''}</small></span>
      {p.done > 0 && <Bar value={pct(p.done, p.total)} label={`${s.title} progress`} />}
    </button>
  );
}
function CaseCard({ id, stars }: { id: string; stars?: number }) {
  const attempts = useProgress((s) => s.attempts); const passedCase = attempts[id]?.some((a) => a.ok); const tried = !!attempts[id]?.length;
  const level = caseLevel(id); const shelf = caseShelf(id);
  return (
    <button className="lib-case rich" style={coverStyle(SHELF_ACCENT[shelf].c, SHELF_BY_ID[shelf].tone)} onClick={() => runCase(id)}>
      <b className="k-case">{SHELF_ACCENT[shelf].label}{level ? ` · ${level}` : ''}</b>
      <span>{titleOf(id)}</span>
      <small className={passedCase ? 'ok' : tried ? 'retry' : ''}>{stars ? `${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 3 - stars))} ` : ''}{passedCase ? 'Passed' : tried ? 'Try again' : 'Not started'}</small>
    </button>
  );
}

/** Today: what to do next, in one glance. */
function Home() {
  const progressOf = useModuleProgress(); const lastPlayed = useLibrary((s) => s.lastPlayed); const myList = useLibrary((s) => s.myList);
  const cases = useCaseState(); const days = useStreak(); const ready = useReadiness();
  const going = MODULES.filter((m) => { const p = progressOf(m.id); return (p.done > 0 || lastPlayed[m.id]) && p.done < p.total; })
    .sort((a, b) => (lastPlayed[b.id] ?? '').localeCompare(lastPlayed[a.id] ?? ''));
  const cur = going[0] ?? MODULES.find((m) => m.isNew) ?? MODULES[0];
  const cp = progressOf(cur.id); const started = going.length > 0; const nextStep = cur.steps[Math.min(cp.next, cur.steps.length - 1)];
  const weakest = ready ? [...ready.domains].filter((d) => d.lessons > 0).sort((a, b) => a.pct - b.pct || b.items - a.items).slice(0, 2) : [];
  return (
    <>
      <div className="td-top">
        <section className="lib-hero has-img td-continue" style={{ background: SHELF_BY_ID[cur.shelf].tone }} aria-label={started ? 'Continue' : 'Start here'}>
          <HeroImage name={cur.id} />
          <div className="lib-hero-copy">
            <p className="lib-kicker">{started ? `Continue · step ${cp.next + 1} of ${cur.steps.length}` : `Start here · ${SHELF_BY_ID[cur.shelf].title}`}</p>
            <h1 className="lib-display">{cur.title}</h1>
            <p className="lib-lede">{started ? `Next: ${KIND_LABEL[nextStep.kind]} · ${stepTitle(nextStep)} · ${nextStep.minutes} min` : cur.blurb}</p>
            {started && <Bar value={pct(cp.done, cp.total)} label={`${cur.title} progress`} />}
            <div className="lib-actions">
              <button className="lib-btn primary" onClick={() => playModule(cur.id, cp.next)}><Play />{started ? 'Resume' : 'Start module'}</button>
              <button className="lib-btn" onClick={() => openLibrary({ page: 'module', id: cur.id })}>What’s inside</button>
            </div>
          </div>
        </section>
        <div className="td-side">
          {cases.today && <section className="td-card" aria-label="Today’s case">
            <p className="lib-kicker">Today’s case · about 5 min</p>
            <h2>{titleOf(cases.today)}</h2>
            <p className="td-sub">{SHELF_BY_ID[caseShelf(cases.today)].title}{caseLevel(cases.today) ? ` · ${caseLevel(cases.today)}` : ''}</p>
            <div className="lib-actions"><button className="lib-btn accent" onClick={() => runCase(cases.today!)}><Play />Play</button>{days > 0 && <span className="td-streak">{days}-day streak</span>}</div>
          </section>}
          <section className="td-card" aria-label="Review">
            <p className="lib-kicker">Due for review</p>
            {cases.due.length
              ? <><p className="td-num"><b>{cases.due.length}</b><span>case{cases.due.length === 1 ? '' : 's'} you missed last time</span></p>
                  <div className="lib-actions"><button className="lib-btn" onClick={() => runCase(cases.due[0])}>Review: {titleOf(cases.due[0])}</button></div></>
              : <p className="td-sub">Nothing due. Cases you miss come back here.</p>}
          </section>
        </div>
      </div>

      <section className="lib-row td-systems" aria-label="Systems">
        <div className="lib-row-h"><h2>Systems</h2><button className="lib-link" onClick={() => openLibrary({ page: 'learn' })}>Learning paths<span className="sr-only"> and all systems</span></button></div>
        <div className="sys-grid">{SHELVES.map((s) => <SystemTile key={s.id} id={s.id} />)}</div>
      </section>

      <div className="td-row2">
        <section className="td-card" aria-label="FP-C readiness">
          <p className="lib-kicker">FP-C readiness</p>
          {ready ? <div className="td-ready">
            <span className="td-ring" style={{ background: `conic-gradient(var(--lib-yellow) 0 ${ready.pct}%, #262b36 0)` }} role="img" aria-label={`${ready.pct} percent ready`}><i>{ready.pct}%</i></span>
            <div><p className="td-sub">{ready.pct === 0 ? 'Answer exam questions to build your score.' : 'Weighted by the exam’s 110 scored items.'}</p>
              {ready.pct > 0 && weakest.length > 0 && <p className="td-weak">Weakest: {weakest.map((d) => d.title).join(' · ')}</p>}</div>
          </div> : <p className="td-sub">Loading…</p>}
          <div className="lib-actions"><button className="lib-btn" onClick={() => openFree('fpc')}>Open exam prep</button></div>
        </section>
        <section className="td-card" aria-label="Listen">
          <p className="lib-kicker">On the drive in</p>
          <h2>Listen</h2>
          <p className="td-sub">79 sessions and 20 voice-guided mental reps. Computer-narrated; clinical review in progress.</p>
          <div className="lib-actions"><button className="lib-btn" onClick={() => openLibrary({ page: 'listen' })}>Open Listen</button></div>
        </section>
        <section className="td-card" aria-label="Transport simulator">
          <p className="lib-kicker">Fly it</p>
          <h2>Interfacility transport</h2>
          <p className="td-sub">A septic patient on norepinephrine, by air. Manage the lines, the pressure and the altitude from pickup to handover.</p>
          <div className="lib-actions"><button className="lib-btn" onClick={() => openFree('lines', 'sim')}>Start the transport</button></div>
        </section>
      </div>

      {going.length > 1 && <Row title="Also in progress">{going.slice(1).map((m) => <ModuleCard key={m.id} m={m} />)}</Row>}
      {myList.length > 0 && <Row title="My list">{myList.map((id) => MODULE_BY_ID[id]).filter(Boolean).map((m) => <ModuleCard key={m.id} m={m} />)}</Row>}
    </>
  );
}

/** Learn: every system, then the ordered paths. */
function LearnPage() {
  return (
    <div className="lib-page">
      <h1 className="lib-display">Learn</h1>
      <p className="lib-lede">Pick a body system, or follow a path that puts the modules in order.</p>
      <div className="sys-grid big">{SHELVES.map((s) => <SystemTile key={s.id} id={s.id} />)}</div>
      <Row title="Learning paths" posters>{PATHS.map((p) => <PathPoster key={p.id} id={p.id} />)}</Row>
    </div>
  );
}

/** One page per body system: its modules in order, the simulator, cases, conditions and imaging. */
function SystemHub({ id }: { id: ShelfId }) {
  const shelf = SHELF_BY_ID[id]; const progressOf = useModuleProgress(); const mods = modulesOn(id); const sp = shelfProgress(id, progressOf);
  const cases = casesOn(id); const stars = useMemo(bestStars, []);
  const conditions = SHELF_ATLAS[id].flatMap((d) => conditionsFor(d).map((c) => ({ d, c })));
  const [allCond, setAllCond] = useState(false);
  const nextMod = mods.find((m) => { const p = progressOf(m.id); return p.done < p.total; });
  const engines = SHELF_CASE_MODULES[id];
  return (
    <>
      <section className="lib-hero has-img sys-hero" style={{ background: shelf.tone }}>
        <HeroImage name={SYSTEM_ART[id]} />
        <div className="lib-hero-copy">
          <Crumbs items={[{ label: 'Learn', go: () => openLibrary({ page: 'learn' }) }, { label: shelf.title }]} />
          <p className="lib-kicker">System · {mods.length} module{mods.length === 1 ? '' : 's'} · {cases.length} cases{conditions.length ? ` · ${conditions.length} conditions` : ''}{sp.done ? ` · ${sp.done} of ${sp.total} modules done` : ''}</p>
          <h1 className="lib-display">{shelf.title}</h1>
          <p className="lib-lede">{shelf.blurb}</p>
        </div>
      </section>
      <div className="lib-columns">
        <section className="lib-col-main" aria-labelledby="sys-mods-h">
          <h2 id="sys-mods-h">Modules, in order</h2>
          <ol className="lib-steps">
            {mods.map((m, i) => {
              const p = progressOf(m.id); const complete = p.total > 0 && p.done === p.total; const now = nextMod?.id === m.id && p.done > 0;
              return <li key={m.id}><button className={`lib-step${complete ? ' done' : ''}${now ? ' now' : ''}`} onClick={() => (now ? playModule(m.id, p.next) : openLibrary({ page: 'module', id: m.id }))}>
                <span className="lib-step-n" aria-hidden="true">{complete ? '✓' : i + 1}</span>
                <span className="lib-step-body"><b className="k-module">{m.steps.length} steps · {minutesOf(m)} min</b><span>{m.title}</span></span>
                <span className="lib-step-time">{complete ? 'Done' : now ? `Resume · step ${p.next + 1}` : p.done ? `${p.done}/${p.total}` : 'Start'}</span>
              </button></li>;
            })}
          </ol>
          {conditions.length > 0 && <>
            <h2 className="sys-h2">Conditions</h2>
            <div className="sys-chips">
              {(allCond ? conditions : conditions.slice(0, 10)).map(({ d, c }) => <button key={c.id} onClick={() => openCondition(d, c.id)}>{c.title}</button>)}
              {!allCond && conditions.length > 10 && <button className="more" onClick={() => setAllCond(true)}>+{conditions.length - 10} more</button>}
            </div>
          </>}
        </section>
        <aside className="lib-col-side">
          <div className="lib-panel"><h2>Hands on</h2>
            <p>Free play in the 3D scene. Nothing is graded.</p>
            <div className="sys-acts">
              <button className="lib-btn" onClick={() => openFree(shelf.module, 'explore')}>Open the {id === 'pharm' ? 'mechanism viewer' : 'scene'}</button>
              {id === 'resp' && <button className="lib-btn" onClick={() => openFree('vent', 'sim')}>Ventilator simulator</button>}
              {id === 'gas' && <button className="lib-btn" onClick={() => openFree('abg', 'sim')}>Treat a patient over time</button>}
              {id === 'gas' && <button className="lib-btn" onClick={() => openFree('labs', 'explore')}>Labs: organs and cells</button>}
              {id === 'hemo' && <button className="lib-btn" onClick={() => openFree('lines', 'sim')}>Interfacility transport simulator</button>}
              {id === 'special' && <button className="lib-btn" onClick={() => openFree('womens', 'learn')}>Women’s health &amp; OB</button>}
            </div>
          </div>
          {cases.length > 0 && <div className="lib-panel"><h2>Cases</h2>
            <div className="sys-cases">{cases.slice(0, 4).map((c) => <CaseCard key={c} id={c} stars={stars[c] ?? stars[`vent-${c.replace(/^vent-/, '')}`]} />)}</div>
            {cases.length > 4 && <button className="lib-link" onClick={() => openLibrary({ page: 'practice', shelf: id })}>See all {cases.length} cases</button>}
          </div>}
          {engines.length > 0 && <div className="lib-panel"><h2>Real imaging</h2>
            <p>Courses and real studies that match this system.</p>
            <button className="lib-link" onClick={() => openLibrary({ page: 'imaging' })}>Open the imaging academy</button>
          </div>}
        </aside>
      </div>
    </>
  );
}

/** Practice: today's case, the whole case library with filters, and the simulators. */
function PracticePage({ initial }: { initial?: ShelfId }) {
  const cases = useCaseState(); const stars = useMemo(bestStars, []); const results = useMemo(missionResults, []);
  const [shelf, setShelf] = useState<ShelfId | 'all'>(initial ?? 'all'); const [level, setLevel] = useState<CaseLevel | 'all'>('all'); const [todo, setTodo] = useState(false);
  const shelves = SHELVES.filter((s) => cases.all.some((c) => caseShelf(c) === s.id));
  const shown = cases.all.filter((c) => (shelf === 'all' || caseShelf(c) === shelf) && (level === 'all' || caseLevel(c) === level) && (!todo || !cases.passed(c)));
  const passedN = cases.all.filter(cases.passed).length;
  return (
    <div className="lib-page">
      <h1 className="lib-display">Practice</h1>
      <p className="lib-lede">{cases.all.length} patient cases, each ending in a debrief. {passedN ? `${passedN} passed.` : ''}</p>
      <div className="pr-top">
        {cases.today && <section className="td-card" aria-label="Today’s case"><p className="lib-kicker">Today’s case</p><h2>{titleOf(cases.today)}</h2>
          <p className="td-sub">{SHELF_BY_ID[caseShelf(cases.today)].title}{caseLevel(cases.today) ? ` · ${caseLevel(cases.today)}` : ''}</p>
          <div className="lib-actions"><button className="lib-btn accent" onClick={() => runCase(cases.today!)}><Play />Play</button></div></section>}
        <section className="td-card" aria-label="Simulators"><p className="lib-kicker">Simulators · free play</p>
          <div className="sys-acts">
            <button className="lib-btn" onClick={() => openFree('lines', 'sim')}>Interfacility transport</button>
            <button className="lib-btn" onClick={() => openFree('vent', 'sim')}>Ventilator</button>
            <button className="lib-btn" onClick={() => openFree('abg', 'sim')}>Blood gas over time</button>
            <button className="lib-btn" onClick={() => openFree('heart', 'explore')}>Heart &amp; MI Locator</button>
          </div></section>
      </div>
      <section className="ms-sec" aria-labelledby="ms-h">
        <h2 id="ms-h" className="sys-h2">Missions <small>a shift of four calls, played back to back</small></h2>
        <div className="ms-grid">{MISSIONS.map((m) => { const r = results[m.id]; return (
          <button key={m.id} className="ms-card" onClick={() => runMission(m.id)}>
            <b>{m.title}</b><span>{m.brief}</span>
            <ol>{m.legs.map((l) => <li key={l.caseId}>{l.label}</li>)}</ol>
            <small className={r ? 'ok' : ''}>{r ? `Best ${r.right}/${r.total} decisions` : `${m.legs.length} calls · not flown yet`}</small>
          </button>); })}</div>
      </section>
      <div className="lib-filters" role="group" aria-label="Filter by system">
        <button aria-pressed={shelf === 'all'} className={shelf === 'all' ? 'on' : ''} onClick={() => setShelf('all')}>All systems</button>
        {shelves.map((s) => <button key={s.id} aria-pressed={shelf === s.id} className={shelf === s.id ? 'on' : ''} onClick={() => setShelf(s.id)}>{SHELF_ACCENT[s.id].label}</button>)}
      </div>
      <div className="lib-filters" role="group" aria-label="Filter by level">
        <button aria-pressed={level === 'all'} className={level === 'all' ? 'on' : ''} onClick={() => setLevel('all')}>All levels</button>
        {LEVELS.filter((l) => cases.all.some((c) => caseLevel(c) === l)).map((l) => <button key={l} aria-pressed={level === l} className={level === l ? 'on' : ''} onClick={() => setLevel(l)}>{l}</button>)}
        <button aria-pressed={todo} className={todo ? 'on' : ''} onClick={() => setTodo(!todo)}>Not passed yet</button>
      </div>
      <p className="lib-count" aria-live="polite">{shown.length} cases</p>
      <div className="lib-grid">{shown.map((c) => <CaseCard key={c} id={c} stars={stars[c]} />)}</div>
    </div>
  );
}

/** Reference: everything that is looked up rather than worked through. */
function ReferencePage() {
  return (
    <div className="lib-page">
      <h1 className="lib-display">Reference</h1>
      <p className="lib-lede">Imaging, audio, case conferences, videos and your own records.</p>
      <section className="lib-banners ref" aria-label="Reference">
        <Banner img="abd-aorta" title="Imaging academy" sub="Ten courses with real X-ray, CT, MRI and ultrasound" onClick={() => openLibrary({ page: 'imaging' })} />
        <Banner img="cardiac-mi" title="Listen" sub="Computer-narrated sessions and voice-guided mental reps" onClick={() => openLibrary({ page: 'listen' })} />
        <Banner img="cardiac-congenital" title="Case conference" sub="Slides and audio · clinical review pending" onClick={() => openFree('cases')} />
        <Banner img="lines-devices" title="Videos & skills" sub="Equipment, pumps and procedures (needs a connection)" onClick={() => openFree('videos')} />
        <Banner img="vent-foundations" title="Progress & bookmarks" sub="What you have finished, saved and missed" onClick={() => openFree('curriculum')} />
        <Banner img="neuro-stroke" title="Clinical review" sub="New wording waiting for sign-off" onClick={() => openLibrary({ page: 'review' })} />
        <Banner img="gas-basics" title="Download for offline" sub="Lessons, audio and imaging packs" onClick={() => openLibrary({ page: 'offline' })} />
      </section>
      <BackupCard />
    </div>
  );
}

/** Save progress to a file, or load it on another device. */
function BackupCard() {
  const [msg, setMsg] = useState<string | null>(null); const [last] = useState(() => { try { return localStorage.getItem('ccp.backup.at'); } catch { return null; } });
  const pick = (f: File | undefined) => { if (!f) return; void f.text().then((t) => { const b = readBackup(t);
    if (!window.confirm(`Replace the progress on this device with the backup from ${new Date(b.savedAt).toLocaleDateString()}?`)) return;
    restoreBackup(b); window.location.reload(); }).catch((e: Error) => setMsg(e.message)); };
  return (
    <section className="td-card bk" aria-labelledby="bk-h">
      <p className="lib-kicker">Your progress</p><h2 id="bk-h">Back up or move your progress</h2>
      <p>Your progress is stored only in this browser. Save a backup file to keep it safe, or load one to continue on another phone or computer. Nothing is uploaded.{last ? ` Last backup: ${new Date(last).toLocaleDateString()}.` : ' No backup saved from this device yet.'}</p>
      <div className="bk-acts"><button className="lib-btn accent" onClick={() => setMsg(`Saved a backup with ${downloadBackup()} items.`)}>Save a backup file</button>
        <label className="lib-btn bk-file">Load a backup file<input type="file" accept="application/json,.json" onChange={(e) => pick(e.target.files?.[0])} /></label></div>
      {msg && <p className="bk-msg" role="status">{msg}</p>}
    </section>
  );
}

function SimCard({ shelf }: { shelf: ShelfId }) {
  const s = SHELF_BY_ID[shelf];
  return (
    <div className="lib-tile-wrap">
      <button className="lib-card" onClick={() => openFree(s.module, 'explore')}>
        <span className="lib-art sim cover" style={{ background: s.tone, ...coverStyle(SHELF_ACCENT[shelf].c, s.tone) }}><Motif shelf={shelf} />
          <span className="lib-edge" aria-hidden="true" />
          <span className="lib-art-kicker">{SHELF_ACCENT[shelf].label}</span>
          <span className="lib-art-text"><span className="lib-art-title">Open the <em>simulator</em></span><span className="lib-art-meta k-simulator">Simulator · free play, nothing graded</span></span>
        </span>
      </button>
    </div>
  );
}

function PathPoster({ id }: { id: string }) {
  const p = PATH_BY_ID[id]; const progressOf = useModuleProgress();
  const done = p.modules.filter((m) => { const x = progressOf(m); return x.total > 0 && x.done === x.total; }).length;
  return (
    <button className="lib-poster cover" style={{ background: p.tone, ...coverStyle(PATH_ACCENT[id] ?? '#7db4ff', p.tone) }} onClick={() => openLibrary({ page: 'path', id })}>
      <span className="lib-edge" aria-hidden="true" />
      {PATH_HERO[id] && <img className="lib-poster-img" src={`thumbs/${PATH_HERO[id]}.jpg`} alt="" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      <span className="lib-poster-k">{p.modules.length} modules{done ? ` · ${done} done` : ''}</span>
      <span className="lib-poster-copy"><span className="lib-display sm"><AccentTitle text={p.title} /></span><span className="lib-poster-sub">{p.blurb}</span></span>
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
      <section className="lib-hero has-img" style={{ background: shelf.tone }}>
        <HeroImage name={id} />
        <div className="lib-hero-copy">
          <Crumbs items={[{ label: 'Today', go: () => openLibrary({ page: 'home' }) }, { label: shelf.title, go: () => openLibrary({ page: 'shelf', id: m.shelf }) }, { label: m.title }]} />
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
      <CourseImaging moduleId={id} />
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
      <Crumbs items={[{ label: 'Today', go: () => openLibrary({ page: 'home' }) }, { label: heading }]} />
      <h1 className="lib-display">{heading}</h1>
      <p className="lib-lede">{shelf?.blurb ?? (initial === 'case' ? 'Every patient case in the app. Each one ends with a debrief.' : 'Every module, simulator and case in the app.')}</p>
      <div className="lib-filters" role="group" aria-label="Filter by type">
        {FILTERS.map((f) => <button key={f.key} aria-pressed={filter === f.key} className={filter === f.key ? 'on' : ''} onClick={() => setFilter(f.key)}>{f.label}</button>)}
      </div>
      <p className="lib-count" aria-live="polite">{count} items</p>
      <div className="lib-grid">
        {(filter === 'all' || filter === 'module') && mods.map((m) => <ModuleCard key={m.id} m={m} />)}
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
      <Crumbs items={[{ label: 'Today', go: () => openLibrary({ page: 'home' }) }, { label: 'Learning paths' }]} />
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
      <section className="lib-hero has-img" style={{ background: p.tone }}>
        {PATH_HERO[id] && <HeroImage name={PATH_HERO[id]} />}
        <div className="lib-hero-copy">
          <Crumbs items={[{ label: 'Today', go: () => openLibrary({ page: 'home' }) }, { label: 'Learning paths', go: () => openLibrary({ page: 'paths' }) }, { label: p.title }]} />
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

const ReviewPage = lazy(() => import('./ReviewPage').then((m) => ({ default: m.ReviewPage })));
const AudioHome = lazy(() => import('./audio/AudioHome'));
const ImagingAcademy = lazy(() => import('./imaging/ImagingAcademy').then((m) => ({ default: m.ImagingAcademy })));

export function Library() {
  const view = useLibrary((s) => s.view);
  return (
    <main id="library-main" className="library" tabIndex={-1} aria-label="Library">
      {view.page === 'home' && <Home />}
      {view.page === 'learn' && <LearnPage />}
      {view.page === 'practice' && <PracticePage key={view.shelf ?? 'all'} initial={view.shelf} />}
      {view.page === 'reference' && <ReferencePage />}
      {view.page === 'review' && <Suspense fallback={<div className="module-loading" role="status"><span>Loading</span></div>}><ReviewPage /></Suspense>}
      {view.page === 'listen' && <Suspense fallback={<div className="module-loading" role="status"><span>Loading</span></div>}><AudioHome /></Suspense>}
      {view.page === 'module' && <ModulePage id={view.id} />}
      {view.page === 'shelf' && (view.id !== 'all' && !view.filter ? <SystemHub key={view.id} id={view.id} /> : <ShelfPage key={`${view.id}-${view.filter ?? ''}`} id={view.id} initial={view.filter} />)}
      {view.page === 'paths' && <PathsPage />}
      {view.page === 'offline' && <OfflinePage />}
      {view.page === 'path' && <PathPage id={view.id} />}
      {view.page === 'imaging' && <Suspense fallback={<div className="module-loading" role="status">Loading imaging trainer…</div>}>
        <ImagingAcademy key={`${view.moduleId ?? 'all'}:${view.modality ?? 'all'}:${view.id ?? 'start'}`} moduleId={view.moduleId} initialModality={view.modality} initialId={view.id} />
      </Suspense>}
    </main>
  );
}
