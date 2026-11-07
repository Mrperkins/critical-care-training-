import { describe, it, expect } from 'vitest';
import { EXPLAINERS } from '../src/atlas/explainers';
import { DISEASE_BY_ID } from '../src/atlas/registry';
import { diseaseLesson, HEALTHY } from '../src/atlas/engine';
import { advance, duration, resolve } from '../src/director/timeline';
import { chamberScale } from '../src/atlas/mechanismPose';
import { recommendedLesson, missingPrereqs } from '../src/curriculum/progress';
import { matchesDisease } from '../src/atlas/DiseaseBrowser';
import type { DiseaseState } from '../src/atlas/types';

describe('expanded disease mechanisms',()=>{
  it.each(Object.keys(EXPLAINERS))('%s replays the same channels after forward playback or direct seek',id=>{
    let frame:DiseaseState={...HEALTHY};
    const tl=diseaseLesson(DISEASE_BY_ID[id],(_s,_t,f)=>{frame=f!;});
    expect(tl.cues.length).toBeGreaterThanOrEqual(6);
    expect(tl.cues.some(c=>c.checkpoint)).toBe(true);
    for(const point of [.13,.38,.69,.95,1]) {
      const t=duration(tl)*point;resolve(tl,0);
      let previous=0;while(previous<t){const next=Math.min(t,previous+.2);advance(tl,previous,next);previous=next;}
      const played={...frame};resolve(tl,t);expect(frame).toEqual(played);
      resolve(tl,0);expect(frame).toEqual(HEALTHY);resolve(tl,t);expect(frame).toEqual(played);
      for(const value of Object.values(frame)){expect(value).toBeGreaterThanOrEqual(0);expect(value).toBeLessThanOrEqual(1);}
    }
  });
  it('recruitment improves aeration without erasing barrier injury or edema',()=>{
    const stages=EXPLAINERS.ards.chapters;const before=stages[4].state,after=stages[5].state;
    expect(after.collapse).toBeLessThan(before.collapse!);expect(after.shunt).toBeLessThan(before.shunt!);
    expect(after.fluid).toBe(before.fluid);expect(after.inflammation).toBe(before.inflammation);
  });
  it('separates clot, downstream flow and the right-heart response',()=>{
    const s={...HEALTHY,obstruction:.8,pressure:.8,flowLoss:.8};
    expect(chamberScale('rv','pulmonary-embolism',s)).toBeGreaterThan(1);
    expect(chamberScale('lv','pulmonary-embolism',s)).toBeLessThan(1);
    expect(chamberScale('rv','tamponade',s)).toBeLessThan(1);
    const early=EXPLAINERS['pulmonary-embolism'].chapters[1].state;expect(early.obstruction).toBeGreaterThan(0);expect(early.flowLoss).toBeUndefined();
  });
  it('starts a new learner with the foundation and respects prerequisites thereafter',()=>{
    expect(recommendedLesson({})?.id).toBe('eom');const completed={eom:'today'};const next=recommendedLesson(completed)!;
    expect(next.id).not.toBe('eom');expect(missingPrereqs(next,completed)).toEqual([]);
  });
  it('finds common abbreviations without changing the disease title',()=>{
    expect(matchesDisease(DISEASE_BY_ID['pulmonary-embolism'],'PE')).toBe(true);
    expect(matchesDisease(DISEASE_BY_ID['auto-peep'],'COPD')).toBe(true);
    expect(matchesDisease(DISEASE_BY_ID['pulmonary-edema'],'CHF')).toBe(true);
  });
});
