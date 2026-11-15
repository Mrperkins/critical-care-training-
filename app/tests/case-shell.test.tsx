// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CASE_BY_ID, SCENE_CASES } from '../src/challenge/sceneCases';
import { useProgress } from '../src/curriculum/progress';
import { useUI } from '../src/app/store';
import { useCaseUI } from '../src/challenge/caseStore';
import { answer, endCase, nextQuestion, startCase, useCaseRun } from '../src/library/caseRun';
import { CaseRunner } from '../src/library/CaseRunner';
import { useLibrary } from '../src/library/libraryStore';
import { search } from '../src/library/searchIndex';
import { useHeartUI } from '../src/heart/heartStore';

const c = CASE_BY_ID['case-img-cxr-ards'] ?? SCENE_CASES[0];

describe('case shell', () => {
  beforeEach(() => { useProgress.getState().reset(); useLibrary.getState().resetLibrary(); endCase(); });
  it('a scene case opens its module with findings hidden, and the last answer records the attempt', () => {
    startCase(c.id);
    expect(useUI.getState()).toMatchObject({ module: c.module, mode: 'challenge' });
    expect(useCaseUI.getState()).toMatchObject({ active: c.id, revealed: false });
    useCaseRun.getState().set({ stage: 'decide' });
    c.questions.forEach((q, i) => { answer(q.answer); if (i < c.questions.length - 1) nextQuestion(); });
    expect(useProgress.getState().attempts[c.id]?.at(-1)?.ok).toBe(true);
    nextQuestion();
    expect(useCaseRun.getState().stage).toBe('debrief'); expect(useCaseUI.getState().revealed).toBe(true);
  });
  it('a wrong answer is kept, cannot be changed, and fails the attempt', () => {
    startCase(c.id); useCaseRun.getState().set({ stage: 'decide' });
    const q = c.questions[0]; const wrong = (q.answer + 1) % 4;
    answer(wrong); answer(q.answer);
    expect(useCaseRun.getState().decisions).toHaveLength(1); expect(useCaseRun.getState().decisions[0].ok).toBe(false);
    for (let i = 1; i < c.questions.length; i++) { nextQuestion(); answer(c.questions[i].answer); }
    expect(useProgress.getState().attempts[c.id]?.at(-1)?.ok).toBe(false);
  });
  it('an engine case opens in its engine and waits for the recorded attempt', () => {
    startCase('vent-alarm-ett');
    expect(useUI.getState()).toMatchObject({ module: 'vent', mode: 'challenge' });
    expect(useCaseRun.getState().priorAttempts).toBe(0);
  });

  describe('rendered', () => {
    let container: HTMLDivElement; let root: Root;
    beforeEach(() => { (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true; container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
    afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
    const click = async (label: string) => { const b = [...container.querySelectorAll('button')].find((x) => x.textContent?.trim().startsWith(label)); if (!b) throw new Error(`no button ${label}`); await act(async () => b.click()); };
    it('walks Patient → Assess → Decide → Debrief and lists every decision', async () => {
      startCase(c.id);
      await act(async () => root.render(<CaseRunner />));
      expect(container.querySelector('.case-stepper [aria-current="step"]')?.textContent).toContain('Patient');
      expect(container.textContent).toContain(c.story);
      await click('Assess the patient'); await click('I’m ready to decide');
      for (let i = 0; i < c.questions.length; i++) {
        const opt = [...container.querySelectorAll<HTMLButtonElement>('.case-option')].find((b) => b.textContent === c.questions[i].options[c.questions[i].answer])!;
        await act(async () => opt.click());
        expect(container.querySelector('.case-feedback.ok')).toBeTruthy();
        await click(i < c.questions.length - 1 ? 'Next decision' : 'See the debrief');
      }
      expect(container.querySelector('.case-score-card.ok')).toBeTruthy();
      expect(container.querySelectorAll('.case-decisions li')).toHaveLength(c.questions.length);
      expect(container.textContent).toContain('Run the case again');
    });
  });
});

describe('search', () => {
  it('finds modules, lessons, cases and drugs by title and content', () => {
    const kinds = (q: string) => search(q).map((g) => g.kind);
    expect(kinds('auto-PEEP')).toEqual(expect.arrayContaining(['module', 'lesson']));
    expect(search('auto-PEEP').find((g) => g.kind === 'lesson')!.hits.some((h) => h.id === 'auto')).toBe(true);
    expect(search('tension pneumothorax').flatMap((g) => g.hits).some((h) => h.id === 'vent-ptx')).toBe(true);
    expect(search('high-pressure alarm').find((g) => g.kind === 'case')!.hits.length).toBeGreaterThan(0);
    expect(kinds('norepinephrine')).toContain('drug');
    expect(search('zzqx')).toEqual([]); expect(search('a')).toEqual([]);
  });
});

describe('organ views open whole', () => {
  it('the heart opens as the whole, closed heart', () => {
    expect(useHeartUI.getState().cut).toBe('closed'); expect(useHeartUI.getState().target).toBe('heart.whole_heart');
  });
  it('the lungs open whole, with a coronal section available', () => {
    expect(useUI.getState().ventCut).toBe('none');
  });
});
