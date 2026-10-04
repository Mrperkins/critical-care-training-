/**
 * Abdominal lessons on the ONE abdominal state. Every cue sets the base condition + minutes (the
 * state on screen is the pure `evolve(base, minutes)`), the view (3D or ultrasound) and the camera,
 * so seeking is exact.
 */
import type { Timeline } from '../timeline';
import { useAbdUI, ABD_PRESETS, type AbdPreset, type AbdView } from '../../abdomen/abdomenStore';
import type { AbdomenState } from '../../abdomen/state';

const make = (id: AbdPreset, p: Partial<AbdomenState> = {}): AbdomenState => ({ ...ABD_PRESETS.find((x) => x.id === id)!.make(), ...p });
const put = (preset: AbdPreset, minutes: number, view: AbdView, target: string, p: Partial<AbdomenState> = {}) =>
  useAbdUI.getState().set({ preset, base: make(preset, p), minutes, view, target });

export const FAST_LESSON: Timeline = {
  id: 'abd-fast', title: 'FAST: where free blood goes — and what it misses', level: 'core', module: 'abdomen', absolute: true,
  blurb: 'Watch intraperitoneal blood collect in Morison’s pouch, the splenorenal space and the pelvis, see the same state as bedside ultrasound, and meet the bleed FAST cannot see.',
  setup: () => put('normal', 0, '3d', 'abdomen.whole'),
  cues: [
    { id: 'fast-1', at: 0, dur: 10, hold: true, target: 'abdomen.whole', title: 'Four places to look', apply: () => put('normal', 0, '3d', 'abdomen.whole'),
      say: 'Lying flat, free fluid in the abdomen runs to the lowest spaces: between the liver and the right kidney, around the spleen, and down into the pelvis. The FAST exam puts a probe over each of those, plus under the ribs to see the pericardium.' },
    { id: 'fast-2', at: 11, dur: 10, hold: true, title: 'A normal FAST', apply: () => put('normal', 0, 'us', 'abdomen.whole'),
      say: 'This is the same normal abdomen as ultrasound. Liver sits against kidney, spleen against kidney, the bladder is black because urine reflects no echoes, and the pericardium hugs the heart. No black stripe anywhere.' },
    { id: 'fast-3', at: 22, dur: 11, hold: true, title: 'Too early to see', apply: () => put('liver3', 2, 'us', 'abdomen.ruq'),
      say: 'A liver laceration two minutes after the crash. Blood is already leaking, but a few tens of millilitres spread thinly and every window still looks negative. An early negative scan does not rule out injury: repeat it.' },
    { id: 'fast-4', at: 34, dur: 11, hold: true, title: 'Morison’s pouch lights up first', apply: () => put('liver3', 11, 'us', 'abdomen.ruq'),
      say: 'A few minutes later a black stripe opens between liver and kidney. The hepatorenal space is the most dependent upper-abdominal space when supine, so the right upper quadrant is usually positive first.' },
    { id: 'fast-5', at: 46, dur: 9, hold: true, target: 'abdomen.ruq', title: 'The same blood in 3D', apply: () => put('liver3', 11, '3d', 'abdomen.ruq'),
      say: 'In the anatomy the pool sits exactly where the probe was looking: tucked behind the liver, in front of the right kidney.' },
    { id: 'fast-6', at: 56, dur: 11, hold: true, target: 'abdomen.luq', title: 'Spleen: look above it too', apply: () => put('spleen4', 20, '3d', 'abdomen.luq'),
      say: 'A grade four splenic injury. On the left, blood collects around the spleen and under the diaphragm before it reaches the kidney, so the left window must include the space above the spleen.' },
    { id: 'fast-7', at: 68, dur: 16, hold: true, title: 'Minutes matter', apply: () => put('spleen4', 30, 'us', 'abdomen.whole'),
      tween: (u) => put('spleen4', 30 + 90 * u, 'us', 'abdomen.whole'),
      say: 'Untreated, the bleed keeps going. Watch the left stripe widen, the right upper quadrant and then the pelvis fill, and the haemorrhage class climb in the side panel. Blood pressure holds until a third or more of the blood volume is gone.' },
    { id: 'fast-8', at: 85, dur: 12, hold: true, target: 'abdomen.retroperitoneum', title: 'The bleed FAST cannot see', apply: () => put('aaaContained', 60, '3d', 'abdomen.retroperitoneum'),
      say: 'A different patient: an aneurysm has ruptured into the retroperitoneum, behind the lining of the abdomen. More than a litre is lost, yet not a drop is free in the peritoneal cavity.' },
    { id: 'fast-9', at: 98, dur: 11, hold: true, title: 'Negative FAST, unstable patient', apply: () => put('aaaContained', 60, 'us', 'abdomen.aorta'),
      say: 'Every FAST window is negative. The clue is elsewhere: a wide aorta on the separate aortic view, back or flank pain, and shock with no free fluid. Pelvic fractures and kidney injuries bleed into the same hidden space.' },
    { id: 'fast-10', at: 110, dur: 10, hold: true, title: 'Reading a FAST', apply: () => put('spleen4', 60, 'us', 'abdomen.whole'),
      say: 'Positive in a shocked trauma patient: the abdomen is a likely source. Negative: not proof of safety — it may be early, the fluid may be retroperitoneal, or the view may be poor. Repeat it when the patient changes.' },
  ],
};

