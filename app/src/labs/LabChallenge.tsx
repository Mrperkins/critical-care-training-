import { useProgress } from '../curriculum/progress';
import { useEffect, useMemo } from 'react';
import type { SceneCase } from '../challenge/sceneCases';
import { titleOf } from '../curriculum/titles';
import { useCaseRun } from '../library/caseRun';
import { HudCase } from '../library/CaseGame';
import { runCase } from '../library/launch';
import { takePendingChallenge, usePendingOpen } from '../app/navigate';

import { bench } from './bench';
import { useLabUI } from './labStore';
import { useUI } from '../app/store';
import { LAB_CASES, type LabCase } from '../scenarios/labCases';
import { LAB, flagOf } from '../knowledge/labs';
import { Consequences, fmt } from './LabPanel';

function load(c: LabCase) {
  bench.reset(); if (c.renal != null) bench.pt.p.renal = c.renal; bench.naMode = c.naChronic ? 'chronic' : 'acute';
  for (const [id, v] of Object.entries(c.values)) bench.set(id, v);
  useLabUI.getState().set({ lab: c.focus }); useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
}
const asCase = (c: LabCase): SceneCase => ({
  id: `lab-${c.id}`, module: 'labs', level: c.level as SceneCase['level'], title: titleOf(`lab-${c.id}`), story: c.story,
  setup: () => load(c), facts: () => Object.keys(c.values).map((id) => { const l = LAB[id]; return [l.abbr, `${fmt(l, bench.value(id))} ${l.unit}`] as [string, string]; }),
  questions: [{ q: c.q, options: c.options, answer: c.answer, explain: c.explain }], verify: () => true,
});
/** Lab cases: pick one and it plays over the scene; the consequences of the panel stay here under Details. */
export function LabChallenge() {
  useUI((s) => s.pulse); const attempts = useProgress((s) => s.attempts);
  const runId = useCaseRun((s) => s.id); const pend = usePendingOpen((s) => s.id);
  useEffect(() => { takePendingChallenge((x) => x.startsWith('lab-')); }, [pend]);
  const cur = runId ? LAB_CASES.find((x) => `lab-${x.id}` === runId) : undefined;
  const def = useMemo(() => (cur ? asCase(cur) : null), [cur]);
  if (cur && def) return (
    <div className="chal-run">
      <HudCase c={def} />
      <section className="card"><div className="eyebrow">{cur.level} case · details</div><h2 className="h2">{def.title}</h2><p>{cur.story}</p>
        <div className="panelrow">{Object.keys(cur.values).map((id) => { const l = LAB[id]; const v = bench.value(id); return <span key={id} className={`labchip f-${flagOf(l, v)}`}><span>{l.abbr}</span><b>{fmt(l, v)}</b><small>{l.unit}</small></span>; })}</div>
      </section>
      <Consequences />
    </div>
  );
  return (
    <div className="chal-list">
      <section className="card"><div className="eyebrow">Cases</div><h2 className="h2">Read the panel, make the first move</h2><p className="muted">Each case loads its values on the lab bench, so the organs and cells show what the numbers mean.</p></section>
      {LAB_CASES.map((c) => { const a = attempts[`lab-${c.id}`]; const last = a?.[a.length - 1]; return (
        <button key={c.id} className="chal-item" onClick={() => runCase(`lab-${c.id}`)}>
          <span className={`lvl lvl-${c.level}`}>{c.level}</span><span className="ci-t">{titleOf(`lab-${c.id}`)}</span><span className="ci-k">{c.story.split('.')[0]}</span>
          {last && <span className={`tick${last.ok ? '' : ' miss'}`} aria-label={last.ok ? 'last attempt right' : 'last attempt missed'}>{last.ok ? '✓' : '✕'}</span>}
        </button>); })}
    </div>
  );
}
