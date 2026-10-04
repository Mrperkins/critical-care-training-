import { describe, expect, it } from 'vitest';
import { EPISODES, MENTAL_REPS } from '../src/audio/catalog';
import { MASTERY, MASTERY_BY_ID } from '../src/audio/mastery';

describe('critical care audio mastery model', () => {
  it('has unique concept, episode and Mental Rep ids', () => {
    const unique = (ids: string[]) => new Set(ids).size === ids.length;
    expect(unique(MASTERY.map((x) => x.id))).toBe(true);
    expect(unique(EPISODES.map((x) => x.id))).toBe(true);
    expect(unique(MENTAL_REPS.map((x) => x.id))).toBe(true);
  });

  it('keeps every prerequisite resolvable', () => {
    for (const c of MASTERY) for (const p of c.prereq) expect(MASTERY_BY_ID[p], `${c.id} -> ${p}`).toBeTruthy();
  });

  it('maps every episode and Mental Rep to real mastery concepts', () => {
    for (const e of EPISODES) for (const id of e.concepts) expect(MASTERY_BY_ID[id], `${e.id} -> ${id}`).toBeTruthy();
    for (const r of MENTAL_REPS) for (const id of r.concepts) expect(MASTERY_BY_ID[id], `${r.id} -> ${id}`).toBeTruthy();
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
});
