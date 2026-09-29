/** Brain lessons on the Lesson Director. Every cue SETS state; tweens are pure in u. */
import type { Timeline } from '../timeline';
import { useNeuroUI, presetState } from '../../neuro/neuroStore';
import { DEFAULT_SYSTEMIC, type NeuroState } from '../../neuro/perfusion';

const put = (p: Partial<NeuroState>) => { const s = useNeuroUI.getState(); s.set({ state: { ...s.state, ...p } }); };
const preset = (id: Parameters<typeof presetState>[0]) => useNeuroUI.getState().set({ preset: id, state: presetState(id), playing: false });
const map = (v: number) => useNeuroUI.getState().set({ sys: { ...useNeuroUI.getState().sys, map: v } });

export const TIME_IS_BRAIN: Timeline = {
  id: 'neuro-time-is-brain', title: 'Time is brain: a left M1 occlusion', level: 'core', module: 'neuro',
  blurb: 'Watch core and penumbra evolve, see why collaterals and blood pressure matter, and what reopening the artery saves.',
  setup: () => { preset('none'); useNeuroUI.getState().set({ sys: { ...DEFAULT_SYSTEMIC }, labels: true, glass: true, view: '3d' }); },
  cues: [
    { id: 'tib-1', at: 0, dur: 9, hold: true, target: 'brain.cow', title: 'Four inflows, one ring', say: 'Two internal carotids and two vertebral arteries feed the brain. At its base, the Circle of Willis links them, so flow can reroute around a blocked feeder.' },
    { id: 'tib-2', at: 10, dur: 8, hold: true, target: 'brain.cow', title: 'A clot in the left M1', apply: () => preset('m1_L'), say: 'A thrombus lodges in the left middle cerebral artery, beyond the circle. Nothing in the ring can bypass it. Flow past the clot stops.' },
    { id: 'tib-3', at: 19, dur: 14, hold: true, target: 'brain.mca_l', title: 'Core and penumbra', apply: () => put({ collaterals: 'moderate', recanalizedAt: null }), tween: (u) => put({ minutes: 90 * u }),
      say: 'The deep territory, fed only by end arteries, dies within minutes. That is the core, in magenta. Around it, tissue fed thinly by collaterals from the anterior and posterior cerebral arteries is silent but alive. That is the penumbra, in amber.' },
    { id: 'tib-4', at: 34, dur: 12, hold: true, target: 'brain.mca_l', title: 'The penumbra shrinks with time', tween: (u) => put({ minutes: 90 + 150 * u }),
      say: 'Hour by hour, penumbra converts to core. The lower the flow in a region, the sooner it infarcts.' },
    { id: 'tib-5', at: 47, dur: 10, hold: true, target: 'brain.mca_l', title: 'Collateral flow is pressure-passive', apply: () => map(60), say: 'Ischaemic vessels have lost autoregulation, so collateral flow follows blood pressure. Let the mean arterial pressure fall to sixty and the core grows faster.' },
    { id: 'tib-6', at: 58, dur: 6, hold: true, target: 'brain.mca_l', title: 'Protect the pressure', apply: () => map(90), say: 'Restore the pressure, and the penumbra holds on longer.' },
    { id: 'tib-7', at: 65, dur: 12, hold: true, target: 'brain.mca_l', title: 'Reopen the artery', apply: () => put({ recanalizedAt: 240 }), tween: (u) => put({ minutes: 240 + 240 * u }),
      say: 'Thrombectomy at four hours restores flow. The core that already died stays. Everything still in the penumbra is saved. That difference is the reason for speed.' },
    { id: 'tib-8', at: 78, dur: 8, hold: true, target: 'brain.whole', title: 'Two patients, one clot', say: 'The same clot, a different outcome. The size of the final infarct is set by collaterals, blood pressure and, above all, time to reperfusion.' },
  ],
};
const view = (v: '3d' | 'imaging', slice?: number) => useNeuroUI.getState().set({ view: v, ...(slice != null ? { slice } : {}) });
const minutes = (a: number, b: number) => (u: number) => put({ minutes: a + (b - a) * u });

export const STROKE_TIME_MACHINE: Timeline = {
  id: 'neuro-time-machine', title: 'Stroke time machine: onset to reperfusion', level: 'core', module: 'neuro',
  blurb: 'Follow one left M1 stroke along the clock — scene, door, CT, CTA, perfusion, thrombectomy — and see what each hour costs.',
  setup: () => { preset('m1_L'); put({ minutes: 0, collaterals: 'moderate', recanalizedAt: null }); useNeuroUI.getState().set({ sys: { ...DEFAULT_SYSTEMIC }, view: '3d', slice: -0.3, labels: true }); },
  cues: [
    { id: 'tm-1', at: 0, dur: 7, hold: true, target: 'brain.mca_l', title: '0 min · Onset', apply: () => view('3d'), say: 'Minute zero. A clot blocks the left middle cerebral artery. Right-sided weakness and aphasia start at once.' },
    { id: 'tm-2', at: 8, dur: 7, hold: true, target: 'brain.mca_l', title: '0–45 min · Scene and transport', tween: minutes(0, 45), say: 'While the crew recognises a large-vessel stroke and transports, the core is already growing from the deep territory outward.' },
    { id: 'tm-3', at: 16, dur: 9, hold: true, title: '45–60 min · Door → non-contrast CT', apply: () => view('imaging', -0.5), tween: minutes(45, 60),
      say: 'At the hospital the first scan is a non-contrast CT, to exclude bleeding. There is no haemorrhage. Look for the hyperdense clot in the left middle cerebral artery, and subtle loss of grey–white differentiation in the deep grey matter.' },
    { id: 'tm-4', at: 26, dur: 7, hold: true, title: 'CT angiogram', apply: () => view('imaging', -0.55), tween: minutes(60, 66), say: 'The CT angiogram shows the cut-off: contrast stops at the clot, and the branches beyond fill only faintly, backwards, through collaterals.' },
    { id: 'tm-5', at: 34, dur: 9, hold: true, title: 'CT perfusion', apply: () => view('imaging', -0.2), tween: minutes(66, 72),
      say: 'Perfusion maps separate tissue that is already lost, with very low blood flow, from tissue that is only delayed. A large delayed area around a small core is a mismatch — salvageable brain.' },
    { id: 'tm-6', at: 44, dur: 9, hold: true, title: '72–150 min · Thrombectomy', apply: () => put({ recanalizedAt: 150 }), tween: minutes(72, 150),
      say: 'The patient goes for thrombectomy. At two and a half hours from onset the clot is pulled out and flow returns.' },
    { id: 'tm-7', at: 54, dur: 9, hold: true, target: 'brain.mca_l', title: '24 h · Final infarct', apply: () => view('3d'), tween: minutes(150, 1440),
      say: 'A day later, the final infarct is the core that existed at reperfusion. Everything that was still penumbra has been saved.' },
    { id: 'tm-8', at: 64, dur: 8, hold: true, target: 'brain.mca_l', title: 'What every hour costs', apply: () => view('imaging', -0.2),
      say: 'Use the numbers under the images: the same patient, reopened an hour later, keeps a larger infarct. Minutes at every step — scene, door, scan, groin — become brain.' },
  ],
};

export const NEURO_LESSONS: Timeline[] = [TIME_IS_BRAIN, STROKE_TIME_MACHINE];
