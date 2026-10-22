// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {CasePlayer,chapterAt} from '../src/cases/CasePlayer';
import {CONFERENCES} from '../src/cases/catalog';
import {conferenceAudioKey} from '../src/cases/audioKey';
import type {ConferenceAudio} from '../src/cases/types';
let root:Root,container:HTMLDivElement;
const c=CONFERENCES[0];
const asset:ConferenceAudio={file:'audio/test.mp3',transcriptHash:conferenceAudioKey(c),seconds:90,chapters:c.slides.map((s,i)=>({id:s.id,start:i*10,end:(i+1)*10}))};
beforeEach(()=>{
  (globalThis as unknown as {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
  vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({assets:{[c.id]:asset}})})));
  container=document.createElement('div');document.body.append(container);root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();localStorage.clear();});
const button=(text:string)=>{const b=[...container.querySelectorAll('button')].find(b=>b.textContent===text);if(!b)throw new Error(`Missing ${text}`);return b;};
const mount=async()=>act(async()=>root.render(<CasePlayer c={c} onBack={()=>{}} onContinue={()=>{}}/>));
it('keeps the same continuous media element when switching from slides to listening',async()=>{
  await mount();const a=container.querySelector('audio');expect(a).toBeTruthy();
  await act(async()=>button('Listen').click());expect(container.querySelector('audio')).toBe(a);expect(container.querySelector('.conference-slide')).toBeNull();
  await act(async()=>button('Watch slides').click());expect(container.querySelector('audio')).toBe(a);
});
it('seeks to measured chapter times and advances slides from audio progress',async()=>{
  await mount();const a=container.querySelector('audio')!;
  await act(async()=>button('Next slide →').click());expect(a.currentTime).toBe(10);
  await act(async()=>{a.currentTime=35;a.dispatchEvent(new Event('timeupdate'));});
  expect(container.querySelector('.conference-slide h3')?.textContent).toBe(c.slides[3].title);
  expect(chapterAt(asset,asset.seconds)).toBe(c.slides.length-1);
});
it('rejects stale narration while preserving the full visual case and transcript',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({assets:{[c.id]:{...asset,transcriptHash:'stale'}}})})));
  await mount();expect(container.querySelector('audio')).toBeNull();expect(container.textContent).toContain('Current narration is not available');expect(container.textContent).toContain(c.slides.at(-1)!.narration);
});
it('stops media on unmount',async()=>{
  await mount();const pause=vi.spyOn(container.querySelector('audio')!,'pause');await act(async()=>root.unmount());expect(pause).toHaveBeenCalled();root=createRoot(container);
});
