/** Domain I extensions: extra teaching sections that bring each full course to 15–25 minutes. */
import type { Question, Section } from '../types';
type Extra = { sections: Section[]; questions: Question[] };
const S = (id: string, title: string, body: string[]): Section => ({ id, title, body });

export const SAFETY_EXTRAS: Record<string, Extra> = {
  'fpc-aircraft-ops': { questions: [], sections: [S('history', 'Why the rules changed', [
    'Helicopter air ambulance accidents rose sharply in the early 2000s; 2008 was the deadliest year on record in the United States. NTSB investigations repeatedly cited the same factors: night flight in deteriorating weather, inadequate risk assessment, pressure to complete missions, lack of terrain awareness technology, and limited instrument training and equipment.',
    'The NTSB recommended stricter weather minimums, formal risk management, flight data monitoring, terrain awareness systems, autopilots or two pilots, and night vision imaging systems. Many of these became law in the 2014 FAA rule; others, such as autopilots and two-pilot crews, remain operator choices that accredited services often adopt.',
    'The lesson for medical crews is that the safety rules are written from accident reports. When a procedure seems to slow a mission — a risk assessment, a weather decline, a sterile cockpit — it exists because crews died without it.',
  ])] },
  'fpc-aerodynamics': { questions: [], sections: [S('fixed', 'Fixed-wing aerodynamics in brief', [
    'Airplanes generate lift with fixed wings and need forward speed to fly; take-off and landing distances depend on weight, density altitude, runway surface and wind. Flaps increase lift and drag at low speeds for take-off and landing. The airplane stalls if its angle of attack exceeds the critical angle, regardless of speed — most likely at low speed during approach and departure.',
    'Turbulence and wind shear near the ground can cause sudden loss of airspeed and altitude. Crew should be seated with belts fastened during take-off, landing and turbulence; unsecured equipment becomes a projectile in severe turbulence, and in-flight injuries to crew are most often from turbulence while standing.',
    'Pressurisation allows high-altitude cruise above most weather; the cabin altitude is maintained by a pressure differential that the airframe is designed to hold. The pilot can fly lower or set a lower cabin altitude for patients who need it, at the cost of fuel and speed.',
  ])] },
  'fpc-aircraft-performance': { questions: [], sections: [S('margins', 'Performance margins in practice', [
    'Pilots use performance charts to find the maximum weight at which the aircraft can hover in ground effect (HIGE) and out of ground effect (HOGE) for the expected temperature and pressure altitude at each landing site. Confined or elevated LZs, or those surrounded by obstacles, may require HOGE performance, which is significantly more demanding.',
    'Power margin is the difference between the power available and the power required. Large margins allow for gusts, go-arounds and unexpected obstacles. Small margins leave no room for error. Air medical programmes often specify minimum margins and may restrict operations on hot afternoons or at high-altitude hospitals.',
    'As fuel burns off, weight falls and performance improves, so return flights may be easier than outbound ones. Conversely, adding a patient, extra crew and equipment at a hot scene at the end of a long flight can be the most demanding moment of the mission. Plan the whole mission, not just the first leg.',
  ])] },
  'fpc-air-emergencies': { questions: [], sections: [S('other', 'Other in-flight emergencies', [
    'Bird strikes can crack windscreens, damage rotors and disable crew; visors down reduce eye injury. A door opening in flight — usually from an incompletely latched door — can cause loss of equipment, injury and control problems; do not try to close it in flight unless the pilot directs it, and keep away from the opening.',
    'Medical emergencies affecting the pilot (incapacitation) are rare but possible; crew should know how to communicate with ATC and the company, and some programmes train medical crew in basic aircraft control and radio use for this reason. Smoke or fumes from the patient\'s equipment, oxygen leaks and lithium battery fires (thermal runaway in devices) are increasingly recognised; batteries that swell, smoke or overheat should be isolated, and the pilot informed.',
    'Laser strikes from the ground can dazzle the pilot and cause eye injury. Report immediately; avoid looking toward the source, and the pilot may hand over or climb away. Such events are reported to ATC and law enforcement.',
  ])] },
  'fpc-lz-ops': { questions: [], sections: [S('hospital', 'Hospital helipads and unfamiliar sites', [
    'Hospital helipads are designed for specific aircraft sizes and weights; rooftop pads have structural limits, fuel spill containment, fire suppression and defined approach and departure paths. Staff working on the pad must be trained in helicopter safety and fire response. Many hospitals require security to control access during landings.',
    'Unfamiliar sites — first-time scenes, hospitals without a helipad, sports fields, car parks — carry more risk. A high and slow reconnaissance pass identifies wires, slopes, debris and people before committing to land. The pilot may ask the medical crew to watch specific obstacles during the approach.',
    'After landing at a scene, the crew agree where the aircraft will stay (engines running or shut down), who stays with it, and how the patient will be brought to it. Bystanders and responders should not approach without an escort. Before departure, a final walk-around of the LZ checks for debris and people.',
  ])] },
  'fpc-obstacles': { questions: [], sections: [S('night', 'Obstacles at night and in poor visibility', [
    'At night, the eye relies on rods in the peripheral retina, which detect light and motion but not detail or colour; a dark wire or unlit tower against dark terrain may be completely invisible. Lights on obstacles help, but failed lights are common and unlit structures exist. NVGs extend vision but do not reliably show wires.',
    'Black-hole approaches — over water or unlit terrain toward a lit LZ — create the illusion of being higher than you are, leading to low approaches into obstacles or terrain. Featureless terrain, snow and water make height judgement difficult. Pilots rely on instruments, radar altimeters and stabilised approach criteria.',
    'Medical crew contribute by keeping the cabin dark, scanning their side during approach and departure, and calling out anything that might be an obstacle — it is better to report a false alarm than miss a real hazard. Familiarity with regularly used LZs and hospitals, including new construction, is shared through briefings and the SMS.',
  ])] },
  'fpc-survival': { questions: [], sections: [S('kit', 'Survival kits and environment-specific skills', [
    'Aircraft survival kits are tailored to the operating area: shelter (emergency blankets, bivvy bags), signalling (mirror, whistle, strobe, flares), fire-starting materials, water and purification, food bars, a knife or multi-tool, a first aid kit, cordage and, over water, flotation and rafts. Know where the kit is and what is in it; carry a small personal kit on your flight suit in case you cannot reach the aircraft.',
    'Cold environments: prevent sweating (remove layers when working), keep dry, insulate from the ground, and watch for hypothermia and frostbite in the group. Hot environments: shade, minimal exertion during the heat of the day, and conserve water in the body by limiting sweating rather than rationing drinking. Desert nights can be very cold.',
    'Psychological factors matter. Fear, pain, fatigue and boredom degrade decision-making. Clear leadership, assigning tasks, keeping the group together and maintaining hope are important survival tools.',
  ])] },
  'fpc-weather': { questions: [], sections: [S('seasonal', 'Seasonal and local weather', [
    'Weather patterns vary with season and geography. Winter brings icing, snow, freezing fog and short daylight; summer brings convective thunderstorms in the afternoon and evening, high density altitude and haze; spring and autumn bring frontal systems and rapidly changing conditions. Coastal areas have advection fog and sea breezes; mountainous areas have mountain waves, valley fog, rapidly changing local weather and lower effective minimums.',
    'Fronts: a cold front often brings a narrow band of thunderstorms, gusty winds and a sharp improvement afterwards; a warm front brings widespread low cloud, drizzle and poor visibility over a broad area ahead of it. Low-pressure systems are associated with cloud and precipitation; high pressure with clearer skies but also radiation fog and haze.',
    'Local knowledge — which valleys fill with fog at dawn, which hospitals are often in low cloud — is valuable. Share it in briefings and through programme weather resources.',
  ])] },
  'fpc-refuelling': { questions: [], sections: [S('spill', 'Spills, fires and emergencies at the fuel point', [
    'A small spill should stop the refuelling and be contained with absorbent material before the engine is started. Larger spills require the area to be cleared, ignition sources removed and the airport or fire service notified. Fuel on clothing or skin is a fire and chemical hazard; remove contaminated clothing and wash the skin.',
    'If a fire starts during refuelling: stop the fuel flow (emergency shut-off), raise the alarm, evacuate the patient and crew upwind, and use the extinguisher only if it is safe to do so and the fire is small. Do not move the aircraft unless instructed.',
    'Fuel trucks and fixed fuel stations have emergency stop buttons; crew should know their location at regularly used sites. Refuelling during thunderstorms in the vicinity is suspended because of lightning risk.',
  ])] },
  'fpc-wellness': { questions: [], sections: [S('mental', 'Mental health and resilience', [
    'Air medical crews are exposed repeatedly to trauma, death, child injury, and the stress of high-stakes decisions in difficult environments. Sleep disruption and fatigue amplify the effects. Burnout, depression, anxiety, post-traumatic stress and substance misuse occur at higher rates in emergency services than in the general population.',
    'Protective factors include peer support programmes, critical incident stress management, access to confidential counselling and employee assistance programmes, healthy sleep, exercise and social connection, and a culture where talking about stress is normal. Leaders who model asking for help reduce stigma.',
    'Recognise warning signs in yourself and colleagues: withdrawal, irritability, changes in sleep or alcohol use, and loss of interest. Asking a colleague directly how they are doing is the first step. This topic is covered in depth in the professional domain\'s lesson on caregiver PTSD and suicide risk.',
  ])] },
  'fpc-hazard-reporting': { questions: [], sections: [S('learning', 'From report to change', [
    'A report is only valuable if it leads to learning. Safety teams triage reports by risk, investigate significant events with tools such as root cause analysis, and look for patterns across many reports — a single LZ with repeated near-misses, a recurring equipment fault, or fatigue clustering on certain shift patterns.',
    'Actions follow the hierarchy of controls: eliminate the hazard, substitute something safer, engineer controls (a better latch), administrative controls (a procedure or checklist), and lastly personal protective equipment. Training alone is the weakest control because it relies on memory under pressure.',
    'Close the loop: tell the reporter and the wider crew what was found and changed. Safety bulletins, monthly safety meetings and briefings at shift change keep everyone informed and show that reporting matters.',
  ])] },
  'fpc-radio-comms': { questions: [], sections: [S('ground', 'Working with ground agencies and receiving hospitals', [
    'Ground agencies use their own radio systems, talk groups and terminology. Agree frequencies or talk groups during the request, and make sure the LZ coordinator can hear and speak to the aircraft. Use plain language rather than local codes, and keep instructions short.',
    'Early notification of the receiving hospital allows teams to be ready: trauma team activation, cath lab, stroke team, blood, or a specific bed. Update the ETA as it changes. On landing at a hospital, confirm who receives the handover and give a structured report (for example MIST for trauma: Mechanism, Injuries, Signs, Treatment; or SBAR: Situation, Background, Assessment, Recommendation).',
    'Online medical control may be needed for orders outside protocol. Have the key information ready before calling, state the question clearly, and repeat back any orders to confirm. Document the time, the physician\'s name and the orders given.',
  ])] },
  'fpc-restraints': { questions: [], sections: [S('special', 'Special restraint situations', [
    'Children and infants need age-appropriate restraint: approved child restraint devices or paediatric restraint systems for the stretcher, never held in a parent\'s arms during flight. Neonates travel in a secured transport incubator with internal restraints.',
    'Pregnant patients are restrained with the lap belt below the abdomen across the pelvis and the shoulder strap between the breasts, with left lateral tilt to avoid aortocaval compression. Bariatric patients need stretchers and restraints rated for their weight and dimensions; standard straps may not fit safely.',
    'Patients with spinal precautions are secured on a vacuum mattress or scoop that is itself locked to the stretcher. Patients with mental health crises who are calm should still be assessed for flight risk — sudden agitation in the aircraft is dangerous, and sedation or ground transport may be safer.',
  ])] },
  'fpc-preflight': { questions: [], sections: [S('shift', 'Shift-change handover and readiness', [
    'At shift change, the outgoing crew hands over aircraft and equipment status: any defects reported, items used and restocked, oxygen levels, controlled drug counts, blood products and their expiry, and any outstanding maintenance. The incoming crew completes their own checks rather than relying on the handover alone.',
    'Readiness also means personal equipment: helmet fitted and tested, flight suit and boots, hearing protection, NVGs tested if used, personal survival kit, and phone or radio charged. A short team briefing at the start of the shift covers weather for the day, aircraft status, any known hazards (new construction, closed hospitals) and crew wellbeing.',
    'Response time targets push crews to launch quickly, but a well-organised check at the start of the shift makes rapid, safe launches possible. Shortcuts at the start of the shift become problems at 03:00.',
  ])] },
  'fpc-pax-briefing': { questions: [], sections: [S('crew', 'Briefing medical personnel', [
    'Under the 2014 FAA rule, operators must brief medical personnel on aircraft safety before flight, or ensure they have completed training that covers it. Topics include: the aircraft\'s physical characteristics, approach and departure procedures, emergency exits and equipment, the location and use of fire extinguishers, oxygen system shut-off, and communication procedures with the pilot.',
    'Accompanying specialists from a referring hospital — a perfusionist, a neonatal team, a paediatric intensivist — may be unfamiliar with aircraft. Brief them with the same rigour as passengers, plus their role during flight and any equipment limits (power, mounting, weight).',
    'At the end of the briefing, ask for questions and confirm understanding of the most important items: how to release the belt, where the exits are, and when to stay silent.',
  ])] },
  'fpc-risk-assessment': { questions: [], sections: [S('tools', 'Risk matrices and the operations control centre', [
    'A risk matrix combines likelihood (rare to almost certain) and severity (negligible to catastrophic) to rank hazards and decide responses. Applied to a flight, the pilot and operations control specialist use the programme\'s risk tool to identify the highest-scoring factors, then ask whether each can be reduced — by delaying, choosing another route, adding a second pilot, or using a ground team.',
    'Operations control centres (OCCs), required for larger US HAA operators, provide a second person with weather and flight-tracking tools who participates in launch decisions, monitors flights and initiates the post-accident plan if needed. The OCC specialist can and should question a launch that looks risky.',
    'Decision-making improves when information is shared openly: weather turn-downs by other services, LZ concerns from ground crews and recent near-misses should all feed into risk decisions.',
  ])] },
  'fpc-nvg': { questions: [], sections: [S('prep', 'Preparing and testing goggles', [
    'Before flight, goggles are tested in a test lane or with a resolution chart: focus each tube, set the interpupillary distance, adjust eye relief and tilt, check for scintillation (sparkle), black spots, shading and distortion, and confirm battery levels with a spare battery. A goggle that fails any check is not used.',
    'Goggles are mounted on the helmet with a counterweight to reduce neck strain. They should be stowed or flipped up during ground operations near bright lights and when white light is needed. Store and handle them carefully — the tubes are expensive and easily damaged.',
    'Initial and recurrent training cover NVG theory, limitations, illusions, emergency procedures (goggle failure, transitioning to unaided flight), and crew coordination. Crew who use NVGs only occasionally are less proficient; currency requirements exist for pilots and are good practice for medical crew.',
  ])] },
  'fpc-gps-nav': { questions: [], sections: [S('charts', 'Reading aviation charts', [
    'VFR sectional charts show terrain (contour lines and colour shading), obstacles (towers with their height above mean sea level and above ground level), airspace boundaries, airports and heliports, navigation aids and major landmarks. The maximum elevation figure in each grid shows the highest terrain or obstacle in that area, plus a margin.',
    'Helicopter route charts and local LZ databases add hospitals, helipads and pre-surveyed landing sites. Obstacles shown on charts are only those that have been reported; new or temporary structures (cranes, wind turbines under construction) may not appear.',
    'Medical crew should be able to locate the aircraft on a chart, identify obstacles near an LZ, and help the pilot cross-check landmarks. In an emergency or if the pilot is busy, giving a position relative to a charted landmark ("five miles north of the lake, over the highway") can be invaluable.',
  ])] },
};
