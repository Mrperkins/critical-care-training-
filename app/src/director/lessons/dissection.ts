/**
 * Aortic dissection signature lesson. The anatomy is the ONE abdominal state (CT angiogram drawn from
 * it, level by level); the blood pressure and heart rate are the Lines patient (`shockScene`: load →
 * set SVR / HR / CO → fixed settling ticks), so anti-impulse therapy moves real numbers. Seeking is exact.
 */
import type { Timeline } from '../timeline';
import { useAbdUI, ABD_PRESETS, type AbdPreset } from '../../abdomen/abdomenStore';
import { useCtaUI } from '../../abdomen/CtaScene';
import type { CtaLevel } from '../../abdomen/cta';
import { shockScene } from './lines';

/** haemodynamic states on the Lines patient */
export const DISSECTION_BP = {
  presentation: { svrMult: 1.5, coMult: 1.15, hr: 108 },
  betaBlocked: { svrMult: 1.5, coMult: 1.0, hr: 58 },
  target: { svrMult: 0.9, coMult: 1.0, hr: 58 },
  vasodilatorAlone: { svrMult: 0.9, coMult: 1.15, hr: 122 },
} as const;
const bp = (k: keyof typeof DISSECTION_BP) => { const b = DISSECTION_BP[k]; shockScene({ id: 'normal', view: 'bed', svrMult: b.svrMult, coMult: b.coMult, params: { hr: b.hr } }); };
const scene = (preset: AbdPreset, level: CtaLevel, h: keyof typeof DISSECTION_BP) => () => {
  useAbdUI.getState().set({ preset, base: ABD_PRESETS.find((p) => p.id === preset)!.make(), minutes: 0, view: 'cta', target: 'abdomen.aorta' });
  useCtaUI.getState().set(level); bp(h);
};

export const DISSECTION_LESSON: Timeline = {
  id: 'abd-dissection', title: 'Aortic dissection: type, extent, malperfusion, anti-impulse', level: 'advanced', module: 'abdomen', absolute: true,
  blurb: 'Read the CT angiogram level by level — ascending or not, true versus false lumen, which branches are starved — and bring the heart rate down before the pressure.',
  setup: scene('dissectB', 'chest', 'presentation'),
  cues: [
    { id: 'ad-1', at: 0, dur: 12, hold: true, title: 'A tearing pain', apply: scene('dissectB', 'chest', 'presentation'),
      say: 'Sudden, severe, tearing pain between the shoulder blades. Hypertensive and tachycardic. A pressure difference between the arms, or a pulse deficit, raises the suspicion. The test is a CT angiogram from the chest to the groins.' },
    { id: 'ad-2', at: 13, dur: 12, hold: true, title: 'Type A: the ascending aorta', apply: scene('dissectA', 'chest', 'presentation'),
      say: 'At the level of the pulmonary artery, look first at the ascending aorta in front. A flap here is Stanford type A: it can tear into the pericardium, the coronaries or the aortic valve. That is a surgical emergency.' },
    { id: 'ad-3', at: 26, dur: 11, hold: true, title: 'Type B: descending only', apply: scene('dissectB', 'chest', 'presentation'),
      say: 'In this patient the ascending aorta is clean and round. The flap is only in the descending aorta, beside the spine: Stanford type B. Most are managed medically unless they are complicated.' },
    { id: 'ad-4', at: 38, dur: 12, hold: true, title: 'True and false lumen', apply: scene('dissectB', 'renal', 'presentation'),
      say: 'Follow it down. The flap divides the aorta into two channels. The true lumen is usually the smaller, denser one; the false lumen is larger and fills more slowly. Which lumen feeds each branch matters.' },
    { id: 'ad-5', at: 51, dur: 12, hold: true, title: 'Malperfusion', apply: scene('dissectB', 'renal', 'presentation'),
      say: 'Compare the kidneys. The left one barely enhances: its artery arises from a false lumen that is not delivering blood. Malperfusion of a kidney, the bowel or a leg turns an uncomplicated type B into a complicated one.' },
    { id: 'ad-6', at: 64, dur: 10, hold: true, title: 'Into the iliacs', apply: scene('dissectB', 'bifurcation', 'presentation'),
      say: 'The flap continues into the left common iliac artery. Check the leg pulses and the groin: a cold, pulseless leg is another malperfusion sign.' },
    { id: 'ad-7', at: 75, dur: 12, hold: true, title: 'Rate first', apply: scene('dissectB', 'renal', 'betaBlocked'),
      say: 'Treatment starts with impulse control. A short-acting beta-blocker brings the heart rate to about sixty, reducing the force of each ejection on the torn wall. Watch the rate fall while the pressure is still high.' },
    { id: 'ad-8', at: 88, dur: 12, hold: true, title: 'Then the pressure', apply: scene('dissectB', 'renal', 'target'),
      say: 'Only then add a vasodilator to bring the systolic pressure below about one hundred and twenty, as far as perfusion allows: urine output, mental state and the malperfused organs set the floor.' },
    { id: 'ad-9', at: 101, dur: 12, hold: true, title: 'Why not the vasodilator first', apply: scene('dissectB', 'renal', 'vasodilatorAlone'),
      say: 'Give the vasodilator alone and the baroreflex answers with tachycardia and a harder, faster ejection — more shear on the flap. Beta-blockade before vasodilation.' },
    { id: 'ad-10', at: 114, dur: 11, hold: true, title: 'Who needs what', apply: scene('dissectA', 'chest', 'target'),
      say: 'Type A: control the pressure and get to cardiac surgery. Type B with rupture, malperfusion or uncontrollable pain: endovascular repair. Uncomplicated type B: impulse control, monitoring and repeat imaging.' },
  ],
};
