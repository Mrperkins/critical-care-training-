import {it,expect} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {CONFERENCES} from '../src/cases/catalog';
import {conferenceAssetPaths,conferenceAudioKey} from '../src/cases/audioKey';
import {transcriptFor} from '../src/cases/buildConference';
import type {ConferenceAudio} from '../src/cases/types';

it('ships the exact current recording and transcript revision for every authored conference',()=>{
  const root='public/conferences';
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')) as {assets:Record<string,ConferenceAudio>};
  expect(Object.keys(manifest.assets).sort()).toEqual(CONFERENCES.map(c=>c.id).sort());
  for(const c of CONFERENCES){
    const asset=manifest.assets[c.id],paths=conferenceAssetPaths(c);
    expect(asset.transcriptHash,c.id).toBe(conferenceAudioKey(c));
    expect(asset.file,c.id).toBe(paths.audio);
    expect(fs.statSync(path.join(root,asset.file)).size,c.id).toBeGreaterThan(1000);
    expect(fs.readFileSync(path.join(root,paths.transcript),'utf8'),c.id).toBe(transcriptFor(c)+'\n');
    expect(asset.chapters.map(ch=>ch.id),c.id).toEqual(c.slides.map(s=>s.id));
    let end=0;
    for(const chapter of asset.chapters){expect(chapter.start).toBeCloseTo(end,2);expect(chapter.end).toBeGreaterThan(chapter.start);end=chapter.end;}
    expect(Math.abs(end-asset.seconds),c.id).toBeLessThan(1);
  }
});
