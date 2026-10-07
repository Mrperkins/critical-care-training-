import type { ClinicalVideo, VideoCategoryDefinition, VideoFilters } from './types';

export const VIDEO_CATEGORIES: VideoCategoryDefinition[] = [
  {
    id: 'devices',
    label: 'Medical devices',
    description: 'Setup, operation, transport use and troubleshooting of critical-care equipment.',
    subcategories: [
      { id: 'chest-drainage', label: 'Chest drainage systems' },
      { id: 'ventilators', label: 'Ventilators' },
      { id: 'infusion-pumps', label: 'Infusion pumps' },
      { id: 'high-flow', label: 'HFNC / high flow' },
      { id: 'evd', label: 'EVD / ICP systems' },
      { id: 'iabp', label: 'IABP' },
      { id: 'ecmo', label: 'ECMO' },
      { id: 'monitors', label: 'Transport monitors' },
      { id: 'peds-neonatal', label: 'Pediatric / neonatal devices' },
    ],
  },
  {
    id: 'procedures',
    label: 'Procedures',
    description: 'Hands-on setup, performance, management and complication recognition.',
    subcategories: [
      { id: 'chest-tube', label: 'Chest tube' },
      { id: 'thoracostomy', label: 'Needle / finger thoracostomy' },
      { id: 'airway', label: 'RSI / difficult airway' },
      { id: 'cricothyrotomy', label: 'Cricothyrotomy' },
      { id: 'vascular-access', label: 'Arterial / central access' },
      { id: 'blood', label: 'Blood administration' },
      { id: 'pressors', label: 'Push-dose pressors' },
      { id: 'transducers', label: 'Transducer setup / leveling' },
    ],
  },
  {
    id: 'airway-vent',
    label: 'Airway & ventilation',
    description: 'Ventilator modes, waveforms, oxygenation, obstruction and troubleshooting.',
    subcategories: [
      { id: 'vent-setup', label: 'Ventilator setup' },
      { id: 'modes', label: 'Modes' },
      { id: 'aprv', label: 'APRV' },
      { id: 'peep', label: 'PEEP' },
      { id: 'waveforms', label: 'Waveforms' },
      { id: 'auto-peep', label: 'Auto-PEEP' },
      { id: 'ards', label: 'ARDS' },
      { id: 'asthma-copd', label: 'Asthma / COPD' },
    ],
  },
  {
    id: 'hemodynamics',
    label: 'Hemodynamics & shock',
    description: 'Pressure, flow, perfusion, vasoactives and shock phenotypes.',
    subcategories: [
      { id: 'shock', label: 'Shock' },
      { id: 'arterial-lines', label: 'Arterial lines' },
      { id: 'pac', label: 'PA catheter' },
      { id: 'vasoactives', label: 'Vasoactives' },
      { id: 'mechanical-support', label: 'Mechanical support' },
    ],
  },
  {
    id: 'cardiac',
    label: 'Cardiology',
    description: 'ECG, ischemia, arrhythmia, pump failure and mechanical support.',
    subcategories: [
      { id: 'ecg', label: 'ECG' },
      { id: 'stemi', label: 'STEMI' },
      { id: 'arrhythmia', label: 'Arrhythmia' },
      { id: 'cardiogenic-shock', label: 'Cardiogenic shock' },
      { id: 'aorta', label: 'Aortic emergencies' },
    ],
  },
  {
    id: 'neuro',
    label: 'Neurocritical care',
    description: 'Stroke, ICP, EVDs, seizures and neurologic emergencies.',
    subcategories: [
      { id: 'ich-sah', label: 'ICH / SAH' },
      { id: 'lvo', label: 'LVO / ischemic stroke' },
      { id: 'icp', label: 'ICP / herniation' },
      { id: 'evd', label: 'EVD management' },
      { id: 'seizure', label: 'Seizure / status' },
    ],
  },
  {
    id: 'trauma',
    label: 'Trauma',
    description: 'Resuscitation, hemorrhage control, thoracic trauma and transport.',
    subcategories: [
      { id: 'hemorrhage', label: 'Hemorrhage' },
      { id: 'thoracic', label: 'Thoracic trauma' },
      { id: 'tbi', label: 'TBI' },
      { id: 'massive-transfusion', label: 'Massive transfusion' },
    ],
  },
  {
    id: 'pharmacology',
    label: 'Critical-care pharmacology',
    description: 'High-risk medications, dilution, delivery and mechanisms.',
    subcategories: [
      { id: 'vasoactives', label: 'Vasoactives' },
      { id: 'sedation', label: 'Sedation / analgesia' },
      { id: 'paralytics', label: 'Neuromuscular blockade' },
      { id: 'electrolytes', label: 'Electrolytes' },
    ],
  },
  {
    id: 'peds-neonatal',
    label: 'Pediatric & neonatal',
    description: 'Age-specific airway, ventilation, shock and transport equipment.',
    subcategories: [
      { id: 'peds-airway', label: 'Pediatric airway' },
      { id: 'peds-shock', label: 'Pediatric shock' },
      { id: 'neonatal-vent', label: 'Neonatal ventilation' },
      { id: 'transport', label: 'Transport equipment' },
    ],
  },
  {
    id: 'labs-pocus',
    label: 'Labs, ABGs & POCUS',
    description: 'Acid-base, laboratory interpretation and bedside ultrasound.',
    subcategories: [
      { id: 'abg', label: 'ABG / acid-base' },
      { id: 'electrolytes', label: 'Electrolytes' },
      { id: 'lung-us', label: 'Lung ultrasound' },
      { id: 'fast', label: 'FAST' },
      { id: 'vascular-us', label: 'Vascular ultrasound' },
    ],
  },
];

