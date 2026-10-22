// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import fs from 'node:fs';
import {RealCaseCard} from '../src/scene/imaging/RealCase';
import type {RealItem} from '../src/scene/imaging/RealExamples';
import {CasePlayer} from '../src/cases/CasePlayer';
import {CONFERENCES} from '../src/cases/catalog';
import {conferenceAssetPaths,conferenceAudioKey} from '../src/cases/audioKey';
const item:RealItem=JSON.parse(fs.readFileSync('../imaging/real/manifest.json','utf8')).items.find((i:RealItem)=>i.id==='peds-croup-steeple-2019');
let root:Root,container:HTMLDivElement;
beforeEach(()=>{
  (globalThis as unknown as {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
  container=document.createElement('div');document.body.append(container);root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('shows the real finding, description and annotation during a conference without requiring an answer',async()=>{
  await act(async()=>root.render(<RealCaseCard it={item} teachingMode/>));
  expect(container.querySelector('img')?.getAttribute('src')).toBe(`imaging/real/${item.file}`);
  expect(container.querySelector('img')?.getAttribute('alt')).toBe(item.caption);
  expect(container.querySelector('.rc-quiz')).toBeNull();
  expect(container.querySelector('.rc-ov ellipse')).toBeTruthy();
  expect(container.querySelector('.rc-lab')?.textContent).toBe('Steeple sign');
  expect(container.textContent).toContain(item.credit);
  expect(container.textContent).toContain(item.look[0]);
  await act(async()=>[...container.querySelectorAll('button')].find(b=>b.textContent==='Source')!.click());
  expect(container.textContent).toContain(item.source);
  expect(container.querySelector(`a[href="${item.licenseUrl}"]`)).toBeTruthy();
});
it('preserves the atlas quiz and answer-gated overlays outside conference mode',async()=>{
  await act(async()=>root.render(<RealCaseCard it={item}/>));
  expect(container.querySelector('.rc-quiz')).toBeTruthy();
  expect(container.querySelector('.rc-ov')).toBeNull();
  const pathology=[...container.querySelectorAll('button')].find(b=>b.textContent==='Show pathology')!;
  expect(pathology.disabled).toBe(true);
  await act(async()=>container.querySelectorAll<HTMLButtonElement>('.rc-opt')[item.quiz!.answer].click());
  expect(pathology.disabled).toBe(false);
  await act(async()=>pathology.click());
  expect(container.querySelector('.rc-ov ellipse')).toBeTruthy();
});
it('revalidates the media manifest and downloads the transcript for the current recorded revision',async()=>{
  const c=CONFERENCES.find(c=>c.id==='asthma-silent-chest')!,paths=conferenceAssetPaths(c);
  vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
  const fetch=vi.fn(async()=>({ok:true,json:async()=>({assets:{[c.id]:{file:paths.audio,transcriptHash:conferenceAudioKey(c),seconds:90,chapters:c.slides.map((s,i)=>({id:s.id,start:i*10,end:(i+1)*10}))}}})}));
  vi.stubGlobal('fetch',fetch);
  await act(async()=>root.render(<CasePlayer c={c} onBack={()=>{}} onContinue={()=>{}}/>));
  expect(fetch).toHaveBeenCalledWith('conferences/manifest.json',{cache:'no-cache'});
  const links=[...container.querySelectorAll('a')];
  expect(links.find(a=>a.textContent==='Download audio')?.getAttribute('href')).toBe(`conferences/${paths.audio}`);
  expect(links.find(a=>a.textContent==='Download transcript')?.getAttribute('href')).toBe(`conferences/${paths.transcript}`);
});
