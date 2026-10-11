/**
 * MI Locator — the coronary & ECG view of the Cardiac tab.
 *
 * Same stage layout as every other module: the scene pane holds the beating 3D heart and the live 12-lead ECG side by
 * side (stacked on phones), with the MI territories and the Normal → MI timeline beneath them; the side pane holds the
 * explanation, the lesson or the case. The heart is the Cardiac tab's high-detail heart carrying the coronary
 * teaching data (sharedHeart.ts). One clock (engine/clock.ts) drives the ECG sweep, the contraction and the
 * conduction wavefront; it is advanced here, once per frame, so the ECG runs whether or not the canvas is mounted.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { loadHeartAsset, type HeartAsset } from '../asset/heartAsset';
import { loadSharedHeart, type SharedHeart } from '../asset/sharedHeart';
import { LessonPlayer } from '../lesson/Player';
import { STEMI_CULPRIT } from '../lesson/stemi';
import { useApp, sequenceScene, NORMAL_SCENE, SEQ_KEYS, type Mode } from '../engine/store';
import { clock } from '../engine/clock';
import { HeartScene, selectTerritory, selectLead } from './HeartScene';
import { ECGPanel } from './ECGPanel';
import { TERRITORIES, TERRITORY } from '../data/territories';
import { VESSEL, DOMINANCE_INFO } from '../data/vessels';
import { LEAD, LEAD_GROUPS, TWELVE, EXTRA_LEADS } from '../data/leads';
import { buildLesson, QUIZ_CASES, primaryCulprit, lessonVoiceId } from '../data/lessons';
import { voice as narrator } from '../../app/voice';
import { buildQuestions } from '../data/quiz';
import { culpritFor } from '../engine/derive';
import type { LeadId, RegionId } from '../data/types';
import { SceneWrap } from '../../scene/labels';
import { Fold } from '../../scene/pane';
import { Seg } from '../../vent/VentPanel';
import { HR } from '../ecg/ecgModel';

/** Whole-heart MI sequence playback length (seconds, at 1×). */
export const SEQ_SECONDS = 11;

