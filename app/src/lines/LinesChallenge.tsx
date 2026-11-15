import { useProgress } from '../curriculum/progress';
import { useEffect, useMemo } from 'react';
import { useUI } from '../app/store';
import { CaseList } from '../challenge/CaseChallenge';
import { CASE_BY_ID, type SceneCase } from '../challenge/sceneCases';
import { useCaseRun } from '../library/caseRun';
import { HudCase } from '../library/CaseGame';
import { runCase } from '../library/launch';
import { takePendingChallenge, usePendingOpen } from '../app/navigate';

import { lines } from './session';
import { LINES_CASES, systemOK, type LCase } from './cases';
import { applyStep } from './LinesLearn';
import { useLinesUI } from './linesStore';
import { LineCard, SetupCard, FlushCard, NumbersCard, TreatCard, BreathingCard } from './LinesPanel';

const load = (c: LCase) => { lines.setNore(0); applyStep(c.setup, true); useLinesUI.getState().set({ labels: c.kind !== 'read', showTrue: false }); };
const r0 = (x: number) => Math.round(x).toString();
const KIND = { fix: 'Troubleshoot', read: 'Read the trace', goal: 'Treat' } as const;
const asCase = (c: LCase): SceneCase => ({
  id: `lines-${c.id}`, module: 'lines', level: c.level, title: c.title, story: c.brief, setup: () => load(c), verify: () => true,
  facts: () => { const n = lines.num; return [['Art line', `${r0(n.sys)}/${r0(n.dia)}`], ['MAP', `${r0(n.map)} mmHg`], ['CVP', `${r0(n.cvp)} mmHg`], ...(n.ppv != null ? [['PPV', `${r0(n.ppv)} %`] as [string, string]] : [])]; },
  questions: [{ q: c.question, options: c.options, answer: c.answer, explain: c.explain }],
  task: c.kind === 'fix' ? { title: 'Fix it at the bedside', text: 'Use the flush test, the level, the zero and the stopcocks under Details. It is fixed when the monitor matches the patient again.', holdMs: 1500, goals: [{ label: 'Monitor matches the patient', test: () => systemOK(lines) }] }
    : c.kind === 'goal' ? { title: 'Treat to the targets', text: 'Use the treatment controls under Details. Every target has to hold for 8 seconds.', holdMs: 8000, goals: c.goals!.map((g) => ({ label: g.label, test: () => g.test(lines) })) } : undefined,
});

/** Lines cases: pick one and it plays over the bedside; the line controls for the hands-on part are here under Details. */
export function LinesChallenge() {
  useUI((s) => s.pulse); const attempts = useProgress((s) => s.attempts);
  const runId = useCaseRun((s) => s.id); const stage = useCaseRun((s) => s.stage); const pend = usePendingOpen((s) => s.id);
  useEffect(() => { takePendingChallenge((x) => x.startsWith('lines-') || CASE_BY_ID[x]?.module === 'lines'); }, [pend]);
  const cur = runId ? LINES_CASES.find((x) => `lines-${x.id}` === runId) : undefined;
  const def = useMemo(() => (cur ? asCase(cur) : null), [cur]);
  if (cur && def) { const solved = stage === 'debrief'; return (
    <div className="chal-run">
      <HudCase c={def} />
      <section className="card"><div className="eyebrow">{KIND[cur.kind]} · {cur.level} · details</div><h2 className="h2">{cur.title}</h2><p>{cur.brief}</p></section>
      {cur.kind === 'fix' && <><NumbersCard hideTrue={!solved} /><FlushCard /><SetupCard /><LineCard id="art" faults={false} /><LineCard id="cvp" faults={false} />{cur.id === 'c-transport' && <TreatCard />}</>}
      {cur.kind === 'goal' && <><TreatCard /><BreathingCard /><NumbersCard /></>}
      {cur.kind === 'read' && <NumbersCard hideTrue={!solved} />}
    </div>
  ); }
  return (
    <div className="chal-list">
      <section className="card"><div className="eyebrow">Cases</div><h2 className="h2">Trust the line — or fix it</h2><p className="muted">Troubleshoot the monitoring system, read the physiology from the waveforms, and treat to targets. Faults are hidden: use the fast-flush test, the level, the cuff and the waveform shape to find them.</p></section>
      {LINES_CASES.map((c) => { const a = attempts[`lines-${c.id}`]; const last = a?.[a.length - 1]; return (
        <button key={c.id} className="chal-item" onClick={() => runCase(`lines-${c.id}`)}>
          <span className={`lvl lvl-${c.level}`}>{c.level}</span><span className="ci-t">{c.title}</span><span className="ci-k">{KIND[c.kind]}</span>{last && <span className={`tick${last.ok ? '' : ' miss'}`}>{last.ok ? '✓' : '✕'}</span>}
        </button>); })}
      <CaseList module="lines" embedded onStart={(c) => runCase(c.id)} />
    </div>
  );
}
