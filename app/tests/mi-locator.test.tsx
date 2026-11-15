// @vitest-environment jsdom
/**
 * MI Locator inside the Cardiac tab: layout (heart and ECG side by side in one scene pane), the ECG paper layout,
 * the shared clock and the explore / lesson / case panels. Real WebGL rendering is covered by scripts/qa-mi-locator.mjs.
 */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }) }); });
vi.mock('../src/infarct/components/HeartScene', () => ({
  HeartScene: () => <div>3D heart test boundary</div>,
  selectTerritory: (id: string) => useApp.getState().set({ territoryId: id, vesselId: null, leadId: null, culpritIndex: 0, seq: 0, seqPlaying: true }),
  selectLead: (id: string | null) => { const s = useApp.getState(); s.set({ leadId: s.leadId === id ? null : id as never }); },
}));
import { MILocator, setMode, applyLessonStep } from '../src/infarct/components/MILocator';
import { ecgLayout, ecgStage, MIN_PX_PER_MM, NARROW_GRID } from '../src/infarct/components/ECGPanel';
import { useApp, NORMAL_SCENE } from '../src/infarct/engine/store';
import { clock, msSinceSA, mechanics, SA_AT } from '../src/infarct/engine/clock';
import { T_P, T_QRS, T_J, RR } from '../src/infarct/ecg/ecgModel';
import { useHeartUI } from '../src/heart/heartStore';
import { CardiacViews } from '../src/heart/HeartModule';

describe('ECG paper layout', () => {
  it('uses the conventional 3 × 4 + rhythm strip when wide enough to read 1 mm', () => {
    const L = ecgLayout(900, 700, false);
    expect(L.narrow).toBe(false); expect(L.mm).toBeGreaterThanOrEqual(MIN_PX_PER_MM);
    expect(L.cells).toHaveLength(13); expect(L.cells[12]).toMatchObject({ id: 'II', w: 900, secs: 10 });
  });
  it('switches to 6 × 2 (limb | chest) in a narrow column, keeping ≥ 2.4 px per mm', () => {
    const L = ecgLayout(445, 690, false);
    expect(L.narrow).toBe(true); expect(L.mm).toBeGreaterThanOrEqual(3.4);
    expect(L.cells.slice(0, 12).map((c) => c.id)).toEqual(NARROW_GRID.flat());
  });
  it('adds posterior and right-sided leads as extra rows', () => {
    expect(ecgLayout(900, 700, true).cells.map((c) => c.id).slice(13)).toEqual(['V7', 'V8', 'V9', 'V3R', 'V4R']);
    const n = ecgLayout(445, 690, true); expect(n.rows).toBe(10); expect(n.cells).toHaveLength(18);
  });
  it('fits the box, never squashes a row below 14 mm of paper, and uses natural height on touch layouts', () => {
    const tight = ecgLayout(445, 300, true); expect(tight.rowH).toBeGreaterThanOrEqual(tight.mm * 14 - 1e-9); expect(tight.height).toBeGreaterThan(300);
    const nat = ecgLayout(390, Infinity, false); expect(nat.rowH).toBeCloseTo(nat.mm * 24); expect(Number.isFinite(nat.height)).toBe(true);
  });
  it('names the stage of the evolving ECG', () => {
    expect(ecgStage(0, 0)).toBe('Normal ECG'); expect(ecgStage(0.2, 0)).toMatch(/Hyperacute/);
    expect(ecgStage(0.6, 0)).toMatch(/ST elevation/); expect(ecgStage(1, 1)).toMatch(/Reperfused/);
  });
});

describe('one clock for the ECG sweep, the beat and the conduction wavefront', () => {
  it('advances in clamped steps and stops while paused', () => {
    clock.seek(0); clock.setPaused(false); clock.advance(0.016); expect(clock.time).toBeCloseTo(0.016);
    clock.advance(5); expect(clock.time).toBeCloseTo(0.116); // a background tab cannot jump the beat
    clock.setPaused(true); clock.advance(0.05); expect(clock.time).toBeCloseTo(0.116); clock.setPaused(false);
  });
  it('fires the SA node as the P wave begins and finishes His–Purkinje activation inside the QRS', () => {
    expect(SA_AT).toBeLessThan(T_P);
    const hisAt = SA_AT + 0.117; expect(hisAt).toBeGreaterThan(T_QRS - 0.03); expect(hisAt).toBeLessThan(T_QRS + 0.01);
    expect(SA_AT + 0.186).toBeLessThan(T_J);
    expect(msSinceSA(SA_AT)).toBeCloseTo(0); expect(msSinceSA(SA_AT - 0.01)).toBeCloseTo(RR * 1000 - 10);
  });
  it('contracts the ventricles after the QRS (electrical before mechanical)', () => {
    expect(mechanics(T_QRS).vent).toBeLessThan(0.01); expect(mechanics(T_QRS + 0.18).vent).toBeGreaterThan(0.9);
  });
});

