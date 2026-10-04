import fs from 'node:fs';
import path from 'node:path';
import { EPISODES } from '../src/audio/catalog';
import { draftTranscriptForEpisode } from '../src/audio/scriptDraft';

const MAX_CHARS = 4400;
const out = path.resolve('public/audio/production');
const partsDir = path.join(out, 'parts');
fs.mkdirSync(partsDir, { recursive: true });

function splitTranscript(text: string) {
  const paragraphs = text.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  const parts: string[] = []; let cur = '';
  const push = () => { if (cur.trim()) parts.push(cur.trim()); cur = ''; };
  for (const p of paragraphs) {
    if ((cur ? cur.length + 2 : 0) + p.length <= MAX_CHARS) {
      cur += (cur ? '\n\n' : '') + p; continue;
    }
    push();
    if (p.length <= MAX_CHARS) { cur = p; continue; }
    // Very long paragraph: preserve sentence boundaries where possible.
    const sentences = p.match(/[^.!?]+[.!?]+(?:["'”’)]*)|[^.!?]+$/g) ?? [p];
    for (const raw of sentences) {
      const sentence = raw.trim();
      if ((cur ? cur.length + 1 : 0) + sentence.length > MAX_CHARS) push();
      if (sentence.length > MAX_CHARS) {
        for (let i = 0; i < sentence.length; i += MAX_CHARS) parts.push(sentence.slice(i, i + MAX_CHARS));
      } else cur += (cur ? ' ' : '') + sentence;
    }
  }
  push(); return parts;
}

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
