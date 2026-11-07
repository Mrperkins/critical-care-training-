/** FP-C I.4–I.6: emergency procedures; landing zone operations; obstacle avoidance. */
import type { FpcLesson } from '../types';

export const AIR_EMERGENCIES: FpcLesson = {
  id: 'fpc-air-emergencies', domain: 'safety', ref: 'I.4',
  title: 'In-flight emergencies: fire, depressurisation, IIMC and emergency landing',
  summary: 'What the medical crew does when something goes wrong in the air: cabin fire and smoke, rapid decompression, inadvertent instrument meteorological conditions, engine failure and the brace position, and egress after landing.',
  objectives: [
    'Respond to cabin fire, smoke and fumes as a crew member.',
    'Recognise and manage rapid and slow decompression in pressurised aircraft.',
    'Describe IIMC recovery, emergency landing preparation, bracing and egress.',
  ],
  sections: [
    {
      id: 'fire', title: 'Fire, smoke and fumes', core: true,
      body: [
        'Fire is one of the most feared in-flight emergencies because the aircraft cannot simply stop. Sources include electrical faults, oxygen-enriched environments, medical equipment and engine fires. Tell the pilot immediately and precisely ("smoke from the ventilator", "burning smell behind the left seat"), turn off oxygen if it is feeding the fire, and isolate electrical power to the suspected equipment if you can.',
        'Use the aircraft fire extinguisher (typically Halon or a Halon replacement) aimed at the base of the fire. In a small cabin, extinguishing agents and smoke displace oxygen and can be toxic: crew may need to use portable oxygen or protective breathing equipment, and the pilot may open vents to clear smoke. Most air medical aircraft will land as soon as possible after any fire or smoke event.',
        'Engine fires are managed by the pilot from the cockpit with fire handles and bottles; the crew\'s role is to prepare for an emergency landing and evacuation.',
      ],
    },
    {
      id: 'decomp', title: 'Decompression in pressurised aircraft', core: true,
      body: [
        'Rapid (explosive) decompression follows a sudden loss of cabin pressure — a failed window or door seal. Signs: a loud bang, a rush of air, fog in the cabin (water vapour condensing as temperature falls), flying debris and cold. Cabin altitude climbs toward aircraft altitude within seconds, and the time of useful consciousness at 25 000 feet is only 3–5 minutes (much less with activity). Slow decompression is insidious: a gradually rising cabin altitude, ear pressure and hypoxia symptoms in crew, detected by the cabin altitude warning.',
        'Response: crew put on their own oxygen masks first — you cannot help a patient if you are hypoxic — then secure the patient\'s oxygen (increase FiO₂ to 100 %), check ventilator function, and stay seated and restrained. The pilot performs an emergency descent to a safe altitude (usually 10 000 feet or lower). Afterwards, reassess the patient for gas expansion effects: pneumothorax, ETT cuff over-inflation, and air in infusion lines and drains.',
      ],
    },
    {
      id: 'iimc', title: 'Inadvertent IMC and emergency landings', core: true,
      body: [
        'Inadvertent instrument meteorological conditions (IIMC) — flying unintentionally into cloud or fog, losing outside visual reference — has historically been a leading cause of fatal helicopter air ambulance accidents through spatial disorientation and controlled flight into terrain. The pilot\'s recovery procedure is to transition immediately to instruments, level the aircraft, climb to a safe altitude, turn away if appropriate and contact air traffic control. Crew support this with sterile cabin, readiness to read out instruments if asked, and an "IIMC" call when they see visual references disappearing. Prevention — conservative weather minimums and willingness to turn back early — is far more effective than recovery.',
        'Emergency landing: the pilot announces the emergency and an expected time to landing. Crew secure loose equipment, stop non-essential care, tighten restraints, put on helmets with visors down, and adopt the brace position appropriate to the seat (typically feet flat, back against the seat, head against the headrest or bent forward depending on seat design and orientation). Secure the patient\'s restraints and cover their face if possible.',
        'After landing: wait until the aircraft has stopped moving and the rotors have stopped, unless there is fire. Disconnect the patient from aircraft systems, exit by the nearest safe exit (know the emergency exits and how to open them), move upwind and away from the aircraft, and account for everyone. Activate the emergency locator transmitter if it has not triggered automatically, and begin survival procedures.',
      ],
      list: { caption: 'Emergency landing checklist for the medical crew', items: ['Acknowledge the pilot; stop non-essential care', 'Secure loose equipment', 'Helmets on, visors down, restraints tight', 'Secure the patient', 'Brace', 'After stop: egress, move upwind, head count'] },
    },
    {
      id: 'case', title: 'Scenario: smoke in the cabin',
      body: ['Twenty minutes into a fixed-wing flight at FL250 (cabin altitude 7000 ft), the crew notices a burning smell, then light smoke from behind the infusion pump mount. The patient is ventilated on 60 % oxygen.'],
      example: { case: 'Respond.', steps: [
        'Tell the pilot immediately and precisely.',
        'Isolate power to the suspected device; if a fire is visible, use the extinguisher at its base.',
        'Consider reducing or switching off supplemental oxygen near the source (the ventilated patient needs a plan — switch to a different source if available).',
        'Crew oxygen or smoke hoods as required; prepare for an emergency descent and diversion.',
        'Prepare for landing and possible evacuation.',
      ] },
    },
  ],
  keyPoints: [
    'Report fire or smoke immediately and precisely; isolate power and oxygen; extinguish at the base.',
    'Rapid decompression: bang, fog, cold — crew masks on first, then patient; pilot descends.',
    'After decompression, check for gas expansion: pneumothorax, cuffs, lines.',
    'IIMC: prevention is the defence; crew support instrument recovery.',
    'Emergency landing: secure, helmets, restraints, brace; egress after rotors stop, move upwind.',
  ],
  pearls: ['Fog in the cabin after a bang means decompression.', 'Know how every exit opens.'],
  pitfalls: ['Helping the patient before donning your own oxygen.', 'Exiting before the rotors stop when there is no fire.'],
  questions: [
    { q: 'First action on detecting smoke in the cabin:', options: ['Open a door', 'Tell the pilot immediately and precisely', 'Ignore it', 'Turn off all lights'], answer: 1, why: 'The pilot must plan to land.' },
    { q: 'An extinguisher should be aimed at:', options: ['The flames\' top', 'The base of the fire', 'The ceiling', 'The patient'], answer: 1, why: 'Fuel source.' },
    { q: 'Fog in the cabin after a loud bang suggests:', options: ['Fire', 'Rapid decompression', 'Air conditioning fault only', 'Normal'], answer: 1, why: 'Condensation from cooling.' },
    { q: 'After rapid decompression, the crew should:', options: ['Treat the patient first', 'Don their own oxygen first', 'Unbuckle and move', 'Open windows'], answer: 1, why: 'Avoid crew incapacitation.' },
    { q: 'Time of useful consciousness at 25 000 ft (at rest):', options: ['30 minutes', '3–5 minutes', '10 seconds', '1 hour'], answer: 1, why: 'Rapidly incapacitating.' },
    { q: 'After decompression, check the patient for:', options: ['Hypothermia only', 'Gas expansion effects (pneumothorax, cuff pressure)', 'Hyperglycaemia', 'Nothing'], answer: 1, why: 'Boyle\'s law.' },
    { q: 'IIMC means:', options: ['Planned instrument flight', 'Unintentionally entering cloud/fog and losing visual reference', 'Engine failure', 'Fire'], answer: 1, why: 'Leading cause of fatal HAA accidents.' },
    { q: 'The best defence against IIMC is:', options: ['Recovery skills only', 'Conservative weather decisions and turning back early', 'Faster flight', 'Lower altitude'], answer: 1, why: 'Prevention.' },
    { q: 'Pilot IIMC recovery includes:', options: ['Descending to find the ground', 'Transitioning to instruments, levelling and climbing', 'Turning off instruments', 'Landing immediately'], answer: 1, why: 'Standard procedure.' },
    { q: 'Before an emergency landing, crew should:', options: ['Continue all care', 'Secure equipment, helmets on, restraints tight, brace', 'Stand by the door', 'Remove helmets'], answer: 1, why: 'Survive the impact.' },
    { q: 'After an emergency landing without fire, exit when:', options: ['Immediately while rotors turn', 'The aircraft has stopped and rotors have stopped', 'After 1 hour', 'Never'], answer: 1, why: 'Rotor strike risk.' },
    { q: 'After egress, move:', options: ['Downwind', 'Upwind and away from the aircraft', 'Under the tail', 'Into the aircraft'], answer: 1, why: 'Away from fuel and smoke.' },
    { q: 'The ELT is:', options: ['An engine light', 'An emergency locator transmitter', 'A fire extinguisher', 'A radio frequency'], answer: 1, why: 'Signals position after a crash.' },
    { q: 'Slow decompression is often detected by:', options: ['A loud bang', 'Cabin altitude warning and hypoxia symptoms', 'Fog', 'Debris'], answer: 1, why: 'Slow pressure loss gives few obvious signs.' },
    { q: 'Engine fires are managed primarily by:', options: ['Medical crew with extinguishers', 'The pilot with cockpit fire controls', 'Opening the cowling', 'Descending only'], answer: 1, why: 'Crew prepare for landing.' },
  ],
  sources: [
    { title: 'FAA Advisory Circular 135-14B: Helicopter air ambulance operations', url: 'https://www.faa.gov/regulations_policies/advisory_circulars' },
    { title: 'FAA Aeromedical Safety Brochure: Hypoxia', url: 'https://www.faa.gov/pilots/safety/pilotsafetybrochures' },
  ],
};