/* ---------------------------------------------------------------- clock + sequencing (one rAF for the whole view) */
function useMIClock() {
  useEffect(() => {
    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop); const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const s = useApp.getState();
      clock.setPaused(s.paused); clock.advance(dt);
      if ((s.mode === 'explore' || (s.mode === 'quiz' && s.quiz.revealed)) && s.territoryId && s.seqPlaying) {
        const seq = Math.min(1, s.seq + dt / SEQ_SECONDS);
        s.set({ seq, seqPlaying: seq < 1, scene: sequenceScene(seq) });
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}

/** Only resets the MI state when the mode actually changes (remounting the view must not clear a selection). */
export function setMode(mode: Mode) {
  const s = useApp.getState(); if (s.mode === mode) return;
  const base = { mode, vesselId: null, leadId: null, seq: 0, seqPlaying: false, scene: { ...NORMAL_SCENE }, lessonStep: 0 };
  if (mode === 'lesson') { const tid = s.territoryId ?? 'inferior'; s.set({ ...base, territoryId: tid }); applyLessonStep(tid, 0); }
  else if (mode === 'quiz') s.set({ ...base, territoryId: null, quiz: { caseIndex: s.quiz.caseIndex, answers: {}, revealed: false, qIndex: 0 } });
  else s.set({ ...base, territoryId: null });
}

export function applyLessonStep(tid: string, i: number) {
  const s = useApp.getState(); const steps = buildLesson(TERRITORY[tid], s.dominance); const k = Math.max(0, Math.min(steps.length - 1, i));
  const show = steps[k].show;
  s.set({ lessonStep: k, territoryId: tid, scene: { ...NORMAL_SCENE, ...show, occlusion: show.occlusion ?? 0, perfusionLoss: show.perfusionLoss ?? 0, injury: show.injury ?? 0, ecgMorph: show.ecgMorph ?? 0, highlightVessel: !!show.highlightVessel, flow: !!show.flow, emphasizeAffected: !!show.emphasizeAffected, emphasizeReciprocal: !!show.emphasizeReciprocal, showExtraLeads: !!show.showExtraLeads, camera: show.camera ?? 'overview' } });
}

const clearTerritory = () => useApp.getState().set({ territoryId: null, vesselId: null, seq: 0, seqPlaying: false, scene: { ...NORMAL_SCENE } });

/* ---------------------------------------------------------------- the view */
/** `mountScene` false while a touch layout shows the Controls tab: no WebGL context inside a hidden subtree. */
export function MILocator({ mode, header, mountScene = true }: { mode: Mode; header?: ReactNode; mountScene?: boolean }) {
  const [heart, setHeart] = useState<(SharedHeart & { original: HeartAsset }) | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let off = false;
    loadHeartAsset().then(async (original) => {
      const h = await loadSharedHeart(original);
      if (!h.shared) console.warn('MI Locator: kept the coronary heart —', h.reason);
      if (!off) setHeart({ ...h, original });
    }).catch((e) => { if (!off) { console.error(e); setErr(String(e?.message || e)); } });
    return () => { off = true; };
  }, []);
  /** on the shared heart, pointer picking uses the light myocardium (same shape, ~30× fewer triangles) */
  const pick = useMemo(() => heart?.shared ? PICK_IDS.map((id) => heart.original.meshes[id]).filter(Boolean) : undefined, [heart]);
  useMIClock();
  useEffect(() => { setMode(mode); }, [mode]);
  useEffect(() => { (window as unknown as { __mi: unknown }).__mi = { store: useApp, clock, shared: () => heart?.shared ?? null, stats: () => heart?.stats ?? [], transferMs: () => heart?.ms ?? null, territory: (id: string, seq = 1) => { selectTerritory(id); useApp.getState().set({ seq, seqPlaying: false, scene: sequenceScene(seq) }); } }; }, [heart]);
  const focus = useApp((s) => s.focus);
  return (
    <main className={`stage mi-stage mi-mode-${mode}`} aria-label="MI Locator">
      <section className="scene-pane mi-scene-pane">
        {header}
        <div className={`mi-split focus-${focus}`}>
          <div className="mi-heart">
            <SceneWrap labels={false}>
              {heart ? (mountScene ? <HeartScene asset={heart.asset} pick={pick} /> : null) : <div className="mi-loading">{err ? `Could not load the heart model: ${err}` : 'Loading the heart…'}</div>}
              <HeartOverlay />
            </SceneWrap>
          </div>
          <ECGPanel />
        </div>
        <Timeline mode={mode} />
      </section>
      <aside id="controls" tabIndex={-1} className="side-pane mi-side" aria-label="MI Locator controls and explanation"><h2 className="sr-only">MI Locator controls and explanation</h2>
        {mode === 'explore' && <ExplorePanel />}
        {mode === 'lesson' && <LessonPanel />}
        {mode === 'quiz' && <QuizPanel />}
        {mode !== 'quiz' && <Fold group="mi" id="opts" title="View options" summary={<OptionsSummary />}><OptionsCard /></Fold>}
        <details className="credit"><summary>Sources &amp; model notes</summary>
          Heart: HuBMAP 3D Reference Organs, Visible Human Male heart (U.S. National Library of Medicine; CC BY 4.0) — the same full-resolution chambers as Heart &amp; flow, with coronary arteries, cardiac veins and coronary territories added for teaching.
          {heart && !heart.shared && ' (This device is showing the lighter coronary heart: the high-detail chambers did not load or register.)'}
          {' '}Territory shading shows usual perfusion; coronary anatomy and dominance vary between patients. The ECG is a vector-cardiographic teaching model — each lead is the projection of a moving heart dipole plus an injury vector through the injured wall — not a torso simulation and not diagnostic. Conduction pathway positions are schematic; their timing matches the ECG.
        </details>
      </aside>
    </main>
  );
}
const PICK_IDS = ['myocardium_LV', 'myocardium_septum', 'myocardium_RV'];

