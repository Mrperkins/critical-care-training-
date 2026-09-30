/**
 * More abdominal lessons on the ONE abdominal state (pure `evolve(base, minutes)`): solid-organ injury and the
 * response to blood, mesenteric ischaemia, and obstruction / perforation. Every cue sets base + minutes + view +
 * CT level, so seeking is exact. Narration is this app's own wording.
 */
import type { Timeline } from '../timeline';
import { useAbdUI, ABD_PRESETS, type AbdPreset, type AbdView } from '../../abdomen/abdomenStore';
import { useCtaUI } from '../../abdomen/ctaStore';
import type { CtaLevel } from '../../abdomen/cta';
import type { AbdomenState } from '../../abdomen/state';

const put = (preset: AbdPreset, minutes: number, view: AbdView, target: string, p: Partial<AbdomenState> = {}, level?: CtaLevel) => () => {
  useAbdUI.getState().set({ preset, base: { ...ABD_PRESETS.find((x) => x.id === preset)!.make(), ...p }, minutes, view, target }); if (level) useCtaUI.getState().set(level);
};

export const SOLID_ORGAN_LESSON: Timeline = {
  id: 'abd-solid-organ', title: 'Spleen and liver injury: the response to blood decides', level: 'intermediate', module: 'abdomen', absolute: true,
  blurb: 'Stable low-grade injuries, high-grade bleeds, and how responders, transient responders and non-responders to the first litre of blood sort who needs embolisation or the operating room.',
  setup: put('normal', 60, '3d', 'abdomen.luq', { injury: { spleen: 2 } }),
  cues: [
    { id: 'so-1', at: 0, dur: 13, hold: true, target: 'abdomen.luq', title: 'Low grade, stable', apply: put('normal', 60, '3d', 'abdomen.luq', { injury: { spleen: 2 } }),
      say: 'A grade two splenic laceration an hour after a fall. There is blood around the spleen and the FAST is positive, but the heart rate and pressure are normal and the bleeding has slowed. Stable patients like this usually get a CT and are managed without an operation, with close observation.' },
    { id: 'so-2', at: 14, dur: 12, hold: true, title: 'High grade', apply: put('spleen4', 30, 'us', 'abdomen.whole'),
      say: 'A grade four injury bleeds faster. Thirty minutes in, three FAST windows are positive and she is in class two shock: the heart rate is up, the pressure still normal.' },
    { id: 'so-3', at: 27, dur: 12, hold: true, title: 'Give blood, and watch', apply: put('spleen4', 30, '3d', 'abdomen.luq', { transfusedMl: 1000 }),
      say: 'A litre of blood restores her circulating volume and the heart rate settles, for now. The blood already in the abdomen stays there. How she responds over the next half hour sorts patients into three groups.' },
    { id: 'so-4', at: 40, dur: 13, hold: true, title: 'A transient responder', apply: put('spleen4', 75, '3d', 'abdomen.luq', { transfusedMl: 1000 }),
      say: 'Forty five minutes later she has bled the transfused blood away and the class is climbing again. A transient responder is still bleeding: she needs haemorrhage control, by angioembolisation if it is immediately available and she is safe to go there, otherwise the operating room.' },
    { id: 'so-5', at: 54, dur: 13, hold: true, target: 'abdomen.ruq', title: 'A non-responder', apply: put('normal', 90, '3d', 'abdomen.ruq', { injury: { liver: 5 }, transfusedMl: 1000 }),
      say: 'A grade five liver injury. An hour and a half in, a litre of blood has made no difference: she is in class three shock. No response means an operation now, with damage control surgery, packing and a massive transfusion protocol.' },
    { id: 'so-6', at: 68, dur: 12, hold: true, title: 'Control stops the clock', apply: put('spleen4', 120, 'us', 'abdomen.whole', { transfusedMl: 1500, controlledAt: 60 }),
      say: 'Once the bleeding is controlled, the loss stops growing. The fluid in the abdomen is still there on ultrasound, but transfusion can finally catch up, and the haemorrhage class falls.' },
  ],
};

