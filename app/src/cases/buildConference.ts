import type { CaseTopic, ConferenceCase, ConferenceSlide } from './types';

/** Every visual fact is also spoken. One continuous audio file avoids background chapter handoff. */
export function buildConference(topic: CaseTopic): ConferenceCase[] {
  return topic.presentations.map(p => {
    const slides: ConferenceSlide[] = [
      { id: 'presentation', kind: 'scene', label: '01 / The handoff', title: p.title, paragraphs: [p.patient, p.story], narration: `Case conference. ${p.title}. This is a fictional teaching case, with clinical review pending. ${p.patient} ${p.story}` },
      { id: 'assessment', kind: 'scene', label: '02 / At the bedside', title: 'What do you notice?', paragraphs: [p.exam], narration: `At the bedside. ${p.exam}` },
      { id: 'vitals', kind: 'vitals', label: '03 / First observations', title: 'Vital signs', data: p.vitals, narration: `The initial vital signs are as follows. ${p.vitals.map(d => d.spoken).join(' ')} These are observations at this point in the case, rather than treatment targets.` },
      { id: 'labs', kind: 'labs', label: '04 / The investigation', title: 'Laboratory findings', data: p.labs, narration: `Laboratory findings. ${p.labs.map(d => d.spoken).join(' ')} Interpret these results alongside the examination and the timing of sampling.` },
      { id: 'diagnostics', kind: 'diagnostics', label: '05 / Pattern recognition', title: 'Diagnostic findings', paragraphs: [p.diagnostics], narration: `Diagnostic findings. ${p.diagnostics}${topic.referenceDisease ? ' In visual mode, an optional real reference image can be opened. It belongs to a different patient and is not the scan from this fictional case.' : ''}` },
      { id: 'decision', kind: 'question', label: '06 / Think it through', title: 'What would you prioritize?', paragraphs: [p.question], narration: `Think it through. ${p.question} Consider your answer while the case continues. No screen interaction is needed.` },
      { id: 'reasoning', kind: 'reasoning', label: '07 / Conference discussion', title: 'Clinical reasoning & priorities', paragraphs: [p.reasoning], bullets: p.priorities, narration: `Conference discussion. ${p.reasoning} Priorities. ${p.priorities.map((v, i) => `${i + 1}. ${v}`).join(' ')}` },
      { id: 'reassessment', kind: 'course', label: '08 / Follow the course', title: 'Reassessment & handoff', paragraphs: [p.reassessment], narration: `Reassessment and handoff. ${p.reassessment} This is an authored fictional course; improvement is not guaranteed in a real patient.` },
      { id: 'synopsis', kind: 'synopsis', label: '09 / Case synopsis', title: `${topic.title}: ${p.variant}`, paragraphs: [p.synopsis], narration: `Case synopsis. ${topic.title}. ${p.variant}. ${p.synopsis} This concludes the case conference. Continue to the disease lesson for the underlying physiology and further study.` },
    ];
    return { ...p, topicId: topic.id, topic: topic.title, population: topic.population, diseaseIds: topic.diseaseIds, lessonIds: topic.lessonIds, exams: topic.exams, sources: topic.sources, referenceDisease: topic.referenceDisease, synthetic: true, reviewStatus: 'Clinical review pending', slides };
  });
}
export const transcriptFor = (c: ConferenceCase) => c.slides.map(s => `${s.title}\n${s.narration}`).join('\n\n');
export const estimatedMinutes = (c: ConferenceCase) => Math.max(1, Math.round(c.slides.map(s => s.narration).join(' ').split(/\s+/).length / 145));
