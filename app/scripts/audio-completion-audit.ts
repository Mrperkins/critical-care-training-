import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { EPISODES, MENTAL_REPS } from '../src/audio/catalog';
import type { AudioEpisode } from '../src/audio/types';
import { MASTERY, MASTERY_BY_ID } from '../src/audio/mastery';
import { EXPERT_TRACKS } from '../src/audio/tracks';
import { draftTranscriptForEpisode } from '../src/audio/scriptDraft';

const voiceManifestPath = path.resolve('public/audio/voice/manifest.json');
const voiceManifest = fs.existsSync(voiceManifestPath) ? JSON.parse(fs.readFileSync(voiceManifestPath,'utf8')) as { assets?: { id:string; file:string; transcriptHash?:string; reviewed?:boolean }[] } : { assets:[] };
const durableVoice = new Map((voiceManifest.assets ?? []).map((a)=>[a.id,a]));
const durableVoiceIds = new Set(durableVoice.keys());
const transcriptHash = (text:string) => crypto.createHash('sha256').update(text.replace(/\s+/g,' ').trim()).digest('hex').slice(0,16);

const requiredReps = [
  'rep-push-dose-pressor','rep-blood','rep-art-line','rep-efast','rep-chest-tube',
  'rep-central-line','rep-us-piv','rep-rsi','rep-post-intubation','rep-pac',
  'rep-crrt','rep-ecmo','rep-iabp','rep-sedation','rep-status',
  'rep-io','rep-vent-emergency','rep-evd','rep-mtp','rep-escharotomy','rep-finger-thoracostomy','rep-cricothyrotomy','rep-pocus-shock'
];

const audioCovered = new Set(EPISODES.flatMap(e=>e.concepts));
const repIds = new Set(MENTAL_REPS.map(r=>r.id));
const missingAudio = MASTERY.filter(c=>!audioCovered.has(c.id)).map(c=>c.id);
const missingReps = requiredReps.filter(id=>!repIds.has(id));
const mentalRepLines = MENTAL_REPS.flatMap(r=>r.beats.map(b=>({id:`rep.${r.id}.${b.id}`,text:b.narration})));
const missingMentalRepVoice = mentalRepLines.filter(x=>!durableVoiceIds.has(x.id)).map(x=>x.id);
const staleMentalRepVoice = mentalRepLines.filter(x=>{
  const a=durableVoice.get(x.id); return !!a && a.transcriptHash !== transcriptHash(x.text);
}).map(x=>x.id);
const dangling = MASTERY.flatMap(c=>[
  ...c.prereq.filter(id=>!MASTERY_BY_ID[id]).map(id=>`${c.id}:prereq:${id}`),
  ...c.related.filter(id=>!MASTERY_BY_ID[id]).map(id=>`${c.id}:related:${id}`)
]);
const minimumWords: Record<AudioEpisode['format'],number> = {
  'daily-dose':350, 'rounds':900, 'icu-literacy':650, 'audio-case':1100, 'deep-dive':2200, 'mental-rep':0
};
const shallowScripts = EPISODES.map(e=>({id:e.id,format:e.format,words:draftTranscriptForEpisode(e).trim().split(/\s+/).length,min:minimumWords[e.format]}))
  .filter(x=>x.words<x.min);
const untrackedEpisodes = EPISODES.filter(e=>!EXPERT_TRACKS.some(t=>t.episodes.some(x=>x.id===e.id))).map(e=>e.id);
const falselyPublished = EPISODES.filter(e=>e.status==='published' && (!e.voice?.reviewed || !e.voice?.src)).map(e=>e.id);

const report = {
  generatedAt:new Date().toISOString(),
  counts:{
    masteryConcepts:MASTERY.length,
    audioEpisodes:EPISODES.length,
    mentalReps:MENTAL_REPS.length,
    expertTracks:EXPERT_TRACKS.length,
    audioCoveredConcepts:MASTERY.length-missingAudio.length
  },
  gates:{missingAudio,missingReps,missingMentalRepVoice,staleMentalRepVoice,dangling,shallowScripts,untrackedEpisodes,falselyPublished},
  complete:![missingAudio,missingReps,missingMentalRepVoice,staleMentalRepVoice,dangling,shallowScripts,untrackedEpisodes,falselyPublished].some(x=>x.length)
};

const out=path.resolve('../review'); fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'audio-completion-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(!report.complete) process.exitCode=1;
