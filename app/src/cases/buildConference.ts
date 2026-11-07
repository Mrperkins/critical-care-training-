import { CONFERENCE_SCRIPTS } from './conferenceScripts';
import { CLINICAL_REVIEWS } from './clinicalReviews';
import type { CaseDatum, CaseTopic, ConferenceBeatId, ConferenceCase, ConferenceSlide } from './types';

/** Concise screen evidence and a fuller speaker track share clinical facts, not paragraphs. */
export function buildConference(topic: CaseTopic): ConferenceCase[] {
  return topic.presentations.map(p => {
    const script = CONFERENCE_SCRIPTS[p.id];
    if (!script) throw new Error(`Missing authored conference script for ${p.id}`);
    const review = CLINICAL_REVIEWS[p.id];
    if (!review) throw new Error(`Missing clinical review for ${p.id}`);
    const enrich = (data: CaseDatum[]) => data.map(d => {
      const teaching = review.findings[d.label];
      if (!teaching) throw new Error(`Missing finding interpretation for ${p.id}: ${d.label}`);
      return {...d,teaching};
    });
    const vitals = enrich(p.vitals), labs = enrich(p.labs);
    const speakFindings = (data: CaseDatum[]) => data.map(d => `${d.spoken} ${d.teaching!.reference.text} ${d.teaching!.interpretation} ${d.teaching!.associations}`).join(' ');
    const sources = [...new Map([...topic.sources,...(review.sources??[]),...[...vitals,...labs].map(d=>d.teaching!.reference.source)].map(s=>[s.url,s])).values()];
    const beat = (id: ConferenceBeatId, kind: ConferenceSlide['kind'], label: string, narrative: string, data?: ConferenceSlide['data']): ConferenceSlide => ({
      id, kind, label, title: script[id].title, bullets: script[id].points.length ? script[id].points : undefined,
      focus: script[id].focus, data,
      narration: `${narrative} ${script[id].commentary}`,
    });
    const slides: ConferenceSlide[] = [
      beat('presentation', 'scene', '01 / The handoff', `Case conference. ${review.diagnosis}. This is a fictional teaching case, with clinical review pending. ${p.patient} ${p.story} ${review.handoff}`),
      beat('assessment', 'scene', '02 / At the bedside', p.exam),
      beat('vitals', 'vitals', '03 / First observations', speakFindings(vitals), vitals),
      beat('labs', 'labs', '04 / The investigation', speakFindings(labs), labs),
      { ...beat('diagnostics', 'diagnostics', '05 / Interpret the evidence', `${p.diagnostics} ${review.imaging?.narration ?? (topic.referenceDisease ? ' An optional comparison image in the visual presentation comes from a different patient; it is not this fictional patient’s study.' : '')}`), comparisonIds:review.imaging?.ids },
      { ...beat('decision', 'question', '06 / Your next decision', p.question), pauseAfterSeconds: 4 },
      beat('reasoning', 'reasoning', '07 / Conference discussion', `${p.reasoning} ${p.priorities.join(' ')}`),
      beat('reassessment', 'course', '08 / What happened next', `${p.reassessment} ${review.course}`),
      { ...beat('synopsis', 'synopsis', '09 / Case synopsis', `Case synopsis. ${p.synopsis}`), title:review.diagnosis, narration: `Case synopsis. ${review.diagnosis}. ${p.synopsis} ${script.synopsis.commentary} Continue to the disease lesson for the underlying physiology and further study.` },
    ];
    return { ...p, diagnosis:review.diagnosis, vitals, labs, topicId: topic.id, topic: topic.title, population: topic.population, diseaseIds: topic.diseaseIds, lessonIds: topic.lessonIds, exams: topic.exams, sources, referenceDisease: topic.referenceDisease, synthetic: true, reviewStatus: 'Clinical review pending', slides };
  });
}
export const transcriptFor = (c: ConferenceCase) => c.slides.map(s => `${s.title}\n${s.narration}${s.pauseAfterSeconds ? `\n[${s.pauseAfterSeconds}-second reflection pause; playback continues automatically.]` : ''}`).join('\n\n');
export const estimatedMinutes = (c: ConferenceCase) => Math.max(1, Math.round(c.slides.map(s => s.narration).join(' ').split(/\s+/).length / 145 + c.slides.reduce((n,s) => n + (s.pauseAfterSeconds ?? 0), 0) / 60));
