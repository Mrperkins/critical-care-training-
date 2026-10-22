/** Verify shipped conferences, current narration bindings, playable media and complete chapter maps. */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {CONFERENCES} from '../src/cases/catalog';
import {conferenceAudioKey,conferenceAssetPaths} from '../src/cases/audioKey';
import {transcriptFor} from '../src/cases/buildConference';
import type {ConferenceAudio} from '../src/cases/types';
const root=path.resolve('public/conferences');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')) as {assets:Record<string,ConferenceAudio>};
let total=0;
for(const c of CONFERENCES){
  const a=manifest.assets[c.id];assert(a,`Missing audio ${c.id}`);assert.equal(a.transcriptHash,conferenceAudioKey(c),`Stale audio ${c.id}`);
  assert.equal(a.file,conferenceAssetPaths(c).audio,`Unversioned audio path ${c.id}`);
  assert.deepEqual(a.chapters.map(ch=>ch.id),c.slides.map(s=>s.id),`Chapter mismatch ${c.id}`);
  let previous=0;for(const ch of a.chapters){assert(Math.abs(ch.start-previous)<.01,`Chapter gap ${c.id}/${ch.id}`);assert(ch.end>ch.start);previous=ch.end;}
  const file=path.join(root,a.file);assert(fs.statSync(file).size>1000,`Empty media ${c.id}`);
  const seconds=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',file],{encoding:'utf8'}));
  assert(Number.isFinite(seconds)&&seconds>10);assert(Math.abs(seconds-a.seconds)<.1);assert(Math.abs(previous-seconds)<1,`Chapter drift ${c.id}`);
  execFileSync('ffmpeg',['-v','error','-i',file,'-f','null','-'],{stdio:'pipe'});
  for(const [i,s] of c.slides.entries())if(s.pauseAfterSeconds){
    const chapter=a.chapters[i];assert(chapter.end-chapter.start>s.pauseAfterSeconds);
    // Inspect the middle of the recorded pause, away from MP3 frame-boundary rounding.
    const meter=spawnSync('ffmpeg',['-hide_banner','-ss',String(chapter.end-s.pauseAfterSeconds+1),'-i',file,'-t',String(s.pauseAfterSeconds-2),'-af','volumedetect','-f','null','-'],{encoding:'utf8'});
    assert.equal(meter.status,0,`Pause decode failed ${c.id}`);
    const match=/max_volume:\s*(-?(?:\d+(?:\.\d+)?|inf))\s*dB/.exec(meter.stderr);
    assert(match,`No pause measurement ${c.id}`);
    const peak=match[1]==='-inf'?-Infinity:Number(match[1]);
    assert(peak<=-70,`Reflection pause contains audio ${c.id}: ${peak} dB`);
  }
  assert.equal(fs.readFileSync(path.join(root,conferenceAssetPaths(c).transcript),'utf8'),transcriptFor(c)+'\n',`Transcript mismatch ${c.id}`);total+=seconds;
}
console.log(`${CONFERENCES.length} complete, current, decodable conference files; ${Math.round(total/60)} minutes; ${CONFERENCES.reduce((n,c)=>n+c.slides.length,0)} measured chapters.`);
