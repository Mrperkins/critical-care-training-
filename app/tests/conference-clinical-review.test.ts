import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {CONFERENCES} from '../src/cases/catalog';
import {CLINICAL_REVIEWS} from '../src/cases/clinicalReviews';

describe('patient-centered conference authoring contract',()=>{
  it('requires an explicit diagnosis, handoff and subsequent patient course for every case',()=>{
    expect(Object.keys(CLINICAL_REVIEWS).sort()).toEqual(CONFERENCES.map(c=>c.id).sort());
    for(const c of CONFERENCES){
      const review=CLINICAL_REVIEWS[c.id];
      expect(c.diagnosis.length).toBeGreaterThan(15);
      expect(c.slides[0].narration).toContain(c.diagnosis);
      expect(c.slides[0].narration).toContain(review.handoff);
      expect(review.handoff.split(/\s+/).length).toBeGreaterThan(35);
      expect(review.course.split(/\s+/).length).toBeGreaterThan(60);
      expect(c.slides.find(s=>s.id==='reassessment')?.narration).toContain(review.course);
      expect(c.slides.at(-1)?.title).toBe(c.diagnosis);
    }
  });
  it('teaches every recorded observation immediately after stating the value',()=>{
    for(const c of CONFERENCES){
      const labels=[...c.vitals,...c.labs].map(d=>d.label);
      expect(Object.keys(CLINICAL_REVIEWS[c.id].findings).sort()).toEqual(labels.sort());
      for(const slide of c.slides.filter(s=>s.data))for(const d of slide.data!){
        expect(d.teaching,`${c.id}: ${d.label}`).toBeTruthy();
        const t=d.teaching!;
        expect(t.reference.text.length).toBeGreaterThan(40);
        expect(t.interpretation.length).toBeGreaterThan(40);
        expect(t.associations.length).toBeGreaterThan(40);
        expect(new URL(t.reference.source.url).protocol).toBe('https:');
        expect(c.sources.some(s=>s.url===t.reference.source.url)).toBe(true);
        expect(slide.narration).toContain(`${d.spoken} ${t.reference.text} ${t.interpretation} ${t.associations}`);
      }
    }
  });
  it('does not mislabel apparently normal pediatric counts or neonatal lactate as automatically abnormal',()=>{
    const asthma=CONFERENCES.find(c=>c.id==='asthma-silent-chest')!;
    expect(asthma.vitals.find(d=>d.label==='Respiratory rate')!.teaching!.interpretation).toContain('within the reference');
    expect(asthma.vitals.find(d=>d.label==='Respiratory rate')!.teaching!.interpretation).toContain('exhaustion');
    const cyanosis=CONFERENCES.find(c=>c.id==='duct-cyanotic-newborn')!;
    expect(cyanosis.labs.find(d=>d.label==='Lactate')!.teaching!.interpretation).toContain('within both cited neonatal age intervals');
    expect(CLINICAL_REVIEWS['asthma-silent-chest'].course).toContain('extubated');
  });
  it('ships real attributed comparison images with spoken interpretation, without representing them as synthetic patient studies',()=>{
    const manifest=JSON.parse(fs.readFileSync('../imaging/real/manifest.json','utf8'));
    for(const c of CONFERENCES){
      const imaging=CLINICAL_REVIEWS[c.id].imaging;if(!imaging)continue;
      const slide=c.slides.find(s=>s.id==='diagnostics')!;
      expect(slide.comparisonIds).toEqual(imaging.ids);
      expect(slide.narration).toContain(imaging.narration);
      expect(imaging.narration).toMatch(/different|separate|another/);
      for(const id of imaging.ids){
        const item=manifest.items.find((i:{id:string})=>i.id===id);
        expect(item,id).toBeTruthy();
        expect(item.license).toMatch(/^CC0$|^CC BY /);
        expect(item.source.length).toBeGreaterThan(25);
        expect(fs.existsSync(`../imaging/real/${item.file}`)).toBe(true);
      }
    }
    for(const id of ['peds-croup-steeple-2019','peds-epiglottitis-thumb-2026']){
      const item=manifest.items.find((i:{id:string})=>i.id===id);
      expect(item.marks.some((m:{layer:string})=>m.layer==='pathology')).toBe(true);
    }
  });
});
