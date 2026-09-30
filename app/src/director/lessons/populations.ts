/**
 * Special-population lessons on the existing engines: apnoea oxygen stores (ABG patient + apnoea model),
 * the child's airway (Poiseuille card + the vent engine with smaller tubes), newborn transition and PPHN
 * (two-circuit heart model on the newborn scale), and pregnancy (ABG patient; Lines circulation). Every cue
 * rebuilds its state from scratch, so seeking is exact. Narration is this app's own wording.
 */
import type { Timeline } from '../timeline';
import { abgScene } from './abg';
import { scene as ventScene } from './vent';
import { shockScene } from './lines';
import { ettScenarioId } from '../../scenarios/vent';
import { useHeartUI } from '../../heart/heartStore';
import type { ShuntInput } from '../../heart/shunt';
import { NEO } from '../../populations/neonatal';
import { pphParams } from '../../populations/obstetric';
import { setApnoea, setAirway, setNeo, setOb } from '../../populations/popStore';

/* ------------------------------------------------------------------ apnoea (Blood gas module) */
const ap = (shown: string[], highlight: string | null, preox = true, headUp = false, preset = 'normal') => () => { abgScene({ preset }); setApnoea({ shown, highlight, preox, headUp }); };
export const APNOEA_LESSON: Timeline = {
  id: 'pop-apnoea', title: 'Apnoea: how long the oxygen lasts — child, newborn, pregnancy', level: 'core', module: 'abg',
  blurb: 'Why pre-oxygenation matters, why saturation falls off a cliff, and why children, infants, pregnant and obese patients desaturate so much faster.',
  setup: ap(['adult'], 'adult', false),
  cues: [
    { id: 'ap-1', at: 0, dur: 12, hold: true, title: 'The oxygen already on board', apply: ap(['adult'], 'adult', false),
      say: 'When breathing stops, the body lives on the oxygen it already holds: a little in the blood, and the gas left in the lungs at the end of a breath, the functional residual capacity. Breathing room air, a healthy adult falls below ninety percent in about a minute.' },
    { id: 'ap-2', at: 13, dur: 12, hold: true, title: 'Pre-oxygenation fills the tank', apply: ap(['adult'], 'adult', true),
      say: 'Breathing pure oxygen through a tight seal for three minutes washes the nitrogen out of that lung volume and replaces it with oxygen. Now the same adult stays above ninety percent for about eight minutes. Nothing else we do buys as much time.' },
    { id: 'ap-3', at: 26, dur: 13, hold: true, title: 'The cliff', apply: ap(['adult'], 'adult', true),
      say: 'Look at the shape. The saturation hardly moves while the lung store drains, because the top of the dissociation curve is flat. Once alveolar oxygen falls to about sixty, the curve turns steep and the saturation falls off a cliff. Stop and re-oxygenate before the edge, not after it.' },
    { id: 'ap-4', at: 40, dur: 13, hold: true, title: 'Pregnancy', apply: ap(['adult', 'pregnant'], 'pregnant', true, false, 'pregnant'),
      say: 'At term the uterus pushes the diaphragm up, so the functional residual capacity is about a fifth smaller, while mother, placenta and baby consume more oxygen. The tank is smaller and drains faster: about five minutes instead of eight, and the baby shares the deficit.' },
    { id: 'ap-5', at: 54, dur: 11, hold: true, title: 'Obesity', apply: ap(['adult', 'obese'], 'obese'),
      say: 'Lying flat, the weight of the abdomen and chest wall squeezes the lungs, and more tissue uses more oxygen. Even well pre-oxygenated, this patient may have under four minutes.' },
    { id: 'ap-6', at: 66, dur: 12, hold: true, title: 'The child', apply: ap(['adult', 'child'], 'child'),
      say: 'A four year old uses nearly twice as much oxygen per kilo as an adult, from a smaller lung volume per kilo. Pre-oxygenated, the saturation holds for about three minutes. On room air, it is seconds.' },
    { id: 'ap-7', at: 79, dur: 13, hold: true, title: 'Infant and newborn', apply: ap(['child', 'infant', 'newborn'], 'infant'),
      say: 'Infants are faster still. Their soft chest wall lets the lung volume collapse once they are asleep or paralysed, and their oxygen use per kilo is the highest of any age. Under two minutes is typical. Fetal haemoglobin holds oxygen tightly, which helps the newborn a little, but the reserve is tiny.' },
    { id: 'ap-8', at: 93, dur: 13, hold: true, title: 'Buying time', apply: ap(['adult', 'pregnant', 'obese', 'child', 'infant', 'newborn'], null, true, true),
      say: 'What buys time: a good seal and full pre-oxygenation, head-up positioning in obesity and pregnancy, oxygen flowing through the nose during the attempt, and a plan agreed beforehand: the time or saturation at which you stop, and ventilate.' },
  ],
};

