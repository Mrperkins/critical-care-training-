import {it,expect} from 'vitest';
import {CONFERENCES} from '../src/cases/catalog';
import {conferenceAssetPaths,conferenceAudioKey} from '../src/cases/audioKey';

it('changes the media pathname itself when a recording is revised, bypassing caches that ignore query strings',()=>{
  const c=CONFERENCES.find(c=>c.id==='asthma-silent-chest')!;
  const revised={...c,slides:c.slides.map((s,i)=>i===0?{...s,narration:s.narration+' An updated clinical finding.'}:s)};
  const original=conferenceAssetPaths(c),next=conferenceAssetPaths(revised);
  for(const kind of ['audio','transcript'] as const){
    expect(original[kind]).toContain(conferenceAudioKey(c));
    expect(original[kind]).not.toContain('?');
    expect(new URL(original[kind],'https://example.test/').pathname).not.toBe(new URL(next[kind],'https://example.test/').pathname);
  }
  expect(original.audio).toMatch(/\.mp3$/);expect(original.transcript).toMatch(/\.txt$/);
});
