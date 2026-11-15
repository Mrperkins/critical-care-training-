/**
 * Library cases on the case HUD. Scene cases (case-*) run here end to end: the report card, a look at the
 * patient, then each decision as answer tiles over the scene, then the debrief with stars.
 * Engine cases (blood gas, labs, lines) are described by their own panel and play on the same HUD (HudCase);
 * the engine's controls sit in the Details drawer.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CASE_BY_ID, type SceneCase } from '../challenge/sceneCases';
import { answer, finishTask, nextQuestion, startCase, useCaseRun } from './caseRun';
import { CARD, Review } from './CaseRunner';
import { bonus, endGame, finishGame, fmtClock, order, practice, scoreDecision, startGame, starsFor, toast, useGame } from './game';
import { usePlayerUI, type Chip } from './playerUI';
import { useLibrary } from './libraryStore';
import { afterCase } from './launch';
import { MISSION_BY_ID, useMission } from './missions';

const isNum = (v: string) => /^[\d\s.,/%:≈~<>+−–-]+[a-zA-Z₂%/ ·]{0,10}$/.test(v);
export const nextInfo = afterCase;

/**
 * One case on the HUD: report → look → each decision (the case can move on between decisions) → an optional
 * hands-on task → debrief. Scene cases are mounted by CaseGame; an engine's panel mounts this for its own cases.
 */
