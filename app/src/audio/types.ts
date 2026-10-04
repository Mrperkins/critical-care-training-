export type MasteryLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type CriticalCareDomain =
  | 'foundations' | 'respiratory' | 'hemodynamics' | 'cardiac' | 'neuro'
  | 'renal-metabolic' | 'infectious' | 'hematology' | 'pharmacology'
  | 'imaging-monitoring' | 'procedures' | 'multisystem' | 'communication-systems';

export type AudioFormat = 'daily-dose' | 'rounds' | 'deep-dive' | 'audio-case' | 'icu-literacy' | 'mental-rep';

export interface MasteryConcept {
  id: string;
  name: string;
  domain: CriticalCareDomain;
  level: MasteryLevel;
  summary: string;
  prereq: string[];
  related: string[];
  vocabulary?: string[];
  /** What mastery looks like, not merely what the learner can recite. */
  performance: string[];
}

export interface AudioChapter {
  id: string;
  title: string;
  seconds: number;
  conceptIds: string[];
  prompt?: string;
}

export interface VoiceAsset {
  /** Production audio must be a pre-rendered human-quality neural voice or a recorded clinician. */
  tier: 'premium-human' | 'recorded-clinician';
  voice: string;
  locale: string;
  src?: string;
  previewSrc?: string;
  transcript: string;
  reviewed: boolean;
}

export interface AudioEpisode {
  id: string;
  title: string;
  subtitle: string;
  format: AudioFormat;
  level: MasteryLevel;
  minutes: number;
  domain: CriticalCareDomain;
  concepts: string[];
  chapters: AudioChapter[];
  voice?: VoiceAsset;
  status: 'planned' | 'scripted' | 'voice-ready' | 'published';
  /** The learner should be able to answer these after listening. */
  outcomes: string[];
}

export type MentalRepPhase =
  | 'arrival' | 'orientation' | 'equipment' | 'sequence'
  | 'decision' | 'complication' | 'confirmation' | 'debrief';

export interface MentalRepBeat {
  id: string;
  phase: MentalRepPhase;
  title: string;
  narration: string;
  pauseSeconds?: number;
  prompt?: string;
  visual?: string;
  danger?: boolean;
  /** Optional pre-rendered natural narration for this beat. */
  voice?: VoiceAsset;
}

export interface MentalRep {
  id: string;
  title: string;
  subtitle: string;
  level: MasteryLevel;
  domain: CriticalCareDomain;
  minutes: number;
  concepts: string[];
  beats: MentalRepBeat[];
  disclaimer: string;
}

export interface MasteryState {
  concept: string;
  exposures: number;
  correct: number;
  confidence: number[];
  lastSeen?: string;
}
