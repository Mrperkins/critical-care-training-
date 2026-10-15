// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import { DiseaseBrowser } from '../src/atlas/DiseaseBrowser';
import { AtlasModule } from '../src/atlas/AtlasModule';
import { LessonShell } from '../src/app/LessonShell';
import { HeartScene } from '../src/infarct/components/HeartScene';
import type { HeartAsset } from '../src/infarct/asset/heartAsset';
import { useUI } from '../src/app/store';
import { director,useDirector } from '../src/director/director';
import { diseaseLesson } from '../src/atlas/engine';
import { DISEASE_BY_ID } from '../src/atlas/registry';
vi.mock('../src/atlas/PatientScene',()=>({default:()=> <div>Patient anatomy</div>}));
vi.hoisted(()=>Object.defineProperty(window,'matchMedia',{configurable:true,value:vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}))}));
let node:HTMLDivElement,root:Root;
const click=async(text:string)=> {const button=[...node.querySelectorAll('button')].find(b=>b.textContent?.trim()===text);expect(button,text).toBeTruthy();await act(async()=>button!.click());};
beforeEach(()=>{
  (globalThis as unknown as {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
  vi.stubGlobal('requestAnimationFrame',vi.fn(()=>1));vi.stubGlobal('cancelAnimationFrame',vi.fn());
  node=document.createElement('div');document.body.append(node);root=createRoot(node);
  useUI.getState().set({module:'vent',mode:'learn',atlasDisease:null,atlasFrame:null});
});
afterEach(async()=>{await act(async()=>{root.unmount();director.unload();});node.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
describe('disease learning interactions',()=>{
  it('keeps navigation and clinical context available when MI WebGL cannot start',async()=>{
    vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(null);
    await act(async()=>root.render(<><nav><button>Back to learning</button></nav><HeartScene asset={{} as HeartAsset}/><aside>ECG and readings</aside></>));
    expect(node.textContent).toContain('3D view unavailable');expect(node.textContent).toContain('ECG and readings');expect(node.querySelector('nav button')).toBeTruthy();
    await click('Retry 3D view');expect(node.textContent).toContain('3D view unavailable');
  });
  it('searches a common abbreviation and opens the matching disease in Learn',async()=>{
    await act(async()=>root.render(<DiseaseBrowser domain="vent" query="COPD"/>));
    const rows=node.querySelectorAll<HTMLButtonElement>('.disease-row');expect([...rows].some(b=>b.textContent?.includes('Auto-PEEP'))).toBe(true);
    await act(async()=>[...rows].find(b=>b.textContent?.includes('Auto-PEEP'))!.click());expect(useUI.getState().atlasDisease).toBe('auto-peep');expect(useUI.getState().mode).toBe('learn');
  });
  it('keeps fundamentals available behind an initially collapsed group',async()=>{
    await act(async()=>root.render(<LessonShell intro="Basics" lessons={[{id:'sample',title:'Sample foundation',level:'core',blurb:'First principles',steps:[]}]} apply={()=>{}}/>));
    const group=[...node.querySelectorAll('details')].find(d=>d.querySelector('summary')?.textContent?.includes('Fundamentals'))!;
    expect(group).toBeTruthy();expect(group.open).toBe(false);expect(group.textContent).toContain('Sample foundation');expect(node.querySelector('input[type=search]')).toBeTruthy();
  });
  it('reveals the active prediction, pauses playback, and clears it when switching disease',async()=>{
    useUI.getState().set({atlasDisease:'ards'});
    await act(async()=>root.render(<AtlasModule domain="vent"/>));await click('Start 8-chapter explainer');
    const cue=useDirector.getState().tl!.cues.find(c=>c.checkpoint)!;
    await act(async()=>director.seek(cue.at,true));await click('Reveal explanation');expect(useDirector.getState().playing).toBe(false);expect(node.textContent).toContain(cue.checkpoint!.answer);
    await act(async()=>useUI.getState().set({atlasDisease:'pulmonary-embolism'}));expect(useDirector.getState().tl).toBeNull();expect(node.textContent).not.toContain(cue.checkpoint!.answer);
  });
  it('adopts a reopened atlas timeline without resetting its bookmarked frame',async()=>{
    useUI.getState().set({atlasDisease:'ards'});
    const tl=diseaseLesson(DISEASE_BY_ID.ards,(atlasSeverity,atlasTarget,atlasFrame)=>useUI.getState().set({atlasSeverity,atlasTarget,atlasFrame}));
    await act(async()=>{director.load(tl);director.seek(tl.cues[5].at+1);});const frame=useUI.getState().atlasFrame;
    await act(async()=>root.render(<AtlasModule domain="vent"/>));expect(useUI.getState().atlasFrame).toEqual(frame);expect(useDirector.getState().tl?.id).toBe('atlas-ards');
  });
});
