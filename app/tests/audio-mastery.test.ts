import { describe, expect, it } from 'vitest';
import { EPISODES, MENTAL_REPS } from '../src/audio/catalog';
import { MASTERY, MASTERY_BY_ID } from '../src/audio/mastery';
import { MASTERY_NOTES } from '../src/audio/masteryNotes';
import { REVIEW_PROMPTS } from '../src/audio/review';

describe('critical care audio mastery model', () => {
  it('has unique concept, episode and Mental Rep ids', () => {
    const unique = (ids: string[]) => new Set(ids).size === ids.length;
    expect(unique(MASTERY.map((x) => x.id))).toBe(true);
    expect(unique(EPISODES.map((x) => x.id))).toBe(true);
    expect(unique(MENTAL_REPS.map((x) => x.id))).toBe(true);
  });

  it('keeps every prerequisite and related concept resolvable', () => {
    for (const c of MASTERY) {
      for (const p of c.prereq) expect(MASTERY_BY_ID[p], `${c.id} prerequisite -> ${p}`).toBeTruthy();
      for (const r of c.related) expect(MASTERY_BY_ID[r], `${c.id} related -> ${r}`).toBeTruthy();
    }
  });

  it('maps every episode and Mental Rep to real mastery concepts', () => {
    for (const e of EPISODES) for (const id of e.concepts) expect(MASTERY_BY_ID[id], `${e.id} -> ${id}`).toBeTruthy();
    for (const r of MENTAL_REPS) for (const id of r.concepts) expect(MASTERY_BY_ID[id], `${r.id} -> ${id}`).toBeTruthy();
  });

  it('gives every mastery concept expert teaching notes', () => {
    for (const c of MASTERY) {
      const n = MASTERY_NOTES[c.id];
      expect(n, `expert notes missing: ${c.id}`).toBeTruthy();
      expect(n.mechanism.length).toBeGreaterThan(40);
      expect(n.bedside.length).toBeGreaterThan(30);
      expect(n.traps.length).toBeGreaterThanOrEqual(2);
      expect(n.integration.length).toBeGreaterThan(30);
    }
  });

  it('gives every mastery concept at least one expertise-audio teaching path', () => {
    const covered = new Set(EPISODES.flatMap((e) => e.concepts));
    for (const c of MASTERY) expect(covered.has(c.id), `audio coverage missing: ${c.id}`).toBe(true);
  });

  it('gives every mastery concept spaced-retrieval coverage', () => {
    const ids = REVIEW_PROMPTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const covered = new Set(REVIEW_PROMPTS.map((q) => q.concept));
    for (const c of MASTERY) expect(covered.has(c.id), `review coverage missing: ${c.id}`).toBe(true);
    for (const q of REVIEW_PROMPTS) {
      expect(MASTERY_BY_ID[q.concept], `${q.id} -> ${q.concept}`).toBeTruthy();
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(q.explain.length).toBeGreaterThan(40);
    }
  });

  it('keeps the core procedural visualization set present', () => {
    const ids = new Set(MENTAL_REPS.map((r) => r.id));
    for (const id of [
      'rep-push-dose-pressor','rep-blood','rep-art-line','rep-efast','rep-chest-tube',
      'rep-central-line','rep-us-piv','rep-rsi','rep-post-intubation','rep-pac',
      'rep-crrt','rep-ecmo','rep-iabp','rep-sedation','rep-status',
      'rep-io','rep-vent-emergency','rep-evd','rep-mtp','rep-pocus-shock'
    ]) expect(ids.has(id), `Mental Rep missing: ${id}`).toBe(true);
  });

  it('requires reviewed durable audio before anything can be published', () => {
    for (const e of EPISODES.filter((x) => x.status === 'published')) {
      expect(e.voice?.reviewed).toBe(true);
      expect(e.voice?.src).toBeTruthy();
      expect(e.voice?.tier === 'premium-human' || e.voice?.tier === 'recorded-clinician').toBe(true);
    }
  });

  it('the eFAST showcase has natural narration on every beat', () => {
    const rep = MENTAL_REPS.find((x) => x.id === 'rep-efast')!;
    expect(rep.beats.length).toBeGreaterThan(5);
    expect(rep.beats.every((b) => !!b.voice?.previewSrc || !!b.voice?.src)).toBe(true);
    expect(rep.beats.every((b) => b.voice?.tier === 'premium-human')).toBe(true);
  });

  it('Mental Reps include a debrief and an explicit training boundary', () => {
    for (const r of MENTAL_REPS) {
      expect(r.disclaimer.length).toBeGreaterThan(20);
      expect(r.beats.some((b) => b.phase === 'debrief')).toBe(true);
      expect(r.beats.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('landmark-dependent Mental Reps explicitly rehearse anatomical orientation', () => {
    for (const id of ['rep-art-line','rep-efast','rep-chest-tube','rep-central-line','rep-io','rep-evd','rep-us-piv','rep-pocus-shock']) {
      const rep = MENTAL_REPS.find((x) => x.id === id)!;
      const orientation = rep.beats.filter((b) => b.phase === 'orientation');
      expect(orientation.length, `${id} needs an orientation beat`).toBeGreaterThan(0);
      expect(orientation.some((b) => b.narration.length > 180), `${id} orientation is too shallow`).toBe(true);
      expect(rep.beats.some((b) => /stop|re-orient|remap|identify|landmark|reference|anatom/i.test(b.narration)), `${id} needs explicit landmark logic`).toBe(true);
    }
  });

  it('core procedural Mental Reps keep literal hands-first choreography', () => {
    const required: Record<string, RegExp[]> = {
      'rep-blood': [/pick up the blood product/i, /tubing and filter/i, /spike the verified unit/i, /stop the blood immediately/i],
      'rep-art-line': [/flush bag/i, /stopcock/i, /select zero/i, /fast-flush/i],
      'rep-chest-tube': [/lay out the tube/i, /skin incision/i, /bluntly dissect/i, /connect it immediately/i],
      'rep-central-line': [/probe in one hand/i, /true tip/i, /before dilation/i, /guidewire/i],
      'rep-io': [/stabilize the limb/i, /needle length/i, /extension set/i, /flush according to protocol/i],
      'rep-us-piv': [/choose a catheter/i, /true tip/i, /thread the catheter/i, /connect the extension/i],
      'rep-rsi': [/suction within reach/i, /cuff checked/i, /label every syringe/i, /final sweep/i],
      'rep-post-intubation': [/attach waveform capnography/i, /trace the tube and circuit/i, /predicted body weight/i, /analgesia and sedation/i],
      'rep-pocus-shock': [/below the xiphoid/i, /two rib shadows/i, /IVC/i, /bladder as the anchor/i],
      'rep-pac': [/trace the pressure system/i, /right-atrial waveform/i, /watch the waveform change/i, /dicrotic notch/i, /deflate promptly/i],
      'rep-crrt': [/trace the blood path/i, /trace the non-blood fluids/i, /net patient-fluid-removal/i, /named pressure and its trend/i],
      'rep-ecmo': [/trace where blood is drained/i, /drainage limb/i, /pump speed and measured blood flow/i, /sweep-gas source/i, /return limb/i, /console in isolation/i],
      'rep-iabp': [/trigger source/i, /dicrotic notch/i, /assisted end-diastolic/i, /early inflation/i, /late deflation/i],
    };
    for (const [id, patterns] of Object.entries(required)) {
      const rep = MENTAL_REPS.find((x) => x.id === id)!;
      const script = rep.beats.map((b) => b.narration).join(' ');
      for (const pattern of patterns) expect(script, `${id} lost hands-first step ${pattern}`).toMatch(pattern);
    }
  });
});
