// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/app/App';
import { useUI } from '../src/app/store';
import { AtlasModule } from '../src/atlas/AtlasModule';
import { DISEASES } from '../src/atlas/registry';
import { useLibrary } from '../src/library/libraryStore';

// Keep navigation real. Isolate model loading and continuously animated scene renderers.
vi.mock('../src/asset/resp', () => ({ loadRespAsset: () => new Promise(() => {}) }));
vi.mock('../src/curriculum/track', () => ({ initProgressTracking: () => () => {} }));
vi.mock('../src/vent/Waveforms', () => ({ Scalars: () => <div>Respiratory scalars</div>, Loops: () => <div>Pressure-volume loop</div> }));
vi.mock('../src/vent/VentLearn', () => ({ VentLearn: () => <section><h2>Respiratory lessons</h2><button>Open ARDS lesson</button></section> }));
vi.mock('../src/vent/VentChallenge', () => ({ VentChallenge: () => <h2>Respiratory cases</h2> }));
vi.mock('../src/vent/VentSim', () => ({ VentSim: () => <h2>Respiratory simulator</h2> }));
vi.mock('../src/vent/VentWorkbench', () => ({ VentWorkbench: () => <h2>Respiratory simulator</h2> }));
vi.mock('../src/curriculum/CurriculumModule', () => ({ CurriculumModule: () => <main><h2>Learning home</h2></main> }));
vi.mock('../src/videos/VideoLibrary', () => ({ VideoLibrary: () => <main><h2>Videos and Skills</h2></main> }));
vi.mock('../src/abg/AbgModule', () => ({ AbgModule: () => <main><h2>Blood gas workspace</h2></main> }));
vi.mock('../src/neuro/NeuroModule', () => ({ NeuroModule: () => <main><h2>Neuro workspace</h2></main> }));

vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
});
let container: HTMLDivElement; let root: Root;
function button(name: string, within: ParentNode = container) {
  const hit = [...within.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.getAttribute('aria-label') === name || (b.querySelector('.domain-label')?.textContent ?? b.textContent)?.trim() === name);
  if (!hit) throw new Error(`Button ${name} missing`);
  return hit;
}
/** modules load lazily: wait until no module is still loading */
async function settle() { for (let i = 0; i < 200 && container.querySelector('.module-loading'); i++) await act(async () => { await new Promise((r) => setTimeout(r, 5)); }); }
async function click(name: string, within: ParentNode = container) { await act(async () => button(name, within).click()); await settle(); }
/** first button under `sel` whose text contains `text` */
async function tap(sel: string, text: string) {
  const hit = [...container.querySelectorAll<HTMLButtonElement>(sel)].find((b) => b.textContent?.includes(text));
  if (!hit) throw new Error(`${sel} "${text}" missing`);
  await act(async () => hit.click()); await settle();
}
/** land in a system's workspace the way a deep link or a hub button does */
async function enter(module: Parameters<ReturnType<typeof useUI.getState>['set']>[0]['module']) { await act(async () => { useUI.getState().set({ module, mode: 'learn', atlasDisease: null }); }); await settle(); }

beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1)); vi.stubGlobal('cancelAnimationFrame', vi.fn());
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event('close')); };
  useUI.getState().set({ module: 'library', mode: 'learn', atlasDisease: null }); useLibrary.getState().resetLibrary();
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

