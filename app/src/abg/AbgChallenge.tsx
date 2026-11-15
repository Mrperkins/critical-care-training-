import { useProgress } from '../curriculum/progress';
import { useEffect, useMemo, useRef } from 'react';
import { CaseList } from '../challenge/CaseChallenge';
import { CASE_BY_ID, type CaseQ, type SceneCase } from '../challenge/sceneCases';
import { titleOf } from '../curriculum/titles';
import { useCaseRun } from '../library/caseRun';
import { HudCase } from '../library/CaseGame';
import { runCase } from '../library/launch';
import { takePendingChallenge, usePendingOpen } from '../app/navigate';

import { lab } from './lab';
import { useUI } from '../app/store';
import { ABG_PRESETS, type AbgPreset } from '../scenarios/abg';
import { ABG_ACTIONS } from '../scenarios/abgChallenges';
import { interpret, type Disorder } from '../physiology/interpret';
import { AcidBaseMap, SampleCards } from './AbgPanel';
import { AbgTable } from '../vent/VentSim';
import type { Snapshot } from '../physiology/patient';

const PRIMARY: [string, (d: Disorder[], hagma: boolean) => boolean][] = [
  ['Respiratory acidosis', (d) => d.length === 1 && d[0] === 'resp acidosis'],
  ['Respiratory alkalosis', (d) => d.length === 1 && d[0] === 'resp alkalosis'],
  ['Metabolic acidosis — high anion gap', (d, h) => d.length === 1 && d[0] === 'met acidosis' && h],
  ['Metabolic acidosis — normal anion gap', (d, h) => d.length === 1 && d[0] === 'met acidosis' && !h],
  ['Metabolic alkalosis', (d) => d.length === 1 && d[0] === 'met alkalosis'],
  ['Two primary disorders (mixed)', (d) => d.length > 1],
];
const COMP = ['Appropriate compensation', 'Plus a respiratory acidosis (under-breathing)', 'Plus a respiratory alkalosis (over-breathing)', 'Plus a metabolic alkalosis', 'Plus a metabolic acidosis'];
/** the keyed answer plus the next three choices, so every decision is four tiles */
const four = (all: string[], right: number) => { const rest = all.map((_, i) => i).filter((i) => i !== right); const pick = [right, ...rest.slice(0, 3)].sort((a, b) => a - b); return { options: pick.map((i) => all[i]), answer: pick.indexOf(right) }; };
const loadGas = (id: string) => { lab.load(id); lab.fastForward(15); useUI.getState().set({ pulse: useUI.getState().pulse + 1 }); };
const copy = (g: Snapshot): Snapshot => ({ ...g, vbg: { ...g.vbg } });

