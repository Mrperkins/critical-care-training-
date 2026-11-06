// @vitest-environment node
import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import {DISEASE_BY_ID} from '../src/atlas/registry';
import {MODULE_BY_ID} from '../src/library/modules';
import {IMAGING_COURSES,IMAGING_COURSE_BY_ID,COURSE_FOR_MODULE} from '../src/library/imaging/courseCurriculum';
import {MRI_STUDIES} from '../src/library/imaging/mriCatalog';
import {AORTA_CEUS} from '../src/library/imaging/ceusCatalog';
import type {RealItem} from '../src/scene/imaging/RealExamples';

const manifest=JSON.parse(fs.readFileSync('../imaging/real/manifest.json','utf8')) as {items:RealItem[];accepted:string[]};
const media=new Map([...manifest.items,...MRI_STUDIES,AORTA_CEUS].map(it=>[it.id,it]));

describe('Evidence-informed imaging courses',()=>{
 it('offers substantial original lessons per modality, not only image quizzes',()=>{
  expect(IMAGING_COURSES.length).toBeGreaterThanOrEqual(10);
  expect(new Set(IMAGING_COURSES.map(c=>c.id)).size).toBe(IMAGING_COURSES.length);
  for(const modality of ['xray','ct','mri','ultrasound'])
   expect(IMAGING_COURSES.some(c=>c.modality===modality),modality).toBe(true);
  expect(IMAGING_COURSES.reduce((n,c)=>n+c.lesson.length,0)).toBeGreaterThanOrEqual(35);
  for(const course of IMAGING_COURSES) {
   expect(course.intro.length,course.id).toBeGreaterThan(40);
   expect(course.outcomes.length,course.id).toBeGreaterThanOrEqual(2);
   expect(course.references.length,course.id).toBeGreaterThanOrEqual(1);
   expect(IMAGING_COURSE_BY_ID[course.id]).toEqual(course);
   expect(new Set(course.lesson.map(l=>l.id)).size,course.id).toBe(course.lesson.length);
   expect(course.lesson.length,course.id).toBeGreaterThanOrEqual(3);
   for(const lesson of course.lesson){
    expect(lesson.narrative.length,lesson.id).toBeGreaterThanOrEqual(2);
    expect(lesson.method.length,lesson.id).toBeGreaterThanOrEqual(3);
    expect(lesson.pitfalls.length,lesson.id).toBeGreaterThan(0);
    expect(lesson.media.length,lesson.id).toBeGreaterThan(0);
    expect(lesson.goal.length,lesson.id).toBeGreaterThan(12);
    expect(DISEASE_BY_ID[lesson.anatomy],lesson.id+' missing 3D anatomy').toBeTruthy();
    for(const id of lesson.media)expect(media.has(id),course.id+' / '+lesson.id+': '+id).toBe(true);
    const check=lesson.check;
    expect(check.choices.length,lesson.id).toBe(3);
    expect(check.answer,lesson.id).toBeGreaterThanOrEqual(0);
    expect(check.answer,lesson.id).toBeLessThan(check.choices.length);
    expect(check.why.length,lesson.id).toBeGreaterThan(35);
   }
  }
 });
 it('links course material only to stable, documented public references',()=>{
  for(const course of IMAGING_COURSES)for(const r of course.references){
   expect(r.title.length).toBeGreaterThan(7);
   expect(r.url).toMatch(/^https:\/\//);
  }
 });
 it('offers video plus still-frame comparisons using already accepted clinical media',()=>{
  const us=IMAGING_COURSES.filter(c=>c.modality==='ultrasound');
  const ids=new Set(us.flatMap(c=>c.lesson.flatMap(l=>l.media)));
  const video=[...ids].map(id=>media.get(id)).filter((it):it is RealItem=>!!it && it.file.endsWith('.mp4'));
  expect(video.length).toBeGreaterThanOrEqual(9);
  for(const item of video){
   if (!item.file.startsWith('https://')) expect(item.poster,item.id).toBeTruthy();
   else expect(item.provenance?.pageUrl,item.id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
   if(!item.file.startsWith('https://'))expect(fs.existsSync('../imaging/real/'+item.file),item.id).toBe(true);
   if(item.poster&&!item.poster.startsWith('https://'))expect(fs.existsSync('../imaging/real/'+item.poster),item.id).toBe(true);
   expect(manifest.accepted).toContain(item.license);
   expect(item.author,item.id).toBeTruthy();
   expect(item.licenseUrl,item.id).toMatch(/^https?:\/\//);
  }
 });
 it('links pre-existing clinical modules to a real course',()=>{
  for(const [module,course] of Object.entries(COURSE_FOR_MODULE)){
   expect(MODULE_BY_ID[module],module).toBeTruthy();
   expect(IMAGING_COURSE_BY_ID[course],module+' → '+course).toBeTruthy();
  }
 });
});
