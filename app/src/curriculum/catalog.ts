/**
 * Curriculum catalog: metadata for every Director lesson, step lesson and workflow, and the concept tags
 * of every challenge (for weak-topic detection and remediation). Data only — no lesson code here.
 * Objectives are our own words. Sources are titles of guidelines, landmark trials and textbooks (for the
 * learner to look up), never quoted text. Certification tags mark topic ALIGNMENT with the FP-C / CCP-C
 * (IBSC) and CFRN (BCEN) content areas; NAEMT tags name the NAEMT course whose scope the topic touches.
 */
export type Domain = 'Cardiology' | 'Respiratory' | 'Haemodynamics & shock' | 'Acid–base & labs' | 'Neuro' | 'Trauma & haemorrhage' | 'Renal & metabolic'
  | 'Pharmacology' | 'Ventilation' | 'Blood' | 'Procedures' | 'Devices' | 'Imaging & POCUS' | 'Paediatric' | 'Neonatal' | 'OB';
export const DOMAINS: Domain[] = ['Ventilation', 'Respiratory', 'Haemodynamics & shock', 'Cardiology', 'Acid–base & labs', 'Renal & metabolic', 'Neuro', 'Trauma & haemorrhage', 'Blood', 'Pharmacology', 'Procedures', 'Devices', 'Imaging & POCUS', 'Paediatric', 'Neonatal', 'OB'];
export type Cert = 'FP-C' | 'CCP-C' | 'CFRN';
export const CERTS: Cert[] = ['FP-C', 'CCP-C', 'CFRN'];
export type Naemt = 'PHTLS' | 'AMLS' | 'TECC' | 'TCCC' | 'EPC' | 'GEMS' | 'AHDR';
export const NAEMT: { id: Naemt; name: string }[] = [
  { id: 'PHTLS', name: 'Prehospital Trauma Life Support' }, { id: 'AMLS', name: 'Advanced Medical Life Support' }, { id: 'TECC', name: 'Tactical Emergency Casualty Care' },
  { id: 'TCCC', name: 'Tactical Combat Casualty Care' }, { id: 'EPC', name: 'Emergency Pediatric Care' }, { id: 'GEMS', name: 'Geriatric Education for EMS' }, { id: 'AHDR', name: 'All Hazards Disaster Response' },
];
export type Kind = 'director' | 'step' | 'workflow';
export type Difficulty = 'core' | 'intermediate' | 'advanced';
export interface Entry {
  id: string; kind: Kind; module: 'vent' | 'abg' | 'labs' | 'lines' | 'neuro' | 'heart' | 'abdomen'; domains: Domain[]; certs: Cert[]; naemt: Naemt[];
  objectives: string[]; sources: string[]; reviewed: string; difficulty: Difficulty; prereq: string[]; protocol?: string;
}
const ALL: Cert[] = ['FP-C', 'CCP-C', 'CFRN'];
const R = '2026-09-29';
const e = (id: string, kind: Kind, module: Entry['module'], domains: Domain[], difficulty: Difficulty, naemt: Naemt[], objectives: string[], sources: string[], prereq: string[] = [], protocol?: string): Entry =>
  ({ id, kind, module, domains, certs: ALL, naemt, objectives, sources, reviewed: R, difficulty, prereq, protocol });

