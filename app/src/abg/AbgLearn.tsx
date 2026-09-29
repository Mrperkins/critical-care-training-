import { LessonShell } from '../app/LessonShell';
import { ABG_LESSONS, type AbgLesson, type AbgSetup } from '../lessons/abg';
import { lab } from './lab';
import { useUI } from '../app/store';
import { useAbgUI } from './abgStore';
import { SampleCards, StationCard, AcidBaseMap, AbgInterpret } from './AbgPanel';
import { ABG_TIMELINES } from '../director/lessons/abg';

/** Replay the lesson from its last preset load up to step i (knobs accumulate; time jumps and drugs only on their own step). */
export function applyAbgStep(lesson: AbgLesson, i: number) {
  let start = 0; for (let k = i; k >= 0; k--) if (lesson.steps[k].setup?.preset) { start = k; break; }
  const first = lesson.steps[start].setup!; lab.load(first.preset ?? lab.preset.id);
  let station = useAbgUI.getState().station;
  for (let k = start; k <= i; k++) {
    const s: AbgSetup = lesson.steps[k].setup ?? {};
    if (s.knobs) for (const [key, v] of Object.entries(s.knobs)) lab.set(key as never, v as number);
    if (s.vent === 'own') lab.setControl('own'); else if (s.vent) lab.setVent(s.vent.rr, s.vent.vt);
    if (s.metab != null) lab.setMetab(s.metab);
    if (s.drug) lab.give(s.drug);
    if (s.ff) lab.fastForward(s.ff);
    if (s.station) station = s.station;
  }
  useAbgUI.getState().set({ station }); useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
}

export function AbgLearn() {
  return (
    <LessonShell lessons={ABG_LESSONS} apply={applyAbgStep} timelines={ABG_TIMELINES} timelineChildren={() => <><SampleCards /><AcidBaseMap /><AbgInterpret /></>} intro="The narrator changes causes — drive, V/Q, shunt, haemoglobin, acid load, time — and the patient model produces the gases. The anatomy on the left follows the same numbers.">
      {() => <><SampleCards /><StationCard /><AcidBaseMap /><AbgInterpret /></>}
    </LessonShell>
  );
}
