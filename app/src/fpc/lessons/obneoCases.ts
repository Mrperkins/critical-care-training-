/** Domain VIII extensions: extra teaching sections that bring each full course to 15–25 minutes. */
import type { Question, Section } from '../types';
type Extra = { sections: Section[]; questions: Question[] };
const S = (id: string, title: string, body: string[]): Section => ({ id, title, body });

export const OBNEO_EXTRAS: Record<string, Extra> = {
  'fpc-ob-dx': { questions: [], sections: [S('trauma', 'The injured pregnant patient', [
    'Trauma is a leading non-obstetric cause of maternal death. Resuscitating the mother is the best way to resuscitate the fetus: oxygen, left uterine displacement after 20 weeks, early blood, and avoiding hypotension. Maternal compensation can hide blood loss of 1–1.5 L, and the fetus may be the first to show maternal shock through an abnormal heart rate.',
    'Even minor trauma can cause placental abruption, often hours later. Pregnant trauma patients beyond about 20–24 weeks are monitored with continuous cardiotocography for at least 4–6 hours at a facility able to manage obstetric complications. Rh-negative mothers receive anti-D, and a Kleihauer–Betke test quantifies fetal-maternal haemorrhage.',
    'Pelvic binders, imaging and drugs are used as needed — necessary radiation should not be withheld. Seat belts should sit below the abdomen across the pelvis; abdominal bruising from a lap belt is a warning sign of uterine and placental injury.',
  ])] },
  'fpc-ob-labs': { questions: [], sections: [S('sepsis', 'Sepsis and other conditions in pregnancy', [
    'Maternal sepsis is a leading cause of maternal death. Normal pregnancy changes (raised heart rate, lower blood pressure, raised white cell count) blur the usual criteria, so obstetric-specific early warning scores are used. Lactate is not raised by normal pregnancy, although it rises in labour; a lactate above 2 mmol/L in a pregnant patient with suspected infection is concerning.',
    'Common sources: chorioamnionitis, endometritis after delivery, pyelonephritis, wound infection and pneumonia. Group A streptococcus causes rapidly progressive, severe sepsis. Treat with early broad-spectrum antibiotics (within an hour), fluids and source control, and monitor the fetus.',
    'Acute fatty liver of pregnancy (third trimester; nausea, vomiting, jaundice, hypoglycaemia, coagulopathy, raised ammonia) overlaps with HELLP but has more marked hypoglycaemia, liver failure and coagulopathy. It requires delivery and intensive care.',
  ])] },
  'fpc-ob-pharm': { questions: [], sections: [S('safety', 'Drug safety in pregnancy and breastfeeding', [
    'Most emergency drugs can be used in pregnancy when needed — the mother\'s health comes first. Drugs to avoid or use cautiously: ACE inhibitors and ARBs (fetal renal toxicity), warfarin (teratogenic in the first trimester), NSAIDs after about 20 weeks (oligohydramnios, ductal constriction), tetracyclines, and valproate (neural tube defects). Opioids, paracetamol, most antibiotics (penicillins, cephalosporins), heparins, labetalol, nifedipine and standard resuscitation drugs are used routinely.',
    'RSI in pregnancy: anticipate a difficult airway (oedema, large breasts, aspiration risk, rapid desaturation from reduced functional residual capacity and higher oxygen consumption). Preoxygenate well with head-up positioning, use a smaller tube, and use standard induction doses; succinylcholine and rocuronium are appropriate. Magnesium potentiates non-depolarising neuromuscular blockers.',
    'Most drugs given to a breastfeeding mother are compatible with breastfeeding; for specific questions, consult the LactMed database.',
  ])] },
  'fpc-ob-monitor': { questions: [], sections: [S('altitude', 'Altitude, motion and the obstetric patient', [
    'At altitude, the partial pressure of oxygen falls. The fetus is relatively protected by fetal haemoglobin (which binds oxygen more tightly) and a left-shifted dissociation curve, but maternal hypoxia reduces fetal oxygen delivery. Give supplemental oxygen to keep maternal SpO₂ at or above about 95 % and consider requesting a lower cabin altitude in fixed-wing transport for compromised pregnancies.',
    'Motion sickness and vomiting are common; antiemetics such as ondansetron or metoclopramide are used. Vibration and noise make auscultation impossible — rely on monitors with visual displays and Doppler devices. Restrain the pregnant patient with the lap belt below the abdomen and maintain left tilt with a wedge.',
    'Plan for delivery in the aircraft even when it is unlikely: a delivery kit, neonatal resuscitation equipment, warming and a plan for who does what. In-flight delivery is rare but chaotic without preparation.',
  ])] },
  'fpc-delivery-complications': { questions: [], sections: [S('newborn', 'The newborn after a complicated delivery', [
    'Complicated deliveries often produce compromised newborns. After cord prolapse, abruption, shoulder dystocia or prolonged breech delivery, expect a baby who needs resuscitation: prepare warming, suction, a bag-mask with appropriately sized masks, pulse oximetry and a person dedicated to the newborn.',
    'Shoulder dystocia can cause brachial plexus injury (Erb palsy) and clavicle or humerus fractures in the baby, and perineal trauma and PPH in the mother. Breech delivery risks head entrapment and hypoxia. Abruption can cause fetal anaemia and hypovolaemic shock in the newborn — 10 mL/kg of O-negative blood may be needed.',
    'Document times precisely: time of the head delivering, time of the body, onset of resuscitation and Apgar scores at 1 and 5 minutes. These records matter for the receiving neonatal team and for therapeutic hypothermia decisions.',
  ])] },
  'fpc-multiple-birth': { questions: [], sections: [S('neonates', 'Caring for multiple neonates', [
    'Twins and triplets are often preterm and small, and each needs its own warming, resuscitation equipment and staff. Before delivery, set up separate resuscitation stations and assign teams. Monochorionic twins with TTTS may be born with opposite problems: the donor anaemic and hypovolaemic (may need blood), the recipient polycythaemic with heart failure (may need partial exchange and inotropes).',
    'Identification is critical: label each baby and their samples clearly and consistently, record birth order and times, and ensure that the receiving unit receives correct information for each infant.',
    'When transport resources are limited, prioritise the sickest infant for immediate transfer and arrange additional teams for the others; communicate clearly with parents about where each baby is going.',
  ])] },
  'fpc-preeclampsia': { questions: [], sections: [S('pres', 'Neurological complications and mimics', [
    'Posterior reversible encephalopathy syndrome (PRES) causes headache, visual disturbance, altered consciousness and seizures from vasogenic oedema in the posterior brain, associated with severe hypertension and endothelial dysfunction. It usually resolves with blood pressure control and delivery. Intracerebral haemorrhage — the most feared complication of severe hypertension in pregnancy — presents with sudden headache, focal signs or coma and needs urgent imaging and neurosurgical input.',
    'Cerebral venous sinus thrombosis is more common in pregnancy and the postpartum period (hypercoagulability, dehydration) and presents with headache, seizures and focal deficits. Stroke, hypoglycaemia, epilepsy and drug toxicity are other causes of seizures in pregnancy.',
    'A seizure that is atypical (focal, prolonged, recurrent despite magnesium) or followed by persistent deficits needs imaging. Transport to a centre with neuroimaging, neurosurgery, obstetrics and intensive care.',
  ])] },
  'fpc-prom': { questions: [], sections: [S('gbs', 'Group B streptococcus and neonatal sepsis', [
    'Group B streptococcus (GBS) colonises the genital tract of about a fifth to a quarter of pregnant women and is a leading cause of early-onset neonatal sepsis, pneumonia and meningitis. Intrapartum antibiotic prophylaxis (penicillin or ampicillin; cefazolin or clindamycin/vancomycin with penicillin allergy per protocol) is given to colonised women, those with unknown status and risk factors (preterm labour, prolonged rupture over 18 hours, intrapartum fever), and women with previous GBS-affected babies.',
    'Neonates born after PROM or PPROM, maternal fever or chorioamnionitis are assessed for early-onset sepsis using risk calculators or clinical observation; symptomatic babies receive blood cultures and antibiotics (ampicillin and gentamicin).',
    'Communicate maternal risk factors to the receiving neonatal team: duration of rupture, maternal temperature, GBS status and antibiotic timing.',
  ])] },
  'fpc-maternal': { questions: [], sections: [S('cardiac', 'Cardiac disease and VTE in pregnancy', [
    'Cardiovascular disease is a leading cause of maternal death in high-income countries. Peripartum cardiomyopathy presents in late pregnancy or the months after delivery with heart failure (breathlessness, orthopnoea, oedema) and reduced ejection fraction. Pre-existing congenital or valvular disease (especially mitral stenosis and pulmonary hypertension) can decompensate with the haemodynamic load of pregnancy and delivery.',
    'Venous thromboembolism is several times more common in pregnancy and the postpartum period. Pulmonary embolism presents with breathlessness, chest pain, tachycardia and hypoxia; massive PE causes shock and arrest. Anticoagulation uses low-molecular-weight heparin; thrombolysis is considered for life-threatening PE despite pregnancy.',
    'Aortic dissection is also more common in pregnancy, especially in Marfan syndrome. Chest pain in a pregnant patient therefore deserves the same — or greater — diagnostic urgency as in any other adult.',
  ])] },
};
