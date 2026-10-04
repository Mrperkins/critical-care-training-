import { describe, it, expect } from 'vitest';
import { SCENE_CASES, CASE_BY_ID } from '../src/challenge/sceneCases';
import { CHALLENGE_CONCEPTS, challengeModule } from '../src/curriculum/catalog';
import { titleOf } from '../src/curriculum/titles';
import { useUI } from '../src/app/store';
import { useCaseUI } from '../src/challenge/caseStore';
import { openChallenge, takePendingChallenge } from '../src/app/navigate';
import { resolve } from '../src/director/timeline';
import { TENSION_PTX } from '../src/director/lessons/vent';
import { session } from '../src/vent/session';
import { lusFromVent } from '../src/vent/lus';
import { useLusUI } from '../src/vent/LusScene';

describe('scene challenge cases', () => {
  it('every case is well formed, tagged, titled and routed to its module', () => {
    expect(SCENE_CASES.length).toBeGreaterThanOrEqual(20);
    for (const c of SCENE_CASES) {
      expect(c.id).toMatch(/^case-(abd|neuro|heart|img|vent|abg|lines)-/); expect(challengeModule(c.id)).toBe(c.module); expect(titleOf(c.id)).toBe(c.title);
      expect(CHALLENGE_CONCEPTS[c.id], c.id).toBeTruthy(); expect(c.questions.length).toBeGreaterThanOrEqual(2);
      for (const q of c.questions) { expect(new Set(q.options).size).toBe(4); expect(q.explain.length).toBeGreaterThan(40); }
    }
    for (const m of ['abdomen', 'neuro', 'heart', 'vent'] as const) expect(SCENE_CASES.filter((c) => c.module === m).length).toBeGreaterThanOrEqual(4);
  });
  it('the keyed answers agree with the engines for each case state', () => {
    for (const c of SCENE_CASES) expect(c.verify(), c.id).toBe(true);
  });
  it('setup puts the module on screen in challenge mode with bedside facts', () => {
    for (const c of SCENE_CASES) {
      c.setup(); expect(useUI.getState().module, c.id).toBe(c.module); expect(useUI.getState().mode).toBe('challenge');
      const f = c.facts(); expect(f.length, c.id).toBeGreaterThanOrEqual(2); for (const [, v] of f) expect(v, c.id).not.toMatch(/NaN|undefined/);
      if (c.module === 'neuro') for (const [, v] of f) expect(v).not.toMatch(/toward the lesion/);
    }
    CASE_BY_ID['case-img-cxr-ards'].setup(); expect(useUI.getState().ventView).toBe('xray');
    CASE_BY_ID['case-img-lus-plug'].setup(); expect(useUI.getState().ventView).toBe('lus');
  });
  it('findings stay hidden while a case is answered', () => {
    useUI.getState().set({ mode: 'challenge' }); useCaseUI.getState().set({ active: 'case-img-cxr-tension', revealed: false });
    const s = useCaseUI.getState(); expect(s.active && !s.revealed).toBe(true);
    useCaseUI.getState().set({ active: null, revealed: false });
  });
  it('deep links route to the right module and hand over the case id once', () => {
    openChallenge('case-neuro-uncal'); expect(useUI.getState().module).toBe('neuro'); expect(useUI.getState().mode).toBe('challenge');
    expect(takePendingChallenge((x) => x.startsWith('lab-'))).toBeNull();
    expect(takePendingChallenge((x) => x.startsWith('case-neuro'))).toBe('case-neuro-uncal'); expect(takePendingChallenge(() => true)).toBeNull();
    openChallenge('case-img-lus-asthma'); expect(useUI.getState().module).toBe('vent'); takePendingChallenge(() => true);
  });
});

describe('tension PTX lesson imaging cues', () => {
  it('lung ultrasound and film before decompression, a lung point after', () => {
    resolve(TENSION_PTX, 60); expect(useUI.getState().ventView).toBe('lus'); expect(lusFromVent(session).find((z) => z.id === 'R-ant')!.sliding).toBe(false);
    resolve(TENSION_PTX, 72); expect(useUI.getState().ventView).toBe('xray');
    resolve(TENSION_PTX, 85); expect(useUI.getState().ventView).toBe('lus'); expect(session.m.lung.tension).toBeLessThan(0.5); const z = lusFromVent(session); expect(z.find((x) => x.id === 'R-lat')!.lungPoint).toBe(true); expect(z.find((x) => x.id === 'L-ant')!.sliding).toBe(true); expect(useLusUI.getState().zone).toBe('R-lat');
    resolve(TENSION_PTX, 60); expect(useLusUI.getState().zone).toBe('R-ant');
  });
});
