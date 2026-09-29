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


/* ------------------------------------------------------------------ flagship lessons: LVO, ICH, SAH */
const withState = (p: Partial<NeuroState>) => put(p);
const sysSet = (p: Partial<typeof DEFAULT_SYSTEMIC>) => useNeuroUI.getState().set({ sys: { ...DEFAULT_SYSTEMIC, ...p } });

export const LVO_LESSON: Timeline = {
  id: 'neuro-lvo', title: 'Large-vessel occlusion: recognise, confirm, decide', level: 'advanced', module: 'neuro',
  blurb: 'What a proximal MCA occlusion looks like at the bedside and on imaging, how collaterals set the clock, and why transport decisions matter.',
  setup: () => { preset('m1_L'); withState({ minutes: 20, collaterals: 'moderate' }); sysSet({}); useNeuroUI.getState().set({ view: '3d', slice: -0.3, labels: true }); },
  cues: [
    { id: 'lvo-1', at: 0, dur: 10, hold: true, target: 'brain.mca_l', title: 'Cortical signs point to a large vessel', apply: () => { preset('m1_L'); withState({ minutes: 20 }); view('3d'); },
      say: 'A left middle cerebral artery occlusion takes out the language cortex and the motor strip for face and arm. Expect aphasia, right-sided weakness worse in face and arm than leg, and the eyes deviated toward the left — toward the lesion.' },
    { id: 'lvo-2', at: 11, dur: 9, hold: true, target: 'brain.mca_r', title: 'The other side looks different', apply: () => { preset('m1_R'); withState({ minutes: 20 }); },
      say: 'On the right, the same clot causes left-sided weakness with neglect: the patient ignores the left side of the world and may deny the weakness. Cortical signs like these, with a dense deficit, suggest a large vessel rather than a small lacune.' },
    { id: 'lvo-3', at: 21, dur: 8, hold: true, title: 'CTA confirms the target', apply: () => { preset('m1_L'); withState({ minutes: 50 }); view('imaging', -0.55); },
      say: 'Back to the left-sided stroke. The angiogram shows where contrast stops. That is the target for thrombectomy.' },
    { id: 'lvo-4', at: 30, dur: 9, hold: true, title: 'Poor collaterals: a fast progressor', apply: () => { withState({ collaterals: 'poor', minutes: 90 }); view('imaging', -0.2); },
      say: 'With poor collaterals, almost the whole territory is already core by ninety minutes. The perfusion maps show little left to save.' },
    { id: 'lvo-5', at: 40, dur: 9, hold: true, title: 'Good collaterals: a slow progressor', apply: () => withState({ collaterals: 'good', minutes: 90 }),
      say: 'With good collaterals, the same clot at the same time leaves a small core and a large penumbra. These patients can benefit even many hours later.' },
    { id: 'lvo-6', at: 50, dur: 10, hold: true, target: 'brain.mca_l', title: 'Transport decisions spend minutes', apply: () => { withState({ collaterals: 'moderate', minutes: 60 }); view('3d'); },
      say: 'For a moderate-collateral patient, look at the final-core numbers: reopening now, in one hour, or in three hours. A detour to a hospital that cannot do thrombectomy usually costs that hour. That is why large-vessel screening in the field matters.' },
  ],
};

export const ICH_LESSON: Timeline = {
  id: 'neuro-ich', title: 'Intracerebral haemorrhage: the first hours', level: 'advanced', module: 'neuro',
  blurb: 'Volume, growth and blood pressure: why early haematoma expansion is the target, and what mass effect does.',
  setup: () => { preset('ich'); withState({ minutes: 0 }); sysSet({ map: 130 }); useNeuroUI.getState().set({ view: 'imaging', slice: -0.22, labels: true }); },
  cues: [
    { id: 'ich-1', at: 0, dur: 9, hold: true, title: 'A bleed, not a clot', apply: () => { view('imaging', -0.22); },
      say: 'A hypertensive bleed in the left basal ganglia. On non-contrast CT fresh blood is bright. This is why every stroke gets a scan before any clot-dissolving drug.' },
    { id: 'ich-2', at: 10, dur: 8, hold: true, title: 'Estimating the volume', say: 'Bedside volume estimate: multiply the largest diameter by the perpendicular diameter by the number of slices with blood, in centimetres, and halve it. Thirty millilitres is a common threshold for a worse outcome.' },
    { id: 'ich-3', at: 19, dur: 12, hold: true, title: 'It grows — faster at high pressure', apply: () => sysSet({ map: 130 }), tween: minutes(0, 240),
      say: 'Many haematomas keep growing in the first few hours. With a systolic pressure near one hundred and ninety, watch the volume and the midline shift climb.' },
    { id: 'ich-4', at: 32, dur: 12, hold: true, title: 'Lower the pressure early', apply: () => sysSet({ map: 97 }), tween: minutes(0, 240),
      say: 'Rewind and lower the systolic pressure to about one hundred and forty from the start. The same bleed grows less. Early, smooth pressure control and reversing any anticoagulant are the core of the first hour.' },
    { id: 'ich-5', at: 45, dur: 8, hold: true, target: 'brain.whole', title: 'Mass effect', apply: () => view('3d'),
      say: 'A growing clot pushes the midline across and raises intracranial pressure. Falling consciousness, a new blown pupil or vomiting means the mass effect is winning.' },
  ],
};

export const SAH_LESSON: Timeline = {
  id: 'neuro-sah', title: 'Subarachnoid haemorrhage and vasospasm', level: 'advanced', module: 'neuro',
  blurb: 'Blood around the circle of Willis, the thunderclap, and the delayed danger of vasospasm days later.',
  setup: () => { preset('sah'); sysSet({}); useNeuroUI.getState().set({ view: 'imaging', slice: -0.5, labels: true }); },
  cues: [
    { id: 'sah-1', at: 0, dur: 9, hold: true, title: 'Blood in the cisterns', apply: () => { preset('sah'); view('imaging', -0.5); },
      say: 'A ruptured aneurysm on the circle of Willis fills the basal cisterns and the Sylvian fissures with blood: the bright star shape around the circle on non-contrast CT. The story is a sudden, worst-ever headache.' },
    { id: 'sah-2', at: 10, dur: 8, hold: true, target: 'brain.cow', title: 'Where aneurysms sit', apply: () => view('3d'),
      say: 'Most aneurysms arise at branch points of the circle: the anterior communicating, the posterior communicating origin, and the middle cerebral bifurcation. Securing the aneurysm early prevents a re-bleed.' },
    { id: 'sah-3', at: 19, dur: 12, hold: true, target: 'brain.mca_l', title: 'Days 3 to 14: vasospasm', apply: () => { withState({ spasm: { m1_L: 0.82, a1_L: 0.5, m1_R: 0.3 }, occlusion: {}, recanalizedAt: null }); view('imaging', -0.35); }, tween: minutes(0, 360),
      say: 'Days later, blood breakdown products make the arteries around the circle constrict. Narrowed vessels on angiography, and delayed ischaemia in their territories: a new deficit or falling consciousness between day three and day fourteen.' },
    { id: 'sah-4', at: 32, dur: 9, hold: true, title: 'Protecting the brain', apply: () => view('3d'),
      say: 'Keep the patient euvolaemic, avoid hypotension, give nimodipine, and watch closely for a new deficit so spasm can be treated early.' },
  ],
};

export const NEURO_LESSONS: Timeline[] = [TIME_IS_BRAIN, STROKE_TIME_MACHINE, LVO_LESSON, ICH_LESSON, SAH_LESSON];
