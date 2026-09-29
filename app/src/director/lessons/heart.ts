/** Congenital heart lessons. Every cue SETS the shunt input (pure model), so seeking is exact. */
import type { Timeline } from '../timeline';
import { useHeartUI } from '../../heart/heartStore';
import { HEART_PRESETS, type ShuntInput } from '../../heart/shunt';

const put = (p: ShuntInput, mode: 'sat' | 'doppler' = 'sat') => useHeartUI.getState().set({ input: { ...p }, preset: 'custom', mode });
const V = (sizeMm: number, pvr: number, extra: Partial<ShuntInput> = {}): ShuntInput => ({ lesion: 'vsd', sizeMm, pvr, svr: 18, ...extra });

export const VSD_LESSON: Timeline = {
  id: 'heart-vsd', title: 'Ventricular septal defect: from murmur to Eisenmenger', level: 'core', module: 'heart',
  blurb: 'Why a small VSD is loud and a large one is dangerous, where the extra blood goes, how the lungs respond over years, and what repair prevents.',
  setup: () => put(V(4, 1.5)),
  cues: [
    { id: 'vsd-1', at: 0, dur: 9, hold: true, target: 'heart.four_chamber', title: 'A loud murmur', apply: () => put(V(4, 1.5)),
      say: 'A well child with a loud, harsh murmur at the lower left sternal border that lasts all through systole. The heart itself looks normal in size.' },
    { id: 'vsd-2', at: 10, dur: 8, hold: true, target: 'heart.vsd', title: 'The defect', apply: () => put(V(4, 1.5)),
      say: 'Here is the cause: a small hole in the ventricular septum, just below the aortic valve.' },
    { id: 'vsd-3', at: 19, dur: 11, hold: true, target: 'heart.vsd', title: 'A big gradient makes a fast jet', apply: () => put(V(4, 1.5), 'doppler'),
      say: 'In systole the left ventricle generates about one hundred and twenty millimetres of mercury, the right about twenty-five. Across a small hole that gradient drives a jet near five metres per second. On colour Doppler it aliases into a mosaic. Loud murmur, small shunt.' },
    { id: 'vsd-4', at: 31, dur: 11, hold: true, target: 'heart.four_chamber', title: 'A large defect: more flow, less noise', apply: () => put(V(12, 2.5)),
      say: 'Now a large defect. Pressures on the two sides move closer, so the jet is slower and the murmur can be softer — yet far more blood crosses. Pulmonary flow is more than twice systemic flow.' },
    { id: 'vsd-5', at: 43, dur: 10, hold: true, target: 'heart.pulmonary_outflow', title: 'The lungs are flooded', apply: () => put(V(12, 2.5)),
      say: 'The shunted blood goes straight out through the pulmonary artery. The lungs carry the extra flow at higher pressure: the infant breathes fast, sweats with feeds and fails to gain weight.' },
    { id: 'vsd-6', at: 54, dur: 10, hold: true, target: 'heart.lv', title: 'The left heart takes the volume', apply: () => put(V(12, 2.5)),
      say: 'All that extra pulmonary blood returns to the left atrium and left ventricle, which dilate. A VSD volume-loads the LEFT heart, even though the hole feeds the right ventricle.' },
    { id: 'vsd-7', at: 65, dur: 14, hold: true, target: 'heart.four_chamber', title: 'Years of overcirculation', apply: () => put(V(12, 4)),
      tween: (u) => put(V(12, 2.5 + 15.5 * u)),
      say: 'Left unrepaired, years of high flow and pressure remodel the small pulmonary arteries and resistance climbs. Watch the right ventricle thicken, the gradient shrink, flow become bidirectional, and finally reverse: right to left.' },
    { id: 'vsd-8', at: 80, dur: 10, hold: true, target: 'heart.rv', title: 'Eisenmenger syndrome', apply: () => put(V(12, 18)),
      say: 'Now deoxygenated blood enters the aorta. The patient is cyanosed and clubbed, and the murmur has faded. At this stage closing the hole would remove the right ventricle’s only escape valve, so repair is no longer possible.' },
    { id: 'vsd-9', at: 91, dur: 10, hold: true, target: 'heart.four_chamber', title: 'Repair in time', apply: () => put({ ...HEART_PRESETS.normal }),
      say: 'Closed in infancy, before the pulmonary vessels remodel, the circulation returns to two separate circuits and the heart remodels back toward normal. Many small muscular defects close on their own.' },
  ],
};
export const HEART_LESSONS: Timeline[] = [VSD_LESSON];
