import type { MentalRepBeat } from './types';

const FALLBACKS: Record<string, Record<string, string>> = {
  'rep-push-dose-pressor': {
    arrival: 'monitor-response',
    comp: 'monitor-response',
  },
  'rep-blood': {
    arrival: 'blood-circuit',
    verify: 'blood-circuit',
    reaction: 'monitor-response',
  },
  'rep-art-line': {
    arrival: 'artery-ultrasound',
    level: 'transducer-system',
  },
  'rep-efast': {
    orientation: 'efast-map',
  },
  'rep-chest-tube': {
    arrival: 'chest-wall-anatomy',
    sequence: 'finger-thorax-dissection',
    failure: 'drain-water-seal',
  },
  'rep-central-line': {
    arrival: 'ij-landmarks',
    confirm: 'ij-sequence-confirm',
    wire: 'ij-sequence-wire',
    dilate: 'ij-sequence-dilate',
    catheter: 'ij-sequence-catheter',
    comp: 'ij-sequence-stop',
  },
  'rep-io': {
    arrival: 'io-landmark',
    place: 'io-place',
    confirm: 'io-confirm',
    comp: 'io-comp',
  },
  'rep-vent-emergency': {
    oxygen: 'vent-check',
    pressure: 'vent-check',
    hemo: 'vent-check',
  },
  'rep-evd': {
    before: 'evd-level',
    clamp: 'evd-level',
    verify: 'evd-level',
  },
  'rep-mtp': {
    activate: 'mtp-system',
    roles: 'mtp-system',
    source: 'mtp-source',
    phys: 'mtp-phys',
    response: 'mtp-response',
  },
  'rep-us-piv': {
    setup: 'piv-map',
    thread: 'piv-tip',
  },
  'rep-rsi': {
    phys: 'airway-preoxygenation',
    room: 'airway-overview',
    meds: 'medication-prep',
    commit: 'airway-overview',
  },
  'rep-post-intubation': {
    pressure: 'post-tube',
    recheck: 'post-tube',
  },
  'rep-pac': {
    integrate: 'pac-wedge',
  },
  'rep-crrt': {
    transport: 'crrt-circuit',
    effluent: 'crrt-circuit',
    alarm: 'crrt-circuit',
    drugs: 'crrt-circuit',
  },
  'rep-ecmo': {
    drain: 'ecmo-circuit',
    lung: 'ecmo-circuit',
    mismatch: 'ecmo-return',
  },
  'rep-iabp': {
    deflate: 'iabp-wave',
  },
  'rep-sedation': {
    goal: 'sedation-lines',
    hemo: 'sedation-lines',
    paralysis: 'sedation-lines',
    reassess: 'sedation-lines',
  },
  'rep-status': {
    support: 'seizure-support',
    first: 'seizure-first',
    second: 'seizure-second',
    airway: 'seizure-airway',
  },
};

export function resolveRepVisualKey(repId: string | undefined, beat: MentalRepBeat): string {
  return beat.visual ?? (repId ? FALLBACKS[repId]?.[beat.id] : undefined) ?? beat.phase;
}

export function hasProcedureSpecificVisual(repId: string, beat: MentalRepBeat): boolean {
  return resolveRepVisualKey(repId, beat) !== beat.phase;
}