/* ------------------------------------------------------------------ the child's airway (Ventilator module) */
const pa = (scenario: string, swellMm: number, crying: boolean) => () => { ventScene(scenario, {}, { view: 'airway' }); setAirway({ swellMm, crying }); };
export const PEDS_AIRWAY_LESSON: Timeline = {
  id: 'peds-airway', title: 'The child’s airway: radius to the fourth power', level: 'core', module: 'vent',
  blurb: 'Why a millimetre of swelling matters so much more in an infant, why crying makes it worse, and the same law inside an endotracheal tube.',
  setup: pa('normal', 1, false),
  cues: [
    { id: 'pa-1', at: 0, dur: 12, hold: true, target: 'lung.whole', title: 'Radius to the fourth power', apply: pa('normal', 1, false),
      say: 'A child’s airway is not just a smaller copy of an adult’s. It is narrower and softer, and resistance to flow depends on the radius raised to the fourth power. Halve the radius, and the resistance rises sixteen times.' },
    { id: 'pa-2', at: 13, dur: 13, hold: true, title: 'One millimetre of swelling', apply: pa('normal', 1, false),
      say: 'Take one millimetre of swelling all the way round. In an adult airway of eight millimetres, the lumen falls to six, and resistance rises about three times. In an infant airway of four millimetres, it falls to two, and resistance rises sixteen times. The same swelling, a very different child.' },
    { id: 'pa-3', at: 27, dur: 11, hold: true, title: 'Crying makes it worse', apply: pa('normal', 1, true),
      say: 'When a frightened child cries and gasps, flow through the narrowed segment turns turbulent, and the pressure needed rises with the fifth power of the radius: thirty two times. Keeping the child calm, on a parent’s lap, is part of the treatment.' },
    { id: 'pa-4', at: 39, dur: 12, hold: true, title: 'The narrowest ring', apply: pa('normal', 1, false),
      say: 'Just below the vocal cords sits the cricoid, the only complete ring of cartilage in the airway. Swelling there, from infection or from a tube that is too big, has nowhere to go but inward.' },
    { id: 'pa-5', at: 52, dur: 13, hold: true, title: 'The same law in the tube', apply: pa(ettScenarioId(7), 1, false),
      say: 'The same law applies to the endotracheal tube. These lungs are healthy and unchanged; only the tube is smaller, seven millimetres instead of eight. Watch the peak pressure: the gap between peak and plateau, the pressure spent on resistance, grows.' },
    { id: 'pa-6', at: 66, dur: 13, hold: true, title: 'Six millimetres', apply: pa(ettScenarioId(6), 1, false),
      say: 'At six millimetres that resistive pressure has roughly tripled. A child’s tube may be three and a half millimetres, so a little secretion or a kink takes away a large share of its radius. That is why the tube is the first thing to check when a ventilated child deteriorates.' },
    { id: 'pa-7', at: 80, dur: 10, hold: true, title: 'Back to eight', apply: pa('normal', 1, false),
      say: 'Back to the eight millimetre tube, and the resistive gap closes. Check the tube, then the patient, then the machine.' },
  ],
};

