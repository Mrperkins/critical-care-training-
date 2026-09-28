import { LessonShell } from '../app/LessonShell';
import { LINES_LESSONS, type LLesson, type LStepDo } from './lessons';
import { lines, axisHeight } from './session';
import { useLinesUI } from './linesStore';
import { useUI } from '../app/store';
import { FlushCard, NumbersCard, SetupCard, LineCard } from './LinesPanel';
import { LinesNormals } from './LinesNormals';

export function applyStep(d: LStepDo, fresh = false) {
  const ui = useLinesUI.getState();
  if (d.scenario && (fresh || d.scenario !== lines.sc.id)) lines.load(d.scenario);
  if (d.vent && d.vent !== lines.resp.mode) lines.setVent(d.vent);
  if (d.vt && d.vt !== lines.vt) lines.setVt(d.vt);
  lines.setFault('art', d.art ?? 'none'); lines.setFault('cvp', d.cvp ?? 'none');
  for (const id of ['art', 'cvp'] as const) { const L = lines.line(id); L.stopcock = 'patient'; L.drift = 0; L.zeroRef = 0; if (L.bag < 300) L.bag = 300; }
  const bedH = d.bedH ?? 70; const hob = d.hob ?? 30;
  lines.setup.bedH = bedH; lines.setup.hob = hob; lines.setup.transH = d.fromHob != null ? axisHeight(bedH, d.fromHob) : axisHeight(bedH, hob) - (d.below ?? 0);
  if (d.zeroWrong) lines.zero(d.zeroWrong);
  if (d.fluids) for (let i = 0; i < d.fluids; i++) lines.fluid();
  if (d.nore != null) lines.setNore(d.nore);
  if (d.tap) lines.pericardiocentesis();
  if (d.flush) { lines.flush(d.flush); ui.set({ flushLine: d.flush }); }
  ui.set({ view: d.view ?? ui.view, showTrue: !!d.showTrue, frozen: !!d.freeze, labels: true });
  useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
}

export function LinesLearn() {
  return (
    <LessonShell<LLesson>
      lessons={LINES_LESSONS}
      intro="Each lesson sets up the bedside for you — patient, breathing, bed, transducer and faults — then talks you through what the monitor and the heart are doing. Everything stays live: change anything and see what happens."
      apply={(l, i) => { if (i === 0) lines.setNore(0); applyStep(l.steps[i].do); }}
      reference={() => <LinesNormals />}
    >
      {(l, i) => { const d = l.steps[i].do; return <>{d.flush && <FlushCard />}{(d.below != null || d.fromHob != null || d.hob != null) && <SetupCard />}{d.zeroWrong && <LineCard id={d.zeroWrong} faults={false} />}<NumbersCard /></>; }}
    </LessonShell>
  );
}
