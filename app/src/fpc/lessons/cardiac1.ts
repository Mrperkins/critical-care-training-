/** FP-C VI.1, VI.2, VI.13: multi-lead ECG interpretation; cardiac anatomy; electrophysiology. */
import type { FpcLesson } from '../types';

export const TWELVE_LEAD: FpcLesson = {
  id: 'fpc-12-lead', domain: 'cardiac', ref: 'VI.1',
  title: 'Multi-lead ECG interpretation',
  summary: 'A systematic 12-lead read, localising STEMI and its equivalents, recognising mimics, and the findings — blocks, axis, QT, Brugada, WPW — that change transport decisions.',
  objectives: [
    'Read a 12-lead ECG in a fixed order: rate, rhythm, axis, intervals, morphology, ST–T.',
    'Localise STEMI to a coronary territory and recognise STEMI equivalents.',
    'Identify high-risk non-ischaemic patterns: Brugada, WPW, long QT, hyperkalaemia.',
  ],
  sections: [
    {
      id: 'system', title: 'A fixed order', core: true,
      body: [
        'Read every ECG the same way so nothing is missed. Rate: 300 divided by the number of large boxes between R waves, or count complexes in 10 seconds and multiply by six. Rhythm: regular or irregular, P before every QRS, QRS after every P. Axis: normal if leads I and aVF are both positive; left axis deviation if I is positive and aVF negative (with lead II negative); right axis deviation if I is negative and aVF positive.',
        'Intervals: PR 120–200 ms; QRS under 120 ms; QTc under about 450 ms in men and 460–470 in women (above 500 is high risk for torsades). Then morphology: P waves, Q waves, QRS width and pattern (bundle branch blocks), R-wave progression, and finally the ST segments and T waves.',
      ],
      table: {
        caption: 'Normal intervals',
        head: ['Interval', 'Normal', 'Abnormal means'],
        rows: [['PR', '120–200 ms', '< 120: pre-excitation; > 200: first-degree block'], ['QRS', '< 120 ms', '≥ 120: bundle branch block, ventricular rhythm, hyperkalaemia, Na-channel blockade'], ['QTc', '< 450 (M) / < 460 (F) ms', '> 500 ms: torsades risk']],
      },
    },
    {
      id: 'stemi', title: 'Localising STEMI', core: true,
      body: [
        'STEMI criteria (in the absence of LVH or LBBB): new ST elevation at the J point in two contiguous leads of at least 1 mm, except in V2–V3 where the thresholds are 2 mm in men 40 or older, 2.5 mm in men under 40, and 1.5 mm in women. Reciprocal ST depression in the opposite territory increases specificity.',
        'Inferior STEMI (II, III, aVF) is usually the right coronary artery (or circumflex in left-dominant systems); obtain right-sided leads (V4R) to look for right-ventricular infarction, which makes the patient preload-dependent — avoid nitrates and give fluid for hypotension. ST elevation in III greater than II and reciprocal depression in I and aVL favour the RCA. Anterior STEMI (V1–V4) is the LAD; lateral (I, aVL, V5–V6) the circumflex or diagonal. Posterior infarction shows ST depression with tall R waves in V1–V3; confirm with posterior leads V7–V9 (ST elevation ≥ 0.5 mm).',
      ],
      table: {
        caption: 'Territories',
        head: ['Leads', 'Territory', 'Usual artery'],
        rows: [['II, III, aVF', 'Inferior', 'RCA (or LCx)'], ['V1–V2', 'Septal', 'LAD'], ['V3–V4', 'Anterior', 'LAD'], ['I, aVL, V5–V6', 'Lateral', 'LCx / diagonal'], ['V7–V9 (ST depression V1–V3)', 'Posterior', 'RCA / LCx'], ['V4R', 'Right ventricle', 'Proximal RCA']],
      },
    },
    {
      id: 'equivalents', title: 'STEMI equivalents and mimics', core: true,
      body: [
        'Some occlusions do not meet classic criteria. Widespread ST depression with ST elevation in aVR suggests left main or multivessel ischaemia. De Winter T waves — upsloping ST depression with tall, symmetric T waves in the precordial leads — indicate proximal LAD occlusion. Wellens pattern (deep symmetric or biphasic T waves in V2–V3 in a pain-free patient) warns of critical proximal LAD stenosis. In LBBB or a paced rhythm, the Sgarbossa criteria (concordant ST elevation ≥ 1 mm, concordant ST depression in V1–V3, or excessively discordant elevation) identify acute occlusion.',
        'Mimics include early repolarisation (young patients, notched J points, stable), pericarditis (diffuse concave ST elevation with PR depression, PR elevation in aVR), left ventricular hypertrophy, left bundle branch block, left ventricular aneurysm (persistent ST elevation with Q waves after an old MI), Brugada pattern and hyperkalaemia. Takotsubo cardiomyopathy can mimic anterior STEMI and is diagnosed after angiography.',
      ],
    },
    {
      id: 'highrisk', title: 'Other high-risk patterns',
      body: [
        'Wolff–Parkinson–White: short PR, delta wave and wide QRS. Atrial fibrillation with WPW produces an irregular, very fast, wide-complex tachycardia with changing QRS shapes; AV nodal blockers (adenosine, beta-blockers, calcium-channel blockers, digoxin) can accelerate conduction down the accessory pathway into ventricular fibrillation. Treat unstable patients with synchronised cardioversion, stable ones with procainamide per protocol.',
        'Brugada pattern (coved ST elevation of at least 2 mm in V1–V2 with T-wave inversion) predisposes to sudden death, especially with fever; treat fever and avoid sodium-channel blockers. Long QT (congenital or drug-induced) predisposes to torsades. Hyperkalaemia progresses from peaked T waves to wide QRS and sine waves. Bifascicular block with syncope may herald complete heart block.',
      ],
    },
    {
      id: 'case', title: 'Transport case: inferior STEMI with hypotension',
      body: ['A 61-year-old with chest pain: ST elevation 3 mm in III, 2 mm in II and aVF, ST depression in I and aVL. BP 84/52, HR 54, lungs clear. Referring team gave nitroglycerin and BP fell.'],
      example: { case: 'Interpret and manage.', steps: [
        'Inferior STEMI with III > II and reciprocal changes in I/aVL: RCA occlusion likely.',
        'Hypotension after nitrates with clear lungs: suspect RV infarction — obtain V4R (ST elevation ≥ 1 mm supports it).',
        'Stop nitrates; give fluid boluses cautiously to support RV preload; atropine or pacing for symptomatic bradycardia (AV block is common with RCA occlusion).',
        'Antiplatelet and anticoagulation per protocol; direct to a PCI centre with pre-activation of the cath lab.',
      ] },
    },
  ],
  keyPoints: [
    'Read every ECG in order: rate, rhythm, axis, intervals, morphology, ST–T.',
    'STEMI: ≥ 1 mm in two contiguous leads (higher thresholds in V2–V3); look for reciprocal change.',
    'Inferior STEMI: get V4R; RV infarction is preload-dependent — no nitrates, give fluid.',
    'Equivalents: aVR elevation with diffuse depression, de Winter, posterior (V7–V9), Sgarbossa in LBBB.',
    'AF with WPW: avoid AV nodal blockers; cardiovert or procainamide.',
  ],
  pearls: ['ST depression in V1–V3 with tall R waves may be a posterior STEMI.', 'Fever unmasks Brugada.'],
  pitfalls: ['Nitrates in right-ventricular infarction.', 'Adenosine for irregular wide-complex tachycardia.'],
  questions: [
    { q: 'ST elevation in II, III and aVF localises to the:', options: ['Anterior wall', 'Inferior wall', 'Lateral wall', 'Septum'], answer: 1, why: 'Inferior leads.' },
    { q: 'An inferior STEMI patient becomes hypotensive after nitroglycerin with clear lungs. Next step:', options: ['More nitroglycerin', 'Right-sided leads and fluid', 'Furosemide', 'Morphine'], answer: 1, why: 'RV infarction is preload-dependent.' },
    { q: 'ST depression V1–V3 with tall R waves suggests:', options: ['Anterior ischaemia only', 'Posterior STEMI', 'RBBB', 'Normal variant'], answer: 1, why: 'Confirm with V7–V9.' },
    { q: 'Diffuse ST depression with ST elevation in aVR suggests:', options: ['Pericarditis', 'Left main or multivessel ischaemia', 'Early repolarisation', 'Hypokalaemia'], answer: 1, why: 'Global subendocardial ischaemia.' },
    { q: 'De Winter T waves indicate:', options: ['RCA occlusion', 'Proximal LAD occlusion', 'Pericarditis', 'Hyperkalaemia'], answer: 1, why: 'STEMI equivalent.' },
    { q: 'Diffuse concave ST elevation with PR depression suggests:', options: ['STEMI', 'Pericarditis', 'Brugada', 'LVH'], answer: 1, why: 'Classic pericarditis pattern.' },
    { q: 'A 19-year-old collapses while sprinting; the ECG shows marked LVH with deep, narrow Q waves in the lateral leads. Most likely:', options: ['Pericarditis', 'Hypertrophic cardiomyopathy', 'Mitral stenosis', 'Brugada syndrome'], answer: 1, why: 'HCM causes septal hypertrophy and sudden death with exertion in the young.' },
    { q: 'Normal axis is:', options: ['I negative, aVF positive', 'I and aVF positive', 'I positive, aVF negative', 'Both negative'], answer: 1, why: 'Both positive.' },
    { q: 'QTc associated with high torsades risk:', options: ['> 380 ms', '> 500 ms', '< 400 ms', '> 300 ms'], answer: 1, why: 'Above 500 ms.' },
    { q: 'Short PR and delta wave indicate:', options: ['LGL', 'WPW', 'First-degree block', 'Brugada'], answer: 1, why: 'Pre-excitation.' },
    { q: 'Irregular, very fast wide-complex tachycardia with varying QRS in a stable patient. Avoid:', options: ['Procainamide', 'Adenosine and AV nodal blockers', 'Cardioversion', 'Expert consult'], answer: 1, why: 'Possible AF with WPW.' },
    { q: 'Sgarbossa criteria are used in:', options: ['RBBB', 'LBBB or paced rhythm', 'Normal ECG', 'Pericarditis'], answer: 1, why: 'Identify occlusion despite LBBB.' },
    { q: 'ST elevation threshold in V2–V3 for women:', options: ['0.5 mm', '1.5 mm', '2.5 mm', '4 mm'], answer: 1, why: 'Sex-specific thresholds.' },
    { q: 'Coved ST elevation in V1–V2 with fever suggests:', options: ['Brugada pattern', 'Pericarditis', 'Anterior STEMI', 'Hyperkalaemia'], answer: 0, why: 'Fever unmasks Brugada.' },
    { q: 'Lateral STEMI involves leads:', options: ['II, III, aVF', 'I, aVL, V5–V6', 'V1–V2', 'aVR only'], answer: 1, why: 'Lateral territory.' },
  ],
  sources: [
    { title: 'Fourth Universal Definition of Myocardial Infarction (2018)', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000617' },
    { title: 'LITFL ECG Library', url: 'https://litfl.com/ecg-library/' },
  ],
};

export const CARDIAC_ANATOMY: FpcLesson = {
  id: 'fpc-cardiac-anatomy', domain: 'cardiac', ref: 'VI.2',
  title: 'Cardiac anatomy and the coronary circulation',
  summary: 'Chambers, valves, coronary arteries and dominance, the conduction system, and the physiology of the cardiac cycle, preload, afterload and contractility.',
  objectives: [
    'Map coronary arteries to myocardial territories and the conduction system.',
    'Explain the cardiac cycle and the determinants of stroke volume.',
    'Relate anatomy to clinical consequences of infarction and valve disease.',
  ],
  sections: [
    {
      id: 'coronaries', title: 'Coronary arteries and dominance', core: true,
      body: [
        'The left main coronary artery divides into the left anterior descending (LAD), which supplies the anterior wall, the anterior two-thirds of the septum and the apex, and the circumflex (LCx), which supplies the lateral and, in some, posterior walls. The right coronary artery (RCA) supplies the right ventricle, the inferior wall in most people, and the SA node in about 60 % and the AV node in about 80–90 %.',
        'Dominance is defined by which artery gives the posterior descending artery: the RCA in about 70–85 % (right-dominant), the circumflex in about 5–10 % (left-dominant), and both in the rest (co-dominant). Coronary flow to the left ventricle occurs mainly in diastole, when the muscle relaxes; tachycardia shortens diastole and reduces perfusion — one reason heart rate control matters in ischaemia.',
      ],
      table: {
        caption: 'Infarct location and complications',
        head: ['Artery', 'Territory', 'Watch for'],
        rows: [['LAD', 'Anterior wall, septum, apex', 'Pump failure, Mobitz II/CHB (infranodal), LV thrombus'], ['RCA', 'Inferior wall, RV, SA/AV nodes', 'Bradycardia, AV block (nodal), RV infarction'], ['LCx', 'Lateral (± posterior)', 'Often electrically subtle; papillary muscle rupture'], ['Left main', 'Most of the LV', 'Cardiogenic shock, arrest']],
      },
    },
    {
      id: 'chambers', title: 'Chambers, valves and the cycle', core: true,
      body: [
        'Deoxygenated blood returns to the right atrium, passes the tricuspid valve into the right ventricle and the pulmonary valve into the pulmonary artery. Oxygenated blood returns to the left atrium, passes the mitral valve into the left ventricle and the aortic valve into the aorta. The left ventricle generates systemic pressures (about 120/10 mmHg); the right, pulmonary pressures (about 25/5).',
        'In systole the ventricles contract, the AV valves close (S1), pressure rises until the semilunar valves open, and blood is ejected. In diastole the semilunar valves close (S2), the ventricles relax, the AV valves open and the ventricles fill — passively at first, then with atrial contraction (the "atrial kick", up to 20–30 % of filling, lost in atrial fibrillation).',
        'Stroke volume depends on preload (filling, the stretch on the fibres — Frank–Starling), afterload (the resistance the ventricle ejects against) and contractility. Cardiac output equals stroke volume times heart rate; mean arterial pressure equals cardiac output times systemic vascular resistance (plus CVP).',
      ],
    },
    {
      id: 'valves', title: 'Valve lesions in transport',
      body: [
        'Aortic stenosis: fixed outflow obstruction, so the patient depends on preload and on afterload to perfuse the coronaries; vasodilators and tachycardia are poorly tolerated. Avoid hypotension. Mitral stenosis: filling depends on time, so tachycardia and atrial fibrillation cause pulmonary congestion. Acute mitral regurgitation (papillary muscle rupture after MI) causes sudden pulmonary oedema and shock; afterload reduction and urgent surgery help. Acute aortic regurgitation (dissection, endocarditis) causes shock with a wide pulse pressure; tachycardia shortens regurgitation time.',
      ],
    },
    {
      id: 'conduction', title: 'The conduction system', core: true,
      body: [
        'The sinoatrial node, high in the right atrium, sets the rate (60–100). The impulse crosses the atria to the atrioventricular node, which delays conduction (the PR interval) to allow ventricular filling. It then passes the bundle of His, divides into the right and left bundle branches (the left into anterior and posterior fascicles), and spreads through the Purkinje fibres.',
        'Intrinsic escape rates fall the lower the pacemaker: AV junction 40–60, ventricles 20–40. Block above or at the AV node (often RCA, inferior MI) tends to produce narrow escape rhythms that respond to atropine; block below the node (often LAD, anterior MI) produces wide escape rhythms that are unreliable and need pacing.',
      ],
      example: {
        case: 'Anterior STEMI with new RBBB and left anterior fascicular block, HR 76, BP 110/70.',
        steps: ['Bifascicular block from proximal LAD involvement.', 'High risk of progression to complete heart block with a wide, unstable escape.', 'Apply transcutaneous pacing pads before transport; atropine will not help infranodal block.', 'Expedite reperfusion.'],
      },
    },
    {
      id: 'case', title: 'Transport case: the papillary muscle',
      body: ['Five days after an inferior-posterior MI, a 70-year-old develops sudden severe dyspnoea, SpO₂ 82 %, BP 78/50, and a new loud holosystolic murmur at the apex.'],
      example: { case: 'What happened and how do you transport?', steps: [
        'Acute severe mitral regurgitation from papillary muscle rupture (the posteromedial papillary muscle has a single blood supply, often from the RCA/PDA).',
        'Support oxygenation with NIV or intubation; afterload reduction if BP allows, otherwise inotropes and vasopressors; an intra-aortic balloon pump reduces regurgitation.',
        'This needs emergency cardiac surgery — transport to a surgical centre with pre-alert.',
      ] },
    },
  ],
  keyPoints: [
    'LAD: anterior/septum/apex; RCA: inferior/RV/nodes; LCx: lateral.',
    'Right-dominant (~70–85 %) means the RCA gives the PDA.',
    'LV coronary flow is mainly diastolic — tachycardia worsens ischaemia.',
    'SV = preload, afterload, contractility; CO = SV × HR; MAP ≈ CO × SVR.',
    'Nodal block (inferior MI) responds to atropine; infranodal block (anterior MI) needs pacing.',
  ],
  pearls: ['Atrial fibrillation loses the atrial kick — up to 30 % of filling.', 'Aortic stenosis patients need preload and afterload.'],
  pitfalls: ['Vasodilating a patient with severe aortic stenosis.', 'Relying on atropine for infranodal block.'],
  live: [{ id: 'heart-vsd', label: 'Ventricular septal defect on the live heart' }],
  questions: [
    { q: 'The LAD supplies:', options: ['Inferior wall', 'Anterior wall, septum and apex', 'RV only', 'SA node usually'], answer: 1, why: 'Anterior territory.' },
    { q: 'In right-dominant circulation the PDA arises from:', options: ['LAD', 'LCx', 'RCA', 'Left main'], answer: 2, why: 'Definition of dominance.' },
    { q: 'The AV node is supplied by the RCA in about:', options: ['10 %', '50 %', '80–90 %', '100 %'], answer: 2, why: 'Explains AV block in inferior MI.' },
    { q: 'LV coronary perfusion occurs mainly in:', options: ['Systole', 'Diastole', 'Isovolumic contraction', 'Equally'], answer: 1, why: 'Compression limits systolic flow.' },
    { q: 'Atrial kick contributes up to:', options: ['5 %', '20–30 %', '60 %', '90 %'], answer: 1, why: 'Lost in AF.' },
    { q: 'Ventricular escape rate:', options: ['60–100', '40–60', '20–40', '100–150'], answer: 2, why: 'Lowest intrinsic pacemaker.' },
    { q: 'Complete heart block in anterior MI typically:', options: ['Responds to atropine', 'Is infranodal and needs pacing', 'Is benign', 'Has narrow QRS'], answer: 1, why: 'Below the AV node.' },
    { q: 'Severe aortic stenosis patients poorly tolerate:', options: ['Bradycardia only', 'Vasodilators and hypotension', 'Fluids', 'Oxygen'], answer: 1, why: 'Fixed outflow; coronary perfusion depends on pressure.' },
    { q: 'Mitral stenosis worsens with:', options: ['Bradycardia', 'Tachycardia', 'Fluids restriction', 'Rest'], answer: 1, why: 'Less diastolic filling time.' },
    { q: 'New holosystolic apical murmur with shock after MI suggests:', options: ['Aortic stenosis', 'Papillary muscle rupture (acute MR)', 'Pericarditis', 'Tamponade'], answer: 1, why: 'Mechanical complication.' },
    { q: 'MAP is approximately:', options: ['HR × SV', 'CO × SVR (+ CVP)', 'SBP − DBP', 'CVP × PVR'], answer: 1, why: 'Ohm\'s law for flow.' },
    { q: 'Frank–Starling law relates stroke volume to:', options: ['Afterload', 'Preload (fibre stretch)', 'Heart rate', 'Oxygen'], answer: 1, why: 'More stretch, more force (to a point).' },
    { q: 'The SA node rate:', options: ['20–40', '40–60', '60–100', '150–200'], answer: 2, why: 'Dominant pacemaker.' },
    { q: 'Posteromedial papillary muscle rupture is more common because:', options: ['Dual blood supply', 'Single blood supply', 'Thicker muscle', 'No relation'], answer: 1, why: 'Usually PDA only.' },
    { q: 'Bifascicular block in anterior MI before transport warrants:', options: ['Nothing', 'Pacing pads applied', 'Adenosine', 'Digoxin'], answer: 1, why: 'Risk of complete block.' },
  ],
  sources: [
    { title: 'StatPearls: Anatomy, thorax, heart coronary arteries', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Anatomy%2C+thorax%2C+heart+coronary+arteries+StatPearls' },
    { title: 'StatPearls: Physiology, cardiac cycle', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Physiology%2C+cardiac+cycle+StatPearls' },
  ],
};

export const ELECTROPHYS: FpcLesson = {
  id: 'fpc-electrophys', domain: 'cardiac', ref: 'VI.13',
  title: 'Electrophysiology: action potentials, pacing and devices',
  summary: 'The cardiac action potential and the drugs and electrolytes that change it, transcutaneous and transvenous pacing, pacemakers and ICDs, and defibrillation and cardioversion energy.',
  objectives: [
    'Describe the phases of the ventricular and pacemaker action potentials and drug effects.',
    'Set up and troubleshoot transcutaneous pacing.',
    'Manage patients with pacemakers and ICDs in transport.',
  ],
  sections: [
    {
      id: 'ap', title: 'Action potentials', core: true,
      body: [
        'The ventricular myocyte rests near −90 mV, set by potassium. Phase 0 is rapid depolarisation through fast sodium channels (the QRS); phase 1 early repolarisation; phase 2 the plateau, held by calcium influx (the ST segment); phase 3 repolarisation by potassium efflux (the T wave); phase 4 rest.',
        'Pacemaker cells in the SA and AV nodes have no true resting potential: phase 4 drifts upward (the "funny" current), and phase 0 depends on calcium channels, which is why calcium-channel blockers and beta-blockers slow the nodes. Sympathetic stimulation steepens phase 4 (faster rate); vagal stimulation flattens it.',
      ],
      table: {
        caption: 'Vaughan Williams classes',
        head: ['Class', 'Mechanism', 'Examples', 'ECG effect'],
        rows: [['I', 'Na⁺ channel block', 'Procainamide (IA), lidocaine (IB), flecainide (IC)', 'QRS widening (IA, IC)'], ['II', 'β-blockade', 'Metoprolol, esmolol', 'PR prolongation, slower rate'], ['III', 'K⁺ channel block', 'Amiodarone, sotalol', 'QT prolongation'], ['IV', 'Ca²⁺ channel block', 'Diltiazem, verapamil', 'PR prolongation'], ['Other', 'Adenosine, digoxin, magnesium', '—', 'AV nodal effects']],
      },
    },
    {
      id: 'pacing', title: 'Transcutaneous pacing', core: true,
      body: [
        'Indicated for symptomatic bradycardia unresponsive to atropine (or when atropine is unlikely to work, as in infranodal block or heart transplant patients), and as a bridge to transvenous pacing. Place pads anterior–posterior or anterior–lateral; set a rate (often 60–80) and increase the current from the minimum until electrical capture (a wide QRS with a broad T after each pacing spike) occurs, then add a small margin.',
        'Confirm mechanical capture with a palpable pulse (femoral is less confused by muscle twitching), a pulse oximetry waveform matching the paced rate, or an arterial line. Electrical artefact can mimic capture. Transcutaneous pacing is painful: give analgesia and sedation. Large body habitus, effusions and hyperinflated lungs raise thresholds.',
        'Transvenous pacing (via internal jugular or femoral) is more reliable and comfortable; in transport, check the wire\'s position, connections, threshold and pacing box battery, and secure everything carefully.',
      ],
    },
    {
      id: 'devices', title: 'Pacemakers and ICDs', core: true,
      body: [
        'Pacemaker codes describe chamber paced, chamber sensed, and response (for example DDD: dual chamber paced and sensed, triggered and inhibited). Failure to pace (no spike when expected), failure to capture (spike without a following complex) and failure to sense (spikes at inappropriate times) are the main malfunctions; causes include lead displacement, battery depletion, electrolyte disturbance and ischaemia.',
        'A magnet placed over a pacemaker usually switches it to asynchronous pacing at a fixed rate; over an ICD it usually suspends shock delivery without changing pacing — useful for inappropriate shocks, but the patient then needs external monitoring and defibrillation capability. Defibrillation pads should sit at least a few centimetres away from the device generator.',
      ],
    },
    {
      id: 'energy', title: 'Defibrillation and cardioversion',
      body: [
        'Ventricular fibrillation and pulseless VT need unsynchronised defibrillation at the maximum or manufacturer-recommended biphasic energy (often 120–200 J, escalating). Unstable tachyarrhythmias with a pulse need synchronised cardioversion: synchronisation avoids delivering the shock on the T wave. Typical starting energies: narrow regular (SVT, flutter) 50–100 J, irregular narrow (AF) 120–200 J, monomorphic VT with a pulse 100 J, all biphasic and escalating per protocol. Polymorphic VT is treated as VF (unsynchronised).',
        'In aircraft, defibrillation is safe when the crew is clear of the patient and the stretcher; follow programme procedures and inform the pilot before shocking if required.',
      ],
    },
    {
      id: 'case', title: 'Transport case: pacing in the air',
      body: ['A 77-year-old with complete heart block, HR 32, BP 72/40, confused. Atropine 1 mg had no effect. Transfer for a permanent pacemaker.'],
      example: { case: 'Set up and verify pacing for a 60-minute flight.', steps: [
        'Pads anterior–posterior; rate 70; increase current until electrical capture (e.g. 80 mA), then add ~10 %.',
        'Confirm mechanical capture: femoral pulse and SpO₂ pleth at 70.',
        'Analgesia and sedation (e.g. fentanyl and low-dose midazolam or ketamine).',
        'An epinephrine or dopamine infusion as a pharmacological backup if capture is lost.',
        'Recheck capture after every move; carry spare pads and battery.',
      ] },
    },
  ],
  keyPoints: [
    'Phase 0 Na⁺ (QRS), phase 2 Ca²⁺ plateau, phase 3 K⁺ repolarisation (T); nodes depend on Ca²⁺.',
    'Class I Na⁺ block widens QRS; class III prolongs QT; classes II and IV slow the AV node.',
    'Pacing: increase mA to electrical capture, confirm mechanical capture with a pulse, then sedate.',
    'Magnet: pacemaker → asynchronous pacing; ICD → shocks suspended.',
    'Synchronise for unstable tachycardias with a pulse; unsynchronised for VF, pulseless VT and polymorphic VT.',
  ],
  pearls: ['Check the femoral pulse to confirm capture — muscle twitch fools carotid palpation.', 'Pads a few centimetres from implanted devices.'],
  pitfalls: ['Calling electrical artefact "capture" without a pulse.', 'Synchronised cardioversion attempts for polymorphic VT.'],
  questions: [
    { q: 'Phase 0 of the ventricular action potential is due to:', options: ['K⁺ efflux', 'Na⁺ influx', 'Ca²⁺ influx', 'Cl⁻ influx'], answer: 1, why: 'Fast sodium channels.' },
    { q: 'The plateau phase is maintained by:', options: ['Na⁺', 'Ca²⁺ influx', 'K⁺ influx', 'Mg²⁺'], answer: 1, why: 'L-type calcium channels.' },
    { q: 'Nodal depolarisation (phase 0) depends mainly on:', options: ['Sodium', 'Calcium', 'Chloride', 'Potassium'], answer: 1, why: 'Hence CCBs slow the AV node.' },
    { q: 'Amiodarone is primarily class:', options: ['I', 'II', 'III', 'IV'], answer: 2, why: 'K⁺ channel blockade (with others).' },
    { q: 'A drug class that widens the QRS:', options: ['Class IC', 'Class II', 'Class IV', 'Adenosine'], answer: 0, why: 'Strong Na⁺ blockade.' },
    { q: 'Electrical capture on transcutaneous pacing appears as:', options: ['Spike only', 'Spike followed by wide QRS and T wave', 'Narrow QRS', 'No change'], answer: 1, why: 'Ventricular depolarisation after each spike.' },
    { q: 'Best confirmation of mechanical capture:', options: ['Carotid pulse during muscle twitch', 'Femoral pulse or SpO₂ waveform at paced rate', 'Monitor spike', 'Patient movement'], answer: 1, why: 'Avoids twitch artefact.' },
    { q: 'A magnet over an ICD usually:', options: ['Starts pacing at 100', 'Suspends shock delivery', 'Turns off pacing', 'Shocks the patient'], answer: 1, why: 'Tachy therapies suspended.' },
    { q: 'A magnet over a pacemaker usually causes:', options: ['Inhibition', 'Asynchronous fixed-rate pacing', 'Shocks', 'No effect'], answer: 1, why: 'Prevents oversensing inhibition.' },
    { q: 'Spikes without following complexes indicate:', options: ['Failure to sense', 'Failure to capture', 'Normal pacing', 'Failure to pace'], answer: 1, why: 'Stimulus delivered, no depolarisation.' },
    { q: 'Polymorphic VT with a pulse but unstable is treated with:', options: ['Synchronised cardioversion 50 J', 'Unsynchronised defibrillation', 'Adenosine', 'Vagal manoeuvres'], answer: 1, why: 'Synchronisation is unreliable.' },
    { q: 'Typical starting energy for unstable SVT (biphasic):', options: ['10 J', '50–100 J', '360 J', 'Unsynchronised 200 J'], answer: 1, why: 'Lower energies usually suffice.' },
    { q: 'Atropine is unlikely to help bradycardia in:', options: ['Sinus bradycardia', 'Heart transplant patients', 'Vagal reaction', 'Inferior MI with nodal block'], answer: 1, why: 'Denervated hearts.' },
    { q: 'DDD pacing means:', options: ['Single chamber', 'Dual chamber paced and sensed, dual response', 'Defibrillator only', 'Demand ventricular'], answer: 1, why: 'Standard code.' },
    { q: 'Sympathetic stimulation affects pacemaker cells by:', options: ['Flattening phase 4', 'Steepening phase 4', 'Blocking Na⁺', 'Prolonging plateau'], answer: 1, why: 'Faster rate.' },
  ],
  sources: [
    { title: 'AHA guidelines for CPR and ECC: adult advanced life support', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines' },
    { title: 'StatPearls: Transcutaneous pacing', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Transcutaneous+pacing+StatPearls' },
  ],
};
