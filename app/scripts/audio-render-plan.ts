import fs from 'node:fs';
import path from 'node:path';
import { EPISODES } from '../src/audio/catalog';
import { draftTranscriptForEpisode } from '../src/audio/scriptDraft';
import { splitTranscript, MAX_PART_CHARS } from '../src/audio/split';

const MAX_CHARS = MAX_PART_CHARS;
const out = path.resolve('public/audio/production');
const partsDir = path.join(out, 'parts');
fs.mkdirSync(partsDir, { recursive: true });

const episodes = EPISODES.map((e) => {
  const transcript = draftTranscriptForEpisode(e);
  const parts = splitTranscript(transcript).map((text, i) => {
    const n = String(i + 1).padStart(3, '0');
    const id = `episode.${e.id}.part${n}`;
    fs.writeFileSync(path.join(partsDir, `${id}.txt`), text + '\n');
    return { id, index: i, chars: text.length, words: text.split(/\s+/).length, text };
  });
  return {
    episodeId: e.id, title: e.title, format: e.format, domain: e.domain, declaredMinutes: e.minutes,
    totalChars: transcript.length, totalWords: transcript.split(/\s+/).length,
    parts: parts.map(({ text, ...meta }) => meta),
  };
});
fs.writeFileSync(path.join(out, 'render-plan.json'), JSON.stringify({
  generatedAt: new Date().toISOString(), maxCharsPerPart: MAX_CHARS,
  episodes, totals: { episodes: episodes.length, parts: episodes.reduce((n,e)=>n+e.parts.length,0), chars: episodes.reduce((n,e)=>n+e.totalChars,0) }
}, null, 2) + '\n');
console.log(`${episodes.length} episodes -> ${episodes.reduce((n,e)=>n+e.parts.length,0)} render parts`);
