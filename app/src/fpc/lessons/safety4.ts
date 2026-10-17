/** FP-C I.10–I.12: personal wellness; hazard reporting; communication and radio operations. */
import type { FpcLesson } from '../types';

export const WELLNESS: FpcLesson = {
  id: 'fpc-wellness', domain: 'safety', ref: 'I.10',
  title: 'Personal wellness: fatigue, fitness for duty and self-assessment',
  summary: 'Fatigue and circadian disruption in 24-hour air medical work, the IMSAFE self-check, alcohol and medication rules, physical fitness, and how a just safety culture supports crew who stand themselves down.',
  objectives: [
    'Describe the effects of fatigue and circadian disruption on performance.',
    'Apply the IMSAFE checklist and fitness-for-duty rules.',
    'Use fatigue countermeasures and know when to stand down.',
  ],
  sections: [
    {
      id: 'fatigue', title: 'Fatigue and the body clock', core: true,
      body: [
        'Fatigue degrades reaction time, attention, memory, decision-making and communication — the skills that matter most at 03:00 on a hard mission. Being awake for 17–19 hours impairs performance about as much as a blood alcohol concentration of 0.05 %, and 24 hours awake is comparable to 0.1 %. Fatigued people are poor judges of their own impairment.',
        'The circadian low occurs between roughly 02:00 and 06:00, when alertness is lowest regardless of how much sleep you had; a smaller dip occurs mid-afternoon. Night shifts, 24-hour shifts and rotating schedules disrupt sleep and accumulate sleep debt, which only sleep repays. Microsleeps — brief lapses of a few seconds — can occur without awareness.',
        'Long-term shift work is associated with cardiovascular disease, metabolic disorders, mood disturbances and accidents on the drive home. Air medical programmes manage fatigue through scheduling, rest facilities, limits on duty time and policies that allow crew to decline flights when fatigued.',
      ],
    },
    {
      id: 'imsafe', title: 'Fitness for duty: IMSAFE', core: true,
      body: [
        'Pilots and crew use the IMSAFE checklist before each shift and flight: Illness (any symptoms, including colds that block the ears and sinuses — barotrauma risk at altitude), Medication (prescription and over-the-counter drugs that cause drowsiness, such as antihistamines), Stress (personal, financial, work), Alcohol (FAA pilots: no alcohol within 8 hours of flight — "8 hours bottle to throttle" — and a blood alcohol concentration below 0.04 %; many programmes extend this to 12 hours and apply it to all crew), Fatigue, and Emotion (or Eating — dehydration and hypoglycaemia also impair performance).',
        'Recent scuba diving is a specific risk: flying soon after diving can cause decompression sickness. Common guidance is to wait at least 12 hours after a single no-decompression dive and 18 hours after multiple dives or multiple days of diving, longer after dives requiring decompression stops. Recent blood donation can reduce tolerance to hypoxia.',
        'Physical fitness matters: crew lift stretchers and patients in awkward positions, often at night and in poor weather, and must be able to egress the aircraft in an emergency. Many programmes set weight limits (for aircraft performance and seat certification) and fitness standards.',
      ],
      list: { caption: 'IMSAFE', items: ['Illness', 'Medication', 'Stress', 'Alcohol', 'Fatigue', 'Emotion / Eating'] },
    },
    {
      id: 'counter', title: 'Countermeasures and standing down', core: true,
      body: [
        'Prioritise sleep: protect a 7–9 hour sleep opportunity before shifts, use dark, quiet, cool rooms, and keep a consistent routine on days off where possible. Strategic naps of 20–30 minutes improve alertness without deep-sleep grogginess; a longer nap of about 90 minutes covers a full sleep cycle. Caffeine helps when timed before the expected low and avoided within several hours of planned sleep. Bright light helps alertness during night shifts; dark glasses on the drive home help sleep afterwards.',
        'Hydrate and eat regularly — small, balanced meals rather than heavy meals on night shifts. Team strategies include cross-checking each other, verbalising plans, and using checklists during the circadian low.',
        'Standing down because of fatigue or illness is a professional decision. A just culture supports crew who remove themselves from duty without penalty; programmes should have backup procedures so that the service is not compromised. If you are too tired to drive home after a shift, use the rest facility or arrange transport.',
      ],
    },
    {
      id: 'case', title: 'Scenario: the fourth flight',
      body: ['It is 04:30 on the last night of three consecutive 24-hour shifts. You have slept for 2 hours in the past 22. A request comes in for an interfacility transfer. Your pilot says he feels fine. You notice you just read the same paragraph of the patient report three times.'],
      example: { case: 'What do you do?', steps: [
        'Run IMSAFE honestly: fatigue is significant, and it is the circadian low.',
        'Say so: "I\'m too fatigued to fly this safely" — one to say no.',
        'The programme activates backup crew or delays a non-time-critical transfer.',
        'Rest before driving home; report the scheduling issue so it can be addressed.',
      ] },
    },
  ],
  keyPoints: [
    'Fatigue impairs like alcohol: ~18 h awake ≈ 0.05 % BAC.',
    'The circadian low (02:00–06:00) affects everyone.',
    'IMSAFE before every shift and flight.',
    'Alcohol: at least 8 h and BAC < 0.04 % for pilots; many programmes require 12 h for all crew.',
    'Naps, caffeine timing, light, hydration and standing down without penalty.',
  ],
  pearls: ['A 20–30 minute nap avoids grogginess.', 'Wait ≥ 12–18 h after scuba diving before flying.'],
  pitfalls: ['Trusting your own sense of how fatigued you are.', 'Flying with a head cold.'],
  questions: [
    { q: 'Being awake for about 18 hours impairs performance similar to a BAC of:', options: ['0.01 %', '0.05 %', '0.3 %', '0 %'], answer: 1, why: 'Fatigue research.' },
    { q: 'The circadian low occurs around:', options: ['12:00–14:00 only', '02:00–06:00', '18:00–20:00', '08:00–10:00'], answer: 1, why: 'Lowest alertness.' },
    { q: 'IMSAFE stands for:', options: ['Illness, Medication, Stress, Alcohol, Fatigue, Emotion/Eating', 'Insurance, Maintenance, Safety, Airspace, Fuel, Engine', 'Instruments, Map, Speed, Altitude, Fuel, Engine', 'None of these'], answer: 0, why: 'Self-assessment checklist.' },
    { q: 'FAA rule for pilots: no alcohol within:', options: ['1 hour', '8 hours of flight', '24 hours', '30 minutes'], answer: 1, why: '"Bottle to throttle".' },
    { q: 'FAA BAC limit for pilots:', options: ['0.08 %', 'Below 0.04 %', '0.1 %', 'None'], answer: 1, why: 'Regulatory limit.' },
    { q: 'Flying with a head cold risks:', options: ['Nothing', 'Ear and sinus barotrauma', 'Better hearing', 'Hypoglycaemia'], answer: 1, why: 'Blocked Eustachian tubes.' },
    { q: 'Wait before flying after a single no-decompression dive:', options: ['1 hour', 'At least 12 hours', '1 week', 'No wait'], answer: 1, why: 'Decompression sickness risk.' },
    { q: 'An effective short nap length:', options: ['5 minutes', '20–30 minutes', '3 hours', '60 minutes'], answer: 1, why: 'Avoids deep-sleep inertia.' },
    { q: 'Sleep debt is repaid by:', options: ['Caffeine', 'Sleep', 'Exercise', 'Bright light'], answer: 1, why: 'Only sleep restores.' },
    { q: 'A fatigued crew member who stands down should be:', options: ['Disciplined', 'Supported under a just culture', 'Ignored', 'Sent to fly anyway'], answer: 1, why: 'Safety culture.' },
    { q: 'Microsleeps:', options: ['Are always noticed', 'Can occur without awareness', 'Last hours', 'Improve alertness'], answer: 1, why: 'Lapses of seconds.' },
    { q: 'Over-the-counter antihistamines can:', options: ['Improve alertness', 'Cause drowsiness and impair performance', 'Prevent hypoxia', 'Replace sleep'], answer: 1, why: 'Many antihistamines are sedating.' },
    { q: 'Caffeine should be timed:', options: ['Just before sleep', 'Before the expected low, avoiding hours before sleep', 'Only after the shift', 'Never'], answer: 1, why: 'Strategic use.' },
    { q: 'Fatigued people judge their own impairment:', options: ['Accurately', 'Poorly', 'Better than rested people', 'Perfectly'], answer: 1, why: 'Self-assessment fails.' },
    { q: 'Long-term shift work is associated with:', options: ['Improved cardiovascular health', 'Cardiovascular and metabolic disease', 'Better sleep', 'No effects'], answer: 1, why: 'Health risks.' },
  ],
  sources: [
    { title: 'Dawson D, Reid K. Fatigue, alcohol and performance impairment. Nature (1997)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Dawson+Reid+fatigue+alcohol+performance+impairment+Nature+1997' },
    { title: 'FAA: 14 CFR 91.17 (alcohol or drugs)', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-A/section-91.17' },
    { title: 'Patterson PD et al. Fatigue risk management guidelines for EMS (2018)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Patterson+evidence-based+guidelines+fatigue+risk+management+EMS+2018' },
  ],
};

export const HAZARD_REPORTING: FpcLesson = {
  id: 'fpc-hazard-reporting', domain: 'safety', ref: 'I.11',
  title: 'Hazard reporting and safety management systems',
  summary: 'Why near-misses matter, safety management systems (SMS), non-punitive reporting, the NTSB and ASRS, incident reporting obligations, and how reports turn into safer operations.',
  objectives: [
    'Describe the components of a safety management system.',
    'Explain the value of non-punitive hazard and near-miss reporting.',
    'Identify events that require formal reporting and the agencies involved.',
  ],
  sections: [
    {
      id: 'sms', title: 'Safety management systems', core: true,
      body: [
        'A safety management system (SMS) is a structured, organisation-wide approach to managing risk. Its four pillars are safety policy (leadership commitment and accountability), safety risk management (identifying hazards and controlling risk), safety assurance (monitoring, auditing and measuring performance) and safety promotion (training and communication). The FAA requires SMS for some operators and encourages it across air medical services; accreditation bodies expect it.',
        'Heinrich\'s pyramid illustrates the idea that for every serious accident there are many minor incidents and hundreds of near-misses and unsafe acts. Accidents are usually the end of a chain of hazards and errors (Reason\'s "Swiss cheese" model): defences have holes, and an accident happens when the holes line up. Reporting near-misses allows the holes to be found and closed before they align.',
        'A hazard is a condition that could cause harm (an unmarked wire near a regular LZ, a faulty stretcher lock); risk is the combination of the likelihood and severity of harm from that hazard. Risk matrices help prioritise action.',
      ],
    },
    {
      id: 'reporting', title: 'Reporting culture', core: true,
      body: [
        'People report only when it is safe to do so. Non-punitive reporting systems protect people who report honest errors and hazards, while still holding individuals accountable for reckless behaviour — the balance of a just culture. Reports can be confidential or anonymous, and the programme should feed back what was learned and changed; reporting that disappears into a void stops quickly.',
        'What to report: near-misses (a wire noticed late on approach, a door that opened in flight), equipment failures, medication errors, communication breakdowns, LZ problems, fatigue-related events, and any unsafe condition. Report promptly, factually and without blame: what happened, where, when, contributing factors, and suggestions.',
        'The NASA Aviation Safety Reporting System (ASRS) accepts confidential reports from anyone in aviation; filing a report within 10 days of an incident can provide limited protection from FAA penalties for unintentional violations. Many programmes also participate in industry databases and safety networks to share lessons.',
      ],
    },
    {
      id: 'formal', title: 'Mandatory reporting and investigation', core: true,
      body: [
        'Aircraft accidents (death or serious injury, or substantial damage to the aircraft) and certain serious incidents must be reported immediately to the National Transportation Safety Board (NTSB) in the United States, which investigates to determine probable cause and makes safety recommendations. The FAA enforces regulations and may also investigate. Preserve wreckage and records, and do not disturb the scene except to rescue people.',
        'Medical events also have reporting pathways: medication errors, device malfunctions (the FDA MedWatch system), and patient harm (internal quality and risk management). Post-incident support — critical incident stress management and peer support — is part of a mature safety system.',
      ],
      table: {
        caption: 'Who handles what (US)',
        head: ['Event', 'Report to'],
        rows: [['Aircraft accident or serious incident', 'NTSB (immediately) and FAA'], ['Near-miss, hazard, unintentional violation', 'Internal SMS; NASA ASRS (confidential)'], ['Medical device malfunction', 'Internal; FDA MedWatch'], ['Medication error, patient harm', 'Internal quality/risk management'], ['Unsafe LZ or agency practice', 'Internal SMS; liaison with the agency']],
      },
    },
    {
      id: 'case', title: 'Scenario: the near-miss on approach',
      body: ['On a night approach to a regular hospital helipad, the pilot sees a new construction crane late and makes an abrupt turn to avoid it. Nobody is hurt. Back at base, everyone is shaken; someone suggests not mentioning it to avoid trouble.'],
      example: { case: 'What should happen?', steps: [
        'Report through the SMS: time, location, the crane\'s position and lighting, what helped and what didn\'t.',
        'The programme notifies the hospital and other operators, updates obstacle data and approach procedures, and requests lighting on the crane.',
        'Consider an ASRS report for confidential industry sharing.',
        'Debrief and offer peer support; feed back what changed to the reporting crew.',
      ] },
    },
  ],
  keyPoints: [
    'SMS pillars: policy, risk management, assurance, promotion.',
    'Near-misses outnumber accidents — reporting them prevents accidents.',
    'Swiss cheese model: accidents occur when holes in defences align.',
    'Non-punitive, just-culture reporting; feedback keeps reporting alive.',
    'Accidents → NTSB immediately; ASRS for confidential reports within 10 days.',
  ],
  pearls: ['Hazard = condition; risk = likelihood × severity.', 'Preserve the scene except for rescue.'],
  pitfalls: ['Not reporting a near-miss because no one was hurt.', 'Reporting systems that never feed back.'],
  questions: [
    { q: 'The four pillars of SMS:', options: ['Policy, risk management, assurance, promotion', 'Pilots, nurses, medics, mechanics', 'Fuel, weather, maintenance, training', 'Report, punish, retrain, fire'], answer: 0, why: 'ICAO/FAA framework.' },
    { q: 'Heinrich\'s pyramid suggests:', options: ['Accidents are random', 'Many near-misses precede each serious accident', 'Near-misses are irrelevant', 'Only fatal accidents matter'], answer: 1, why: 'Report near-misses.' },
    { q: 'Reason\'s Swiss cheese model describes:', options: ['Aircraft design', 'Accidents occurring when holes in multiple defences align', 'Food safety', 'Weather patterns'], answer: 1, why: 'Systems view.' },
    { q: 'Risk is:', options: ['Any hazard', 'Likelihood combined with severity of harm', 'Only severity', 'An accident'], answer: 1, why: 'Definition.' },
    { q: 'A non-punitive reporting system:', options: ['Protects reckless behaviour', 'Protects honest error reporting while holding reckless behaviour accountable', 'Punishes all errors', 'Is anonymous only'], answer: 1, why: 'Just culture.' },
    { q: 'Aircraft accidents in the US are reported to:', options: ['OSHA', 'The NTSB', 'The FDA', 'CAMTS'], answer: 1, why: 'Investigation authority.' },
    { q: 'NASA ASRS:', options: ['Investigates crashes', 'Accepts confidential safety reports', 'Certifies pilots', 'Writes regulations'], answer: 1, why: 'Voluntary reporting.' },
    { q: 'An ASRS report filed within ___ can offer limited protection for unintentional violations:', options: ['1 day', '10 days', '1 year', 'No limit'], answer: 1, why: 'FAA policy.' },
    { q: 'Medical device malfunctions are reported to:', options: ['NTSB', 'FDA MedWatch', 'NASA', 'FAA'], answer: 1, why: 'Device safety.' },
    { q: 'Reporting systems lose engagement when:', options: ['Feedback is given', 'Reports disappear without feedback', 'Reports are confidential', 'Leadership supports them'], answer: 1, why: 'People stop reporting.' },
    { q: 'After an accident, the scene should be:', options: ['Cleaned immediately', 'Preserved except for rescue', 'Photographed and cleared', 'Left unattended'], answer: 1, why: 'Investigation.' },
    { q: 'A hazard is:', options: ['An injury', 'A condition that could cause harm', 'A report', 'A regulation'], answer: 1, why: 'Definition.' },
    { q: 'Safety assurance includes:', options: ['Marketing', 'Monitoring, auditing and measuring performance', 'Billing', 'Scheduling'], answer: 1, why: 'SMS pillar.' },
    { q: 'Which should be reported?', options: ['Only fatal accidents', 'Near-misses, equipment failures and unsafe conditions', 'Nothing without injury', 'Only pilot errors'], answer: 1, why: 'Learning opportunities.' },
    { q: 'A good safety report is:', options: ['Emotional and blaming', 'Prompt, factual and blame-free with suggestions', 'Delayed until the annual review', 'Verbal only'], answer: 1, why: 'Useful for learning.' },
  ],
  sources: [
    { title: 'FAA: Safety Management System', url: 'https://www.faa.gov/about/initiatives/sms' },
    { title: 'NASA Aviation Safety Reporting System', url: 'https://asrs.arc.nasa.gov/' },
    { title: 'NTSB: 49 CFR Part 830 (notification and reporting of aircraft accidents)', url: 'https://www.ecfr.gov/current/title-49/subtitle-B/chapter-VIII/part-830' },
  ],
};

export const RADIO_COMMS: FpcLesson = {
  id: 'fpc-radio-comms', domain: 'safety', ref: 'I.12',
  title: 'Communication and radio operations',
  summary: 'Aircraft and ground radio systems, intercom discipline, standard phraseology and the phonetic alphabet, flight following, patient reports by radio, and communication failures.',
  objectives: [
    'Use standard radio phraseology, the phonetic alphabet and intercom discipline.',
    'Describe flight following, position reporting and emergency frequencies.',
    'Deliver a concise patient report by radio and manage lost communications.',
  ],
  sections: [
    {
      id: 'systems', title: 'Radio systems and intercom', core: true,
      body: [
        'Air medical aircraft carry several radios: VHF aviation radios for air traffic control and airport traffic (118–137 MHz), VHF/UHF FM radios for ground agencies (EMS, fire, police and hospitals), satellite tracking and messaging, and the intercom linking pilot and crew headsets. A transponder squawks a code that identifies the aircraft on radar; 7700 is emergency, 7600 is lost communications and 7500 is unlawful interference. The aviation emergency frequency is 121.5 MHz.',
        'Intercom discipline protects the pilot: keep transmissions brief, avoid talking when the pilot is on the radio or during critical phases (sterile cockpit), and know how to isolate the crew intercom from the pilot during patient care. Agree on terms in advance — for example, "hold" (stop talking), "say again", and how the pilot announces critical phases.',
        'Medical crew often handle communications with ground units, receiving hospitals and medical control, freeing the pilot to fly and talk to ATC.',
      ],
    },
    {
      id: 'phraseology', title: 'Phraseology and the phonetic alphabet', core: true,
      body: [
        'Standard phraseology reduces misunderstanding in noisy, crowded radio environments. Think before you key the microphone, press and pause before speaking, speak clearly at a moderate rate, and release. Use "who you are calling, who you are, where you are, what you want": "Mercy Base, Life Flight 2, ten miles west, landing in five." Use plain language for medical content; avoid codes that receiving agencies may not share.',
        'The ICAO phonetic alphabet: Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, Golf, Hotel, India, Juliett, Kilo, Lima, Mike, November, Oscar, Papa, Quebec, Romeo, Sierra, Tango, Uniform, Victor, Whiskey, X-ray, Yankee, Zulu. Numbers are spoken digit by digit, with "niner" for 9 and "tree" for 3 in some regions. Common words: "Roger" (received), "Wilco" (will comply), "Affirmative", "Negative", "Say again", "Standby", "Over" and "Out".',
        'Emergency calls: "Mayday, Mayday, Mayday" for distress (grave and imminent danger, immediate assistance required), "Pan-Pan, Pan-Pan, Pan-Pan" for urgency (a condition concerning safety that does not require immediate assistance). In a medical context, a deteriorating patient needing priority handling may be communicated to ATC as "medevac" or "lifeguard" in the call sign.',
      ],
      table: {
        caption: 'Codes and frequencies to know',
        head: ['Item', 'Meaning'],
        rows: [['7700', 'Transponder emergency'], ['7600', 'Lost communications'], ['7500', 'Unlawful interference (hijack)'], ['121.5 MHz', 'Aviation emergency frequency'], ['Mayday', 'Distress — grave and imminent danger'], ['Pan-Pan', 'Urgency — safety concern, no immediate danger']],
      },
    },
    {
      id: 'following', title: 'Flight following and patient reports', core: true,
      body: [
        'Flight following tracks the aircraft\'s position throughout the mission — by satellite tracking (automatic position reports every few minutes) and verbal position reports to the communications centre (typically every 15 minutes). If a scheduled report is missed and the aircraft cannot be contacted, the centre begins the overdue aircraft or post-accident incident plan.',
        'A radio patient report should be short and structured: who you are and your ETA, age and sex, chief complaint or mechanism, key findings and vital signs, interventions and response, and specific requests (team activation, blood, cath lab, CT). For example: "City General, Life Flight 2, ETA 12 minutes with a 54-year-old male, inferior STEMI, BP 96/60, heart rate 52, on oxygen, aspirin and heparin given; request cath lab activation." Avoid patient names on open channels.',
        'If communications fail: try other radios and frequencies, relay through another aircraft or ground unit, use phones or satellite messaging, and follow lost-communication procedures. The pilot squawks 7600 if ATC communication is lost.',
      ],
    },
    {
      id: 'case', title: 'Scenario: the overdue position report',
      body: ['You are working in the communications centre. A helicopter on a night scene flight missed its 15-minute position report. The satellite tracker shows its last position 6 minutes ago, stationary over a rural area away from the planned LZ. Calls on the company frequency are unanswered.'],
      example: { case: 'What happens next?', steps: [
        'Try all methods: company radio, satellite messaging, crew mobile phones, other agencies in the area.',
        'Activate the post-accident incident plan at the specified time — do not wait.',
        'Notify ATC, local emergency services and search and rescue with the last known position.',
        'Monitor 121.5 MHz and ELT alerts; prepare to support crew families and the organisation.',
      ] },
    },
  ],
  keyPoints: [
    'Squawk 7700 emergency, 7600 lost comms, 7500 hijack; 121.5 MHz emergency.',
    'Brief transmissions: who you\'re calling, who you are, where, what you want.',
    'Phonetic alphabet; Roger, Wilco, Say again; Mayday (distress) vs Pan-Pan (urgency).',
    'Flight following: satellite tracking plus verbal reports about every 15 minutes.',
    'Structured radio patient reports; no names on open channels.',
  ],
  pearls: ['Press, pause, then speak.', 'Isolate the crew intercom from the pilot during care.'],
  pitfalls: ['Long transmissions blocking the frequency.', 'Delaying the post-accident plan after a missed report.'],
  questions: [
    { q: 'Transponder code for an emergency:', options: ['7500', '7600', '7700', '1200'], answer: 2, why: 'General emergency.' },
    { q: 'Transponder code for lost communications:', options: ['7700', '7600', '7500', '2000'], answer: 1, why: 'Lost comms.' },
    { q: 'The aviation emergency frequency:', options: ['118.0', '121.5 MHz', '156.8', '243.5 only'], answer: 1, why: 'Guard frequency.' },
    { q: '"Wilco" means:', options: ['Repeat', 'Will comply', 'Wait', 'Negative'], answer: 1, why: 'Standard word.' },
    { q: '"Mayday" indicates:', options: ['Urgency without immediate danger', 'Distress — grave and imminent danger', 'Routine report', 'Medical query'], answer: 1, why: 'Highest priority.' },
    { q: '"Pan-Pan" indicates:', options: ['Distress', 'Urgency', 'Weather report', 'Clear'], answer: 1, why: 'Safety concern without immediate danger.' },
    { q: 'The phonetic word for "J":', options: ['Jack', 'Juliett', 'Jupiter', 'Jungle'], answer: 1, why: 'ICAO alphabet.' },
    { q: 'Verbal position reports in flight following are typically every:', options: ['2 minutes', '15 minutes', '2 hours', 'Never'], answer: 1, why: 'Common standard.' },
    { q: 'If a position report is missed and contact fails:', options: ['Wait until the next day', 'Activate the post-accident/overdue plan', 'Assume radios failed', 'Do nothing'], answer: 1, why: 'Early search saves lives.' },
    { q: 'Patient names on open radio channels:', options: ['Always given', 'Avoided', 'Required', 'Spelled phonetically'], answer: 1, why: 'Open channels can be monitored by anyone.' },
    { q: 'A radio call should begin with:', options: ['The patient\'s history', 'Who you are calling and who you are', 'Vital signs', 'Weather'], answer: 1, why: 'Standard format.' },
    { q: 'Intercom discipline during critical phases means:', options: ['Talking freely', 'Sterile cockpit — only essential communication', 'Singing', 'Radios off'], answer: 1, why: 'Protects pilot attention.' },
    { q: 'Squawk 7500 means:', options: ['Lost comms', 'Unlawful interference', 'Medical emergency', 'VFR'], answer: 1, why: '7500 signals unlawful interference (hijack).' },
    { q: '"Say again" means:', options: ['Repeat your last transmission', 'Wait', 'I agree', 'Goodbye'], answer: 0, why: 'Standard word.' },
    { q: 'A key element of a radio patient report:', options: ['Detailed social history', 'ETA, key findings, interventions and specific requests', 'Billing information', 'Names of family'], answer: 1, why: 'Concise and actionable.' },
  ],
  sources: [
    { title: 'FAA Aeronautical Information Manual — Radio communications phraseology and techniques', url: 'https://www.faa.gov/air_traffic/publications/atpubs/aim_html/' },
    { title: 'FAA Pilot/Controller Glossary', url: 'https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/' },
  ],
};
