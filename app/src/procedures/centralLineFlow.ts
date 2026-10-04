/**
 * Ultrasound-guided IJ central line as a workflow (Seldinger) and a Director lesson. The learner's
 * choices drive the pure neck model in `clStore`; the vessel check uses the Lines patient's pressures.
 * Teaching sequence in our own words; follow local policy and supervision requirements.
 */
import type { Workflow } from '../workflows/workflow';
import type { Timeline } from '../director/timeline';
import { lines } from '../lines/session';
import { useCl, setCl } from './clStore';
import { CL_DEFAULT, clState, type ClInput } from './centralLine';

const reset = (p: Partial<ClInput> = {}) => useCl.getState().set({ input: { ...CL_DEFAULT, advance: 0, ...p }, wire: 'none', dilated: false });
const passWire = () => { const t = clState(useCl.getState().input).tipIn; useCl.getState().set({ wire: t === 'ij' ? 'inVein' : t === 'carotid' ? 'inArtery' : 'none' }); };

export const CENTRAL_LINE: Workflow = {
  id: 'wf-central-line', module: 'lines', level: 'advanced',
  title: 'Ultrasound-guided internal jugular line',
  blurb: 'Scan, compress, keep the tip in view, confirm the vein by pressure — and see the wire in the vein before anything is dilated.',
  context: 'Septic shock on norepinephrine through a peripheral cannula. You are placing a right internal jugular central line with ultrasound. The patient is flat.',
  setup: () => { lines.load('sepsis'); reset({ trendelenburg: false }); },
  steps: [
    { id: 'prep', label: 'Indication, consent and time-out; full sterile barrier precautions', why: 'Maximal barrier precautions and skin antisepsis are the core of preventing line infection.' },
    { id: 'position', label: 'Head-down tilt, head turned slightly away', why: 'Tilt distends the vein and lowers the risk of air entry. Excessive head rotation pushes the IJ over the carotid.' },
    { id: 'scan', label: 'Scan in short axis: identify IJ and carotid, compress, check for thrombus', why: 'The vein collapses under light pressure and the artery stays round and pulsatile. A vein that does not compress may contain thrombus.', critical: true },
    { id: 'needle', label: 'Needle under real-time guidance, sliding the probe to keep the TIP in view, aspirating', why: 'Out of plane, the bright dot is wherever the needle crosses the beam — slide the probe with the tip so the dot is the tip.', critical: true },
    { id: 'confirm', label: 'Dark, non-pulsatile flash — confirm venous by transducing or a manometer column', why: 'Colour lies in shocked, hypoxic patients. A venous pressure (CVP-range, no arterial waveform) is the check.' },
    { id: 'wire', label: 'Pass the wire smoothly, never against resistance; watch the ECG for ectopy', why: 'Ectopy means the wire is in the heart — withdraw a little.' },
    { id: 'wireSeen', label: 'See the wire in the IJ in short AND long axis before dilating', why: 'A wire in the carotid looks the same from the outside. Dilating an artery is the injury that matters; seeing the wire in the vein prevents it.', critical: true },
    { id: 'dilate', label: 'Skin nick, dilate over the wire only to the depth of the vessel', why: 'The dilator is stiff; pushed deeper than the vessel it can tear the back wall.' },
    { id: 'catheter', label: 'Catheter over the wire — keep hold of the wire at all times', why: 'A released wire can be lost into the circulation.', critical: true },
    { id: 'remove', label: 'Remove the wire and see that it is intact; aspirate and flush every lumen', why: 'Count the wire out; blood from every lumen confirms each port is intravascular.' },
    { id: 'finish', label: 'Secure, dress; confirm tip position and exclude pneumothorax before use', why: 'Chest X-ray or ultrasound per local practice. Then the vasopressor can move to the central line.' },
  ],
  distractors: [
    { id: 'blind', label: 'Advance until you get a flash, even though the tip is out of view', why: 'The screen showed the shaft; the tip went through the back wall. Blind depth is how the carotid and the pleura get hit.', critical: true },
    { id: 'colour', label: 'Dark blood, so it must be venous — dilate', why: 'Arterial blood can be dark in shock and hypoxaemia. Confirm by pressure and by seeing the wire in the vein.', critical: true },
    { id: 'letgo', label: 'Let go of the wire to pick up the catheter', why: 'Lost guidewire — an embolised foreign body.', critical: true },
    { id: 'flat', label: 'Keep the patient flat for comfort', why: 'A flat or head-up patient has a smaller vein and a higher risk of air embolism.' },
  ],
  effects: {
    position: () => setCl({ trendelenburg: true }),
    scan: () => setCl({ compress: 0.6 }),
    needle: () => setCl({ compress: 0, track: true, aimX: -0.6, angle: 45, advance: 2.2 }),
    wire: passWire,
    wireSeen: () => setCl({ axis: 'long', plane: 'in' }),
    dilate: () => useCl.getState().set({ dilated: true }),
    blind: () => setCl({ compress: 0, track: false, aimX: -0.6, advance: 3.4 }),
  },
  debrief: 'Ultrasound makes the IJ safer only if the tip is seen: scan and compress, keep the tip in view, confirm the vein by pressure, and see the wire in the vein in two planes before any dilator goes in.',
};