const S = {
  esvsMes: 'ESVS clinical practice guidelines on the management of diseases of the mesenteric arteries and veins (2017)', wses: 'WSES guidelines on adhesive small bowel obstruction (Bologna guidelines, 2017)',
  pals: 'AHA Pediatric Advanced Life Support provider manual (2020)',
  accBleed: 'ACC expert consensus decision pathway on bleeding in patients on oral anticoagulants (JACC 2020)',
  apnoea: 'Benumof — critical haemoglobin desaturation during apnoea (Anesthesiology 1997)', patelApnoea: 'Patel et al. — apnoea-induced hypoxia in healthy paediatric patients (Can J Anaesth 1994)', dasObstetric: 'OAA/DAS guidelines for obstetric difficult and failed intubation (Anaesthesia 2015)',
  cote: 'Coté — A Practice of Anesthesia for Infants and Children', croup: 'Bjornson & Johnson — croup in children (CMAJ 2013)',
  nrp: 'AHA/AAP Neonatal Resuscitation Program and ILCOR neonatal life support consensus (2020)', pphn: 'AHA/ATS guidelines for pediatric pulmonary hypertension (Circulation 2015)',
  pregPhys: 'Soma-Pillay et al. — physiological changes in pregnancy (Cardiovasc J Afr 2016)', asthmaPreg: 'GINA — global strategy for asthma management: asthma in pregnancy',
  arrestPreg: 'AHA scientific statement — cardiac arrest in pregnancy (Circulation 2015)', pph: 'RCOG Green-top Guideline 52 — prevention and management of postpartum haemorrhage', woman: 'WOMAN trial — tranexamic acid for postpartum haemorrhage (Lancet 2017)',
  ards: 'ARDS Network: lower vs traditional tidal volumes (NEJM 2000)', hess: 'Hess & Kacmarek — Essentials of Mechanical Ventilation', west: 'West — Respiratory Physiology: The Essentials',
  guyton: 'Guyton & Hall — Textbook of Medical Physiology', ssc: 'Surviving Sepsis Campaign international guidelines (2021)', berend: 'Berend, de Vries & Gans — physiological approach to acid–base disturbances (NEJM 2014)',
  dka: 'Hyperglycemic crises in adults with diabetes — consensus report (Diabetes Care 2024)', hyperk: 'UK Kidney Association — treatment of acute hyperkalaemia in adults (2020)', na: 'European clinical practice guideline on hyponatraemia (2014)',
  aabb: 'AABB international guidelines for red-cell transfusion (JAMA 2023)', proppr: 'PROPPR trial (JAMA 2015)', crash2: 'CRASH-2 trial (Lancet 2010)', atls: 'ATLS Student Course Manual, 10th ed. (American College of Surgeons)',
  bts: 'BTS guideline for pleural disease (Thorax 2023)', gardner: 'Gardner — dynamic response requirements for direct blood-pressure measurement (Anesthesiology 1981)', michard: 'Michard et al. — pulse-pressure variation and fluid responsiveness (AJRCCM 2000)',
  iabp: 'IABP-SHOCK II trial (NEJM 2012)', asaCvc: 'ASA practice guidelines for central venous access (Anesthesiology 2020)', aseCvc: 'ASE/SCA guidelines for ultrasound-guided vascular cannulation (2011)',
  ais: 'AHA/ASA early management of acute ischaemic stroke — 2019 update', defuse: 'DEFUSE 3 and DAWN thrombectomy trials (NEJM 2018)', ich: 'AHA/ASA guideline for spontaneous intracerebral haemorrhage (2022)', sah: 'AHA/ASA guideline for aneurysmal subarachnoid haemorrhage (2023)',
  btf: 'Brain Trauma Foundation guidelines for severe TBI, 4th ed. (2016)', evd: 'Neurocritical Care Society — insertion and management of external ventricular drains (2016)', aorta: 'ACC/AHA guideline for the diagnosis and management of aortic disease (2022)',
  aaa: 'SVS practice guidelines for abdominal aortic aneurysm (2018)', acep: 'ACEP emergency ultrasound guidelines', blue: 'Lichtenstein & Mezière — the BLUE protocol (Chest 2008)', lus: 'International evidence-based recommendations for point-of-care lung ultrasound (Intensive Care Med 2012)',
  acs: 'ESC guidelines for acute coronary syndromes (2023)', achd: 'AHA/ACC guideline for adults with congenital heart disease (2018)', ismp: 'ISMP safe practice guidelines for adult IV push medications (2015)',
};

