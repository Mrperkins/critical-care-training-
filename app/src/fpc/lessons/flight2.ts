/** FP-C II.4–II.6: altitude injuries; time of useful consciousness; pressurised vs unpressurised cabins. */
import type { FpcLesson } from '../types';

export const ALTITUDE_INJURIES: FpcLesson = {
  id: 'fpc-altitude-injuries', domain: 'flightphys', ref: 'II.4',
  title: 'Altitude injuries: barotrauma, decompression sickness and altitude illness',
  summary: 'Trapped-gas injuries of the ears, sinuses, teeth and gut; evolved-gas disorders (decompression sickness and arterial gas embolism); and high-altitude illness (AMS, HACE, HAPE) — recognition, treatment and transport.',
  objectives: [
    'Recognise and prevent barotrauma of the ears, sinuses, teeth and gastrointestinal tract.',
    'Diagnose decompression sickness and arterial gas embolism and plan transport.',
    'Recognise and treat acute mountain sickness, HACE and HAPE.',
  ],
  sections: [
    {
      id: 'baro', title: 'Trapped-gas disorders (barotrauma)', core: true,
      body: [
        'Barotitis media (ear block) occurs when the Eustachian tube cannot equalise middle ear pressure, usually on descent: pain, muffled hearing, a red or retracted tympanic membrane, and rarely rupture. Risk factors: upper respiratory infection, allergies, sedation, sleep and infancy. Prevention: swallow, yawn, chew, Valsalva (gently), decongestants; slow descent; wake sedated patients or have infants feed during descent.',
        'Barosinusitis — pain over the frontal or maxillary sinuses — follows blocked sinus ostia, again usually on descent. Barodontalgia is tooth pain from gas trapped under fillings or in abscesses, usually on ascent. Gastrointestinal gas expands on ascent, causing distension, pain and diaphragmatic splinting; avoid gas-producing foods before flight and decompress obstructed bowel with a nasogastric tube.',
        'Pulmonary barotrauma (pneumothorax, pneumomediastinum) can occur with rapid decompression, breath-holding during ascent or positive pressure ventilation; in diving it causes arterial gas embolism.',
      ],
    },
    {
      id: 'dcs', title: 'Evolved-gas disorders: decompression sickness and gas embolism', core: true,
      body: [
        'Decompression sickness (DCS) follows a fall in ambient pressure that allows dissolved nitrogen to form bubbles in tissues and blood (Henry\'s law) — after scuba diving, rapid ascent to altitude, or cabin depressurisation above about 18 000–25 000 feet. Type I (mild): joint pain ("the bends", usually large joints like the shoulder and elbow), skin itching or mottling (cutis marmorata), and lymphatic swelling. Type II (serious): neurological symptoms (paraesthesia, weakness, paralysis, confusion, visual disturbance), "the chokes" (cough, chest pain, breathlessness from pulmonary bubbles) and shock.',
        'Arterial gas embolism (AGE) results from pulmonary barotrauma — typically a diver ascending while breath-holding — releasing air into the pulmonary veins and systemic arteries. It presents within minutes of surfacing with stroke-like symptoms, loss of consciousness, seizures or cardiac arrest.',
        'Treatment of both: 100 % oxygen by non-rebreather or ventilator (accelerates nitrogen washout and shrinks bubbles), lie the patient flat (supine; head-down positioning is no longer recommended), IV isotonic fluids (avoid glucose-containing fluids), and transfer for hyperbaric oxygen recompression. Transport at the lowest possible altitude: helicopters fly as low as safely possible (typically below 1000 feet above the departure point), and fixed-wing aircraft should maintain a cabin altitude at or near sea level (pressurised to 1 atmosphere) — further pressure reduction enlarges bubbles.',
      ],
    },
    {
      id: 'hai', title: 'High-altitude illness', core: true,
      body: [
        'Acute mountain sickness (AMS) develops 6–12 hours after ascent above about 2500 metres (8000 feet): headache plus nausea, fatigue, dizziness or poor sleep. Treat by stopping ascent, rest, analgesics and antiemetics, acetazolamide; descend if symptoms worsen. High-altitude cerebral oedema (HACE) is the severe end: ataxia (a sensitive early sign — test heel-to-toe walking), confusion, drowsiness and coma. Treatment: immediate descent, oxygen, dexamethasone (8 mg, then 4 mg every 6 hours) and portable hyperbaric bags if descent is impossible.',
        'High-altitude pulmonary oedema (HAPE) is non-cardiogenic pulmonary oedema from exaggerated hypoxic pulmonary vasoconstriction: breathlessness at rest, cough (initially dry, then pink frothy sputum), reduced exercise tolerance, crackles, cyanosis and tachycardia. It is the leading cause of death from altitude illness. Treatment: descent, oxygen (often rapidly effective), nifedipine (pulmonary vasodilator), keeping warm and minimising exertion.',
        'For air medical crews, rescues from high terrain involve these patients; the aircraft itself, by descending, is part of the treatment. Crew operating at altitude are also at risk if they ascend rapidly from sea level.',
      ],
      table: {
        caption: 'Altitude disorders at a glance',
        head: ['Condition', 'Key features', 'Treatment'],
        rows: [['Barotitis media', 'Ear pain on descent', 'Equalise; decongestants; slow descent'], ['DCS type I', 'Joint pain, skin mottling', '100 % O₂, flat, fluids, hyperbaric'], ['DCS type II', 'Neurological, "chokes", shock', 'Same; urgent hyperbaric; low altitude'], ['AGE', 'Stroke-like within minutes of surfacing', 'O₂, flat, urgent hyperbaric'], ['AMS', 'Headache + nausea, fatigue after ascent', 'Stop ascent, symptomatic, acetazolamide'], ['HACE', 'Ataxia, confusion, coma', 'Descend, O₂, dexamethasone'], ['HAPE', 'Breathlessness at rest, frothy sputum', 'Descend, O₂, nifedipine']],
      },
    },
    {
      id: 'case', title: 'Transport case: the diver',
      body: ['A 32-year-old diver surfaced from a 30-metre dive 40 minutes ago after a rapid ascent. He now has numbness and weakness in both legs, pain in his shoulder and difficulty passing urine. The nearest hyperbaric chamber is 150 km away, over a mountain pass at 4500 feet.'],
      example: { case: 'Plan the transport.', steps: [
        'Type II decompression sickness (spinal cord involvement).',
        '100 % oxygen by tight-fitting mask; supine; IV isotonic fluids; urinary catheter.',
        'Avoid the mountain pass altitude: route around at low level by helicopter, or use a fixed-wing aircraft pressurised to sea-level cabin altitude.',
        'Contact the hyperbaric unit (and diving medicine advice line) before departure; bring the dive profile.',
      ] },
    },
  ],
  keyPoints: [
    'Ear and sinus barotrauma mostly on descent; tooth pain on ascent.',
    'DCS: nitrogen bubbles (Henry) — joint pain (type I), neurological or respiratory (type II).',
    'AGE: stroke-like symptoms within minutes of surfacing.',
    'DCS/AGE: 100 % O₂, supine, fluids, hyperbaric; transport at the lowest altitude or a sea-level cabin.',
    'AMS → HACE (ataxia) and HAPE (breathlessness at rest): descend, oxygen, dexamethasone/nifedipine.',
  ],
  pearls: ['Ataxia is the sensitive early sign of HACE.', 'Wake sedated patients or feed infants during descent to help equalise.'],
  pitfalls: ['Flying a DCS patient over high terrain.', 'Dismissing post-dive joint pain as a sprain.'],
  live: [{ id: 'o2path', label: 'The oxygen pathway' }],
  questions: [
    { q: 'Ear barotrauma most commonly occurs during:', options: ['Ascent', 'Descent', 'Cruise', 'Taxi'], answer: 1, why: 'Air must re-enter the middle ear.' },
    { q: 'Barodontalgia (tooth pain) most often occurs during:', options: ['Descent', 'Ascent', 'Landing only', 'Never'], answer: 1, why: 'Trapped gas expands.' },
    { q: 'Decompression sickness is explained by:', options: ['Boyle\'s law only', 'Henry\'s law', 'Charles\' law', 'Graham\'s law'], answer: 1, why: 'Dissolved gas comes out of solution.' },
    { q: 'Type I DCS features:', options: ['Paralysis', 'Joint pain and skin mottling', 'Coma', 'Shock'], answer: 1, why: 'Type I is the milder form.' },
    { q: '"The chokes" in DCS refers to:', options: ['Airway obstruction by food', 'Pulmonary DCS: cough, chest pain, breathlessness', 'Laryngospasm', 'Asthma'], answer: 1, why: 'The chokes are pulmonary (type II) DCS.' },
    { q: 'Arterial gas embolism typically presents:', options: ['Days after diving', 'Within minutes of surfacing with stroke-like symptoms', 'Only with joint pain', 'Never in divers'], answer: 1, why: 'Pulmonary barotrauma.' },
    { q: 'DCS patients should be transported:', options: ['At high altitude to save time', 'At the lowest safe altitude or sea-level cabin', 'Sitting upright at 10 000 ft', 'By any route'], answer: 1, why: 'Avoid bubble expansion.' },
    { q: 'Definitive treatment of DCS:', options: ['Analgesia', 'Hyperbaric oxygen recompression', 'Diuretics', 'Rest at home'], answer: 1, why: 'Recompression.' },
    { q: 'Positioning for DCS/AGE:', options: ['Head-down Trendelenburg', 'Supine (flat)', 'Sitting', 'Prone'], answer: 1, why: 'Current recommendation.' },
    { q: 'AMS typically begins above about:', options: ['500 m', '2500 m (8000 ft)', '6000 m', 'Sea level'], answer: 1, why: 'Threshold altitude.' },
    { q: 'A sensitive early sign of HACE:', options: ['Cough', 'Ataxia', 'Rash', 'Fever'], answer: 1, why: 'Heel-to-toe test.' },
    { q: 'HACE treatment includes:', options: ['Further ascent', 'Descent, oxygen and dexamethasone', 'Nifedipine only', 'Fluids only'], answer: 1, why: 'Reduce cerebral oedema.' },
    { q: 'HAPE presents with:', options: ['Joint pain', 'Breathlessness at rest and frothy sputum', 'Ataxia', 'Rash'], answer: 1, why: 'Non-cardiogenic pulmonary oedema.' },
    { q: 'Drug used for HAPE:', options: ['Dexamethasone only', 'Nifedipine', 'Furosemide', 'Morphine'], answer: 1, why: 'Pulmonary vasodilator.' },
    { q: 'IV fluids for DCS should avoid:', options: ['Saline', 'Glucose-containing fluids', 'Hartmann\'s', 'All fluids'], answer: 1, why: 'Hyperglycaemia may worsen neurological injury.' },
  ],
  sources: [
    { title: 'Divers Alert Network (DAN): Decompression illness', url: 'https://dan.org/' },
    { title: 'Wilderness Medical Society Clinical Practice Guidelines: Acute altitude illness (2019)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Wilderness+Medical+Society+clinical+practice+guidelines+prevention+treatment+acute+altitude+illness+2019' },
    { title: 'Undersea and Hyperbaric Medical Society', url: 'https://www.uhms.org/' },
  ],
};