/* ------------------------------------------------------------------ newborn transition (Heart module) */
const nt = (p: ShuntInput, minute: number | null = null) => () => { useHeartUI.getState().set({ input: { ...p }, preset: 'custom', mode: 'sat', target: 'heart.pda' }); setNeo({ minute }); };
export const NEO_TRANSITION_LESSON: Timeline = {
  id: 'neo-transition', title: 'Newborn transition and pulmonary hypertension (PPHN)', level: 'core', module: 'heart',
  blurb: 'From fetal to newborn circulation: the first breaths, the first ten minutes of saturations, the ductus closing — and what happens when pulmonary resistance will not fall.',
  setup: nt(NEO.fetal),
  cues: [
    { id: 'nt-1', at: 0, dur: 13, hold: true, target: 'heart.pda', title: 'Before the first breath', apply: nt(NEO.fetal),
      say: 'Before birth the lungs are full of fluid and their vessels are tightly constricted, so pulmonary resistance is very high. The placenta, not the lungs, supplies oxygen. Blood from the right heart bypasses the lungs through the foramen ovale and the ductus arteriosus.' },
    { id: 'nt-2', at: 14, dur: 13, hold: true, target: 'heart.pda', title: 'The first breaths', apply: nt(NEO.firstBreaths),
      say: 'With the first breaths, air replaces lung fluid and oxygen relaxes the pulmonary vessels. Resistance falls steeply, pulmonary blood flow rises, and flow through the ductus turns around: now it runs from the aorta into the pulmonary artery.' },
    { id: 'nt-3', at: 28, dur: 13, hold: true, target: 'heart.four_chamber', title: 'The first ten minutes', apply: nt(NEO.closingDuct, 5),
      say: 'Saturation rises slowly after birth. A healthy baby may be only sixty to sixty five percent at one minute, and eighty to eighty five at five. Measure on the right hand or wrist, which is supplied before the ductus, and aim for the target band, not a hundred percent.' },
    { id: 'nt-4', at: 42, dur: 11, hold: true, target: 'heart.four_chamber', title: 'The duct closes', apply: nt(NEO.closed, 10),
      say: 'Over hours to days the ductus constricts and closes, and the flap of the foramen ovale is held shut by the higher left atrial pressure. Two circuits now run in series, as in the adult.' },
    { id: 'nt-5', at: 54, dur: 14, hold: true, target: 'heart.pda', title: 'When resistance will not fall', apply: nt(NEO.pphn),
      say: 'In persistent pulmonary hypertension of the newborn, the pulmonary vessels stay constricted. Pulmonary pressure stays close to or above aortic pressure, and blood crosses the ductus from right to left, into the descending aorta. The right hand stays pink while the feet are blue: compare a pre-ductal and a post-ductal probe.' },
    { id: 'nt-6', at: 69, dur: 12, hold: true, target: 'heart.pda', title: 'A vicious circle', apply: nt(NEO.pphnWorse),
      say: 'Hypoxia, acidosis, cold and a high carbon dioxide all constrict the pulmonary vessels further. More blood bypasses the lungs, the baby becomes more hypoxic and acidotic, and resistance climbs again.' },
    { id: 'nt-7', at: 82, dur: 14, hold: true, target: 'heart.pda', title: 'Breaking the circle', apply: nt(NEO.pphnTreated),
      say: 'Treatment breaks the circle: oxygen, gentle ventilation to a normal carbon dioxide, warmth, correcting acidosis, surfactant where the lungs need it, and inhaled nitric oxide, which relaxes only the pulmonary vessels. As resistance falls, ductal flow turns left to right and the difference disappears.' },
    { id: 'nt-8', at: 97, dur: 13, hold: true, target: 'heart.asd', title: 'No difference is not reassurance', apply: nt(NEO.pphnAtrial),
      say: 'One trap. If the right heart struggles and right atrial pressure rises, blood also crosses the foramen ovale from right to left. Then the hand and the foot are both low, with no difference between them. A low pre-ductal saturation still needs an explanation.' },
  ],
};

/* ------------------------------------------------------------------ pregnancy: the blood gas (Blood gas module) */
export const OB_GAS_LESSON: Timeline = {
  id: 'ob-gas', title: 'Pregnancy: the normal blood gas that isn’t', level: 'core', module: 'abg',
  blurb: 'Why a PaCO₂ of 30 is normal at term, why the fetus needs it, and why a “normal” 40 in a pregnant asthmatic is respiratory failure.',
  setup: () => abgScene({ preset: 'normal' }),
  cues: [
    { id: 'og-1', at: 0, dur: 10, hold: true, title: 'The reference', apply: () => abgScene({ preset: 'normal' }),
      say: 'First, a non-pregnant adult breathing room air: a pH of seven point four, a carbon dioxide of forty, a bicarbonate of about twenty four.' },
    { id: 'og-2', at: 11, dur: 13, hold: true, title: 'Normal at term', apply: () => abgScene({ preset: 'pregnant' }),
      say: 'Now a healthy woman at thirty eight weeks. Progesterone makes the respiratory centre more sensitive, so she breathes more: carbon dioxide about thirty. Over weeks her kidneys excrete bicarbonate, down to about twenty, and the pH sits just above normal. For her, this is normal.' },
    { id: 'og-3', at: 25, dur: 11, hold: true, title: 'Why it helps the baby', apply: () => abgScene({ preset: 'pregnant' }),
      say: 'The low maternal carbon dioxide widens the gradient across the placenta, so the fetus can offload its own. Her oxygen is normal or a little high, because less carbon dioxide in the alveoli leaves room for more oxygen.' },
    { id: 'og-4', at: 37, dur: 11, hold: true, title: 'Thinner blood', apply: () => abgScene({ preset: 'pregnant' }),
      say: 'Plasma volume rises by nearly half and red cell mass by about a quarter, so haemoglobin falls to around eleven. Oxygen content is lower, and a higher cardiac output makes up the difference.' },
    { id: 'og-5', at: 49, dur: 14, hold: true, title: 'The trap: a normal carbon dioxide', apply: () => abgScene({ preset: 'pregAsthma' }),
      say: 'Now a pregnant woman with severe asthma. Her carbon dioxide reads in the forties, which looks normal, but her own normal is thirty. She is retaining carbon dioxide, and with little bicarbonate to buffer it, her pH has already fallen to about seven point three. She is tiring.' },
    { id: 'og-6', at: 64, dur: 13, hold: true, title: 'Act early', apply: () => abgScene({ preset: 'pregAsthma', knobs: { lowVQ: 0.12, vdAlv: 0.12, maxVE: 40, drive: 1 }, ff: 45 }),
      say: 'Treat her as severe: bronchodilators, steroids and magnesium, senior help early, and keep her saturation at ninety five percent or more, because the baby’s oxygen depends on hers. As the airways open, her carbon dioxide falls back toward her own normal.' },
  ],
};

