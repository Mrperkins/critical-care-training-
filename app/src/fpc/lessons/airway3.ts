/** FP-C III.5–III.6: the failed airway; surgical airway. */
import type { FpcLesson } from '../types';

export const FAILED_AIRWAY: FpcLesson = {
  id: 'fpc-failed-airway', domain: 'airway', ref: 'III.5',
  title: 'The failed airway',
  summary: 'Recognising failure early, the difference between "can\'t intubate, can oxygenate" and "can\'t intubate, can\'t oxygenate", and moving through plans A to D without fixation.',
  objectives: [
    'Define a failed airway and the CICO situation.',
    'Apply a stepwise plan: best attempt at intubation, supraglottic rescue, face-mask oxygenation, front-of-neck access.',
    'Use human factors — limiting attempts, declaring failure aloud — to avoid fixation.',
  ],
  sections: [
    {
      id: 'define', title: 'What counts as failure', core: true,
      body: [
        'A failed airway exists when an experienced operator cannot intubate after a limited number of best attempts, or when oxygenation cannot be maintained at any point. The distinction that matters is whether the patient can be oxygenated by another means.',
        '"Can\'t intubate, can oxygenate" is a failed intubation but not yet an emergency of minutes: the team has time to re-oxygenate, change technique or operator, place a supraglottic airway, wake the patient if appropriate, or consider a planned surgical airway.',
        '"Can\'t intubate, can\'t oxygenate" (CICO) is the end of the line. Failed intubation plus failure of a supraglottic airway plus failure of optimised face-mask ventilation, with falling saturation, demands immediate front-of-neck access. Hesitation here — not the incision — is what kills patients.',
      ],
      list: { caption: 'Commonly used limits', items: ['No more than three attempts at intubation in total, with the fourth only by a more experienced operator if available.', 'Each attempt is a best attempt: optimal position, device, adjunct and paralysis.', 'Stop any attempt at the agreed saturation or time and re-oxygenate.', 'No more than three attempts at supraglottic airway insertion.'] },
    },
    {
      id: 'plans', title: 'Plans A to D', core: true,
      body: [
        'Plan A is tracheal intubation, maximising first-pass success: a video laryngoscope where available, a bougie or stylet, full neuromuscular blockade, optimal positioning and external laryngeal manipulation. Change something between attempts — device, blade, position, operator — otherwise a second attempt is likely to fail in the same way.',
        'Plan B is rescue oxygenation through a second-generation supraglottic airway (one with a gastric drainage channel). If it works, stop and think: wake the patient, intubate through the device with a fibreoptic scope if skilled, transport with the supraglottic airway, or proceed to a planned surgical airway.',
        'Plan C is face-mask ventilation with two hands, an oropharyngeal and nasopharyngeal airway, and full paralysis — paralysis improves mask ventilation by abolishing laryngospasm and chest wall rigidity. If oxygenation is restored, the options are the same as after a successful Plan B.',
        'Plan D is front-of-neck access when Plans A, B and C have failed and saturation is falling. Declare it aloud: "This is a can\'t intubate, can\'t oxygenate situation. I am doing a cricothyrotomy." Continue attempts at oxygenation from above while the neck is opened.',
      ],
      example: {
        case: 'A trauma patient, paralysed with rocuronium. Two video laryngoscopy attempts give a grade 4 view through blood. SpO₂ is 89 % and falling. A size 4 supraglottic airway is placed; there is no chest rise and no capnography trace. Two-person mask ventilation fails.',
        steps: [
          'Plans A, B and C have failed and the patient is desaturating: this is CICO.',
          'Declare it, call for the surgical airway kit, and extend the neck.',
          'Perform a scalpel–bougie–tube cricothyrotomy while another rescuer continues to attempt oxygenation from above.',
          'Confirm with waveform capnography, ventilate, then secure the tube.',
        ],
      },
    },
    {
      id: 'human', title: 'Human factors and fixation', core: true,
      body: [
        'Experienced operators fail airways most often not for lack of skill but because of task fixation — repeated attempts with the same approach while the patient desaturates. Time distortion is real: an operator focused on the screen loses track of seconds and saturation.',
        'Assign roles before induction: an airway operator, an assistant, someone watching the monitor who will call out saturation and time, and someone responsible for the drug plan. Give that observer explicit permission to call a stop. Use shared language, such as the Vortex approach, where any best attempt at one of the three upper-airway lifelines (tube, supraglottic airway, face mask) that fails moves the team toward the next, and failure of all three moves the team to the neck.',
        'Debrief every failed or difficult airway. Record the grade of view, what worked and what did not, and tell the patient and receiving team so the next operator is warned.',
      ],
    },
    {
      id: 'tricks', title: 'Techniques that rescue Plan A',
      body: [
        'Bougie: with a grade 2b or 3 view, pass the bougie with the angled tip anterior, feel for tracheal rings (clicks) and hold-up at the small bronchi around 30–40 cm; then railroad the tube, rotating it 90° counter-clockwise to avoid catching on the arytenoids.',
        'External laryngeal manipulation: the operator moves the thyroid cartilage with the right hand to bring the cords into view, then an assistant holds it there. This is different from cricoid pressure.',
        'Suction-assisted laryngoscopy and airway decontamination (SALAD): lead with a rigid suction catheter, park it in the upper oesophagus to the left of the blade, and clear the view continuously in massive vomit or blood.',
        'Changing device: a hyperangulated video blade for an anterior larynx, a direct blade for heavy contamination that blinds the camera, a smaller tube for oedema.',
      ],
    },
  ],
  keyPoints: [
    'Failed airway: can\'t intubate after limited best attempts, or can\'t oxygenate at any point.',
    'Change something between attempts; limit to three.',
    'Plan B: second-generation supraglottic airway; Plan C: two-handed mask with adjuncts and full paralysis.',
    'CICO with falling saturation = immediate front-of-neck access, declared aloud.',
    'Assign a monitor-watcher with authority to call a stop.',
  ],
  pearls: ['Paralysis improves face-mask ventilation.', 'After a successful rescue, the next decision is a choice — wake, convert or transport — not reflexive re-intubation.'],
  pitfalls: ['Fourth and fifth attempts with the same blade.', 'Delaying cricothyrotomy to try one more supraglottic device.'],
  live: [{ id: 'pop-apnoea', label: 'Apnoea: how long the oxygen lasts' }],
  questions: [
    { q: 'CICO is defined as failure of:', options: ['Intubation only', 'Intubation, supraglottic airway and face-mask oxygenation', 'Two intubation attempts', 'Capnography'], answer: 1, why: 'All three upper-airway lifelines fail with falling saturation.' },
    { q: 'Between intubation attempts you should:', options: ['Repeat the same technique faster', 'Change something and re-oxygenate', 'Give more induction agent', 'Remove monitoring'], answer: 1, why: 'Repeating the same approach usually fails the same way.' },
    { q: 'Preferred supraglottic device for rescue:', options: ['First-generation without drain', 'Second-generation with gastric drainage', 'Nasal airway only', 'Oral airway only'], answer: 1, why: 'Better seal and gastric access.' },
    { q: 'Neuromuscular blockade during failed mask ventilation:', options: ['Worsens ventilation', 'Often improves ventilation', 'Is contraindicated', 'Has no effect'], answer: 1, why: 'It abolishes laryngospasm and chest wall rigidity.' },
    { q: 'After successful supraglottic rescue in a can\'t-intubate patient, which is NOT an appropriate next step?', options: ['Wake the patient', 'Intubate through the device with a scope', 'Transport with the device', 'Repeated blind intubation attempts until success'], answer: 3, why: 'Further unstructured attempts risk losing the airway.' },
    { q: 'The commonest human-factor cause of airway disasters is:', options: ['Lack of equipment', 'Task fixation', 'Excessive checklists', 'Too many team members'], answer: 1, why: 'Repeated attempts while desaturating.' },
    { q: 'Hold-up of a bougie at 30–40 cm suggests:', options: ['Oesophageal placement', 'Tracheal placement reaching small bronchi', 'Piriform recess', 'Kinked bougie'], answer: 1, why: 'Distal hold-up is a sign of tracheal placement.' },
    { q: 'When railroading a tube over a bougie, rotate it:', options: ['90° counter-clockwise', '180°', 'Not at all', '90° clockwise always'], answer: 0, why: 'Rotation keeps the bevel from catching on the right arytenoid.' },
    { q: 'SALAD is used for:', options: ['Bronchospasm', 'Massive airway contamination', 'Laryngospasm', 'Tube confirmation'], answer: 1, why: 'Suction-assisted laryngoscopy and airway decontamination.' },
    { q: 'In CICO, while one rescuer performs cricothyrotomy, others should:', options: ['Stop all oxygenation', 'Continue to attempt oxygenation from above', 'Prepare for extubation', 'Draw labs'], answer: 1, why: 'Any oxygen delivered buys time.' },
  ],
  sources: [
    { title: 'Difficult Airway Society: unanticipated difficult intubation guidelines (2015)', url: 'https://das.uk.com/guidelines/das_intubation_guidelines' },
    { title: 'The Vortex Approach', url: 'https://vortexapproach.org/' },
  ],
};

