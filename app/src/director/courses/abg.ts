/** Blood gas and lab courses: acid–base, oxygenation, potassium, sodium, coagulation, anaemia and lactate. */
import type { CourseMeta } from '../course';
const q = (question: string, options: string[], answer: number, why: string) => ({ q: question, options, answer, why });

export const ABG_COURSES: Record<string, CourseMeta> = {
  'abg-resp-vs-metabolic': {
    objectives: ['Read a gas in three steps: pH, primary process, expected compensation.', 'Know the size and speed of respiratory and metabolic compensation.', 'Ventilate a metabolic acidosis appropriately.'],
    essentials: ['ac-1', 'ac-2', 'ac-4', 'ac-6'],
    keyPoints: [
      'pH follows the ratio of bicarbonate to CO₂. Lungs adjust CO₂ in minutes; kidneys adjust bicarbonate over days.',
      'Acute respiratory acidosis: HCO₃⁻ rises about 1 per 10 mmHg CO₂. Chronic: about 4 per 10.',
      'Metabolic acidosis: expected PaCO₂ = 1.5 × HCO₃⁻ + 8 (± 2) — Winter’s formula.',
      'If compensation is not what you expect, there is a second process.',
      'A ventilated patient with metabolic acidosis needs a high minute ventilation, not a normal one.',
    ],
    pearls: ['Compensation never fully normalises the pH; a normal pH with abnormal values suggests a mixed disorder.'],
    pitfalls: ['Setting “normal” ventilator settings after intubating a patient with severe metabolic acidosis — the pH can crash.'],
    bedside: 'Before intubating a patient with metabolic acidosis, note their CO₂ and match it on the ventilator.',
    selfCheck: [
      q('pH 7.20, PaCO₂ 25, HCO₃⁻ 10. Is respiratory compensation appropriate?', ['Yes', 'No — CO₂ is too high', 'No — CO₂ is too low', 'Cannot tell'], 0, 'Expected PaCO₂ = 1.5 × 10 + 8 = 23 ± 2; 25 is within range.'),
      q('Opioid overdose: PaCO₂ 80 acutely. Expected HCO₃⁻?', ['24', '28', '40', '16'], 1, 'Acute: about 1 per 10 mmHg above 40 → 24 + 4 = 28.'),
    ],
  },
  'abg-dka': {
    objectives: ['Explain the anion-gap acidosis, dehydration and potassium shift of DKA.', 'Order treatment: fluids, potassium check, insulin.', 'Know when ketoacidosis has truly resolved.'],
    essentials: ['dka-2', 'dka-4', 'dka-5', 'dka-6'],
    keyPoints: [
      'No insulin → ketoacids → high anion-gap metabolic acidosis with Kussmaul breathing.',
      'Osmotic diuresis loses litres of water and sodium.',
      'Plasma potassium is often high but total-body potassium is low; insulin will reveal the deficit.',
      'Fluids first. Check potassium before insulin, and replace it if low.',
      'Glucose normalises before ketones clear: continue insulin with dextrose until ketones, pH and bicarbonate recover.',
    ],
    pearls: ['After saline resuscitation a hyperchloraemic acidosis can keep the bicarbonate low even when ketones have cleared.'],
    pitfalls: ['Starting insulin with a low potassium.', 'Stopping insulin when the glucose is normal but ketones persist.'],
    bedside: 'Get a potassium result before the insulin infusion starts.',
    selfCheck: [
      q('DKA: K⁺ 3.0 mmol/L. What comes first?', ['Insulin infusion', 'Potassium replacement before insulin', 'Bicarbonate', 'Stop fluids'], 1, 'Insulin drives potassium into cells and can cause dangerous hypokalaemia.'),
      q('Glucose is 9 mmol/L but ketones remain high. What do you do?', ['Stop insulin', 'Continue insulin and add dextrose', 'Give bicarbonate', 'Switch to subcutaneous insulin now'], 1, 'Ketosis, not glucose, defines resolution; dextrose lets insulin continue safely.'),
    ],
  },
  'ob-gas': {
    objectives: ['State normal blood gas values at term.', 'Recognise CO₂ retention in a pregnant woman whose values look normal.'],
    essentials: ['og-2', 'og-5', 'og-6'],
    keyPoints: [
      'At term, PaCO₂ is about 30 and HCO₃⁻ about 20 — a compensated respiratory alkalosis that is normal for her.',
      'The low maternal CO₂ helps the fetus offload CO₂ across the placenta.',
      'Haemoglobin falls to about 11 from dilution; cardiac output rises to compensate.',
      'A PaCO₂ of 40 in a pregnant asthmatic is retention, with little buffer — she is tiring.',
      'Treat early and keep SpO₂ at 95 % or more: the baby’s oxygen depends on hers.',
    ],
    pitfalls: ['Reassurance from a “normal” CO₂ in a pregnant woman with respiratory distress.'],
    bedside: 'Compare a pregnant patient’s gas with pregnancy norms, not general adult norms.',
    selfCheck: [
      q('Pregnant at 34 weeks with acute asthma: PaCO₂ 42 mmHg. Interpretation?', ['Normal', 'Reassuring', 'CO₂ retention — escalate', 'Metabolic alkalosis'], 2, 'Her normal is about 30; 42 means she is retaining CO₂.'),
    ],
  },
  'pop-apnoea': {
    objectives: ['Explain why pre-oxygenation buys the most time.', 'Compare safe apnoea time across adults, pregnancy, obesity, children and infants.', 'Plan to stop before the desaturation cliff.'],
    essentials: ['ap-2', 'ap-3', 'ap-4', 'ap-7', 'ap-8'],
    keyPoints: [
      'During apnoea the body uses oxygen stored in the FRC and blood.',
      'Pre-oxygenating with a tight seal fills the FRC with oxygen: about 8 minutes above 90 % in a healthy adult instead of about 1.',
      'Saturation holds, then falls off a cliff once alveolar PO₂ reaches the steep part of the curve.',
      'Pregnancy, obesity, children and infants have smaller stores and higher oxygen use: minutes, not many minutes.',
      'Buy time: tight seal, head-up, nasal oxygen during the attempt, and an agreed stop point.',
    ],
    pearls: ['Apnoeic oxygenation through nasal cannulae extends safe time during laryngoscopy.'],
    pitfalls: ['Pressing on when the saturation starts to fall — it will fall fast.'],
    bedside: 'Before every intubation, say aloud the saturation or time at which you will stop and ventilate.',
    selfCheck: [
      q('Why does saturation drop suddenly late in apnoea?', ['The heart fails', 'Alveolar PO₂ reaches the steep part of the dissociation curve', 'CO₂ rises', 'The probe fails'], 1, 'The flat top of the curve hides the fall until PO₂ reaches about 60.'),
    ],
  },
  o2path: {
    objectives: ['Use the alveolar gas equation.', 'Describe oxygen loading in the capillary and delivery to tissues.', 'Explain why SpO₂ misses anaemia.'],
    essentials: ['ox1', 'ox3', 'ox4', 'ox5'],
    keyPoints: [
      'PAO₂ = FiO₂ × 713 − PaCO₂ ÷ 0.8: about 100 mmHg on room air.',
      'Red cells load fully in the first third of their capillary transit — a reserve for exercise.',
      'DO₂ = CaO₂ × cardiac output, about 1000 mL/min; tissues use about a quarter.',
      'Anaemia halves content while SpO₂ stays normal.',
    ],
    pitfalls: ['Judging oxygen delivery from SpO₂ alone.'],
    bedside: 'Look at haemoglobin and cardiac output, not just saturation, when judging oxygen delivery.',
    selfCheck: [
      q('Room air, PaCO₂ 40. Approximate PAO₂?', ['50', '100', '150', '713'], 1, '0.21 × 713 − 40/0.8 ≈ 150 − 50 = 100 mmHg.'),
    ],
  },
  hypox: {
    objectives: ['Classify hypoxaemia by mechanism.', 'Use the A–a gradient and the response to oxygen.'],
    essentials: ['hy1', 'hy2', 'hy4', 'hy5'],
    keyPoints: [
      'Hypoventilation: high CO₂, normal A–a gradient — ventilate.',
      'V/Q mismatch: the commonest cause; widened A–a gradient; responds well to oxygen.',
      'Shunt: barely responds to 100 % oxygen; needs alveoli reopened.',
      'Dead space wastes ventilation: CO₂ clearance falls and the PaCO₂–EtCO₂ gap widens.',
    ],
    pitfalls: ['Escalating FiO₂ indefinitely for shunt instead of recruiting lung.'],
    bedside: 'Calculate the A–a gradient when the cause of hypoxaemia is unclear.',
    selfCheck: [
      q('PaO₂ rises from 55 to 60 on FiO₂ 1.0. Mechanism?', ['Hypoventilation', 'V/Q mismatch', 'Shunt', 'High altitude'], 2, 'A poor response to 100 % oxygen defines shunt.'),
    ],
  },
  resp: {
    objectives: ['Describe acute and chronic respiratory acidosis.', 'Recognise post-hypercapnic alkalosis.'],
    essentials: ['rs1', 'rs3', 'rs4'],
    keyPoints: [
      'Acute: HCO₃⁻ rises about 1 per 10 mmHg CO₂ — chemical buffering only.',
      'Chronic (days): kidneys raise HCO₃⁻ about 3.5–4 per 10 mmHg and pH nears normal.',
      'Correcting chronic CO₂ fast leaves extra bicarbonate: post-hypercapnic alkalosis.',
    ],
    pitfalls: ['Ventilating a chronic CO₂ retainer to a PaCO₂ of 40.'],
    bedside: 'Ventilate a chronic retainer to their usual pH, not to a normal CO₂.',
    selfCheck: [
      q('COPD patient, usual PaCO₂ 60, ventilated to PaCO₂ 40. Likely result?', ['Acidosis', 'Alkalaemia', 'Normal pH', 'Hypoxia'], 1, 'Retained bicarbonate is unopposed once CO₂ falls.'),
    ],
  },
  metab: {
    objectives: ['Calculate the anion gap.', 'Check respiratory compensation with Winter’s formula.', 'Spot a mixed disorder.'],
    essentials: ['mt1', 'mt2', 'mt4'],
    keyPoints: [
      'Anion gap = Na⁺ − (Cl⁻ + HCO₃⁻). A high gap means unmeasured acid anions (ketones, lactate, toxins).',
      'Expected PaCO₂ = 1.5 × HCO₃⁻ + 8 ± 2. Higher means the patient is tiring or sedated.',
      'Lactate reflects stress glycolysis and clearance as well as oxygen debt.',
      'Salicylates give a respiratory alkalosis plus metabolic acidosis; keep the CO₂ low if intubated.',
    ],
    pitfalls: ['Intubating a salicylate-poisoned patient and letting the CO₂ rise.'],
    bedside: 'Compute the anion gap on every metabolic acidosis.',
    selfCheck: [
      q('Na 140, Cl 100, HCO₃ 12. Anion gap?', ['12', '20', '28', '40'], 2, '140 − (100 + 12) = 28: high.'),
    ],
  },
  vbg: {
    objectives: ['Know when a venous gas substitutes for an arterial one.', 'Avoid using venous PO₂ for oxygenation.'],
    essentials: ['vb1', 'vb2'],
    keyPoints: [
      'In a stable patient venous pH is about 0.03 lower and CO₂ about 5 higher; bicarbonate and lactate are similar.',
      'Venous PO₂ is what tissues left behind — it does not measure oxygenation.',
      'In low-flow states and CPR, venous and arterial values diverge widely.',
    ],
    pitfalls: ['Calling a venous PO₂ of 40 hypoxaemia.'],
    bedside: 'Pair a venous gas with SpO₂ for oxygenation.',
    selfCheck: [
      q('Which is NOT reliably estimated from a venous gas in a stable patient?', ['pH', 'Bicarbonate', 'Lactate', 'Arterial oxygenation'], 3, 'Venous PO₂ reflects tissue extraction, not lung oxygenation.'),
    ],
  },
  'hyperk-signature': {
    objectives: ['Link plasma potassium to the resting membrane potential and the ECG.', 'Treat in order: stabilise, shift, remove.', 'Anticipate rebound.'],
    essentials: ['hks-3', 'hks-5', 'hks-6', 'hks-8'],
    keyPoints: [
      'The K⁺ gradient sets the resting potential near −85 mV; high plasma K⁺ moves it toward threshold.',
      'ECG in order: peaked T, long PR and flat P, wide QRS, then sine wave — pre-arrest.',
      'Calcium first: it raises the threshold, narrows the QRS, and does not lower potassium. It lasts 30–60 minutes.',
      'Insulin with dextrose (and salbutamol) shift potassium into cells by about 1 mmol/L — temporarily.',
      'Removal is the cure: dialysis, binders or diuretics. Repeat ECG and potassium.',
    ],
    pearls: ['Calcium may need repeating if ECG changes return.'],
    pitfalls: ['Waiting for a repeat potassium before giving calcium to a patient with ECG changes.', 'Forgetting the glucose check hours after insulin.'],
    bedside: 'Hyperkalaemia with ECG changes: calcium now, then shift, then remove.',
    selfCheck: [
      q('What does IV calcium do in hyperkalaemia?', ['Lowers plasma potassium', 'Raises threshold potential, stabilising the membrane', 'Drives potassium into cells', 'Increases renal excretion'], 1, 'Calcium restores the gap between resting and threshold potential; potassium is unchanged.'),
      q('Four hours after insulin–dextrose, K⁺ rises again. Why?', ['Lab error', 'Rebound as the shift wears off', 'Calcium wore off', 'Hypoglycaemia'], 1, 'Shifting is temporary; potassium leaks back out.'),
    ],
  },
  'labs-coag': {
    objectives: ['Reverse warfarin with PCC plus vitamin K.', 'Reverse heparin with protamine.', 'Recognise hyperfibrinolysis and treat with TXA and fibrinogen.'],
    essentials: ['co-2', 'co-3', 'co-5', 'co-7', 'co-9'],
    keyPoints: [
      'Warfarin leaves factors II, VII, IX and X non-functional: INR rises.',
      'PCC replaces those factors within about 30 minutes.',
      'Give IV vitamin K with PCC, or the INR climbs back as factor VII runs out.',
      'Heparin works through antithrombin; protamine binds it within minutes — stop the infusion first.',
      'Trauma fibrinolysis: tranexamic acid within 3 hours, and replace fibrinogen.',
    ],
    pitfalls: ['Giving PCC without vitamin K.', 'Giving TXA late after injury.'],
    bedside: 'For warfarin-associated bleeding, order PCC and IV vitamin K together.',
    selfCheck: [
      q('INR 6.5 with intracranial haemorrhage. Best reversal?', ['Vitamin K alone', 'PCC plus IV vitamin K', 'Protamine', 'Platelets'], 1, 'PCC works fast; vitamin K sustains the correction.'),
    ],
  },
  hyperk: {
    objectives: ['Explain the membrane effect of high potassium.', 'Order calcium, shift and removal.'],
    essentials: ['hk2', 'hk3', 'hk4', 'hk6'],
    keyPoints: [
      'High plasma K⁺ shrinks the gap between resting and threshold potential: peaked T, flat P, wide QRS.',
      'Calcium restores the gap without lowering potassium.',
      'Insulin and salbutamol shift potassium into cells — temporarily.',
      'Dialysis, binders and diuretics remove it.',
    ],
    pitfalls: ['Treating the number and forgetting the ECG.'],
    bedside: 'Get an ECG with every high potassium.',
    selfCheck: [
      q('Which therapy actually removes potassium from the body?', ['Calcium gluconate', 'Insulin', 'Salbutamol', 'Dialysis'], 3, 'The others stabilise or shift; dialysis removes.'),
    ],
  },
  hypona: {
    objectives: ['Explain brain swelling in acute hyponatraemia.', 'Treat symptomatic acute hyponatraemia.', 'Avoid overcorrection of chronic hyponatraemia.'],
    essentials: ['hn2', 'hn3', 'hn4'],
    keyPoints: [
      'Water moves to equalise osmolality; low sodium swells cells, and the brain has no room.',
      'Acute symptomatic hyponatraemia: a small hypertonic bolus raising sodium by 4–6 is treatment.',
      'Over days the brain adapts by exporting osmolytes.',
      'Correcting chronic hyponatraemia too fast risks osmotic demyelination: limit to about 8–10 per 24 hours.',
    ],
    pitfalls: ['Overcorrection after the cause (e.g. hypovolaemia or a drug) resolves and the kidneys dump water.'],
    bedside: 'Check sodium every few hours during correction and have a plan to stop or reverse it.',
    selfCheck: [
      q('Chronic Na 116 rises to 132 in 24 hours. Risk?', ['Cerebral oedema', 'Osmotic demyelination', 'Hyperkalaemia', 'None'], 1, 'A rise of 16 in a day exceeds safe limits for chronic hyponatraemia.'),
    ],
  },
  anaemia: {
    objectives: ['Explain why SpO₂ is normal in anaemia.', 'Relate haemoglobin to oxygen content.'],
    essentials: ['an2', 'an3'],
    keyPoints: [
      'Each red cell stays fully saturated, so SpO₂ is normal even when haemoglobin halves.',
      'Oxygen content halves; the heart and tissues compensate, and venous saturation falls.',
      'One unit of red cells raises haemoglobin by about 1 g/dL.',
    ],
    pitfalls: ['Taking a normal SpO₂ as proof of adequate oxygen delivery.'],
    bedside: 'Interpret SpO₂ alongside the haemoglobin.',
    selfCheck: [
      q('Hb 6.5 g/dL, SpO₂ 98 %. Oxygen content compared with normal?', ['Normal', 'About half', 'Double', 'Zero'], 1, 'Content ≈ 1.34 × Hb × SaO₂; halving Hb halves content.'),
    ],
  },
  lactate: {
    objectives: ['Explain lactate as a balance of production and clearance.', 'Use lactate trends in resuscitation.'],
    essentials: ['lc2', 'lc3'],
    keyPoints: [
      'Lactate is made by every tissue and cleared by liver and kidneys.',
      'Shock raises production and lowers clearance; adrenaline and sepsis raise it even with adequate delivery.',
      'A falling lactate over hours is a good sign resuscitation is working.',
    ],
    pitfalls: ['Assuming every raised lactate means oxygen debt.'],
    bedside: 'Trend lactate every few hours during resuscitation.',
    selfCheck: [
      q('Which can raise lactate without tissue hypoxia?', ['Adrenaline infusion', 'Opioid analgesia', 'A normal saline bolus', 'Supplemental oxygen'], 0, 'β-agonism speeds glycolysis and raises lactate.'),
    ],
  },
};
