import { useEffect, useMemo, useState } from 'react';
import '../infarct.css';
import { loadHeartAsset, type HeartAsset } from '../asset/heartAsset';
import { LessonPlayer } from '../lesson/Player';
import { STEMI_CULPRIT } from '../lesson/stemi';
import { useApp, sequenceScene, NORMAL_SCENE, SEQ_KEYS, type Mode } from '../engine/store';
import { clock } from '../engine/clock';
import { HeartScene, selectTerritory, selectLead } from './HeartScene';
import { ECGPanel } from './ECGPanel';
import { TERRITORIES, TERRITORY } from '../data/territories';
import { VESSEL, DOMINANCE_INFO } from '../data/vessels';
import { LEAD, LEAD_GROUPS, TWELVE, EXTRA_LEADS } from '../data/leads';
import { buildLesson, QUIZ_CASES, primaryCulprit } from '../data/lessons';
import { buildQuestions } from '../data/quiz';
import { culpritFor } from '../engine/derive';
import type { LeadId } from '../data/types';

export function useIsPhone() {
  const q = '(max-width: 640px)';
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => { const mq = window.matchMedia(q); const f = () => setM(mq.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f); }, []);
  return m;
}

/** The Infarct Atlas as the coronary & ECG view of the cardiac module. `mode` comes from the host (Explore / Learn /
 *  Practice → explore / lesson / quiz); `onExit` returns to the structure-and-flow view. */
export function App({ mode: hostMode, onExit }: { mode?: Mode; onExit?: () => void } = {}) {
  const [asset, setAsset] = useState<HeartAsset | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { loadHeartAsset().then(setAsset).catch((e) => { console.error(e); setErr(String(e?.message || e)); }); }, []);
  useSequencer();
  useEffect(() => { if (hostMode && useApp.getState().mode !== hostMode) setMode(hostMode); }, [hostMode]);
  const focus = useApp((s) => s.focus);
  const mode = useApp((s) => s.mode);
  const phone = useIsPhone();
  return (
    <div className={`mi focus-${phone ? 'split' : focus}${phone ? ' phone' : ''}`}>
      <TopBar embedded={!!hostMode} onExit={onExit} />
      <div className="stage">
        <section className="heart-pane" aria-label="3D heart">
          {asset ? <HeartScene asset={asset} /> : <div className="loading">{err ? `Could not load the heart model: ${err}` : 'Loading anatomical heart…'}</div>}
          <HeartOverlay />
          <ViewButtons />
        </section>
        <aside className="side-pane">
          <ECGPanel />
          <div className="side-body">
            {mode === 'explore' && <ExplorePanel />}
            {mode === 'lesson' && <LessonPanel />}
            {mode === 'quiz' && <QuizPanel />}
          </div>
        </aside>
      </div>
      {phone ? <PhoneBar /> : <Timeline />}
      {asset && <footer className="credit">Heart: {asset.mapping.attribution.title}, {asset.mapping.attribution.creators}; {asset.mapping.attribution.data}. <a href={asset.mapping.attribution.licenseUrl} target="_blank" rel="noreferrer">{asset.mapping.attribution.license}</a>. Modified: renamed structures, added branches and teaching layers.</footer>}
    </div>
  );
}