/* ---------------------------------------------------------------- heart overlay */
function HeartOverlay() {
  const hv = useApp((s) => s.hoverVessel); const ht = useApp((s) => s.hoverTerritory); const lead = useApp((s) => s.leadId); const showLeads = useApp((s) => s.showLeads);
  const paused = useApp((s) => s.paused); const cond = useApp((s) => s.conduction); const mode = useApp((s) => s.mode); const idle = useApp((s) => !s.territoryId && !s.vesselId);
  const txt = hv ? `${VESSEL[hv].name} — click to follow its flow` : ht ? `${TERRITORY[ht].name} wall — click to occlude its artery` : null;
  return (
    <div className="mi-overlay">
      {txt && <div className="mi-hover" role="status">{txt}</div>}
      {lead ? <div className="mi-lead-note"><b>{LEAD[lead].label}</b> looks at {LEAD[lead].faces}. You are looking from its positive electrode; the brighter surface faces it. <button type="button" className="linkish" onClick={() => selectLead(null)}>Back to overview</button></div>
        : showLeads ? <div className="mi-lead-note">Each line runs from the heart to a lead’s positive electrode. Click a lead to look through it.</div>
        : cond ? <div className="mi-lead-note">Conduction: SA node → atria (P wave) → AV node (PR pause) → His bundle and bundle branches → Purkinje fibres (QRS). Positions schematic.</div>
        : mode === 'explore' && !txt && idle ? <div className="mi-lead-note mi-hint">Click a wall, an artery or any ECG lead.</div> : null}
      <div className="mi-view-btns">
        <button type="button" onClick={() => useApp.getState().recenter()}>Reset view</button>
        <button type="button" aria-pressed={paused} onClick={() => useApp.getState().set({ paused: !paused })}>{paused ? 'Resume beat' : 'Pause beat'}</button>
      </div>
      <div className="mi-compass" aria-hidden="true">Patient’s left →</div>
    </div>
  );
}

/* ---------------------------------------------------------------- options */
function OptionsSummary() {
  const dom = useApp((s) => s.dominance); const cond = useApp((s) => s.conduction);
  return <>{dom === 'right' ? 'Right dominant' : 'Left dominant'}{cond ? ' · conduction' : ''}</>;
}
function OptionsCard() {
  const dom = useApp((s) => s.dominance); const showLeads = useApp((s) => s.showLeads); const cut = useApp((s) => s.cutaway); const cond = useApp((s) => s.conduction); const focus = useApp((s) => s.focus);
  const set = useApp.getState().set;
  return (
    <section className="card mi-card">
      <div className="mi-opt"><span className="muted small">Coronary dominance</span>
        <Seg small value={dom} options={[['right', 'Right'], ['left', 'Left']]} onChange={(d) => { set({ dominance: d, culpritIndex: 0 }); const s = useApp.getState(); if (s.mode === 'lesson' && s.territoryId) applyLessonStep(s.territoryId, s.lessonStep); }} /></div>
      <p className="muted small">{DOMINANCE_INFO[dom].text}</p>
      <div className="mi-toggles">
        <button type="button" className={`tgl${showLeads ? ' on' : ''}`} aria-pressed={showLeads} onClick={() => set({ showLeads: !showLeads })}>Leads around the torso</button>
        <button type="button" className={`tgl${cut ? ' on' : ''}`} aria-pressed={cut} onClick={() => set({ cutaway: !cut })} title="Fade the right ventricle to show the septum">Septal cutaway</button>
        <button type="button" className={`tgl${cond ? ' on' : ''}`} aria-pressed={cond} onClick={() => set({ conduction: !cond })} title="See-through walls with the conduction system firing in time with the ECG">Conduction system</button>
      </div>
      <div className="mi-opt"><span className="muted small">Pane size</span>
        <Seg small value={focus} options={[['heart', 'Heart'], ['split', 'Equal'], ['ecg', 'ECG']]} onChange={(f) => set({ focus: f })} /></div>
    </section>
  );
}

