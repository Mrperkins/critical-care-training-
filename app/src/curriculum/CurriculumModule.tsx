/** Curriculum: every lesson, step lesson and procedure by domain, certification and NAEMT course, with progress, bookmarks and weak topics. */
import { useMemo, useState } from 'react';
import { CATALOG, CERTS, DOMAINS, NAEMT, CONCEPTS, type Cert, type Domain, type Entry, type Kind, type Naemt } from './catalog';
import { useProgress, weakTopics, domainProgress, missingPrereqs } from './progress';
import { titleOf } from './titles';
import { openLesson, openDrug, openChallenge } from '../app/navigate';
import { MECH } from '../moa/registry';
import { OfflineCard } from '../app/Offline';
import { useUI } from '../app/store';

const KIND: Record<Kind, string> = { director: 'Signature', step: 'Step lesson', workflow: 'Procedure' };
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
  const nextLesson = CATALOG.find((e) => !p.completed[e.id]) ?? CATALOG[0];
  const resume = p.recent.find(b => CATALOG.some(e => e.id === b.lessonId) && !p.completed[b.lessonId]);
  const launchExplore = () => useUI.getState().set({ module: 'vent', mode: 'explore', atlasDisease: null });
  const launchPractice = () => {
    if (weak[0]?.challenges?.[0]) openChallenge(weak[0].challenges[0]);
    else useUI.getState().set({ module: 'vent', mode: 'challenge', atlasDisease: null });
  };
  return (
    <main id="controls" tabIndex={-1} className="stage curriculum-stage">
      <div className="cur-page cur-home">
        <section className="home-head">
          <h2>Pick up where you left off</h2>
          <div className="home-progress" aria-label={`${done} of ${total} lessons completed`}>
            <span>{done === 0 ? `${total} lessons and procedures` : `${done} of ${total} done`}</span>
            <div className="cur-bar"><i style={{ width: `${(100 * done) / total}%` }} /></div>
          </div>
        </section>

        <section className="cur-homegrid">
          <button className="cur-homecard cur-homecard-primary" onClick={() => openLesson(resume?.lessonId ?? nextLesson.id, resume?.t ?? 0)}>
            <span className="eyebrow">{resume ? 'Resume lesson' : 'Next lesson'}</span>
            <b>{titleOf(resume?.lessonId ?? nextLesson.id)}</b>
            <p>{resume ? `Resume at ${mmss(resume.t)}.` : 'A narrated walk-through on the live model.'}</p>
            <em>{resume ? 'Resume' : 'Start lesson'}</em>
          </button>
          <button className="cur-homecard" onClick={launchExplore}>
            <span className="eyebrow">Explore</span>
            <b>Ventilate a patient</b>
            <p>Change settings and watch the lungs, waveforms and gases respond.</p>
            <em>Open the ventilator</em>
          </button>
          <button className="cur-homecard" onClick={launchPractice}>
            <span className="eyebrow">Practice</span>
            <b>{weak[0] ? `Revisit: ${weak[0].name}` : 'Run a clinical case'}</b>
            <p>{weak[0] ? 'Target a concept your recent answers flagged.' : 'Commit to a decision, see the response, then debrief.'}</p>
            <em>Start a case</em>
          </button>
        </section>
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
                    <button className="chip" onClick={() => openLesson(e.id)}>Open →</button>
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
        <div className="cur-cols">
          <section className="card">
            <div className="card-h"><h3>Weak topics</h3><span className="muted small">from your challenge answers</span></div>
            {weak.length === 0 ? <p className="muted small">{Object.keys(p.attempts).length ? 'Nothing flagged — your latest answers were right.' : 'Answer some Challenge cases and missed concepts will appear here with the lesson that fixes them.'}</p>
              : <ul className="cur-weak">{weak.map((w) => <li key={w.concept}>
                <b>{w.name}</b> <span className="muted small">missed {w.missed} of {w.tried}</span>
                <div className="chips">{CONCEPTS[w.concept].remediate.map((r) => 'lesson' in r
                  ? <button key={r.lesson} className="chip" onClick={() => openLesson(r.lesson)}>Learn: {titleOf(r.lesson)} →</button>
                  : <button key={r.drug} className="chip" onClick={() => openDrug(r.drug)}>Drug: {MECH[r.drug]?.drug ?? r.drug} →</button>)}
                  <button className="chip" onClick={() => openChallenge(w.challenges[0])}>Retry: {titleOf(w.challenges[0])}</button></div>
              </li>)}</ul>}
          </section>
          <section className="card">
            <div className="card-h"><h3>Bookmarks</h3><span className="muted small">☆ in any lesson player</span></div>
            {p.bookmarks.length === 0 ? <p className="muted small">None yet.</p>
              : <ul className="cur-bm">{p.bookmarks.map((b, i) => <li key={`${b.lessonId}-${b.t}`}><button className="linkish" onClick={() => openLesson(b.lessonId, b.t)}>{b.title} <span className="muted small">at {mmss(b.t)}</span></button><button className="linkish" aria-label="Remove bookmark" onClick={() => p.removeBookmark(i)}>✕</button></li>)}</ul>}
          </section>
        </div>

        <details className="offline-disclosure"><summary>Offline access</summary><OfflineCard /></details>
        <p className="muted small" style={{ padding: '0 4px 20px' }}>Teaching tool, not a certification prep course or a protocol. <button className="linkish" onClick={() => { if (confirm('Clear your progress, bookmarks and challenge answers in this browser?')) p.reset(); }}>Reset progress</button></p>
      </div>
    </main>
  );
}
