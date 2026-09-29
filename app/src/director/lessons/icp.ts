/**
 * ICP / herniation / EVD lesson on the neuro state: each cue sets the brain (haematoma volume or SAH
 * with hydrocephalus), the systemic MAP / PaCO₂ and the ICP treatments; the ICP card reads the pure
 * Monro–Kellie model from that state, so seeking is exact.
 */
import type { Timeline } from '../timeline';
import { useNeuroUI, presetState } from '../../neuro/neuroStore';
import { DEFAULT_SYSTEMIC, type Systemic } from '../../neuro/perfusion';
import { useIcpUI } from '../../neuro/icpStore';
import { ICP_DEFAULT, type IcpInput } from '../../neuro/icp';

function put(kind: 'none' | 'ich' | 'sah', o: { ml?: number; minutes?: number; sys?: Partial<Systemic>; icp?: Partial<IcpInput>; view?: '3d' | 'imaging'; target?: string } = {}) {
  const base = presetState(kind === 'none' ? 'none' : kind); const st = kind === 'ich' ? { ...base, minutes: o.minutes ?? 0, hemorrhage: { ...base.hemorrhage!, volumeMl: o.ml ?? 30 } } : { ...base, minutes: o.minutes ?? base.minutes };
  useNeuroUI.getState().set({ preset: kind === 'none' ? 'none' : kind, state: st, sys: { ...DEFAULT_SYSTEMIC, ...o.sys }, view: o.view ?? '3d', target: o.target ?? 'brain.whole', slice: 0.05 });
  useIcpUI.getState().set({ input: { ...ICP_DEFAULT, ...o.icp } });
}
export const ICP_LESSON: Timeline = {
  id: 'neuro-icp', title: 'ICP, herniation and the EVD', level: 'advanced', module: 'neuro', absolute: true,
  blurb: 'A closed box: how a growing mass is buffered and then isn’t, what CPP means, how herniation and the Cushing response look — and how head position, CO₂, osmotherapy, surgery and an EVD change the pressure.',
  setup: () => put('none'),
  cues: [
    { id: 'icp-1', at: 0, dur: 11, hold: true, title: 'A closed box', apply: () => put('none'),
      say: 'The skull holds brain, blood and cerebrospinal fluid. Its volume is fixed, so anything new — a haematoma, swelling, trapped fluid — has to be paid for by pushing something else out.' },
    { id: 'icp-2', at: 12, dur: 11, hold: true, title: 'Compensation', apply: () => put('ich', { ml: 20 }),
      say: 'A twenty millilitre haematoma. Cerebrospinal fluid moves down into the spinal canal and venous blood leaves the skull. The pressure barely moves: this is the flat part of the curve.' },
    { id: 'icp-3', at: 24, dur: 12, hold: true, title: 'Past the knee', apply: () => put('ich', { ml: 48 }),
      say: 'At about fifty millilitres the buffers are used up. Every extra millilitre now raises the pressure steeply. The waveform shows it too: the second peak rises above the first as the brain stiffens.' },
    { id: 'icp-4', at: 37, dur: 12, hold: true, title: 'Cerebral perfusion pressure', apply: () => put('ich', { ml: 48, sys: { map: 70 } }),
      say: 'Blood reaches the brain at the mean arterial pressure minus the intracranial pressure. Let the blood pressure fall to a mean of seventy and the perfusion pressure drops toward forty: ischaemia without any blocked artery.' },
    { id: 'icp-5', at: 50, dur: 13, hold: true, title: 'Uncal herniation', apply: () => put('ich', { ml: 54, view: 'imaging' }),
      say: 'More volume, and the midline shifts. The medial temporal lobe is pushed over the tentorial edge and compresses the third nerve: the pupil on the side of the mass dilates and stops reacting, the opposite limbs weaken and consciousness falls.' },
    { id: 'icp-6', at: 64, dur: 11, hold: true, title: 'The Cushing response', apply: () => put('ich', { ml: 58 }),
      say: 'When the brainstem itself is squeezed, the body drives the blood pressure up to keep perfusing it, the heart slows and breathing becomes irregular. This is late, and it means herniation is under way.' },
    { id: 'icp-7', at: 76, dur: 14, hold: true, title: 'Buy time', apply: () => put('ich', { ml: 54, sys: { paco2: 33 }, icp: { headUp: 30, osmoMl: 15 } }),
      say: 'Head up thirty degrees with the neck straight, so veins drain. Hyperosmolar therapy draws water out of the brain. A short period of lower carbon dioxide constricts the vessels — useful as a bridge, harmful if prolonged, because it cuts blood flow too.' },
    { id: 'icp-8', at: 91, dur: 10, hold: true, title: 'Remove the volume', apply: () => put('ich', { ml: 54, icp: { decompressed: true } }),
      say: 'The definitive answer is to remove the volume or open the box: evacuate the clot, or take off a piece of skull. The curve flattens and the pupils recover if it is in time.' },
    { id: 'icp-9', at: 102, dur: 12, hold: true, title: 'Hydrocephalus', apply: () => put('sah', { minutes: 180, icp: { hydrocephalus: true } }),
      say: 'A different cause: after subarachnoid haemorrhage, blood blocks the drainage of cerebrospinal fluid. The ventricles fill with fluid that is still being made, and the pressure rises without any midline shift.' },
    { id: 'icp-10', at: 115, dur: 13, hold: true, title: 'External ventricular drain', apply: () => put('sah', { minutes: 180, icp: { hydrocephalus: true, evd: { open: true, heightCm: 15, levelErrorCm: 0 } } }),
      say: 'An external ventricular drain, zeroed at the tragus — level with the foramen of Monro. Open at fifteen centimetres of water, fluid drains whenever the pressure exceeds that height, and the pressure settles there.' },
    { id: 'icp-11', at: 129, dur: 12, hold: true, title: 'Levelling errors', apply: () => put('sah', { minutes: 180, icp: { hydrocephalus: true, evd: { open: true, heightCm: 15, levelErrorCm: 15 } } }),
      say: 'Raise the head of the bed without moving the chamber and the drain is now effectively fifteen centimetres too low. It overdrains: the ventricles collapse and bridging veins can tear. Re-level every time the patient or the bed moves.' },
    { id: 'icp-12', at: 142, dur: 11, hold: true, title: 'Clamped', apply: () => put('sah', { minutes: 180, icp: { hydrocephalus: true, evd: { open: false, heightCm: 15, levelErrorCm: 0 } } }),
      say: 'Left clamped after a transfer, nothing drains and the pressure climbs back. Clamp only for the time the protocol allows, and read the pressure against the patient, not the clock.' },
  ],
};
