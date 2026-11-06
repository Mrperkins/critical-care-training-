/**
 * Ventilator cases played on the case HUD (library/game.ts) over the live lung model.
 *  - alarm: the alarm sounds and the patient slips until you act → action tray (hold, bag, check the tube,
 *    sedate) → where is the pressure going? → what do you do first? (the fix is then applied to the model)
 *  - goal: reach the targets with the controls that matter; goals tick live; "+30 min" lets the gas catch up
 *  - dyss: name the dyssynchrony from the waveform, then fix it until the bedside metric resolves
 * The Details drawer keeps the full numbers, every setting, interventions, loops and the blood gas.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useProgress } from '../curriculum/progress';
import { useUI } from '../app/store';
import { session } from './session';
import { ventNumbers } from './numbers';
import { loadVentScenario, VentSettingsFold, VentNumbersCard, Interventions, GasFold } from './VentPanel';
import { Fold } from '../scene/pane';
import { Loops } from './Waveforms';
import type { VentChallenge as VC, Goal } from '../scenarios/ventChallenges';
import { DYSS, DYSSYNCHRONIES } from '../scenarios/dyssynchrony';
import type { VentNumbers } from '../knowledge/ventExplain';
import type { Snapshot } from '../physiology/patient';
import type { VentSettings } from '../physiology/mechanics';
import { bonus, finishGame, harm, order, practice, scoreDecision, startGame, starsFor, toast, useGame, endGame, type HudControl, type Tile } from '../library/game';
import { usePlayerUI, type Chip } from '../library/playerUI';
import { useLibrary } from '../library/libraryStore';
import { nextStep } from '../library/launch';
import { MODULE_BY_ID } from '../library/modules';

const r0 = (x: number) => String(Math.round(x));
const tile = (o: string): Tile => { const [label, ...rest] = o.split(' — '); return { label, sub: rest.join(' — ') || undefined }; };

/** What each tray action means in each alarm case (written to DOPE: displacement, obstruction, pneumothorax, equipment). */
type Reply = { ok: boolean | null; text: string };
const ALARM_REPLIES: Record<string, Record<'bag' | 'tube' | 'sedate', Reply>> = {
  'alarm-ett': {
    bag: { ok: null, text: 'Bagging is the move if the patient is crashing — it takes the ventilator out of the picture. SpO₂ is holding here, so a hold tells you more and keeps the waveforms.' },
    tube: { ok: null, text: 'Same depth at the teeth, no visible kink, not biting. You can’t see inside the tube — a hold shows whether the pressure is in the tube or the lung.' },
    sedate: { ok: false, text: 'Sedation treats the number, not the cause. With an unexplained high-pressure alarm, find the cause first.' },
  },
  'alarm-ptx': {
    bag: { ok: null, text: 'Reasonable with BP falling: it rules the ventilator out, and the bag feels stiff. Still do the hold — it shows where the pressure is going.' },
    tube: { ok: null, text: 'Tube position unchanged and the circuit is intact. The problem looks beyond the tube — do a hold.' },
    sedate: { ok: false, text: 'Sedating a hypotensive patient with a new high-pressure alarm can drop the BP further and hides the cause.' },
  },
  'alarm-plug': {
    bag: { ok: null, text: 'Fine while SpO₂ falls — bag on 100 % and listen. Then a hold tells you whether the lung or the airway changed.' },
    tube: { ok: null, text: 'Same depth after the turn, so not displaced. Something beyond the tip changed — do a hold.' },
    sedate: { ok: false, text: 'The patient isn’t fighting the vent — sedation won’t reopen a blocked lung.' },
  },
};
const DEFAULT_REPLIES = ALARM_REPLIES['alarm-ett'];

