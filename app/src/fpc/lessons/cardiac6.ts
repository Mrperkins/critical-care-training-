/** FP-C VI.16–VI.17: cardiac pharmacology; cardiac monitoring equipment. */
import type { FpcLesson } from '../types';

export const CARDIAC_PHARM: FpcLesson = {
  id: 'fpc-cardiac-pharm', domain: 'cardiac', ref: 'VI.16',
  title: 'Cardiac pharmacology',
  summary: 'Antiarrhythmics, rate control, antiplatelets and anticoagulants, fibrinolytics, vasodilators and ACLS drugs: mechanisms, doses that matter, and the interactions that hurt.',
  objectives: [
    'Select antiarrhythmic and rate-control drugs by rhythm and ventricular function.',
    'Use antithrombotic and fibrinolytic agents safely.',
    'Recall ACLS drug doses and their indications.',
  ],
  sections: [
    {
      id: 'antiarrhythmics', title: 'Antiarrhythmics and rate control', core: true,
      body: [
        'Adenosine: 6 mg rapid IV push with a saline flush, then 12 mg; terminates AV-nodal re-entry and unmasks atrial flutter or tachycardia. Reduce the dose (often to 3 mg) with central line administration, heart transplant recipients, or dipyridamole and carbamazepine; theophylline and caffeine blunt its effect. Avoid in irregular wide-complex tachycardia.',
        'Amiodarone: 300 mg IV push in VF/pulseless VT (then 150 mg); 150 mg over 10 minutes for stable VT, followed by an infusion. It causes hypotension and bradycardia, prolongs the QT, and has many interactions. Lidocaine (1–1.5 mg/kg) is an alternative in arrest. Procainamide (20–50 mg/min to a maximum of 17 mg/kg, or until the QRS widens by 50 % or hypotension) is useful for stable VT and AF with WPW, but avoid in long QT and heart failure.',
        'Rate control: diltiazem (0.25 mg/kg IV over 2 minutes) or metoprolol (2.5–5 mg IV) for AF or flutter with preserved function; avoid both in decompensated heart failure and WPW. Digoxin is slower and used in heart failure. Magnesium treats torsades.',
      ],
      table: {
        caption: 'ACLS drug doses (adult)',
        head: ['Drug', 'Dose', 'Use'],
        rows: [['Epinephrine', '1 mg IV/IO every 3–5 min', 'Cardiac arrest'], ['Amiodarone', '300 mg, then 150 mg', 'VF/pVT refractory to shocks'], ['Lidocaine', '1–1.5 mg/kg, then 0.5–0.75 mg/kg', 'Alternative to amiodarone'], ['Adenosine', '6 mg, then 12 mg rapid push', 'Stable regular narrow SVT'], ['Atropine', '1 mg every 3–5 min (max 3 mg)', 'Symptomatic bradycardia'], ['Magnesium', '1–2 g IV', 'Torsades'], ['Calcium chloride', '1 g IV', 'Hyperkalaemia, CCB toxicity']],
      },
    },
    {
      id: 'antithrombotics', title: 'Antiplatelets, anticoagulants and fibrinolytics', core: true,
      body: [
        'Aspirin irreversibly inhibits cyclooxygenase in platelets. P2Y12 inhibitors (clopidogrel, ticagrelor, prasugrel) block ADP-mediated activation; prasugrel is avoided in prior stroke or TIA. Glycoprotein IIb/IIIa inhibitors are used selectively in the cath lab.',
        'Unfractionated heparin (weight-based bolus and infusion, monitored by aPTT or anti-Xa; reversible with protamine) suits patients who may need procedures or have renal failure. Enoxaparin is given subcutaneously or IV, renally cleared and partially reversed by protamine. Bivalirudin is a direct thrombin inhibitor used during PCI.',
        'Fibrinolytics (alteplase, reteplase, tenecteplase) convert plasminogen to plasmin to dissolve fibrin. Tenecteplase is given as a single weight-based bolus — convenient in transport. Monitor for bleeding, especially intracranial (sudden headache, neurological change, vomiting): stop anticoagulants, and give cryoprecipitate and an antifibrinolytic per protocol.',
      ],
    },
    {
      id: 'vasodilators', title: 'Vasodilators, inotropes and others', core: true,
      body: [
        'Nitroglycerin reduces preload (and afterload at high doses) and relieves ischaemic pain; avoid with hypotension, RV infarction, recent PDE-5 inhibitors and severe aortic stenosis. Morphine is reserved for pain refractory to nitrates. Beta-blockers reduce myocardial oxygen demand but are avoided early when heart failure, low output or high shock risk exist. ACE inhibitors and statins are started in hospital.',
        'Inotropes and vasopressors are covered in the treatment modalities and cardiogenic shock lessons; remember the principle — vasopressors for low SVR, inotropes for low contractility, both when both fail.',
      ],
      example: {
        case: 'A patient with AF at 158 and EF 20 % with mild congestion, BP 104/68.',
        steps: ['Avoid diltiazem (negative inotrope in severe HFrEF).', 'Amiodarone (150 mg over 10 min then infusion) or digoxin for rate control; cardiovert if unstable.', 'Treat congestion; consider anticoagulation implications.'],
      },
    },
    {
      id: 'case', title: 'Transport case: lysis on the way',
      body: ['A remote clinic with no PCI access within 120 minutes. Anterior STEMI, onset 70 minutes ago, 78 kg, no contraindications. Tenecteplase has been given. Twenty minutes into the flight, the patient develops accelerated idioventricular rhythm at 85 with BP 118/70 and decreasing chest pain.'],
      example: { case: 'What does it mean and what do you do?', steps: [
        'Accelerated idioventricular rhythm after lysis commonly signals reperfusion; it is usually benign and self-limiting.',
        'Do not treat it with antiarrhythmics unless haemodynamically unstable.',
        'Recheck a 12-lead ECG at 60–90 minutes for ST resolution.',
        'Continue anticoagulation per protocol; watch for bleeding; hand over timing of lysis and reperfusion signs.',
      ] },
    },
  ],
  keyPoints: [
    'Adenosine 6 then 12 mg rapid push; reduce in transplant and central lines; avoid irregular wide-complex rhythms.',
    'Amiodarone 300/150 in arrest; 150 mg over 10 min for stable VT.',
    'Procainamide for AF with WPW; avoid AV nodal blockers.',
    'Fibrinolytics: watch for intracranial haemorrhage; tenecteplase is a single bolus.',
    'No nitrates with hypotension, RV infarction, PDE-5 use or severe AS.',
  ],
  pearls: ['Caffeine and theophylline blunt adenosine.', 'AIVR after lysis is a reperfusion sign — leave it alone.'],
  pitfalls: ['Diltiazem in severe HFrEF.', 'Prasugrel in a patient with prior stroke.'],
  live: [{ id: 'labs-coag', label: 'Reversing anticoagulation' }, { id: 'moa-nitroglycerin', label: 'Nitroglycerin: mechanism' }, { id: 'moa-esmolol', label: 'Esmolol: mechanism' }],
  questions: [
    { q: 'Adenosine initial dose:', options: ['3 mg slow', '6 mg rapid push with flush', '12 mg over 2 min', '0.25 mg/kg'], answer: 1, why: 'Very short half-life.' },
    { q: 'Adenosine dose should be reduced in:', options: ['Asthma', 'Heart transplant recipients', 'Children', 'Hypertension'], answer: 1, why: 'Denervation hypersensitivity.' },
    { q: 'A substance that blunts adenosine:', options: ['Dipyridamole', 'Caffeine', 'Carbamazepine', 'Amiodarone'], answer: 1, why: 'Adenosine receptor antagonist.' },
    { q: 'Amiodarone dose in VF after the third shock:', options: ['150 mg', '300 mg', '1 g', '50 mg'], answer: 1, why: 'Then 150 mg.' },
    { q: 'Drug for stable AF with WPW:', options: ['Diltiazem', 'Procainamide', 'Digoxin', 'Adenosine'], answer: 1, why: 'Slows accessory pathway.' },
    { q: 'Procainamide end-points include:', options: ['HR < 60', 'QRS widening by 50 % or hypotension', 'Pain relief', 'Normal QT'], answer: 1, why: 'Stop for toxicity signs.' },
    { q: 'Tenecteplase is given as:', options: ['Infusion over 3 h', 'Single weight-based bolus', 'Oral tablet', 'Subcutaneously'], answer: 1, why: 'Convenient for transport.' },
    { q: 'Sudden headache and vomiting after fibrinolysis suggests:', options: ['Reperfusion', 'Intracranial haemorrhage', 'Migraine only', 'Hypoglycaemia'], answer: 1, why: 'Stop anticoagulants; image urgently.' },
    { q: 'Prasugrel is contraindicated with:', options: ['Diabetes', 'Prior stroke or TIA', 'Age 50', 'Hypertension'], answer: 1, why: 'Higher bleeding risk.' },
    { q: 'Aspirin works by:', options: ['P2Y12 block', 'Irreversible COX inhibition', 'Thrombin inhibition', 'Plasminogen activation'], answer: 1, why: 'Thromboxane reduction.' },
    { q: 'Heparin reversal agent:', options: ['Vitamin K', 'Protamine', 'Idarucizumab', 'Naloxone'], answer: 1, why: 'Binds heparin.' },
    { q: 'Accelerated idioventricular rhythm after lysis should usually be:', options: ['Treated with amiodarone', 'Observed — a reperfusion sign', 'Cardioverted', 'Treated with lidocaine'], answer: 1, why: 'Usually benign.' },
    { q: 'Calcium chloride is indicated in:', options: ['Hypercalcaemia', 'Hyperkalaemia and CCB toxicity', 'Digoxin effect', 'Asystole routinely'], answer: 1, why: 'Membrane stabilisation; CCB reversal.' },
    { q: 'Diltiazem IV dose for AF rate control:', options: ['0.25 mg/kg over 2 min', '5 mg/kg', '1 g', '0.01 mg/kg'], answer: 0, why: 'Standard initial dose.' },
    { q: 'Nitroglycerin is contraindicated in:', options: ['Pulmonary oedema with HTN', 'Severe aortic stenosis', 'Angina', 'Hypertensive emergency'], answer: 1, why: 'Preload-dependent outflow obstruction.' },
  ],
  sources: [
    { title: 'AHA guidelines for CPR and ECC: adult ALS drug therapy', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines' },
    { title: 'StatPearls: Adenosine', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Adenosine+StatPearls' },
  ],
};

export const CARDIAC_MONITOR: FpcLesson = {
  id: 'fpc-cardiac-monitor', domain: 'cardiac', ref: 'VI.17',
  title: 'Cardiac monitoring equipment',
  summary: 'ECG monitoring and lead placement, non-invasive and invasive blood pressure, pulse oximetry, capnography and cardiac output monitoring — what each measures, how it fails in flight, and how to troubleshoot.',
  objectives: [
    'Place ECG leads and acquire a diagnostic 12-lead in the field.',
    'Recognise artefact and measurement limits of NIBP, SpO₂ and invasive monitoring.',
    'Choose monitoring appropriate to the patient and transport environment.',
  ],
  sections: [
    {
      id: 'ecg', title: 'ECG monitoring', core: true,
      body: [
        'Three- or five-lead monitoring detects rhythm; a 12-lead is needed for ischaemia. Limb electrodes go on the limbs or torso near the shoulders and hips (torso placement changes some voltages); precordial leads: V1 4th intercostal space right sternal border, V2 4th left, V4 5th intercostal space mid-clavicular, V3 between V2 and V4, V5 anterior axillary line level with V4, V6 mid-axillary line level with V4. Right-sided V4R mirrors V4 on the right; posterior V7–V9 continue from V6 around to the back at the same level.',
        'Artefact from vibration, shivering, movement and electrical interference mimics arrhythmias. Check the patient (pulse, perfusion) before treating a monitor rhythm. Good skin preparation, fresh electrodes and securing leads reduce artefact; monitor filters reduce noise but distort ST segments — use diagnostic mode for 12-leads.',
      ],
    },
    {
      id: 'bp', title: 'Blood pressure', core: true,
      body: [
        'Oscillometric non-invasive BP measures MAP most accurately and derives systolic and diastolic values. It fails with vibration, arrhythmias, severe hypotension, shivering and wrong cuff size: a cuff too small reads falsely high, too large falsely low (the bladder should encircle about 80 % of the arm, width about 40 % of the circumference). Frequent cycling causes discomfort and skin injury.',
        'Arterial lines give beat-to-beat pressure and are preferred for unstable patients, vasoactive infusions and long transports where cuffs struggle. They must be levelled to the phlebostatic axis, zeroed, and checked with a fast-flush test. Compare with a cuff periodically; trust the MAP when systolic values differ.',
      ],
    },
    {
      id: 'spo2', title: 'Pulse oximetry and capnography', core: true,
      body: [
        'Pulse oximetry compares red and infrared absorption to estimate oxygen saturation. It fails with poor perfusion, cold extremities, motion, nail polish, ambient light and dyshaemoglobins: carbon monoxide reads falsely normal, and methaemoglobinaemia drives readings toward about 85 %. Accuracy falls below about 80 %, and studies show overestimation in patients with darker skin pigmentation — corroborate with blood gases in critical decisions. The plethysmographic waveform tells you whether the signal is real.',
        'Capnography is covered in detail in the airway domain; in cardiac care, EtCO₂ reflects pulmonary blood flow, so it tracks CPR quality, signals ROSC, and falls with low cardiac output.',
      ],
    },
    {
      id: 'advanced', title: 'Advanced monitoring',
      body: [
        'Cardiac output monitors (pulse-contour analysis from an arterial line, thermodilution with a PA catheter, Doppler-based devices) estimate stroke volume and output and support fluid-responsiveness testing. Central venous oxygen saturation (normal about 65–75 %) reflects the balance between delivery and consumption. Near-infrared spectroscopy estimates regional tissue oxygenation, mostly in paediatric and cardiac surgical patients.',
        'Every monitor needs power: check batteries, carry spares, and know the aircraft\'s power supply. Alarm limits should be set appropriately for each patient to avoid alarm fatigue while catching real deterioration.',
      ],
      example: {
        case: 'In flight the monitor shows VF but the patient is talking.',
        steps: ['Check the patient first: talking means perfusing — artefact.', 'Check leads and electrodes; vibration and loose electrodes mimic VF.', 'Confirm with pulse, SpO₂ waveform and arterial line.', 'Never defibrillate a patient with a pulse.'],
      },
    },
    {
      id: 'case', title: 'Transport case: discordant numbers',
      body: ['A septic patient on norepinephrine: cuff BP 74/40 at the wrist, arterial line 102/58 (MAP 72), SpO₂ reading 84 % with a flat, irregular waveform while the patient is pink and alert.'],
      example: { case: 'Which numbers do you trust?', steps: [
        'Cuff at the wrist on a vasoconstricted patient in a vibrating aircraft is least reliable; check the arterial line\'s level, zero and damping, then trust its MAP.',
        'A poor pleth waveform means an unreliable SpO₂ — warm the hand, try an ear or forehead probe, check a blood gas if needed.',
        'Don\'t escalate vasopressors based on an artefactual cuff reading.',
      ] },
    },
  ],
  keyPoints: [
    'V1–V2 4th ICS either side of the sternum; V4 5th ICS MCL; V5–V6 level with V4; V4R and V7–V9 for RV/posterior.',
    'Treat the patient, not the monitor: artefact mimics VF and VT.',
    'Cuff too small reads high; oscillometric MAP is most accurate; arterial lines for unstable patients.',
    'SpO₂ fails with poor perfusion, motion, CO (falsely normal), MetHb (~85 %), and can overestimate in darker skin.',
    'Check power, batteries and alarm limits before every flight.',
  ],
  pearls: ['The pleth waveform validates the SpO₂ number.', 'Use diagnostic filter mode for 12-leads.'],
  pitfalls: ['Defibrillating artefact.', 'Wrong cuff size on an obese arm.'],
  live: [{ id: 'ln-art', label: 'Reading the arterial waveform' }, { id: 'ln-damp', label: 'Damping and the square-wave test' }],
  questions: [
    { q: 'V1 is placed at:', options: ['5th ICS left MCL', '4th ICS right sternal border', '2nd ICS left', 'Mid-axillary 5th ICS'], answer: 1, why: 'Standard placement.' },
    { q: 'V4 is placed at:', options: ['4th ICS left sternal border', '5th ICS mid-clavicular line', 'Anterior axillary line', 'Right side'], answer: 1, why: 'Standard placement.' },
    { q: 'Leads used to detect posterior MI:', options: ['V4R', 'V7–V9', 'aVR', 'Lead III'], answer: 1, why: 'Posterior chest leads.' },
    { q: 'A BP cuff that is too small reads:', options: ['Falsely low', 'Falsely high', 'Accurately', 'Zero'], answer: 1, why: 'Requires more pressure to occlude.' },
    { q: 'Oscillometric BP measures most accurately:', options: ['Systolic', 'Diastolic', 'MAP', 'Pulse pressure'], answer: 2, why: 'Maximum oscillation equals MAP.' },
    { q: 'SpO₂ in carbon monoxide poisoning reads:', options: ['Falsely low', 'Falsely normal or high', 'Accurately', 'Zero'], answer: 1, why: 'COHb mistaken for O₂Hb.' },
    { q: 'Methaemoglobinaemia drives SpO₂ toward:', options: ['100 %', '85 %', '50 %', '70 %'], answer: 1, why: 'Characteristic reading.' },
    { q: 'Pulse oximetry may overestimate saturation in:', options: ['Patients with darker skin pigmentation', 'Children only', 'Hyperthermia', 'Anaemia only'], answer: 0, why: 'Documented bias — confirm with gases.' },
    { q: 'The monitor shows VF but the patient is talking. You should:', options: ['Defibrillate', 'Assess the patient and check leads — artefact', 'Give amiodarone', 'Start CPR'], answer: 1, why: 'Treat the patient.' },
    { q: 'Monitor filters can distort:', options: ['Heart rate', 'ST segments', 'P waves only', 'Nothing'], answer: 1, why: 'Use diagnostic mode for 12-leads.' },
    { q: 'Normal ScvO₂:', options: ['30–40 %', '65–75 %', '95–100 %', '50 %'], answer: 1, why: 'Balance of delivery and consumption.' },
    { q: 'Cuff bladder should encircle about:', options: ['40 % of the arm', '80 % of the arm', '100 % twice', '20 %'], answer: 1, why: 'Proper sizing.' },
    { q: 'A flat, irregular pleth waveform means:', options: ['Accurate SpO₂', 'Unreliable SpO₂', 'Hyperoxia', 'Normal'], answer: 1, why: 'Poor signal quality.' },
    { q: 'V6 is placed at:', options: ['Anterior axillary line', 'Mid-axillary line level with V4', 'Posterior axillary', '4th ICS sternal'], answer: 1, why: 'Standard placement.' },
    { q: 'In discordant arterial and cuff readings, trust:', options: ['The lowest systolic', 'The arterial MAP after checking level, zero and damping', 'The cuff always', 'Neither'], answer: 1, why: 'Verified invasive MAP is most reliable.' },
  ],
  sources: [
    { title: 'AHA scientific statement: blood pressure measurement (2019)', url: 'https://www.ahajournals.org/doi/10.1161/HYP.0000000000000087' },
    { title: 'Sjoding MW et al. Racial bias in pulse oximetry. NEJM (2020)', url: 'https://www.nejm.org/doi/full/10.1056/NEJMc2029240' },
  ],
};