/* ---------------------------------------------------------------- explore */
function LeadChips({ ids, kind, onPick }: { ids: LeadId[]; kind: 'a' | 'r' | 'n'; onPick?: (l: LeadId) => void }) {
  const sel = useApp((s) => s.leadId);
  return <span className="mi-chips">{ids.map((l) => <button type="button" key={l} className={`mi-chip k-${kind}${sel === l ? ' on' : ''}`} aria-pressed={sel === l} onClick={() => (onPick ?? selectLead)(l)}>{LEAD[l].label}</button>)}</span>;
}
const REGION_NAME: Record<RegionId, string> = { septum: 'septum', anterior: 'anterior wall', apex: 'apex', lateral: 'lateral wall', highLateral: 'high lateral wall', inferior: 'inferior wall', posterior: 'posterior wall', rvFreeWall: 'right ventricular free wall' };

function ExplorePanel() {
  const tid = useApp((s) => s.territoryId); const vid = useApp((s) => s.vesselId); const lead = useApp((s) => s.leadId); const dom = useApp((s) => s.dominance); const ci = useApp((s) => s.culpritIndex);
  if (tid) {
    const t = TERRITORY[tid]; const opts = t.commonCulpritVessels.filter((c) => !c.dominance || c.dominance === dom); const cur = culpritFor(t, dom, ci);
    return (
      <section className="card mi-card mi-info" aria-live="polite">
        <div className="eyebrow">MI territory</div>
        <h2 className="h2">{t.name}</h2>
        <dl className="mi-facts">
          <dt>ST elevation</dt><dd><LeadChips ids={t.affectedLeads} kind="a" /></dd>
          <dt>Reciprocal</dt><dd>{t.reciprocalLeads.length ? <LeadChips ids={t.reciprocalLeads} kind="r" /> : <span className="muted">No consistent reciprocal leads</span>}</dd>
          {t.extraLeads.length > 0 && <><dt>Also record</dt><dd><LeadChips ids={t.extraLeads} kind="n" /></dd></>}
        </dl>
        <div className="eyebrow">Culprit vessel</div>
        <div className="mi-culprits">{opts.map((c, i) => <button type="button" key={c.vessel + i} className={`mi-culprit${cur.vessel === c.vessel && cur.at === c.at ? ' on' : ''}`} aria-pressed={cur.vessel === c.vessel && cur.at === c.at} onClick={() => useApp.getState().set({ culpritIndex: i, seq: 0, seqPlaying: true })}><span>{c.likelihood === 'common' ? 'Common culprit' : 'Possible culprit'}</span><b>{VESSEL[c.vessel].name}</b><small>{c.note}</small></button>)}</div>
        <p className="mi-explain">{t.explanation}</p>
        <Fold group="mi-t" id="pearls" title="Clinical pearls"><ul className="mi-pearls">{t.clinicalPearls.map((p) => <li key={p}>{p}</li>)}</ul></Fold>
        <p className="muted small">Coronary anatomy and dominance vary. These are the usual associations, not rules.</p>
        <button type="button" className="tgl" onClick={clearTerritory}>Back to a normal heart</button>
      </section>
    );
  }
  if (vid) {
    const v = VESSEL[vid];
    return (
      <section className="card mi-card mi-info" aria-live="polite">
        <div className="eyebrow">Coronary artery</div><h2 className="h2">{v.name}</h2>
        <p className="mi-explain">{v.course}</p>
        <p className="muted">Supplies the {v.supplies.map((r) => REGION_NAME[r]).join(', ')}. The violet myocardium on the heart is what this artery and its branches feed.</p>
        <p className="muted">To occlude it, pick an MI territory below the heart or click a wall.</p>
        <button type="button" className="tgl" onClick={clearTerritory}>Back to a normal heart</button>
      </section>
    );
  }
  if (lead) {
    const l = LEAD[lead]; const grp = LEAD_GROUPS.find((g) => g.leads.includes(lead));
    return (
      <section className="card mi-card mi-info" aria-live="polite">
        <div className="eyebrow">ECG lead</div><h2 className="h2">{l.label}</h2>
        <p className="mi-explain">{l.label} looks at {l.faces}. The camera now views the heart from its positive electrode; the brighter surface is what it faces.</p>
        {grp && <p className="muted">It belongs to the <b>{grp.name.toLowerCase()}</b> group: <LeadChips ids={grp.leads} kind="n" /></p>}
      </section>
    );
  }
  return (
    <section className="card mi-card mi-info">
      <div className="eyebrow">MI Locator</div>
      <h2 className="h2">Why does an inferior MI show up in II, III and aVF?</h2>
      <p className="mi-explain">Every lead is a viewpoint. When a wall is injured its current of injury points out through that wall: leads facing it record ST elevation, leads on the opposite side record the mirror image.</p>
      <ol className="mi-howto">
        <li>Pick an <b>MI territory</b> under the heart, or click a wall. The artery occludes, the wall turns dusky and the ECG evolves.</li>
        <li>Click a <b>coronary artery</b> to follow its course and see the myocardium it feeds.</li>
        <li>Click any <b>ECG lead</b> (on the paper or below) to look at the heart from that lead.</li>
      </ol>
      <div className="mi-groups">{LEAD_GROUPS.map((g) => <div key={g.id} className="mi-grp"><span>{g.name}</span><LeadChips ids={g.leads} kind="n" /></div>)}</div>
    </section>
  );
}