export const VIDEO_LIBRARY: ClinicalVideo[] = [
  {
    id: 'chest-drain-setup-maintenance',
    title: 'Chest Tubes: Setup and Maintenance',
    channel: 'Nurse Skills',
    youtubeId: 'Ui0eKmEk38M',
    format: 'long',
    category: 'devices',
    subcategory: 'chest-drainage',
    intents: ['setup', 'manage', 'troubleshoot'],
    level: 'foundational',
    tags: ['chest tube', 'atrium', 'oasis', 'water seal', 'suction', 'air leak', 'tidaling'],
    summary: 'Setup of an Atrium Oasis chest drain with air-leak, tidaling and troubleshooting review.',
    reviewStatus: 'listed',
    featured: true,
    published: '2017-05-09',
  },
  {
    id: 'evd-care-setup',
    title: 'External Ventricular Drain EVD',
    channel: 'EmpoweRN',
    youtubeId: 'ALeEdTAQHA8',
    format: 'long',
    category: 'devices',
    subcategory: 'evd',
    intents: ['setup', 'manage', 'troubleshoot'],
    level: 'intermediate',
    tags: ['EVD', 'ICP', 'CSF', 'leveling', 'transducer', 'zeroing', 'drainage'],
    summary: 'EVD setup, priming, leveling, zeroing and bedside management concepts.',
    reviewStatus: 'listed',
    featured: true,
    published: '2025-05-05',
  },
  {
    id: 'evd-overview-cleveland-clinic',
    title: 'External Ventricular Drain (EVD)',
    channel: 'Cleveland Clinic',
    youtubeId: 'Tul9sm30QNo',
    format: 'long',
    category: 'neuro',
    subcategory: 'evd',
    intents: ['learn', 'manage'],
    level: 'foundational',
    tags: ['EVD', 'ICP', 'CSF', 'hydrocephalus', 'ventricular drain'],
    summary: 'Clinical overview of why an EVD is placed, what it drains and how it fits into neurocritical care.',
    reviewStatus: 'listed',
    featured: true,
    published: '2019-07-12',
  },
  {
    id: 'evd-quick-overview',
    title: 'External Ventricular Drain (EVD), ICP monitoring and CSF drainage',
    channel: 'Two Minute Anaesthesia & Critical Care',
    youtubeId: 'xUbMVNoeEcM',
    format: 'long',
    category: 'neuro',
    subcategory: 'evd',
    intents: ['learn'],
    level: 'intermediate',
    tags: ['EVD', 'ICP', 'CSF drainage', 'indications', 'complications'],
    summary: 'Concise overview of EVD indications, placement, drainage and complications.',
    reviewStatus: 'listed',
    published: '2024-05-05',
  },
];

export const youtubeWatchUrl = (video: ClinicalVideo) =>
  video.format === 'short'
    ? `https://www.youtube.com/shorts/${video.youtubeId}`
    : `https://www.youtube.com/watch?v=${video.youtubeId}`;

export const youtubeThumbnailUrl = (video: ClinicalVideo) =>
  `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;

export function filterVideoLibrary(filters: VideoFilters, source = VIDEO_LIBRARY) {
  const q = filters.query.trim().toLowerCase();
  return source.filter((video) => {
    if (video.reviewStatus !== 'listed') return false;
    if (filters.category && video.category !== filters.category) return false;
    if (filters.subcategory && video.subcategory !== filters.subcategory) return false;
    if (filters.format && video.format !== filters.format) return false;
    if (filters.level && video.level !== filters.level) return false;
    if (filters.intent && !video.intents.includes(filters.intent)) return false;
    if (!q) return true;
    const haystack = [video.title, video.channel, video.summary, video.category, video.subcategory, ...video.tags, ...video.intents].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export function pairedLongForm(video: ClinicalVideo, source = VIDEO_LIBRARY) {
  if (!video.pairedLongFormId) return undefined;
  return source.find((candidate) => candidate.id === video.pairedLongFormId && candidate.reviewStatus === 'listed');
}
