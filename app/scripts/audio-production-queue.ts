import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { EPISODES, MENTAL_REPS } from '../src/audio/catalog';
import { draftTranscriptForEpisode, draftWordCount } from '../src/audio/scriptDraft';

const out = path.resolve('public/audio/production');
const scripts = path.join(out,'scripts');
fs.mkdirSync(scripts,{recursive:true});

const hash = (s:string) => crypto.createHash('sha256').update(s).digest('hex').slice(0,16);
const queue:any[]=[];

for (const e of EPISODES) {
  const transcript=draftTranscriptForEpisode(e);
  const id=`episode.${e.id}`;
  fs.writeFileSync(path.join(scripts,`${id}.txt`),transcript+'\n');
  queue.push({
    id, kind:'episode', title:e.title, domain:e.domain, level:e.level, format:e.format,
    transcriptHash:hash(transcript), words:draftWordCount(e), estimatedMinutes:Math.max(1,Math.round(draftWordCount(e)/145)),
    source:e.voice?.transcript ? 'authored' : 'deterministic-draft',
    voiceStatus:e.voice?.src ? 'durable' : e.voice?.previewSrc ? 'preview' : 'not-rendered',
    clinicalReview:e.voice?.reviewed ? 'approved' : 'required',
    pronunciationReview:e.voice?.reviewed ? 'approved' : 'required',
    listeningReview:e.voice?.reviewed ? 'approved' : 'required',
  });
}
for (const r of MENTAL_REPS) for (const b of r.beats) queue.push({
  id:`rep.${r.id}.${b.id}`, kind:'mental-rep', title:`${r.title} · ${b.title}`, domain:r.domain, level:r.level,
  transcriptHash:hash(b.narration), words:b.narration.split(/\s+/).length, estimatedMinutes:1,
  source:'authored', voiceStatus:b.voice?.src?'durable':b.voice?.previewSrc?'preview':'not-rendered',
  clinicalReview:b.voice?.reviewed?'approved':'required',
  pronunciationReview:b.voice?.reviewed?'approved':'required',
  listeningReview:b.voice?.reviewed?'approved':'required',
});
fs.writeFileSync(path.join(out,'queue.json'),JSON.stringify({generatedAt:new Date().toISOString(),items:queue},null,2)+'\n');
console.log(`${EPISODES.length} episode scripts + ${queue.length-EPISODES.length} Mental Rep beats queued`);
