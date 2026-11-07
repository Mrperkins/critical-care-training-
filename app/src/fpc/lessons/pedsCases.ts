/** Domain IX extensions: extra teaching sections that bring each full course to 15–25 minutes. */
import type { Question, Section } from '../types';
type Extra = { sections: Section[]; questions: Question[] };
const S = (id: string, title: string, body: string[]): Section => ({ id, title, body });

export const PEDS_EXTRAS: Record<string, Extra> = {
  'fpc-peds-dx': { questions: [], sections: [S('family', 'Family-centred assessment', [
    'Parents notice subtle changes before monitors do: "She\'s not herself", "He stopped feeding", "She\'s too quiet". Take these concerns seriously — parental concern is an independent predictor of serious illness in children. Ask what the child is usually like and what has changed.',
    'Assess young children on a parent\'s lap where possible, start with the least invasive observations (breathing, colour, behaviour from a distance), and save distressing procedures for last. A calm child gives a more accurate respiratory rate, heart rate and work of breathing; a screaming child\'s findings are hard to interpret.',
    'Explain to the family what you are doing and why, in plain language. Ask about the child\'s past medical history, birth history in infants, immunisations, medications, allergies and recent illness. These details shape both diagnosis and destination.',
  ])] },
  'fpc-peds-labs': { questions: [], sections: [S('sampling', 'Getting samples from small patients', [
    'Blood volume in children is small — about 80–90 mL/kg in infants — so repeated sampling can cause iatrogenic anaemia in neonates. Prioritise the tests that change management, and use point-of-care devices that need small volumes. Capillary samples (heel in infants, finger in children) give glucose, gas and some electrolytes, but squeezing causes haemolysis.',
    'IO access provides samples for blood gas, glucose, electrolytes, haemoglobin and cross-match, although values (particularly potassium and some cell counts) may differ slightly from venous values. Label the sample source.',
    'Interpret results against the child\'s age and the time of sampling relative to treatments: a glucose after a dextrose bolus or a potassium after salbutamol nebulisers will not reflect the baseline.',
  ])] },
  'fpc-peds-pharm': { questions: [], sections: [S('routes', 'Routes without IV access', [
    'Many drugs can be given without an IV. Intranasal (via an atomiser, up to about 1 mL per nostril): fentanyl, midazolam, ketamine, naloxone and dexmedetomidine. Intramuscular: epinephrine for anaphylaxis (anterolateral thigh), midazolam for seizures, ketamine for sedation, naloxone, ceftriaxone. Buccal midazolam for seizures. Rectal diazepam or paracetamol where other routes are unavailable.',
    'Intraosseous access delivers any IV drug or fluid with similar onset and dose; the proximal tibia is the usual site in children, with the distal femur and humerus as alternatives. Flush with saline after each drug; IO infusion may need a pressure bag or syringe push.',
    'Endotracheal drug administration is no longer recommended when IV or IO access is possible, because absorption is unpredictable.',
  ])] },
  'fpc-peds-monitor': { questions: [], sections: [S('capno', 'Capnography beyond the intubated child', [
    'Nasal-oral capnography cannulas measure end-tidal CO₂ in spontaneously breathing children. They detect hypoventilation during sedation well before desaturation, show the respiratory rate accurately, and give an early warning of obstruction (a shark-fin waveform in bronchospasm, loss of waveform in apnoea or obstruction).',
    'In DKA, a low EtCO₂ reflects the degree of respiratory compensation for metabolic acidosis; a rising EtCO₂ in an exhausted child with asthma or bronchiolitis suggests fatigue. In cardiac arrest, EtCO₂ reflects the quality of chest compressions and a sudden rise suggests return of spontaneous circulation.',
    'Low-flow sidestream sampling suits small children; mainstream sensors add dead space and weight to small tubes. Combine capnography with direct observation — no monitor replaces looking at the child.',
  ])] },
  'fpc-peds-airway-disease': { questions: [], sections: [S('anaphylaxis', 'Anaphylaxis and angio-oedema in children', [
    'Anaphylaxis can cause upper airway swelling (stridor, hoarseness), bronchospasm (wheeze), hypotension and gastrointestinal symptoms after an allergen — food is the commonest trigger in children. Give IM epinephrine 0.01 mg/kg of 1 mg/mL (maximum 0.5 mg) into the anterolateral thigh immediately and repeat every 5 minutes as needed. Add fluids for hypotension and nebulised salbutamol for wheeze; antihistamines and steroids are adjuncts, not first-line treatment.',
    'Refractory anaphylaxis needs an epinephrine infusion. Airway swelling may make intubation difficult — prepare for a surgical or needle airway. Biphasic reactions can occur hours later, so children are observed after treatment.',
    'Hereditary angio-oedema causes swelling without urticaria and does not respond to epinephrine; it needs C1 esterase inhibitor or bradykinin-pathway drugs. Families usually know the diagnosis and carry treatment.',
  ])] },
  'fpc-nat': { questions: [], sections: [S('other', 'Other presentations and the crew\'s wellbeing', [
    'Non-accidental injury is not limited to bruises and head trauma. Abdominal injuries (duodenal haematoma, pancreatic and liver injury) can present with vomiting and abdominal pain without external bruising. Burns, poisoning with medicines or drugs, neglect (malnutrition, untreated illness) and fabricated or induced illness (where a caregiver causes or invents symptoms) are other forms.',
    'Older children may disclose abuse to a clinician. Listen calmly, do not ask leading questions, reassure them that they were right to tell, and do not promise to keep it secret — explain that you must tell people who can help. Record their words exactly.',
    'Caring for abused children is distressing. Debrief with your team, use peer support or employee assistance programmes, and recognise that strong emotions are normal responses to these cases.',
  ])] },
  'fpc-peds-fluids': { questions: [], sections: [S('access', 'Vascular access in children', [
    'Peripheral access is difficult in shocked, dehydrated or small children. Limit peripheral attempts in critical situations: if access fails within about 90 seconds or two attempts in a child in shock or arrest, place an intraosseous needle. Ultrasound-guided peripheral access improves success in difficult cases.',
    'IO sites: proximal tibia (1–2 cm below the tibial tuberosity on the flat medial surface), distal femur, and proximal humerus in older children. Complications include extravasation (compartment syndrome), dislodgement and, rarely, osteomyelitis. Secure the needle carefully for transport and check the limb regularly.',
    'Measure fluid volumes precisely in small children: use burettes or syringe pumps rather than free-flowing bags, which can deliver large volumes unnoticed during a flight.',
  ])] },
  'fpc-peds-dka': { questions: [], sections: [S('transport', 'DKA in transport', [
    'Before departure, document the start time of fluids and insulin, the volumes given, and the latest glucose, gas and electrolytes. Use separate infusion pumps for insulin, maintenance fluids with potassium, and dextrose so that each can be adjusted independently (the "two-bag system" uses two bags with different dextrose concentrations to adjust glucose without changing the total rate).',
    'Check capillary glucose hourly in flight and neurological status at least hourly. A falling glucose below target means adding dextrose, not stopping insulin. Hypokalaemia and hypoglycaemia are the commonest complications of treatment.',
    'Children with DKA and a reduced level of consciousness need a gastric tube for vomiting and aspiration risk. Intubation is avoided where possible because of the risks described; if needed, the most experienced operator performs it with careful ventilation targets.',
  ])] },
  'fpc-special-needs': { questions: [], sections: [S('transition', 'Medical complexity and planning ahead', [
    'Children with medical complexity often have multiple specialists, devices and medications, and frequent hospital admissions. Advance care plans may specify limits on interventions or preferred hospitals; check for them and respect them, while confirming the current wishes of the family.',
    'Many of these children have unusual "normal" values — chronic hypoxaemia in cyanotic heart disease, compensated respiratory acidosis in neuromuscular disease, low muscle tone, or baseline tachycardia. Treat the child relative to their own baseline, not textbook norms.',
    'Transport may be needed to the child\'s usual specialist centre rather than the nearest hospital, because their records, team and equipment are there. Discuss destination with the family and receiving teams before departure when the child\'s condition allows.',
  ])] },
  'fpc-high-tech': { questions: [], sections: [S('other', 'Other devices you may meet', [
    'Implanted cardiac devices (pacemakers and defibrillators) occur in children with congenital heart disease. Magnet placement disables defibrillator shocks and sets pacemakers to a fixed rate; do this only when indicated. Children with single-ventricle physiology (after Norwood, Glenn or Fontan operations) have specific oxygen saturation targets and are sensitive to changes in pulmonary vascular resistance — seek cardiology advice.',
    'Insulin pumps and continuous glucose monitors are common in children with diabetes; in DKA or severe illness the pump is usually stopped and IV insulin started. Vagal nerve stimulators for epilepsy can be activated with a magnet to abort seizures. Cochlear implants need the external processor protected.',
    'Families are usually the experts on these devices. Bring device information cards, chargers and supplies with the child.',
  ])] },
  'fpc-peds-infectious': { questions: [], sections: [S('febrile', 'The febrile infant', [
    'Infants under 3 months with fever (38 °C or higher) have a significant risk of serious bacterial infection: urinary tract infection most commonly, then bacteraemia and meningitis. Their signs are subtle, and appearance is less reliable than in older children. Febrile infants under 28 days need full evaluation (blood, urine and CSF cultures) and empirical antibiotics; those aged 29–60 days are risk-stratified with inflammatory markers per guidelines.',
    'Neonatal herpes simplex virus infection presents with fever or hypothermia, seizures, vesicles or sepsis-like illness in the first weeks of life and needs acyclovir. Hypothermia is as concerning as fever in neonates.',
    'For transport, these infants need glucose monitoring, temperature control, cultures drawn before antibiotics if possible without delay, and early antibiotics.',
  ])] },
  'fpc-peds-vent': { questions: [], sections: [S('niv', 'Non-invasive support in children', [
    'High-flow nasal cannula and CPAP or bilevel NIV can avoid intubation in many children with bronchiolitis, pneumonia and asthma. Signs of success within 1–2 hours include falling heart and respiratory rates and reduced work of breathing; failure signs include rising oxygen needs, worsening work of breathing, apnoeas, rising CO₂ and decreasing consciousness.',
    'Interfaces must fit — nasal prongs, nasal masks, full-face masks and helmets come in paediatric sizes. Gastric distension from NIV can splint the diaphragm; a gastric tube helps. Agitated children may need light sedation (dexmedetomidine or low-dose ketamine) to tolerate NIV.',
    'For transport, decide before departure whether NIV is likely to succeed for the duration of the flight. A child who is failing or borderline is safer intubated on the ground than in a confined, noisy cabin.',
  ])] },
};