export const TUC: FpcLesson = {
  id: 'fpc-tuc', domain: 'flightphys', ref: 'II.5',
  title: 'Time of useful consciousness',
  summary: 'What time of useful consciousness (TUC) means, how it shortens with altitude and activity, the stages of hypoxia, and the crew\'s actions after a decompression.',
  objectives: [
    'Define time of useful consciousness and state typical values by altitude.',
    'Describe factors that shorten TUC and the stages of hypoxia.',
    'Apply TUC to emergency actions after cabin depressurisation.',
  ],
  sections: [
    {
      id: 'define', title: 'What TUC means', core: true,
      body: [
        'Time of useful consciousness (also called effective performance time) is the period after an interruption of oxygen supply, or exposure to a low-oxygen environment, during which a person can still perform useful, purposeful tasks — such as putting on an oxygen mask or taking corrective action. It is not the time to unconsciousness: judgement and coordination fail well before the person passes out, often without their being aware of it.',
        'TUC falls dramatically with altitude. Typical values for a person at rest: 20–30 minutes at 18 000 feet, 3–5 minutes at 25 000 feet, 1–2 minutes at 30 000 feet, 30–60 seconds at 35 000 feet, and 9–15 seconds at 40 000 feet and above. Rapid decompression can reduce TUC by up to half, because of the sudden pressure drop and the reversal of the oxygen gradient in the lungs (oxygen can leave the blood into the alveoli).',
        'Individual variation is large: fitness, acclimatisation, smoking, illness, fatigue, alcohol and the level of physical activity all change TUC. Activity shortens it — moving around the cabin or performing patient care uses oxygen faster.',
      ],
      table: {
        caption: 'Typical TUC (at rest; rapid decompression may halve these)',
        head: ['Altitude (ft)', 'TUC'],
        rows: [['18 000', '20–30 min'], ['22 000', '5–10 min'], ['25 000', '3–5 min'], ['28 000', '2.5–3 min'], ['30 000', '1–2 min'], ['35 000', '30–60 s'], ['40 000+', '9–15 s']],
      },
    },
    {
      id: 'stages', title: 'Stages of hypoxia', core: true,
      body: [
        'Indifferent stage (sea level to about 10 000 feet): night vision decreases; few other effects in healthy people. Compensatory stage (about 10 000–15 000 feet): heart rate, respiratory rate and blood pressure rise to compensate; drowsiness, poor judgement and impaired coordination begin, especially with prolonged exposure.',
        'Disturbance stage (about 15 000–20 000 feet): compensation is inadequate — impaired judgement, memory, coordination, vision (tunnel vision, reduced colour perception) and dexterity; euphoria or belligerence; cyanosis. People may not recognise that they are impaired. Critical stage (above about 20 000 feet): rapid deterioration to confusion, loss of consciousness and death within minutes without oxygen.',
        'These altitudes refer to healthy individuals. Patients with lung or heart disease, anaemia or shock reach the disturbance and critical stages at much lower altitudes — a reason that even modest cabin altitudes can harm sick patients.',
      ],
    },
    {
      id: 'actions', title: 'Actions after decompression', core: true,
      body: [
        'The first and most important action is to don your own oxygen mask immediately — within the TUC — before helping anyone else. Then secure oxygen for the patient (increase to 100 %, check the ventilator and circuit), stay seated and restrained, and let the pilot carry out an emergency descent to a safe altitude (usually 10 000 feet or below).',
        'Do not move around the cabin during the period of greatest hypoxia — activity shortens TUC. Communicate briefly using the intercom. Once at a safe altitude, reassess the patient: gas expansion effects (pneumothorax, ETT cuff, drains, IV lines), and treat any decompression sickness symptoms in crew or patient.',
        'Training in an altitude chamber or with reduced-oxygen breathing devices lets crew experience their own hypoxia symptoms safely, so they recognise them early in real events.',
      ],
    },
    {
      id: 'case', title: 'Scenario: decompression at FL280',
      body: ['A fixed-wing aircraft at 28 000 feet (cabin altitude 7000 feet) suffers a rapid decompression. Two crew members are with a ventilated patient on FiO₂ 0.6. One crew member was standing to adjust a pump.'],
      example: { case: 'What happens next?', steps: [
        'TUC at 28 000 feet is about 2.5–3 minutes at rest — and may be halved by rapid decompression and activity (the standing crew member).',
        'Both crew don oxygen masks immediately, then sit and restrain.',
        'Increase the patient\'s FiO₂ to 1.0; confirm ventilator function and oxygen supply.',
        'Pilot descends to 10 000 feet or below; then reassess the patient for gas expansion problems.',
      ] },
    },
  ],
  keyPoints: [
    'TUC = time to perform useful tasks, not time to unconsciousness.',
    'Typical TUC: 18 000 ft 20–30 min; 25 000 ft 3–5 min; 35 000 ft 30–60 s; 40 000 ft+ 9–15 s.',
    'Rapid decompression and activity can halve TUC.',
    'Stages: indifferent, compensatory, disturbance, critical — patients reach them at lower altitudes.',
    'Own mask first, then the patient; stay seated; emergency descent.',
  ],
  pearls: ['Judgement fails before consciousness.', 'Chamber training teaches your own symptoms.'],
  pitfalls: ['Helping the patient before donning your mask.', 'Moving around the cabin after decompression.'],
  live: [{ id: 'o2path', label: 'The oxygen pathway' }],
  questions: [
    { q: 'Time of useful consciousness is:', options: ['Time until death', 'Time to perform useful tasks after oxygen loss', 'Total flight time', 'Time to unconsciousness'], answer: 1, why: 'Effective performance time.' },
    { q: 'TUC at 25 000 ft (at rest):', options: ['20–30 min', '3–5 min', '9–15 s', '1 hour'], answer: 1, why: 'Typical value.' },
    { q: 'TUC at 40 000 ft and above:', options: ['3–5 min', '9–15 seconds', '20 min', '1 hour'], answer: 1, why: 'Very short.' },
    { q: 'TUC at 18 000 ft (at rest):', options: ['20–30 min', '30 s', '5 s', '2 hours'], answer: 0, why: 'Typical value.' },
    { q: 'Rapid decompression affects TUC by:', options: ['Doubling it', 'Reducing it by up to half', 'No effect', 'Making it infinite'], answer: 1, why: 'Sudden pressure drop.' },
    { q: 'Physical activity during hypoxia:', options: ['Lengthens TUC', 'Shortens TUC', 'No effect', 'Prevents hypoxia'], answer: 1, why: 'Increased oxygen use.' },
    { q: 'The indifferent stage of hypoxia affects mainly:', options: ['Consciousness', 'Night vision', 'Hearing', 'Taste'], answer: 1, why: 'Sea level–10 000 ft.' },
    { q: 'The compensatory stage involves:', options: ['Unconsciousness', 'Increased heart and respiratory rates', 'Death', 'No changes'], answer: 1, why: 'Body compensates.' },
    { q: 'In the disturbance stage, people:', options: ['Always recognise impairment', 'May not recognise impairment', 'Feel no effect', 'Become stronger'], answer: 1, why: 'Insidious hypoxia.' },
    { q: 'After decompression, the first crew action:', options: ['Check the patient', 'Don own oxygen mask', 'Call dispatch', 'Open a window'], answer: 1, why: 'Within TUC.' },
    { q: 'After donning masks, the crew should:', options: ['Stand and walk around', 'Stay seated, secure patient O₂, allow descent', 'Disconnect monitors', 'Remove helmets'], answer: 1, why: 'Conserve oxygen.' },
    { q: 'Emergency descent typically goes to about:', options: ['25 000 ft', '10 000 ft or below', 'Sea level immediately', '18 000 ft'], answer: 1, why: 'Safe altitude.' },
    { q: 'Patients with lung disease reach hypoxic stages:', options: ['At higher altitudes', 'At lower altitudes than healthy people', 'Never', 'Same as healthy'], answer: 1, why: 'Reduced reserve.' },
    { q: 'TUC is shortened by:', options: ['Rest', 'Smoking, fatigue and illness', 'Acclimatisation', 'Supplemental O₂'], answer: 1, why: 'Individual factors.' },
    { q: 'Altitude chamber training helps crew:', options: ['Avoid oxygen', 'Recognise their own hypoxia symptoms', 'Fly higher', 'Sleep better'], answer: 1, why: 'Personal signature.' },
  ],
  sources: [
    { title: 'FAA Aeromedical Safety Brochure: Hypoxia', url: 'https://www.faa.gov/pilots/safety/pilotsafetybrochures' },
    { title: 'FAA Advisory Circular 61-107: Aircraft operations at altitudes above 25 000 feet', url: 'https://www.faa.gov/regulations_policies/advisory_circulars' },
  ],
};

