/**
 * Simulate: an interfacility transport of a ventilated septic patient on norepinephrine. Things
 * happen to the monitoring system on the way (and one real deterioration). Each event is solved
 * by what you actually do at the bedside; titrating the drip to an artefact is recorded.
 */
import { useEffect, useRef, useState } from 'react';
import { useUI } from '../app/store';
import { lines, axisHeight, type LinesSession } from './session';
import { applyStep } from './LinesLearn';
import { useLinesUI } from './linesStore';
import { LineCard, SetupCard, FlushCard, NumbersCard, TreatCard } from './LinesPanel';

interface Ev { at: number; title: string; text: string; apply: (s: LinesSession) => void; done: (s: LinesSession, st: SimState) => boolean; lesson: string }
interface SimState { t0: number; flushes: number; penalties: string[]; solvedAt: Record<number, number>; startedAt: Record<number, number>; lastNore: number }

const EVENTS: Ev[] = [
  { at: 0, title: 'Handover in the ED', text: 'Septic shock, intubated, norepinephrine 0.1 µg/kg/min. Before you leave: check that the arterial line is trustworthy.', apply: () => {}, done: (_s, st) => st.flushes > 0, lesson: 'A fast-flush test before transport tells you whether the systolic and diastolic numbers can be trusted.' },
  { at: 20, title: 'Across to the transport stretcher', text: 'The patient is on the stretcher: higher, and the backrest is lower. The transducers are still clipped where they were.', apply: (s) => { const oldAxis = s.axis; s.setup.bedH = 88; s.setup.hob = 15; s.setup.transH = oldAxis; }, done: (s) => Math.abs(s.levelErr) < 1.5, lesson: 'Every move of the patient or the bed changes the phlebostatic axis. Re-level before you believe any number.' },
  { at: 50, title: 'Loaded into the aircraft', text: 'The arm is strapped across the stretcher and the wrist is flexed.', apply: (s) => s.setFault('art', 'kink'), done: (s) => s.art.fault === 'none', lesson: 'A flexed wrist kinks a radial cannula: overdamped trace, low systolic. Splint the wrist in slight extension.' },
  { at: 80, title: 'Flush bag changed in flight', text: 'The saline bag was swapped; the pressure bag was not pumped back up.', apply: (s) => s.setFault('art', 'lowBag'), done: (s) => s.art.fault === 'none' && s.art.bag >= 280, lesson: 'Below arterial systolic the flush stops, blood backs up and the line clots. Keep the bag at 300 mmHg — and re-check it at altitude: a bag\u2019s pressure rises on ascent and falls on descent (Boyle\u2019s law).' },
  { at: 110, title: 'Real deterioration', text: 'The patient becomes more vasodilated.', apply: (s) => { s.pt.p.svr *= 0.7; s.recompute(); }, done: (s) => s.num.tMap >= 65 && Math.abs(s.num.map - s.num.tMap) < 6, lesson: 'This time the low MAP was real: the line was trustworthy, so you could titrate to it.' },
  { at: 150, title: 'Blood sample for a gas', text: 'A blood gas was drawn from the central line on the way.', apply: (s) => s.setFault('cvp', 'openAir'), done: (s) => s.cvp.fault === 'none', lesson: 'An open port reads zero with the stopcock off to the patient; opened toward the patient it bleeds or entrains air — on a central line, air embolism.' },
];

