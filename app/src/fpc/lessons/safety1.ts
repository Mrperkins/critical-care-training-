/** FP-C I.1–I.3: aircraft operations; aerodynamics; aircraft performance. */
import type { FpcLesson } from '../types';

export const AIRCRAFT_OPS: FpcLesson = {
  id: 'fpc-aircraft-ops', domain: 'safety', ref: 'I.1',
  title: 'Aircraft operations: rotor-wing, fixed-wing and the rules that govern them',
  summary: 'How air medical services are organised and regulated, the strengths and limits of helicopters and airplanes, operational control, and the medical crew\'s role in a safe flight.',
  objectives: [
    'Compare rotor-wing and fixed-wing aircraft for patient transport.',
    'Describe the regulatory framework and operational control of air medical flights.',
    'Explain the medical crew\'s responsibilities in aircraft operations and safety culture.',
  ],
  sections: [
    {
      id: 'types', title: 'Rotor-wing and fixed-wing', core: true,
      body: [
        'Helicopters (rotor-wing) take off and land vertically, reach scenes and hospital helipads directly, and are fastest over roughly 40–250 km (25–150 miles). Their cabins are small, noisy and often unpressurised, they fly at low altitudes where weather and obstacles matter most, and their range and payload are limited. Single-engine helicopters are common in air medical service; twin-engine aircraft add redundancy, payload and often instrument flight capability.',
        'Fixed-wing aircraft (turboprops and jets) need runways, so every transfer involves ground ambulance legs at each end. They are faster and more economical over long distances, fly above most weather, and have pressurised cabins, so the cabin altitude can be controlled — usually 6000–8000 feet, or lower on request for patients sensitive to altitude. Larger cabins allow more equipment and crew.',
        'The choice depends on distance, weather, the patient\'s condition and time-critical treatments at the destination, the availability of landing sites, and cost. For distances where ground transport would be similar in total time, the risks of flight should be weighed against the benefit.',
      ],
      table: {
        caption: 'Rotor-wing vs fixed-wing',
        head: ['', 'Rotor-wing', 'Fixed-wing'],
        rows: [['Typical range', 'Up to ~250 km (150 mi)', 'Long distance, interfacility'], ['Landing', 'Scenes, helipads', 'Airports only (ground legs at each end)'], ['Cabin', 'Small, usually unpressurised', 'Larger, pressurised'], ['Altitude', 'Low (typically < 3000 ft AGL)', 'High cruise; cabin 6000–8000 ft'], ['Weather', 'More limited', 'Flies above much weather']],
      },
    },
    {
      id: 'regs', title: 'Regulation and operational control', core: true,
      body: [
        'In the United States, air ambulance operations with patients on board are generally conducted under FAA Part 135 (commuter and on-demand operations), which imposes stricter weather minimums, crew rest and maintenance requirements than Part 91 (general operations). The 2014 FAA helicopter air ambulance rule followed a cluster of fatal accidents and requires, among other things: operations control centres for larger operators, pre-flight risk analysis, helicopter terrain awareness and warning systems (HTAWS), flight data monitoring, safety briefings for medical crew, and instrument flight training for pilots.',
        'Operational control means one person — the pilot in command, supported by an operations control specialist — has the final authority to accept, decline or terminate a flight. Weather and safety decisions are made without knowledge of the patient\'s condition ("blind" acceptance) so that pressure to help a sick patient does not influence the decision to fly. A flight declined by one service because of weather should be disclosed to any other service asked to take it ("helicopter shopping" is dangerous).',
        'Accreditation bodies such as CAMTS (Commission on Accreditation of Medical Transport Systems) set standards above the regulatory minimum for medical and aviation safety, training and quality.',
      ],
    },
    {
      id: 'crew', title: 'The medical crew in aviation operations', core: true,
      body: [
        'Medical crew members are not passengers. They are trained in aircraft safety, emergency procedures, communications, landing zone management and crew resource management (CRM), and are expected to act as additional eyes and ears — calling out obstacles, other aircraft and hazards, and speaking up when anything looks unsafe.',
        'The "three to go, one to say no" principle captures safety culture: everyone must agree to accept a flight, and any crew member can decline or stop it without penalty or questioning. A sterile cockpit — no non-essential conversation during critical phases such as taxi, take-off, approach and landing, or below a set altitude — protects the pilot\'s attention.',
        'Medical decisions remain with the medical crew, aviation decisions with the pilot. When they intersect — for example, a patient deteriorating who needs a diversion to a closer hospital — the crew discuss options and the pilot decides whether the diversion can be flown safely.',
      ],
    },
    {
      id: 'case', title: 'Scenario: the second request',
      body: ['At 02:00 your service is asked to fly a STEMI patient from a rural hospital. The dispatcher mentions that the request first went to another service, which declined. Your pilot reviews the weather: marginal ceilings with fog forecast.'],
      example: { case: 'What should happen?', steps: [
        'The dispatcher must disclose that another service declined, and why (weather).',
        'The pilot makes a weather decision without being influenced by the patient\'s diagnosis.',
        'If the pilot or any crew member is uncomfortable, the flight is declined — "three to go, one to say no".',
        'Medically, ground transport with a critical care team, or thrombolysis at the referring hospital, may be the safest option.',
      ] },
    },
  ],
  keyPoints: [
    'Rotor-wing for scenes and shorter distances; fixed-wing for long distances, with pressurised cabins.',
    'Part 135 governs patient-carrying flights with stricter minimums than Part 91.',
    'The 2014 FAA HAA rule: OCCs, risk analysis, HTAWS, flight data monitoring, safety briefings.',
    'Weather decisions are made blind to patient condition; disclose prior declines.',
    'Three to go, one to say no; sterile cockpit during critical phases.',
  ],
  pearls: ['Medical crew are crew, not passengers.', 'Fixed-wing cabin altitude can be lowered on request.'],
  pitfalls: ['"Helicopter shopping" after a weather decline.', 'Letting the patient\'s condition drive the decision to fly.'],
  questions: [
    { q: 'Patient-carrying air ambulance flights in the US are generally conducted under:', options: ['Part 91', 'Part 135', 'Part 121', 'Part 107'], answer: 1, why: 'Stricter on-demand rules.' },
    { q: 'An advantage of fixed-wing over rotor-wing:', options: ['Lands at scenes', 'Pressurised cabin and long range', 'No ground legs', 'Lower altitude'], answer: 1, why: 'Suits long distances.' },
    { q: 'Weather acceptance should be made:', options: ['After hearing the patient\'s condition', 'Without knowledge of the patient\'s condition', 'By the referring physician', 'By the family'], answer: 1, why: 'Removes pressure to fly.' },
    { q: '"Helicopter shopping" refers to:', options: ['Buying aircraft', 'Calling another service after one declined for weather without disclosure', 'Choosing the cheapest service', 'Fuel purchasing'], answer: 1, why: 'Dangerous practice.' },
    { q: '"Three to go, one to say no" means:', options: ['Three aircraft are needed', 'All crew must agree; any one can decline', 'Three patients maximum', 'Three hours rest'], answer: 1, why: 'Safety culture.' },
    { q: 'Sterile cockpit means:', options: ['Cleaning the cockpit', 'No non-essential conversation during critical phases', 'No patients in front', 'No radios'], answer: 1, why: 'Protects pilot attention.' },
    { q: 'The final authority for accepting a flight rests with:', options: ['The flight nurse', 'The pilot in command (with operational control)', 'The patient', 'The referring hospital'], answer: 1, why: 'Operational control.' },
    { q: 'The 2014 FAA HAA rule required:', options: ['Jet engines', 'HTAWS and flight data monitoring', 'Three pilots', 'Night flights only'], answer: 1, why: 'Response to accidents.' },
    { q: 'CAMTS is:', options: ['A regulatory agency', 'An accreditation body for medical transport', 'An aircraft manufacturer', 'A weather service'], answer: 1, why: 'Standards above minimums.' },
    { q: 'Typical pressurised fixed-wing cabin altitude:', options: ['Sea level always', '6000–8000 ft', '15 000 ft', '25 000 ft'], answer: 1, why: 'Can be lowered on request.' },
    { q: 'A disadvantage of rotor-wing transport:', options: ['Lands at scenes', 'Limited payload, noise, weather sensitivity', 'Pressurised cabin', 'Unlimited range'], answer: 1, why: 'Operational limits.' },
    { q: 'If the patient deteriorates and needs diversion, the decision to divert is:', options: ['Medical crew alone', 'A crew discussion; the pilot decides if it can be flown safely', 'Dispatch only', 'Never possible'], answer: 1, why: 'Aviation decision.' },
    { q: 'Medical crew members during flight should:', options: ['Sit silently', 'Act as additional eyes, call out hazards', 'Navigate', 'Fly the aircraft'], answer: 1, why: 'Crew resource management.' },
    { q: 'An operations control centre supports:', options: ['Billing', 'Flight following, weather and risk decisions', 'Patient care', 'Maintenance only'], answer: 1, why: 'Operational control.' },
    { q: 'Rotor-wing is typically most time-efficient at about:', options: ['< 5 km', '40–250 km', '> 1000 km', 'Any distance'], answer: 1, why: 'Beyond ground and short of fixed-wing.' },
  ],
  sources: [
    { title: 'FAA: Helicopter air ambulance, commercial helicopter and Part 91 helicopter operations — final rule (2014)', url: 'https://www.federalregister.gov/documents/2014/02/21/2014-03689/helicopter-air-ambulance-commercial-helicopter-and-part-91-helicopter-operations' },
    { title: 'CAMTS: Accreditation standards', url: 'https://www.camts.org/standards/' },
  ],
};

