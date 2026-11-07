/**
 * Library cases on the case HUD. Scene cases (case-*) run here end to end: the report card, a look at the
 * patient, then each decision as answer tiles over the scene, then the debrief with stars.
 * Engine cases outside the ventilator (blood gas, labs, lines) keep their own panel beside the scene; when
 * the engine records the attempt this shows the debrief over the scene.
 */
import { useEffect, useMemo, useRef } from 'react';
import { CASE_BY_ID, type SceneCase } from '../challenge/sceneCases';
import { useProgress } from '../curriculum/progress';
import { titleOf } from '../curriculum/titles';
import { answer, nextQuestion, startCase, useCaseRun } from './caseRun';
import { CARD, Review } from './CaseRunner';
import { endGame, finishGame, fmtClock, order, practice, scoreDecision, startGame, starsFor, toast, useGame } from './game';
import type { Chip } from './playerUI';
import { useLibrary } from './libraryStore';
import { exitPlayer, nextStep } from './launch';
import { MODULE_BY_ID } from './modules';

const isNum = (v: string) => /^[\d\s.,/%:≈~<>+−–-]+[a-zA-Z₂%/ ·]{0,10}$/.test(v);
function nextInfo() {
  const p = useLibrary.getState().playing;
  if (!p) return { onNext: () => exitPlayer(), nextLabel: 'Back to cases' };
  const m = MODULE_BY_ID[p.moduleId]; return { onNext: () => nextStep(), nextLabel: p.step + 1 < m.steps.length ? 'Next step' : 'Finish module' };
}

function SceneCaseGame({ c }: { c: SceneCase }) {
  const stage = useCaseRun((s) => s.stage); const qi = useCaseRun((s) => s.qi); const decisions = useCaseRun((s) => s.decisions); const set = useCaseRun((s) => s.set);
  const startedAt = useCaseRun((s) => s.startedAt);
  const shown = useRef(Date.now());
  // put the case's state back on screen once the module's own code has mounted
  useEffect(() => { const t = setTimeout(() => { if (!useCaseRun.getState().decisions.length) c.setup(); }, 450); return () => clearTimeout(t); }, [c, startedAt]);
  useEffect(() => { startGame(c.id, c.title, { level: `${c.level} case` }); return () => endGame(); }, [c, startedAt]);
  const facts = useMemo(() => { try { return c.facts(); } catch { return []; } }, [c, stage]);
  const chips: Chip[] = facts.filter(([, v]) => isNum(v)).slice(0, 5).map(([k, v]) => ({ label: k, value: v }));
  const notes = facts.filter(([, v]) => !isNum(v));
  const ord = useMemo(() => order(c.questions[qi].options.length, `${c.id}:${qi}`), [c, qi]);
  const mine = decisions.find((d) => d.q === qi);
  useEffect(() => {
    const g = useGame.getState(); if (!g.id) return;
    if (stage === 'patient') g.set({ chips, question: null, card: { kicker: `${c.level} case · ${c.questions.length} decisions`, title: c.title, text: c.story, items: notes, cta: { label: 'Assess the patient', onClick: () => set({ stage: 'assess' }) } } });
    if (stage === 'assess') g.set({ chips, question: null, card: { compact: true, title: 'Look before you decide', text: 'Turn the scene, change the view and use the labels. Written findings stay hidden until the debrief.', secondary: { label: 'Back to the report', onClick: () => set({ stage: 'patient' }) }, cta: { label: 'I’m ready to decide', onClick: () => set({ stage: 'decide' }) } } });
    if (stage === 'decide') {
      const q = c.questions[qi]; if (!mine) shown.current = Date.now();
      g.set({ chips, card: null, question: { key: `${c.id}:${qi}`, q: `${qi + 1}/${c.questions.length} · ${q.q}`, tiles: ord.map((k) => ({ label: q.options[k] })), answer: ord.indexOf(q.answer), explain: q.explain, picked: mine ? ord.indexOf(mine.pick) : null, shownAt: shown.current },
        onAnswer: (i) => { const k = ord[i]; const ok = k === q.answer; const pts = scoreDecision(ok, shown.current); if (ok && !practice()) toast(true, `+${pts}${pts > 150 ? ' · fast' : ''}`); answer(k); },
        continueLabel: qi + 1 < c.questions.length ? 'Next decision' : 'See the debrief', onContinue: nextQuestion });
    }
    if (stage === 'debrief') {
      const right = decisions.filter((d) => d.ok).length; const total = c.questions.length; const ms = decisions[decisions.length - 1]?.atMs ?? Date.now() - startedAt;
      const Card = c.card ? CARD[c.card] : null;
      finishGame({ ok: right === total, right, total, ms, stars: starsFor(right, total, ms, 25000 * total),
        tip: right === total && ms > 25000 * total ? `⭐ For the third star, finish in under ${fmtClock(25000 * total)}.` : undefined,
        lines: decisions.map((d) => { const q = c.questions[d.q]; return { q: q.q, ok: d.ok, yours: q.options[d.pick], best: q.options[q.answer], explain: q.explain }; }),
        extra: <><Review id={c.id} ok={right === total} />{Card && <div className="case-panel"><Card /></div>}</> }, { ...nextInfo(), onReplay: () => startCase(c.id) });
    }
  }, [stage, qi, mine?.pick]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** An engine-owned case in the player: show the debrief over the scene once the engine records the attempt. */
function EngineCaseWatch({ id }: { id: string }) {
  const prior = useCaseRun((s) => s.priorAttempts); const startedAt = useCaseRun((s) => s.startedAt);
  const list = useProgress((s) => s.attempts[id]) ?? []; const last = list.length > prior ? list[list.length - 1] : null;
  const shown = useRef(false);
  useEffect(() => {
    if (!last || shown.current) return; shown.current = true;
    const ms = Math.max(0, new Date(last.at).getTime() - startedAt);
    const t = setTimeout(() => { // let the engine's own explanation land first
      startGame(id, titleOf(id)); useGame.setState({ startedAt }); scoreDecision(last.ok, startedAt);
      finishGame({ ok: last.ok, right: last.ok ? 1 : 0, total: 1, ms, stars: last.ok ? (ms <= 60000 ? 3 : 2) : 0, extra: <Review id={id} ok={last.ok} /> },
        { ...nextInfo(), onReplay: () => endGame(), replayLabel: 'See the case' });
    }, 1800);
    return () => clearTimeout(t);
  }, [last]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => endGame(), []);
  return null;
}

/** Mounted by the app while a library case runs (in a module or on its own). */
export function CaseGame() {
  const id = useCaseRun((s) => s.id); const startedAt = useCaseRun((s) => s.startedAt);
  if (!id) return null;
  const c = CASE_BY_ID[id];
  if (c) return <SceneCaseGame key={`${id}:${startedAt}`} c={c} />;
  if (id.startsWith('vent-')) return null; // the ventilator plays its own cases on the HUD (vent/VentGame)
  return <EngineCaseWatch key={`${id}:${startedAt}`} id={id} />;
}
