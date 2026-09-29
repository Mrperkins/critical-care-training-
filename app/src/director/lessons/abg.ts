/**
 * Blood-gas signature lessons on the ABG engine (AbgLab, the shared SyntheticPatient). Every cue
 * rebuilds from a preset load, then applies causes and fast-forwards a fixed time: exact seek.
 */
import type { Timeline } from '../timeline';
import { lab } from '../../abg/lab';
import { useUI } from '../../app/store';
import { useAbgUI } from '../../abg/abgStore';
import type { DrugId } from '../../physiology/patient';

interface AbgScene { preset: string; metab?: number; vent?: { rr: number; vt: number }; drugs?: DrugId[]; ff?: number; /** treatment sequence: a drug id, or minutes to fast-forward */ seq?: (DrugId | number)[]; station?: string; knobs?: Partial<Record<'drive' | 'fio2', number>> }
export function abgScene(s: AbgScene) {
  lab.load(s.preset);
  if (s.knobs) for (const [k, v] of Object.entries(s.knobs)) lab.set(k as never, v as number);
  if (s.metab != null) lab.setMetab(s.metab);
  if (s.vent) lab.setVent(s.vent.rr, s.vent.vt);
  for (const d of s.drugs ?? []) lab.give(d);
  if (s.ff) lab.fastForward(s.ff);
  for (const x of s.seq ?? []) { if (typeof x === 'number') lab.fastForward(x); else lab.give(x); }
  if (s.station) useAbgUI.getState().set({ station: s.station as never });
  useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
}
const at = (s: AbgScene) => () => abgScene(s);

export const ACIDOSIS_LESSON: Timeline = {
  id: 'abg-resp-vs-metabolic', title: 'Respiratory vs metabolic acidosis', level: 'core', module: 'abg',
  blurb: 'Same pH, different problem: CO₂ that is not being blown off versus bicarbonate that is being used up — and how the lungs and kidneys each try to compensate.',
  setup: at({ preset: 'normal' }),
  cues: [
    { id: 'ac-1', at: 0, dur: 10, hold: true, title: 'Two buffers, two organs', apply: at({ preset: 'normal' }),
      say: 'pH is set by the ratio of bicarbonate to carbon dioxide. The lungs control carbon dioxide within minutes; the kidneys control bicarbonate over days. Normal: pH seven point four, PaCO2 forty, bicarbonate twenty-four.' },
    { id: 'ac-2', at: 11, dur: 11, hold: true, title: 'Acute respiratory acidosis', apply: at({ preset: 'opioid' }),
      say: 'An opioid overdose. Breathing slows, carbon dioxide accumulates, and the pH falls. Bicarbonate barely moves — about one for every ten of CO2 — because the kidneys have not had time. Watch the end-tidal CO2 and the respiratory rate: the cause is on the monitor.' },
    { id: 'ac-3', at: 23, dur: 11, hold: true, title: 'Chronic: the kidneys catch up', apply: at({ preset: 'opioid', ff: 3 * 24 * 60 }),
      say: 'Leave the same hypoventilation for three days. The kidneys retain bicarbonate — about four for every ten of CO2 — and the pH climbs back toward normal while the CO2 stays high. That is renal compensation, and it takes days.' },
    { id: 'ac-4', at: 35, dur: 11, hold: true, title: 'Metabolic acidosis', apply: at({ preset: 'normal', metab: -12, ff: 30 }),
      say: 'Now a metabolic acidosis: twelve millimoles of acid added, bicarbonate used up to buffer it. Within minutes the lungs respond — deeper, faster breathing lowers the CO2. Expected PaCO2 is one and a half times the bicarbonate plus eight, give or take two.' },
    { id: 'ac-5', at: 47, dur: 11, hold: true, title: 'When the lungs cannot compensate', apply: at({ preset: 'normal', metab: -12, vent: { rr: 12, vt: 0.45 }, ff: 30 }),
      say: 'Put the same patient on a ventilator set to a normal minute ventilation. The compensation is taken away: CO2 rises back toward forty and the pH drops sharply. A metabolic acidosis on the ventilator needs a higher minute ventilation, not a normal one.' },
    { id: 'ac-6', at: 59, dur: 11, hold: true, title: 'Reading the pattern', apply: at({ preset: 'normal', metab: -12, ff: 30 }),
      say: 'First the pH: acid or alkaline. Then which value explains it: a high CO2 is respiratory, a low bicarbonate is metabolic. Then check the other value: is the compensation what you expect? If not, there is a second process.' },
  ],
};

export const DKA_LESSON: Timeline = {
  id: 'abg-dka', title: 'DKA: acid, water and potassium', level: 'advanced', module: 'abg',
  blurb: 'Insulin deficiency → ketoacids and an anion gap; glucose → osmotic diuresis and volume loss; a high potassium hiding a total-body deficit; treatment in the right order.',
  setup: at({ preset: 'dka' }),
  cues: [
    { id: 'dka-1', at: 0, dur: 11, hold: true, title: 'No insulin', apply: at({ preset: 'dka' }),
      say: 'Without insulin, cells cannot take up glucose, so the liver makes more and fat is broken down. Fatty acids are turned into ketoacids. Glucose is over five hundred; the patient is vomiting and breathing deeply.' },
    { id: 'dka-2', at: 12, dur: 11, hold: true, title: 'An anion-gap acidosis', say: 'Ketoacids use up bicarbonate. The unmeasured ketone anions widen the anion gap. The lungs compensate with Kussmaul breathing, driving the CO2 down.' },
    { id: 'dka-3', at: 24, dur: 11, hold: true, title: 'Osmotic diuresis', say: 'Glucose spills into the urine and drags water and sodium with it. By the time the patient arrives, several litres have been lost, and the kidneys are underperfused.' },
    { id: 'dka-4', at: 36, dur: 12, hold: true, title: 'Potassium: high in the blood, low in the body', say: 'Plasma potassium is high, because acidosis and the lack of insulin push potassium out of cells. But the diuresis has been washing it out for days: total-body potassium is low. Insulin will reveal the deficit.' },
    { id: 'dka-5', at: 49, dur: 11, hold: true, title: 'Fluids first', apply: at({ preset: 'dka', drugs: ['fluids', 'fluids'], ff: 60 }),
      say: 'The first treatment is fluid. Volume restores perfusion and lets the kidneys clear glucose and ketones.' },
    { id: 'dka-6', at: 61, dur: 12, hold: true, title: 'Insulin — and watch the potassium', apply: at({ preset: 'dka', seq: ['fluids', 'fluids', 60, 'insulin', 120, 'insulin', 60] }),
      say: 'Insulin stops ketone production and moves potassium back into the cells. Glucose and the anion gap fall — and so does potassium, often below normal. Check it before insulin, and replace it: if potassium is low, give potassium first.' },
    { id: 'dka-7', at: 74, dur: 10, hold: true, title: 'Close the gap', apply: at({ preset: 'dka', seq: ['fluids', 'fluids', 60, 'insulin', 120, 'insulin', 120, 'insulin', 120, 'insulin', 120, 'insulin', 120] }),
      say: 'Keep the insulin infusion running until the anion gap closes, adding dextrose as glucose falls. The glucose normalises long before the acidosis does.' },
  ],
};
export const ABG_TIMELINES: Timeline[] = [ACIDOSIS_LESSON, DKA_LESSON];
