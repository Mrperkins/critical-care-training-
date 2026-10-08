// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/app/App';
import { useUI } from '../src/app/store';
import { AtlasModule } from '../src/atlas/AtlasModule';
import { DISEASES } from '../src/atlas/registry';

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
async function click(name: string, within: ParentNode = container) { await act(async () => button(name, within).click()); }

beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1)); vi.stubGlobal('cancelAnimationFrame', vi.fn());
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event('close')); };
  useUI.getState().set({ module: 'curriculum', mode: 'learn', atlasDisease: null });
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

describe('phone navigation interactions', () => {
  it('every condition opens its actual mechanism from the whole-patient view', async () => {
    for (const disease of DISEASES) {
      await act(async () => {
        useUI.getState().set({ module: disease.domain, mode: 'explore', atlasDisease: disease.id });
        root.render(<AtlasModule domain={disease.domain} />);
      });
      await click('Affected anatomy');
      expect(container.querySelector('.disease-diagram'), disease.id).toBeTruthy();
      expect(container.querySelector('.disease-diagram title')?.textContent, disease.id).toContain(disease.title);
      expect(useUI.getState().atlasTarget).toBe(disease.target);
    }
  });
  it('Learn on Home enters lessons instead of leaving Home unchanged', async () => {
    await act(async () => root.render(<App />));
    await click('Learn');
    expect(useUI.getState().module).toBe('vent');
    expect(container.textContent).toContain('Respiratory lessons');
    expect(container.querySelector('.app')?.getAttribute('data-mobile-pane')).toBe('context');
    await click('Scene');
    expect(container.querySelector('.app')?.getAttribute('data-mobile-pane')).toBe('scene');
    await click('Learn');
    expect(container.querySelector('.app')?.getAttribute('data-mobile-pane')).toBe('context');
  });
  it.each([320, 360, 390, 430, 768])('Learn interaction state enters the lesson pane at %ipx (DOM only)', async (width) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn((query: string) => ({ matches: width <= +(query.match(/max-width:\s*(\d+)/)?.[1] ?? 0), addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
    await act(async () => root.render(<App />)); await click('Learn');
    expect(useUI.getState().module).toBe('vent'); expect(useUI.getState().mode).toBe('learn');
    expect(container.querySelector('.app')?.getAttribute('data-mobile-pane')).toBe('context');
    expect(container.textContent).toContain('Respiratory lessons');
  });
  it('Explore and Practice transition into their clinical experiences', async () => {
    await act(async () => root.render(<App />));
    await click('Explore'); expect(useUI.getState().mode).toBe('explore');
    expect(container.querySelector('.app')?.getAttribute('data-mobile-pane')).toBe('scene');
    await click('Practice'); expect(container.textContent).toContain('Respiratory cases');
    await click('Simulator'); expect(container.textContent).toContain('Respiratory simulator');
  });
  it('drawer chooses a domain, closes and restores focus to its trigger', async () => {
    await act(async () => root.render(<App />));
    await click('Open clinical domains');
    const drawer = container.querySelector('dialog')!;
    expect(drawer.open).toBe(true);
    await click('Blood gas', drawer);
    expect(drawer.open).toBe(false); expect(useUI.getState().module).toBe('abg');
    expect(document.activeElement).toBe(button('Open clinical domains'));
    await click('Practice'); expect(useUI.getState().module).toBe('abg'); expect(useUI.getState().mode).toBe('challenge');
  });
  it('resources remain reachable and Learn returns from Videos into clinical lessons', async () => {
    await act(async () => root.render(<App />));
    const resources = container.querySelector<HTMLDetailsElement>('.resources-menu')!;
    await act(async () => resources.querySelector('summary')!.click()); expect(resources.open).toBe(true);
    await click('Videos & Skills', resources); expect(container.textContent).toContain('Videos and Skills'); expect(resources.open).toBe(false);
    await click('Learn'); expect(container.textContent).toContain('Respiratory lessons');
  });
  it.each([320,360,390,430,768])('atlas lesson transport, bookmark and return work in the %ipx interaction state', async width => {
    const { director } = await import('../src/director/director');
    const { useProgress } = await import('../src/curriculum/progress');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    useProgress.getState().reset();
    await act(async () => root.render(<App />));
    await click('Women’s Health / OB', container.querySelector('dialog')!);
    await click('Start 4-step lesson');
    expect(container.textContent).toContain('Step 1 of 4'); expect(container.querySelector('progress[aria-label="Lesson progress"]')).toBeTruthy();
    await click('Next step'); expect(container.textContent).toContain('Step 2 of 4');
    const bookmark = container.querySelector<HTMLButtonElement>('button[title="Bookmark this moment"]')!;
    await act(async () => bookmark.click()); expect(useProgress.getState().bookmarks[0].lessonId).toMatch(/^atlas-/);
    await click('← All lessons'); expect(container.textContent).toContain('Start 4-step lesson');
    await act(async () => director.unload());
  });
  it.each([['Pediatrics','pediatrics'], ['Women’s Health / OB','womens']] as const)('%s has actual Learn, Explore and Practice content', async (label,module) => {
    await act(async () => root.render(<App />));
    await click(label,container.querySelector('dialog')!);
    expect(useUI.getState().module).toBe(module);
    expect(container.querySelectorAll('.atlas-condition-select option').length).toBeGreaterThan(10);
    expect(container.textContent).toContain('Start 4-step lesson');
    await click('Explore'); expect(useUI.getState().module).toBe(module); expect(container.querySelector('.atlas-range input')).toBeTruthy();
    await click('Practice'); expect(useUI.getState().module).toBe(module); expect(container.querySelectorAll('.atlas-decisions button')).toHaveLength(3);
    expect(container.querySelector('[aria-label="Practice type"]')).toBeNull();
    await act(async () => container.querySelector<HTMLButtonElement>('.atlas-decisions button')!.click());
    expect(container.textContent).toContain('Replay decision'); expect(container.querySelector('.atlas-consequence')).toBeTruthy();
  });
});
