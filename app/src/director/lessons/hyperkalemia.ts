/**
 * Hyperkalaemia signature lesson on the Lesson Director. Everything runs on the ONE patient in the
 * labs bench (no separate potassium model): K⁺ is raised with `bench.set('k', …)`, treatments are
 * the bench's own drugs, time passes with `bench.fastForward`. To keep seeking exact, a cue that lets
 * time pass snapshots the patient when it starts and each tween frame restores that snapshot and
 * fast-forwards u × minutes — a pure function of u.
 */
import type { Timeline } from '../timeline';
import { bench } from '../../labs/bench';
import { useLabUI } from '../../labs/labStore';
import { useUI } from '../../app/store';
import { derive, type PatientState, type DrugId } from '../../physiology/patient';

const refresh = () => { bench.snap = derive(bench.pt); bench.version++; useUI.getState().set({ pulse: useUI.getState().pulse + 1 }); };
const focus = (id: string | null, cellView: 'whole' | 'zoom' = 'zoom') => useLabUI.getState().set({ lab: 'k', view: 'cell', cellView, cameraTargetId: id, autoplay: false });
const snaps: Record<string, PatientState> = {};
/** give a drug (optional) and remember the patient at that moment */
const mark = (key: string, drug?: DrugId) => { if (drug) bench.give(drug); bench.running = false; snaps[key] = structuredClone(bench.pt); refresh(); };
/** the patient `minutes × u` after the mark */
const after = (key: string, minutes: number) => (u: number) => { const s = snaps[key]; if (!s) return; bench.pt = structuredClone(s); if (u > 0) bench.fastForward(minutes * u); bench.running = false; refresh(); };

export const HYPERKALEMIA: Timeline = {
  id: 'hyperk-signature', title: 'Hyperkalaemia: the membrane, the ECG, the rescue', level: 'core', module: 'labs',
  blurb: 'One patient from normal potassium to a sine wave and back: why calcium works without lowering K⁺, why shifting is temporary, and why removal is the cure.',
  setup: () => { bench.reset(); bench.pt.p.renal = 0.1; bench.set('k', 4.2); bench.running = false; focus('membrane.overview'); refresh(); },
  cues: [
    { id: 'hks-1', at: 0, dur: 9, hold: true, title: 'A membrane held at −85 mV', apply: () => focus('membrane.overview'),
      say: 'Heart muscle cells hold about one hundred and forty millimoles of potassium inside, against about four outside. That gradient, leaking out through potassium channels, holds the resting membrane near minus eighty-five millivolts.' },
    { id: 'hks-2', at: 10, dur: 7, hold: true, title: 'The pump keeps the gradient', apply: () => focus('membrane.nak_atpase'),
      say: 'The sodium potassium pump spends ATP to carry two potassium ions in for every three sodium ions out. Keep an eye on it; it becomes a treatment later.' },
    { id: 'hks-3', at: 18, dur: 16, hold: true, title: 'The kidneys fail and potassium climbs', apply: () => focus('membrane.kir'), tween: (u) => { bench.set('k', 4.2 + 4.2 * u); bench.running = false; refresh(); },
      say: 'With the kidneys failing, plasma potassium rises. The outward leak weakens, the resting potential creeps toward threshold, and the ECG changes in order: tall peaked T waves, then a longer PR and flattened P waves, then a widening QRS.' },
    { id: 'hks-4', at: 35, dur: 6, hold: true, title: 'A sine wave is a pre-arrest rhythm', tween: (u) => { bench.set('k', 8.4 + 0.8 * u); bench.running = false; refresh(); },
      say: 'Above about nine, the widened QRS runs into the T wave. This sine-wave pattern comes just before ventricular fibrillation or asystole.' },
    { id: 'hks-5', at: 42, dur: 9, hold: true, title: 'Stabilise: calcium', apply: () => { focus('membrane.nav'); mark('ca', 'calcium'); }, tween: after('ca', 3),
      say: 'Calcium goes in first. Potassium stays exactly where it was. Calcium raises the threshold potential, re-opening the gap between rest and threshold, and the QRS narrows within minutes. It buys roughly thirty to sixty minutes.' },
    { id: 'hks-6', at: 52, dur: 10, hold: true, title: 'Shift: insulin and dextrose', apply: () => { focus('membrane.nak_atpase'); mark('ins', 'insulin'); }, tween: after('ins', 45),
      say: 'Insulin with dextrose drives the sodium potassium pump harder, moving potassium back into cells. Plasma potassium falls by about one. Nebulised salbutamol works the same way. None of it has left the body.' },
    { id: 'hks-7', at: 63, dur: 9, hold: true, title: 'The rebound', apply: () => mark('rb'), tween: after('rb', 300),
      say: 'Hours later the insulin has worn off and potassium leaks back out of the cells. Shifting is temporary.' },
    { id: 'hks-8', at: 73, dur: 10, hold: true, title: 'Remove: dialysis', apply: () => { focus('membrane.overview'); mark('hd', 'dialysis'); }, tween: after('hd', 240),
      say: 'Removal is the cure: dialysis, gut binders, or diuretics if the kidneys still work. Stabilise, shift, remove. Then repeat the ECG and the potassium.' },
  ],
};
export const LAB_TIMELINES: Timeline[] = [HYPERKALEMIA];