export const SURGICAL_AIRWAY: FpcLesson = {
  id: 'fpc-surgical-airway', domain: 'airway', ref: 'III.6',
  title: 'Surgical airway: cricothyrotomy and needle techniques',
  summary: 'The scalpel–bougie–tube technique, open surgical cricothyrotomy, needle cricothyrotomy in children, and the complications and contraindications.',
  objectives: [
    'Perform a scalpel–bougie–tube cricothyrotomy step by step.',
    'Know when needle cricothyrotomy is preferred and its limits.',
    'Recognise complications and confirm placement.',
  ],
  sections: [
    {
      id: 'indication', title: 'Indications and contraindications', core: true,
      body: [
        'The main indication is CICO. Others are massive facial trauma or upper airway obstruction that makes oral intubation impossible, when oxygenation cannot otherwise be secured.',
        'Relative contraindications include laryngeal fracture or transection, a large neck mass or haematoma over the membrane, and young age. In children under roughly 10–12 years the cricothyroid membrane is tiny and the larynx is soft and mobile; most guidelines prefer needle cricothyrotomy, or a surgical tracheostomy by a surgeon, in this age group. In CICO there is no absolute contraindication in an adult: an imperfect surgical airway beats a dead patient.',
      ],
    },
    {
      id: 'sbt', title: 'Scalpel–bougie–tube technique', core: true,
      body: [
        'This technique is favoured by many guidelines because it needs little equipment — a wide (number 10) scalpel blade, a bougie and a 6.0 mm cuffed tube — and works in the same way every time.',
        'If the membrane is palpable: stabilise the larynx with the non-dominant hand, make a transverse stab incision through skin and membrane, rotate the blade 90° so the sharp edge faces caudally, pull the blade toward you to open the hole, slide the bougie along the blade into the trachea, then pass the tube over the bougie and inflate the cuff.',
        'If the membrane is impalpable (obesity, swelling): make an 8–10 cm vertical midline incision, use blunt finger dissection to find the larynx, then proceed with the transverse membrane incision as above. The vertical skin incision avoids lateral vessels and allows extension.',
      ],
      list: { caption: 'Steps (palpable membrane)', items: ['Extend the neck; identify the membrane with the laryngeal handshake.', 'Transverse stab incision through skin and membrane, blade edge toward the operator.', 'Rotate blade 90° (sharp edge caudal); pull toward you to open.', 'Slide the bougie along the blade into the trachea.', 'Railroad a lubricated 6.0 cuffed tube; inflate the cuff.', 'Confirm with waveform capnography; ventilate; secure.'], ordered: true },
    },
    {
      id: 'needle', title: 'Needle cricothyrotomy', core: true,
      body: [
        'A large-bore cannula (12–14 gauge) passed through the membrane at about 45° caudally, aspirating air as it enters the trachea, can deliver oxygen. It is the preferred emergency technique in young children.',
        'Ventilation through a narrow cannula requires a high-pressure source: jet ventilation or a commercial device, with inspiration of about one second and expiration of about four. Exhalation must occur through the upper airway; if the upper airway is completely obstructed, gas cannot escape, pressure rises and barotrauma follows. CO₂ clearance is poor, so needle cricothyrotomy is a short bridge to a definitive airway.',
        'Kinking, dislodgement and subcutaneous emphysema are common. A standard BVM attached to a 3.0 mm tube adapter on a cannula cannot generate enough flow to ventilate an adult.',
      ],
    },
    {
      id: 'complications', title: 'Complications and aftercare',
      body: [
        'Immediate complications: bleeding (usually venous, controlled by pressure and the tube itself), false passage into the pretracheal tissues (no capnography trace — remove and re-site), posterior tracheal wall or oesophageal injury, and subcutaneous emphysema. Late complications include subglottic stenosis and voice change.',
        'Secure the tube carefully: in the neck it is short and easily displaced. Note the depth, avoid advancing so far that the tube enters a main bronchus, and reconfirm capnography after every patient movement.',
      ],
    },
  ],
  keyPoints: [
    'Indication: CICO, or impossible oral intubation with failing oxygenation.',
    'Scalpel–bougie–tube: transverse stab, rotate blade caudally, bougie along blade, 6.0 cuffed tube.',
    'Impalpable membrane: vertical skin incision and blunt dissection first.',
    'Children under about 10–12 years: needle cricothyrotomy preferred.',
    'Needle oxygenation is a short bridge, needs high-pressure gas, and exhalation via the upper airway.',
  ],
  pearls: ['Mark the membrane before induction in predicted difficult airways.', 'The tube in the neck is short — confirm after every move.'],
  pitfalls: ['Horizontal skin incision through a swollen neck where the membrane cannot be felt.', 'Expecting a BVM to ventilate through a 14-gauge cannula.'],
  questions: [
    { q: 'Tube commonly used for scalpel–bougie–tube cricothyrotomy in adults:', options: ['3.0 uncuffed', '6.0 cuffed', '8.5 cuffed', 'Tracheostomy size 10'], answer: 1, why: 'A 6.0 cuffed tube passes easily through the membrane.' },
    { q: 'When the membrane is impalpable, the first incision is:', options: ['Transverse 2 cm', 'Vertical midline 8–10 cm', 'Needle only', 'Lateral'], answer: 1, why: 'Vertical incision and blunt dissection to locate the larynx.' },
    { q: 'Needle cricothyrotomy is preferred in:', options: ['Obese adults', 'Children under about 10–12 years', 'Laryngeal fracture in adults', 'Elderly patients'], answer: 1, why: 'The paediatric membrane is too small for a surgical approach.' },
    { q: 'With needle jet ventilation, exhalation occurs via:', options: ['The cannula', 'The upper airway', 'A second cannula only', 'Not required'], answer: 1, why: 'The cannula is too narrow for passive exhalation; total upper obstruction risks barotrauma.' },
    { q: 'After cricothyrotomy, no capnography trace suggests:', options: ['Successful placement', 'False passage', 'Bronchospasm only', 'Normal finding'], answer: 1, why: 'Pretracheal placement — remove and re-site.' },
    { q: 'Rotating the scalpel blade 90° after the stab incision is done so the sharp edge faces:', options: ['Cephalad', 'Caudad', 'Laterally', 'Posteriorly'], answer: 1, why: 'Caudal edge reduces injury to the cricothyroid vessels and cords above.' },
    { q: 'Which is a relative contraindication to surgical cricothyrotomy?', options: ['Obesity', 'Laryngeal fracture', 'Facial burns', 'Beard'], answer: 1, why: 'Laryngeal disruption may make the membrane unusable.' },
    { q: 'Needle cricothyrotomy ventilation primarily fails to:', options: ['Oxygenate', 'Clear CO₂', 'Deliver high pressure', 'Cause emphysema'], answer: 1, why: 'CO₂ accumulates; it is a short bridge.' },
    { q: 'In CICO, an adult has a large neck haematoma. You should:', options: ['Avoid surgical airway entirely', 'Proceed — CICO has no absolute contraindication', 'Wait for surgery', 'Use needle only'], answer: 1, why: 'Failure to act is fatal; an imperfect airway is better.' },
    { q: 'The cuffed tube in a surgical airway should be advanced:', options: ['Until resistance at the carina', 'Just past the cuff into the trachea, then secured', 'As deep as possible', 'Only 1 cm'], answer: 1, why: 'Avoid mainstem placement; the tracheal segment is short.' },
  ],
  sources: [
    { title: 'Difficult Airway Society: front-of-neck access (2015 guidelines)', url: 'https://das.uk.com/guidelines/das_intubation_guidelines' },
    { title: 'StatPearls: Cricothyrotomy', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Cricothyrotomy+StatPearls' },
  ],
};