/** The settings that matter in each target round (everything else stays in Details). */
const GOAL_CONTROLS: Record<string, (keyof VentSettings)[]> = { 'goal-ards': ['vt', 'peep', 'fio2'], 'goal-asthma': ['rr', 'flow', 'vt'] };
const CTL: Partial<Record<keyof VentSettings, { label: string; min: number; max: number; step: number; show: (v: number) => string }>> = {
  vt: { label: 'Tidal vol', min: 0.2, max: 0.9, step: 0.02, show: (v) => `${Math.round(v * 1000)}` },
  rr: { label: 'Rate', min: 4, max: 40, step: 1, show: r0 },
  peep: { label: 'PEEP', min: 0, max: 24, step: 1, show: r0 },
  fio2: { label: 'FiO₂', min: 0.21, max: 1, step: 0.05, show: (v) => `${Math.round(v * 100)}%` },
  flow: { label: 'Insp flow', min: 20, max: 120, step: 5, show: r0 },
  ps: { label: 'Support', min: 0, max: 25, step: 1, show: r0 },
  cyclePct: { label: 'Cycle-off', min: 5, max: 80, step: 5, show: (v) => `${v}%` },
  trigFlow: { label: 'Trigger', min: 0.5, max: 10, step: 0.5, show: (v) => v.toFixed(1) },
  ti: { label: 'Insp time', min: 0.4, max: 3, step: 0.1, show: (v) => v.toFixed(1) },
};
function control(key: keyof VentSettings): HudControl | null {
  const d = CTL[key]; if (!d) return null; const v = session.m.s[key] as number;
  const put = (x: number) => { session.set({ [key]: Math.round(Math.min(d.max, Math.max(d.min, x)) * 1000) / 1000 } as Partial<VentSettings>); useUI.getState().set({ pulse: useUI.getState().pulse + 1 }); };
  return { key, label: d.label, value: d.show(v), dec: () => put(v - d.step), inc: () => put(v + d.step) };
}
/** The live value a goal is about, read from its label. */
function goalValue(gl: Goal, n: VentNumbers, g: Snapshot) {
  const l = gl.label;
  if (/Vt/.test(l)) return n.vtPerKg.toFixed(1); if (/Plateau/.test(l)) return r0(n.pplat); if (/Driving/.test(l)) return r0(n.dp);
  if (/SpO/.test(l)) return `${Math.round(g.spo2 * 100)}%`; if (/pH/.test(l)) return g.pH.toFixed(2); if (/Auto-PEEP/.test(l)) return n.autoPeep.toFixed(1); if (/MAP/.test(l)) return r0(g.map);
  return '';
}
/** Live numbers for an alarm. The plateau only exists after a hold, so the last measured one is kept on screen
 *  (with the peak of that breath) until the case ends — otherwise it would vanish a few breaths later. */
function alarmChips(n: VentNumbers, held: { pip: number; pplat: number } | null): Chip[] {
  const out: Chip[] = [{ label: 'PIP', value: r0(n.pip), tone: n.pip > 30 ? 'hot' : undefined }];
  const plat = n.pplatMeasured ? { pip: n.pip, pplat: n.pplat } : held;
  out.push({ label: 'Pplat', value: plat ? r0(plat.pplat) : '—', tone: plat && plat.pplat > 30 ? 'hot' : undefined });
  if (plat) { const gap = plat.pip - plat.pplat; out.push({ label: 'Gap', value: r0(gap), tone: gap > 10 ? 'hot' : undefined }); }
  out.push({ label: 'SpO₂', value: `${Math.round(n.spo2 * 100)}`, tone: n.spo2 < 0.92 ? 'bad' : undefined });
  out.push({ label: 'MAP', value: r0(n.map), tone: n.map < 65 ? 'bad' : undefined });
  return out;
}
function nextInfo() {
  const p = useLibrary.getState().playing; if (!p) return null;
  const m = MODULE_BY_ID[p.moduleId]; return { onNext: () => nextStep(), nextLabel: p.step + 1 < m.steps.length ? 'Next step' : 'Finish module' };
}

/** The drawer: what the old challenge panel showed, minus the questions (those are on the HUD now). */
function Drawer({ c }: { c: VC }) {
  return <div className="chal-run vent-game-drawer">
    <section className="card"><div className="eyebrow">{c.level} · {c.kind === 'dyss' ? 'Dyssynchrony' : c.kind === 'alarm' ? 'Alarm' : 'Targets'}</div><h2 className="h2">{c.title}</h2><p>{c.brief}</p></section>
    <VentNumbersCard />
    <section className="card"><div className="card-h"><h3>Act</h3></div><Interventions /></section>
    {c.kind !== 'alarm' && <VentSettingsFold group="vent-chal" defaultOpen />}
    <Fold group="vent-chal" id="loops" title="Loops"><section className="card"><Loops /></section></Fold>
    <GasFold group="vent-chal" />
  </div>;
}

