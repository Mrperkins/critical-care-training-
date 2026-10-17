/**
 * An FP-C lesson: one blueprint subtopic, taught as a full course (15–25 minutes: narrated teaching
 * sections, worked examples, tables, pearls and pitfalls, then ten exam-style questions) or as a TL;DR
 * (the high-yield sections and the key points).
 */
import type { DomainId } from './blueprint';

export interface Section {
  id: string; title: string;
  /** teaching paragraphs; narrated (clip id `fpc.<lesson>.<section>.<n>`) when a clip exists */
  body: string[];
  /** a worked bedside example: the case, then how to think it through */
  example?: { case: string; steps: string[] };
  table?: { caption: string; head: string[]; rows: string[][] };
  /** short list (criteria, mnemonics, steps) shown after the paragraphs */
  list?: { caption: string; items: string[]; ordered?: boolean };
  /** part of the TL;DR */
  core?: boolean;
}
export interface Question { q: string; options: [string, string, string, string]; answer: 0 | 1 | 2 | 3; why: string }
export interface FpcLesson {
  id: string; domain: DomainId;
  /** blueprint reference, e.g. 'III.7' */ ref: string;
  title: string; summary: string;
  objectives: string[];
  sections: Section[];
  keyPoints: string[];
  pearls: string[]; pitfalls: string[];
  /** existing interactive lessons that show this live (lesson ids openable with openLesson) */
  live?: { id: string; label: string }[];
  questions: Question[];
  sources: { title: string; url: string }[];
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const sectionWords = (s: Section) => s.body.reduce((n, p) => n + words(p), 0) + (s.example ? words(s.example.case) + s.example.steps.reduce((n, p) => n + words(p), 0) : 0) + (s.list ? s.list.items.reduce((n, p) => n + words(p), 0) : 0) + (s.table ? s.table.rows.flat().reduce((n, p) => n + words(p), 0) : 0);
/** study pace: ~150 words a minute (narration pace) plus ~40 s per question */
export function lessonMinutes(l: FpcLesson, track: 'full' | 'tldr') {
  if (track === 'tldr') return Math.max(3, Math.round((l.sections.filter((s) => s.core).reduce((n, s) => n + sectionWords(s), 0) + l.keyPoints.reduce((n, p) => n + words(p), 0)) / 150 + 1.5));
  return Math.round(l.sections.reduce((n, s) => n + sectionWords(s), 0) / 150 + (l.pearls.length + l.pitfalls.length) * 0.15 + l.questions.length * 0.66);
}
export const clipId = (lesson: string, section: string, n: number) => `fpc.${lesson}.${section}.${n}`;