/* ---------------------------------------------------------------- lesson */
function LessonPanel() {
  const [sig, setSig] = useState(false);
  if (sig) return <section className="card mi-card mi-lesson"><LessonPlayer tl={STEMI_CULPRIT} onExit={() => { setSig(false); applyLessonStep(useApp.getState().territoryId ?? 'inferior', 0); }} /></section>;
  return <TerritoryLesson onSignature={() => setSig(true)} />;
}
function TerritoryLesson({ onSignature }: { onSignature: () => void }) {
  const tid = useApp((s) => s.territoryId) ?? 'inferior'; const i = useApp((s) => s.lessonStep); const dom = useApp((s) => s.dominance);
  const steps = useMemo(() => buildLesson(TERRITORY[tid], dom), [tid, dom]);
  const [auto, setAuto] = useState(false); const [voiceOn, setVoiceOn] = useState(true);
  // narrate each step with the app's natural voice (silent captions when the clip is not available); a step counts as
  // finished when its narration ends, or after 7.5 s without narration — autoplay then moves on
  const key = `${tid}:${dom}:${i}`; const [finished, setFinished] = useState<string | null>(null);
  useEffect(() => {
    const id = lessonVoiceId(TERRITORY[tid], dom, steps[i].id); let h: ReturnType<typeof setTimeout> | undefined;
    if (voiceOn && narrator.has(id)) narrator.play(id, () => setFinished(key)); else h = setTimeout(() => setFinished(key), 7500);
    return () => { if (h) clearTimeout(h); narrator.stop(); };
  }, [key, voiceOn]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!auto || finished !== key) return;
    const h = setTimeout(() => { if (i < steps.length - 1) applyLessonStep(tid, i + 1); else setAuto(false); }, 900);
    return () => clearTimeout(h);
  }, [auto, finished, key]); // eslint-disable-line react-hooks/exhaustive-deps
  const st = steps[i];
  return (<>
    <button type="button" className="chal-item mi-sig" onClick={onSignature}><span className="lvl lvl-core">Narrated</span><span className="ci-t">STEMI: find the culprit<small className="ci-b">Anatomy, reciprocal and posterior leads, dominance and reperfusion, on the live heart and ECG.</small></span><span className="ci-k">{STEMI_CULPRIT.cues.length} steps</span></button>
    <section className="card mi-card mi-lesson" aria-live="polite">
      <label className="mi-opt"><span className="eyebrow">Territory lesson</span>
        <select value={tid} onChange={(e) => applyLessonStep(e.target.value, 0)}>{TERRITORIES.map((t) => <option key={t.id} value={t.id}>{t.name} STEMI</option>)}</select></label>
      <div className="muted small">Step {i + 1} of {steps.length}</div>
      <h2 key={st.id} className="h2 mi-reveal">{st.title}</h2>
      <p key={st.id + 't'} className="mi-explain mi-reveal">{st.text}</p>
      {st.id === 'summary' && <ul className="mi-pearls">{TERRITORY[tid].clinicalPearls.map((p) => <li key={p}>{p}</li>)}</ul>}
      <div className="mi-nav">
        <button type="button" className="tgl" onClick={() => applyLessonStep(tid, i - 1)} disabled={i === 0}>Back</button>
        <button type="button" className="tgl on" onClick={() => applyLessonStep(tid, i + 1)} disabled={i === steps.length - 1}>Next</button>
        <button type="button" className="tgl" aria-pressed={auto} onClick={() => setAuto(!auto)}>{auto ? 'Pause' : 'Autoplay'}</button>
        <button type="button" className="tgl" aria-pressed={voiceOn} onClick={() => setVoiceOn(!voiceOn)}>{voiceOn ? 'Voice on' : 'Voice off'}</button>
      </div>
      <div className="mi-dots">{steps.map((s, k) => <button type="button" key={s.id} className={k === i ? 'on' : k < i ? 'done' : ''} onClick={() => applyLessonStep(tid, k)} aria-label={`Step ${k + 1}: ${s.title}`} aria-current={k === i ? 'step' : undefined} />)}</div>
    </section>
  </>);
}