describe('phone navigation interactions', () => {
  it('every condition opens its affected anatomy in 3D from the whole-patient view', async () => {
    for (const disease of DISEASES) {
      await act(async () => {
        useUI.getState().set({ module: disease.domain, mode: 'explore', atlasDisease: disease.id });
        root.render(<AtlasModule domain={disease.domain} />);
      });
      await click('Affected anatomy');
      const fig = container.querySelector('.atlas-visual-3d');
      expect(fig, disease.id).toBeTruthy();
      expect(fig?.getAttribute('aria-label'), disease.id).toContain(disease.title);
      expect(fig?.getAttribute('data-organs'), disease.id).toBeTruthy();
      expect(useUI.getState().atlasTarget).toBe(disease.target);
    }
  });
  it('Start module on Browse plays its first step in the player: slim top bar, step dots, reader column', async () => {
    await act(async () => root.render(<App />)); await settle();
    expect(container.querySelector('#library-main')).toBeTruthy();
    await click('Start module');
    expect(useUI.getState().module).toBe('vent'); expect(useUI.getState().mode).toBe('learn');
    const top = container.querySelector('.lp-top'); expect(top).toBeTruthy();
    expect(top!.querySelector('.lp-dots')?.children.length).toBeGreaterThan(1);
    expect(top!.textContent).toMatch(/Step 1 of \d+/);
    expect(container.querySelector('.lp-reader')).toBeTruthy();
    expect(container.querySelector('.step-rail')).toBeNull();
    // the step list opens from the dots
    await act(async () => { top!.querySelector<HTMLButtonElement>('.lp-dots')!.click(); });
    expect(container.querySelector('.lp-steps')?.textContent).toContain('Step 1');
  });
  it.each([320, 360, 390, 430, 768])('Learn interaction state enters the lesson pane at %ipx (DOM only)', async (width) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn((query: string) => ({ matches: width <= +(query.match(/max-width:\s*(\d+)/)?.[1] ?? 0), addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
    await act(async () => root.render(<App />)); await settle(); await enter('vent');
    expect(useUI.getState().module).toBe('vent'); expect(useUI.getState().mode).toBe('learn');
    expect(container.querySelector('.app')?.getAttribute('data-mobile-pane')).toBe('context');
    expect(container.textContent).toContain('Respiratory lessons');
  });
  it('Explore and Practice transition into their clinical experiences', async () => {
    await act(async () => root.render(<App />)); await settle(); await enter('vent');
    await tap('.experience-nav button', 'Explore'); expect(useUI.getState().mode).toBe('explore');
    expect(container.querySelector('.app')?.getAttribute('data-mobile-pane')).toBe('scene');
    await tap('.experience-nav button', 'Practice'); expect(container.textContent).toContain('Respiratory cases');
    await click('Simulator'); expect(container.textContent).toContain('Respiratory simulator');
  });
  it('the five destinations are in the top bar and the phone tab bar, and open their pages', async () => {
    await act(async () => root.render(<App />)); await settle();
    for (const nav of ['.lib-nav', '.tabbar']) expect(container.querySelectorAll(`${nav} button`)).toHaveLength(5);
    expect(container.querySelector('.tabbar [aria-current="page"]')?.textContent).toBe('Today');
    await tap('.tabbar button', 'Learn'); expect(useLibrary.getState().view.page).toBe('learn');
    await tap('.sys-tile', 'Respiratory'); expect(useLibrary.getState().view).toMatchObject({ page: 'shelf', id: 'resp' });
    expect(container.textContent).toContain('Modules, in order');
    await click('Open the scene'); expect(useUI.getState().module).toBe('vent'); expect(useUI.getState().mode).toBe('explore');
    expect(container.querySelector('.app')?.getAttribute('data-mobile-pane')).toBe('scene');
    await tap('.tabbar button', 'Practice'); expect(useUI.getState().module).toBe('library'); expect(useLibrary.getState().view.page).toBe('practice');
    await tap('.tabbar button', 'Exam'); expect(useUI.getState().module).toBe('fpc');
    expect(container.querySelector('dialog.domain-dialog')).toBeNull(); expect(container.querySelector('.resources-menu')).toBeNull();
  });
  it('a system workspace switches Learn, Explore and Practice', async () => {
    await act(async () => root.render(<App />)); await settle(); await enter('abg');
    await tap('.experience-nav button', 'Practice'); expect(useUI.getState().module).toBe('abg'); expect(useUI.getState().mode).toBe('challenge');
  });
  it('reference keeps videos reachable and the brand returns to Today', async () => {
    await act(async () => root.render(<App />)); await settle();
    await tap('.lib-nav button', 'Reference'); expect(container.textContent).toContain('Imaging academy');
    await tap('#library-main button', 'Videos & skills'); expect(container.textContent).toContain('Videos and Skills');
    await enter('vent'); expect(container.textContent).toContain('Respiratory lessons');
    await click('Go to browse'); expect(useUI.getState().module).toBe('library'); expect(container.querySelector('#library-main')).toBeTruthy();
    expect(useLibrary.getState().view.page).toBe('home');
  });
  it.each([320,360,390,430,768])('atlas lesson transport, bookmark and return work in the %ipx interaction state', async width => {
    const { director } = await import('../src/director/director');
    const { useProgress } = await import('../src/curriculum/progress');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    useProgress.getState().reset();
    await act(async () => root.render(<App />)); await settle();
    await enter('womens');
    await click('Start 4-chapter explainer');
    // every lesson opens on the choice between the full course and the TL;DR
    expect(container.textContent).toContain('Full course'); expect(container.textContent).toContain('TL;DR');
    await act(async () => container.querySelector<HTMLButtonElement>('.track-option:not(.tldr)')!.click());
    expect(container.textContent).toContain('Scene 1 of 4'); expect(container.querySelector('input[aria-label="Lesson time"]')).toBeTruthy();
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Next scene"]')!.click()); expect(container.textContent).toContain('Scene 2 of 4');
    const bookmark = container.querySelector<HTMLButtonElement>('button[aria-label="Bookmark this moment"]')!;
    await act(async () => bookmark.click()); expect(useProgress.getState().bookmarks[0].lessonId).toMatch(/^atlas-/);
    await click('All lessons'); expect(container.textContent).toContain('Start 4-chapter explainer');
    await act(async () => director.unload());
  });
  it.each([['Pediatrics','pediatrics'], ['Women’s Health / OB','womens']] as const)('%s has actual Learn, Explore and Practice content', async (label,module) => {
    await act(async () => root.render(<App />)); await settle();
    await enter(module);
    expect(useUI.getState().module).toBe(module);
    expect(container.querySelectorAll('.atlas-condition-select option').length).toBeGreaterThan(10);
    expect(container.textContent).toContain('Start 4-chapter explainer');
    await tap('.experience-nav button', 'Explore'); expect(useUI.getState().module).toBe(module); expect(container.querySelector('.atlas-range input')).toBeTruthy();
    await tap('.experience-nav button', 'Practice'); expect(useUI.getState().module).toBe(module); expect(container.querySelectorAll('.atlas-decisions button')).toHaveLength(3);
    expect(container.querySelector('[aria-label="Practice type"]')).toBeNull();
    await act(async () => container.querySelector<HTMLButtonElement>('.atlas-decisions button')!.click());
    expect(container.textContent).toContain('Replay decision'); expect(container.querySelector('.atlas-consequence')).toBeTruthy();
  });
});