const C = (p: Partial<ClInput>, wire: 'none' | 'inVein' | 'inArtery' = 'none') => () => useCl.getState().set({ input: { ...CL_DEFAULT, advance: 0, ...p }, wire, dilated: false });
export const CENTRAL_LINE_LESSON: Timeline = {
  id: 'lines-cvc', title: 'Ultrasound-guided IJ: seeing the tip', level: 'advanced', module: 'lines', absolute: true,
  blurb: 'Vein versus artery, compression, the out-of-plane trap where the dot is the shaft, walking the tip, long axis, the wrong vessel and the wire check.',
  setup: () => { if (lines.sc.id !== 'sepsis') lines.load('sepsis'); C({ trendelenburg: false })(); },
  cues: [
    { id: 'cvc-1', at: 0, dur: 11, hold: true, title: 'Short axis', apply: C({ trendelenburg: false }),
      say: 'Transverse view of the right side of the neck, lateral on the left of the screen. Two black circles: the internal jugular vein, lateral and superficial, under the sternocleidomastoid — and the carotid artery, medial and deeper, with a thick bright wall.' },
    { id: 'cvc-2', at: 12, dur: 10, hold: true, title: 'Compress', apply: C({ trendelenburg: false, compress: 0.7 }),
      say: 'Press gently. The vein flattens and disappears; the artery stays round and keeps pulsing. If the vein will not compress, think thrombus.' },
    { id: 'cvc-3', at: 23, dur: 11, hold: true, title: 'Fill the vein', apply: C({ trendelenburg: true }),
      say: 'Tilt head-down and the vein grows. In a hypovolaemic patient it is small and soft, and it collapses in front of the needle.' },
    { id: 'cvc-4', at: 35, dur: 13, hold: true, title: 'The out-of-plane trap', apply: C({ track: false, advance: 3.4 }),
      say: 'Out of plane the beam is a thin slice. The bright dot is wherever the needle crosses it — here the shaft, at the front of the vein. The side view shows the truth: the tip is well over a centimetre deeper, already through the back wall.' },
    { id: 'cvc-5', at: 49, dur: 12, hold: true, title: 'Walk the tip', apply: C({ track: true, advance: 2.2 }),
      say: 'Instead, slide the probe with the needle so the dot you see is the tip. Advance a little, find the tip, advance again — until it sits in the middle of the vein and dark blood fills the syringe.' },
    { id: 'cvc-6', at: 62, dur: 11, hold: true, title: 'Long axis, in plane', apply: C({ axis: 'long', plane: 'in', advance: 2.2 }),
      say: 'Turn to long axis with the needle in plane and the whole shaft and tip are visible entering the vein. Harder to hold steady, but no guessing about depth.' },
    { id: 'cvc-7', at: 74, dur: 13, hold: true, title: 'The wrong vessel', apply: C({ aimX: 0.85, advance: 2.8 }),
      say: 'Aim too medially and the needle finds the carotid. Do not trust colour — in shock and hypoxaemia arterial blood can look dark. A pulsatile flow and an arterial pressure on the transducer settle it. Remove the needle and compress.' },
    { id: 'cvc-8', at: 88, dur: 11, hold: true, title: 'When the vein lies on the artery', apply: C({ variant: 'overlying', aimX: 0.6, track: false, advance: 3.5 }),
      say: 'Turn the head too far and the vein rolls over the artery. A needle that goes through both walls of the vein arrives in the carotid. Keep the tip in view.' },
    { id: 'cvc-9', at: 100, dur: 12, hold: true, title: 'See the wire', apply: C({ track: true, advance: 2.2 }, 'inVein'),
      say: 'Before any dilator: find the wire as a bright echo inside the vein, in short axis and again in long axis. Only then dilate — to the depth of the vessel, never beyond — and keep hold of the wire until the catheter is in.' },
  ],
};