/* ---------------------------------------------------------------- quiz */
function QuizPanel() {
  const q = useApp((s) => s.quiz); const sel = useApp((s) => s.leadId);
  const c = QUIZ_CASES[q.caseIndex]; const t = TERRITORY[c.territoryId];
  const qs = useMemo(() => buildQuestions(t, c.dominance), [t, c.dominance]);
  const cur = qs[q.qIndex];
  const setQ = (p: Partial<typeof q>) => useApp.getState().set({ quiz: { ...useApp.getState().quiz, ...p } });
  const answered = cur ? q.answers[cur.id] !== undefined && (cur.kind !== 'multi-lead' || !!q.answers[cur.id + '_done']) : true;
  // lead picking straight from the ECG paper while on the lead question
  useEffect(() => {
    if (!cur || cur.kind !== 'multi-lead' || !sel || q.answers[cur.id + '_done']) return;
    const prev = (q.answers[cur.id] as string[] | undefined) ?? [];
    setQ({ answers: { ...q.answers, [cur.id]: prev.includes(sel) ? prev.filter((x) => x !== sel) : [...prev, sel] } });
    useApp.getState().set({ leadId: null });
  }, [sel]); // eslint-disable-line react-hooks/exhaustive-deps
  const reveal = () => { setQ({ revealed: true }); useApp.getState().set({ territoryId: c.territoryId, dominance: c.dominance, seq: 0, seqPlaying: true }); };
  const next = () => { const i = (q.caseIndex + 1) % QUIZ_CASES.length; useApp.getState().set({ territoryId: null, scene: { ...NORMAL_SCENE }, seq: 0, seqPlaying: false, quiz: { caseIndex: i, answers: {}, revealed: false, qIndex: 0 } }); };
  const score = qs.filter((qq) => isRight(qq, q.answers[qq.id])).length;
  return (
    <section className="card mi-card mi-quiz">
      <div className="eyebrow">Case {q.caseIndex + 1} of {QUIZ_CASES.length}</div>
      <h2 className="h2">{c.title}</h2>
      <p className="mi-explain">{c.vignette} The ECG is running beside the heart.</p>
      {!q.revealed && cur && (
        <div className="mi-question">
          <div className="muted small">Question {q.qIndex + 1} of {qs.length}</div>
          <p className="mi-qtext">{cur.prompt}</p>
          {cur.kind === 'single' ? (
            <div className="mi-opts">{cur.options.map((o) => { const a = q.answers[cur.id]; const picked = a === o.id; const show = a !== undefined; const right = o.id === cur.correct;
              return <button type="button" key={o.id} disabled={show} className={`mi-optn${show && right ? ' right' : ''}${show && picked && !right ? ' wrong' : ''}`} onClick={() => setQ({ answers: { ...q.answers, [cur.id]: o.id } })}>{o.label}</button>; })}</div>
          ) : (
            <div className="mi-leadpick">
              <p className="muted small">Tap leads here or on the ECG, then check.</p>
              <div className="mi-chips">{[...TWELVE, ...EXTRA_LEADS].map((l) => { const a = (q.answers[cur.id] as string[] | undefined) ?? []; const done = !!q.answers[cur.id + '_done']; const on = a.includes(l); const right = (cur.correct as string[]).includes(l);
                return <button type="button" key={l} disabled={done} aria-pressed={on} className={`mi-chip${on ? ' picked' : ''}${done && right ? ' k-a' : ''}${done && on && !right ? ' wrongchip' : ''}`} onClick={() => setQ({ answers: { ...q.answers, [cur.id]: on ? a.filter((x) => x !== l) : [...a, l] } })}>{LEAD[l].label}</button>; })}</div>
              {!q.answers[cur.id + '_done'] && <button type="button" className="tgl on" onClick={() => setQ({ answers: { ...q.answers, [cur.id]: q.answers[cur.id] ?? [], [cur.id + '_done']: true as unknown as string } })}>Check leads</button>}
            </div>
          )}
          {answered && <p className="mi-why"><b>{isRight(cur, q.answers[cur.id]) ? 'Correct.' : 'Not quite.'}</b> {cur.explain}</p>}
          {answered && (q.qIndex < qs.length - 1 ? <button type="button" className="tgl on" onClick={() => setQ({ qIndex: q.qIndex + 1 })}>Next question</button> : <button type="button" className="tgl on" onClick={reveal}>Reveal on the heart</button>)}
        </div>
      )}
      {q.revealed && (
        <div className="mi-question">
          <p className="mi-qtext">{score} of {qs.length} correct · {t.name} MI</p>
          <p className="mi-explain">{t.explanation}</p>
          <p className="muted">Common culprit: {VESSEL[primaryCulprit(t, c.dominance).vessel].name}.</p>
          <button type="button" className="tgl on" onClick={next}>Next case</button>
        </div>
      )}
    </section>
  );
}
function isRight(q: ReturnType<typeof buildQuestions>[number], a: unknown) {
  if (a === undefined) return false;
  if (q.kind === 'multi-lead') { const s = new Set(a as string[]); const c = q.correct as string[]; return c.every((x) => s.has(x)) && s.size === c.length; }
  return a === q.correct;
}

