import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DISEASES, conditionsFor, PEDIATRIC_CONDITIONS, WOMENS_CONDITIONS } from '../src/atlas/registry';
import { applyDecision, diseaseLesson, diseaseState, HEALTHY } from '../src/atlas/engine';
import { DiseaseDiagram, PatientDiagram } from '../src/atlas/Diagrams';
import { CAMERA_TARGETS } from '../src/scene/cameraTargets';
import { duration, resolve, targetAt } from '../src/director/timeline';
import { EQUIPMENT_SCENARIOS } from '../src/vent/equipment';
import { ATLAS_MEDIA } from '../src/atlas/media';
import fs from 'node:fs';

describe('clinical disease registry', () => {
  it('every real imaging comparator resolves to shipped, attributed media and a real condition', () => {
    const manifest=JSON.parse(fs.readFileSync(new URL('../../imaging/real/manifest.json',import.meta.url),'utf8'));
    for(const [id,reference] of Object.entries(ATLAS_MEDIA)) {
      expect(DISEASES.some(d=>d.id===id),id).toBe(true); expect(reference.context.length).toBeGreaterThan(35);
      for(const media of reference.ids) expect(manifest.items.some((it:{id:string;license:string;author:string})=>it.id===media&&it.license&&it.author),media).toBe(true);
    }
  });
  it('every equipment handoff opens the specified playable condition', () => {
    for (const d of DISEASES) if (d.relatedScenario) expect(EQUIPMENT_SCENARIOS.some(s => s.scenario === d.relatedScenario), d.id).toBe(true);
  });
  it('every affected-anatomy focus differs from the whole-patient starting view', () => {
    for (const d of DISEASES) expect(d.target, d.id).not.toBe('body.whole');
  });
  it('supportive neurologic care preserves established infarct and hematoma', () => {
    for (const id of ['lvo','ich']) {
      const d=DISEASES.find(d=>d.id===id)!; const before=diseaseState(d,.75);
      const after=applyDecision(before,d.decisions.find(c=>c.outcome==='stabilize')!);
      expect(after.ischemia).toBe(before.ischemia); expect(after.bleeding).toBe(before.bleeding); expect(after.flowLoss).toBeLessThan(before.flowLoss);
    }
  });
  it('has unique identifiers and every primary clinical domain has real entries', () => {
    expect(new Set(DISEASES.map(d => d.id)).size).toBe(DISEASES.length);
    for (const domain of ['vent','heart','neuro','lines','abdomen','labs','pediatrics','womens'] as const) expect(conditionsFor(domain).length,domain).toBeGreaterThan(0);
    expect(PEDIATRIC_CONDITIONS.some(d => d.population === 'neonate')).toBe(true);
    expect(WOMENS_CONDITIONS.map(d => d.id)).toEqual(expect.arrayContaining(['pcos','endometriosis','ectopic-pregnancy','preeclampsia','eclampsia','hellp','postpartum-hemorrhage','amniotic-fluid-embolism']));
  });
  it.each(DISEASES)('$id defines content, valid visual channels, cameras and decisions', d => {
    expect(CAMERA_TARGETS[d.target]).toBeDefined();
    expect(d.mechanism.length).toBeGreaterThan(60); expect(d.distinction.length).toBeGreaterThan(40);
    expect(d.findings.length).toBeGreaterThan(0); expect(d.decisions.length).toBeGreaterThanOrEqual(3);
    for (const f of d.findings) { expect(f.channel in HEALTHY).toBe(true); expect(d.peak[f.channel]).toBeGreaterThan(0); expect(d.peak[f.channel]).toBeLessThanOrEqual(1); }
    expect(diseaseState(d,0)).toEqual(HEALTHY); expect(diseaseState(d,1)).not.toEqual(HEALTHY);
    for (const decision of d.decisions) { expect(decision.explanation.length).toBeGreaterThan(60); const s=applyDecision(diseaseState(d,.75),decision); for(const value of Object.values(s)) { expect(value).toBeGreaterThanOrEqual(0); expect(value).toBeLessThanOrEqual(1); } }
    expect(d.sources.every(s => s.url.startsWith('https://'))).toBe(true);
  });
  it.each(DISEASES)('$id renders anatomy and accessible matching textual findings', d => {
    const visual = renderToStaticMarkup(<DiseaseDiagram disease={d} state={diseaseState(d,.8)} />);
    const geometry=(s:number)=>renderToStaticMarkup(<DiseaseDiagram disease={d} state={diseaseState(d,s)}/>).replace(/<title[^>]*>.*?<\/title>/,'').replace(/aria-labelledby="[^"]*"/,'');
    expect(geometry(1),`${d.id} must change anatomy or flow, not just the title`).not.toEqual(geometry(0));
    expect(visual).toContain('<svg'); expect(visual).toContain('role="img"'); expect(visual).toContain('<title');
    for(const f of d.findings) expect(visual).toContain(f.label);
    expect(renderToStaticMarkup(<PatientDiagram disease={d} />)).toContain(d.population);
  });
  it.each(DISEASES)('$id lesson is deterministic, seekable and uses only semantic camera targets', d => {
    let state={severity:0,target:''}; const lesson=diseaseLesson(d,(severity,target) => { state={severity,target}; });
    expect(lesson.cues).toHaveLength(4);
    for(const cue of lesson.cues) expect(CAMERA_TARGETS[cue.target as keyof typeof CAMERA_TARGETS]).toBeDefined();
    resolve(lesson,duration(lesson)); const final={...state}; resolve(lesson,0); expect(state.target).toBe('body.whole');
    resolve(lesson,duration(lesson)); expect(state).toEqual(final); expect(targetAt(lesson,duration(lesson))).toBe(d.target);
  });
  it('bounds hostile slider values and does not mutate a prior patient state', () => {
    const d=DISEASES[0]; expect(diseaseState(d,NaN)).toEqual(HEALTHY); expect(diseaseState(d,-10)).toEqual(HEALTHY);
    expect(diseaseState(d,10)).toEqual(diseaseState(d,1));
    const before=diseaseState(d,.75), copy={...before}; applyDecision(before,d.decisions[0]); expect(before).toEqual(copy);
  });
  it('does not teach that ovarian morphology establishes PCOS', () => {
    const d=WOMENS_CONDITIONS.find(d => d.id === 'pcos')!;
    expect(d.distinction).toContain('alone neither proves nor is required');
  });
});
