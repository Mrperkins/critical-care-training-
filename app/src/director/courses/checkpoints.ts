/**
 * Pause-and-predict prompts for the full courses, keyed lesson → scene. Each one asks the learner to commit
 * before the scene shows the answer. Merged into the hand-written courses in ./index.ts.
 */
type CP = Record<string, Record<string, { prompt: string; answer: string }>>;
const p = (prompt: string, answer: string) => ({ prompt, answer });

export const CHECKPOINTS: CP = {
  'vent-ards-signature': {
    'ards-3': p('FiO₂ goes from 0.6 to 1.0. How much will the saturation rise?', 'Very little: the blood that passes collapsed alveoli never meets the extra oxygen.'),
    'ards-6': p('PEEP goes from 16 to 24. What happens to the plateau and the blood pressure?', 'Plateau climbs past 30 as open alveoli overstretch, and high intrathoracic pressure lowers venous return and blood pressure.'),
  },
  'vent-ards-vs-obstruction': {
    'cr-2': p('Peak 38, plateau 34. Is the problem the airways or the lung?', 'The lung: the 4 cmH₂O gap is a normal resistive pressure; the high plateau means low compliance.'),
    'cr-4': p('Expiratory flow is still flowing when the next breath starts. What will an expiratory hold show?', 'Pressure above set PEEP: the trapped gas, or auto-PEEP.'),
  },
  'vent-tension-ptx': {
    'ptx-2': p('What happens to the peak pressure as pleural air accumulates?', 'It rises: the same tidal volume now goes into a compressed lung against a stiff, pressurised chest.'),
    'ptx-5': p('After decompression, which number recovers first?', 'Blood pressure and peak pressure change within seconds as the pleural pressure falls; saturation follows as the lung re-expands.'),
  },
  'vent-needle': {
    'nd-4': p('A 5 cm catheter at the 2nd space gives no air in a muscular patient. Tension gone, or a failed attempt?', 'Probably a failed attempt: the catheter may have ended in the chest wall. Try the lateral site with a longer catheter.'),
  },
  'peds-airway': {
    'pa-2': p('One millimetre of swelling in an 8 mm adult airway and a 4 mm infant airway. Which loses more?', 'The infant: radius halves, so resistance rises about 16-fold versus about 3-fold in the adult.'),
    'pa-5': p('Swap an 8 mm tube for a 7 mm one in the same lungs. What changes: peak, plateau, or both?', 'Peak only: the lungs are unchanged, so the plateau stays; the resistive gap widens.'),
  },
  'abg-resp-vs-metabolic': {
    'ac-3': p('The same CO₂ of 80 for three days. Will the pH be lower or higher than in the first hour?', 'Higher: the kidneys have retained bicarbonate, about 4 per 10 mmHg of CO₂.'),
    'ac-5': p('A patient with metabolic acidosis is put on "normal" ventilator settings. What happens to the pH?', 'It falls sharply: the respiratory compensation (a low CO₂) has been taken away.'),
  },
  'abg-dka': {
    'dka-4': p('Plasma potassium is 5.8 in DKA. Is total-body potassium high or low?', 'Low: diuresis has washed it out; acidosis and insulin lack hold it outside cells.'),
    'dka-6': p('Insulin starts. Which way does the potassium go?', 'Down, often below normal, as insulin drives it into cells — so replace it.'),
  },
  'ob-gas': {
    'og-5': p('A pregnant asthmatic has a PaCO₂ of 42. Reassuring?', 'No: her normal is about 30, so 42 is retention with little bicarbonate to buffer it.'),
  },
  'pop-apnoea': {
    'ap-3': p('Saturation has held at 96 % for six minutes. How quickly will it fall once it starts?', 'Fast: past the shoulder of the curve, saturation falls off a cliff.'),
    'ap-6': p('Pre-oxygenated, which desaturates faster: a 4-year-old or an adult?', 'The child: about twice the oxygen use per kilo from a smaller store per kilo.'),
  },
  'hyperk-signature': {
    'hks-5': p('Calcium is given. What happens to the plasma potassium?', 'Nothing: calcium raises the threshold potential and narrows the QRS, but potassium is unchanged.'),
    'hks-7': p('Potassium was 5.2 after insulin. Where will it be in five hours?', 'Higher again: the shift wears off and potassium leaks back out of the cells.'),
  },
  'labs-coag': {
    'co-4': p('PCC fixed the INR. Without vitamin K, what will the INR be tomorrow?', 'Back up: factor VII lasts about six hours and the liver still cannot make working factors.'),
    'co-6': p('On heparin, which test is prolonged most: INR or aPTT?', 'aPTT: heparin acts through antithrombin on thrombin and Xa; the INR barely moves.'),
  },
  'lines-shock-states': {
    'sh-1': p('Septic shock: will the diastolic pressure be high or low?', 'Low: arterioles relax, so blood runs off quickly and the dicrotic notch sits low.'),
    'sh-5': p('Tamponade: will the CVP be high or low?', 'High: the heart cannot fill, so pressure backs up while stroke volume falls.'),
    'sh-8': p('Haemorrhage on the ventilator: large or small pulse-pressure variation?', 'Large: each breath squeezes an underfilled heart further.'),
  },
  'lines-oxygen-delivery': {
    'do-2': p('Haemoglobin halves. What does the pulse oximeter show?', 'Still about 97 %: each haemoglobin is full, there is just half as much.'),
    'do-6': p('Septic shock with high delivery and a high ScvO₂. Can the tissues still be hypoxic?', 'Yes: maldistribution and cellular dysfunction mean oxygen is delivered but not used.'),
  },
  'lines-haemorrhage-transfusion': {
    'ht-2': p('Ten minutes into rapid bleeding, will the haemoglobin be low?', 'Not yet: whole blood is lost, so the concentration barely changes until fluid is given or shifts in.'),
    'ht-3': p('After two litres of crystalloid, what happens to the haemoglobin?', 'It falls: the remaining red cells are diluted.'),
  },
  'lines-iabp': {
    'iabp-3': p('Which should be lower: the assisted or the unassisted end-diastolic pressure?', 'The assisted one: deflation empties the aorta just before the next beat.'),
    'iabp-7': p('Assisted end-diastolic pressure is higher than unassisted. Which timing error?', 'Late deflation: the ventricle starts ejecting against a balloon that is still full.'),
  },
  'lines-cvc': {
    'cvc-2': p('One vessel flattens with gentle pressure, the other stays round. Which is the vein?', 'The one that flattens. The artery stays round and pulsatile.'),
    'cvc-4': p('Out of plane, the bright dot sits in the front of the vein. Is the tip there?', 'Not necessarily: the dot is wherever the shaft crosses the beam; the tip may be deeper.'),
  },
  'ob-circulation': {
    'oc-2': p('A term woman is laid flat on her back. What happens to cardiac output?', 'It can fall by up to a third as the uterus compresses the vena cava.'),
    'oc-5': p('Nearly two litres lost, systolic 90. Is she stable?', 'No: she is compensating hard. A shock index well above 1 shows it before the pressure falls.'),
  },
  'peds-shock': {
    'ps-3': p('Pale, mottled, HR 155, refill 4 s, normal systolic. Shocked?', 'Yes: compensated shock. Children hold their pressure until late.'),
    'ps-5': p('The heart rate falls from 170 to 70 in a shocked child. Better?', 'No: bradycardia means the heart is failing and arrest is close.'),
  },
  'neuro-time-is-brain': {
    'tib-3': p('Which tissue survives longer: the deep territory or the cortex near the border?', 'The border cortex: it gets collateral flow from the neighbouring arteries.'),
    'tib-5': p('MAP falls to 60 before reperfusion. What happens to the core?', 'It grows faster: collateral flow is pressure-passive.'),
  },
  'neuro-time-machine': {
    'tm-3': p('Why is the first scan a non-contrast CT?', 'To exclude haemorrhage before any clot-dissolving drug.'),
    'tm-5': p('Small core, large delayed area. Worth reperfusing?', 'Yes: that mismatch is salvageable brain.'),
  },
  'neuro-lvo': {
    'lvo-1': p('Left MCA occlusion: which way do the eyes deviate?', 'To the left — toward the lesion.'),
    'lvo-5': p('Good collaterals, six hours since onset. Too late?', 'Not necessarily: a small core with a large penumbra can still benefit.'),
  },
  'neuro-ich': {
    'ich-3': p('Systolic 190 versus 140: which haematoma grows more?', 'The one at 190: high pressure favours early expansion.'),
  },
  'neuro-sah': {
    'sah-3': p('Day 5 after SAH, a new arm weakness. Re-bleed or vasospasm?', 'Vasospasm is likely at this timing; it peaks between days 3 and 14.'),
  },
  'neuro-icp': {
    'icp-2': p('A 20 mL haematoma. Will the ICP rise much?', 'Barely: CSF and venous blood are displaced first — the flat part of the curve.'),
    'icp-4': p('ICP 30 and MAP 70. What is the CPP?', '40 mmHg: low enough to cause ischaemia without any blocked artery.'),
    'icp-11': p('The bed head goes up but the drain chamber does not move. Over- or under-drainage?', 'Overdrainage: the drain is now effectively lower than the reference point.'),
  },
  'heart-vsd': {
    'vsd-3': p('A small VSD: loud murmur or soft?', 'Loud: a big pressure gradient across a small hole drives a fast jet.'),
    'vsd-6': p('Which side of the heart dilates with a large VSD?', 'The left: extra pulmonary flow returns to the left atrium and ventricle.'),
  },
  'neo-transition': {
    'nt-3': p('One minute after birth, SpO₂ is 62 %. Normal?', 'Yes: about 60–65 % at one minute is expected; aim for the target band, not 100 %.'),
    'nt-5': p('Right hand pink, feet blue. Where is the shunt?', 'Right to left across the ductus, into the descending aorta.'),
  },
  'abd-fast': {
    'fast-3': p('Two minutes after a liver laceration, the FAST is negative. Bleeding ruled out?', 'No: too little blood to see yet. Repeat the scan.'),
    'fast-8': p('A ruptured AAA with a litre lost. Will the FAST be positive?', 'Usually not: the blood is retroperitoneal.'),
  },
  'abd-aaa': {
    'aaa-5': p('Contained rupture, heart rate rising, pressure near normal. Is there time?', 'A short window: get the patient to aortic repair now.'),
  },
  'abd-dissection': {
    'ad-3': p('Flap in the descending aorta only. Type A or B?', 'Type B (Stanford): ascending aorta spared.'),
    'ad-9': p('Vasodilator alone, no beta-blocker. What happens to the heart rate?', 'It rises reflexly, increasing the shear on the flap.'),
  },
  'abd-solid-organ': {
    'so-4': p('Better after a litre of blood, worse 45 minutes later. Which category?', 'Transient responder: still bleeding, needs haemorrhage control.'),
  },
  'abd-mesenteric': {
    'me-3': p('Lactate is normal. Can the bowel still be ischaemic?', 'Yes: early in the course lactate is often normal.'),
  },
  'abd-obstruction': {
    'sb-4': p('Perforation in a supine patient: where does the free air go?', 'To the front of the abdomen, over the liver.'),
  },
  eom: {
    eom3: p('Flow stops at end-inspiration. Does the pressure rise, fall or stay?', 'It falls from peak to plateau: the resistive term disappears with the flow.'),
    eom5: p('τ is 0.4 s. How long until about 95 % of the breath is out?', 'About 1.2 s: three time constants.'),
  },
  rc: { rc2: p('The airway radius increases by 20 %. Roughly how much does resistance fall?', 'About half: resistance scales with 1/r⁴, and 1.2⁴ ≈ 2.') },
  vcpc: { vp3: p('Pressure control in a stiff lung: what changes, pressure or volume?', 'Volume falls; the pressure is capped at the set level.') },
  peep: { pe3: p('PEEP 22: will compliance rise or fall?', 'Fall: open alveoli overstretch and the loop flattens at the top.') },
  auto: { au3: p('Rate down from 20 to 12. What happens to auto-PEEP?', 'It falls: longer expiration lets flow reach zero.') },
  sync: { sy2: p('Cycle-off at 60 %. Will the breath end before or after the patient finishes inhaling?', 'Before: premature cycling.') },
  o2path: { ox3: p('Transit time halves during exercise. Will the blood still load fully?', 'In health, yes: loading is complete in the first third of the transit.') },
  hypox: { hy3: p('V/Q mismatch: does the PaO₂ respond to FiO₂ 0.4?', 'Yes, well: poorly ventilated units still fill with oxygen-rich gas.') },
  resp: { rs4: p('The opioid is reversed in a patient retaining CO₂ for days. What happens to the pH?', 'It overshoots into alkalaemia: the extra bicarbonate takes days to clear.') },
  metab: { mt2: p('HCO₃⁻ 10, PaCO₂ 35. Appropriate compensation?', 'No: expected is 23 ± 2. A CO₂ of 35 means a second, respiratory, problem.') },
  vbg: { vb2: p('Venous PO₂ 40. Is the patient hypoxaemic?', 'Not from that number: venous PO₂ shows what tissues left behind.') },
  hyperk: { hk3: p('After calcium, will the potassium be lower?', 'No: calcium stabilises the membrane; potassium is unchanged.') },
  hypona: { hn4: p('Chronic hyponatraemia corrected by 16 in a day. Risk?', 'Osmotic demyelination: limit to about 8–10 in 24 hours.') },
  anaemia: { an2: p('Hb halves. Does SpO₂ change?', 'No: each red cell is still saturated.') },
  lactate: { lc3: p('Perfusion is restored. How fast will the lactate fall?', 'Over hours, as the liver clears it.') },
  'ln-setup': { 'ln-setup-5': p('The transducer sits below the right atrium. High or low readings?', 'High: the extra column of saline adds pressure.') },
  'ln-art': { 'ln-art-2': p('Radial versus aortic: which number is nearly the same?', 'The mean pressure.') },
  'ln-cvp': { 'ln-cvp-4': p('On the ventilator, when do you read the CVP?', 'At end-expiration, just before the next breath — now the lowest part of the cycle.') },
  'ln-level': { 'ln-level-3': p('Bed head raised without re-levelling. High or low readings?', 'High, by about 20 mmHg in this example.') },
  'ln-damp': { 'ln-damp-2': p('Underdamped line: systolic too high or too low?', 'Too high: the line rings and overshoots.') },
  'ln-heartlung': { 'ln-hl-3': p('High PPV in a spontaneously breathing patient. Give fluid?', 'Not on that basis: PPV is invalid without controlled breaths.') },
  'ln-disease': { 'ln-dz-1': p('Slow, late, small upstroke. Which valve lesion?', 'Aortic stenosis: parvus et tardus.') },
};
