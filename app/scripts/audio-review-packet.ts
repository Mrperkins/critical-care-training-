/**
 * Human review packet for Critical Care Audio.
 * Generates a CSV that can be reviewed by a clinical SME + listening QA before an asset is publishable.
 */
import fs from 'node:fs';
import path from 'node:path';
import { EPISODES, MENTAL_REPS } from '../src/audio/catalog';

const rows: Record<string,string|number>[] = [];
for (const e of EPISODES) {
  rows.push({
    id: `episode.${e.id}`, kind: e.format, title: e.title, level: e.level,
    concepts: e.concepts.join('; '), status: e.status,
    transcript: e.voice?.transcript ?? '',
    clinical_verdict: '', pronunciation_verdict: '', listening_verdict: '',
    reviewer: '', reviewed_date: '', notes: '',
  });
}
for (const r of MENTAL_REPS) for (const b of r.beats) {
  rows.push({
    id: `rep.${r.id}.${b.id}`, kind: 'mental-rep', title: `${r.title} · ${b.title}`, level: r.level,
    concepts: r.concepts.join('; '), status: b.voice ? 'voice-ready' : 'scripted',
    transcript: b.narration,
    clinical_verdict: '', pronunciation_verdict: '', listening_verdict: '',
    reviewer: '', reviewed_date: '', notes: '',
  });
}
const cols=['id','kind','title','level','concepts','status','transcript','clinical_verdict','pronunciation_verdict','listening_verdict','reviewer','reviewed_date','notes'];
const csv=(v:unknown)=>`"${String(v??'').replaceAll('"','""')}"`;
const out=path.resolve('../review'); fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'audio-review-packet.csv'), [cols.map(csv).join(','),...rows.map(r=>cols.map(c=>csv(r[c])).join(','))].join('\n')+'\n');
fs.writeFileSync(path.join(out,'audio-review-packet.json'), JSON.stringify({generatedAt:new Date().toISOString(),rows},null,2)+'\n');
console.log(`${rows.length} audio review rows`);