export const LZ_OPS: FpcLesson = {
  id: 'fpc-lz-ops', domain: 'safety', ref: 'I.5',
  title: 'Landing zone operations',
  summary: 'Selecting and preparing a helicopter landing zone, communicating with ground crews, approaching and working around the aircraft safely, hot and cold loading, and hazards such as wires, debris, slopes and night operations.',
  objectives: [
    'Describe the size, surface and hazard requirements for a landing zone.',
    'Give and receive a landing zone briefing.',
    'Approach, load and work around a helicopter safely.',
  ],
  sections: [
    {
      id: 'select', title: 'Selecting and preparing the LZ', core: true,
      body: [
        'A typical recommended landing zone is at least 100 × 100 feet (about 30 × 30 metres) by day, often larger at night or for larger aircraft — operators set their own minimums. The surface should be firm, level (slope less than about 8–10°) and free of loose debris that the rotor wash will lift — blankets, sheets, plastic, gravel, snow and dust. Approach and departure paths should be clear of wires, towers, trees and poles; wires are the hardest hazard to see from the air.',
        'Mark the corners with weighted cones or lights, and for night landings use lights that do not dazzle — never shine lights or spotlights at the aircraft. Do not use flares where there is fire risk. Keep vehicles and bystanders at least 100–200 feet away, with emergency vehicles positioned to protect the site but outside the rotor arc. Wet the ground in dusty conditions if possible.',
        'Ground crews should brief the aircraft by radio with: the LZ location (GPS coordinates or a landmark), size and surface, obstacles (wires, poles, trees, towers), wind direction and strength, the slope, other aircraft or drones, and any hazards such as hazardous materials or crowds.',
      ],
      list: { caption: 'LZ radio brief', items: ['Location (coordinates or landmark)', 'Size and surface', 'Obstacles — wires first', 'Wind direction and speed', 'Slope', 'Hazards: hazmat, crowds, other aircraft or drones', 'Ground contact on the radio frequency'] },
    },
    {
      id: 'approach', title: 'Working around the helicopter', core: true,
      body: [
        'Approach a running helicopter only when signalled by the pilot or crew, and only from the front or side within the pilot\'s view — the "safe zone" is typically from the 10 o\'clock to the 2 o\'clock position, or as specified by the aircraft type. Never approach from the rear: the tail rotor is invisible when turning and lethal. On sloping ground, approach and leave on the downhill side, because the main rotor is closer to the ground on the uphill side.',
        'Wear helmet and eye protection, secure loose clothing and items, carry long objects (IV poles, splints) horizontally below waist height, and never raise anything above your head. Do not run. Hold onto stretcher linen and loose equipment. No smoking within 50–100 feet of the aircraft.',
        'Hot loading (with rotors turning) shortens scene times but increases risk; many programmes restrict it to trained crews and critical patients. Cold loading (engines shut down) is safer and used when the patient is not time critical or the ground crew is unfamiliar with the aircraft.',
      ],
    },
    {
      id: 'hazards', title: 'Special hazards', core: true,
      body: [
        'Night operations reduce depth perception and make wires invisible; NVG-equipped crews still depend on accurate ground briefings. Whiteout (snow) and brownout (dust) occur when rotor wash lifts loose surface material and obscures the ground during landing — a major cause of landing accidents and dynamic rollover. Wet or freeze the surface, or choose a paved area.',
        'Hazardous materials scenes need upwind, uphill LZs well away from the release; the aircraft must not land in a contaminated area or blow contaminants around. At crash or fire scenes, smoke reduces visibility and can contain toxins. Crowds and media should be held well back. Drones near a scene are a serious collision risk — the aircraft should be told about any in the area.',
        'Hospital helipads have their own procedures: rooftop pads have fire suppression, specific approach paths and often require a security escort. Crews should know the elevator access and how to leave the pad quickly in an emergency.',
      ],
      table: {
        caption: 'LZ quick reference',
        head: ['Item', 'Typical guideline'],
        rows: [['Size (day)', '≥ 100 × 100 ft (30 × 30 m)'], ['Slope', '< 8–10°'], ['Bystanders and vehicles', '≥ 100–200 ft away'], ['Approach the aircraft', 'Front or side, when signalled; downhill side on slopes'], ['Never', 'Approach the tail; raise objects; shine lights at the pilot']],
      },
    },
    {
      id: 'case', title: 'Scenario: the motorway LZ at night',
      body: ['Fire crews have closed a motorway and propose an LZ on the carriageway near an overpass, with power lines crossing 200 metres to the east. Wind is from the west. There is loose debris from a crash and two drones overhead from bystanders.'],
      example: { case: 'What must the ground brief and preparation include?', steps: [
        'Coordinates and description; size and surface (paved, debris present).',
        'Wires to the east — the aircraft will approach into wind from the east over them, so call them first and clearly.',
        'Clear debris; mark corners with low lights; no spotlights toward the aircraft.',
        'Drones must be grounded before the aircraft arrives; police to clear bystanders.',
        'Vehicles and people outside the safe distance; approach the aircraft only when signalled.',
      ] },
    },
  ],
  keyPoints: [
    'LZ ≥ 100 × 100 ft by day, firm, level, debris-free, clear approach paths.',
    'Brief wires first; give wind, slope, hazards and contact.',
    'Approach from the front/side when signalled; never the tail; downhill side on slopes.',
    'Carry long objects low; no running; eye and head protection.',
    'Brownout/whiteout, hazmat (upwind, uphill), drones and night all add risk.',
  ],
  pearls: ['Wires are the hardest obstacle to see from the air.', 'Hot loading is a risk trade — use it selectively.'],
  pitfalls: ['Shining lights at the aircraft.', 'Approaching uphill under a sloping rotor disc.'],
  questions: [
    { q: 'A typical minimum day LZ size:', options: ['20 × 20 ft', '100 × 100 ft', '500 × 500 ft', '10 × 10 m'], answer: 1, why: 'Common guideline; operators vary.' },
    { q: 'The obstacle most difficult to see from the air:', options: ['Trees', 'Wires', 'Buildings', 'Vehicles'], answer: 1, why: 'Thin and often invisible.' },
    { q: 'Approach a running helicopter:', options: ['From the rear', 'From the front or side when signalled', 'Any direction', 'Running quickly'], answer: 1, why: 'Within pilot view.' },
    { q: 'On sloping ground, approach from:', options: ['The uphill side', 'The downhill side', 'Underneath the tail', 'Any side'], answer: 1, why: 'Rotor is lower uphill.' },
    { q: 'Long objects such as IV poles should be carried:', options: ['Vertically above the head', 'Horizontally below waist height', 'Over the shoulder', 'Not carried'], answer: 1, why: 'Avoid rotor strike.' },
    { q: 'Lights at a night LZ should:', options: ['Shine at the aircraft', 'Mark the LZ without dazzling the pilot', 'Be flashing strobes at the cockpit', 'Not be used'], answer: 1, why: 'Avoid blinding the pilot.' },
    { q: 'Brownout is caused by:', options: ['Electrical failure', 'Rotor wash lifting dust and obscuring the ground', 'Night vision goggles', 'Fuel leak'], answer: 1, why: 'Landing hazard.' },
    { q: 'At a hazmat scene, the LZ should be:', options: ['Downwind and downhill', 'Upwind and uphill, well away', 'At the release site', 'Anywhere'], answer: 1, why: 'Avoid contamination.' },
    { q: 'Maximum LZ slope (typical):', options: ['30°', '8–10°', '20°', 'Any slope'], answer: 1, why: 'Dynamic rollover risk.' },
    { q: 'The LZ brief should list obstacles with priority on:', options: ['Parked cars', 'Wires', 'Grass', 'Signs'], answer: 1, why: 'Greatest hazard.' },
    { q: 'Drones near a scene should be:', options: ['Ignored', 'Grounded and reported to the aircraft', 'Used for lighting', 'Followed'], answer: 1, why: 'Collision risk.' },
    { q: 'Cold loading means:', options: ['Loading in winter', 'Loading with engines shut down', 'Loading with rotors turning', 'Loading without a stretcher'], answer: 1, why: 'Safer option.' },
    { q: 'Loose items near an LZ (sheets, blankets) are dangerous because:', options: ['They are untidy', 'Rotor wash can lift them into the rotors', 'They are heavy', 'They block radios'], answer: 1, why: 'Foreign object damage.' },
    { q: 'Smoking near the aircraft is prohibited within about:', options: ['5 ft', '50–100 ft', '1 mile', 'Not prohibited'], answer: 1, why: 'Fuel vapour.' },
    { q: 'The tail rotor is dangerous because:', options: ['It is loud', 'It is nearly invisible when turning', 'It is hot', 'It is high'], answer: 1, why: 'Lethal strikes.' },
  ],
  sources: [
    { title: 'FAA Advisory Circular 150/5390-2D: Heliport design', url: 'https://www.faa.gov/regulations_policies/advisory_circulars' },
    { title: 'Association of Air Medical Services (AAMS): Landing zone safety resources', url: 'https://aams.org/' },
  ],
};

