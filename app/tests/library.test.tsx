// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CATALOG_BY_ID, CHALLENGE_CONCEPTS } from '../src/curriculum/catalog';
import { TITLES } from '../src/curriculum/titles';
import { useProgress } from '../src/curriculum/progress';
import { useUI } from '../src/app/store';
import { MODULES, PATHS, SHELVES, MODULE_BY_ID, moduleProgress, stepKey } from '../src/library/modules';
import { useLibrary } from '../src/library/libraryStore';
import { exitPlayer, nextStep, playModule, playStep, previousStep } from '../src/library/launch';
import { Library, casesOn } from '../src/library/Library';
import { usePendingOpen } from '../src/app/navigate';

describe('library content points at real lessons, cases and simulators', () => {
  it('every lesson and procedure step is a catalog entry with a title', () => {
    for (const m of MODULES) for (const s of m.steps) if (s.kind === 'lesson' || s.kind === 'procedure') {
      expect(CATALOG_BY_ID[s.ref], `${m.id} → ${s.ref}`).toBeTruthy();
      expect(TITLES[s.ref], `${m.id} → ${s.ref}`).toBeTruthy();
      if (s.kind === 'procedure') expect(CATALOG_BY_ID[s.ref].kind).toBe('workflow');
    }
  });
  it('every case step is a known challenge with a title', () => {
    for (const m of MODULES) for (const s of m.steps) if (s.kind === 'case') {
      expect(CHALLENGE_CONCEPTS[s.ref], `${m.id} → ${s.ref}`).toBeTruthy();
      expect(TITLES[s.ref], `${m.id} → ${s.ref}`).toBeTruthy();
    }
  });
  it('modules have unique ids, a known shelf, outcomes and at least one step', () => {
    expect(new Set(MODULES.map((m) => m.id)).size).toBe(MODULES.length);
    const shelves = new Set(SHELVES.map((s) => s.id));
    for (const m of MODULES) { expect(shelves.has(m.shelf)).toBe(true); expect(m.steps.length).toBeGreaterThan(0); expect(m.outcomes.length).toBeGreaterThan(0); }
    for (const s of SHELVES) expect(MODULES.some((m) => m.shelf === s.id), s.id).toBe(true);
  });
  it('learning paths only list real modules, and the FP-C plan covers every module', () => {
    for (const p of PATHS) for (const id of p.modules) expect(MODULE_BY_ID[id], `${p.id} → ${id}`).toBeTruthy();
    expect(new Set(PATHS.find((p) => p.id === 'fpc')!.modules)).toEqual(new Set(MODULES.map((m) => m.id)));
  });
  it('every challenge in the app is reachable from the Cases shelf', () => {
    expect(new Set(casesOn('all'))).toEqual(new Set([...Object.keys(CHALLENGE_CONCEPTS)]));
  });
});

describe('module progress', () => {
  it('counts engine completions, passed cases and steps moved past in the player', () => {
    const m = MODULE_BY_ID['vent-pressure'];
    expect(moduleProgress(m.id, {}, {}, {})).toEqual({ done: 0, total: m.steps.length, next: 0 });
    const lesson = m.steps[0] as { ref: string }; const kase = m.steps[2] as { ref: string };
    const p = moduleProgress(m.id, { [lesson.ref]: 'x' }, { [kase.ref]: [{ ok: false }, { ok: true }] }, { [stepKey(m.id, 1)]: 'x' });
    expect(p.done).toBe(3); expect(p.next).toBe(3);
  });
});

