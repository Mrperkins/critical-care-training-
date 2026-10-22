import { NARRATOR } from '../audio/narrator';
import type { ConferenceCase } from './types';
/** A portable content fingerprint to refuse stale audio. Not a security hash. */
export function conferenceAudioKey(c: ConferenceCase) {
  const text = JSON.stringify([NARRATOR, c.slides.map(s => [s.id,s.narration])]);
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8,'0');
}