export const OBSTACLES: FpcLesson = {
  id: 'fpc-obstacles', domain: 'safety', ref: 'I.6',
  title: 'Obstacle avoidance: wires, terrain, other aircraft and the crew\'s eyes',
  summary: 'How helicopters strike wires and terrain, the technology that helps (HTAWS, TCAS, obstacle databases), scanning technique and clock-position call-outs, and the medical crew\'s role as lookouts during low-level flight.',
  objectives: [
    'Describe the main obstacle hazards in low-level helicopter flight.',
    'Explain terrain and traffic awareness systems and their limits.',
    'Use a systematic scan and standard phraseology to call out hazards.',
  ],
  sections: [
    {
      id: 'hazards', title: 'What helicopters hit', core: true,
      body: [
        'Air medical helicopters spend much of their time below 1000 feet, often at night, near scenes and hospitals surrounded by wires, towers, cranes, trees and buildings. Wire strikes are a leading cause of helicopter accidents: wires are thin, often unmarked, span valleys and roads, and blend into the background. Towers are usually lit and charted; the guy wires that support them are not.',
        'Controlled flight into terrain (CFIT) — an airworthy aircraft flown into the ground, water or an obstacle without the crew realising — occurs most often at night, in poor visibility and in unfamiliar terrain. Mid-air collisions occur near hospitals, airports and scenes where several aircraft (other air ambulances, police, news helicopters and drones) converge.',
        'Clues to wires: poles or pylons on either side of a road or river, cleared strips through trees, and buildings that must have power. Assume wires exist between any two poles, and around any farm, building or road.',
      ],
    },
    {
      id: 'tech', title: 'Technology and its limits', core: true,
      body: [
        'Helicopter terrain awareness and warning systems (HTAWS), required for US helicopter air ambulances since the 2014 FAA rule, compare the aircraft\'s position and altitude with a terrain and obstacle database and give aural and visual alerts. Traffic collision avoidance or traffic advisory systems (TCAS/TAS) and ADS-B show nearby transponder-equipped aircraft. Radar altimeters give height above the ground. Wire-strike protection systems (cutters above and below the cockpit) can cut some wires on impact.',
        'Databases are incomplete — new cranes, temporary towers and most wires are not included — and drones are usually invisible to traffic systems. Technology supplements but does not replace a disciplined visual scan, especially during low-level manoeuvring and landing.',
        'Night vision goggles extend vision at night but have a limited field of view and poor contrast for thin wires; they are discussed in their own lesson.',
      ],
    },
    {
      id: 'scan', title: 'Scanning and call-outs', core: true,
      body: [
        'The human eye detects movement and objects best when it stops: use a systematic scan of 10–15° sectors, pausing about one second in each, across the field of view. An aircraft on a collision course appears stationary in the windscreen while growing larger — "constant bearing, decreasing range" — which makes it hard to notice.',
        'Use clock positions relative to the aircraft\'s nose (12 o\'clock straight ahead, 3 o\'clock right, 9 o\'clock left), with a high/low/level indication and range: "Traffic, 2 o\'clock, high, two miles, converging." "Wires, 12 o\'clock low, crossing the road ahead." Speak calmly, clearly and early; the pilot will acknowledge. If you see an immediate threat, the call should be direct: "Climb!", "Stop!", or as agreed by your programme.',
        'Medical crew are expected to stop patient care to look out during take-off, approach and landing, and when the pilot asks for help — patient care is paused for the minute it takes to land safely. Clear your side of the aircraft verbally at the LZ: "Clear left, tail clear."',
      ],
      table: {
        caption: 'Call-out format',
        head: ['Element', 'Example'],
        rows: [['What', 'Traffic / Wires / Tower / Drone / Birds'], ['Where (clock)', '2 o\'clock'], ['Elevation', 'High / low / level'], ['Range', 'One mile / close'], ['Movement', 'Converging / moving left to right / stationary']],
      },
    },
    {
      id: 'case', title: 'Scenario: the river approach',
      body: ['At night, the helicopter is descending toward a scene LZ in a river valley. You notice two pylons on the valley sides ahead and to the right, with no visible wires between them. The HTAWS shows no obstacle alert.'],
      example: { case: 'What do you do?', steps: [
        'Assume wires between the pylons — the database may not include them.',
        'Call it: "Pylons 1 o\'clock and 2 o\'clock, assume wires crossing the valley ahead."',
        'Support the pilot\'s decision to change the approach path or altitude.',
        'Continue scanning your side; maintain sterile cabin until landed.',
      ] },
    },
  ],
  keyPoints: [
    'Wire strikes and CFIT dominate low-level helicopter accidents.',
    'Assume wires between any two poles or pylons.',
    'HTAWS, TCAS and databases help but miss wires, cranes and drones.',
    'Scan in 10–15° sectors; a collision threat stays stationary and grows.',
    'Call out with clock position, elevation, range and movement; pause care to look out at critical phases.',
  ],
  pearls: ['Tower guy wires are rarely lit.', '"Constant bearing, decreasing range" means collision course.'],
  pitfalls: ['Trusting the obstacle database for wires.', 'Being head-down in patient care during landing.'],
  questions: [
    { q: 'A leading cause of helicopter accidents at low level:', options: ['Bird strikes only', 'Wire strikes', 'Engine overheating', 'Tyre failure'], answer: 1, why: 'Thin, unmarked obstacles.' },
    { q: 'CFIT means:', options: ['Engine failure', 'An airworthy aircraft flown into terrain unintentionally', 'Fire in flight', 'Fuel exhaustion'], answer: 1, why: 'Controlled flight into terrain.' },
    { q: 'Between two pylons you should assume:', options: ['Nothing', 'Wires', 'Birds', 'A runway'], answer: 1, why: 'Conservative assumption.' },
    { q: 'HTAWS:', options: ['Detects all wires', 'Alerts to terrain and database obstacles', 'Shows weather', 'Controls the aircraft'], answer: 1, why: 'Database limitations.' },
    { q: 'Drones are usually:', options: ['Visible on TCAS', 'Invisible to traffic systems', 'In obstacle databases', 'Harmless'], answer: 1, why: 'No transponders.' },
    { q: 'A collision-course aircraft appears:', options: ['Moving rapidly across the windscreen', 'Stationary while growing larger', 'Shrinking', 'Flashing'], answer: 1, why: 'Constant bearing.' },
    { q: 'Effective scanning uses:', options: ['Continuous sweeping', '10–15° sectors with brief pauses', 'Staring at one point', 'Instruments only'], answer: 1, why: 'Eyes detect objects when still.' },
    { q: 'Traffic directly to the right is at:', options: ['12 o\'clock', '3 o\'clock', '6 o\'clock', '9 o\'clock'], answer: 1, why: 'Clock position.' },
    { q: 'A good call-out includes:', options: ['Only "look!"', 'Object, clock position, elevation, range, movement', 'The patient\'s vital signs', 'GPS coordinates only'], answer: 1, why: 'Standard phraseology.' },
    { q: 'During landing, medical crew should:', options: ['Continue all care', 'Pause care and look out', 'Sleep', 'Use the radio'], answer: 1, why: 'Critical phase.' },
    { q: 'Tower guy wires are:', options: ['Always lit', 'Often unlit and hard to see', 'Not dangerous', 'Charted always'], answer: 1, why: 'Hidden hazard.' },
    { q: 'CFIT most often occurs:', options: ['On clear days', 'At night and in poor visibility', 'Only over water', 'At high altitude'], answer: 1, why: 'Reduced visual cues.' },
    { q: 'Wire-strike protection systems:', options: ['Detect wires', 'Can cut some wires on impact', 'Prevent all strikes', 'Are radar'], answer: 1, why: 'Last line of defence.' },
    { q: 'Clues to unseen wires include:', options: ['Clouds', 'Cleared strips through trees and poles beside roads', 'Rivers only', 'Birds'], answer: 1, why: 'Infrastructure.' },
    { q: 'Mid-air collision risk is highest near:', options: ['Open ocean', 'Hospitals, airports and busy scenes', 'Deserts', 'Mountain tops'], answer: 1, why: 'Converging traffic.' },
  ],
  sources: [
    { title: 'FAA Helicopter Flying Handbook — Helicopter hazards', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook' },
    { title: 'FAA Advisory Circular 90-48D: Pilots\' role in collision avoidance', url: 'https://www.faa.gov/regulations_policies/advisory_circulars' },
  ],
};
