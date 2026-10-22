/** Verify shipped conferences, current narration bindings, playable media and complete chapter maps. */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {CONFERENCES} from '../src/cases/catalog';
import {conferenceAudioKey} from '../src/cases/audioKey';
import type {ConferenceAudio} from '../src/cases/types';
const root=path.resolve('public/conferences');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')) as {assets:Record<string,ConferenceAudio>};
let total=0;
for(const c of CONFERENCES){
  const a=manifest.assets[c.id];assert(a,`Missing audio ${c.id}`);assert.equal(a.transcriptHash,conferenceAudioKey(c),`Stale audio ${c.id}`);
  assert.deepEqual(a.chapters.map(ch=>ch.id),c.slides.map(s=>s.id),`Chapter mismatch ${c.id}`);
  let previous=0;for(const ch of a.chapters){assert(Math.abs(ch.start-previous)<.01,`Chapter gap ${c.id}/${ch.id}`);assert(ch.end>ch.start);previous=ch.end;}
  const file=path.join(root,a.file);assert(fs.statSync(file).size>1000,`Empty media ${c.id}`);
  const seconds=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',file],{encoding:'utf8'}));
  assert(Number.isFinite(seconds)&&seconds>10);assert(Math.abs(seconds-a.seconds)<.1);assert(Math.abs(previous-seconds)<1,`Chapter drift ${c.id}`);
  execFileSync('ffmpeg',['-v','error','-i',file,'-f','null','-'],{stdio:'pipe'});
  assert(fs.readFileSync(path.join(root,'transcripts',`${c.id}.txt`),'utf8').includes(c.synopsis));total+=seconds;
}
console.log(`${CONFERENCES.length} complete, current, decodable conference files; ${Math.round(total/60)} minutes; ${CONFERENCES.reduce((n,c)=>n+c.slides.length,0)} measured chapters.`);
