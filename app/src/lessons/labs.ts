/** Narrated lab lessons (data). Each step sets lab values / treatments on the shared patient. */
import type { DrugId } from '../physiology/patient';
export interface LabSetup { correct?: number; reset?: boolean; lab?: string; values?: Record<string, number>; drug?: DrugId; ff?: number; view?: 'body' | 'cell'; renal?: number; naMode?: 'acute' | 'chronic' }
export interface LabStep { id: string; title: string; say: string; setup?: LabSetup }
export interface LabLesson { id: string; title: string; level: string; blurb: string; steps: LabStep[] }

export const LAB_LESSONS: LabLesson[] = [
  { id: 'hyperk', title: 'Hyperkalaemia: stabilise, shift, remove', level: 'Intermediate', blurb: 'Why calcium works without touching the potassium.',
    steps: [
      { id: 'hk1', title: 'Potassium lives inside cells', setup: { reset: true, lab: 'k', values: { k: 4.2 }, view: 'cell', renal: 0.1 },
        say: 'Almost all the body’s potassium is inside cells, about one hundred and forty inside against four outside. The sodium potassium pump in the membrane keeps it that way. That steep ratio sets the resting membrane potential of every heart cell, about minus eighty five millivolts.' },
      { id: 'hk2', title: 'Raise the outside potassium', setup: { values: { k: 7.4 } },
        say: 'Now the kidneys have failed and plasma potassium is seven point four. The ratio across the membrane falls, so the resting potential rises toward the threshold. Look at the gap on the membrane gauge: it has shrunk. The ECG shows peaked T waves, flattened P waves and a widening QRS. The heart is close to an arrhythmia.' },
      { id: 'hk3', title: 'Step one: calcium', setup: { drug: 'calcium', ff: 3 },
        say: 'Give intravenous calcium. Watch the numbers carefully: the potassium has not changed at all. What changed is the threshold. Calcium moves the threshold potential up, away from the resting potential, and restores the safety gap. The QRS narrows within minutes. Calcium buys time: thirty to sixty minutes.' },
      { id: 'hk4', title: 'Step two: shift it into cells', setup: { drug: 'insulin', ff: 40 },
        say: 'Now insulin with dextrose. Insulin switches on the sodium potassium pump, so potassium moves from the blood back into the cells. Plasma potassium falls by around one. Nebulised salbutamol does the same through beta two receptors. But nothing has left the body.' },
      { id: 'hk5', title: 'The rebound', setup: { ff: 300 },
        say: 'Five hours later the insulin has worn off, the pumps have slowed, and potassium has leaked back out. This is the rebound. Shifting treatments are temporary. The potassium must be removed.' },
      { id: 'hk6', title: 'Step three: remove it', setup: { drug: 'dialysis', ff: 240 },
        say: 'Dialysis removes potassium from the body, and so do binders, and diuretics if the kidneys work. Stabilise, shift, remove: in that order, and repeat the ECG and the potassium.' },
    ] },
  { id: 'hypona', title: 'Hyponatraemia and the brain', level: 'Intermediate', blurb: 'Cell swelling, adaptation, and why speed of correction matters.',
    steps: [
      { id: 'hn1', title: 'Water follows solute', setup: { reset: true, lab: 'na', values: { na: 140 }, view: 'cell', naMode: 'acute' },
        say: 'Sodium is the main solute outside cells. Cell membranes let water through freely, so water moves until the concentration inside and outside is equal. Plasma sodium therefore sets the size of every cell, and the brain is the one organ that has no room to swell.' },
      { id: 'hn2', title: 'Acute hyponatraemia', setup: { values: { na: 118 } },
        say: 'Drop the sodium to one hundred and eighteen over a few hours, as happens with water intoxication or after surgery. Water rushes into brain cells and they swell. Inside the skull, that means headache, vomiting, seizures and eventually herniation. This is an emergency: a small bolus of hypertonic saline, raising the sodium by four to six, pulls water back out.' },
      { id: 'hn3', title: 'The brain adapts', setup: { naMode: 'chronic', values: { na: 118 }, ff: 2880 },
        say: 'If the sodium falls slowly, over days, brain cells export their own solutes, organic osmolytes, and shrink back to a normal size. This patient has the same sodium of one hundred and eighteen, but the brain cells are no longer swollen.' },
      { id: 'hn4', title: 'Correcting too fast', setup: { correct: 134 },
        say: 'Now correct that chronic hyponatraemia too quickly: sixteen in a day. The adapted brain cells cannot re-import their osmolytes fast enough, water is pulled out, and the myelin of the pons can be destroyed. Osmotic demyelination appears days later and may be permanent. Limit correction to about eight to ten in twenty four hours.' },
    ] },
  { id: 'anaemia', title: 'Anaemia: the oximeter cannot see it', level: 'Novice', blurb: 'Saturation versus content.',
    steps: [
      { id: 'an1', title: 'Normal blood', setup: { reset: true, lab: 'hb', values: { hb: 14 }, view: 'cell' },
        say: 'Here is a capillary full of red cells. Each one is packed with haemoglobin, and each haemoglobin is ninety seven percent saturated with oxygen. Oxygen content is about nineteen millilitres in every decilitre of blood.' },
      { id: 'an2', title: 'Half the red cells', setup: { values: { hb: 6.5 } },
        say: 'Now the haemoglobin is six and a half. There are half as many red cells, but each one is still fully saturated, so the pulse oximeter still reads ninety seven percent. The oxygen content has halved. The heart pumps faster to compensate and the tissues extract more, so venous saturation falls.' },
      { id: 'an3', title: 'Treat the content', setup: { drug: 'transfusion' },
        say: 'A unit of red cells raises the haemoglobin by about one gram per decilitre and restores content. Remember: a normal SpO₂ says the haemoglobin present is full, not that there is enough of it.' },
    ] },
  { id: 'lactate', title: 'Lactate: made and cleared', level: 'Intermediate', blurb: 'Why lactate rises — and why it falls.',
    steps: [
      { id: 'lc1', title: 'A balance', setup: { reset: true, lab: 'lac', view: 'cell' },
        say: 'Every cell makes some lactate, and the liver and kidneys clear it. A normal level of about one simply means production and clearance are matched.' },
      { id: 'lc2', title: 'Shock', setup: { values: {}, ff: 90 },
        say: 'Now cardiac output falls in shock. Tissues short of oxygen turn more glucose into lactate, and a poorly perfused liver clears less. Lactate climbs. Adrenaline and sepsis raise it further, even when oxygen delivery is adequate, by speeding glycolysis.' },
      { id: 'lc3', title: 'Resuscitation', setup: { ff: 180 },
        say: 'Restore perfusion and the balance reverses. Lactate falls over hours, as the liver clears it. A falling lactate is one of the best signs that resuscitation is working.' },
    ] },
];