export const MESENTERIC_LESSON: Timeline = {
  id: 'abd-mesenteric', title: 'Acute mesenteric ischaemia: pain out of proportion', level: 'advanced', module: 'abdomen', absolute: true,
  blurb: 'An embolus to the superior mesenteric artery: the soft abdomen, the CT angiogram, the hours to infarction, and why a normal lactate does not rule it out.',
  setup: put('normal', 0, '3d', 'abdomen.bowel', { ischaemia: 0.05 }),
  cues: [
    { id: 'me-1', at: 0, dur: 13, hold: true, target: 'abdomen.bowel', title: 'Pain out of proportion', apply: put('normal', 0, '3d', 'abdomen.bowel', { ischaemia: 0.05 }),
      say: 'A seventy eight year old with atrial fibrillation and sudden, severe central abdominal pain. The abdomen is soft and hardly tender. Pain out of proportion to the examination is the classic early sign, and the bowel still looks normal.' },
    { id: 'me-2', at: 14, dur: 12, hold: true, title: 'An embolus in the artery', apply: put('normal', 60, 'cta', 'abdomen.bowel', { ischaemia: 0.05 }, 'renal'),
      say: 'A clot from the fibrillating left atrium has lodged in the superior mesenteric artery, which supplies most of the small bowel. On the CT angiogram the artery, just in front of the aorta, does not fill with contrast.' },
    { id: 'me-3', at: 27, dur: 12, hold: true, title: 'The wall stops enhancing', apply: put('normal', 200, 'cta', 'abdomen.bowel', { ischaemia: 0.05 }, 'renal'),
      say: 'Hours later the small bowel wall stops enhancing. Early in the course the lactate can still be normal, so a normal lactate does not rule this out.' },
    { id: 'me-4', at: 40, dur: 13, hold: true, target: 'abdomen.bowel', title: 'Infarction', apply: put('normal', 360, '3d', 'abdomen.bowel', { ischaemia: 0.05 }),
      say: 'Once the bowel infarcts it turns dusky, gas appears in its wall, the lining sloughs, and bacteria and toxins reach the blood. Peritonitis, acidosis and shock follow, and the abdomen finally becomes tender.' },
    { id: 'me-5', at: 54, dur: 12, hold: true, title: 'The CT at infarction', apply: put('normal', 360, 'cta', 'abdomen.bowel', { ischaemia: 0.05 }, 'infrarenal'),
      say: 'On CT, gas now lies in the bowel wall. The treatment is time: urgent revascularisation, by embolectomy or an endovascular route, resection of dead bowel, fluids, antibiotics and anticoagulation. Every hour of delay costs bowel.' },
  ],
};

export const OBSTRUCTION_LESSON: Timeline = {
  id: 'abd-obstruction', title: 'Bowel obstruction and perforation', level: 'core', module: 'abdomen', absolute: true,
  blurb: 'Dilated loops and air–fluid levels, the fluid lost into the gut, then free air: what obstruction and perforation look like in the anatomy, on CT and on ultrasound.',
  setup: put('sbo', 30, '3d', 'abdomen.bowel'),
  cues: [
    { id: 'sb-1', at: 0, dur: 12, hold: true, target: 'abdomen.bowel', title: 'Small-bowel obstruction', apply: put('sbo', 30, '3d', 'abdomen.bowel'),
      say: 'Small bowel obstruction, most often from adhesions after previous surgery, or a hernia. Above the block the bowel dilates with fluid and gas, she vomits, and the abdomen distends.' },
    { id: 'sb-2', at: 13, dur: 12, hold: true, title: 'On CT', apply: put('sbo', 30, 'cta', 'abdomen.bowel', {}, 'infrarenal'),
      say: 'On CT the loops are wide and full of fluid, with gas floating on top: air fluid levels. Surgeons look for the transition point, where dilated bowel meets collapsed bowel, and for signs that the blood supply is failing.' },
    { id: 'sb-3', at: 26, dur: 12, hold: true, target: 'abdomen.bowel', title: 'Where the fluid goes', apply: put('sbo', 30, '3d', 'abdomen.bowel'),
      say: 'Litres of fluid are trapped in the bowel wall and lumen, or lost as vomit. She becomes dry, with a rising heart rate and falling urine output. Decompress with a nasogastric tube, replace the fluid, and watch for strangulation.' },
    { id: 'sb-4', at: 39, dur: 12, hold: true, target: 'abdomen.diaphragm', title: 'Perforation', apply: put('perforation', 30, '3d', 'abdomen.diaphragm'),
      say: 'Perforation: a hole in the gut lets air and bowel content into the peritoneum. Lying flat, the air rises to the front of the abdomen; sitting up, it collects under the diaphragm.' },
    { id: 'sb-5', at: 52, dur: 13, hold: true, title: 'Free air on ultrasound', apply: put('perforation', 30, 'us', 'abdomen.whole'),
      say: 'On ultrasound, free air makes a bright line with reverberations that hides what lies behind it, over the liver in the upper abdomen. The fluid in these windows is not blood but gut content, so a positive scan here means peritonitis, not haemorrhage.' },
    { id: 'sb-6', at: 66, dur: 12, hold: true, title: 'Free air on CT', apply: put('perforation', 30, 'cta', 'abdomen.whole', {}, 'celiac'),
      say: 'On CT the air sits in front of the liver and bowel, outside the gut. Perforation with peritonitis needs resuscitation, antibiotics and an operation.' },
  ],
};
export const ABDOMEN_LESSONS_2: Timeline[] = [SOLID_ORGAN_LESSON, MESENTERIC_LESSON, OBSTRUCTION_LESSON];
