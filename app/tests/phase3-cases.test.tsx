// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (window as unknown as { matchMedia: unknown }).matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} }); });
import { CASE_BY_ID, SCENE_CASES } from '../src/challenge/sceneCases';
import { useProgress } from '../src/curriculum/progress';
import { useUI } from '../src/app/store';
import { answer, endCase, finishTask, nextQuestion, startCase, useCaseRun } from '../src/library/caseRun';
import { useGame } from '../src/library/game';
import { GameHUD } from '../src/library/GameHUD';
import { afterCase, runCase, runMission } from '../src/library/launch';
import { useLibrary } from '../src/library/libraryStore';
import { MISSIONS, missionResults, useMission } from '../src/library/missions';
import { titleOf } from '../src/curriculum/titles';
import { LabChallenge } from '../src/labs/LabChallenge';
import { LAB_CASES } from '../src/scenarios/labCases';
import { LINES_CASES } from '../src/lines/cases';
import { ABG_PRESETS } from '../src/scenarios/abg';
import { ABG_ACTIONS } from '../src/scenarios/abgChallenges';
import { LINES_WORKFLOWS } from '../src/workflows/linesWorkflows';
import { tilesFor } from '../src/workflows/WorkflowRunner';
import { ranks } from '../src/workflows/workflow';
import { useAbdUI } from '../src/abdomen/abdomenStore';

beforeEach(() => { (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true; vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} unobserve() {} }); useProgress.getState().reset(); useLibrary.getState().resetLibrary(); endCase(); localStorage.clear(); });

describe('evolving cases', () => {
  it('the flagship cases run four to six decisions and every option list has four choices', () => {
    const long = SCENE_CASES.filter((c) => c.questions.length >= 4);
    expect(long.length).toBeGreaterThanOrEqual(8);
    for (const c of SCENE_CASES) for (const q of c.questions) { expect(q.options, c.id).toHaveLength(4); expect(q.answer).toBeLessThan(4); expect(c.questions.length).toBeLessThanOrEqual(6); }
  });
  it('a decision that moves the case on says what changed, and changes the patient through the engine', () => {
    const c = CASE_BY_ID['case-abd-fast-spleen']; c.setup(); const before = useAbdUI.getState().minutes;
    const q = c.questions.find((x) => x.scene)!; expect(q.update).toMatch(/later/);
    const hr0 = Number(c.facts().find(([k]) => k === 'HR')![1]); q.scene!();
    expect(useAbdUI.getState().minutes).toBeGreaterThan(before); expect(Number(c.facts().find(([k]) => k === 'HR')![1])).toBeGreaterThan(hr0);
    for (const x of SCENE_CASES) for (const y of x.questions) if (y.scene) expect(y.update, x.id).toBeTruthy();
  });
});

