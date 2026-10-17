import { DiseaseBrowser } from '../atlas/DiseaseBrowser';
/** Curriculum: every lesson, step lesson and procedure by domain, certification and NAEMT course, with progress, bookmarks and weak topics. */
import { useMemo, useState } from 'react';
import { CATALOG, CERTS, DOMAINS, NAEMT, CONCEPTS, type Cert, type Domain, type Entry, type Kind, type Naemt } from './catalog';
import { useProgress, weakTopics, domainProgress, missingPrereqs, recommendedLesson } from './progress';
import { titleOf } from './titles';
import { openLesson, openDrug, openChallenge } from '../app/navigate';
import { MECH } from '../moa/registry';
import { OfflineCard } from '../app/Offline';
import { useUI, type Module } from '../app/store';
import { timelineFor } from '../director/lessonTimeline';
import { courseFor, trackSummary } from '../director/course';
import { director } from '../director/director';
import { DomainIcon } from '../app/icons';
import { conditionsFor } from '../atlas/registry';
import type { AtlasDomain } from '../atlas/types';

const KIND: Record<Kind, string> = { director: 'Explainer', step: 'Step lesson', workflow: 'Procedure' };
const MOD: Record<Entry['module'], string> = { vent: 'Ventilator', abg: 'Blood gas', labs: 'Labs', lines: 'Lines', neuro: 'Brain', heart: 'Heart', abdomen: 'Abdomen', pediatrics: 'Pediatrics', womens: 'Women’s Health / OB' };
const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

function Chips<T extends string>({ label, all, value, onChange, names }: { label: string; all: T[]; value: T | null; onChange: (v: T | null) => void; names?: Partial<Record<T, string>> }) {
  return <div className="nd-row"><span className="muted small">{label}</span><div className="chips"><button className={`chip${value == null ? ' on' : ''}`} onClick={() => onChange(null)}>All</button>{all.map((v) => <button key={v} className={`chip${value === v ? ' on' : ''}`} aria-pressed={value === v} onClick={() => onChange(value === v ? null : v)} title={names?.[v]}>{v}</button>)}</div></div>;
}

