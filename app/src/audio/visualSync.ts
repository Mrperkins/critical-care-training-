import { useAudioProgress } from './progress';

/** Existing Critical Care Physiology challenge concepts → audio mastery concepts. */
export const CURRICULUM_TO_AUDIO: Record<string, string[]> = {
  'resistance-compliance': ['compliance', 'vent-troubleshooting'],
  'auto-peep': ['peep', 'vent-troubleshooting'],
  dyssynchrony: ['vent-troubleshooting', 'sedation-analgesia'],
  'lung-protection': ['ards', 'driving-pressure'],
  'tension-ptx': ['vent-troubleshooting', 'chest-tube'],
  'airway-obstruction': ['vent-troubleshooting'],
  hypoxaemia: ['oxygen-delivery'],
  'resp-acid-base': ['acid-base'],
  'metabolic-acidosis': ['acid-base'],
  'o2-content': ['oxygen-delivery'],
  lactate: ['lactate'],
  'shock-states': ['shock'],
  haemorrhage: ['transfusion', 'massive-transfusion', 'shock'],
  transducer: ['arterial-line', 'waveform-damping'],
  waveforms: ['arterial-line', 'waveform-damping'],
  'fluid-responsiveness': ['fluid-responsiveness'],
  fast: ['efast'],
  icp: ['icp-cpp', 'evd'],
  'chest-imaging': ['vent-troubleshooting'],
  resuscitation: ['shock', 'oxygen-delivery'],
};

/** A visual challenge is another retrieval event in the same learning ecosystem. */
export function syncVisualConcepts(concepts: string[], ok: boolean) {
  const ids = new Set(concepts.flatMap((c) => CURRICULUM_TO_AUDIO[c] ?? []));
  for (const id of ids) useAudioProgress.getState().recordConcept(id, ok, 50);
}
