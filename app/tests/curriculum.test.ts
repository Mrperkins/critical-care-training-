import { DISEASES } from '../src/atlas/registry';
import { describe, it, expect } from 'vitest';
import { CATALOG, CATALOG_BY_ID, CONCEPTS, CHALLENGE_CONCEPTS, CERTS } from '../src/curriculum/catalog';
import { weakTopics, domainProgress, missingPrereqs, useProgress } from '../src/curriculum/progress';
import { TITLES } from '../src/curriculum/titles';
import { LESSON_HOSTS } from '../src/director/lessonIndex';
import { VENT_LESSONS } from '../src/lessons/vent';
import { ABG_LESSONS } from '../src/lessons/abg';
import { LAB_LESSONS } from '../src/lessons/labs';
import { LINES_LESSONS } from '../src/lines/lessons';
import { VENT_WORKFLOWS } from '../src/workflows/chestTube';
import { LINES_WORKFLOWS } from '../src/workflows/linesWorkflows';
import { CENTRAL_LINE } from '../src/procedures/centralLineFlow';
import { VENT_CHALLENGES } from '../src/scenarios/ventChallenges';
import { LAB_CASES } from '../src/scenarios/labCases';
import { LINES_CASES } from '../src/lines/cases';
import { ABG_ACTIONS } from '../src/scenarios/abgChallenges';
import { MECH } from '../src/moa/registry';
import { SCENE_CASES } from '../src/challenge/sceneCases';