/* ------------------------------------------------------------------ pregnancy: the circulation (Lines module) */
const oc = (id: 'pregnant' | 'pregSupine', lossMl: number | null, prbc = 0) => () => { shockScene({ id, view: 'bed', ...(lossMl != null ? { params: pphParams(lossMl) } : {}), prbc }); setOb({ lossMl, supine: id === 'pregSupine' }); };
export const OB_CIRCULATION_LESSON: Timeline = {
  id: 'ob-circulation', title: 'The pregnant circulation: position and postpartum haemorrhage', level: 'core', module: 'lines',
  blurb: 'The term circulation, aortocaval compression and left uterine displacement, and why a bleeding young mother holds her blood pressure until very late.',
  setup: oc('pregnant', null),
  cues: [
    { id: 'oc-1', at: 0, dur: 13, hold: true, title: 'The term circulation', apply: oc('pregnant', null),
      say: 'At term the heart pumps about forty percent more blood: a bigger stroke volume, and a heart rate fifteen beats faster. The placenta is a low resistance circuit and progesterone relaxes vessels, so diastolic pressure runs a little low. Her blood volume is about six and a half litres.' },
    { id: 'oc-2', at: 14, dur: 13, hold: true, title: 'Flat on her back', apply: oc('pregSupine', null),
      say: 'Lay her flat, and the heavy uterus compresses the inferior vena cava against the spine. Less blood returns to the heart, output falls by up to a third, and the pressure drops. The placenta cannot autoregulate, so the baby feels the fall first.' },
    { id: 'oc-3', at: 28, dur: 11, hold: true, title: 'Displace the uterus', apply: oc('pregnant', null),
      say: 'Push the uterus up and to her left, or tilt her fifteen to thirty degrees, and venous return comes back within a minute. In a collapsed woman beyond about twenty weeks, this goes with the first compressions.' },
    { id: 'oc-4', at: 40, dur: 13, hold: true, title: 'A litre lost', apply: oc('pregnant', 1000),
      say: 'After delivery she bleeds. A litre is only about fifteen percent of her expanded volume, so the pressure barely changes and the heart rate creeps up. The shock index, heart rate divided by systolic pressure, is already close to one.' },
    { id: 'oc-5', at: 54, dur: 13, hold: true, title: 'Nearly two litres', apply: oc('pregnant', 1800),
      say: 'At nearly two litres she is compensating hard: a fast heart rate, a narrow pulse pressure, cool hands. The systolic pressure is still around ninety. Young pregnant women hold their pressure until very late; a shock index well above one tells the truth.' },
    { id: 'oc-6', at: 68, dur: 11, hold: true, title: 'Decompensation', apply: oc('pregnant', 2600),
      say: 'Beyond about a third of her volume the vasoconstriction runs out, and the pressure falls fast. This is late. She needs blood, not more crystalloid, and the bleeding stopped.' },
    { id: 'oc-7', at: 80, dur: 14, hold: true, title: 'Stop the bleeding, replace blood', apply: oc('pregnant', 1800, 3),
      say: 'Treat the cause and the volume together: uterine massage and uterotonic drugs for an atonic uterus, the commonest cause; tranexamic acid early; warmed blood and products; calcium; and early obstetric and anaesthetic help. Here, blood restores her output.' },
  ],
};