/** A blood-gas preset as a three-decision case: name it, check the compensation, treat — then the model runs the treatment. */
function gasCase(p: AbgPreset, shots: { before: Snapshot | null; after: Snapshot | null }): SceneCase {
  loadGas(p.id);
  const g = lab.snap; const it = interpret({ pH: g.pH, paco2: g.paco2, hco3: g.hco3, pao2: g.pao2, fio2: lab.pt.p.fio2, na: g.na, cl: g.cl, albumin: g.albumin, age: lab.pt.p.age });
  const k = PRIMARY.findIndex(([, f]) => f(it.primary, it.hagma)); const q1 = four(PRIMARY.map(([l]) => l), k < 0 ? 5 : k);
  const sec = it.secondary[0]; const comp = !sec ? 0 : sec === 'resp acidosis' ? 1 : sec === 'resp alkalosis' ? 2 : sec === 'met alkalosis' ? 3 : 4; const q2 = four(COMP, comp);
  const act = ABG_ACTIONS[p.id];
  const questions: CaseQ[] = [{ q: 'What is the primary disturbance?', ...q1, explain: `${it.summary}. ${it.steps.slice(0, 2).map((s) => s.text).join(' ')}` }];
  if (it.primary.length === 1) questions.push({ q: 'Is the compensation appropriate?', ...q2, explain: it.steps.filter((s) => s.key === 'comp' || s.key === 'ag').map((s) => s.text).join(' ') });
  questions.push({ q: 'What will you do?', options: act.options, answer: act.answer, explain: act.explain,
    after: () => { shots.before = copy(lab.snap); act.apply(lab); lab.fastForward(act.ffMin); shots.after = copy(lab.snap); useUI.getState().set({ pulse: useUI.getState().pulse + 1 }); } });
  return {
    id: `abg-${p.id}`, module: 'abg', level: 'Intermediate', title: titleOf(`abg-${p.id}`), story: p.story,
    setup: () => loadGas(p.id), verify: () => true, questions,
    facts: () => { const s = lab.snap; return [['pH', s.pH.toFixed(2)], ['PaCO₂', `${s.paco2.toFixed(0)} mmHg`], ['PaO₂', `${s.pao2.toFixed(0)} mmHg`], ['HCO₃⁻', `${s.hco3.toFixed(0)} mEq/L`], ['Lactate', `${s.lactate.toFixed(1)}`], ['Breathing', lab.pt.vent ? 'ventilated' : `own breathing, FiO₂ ${lab.pt.p.fio2.toFixed(2)}`], ['Electrolytes', `Na⁺ ${s.na.toFixed(0)} · Cl⁻ ${s.cl.toFixed(0)} · albumin ${s.albumin.toFixed(1)}`]]; },
  };
}
function GasHud({ p }: { p: AbgPreset }) {
  useUI((s) => s.pulse);
  const shots = useRef<{ before: Snapshot | null; after: Snapshot | null }>({ before: null, after: null }).current;
  const def = useMemo(() => gasCase(p, shots), [p]); // eslint-disable-line react-hooks/exhaustive-deps
  const act = ABG_ACTIONS[p.id];
  const table = () => (shots.before && shots.after ? <div className="case-panel"><p className="hud-tip">The model has run the correct treatment for {act.ffMin >= 60 ? `${act.ffMin / 60} h` : `${act.ffMin} min`}:</p><AbgTable rows={[{ t: 'Before', g: shots.before, fio2: 0 }, { t: 'After', g: shots.after, fio2: 0 }]} /></div> : null);
  return <div className="chal-run"><HudCase c={def} debriefExtra={table} />
    <section className="card"><div className="eyebrow">Blood-gas case · details</div><h2 className="h2">{def.title}</h2><p>{p.story}</p></section>
    <SampleCards /><AcidBaseMap /></div>;
}

/** Blood-gas cases: every preset and the oxygen-reserve cases, each played over the scene. */
export function AbgChallenge() {
  const attempts = useProgress((s) => s.attempts); const runId = useCaseRun((s) => s.id); const pend = usePendingOpen((s) => s.id);
  useEffect(() => { takePendingChallenge((x) => x.startsWith('abg-') || CASE_BY_ID[x]?.module === 'abg'); }, [pend]);
  const pool = ABG_PRESETS.filter((p) => p.id !== 'normal' && ABG_ACTIONS[p.id]);
  const cur = runId ? pool.find((p) => `abg-${p.id}` === runId) : undefined;
  if (cur) return <GasHud key={cur.id} p={cur} />;
  return (
    <div className="chal-list">
      <section className="card"><div className="eyebrow">Cases</div><h2 className="h2">Name the gas, then treat the patient</h2><p className="muted">Three decisions each: the primary disturbance, the compensation, and what you do. Then the model runs the treatment and shows the gas afterwards.</p></section>
      {pool.map((p) => { const a = attempts[`abg-${p.id}`]; const last = a?.[a.length - 1]; return (
        <button key={p.id} className="chal-item" onClick={() => runCase(`abg-${p.id}`)}>
          <span className="lvl lvl-Intermediate">Gas</span><span className="ci-t">{titleOf(`abg-${p.id}`)}</span><span className="ci-k">3 decisions</span>
          {last && <span className={`tick${last.ok ? '' : ' miss'}`} aria-label={last.ok ? 'last attempt right' : 'last attempt missed'}>{last.ok ? '✓' : '✕'}</span>}
        </button>); })}
      <CaseList module="abg" embedded onStart={(c) => runCase(c.id)} />
    </div>
  );
}