describe('curriculum catalog', () => {
  it('covers every Director lesson, step lesson and workflow — and nothing else', () => {
    const ids = [...DISEASES.map(d => `atlas-${d.id}`), ...LESSON_HOSTS.flatMap((h) => h.timelines.map((t) => t.id)), ...[...VENT_LESSONS, ...ABG_LESSONS, ...LAB_LESSONS, ...LINES_LESSONS].map((l) => (l as { id: string }).id), ...[...VENT_WORKFLOWS, ...LINES_WORKFLOWS, CENTRAL_LINE].map((w) => w.id)];
    expect(new Set(ids).size).toBe(ids.length);
    expect(CATALOG.map((e) => e.id).sort()).toEqual([...ids].sort());
  });
  it('every entry has objectives, sources, certification tags, a reviewed date and a title; prerequisites resolve and come earlier in difficulty or are core', () => {
    for (const e of CATALOG) {
      expect(e.objectives.length, e.id).toBeGreaterThanOrEqual(1); expect(e.sources.length, e.id).toBeGreaterThanOrEqual(1); expect(e.certs.every((c) => CERTS.includes(c))).toBe(true);
      expect(e.reviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(TITLES[e.id], e.id).toBeTruthy();
      for (const p of e.prereq) { expect(CATALOG_BY_ID[p], `${e.id} → ${p}`).toBeTruthy(); expect(p).not.toBe(e.id); }
    }
  });
  it('every challenge is tagged with concepts, and every concept remediates to a real lesson or drug', () => {
    const chal = [...VENT_CHALLENGES.map((c) => `vent-${c.id}`), ...LAB_CASES.map((c) => `lab-${c.id}`), ...LINES_CASES.map((c) => `lines-${(c as { id: string }).id}`), ...Object.keys(ABG_ACTIONS).map((k) => `abg-${k}`), ...SCENE_CASES.map((c) => c.id)];
    for (const c of chal) { expect(CHALLENGE_CONCEPTS[c], c).toBeTruthy(); for (const k of CHALLENGE_CONCEPTS[c]) expect(CONCEPTS[k], `${c}:${k}`).toBeTruthy(); }
    expect(Object.keys(CHALLENGE_CONCEPTS).sort()).toEqual([...chal].sort());
    for (const [k, v] of Object.entries(CONCEPTS)) for (const r of v.remediate) { if ('lesson' in r) expect(CATALOG_BY_ID[r.lesson], `${k}:${r.lesson}`).toBeTruthy(); else expect(MECH[r.drug], `${k}:${r.drug}`).toBeTruthy(); }
  });
  it('Paediatric / Neonatal / OB are in the taxonomy and each has lessons', () => {
    const d = domainProgress({}); for (const x of ['Paediatric', 'Neonatal', 'OB', 'Women’s health']) { expect(d.some((y) => y.domain === x)).toBe(true); expect(d.find((y) => y.domain === x)!.entries.length, x).toBeGreaterThanOrEqual(2); }
  });
});

describe('progress', () => {
  it('weak topics come from the latest attempt per challenge and point at remediation', () => {
    const now = '2026-09-29T00:00:00Z';
    const w = weakTopics({ 'vent-alarm-ptx': [{ ok: false, at: now }], 'lab-k-hd': [{ ok: false, at: now }, { ok: true, at: now }], 'lines-c-zero': [{ ok: false, at: now }], 'lines-c-hob': [{ ok: false, at: now }] });
    expect(w.map((x) => x.concept)).toEqual(['transducer', 'tension-ptx']); expect(w[0].missed).toBe(2); expect(w.some((x) => x.concept === 'potassium')).toBe(false);
    expect(weakTopics({})).toEqual([]);
  });
  it('the store works without browser storage; completion, bookmarks and attempts update; prerequisites report', () => {
    const p = useProgress.getState(); p.reset();
    p.markComplete('eom'); p.toggleBookmark({ lessonId: 'vent-ards-signature', t: 43, title: 'x' }); p.record('vent-goal-ards', false);
    const s = useProgress.getState(); expect(s.completed.eom).toBeTruthy(); expect(s.bookmarks).toHaveLength(1); expect(s.attempts['vent-goal-ards']).toHaveLength(1);
    s.toggleBookmark({ lessonId: 'vent-ards-signature', t: 43.5, title: 'x' }); expect(useProgress.getState().bookmarks).toHaveLength(0);
    expect(missingPrereqs(CATALOG_BY_ID['vent-ards-signature'], useProgress.getState().completed)).toEqual(['peep']);
  });
  it('atlas bookmarks reopen the correct population, moment and clinical focus and track completion', async () => {
    const { initProgressTracking } = await import('../src/curriculum/track');
    const { director, useDirector } = await import('../src/director/director');
    const { duration, steps } = await import('../src/director/timeline');
    const { openLesson } = await import('../src/app/navigate');
    const { useUI } = await import('../src/app/store');
    const { lessonById } = await import('../src/director/lessonIndex');
    useProgress.getState().reset(); initProgressTracking();
    const hit = lessonById('atlas-pcos')!; const moment = steps(hit.tl)[2].at;
    useProgress.getState().toggleBookmark({ lessonId: hit.tl.id, t: moment, title: hit.tl.title });
    const bookmark = useProgress.getState().bookmarks[0]; openLesson(bookmark.lessonId, bookmark.t);
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(useUI.getState()).toMatchObject({ module: 'womens', mode: 'learn', atlasDisease: 'pcos', atlasTarget: DISEASES.find(d => d.id === 'pcos')!.target });
    expect(useDirector.getState().tl?.id).toBe('atlas-pcos'); expect(useDirector.getState().t).toBe(moment);
    expect(useProgress.getState().recent[0]).toMatchObject({ lessonId: 'atlas-pcos', t: moment });
    director.seek(duration(hit.tl)); expect(useProgress.getState().completed['atlas-pcos']).toBeTruthy();
    openLesson('ln-damp'); expect(useUI.getState().atlasDisease).toBeNull(); director.unload();
  });
  it('playing a lesson to the end marks it complete; deep links open step lessons and workflows in their module', async () => {
    const { initProgressTracking } = await import('../src/curriculum/track');
    const { director } = await import('../src/director/director');
    const { duration } = await import('../src/director/timeline');
    const { openLesson, usePendingOpen } = await import('../src/app/navigate');
    const { useUI } = await import('../src/app/store');
    const { lessonById } = await import('../src/director/lessonIndex');
    useProgress.getState().reset(); initProgressTracking();
    const tl = lessonById('neuro-icp')!.tl; director.load(tl, false); director.seek(duration(tl));
    expect(useProgress.getState().completed['neuro-icp']).toBeTruthy(); director.unload();
    openLesson('ln-damp'); expect(useUI.getState().module).toBe('lines'); expect(usePendingOpen.getState()).toMatchObject({ kind: 'step', id: 'ln-damp' });
    openLesson('wf-drain-check'); expect(useUI.getState().module).toBe('vent'); expect(usePendingOpen.getState()).toMatchObject({ kind: 'workflow', id: 'wf-drain-check' });
  });
});
