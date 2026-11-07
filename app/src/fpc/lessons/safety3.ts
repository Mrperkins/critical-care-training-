/** FP-C I.7–I.9: survival techniques; weather patterns; refuelling operations. */
import type { FpcLesson } from '../types';

export const SURVIVAL: FpcLesson = {
  id: 'fpc-survival', domain: 'safety', ref: 'I.7',
  title: 'Survival after an accident or forced landing',
  summary: 'The priorities of survival after a crash or precautionary landing: immediate actions, shelter, signalling, water, fire and food, survival kits, and survival after a water landing.',
  objectives: [
    'List the priorities of survival in order and apply them after a forced landing.',
    'Describe signalling methods and the role of the emergency locator transmitter.',
    'Describe survival after ditching, including egress and flotation.',
  ],
  sections: [
    {
      id: 'priorities', title: 'Priorities of survival', core: true,
      body: [
        'A common framework is the "rule of threes": a person can survive about 3 minutes without air, 3 hours without shelter in harsh conditions, 3 days without water and 3 weeks without food. The order of priorities follows: first aid and safety, shelter, signalling, water, then food. Most survivors of air medical accidents are found within 24–72 hours, so the aim is to stay alive, stay together and be found.',
        'Immediately after a crash or forced landing: get everyone out and away from the aircraft if there is fire or fuel risk, account for all crew and the patient, give first aid, and then decide whether to return to the aircraft. Once fire risk has passed, the aircraft is your best shelter, signal and supply cache — it is far easier to see from the air than people.',
        'Stay with the aircraft unless it is unsafe or you are certain of rescue nearby. Moving away makes you harder to find and exposes the group to injury and exhaustion. A positive mental attitude, leadership and keeping busy improve survival as much as equipment.',
      ],
      list: { caption: 'Survival priorities', items: ['Immediate safety and first aid', 'Shelter (protection from cold, heat, wet and wind)', 'Signalling (ELT, radio, phone, mirror, fire, panels)', 'Water', 'Food'] },
    },
    {
      id: 'shelter', title: 'Shelter, signalling, water and fire', core: true,
      body: [
        'Hypothermia kills faster than thirst or hunger in most environments. Get out of wind and wet, insulate from the ground (heat is lost fastest by conduction to cold ground), wear all available layers, use survival blankets, and huddle together. In hot climates, shelter from the sun, minimise exertion during the day and conserve sweat.',
        'The emergency locator transmitter (ELT) activates on impact (or manually) and transmits on 406 MHz to satellites, which locate it within a few kilometres; flight-following systems will also show the last known position. Other signals: radios, mobile and satellite phones, signal mirrors (visible for many miles in sunlight), flares and smoke, fires in a triangle (an international distress signal), bright panels and large ground symbols — "V" means assistance needed, "X" means medical assistance needed.',
        'Water: ration sweat, not water — drink what you need. Collect rain and dew; boil or purify surface water where possible. Fire provides warmth, signalling, water purification and morale; build it in a sheltered spot away from the aircraft and fuel. Food is low priority in the short term.',
      ],
    },
    {
      id: 'water', title: 'Ditching and water survival', core: true,
      body: [
        'Helicopters are top-heavy and often roll inverted soon after ditching. Before impact: helmets on, restraints tight, brace, and locate your exit with a hand on a reference point (the exit or the frame near it). After impact, wait for violent motion to stop, then release your restraint, open the exit and swim out, keeping hold of a reference point. Underwater egress training and emergency breathing devices (small compressed air cylinders) significantly improve survival.',
        'Do not inflate a life vest inside the aircraft — it will pin you against the ceiling of an inverted cabin. Inflate it once outside. Stay together in the water, link arms, and use the HELP (heat escape lessening posture) or huddle to reduce heat loss. Cold water shock — gasping and hyperventilation in the first minute — is a major cause of drowning; control breathing before swimming.',
        'Life rafts may be carried on aircraft flying over water; deploy and board them, keep the group together, and activate signalling devices.',
      ],
    },
    {
      id: 'case', title: 'Scenario: forced landing in the mountains',
      body: ['Your helicopter makes a precautionary landing in a snowy valley after a chip light (metal particles in the gearbox oil). Everyone is uninjured; the patient is a stable orthopaedic transfer. Temperature −8 °C, wind 20 knots, two hours of daylight left. Phones have no signal.'],
      example: { case: 'Plan.', steps: [
        'Shelter: stay in or next to the aircraft out of the wind; insulate from the snow; keep the patient warm.',
        'Signal: confirm the ELT is active; use satellite phone or radio; prepare a signal fire and ground symbols while there is light.',
        'Stay together and with the aircraft — it is the most visible target for searchers.',
        'Water from melted snow (melt before drinking to avoid cooling); conserve energy.',
      ] },
    },
  ],
  keyPoints: [
    'Rule of threes: air, shelter, water, food.',
    'Priorities: safety/first aid, shelter, signalling, water, food.',
    'Stay with the aircraft — it is the best shelter and signal.',
    'ELT 406 MHz; ground signals: V = assistance, X = medical assistance.',
    'Ditching: reference point, wait for motion to stop, exit, inflate vest outside.',
  ],
  pearls: ['Insulate from the ground first.', 'Three fires in a triangle signal distress.'],
  pitfalls: ['Walking away from the aircraft.', 'Inflating a life vest inside the cabin.'],
  questions: [
    { q: 'After a crash, the highest survival priority after safety and first aid is usually:', options: ['Food', 'Shelter', 'Navigation', 'Hunting'], answer: 1, why: 'Exposure kills fastest.' },
    { q: 'Survivors should generally:', options: ['Walk to find help', 'Stay with the aircraft', 'Split up', 'Climb the highest peak'], answer: 1, why: 'More visible and sheltered.' },
    { q: 'The ELT transmits on:', options: ['121.5 MHz only', '406 MHz to satellites', 'AM radio', 'Wi-Fi'], answer: 1, why: 'Satellite detection.' },
    { q: 'A ground-to-air "X" means:', options: ['All well', 'Medical assistance needed', 'Going this way', 'Food needed'], answer: 1, why: 'Standard signal.' },
    { q: 'A ground-to-air "V" means:', options: ['Victory', 'Assistance needed', 'No help needed', 'Landed safely'], answer: 1, why: 'Standard signal.' },
    { q: 'Heat is lost fastest to cold ground by:', options: ['Radiation', 'Conduction', 'Evaporation', 'Convection'], answer: 1, why: 'Insulate from the ground.' },
    { q: 'An international distress signal using fires:', options: ['One fire', 'Three fires in a triangle', 'Five fires in a line', 'A circle of fires'], answer: 1, why: 'Recognised signal.' },
    { q: 'A life vest should be inflated:', options: ['Before impact', 'Inside the cabin', 'After exiting the aircraft', 'Never'], answer: 2, why: 'Prevents entrapment.' },
    { q: 'After ditching, before releasing your belt you should:', options: ['Release immediately', 'Wait for violent motion to stop, keep a reference point', 'Inflate the vest', 'Remove your helmet'], answer: 1, why: 'Orientation and egress.' },
    { q: 'Cold water shock causes:', options: ['Immediate hypothermia', 'Gasping and hyperventilation in the first minute', 'Sleepiness', 'Fever'], answer: 1, why: 'Drowning risk.' },
    { q: 'The HELP posture:', options: ['Increases swimming speed', 'Reduces heat loss in water', 'Signals rescuers', 'Is used on land'], answer: 1, why: 'Heat escape lessening posture.' },
    { q: 'The rule of threes suggests survival without water of about:', options: ['3 hours', '3 days', '3 weeks', '3 months'], answer: 1, why: 'Approximate.' },
    { q: 'Eating snow without melting it:', options: ['Is ideal', 'Cools the body — melt it first', 'Is impossible', 'Provides calories'], answer: 1, why: 'Melting snow in the mouth costs body heat.' },
    { q: 'A signal mirror is effective:', options: ['At night', 'In sunlight, visible for miles', 'Only underwater', 'Never'], answer: 1, why: 'Reflected sunlight.' },
    { q: 'Food in short-term survival is:', options: ['The top priority', 'Low priority', 'Needed within hours', 'Irrelevant to morale'], answer: 1, why: 'Weeks before starvation.' },
  ],
  sources: [
    { title: 'FAA: Aeronautical Information Manual, Chapter 6 — Emergency procedures (ground-air visual signals)', url: 'https://www.faa.gov/air_traffic/publications/atpubs/aim_html/' },
    { title: 'NOAA SARSAT: Emergency beacons', url: 'https://www.sarsat.noaa.gov/' },
  ],
};