/* ---------------------------------------------------------------- territories + Normal → MI timeline (under the heart and ECG) */
/** stages named under the track (the rest are ticks, named in the stage readout as the playhead passes them) */
const KEY_LABELS = ['Normal', 'Occlusion', 'Injury', 'Facing leads'];
/** compact chip names (full names in the tooltip and the side pane) */
const CHIP: Record<string, string> = { extensiveAnterior: 'Ext. anterior' };
function Timeline({ mode }: { mode: Mode }) {
  const tid = useApp((s) => s.territoryId); const seq = useApp((s) => s.seq); const playing = useApp((s) => s.seqPlaying); const qRevealed = useApp((s) => s.quiz.revealed);
  const i = useApp((s) => s.lessonStep); const dom = useApp((s) => s.dominance);
  const lessonTid = tid ?? 'inferior';
  const steps = useMemo(() => buildLesson(TERRITORY[lessonTid], dom), [lessonTid, dom]);
  const scrub = (v: number) => useApp.getState().set({ seq: v, seqPlaying: false, scene: sequenceScene(v) });
  const stage = [...SEQ_KEYS].reverse().find((k) => seq >= k.at)?.label ?? 'Normal';
  const showScrub = (mode === 'explore' || (mode === 'quiz' && qRevealed)) && !!tid;
  // keep the chosen territory in view when the chip row scrolls sideways (touch layouts)
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => { const r = row.current; const on = r?.querySelector<HTMLElement>('button.on'); if (r && on && r.scrollWidth > r.clientWidth) r.scrollTo({ left: on.offsetLeft - r.clientWidth / 2 + on.clientWidth / 2, behavior: 'smooth' }); }, [tid]);
  if (mode === 'quiz' && !qRevealed) return <div className="mi-timeline"><p className="muted small mi-tl-note">Read the ECG, answer in the panel, then reveal the territory on the heart. HR {HR}/min.</p></div>;
  return (
    <div className="mi-timeline">
      {mode !== 'quiz' && (
        <div className="mi-terr" ref={row} role="group" aria-label={mode === 'lesson' ? 'Lesson territory' : 'MI territory'}>
          {TERRITORIES.map((t) => <button type="button" key={t.id} title={`${t.name} STEMI`} className={tid === t.id ? 'on' : ''} aria-pressed={tid === t.id} onClick={() => { if (mode === 'lesson') applyLessonStep(t.id, 0); else selectTerritory(t.id); }}>{CHIP[t.id] ?? t.short}</button>)}
          {tid && mode === 'explore' && <button type="button" className="mi-clear" onClick={clearTerritory}>Clear</button>}
        </div>
      )}
      {showScrub && (
        <div className="mi-scrub">
          <button type="button" className="tgl on" onClick={() => useApp.getState().set({ seqPlaying: !playing, seq: seq >= 1 ? 0 : seq })}>{playing ? 'Pause' : seq >= 1 ? 'Replay' : 'Play'}</button>
          <div className="mi-track">
            <input type="range" min={0} max={1} step={0.001} value={seq} onChange={(e) => scrub(+e.target.value)} aria-label="Normal to MI" aria-valuetext={stage} />
            <div className="mi-keys" aria-hidden="true">{SEQ_KEYS.map((k) => <button type="button" tabIndex={-1} key={k.label} title={k.label} style={{ left: `${k.at * 100}%` }} className={`${seq >= k.at ? 'past' : ''}${KEY_LABELS.includes(k.label) ? '' : ' tick'}`} onClick={() => scrub(k.at + 0.02)}>{KEY_LABELS.includes(k.label) ? k.label : ''}</button>)}</div>
          </div>
          <span className="mi-stage-lbl">{stage}</span>
        </div>
      )}
      {mode === 'lesson' && (
        <div className="mi-tl-lesson">
          <button type="button" className="tgl" onClick={() => applyLessonStep(lessonTid, i - 1)} disabled={i === 0} aria-label="Previous step">‹</button>
          <div className="mi-tl-step"><span>{TERRITORY[lessonTid].short} · step {i + 1} of {steps.length}</span><b>{steps[i]?.title}</b></div>
          <button type="button" className="tgl on" onClick={() => applyLessonStep(lessonTid, i + 1)} disabled={i === steps.length - 1}>Next</button>
        </div>
      )}
    </div>
  );
}
