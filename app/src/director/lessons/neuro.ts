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
  setup: () => { preset('none'); useNeuroUI.getState().set({ sys: { ...DEFAULT_SYSTEMIC }, labels: true, glass: true }); },
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
export const NEURO_LESSONS: Timeline[] = [TIME_IS_BRAIN];