export const AAA_LESSON: Timeline = {
  id: 'abd-aaa', title: 'Abdominal aortic aneurysm: intact, contained, free rupture', level: 'advanced', module: 'abdomen', absolute: true,
  blurb: 'Size and rupture risk, why a contained rupture can look deceptively stable, what free rupture does to FAST and to the haemorrhage class.',
  setup: () => put('normal', 0, '3d', 'abdomen.aorta'),
  cues: [
    { id: 'aaa-1', at: 0, dur: 9, hold: true, target: 'abdomen.aorta', title: 'A normal aorta', apply: () => put('normal', 0, '3d', 'abdomen.aorta'),
      say: 'The abdominal aorta below the renal arteries is normally about two centimetres wide. An aneurysm is a permanent widening to three centimetres or more.' },
    { id: 'aaa-2', at: 10, dur: 12, hold: true, target: 'abdomen.aorta', title: 'Growing', apply: () => put('aaa6', 0, '3d', 'abdomen.aorta', { aaa: { diameterCm: 3, rupture: 'none' } }),
      tween: (u) => put('aaa6', 0, '3d', 'abdomen.aorta', { aaa: { diameterCm: 3 + 3 * u, rupture: 'none' } }),
      say: 'Aneurysms grow slowly, often silently. Wall tension rises with radius, so the wider it gets the faster it tends to grow and the higher the rupture risk; above about five and a half centimetres repair usually outweighs the risk of waiting.' },
    { id: 'aaa-3', at: 23, dur: 10, hold: true, title: 'On ultrasound', apply: () => put('aaa6', 0, 'us', 'abdomen.aorta'),
      say: 'A transverse bedside scan measures it outer wall to outer wall. Much of the sac is lined with grey thrombus; the flowing lumen is the smaller black circle inside.' },
    { id: 'aaa-4', at: 34, dur: 12, hold: true, target: 'abdomen.retroperitoneum', title: 'Contained rupture', apply: () => put('aaaContained', 0, '3d', 'abdomen.retroperitoneum'),
      say: 'Sudden back or flank pain and a faint. The sac has torn at the back, into the retroperitoneum, where the surrounding tissue can tamponade it for a while.' },
    { id: 'aaa-5', at: 47, dur: 14, hold: true, target: 'abdomen.retroperitoneum', title: 'Deceptively stable', apply: () => put('aaaContained', 0, '3d', 'abdomen.retroperitoneum'),
      tween: (u) => put('aaaContained', 90 * u, '3d', 'abdomen.retroperitoneum'),
      say: 'The haematoma grows behind the peritoneum. Heart rate climbs while pressure is still near normal. This window is the chance to get the patient to repair.' },
    { id: 'aaa-6', at: 62, dur: 11, hold: true, title: 'FAST stays negative', apply: () => put('aaaContained', 90, 'us', 'abdomen.aorta'),
      say: 'The FAST windows are black-stripe free, because none of this blood is intraperitoneal. The aortic view shows the wide sac with a dark cuff of haematoma beside it.' },
    { id: 'aaa-7', at: 74, dur: 12, hold: true, title: 'Free rupture', apply: () => put('aaaFree', 5, 'us', 'abdomen.whole'),
      tween: (u) => put('aaaFree', 5 + 20 * u, 'us', 'abdomen.whole'),
      say: 'If the tear opens into the peritoneal cavity there is nothing left to contain it. Within minutes every FAST window fills and the patient moves to class four haemorrhage.' },
    { id: 'aaa-8', at: 87, dur: 11, hold: true, target: 'abdomen.whole', title: 'What changes outcome', apply: () => put('aaaFree', 25, '3d', 'abdomen.whole'),
      say: 'Outcome depends on control of the aorta, in the operating theatre or the endovascular suite. Many teams accept a lower blood pressure while the patient stays conscious, to avoid pushing more blood out of the hole before it is controlled.' },
  ],
};
export const ABDOMEN_LESSONS: Timeline[] = [FAST_LESSON, AAA_LESSON];
