import type { ClinicalReview } from '../types';
import { custom, f, R, SOURCES } from './references';
const pulseSigns='Tachycardia may accompany pain, anxiety or reduced circulating volume; weak pulses, cool skin and oliguria would add evidence of poor perfusion.';
const oxygenSigns='Hypoxemia can cause restlessness, tachycardia or cyanosis; oxygen saturation alone does not measure perfusion or cardiac output.';
const plateletSigns='Thrombocytopenia may cause petechiae, bruising or mucosal bleeding, but significant depletion can exist without visible bleeding.';
const liverSigns='Liver injury in this setting may accompany right upper quadrant pain, nausea or malaise; severe escalating pain warrants evaluation for hepatic complications.';
const shockSigns='Hemorrhagic shock commonly causes pallor, diaphoresis, weak pulses, confusion and reduced urine output; external blood loss may underestimate total loss.';
export const OBSTETRIC_REVIEWS: Record<string,ClinicalReview>={
  'preeclampsia-visual-symptoms': {
    diagnosis:'Preeclampsia with severe features at 33 weeks',
    handoff:'EMS brings the patient from home after a persistent headache is joined by flashing lights. The partner says these symptoms are new, and prenatal records show no chronic hypertension. The repeat pressure and organ-injury pattern establish the conference diagnosis early: preeclampsia with severe features, before any seizure occurs.',
    course:'The obstetric team treats persistent severe hypertension with a pathway-selected antihypertensive and gives magnesium for seizure prophylaxis as a separate intervention. Respiratory rate, reflexes, urine output and infusion delivery are monitored. After maternal stabilization, the obstetric team recommends delivery because of the severe maternal disease; gestational age, symptoms and fetal assessment inform its timing and route. In this synthetic course, mother and infant receive inpatient care and the mother leaves hospital with pressure follow-up and postpartum warning signs. Better headache alone does not mean the disease has resolved.',
    findings:{
      'Heart rate':f(R.hrAdult,'This is mild tachycardia against the nonpregnant resting reference. Pregnancy and distress may contribute; it is not the criterion establishing severe preeclampsia.',pulseSigns),
      'Blood pressure':f(R.bpOb,'Both components are in the severe range and remain severe on repeat. This requires urgent treatment rather than waiting for proteinuria or a seizure.','Severe preeclampsia may cause headache, visual symptoms, hyperreflexia, epigastric pain or pulmonary edema; headache and visual disturbance are present.'),
      'SpO₂':f(R.sat,'This is within the usual reference, and the lungs are currently clear. There is no documented hypoxemia at this assessment.',oxygenSigns),
      'Fetal heart rate':f(R.fetal,'This spot rate is in the usual baseline interval. It cannot establish a normal full tracing or override the maternal emergency.','Fetal compromise can appear through recurrent decelerations or abnormal variability even when a single rate is in range.'),
      'Platelets':f(R.platelets,'This is thrombocytopenia, but above the below-100 severe-feature threshold. Its trend matters, and other severe features are already present.',plateletSigns),
      'AST':f(R.ast,'This is more than twice the stated upper reference limit, supporting hepatic involvement in the setting of severe hypertension.',liverSigns),
      'Creatinine':f(R.creatinine,'This exceeds the obstetric 1.1 criterion even though it sits at the upper end of a general adult interval. Gestational physiology changes its meaning.','Renal involvement may produce oliguria or fluid accumulation; monitor urine output and magnesium clearance rather than assuming symptoms must be present.'),
    },
  },
  'eclampsia-postpartum':{
    diagnosis:'Delayed postpartum eclampsia',
    handoff:'A partner calls EMS after headache and flashing lights are followed by a generalized convulsion. The baby was delivered five days earlier, and the family initially omits that history because the pregnancy is over. EMS protects the patient from injury and finds severe hypertension after the seizure. The working diagnosis is postpartum eclampsia while intracranial hemorrhage and venous thrombosis remain active alternatives.',
    course:'After the initial seizure ends, magnesium is given to treat eclampsia and prevent recurrence, with airway and ventilation support as needed. Persistent severe pressure receives a separate antihypertensive. Ongoing confusion prompts brain imaging after stabilization; in this synthetic course, no hemorrhage or venous thrombosis is found. Consciousness returns, no further seizure occurs during monitored treatment, and the patient is admitted with obstetric and neurological follow-up. Delivery did not end the period of risk.',
    findings:{
      'Heart rate':f(R.hrAdult,'This is tachycardia after a seizure. Adrenergic stress is plausible, but perfusion and rhythm are reassessed rather than attributed automatically to the postictal state.',pulseSigns),
      'Blood pressure':f(R.bpOb,'Both components are severe, including in this postpartum setting. The pressure raises the risks of stroke and further neurological injury.','Headache, visual symptoms, seizures and altered consciousness can accompany hypertensive obstetric disease; the first three preceded this assessment.'),
      'Respiratory rate':f(R.rrAdult,'This is tachypnea after the seizure. Assess airway patency, aspiration risk and ventilation rather than assuming every postictal patient ventilates effectively.','Seizures may be followed by obstruction, hypoventilation or aspiration; gurgling, poor chest movement or new crackles would be important.'),
      'SpO₂':f(R.sat,'This is below the usual oxygenation reference on room air. Seizure-associated hypoventilation or aspiration may contribute and need reassessment.',oxygenSigns),
      'Glucose':f(R.glucose,'This random value is in range. Measured hypoglycemia is not the explanation for this seizure.','Hypoglycemia may cause sweating, confusion or convulsions, which is why a bedside glucose is checked promptly.'),
      'Platelets':f(R.platelets,'This count is in the adult reference. A normal count does not exclude eclampsia or remove the need to treat the seizure and hypertension.',plateletSigns),
      'Creatinine':f(R.creatinine,'This is within the general adult interval and below the stated obstetric severe-feature cutoff. Its postpartum trend and urine output still matter.','Renal dysfunction can reduce magnesium clearance, producing reduced reflexes and respiratory depression during excess exposure; monitor clinically and by the pathway.'),
    },
  },
  'hellp-epigastric-pain':{
    diagnosis:'HELLP syndrome with severe systolic hypertension',
    handoff:'EMS is called because presumed indigestion becomes persistent right upper quadrant pain and vomiting. The patient is late in pregnancy, has no known liver disease and has not had trauma. The laboratory pattern turns the complaint into a specific obstetric emergency: hemolysis, elevated liver enzymes and low platelets.',
    course:'The team treats the severe systolic pressure, gives indicated magnesium and arranges urgent delivery after maternal stabilization with obstetric, anesthesia and blood-bank support. Serial blood counts and coagulation studies guide hemorrhage preparation. In this synthetic course, platelet count initially falls further after delivery before recovering with clinical stabilization; liver tests then improve. Persistent or escalating pain would require evaluation for hepatic hematoma or rupture rather than attributing it to routine HELLP discomfort.',
    findings:{
      'Heart rate':f(R.hrAdult,'This is tachycardia. Pain and systemic illness can contribute; absence of external bleeding does not exclude a developing complication.',pulseSigns),
      'Blood pressure':f(R.bpOb,'The systolic component alone meets the severe threshold. A diastolic value below 110 does not make this nonsevere.','Headache, visual disturbance, seizures or epigastric pain may accompany severe disease; abdominal pain is the presenting feature here.'),
      'SpO₂':f(R.sat,'This is in the usual oxygenation interval; it does not exclude major hematologic or hepatic disease.',oxygenSigns),
      'Fetal heart rate':f(R.fetal,'This is in the baseline interval at this assessment. Maternal stabilization and ongoing fetal monitoring remain necessary.','Recurrent decelerations or abnormal variability would add concern even before a sustained abnormal baseline develops.'),
      'Platelets':f(R.platelets,'This is marked thrombocytopenia, below 100 and consistent with the low-platelet component of HELLP.',plateletSigns),
      'AST':f(R.ast,'This is substantially elevated, indicating hepatocellular injury in the right clinical setting.',liverSigns),
      'LDH':f(R.ldh,'This is markedly elevated and exceeds the HELLP-supporting threshold. LDH is nonspecific, but schistocytes add evidence of microangiopathic hemolysis.','Hemolysis may produce pallor, jaundice or dark urine; their absence would not negate the laboratory pattern.'),
      'Smear':f(custom('A normal smear does not contain a pathological excess of fragmented red cells.','lab'),'Schistocytes are red-cell fragments, supporting microangiopathic hemolysis when interpreted with the platelet and enzyme findings.','Hemolysis can accompany fatigue, pallor and jaundice; the smear supplies evidence even before these become prominent.'),
    },
  },
  'hellp-without-severe-bp':{
    diagnosis:'Postpartum HELLP syndrome with nonsevere hypertension',
    handoff:'The bedside nurse requests review because upper abdominal pain and profound malaise persist after delivery. Petechiae appear at recent puncture sites. The pressure is only mildly elevated, but it does not explain or dismiss the severe platelet and hemolysis abnormalities. This conference concerns postpartum HELLP, not routine postoperative discomfort.',
    course:'Obstetrics and critical care repeat blood counts, liver and coagulation tests, assess for bleeding and consider the broader postpartum thrombotic microangiopathy differential. Blood-bank and anesthesia teams are involved according to procedural and bleeding needs. The synthetic course shows no focal hepatic hemorrhage; the platelet count and hemolysis markers recover over the next several days with specialist management. Failure to improve would trigger reassessment for conditions such as TTP or complement-mediated hemolytic uremic syndrome rather than preserving the HELLP label at all costs.',
    findings:{
      'Heart rate':f(R.hrAdult,'This is mild tachycardia, consistent with pain or systemic illness and worth trending with bleeding and perfusion findings.',pulseSigns),
      'Blood pressure':f(R.bpOb,'This is hypertension but does not meet the severe threshold. HELLP can still be severe despite this pressure.','Abdominal pain, malaise, nausea and bruising can be the dominant presentation without extreme hypertension.'),
      'SpO₂':f(R.sat,'This is normal measured oxygenation. It does not reduce the urgency of hemolysis and severe thrombocytopenia.',oxygenSigns),
      'Platelets':f(R.platelets,'This is severe thrombocytopenia, matching the petechiae and creating bleeding and procedural concerns.',plateletSigns),
      'AST':f(R.ast,'This is markedly elevated AST, supporting hepatic injury rather than isolated postpartum discomfort.',liverSigns),
      'LDH':f(R.ldh,'This is markedly elevated. Alongside low haptoglobin it supports hemolysis, while other causes of tissue injury must still be considered.','Hemolysis may cause fatigue, pallor, jaundice or dark urine; pallor and malaise are observed.'),
      'Haptoglobin':f(custom('Haptoglobin is normally detectable within an assay-specific interval; no universal qualitative normal number is supplied here.','lab'),'A low result supports consumption as haptoglobin binds free hemoglobin during intravascular hemolysis. Liver disease and other causes can also lower it.','Hemolysis may cause pallor, jaundice and dark urine; interpret this qualitative result alongside LDH, smear and the blood count.'),
    },
  },
  'pph-boggy-uterus':{
    diagnosis:'Primary postpartum hemorrhage from uterine atony with hemorrhagic shock',
    handoff:'The midwife reports a term vaginal birth followed by a quantified loss of twelve hundred milliliters that is still increasing. The uterus is large and boggy. The patient becomes pale and lightheaded. The disease process is uterine atony causing primary postpartum hemorrhage, with shock established clinically rather than by the first hemoglobin.',
    course:'The team activates the obstetric hemorrhage response, performs uterine massage and gives uterotonics selected around contraindications, early tranexamic acid and resuscitation with blood products as indicated. Access, warming and repeated coagulation assessment proceed together. Persistent atony in this synthetic case requires uterine balloon tamponade in the receiving obstetric unit. Bleeding then slows, circulation improves and serial laboratory results guide further replacement. A firming uterus plus falling blood loss and improved perfusion are the response measures; a single early hemoglobin is not.',
    findings:{
      'Heart rate':f(R.hrAdult,'This is marked tachycardia in ongoing hemorrhage, consistent with compensatory sympathetic activation.',shockSigns),
      'Blood pressure':f(R.bpAdult,'This is hypotension accompanying ongoing blood loss. The patient has hemorrhagic shock, not simply an expected postpartum pressure change.',shockSigns),
      'Respiratory rate':f(R.rrAdult,'This is tachypnea. Shock and metabolic stress can increase breathing even while saturation remains acceptable.','Poor oxygen delivery may produce rapid breathing, pallor and altered interaction without primary lung disease.'),
      'SpO₂':f(R.sat,'This is in the usual reference. It describes hemoglobin saturation, not how much hemoglobin or blood flow remains available.',shockSigns),
      'Hemoglobin':f(R.hemoglobin,'This value is low against the nonpregnant reference, but an early sample can still substantially underrepresent the scale of acute hemorrhage. Do not wait for it to fall before resuscitating.','Acute anemia and hypovolemia may cause pallor, dizziness, tachycardia and syncope; symptoms depend on rate and volume of loss.'),
      'Fibrinogen':f(R.fibrinogen,'This is below 200 and especially concerning after a term birth. Consumption and dilution can rapidly compromise clot formation.','Low fibrinogen may accompany persistent bleeding or diffuse oozing; product replacement follows the hemorrhage protocol and repeated tests.'),
      'Lactate':f(R.lactate,'This is hyperlactatemia in hemorrhagic shock, supporting impaired tissue perfusion without quantifying total blood loss.',shockSigns),
    },
  },
  'pph-firm-uterus':{
    diagnosis:'Primary postpartum hemorrhage from a cervical laceration with evolving coagulopathy',
    handoff:'Following an instrument-assisted birth, the team reports more than fifteen hundred milliliters of continued blood loss despite a firm uterus. The placenta appears complete. This shifts the working source from uterine atony toward genital-tract trauma while other causes remain under review.',
    course:'The hemorrhage team gives resuscitation, early tranexamic acid, warming and indicated blood and coagulation products while an obstetric clinician examines for trauma in a controlled setting. A bleeding cervical laceration is found and repaired in this synthetic case. The uterus remains firm. Hemorrhage decreases after repair and correction of coagulopathy, linking the treatment response to the actual source. Continuing to give uterotonics alone would have failed to repair the laceration.',
    findings:{
      'Heart rate':f(R.hrAdult,'This is marked tachycardia with ongoing blood loss and hypotension.',shockSigns),
      'Blood pressure':f(R.bpAdult,'This is severe hypotension in the hemorrhage context and requires simultaneous resuscitation and source control.',shockSigns),
      'Temperature':f(R.temp,'This is hypothermia. Blood loss, exposure and unwarmed resuscitation can lower temperature and worsen coagulation.','Cold skin, shivering or reduced alertness may accompany hypothermia; active warming is part of hemorrhage care.'),
      'Hemoglobin':f(R.hemoglobin,'This is anemia, consistent with substantial blood loss, while the ongoing clinical state still drives urgency.','Anemia may produce pallor, dyspnea, dizziness or syncope; acute volume loss adds weak pulses and hypotension.'),
      'Fibrinogen':f(R.fibrinogen,'This is well below the hemorrhage replacement threshold, indicating inadequate fibrinogen for reliable clot formation in this context.','Diffuse oozing or persistent wound bleeding may accompany coagulopathy; the laceration still needs direct repair.'),
      'Platelets':f(R.platelets,'This is thrombocytopenia in active hemorrhage. Consumption and dilution are possibilities; it is not by itself proof of HELLP.',plateletSigns),
    },
  },
  'abruption-concealed':{
    diagnosis:'Concealed placental abruption with maternal hemorrhagic shock and fetal compromise',
    handoff:'EMS finds sudden abdominal pain, a continuously firm tender uterus and reduced fetal movement. Only a little dark blood is seen externally. The obstetric diagnosis is suspected concealed abruption; the shock examination and fetal compromise are the reasons to act before a confirmatory scan.',
    course:'Maternal hemorrhage resuscitation and urgent obstetric delivery preparation proceed together, with blood-bank support and repeated coagulation studies. At emergency delivery in this synthetic course, a large retroplacental clot and placental separation confirm the abruption. The newborn requires resuscitation and neonatal admission, while the mother requires continued blood-product and coagulation support. Maternal circulation stabilizes after delivery and hemorrhage control. The outcome makes clear where the missing visible blood had been concealed.',
    findings:{
      'Heart rate':f(R.hrAdult,'This is tachycardia with pallor, diaphoresis and weak pulses, supporting a hemorrhagic shock pattern.',shockSigns),
      'Blood pressure':f(R.bpAdult,'The systolic pressure is close to the lower resting reference and the diastolic below it. With the examination this is inadequate reassurance; the diagnosis of shock does not require crossing a single pressure cutoff.',shockSigns),
      'Fetal heart rate':f(R.fetal,'This is persistent fetal bradycardia, concerning for fetal compromise in the setting of placental separation.','Reduced fetal movement and a sustained abnormal rate may accompany impaired placental oxygen delivery; interpretation requires the full tracing and urgent obstetric assessment.'),
      'Hemoglobin':f(R.hemoglobin,'This is reduced against the nonpregnant reference, but it does not quantify acute concealed hemorrhage. A near-baseline result would not exclude major bleeding.',shockSigns),
      'Fibrinogen':f(R.fibrinogen,'This is markedly concerning in late pregnancy and suggests consumption in the abruption context. The postpartum replacement threshold is a comparison, not a normal antepartum target.','Consumptive coagulopathy may produce ongoing bleeding or oozing from access sites; repeated coagulation assessment is needed.'),
      'Platelets':f(R.platelets,'This is thrombocytopenia, consistent with possible consumption during severe abruption, though the whole coagulation picture is required.',plateletSigns),
    },
  },
  'abruption-trauma':{
    diagnosis:'Trauma-associated placental abruption with evolving fetal compromise',
    handoff:'The patient was restrained in a motor vehicle collision and initially walked at the scene. During EMS assessment, uterine pain and frequent contractions develop. The referring monitor shows recurrent fetal decelerations. A low-speed mechanism does not establish that placental attachment remains intact.',
    course:'Maternal trauma assessment proceeds alongside continuous obstetric monitoring. An initial scan does not show a large retroplacental collection, which does not exclude abruption. In the receiving center, recurrent fetal abnormalities persist and urgent delivery is undertaken. A retroplacental clot confirms partial placental separation in this synthetic case. Maternal pressure stays preserved and no major nonobstetric injury is found; the newborn needs neonatal support. The lesson is a specific placental injury with an initially compensated mother.',
    findings:{
      'Heart rate':f(R.hrAdult,'This is mild tachycardia. Pain, anxiety and pregnancy may contribute, but bleeding and evolving maternal injury must still be assessed.',pulseSigns),
      'Blood pressure':f(R.bpAdult,'This pressure is in the usual resting adult interval. It does not exclude placental injury or early concealed bleeding.',shockSigns),
      'Fetal heart rate':f(R.fetal,'A baseline near 170 is fetal tachycardia if sustained, and recurrent decelerations independently add concern. A single spot rate cannot characterize the full tracing.','Placental compromise may cause recurrent decelerations, altered variability and reduced movement; the recurrent decelerations are documented here.'),
      'Hemoglobin':f(R.hemoglobin,'This is slightly below the nonpregnant reference and can occur with pregnancy dilution. It is not a reliable early exclusion test for acute blood loss.','Major hemorrhage may first show tachycardia, weakness or reduced perfusion before a large measured hemoglobin fall.'),
      'Fibrinogen':f(R.fibrinogen,'This exceeds the postpartum 200 replacement threshold but may still be concerning relative to expected late-pregnancy elevation, especially if falling. It neither confirms nor excludes abruption.','A developing coagulopathy may later cause persistent bleeding or oozing; trend the value with the uterine and fetal findings.'),
    },
  },
  'ppcm-cannot-lie-flat':{
    diagnosis:'Peripartum cardiomyopathy presenting with acute systolic heart failure and pulmonary edema',
    sources:[SOURCES.ef],
    imaging:{ids:['cxr-flash-edema-portable-2026'],narration:'The real comparison chest film comes from a different patient with flash pulmonary edema after a pacing problem, not a postpartum patient. Hazy bilateral perihilar and lower-zone opacities illustrate airspace fluid; a normally aerated lung is more lucent. The device and leads belong to that reference patient. This image teaches the edema pattern, not the cause of our patient’s cardiomyopathy. Etiology comes from postpartum timing, echocardiography and exclusion of alternatives.'},
    handoff:'EMS finds a mother sleeping upright because lying down produces breathlessness. She reports that ankle swelling and fatigue were initially called normal postpartum recovery, but breathlessness now interrupts conversation and routine infant care. The diagnosis is heart failure associated with peripartum cardiomyopathy after competing causes are evaluated.',
    course:'Oxygen, appropriately selected noninvasive respiratory support and intravenous diuresis improve congestion under cardiology and obstetric supervision. The ejection fraction of 28 percent represents substantial systolic dysfunction; a usual adult value is about 55 to 70 percent. This explains the orthopnea and pulmonary edema, while etiology still requires evaluation. The synthetic workup finds no pulmonary embolism, acute coronary cause or preexisting structural disease. A postpartum heart-failure plan accounts for lactation, medications and follow-up echocardiography. Breathing improves during admission, but ventricular recovery is not assumed from symptom relief.',
    findings:{
      'Heart rate':f(R.hrAdult,'This is tachycardia in a congested patient and may be compensating for reduced stroke volume.',pulseSigns),
      'Blood pressure':f(R.bpAdult,'This is preserved pressure. Systolic heart failure and pulmonary edema can occur without hypotension.','Congestion commonly produces orthopnea, elevated neck veins, crackles and edema; all are documented here.'),
      'Respiratory rate':f(R.rrAdult,'This is tachypnea. Pulmonary congestion increases respiratory work and impairs gas exchange.','Heart-failure respiratory distress may produce orthopnea, crackles and accessory-muscle use; orthopnea and crackles are present.'),
      'SpO₂':f(R.sat,'This is hypoxemia on room air in the setting of pulmonary edema.',oxygenSigns),
      'BNP':f(custom('BNP interpretation depends on the assay and clinical setting. This BNP assay lists 0 to 100 picograms per milliliter as its reference; that is not a universal pregnancy reference or a stand-alone diagnosis.','bnp'),'This is markedly elevated and supports cardiac wall stress. It does not diagnose peripartum cardiomyopathy by itself.','Heart failure may cause orthopnea, neck-vein distension, edema and crackles; the echocardiogram and full evaluation connect the biomarker to this case.'),
      'Creatinine':f(R.creatinine,'This is within the general adult reference near its upper end. At three weeks postpartum, trend and prior renal function matter more than treating a pregnancy threshold as an automatic diagnosis.','Renal congestion or low perfusion can cause oliguria and rising creatinine during heart failure; monitor response to diuresis.'),
    },
  },
  'ppcm-shock':{
    diagnosis:'Peripartum cardiomyopathy complicated by cardiogenic shock and pulmonary edema',
    imaging:{ids:['cxr-flash-edema-portable-2026'],narration:'The real comparison chest film comes from a different patient with flash pulmonary edema after a pacing problem, not a postpartum patient. Hazy bilateral perihilar and lower-zone opacities illustrate airspace fluid; a normally aerated lung is more lucent. The device and leads belong to that reference patient. This image teaches the edema pattern, not the cause of our patient’s cardiomyopathy. Etiology comes from postpartum timing, echocardiography and exclusion of alternatives.'},
    handoff:'The partner calls EMS because severe postpartum breathlessness is followed by confusion and very little urine. The patient is cool despite wet lungs and elevated neck veins. The small fluid intervention has not improved perfusion. This is a low-output congested shock presentation requiring cardiac as well as obstetric expertise.',
    course:'A shock team coordinates vasoactive and inotropic support, respiratory escalation and transfer to a center capable of mechanical circulatory support. Specialist echocardiography shows severe global left-ventricular dysfunction; evaluation does not identify acute infarction, pulmonary embolism or a prior cardiomyopathy. Those findings establish peripartum cardiomyopathy in this synthetic case. Circulation remains inadequate despite initial support, so temporary mechanical circulatory support is used in the receiving unit. Over subsequent days perfusion, urine output and lactate improve. Long-term cardiac recovery remains uncertain and requires serial imaging; stabilization is the reported outcome, not a promise of a normal heart.',
    findings:{
      'Heart rate':f(R.hrAdult,'This is marked tachycardia with weak pulses, consistent with a stressed low-output circulation.',pulseSigns),
      'Blood pressure':f(R.bpAdult,'This is severe hypotension with congestion and poor perfusion, supporting cardiogenic shock rather than isolated postpartum fluid retention.','Low output may produce cool clammy skin, confusion, weak pulses and oliguria; all are present in this case.'),
      'Respiratory rate':f(R.rrAdult,'This is marked tachypnea. Pulmonary edema and metabolic stress from shock can both increase the drive to breathe.','Crackles, orthopnea, recession or inability to speak comfortably can accompany pulmonary edema; respiratory fatigue requires escalation.'),
      'SpO₂':f(R.sat,'This is persistent hypoxemia despite oxygen in a congested patient. Respiratory escalation must account for its effect on blood pressure.',oxygenSigns),
      'Lactate':f(R.lactate,'This is hyperlactatemia in a clinically low-output state. It supports the perfusion assessment but is followed with examination and urine output.','Shock may cause confusion, cool skin and oliguria; these are documented rather than inferred from lactate alone.'),
      'Creatinine':f(R.creatinine,'This exceeds the general adult reference and suggests renal impairment in the shock context; baseline and serial results are needed to define acute injury.','Renal hypoperfusion and congestion can produce scant urine and fluid accumulation; scant urine is part of this presentation.'),
    },
  },
};
