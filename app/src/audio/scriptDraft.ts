import { MASTERY_BY_ID } from './mastery';
import type { AudioEpisode } from './types';

const spoken = (s: string) => s
  .replaceAll('SpO₂','S P O 2').replaceAll('SvO₂','S V O 2').replaceAll('DO₂','D O 2')
  .replaceAll('VO₂','V O 2').replaceAll('EtCO₂','end tidal C O 2').replaceAll('PaCO₂','P A C O 2')
  .replaceAll('PaO₂','P A O 2').replaceAll('FiO₂','F I O 2').replaceAll('PEEP','peep')
  .replaceAll('CRRT','C R R T').replaceAll('ECMO','E C M O').replaceAll('EVD','E V D')
  .replaceAll('IABP','I A B P').replaceAll('PVR','P V R').replaceAll('SVR','S V R')
  .replaceAll('ARDS','A R D S').replaceAll('RSI','R S I').replaceAll('MTP','M T P');

export function draftTranscriptForEpisode(e: AudioEpisode) {
  if (e.voice?.transcript?.trim()) return e.voice.transcript.trim();

  const parts: string[] = [];
  parts.push(`You're listening to ${e.title}. ${e.subtitle}`);
  parts.push(`This is a level ${e.level} critical-care session. The goal is not to memorize a list. The goal is to build a model that lets you predict what the patient will do next.`);
  if (e.outcomes.length) {
    parts.push('By the end, you should be able to ' + e.outcomes.map((x) => x.replace(/\.$/,'').toLowerCase()).join('; and ') + '.');
  }

  for (const ch of e.chapters) {
    parts.push(`Now: ${ch.title}.`);
    const concepts = ch.conceptIds.map((id) => MASTERY_BY_ID[id]).filter(Boolean);
    for (const c of concepts) {
      parts.push(`${c.name}. ${c.summary}`);
      if (c.vocabulary?.length) parts.push(`Keep these terms available in your mental model: ${c.vocabulary.join(', ')}.`);
      if (c.performance.length) {
        parts.push('What expert-level use of this concept looks like is this: ' + c.performance.join(' '));
      }
    }
    if (ch.prompt) {
      parts.push(`Pause here and answer this before you continue: ${ch.prompt}`);
      parts.push('Do not grade yourself only on whether you found the expected answer. Ask whether your reasoning predicted a physiologic response and what evidence would make you change your mind.');
    } else {
      parts.push('Tie this back to the patient. Ask what variable is changing, what downstream effect you expect, and what bedside finding would support or contradict that model.');
    }
  }

  parts.push('Before you finish, retrieve the model without looking at notes.');
  for (const o of e.outcomes) parts.push(`Can you ${o.replace(/\.$/,'').replace(/^./,(m)=>m.toLowerCase())}?`);
  parts.push('If any part still feels like a memorized phrase instead of a mechanism you can predict with, that is the part to review next.');

  return spoken(parts.join('\n\n'));
}

export function draftWordCount(e: AudioEpisode) {
  return draftTranscriptForEpisode(e).trim().split(/\s+/).filter(Boolean).length;
}
