/** Domains II and X extensions: extra teaching sections that bring each full course to 15–25 minutes. */
import type { Question, Section } from '../types';
type Extra = { sections: Section[]; questions: Question[] };
const S = (id: string, title: string, body: string[]): Section => ({ id, title, body });

export const FINAL_EXTRAS: Record<string, Extra> = {
  'fpc-gas-laws': { questions: [], sections: [S('equipment', 'Equipment checklist for altitude', [
    'Before every flight with a cabin altitude above a few thousand feet, run through the gas-filled items: ETT and tracheostomy cuffs (measure pressure, or fill with saline), urinary catheter balloons (usually water-filled, but check), air splints and vacuum mattresses (soften on climb, firm on descent), MAST or pelvic devices, chest drains (one-way valves venting, not clamped), nasogastric tubes on free drainage for bowel distension, and IV bags (vented or in pumps; avoid glass bottles).',
    'Patients with recent laparoscopic surgery, colonoscopy or abdominal trauma may have free intraperitoneal gas that expands; pneumocephalus after skull fractures or neurosurgery can raise ICP; and intraocular gas after retinal surgery is an absolute contraindication to flight until absorbed.',
    'Ventilators may deliver different volumes at altitude depending on their design; check exhaled tidal volumes after climbing and adjust. Oxygen flowmeters calibrated at sea level may read inaccurately at altitude.',
  ])] },
  'fpc-hypoxias': { questions: [], sections: [S('oxycurve', 'The oxyhaemoglobin curve at altitude', [
    'The sigmoid shape of the oxyhaemoglobin dissociation curve protects healthy people: on the flat upper part, PaO₂ can fall from 100 to about 60 mmHg with saturation still around 90 %. Below about 60 mmHg the curve steepens, and small further falls in PaO₂ cause large drops in saturation and oxygen content. Patients already on the steep part at sea level are most at risk when they fly.',
    'Shifts of the curve change oxygen loading and unloading: a right shift (acidosis, hypercapnia, fever, raised 2,3-DPG) releases oxygen to tissues more easily; a left shift (alkalosis, hypothermia, carbon monoxide, fetal haemoglobin, stored blood with low 2,3-DPG) holds oxygen more tightly. Hyperventilation at altitude causes a respiratory alkalosis that shifts the curve left.',
    'Pulse oximeters measure saturation, not content or delivery. Oxygen delivery depends on haemoglobin, saturation and cardiac output; a patient with anaemia or low output may be hypoxic at the tissues despite a reassuring SpO₂.',
  ])] },
  'fpc-flight-stressors': { questions: [], sections: [S('crew', 'Protecting the crew', [
    'Crew are exposed to every stressor on every flight, shift after shift. Hearing protection (helmets with good seals, earplugs underneath) prevents cumulative noise-induced hearing loss. Hydration matters: dry cabin air and long shifts lead to dehydration, which worsens fatigue, headache and G-tolerance.',
    'Back injuries are common from lifting and working bent over in confined cabins. Use lifting aids, plan patient moves with enough people, and keep fit. Whole-body vibration contributes to back pain over a career.',
    'Motion sickness affects crew, especially when working head-down in turbulence; looking at the horizon, ventilation and avoiding heavy meals help. Some crew use non-sedating antiemetic strategies; sedating antihistamines are inappropriate for crew on duty.',
  ])] },
  'fpc-altitude-injuries': { questions: [], sections: [S('fly', 'Flying after diving and other precautions', [
    'Flying soon after diving can trigger decompression sickness even after a dive that was safe at sea level, because the further pressure reduction allows bubbles to form. Common recommendations are to wait at least 12 hours after a single no-decompression dive and at least 18 hours after multiple dives or multiple days of diving; longer after dives requiring decompression stops. This applies to patients and crew alike.',
    'Patients transported after a diving accident should have their dive profile (depths, times, ascent rate, gas used) recorded and sent with them. Diving medicine advice lines can help with destination and treatment decisions.',
    'Crew working in mountain operations should acclimatise where possible, recognise AMS in themselves, and avoid strenuous exertion soon after rapid ascent to high landing sites.',
  ])] },
  'fpc-tuc': { questions: [], sections: [S('equipment', 'Emergency oxygen equipment', [
    'Pressurised aircraft carry emergency oxygen for crew (quick-donning masks for pilots, masks or portable cylinders for medical crew) and passengers. Know where your mask is, how to put it on with one hand, and how to switch the patient\'s oxygen source if the main supply is affected.',
    'The patient\'s supply is usually separate from the emergency system: ventilated patients continue on the transport ventilator, but its oxygen source and FiO₂ need checking immediately after a decompression. Non-ventilated patients receive oxygen by non-rebreather mask.',
    'Practise the decompression drill during training, including donning masks while seated and restrained and communicating via the intercom with masks on.',
  ])] },
  'fpc-cabins': { questions: [], sections: [S('decision', 'Choosing the vehicle', [
    'The best vehicle depends on distance, weather, patient needs and time-critical treatment at the destination. Helicopters suit scene responses and shorter interfacility transfers; fixed-wing aircraft suit longer distances; ground critical care transport suits short distances, poor flying weather or patients who would not benefit from speed.',
    'Altitude-sensitive patients add a further dimension: a helicopter route through mountains may expose them to more altitude than a pressurised fixed-wing with a sea-level cabin, despite the latter\'s higher cruising altitude. Ground transport may be best when neither aircraft can keep the patient safe.',
    'Make the decision with the pilot, the receiving team and medical control, and document the reasoning — particularly when choosing a slower option for safety.',
  ])] },
  'fpc-accreditation': { questions: [], sections: [S('international', 'Other standards and certifications', [
    'Certifications relevant to transport clinicians include the FP-C (Certified Flight Paramedic) and CCP-C (Certified Critical Care Paramedic) from the IBSC, and the CFRN, CTRN and CPEN credentials for nurses from the BCEN. Certification requires passing an exam and periodic recertification through continuing education or re-examination.',
    'Other relevant standards include aviation safety programmes (such as operator SMS and flight data monitoring), infection prevention standards, and specific clinical programme standards (for example, for neonatal and paediatric transport teams).',
    'Accreditation and certification complement each other: an accredited programme provides the training, protocols and safety systems in which certified clinicians practise.',
  ])] },
  'fpc-research': { questions: [], sections: [S('reading', 'Reading a paper quickly', [
    'Start with the abstract to see the question, design and main result, then go to the methods: who was studied (inclusion and exclusion criteria), how they were allocated, what was compared, what the primary outcome was, and how long follow-up lasted. Check the baseline characteristics table to see if groups were similar.',
    'In the results, focus on the primary outcome with its confidence interval and absolute effect; secondary outcomes and subgroup analyses are hypothesis-generating unless pre-specified and adequately powered. Check how many participants were lost to follow-up.',
    'In the discussion, look for limitations the authors acknowledge and those they do not. Finally, ask whether the findings apply to your patients and setting.',
  ])] },
  'fpc-privacy': { questions: [], sections: [S('practice', 'Privacy in everyday transport work', [
    'Patient care reports should be completed on secure devices and transmitted through approved systems; avoid personal email, messaging apps or unsecured cloud storage. Log out of shared devices and lock screens. Paper documents should be secured and destroyed appropriately.',
    'At handover, share what the receiving team needs; avoid discussing details in public areas such as hallways or waiting rooms where family members of other patients can hear. When families ask for information by phone, verify identity and follow programme policy.',
    'Students, observers and ride-alongs must be briefed on confidentiality and sign agreements before participating.',
  ])] },
  'fpc-just-culture': { questions: [], sections: [S('leaders', 'Leaders and just culture', [
    'Leaders set the tone. When an error is reported, the first response — curiosity or blame — teaches everyone whether reporting is safe. Leaders should thank reporters, focus on understanding what happened and why, and share what was learned.',
    'Consistency matters: similar behaviours should receive similar responses regardless of outcome, seniority or popularity. Decision tools (just culture algorithms) help managers apply the framework consistently and fairly.',
    'Just culture also applies to aviation and medical interfaces: a pilot\'s weather decision, a dispatcher\'s error or a crew member\'s concern should all be met with the same fair, learning-focused approach.',
  ])] },
  'fpc-ebm': { questions: [], sections: [S('protocols', 'From evidence to protocol', [
    'Transport protocols translate evidence into practice for a specific system. A good protocol states its evidence base and the strength of that evidence, defines inclusion and exclusion criteria, gives clear doses and steps, includes decision points and when to contact medical control, and specifies how adherence and outcomes will be measured.',
    'Protocols should be reviewed on a regular cycle (often every 1–2 years) and whenever important new evidence appears. Front-line clinicians should be involved in drafting and testing them.',
    'Deviation from protocol is sometimes appropriate when patient circumstances differ; it should be justified, documented, and reviewed — which may reveal where a protocol needs updating.',
  ])] },
  'fpc-ethics': { questions: [], sections: [S('conflict', 'Disagreements and difficult conversations', [
    'Conflicts arise between family members, between family and clinicians, and between sending and receiving teams — for example, a family requesting transfer for treatment the receiving team considers futile, or a family insisting on full treatment despite a POLST form limiting it. Involve medical control, focus on the patient\'s known wishes and best interests, and seek ethics consultation when time permits.',
    'Communication skills matter: listen first, acknowledge emotions, give clear information in plain language, avoid jargon, and check understanding. Phrases such as "What do you know about your father\'s wishes?" and "We will make sure he is comfortable" help.',
    'Document discussions carefully: who was present, what was said, what was decided and why.',
  ])] },
  'fpc-gamut': { questions: [], sections: [S('own', 'Building your programme\'s quality system', [
    'A programme\'s quality system combines external metrics (such as GAMUT), internal priorities (for example, a recent problem with medication errors) and accreditation requirements. A small number of well-chosen metrics, reviewed regularly, is more useful than many metrics collected and ignored.',
    'Data sources include electronic patient care records, dispatch systems, safety reports and case reviews. Dashboards that show trends over time help teams see progress.',
    'Clinicians contribute by documenting accurately, participating in case reviews, suggesting improvements and joining quality committees. Every crew member is part of the quality system.',
  ])] },
  'fpc-caregiver-wellbeing': { questions: [], sections: [S('family', 'Families, transitions and long careers', [
    'The effects of the work reach home. Families may notice irritability, withdrawal or sleep problems before the clinician does. Programmes that include families in wellbeing education and resources strengthen support networks.',
    'Career transitions — leaving flight work because of injury, age, burnout or organisational change — can bring a loss of identity and purpose. Planning ahead, maintaining interests outside work and staying connected with colleagues help.',
    'Long careers in transport medicine are possible and rewarding when individuals and organisations treat wellbeing as part of safety: a rested, supported clinician makes better decisions for patients.',
  ])] },
};
