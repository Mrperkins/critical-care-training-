import { LessonShell } from '../app/LessonShell';
import { LabNormals } from '../app/Normals';
import { LAB_LESSONS, type LabLesson, type LabSetup } from '../lessons/labs';
import { bench } from './bench';
import { derive } from '../physiology/patient';
import { useLabUI } from './labStore';
import { useUI } from '../app/store';
import { LabCard, Consequences } from './LabPanel';

export function applyLabStep(lesson: LabLesson, i: number) {
  let start = 0; for (let k = i; k >= 0; k--) if (lesson.steps[k].setup?.reset) { start = k; break; }
  bench.reset(); bench.naMode = 'acute';
  let lab = useLabUI.getState().lab, view = useLabUI.getState().view;
  for (let k = start; k <= i; k++) {
    const s: LabSetup = lesson.steps[k].setup ?? {};
    if (s.renal != null) bench.pt.p.renal = s.renal;
    if (s.naMode) { bench.naMode = s.naMode; }
    if (s.lab) lab = s.lab; if (s.view) view = s.view;
    if (s.values) for (const [id, v] of Object.entries(s.values)) bench.set(id, v);
    if (s.correct != null) { const was = bench.pt.p.na; bench.pt.p.na = s.correct; bench.pt.naHist = [{ t: bench.pt.t - 1440, na: was }]; bench.snap = derive(bench.pt); }
    if (lesson.id === 'lactate' && k === start + 1) { bench.pt.p.co = 2.0; bench.pt.p.lactateProd = 2.5; bench.pt.p.hepatic = 0.6; }
    if (lesson.id === 'lactate' && k === start + 2) { bench.pt.p.co = 5.5; bench.pt.p.lactateProd = 1; bench.pt.p.hepatic = 1; }
    if (s.drug) bench.give(s.drug);
    if (s.ff) bench.fastForward(s.ff);
  }
  bench.running = false; useLabUI.getState().set({ lab, view }); useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
}
export function LabLearn() {
  return <LessonShell lessons={LAB_LESSONS} apply={applyLabStep} reference={() => <LabNormals />} intro="The narrator changes lab values and gives treatments on the same patient model; the cells, the ECG and the numbers respond.">{() => <><Consequences /><LabCard /></>}</LessonShell>;
}