export function LinesSim() {
  useUI((s) => s.pulse);
  const [st, setSt] = useState<SimState | null>(null); const fired = useRef<Set<number>>(new Set()); const lastFlush = useRef({ art: -1, cvp: -1 });
  const start = () => {
    applyStep({ scenario: 'sepsis', vent: 'ppv', vt: 8, view: 'bed', hob: 30 }, true); lines.setNore(0.1); lines.art.bag = 300;
    useLinesUI.getState().set({ labels: true, showTrue: false });
    fired.current = new Set(); lastFlush.current = { art: lines.art.flush.t0, cvp: lines.cvp.flush.t0 };
    setSt({ t0: lines.heart.t, flushes: 0, penalties: [], solvedAt: {}, startedAt: {}, lastNore: 0.1 });
  };
  useEffect(() => {
    if (!st) return; const t = lines.heart.t - st.t0; let changed = false; const next = { ...st, solvedAt: { ...st.solvedAt }, startedAt: { ...st.startedAt }, penalties: [...st.penalties] };
    EVENTS.forEach((e, i) => {
      if (!fired.current.has(i) && t >= e.at && (i === 0 || next.solvedAt[i - 1] != null || t >= e.at + 25)) { fired.current.add(i); e.apply(lines); next.startedAt[i] = t; changed = true; }
      if (fired.current.has(i) && next.solvedAt[i] == null && e.done(lines, next)) { next.solvedAt[i] = t; changed = true; }
    });
    if (lines.art.flush.t0 !== lastFlush.current.art) { lastFlush.current.art = lines.art.flush.t0; next.flushes++; changed = true; }
    const dose = lines.noreDose; if (dose !== next.lastNore) { const artefact = Math.abs(lines.num.map - lines.num.tMap) > 7; if (artefact) next.penalties.push(`Norepinephrine changed to ${dose} µg/kg/min while the monitor MAP (${Math.round(lines.num.map)}) was wrong by ${Math.round(lines.num.map - lines.num.tMap)} mmHg — titrating to an artefact.`); next.lastNore = dose; changed = true; }
    if (changed) setSt(next);
  });
  if (!st) return (
    <div className="chal-list">
      <section className="card"><div className="eyebrow">Simulate</div><h2 className="h2">Interfacility transport</h2>
        <p className="muted">A ventilated patient in septic shock on norepinephrine, from the emergency department to a tertiary ICU by air. On the way the monitoring system will be disturbed — and the patient will genuinely deteriorate once. Keep the lines honest and the MAP at or above 65, and don’t titrate the drip to an artefact.</p>
        <p className="muted small">Tools: the fast-flush test, levelling, the stopcocks, the bedside fixes, the NIBP cuff and the norepinephrine pump. Events arrive in real time (about 3 minutes in all).</p>
        <div className="actions"><button className="act primary" onClick={start}>Start transport</button></div>
      </section>
    </div>
  );
  const t = lines.heart.t - st.t0; const allDone = EVENTS.every((_, i) => st.solvedAt[i] != null);
  return (
    <div className="chal-run">
      <button className="back" onClick={() => setSt(null)}>← End transport</button>
      <section className="card">
        <div className="eyebrow">Transport · {Math.floor(t / 60)}:{String(Math.floor(t % 60)).padStart(2, '0')}</div>
        <ol className="sim-ev">{EVENTS.map((e, i) => { const on = st.startedAt[i] != null; if (!on) return null; const ok = st.solvedAt[i] != null; return (
          <li key={i} className={ok ? 'ok' : 'open'}><b>{e.title}</b><span>{e.text}</span>{ok && <em>✓ sorted in {Math.round(st.solvedAt[i] - st.startedAt[i])} s — {e.lesson}</em>}</li>); })}</ol>
        {st.penalties.length > 0 && <ul className="ln-explain">{st.penalties.map((p, i) => <li key={i} className="tone-bad">{p}</li>)}</ul>}
        {allDone && <div className="sim-done"><h3>Handed over safely.</h3><p className="muted">{EVENTS.length} events managed · {st.penalties.length ? `${st.penalties.length} artefact titration${st.penalties.length > 1 ? 's' : ''}` : 'no titration to artefact'} · total {Math.round(t)} s.</p><div className="actions"><button className="act primary" onClick={start}>Run it again</button></div></div>}
      </section>
      <NumbersCard hideTrue={!allDone} />
      <TreatCard />
      <FlushCard />
      <SetupCard />
      <LineCard id="art" faults={false} />
      <LineCard id="cvp" faults={false} />
    </div>
  );
}
void axisHeight;