export const WEATHER: FpcLesson = {
  id: 'fpc-weather', domain: 'safety', ref: 'I.8',
  title: 'Weather for air medical crews',
  summary: 'VFR and IFR conditions, ceilings and visibility, fog, icing, thunderstorms, wind and turbulence, reading METARs and TAFs, and how weather minimums protect the crew.',
  objectives: [
    'Define VFR and IFR conditions and air medical weather minimums.',
    'Recognise the weather hazards most dangerous to helicopters.',
    'Interpret basic METAR and TAF reports.',
  ],
  sections: [
    {
      id: 'minimums', title: 'Ceilings, visibility and minimums', core: true,
      body: [
        'Ceiling is the height above the ground of the lowest layer of cloud reported as broken (5–7 eighths of the sky covered) or overcast (8 eighths). Visibility is the horizontal distance you can see. Visual flight rules (VFR) require the pilot to see and avoid terrain, obstacles and other aircraft; instrument flight rules (IFR) allow flight in cloud by reference to instruments with air traffic control separation, but require an IFR-equipped aircraft, an instrument-rated pilot and suitable approaches at the destination.',
        'US helicopter air ambulance weather minimums under Part 135 are stricter than for other operations and vary by local or non-local area, mountainous or non-mountainous terrain, day or night, and use of night vision goggles or HTAWS — the table in 14 CFR 135.609 sets ceilings from several hundred feet up to 1500 feet and visibilities of several miles, with the highest minimums for unfamiliar mountainous areas at night. Many programmes add their own higher minimums.',
        'Weather at the departure, en route, scene and destination all matter, as does the forecast for the return. A flight should not start if conditions are expected to fall below minimums during the mission.',
      ],
    },
    {
      id: 'hazards', title: 'Weather hazards', core: true,
      body: [
        'Fog forms when air cools to its dew point near the ground. Radiation fog forms on clear, calm nights and burns off after sunrise; advection fog forms when moist air moves over a cold surface (coastal areas) and can persist. A small temperature–dew point spread (within about 2–3 °C) warns that fog or low cloud is likely. Fog and low cloud are major factors in IIMC accidents.',
        'Icing: supercooled water droplets freeze on contact with the airframe and rotor blades, adding weight, destroying lift and blocking intakes. Most air medical helicopters are not certified for flight into known icing, so visible moisture at temperatures near or below freezing is a no-go. Thunderstorms produce severe turbulence, lightning, hail, wind shear, microbursts and heavy rain; aircraft should stay at least 20 miles from severe storms.',
        'Wind affects groundspeed, fuel, landing direction and turbulence. Mechanical turbulence occurs downwind of buildings, trees and ridges; mountain wave turbulence on the lee side of mountains can be severe. Gusty winds make hovering and landing in confined areas hazardous. Whiteout (snow) and brownout (dust) reduce visibility at landing.',
      ],
      table: {
        caption: 'METAR decoder (examples)',
        head: ['Code', 'Meaning'],
        rows: [['KDEN 171753Z', 'Station and day/time (UTC)'], ['27015G25KT', 'Wind from 270° at 15 kt gusting 25'], ['3SM', 'Visibility 3 statute miles'], ['BR / FG', 'Mist / fog'], ['BKN008 OVC015', 'Broken at 800 ft (ceiling), overcast 1500 ft'], ['M02/M04', 'Temperature −2 °C, dew point −4 °C'], ['A2992', 'Altimeter 29.92 inHg']],
      },
    },
    {
      id: 'products', title: 'Weather products and decisions', core: true,
      body: [
        'A METAR is a routine surface observation, usually hourly; a SPECI is a special observation when conditions change significantly. A TAF is an airport forecast covering 24–30 hours, using change groups (FM — from, TEMPO — temporary, PROB — probability). Other tools include graphical forecasts, the HEMS weather tool (which shows ceilings and visibility between reporting stations), radar, satellite, and pilot reports (PIREPs) — the only direct observation of conditions aloft.',
        'Reporting stations can be far apart, and conditions between them — especially in valleys, near water and over high ground — may be worse than reported. Crews should report deteriorating weather on the way to a scene and support a decision to turn back. A weather turn-down is a sound decision, not a failure: the "weather decline" should be communicated to the requesting agency and any subsequent service.',
      ],
    },
    {
      id: 'case', title: 'Scenario: reading the 0400 METAR',
      body: ['A request comes at 04:00. The destination METAR reads: 180350Z 00000KT 4SM BR SCT004 BKN009 08/07 A3012. The TAF includes "TEMPO 0507 1/2SM FG OVC002".'],
      example: { case: 'Interpret.', steps: [
        'Calm wind; visibility 4 miles in mist; scattered cloud at 400 ft and a broken ceiling at 900 ft.',
        'Temperature 8, dew point 7 — a 1 °C spread: fog likely.',
        'The TAF forecasts temporary dense fog (½ mile) and overcast at 200 ft between 05:00 and 07:00 — likely below minimums during the mission.',
        'A reasonable pilot declines or chooses another destination; the crew supports the decision.',
      ] },
    },
  ],
  keyPoints: [
    'Ceiling = lowest broken or overcast layer; visibility = horizontal distance.',
    'HAA minimums are stricter than standard Part 135 and vary by area, day/night and NVG use.',
    'Small temperature–dew point spread warns of fog.',
    'Known icing and thunderstorms are no-go; stay 20 miles from severe storms.',
    'METAR = observation; TAF = forecast; PIREPs = conditions aloft.',
  ],
  pearls: ['Radiation fog forms on clear, calm nights.', 'Conditions between stations can be worse than reported.'],
  pitfalls: ['Launching when the forecast falls below minimums mid-mission.', 'Treating a weather decline as a failure.'],
  questions: [
    { q: 'A ceiling is the lowest cloud layer reported as:', options: ['Few or scattered', 'Broken or overcast', 'Any cloud', 'Above 10 000 ft'], answer: 1, why: 'Definition.' },
    { q: 'Fog is likely when the temperature–dew point spread is:', options: ['> 10 °C', 'Within about 2–3 °C', 'Negative', 'Irrelevant'], answer: 1, why: 'Air near saturation.' },
    { q: 'Radiation fog forms:', options: ['On windy afternoons', 'On clear, calm nights', 'Over warm water', 'In thunderstorms'], answer: 1, why: 'Ground cools overnight.' },
    { q: 'Advection fog forms when:', options: ['Moist air moves over a cold surface', 'The sun heats the ground', 'Wind is calm at night only', 'Snow falls'], answer: 0, why: 'Coastal fog.' },
    { q: 'Icing is dangerous because it:', options: ['Improves lift', 'Adds weight and destroys lift', 'Warms the engine', 'Is harmless to rotors'], answer: 1, why: 'Airframe and rotor ice.' },
    { q: 'Recommended distance from severe thunderstorms:', options: ['1 mile', '20 miles', '100 ft', 'None'], answer: 1, why: 'Turbulence, hail, wind shear.' },
    { q: '"27015G25KT" means:', options: ['Wind 270° at 15 kt, gusting 25', 'Visibility 27 miles', 'Ceiling 1500 ft', 'Temperature 27 °C'], answer: 0, why: 'METAR wind group.' },
    { q: '"BKN008" means:', options: ['Broken cloud at 800 ft', 'Broken at 8000 ft', 'Visibility 8 miles', 'Bank angle 8°'], answer: 0, why: 'Hundreds of feet.' },
    { q: 'A TAF is:', options: ['A surface observation', 'An airport forecast', 'A pilot report', 'A radar image'], answer: 1, why: 'Terminal aerodrome forecast.' },
    { q: 'The only direct report of conditions aloft:', options: ['METAR', 'PIREP', 'TAF', 'Satellite'], answer: 1, why: 'Pilot report.' },
    { q: '"TEMPO" in a TAF means:', options: ['Permanent change', 'Temporary fluctuations', 'Tornado', 'Temperature'], answer: 1, why: 'Change group.' },
    { q: 'Most air medical helicopters may fly into known icing:', options: ['Always', 'No — most are not certified', 'Only at night', 'Only with NVGs'], answer: 1, why: 'Known icing is a no-go for most helicopters.' },
    { q: 'Mechanical turbulence occurs:', options: ['Over flat water', 'Downwind of buildings, trees and ridges', 'Only in cloud', 'At cruise above 10 000 ft only'], answer: 1, why: 'Disturbed airflow.' },
    { q: 'HAA weather minimums are highest for:', options: ['Local, flat terrain by day', 'Unfamiliar mountainous areas at night', 'Any daytime flight', 'Flights with NVGs'], answer: 1, why: 'Least visual reference, most terrain risk.' },
    { q: 'If weather is forecast to fall below minimums during the mission:', options: ['Launch quickly', 'Do not start the flight', 'Fly lower', 'Ignore the TAF'], answer: 1, why: 'Plan for the whole mission.' },
  ],
  sources: [
    { title: 'FAA Aviation Weather Handbook (FAA-H-8083-28)', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/faa-h-8083-28-aviation-weather-handbook' },
    { title: '14 CFR 135.609 (VFR ceiling and visibility for helicopter air ambulance operations)', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-135/subpart-L/section-135.609' },
    { title: 'Aviation Weather Center (METAR, TAF, HEMS tool)', url: 'https://aviationweather.gov/' },
  ],
};

export const REFUELLING: FpcLesson = {
  id: 'fpc-refuelling', domain: 'safety', ref: 'I.9',
  title: 'Refuelling operations',
  summary: 'Cold and hot (rotors-running) refuelling, fire and static hazards, fuel types and contamination, and the patient-on-board rules every crew member must know.',
  objectives: [
    'Describe safe refuelling procedures and the hazards of fuel vapour and static.',
    'Explain when hot refuelling is used and the restrictions with a patient on board.',
    'Recognise fuel contamination and misfuelling risks.',
  ],
  sections: [
    {
      id: 'hazards', title: 'Fuel and fire hazards', core: true,
      body: [
        'Turbine helicopters and turboprops burn jet fuel (Jet A, a kerosene-based fuel); piston aircraft burn aviation gasoline (avgas). Putting the wrong fuel in an aircraft can cause engine failure — the fuel type is checked at every fill, and nozzles are designed to make misfuelling harder. Jet fuel has a higher flash point than gasoline but its vapour is still flammable, especially in hot conditions.',
        'Static electricity builds up as fuel flows through hoses and filters. Bonding — connecting the fuel truck or nozzle and the aircraft with a cable before opening the fuel cap — equalises their electrical potential so that a spark does not jump at the filler. Grounding is not a substitute for bonding. Do not use mobile phones, radios or other potential ignition sources near the refuelling point, and no smoking within at least 50 feet.',
        'A fire extinguisher must be available and staffed during refuelling. Know the location of the fuel shut-off and how to stop the flow in an emergency. Fuel spills are reported and cleaned up according to local procedure; do not start engines in a spill area.',
      ],
    },
    {
      id: 'hot', title: 'Hot refuelling and patients on board', core: true,
      body: [
        'Hot refuelling — refuelling with engines running and rotors turning — saves time on long missions but adds risk: rotor hazards, noise, and a running engine as an ignition source. It is done only by trained personnel following the operator\'s procedures, with the pilot at the controls, a fire guard posted and communication between the fueller and pilot.',
        'Patients should not normally be on board during refuelling. Where it is allowed by the operator (for example, critically ill patients who cannot be safely unloaded), it typically requires cold refuelling or specific approval, a medical crew member with the patient, all doors on the refuelling side closed and the opposite side door open or ready for evacuation, oxygen secured, and no electrical equipment connected or disconnected near the fuel point. Know your programme\'s policy before the situation arises.',
        'Medical crew do not refuel unless trained and authorised. Their role is to keep the patient safe, stay clear of the fuelling area, watch for hazards and be ready to evacuate the patient.',
      ],
      list: { caption: 'Refuelling safety checklist', items: ['Correct fuel type confirmed', 'Bond before opening the cap', 'Extinguisher staffed; shut-off known', 'No smoking, phones or radios near the filler', 'Patient-on-board policy followed; evacuation route clear', 'Fuel sample checked for water and contamination'] },
    },
    {
      id: 'quality', title: 'Fuel quality and contamination', core: true,
      body: [
        'Water in fuel — from condensation in tanks or contaminated supplies — can freeze, block filters or cause engine flame-out. Microbial growth in jet fuel produces sludge that blocks filters. Particulates damage fuel controls. Pilots or fuellers sample fuel from sumps before flight and after refuelling, checking for water (which settles at the bottom), sediment and the correct colour and smell.',
        'Fuel from unfamiliar sources (for example, a remote airport or hospital fuel farm) should be checked for quality and the supplier\'s quality control. Additives such as fuel system icing inhibitor prevent water in jet fuel from freezing at altitude.',
      ],
    },
    {
      id: 'case', title: 'Scenario: the refuel stop',
      body: ['During a long interfacility transfer, the pilot needs to refuel at a regional airport. The ventilated patient is on oxygen and three infusions. The fueller is new and plans to start fuelling with the rotors turning while you remain on board with the patient.'],
      example: { case: 'What should happen?', steps: [
        'Confirm the programme\'s policy — most require cold refuelling or specific approval with a patient on board.',
        'If permitted: pilot at controls, extinguisher staffed, bonding before the cap is opened.',
        'Door on the fuel side closed; exit on the other side ready; oxygen secured.',
        'Do not connect or disconnect electrical equipment; be ready to evacuate.',
        'If anything is unsafe, say so — the flight can wait for a safe refuel.',
      ] },
    },
  ],
  keyPoints: [
    'Jet A for turbines, avgas for pistons — misfuelling causes engine failure.',
    'Bond before opening the cap; no smoking, phones or radios near the filler.',
    'Extinguisher staffed; know the shut-off.',
    'Hot refuelling only by trained crews; patient-on-board rules per operator.',
    'Sample fuel for water and contamination.',
  ],
  pearls: ['Water sinks to the bottom of a fuel sample.', 'Medical crew\'s role is the patient and evacuation, not the nozzle.'],
  pitfalls: ['Opening the fuel cap before bonding.', 'Using a phone next to the fuel point.'],
  questions: [
    { q: 'Turbine helicopters typically burn:', options: ['Avgas', 'Jet A', 'Diesel', 'Unleaded gasoline'], answer: 1, why: 'Kerosene-based fuel.' },
    { q: 'Bonding prevents:', options: ['Fuel spills', 'Static discharge between fuel source and aircraft', 'Water contamination', 'Misfuelling'], answer: 1, why: 'Equalises potential.' },
    { q: 'Bonding should be done:', options: ['After fuelling', 'Before opening the fuel cap', 'Only at night', 'Never'], answer: 1, why: 'Before vapour is exposed.' },
    { q: 'Hot refuelling means:', options: ['Fuelling in summer', 'Fuelling with engines running and rotors turning', 'Using heated fuel', 'Fuelling after a fire'], answer: 1, why: 'Time saving, added risk.' },
    { q: 'During refuelling, a fire extinguisher must be:', options: ['In the hangar', 'Available and staffed', 'Not needed for jet fuel', 'On the aircraft only'], answer: 1, why: 'Rapid response.' },
    { q: 'Mobile phone use near the fuel point:', options: ['Allowed', 'Avoided — potential ignition source', 'Required', 'Only for the pilot'], answer: 1, why: 'Ignition risk.' },
    { q: 'Water in fuel can cause:', options: ['Better performance', 'Engine flame-out or blocked filters', 'Nothing', 'Higher octane'], answer: 1, why: 'Contamination.' },
    { q: 'In a fuel sample, water appears:', options: ['On top', 'At the bottom', 'Evenly mixed', 'As foam'], answer: 1, why: 'Water is denser.' },
    { q: 'With a patient on board during permitted refuelling, the fuel-side door should be:', options: ['Open', 'Closed, with the opposite exit ready', 'Removed', 'Locked from outside'], answer: 1, why: 'Vapour and evacuation.' },
    { q: 'Medical crew during refuelling should:', options: ['Operate the nozzle', 'Care for the patient and be ready to evacuate', 'Smoke away from the aircraft', 'Start the engine'], answer: 1, why: 'Role clarity.' },
    { q: 'Misfuelling a turbine with avgas (or vice versa) risks:', options: ['Nothing', 'Engine damage or failure', 'Better range', 'Lower noise'], answer: 1, why: 'Wrong fuel type.' },
    { q: 'No smoking distance around refuelling (minimum common guidance):', options: ['5 ft', '50 ft', '1 ft', 'None'], answer: 1, why: 'Fuel vapour.' },
    { q: 'Fuel system icing inhibitor prevents:', options: ['Fire', 'Water in fuel freezing at altitude', 'Static', 'Spills'], answer: 1, why: 'This additive stops dissolved water freezing.' },
    { q: 'Hot refuelling should only be done:', options: ['By anyone', 'By trained personnel per operator procedures', 'With engines off', 'By the patient'], answer: 1, why: 'Specialised procedure.' },
    { q: 'Electrical equipment near the fuel point during refuelling:', options: ['Connect freely', 'Do not connect or disconnect', 'Must be switched on', 'Is grounded by fuel'], answer: 1, why: 'Avoid sparks.' },
  ],
  sources: [
    { title: 'FAA Advisory Circular 150/5230-4C: Aircraft fuel storage, handling and dispensing on airports', url: 'https://www.faa.gov/regulations_policies/advisory_circulars' },
    { title: 'NFPA 407: Standard for aircraft fuel servicing', url: 'https://www.nfpa.org/codes-and-standards/nfpa-407-standard-development/407' },
  ],
};
