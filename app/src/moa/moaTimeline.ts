/** Turn a mechanism into a Lesson Director timeline: dose ramps up, the chain lights rank by rank, the patient responds. */
import type { Timeline, Cue } from '../director/timeline';
import { sayDuration } from '../director/timeline';
import { ranks } from './layout';
import type { MechanismDefinition } from './types';
import { useMoa } from './moaStore';

export function moaTimeline(def: MechanismDefinition): Timeline {
  const r = ranks(def); const maxR = Math.max(...Object.values(r)); const cues: Cue[] = []; let t = 0;
  const lit = (n: number) => useMoa.getState().set({ lit: n });
  const expose = (u: number) => { def.patient?.exposure(u); useMoa.getState().set({ exposure: u }); };
  cues.push({ id: `${def.id}-0`, at: 0, dur: 6, hold: true, title: def.drug, say: def.blurb, apply: () => { lit(-1); expose(0); } });
  t = 7;
  for (let k = 0; k <= maxR; k++) {
    const nodes = def.nodes.filter((n) => r[n.id] === k && n.explain);
    const say = nodes.map((n) => n.explain).join(' ');
    const d = say ? sayDuration(say) : 2.5; const first = k === 0;
    const target = nodes.find((n) => n.target)?.target;
    cues.push({ id: `${def.id}-r${k}`, at: t, dur: d, hold: !!say, title: nodes.map((n) => n.label).join(' · ') || undefined, say: say || undefined, target,
      apply: () => lit(k),
      // the dose climbs while the drug and receptor layers light, then holds
      tween: first && def.patient ? (u) => expose(u) : undefined });
    t += d + 0.6;
  }
  if (def.summary) cues.push({ id: `${def.id}-sum`, at: t, dur: sayDuration(def.summary), hold: true, title: 'Putting it together', say: def.summary, apply: () => { lit(maxR); expose(1); } });
  return { id: `moa-${def.id}`, title: `${def.drug}: mechanism of action`, blurb: def.blurb, module: 'moa', cues, setup: () => { def.patient?.setup(); lit(-1); expose(0); } };
}
