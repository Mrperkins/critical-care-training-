import { describe, expect, it } from 'vitest';
import { EPISODES, MENTAL_REPS } from '../src/audio/catalog';
import { MASTERY, MASTERY_BY_ID } from '../src/audio/mastery';
import { MASTERY_NOTES } from '../src/audio/masteryNotes';

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

  it('keeps the core procedural visualization set present', () => {
    const ids = new Set(MENTAL_REPS.map((r) => r.id));
    for (const id of [
      'rep-push-dose-pressor','rep-blood','rep-art-line','rep-efast','rep-chest-tube',
      'rep-central-line','rep-us-piv','rep-rsi','rep-post-intubation','rep-pac',
      'rep-crrt','rep-ecmo','rep-iabp','rep-sedation','rep-status'
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
});
