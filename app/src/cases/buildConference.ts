import { CONFERENCE_SCRIPTS } from './conferenceScripts';
import type { CaseTopic, ConferenceBeatId, ConferenceCase, ConferenceSlide } from './types';

/** Concise screen evidence and a fuller speaker track share clinical facts, not paragraphs. */
export function buildConference(topic: CaseTopic): ConferenceCase[] {
  return topic.presentations.map(p => {
    const script = CONFERENCE_SCRIPTS[p.id];
    if (!script) throw new Error(`Missing authored conference script for ${p.id}`);
    const beat = (id: ConferenceBeatId, kind: ConferenceSlide['kind'], label: string, narrative: string, data?: ConferenceSlide['data']): ConferenceSlide => ({
      id, kind, label, title: script[id].title, bullets: script[id].points.length ? script[id].points : undefined,
      focus: script[id].focus, data,
      narration: `${narrative} ${script[id].commentary}`,
    });
    const slides: ConferenceSlide[] = [
      beat('presentation', 'scene', '01 / The handoff', `Case conference. ${p.title}. This is a fictional teaching case, with clinical review pending. ${p.patient} ${p.story}`),
      beat('assessment', 'scene', '02 / At the bedside', p.exam),
      beat('vitals', 'vitals', '03 / First observations', p.vitals.map(d => d.spoken).join(' '), p.vitals),
      beat('labs', 'labs', '04 / The investigation', p.labs.map(d => d.spoken).join(' '), p.labs),
      beat('diagnostics', 'diagnostics', '05 / Interpret the evidence', `${p.diagnostics}${topic.referenceDisease ? ' An optional comparison image in the visual presentation comes from a different patient; it is not this fictional patient’s study.' : ''}`),
      { ...beat('decision', 'question', '06 / Your next decision', p.question), pauseAfterSeconds: 4 },
      beat('reasoning', 'reasoning', '07 / Conference discussion', `${p.reasoning} ${p.priorities.join(' ')}`),
      beat('reassessment', 'course', '08 / What happened next', p.reassessment),
      { ...beat('synopsis', 'synopsis', '09 / Case synopsis', `Case synopsis. ${p.synopsis}`), narration: `Case synopsis. ${p.synopsis} ${script.synopsis.commentary} Continue to the disease lesson for the underlying physiology and further study.` },
    ];
    return { ...p, topicId: topic.id, topic: topic.title, population: topic.population, diseaseIds: topic.diseaseIds, lessonIds: topic.lessonIds, exams: topic.exams, sources: topic.sources, referenceDisease: topic.referenceDisease, synthetic: true, reviewStatus: 'Clinical review pending', slides };
  });
}
export const transcriptFor = (c: ConferenceCase) => c.slides.map(s => `${s.title}\n${s.narration}${s.pauseAfterSeconds ? `\n[${s.pauseAfterSeconds}-second reflection pause; playback continues automatically.]` : ''}`).join('\n\n');
export const estimatedMinutes = (c: ConferenceCase) => Math.max(1, Math.round(c.slides.map(s => s.narration).join(' ').split(/\s+/).length / 145 + c.slides.reduce((n,s) => n + (s.pauseAfterSeconds ?? 0), 0) / 60));