export const CATALOG: Entry[] = [
  e('labs-coag', 'director', 'labs', ['Blood', 'Pharmacology', 'Trauma & haemorrhage'], 'intermediate', ['AMLS', 'PHTLS'], ['Explain INR, aPTT, fibrinogen and clot lysis from the clotting system', 'Reverse warfarin with PCC plus vitamin K and explain the rebound without it', 'Reverse heparin with protamine; know LMWH is only partly reversed', 'Use tranexamic acid and fibrinogen replacement in traumatic hyperfibrinolysis'], [S.accBleed, S.crash2], ['hyperk-signature'], 'Reversal agents and doses follow local protocol.'),
  e('abd-solid-organ', 'director', 'abdomen', ['Trauma & haemorrhage', 'Haemodynamics & shock'], 'intermediate', ['PHTLS', 'TECC'], ['Relate injury grade to bleeding rate', 'Classify responders, transient responders and non-responders to blood', 'Match the response to observation, embolisation or surgery'], [S.atls, S.proppr], ['abd-fast'], 'Destination and haemorrhage control follow local trauma protocols.'),
  e('abd-mesenteric', 'director', 'abdomen', ['Renal & metabolic', 'Imaging & POCUS'], 'advanced', ['AMLS', 'GEMS'], ['Recognise pain out of proportion to the examination', 'Read SMA occlusion and bowel-wall changes on CT angiography', 'Explain why a normal lactate does not exclude ischaemia'], [S.esvsMes], []),
  e('abd-obstruction', 'director', 'abdomen', ['Renal & metabolic', 'Imaging & POCUS'], 'core', ['AMLS'], ['Recognise obstruction (dilated loops, air–fluid levels) and the fluid it sequesters', 'Recognise free air on ultrasound and CT', 'Distinguish enteric fluid from blood on a positive scan'], [S.wses], []),
  // ---------------------------------------------------------------- special populations
  e('pop-apnoea', 'director', 'abg', ['Paediatric', 'Neonatal', 'OB', 'Respiratory'], 'core', ['EPC', 'AMLS'], ['Explain where oxygen is stored during apnoea and why pre-oxygenation matters', 'Explain the “cliff” in the saturation curve', 'Predict faster desaturation in infants, children, pregnancy and obesity'], [S.apnoea, S.patelApnoea, S.dasObstetric], []),
  e('peds-shock', 'director', 'lines', ['Paediatric', 'Haemodynamics & shock', 'Trauma & haemorrhage'], 'core', ['EPC', 'PHTLS'], ['Recognise compensated shock in a child from heart rate, pulse pressure and capillary refill', 'Know hypotension (below 70 + 2 × age) is late and bradycardia pre-arrest', 'Resuscitate with measured blood boluses and reassessment'], [S.atls, S.pals], [], 'Paediatric fluid and blood volumes follow local protocol.'),
  e('peds-airway', 'director', 'vent', ['Paediatric', 'Ventilation'], 'core', ['EPC'], ['Apply radius-to-the-fourth-power to airway swelling in infants vs adults', 'Explain why crying worsens obstruction', 'Recognise the endotracheal tube as a resistance and the first thing to check'], [S.cote, S.croup], []),
  e('neo-transition', 'director', 'heart', ['Neonatal', 'Cardiology'], 'intermediate', ['EPC'], ['Describe the change from fetal to newborn circulation', 'Use pre-ductal saturation targets in the first ten minutes', 'Recognise PPHN from pre- and post-ductal saturations and know what lowers pulmonary resistance'], [S.nrp, S.pphn], []),
  e('ob-gas', 'director', 'abg', ['OB', 'Acid–base & labs'], 'core', ['AMLS'], ['Interpret a blood gas against pregnancy normals (PaCO₂ ≈ 30, HCO₃⁻ ≈ 20)', 'Recognise a “normal” PaCO₂ as retention in a pregnant asthmatic'], [S.pregPhys, S.asthmaPreg], ['abg-resp-vs-metabolic']),
  e('ob-circulation', 'director', 'lines', ['OB', 'Haemodynamics & shock', 'Trauma & haemorrhage'], 'intermediate', ['AMLS', 'PHTLS'], ['Explain aortocaval compression and left uterine displacement', 'Use the shock index to recognise postpartum haemorrhage before hypotension', 'Sequence the response to postpartum haemorrhage'], [S.pregPhys, S.arrestPreg, S.pph, S.woman], [], 'Follow local obstetric haemorrhage and maternal resuscitation protocols.'),
  // ---------------------------------------------------------------- Director (signature) lessons
  e('vent-ards-signature', 'director', 'vent', ['Ventilation', 'Respiratory'], 'intermediate', ['AMLS'], ['Explain shunt from collapsed, perfused alveoli', 'Show how PEEP recruits and when it overdistends', 'Set tidal volume and PEEP to keep plateau and driving pressure low'], [S.ards, S.hess], ['eom', 'peep']),
  e('vent-ards-vs-obstruction', 'director', 'vent', ['Ventilation', 'Respiratory'], 'intermediate', ['AMLS'], ['Use inspiratory and expiratory holds to separate compliance from resistance', 'Recognise auto-PEEP and treat it with time to exhale'], [S.hess, S.west], ['rc']),
  e('vent-tension-ptx', 'director', 'vent', ['Ventilation', 'Trauma & haemorrhage'], 'core', ['PHTLS', 'TECC', 'TCCC'], ['Recognise tension on the ventilator (peak and plateau up, hypotension)', 'Link pleural pressure to venous return and obstructive shock', 'Decompress before imaging', 'Read absent sliding, barcode M-mode and the film — and the lung point after decompression'], [S.atls, S.lus, S.blue], [], 'Local protocol decides the decompression site and device.'),
  e('vent-needle', 'director', 'vent', ['Procedures', 'Trauma & haemorrhage'], 'advanced', ['PHTLS', 'TECC', 'TCCC'], ['Choose a decompression site and stay over the rib below', 'Relate chest-wall thickness and catheter length to failure', 'Treat the needle as a bridge to a drain'], [S.atls], ['vent-tension-ptx'], 'Site and catheter length follow local protocol.'),
  e('abg-resp-vs-metabolic', 'director', 'abg', ['Acid–base & labs', 'Respiratory'], 'core', ['AMLS'], ['Separate respiratory from metabolic acidosis on a gas', 'Predict acute and chronic compensation', 'Explain why fixed ventilation removes respiratory compensation'], [S.berend], ['resp']),
  e('abg-dka', 'director', 'abg', ['Renal & metabolic', 'Acid–base & labs'], 'intermediate', ['AMLS'], ['Trace insulin deficiency to ketoacids and an anion gap', 'Explain the potassium paradox (high plasma, low total body)', 'Sequence fluids, potassium and insulin'], [S.dka, S.berend], ['metab']),
  e('hyperk-signature', 'director', 'labs', ['Renal & metabolic', 'Cardiology'], 'core', ['AMLS'], ['Explain how potassium changes the resting membrane potential and the ECG', 'Order stabilise → shift → remove', 'Expect rebound after shifting treatments'], [S.hyperk], ['hyperk']),
  e('lines-shock-states', 'director', 'lines', ['Haemodynamics & shock'], 'core', ['AMLS', 'PHTLS'], ['Recognise distributive, cardiogenic, obstructive and hypovolaemic patterns on an arterial line and CVP', 'Match each to its first treatment'], [S.ssc, S.guyton], ['ln-art', 'ln-cvp']),
  e('lines-oxygen-delivery', 'director', 'lines', ['Haemodynamics & shock', 'Blood'], 'intermediate', ['AMLS'], ['Calculate DO₂ from cardiac output, haemoglobin and saturation', 'Explain why a normal SpO₂ can hide low oxygen delivery', 'Interpret lactate as supply versus demand'], [S.guyton, S.ssc], ['o2path']),
  e('lines-haemorrhage-transfusion', 'director', 'lines', ['Trauma & haemorrhage', 'Blood'], 'core', ['PHTLS', 'TECC', 'TCCC'], ['Explain why haemoglobin is normal early in bleeding', 'Show dilution from crystalloid and the effect of blood', 'Recognise transfusion reactions'], [S.aabb, S.proppr, S.crash2], ['lines-shock-states']),
  e('lines-iabp', 'director', 'lines', ['Devices', 'Cardiology'], 'advanced', [], ['Read a 1:2 arterial trace with balloon assist', 'Identify the four timing errors by shape', 'Explain why late deflation is the most harmful'], [S.iabp], ['ln-art']),
  e('lines-cvc', 'director', 'lines', ['Procedures', 'Imaging & POCUS'], 'advanced', [], ['Tell vein from artery by compression, pulsatility and pressure', 'Keep the needle tip — not the shaft — in view', 'Confirm the wire in the vein before dilating'], [S.asaCvc, S.aseCvc], ['ln-setup']),
  e('neuro-time-is-brain', 'director', 'neuro', ['Neuro'], 'core', ['AMLS'], ['Relate collateral flow and blood pressure to core and penumbra growth', 'Explain why time to reperfusion matters'], [S.ais]),
  e('neuro-time-machine', 'director', 'neuro', ['Neuro', 'Imaging & POCUS'], 'intermediate', ['AMLS'], ['Read CT, CTA and perfusion in a large-vessel occlusion', 'Compare outcomes with early, late and no reperfusion'], [S.ais, S.defuse], ['neuro-time-is-brain']),
  e('neuro-lvo', 'director', 'neuro', ['Neuro'], 'intermediate', ['AMLS'], ['Recognise cortical signs of a large-vessel occlusion', 'Use collaterals and imaging to decide on transfer'], [S.ais, S.defuse], ['neuro-time-is-brain']),
  e('neuro-ich', 'director', 'neuro', ['Neuro'], 'intermediate', ['AMLS'], ['Estimate haematoma volume (ABC/2)', 'Relate blood pressure to haematoma growth'], [S.ich]),
  e('neuro-sah', 'director', 'neuro', ['Neuro'], 'advanced', ['AMLS'], ['Recognise subarachnoid blood on CT', 'Explain delayed ischaemia from vasospasm and the role of nimodipine'], [S.sah]),
  e('neuro-icp', 'director', 'neuro', ['Neuro', 'Devices'], 'advanced', ['PHTLS', 'AMLS'], ['Describe the pressure–volume curve and CPP', 'Recognise uncal herniation and the Cushing response', 'Level and manage an EVD'], [S.btf, S.evd], ['neuro-ich']),
  e('heart-vsd', 'director', 'heart', ['Cardiology', 'Paediatric'], 'advanced', ['EPC'], ['Predict shunt direction from pulmonary and systemic resistance', 'Explain left-ventricular volume load and Eisenmenger physiology'], [S.achd]),
  e('abd-fast', 'director', 'abdomen', ['Trauma & haemorrhage', 'Imaging & POCUS'], 'core', ['PHTLS'], ['Know where free fluid collects when supine', 'Know what FAST cannot see (retroperitoneum, early small bleeds)'], [S.atls, S.acep]),
  e('abd-aaa', 'director', 'abdomen', ['Trauma & haemorrhage', 'Haemodynamics & shock'], 'intermediate', ['AMLS', 'GEMS'], ['Recognise contained vs free AAA rupture', 'Understand why FAST can be negative in retroperitoneal bleeding'], [S.aaa], ['abd-fast']),
  e('abd-dissection', 'director', 'abdomen', ['Cardiology', 'Imaging & POCUS'], 'advanced', ['AMLS'], ['Classify dissection (Stanford A vs B) on CTA', 'Recognise malperfusion', 'Order anti-impulse therapy: rate, then pressure'], [S.aorta]),
  // ---------------------------------------------------------------- step lessons
  e('eom', 'step', 'vent', ['Ventilation'], 'core', [], ['Apply the equation of motion to PIP, plateau and PEEP', 'Measure compliance, resistance and the time constant'], [S.hess]),
  e('rc', 'step', 'vent', ['Ventilation'], 'core', ['AMLS'], ['Use an inspiratory hold to separate resistance from compliance'], [S.hess], ['eom']),
  e('vcpc', 'step', 'vent', ['Ventilation'], 'intermediate', [], ['Compare what volume and pressure control guarantee'], [S.hess], ['eom']),
  e('peep', 'step', 'vent', ['Ventilation', 'Respiratory'], 'intermediate', [], ['Relate PEEP to recruitment, overdistension and oxygenation'], [S.ards, S.hess], ['eom']),
  e('auto', 'step', 'vent', ['Ventilation', 'Respiratory'], 'intermediate', ['AMLS'], ['Detect and measure auto-PEEP', 'Lengthen expiration to reduce it'], [S.hess], ['rc']),
  e('sync', 'step', 'vent', ['Ventilation'], 'advanced', [], ['Recognise triggering and cycling dyssynchrony on waveforms'], [S.hess], ['vcpc']),
  e('o2path', 'step', 'abg', ['Respiratory', 'Blood'], 'core', [], ['Follow oxygen from air to mitochondria', 'Separate PaO₂, saturation and content'], [S.west]),
  e('hypox', 'step', 'abg', ['Respiratory'], 'core', ['AMLS'], ['Distinguish hypoventilation, V/Q mismatch, shunt and dead space'], [S.west], ['o2path']),
  e('resp', 'step', 'abg', ['Acid–base & labs'], 'core', ['AMLS'], ['Relate CO₂ to pH and renal compensation'], [S.berend]),
  e('metab', 'step', 'abg', ['Acid–base & labs'], 'core', ['AMLS'], ['Use the anion gap and respiratory compensation'], [S.berend], ['resp']),
  e('vbg', 'step', 'abg', ['Acid–base & labs'], 'intermediate', [], ['Know when a venous gas can replace an arterial one'], [S.berend], ['resp']),
  e('hyperk', 'step', 'labs', ['Renal & metabolic'], 'core', ['AMLS'], ['Stabilise, shift and remove potassium'], [S.hyperk]),
  e('hypona', 'step', 'labs', ['Renal & metabolic', 'Neuro'], 'intermediate', ['AMLS'], ['Relate sodium to brain-cell volume', 'Avoid overcorrection of chronic hyponatraemia'], [S.na]),
  e('anaemia', 'step', 'labs', ['Blood'], 'core', [], ['Explain why the oximeter cannot see anaemia'], [S.aabb, S.guyton]),
  e('lactate', 'step', 'labs', ['Haemodynamics & shock'], 'core', ['AMLS'], ['Interpret lactate as production versus clearance'], [S.ssc]),
  e('ln-setup', 'step', 'lines', ['Devices'], 'core', [], ['Trace pressure from the vessel to the monitor', 'Level to the phlebostatic axis'], [S.gardner]),
  e('ln-art', 'step', 'lines', ['Haemodynamics & shock', 'Devices'], 'core', [], ['Read the arterial waveform and its dicrotic notch', 'Relate shape to vascular tone'], [S.gardner], ['ln-setup']),
  e('ln-cvp', 'step', 'lines', ['Haemodynamics & shock', 'Devices'], 'intermediate', [], ['Identify a, c, v waves and x, y descents', 'Measure at end-expiration'], [S.guyton], ['ln-setup']),
  e('ln-level', 'step', 'lines', ['Devices'], 'core', [], ['Level and zero correctly; predict the error when you do not'], [S.gardner], ['ln-setup']),
  e('ln-damp', 'step', 'lines', ['Devices'], 'intermediate', [], ['Use the square-wave test to judge damping'], [S.gardner], ['ln-level']),
  e('ln-heartlung', 'step', 'lines', ['Haemodynamics & shock', 'Ventilation'], 'advanced', [], ['Use pulse-pressure variation and know when it misleads', 'Recognise pulsus paradoxus'], [S.michard], ['ln-art']),
  e('ln-disease', 'step', 'lines', ['Cardiology', 'Haemodynamics & shock'], 'advanced', [], ['Recognise valve and rhythm disease on arterial and CVP traces'], [S.guyton], ['ln-cvp']),
  // ---------------------------------------------------------------- workflows (procedures)
  e('wf-chest-tube', 'workflow', 'vent', ['Procedures', 'Trauma & haemorrhage'], 'advanced', ['PHTLS', 'TECC', 'TCCC'], ['Decompress, then place a drain safely in the triangle of safety'], [S.atls, S.bts], ['vent-tension-ptx'], 'Performed within scope and local protocol.'),
  e('wf-drain-check', 'workflow', 'vent', ['Procedures', 'Devices'], 'core', ['PHTLS'], ['Assess a drain from patient to unit', 'Interpret tidaling and bubbling; never clamp a bubbling drain'], [S.bts]),
  e('wf-dopes', 'workflow', 'vent', ['Ventilation', 'Devices'], 'core', ['AMLS'], ['Work through displacement, obstruction, pneumothorax, equipment and stacking'], [S.hess]),
  e('wf-low-pressure', 'workflow', 'vent', ['Ventilation', 'Devices'], 'core', [], ['Find an open circuit or cuff leak from the ventilator numbers'], [S.hess]),
  e('wf-blood', 'workflow', 'lines', ['Blood', 'Procedures'], 'core', ['PHTLS'], ['Give blood safely: identity check, set, monitoring, reactions'], [S.aabb]),
  e('wf-nore', 'workflow', 'lines', ['Pharmacology', 'Haemodynamics & shock'], 'core', ['AMLS'], ['Calculate and start a weight-based vasopressor infusion safely'], [S.ssc, S.ismp]),
  e('wf-push', 'workflow', 'lines', ['Pharmacology'], 'advanced', ['AMLS'], ['Prepare, label and give a push-dose pressor without dilution errors'], [S.ismp]),
  e('wf-artline', 'workflow', 'lines', ['Devices'], 'core', [], ['Level, zero and damping-check an arterial line'], [S.gardner], ['ln-level']),
  e('wf-central-line', 'workflow', 'lines', ['Procedures', 'Imaging & POCUS'], 'advanced', [], ['Place an ultrasound-guided IJ line with vein confirmation before dilation'], [S.asaCvc, S.aseCvc], ['lines-cvc']),
];
export const CATALOG_BY_ID: Record<string, Entry> = Object.fromEntries(CATALOG.map((x) => [x.id, x]));

