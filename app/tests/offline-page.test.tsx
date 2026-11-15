// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { OfflinePage, mb } from '../src/library/OfflinePage';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => { document.body.innerHTML = ''; vi.unstubAllGlobals(); });

describe('Offline page', () => {
  it('lists each pack with its size and a download button', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ version: 'x', core: 32e6, packs: [
      { id: 'reps', title: 'Mental Reps', blurb: 'Voice-guided procedure rehearsals.', files: [{ u: 'audio/narration/a.mp3', b: 8e6 }, { u: 'audio/narration/b.mp3', b: 8e6 }] },
    ] }) })));
    const el = document.createElement('div'); document.body.appendChild(el);
    await act(async () => { createRoot(el).render(<OfflinePage />); });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
    expect(el.textContent).toContain('Mental Reps');
    expect(el.textContent).toContain('2 files · 16 MB');
    expect([...el.querySelectorAll('button')].some((b) => b.textContent === 'Download')).toBe(true);
    expect(el.textContent).toContain('Offline storage starts after your first visit'); // no service worker in tests
  });
  it('formats sizes', () => { expect(mb(430e6)).toBe('430 MB'); expect(mb(1.2e9)).toBe('1.2 GB'); expect(mb(2e5)).toBe('1 MB'); });
});
