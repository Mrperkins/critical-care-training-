import type { Decision } from './types';

/** Consequences show a specific mechanism; they are not a treatment protocol or a drug-dose model. */
export const DECISIONS = {
  airway: [
    { id: 'relieve', label: 'Relieve bronchospasm and allow more time to exhale', outcome: 'stabilize', change: { obstruction: -0.3, overdistension: -0.2, pressure: -0.15 }, explanation: 'Airway calibre improves and retained gas decreases. Underlying airway disease remains; reassess ventilation and perfusion.' },
    { id: 'faster', label: 'Increase rate while keeping the same inspiratory time', outcome: 'deteriorate', change: { overdistension: 0.25, pressure: 0.2, flowLoss: 0.15 }, explanation: 'Shorter expiration adds trapped gas. Intrathoracic pressure can impede venous return even when minute ventilation appears larger.' },
    { id: 'oxygen', label: 'Change oxygen alone', outcome: 'unchanged', change: {}, explanation: 'Oxygen does not relieve obstruction or dynamic hyperinflation. The mechanical problem persists.' },
  ],
  oxygenation: [
    { id: 'support', label: 'Support oxygenation with careful recruitment and reassessment', outcome: 'stabilize', change: { collapse: -0.2, shunt: -0.15 }, explanation: 'Recruitable units reopen in this model. Fluid or inflammation remains; excessive pressure can injure open units or reduce cardiac output.' },
    { id: 'large', label: 'Use larger breaths to normalize every gas value', outcome: 'deteriorate', change: { overdistension: 0.3, pressure: 0.2 }, explanation: 'The available aerated lung receives the extra volume and stretches. A better gas number does not establish lung protection.' },
    { id: 'wait', label: 'Wait despite worsening work of breathing', outcome: 'deteriorate', change: { collapse: 0.15, shunt: 0.15 }, explanation: 'Failure to support gas exchange allows deterioration in the illustrative case.' },
  ],
  upper: [
    { id: 'support', label: 'Keep the patient calm and support airway patency', outcome: 'stabilize', change: { obstruction: -0.15, flowLoss: -0.1 }, explanation: 'Reduced distress and effective airway support improve airflow. The cause still requires appropriate definitive care.' },
    { id: 'distress', label: 'Force a distressed patient supine for repeated examination', outcome: 'deteriorate', change: { obstruction: 0.2, flowLoss: 0.2 }, explanation: 'Agitation and loss of a comfortable airway position can worsen a critically narrowed airway.' },
    { id: 'sat', label: 'Use normal oxygen saturation to exclude severe obstruction', outcome: 'deteriorate', change: { obstruction: 0.15 }, explanation: 'Saturation can remain normal until late. Stridor, effort, air entry and mental status matter.' },
  ],
  tension: [
    { id: 'decompress', label: 'Treat the obstructing pleural pressure and reassess', outcome: 'stabilize', change: { pressure: -0.5, collapse: -0.35, flowLoss: -0.4 }, explanation: 'Pleural pressure falls, venous return improves and the lung can expand. Ongoing air leak still requires definitive management.' },
    { id: 'pressure', label: 'Increase airway pressure to force the lung open', outcome: 'deteriorate', change: { pressure: 0.25, flowLoss: 0.25 }, explanation: 'More positive pressure does not evacuate pleural gas and can worsen obstructive shock.' },
    { id: 'wait', label: 'Delay treatment while waiting for imaging in the unstable case', outcome: 'deteriorate', change: { pressure: 0.2, flowLoss: 0.2 }, explanation: 'The modeled pressure continues to impede filling. An unstable clinical tension pneumothorax needs immediate recognition and treatment.' },
  ],
  bleeding: [
    { id: 'control', label: 'Control the bleeding source and restore circulating capacity', outcome: 'stabilize', change: { bleeding: -0.2, volumeLoss: -0.25, flowLoss: -0.2 }, explanation: 'Source control plus appropriate resuscitation restores flow in the model. An inaccessible internal source remains a definitive-care priority.' },
    { id: 'ignore', label: 'Treat the pulse rate alone and defer hemorrhage control', outcome: 'deteriorate', change: { volumeLoss: 0.2, flowLoss: 0.2 }, explanation: 'Tachycardia may be compensating for reduced stroke volume. Suppressing a number does not replace circulating blood.' },
    { id: 'normal', label: 'Assume a normal initial pressure excludes blood loss', outcome: 'deteriorate', change: { bleeding: 0.15, volumeLoss: 0.15 }, explanation: 'Compensation can preserve pressure while tissue perfusion and circulating volume worsen.' },
  ],
  perfusion: [
    { id: 'cause', label: 'Support organ perfusion while addressing the underlying cause', outcome: 'stabilize', change: { flowLoss: -0.2, ischemia: -0.1 }, explanation: 'Perfusion support reduces secondary injury in the illustrative model. It does not dissolve a clot, repair an aorta or cure infection.' },
    { id: 'delay', label: 'Wait for profound hypotension before acting', outcome: 'deteriorate', change: { flowLoss: 0.2, ischemia: 0.2 }, explanation: 'Organ hypoperfusion can precede profound hypotension. Trend mentation, skin, urine output and other available data.' },
    { id: 'fluid', label: 'Give repeated fluid without reassessing the physiology', outcome: 'deteriorate', change: { fluid: 0.2, edema: 0.15 }, explanation: 'Indiscriminate volume can worsen congestion or capillary leak. The fluid decision depends on the cause and response.' },
  ],
  neuro: [
    { id: 'protect', label: 'Protect oxygenation and perfusion; expedite cause-specific care', outcome: 'stabilize', change: { flowLoss: -0.15 }, explanation: 'Secondary injury is limited in the model. Established hemorrhage or infarct remains visible; supportive care does not erase it.' },
    { id: 'hypoxia', label: 'Accept worsening hypoxia while prioritizing an isolated examination', outcome: 'deteriorate', change: { ischemia: 0.2, flowLoss: 0.15 }, explanation: 'Hypoxemia compounds injured brain tissue. Repeat examinations alongside physiologic support.' },
    { id: 'hypervent', label: 'Hyperventilate every brain-injured patient routinely', outcome: 'deteriorate', change: { flowLoss: 0.2, ischemia: 0.15 }, explanation: 'Unnecessary hypocapnia constricts cerebral vessels. Temporary ventilation changes for impending herniation are a separate, protocol-guided decision.' },
  ],
  seizure: [
    { id: 'control', label: 'Control seizure activity while protecting oxygenation and perfusion', outcome: 'stabilize', change: { electrical: -0.4, metabolic: -0.2, flowLoss: -0.1 }, explanation: 'Effective cause-specific seizure care reduces electrical activity and metabolic demand in this model. Reassess the airway and neurologic status; stopping activity does not erase underlying injury.' },
    { id: 'delay', label: 'Wait despite sustained activity and failing ventilation', outcome: 'deteriorate', change: { electrical: 0.15, metabolic: 0.2, flowLoss: 0.15 }, explanation: 'Sustained activity continues to consume energy while inadequate ventilation and perfusion compound secondary injury.' },
    { id: 'pressure', label: 'Focus on a single pressure reading and ignore seizure activity', outcome: 'deteriorate', change: { electrical: 0.1, metabolic: 0.2 }, explanation: 'An isolated blood-pressure number does not address ongoing electrical activity, gas exchange or the cause of the seizure.' },
  ],
  chemistry: [
    { id: 'identify', label: 'Treat the specific chemistry problem and monitor the response', outcome: 'stabilize', change: { metabolic: -0.2, electrical: -0.15 }, explanation: 'The affected pathway improves in the model. Recheck glucose, electrolytes, acid–base state and clinical response as applicable.' },
    { id: 'number', label: 'Correct one displayed number without checking related physiology', outcome: 'deteriorate', change: { metabolic: 0.15, electrical: 0.2 }, explanation: 'Related abnormalities can make an isolated correction hazardous, such as insulin when potassium is already depleted.' },
    { id: 'ignore', label: 'Ignore mental-status and ECG changes because symptoms are nonspecific', outcome: 'deteriorate', change: { metabolic: 0.2 }, explanation: 'Chemistry abnormalities can affect cellular energy, membrane excitability and ventilation.' },
  ],
  interpretation: [
    { id: 'context', label: 'Combine the anatomy with symptoms and physiologic assessment', outcome: 'unchanged', change: {}, explanation: 'Correct interpretation. Morphology illustrates a mechanism; diagnosis and management require the clinical context. Anatomy does not change merely because you recognize it.' },
    { id: 'image', label: 'Make the diagnosis from this schematic image alone', outcome: 'unchanged', change: {}, explanation: 'The image alone is insufficient. A teaching schematic cannot establish a patient diagnosis or measure disease severity.' },
    { id: 'adult', label: 'Apply adult assumptions without considering population physiology', outcome: 'unchanged', change: {}, explanation: 'Age, reproductive physiology and developmental stage materially change the interpretation.' },
  ],
} satisfies Record<string, Decision[]>;
export type DecisionProfile = keyof typeof DECISIONS;