describe('MI state', () => {
  beforeEach(() => useApp.getState().set({ mode: 'explore', territoryId: null, vesselId: null, leadId: null, scene: { ...NORMAL_SCENE } }));
  it('re-entering the same mode keeps the selection (the view can remount without clearing a territory)', () => {
    useApp.getState().set({ territoryId: 'inferior' }); setMode('explore'); expect(useApp.getState().territoryId).toBe('inferior');
    setMode('quiz'); expect(useApp.getState().territoryId).toBeNull();
    setMode('lesson'); expect(useApp.getState().territoryId).toBe('inferior'); expect(useApp.getState().scene.camera).toBe('overview');
    applyLessonStep('anterior', 99); expect(useApp.getState().territoryId).toBe('anterior'); expect(useApp.getState().scene.emphasizeAffected).toBe(true);
    setMode('explore');
  });
});

let root: Root, container: HTMLDivElement;
beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1)); vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline in tests'))));
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  useApp.getState().set({ mode: 'explore', territoryId: null, vesselId: null, leadId: null, scene: { ...NORMAL_SCENE } });
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
const btn = (name: string | RegExp, scope: ParentNode = container) => { const b = [...scope.querySelectorAll<HTMLButtonElement>('button')].find((x) => typeof name === 'string' ? x.textContent?.trim() === name || x.getAttribute('aria-label') === name : name.test(x.textContent ?? '')); if (!b) throw new Error(`Missing button ${name}`); return b; };

describe('MI Locator view', () => {
  it('puts the 3D heart and the 12-lead ECG side by side in the scene pane, explanation in the side pane', async () => {
    useHeartUI.getState().set({ section: 'coronary' });
    await act(async () => root.render(<MILocator mode="explore" header={<CardiacViews />} />));
    const scene = container.querySelector('.scene-pane')!; const split = scene.querySelector('.mi-split')!;
    expect(split.children[0].classList.contains('mi-heart')).toBe(true);
    expect(split.children[1].getAttribute('aria-label')).toBe('12-lead ECG');
    expect(container.querySelector('aside.side-pane')?.textContent).toMatch(/Why does an inferior MI show up in II, III and aVF/);
    expect(btn('MI Locator', scene.querySelector('.cardiac-views')!).getAttribute('aria-pressed')).toBe('true');
  });
  it('picking a territory explains it with its leads and culprit vessel', async () => {
    await act(async () => root.render(<MILocator mode="explore" />));
    await act(async () => btn('Inferior', container.querySelector('.mi-terr')!).click());
    const side = container.querySelector('aside')!;
    expect(side.querySelector('.h2')?.textContent).toBe('Inferior');
    expect([...side.querySelectorAll('.mi-chip.k-a')].map((c) => c.textContent)).toEqual(['II', 'III', 'aVF']);
    expect([...side.querySelectorAll('.mi-chip.k-r')].map((c) => c.textContent)).toEqual(['I', 'aVL']);
    expect(side.textContent).toMatch(/Right coronary artery/);
  });
  it('dominance changes the culprit for an inferior MI', async () => {
    await act(async () => root.render(<MILocator mode="explore" />));
    await act(async () => btn('Inferior', container.querySelector('.mi-terr')!).click());
    const fold = btn(/View options/); if (fold.getAttribute('aria-expanded') !== 'true') await act(async () => fold.click());
    await act(async () => btn('Left', container.querySelector('.mi-card .seg')!).click());
    expect(container.querySelector('aside')!.textContent).toMatch(/Left circumflex artery/);
    await act(async () => btn('Right', container.querySelector('.mi-card .seg')!).click());
  });
  it('the Learn tab runs the territory lessons with the narrated STEMI lesson on top', async () => {
    await act(async () => root.render(<MILocator mode="lesson" />));
    expect(container.textContent).toMatch(/STEMI: find the culprit/);
    expect(container.textContent).toMatch(/Step 1 of/);
    await act(async () => btn('Next', container.querySelector('aside')!).click());
    expect(container.querySelector('aside')!.textContent).toMatch(/Step 2 of/);
  });
  it('the Practice tab hides the answer until it is revealed on the heart', async () => {
    await act(async () => root.render(<MILocator mode="quiz" />));
    expect(container.textContent).toMatch(/Case 1 of/);
    expect(useApp.getState().territoryId).toBeNull();
    expect(container.querySelector('.mi-terr')).toBeNull();
    const fold = btn(/View options/); if (fold.getAttribute('aria-expanded') !== 'true') await act(async () => fold.click());
    expect(container.textContent).toMatch(/Leads around the torso/); expect(container.textContent).toMatch(/Pane size/);
    expect(container.textContent).not.toMatch(/Coronary dominance/); // the case sets it
  });
  it('the Cardiac view switch moves between Heart & flow and MI Locator', async () => {
    useHeartUI.getState().set({ section: 'structure' });
    await act(async () => root.render(<CardiacViews />));
    await act(async () => btn('MI Locator').click()); expect(useHeartUI.getState().section).toBe('coronary');
    await act(async () => btn('Heart & flow').click()); expect(useHeartUI.getState().section).toBe('structure');
  });
});