/* ---------------------------------------------------------------- sequencing */
function useSequencer() {
  useEffect(() => {
    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop); const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const s = useApp.getState();
      clock.setPaused(s.paused);
      if ((s.mode === 'explore' || (s.mode === 'quiz' && s.quiz.revealed)) && s.territoryId && s.seqPlaying) {
        const seq = Math.min(1, s.seq + dt / 11);
        s.set({ seq, seqPlaying: seq < 1, scene: sequenceScene(seq) });
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}

function setMode(mode: Mode) {
  const s = useApp.getState();
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

/* ---------------------------------------------------------------- chrome */
function TopBar({ embedded = false, onExit }: { embedded?: boolean; onExit?: () => void }) {
  const phone = useIsPhone(); const [opts, setOpts] = useState(false);
  const mode = useApp((s) => s.mode); const dom = useApp((s) => s.dominance); const showLeads = useApp((s) => s.showLeads); const focus = useApp((s) => s.focus); const cut = useApp((s) => s.cutaway);
  return (
    <header className="topbar">
      {embedded && onExit && <button className="tgl" onClick={onExit}>← Structure &amp; flow</button>}
      <div className="brand"><svg viewBox="0 0 28 28" aria-hidden="true"><path d="M3 15h5l2.5-6 4 12 3-9 2 3H25" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg><div><div className="b1">{embedded ? 'Coronaries & ECG' : 'Infarct Atlas'}</div><div className="b2">Coronary territory · ECG localisation</div></div>{phone && <button className={`tgl opts-btn ${opts ? 'on' : ''}`} aria-expanded={opts} onClick={() => setOpts(!opts)}>Options</button>}</div>
      {!embedded && <nav className="modes" aria-label="Mode">
        {(['explore', 'lesson', 'quiz'] as Mode[]).map((m) => <button key={m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{m === 'explore' ? 'Explore' : m === 'lesson' ? 'Guided lesson' : 'Challenge'}</button>)}
      </nav>}
      {(!phone || opts) && <div className="tools">
        <div className="seg" role="group" aria-label="Coronary dominance">
          {(['right', 'left'] as const).map((d) => <button key={d} className={dom === d ? 'on' : ''} title={DOMINANCE_INFO[d].text} onClick={() => { useApp.getState().set({ dominance: d, culpritIndex: 0 }); const s = useApp.getState(); if (s.mode === 'lesson' && s.territoryId) applyLessonStep(s.territoryId, s.lessonStep); }}>{d === 'right' ? 'Right dominant' : 'Left dominant'}</button>)}
        </div>
        <button className={`tgl ${showLeads ? 'on' : ''}`} onClick={() => useApp.getState().set({ showLeads: !showLeads })}>Show me what the leads see</button>
        <button className={`tgl ${cut ? 'on' : ''}`} onClick={() => useApp.getState().set({ cutaway: !cut })} title="Fade the right ventricle to reveal the septum">Septal cutaway</button>
        <div className="seg" role="group" aria-label="Focus">
          {(['heart', 'split', 'ecg'] as const).map((f) => <button key={f} className={focus === f ? 'on' : ''} onClick={() => useApp.getState().set({ focus: f })}>{f === 'split' ? 'Split' : f === 'heart' ? 'Heart' : 'ECG'}</button>)}
        </div>
      </div>}
    </header>
  );
}

function ViewButtons() {
  const paused = useApp((s) => s.paused);
  return (
    <div className="view-btns">
      <button onClick={() => useApp.getState().recenter()} title="Reset the view">Reset view</button>
      <button onClick={() => useApp.getState().set({ paused: !paused })}>{paused ? 'Resume beat' : 'Pause beat'}</button>
    </div>
  );
}

function HeartOverlay() {
  const hv = useApp((s) => s.hoverVessel); const ht = useApp((s) => s.hoverTerritory); const lead = useApp((s) => s.leadId); const showLeads = useApp((s) => s.showLeads);
  const txt = hv ? `${VESSEL[hv].name} · click to follow its flow` : ht ? `${TERRITORY[ht].name} wall · click to simulate an occlusion` : null;
  return (
    <div className="heart-overlay">
      {txt && <div className="hover-chip">{txt}</div>}
      {lead && <div className="lead-note"><b>{LEAD[lead].label}</b> looks at {LEAD[lead].faces}. The highlighted surface faces its positive electrode.</div>}
      {showLeads && !lead && <div className="lead-note">Each line runs from the heart toward a lead’s positive electrode. Pick a lead to look through it.</div>}
      <div className="compass" aria-hidden="true"><span>Patient’s left →</span></div>
    </div>
  );
}

/* ---------------------------------------------------------------- explore */
function LeadChips({ ids, kind, onPick }: { ids: LeadId[]; kind: 'a' | 'r' | 'n'; onPick?: (l: LeadId) => void }) {
  const sel = useApp((s) => s.leadId);
  return <span className="chips">{ids.map((l) => <button key={l} className={`chip k-${kind} ${sel === l ? 'on' : ''}`} onClick={() => (onPick ?? selectLead)(l)}>{LEAD[l].label}</button>)}</span>;
}

function ExplorePanel() {
  const tid = useApp((s) => s.territoryId); const vid = useApp((s) => s.vesselId); const lead = useApp((s) => s.leadId); const dom = useApp((s) => s.dominance); const ci = useApp((s) => s.culpritIndex);
  const [pearls, setPearls] = useState(false);
  if (tid) {
    const t = TERRITORY[tid]; const opts = t.commonCulpritVessels.filter((c) => !c.dominance || c.dominance === dom); const cur = culpritFor(t, dom, ci);
    return (
      <div className="info">
        <p className="eyebrow">MI territory</p>
        <h2>{t.name}</h2>
        <dl className="facts">
          <dt>ST elevation</dt><dd><LeadChips ids={t.affectedLeads} kind="a" /></dd>
          <dt>Reciprocal</dt><dd>{t.reciprocalLeads.length ? <LeadChips ids={t.reciprocalLeads} kind="r" /> : <span className="muted">No consistent reciprocal leads</span>}</dd>
          {t.extraLeads.length > 0 && <><dt>Also record</dt><dd><LeadChips ids={t.extraLeads} kind="n" /></dd></>}
          <dt>Culprit vessel</dt>
          <dd><div className="culprits">{opts.map((c, i) => <button key={c.vessel + i} className={`culprit ${cur.vessel === c.vessel && cur.at === c.at ? 'on' : ''}`} onClick={() => useApp.getState().set({ culpritIndex: i, seq: 0, seqPlaying: true })}><span>{c.likelihood === 'common' ? 'Common culprit vessel' : 'Possible culprit'}</span><b>{VESSEL[c.vessel].name}</b><small>{c.note}</small></button>)}</div></dd>
        </dl>
        <p className="explain">{t.explanation}</p>
        <button className="linkish" onClick={() => setPearls(!pearls)}>{pearls ? 'Hide' : 'Show'} clinical pearls</button>
        {pearls && <ul className="pearls">{t.clinicalPearls.map((p) => <li key={p}>{p}</li>)}</ul>}
        <p className="note">Coronary anatomy and dominance vary between patients. These are the usual associations, not rules. {DOMINANCE_INFO[dom].text}</p>
      </div>
    );
  }
  if (vid) {
    const v = VESSEL[vid];
    return (
      <div className="info">
        <p className="eyebrow">Coronary artery</p><h2>{v.name}</h2>
        <p className="explain">{v.course}</p>
        <p className="muted">Supplies: {v.supplies.map((r) => r.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}. The shaded myocardium on the heart is everything downstream of this vessel.</p>
        <p className="muted">To see what happens when it occludes, pick an MI territory below or click a wall of the heart.</p>
      </div>
    );
  }
  if (lead) {
    const l = LEAD[lead]; const grp = LEAD_GROUPS.find((g) => g.leads.includes(lead));
    return (
      <div className="info">
        <p className="eyebrow">ECG lead</p><h2>{l.label}</h2>
        <p className="explain">{l.label} looks at {l.faces}. The camera now views the heart from that direction, and the brighter surface is what this lead faces.</p>
        {grp && <p className="muted">It belongs to the <b>{grp.name.toLowerCase()}</b> group: <LeadChips ids={grp.leads} kind="n" /></p>}
      </div>
    );
  }
  return (
    <div className="info intro">
      <p className="eyebrow">Explore</p>
      <h2>Why does an inferior MI show up in II, III and aVF?</h2>
      <p className="explain">Every lead is a viewpoint. When a wall of the heart is injured, its injury current points out through that wall. Leads facing it record ST elevation; leads on the opposite side record the mirror image.</p>
      <ol className="howto">
        <li>Pick an <b>MI territory</b> below, or click a wall of the heart.</li>
        <li>Click a <b>coronary artery</b> to follow its course and the myocardium it feeds.</li>
        <li>Click any <b>ECG lead</b> to look at the heart from that lead’s position.</li>
        <li>Turn on <b>Show me what the leads see</b> to place every lead around the torso.</li>
      </ol>
      <div className="groups">{LEAD_GROUPS.map((g) => <div key={g.id} className="grp"><span>{g.name}</span><LeadChips ids={g.leads} kind="n" /></div>)}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- lesson */
function LessonPanel() {
  const [sig, setSig] = useState(false);
  if (sig) return <LessonPlayer tl={STEMI_CULPRIT} onExit={() => { setSig(false); applyLessonStep(useApp.getState().territoryId ?? 'inferior', 0); }} />;
  return <TerritoryLesson onSignature={() => setSig(true)} />;
}
function TerritoryLesson({ onSignature }: { onSignature: () => void }) {
  const tid = useApp((s) => s.territoryId) ?? 'inferior'; const i = useApp((s) => s.lessonStep); const dom = useApp((s) => s.dominance);
  const steps = useMemo(() => buildLesson(TERRITORY[tid], dom), [tid, dom]);
  const [auto, setAuto] = useState(false);
  useEffect(() => { if (!auto) return; const h = setTimeout(() => { if (i < steps.length - 1) applyLessonStep(tid, i + 1); else setAuto(false); }, 7500); return () => clearTimeout(h); }, [auto, i, tid, steps.length]);
  const st = steps[i];
  return (
    <div className="info lesson">
      <button className="sig-lesson" onClick={onSignature}><span>Signature lesson</span><b>STEMI: find the culprit</b><small>anatomy, reciprocal and posterior leads, dominance, reperfusion</small></button>
      <div className="lesson-pick">
        <label htmlFor="lessonSel" className="eyebrow">Lesson</label>
        <select id="lessonSel" value={tid} onChange={(e) => applyLessonStep(e.target.value, 0)}>{TERRITORIES.map((t) => <option key={t.id} value={t.id}>{t.name} STEMI</option>)}</select>
      </div>
      <div className="step-count">Step {i + 1} of {steps.length}</div>
      <h2 key={st.id} className="reveal">{st.title}</h2>
      <p key={st.id + 't'} className="explain reveal">{st.text}</p>
      {st.id === 'summary' && <ul className="pearls reveal">{TERRITORY[tid].clinicalPearls.map((p) => <li key={p}>{p}</li>)}</ul>}
      <div className="lesson-nav">
        <button onClick={() => applyLessonStep(tid, i - 1)} disabled={i === 0}>Back</button>
        <button className="pri" onClick={() => applyLessonStep(tid, i + 1)} disabled={i === steps.length - 1}>Next</button>
        <button onClick={() => setAuto(!auto)}>{auto ? 'Pause' : 'Autoplay'}</button>
      </div>
      <div className="dots">{steps.map((s, k) => <button key={s.id} className={k === i ? 'on' : k < i ? 'done' : ''} onClick={() => applyLessonStep(tid, k)} aria-label={s.title} />)}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- quiz */
function QuizPanel() {
  const q = useApp((s) => s.quiz); const dom = useApp((s) => s.dominance); const sel = useApp((s) => s.leadId);
  const c = QUIZ_CASES[q.caseIndex]; const t = TERRITORY[c.territoryId];
  const qs = useMemo(() => buildQuestions(t, c.dominance), [t, c.dominance]);
  const cur = qs[q.qIndex];
  const setQ = (p: Partial<typeof q>) => useApp.getState().set({ quiz: { ...useApp.getState().quiz, ...p } });
  const answered = cur ? q.answers[cur.id] !== undefined && (cur.kind !== 'multi-lead' || (q.answers[cur.id + '_done'] as unknown as boolean)) : true;
  // lead picking from the ECG while on the lead question
  useEffect(() => {
    if (!cur || cur.kind !== 'multi-lead' || !sel || q.answers[cur.id + '_done']) return;
    const prev = (q.answers[cur.id] as string[] | undefined) ?? [];
    setQ({ answers: { ...q.answers, [cur.id]: prev.includes(sel) ? prev.filter((x) => x !== sel) : [...prev, sel] } });
    useApp.getState().set({ leadId: null });
  }, [sel]);
  const reveal = () => { setQ({ revealed: true }); useApp.getState().set({ territoryId: c.territoryId, dominance: c.dominance, seq: 0, seqPlaying: true }); };
  const next = () => { const i = (q.caseIndex + 1) % QUIZ_CASES.length; useApp.getState().set({ territoryId: null, scene: { ...NORMAL_SCENE }, seq: 0, seqPlaying: false, quiz: { caseIndex: i, answers: {}, revealed: false, qIndex: 0 } }); };
  const score = qs.filter((qq) => isRight(qq, q.answers[qq.id])).length;
  return (
    <div className="info quiz">
      <p className="eyebrow">Challenge · case {q.caseIndex + 1} of {QUIZ_CASES.length}</p>
      <h2>{c.title}</h2>
      <p className="explain">{c.vignette} Here is the ECG.</p>
      {!q.revealed && cur && (
        <div className="question">
          <div className="qnum">Question {q.qIndex + 1} of {qs.length}</div>
          <p className="qtext">{cur.prompt}</p>
          {cur.kind === 'single' ? (
            <div className="opts">{cur.options.map((o) => { const a = q.answers[cur.id]; const picked = a === o.id; const show = a !== undefined; const right = o.id === cur.correct;
              return <button key={o.id} disabled={show} className={`opt ${show && right ? 'right' : ''} ${show && picked && !right ? 'wrong' : ''}`} onClick={() => setQ({ answers: { ...q.answers, [cur.id]: o.id } })}>{o.label}</button>; })}</div>
          ) : (
            <div className="lead-pick">
              {[...TWELVE, ...EXTRA_LEADS].map((l) => { const a = (q.answers[cur.id] as string[] | undefined) ?? []; const done = !!q.answers[cur.id + '_done']; const on = a.includes(l); const right = (cur.correct as string[]).includes(l);
                return <button key={l} disabled={done} className={`chip ${on ? 'picked' : ''} ${done && right ? 'k-a' : ''} ${done && on && !right ? 'wrongchip' : ''}`} onClick={() => setQ({ answers: { ...q.answers, [cur.id]: on ? a.filter((x) => x !== l) : [...a, l] } })}>{LEAD[l].label}</button>; })}
              {!q.answers[cur.id + '_done'] && <button className="pri" onClick={() => setQ({ answers: { ...q.answers, [cur.id]: q.answers[cur.id] ?? [], [cur.id + '_done']: true as any } })}>Check leads</button>}
            </div>
          )}
          {answered && <p className="why"><b>{isRight(cur, q.answers[cur.id]) ? 'Correct.' : 'Not quite.'}</b> {cur.explain}</p>}
          {answered && (q.qIndex < qs.length - 1 ? <button className="pri" onClick={() => setQ({ qIndex: q.qIndex + 1 })}>Next question</button> : <button className="pri" onClick={reveal}>Reveal on the heart</button>)}
        </div>
      )}
      {q.revealed && (
        <div className="question">
          <p className="qtext">{score} of {qs.length} correct · {t.name} MI</p>
          <p className="explain">{t.explanation}</p>
          <p className="muted">Common culprit vessel: {VESSEL[primaryCulprit(t, c.dominance).vessel].name}.</p>
          <button className="pri" onClick={next}>Next case</button>
        </div>
      )}
    </div>
  );
}
function isRight(q: ReturnType<typeof buildQuestions>[number], a: unknown) {
  if (a === undefined) return false;
  if (q.kind === 'multi-lead') { const s = new Set(a as string[]); const c = q.correct as string[]; return c.every((x) => s.has(x)) && s.size === c.length; }
  return a === q.correct;
}

/* ---------------------------------------------------------------- phone bottom bar */
function PhoneBar() {
  const mode = useApp((s) => s.mode); const tid = useApp((s) => s.territoryId); const seq = useApp((s) => s.seq); const playing = useApp((s) => s.seqPlaying);
  const i = useApp((s) => s.lessonStep); const dom = useApp((s) => s.dominance); const qRevealed = useApp((s) => s.quiz.revealed);
  const lessonTid = tid ?? 'inferior';
  const steps = useMemo(() => buildLesson(TERRITORY[lessonTid], dom), [lessonTid, dom]);
  const scrub = (v: number) => useApp.getState().set({ seq: v, seqPlaying: false, scene: sequenceScene(v) });
  const stage = [...SEQ_KEYS].reverse().find((k) => seq >= k.at)?.label ?? 'Normal';
  if (mode === 'quiz' && !qRevealed) return null;
  return (
    <div className="phonebar">
      {mode === 'lesson' ? (
        <div className="pb-lesson">
          <button onClick={() => applyLessonStep(lessonTid, i - 1)} disabled={i === 0} aria-label="Previous step">‹</button>
          <div className="pb-step"><span>{TERRITORY[lessonTid].short} · step {i + 1} of {steps.length}</span><b>{steps[i]?.title}</b></div>
          <button className="pri" onClick={() => applyLessonStep(lessonTid, i + 1)} disabled={i === steps.length - 1}>Next</button>
        </div>
      ) : (
        <>
          {tid && (
            <div className="pb-scrub">
              <button className="play" onClick={() => useApp.getState().set({ seqPlaying: !playing, seq: seq >= 1 ? 0 : seq })}>{playing ? 'Pause' : seq >= 1 ? 'Replay' : 'Play'}</button>
              <input type="range" min={0} max={1} step={0.001} value={seq} onChange={(e) => scrub(+e.target.value)} aria-label="Normal to MI" />
              <span className="pb-stage">{stage}</span>
            </div>
          )}
          {mode === 'explore' && (
            <div className="terr-row" role="group" aria-label="MI territory">
              {TERRITORIES.map((t) => <button key={t.id} className={tid === t.id ? 'on' : ''} onClick={() => selectTerritory(t.id)}>{t.short}</button>)}
              {tid && <button className="clear" onClick={() => useApp.getState().set({ territoryId: null, seq: 0, seqPlaying: false, scene: { ...NORMAL_SCENE } })}>Clear</button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- bottom timeline */
function Timeline() {
  const mode = useApp((s) => s.mode); const tid = useApp((s) => s.territoryId); const seq = useApp((s) => s.seq); const playing = useApp((s) => s.seqPlaying); const qRevealed = useApp((s) => s.quiz.revealed);
  const scrub = (v: number) => useApp.getState().set({ seq: v, seqPlaying: false, scene: sequenceScene(v) });
  return (
    <div className="timeline">
      {mode !== 'quiz' && (
        <div className="terr-row" role="group" aria-label="MI territory">
          <span className="lbl">MI territory</span>
          {TERRITORIES.map((t) => <button key={t.id} className={tid === t.id ? 'on' : ''} onClick={() => { if (mode === 'lesson') applyLessonStep(t.id, 0); else selectTerritory(t.id); }}>{t.short}</button>)}
          {tid && mode === 'explore' && <button className="clear" onClick={() => useApp.getState().set({ territoryId: null, seq: 0, seqPlaying: false, scene: { ...NORMAL_SCENE } })}>Clear</button>}
        </div>
      )}
      {(mode === 'explore' || (mode === 'quiz' && qRevealed)) && tid && (
        <div className="scrub">
          <button className="play" onClick={() => useApp.getState().set({ seqPlaying: !playing, seq: seq >= 1 ? 0 : seq })}>{playing ? 'Pause' : seq >= 1 ? 'Replay' : 'Play'}</button>
          <div className="track">
            <input type="range" min={0} max={1} step={0.001} value={seq} onChange={(e) => scrub(+e.target.value)} aria-label="Normal to MI" />
            <div className="keys">{SEQ_KEYS.map((k) => <button key={k.label} style={{ left: `${k.at * 100}%` }} className={seq >= k.at ? 'past' : ''} onClick={() => scrub(k.at + 0.02)}>{k.label}</button>)}</div>
          </div>
          <span className="ends">Normal → MI</span>
        </div>
      )}
    </div>
  );
}
