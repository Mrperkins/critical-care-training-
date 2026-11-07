/** FP-C I.16–I.18: risk assessment; night vision goggle operation; GPS and navigation. */
import type { FpcLesson } from '../types';

export const RISK_ASSESSMENT: FpcLesson = {
  id: 'fpc-risk-assessment', domain: 'safety', ref: 'I.16',
  title: 'Risk assessment and crew resource management',
  summary: 'Pre-flight risk analysis tools, scoring and mitigation, dynamic in-flight reassessment, crew resource management, threat and error management, and hazardous attitudes.',
  objectives: [
    'Complete and act on a pre-flight risk analysis.',
    'Apply crew resource management and assertive communication.',
    'Recognise hazardous attitudes and their antidotes.',
  ],
  sections: [
    {
      id: 'fra', title: 'Pre-flight risk analysis', core: true,
      body: [
        'Since the 2014 FAA rule, US helicopter air ambulance pilots must complete a pre-flight risk analysis before each flight. Risk assessment tools score factors such as weather (ceilings, visibility, forecast trends, icing), time of day and lighting, terrain, familiarity with the area and LZ, crew experience and fatigue, aircraft equipment (NVGs, IFR capability, autopilot), mission type (scene versus interfacility), and duty time.',
        'Scores fall into bands: low risk (go), medium risk (mitigate and possibly seek approval from an operations control specialist or manager) and high risk (decline unless mitigated to an acceptable level, with management approval). Mitigations include waiting for weather to improve, using a different route or aircraft, adding an IFR plan, using a ground team, or changing the destination.',
        'The analysis is completed without knowledge of the patient\'s condition and repeated when conditions change. A completed risk form is not a box to tick: it is a structured conversation about whether the flight should happen.',
      ],
    },
    {
      id: 'crm', title: 'Crew resource management', core: true,
      body: [
        'Crew resource management (CRM) is the effective use of all available resources — people, equipment and information — to achieve safe operations. It grew from aviation accident investigations showing that most accidents involved failures of communication, leadership, decision-making and situational awareness rather than technical skill.',
        'Core skills: situational awareness (knowing what is happening, what it means and what will happen next), communication (closed-loop: send, acknowledge, confirm), leadership and followership, workload management, and decision-making. Assertive communication gives every crew member a voice; frameworks such as the "two-challenge rule" (if a concern is raised twice and not addressed, the crew member may take action to ensure safety) and graded assertiveness (CUS: "I\'m Concerned, I\'m Uncomfortable, this is a Safety issue") help junior crew speak up.',
        'Threat and error management (TEM) anticipates threats (weather, terrain, fatigue, unfamiliar LZs, complex patients), traps errors before they cause harm, and manages undesired aircraft or patient states. Debriefing after missions — what went well, what could be better — builds a learning culture.',
      ],
      table: {
        caption: 'Hazardous attitudes and antidotes',
        head: ['Attitude', 'Sounds like', 'Antidote'],
        rows: [['Anti-authority', '"Don\'t tell me"', 'Follow the rules; they are usually right'], ['Impulsivity', '"Do something — quickly"', 'Not so fast; think first'], ['Invulnerability', '"It won\'t happen to me"', 'It could happen to me'], ['Macho', '"I can do it"', 'Taking chances is foolish'], ['Resignation', '"What\'s the use?"', 'I\'m not helpless; I can make a difference']],
      },
    },
    {
      id: 'dynamic', title: 'Dynamic risk and decision traps', core: true,
      body: [
        'Risk changes during a mission: weather deteriorates, a scene LZ turns out to be tighter than described, fuel is lower than expected, or fatigue sets in. Reassess at each phase and set "decision points" in advance — for example, a minimum ceiling at which the aircraft will turn back.',
        'Decision traps include plan continuation bias ("get-there-itis") — the tendency to continue a plan despite changing conditions, which strengthens as the destination nears; sunk cost thinking; mission pressure from a critically ill patient; and normalisation of deviance, in which small rule-bending becomes routine because nothing bad has happened yet.',
        'A culture where any crew member can call "abort" without explanation or criticism — and where management supports conservative decisions — is the most effective defence.',
      ],
    },
    {
      id: 'case', title: 'Scenario: get-there-itis',
      body: ['Returning from a scene at night with a critically injured child, the ceiling ahead lowers and light rain begins. The trauma centre is 15 minutes away; a community hospital is 5 minutes away. The pilot says, "We\'re nearly there — I think we can make it."'],
      example: { case: 'What should the medical crew do?', steps: [
        'Recognise plan continuation bias, intensified by proximity and the patient\'s condition.',
        'Speak up with graded assertiveness: "I\'m concerned about the weather; I\'m uncomfortable continuing; can we divert?"',
        'Support a diversion to the community hospital, with ground transfer to the trauma centre if needed.',
        'Debrief afterwards and report through the SMS.',
      ] },
    },
  ],
  keyPoints: [
    'Pre-flight risk analysis before every HAA flight; low, medium, high bands with mitigation.',
    'Risk decisions are made blind to the patient\'s condition and repeated when conditions change.',
    'CRM: situational awareness, closed-loop communication, workload, leadership and followership.',
    'CUS and the two-challenge rule help crew speak up.',
    'Beware plan continuation bias, mission pressure and normalisation of deviance.',
  ],
  pearls: ['Set turn-back decision points before departure.', 'Debrief every mission.'],
  pitfalls: ['Treating the risk form as paperwork.', 'Pressing on because the destination is close.'],
  questions: [
    { q: 'A pre-flight risk analysis is required for HAA flights by:', options: ['CAMTS only', 'The 2014 FAA rule', 'Hospital policy only', 'Nobody'], answer: 1, why: 'Regulatory requirement.' },
    { q: 'A high-risk score should lead to:', options: ['Immediate launch', 'Decline unless mitigated and approved', 'Ignoring it', 'Flying faster'], answer: 1, why: 'Risk management.' },
    { q: 'CRM originated from:', options: ['Hospital billing', 'Aviation accident investigations', 'Military rank structures', 'Weather research'], answer: 1, why: 'Non-technical failures.' },
    { q: 'Closed-loop communication means:', options: ['Talking in a circle', 'Send, acknowledge and confirm', 'Silence', 'One-way commands'], answer: 1, why: 'Ensures understanding.' },
    { q: 'CUS stands for:', options: ['Call, Update, Secure', 'Concerned, Uncomfortable, Safety issue', 'Check, Use, Stop', 'Crew, Unit, System'], answer: 1, why: 'Graded assertiveness.' },
    { q: 'The two-challenge rule:', options: ['Two pilots required', 'If a concern raised twice is not addressed, a crew member may act for safety', 'Two flights per shift', 'Two checklists'], answer: 1, why: 'Empowers crew.' },
    { q: 'Plan continuation bias is:', options: ['Good planning', 'Continuing a plan despite changing conditions', 'Diverting early', 'Checklist use'], answer: 1, why: '"Get-there-itis".' },
    { q: 'The antidote to "It won\'t happen to me":', options: ['Follow the rules', 'It could happen to me', 'Not so fast', 'I\'m not helpless'], answer: 1, why: 'Invulnerability.' },
    { q: 'The antidote to "Don\'t tell me":', options: ['Follow the rules', 'It could happen to me', 'Taking chances is foolish', 'Not so fast'], answer: 0, why: 'Anti-authority.' },
    { q: 'Normalisation of deviance:', options: ['Following rules strictly', 'Small rule-bending becoming routine because nothing bad happened', 'A medical diagnosis', 'Standard procedure'], answer: 1, why: 'Erodes safety margins.' },
    { q: 'Situational awareness includes:', options: ['Only current state', 'Perceiving, understanding and projecting the future', 'Only weather', 'Only patient vitals'], answer: 1, why: 'Three levels.' },
    { q: 'Threat and error management aims to:', options: ['Eliminate all errors', 'Anticipate threats, trap errors and manage undesired states', 'Punish errors', 'Avoid checklists'], answer: 1, why: 'TEM framework.' },
    { q: 'Risk analysis should be repeated:', options: ['Never', 'When conditions change', 'Only annually', 'After landing only'], answer: 1, why: 'Dynamic risk.' },
    { q: 'The antidote to impulsivity:', options: ['Not so fast; think first', 'I can do it', 'What\'s the use?', 'Follow the rules'], answer: 0, why: 'Pause and think before acting.' },
    { q: 'Mission pressure most often comes from:', options: ['The weather', 'A critically ill patient and wanting to help', 'Fuel', 'Maintenance'], answer: 1, why: 'Why decisions are made blind.' },
  ],
  sources: [
    { title: 'FAA: 14 CFR 135.617 (pre-flight risk analysis)', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-135/subpart-L/section-135.617' },
    { title: 'FAA Pilot\'s Handbook of Aeronautical Knowledge — Aeronautical decision-making', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak' },
  ],
};

export const NVG: FpcLesson = {
  id: 'fpc-nvg', domain: 'safety', ref: 'I.17',
  title: 'Night vision goggle operations',
  summary: 'How NVGs amplify light, their field of view and acuity limits, cabin lighting compatibility, adaptation, scanning technique, hazards such as halo and wire blindness, and the medical crew\'s role.',
  objectives: [
    'Explain how NVGs work and their visual limitations.',
    'Describe NVG-compatible cabin lighting and medical crew procedures.',
    'Recognise NVG hazards and use correct scanning technique.',
  ],
  sections: [
    {
      id: 'how', title: 'How NVGs work', core: true,
      body: [
        'Night vision goggles are image intensifiers: they collect ambient light (starlight, moonlight, cultural lighting) including near-infrared, convert photons to electrons at a photocathode, multiply the electrons through a microchannel plate, and strike a phosphor screen that produces a green (or white phosphor) image. They need some light — in total darkness or under heavy cloud with no ground lights, performance falls sharply.',
        'NVGs improve the ability to see terrain, obstacles, weather and other aircraft at night and have been associated with reduced night accident risk in helicopter air ambulance operations. The 2014 FAA rule allows lower weather minimums when NVGs or HTAWS are used in some circumstances.',
        'Limitations: a field of view of about 40° (compared with nearly 180° for the naked eye), visual acuity of about 20/25 to 20/40 at best, reduced depth perception, no colour discrimination, and degraded images in rain, fog, snow and smoke. Moving the head is essential to compensate for the narrow field.',
      ],
    },
    {
      id: 'cabin', title: 'Cabin lighting and medical crew procedures', core: true,
      body: [
        'White light inside the cabin "blooms" the goggles, washing out the image and forcing the tubes to shut down (automatic brightness control), and destroys the pilot\'s night adaptation. NVG-compatible lighting uses filtered blue-green light that the goggles do not detect. Medical crew must use only NVG-compatible lights in flight and cover or dim monitor screens, pump displays and other light sources; switch off unnecessary screens and use filters.',
        'If white light is essential (for example, a procedure in flight), warn the pilot first ("white light in the cabin") and wait for acknowledgement; the pilot may need to change phase of flight or use the instruments. Agree these procedures in the pre-flight brief.',
        'Medical crew members who wear NVGs act as additional lookouts during low-level flight and landing, calling out obstacles, wires and terrain using standard phraseology. They need initial and recurrent NVG training, including goggle adjustment (focus, eye relief, interpupillary distance) and pre-flight testing.',
      ],
      list: { caption: 'NVG-compatible cabin habits', items: ['Only filtered NVG-compatible lighting', 'Dim or cover monitor, pump and phone screens', 'Warn the pilot before any white light', 'Brief lighting needs before take-off', 'Help scan during low-level flight and landing'] },
    },
    {
      id: 'hazards', title: 'NVG illusions and hazards', core: true,
      body: [
        'Halos form around bright light sources and can obscure objects nearby. Wires remain very hard to see; poles and towers give clues. Reduced depth perception and absent colour make it difficult to judge distance and closure rate — scan the instruments and use radar altimeters. Brownout and whiteout are harder to manage with NVGs because of the narrow field.',
        'Fatigue increases with goggle use: neck strain from the weight on the helmet, eye strain and the mental effort of interpreting a monochrome image. The "dark adaptation" of the unaided eye (needed when looking under the goggles at instruments or outside) takes 20–30 minutes and is lost with any bright white light.',
        'Scanning technique: move the head deliberately to sweep the field (the eyes alone cannot move far within a 40° view), look under or around the goggles to the instruments, and use off-centre viewing with the unaided eye in low light, because the centre of the retina (cones) is less sensitive at night than the periphery (rods).',
      ],
    },
    {
      id: 'case', title: 'Scenario: the ventilator alarm at night',
      body: ['During an NVG flight at 500 feet, the ventilator alarms for high pressure. You need to see the screen clearly and check the patient\'s chest and tube, which needs light.'],
      example: { case: 'What do you do?', steps: [
        'Use NVG-compatible lighting first: the dimmed ventilator display and a filtered torch.',
        'If white light is needed, announce it: "Pilot, white light in the cabin," and wait for acknowledgement.',
        'Shield the light toward the patient, keep it brief, and switch it off when done.',
        'Resume NVG-compatible conditions and tell the pilot.',
      ] },
    },
  ],
  keyPoints: [
    'NVGs intensify ambient light; they need some light to work.',
    'Field of view ~40°, reduced acuity and depth perception, no colour.',
    'Only NVG-compatible cabin lighting; warn the pilot before any white light.',
    'Halo, wires, brownout and fatigue are key hazards.',
    'Move the head to scan; dark adaptation takes 20–30 minutes.',
  ],
  pearls: ['Off-centre viewing improves unaided night vision.', 'Dim every screen before take-off.'],
  pitfalls: ['A phone screen or white torch in the cabin.', 'Assuming NVGs show wires.'],
  questions: [
    { q: 'NVGs work by:', options: ['Emitting infrared light', 'Intensifying ambient light', 'Radar', 'Thermal imaging only'], answer: 1, why: 'Image intensifiers.' },
    { q: 'NVG field of view is about:', options: ['180°', '40°', '10°', '90°'], answer: 1, why: 'Narrow field.' },
    { q: 'White light in the cabin during NVG flight:', options: ['Improves vision', 'Blooms goggles and destroys night adaptation', 'Has no effect', 'Is required'], answer: 1, why: 'Washes out the image.' },
    { q: 'Before using white light in the cabin:', options: ['Just switch it on', 'Warn the pilot and wait for acknowledgement', 'Open the door', 'Turn off the engine'], answer: 1, why: 'Protects the pilot.' },
    { q: 'NVGs provide:', options: ['Full colour vision', 'Monochrome image without colour', 'Better depth perception', 'Unlimited acuity'], answer: 1, why: 'Green/white phosphor.' },
    { q: 'Halos around lights can:', options: ['Improve detection', 'Obscure nearby objects', 'Show wires', 'Indicate weather'], answer: 1, why: 'NVG artefact.' },
    { q: 'Dark adaptation of the unaided eye takes about:', options: ['1 minute', '20–30 minutes', '3 hours', '5 seconds'], answer: 1, why: 'Rod adaptation.' },
    { q: 'NVG scanning requires:', options: ['Eye movement only', 'Deliberate head movement', 'Staring ahead', 'Closing one eye'], answer: 1, why: 'Narrow field of view.' },
    { q: 'NVG performance falls in:', options: ['Clear moonlit nights', 'Rain, fog, snow and total darkness', 'Urban areas', 'Starlight'], answer: 1, why: 'Less light, obscuration.' },
    { q: 'Off-centre viewing improves unaided night vision because:', options: ['Cones are more sensitive at night', 'Rods in the periphery are more sensitive in low light', 'It reduces glare', 'It is a habit'], answer: 1, why: 'Retinal physiology.' },
    { q: 'NVG visual acuity at best is about:', options: ['20/10', '20/25 to 20/40', '20/200', 'Perfect'], answer: 1, why: 'Reduced acuity.' },
    { q: 'NVG-compatible cabin lighting is:', options: ['Bright white', 'Filtered blue-green', 'Red only', 'Ultraviolet'], answer: 1, why: 'Not detected by goggles.' },
    { q: 'Wires seen through NVGs are:', options: ['Clearly visible', 'Still very hard to see', 'Highlighted', 'Shown in red'], answer: 1, why: 'Thin, low contrast.' },
    { q: 'A source of NVG-related fatigue:', options: ['Light weight', 'Neck strain and eye strain', 'Colour overload', 'Noise'], answer: 1, why: 'Helmet-mounted weight.' },
    { q: 'Medical crew wearing NVGs:', options: ['Are passengers', 'Act as additional lookouts', 'Navigate', 'Fly the aircraft'], answer: 1, why: 'Extra eyes.' },
  ],
  sources: [
    { title: 'FAA Advisory Circulars: night vision goggle operations guidance', url: 'https://www.faa.gov/regulations_policies/advisory_circulars' },
    { title: 'FAA Helicopter Flying Handbook — Night operations', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook' },
  ],
};

export const GPS_NAV: FpcLesson = {
  id: 'fpc-gps-nav', domain: 'safety', ref: 'I.18',
  title: 'GPS and navigation',
  summary: 'How GPS works, coordinate formats, giving and receiving scene locations, moving maps and synthetic vision, backup navigation, and the errors that send aircraft to the wrong place.',
  objectives: [
    'Explain how GPS works and its accuracy and limitations.',
    'Give and interpret coordinates in common formats.',
    'Use GPS and maps to support navigation and locate scenes.',
  ],
  sections: [
    {
      id: 'how', title: 'How GPS works', core: true,
      body: [
        'The Global Positioning System uses a constellation of satellites (about 31 operational) in medium Earth orbit. Each transmits its position and a precise time signal. A receiver calculates its distance from each satellite from the signal travel time; signals from at least four satellites give a three-dimensional position (latitude, longitude, altitude) and correct the receiver\'s clock. Other constellations (GLONASS, Galileo, BeiDou) improve coverage when receivers use them.',
        'Accuracy is typically within a few metres; augmentation systems such as WAAS (Wide Area Augmentation System) improve accuracy and integrity enough to fly instrument approaches. Errors arise from satellite geometry (poor dilution of precision when satellites are bunched), signal reflection off buildings and terrain (multipath), atmospheric delays, obstruction in valleys and urban canyons, and interference or jamming.',
        'RAIM (receiver autonomous integrity monitoring) checks the consistency of signals and alerts the pilot when the position cannot be trusted. Databases must be current — an outdated database can show obstacles, frequencies and procedures that no longer match reality.',
      ],
    },
    {
      id: 'coords', title: 'Coordinates and scene location', core: true,
      body: [
        'Latitude measures north–south position from the equator (0–90° N or S); longitude measures east–west position from the prime meridian (0–180° E or W). Coordinates can be written as degrees–minutes–seconds (35° 12\' 30" N), degrees and decimal minutes (35° 12.50\' N — the format most aviation GPS units use) or decimal degrees (35.2083° N — the format most phones use). Mixing formats is a common source of error — always state the format.',
        'One degree of latitude is about 60 nautical miles; one minute is about 1 nautical mile; one second is about 30 metres. An error in the minutes or seconds column can put a helicopter in the wrong valley. Confirm coordinates by reading them back, and cross-check with a landmark, road name or mile marker.',
        'Other location systems include the US National Grid / MGRS used by some public safety agencies, what3words, and street addresses. Scene coordinates from mobile phones are often accurate, but phone-reported locations at the time of a 911 call may be approximate. When the location is uncertain, ask ground crews for a landmark and to describe what the aircraft will see.',
      ],
      table: {
        caption: 'Coordinate formats (same point)',
        head: ['Format', 'Example'],
        rows: [['Degrees, minutes, seconds', '35° 12\' 30" N, 97° 26\' 15" W'], ['Degrees, decimal minutes', '35° 12.50\' N, 97° 26.25\' W'], ['Decimal degrees', '35.2083, −97.4375']],
      },
    },
    {
      id: 'tools', title: 'Moving maps, synthetic vision and backup navigation', core: true,
      body: [
        'Moving-map displays show the aircraft\'s position over terrain, obstacles, airspace and LZ databases; synthetic vision systems render a 3D view of terrain ahead, useful in poor visibility. Tablets running aviation apps are widely used for situational awareness. All rely on accurate databases and power; a failure should not leave the crew lost.',
        'Backup navigation includes VFR sectional charts, pilotage (navigating by visible landmarks such as roads, rivers and railways), dead reckoning (calculating position from heading, speed and time), and radio navigation aids (VOR). Medical crew can help with landmark identification and reading maps, especially when approaching unfamiliar scenes.',
        'Over-reliance on automation ("automation complacency") reduces situational awareness. Cross-check the GPS against what you see and expect: if the screen says the LZ is on the left but the fire engines are on the right, trust your eyes and query the coordinates.',
      ],
    },
    {
      id: 'case', title: 'Scenario: the wrong valley',
      body: ['Dispatch gives scene coordinates as "36 15 30 north, 82 40 15 west". The pilot enters 36° 15.30\' N, 82° 40.15\' W. On arrival, there is no sign of the incident; ground crews report they can hear the helicopter somewhere to the south-east.'],
      example: { case: 'What went wrong?', steps: [
        'The coordinates were given in degrees–minutes–seconds but entered as decimal minutes.',
        '30 seconds = 0.50 minutes, not 0.30; 15 seconds = 0.25 minutes, not 0.15 — an error of several hundred metres in each axis.',
        'Correct entry: 36° 15.50\' N, 82° 40.25\' W.',
        'Prevent: always state the format, read back, and confirm with a landmark.',
      ] },
    },
  ],
  keyPoints: [
    'GPS needs at least four satellites for a 3D position; WAAS improves accuracy.',
    'Errors: geometry, multipath, obstruction, interference; RAIM warns of unreliable fixes.',
    'Coordinates: DMS, decimal minutes, decimal degrees — always state the format.',
    '1° latitude ≈ 60 NM; 1 minute ≈ 1 NM; 1 second ≈ 30 m.',
    'Cross-check GPS with landmarks; maintain backup navigation skills.',
  ],
  pearls: ['Most aviation GPS units use degrees and decimal minutes.', 'Ask ground crews what the aircraft will see.'],
  pitfalls: ['Entering seconds as decimal minutes.', 'Out-of-date databases.'],
  questions: [
    { q: 'Minimum satellites for a 3D GPS position:', options: ['1', '2', '4', '10'], answer: 2, why: 'Three positions plus clock correction.' },
    { q: 'WAAS:', options: ['Weather radar', 'Augmentation system improving GPS accuracy and integrity', 'Radio frequency', 'Collision avoidance'], answer: 1, why: 'Wide Area Augmentation System.' },
    { q: 'RAIM:', options: ['Weather system', 'Integrity monitoring that alerts when GPS position is unreliable', 'Fuel monitor', 'Engine sensor'], answer: 1, why: 'Receiver autonomous integrity monitoring.' },
    { q: 'Multipath error is caused by:', options: ['Satellite clock', 'Signals reflecting off buildings and terrain', 'Old maps', 'Battery failure'], answer: 1, why: 'Reflected signals.' },
    { q: 'One minute of latitude is about:', options: ['1 metre', '1 nautical mile', '60 miles', '1 km'], answer: 1, why: 'Navigation basics.' },
    { q: 'One second of latitude is about:', options: ['30 metres', '1 mile', '1 km', '3 metres'], answer: 0, why: '1/60 of a nautical mile.' },
    { q: '35° 12\' 30" in degrees and decimal minutes is:', options: ['35° 12.30\'', '35° 12.50\'', '35° 12.03\'', '35° 13.00\''], answer: 1, why: '30 seconds = 0.5 minutes.' },
    { q: 'The coordinate format most aviation GPS units use:', options: ['Decimal degrees', 'Degrees and decimal minutes', 'MGRS only', 'Street addresses'], answer: 1, why: 'Common default.' },
    { q: 'The best way to prevent coordinate errors:', options: ['Speak quickly', 'State the format, read back, and confirm with a landmark', 'Guess', 'Use only addresses'], answer: 1, why: 'Verification.' },
    { q: 'Pilotage means:', options: ['Navigating by visible landmarks', 'Using autopilot', 'Instrument approaches', 'Satellite navigation'], answer: 0, why: 'Backup navigation.' },
    { q: 'Dead reckoning uses:', options: ['Landmarks', 'Heading, speed and time', 'Satellites', 'Radar'], answer: 1, why: 'Calculated position.' },
    { q: 'If GPS shows the LZ on the left but emergency vehicles are visible on the right:', options: ['Trust the GPS', 'Trust your eyes and query the coordinates', 'Land on the left', 'Ignore both'], answer: 1, why: 'Cross-check.' },
    { q: 'Automation complacency:', options: ['Improves awareness', 'Reduces situational awareness through over-reliance', 'Is required', 'Prevents errors'], answer: 1, why: 'Human factors.' },
    { q: 'An outdated navigation database risks:', options: ['Nothing', 'Incorrect obstacles, frequencies and procedures', 'Faster flights', 'Better accuracy'], answer: 1, why: 'Keep databases current.' },
    { q: 'Longitude measures:', options: ['North–south position', 'East–west position from the prime meridian', 'Altitude', 'Speed'], answer: 1, why: 'Definition.' },
  ],
  sources: [
    { title: 'GPS.gov: Official US government information about GPS', url: 'https://www.gps.gov/' },
    { title: 'FAA: Satellite navigation — WAAS', url: 'https://www.faa.gov/about/office_org/headquarters_offices/ato/service_units/techops/navservices/gnss/waas' },
  ],
};
