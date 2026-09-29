import { session } from './session';
import { useUI } from '../app/store';
import { VENT_LESSONS, type Lesson, type StepSetup } from '../lessons/vent';
import { loadVentScenario, VentNumbersCard, GasCard, Interventions, VentControls } from './VentPanel';
import { Loops } from './Waveforms';
import { LessonShell } from '../app/LessonShell';
import { VENT_WORKFLOWS } from '../workflows/chestTube';
import { VENT_TIMELINES } from '../director/lessons/vent';
import { VentNormals } from '../app/Normals';

/** Apply a lesson up to step i: the last scenario load, then every settings change after it, then this step's action. */
export function applyLessonStep(lesson: Lesson, i: number) {
  let start = 0; for (let k = i; k >= 0; k--) if (lesson.steps[k].setup?.scenario) { start = k; break; }
  const acc: StepSetup = {}; let dyss: StepSetup['dyss'] = null;
  for (let k = start; k <= i; k++) { const s = lesson.steps[k].setup; if (!s) continue; if (s.dyss !== undefined) dyss = s.dyss; if (s.scenario) acc.scenario = s.scenario; if (s.view) acc.view = s.view; if (s.pmus !== undefined) acc.pmus = s.pmus; acc.settings = { ...(acc.settings ?? {}), ...(s.settings ?? {}) }; }
  const cur = lesson.steps[i].setup ?? {};
  if (acc.scenario && (cur.scenario || cur.dyss !== undefined || session.sc.id !== acc.scenario || session.dyss !== (dyss ?? null))) loadVentScenario(acc.scenario, dyss ?? null);
  if (acc.settings) session.set(acc.settings);
  for (let k = start; k < i; k++) { const a = lesson.steps[k].setup?.act; if (a && !(a === 'bronchodilator' && session.bdT >= 0)) session.intervene(a); }
  if (cur.act) session.intervene(cur.act);
  if (cur.hold) setTimeout(() => session.hold(cur.hold!), 1200);
  if (cur.ff) session.fastForward(cur.ff);
  const ui = useUI.getState(); ui.set({ ventView: acc.view ?? ui.ventView, showPmus: acc.pmus ?? session.m.pt.pmax > 0, pulse: ui.pulse + 1 });
}

export function VentLearn() {
  return (
    <LessonShell lessons={VENT_LESSONS} apply={applyLessonStep} timelines={VENT_TIMELINES} timelineChildren={() => <><VentNumbersCard /><GasCard compact /></>} workflows={VENT_WORKFLOWS} workflowChildren={() => <><VentNumbersCard /><GasCard compact /></>} reference={() => <VentNormals />} intro="The narrator changes the ventilator and the patient; everything you see is the simulation responding. Pause at any point and take the controls.">
      {(l, i) => { const st = l.steps[i]; return <>
        {st.focus && <p className="focus">Watch: {st.focus.map((f) => ({ pressure: 'pressure trace', flow: 'flow trace', volume: 'volume trace', loops: 'loops', numbers: 'numbers', lungs: 'the lungs', gas: 'SpO₂ and blood gas' }[f])).join(' · ')}</p>}
        <VentNumbersCard />
        {st.focus?.includes('loops') && <section className="card"><Loops /></section>}
        <GasCard compact={!st.focus?.includes('gas')} />
        <details className="card"><summary>Take the controls</summary><Interventions /><VentControls /></details>
      </>; }}
    </LessonShell>
  );
}