describe('engine cases on the HUD', () => {
  let container: HTMLDivElement; let root: Root;
  beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
  it('every blood-gas, lab and lines case has a title and a home', () => {
    for (const c of LAB_CASES) expect(titleOf(`lab-${c.id}`)).not.toBe(`lab-${c.id}`);
    for (const p of ABG_PRESETS) if (p.id !== 'normal') expect(ABG_ACTIONS[p.id], p.id).toBeTruthy();
    for (const c of LINES_CASES) if (c.kind === 'goal') expect(c.goals?.length, c.id).toBeGreaterThan(0);
  });
  it('a lab case plays as tiles over the scene and records the attempt', async () => {
    const lc = LAB_CASES[0]; const id = `lab-${lc.id}`;
    await act(async () => { runCase(id); });
    expect(useUI.getState()).toMatchObject({ module: 'labs', mode: 'challenge' });
    await act(async () => root.render(<><LabChallenge /><GameHUD /></>));
    expect(useGame.getState().id).toBe(id); expect(useCaseRun.getState().def?.id).toBe(id);
    expect(container.querySelector('.hud-card')?.textContent).toContain(lc.story);
    await act(async () => useCaseRun.getState().set({ stage: 'decide' }));
    const tiles = [...container.querySelectorAll<HTMLButtonElement>('.hud-tile')]; expect(tiles).toHaveLength(4);
    await act(async () => tiles.find((t) => t.textContent === lc.options[lc.answer])!.click());
    expect(useProgress.getState().attempts[id]?.at(-1)?.ok).toBe(true);
    expect(container.querySelector('.hud-explain')?.textContent).toContain(lc.explain.slice(0, 30));
    await act(async () => nextQuestion());
    expect(useGame.getState().debrief).toMatchObject({ ok: true, right: 1, total: 1 });
  });
  it('a case with a hands-on part is only passed when the fix holds', () => {
    const def = { ...CASE_BY_ID['case-abd-fast-early'], id: 'lines-test', task: { title: 'Fix', text: 'x', holdMs: 0, goals: [{ label: 'ok', test: () => true }] } };
    useCaseRun.getState().set({ id: def.id, def, stage: 'decide', qi: 0, decisions: [], taskOk: null, startedAt: Date.now() });
    def.questions.forEach((q, i) => { answer(q.answer); if (i < def.questions.length - 1) nextQuestion(); });
    expect(useProgress.getState().attempts[def.id]).toBeUndefined();
    nextQuestion(); expect(useCaseRun.getState().stage).toBe('task');
    finishTask(false); expect(useCaseRun.getState().stage).toBe('debrief'); expect(useProgress.getState().attempts[def.id]?.at(-1)?.ok).toBe(false);
  });
});

describe('procedures on the HUD', () => {
  it('each step offers four tiles: the step itself and three that are not earlier steps', () => {
    for (const wf of LINES_WORKFLOWS) { const r = ranks(wf); const seq = [...wf.steps].sort((a, b) => r[a.id] - r[b.id]);
      seq.forEach((s, i) => { const t = tilesFor(wf, seq.slice(0, i).map((x) => x.id), s.id); expect(t.length).toBeLessThanOrEqual(4); expect(t.filter((a) => a.id === s.id)).toHaveLength(1);
        expect(new Set(t.map((a) => a.id)).size).toBe(t.length); for (const a of t) expect(seq.slice(0, i).some((x) => x.id === a.id)).toBe(false); }); }
  });
});

describe('missions', () => {
  it('every leg is a real case, and legs are not repeated', () => {
    const real = (id: string) => !!CASE_BY_ID[id] || LAB_CASES.some((c) => `lab-${c.id}` === id) || LINES_CASES.some((c) => `lines-${c.id}` === id) || (id.startsWith('abg-') && !!ABG_ACTIONS[id.slice(4)]);
    for (const m of MISSIONS) { expect(m.legs.length).toBe(4); for (const l of m.legs) expect(real(l.caseId), l.caseId).toBe(true); expect(new Set(m.legs.map((l) => l.caseId)).size).toBe(4); }
  });
  it('the debrief leads to the next call, and the last call saves the mission result', () => {
    const m = MISSIONS[0]; runMission(m.id);
    expect(useLibrary.getState().solo).toBe(m.legs[0].caseId);
    let n = afterCase({ right: 2, total: 2 }); expect(n.nextLabel).toContain(m.legs[1].label); n.onNext();
    expect(useMission.getState()).toMatchObject({ leg: 1, right: 2, total: 2 }); expect(useLibrary.getState().solo).toBe(m.legs[1].caseId);
    useMission.getState().set({ leg: 3 }); n = afterCase({ right: 1, total: 2 }); expect(n.nextLabel).toMatch(/Finish mission · 3\/4/); n.onNext();
    expect(missionResults()[m.id]).toMatchObject({ right: 3, total: 4 }); expect(useMission.getState().id).toBeNull();
    runCase(m.legs[0].caseId); expect(afterCase().nextLabel).toBe('Back to cases');
  });
});
