import {describe,it,expect} from 'vitest';
import {CONFERENCES,CASE_TOPICS} from '../src/cases/catalog';
import {FPC_BY_ID} from '../src/fpc';
import {DISEASE_BY_ID} from '../src/atlas/registry';
import {conferenceAudioKey} from '../src/cases/audioKey';
import {ATLAS_COVERAGE,LESSON_COVERAGE} from '../src/cases/coverage';

describe('synthetic conference content and coverage',()=>{
  it('has distinct, traceable presentations with real lesson and atlas destinations',()=>{
    expect(new Set(CONFERENCES.map(c=>c.id)).size).toBe(CONFERENCES.length);
    for(const topic of CASE_TOPICS){expect(topic.presentations.length).toBeGreaterThanOrEqual(2);expect(new Set(topic.presentations.map(p=>p.variant)).size).toBe(topic.presentations.length);}
    for(const c of CONFERENCES){for(const id of c.lessonIds)expect(FPC_BY_ID[id],`${c.id}: ${id}`).toBeTruthy();for(const id of c.diseaseIds)expect(DISEASE_BY_ID[id],id).toBeTruthy();}
  });
  it('keeps every displayed observation accessible to an audio-only listener',()=>{
    for(const c of CONFERENCES){
      expect(c.synthetic).toBe(true);expect(c.reviewStatus).toBe('Clinical review pending');
      for(const slide of c.slides){expect(slide.narration.length).toBeGreaterThan(20);for(const d of slide.data??[]){expect(d.spoken.length).toBeGreaterThan(15);expect(slide.narration).toContain(d.spoken);}for(const p of slide.paragraphs??[])expect(slide.narration).toContain(p);for(const b of slide.bullets??[])expect(slide.narration).toContain(b);}
      expect(c.slides.at(-1)?.kind).toBe('synopsis');expect(c.slides.at(-1)?.narration).toContain(c.synopsis);
    }
  });
  it('does not mistake a linked draft for complete atlas or examination coverage',()=>{
    expect(ATLAS_COVERAGE.length).toBeGreaterThan(80);expect(LESSON_COVERAGE.length).toBeGreaterThan(120);
    expect(ATLAS_COVERAGE.some(r=>r.count===0)).toBe(true);
    expect(CONFERENCES.filter(c=>c.population!=='Adult').length).toBeGreaterThan(CONFERENCES.filter(c=>c.population==='Adult').length);
  });
  it('invalidates the audio binding when narration changes',()=>{
    const c=CONFERENCES[0];const revised={...c,slides:c.slides.map((s,i)=>i===0?{...s,narration:s.narration+' Revised observation.'}:s)};
    expect(conferenceAudioKey(c)).not.toBe(conferenceAudioKey(revised));
  });
});
