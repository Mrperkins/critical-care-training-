/** FP-C exam practice: the exam home (readiness, the three ways to practise) and a running session. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { FPC_LESSONS } from './index';
import { rng, shuffle, bank, domainStats, loadHistory, loadMocks, plan, readiness, record, saveHistory, saveMock, score, TARGET, type BankItem, type ExamKind, type ExamPlan, type ExamResult, type History } from './exam';
import { TOTAL_ITEMS } from './blueprint';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, '0')}`;
const hms = (s: number) => (s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}` : mmss(s));
const NAME: Record<ExamKind, string> = { quick: 'Quick 10', weak: 'Weak spots', mock: 'Mock exam', half: 'Half mock' };

export function ExamHome({ onLesson, onStart }: { onLesson: (id: string) => void; onStart: (p: ExamPlan) => void }) {
  const all = useMemo(() => bank(FPC_LESSONS), []); const [h] = useState<History>(loadHistory);
  const stats = useMemo(() => domainStats(all, h), [all, h]); const r = readiness(stats); const mocks = useMemo(loadMocks, []);
  const missed = all.filter((b) => h[b.key] && !h[b.key].lastOk).length; const lastMock = [...mocks].reverse().find((m) => m.kind === 'mock' || m.kind === 'half');
  const start = (k: ExamKind) => onStart(plan(k, all, h));
  void onLesson;
  return (
    <section className="ex-home" aria-labelledby="ex-title">
      <div className="ex-ready">
        <div className="ex-ring" style={{ ['--p' as string]: `${r.pct}%` }} role="img" aria-label={`Readiness ${r.pct} percent`}><b>{r.pct}%</b><small>ready</small></div>
        <div><h3 id="ex-title">Exam practice</h3>
          <p>{all.length.toLocaleString('en-US')} exam-style questions across the ten domains. Readiness is your last answer on every question you have seen, weighted the way the exam weights each domain. You have seen {r.coverage}% of the bank. Study target: {TARGET}%.</p>
          {lastMock && <p className="ex-sub">Last mock: {lastMock.pct}% ({lastMock.right}/{lastMock.total}) in {hms(lastMock.ms / 1000)}.</p>}</div>
      </div>
      <div className="ex-acts">
        <button className="ex-act" onClick={() => start('quick')}><b>Quick 10</b><span>Ten questions weighted like the exam. Answer and explanation after each one.</span><small>About 7 min</small></button>
        <button className="ex-act" onClick={() => start('weak')} disabled={!Object.keys(h).length}><b>Weak spots</b><span>{missed ? `${missed} question${missed === 1 ? '' : 's'} you missed last time, then new ones from your weakest domains.` : 'Questions you miss come back here, with new ones from your weakest domains.'}</span><small>{Object.keys(h).length ? 'Up to 15 questions' : 'Answer some questions first'}</small></button>
        <button className="ex-act" onClick={() => start('half')}><b>Half mock</b><span>55 questions in the exam’s proportions. Timed, no feedback until the end.</span><small>75 min</small></button>
        <button className="ex-act" onClick={() => start('mock')}><b>Mock exam</b><span>{TOTAL_ITEMS} questions in the exam’s proportions. Timed, flag and return, results by domain.</span><small>2 h 30 min</small></button>
      </div>
      <h3 className="ex-h">Readiness by domain</h3>
      <ul className="ex-domains">{stats.map((d) => <li key={d.id}>
        <span className="ex-d-t">{d.title}<small>{d.items} of {TOTAL_ITEMS} exam items · {d.seen}/{d.total} questions seen</small></span>
        <span className="ex-bar" aria-hidden="true"><i className={d.pct == null ? '' : d.pct >= TARGET ? 'ok' : d.pct >= 50 ? 'warn' : 'bad'} style={{ width: `${d.pct ?? 0}%` }} /><s style={{ left: `${TARGET}%` }} /></span>
        <b className="ex-d-p">{d.pct == null ? '—' : `${d.pct}%`}</b>
      </li>)}</ul>
    </section>
  );
}

export function ExamSession({ plan: p, onExit, onLesson }: { plan: ExamPlan; onExit: () => void; onLesson: (id: string) => void }) {
  const timed = p.minutes != null; const items = p.items;
  const [i, setI] = useState(0); const [picks, setPicks] = useState<(number | null)[]>(() => items.map(() => null)); const [flags, setFlags] = useState<boolean[]>(() => items.map(() => false));
  const [result, setResult] = useState<ExamResult | null>(null); const t0 = useRef(Date.now()); const [left, setLeft] = useState((p.minutes ?? 0) * 60); const [grid, setGrid] = useState(false);
  const finish = () => {
    if (result) return; const res = score(items, picks); setResult(res);
    saveHistory(record(loadHistory(), items, picks)); saveMock({ at: Date.now(), kind: p.kind, pct: res.pct, right: res.right, total: res.total, ms: Date.now() - t0.current });
  };
  useEffect(() => { if (!timed || result) return; const t = setInterval(() => { const s = (p.minutes ?? 0) * 60 - (Date.now() - t0.current) / 1000; setLeft(s); if (s <= 0) finish(); }, 500); return () => clearInterval(t); }); // eslint-disable-line react-hooks/exhaustive-deps
  if (!items.length) return <section className="ex-run"><p>No questions to show yet.</p><button className="act" onClick={onExit}>Back</button></section>;
  if (result) return <Results kind={p.kind} res={result} ms={Date.now() - t0.current} onExit={onExit} onLesson={onLesson} />;
  // answer order is shuffled per question for this sitting, so position never gives the answer away
  const orders = useMemo(() => { const r = rng(t0.current); return items.map((x) => shuffle(x.q.options.map((_, k) => k), r)); }, [items]);
  const b = items[i]; const pick = picks[i]; const ord = orders[i]; const shown = !timed && pick != null; const answered = picks.filter((x) => x != null).length;
  const choose = (k: number) => { if (shown) return; setPicks((x) => x.map((v, j) => (j === i ? k : v))); };
  return (
    <section className={`ex-run${timed ? ' timed' : ''}`} aria-label={NAME[p.kind]}>
      <header className="ex-top">
        <button className="course-back" onClick={() => { if (!timed || window.confirm?.('Leave the exam? Your answers so far will not be scored.') !== false) onExit(); }}>Leave</button>
        <b>{NAME[p.kind]}</b><span>Question {i + 1} of {items.length}</span>
        {timed && <span className={`ex-clock${left < 300 ? ' low' : ''}`} aria-label="Time left">{hms(left)}</span>}
        {timed && <button className="act" aria-expanded={grid} onClick={() => setGrid(!grid)}>{answered}/{items.length} answered</button>}
      </header>
      {grid && <ol className="ex-grid" aria-label="All questions">{items.map((_, j) => <li key={j}><button className={`${j === i ? 'on ' : ''}${picks[j] != null ? 'done ' : ''}${flags[j] ? 'flag' : ''}`} onClick={() => { setI(j); setGrid(false); }} aria-label={`Question ${j + 1}${picks[j] != null ? ', answered' : ''}${flags[j] ? ', flagged' : ''}`}>{j + 1}</button></li>)}</ol>}
      <div className="ex-progress" aria-hidden="true"><i style={{ width: `${((i + 1) / items.length) * 100}%` }} /></div>
      <fieldset className="ex-q">
        <legend>{b.q.q}</legend>
        {ord.map((k, pos) => <button key={k} type="button" className={`ex-opt${shown ? (k === b.q.answer ? ' right' : k === pick ? ' wrong' : ' dim') : pick === k ? ' picked' : ''}`} aria-pressed={pick === k} disabled={shown} onClick={() => choose(k)}><span aria-hidden="true">{'ABCDEF'[pos]}</span>{b.q.options[k]}</button>)}
        {shown && <p className={`ex-why${pick === b.q.answer ? ' ok' : ''}`} role="status"><b>{pick === b.q.answer ? 'Correct.' : `Answer: ${'ABCDEF'[ord.indexOf(b.q.answer)]}.`}</b> {b.q.why} <button className="linkish" onClick={() => onLesson(b.lesson)}>From: {b.lessonTitle}</button></p>}
      </fieldset>
      <footer className="ex-nav">
        {timed && <button className="act" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>}
        {timed && <button className={`act${flags[i] ? ' on' : ''}`} aria-pressed={flags[i]} onClick={() => setFlags((f) => f.map((v, j) => (j === i ? !v : v)))}>{flags[i] ? 'Flagged' : 'Flag'}</button>}
        {i + 1 < items.length ? <button className="act primary" disabled={!timed && pick == null} onClick={() => setI(i + 1)}>Next</button>
          : <button className="act primary" disabled={!timed && pick == null} onClick={finish}>{timed ? 'Finish the exam' : 'See results'}</button>}
        {timed && i + 1 < items.length && answered === items.length && <button className="act" onClick={finish}>Finish the exam</button>}
      </footer>
    </section>
  );
}

function Results({ kind, res, ms, onExit, onLesson }: { kind: ExamKind; res: ExamResult; ms: number; onExit: () => void; onLesson: (id: string) => void }) {
  const lessons = useMemo(() => { const m = new Map<string, { title: string; n: number }>(); for (const x of res.missed) m.set(x.item.lesson, { title: x.item.lessonTitle, n: (m.get(x.item.lesson)?.n ?? 0) + 1 }); return [...m.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 5); }, [res]);
  return (
    <section className="ex-run ex-results" aria-labelledby="ex-res">
      <p className="fpc-kicker">{NAME[kind]} · {hms(ms / 1000)}</p>
      <h2 id="ex-res">{res.pct}% <small>{res.right} of {res.total}</small></h2>
      <p className={`ex-verdict${res.pct >= TARGET ? ' ok' : ''}`}>{res.pct >= TARGET ? `At or above the ${TARGET}% study target.` : `Below the ${TARGET}% study target. The domains and lessons to revisit are listed here.`}</p>
      <ul className="ex-domains">{res.byDomain.map((d) => { const pct = Math.round((d.right / d.total) * 100); return <li key={d.id}><span className="ex-d-t">{d.title}<small>{d.right} of {d.total}</small></span><span className="ex-bar" aria-hidden="true"><i className={pct >= TARGET ? 'ok' : pct >= 50 ? 'warn' : 'bad'} style={{ width: `${pct}%` }} /><s style={{ left: `${TARGET}%` }} /></span><b className="ex-d-p">{pct}%</b></li>; })}</ul>
      {lessons.length > 0 && <><h3 className="ex-h">Study next</h3><ul className="ex-next">{lessons.map(([id, l]) => <li key={id}><button onClick={() => onLesson(id)}>{l.title}<small>{l.n} missed</small></button></li>)}</ul></>}
      {res.missed.length > 0 && <details className="ex-review" open={res.missed.length <= 5}><summary>Review the {res.missed.length} you missed</summary>
        <ol>{res.missed.map(({ item, pick }) => <li key={item.key}><p><b>{item.q.q}</b></p>
          <p className="ex-yours">{pick == null ? 'Not answered.' : `You chose: ${item.q.options[pick]}`}</p><p className="ex-best">Answer: {item.q.options[item.q.answer]}</p><p>{item.q.why}</p></li>)}</ol></details>}
      <div className="ex-nav"><button className="act primary" onClick={onExit}>Back to exam prep</button></div>
    </section>
  );
}
export type { BankItem };
