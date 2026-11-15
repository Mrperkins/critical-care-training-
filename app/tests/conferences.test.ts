import {describe,it,expect} from 'vitest';
import {CONFERENCES,CASE_TOPICS} from '../src/cases/catalog';
import {FPC_BY_ID} from '../src/fpc';
import {DISEASE_BY_ID} from '../src/atlas/registry';
import {conferenceAudioKey} from '../src/cases/audioKey';
import {ATLAS_COVERAGE,LESSON_COVERAGE} from '../src/cases/coverage';
import {CONFERENCE_SCRIPTS} from '../src/cases/conferenceScripts';
import {transcriptFor} from '../src/cases/buildConference';

describe('synthetic conference content and coverage',()=>{
  it('has distinct, traceable presentations with real lesson and atlas destinations',()=>{
    expect(new Set(CONFERENCES.map(c=>c.id)).size).toBe(CONFERENCES.length);
    for(const topic of CASE_TOPICS){expect(topic.presentations.length).toBeGreaterThanOrEqual(2);expect(new Set(topic.presentations.map(p=>p.variant)).size).toBe(topic.presentations.length);}
    for(const c of CONFERENCES){for(const id of c.lessonIds)expect(FPC_BY_ID[id],`${c.id}: ${id}`).toBeTruthy();for(const id of c.diseaseIds)expect(DISEASE_BY_ID[id],id).toBeTruthy();}
  });
  it('preserves the complete clinical story for an audio-only listener',()=>{
    for(const c of CONFERENCES){
      expect(c.synthetic).toBe(true);expect(c.reviewStatus).toBe('Clinical review pending');
      for(const slide of c.slides){expect(slide.narration.length).toBeGreaterThan(20);for(const d of slide.data??[]){expect(d.spoken.length).toBeGreaterThan(15);expect(slide.narration).toContain(d.spoken);}}
      const spoken=c.slides.map(s=>s.narration).join(' ');
      for(const fact of [c.patient,c.story,c.exam,c.diagnostics,c.question,c.reasoning,...c.priorities,c.reassessment,c.synopsis])expect(spoken,`${c.id}: ${fact}`).toContain(fact);
      expect(c.slides.at(-1)?.kind).toBe('synopsis');expect(c.slides.at(-1)?.narration).toContain(c.synopsis);
    }
  });
  it('has a concise evidence track and separately authored commentary for every case',()=>{
    expect(Object.keys(CONFERENCE_SCRIPTS).sort()).toEqual(CONFERENCES.map(c=>c.id).sort());
    const commentary:string[]=[];
    for(const c of CONFERENCES){
      const script=CONFERENCE_SCRIPTS[c.id];
      for(const [id,beat] of Object.entries(script)){
        const slide=c.slides.find(s=>s.id===id)!;
        expect(slide.narration).toContain(beat.commentary);
        expect(beat.points.length).toBeLessThanOrEqual(4);
        expect([beat.title,...beat.points,beat.focus?.text??''].join(' ').split(/\s+/).length).toBeLessThanOrEqual(65);
        commentary.push(beat.commentary);
      }
      const screen=c.slides.flatMap(s=>[s.title,...(s.bullets??[]),...(s.paragraphs??[])]).join(' ');
      expect(screen).not.toContain(c.story);
      expect(screen).not.toContain(c.reasoning);
    }
    expect(new Set(commentary).size).toBe(commentary.length);
  });
  it('marks automatic reflection pauses in the decision chapter and transcript',()=>{
    for(const c of CONFERENCES){
      expect(c.slides.find(s=>s.id==='decision')?.pauseAfterSeconds).toBe(4);
      expect(transcriptFor(c)).toContain('[4-second reflection pause; playback continues automatically.]');
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
    const retimed={...c,slides:c.slides.map(s=>s.id==='decision'?{...s,pauseAfterSeconds:6}:s)};
    expect(conferenceAudioKey(c)).not.toBe(conferenceAudioKey(retimed));
  });
});