export const CABINS: FpcLesson = {
  id: 'fpc-cabins', domain: 'flightphys', ref: 'II.6',
  title: 'Pressurised versus unpressurised cabins',
  summary: 'How cabin pressurisation works, cabin altitude and differential pressure, requesting a sea-level cabin, the trade-offs of unpressurised helicopter flight, and choosing the aircraft and altitude for altitude-sensitive patients.',
  objectives: [
    'Explain how pressurisation controls cabin altitude and its limits.',
    'Compare the physiological effects of pressurised and unpressurised flight.',
    'Choose aircraft type and altitude plans for altitude-sensitive patients.',
  ],
  sections: [
    {
      id: 'how', title: 'How pressurisation works', core: true,
      body: [
        'Pressurised aircraft pump compressed air (bled from the engines) into a sealed cabin and control its escape through an outflow valve, maintaining a cabin pressure higher than the outside pressure. The cabin altitude is the altitude whose pressure matches the cabin pressure. Most pressurised air medical jets and turboprops maintain a cabin altitude of about 6000–8000 feet at cruise.',
        'The airframe can tolerate a maximum differential pressure (the difference between cabin and outside pressure), typically about 6–9 psi depending on the aircraft. The higher the aircraft flies, the higher the cabin altitude must be to stay within that limit. To keep the cabin at sea level, the aircraft must fly lower — often around 20 000–25 000 feet instead of 35 000 feet or more — which burns more fuel, may increase flight time and exposes the aircraft to more weather and turbulence.',
        'Pressurisation also controls temperature and provides ventilation, but the air is very dry. Failure (decompression) can be rapid or slow, and crew must be ready to use emergency oxygen and descend (see the time of useful consciousness lesson).',
      ],
    },
    {
      id: 'compare', title: 'Pressurised vs unpressurised flight', core: true,
      body: [
        'Most air medical helicopters are unpressurised and fly at low altitudes — typically 500–3000 feet above the ground — so cabin altitude equals aircraft altitude. In flat terrain this has little physiological effect, but in mountainous regions helicopters may have to cross passes at 8000–12 000 feet or more, exposing patients to significant hypoxia and gas expansion without the option of pressurisation.',
        'Unpressurised fixed-wing aircraft (some smaller turboprops and pistons) are limited to lower altitudes for occupants without supplemental oxygen: US regulations require pilots to use oxygen above 12 500 feet cabin altitude for more than 30 minutes and at all times above 14 000 feet, and occupants must be provided oxygen above 15 000 feet. Patients need supplemental oxygen at much lower altitudes.',
        'Pressurised fixed-wing transport allows long distances above weather, with a controllable cabin altitude. The trade-off is cost, the need for ground ambulance legs at each end, and the risk of rapid decompression at high altitude.',
      ],
      table: {
        caption: 'Cabin types compared',
        head: ['', 'Unpressurised (helicopters, some fixed-wing)', 'Pressurised (jets, turboprops)'],
        rows: [['Cabin altitude', '= aircraft altitude', 'Typically 6000–8000 ft; can be lowered'], ['Typical flight altitude', 'Low (helicopters); limited (fixed-wing)', 'High cruise (up to 40 000+ ft)'], ['Gas expansion', 'Depends on terrain and route', 'Controlled by cabin altitude'], ['Decompression risk', 'Not applicable', 'Present (rapid or slow)'], ['Weather', 'More exposed', 'Can fly above most weather']],
      },
    },
    {
      id: 'choose', title: 'Planning for altitude-sensitive patients', core: true,
      body: [
        'Patients sensitive to altitude: those with severe hypoxaemia (ARDS, severe pneumonia, pulmonary hypertension), undrained pneumothorax or pneumocephalus, decompression sickness or arterial gas embolism, bowel obstruction, recent eye surgery with intraocular gas, severe anaemia, and sickle cell crises. For these patients, plan the route and cabin altitude before departure.',
        'Options: request a lower cabin altitude (including "sea-level cabin") in pressurised aircraft, accepting a lower cruising altitude and possibly a fuel stop; choose a helicopter route that avoids high terrain; or choose ground transport. Discuss with the pilot early: the pilot can tell you the trade-offs in time, fuel, weather and turbulence.',
        'Calculate the effect of the planned cabin altitude on oxygen requirements (FiO₂ × PB ratio) and gas volumes, ensure enough oxygen is carried, and decompress gas-filled spaces beforehand where possible.',
      ],
    },
    {
      id: 'case', title: 'Transport case: ARDS on 100 %',
      body: ['A patient with severe ARDS is on FiO₂ 1.0, PEEP 14, SpO₂ 90 %, PaO₂ 62. A 600 km transfer to an ECMO centre is requested. Options: a pressurised jet (standard cabin altitude 8000 ft) or a long ground transfer.'],
      example: { case: 'Plan.', steps: [
        'At an 8000 ft cabin altitude, inspired PO₂ falls by about 25 % — on FiO₂ 1.0 there is no reserve to compensate.',
        'Request a sea-level cabin: the aircraft flies lower (perhaps 20 000–25 000 ft), adding time and fuel, but keeps PAO₂ unchanged.',
        'Optimise PEEP and recruitment before departure; consider whether the ECMO team should cannulate before transfer (mobile ECMO).',
        'Carry ample oxygen (calculate for twice the flight time) and be ready for ground contingencies.',
      ] },
    },
  ],
  keyPoints: [
    'Pressurised cabins are typically at 6000–8000 ft cabin altitude.',
    'Maximum differential pressure limits how low the cabin can be at a given flight altitude.',
    'Sea-level cabin = lower flight altitude, more fuel and time, more weather.',
    'Unpressurised helicopters: cabin altitude = aircraft altitude — beware mountain passes.',
    'Plan cabin altitude and route for altitude-sensitive patients before departure.',
  ],
  pearls: ['Ask the pilot early about a sea-level cabin.', 'Pressurised air is very dry — humidify.'],
  pitfalls: ['Assuming a pressurised aircraft means sea-level conditions.', 'Routing a DCS patient over a mountain pass by helicopter.'],
  live: [{ id: 'o2path', label: 'The oxygen pathway' }],
  questions: [
    { q: 'Typical cabin altitude in pressurised air medical aircraft:', options: ['Sea level always', '6000–8000 ft', '15 000 ft', '25 000 ft'], answer: 1, why: 'Standard cabin altitude.' },
    { q: 'Maximum differential pressure limits:', options: ['Fuel use', 'How low the cabin altitude can be at a given flight altitude', 'Speed', 'Range only'], answer: 1, why: 'Structural limit.' },
    { q: 'Requesting a sea-level cabin means the aircraft must:', options: ['Fly higher', 'Fly lower, using more fuel and time', 'Depressurise', 'Land more often'], answer: 1, why: 'Differential limit.' },
    { q: 'In an unpressurised helicopter, cabin altitude equals:', options: ['Sea level', 'Aircraft altitude', '8000 ft', 'Destination altitude'], answer: 1, why: 'No pressurisation.' },
    { q: 'A patient group needing low cabin altitude:', options: ['Ankle fractures', 'Decompression sickness', 'Simple lacerations', 'Stable angina'], answer: 1, why: 'Bubble expansion.' },
    { q: 'US regulations require crew oxygen above 12 500 ft cabin altitude for more than:', options: ['5 minutes', '30 minutes', '2 hours', 'Never'], answer: 1, why: '14 CFR 91.211.' },
    { q: 'Pressurised air is:', options: ['Humid', 'Very dry', 'Warm and moist', 'Oxygen-enriched'], answer: 1, why: 'Bled engine air.' },
    { q: 'A disadvantage of pressurised fixed-wing transport:', options: ['Controlled cabin altitude', 'Ground ambulance legs and decompression risk', 'Flying above weather', 'Long range'], answer: 1, why: 'Trade-offs.' },
    { q: 'Helicopters crossing mountain passes expose patients to:', options: ['Higher cabin pressure', 'Significant hypoxia and gas expansion', 'No change', 'Hyperoxia'], answer: 1, why: 'Unpressurised.' },
    { q: 'A ventilated ARDS patient on FiO₂ 1.0 should be flown:', options: ['At standard cabin altitude', 'With a sea-level cabin if possible', 'Unpressurised at 12 000 ft', 'Without oxygen'], answer: 1, why: 'No reserve.' },
    { q: 'Pressurisation is achieved by:', options: ['Oxygen tanks', 'Compressed engine bleed air and an outflow valve', 'Opening windows', 'Fans only'], answer: 1, why: 'Cabin pressure control.' },
    { q: 'The cabin altitude is:', options: ['The aircraft\'s height', 'The altitude whose pressure matches the cabin pressure', 'Destination altitude', 'Always sea level'], answer: 1, why: 'Definition.' },
    { q: 'Flying lower for a sea-level cabin may increase exposure to:', options: ['Space radiation', 'Weather and turbulence', 'Hypoxia', 'Decompression'], answer: 1, why: 'Lower altitude.' },
    { q: 'Before flight with an altitude-sensitive patient, you should:', options: ['Ignore altitude', 'Discuss cabin altitude and route with the pilot', 'Turn off oxygen', 'Remove chest drains'], answer: 1, why: 'Plan ahead.' },
    { q: 'Gas-filled spaces should be:', options: ['Left alone', 'Decompressed before flight where possible', 'Filled with more air', 'Clamped'], answer: 1, why: 'Boyle\'s law.' },
  ],
  sources: [
    { title: '14 CFR 91.211 (supplemental oxygen)', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-C/section-91.211' },
    { title: 'FAA Pilot\'s Handbook of Aeronautical Knowledge — Aircraft systems (pressurisation)', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak' },
  ],
};