export function CurriculumModule() {
  const p = useProgress(); const [domain, setDomain] = useState<Domain | null>(null); const [cert, setCert] = useState<Cert | null>(null); const [naemt, setNaemt] = useState<Naemt | null>(null);
  const [kind, setKind] = useState<Kind | null>(null); const [hideDone, setHideDone] = useState(false); const [open, setOpen] = useState<string | null>(null);
  const filter = (e: Entry) => (!cert || e.certs.includes(cert)) && (!naemt || e.naemt.includes(naemt)) && (!kind || e.kind === kind) && (!hideDone || !p.completed[e.id]);
  const doms = useMemo(() => domainProgress(p.completed, filter).filter((d) => !domain || d.domain === domain), [p.completed, domain, cert, naemt, kind, hideDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const weak = useMemo(() => weakTopics(p.attempts), [p.attempts]);
  const total = CATALOG.length, done = CATALOG.filter((e) => p.completed[e.id]).length;
  const nextLesson = recommendedLesson(p.completed) ?? CATALOG.find(e=>e.id==='eom')!;
  const resume = p.recent.find(b => CATALOG.some(e => e.id === b.lessonId) && !p.completed[b.lessonId]);
  const launchExplore = () => useUI.getState().set({ module: 'vent', mode: 'explore', atlasDisease: null });
  const launchPractice = () => {
    if (weak[0]?.challenges?.[0]) openChallenge(weak[0].challenges[0]);
    else useUI.getState().set({ module: 'vent', mode: 'challenge', atlasDisease: null });
  };
  return (
    <main id="controls" tabIndex={-1} className="stage curriculum-stage">
      <div className="cur-page cur-home">
        <HomeHero lessonId={resume?.lessonId ?? nextLesson.id} resumeAt={resume?.t} done={done} total={total} onExplore={launchExplore} onPractice={launchPractice} practiceLabel={weak[0] ? `revisit ${weak[0].name.toLowerCase()}` : 'run a clinical case'} />
        <SystemsIndex />
        <DiseaseBrowser />
        {p.recent.length > 0 && <section className="home-recent" aria-labelledby="home-recent-title">
          <h3 id="home-recent-title">Recently viewed</h3>
          {p.recent.filter(b => CATALOG.some(e => e.id === b.lessonId)).slice(0, 3).map(b => <button key={b.lessonId} onClick={() => openLesson(b.lessonId, b.t)}><span>{titleOf(b.lessonId)}</span><small>{p.completed[b.lessonId] ? 'Completed' : `Resume ${mmss(b.t)}`}</small></button>)}
        </section>}
        <details className="curriculum-browser">
          <summary>Browse curriculum <span>{total} lessons and procedures</span></summary>
        <details className="card cur-filter-drawer">
          <summary><span><b>Browse the full curriculum</b><small>Filter by domain, certification, course or lesson type</small></span><span aria-hidden="true">＋</span></summary>
          <div className="cur-filter-body">
            <p className="muted small">Topics are tagged by alignment with FP-C / CCP-C, CFRN and NAEMT course scope. Objectives are this app’s own; sources are guidelines, trials and textbooks to read further.</p>
            <div className="cur-certs">{CERTS.map((c) => { const es = CATALOG.filter((e) => e.certs.includes(c)); const d = es.filter((e) => p.completed[e.id]).length; return <span key={c}>{c} {d}/{es.length}</span>; })}</div>
            <Chips label="Domain" all={DOMAINS} value={domain} onChange={setDomain} />
            <Chips label="Certification" all={CERTS} value={cert} onChange={setCert} />
            <Chips label="NAEMT course" all={NAEMT.map((n) => n.id)} value={naemt} onChange={setNaemt} names={Object.fromEntries(NAEMT.map((n) => [n.id, n.name]))} />
            <Chips label="Kind" all={['director', 'step', 'workflow'] as Kind[]} value={kind} onChange={setKind} />
            <label className="cur-hide"><input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> Hide completed</label>
          </div>
        </details>
        {doms.map((d) => (
          <section key={d.domain} className="card cur-dom">
            <div className="card-h"><h3>{d.domain}</h3><span className="muted small">{d.entries.length ? `${d.done}/${d.entries.length}` : ''}</span></div>
            {d.entries.length === 0 ? <p className="muted small">{['Paediatric', 'Neonatal', 'OB'].includes(d.domain) ? 'No lessons yet — planned.' : 'Nothing matches these filters.'}</p> : <>
              <div className="cur-bar"><i style={{ width: `${(100 * d.done) / d.entries.length}%` }} /></div>
              <ul className="cur-list">{d.entries.map((e) => { const key = `${d.domain}:${e.id}`; const miss = missingPrereqs(e, p.completed); return (
                <li key={e.id} className={p.completed[e.id] ? 'done' : ''}>
                  <div className="cur-row">
                    <span className="cur-st" aria-label={p.completed[e.id] ? 'completed' : 'not completed'}>{p.completed[e.id] ? '✓' : '○'}</span>
                    <button className="linkish cur-t" aria-expanded={open === key} onClick={() => setOpen(open === key ? null : key)}>{titleOf(e.id)}</button>
                    <span className={`lvl lvl-${e.kind === 'director' ? 'sig' : e.kind === 'workflow' ? 'proc' : e.difficulty}`}>{KIND[e.kind]}</span>
                    <span className="muted small">{MOD[e.module]} · {e.difficulty}</span>
                    <button className="chip" onClick={() => openLesson(e.id)}>Open</button>
                  </div>
                  {open === key && <div className="cur-detail">
                    <p className="small"><b>Objectives</b></p><ul>{e.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
                    {e.prereq.length > 0 && <p className="small"><b>Before this:</b> {e.prereq.map((q) => <button key={q} className="linkish" onClick={() => openLesson(q)}>{p.completed[q] ? '✓' : '○'} {titleOf(q)}</button>)}{miss.length > 0 && <span className="muted"> — {miss.length} not done yet</span>}</p>}
                    <p className="small"><b>Tags:</b> {e.certs.join(' · ')}{e.naemt.length ? ` · NAEMT: ${e.naemt.join(', ')}` : ''}</p>
                    {e.protocol && <p className="small"><b>Protocol:</b> {e.protocol}</p>}
                    <p className="small"><b>Read further:</b></p><ul className="muted small">{e.sources.map((s) => <li key={s}>{s}</li>)}</ul>
                    <p className="muted small">Last reviewed {e.reviewed}.</p>
                  </div>}
                </li>); })}</ul></>}
          </section>
        ))}
        </details>
        <details className="lesson-group" open={weak.length>0 || p.bookmarks.length>0}><summary>Practice feedback &amp; bookmarks</summary><div className="cur-cols">
          <section className="card">
            <div className="card-h"><h3>Weak topics</h3><span className="muted small">from your challenge answers</span></div>
            {weak.length === 0 ? <p className="muted small">{Object.keys(p.attempts).length ? 'Nothing flagged — your latest answers were right.' : 'Answer some Practice cases and missed concepts will appear here with the lesson that fixes them.'}</p>
              : <ul className="cur-weak">{weak.map((w) => <li key={w.concept}>
                <b>{w.name}</b> <span className="muted small">missed {w.missed} of {w.tried}</span>
                <div className="chips">{CONCEPTS[w.concept].remediate.map((r) => 'lesson' in r
                  ? <button key={r.lesson} className="chip" onClick={() => openLesson(r.lesson)}>Learn: {titleOf(r.lesson)}</button>
                  : <button key={r.drug} className="chip" onClick={() => openDrug(r.drug)}>Drug: {MECH[r.drug]?.drug ?? r.drug}</button>)}
                  <button className="chip" onClick={() => openChallenge(w.challenges[0])}>Retry: {titleOf(w.challenges[0])}</button></div>
              </li>)}</ul>}
          </section>
          <section className="card">
            <div className="card-h"><h3>Bookmarks</h3><span className="muted small">☆ in any lesson player</span></div>
            {p.bookmarks.length === 0 ? <p className="muted small">None yet.</p>
              : <ul className="cur-bm">{p.bookmarks.map((b, i) => <li key={`${b.lessonId}-${b.t}`}><button className="linkish" onClick={() => openLesson(b.lessonId, b.t)}>{b.title} <span className="muted small">at {mmss(b.t)}</span></button><button className="linkish" aria-label="Remove bookmark" onClick={() => p.removeBookmark(i)}>✕</button></li>)}</ul>}
          </section>
        </div></details>

        <details className="offline-disclosure"><summary>Offline access</summary><OfflineCard /></details>
        <p className="muted small" style={{ padding: '0 4px 20px' }}>Teaching tool, not a certification prep course or a protocol. <button className="linkish" onClick={() => { if (confirm('Clear your progress, bookmarks and challenge answers in this browser?')) p.reset(); }}>Reset progress</button></p>
      </div>
    </main>
  );
}

/** The one thing to do next, offered both ways: the full course or the TL;DR. */
function HomeHero({ lessonId, resumeAt, done, total, onExplore, onPractice, practiceLabel }: { lessonId: string; resumeAt?: number; done: number; total: number; onExplore: () => void; onPractice: () => void; practiceLabel: string }) {
  const tl = useMemo(() => timelineFor(lessonId), [lessonId]);
  const sum = useMemo(() => (tl ? trackSummary(tl, courseFor(tl)) : null), [tl]);
  const start = (track: 'full' | 'tldr') => { director.prefer(track); openLesson(lessonId); };
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <p className="hero-kicker">{resumeAt ? 'Pick up where you stopped' : done ? 'Your next lesson' : 'Start here'}</p>
      <h2 id="home-hero-title" className="hero-title">{titleOf(lessonId)}</h2>
      {tl?.blurb && <p className="hero-blurb">{tl.blurb}</p>}
      <div className="hero-actions">
        {resumeAt ? <button className="act primary" onClick={() => openLesson(lessonId, resumeAt)}>Resume at {mmss(resumeAt)}</button>
          : <button className="act primary" onClick={() => start('full')}>Full course{sum ? `, ${sum.full.min} min` : ''}</button>}
        <button className="act" onClick={() => start('tldr')}>TL;DR{sum ? `, ${sum.tldr.min} min` : ''}</button>
      </div>
      <p className="hero-alt">Or <button className="linkish" onClick={onExplore}>ventilate a patient</button>, or <button className="linkish" onClick={onPractice}>{practiceLabel}</button>.</p>
      <div className="hero-progress" aria-label={`${done} of ${total} lessons completed`}>
        <span>{done === 0 ? `${total} lessons and procedures` : `${done} of ${total} completed`}</span>
        <div className="cur-bar"><i style={{ width: `${(100 * done) / total}%` }} /></div>
      </div>
    </section>
  );
}

const SYSTEMS: { module: Module; label: string; scope: string; atlas?: AtlasDomain }[] = [
  { module: 'vent', label: 'Respiratory', scope: 'Ventilator mechanics, ARDS, obstruction, pneumothorax', atlas: 'vent' },
  { module: 'abg', label: 'Blood gas', scope: 'Acid–base, oxygenation, DKA, pregnancy' },
  { module: 'labs', label: 'Labs', scope: 'Potassium, sodium, coagulation, lactate', atlas: 'labs' },
  { module: 'lines', label: 'Hemodynamics', scope: 'Shock, oxygen delivery, arterial and central lines', atlas: 'lines' },
  { module: 'heart', label: 'Cardiac', scope: 'Shunts, newborn transition, the MI Locator', atlas: 'heart' },
  { module: 'abdomen', label: 'Abdomen', scope: 'FAST, aorta, solid organs, ischaemic bowel', atlas: 'abdomen' },
  { module: 'neuro', label: 'Neuro', scope: 'Stroke, haemorrhage, ICP and the EVD', atlas: 'neuro' },
  { module: 'moa', label: 'Pharmacology', scope: 'Vasopressors, sedation, reversal agents' },
  { module: 'pediatrics', label: 'Pediatrics', scope: 'The child’s airway, shock and apnoea', atlas: 'pediatrics' },
  { module: 'womens', label: 'Women’s Health / OB', scope: 'The pregnant circulation, haemorrhage, gases', atlas: 'womens' },
];
/** Every system at a glance: what it covers and how much there is. */
function SystemsIndex() {
  const counts = useMemo(() => Object.fromEntries(SYSTEMS.map((s) => [s.module, CATALOG.filter((e) => e.module === s.module && !e.id.startsWith('atlas-')).length])), []);
  return (
    <section className="systems" aria-labelledby="systems-title">
      <h3 id="systems-title">Systems</h3>
      <ul>{SYSTEMS.map((s) => {
        const n = counts[s.module] ?? 0; const c = s.atlas ? conditionsFor(s.atlas).length : 0;
        const meta = [n ? `${n} lesson${n === 1 ? '' : 's'}` : '', c ? `${c} conditions` : ''].filter(Boolean).join(', ');
        return <li key={s.module} data-ch={s.module}><button onClick={() => useUI.getState().set({ module: s.module, mode: s.module === 'moa' ? 'explore' : 'learn', atlasDisease: null })}>
          <DomainIcon module={s.module} /><span className="sys-name">{s.label}</span><span className="sys-scope">{s.scope}</span><span className="sys-meta">{meta}</span>
        </button></li>;
      })}</ul>
    </section>
  );
}
