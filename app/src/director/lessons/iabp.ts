/** IABP timing lesson: cardiogenic shock on the Lines session; each cue sets the balloon timing (pure trace → exact seek). */
import type { Timeline } from '../timeline';
import { useIabp } from '../../procedures/iabpStore';
import { IABP_PRESETS, type IabpError } from '../../procedures/iabp';
import { lines } from '../../lines/session';

const put = (k: IabpError) => useIabp.getState().set({ timing: { ...IABP_PRESETS[k].t }, quiz: null, answer: null });
export const IABP_LESSON: Timeline = {
  id: 'lines-iabp', title: 'Intra-aortic balloon pump timing', level: 'advanced', module: 'lines', absolute: true,
  blurb: 'Read the 1:2 arterial trace: augmentation, the two end-diastolic pressures, the assisted systole — and the four timing errors by their shapes.',
  setup: () => { if (lines.sc.id !== 'cardiogenic') lines.load('cardiogenic'); put('ideal'); },
  cues: [
    { id: 'iabp-1', at: 0, dur: 11, hold: true, title: 'Why a balloon', apply: () => put('ideal'),
      say: 'A failing left ventricle, low cardiac output. A balloon in the descending aorta inflates in diastole and deflates just before systole: it pushes blood back toward the coronaries while the heart relaxes, and leaves an emptier aorta for the next beat to eject into.' },
    { id: 'iabp-2', at: 12, dur: 12, hold: true, title: 'Reading 1:2', apply: () => put('ideal'),
      say: 'At one-to-two every other beat is assisted, so the trace compares itself. Find the unassisted systole, the dicrotic notch, then the diastolic augmentation — ideally as high as systole or higher.' },
    { id: 'iabp-3', at: 25, dur: 12, hold: true, title: 'Two end-diastolic pressures', apply: () => put('ideal'),
      say: 'Deflation drops the pressure just before the next beat: the balloon-assisted end-diastolic pressure should be lower than the patient’s own, and the assisted systole lower than the unassisted one. That is the afterload reduction.' },
    { id: 'iabp-4', at: 38, dur: 11, hold: true, title: 'Early inflation', apply: () => put('earlyInflation'),
      say: 'Inflate too early and the balloon meets a ventricle that is still ejecting. The notch disappears, the aortic valve closes early and stroke volume falls.' },
    { id: 'iabp-5', at: 50, dur: 10, hold: true, title: 'Late inflation', apply: () => put('lateInflation'),
      say: 'Inflate late and you see the notch, then a gap, then a smaller augmentation. Less diastolic pressure means less coronary benefit.' },
    { id: 'iabp-6', at: 61, dur: 11, hold: true, title: 'Early deflation', apply: () => put('earlyDeflation'),
      say: 'Deflate too early and the augmentation falls away in mid-diastole; the pressure drifts back up before the next beat, so there is no afterload reduction — the assisted systole is no lower.' },
    { id: 'iabp-7', at: 73, dur: 12, hold: true, title: 'Late deflation — the dangerous one', apply: () => put('lateDeflation'),
      say: 'Deflate late and the ventricle starts ejecting against a balloon that is still full. The assisted end-diastolic pressure is higher than the patient’s own: afterload and myocardial oxygen demand go up.' },
    { id: 'iabp-8', at: 86, dur: 9, hold: true, title: 'Your turn', apply: () => useIabp.getState().set({ quiz: 'lateInflation', answer: null }),
      say: 'Now read one yourself. Name the timing error from its shape, then try the next trace.' },
  ],
};