describe('playing a module', () => {
  beforeEach(() => { useLibrary.getState().resetLibrary(); useUI.getState().set({ module: 'library', mode: 'learn' }); usePendingOpen.getState().set({ kind: null, id: null }); });
  it('a step lesson opens in its module, a case opens its challenge, a simulator opens its workspace', () => {
    playStep('vent-pressure', 0);
    expect(useUI.getState().module).toBe('vent'); expect(useUI.getState().mode).toBe('learn');
    expect(usePendingOpen.getState()).toMatchObject({ kind: 'step', id: 'rc' });
    playStep('vent-pressure', 2);
    expect(useUI.getState().mode).toBe('challenge'); expect(usePendingOpen.getState()).toMatchObject({ kind: 'challenge', id: 'vent-alarm-ett' });
    playStep('vent-foundations', 2);
    expect(useUI.getState()).toMatchObject({ module: 'vent', mode: 'explore' });
    expect(useLibrary.getState().playing).toEqual({ moduleId: 'vent-foundations', step: 2 });
  });
  it('Next marks the step passed and advances; finishing returns to the module page', () => {
    const m = MODULE_BY_ID['pharm-moa'];
    playModule(m.id); expect(useUI.getState().module).toBe('moa');
    nextStep();
    expect(useLibrary.getState().passed[stepKey(m.id, 0)]).toBeTruthy();
    expect(useLibrary.getState().playing).toBeNull();
    expect(useUI.getState().module).toBe('library');
    expect(useLibrary.getState().view).toEqual({ page: 'module', id: m.id });
  });
  it('Back goes to the previous step and Exit leaves the player', () => {
    playStep('gas-basics', 2); previousStep();
    expect(useLibrary.getState().playing?.step).toBe(1);
    exitPlayer(); expect(useLibrary.getState().playing).toBeNull(); expect(useUI.getState().module).toBe('library');
  });
});

describe('library pages render', () => {
  let container: HTMLDivElement; let root: Root;
  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    useLibrary.getState().resetLibrary(); useProgress.getState().reset();
    container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); });
  const buttonByText = (t: string) => [...container.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.trim().startsWith(t));

  it('home shows the featured module, a starter row, every shelf and the learning paths', async () => {
    await act(async () => root.render(<Library />));
    expect(container.querySelector('h1')?.textContent).toBe(MODULES.find((m) => m.isNew)!.title);
    expect(container.textContent).toContain('Start here');
    for (const s of SHELVES) expect(container.textContent).toContain(s.title);
    expect(container.textContent).toContain('Learning paths');
  });
  it('continue learning replaces the starter row once a module is under way', async () => {
    useLibrary.getState().touch('lines-artline');
    await act(async () => root.render(<Library />));
    expect(container.textContent).toContain('Continue learning');
  });
  it('a module card opens the module page with every step listed', async () => {
    await act(async () => root.render(<Library />));
    const m = MODULE_BY_ID['vent-ards'];
    await act(async () => useLibrary.getState().go({ page: 'module', id: m.id }));
    expect(container.querySelector('h1')?.textContent).toBe(m.title);
    expect(container.querySelectorAll('.lib-steps li')).toHaveLength(m.steps.length);
    await act(async () => buttonByText('+ My list')!.click());
    expect(useLibrary.getState().myList).toContain(m.id);
  });
  it('the shelf page filters by type', async () => {
    await act(async () => root.render(<Library />));
    await act(async () => useLibrary.getState().go({ page: 'shelf', id: 'resp' }));
    const all = container.querySelectorAll('.lib-grid > *').length;
    await act(async () => buttonByText('Cases')!.click());
    const cases = container.querySelectorAll('.lib-grid > .lib-case').length;
    expect(cases).toBe(casesOn('resp').length); expect(cases).toBeLessThan(all);
    expect(container.querySelectorAll('.lib-grid > .lib-card')).toHaveLength(0);
  });
  it('a learning path lists its modules and filters by section', async () => {
    await act(async () => root.render(<Library />));
    await act(async () => useLibrary.getState().go({ page: 'path', id: 'fpc' }));
    expect(container.querySelectorAll('.lib-steps li')).toHaveLength(MODULES.length);
    await act(async () => buttonByText('Neuro')!.click());
    expect(container.querySelectorAll('.lib-steps li')).toHaveLength(MODULES.filter((m) => m.shelf === 'neuro').length);
  });
});
