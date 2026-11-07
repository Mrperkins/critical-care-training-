// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EPISODES, MENTAL_REPS } from '../src/audio/catalog';
import { Library } from '../src/library/Library';
import { useLibrary } from '../src/library/libraryStore';
import { episodeSources } from '../src/library/audio/player';
import { search, loadAudioIndex } from '../src/library/searchIndex';

describe('audio sources', () => {
  it('prefers a whole-episode file, else plays the parts in order', () => {
    const map = { 'episode.x.part002': { file: 'narration/x2.mp3' }, 'episode.x.part001': { file: 'narration/x1.mp3' }, 'episode.y': { file: 'y.mp3', transcriptHash: 'h' } };
    expect(episodeSources(map, 'x')).toEqual(['audio/narration/x1.mp3', 'audio/narration/x2.mp3']);
    expect(episodeSources(map, 'y')).toEqual(['audio/voice/y.mp3?v=h']);
    expect(episodeSources(map, 'z')).toEqual([]);
  });
});

describe('Browse › Lessons / Audio', () => {
  let container: HTMLDivElement; let root: Root;
  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({}) })));
    useLibrary.getState().resetLibrary();
    container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
  const settle = async () => { for (let i = 0; i < 100 && container.querySelector('.module-loading'); i++) await act(async () => { await new Promise((r) => setTimeout(r, 10)); }); };

  it('starts on Lessons and switches to a separate audio home, remembering the choice', async () => {
    await act(async () => root.render(<Library />));
    expect(container.querySelector('[aria-pressed="true"]')?.textContent).toContain('Lessons');
    expect(container.textContent).toContain('Start here');
    const audio = [...container.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Audio')!;
    await act(async () => audio.click()); await settle();
    expect(useLibrary.getState().mode).toBe('audio');
    expect(container.textContent).not.toContain('Start here');
    expect(container.textContent).toContain('Mental Reps · voice-guided procedures');
    expect(container.querySelectorAll('a.aud-card[href*="rep="]')).toHaveLength(MENTAL_REPS.length);
    const caseRow = [...container.querySelectorAll('.lib-row')].find((r) => r.getAttribute('aria-label')?.startsWith('Audio cases'))!;
    expect(caseRow.querySelectorAll('.aud-card')).toHaveLength(EPISODES.filter((e) => e.format === 'audio-case').length);
    expect(container.textContent).toContain('Listening tracks');
  });
});

describe('search includes audio', () => {
  it('finds sessions and Mental Reps once the audio catalog loads', async () => {
    await loadAudioIndex();
    const audio = search('push-dose').find((g) => g.kind === 'audio');
    expect(audio?.hits.some((h) => h.id.startsWith('rep:'))).toBe(true);
    expect(search('ECMO').find((g) => g.kind === 'audio')?.hits.some((h) => h.id.startsWith('ep:'))).toBe(true);
  });
});
