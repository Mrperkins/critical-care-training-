/** FP-C I.13–I.15: safety and restraint systems; pre-flight check; passenger briefing. */
import type { FpcLesson } from '../types';

export const RESTRAINTS: FpcLesson = {
  id: 'fpc-restraints', domain: 'safety', ref: 'I.13',
  title: 'Safety and restraint systems: harnesses, helmets and securing equipment',
  summary: 'Crew restraints and crashworthy seats, helmets and personal protective equipment, patient restraint and stretcher locks, securing medical equipment, and restraining combative patients safely.',
  objectives: [
    'Describe crew restraint, helmet and PPE requirements and why they matter in a crash.',
    'Secure the patient, stretcher and medical equipment to certified mounts.',
    'Manage restraint of agitated or combative patients in the aircraft.',
  ],
  sections: [
    {
      id: 'crew', title: 'Crew restraint and protective equipment', core: true,
      body: [
        'Most deaths and serious injuries in survivable helicopter accidents result from head injury and occupants striking the cabin interior. Restraints work only if they are worn: crew should be seated and restrained with shoulder harnesses during take-off, landing and taxi, and whenever possible in flight. Unrestrained crew in the back of a helicopter have been associated with markedly higher injury and death rates.',
        'Helmets reduce the risk of fatal head injury in crashes, protect hearing and support communication; visors protect eyes from bird strike and debris. Flame-resistant flight suits (such as Nomex), sturdy boots and gloves add protection from post-crash fire. Hearing protection matters because helicopter cabins often exceed 90–100 dB.',
        'Crashworthy seats absorb vertical impact energy (stroking seats), and crash-resistant fuel systems reduce post-crash fire. Medical crew should know how to release their harness quickly — including when inverted — and the location of emergency exits.',
      ],
    },
    {
      id: 'patient', title: 'Securing the patient and equipment', core: true,
      body: [
        'The patient must be restrained on the stretcher with shoulder and lap straps, and the stretcher locked into a certified mount. Check the lock visually and physically before every flight. An unrestrained patient or stretcher becomes a projectile in turbulence or a hard landing, injuring the patient and crew.',
        'All medical equipment — monitors, ventilators, pumps, oxygen cylinders, bags — must be secured to approved mounts or stowed. Loose items can strike crew, block exits, or interfere with flight controls. Equipment brought by a referring facility (balloon pumps, ECMO, incubators) must have an approved mounting solution before flight; if it cannot be secured, it cannot fly.',
        'Oxygen cylinders are secured upright or in brackets, valves protected. Sharp items go into secured sharps containers. Infusion lines and tubes should be managed so that they do not snag during loading or egress.',
      ],
    },
    {
      id: 'combative', title: 'Agitated and combative patients', core: true,
      body: [
        'A combative patient in flight can strike the pilot, controls or doors and endanger the aircraft. Assess the risk before departure: intoxication, psychosis, head injury, hypoxia, hypoglycaemia and pain all cause agitation. Treat the cause where possible, and use adequate chemical sedation (and intubation if needed) before flight rather than relying on physical restraints in the air.',
        'Physical restraints should be soft, applied to all four limbs if used, and never prone — prone restraint can cause positional asphyxia and cardiac arrest. Monitor restrained patients continuously: airway, breathing, circulation, and distal perfusion of restrained limbs. Document the indication, type, time and checks.',
        'Law enforcement custody patients may need an officer to accompany them if policy allows, and handcuffs must be removable by the crew in an emergency (keys on board) or replaced with soft restraints. Weapons are never allowed on board except per specific policy for law enforcement.',
      ],
      list: { caption: 'Before every flight', items: ['Crew restrained, helmets on, visors available', 'Patient strapped (shoulder and lap)', 'Stretcher locked — checked visually and physically', 'All equipment in certified mounts or stowed', 'Oxygen cylinders secured; sharps contained', 'Agitation risk addressed before departure'] },
    },
    {
      id: 'case', title: 'Scenario: the intoxicated head injury',
      body: ['A 28-year-old with a scalp laceration and a GCS of 13 after a fall is intoxicated, shouting and pulling at his collar. He is protecting his airway. The flight to the trauma centre is 30 minutes.'],
      example: { case: 'Is he safe to fly?', steps: [
        'Agitation in a small cabin is a flight safety risk; exclude hypoxia and hypoglycaemia.',
        'If he cannot be calmed reliably, sedate adequately — and if sedation would compromise his airway or neuro exam, intubate before departure.',
        'Do not rely on physical restraint alone; never prone.',
        'If restrained, document and check perfusion and breathing throughout.',
      ] },
    },
  ],
  keyPoints: [
    'Restraints and helmets prevent most deaths in survivable crashes — wear them.',
    'Flame-resistant clothing, boots, gloves and hearing protection.',
    'Patient strapped, stretcher locked and checked, equipment in certified mounts.',
    'Equipment that cannot be secured cannot fly.',
    'Combative patients: treat the cause, sedate or intubate before flight; never prone restraint.',
  ],
  pearls: ['Practise releasing your harness inverted.', 'Keys to handcuffs must be on board.'],
  pitfalls: ['Unrestrained crew during "just a short" care task at landing.', 'Unsecured referring-hospital equipment.'],
  questions: [
    { q: 'The most common cause of death in survivable helicopter crashes:', options: ['Burns only', 'Head injury and striking the cabin interior', 'Drowning', 'Hypothermia'], answer: 1, why: 'Restraints and helmets help.' },
    { q: 'Crew should be restrained:', options: ['Only in cruise', 'During take-off, landing, taxi and whenever possible', 'Never — it limits care', 'Only at night'], answer: 1, why: 'Critical phases.' },
    { q: 'Helmets in air medical crews:', options: ['Are optional decoration', 'Reduce fatal head injury and protect hearing', 'Increase injury', 'Are only for pilots'], answer: 1, why: 'Protective equipment.' },
    { q: 'Flame-resistant flight suits protect against:', options: ['Hypoxia', 'Post-crash fire', 'Noise', 'Cold only'], answer: 1, why: 'Nomex-type suits resist flame after a crash.' },
    { q: 'Helicopter cabin noise can exceed:', options: ['40 dB', '90–100 dB', '20 dB', '150 dB always'], answer: 1, why: 'Hearing protection needed.' },
    { q: 'The stretcher lock should be checked:', options: ['Once a week', 'Visually and physically before every flight', 'Only if loose', 'By the patient'], answer: 1, why: 'Prevents projectile stretcher.' },
    { q: 'Medical equipment that cannot be secured:', options: ['Can be held by a crew member', 'Cannot fly', 'Can be placed on the patient', 'Can go on the floor'], answer: 1, why: 'Projectile risk.' },
    { q: 'Prone restraint of a combative patient risks:', options: ['Improved breathing', 'Positional asphyxia and cardiac arrest', 'Nothing', 'Hypothermia'], answer: 1, why: 'Restricted ventilation.' },
    { q: 'The preferred approach to a dangerously agitated patient before flight:', options: ['Physical restraint only', 'Treat the cause and use adequate sedation or intubation', 'Fly without restraint', 'Ask the patient to calm down'], answer: 1, why: 'Flight safety.' },
    { q: 'Restrained patients require:', options: ['No monitoring', 'Continuous monitoring including distal perfusion', 'Hourly checks only', 'Removal of all monitoring'], answer: 1, why: 'Restraint complications.' },
    { q: 'Handcuffed patients in the aircraft require:', options: ['Nothing special', 'Keys on board or soft restraints instead', 'Additional handcuffs', 'Prone positioning'], answer: 1, why: 'Emergency egress.' },
    { q: 'Crashworthy (stroking) seats:', options: ['Recline for comfort', 'Absorb vertical impact energy', 'Rotate', 'Eject'], answer: 1, why: 'Reduce spinal injury.' },
    { q: 'Oxygen cylinders in the aircraft should be:', options: ['Loose on the floor', 'Secured in brackets with valves protected', 'Held by the crew', 'Placed on the stretcher'], answer: 1, why: 'Projectile and fire risk.' },
    { q: 'A cause of agitation to exclude before sedation:', options: ['Hypoxia and hypoglycaemia', 'Tall stature', 'Blood type', 'Allergies'], answer: 0, why: 'Reversible causes.' },
    { q: 'Patient restraint on the stretcher should include:', options: ['Lap strap only', 'Shoulder and lap straps', 'None', 'Ankle straps only'], answer: 1, why: 'Prevents ejection.' },
  ],
  sources: [
    { title: 'CAMTS: Accreditation standards (aircraft safety and equipment)', url: 'https://www.camts.org/standards/' },
    { title: 'NTSB Special Investigation Report on Emergency Medical Services Operations (2006)', url: 'https://www.ntsb.gov/safety/safety-studies/Pages/SIR0601.aspx' },
  ],
};

