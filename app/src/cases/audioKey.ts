import { NARRATOR } from '../audio/narrator';
import type { ConferenceCase } from './types';
/** A portable content fingerprint to refuse stale audio. Not a security hash. */
export function conferenceAudioKey(c: ConferenceCase) {
  const text = JSON.stringify([NARRATOR, c.slides.map(s => [s.id,s.narration,s.pauseAfterSeconds ?? 0])]);
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8,'0');
}
/** Filenames, rather than query strings, also bypass older workers that ignore URL searches. */
export const conferenceAssetPaths = (c: ConferenceCase) => {
  const name = `${c.id}.${conferenceAudioKey(c)}`;
  return { audio:`audio/${name}.mp3`, transcript:`transcripts/${name}.txt` };
};
