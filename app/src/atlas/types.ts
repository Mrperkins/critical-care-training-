import type { Module } from '../app/store';
import type { TargetId } from '../scene/cameraTargets';

export type AtlasDomain = 'vent' | 'heart' | 'neuro' | 'lines' | 'abdomen' | 'labs' | 'pediatrics' | 'womens';
export type Anatomy = 'airway' | 'alveoli' | 'pleura' | 'pulmonary-vessels' | 'heart' | 'aorta' | 'brain' | 'circulation' | 'chemistry' | 'ovaries' | 'uterus' | 'placenta';
/** Visual fractions, not clinical predictions. Shared across organs and modalities. */
export interface DiseaseState {
  obstruction: number; collapse: number; overdistension: number; fluid: number;
  bleeding: number; edema: number; inflammation: number; ischemia: number;
  pressure: number; flowLoss: number; volumeLoss: number; pumpLoss: number;
  shunt: number; electrical: number; metabolic: number; endocrine: number;
}
export type VisualChannel = keyof DiseaseState;
export interface Finding { channel: VisualChannel; label: string }
export interface Decision {
  id: string; label: string; outcome: 'stabilize' | 'deteriorate' | 'unchanged';
  explanation: string; change: Partial<DiseaseState>;
}
export interface DiseaseDefinition {
  id: string; title: string; domain: AtlasDomain; group: string;
  anatomy: Anatomy; target: TargetId; variant: string;
  population: 'adult' | 'child' | 'neonate' | 'female' | 'maternal';
  mechanism: string; distinction: string;
  findings: Finding[]; peak: Partial<DiseaseState>;
  stages: readonly [string, string, string];
  question: string; decisions: Decision[];
  sources: { title: string; url: string }[];
  relatedModule?: Module; relatedScenario?: string;
}