export const AERODYNAMICS: FpcLesson = {
  id: 'fpc-aerodynamics', domain: 'safety', ref: 'I.2',
  title: 'Aerodynamics: lift, thrust, drag and the helicopter',
  summary: 'The four forces of flight, how rotor blades produce lift, translational lift, retreating blade stall, settling with power, ground effect and autorotation — enough to understand what the pilot is managing and why.',
  objectives: [
    'Describe the four forces of flight and how wings and rotors generate lift.',
    'Explain helicopter-specific phenomena: translational lift, ground effect, dissymmetry of lift and settling with power.',
    'Describe autorotation and its implications for the crew.',
  ],
  sections: [
    {
      id: 'forces', title: 'The four forces', core: true,
      body: [
        'Four forces act on any aircraft: lift (upward, produced by the wing or rotor), weight (downward, gravity), thrust (forward, from propellers, jets or the tilted rotor disc) and drag (backward, air resistance). In steady level flight they are in balance. To climb, lift must exceed weight; to accelerate, thrust must exceed drag.',
        'Wings and rotor blades are aerofoils. Air flowing over the curved upper surface travels faster than air beneath, creating lower pressure above (Bernoulli\'s principle), while the blade also deflects air downward (Newton\'s third law). Lift increases with air density, the square of airspeed, the wing area and the angle of attack — the angle between the blade and the oncoming air. Beyond a critical angle of attack, airflow separates from the upper surface and lift collapses: a stall.',
        'Air density falls with altitude, heat and humidity. Thinner air means less lift and less engine power — why aircraft performance falls on hot, high, humid days (density altitude, covered in the performance lesson).',
      ],
    },
    {
      id: 'heli', title: 'How helicopters fly', core: true,
      body: [
        'The main rotor is a set of rotating wings. The pilot changes lift with the collective (altering the pitch of all blades together — up or down) and the direction with the cyclic (tilting the rotor disc so that thrust points forward, backward or sideways). Torque from the main rotor tries to spin the fuselage the opposite way; the tail rotor (or an equivalent system) counteracts it and is controlled with the anti-torque pedals. Losing the tail rotor causes the aircraft to spin — which is why people must never approach the tail.',
        'Dissymmetry of lift: in forward flight, the advancing blade meets air at rotor speed plus airspeed, while the retreating blade meets air at rotor speed minus airspeed. Blade flapping equalises lift. At high forward speed the retreating blade can stall (retreating blade stall), limiting the helicopter\'s maximum speed.',
        'Translational lift: above about 16–24 knots of airspeed, the rotor moves into undisturbed air and becomes markedly more efficient — the aircraft shudders briefly and then climbs more easily. Ground effect: within about one rotor diameter of a firm, level surface, downwash is cushioned and less power is needed to hover. Hovering out of ground effect (over long grass, water, or high above a scene) requires far more power.',
      ],
    },
    {
      id: 'hazards', title: 'Aerodynamic hazards and autorotation', core: true,
      body: [
        'Settling with power (vortex ring state) occurs when a helicopter descends vertically or near-vertically at low airspeed while using power: it settles into its own downwash, and adding power makes the descent worse. Recovery requires forward airspeed. Approaches to confined landing zones are planned to avoid steep, slow descents — one reason a pilot may refuse a tight landing site.',
        'Dynamic rollover occurs when a skid or wheel is pinned on the ground (on a slope, in mud or by a tie-down) and the aircraft pivots around it, rolling over beyond recovery within seconds. Landing zones should be firm and level, and crew must never hold or lean on the aircraft during lift-off.',
        'Autorotation is the controlled descent of a helicopter after engine failure: the pilot lowers the collective, and upward airflow through the rotor keeps it turning, like a sycamore seed. Just before touchdown the pilot raises the nose and collective to use the rotor\'s stored energy to cushion the landing. A successful autorotation requires height and airspeed; the "height–velocity diagram" (the "dead man\'s curve") defines low-and-slow combinations from which a safe autorotation is impossible. Crew should be seated and restrained with helmets on during take-off and landing, the phases of greatest risk.',
      ],
      list: { caption: 'Helicopter controls', items: ['Collective — changes pitch of all blades together; up/down', 'Cyclic — tilts the rotor disc; direction', 'Anti-torque pedals — tail rotor pitch; heading', 'Throttle — engine power (often governed automatically)'] },
    },
    {
      id: 'case', title: 'Scenario: the confined scene',
      body: ['Ground crews have set up a landing zone in a small clearing surrounded by 25-metre trees, on a slight slope, on a hot afternoon. The pilot circles twice, then elects to land at a field 1 km away.'],
      example: { case: 'Why?', steps: [
        'A vertical descent into a confined area at low airspeed risks settling with power.',
        'Hot air reduces density and available power; hovering out of ground effect over tall trees may exceed performance.',
        'A sloped surface raises the risk of dynamic rollover.',
        'The safer option is a larger, level LZ with a ground transfer — respect the pilot\'s decision.',
      ] },
    },
  ],
  keyPoints: [
    'Lift, weight, thrust, drag; lift depends on density, airspeed, area and angle of attack.',
    'Collective = lift; cyclic = direction; pedals = tail rotor and heading.',
    'Translational lift above ~16–24 kt; ground effect within ~one rotor diameter.',
    'Settling with power needs forward airspeed to recover; dynamic rollover pivots on a pinned skid.',
    'Autorotation lets a helicopter land after engine failure — if height and airspeed allow.',
  ],
  pearls: ['The tail rotor is nearly invisible when turning — never approach the tail.', 'Hot, high and humid = less lift and power.'],
  pitfalls: ['Holding the aircraft during lift-off.', 'Pressing a pilot to land in a tight, sloped LZ.'],
  questions: [
    { q: 'The four forces of flight:', options: ['Lift, weight, thrust, drag', 'Pitch, roll, yaw, power', 'Speed, height, fuel, load', 'Torque, lift, mass, speed'], answer: 0, why: 'Balance in steady flight.' },
    { q: 'Lift increases with:', options: ['Lower air density', 'Higher airspeed and angle of attack (to the critical angle)', 'Smaller wing area', 'Higher temperature'], answer: 1, why: 'Lift equation.' },
    { q: 'A stall occurs when:', options: ['The engine stops', 'The critical angle of attack is exceeded', 'Fuel runs out', 'The rotor slows'], answer: 1, why: 'Airflow separates.' },
    { q: 'The collective controls:', options: ['Direction', 'Pitch of all blades together (lift)', 'Tail rotor', 'Throttle only'], answer: 1, why: 'Up and down.' },
    { q: 'The cyclic controls:', options: ['Overall lift', 'Tilt of the rotor disc (direction)', 'Anti-torque', 'Engine'], answer: 1, why: 'Directional control.' },
    { q: 'The tail rotor counteracts:', options: ['Drag', 'Main rotor torque', 'Weight', 'Lift'], answer: 1, why: 'Newton\'s third law.' },
    { q: 'Translational lift occurs at about:', options: ['0 knots', '16–24 knots airspeed', '150 knots', 'Only in descent'], answer: 1, why: 'Rotor enters clean air.' },
    { q: 'Ground effect is present within about:', options: ['10 rotor diameters', 'One rotor diameter of a firm surface', '1000 ft', 'Only over water'], answer: 1, why: 'Cushioned downwash.' },
    { q: 'Settling with power occurs during:', options: ['Fast forward flight', 'Near-vertical descent at low airspeed with power', 'Cruise', 'Autorotation'], answer: 1, why: 'Vortex ring state.' },
    { q: 'Recovery from settling with power requires:', options: ['More power', 'Forward airspeed', 'Lower collective only', 'Shutting the engine'], answer: 1, why: 'Fly out of the vortex.' },
    { q: 'Dynamic rollover is caused by:', options: ['High altitude', 'A pinned skid acting as a pivot', 'Strong headwind', 'Tail rotor failure'], answer: 1, why: 'Rolls beyond recovery.' },
    { q: 'Autorotation is:', options: ['Engine start sequence', 'Controlled descent after engine failure using rotor airflow', 'Tail rotor failure', 'A navigation mode'], answer: 1, why: 'Rotor kept turning by upward airflow.' },
    { q: 'The height–velocity diagram shows:', options: ['Fuel burn', 'Low-and-slow combinations where safe autorotation is impossible', 'Weather limits', 'Cabin altitude'], answer: 1, why: '"Dead man\'s curve".' },
    { q: 'Retreating blade stall limits:', options: ['Hover height', 'Maximum forward speed', 'Fuel range', 'Cabin pressure'], answer: 1, why: 'Dissymmetry of lift.' },
    { q: 'Hovering out of ground effect requires:', options: ['Less power', 'More power', 'No power', 'Same power'], answer: 1, why: 'No cushion.' },
  ],
  sources: [
    { title: 'FAA Helicopter Flying Handbook (FAA-H-8083-21B)', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook' },
    { title: 'FAA Pilot\'s Handbook of Aeronautical Knowledge (FAA-H-8083-25C)', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak' },
  ],
};

export const AIRCRAFT_PERFORMANCE: FpcLesson = {
  id: 'fpc-aircraft-performance', domain: 'safety', ref: 'I.3',
  title: 'Aircraft performance: density altitude, weight and balance',
  summary: 'Why hot, high and heavy aircraft perform poorly, how weight and centre of gravity limit what you can carry, fuel planning, and the medical crew\'s part in keeping the aircraft within limits.',
  objectives: [
    'Explain density altitude and its effect on lift, engine power and rotor performance.',
    'Describe weight and balance limits and how patients, crew and equipment affect them.',
    'Describe fuel planning and reserve requirements.',
  ],
  sections: [
    {
      id: 'density', title: 'Density altitude', core: true,
      body: [
        'Density altitude is the altitude at which the aircraft "feels" it is flying, given the actual air density. It rises with elevation, temperature and humidity. A helipad at 5000 feet on a 35 °C day may have a density altitude above 8000 feet. Thinner air means the rotor produces less lift, the engine produces less power, and the aircraft needs more power to hover, climb and land.',
        '"High, hot and humid" days reduce payload, climb rate and hover capability, and may make hovering out of ground effect impossible. The pilot calculates performance from charts for the conditions and may need to reduce weight — leaving a crew member, equipment or fuel behind — or decline the flight.',
        'Pressure altitude (altimeter set to 29.92 inHg or 1013 hPa) corrected for non-standard temperature gives density altitude. Standard temperature at sea level is 15 °C and falls about 2 °C per 1000 feet; every degree above standard raises density altitude by roughly 120 feet.',
      ],
    },
    {
      id: 'weight', title: 'Weight and balance', core: true,
      body: [
        'Every aircraft has a maximum gross weight (for take-off and landing) and a centre of gravity (CG) envelope. Exceeding weight reduces performance and structural margins; a CG outside limits can make the aircraft uncontrollable, especially in helicopters, where cyclic authority to correct an out-of-limit CG is limited.',
        'The medical crew influence both: crew weights, the patient\'s weight (including obese patients and those with heavy equipment such as balloon pumps, ECMO or incubators), family members, additional providers, blood coolers and bags. Report accurate weights before the flight and before adding anything. Secure equipment where the configuration places it; moving heavy items changes the CG.',
        'Fuel is part of the weight calculation. On a hot day at a high helipad, the pilot may carry less fuel to stay within limits, which shortens range and requires a refuelling plan.',
      ],
    },
    {
      id: 'fuel', title: 'Fuel and range planning', core: true,
      body: [
        'Fuel planning includes the trip, contingencies, a reserve and, in instrument conditions, fuel to fly to an alternate airport. Under FAA rules, helicopters operating under visual flight rules need enough fuel to reach the first intended landing plus at least 20 minutes at normal cruise (Part 135), and many air medical operators require 30 minutes or more; instrument flights require fuel to the destination, then to an alternate, plus 30 minutes. Many air medical operators set stricter reserves.',
        'Fuel consumption rises with weight, wind, hovering and high power settings. A long scene hover, a diversion or a headwind can shorten range unexpectedly. The medical crew can help by being ready when the aircraft lands (minimising ground running time) and by understanding that a "minimum fuel" call means the plan must change — not that the pilot is being cautious for no reason.',
      ],
      table: {
        caption: 'What changes performance',
        head: ['Factor', 'Effect on performance'],
        rows: [['Higher elevation', 'Worse'], ['Higher temperature', 'Worse'], ['Higher humidity', 'Worse (slightly)'], ['More weight', 'Worse'], ['Headwind on take-off', 'Better (shorter take-off, more lift)'], ['Tailwind on take-off', 'Worse'], ['Ground effect', 'Better (in hover)']],
      },
    },
    {
      id: 'case', title: 'Scenario: the bariatric transfer at altitude',
      body: ['A 190 kg patient needs transfer from a hospital helipad at 6500 feet on a 30 °C afternoon. The referring team also wants a respiratory therapist to accompany, with a transport ventilator and two infusion pumps.'],
      example: { case: 'What does the pilot have to consider?', steps: [
        'Density altitude is very high (around 9500 ft or more); hover and climb performance are reduced.',
        'Total weight — patient, three crew, equipment and fuel — may exceed limits; the additional provider may not fit.',
        'Options: reduce fuel and plan a refuelling stop, leave non-essential equipment, fly in the cooler evening, use a larger or fixed-wing aircraft, or ground transport.',
        'Report accurate weights; never guess low to make a flight work.',
      ] },
    },
  ],
  keyPoints: [
    'Density altitude rises with elevation, heat and humidity — and performance falls.',
    'Weight and CG limits are absolute; report accurate patient, crew and equipment weights.',
    'Moving heavy equipment shifts the CG.',
    'Fuel reserves: VFR helicopter destination + 20 min minimum (often 30 by policy); IFR destination + alternate + 30 min (operators often stricter).',
    'Headwinds help take-off; tailwinds and heat hurt.',
  ],
  pearls: ['Standard temperature: 15 °C at sea level, minus 2 °C per 1000 ft.', 'Fly hot, high and heavy missions in the cool of the day where possible.'],
  pitfalls: ['Under-reporting weights.', 'Adding equipment or people after the weight calculation.'],
  questions: [
    { q: 'Density altitude increases with:', options: ['Cold, dry air at sea level', 'Higher elevation, temperature and humidity', 'Lower temperature', 'Headwind'], answer: 1, why: 'Thinner air.' },
    { q: 'High density altitude causes:', options: ['Better performance', 'Reduced lift, power and climb', 'More fuel efficiency', 'No change'], answer: 1, why: 'Less dense air.' },
    { q: 'Standard sea-level temperature:', options: ['0 °C', '15 °C', '25 °C', '30 °C'], answer: 1, why: 'ISA standard.' },
    { q: 'Standard temperature lapse rate:', options: ['2 °C per 1000 ft', '10 °C per 1000 ft', '0.5 °C per 1000 ft', 'None'], answer: 0, why: 'Approximate standard.' },
    { q: 'An out-of-limits centre of gravity can:', options: ['Improve speed', 'Make the aircraft uncontrollable', 'Reduce noise', 'Increase fuel'], answer: 1, why: 'Limited control authority.' },
    { q: 'The medical crew affect weight and balance by:', options: ['Nothing', 'Patient, crew and equipment weights and positions', 'Radio use', 'Seat colour'], answer: 1, why: 'Report accurately.' },
    { q: 'On a hot day at a high helipad, a pilot may:', options: ['Add fuel', 'Reduce fuel or payload', 'Fly faster', 'Ignore limits'], answer: 1, why: 'Stay within performance.' },
    { q: 'A headwind on take-off:', options: ['Worsens performance', 'Improves take-off performance', 'Has no effect', 'Increases weight'], answer: 1, why: 'More airflow over rotor.' },
    { q: 'IFR fuel requirement generally includes:', options: ['Destination only', 'Destination, alternate, plus 30 min reserve', '10 min reserve', 'No reserve'], answer: 1, why: 'Regulatory minimum.' },
    { q: 'Fuel consumption increases with:', options: ['Lighter loads', 'Hovering and high power settings', 'Tailwinds in cruise', 'Lower weight'], answer: 1, why: 'More power demand.' },
    { q: 'Humidity affects air density by:', options: ['Increasing it', 'Slightly decreasing it', 'No effect', 'Doubling it'], answer: 1, why: 'Water vapour is lighter than air.' },
    { q: 'If the total weight exceeds limits, the safe response is:', options: ['Under-report', 'Reduce weight or choose another option', 'Fly anyway', 'Add fuel'], answer: 1, why: 'Limits are absolute.' },
    { q: 'Moving a heavy ECMO console within the cabin:', options: ['Has no effect', 'Shifts the centre of gravity', 'Improves performance', 'Is required'], answer: 1, why: 'Changes balance.' },
    { q: 'Every degree above standard temperature raises density altitude by about:', options: ['12 ft', '120 ft', '1200 ft', '12 000 ft'], answer: 1, why: 'Rule of thumb.' },
    { q: 'A "minimum fuel" declaration means:', options: ['Continue as planned', 'The plan must change to protect reserves', 'Refuel next week', 'Normal operations'], answer: 1, why: 'Fuel priority.' },
  ],
  sources: [
    { title: 'FAA Pilot\'s Handbook of Aeronautical Knowledge — Aircraft performance', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak' },
    { title: '14 CFR 135.209 (VFR fuel supply)', url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-135/subpart-D/section-135.209' },
  ],
};