export function HudCase({ c, debriefExtra }: { c: SceneCase; debriefExtra?: () => ReactNode }) {
  const stage = useCaseRun((s) => s.stage); const qi = useCaseRun((s) => s.qi); const decisions = useCaseRun((s) => s.decisions); const set = useCaseRun((s) => s.set);
  const startedAt = useCaseRun((s) => s.startedAt); const taskOk = useCaseRun((s) => s.taskOk);
  const shown = useRef(Date.now()); const scened = useRef(-1);
  const engine = !CASE_BY_ID[c.id];
  // engine cases: tell the shell what is running, so answers are scored and recorded the same way
  useEffect(() => { if (engine) useCaseRun.getState().set({ def: c }); }, [c, engine, startedAt]);
  // put the case's state back on screen once the module's own code has mounted
  useEffect(() => { const t = setTimeout(() => { if (!useCaseRun.getState().decisions.length) c.setup(); }, 450); return () => clearTimeout(t); }, [c, startedAt]);
  useEffect(() => { const ms = useMission.getState(); const m = ms.id ? MISSION_BY_ID[ms.id] : null; startGame(c.id, c.title, { level: m ? `${m.title} · call ${ms.leg + 1} of ${m.legs.length}` : `${c.level} case` }); return () => endGame(); }, [c, startedAt]);
  // live numbers: an engine keeps running under the case, and a decision can change the patient
  const [tick, setTick] = useState(0);
  useEffect(() => { if (stage === 'debrief') return; const t = setInterval(() => setTick((n) => n + 1), 1000); return () => clearInterval(t); }, [stage]);
  const facts = useMemo(() => { try { return c.facts(); } catch { return []; } }, [c, stage, qi, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const chips: Chip[] = facts.filter(([, v]) => isNum(v)).slice(0, 5).map(([k, v]) => ({ label: k, value: v }));
  const chipKey = chips.map((x) => x.value).join('|');
  const notes = facts.filter(([, v]) => !isNum(v));
  const q = c.questions[Math.min(qi, c.questions.length - 1)];
  const ord = useMemo(() => order(q.options.length, `${c.id}:${qi}`), [c, qi, q.options.length]);
  const mine = decisions.find((d) => d.q === qi);
  const goals = stage === 'task' && c.task ? c.task.goals.map((g) => { try { return g.test(); } catch { return false; } }) : null;
  const goalKey = goals?.join('') ?? '';
  const held = useRef<number | null>(null);
  useEffect(() => {
    if (stage !== 'task' || !c.task || !goals) return;
    if (goals.every(Boolean)) { held.current ??= Date.now(); if (Date.now() - held.current >= c.task.holdMs) { bonus(150); toast(true, '+150 · fixed'); finishTask(true); } } else held.current = null;
  }, [tick, goalKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const g = useGame.getState(); if (!g.id) return;
    const n = c.questions.length; const count = `${n} decision${n === 1 ? '' : 's'}${c.task ? ' · hands-on fix' : ''}`;
    if (stage === 'patient') g.set({ chips, banner: null, goals: null, tools: null, question: null, card: { kicker: `${c.level} case · ${count}`, title: c.title, text: c.story, items: notes, cta: { label: 'Assess the patient', onClick: () => set({ stage: 'assess' }) } } });
    if (stage === 'assess') g.set({ chips, question: null, card: { compact: true, title: 'Look before you decide', text: engine ? 'Read the monitor and the scene. The controls and the full numbers are under Details.' : 'Turn the scene, change the view and use the labels. Written findings stay hidden until the debrief.', secondary: { label: 'Back to the report', onClick: () => set({ stage: 'patient' }) }, cta: { label: 'I’m ready to decide', onClick: () => set({ stage: 'decide' }) } } });
    if (stage === 'decide') {
      if (!mine) shown.current = Date.now();
      // the case moves on: put the new state on screen once, and say what changed
      if (scened.current !== qi) { scened.current = qi; if (q.scene && !mine) { q.scene(); setTick((x) => x + 1); } }
      g.set({ chips, card: null, goals: null, tools: null, banner: null,
        question: { key: `${c.id}:${qi}`, lead: q.update, q: `${qi + 1}/${n} · ${q.q}`, tiles: ord.map((k) => ({ label: q.options[k] })), answer: ord.indexOf(q.answer), explain: q.explain, picked: mine ? ord.indexOf(mine.pick) : null, shownAt: shown.current },
        onAnswer: (i) => { const k = ord[i]; const ok = k === q.answer; const pts = scoreDecision(ok, shown.current); if (ok && !practice()) toast(true, `+${pts}${pts > 150 ? ' · fast' : ''}`); answer(k); },
        continueLabel: qi + 1 < n ? 'Next decision' : c.task ? 'Now fix it' : 'See the debrief', onContinue: nextQuestion });
    }
    if (stage === 'task' && c.task && goals) {
      g.set({ question: null, banner: null, chips: c.task.goals.map((x) => ({ label: x.label, value: '' })), goals: c.task.goals.map((x, i) => ({ label: x.label, ok: goals[i] })),
        card: { compact: true, kicker: 'Hands on', title: c.task.title, text: c.task.text, secondary: { label: 'Show me the answer', onClick: () => finishTask(false) }, cta: { label: 'Open the controls', onClick: () => usePlayerUI.getState().set({ details: true }) } } });
    }
    if (stage === 'debrief') {
      const right = decisions.filter((d) => d.ok).length + (taskOk ? 1 : 0); const total = n + (c.task ? 1 : 0); const ms = Date.now() - startedAt; const par = 25000 * n + (c.task ? 60000 : 0);
      const Card = c.card ? CARD[c.card] : null;
      finishGame({ ok: right === total, right, total, ms, stars: starsFor(right, total, ms, par),
        tip: right === total && ms > par ? `⭐ For the third star, finish in under ${fmtClock(par)}.` : undefined,
        lines: [...decisions.map((d) => { const x = c.questions[d.q]; return { q: x.q, ok: d.ok, yours: x.options[d.pick], best: x.options[x.answer], explain: x.explain }; }),
          ...(c.task ? [{ q: c.task.title, ok: !!taskOk, explain: taskOk ? 'You fixed it at the bedside and it held.' : c.task.text }] : [])],
        extra: <>{debriefExtra?.()}<Review id={c.id} ok={right === total} />{Card && <div className="case-panel"><Card /></div>}</> }, { ...afterCase({ right, total }), onReplay: () => startCase(c.id) });
    }
  }, [stage, qi, mine?.pick, chipKey, goalKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Mounted by the app while a library case runs (in a module or on its own). */
export function CaseGame() {
  const id = useCaseRun((s) => s.id); const startedAt = useCaseRun((s) => s.startedAt);
  if (!id) return null;
  const c = CASE_BY_ID[id];
  if (c) return <HudCase key={`${id}:${startedAt}`} c={c} />;
  return null; // the ventilator, blood gas, labs and lines panels put their own cases on the HUD
}
