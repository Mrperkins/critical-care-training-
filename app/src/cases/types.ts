/** Authored synthetic conferences. Clinical fields are supplied by an author, never inferred from a diagnosis. */
export type CasePopulation = 'Adult' | 'Pediatric' | 'Neonatal' | 'Obstetric';
export type ExamTrack = 'FP-C' | 'CCP-C' | 'CCRN Adult' | 'CCRN Pediatric' | 'CCRN Neonatal';
export interface FindingTeaching {
  reference: { text: string; source: { title: string; url: string } };
  interpretation: string;
  /** Common associations, explicitly distinguished from this patient's documented findings. */
  associations: string;
}
export interface CaseDatum { label: string; value: string; unit?: string; spoken: string; teaching?: FindingTeaching }
export interface ClinicalReview {
  diagnosis: string; handoff: string; course: string;
  sources?: { title: string; url: string }[];
  findings: Record<string, FindingTeaching>;
  imaging?: { ids: string[]; narration: string };
}
export interface CasePresentation {
  id: string; title: string; variant: string;
  patient: string; story: string; exam: string;
  vitals: CaseDatum[]; labs: CaseDatum[];
  diagnostics: string;
  question: string; reasoning: string; priorities: string[];
  reassessment: string; synopsis: string;
}
export interface CaseTopic {
  id: string; title: string; population: CasePopulation;
  diseaseIds: string[]; lessonIds: string[]; exams: ExamTrack[];
  sources: { title: string; url: string }[];
  /** Real imaging is a separate reference patient, never passed off as the synthetic patient's study. */
  referenceDisease?: string;
  presentations: CasePresentation[];
}
export interface ConferenceSlide {
  id: string; title: string; label: string; narration: string;
  paragraphs?: string[]; data?: CaseDatum[]; bullets?: string[];
  focus?: { label: string; text: string };
  comparisonIds?: string[];
  /** Authored reflection time in the continuous recording; never waits for a response. */
  pauseAfterSeconds?: number;
  kind: 'scene' | 'vitals' | 'labs' | 'diagnostics' | 'question' | 'reasoning' | 'course' | 'synopsis';
}
export type ConferenceBeatId = 'presentation' | 'assessment' | 'vitals' | 'labs' | 'diagnostics' | 'decision' | 'reasoning' | 'reassessment' | 'synopsis';
/** Screen evidence and speaker commentary are separately authored editorial tracks. */
export interface ConferenceBeat {
  title: string; points: string[]; commentary: string;
  focus?: ConferenceSlide['focus'];
}
export type ConferenceScript = Record<ConferenceBeatId, ConferenceBeat>;
export const beat = (title: string, points: string[], commentary: string, focus?: ConferenceSlide['focus']): ConferenceBeat => ({ title, points, commentary, focus });
export interface ConferenceCase extends CasePresentation {
  diagnosis: string;
  topicId: string; topic: string; population: CasePopulation;
  diseaseIds: string[]; lessonIds: string[]; exams: ExamTrack[];
  sources: CaseTopic['sources']; referenceDisease?: string;
  synthetic: true; reviewStatus: 'Clinical review pending';
  slides: ConferenceSlide[];
}
export interface ConferenceAudio {
  file: string; transcriptHash: string; seconds: number;
  chapters: { id: string; start: number; end: number }[];
}
export const datum = (label: string, value: string, unit: string, spoken: string): CaseDatum => ({ label, value, unit, spoken });