export const PREFLIGHT: FpcLesson = {
  id: 'fpc-preflight', domain: 'safety', ref: 'I.14',
  title: 'The pre-flight check: aircraft, equipment and crew',
  summary: 'Daily aircraft walk-arounds, medical equipment and oxygen checks, configuration for the mission, crew briefings, and the checklists that catch problems before take-off.',
  objectives: [
    'Describe the medical crew\'s part in the daily aircraft and equipment check.',
    'Check oxygen supply and calculate cylinder duration.',
    'Conduct a pre-flight crew briefing.',
  ],
  sections: [
    {
      id: 'walk', title: 'The walk-around', core: true,
      body: [
        'The pilot is responsible for the airworthiness inspection, but medical crew take part in a daily walk-around, often with the pilot, and check the cabin before every flight. Look for: fluid leaks, damage to the skin, rotor blades and tail rotor, open or unlatched panels and doors, foreign objects near the aircraft or in intakes, condition of tyres or skids, and tie-downs and covers removed. Report anything unusual — the pilot decides its significance.',
        'In the cabin: seats and harnesses serviceable, helmets present and working (communications, visor), emergency exits clear and their release handles understood, fire extinguisher present and charged, first aid and survival kit present, lighting working, and the stretcher mount and locks functional.',
        'After the walk-around, remove covers, tie-downs and any equipment from around the aircraft. A final "foreign object" check before start-up prevents rotor wash from lifting debris into the rotors.',
      ],
    },
    {
      id: 'medical', title: 'Medical equipment and oxygen', core: true,
      body: [
        'Check all medical equipment at the start of each shift: monitor/defibrillator (charge, pads, cables, self-test), ventilator (function test, circuits, oxygen supply), suction (power and function), infusion pumps, video laryngoscope and airway kit, ultrasound, medications (stock, expiry, controlled drug count and security), blood products (temperature logs) and point-of-care testing equipment. Batteries should be fully charged with spares; aircraft power inverters checked.',
        'Oxygen supply: check main and portable cylinder pressures and calculate duration. For US cylinders: duration (minutes) = (cylinder pressure in psi − safe residual, usually 200 psi) × cylinder factor ÷ flow (L/min). Common factors: D cylinder 0.16, E 0.28, M 1.56, H/K 3.14. A ventilator\'s oxygen use depends on minute ventilation and FiO₂ plus any driving gas; plan at least twice the expected flight time.',
        'Configure the aircraft for the expected mission (neonatal incubator, balloon pump, bariatric stretcher) and confirm that all extra equipment is secured and accounted for in weight and balance.',
      ],
      example: {
        case: 'An M cylinder reads 1800 psi. The patient needs 10 L/min. How long will it last?',
        steps: ['(1800 − 200) × 1.56 = 2496 L available.', '2496 ÷ 10 = about 250 minutes (just over 4 hours).', 'A 90-minute transfer with a margin of twice the flight time needs 180 minutes — adequate.'],
      },
    },
    {
      id: 'brief', title: 'Pre-flight briefing and checklists', core: true,
      body: [
        'Before each mission, the crew briefs: the mission (destination, patient, special equipment), weather and any concerns, fuel and possible refuelling, LZ or destination hazards, crew roles for the flight, and the plan for an in-flight emergency. Each crew member confirms readiness — including fitness for duty.',
        'Checklists prevent omissions when people are tired, busy or interrupted; they do not replace knowledge but protect against memory failures. Use them for start-up, pre-departure ("doors closed and latched, belts on, equipment secured, ready for take-off"), and before landing. Read-do or challenge-and-response formats both work if used consistently.',
        'A pre-departure "last look" by each crew member around their side of the aircraft — doors, latches, tie-downs and people clear — is a final barrier against common incidents such as doors opening in flight.',
      ],
      table: {
        caption: 'Oxygen cylinder factors (US)',
        head: ['Cylinder', 'Factor (L/psi)'],
        rows: [['D', '0.16'], ['E', '0.28'], ['M', '1.56'], ['G', '2.41'], ['H / K', '3.14']],
      },
    },
    {
      id: 'case', title: 'Scenario: what the walk-around found',
      body: ['During the morning check, you notice a small fresh puddle of red fluid under the helicopter\'s transmission area, a cabin door latch that does not fully close, and a portable E cylinder showing 600 psi.'],
      example: { case: 'Actions.', steps: [
        'Report the fluid to the pilot immediately — possible hydraulic leak; maintenance decides airworthiness.',
        'Report the latch: doors opening in flight are a recurring hazard; it must be fixed before flight.',
        'Replace the E cylinder: (600 − 200) × 0.28 = 112 L, only about 11 minutes at 10 L/min.',
        'Record the findings; the aircraft is out of service until cleared.',
      ] },
    },
  ],
  keyPoints: [
    'Medical crew join the walk-around and check the cabin; the pilot decides airworthiness.',
    'Check every device, battery, drug and blood product each shift.',
    'O₂ duration = (psi − 200) × factor ÷ L/min; D 0.16, E 0.28, M 1.56, H 3.14.',
    'Plan oxygen for at least twice the expected flight time.',
    'Brief every mission; use checklists and a final last look.',
  ],
  pearls: ['Report — don\'t judge — what you find.', 'Doors opening in flight are preventable.'],
  pitfalls: ['Forgetting ventilator driving gas in oxygen calculations.', 'Leaving covers or tie-downs on.'],
  questions: [
    { q: 'Responsibility for determining airworthiness lies with:', options: ['The flight nurse', 'The pilot (and maintenance)', 'The patient', 'Dispatch'], answer: 1, why: 'Crew report findings.' },
    { q: 'Safe residual pressure commonly used in oxygen calculations:', options: ['0 psi', '200 psi', '1000 psi', '2000 psi'], answer: 1, why: 'About 200 psi is kept as a safety reserve.' },
    { q: 'E cylinder factor:', options: ['0.16', '0.28', '1.56', '3.14'], answer: 1, why: 'Standard factor.' },
    { q: 'An E cylinder at 2000 psi at 10 L/min lasts about:', options: ['10 min', '50 min', '2 hours', '5 hours'], answer: 1, why: '(2000−200)×0.28 ÷ 10 ≈ 50 min.' },
    { q: 'M cylinder factor:', options: ['0.28', '1.56', '3.14', '0.16'], answer: 1, why: 'Standard factor.' },
    { q: 'A D cylinder at 1200 psi at 4 L/min lasts about:', options: ['10 min', '40 min', '2 hours', '4 hours'], answer: 1, why: '(1200−200)×0.16 ÷ 4 = 40 min.' },
    { q: 'Oxygen should be planned for at least:', options: ['The exact flight time', 'Twice the expected flight time', '10 minutes', 'Half the flight'], answer: 1, why: 'Delays and diversions.' },
    { q: 'Fresh fluid under the transmission should be:', options: ['Ignored', 'Reported to the pilot immediately', 'Wiped away', 'Noted at shift end'], answer: 1, why: 'Possible leak.' },
    { q: 'Checklists primarily protect against:', options: ['Lack of knowledge', 'Memory failures and omissions', 'Weather', 'Noise'], answer: 1, why: 'Human factors.' },
    { q: 'A pre-departure "last look" checks:', options: ['Patient labs', 'Doors, latches, tie-downs and people clear', 'Fuel price', 'Weather radar'], answer: 1, why: 'Final barrier.' },
    { q: 'A pre-mission briefing should include:', options: ['Crew roles and emergency plan', 'Only the patient\'s name', 'Nothing', 'Billing codes'], answer: 0, why: 'Shared mental model.' },
    { q: 'Ventilator oxygen consumption depends on:', options: ['Patient age only', 'Minute ventilation, FiO₂ and any driving gas', 'Cabin temperature', 'Flight time only'], answer: 1, why: 'Plan accurately.' },
    { q: 'Foreign objects near the aircraft are dangerous because:', options: ['They are untidy', 'Rotor wash can lift them into rotors or intakes', 'They block radios', 'They are heavy'], answer: 1, why: 'Lifted debris causes foreign object damage.' },
    { q: 'Blood products on board require:', options: ['No checks', 'Temperature log checks', 'Freezing', 'Daily transfusion'], answer: 1, why: 'Cold chain.' },
    { q: 'Controlled drugs at shift start:', options: ['Are not checked', 'Are counted and secured', 'Are left in the aircraft unlocked', 'Are discarded'], answer: 1, why: 'Accountability.' },
  ],
  sources: [
    { title: 'CAMTS: Accreditation standards', url: 'https://www.camts.org/standards/' },
    { title: 'FAA Helicopter Flying Handbook — Preflight', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook' },
  ],
};

export const PAX_BRIEFING: FpcLesson = {
  id: 'fpc-pax-briefing', domain: 'safety', ref: 'I.15',
  title: 'Passenger and patient briefings',
  summary: 'What every passenger, patient and ride-along must be told, when family members may fly, briefing children and people with disabilities, and the regulatory requirement for safety briefings.',
  objectives: [
    'Deliver a complete passenger safety briefing.',
    'Decide whether family members or observers can fly safely.',
    'Adapt briefings for patients, children and people with communication needs.',
  ],
  sections: [
    {
      id: 'content', title: 'What a briefing must cover', core: true,
      body: [
        'US regulations require that passengers are briefed before flight. For air medical operations, everyone who is not crew — family members, observers, students, accompanying providers and, when possible, the patient — receives a briefing covering: approaching and leaving the aircraft (only when directed, from the front or side, never near the tail), seat belts and harnesses (how to fasten and release), no smoking, use of helmets or headsets and how to talk on the intercom, location and operation of emergency exits, the fire extinguisher, survival equipment and first aid kit, the ELT, flotation devices for flights over water, and the brace position.',
        'Passengers must not touch controls, door handles or medical equipment, must stay seated and belted, and must not distract the pilot — especially during take-off and landing. Explain what will happen in an emergency and that they must follow crew instructions immediately.',
        'Briefings may be supplemented by printed cards, but a verbal briefing with a check of understanding is the standard. Document that the briefing was given.',
      ],
      list: { caption: 'Passenger briefing contents', items: ['Approaching and leaving the aircraft; tail rotor danger', 'Seat belts and harness release', 'No smoking; no touching controls or equipment', 'Headset/helmet and intercom use', 'Emergency exits and how to open them', 'Fire extinguisher, survival kit, first aid, ELT', 'Brace position', 'Flotation equipment for over-water flights'] },
    },
    {
      id: 'family', title: 'Family members and ride-alongs', core: true,
      body: [
        'Allowing a parent to accompany a child, or a family member to accompany a patient, can reduce distress and help consent and history-taking. But each additional person adds weight, takes space and may become a second patient or a distraction. Programmes have criteria: the person must be calm, sober, able to follow instructions, within weight limits, not need medical care themselves, and fit in an approved seat without impeding patient care or exits.',
        'The final decision rests with the pilot (weight, balance and safety) and the medical crew (impact on patient care). A distraught or intoxicated family member should travel by ground. In a deteriorating situation — for example a cardiac arrest in flight — the crew should tell the family member what is happening and what they need from them.',
        'Students, observers and accompanying providers (a neonatal nurse, a perfusionist) must be trained or briefed in aircraft safety and their role. Specialist teams such as ECMO crews need extra briefing on aircraft limits for their equipment.',
      ],
    },
    {
      id: 'adapt', title: 'Patients, children and communication needs', core: true,
      body: [
        'Conscious patients should be briefed in simple terms: what the flight will be like (noise, vibration, cold), how long it will take, that they are strapped in for safety, how to signal pain or nausea, and what to do in an emergency. This reduces anxiety, which itself raises oxygen demand and heart rate.',
        'Children respond to calm, honest, age-appropriate explanation; a parent\'s presence helps when it can be done safely. People who are deaf or hard of hearing need visual communication — writing boards, gestures agreed before take-off — because headsets may not help. Interpreters may be needed for patients and family who do not speak the crew\'s language; arrange this before departure, as cabin noise makes interpretation in flight difficult.',
        'Patients with cognitive impairment or dementia may become distressed in the unfamiliar, noisy environment; carers can advise on what helps. Plan sedation or restraint needs before departure.',
      ],
    },
    {
      id: 'case', title: 'Scenario: the mother who wants to fly',
      body: ['A 3-year-old with severe croup needs transfer. Her mother is calm, weighs 70 kg, and wants to fly. The pilot confirms there is weight margin and a certified seat. The father, who has been drinking, also asks to come.'],
      example: { case: 'Decide and brief.', steps: [
        'The mother meets criteria; the pilot and crew agree she may fly.',
        'Brief her fully: approach, seat belt and release, headset, exits, brace, no touching equipment, follow instructions.',
        'Explain what she may see if the child deteriorates and what you will need her to do.',
        'The father travels by ground — intoxication excludes him; give him the destination details.',
      ] },
    },
  ],
  keyPoints: [
    'Every non-crew occupant receives a verbal safety briefing — document it.',
    'Cover approach, belts, exits, extinguisher, survival kit, ELT, brace, intercom and no touching.',
    'Family ride-alongs: calm, sober, within weight, no care needs; pilot and crew both agree.',
    'Brief conscious patients — it reduces anxiety.',
    'Plan interpreters and visual communication before departure.',
  ],
  pearls: ['A calm parent can be the best sedative for a child.', 'Agree hand signals before take-off.'],
  pitfalls: ['Letting a distraught or intoxicated relative fly.', 'Skipping the briefing because "it\'s a short flight".'],
  questions: [
    { q: 'Who must receive a safety briefing?', options: ['Only the pilot', 'All non-crew occupants, including family and observers', 'Only patients', 'Nobody'], answer: 1, why: 'Regulatory requirement.' },
    { q: 'A passenger briefing includes:', options: ['Billing', 'Emergency exits, belts, brace and approach rules', 'Patient\'s diagnosis', 'Weather history'], answer: 1, why: 'Standard content.' },
    { q: 'Passengers should approach the aircraft:', options: ['From the tail', 'Only when directed, from the front or side', 'Running', 'Whenever ready'], answer: 1, why: 'Rotor safety.' },
    { q: 'A family member may fly if they are:', options: ['Intoxicated but insistent', 'Calm, sober, within weight limits and do not need care', 'Distraught', 'Carrying heavy luggage'], answer: 1, why: 'Programme criteria.' },
    { q: 'The final decision on a family ride-along involves:', options: ['Only the family', 'The pilot and medical crew', 'The referring physician only', 'Dispatch alone'], answer: 1, why: 'Safety and care impact.' },
    { q: 'Briefing a conscious patient helps by:', options: ['Increasing anxiety', 'Reducing anxiety and oxygen demand', 'Lengthening the flight', 'Nothing'], answer: 1, why: 'Calmer patients.' },
    { q: 'A deaf patient in flight should be communicated with using:', options: ['Shouting', 'Writing boards and agreed gestures', 'The intercom', 'Nothing'], answer: 1, why: 'Visual methods.' },
    { q: 'Interpreters are best arranged:', options: ['In flight', 'Before departure', 'After landing only', 'Never'], answer: 1, why: 'Cabin noise.' },
    { q: 'Passengers must not:', options: ['Wear seat belts', 'Touch controls, door handles or medical equipment', 'Use headsets', 'Sit down'], answer: 1, why: 'Touching controls or doors endangers everyone.' },
    { q: 'For over-water flights the briefing adds:', options: ['Sunscreen', 'Flotation devices', 'Fishing gear', 'Nothing'], answer: 1, why: 'Ditching survival.' },
    { q: 'Accompanying specialists (e.g. perfusionists) need:', options: ['No briefing', 'Aircraft safety briefing and equipment limits', 'Only a seat', 'To fly the aircraft'], answer: 1, why: 'Not routine crew.' },
    { q: 'Documentation of a passenger briefing is:', options: ['Optional', 'Expected', 'Forbidden', 'Only for children'], answer: 1, why: 'Record of compliance.' },
    { q: 'During take-off and landing, passengers should:', options: ['Talk to the pilot', 'Stay seated, belted and quiet', 'Move around', 'Open windows'], answer: 1, why: 'Sterile cockpit.' },
    { q: 'An intoxicated relative asking to fly should:', options: ['Fly in front', 'Travel by ground', 'Hold the patient', 'Sit by the door'], answer: 1, why: 'Unsafe passenger.' },
    { q: 'Printed safety cards:', options: ['Replace verbal briefings', 'Supplement a verbal briefing', 'Are illegal', 'Are for pilots only'], answer: 1, why: 'Check understanding verbally.' },
  ],
  sources: [
    { title: '14 CFR 135.117 (briefing of passengers before flight)', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-135/subpart-B/section-135.117' },
    { title: '14 CFR 135.621 (helicopter air ambulance — briefing of medical personnel)', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-135/subpart-L/section-135.621' },
  ],
};