export function VentGame({ c, onExit, onDone }: { c: VC; onExit: () => void; onDone: () => void }) {
  const [run, setRun] = useState(0);
  const restart = () => { loadVentScenario(c.scenario, c.dyss ?? null); if (c.settings) session.set(c.settings); useUI.getState().set({ showPmus: false }); setRun((x) => x + 1); };
  useEffect(() => () => endGame(), []);
  const inPlayer = !!useLibrary((s) => s.playing);
  const exit = inPlayer ? undefined : () => { endGame(); onExit(); };
  return <>
    {c.kind === 'alarm' && <AlarmRun key={run} c={c} onExit={exit} onDone={onDone} replay={restart} />}
    {c.kind === 'goal' && <GoalRun key={run} c={c} onExit={exit} onDone={onDone} replay={restart} />}
    {c.kind === 'dyss' && <DyssRun key={run} c={c} onExit={exit} onDone={onDone} replay={restart} />}
    <Drawer c={c} />
  </>;
}
type RunProps = { c: VC; onExit?: () => void; onDone: () => void; replay: () => void };

function AlarmRun({ c, onExit, onDone, replay }: RunProps) {
  const pulse = useUI((s) => s.pulse);
  const [phase, setPhase] = useState<'act' | 'holding' | 'q1' | 'q2' | 'done'>('act');
  const picks = useRef<{ q1: number | null; q2: number | null; shown: number }>({ q1: null, q2: null, shown: 0 });
  const heldAt = useRef({ breath: 0, at: 0 });
  const held = useRef<{ pip: number; pplat: number } | null>(null);
  const replies = ALARM_REPLIES[c.id] ?? DEFAULT_REPLIES;
  const o1 = useMemo(() => order(c.options?.length ?? 0, `${c.id}:1`), [c]); const o2 = useMemo(() => order(c.action?.options.length ?? 0, `${c.id}:2`), [c]);
  useEffect(() => { startGame(`vent-${c.id}`, c.title, { level: c.level, decaying: true, onExit, exitLabel: 'All cases', traces: ['p'] }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const n = ventNumbers(session);
  // live numbers and the alarm banner, every tick
  useEffect(() => {
    const g = useGame.getState(); if (!g.id || g.debrief) return;
    if (n.pplatMeasured) held.current = { pip: n.pip, pplat: n.pplat };
    g.set({ chips: alarmChips(n, held.current), banner: phase === 'q2' && picks.current.q2 != null ? { tone: 'ok', text: 'Fix applied — watch the pressure come down' } : { tone: 'alarm', text: `High pressure · ${r0(n.pip)} cmH₂O` } });
  }, [pulse, phase]); // eslint-disable-line react-hooks/exhaustive-deps
  // after the hold, move on once the plateau has been measured on a new breath (or after 12 s)
  useEffect(() => { if (phase === 'holding' && ((n.pplatMeasured && session.breathN > heldAt.current.breath) || Date.now() - heldAt.current.at > 12000)) setTimeout(() => setPhase('q1'), 900); }, [pulse, phase]); // eslint-disable-line react-hooks/exhaustive-deps
  // the tray
  useEffect(() => {
    if (phase !== 'act') { useGame.getState().set({ actions: null }); return; }
    useGame.getState().set({
      card: { title: c.title, text: c.brief.split(/(?<=\.)\s/)[0], compact: true, secondary: c.brief.includes('. ') ? { label: 'Hint', onClick: () => toast(null, c.brief.split(/(?<=\.)\s/).slice(1).join(' ')) } : undefined },
      actions: [
        { id: 'hold', label: 'Inspiratory hold', sub: 'see the plateau', icon: '⏸', primary: true },
        { id: 'bag', label: 'Bag off the vent', sub: 'DOPE', icon: '🫁' },
        { id: 'tube', label: 'Check the tube', sub: 'depth · kinks · biting', icon: '🔍' },
        { id: 'sedate', label: 'Sedate', sub: 'or paralyse', icon: '💊' },
      ],
      onAction: (id) => {
        if (id === 'hold') { session.hold('i'); heldAt.current = { breath: session.breathN, at: Date.now() }; bonus(practice() ? 0 : 50); useGame.getState().set({ decaying: false }); toast(true, 'Holding — the plateau shows when the next breath pauses.'); setPhase('holding'); return; }
        const r = replies[id as 'bag' | 'tube' | 'sedate']; if (r.ok === false) harm(0.15); toast(r.ok, r.text);
      },
    });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps
  // the two decisions
  useEffect(() => {
    const g = useGame.getState();
    if (phase === 'q1' || phase === 'q2') {
      const q = phase === 'q1' ? { q: c.question!, opts: c.options!, ans: c.answer!, exp: c.explain!, ord: o1 } : { q: c.action!.question, opts: c.action!.options, ans: c.action!.answer, exp: c.action!.explain, ord: o2 };
      picks.current.shown = Date.now();
      g.set({ card: null, question: { key: phase, q: q.q, tiles: q.ord.map((k) => tile(q.opts[k])), answer: q.ord.indexOf(q.ans), explain: q.exp, picked: null, shownAt: picks.current.shown },
        onAnswer: (i) => {
          const k = q.ord[i]; const ok = k === q.ans; const pts = scoreDecision(ok, picks.current.shown);
          const cur = useGame.getState().question!; useGame.getState().set({ question: { ...cur, picked: i } });
          if (!practice() && ok) toast(true, `+${pts}${pts > 150 ? ' · fast' : ''}`);
          if (phase === 'q1') picks.current.q1 = k;
          else { picks.current.q2 = k; const fix = session.sc.fixes[0]; if (fix) session.intervene(fix); useGame.getState().set({ decaying: false, patient: Math.min(1, useGame.getState().patient + 0.4) }); }
        },
        continueLabel: phase === 'q1' ? 'What do you do first?' : 'See how you did', onContinue: () => setPhase(phase === 'q1' ? 'q2' : 'done') });
    }
    if (phase === 'done') {
      const ok1 = picks.current.q1 === c.answer, ok2 = picks.current.q2 === c.action!.answer; const right = Number(ok1) + Number(ok2);
      const ms = Date.now() - useGame.getState().startedAt;
      useProgress.getState().record(`vent-${c.id}`, right === 2); onDone();
      finishGame({ ok: right === 2, right, total: 2, ms, stars: starsFor(right, 2, ms, 45000), tip: right === 2 && ms > 45000 ? '⭐ For the third star, clear it in under 0:45.' : undefined,
        lines: [
          { q: c.question!, ok: ok1, yours: c.options![picks.current.q1 ?? 0], best: c.options![c.answer!], explain: c.explain! },
          { q: c.action!.question, ok: ok2, yours: c.action!.options[picks.current.q2 ?? 0], best: c.action!.options[c.action!.answer], explain: c.action!.explain },
        ] }, { ...nextInfo(), onReplay: replay });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function GoalRun({ c, onExit, onDone, replay }: RunProps) {
  const pulse = useUI((s) => s.pulse); const [solved, setSolved] = useState(false);
  const touched = useRef(false); const solvedRef = useRef(false); solvedRef.current = solved;
  useEffect(() => { startGame(`vent-${c.id}`, c.title, { level: c.level, onExit, exitLabel: 'All cases', traces: c.id.includes('asthma') ? ['p', 'q'] : ['p'] }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (!solvedRef.current && touched.current) useProgress.getState().record(`vent-${c.id}`, false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const n = ventNumbers(session); const g = session.snap; const since = session.breathN - session.changedAt;
  const res = (c.goals ?? []).map((gl) => gl.test(n, g)); const all = res.length > 0 && res.every(Boolean) && since >= 6;
  if (since > 0 && session.changedAt > 0) touched.current = true;
  useEffect(() => {
    const st = useGame.getState(); if (!st.id || st.debrief) return;
    const keys = GOAL_CONTROLS[c.id] ?? ['vt', 'rr', 'peep'];
    st.set({
      goals: (c.goals ?? []).map((gl, i) => ({ label: gl.label, ok: res[i] })),
      chips: (c.goals ?? []).map((gl) => ({ label: gl.label, value: goalValue(gl, n, g) })),
      card: { title: c.title, text: `${c.brief}${since < 6 && session.changedAt > 0 ? ` · settling ${Math.max(0, since)}/6 breaths` : ''}`, compact: true },
      controls: keys.map(control).filter((x): x is HudControl => !!x),
      tools: [{ label: '+30 min', icon: '⏩', primary: true, onClick: () => { session.fastForward(30); useUI.getState().set({ pulse: useUI.getState().pulse + 1 }); toast(null, '30 minutes later — the blood gas has caught up.'); } },
        { label: 'All settings', icon: '⚙', onClick: () => usePlayerUI.getState().set({ details: true }) }],
    });
  }, [pulse]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!all || solved) return; setSolved(true); onDone(); useProgress.getState().record(`vent-${c.id}`, true);
    const ms = Date.now() - useGame.getState().startedAt; const total = c.goals?.length ?? 0;
    bonus(practice() ? 0 : 300);
    finishGame({ ok: true, right: total, total, ms, stars: starsFor(total, total, ms, 120000), verdict: 'Targets reached', tip: ms > 120000 ? '⭐ For the third star, reach every target in under 2:00.' : undefined,
      lines: (c.goals ?? []).map((gl) => ({ q: gl.label, ok: true, explain: `Reached: ${goalValue(gl, ventNumbers(session), session.snap)}` })) }, { ...nextInfo(), onReplay: replay });
  }, [all]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function DyssRun({ c, onExit, onDone, replay }: RunProps) {
  const pulse = useUI((s) => s.pulse); const d = DYSS[c.dyss!];
  const names = useMemo(() => DYSSYNCHRONIES.map((x) => x.name), []); const ord = useMemo(() => order(names.length, c.id), [c.id, names.length]);
  const [phase, setPhase] = useState<'q' | 'fix' | 'done'>('q'); const pick = useRef<number | null>(null); const shown = useRef(Date.now());
  useEffect(() => { startGame(`vent-${c.id}`, c.title, { level: c.level, onExit, exitLabel: 'All cases', traces: ['p', 'q'] }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const n = ventNumbers(session); const r = session.m.recent(6); const since = session.breathN - session.changedAt; const v = d.metric(r);
  const fixed = phase === 'fix' && v <= d.threshold && since >= 6;
  useEffect(() => {
    const st = useGame.getState(); if (!st.id || st.debrief) return;
    st.set({ chips: [{ label: 'PIP', value: r0(n.pip) }, { label: 'Vte', value: r0(n.vte * 1000) }, { label: 'RR', value: r0(n.rr) }] });
    if (phase === 'q' && !st.question) {
      shown.current = Date.now();
      st.set({ card: null, question: { key: 'dyss', q: 'What is the waveform telling you?', tiles: ord.map((k) => ({ label: names[k] })), answer: ord.indexOf(names.indexOf(d.name)), explain: `${d.clue} The dashed red trace now shows the patient’s own effort.`, picked: null, shownAt: shown.current },
        onAnswer: (i) => { pick.current = ord[i]; const ok = names[ord[i]] === d.name; const pts = scoreDecision(ok, shown.current); if (ok && !practice()) toast(true, `+${pts}`); useProgress.getState().record(`vent-${c.id}`, ok); useUI.getState().set({ showPmus: true }); const q = useGame.getState().question!; useGame.getState().set({ question: { ...q, picked: i } }); },
        continueLabel: 'Now fix it', onContinue: () => { useGame.getState().set({ question: null }); setPhase('fix'); } });
    }
    if (phase === 'fix') {
      const mode = session.m.s.mode; const keys: (keyof VentSettings)[] = mode === 'PSV' ? ['ps', 'cyclePct', 'trigFlow'] : mode === 'PC' ? ['ti', 'rr', 'peep'] : ['flow', 'vt', 'rr'];
      st.set({ meter: { label: d.label, value: v, target: d.threshold, ok: v <= d.threshold, note: since < 6 ? `measuring ${Math.max(0, since)}/6 breaths` : undefined },
        controls: keys.map(control).filter((x): x is HudControl => !!x), tools: [{ label: 'All settings', icon: '⚙', onClick: () => usePlayerUI.getState().set({ details: true }) }] });
    }
  }, [pulse, phase]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!fixed) return; setPhase('done'); onDone();
    const ok1 = pick.current != null && names[pick.current] === d.name; const right = Number(ok1) + 1; const ms = Date.now() - useGame.getState().startedAt;
    bonus(practice() ? 0 : 200);
    finishGame({ ok: right === 2, right, total: 2, ms, stars: starsFor(right, 2, ms, 120000), verdict: 'Dyssynchrony resolved',
      lines: [{ q: 'What is the waveform telling you?', ok: ok1, yours: pick.current != null ? names[pick.current] : '', best: d.name, explain: d.clue }, { q: 'Fix it', ok: true, explain: `${d.why} ${d.fixes.join(' · ')}` }] }, { ...nextInfo(), onReplay: replay });
  }, [fixed]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