/* ---------------------------------------------------------------- concepts for challenges → remediation */
export type Target = { lesson: string } | { drug: string };
export const CONCEPTS: Record<string, { name: string; remediate: Target[] }> = {
  'resistance-compliance': { name: 'Resistance vs compliance', remediate: [{ lesson: 'vent-ards-vs-obstruction' }, { lesson: 'rc' }] },
  'auto-peep': { name: 'Auto-PEEP and air trapping', remediate: [{ lesson: 'auto' }, { drug: 'albuterol' }] },
  dyssynchrony: { name: 'Patient–ventilator dyssynchrony', remediate: [{ lesson: 'sync' }] },
  'lung-protection': { name: 'Lung-protective ventilation', remediate: [{ lesson: 'vent-ards-signature' }, { lesson: 'peep' }] },
  'tension-ptx': { name: 'Tension pneumothorax', remediate: [{ lesson: 'vent-tension-ptx' }, { lesson: 'vent-needle' }] },
  'airway-obstruction': { name: 'Tube / airway obstruction', remediate: [{ lesson: 'wf-dopes' }] },
  hypoxaemia: { name: 'Mechanisms of hypoxaemia', remediate: [{ lesson: 'hypox' }, { lesson: 'o2path' }] },
  'resp-acid-base': { name: 'Respiratory acid–base', remediate: [{ lesson: 'abg-resp-vs-metabolic' }, { lesson: 'resp' }] },
  'metabolic-acidosis': { name: 'Metabolic acidosis', remediate: [{ lesson: 'metab' }, { lesson: 'abg-dka' }] },
  dka: { name: 'DKA', remediate: [{ lesson: 'abg-dka' }, { drug: 'insulin' }] },
  potassium: { name: 'Potassium', remediate: [{ lesson: 'hyperk-signature' }, { drug: 'calcium' }] },
  sodium: { name: 'Sodium and water', remediate: [{ lesson: 'hypona' }, { drug: 'hypertonic' }] },
  'o2-content': { name: 'Oxygen content and delivery', remediate: [{ lesson: 'lines-oxygen-delivery' }, { lesson: 'anaemia' }] },
  lactate: { name: 'Lactate', remediate: [{ lesson: 'lactate' }] },
  'shock-states': { name: 'Shock states', remediate: [{ lesson: 'lines-shock-states' }, { drug: 'norepinephrine' }] },
  haemorrhage: { name: 'Haemorrhage and transfusion', remediate: [{ lesson: 'lines-haemorrhage-transfusion' }, { lesson: 'wf-blood' }, { drug: 'txa' }] },
  coagulation: { name: 'Coagulation and reversal', remediate: [{ lesson: 'labs-coag' }, { drug: 'pcc' }, { drug: 'vitamink' }, { drug: 'protamine' }] },
  'ca-mg-phos': { name: 'Calcium, magnesium, phosphate', remediate: [{ drug: 'calcium' }] },
  transducer: { name: 'Transducer levelling, zeroing, damping', remediate: [{ lesson: 'ln-level' }, { lesson: 'ln-damp' }, { lesson: 'wf-artline' }] },
  waveforms: { name: 'Arterial and CVP waveforms', remediate: [{ lesson: 'ln-art' }, { lesson: 'ln-cvp' }, { lesson: 'ln-disease' }] },
  'fluid-responsiveness': { name: 'Fluid responsiveness', remediate: [{ lesson: 'ln-heartlung' }] },
  toxicology: { name: 'Toxicology acid–base', remediate: [{ lesson: 'abg-resp-vs-metabolic' }] },
  resuscitation: { name: 'Arrest and post-arrest physiology', remediate: [{ lesson: 'lines-oxygen-delivery' }, { lesson: 'metab' }] },
  fast: { name: 'FAST exam', remediate: [{ lesson: 'abd-fast' }] },
  'acute-abdomen': { name: 'Obstruction, perforation and ischaemia', remediate: [{ lesson: 'abd-obstruction' }, { lesson: 'abd-mesenteric' }] },
  'solid-organ': { name: 'Solid-organ injury and response to blood', remediate: [{ lesson: 'abd-solid-organ' }, { drug: 'txa' }] },
  aortic: { name: 'Aneurysm and dissection', remediate: [{ lesson: 'abd-aaa' }, { lesson: 'abd-dissection' }] },
  'anti-impulse': { name: 'Anti-impulse therapy', remediate: [{ lesson: 'abd-dissection' }, { drug: 'esmolol' }] },
  'stroke-localisation': { name: 'Stroke localisation', remediate: [{ lesson: 'neuro-time-is-brain' }, { lesson: 'neuro-lvo' }] },
  'stroke-imaging': { name: 'Stroke imaging and reperfusion', remediate: [{ lesson: 'neuro-lvo' }, { lesson: 'neuro-time-machine' }, { drug: 'thrombolytic' }] },
  icp: { name: 'ICP, CPP and herniation', remediate: [{ lesson: 'neuro-icp' }, { drug: 'hypertonic' }, { drug: 'mannitol' }] },
  shunts: { name: 'Shunts and Qp:Qs', remediate: [{ lesson: 'heart-vsd' }] },
  'chest-imaging': { name: 'Chest X-ray and lung ultrasound', remediate: [{ lesson: 'vent-tension-ptx' }] },
  'apnoea-reserve': { name: 'Oxygen reserve during apnoea', remediate: [{ lesson: 'pop-apnoea' }] },
  'paed-shock': { name: 'Shock in children', remediate: [{ lesson: 'peds-shock' }] },
  'paed-airway': { name: 'The paediatric airway', remediate: [{ lesson: 'peds-airway' }, { lesson: 'wf-dopes' }] },
  'newborn-transition': { name: 'Newborn transition and PPHN', remediate: [{ lesson: 'neo-transition' }] },
  'pregnancy-physiology': { name: 'Physiology of pregnancy', remediate: [{ lesson: 'ob-gas' }, { lesson: 'ob-circulation' }] },
  'obstetric-haemorrhage': { name: 'Postpartum haemorrhage', remediate: [{ lesson: 'ob-circulation' }, { drug: 'txa' }] },
};
export const CHALLENGE_CONCEPTS: Record<string, string[]> = {
  // ventilator
  'vent-alarm-ett': ['airway-obstruction', 'resistance-compliance'], 'vent-alarm-ptx': ['tension-ptx'], 'vent-alarm-plug': ['airway-obstruction', 'hypoxaemia'],
  'vent-dys-autopeep': ['auto-peep'], 'vent-dys-fs': ['dyssynchrony'], 'vent-dys-dt': ['dyssynchrony'], 'vent-dys-ie': ['dyssynchrony', 'auto-peep'],
  'vent-dys-pc': ['dyssynchrony'], 'vent-dys-dc': ['dyssynchrony'], 'vent-dys-st': ['dyssynchrony', 'lung-protection'], 'vent-goal-ards': ['lung-protection'], 'vent-goal-asthma': ['auto-peep', 'resistance-compliance'],
  // blood gas
  'abg-opioid': ['resp-acid-base', 'toxicology'], 'abg-dka': ['dka', 'metabolic-acidosis'], 'abg-asthma': ['resp-acid-base', 'auto-peep'], 'abg-sepsis': ['metabolic-acidosis', 'lactate', 'shock-states'],
  'abg-edema': ['hypoxaemia'], 'abg-copd': ['resp-acid-base'], 'abg-salicylate': ['toxicology', 'metabolic-acidosis'], 'abg-arrest': ['resuscitation', 'metabolic-acidosis'], 'abg-rosc': ['resuscitation'],
  // labs
  'lab-k-hd': ['potassium'], 'lab-na-acute': ['sodium'], 'lab-na-chronic': ['sodium'], 'lab-anaemia': ['o2-content'], 'lab-lactate': ['lactate'], 'lab-hypo': ['dka'],
  'lab-inr': ['coagulation'], 'lab-hit': ['coagulation'], 'lab-ca-mtp': ['ca-mg-phos', 'haemorrhage'], 'lab-mg': ['ca-mg-phos'], 'lab-aki': ['potassium', 'metabolic-acidosis'], 'lab-dka': ['dka', 'potassium'], 'lab-phos': ['ca-mg-phos'],
  // lines
  'lines-c-bubble': ['transducer'], 'lines-c-hob': ['transducer'], 'lines-c-openair': ['transducer'], 'lines-c-clot': ['transducer'], 'lines-c-zero': ['transducer'], 'lines-c-bag': ['transducer'],
  'lines-c-migrated': ['waveforms'], 'lines-c-transport': ['transducer'], 'lines-c-read-tamp': ['waveforms', 'shock-states'], 'lines-c-read-chb': ['waveforms'], 'lines-c-read-ar': ['waveforms'], 'lines-c-read-as': ['waveforms'],
  'lines-c-ppv-af': ['fluid-responsiveness'], 'lines-c-goal-fluid': ['haemorrhage', 'shock-states'], 'lines-c-goal-sepsis': ['shock-states'],
  // scene cases (challenge/sceneCases.ts)
  'case-abd-fast-early': ['fast'], 'case-abd-fast-spleen': ['fast', 'haemorrhage', 'solid-organ'], 'case-abd-aaa': ['aortic', 'fast', 'haemorrhage'], 'case-abd-dissect-a': ['aortic', 'anti-impulse'], 'case-abd-dissect-b': ['aortic'], 'case-abd-transient': ['solid-organ', 'haemorrhage'], 'case-abd-mesenteric': ['acute-abdomen'],
  'case-neuro-m1l': ['stroke-localisation', 'stroke-imaging'], 'case-neuro-m1r': ['stroke-localisation'], 'case-neuro-p2r': ['stroke-localisation'], 'case-neuro-basilar': ['stroke-localisation', 'stroke-imaging'],
  'case-neuro-uncal': ['icp'], 'case-neuro-cushing': ['icp'], 'case-neuro-evd': ['icp', 'transducer'],
  'case-heart-vsd': ['shunts'], 'case-heart-asd': ['shunts'], 'case-heart-eisenmenger': ['shunts', 'hypoxaemia'], 'case-heart-pfo': ['shunts'],
  'case-img-cxr-tension': ['chest-imaging', 'tension-ptx'], 'case-img-lus-plug': ['chest-imaging', 'airway-obstruction'], 'case-img-lus-asthma': ['chest-imaging', 'auto-peep'], 'case-img-cxr-edema': ['chest-imaging', 'hypoxaemia'], 'case-img-cxr-ards': ['chest-imaging', 'lung-protection'], 'case-img-mainstem': ['chest-imaging', 'airway-obstruction'],
  'abg-pregnant': ['pregnancy-physiology'], 'abg-pregAsthma': ['pregnancy-physiology', 'resp-acid-base'],
  'case-abg-apnoea-infant': ['apnoea-reserve'], 'case-vent-croup': ['paed-airway'], 'case-heart-pphn': ['newborn-transition'], 'case-heart-pphn-atrial': ['newborn-transition', 'shunts'],
  'case-abg-apnoea-preg': ['apnoea-reserve', 'pregnancy-physiology'], 'case-lines-aortocaval': ['pregnancy-physiology'], 'case-lines-pph': ['obstetric-haemorrhage', 'pregnancy-physiology'], 'case-lines-child-shock': ['paed-shock'],
};
/** Where a challenge lives, for "try it again". */
const CASE_MODULE = { abd: 'abdomen', neuro: 'neuro', heart: 'heart', img: 'vent', vent: 'vent', abg: 'abg', lines: 'lines' } as const;
export type ChallengeModule = 'vent' | 'abg' | 'labs' | 'lines' | 'abdomen' | 'neuro' | 'heart';
export const challengeModule = (id: string): ChallengeModule => (id.startsWith('case-') ? CASE_MODULE[id.split('-')[1] as keyof typeof CASE_MODULE] : id.startsWith('vent-') ? 'vent' : id.startsWith('abg-') ? 'abg' : id.startsWith('lab-') ? 'labs' : 'lines');
