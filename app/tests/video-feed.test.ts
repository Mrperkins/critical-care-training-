import { describe, expect, it } from 'vitest';
import { buildFeedEmbedUrl, inFeedPreloadWindow, mostVisibleVideoId } from '../src/videos/feed';

describe('critical-care video feed', () => {
  it('builds an autoplay-safe first-player URL', () => {
    const url = new URL(buildFeedEmbedUrl('abc123', 'https://example.com', true));
    expect(url.hostname).toBe('www.youtube-nocookie.com');
    expect(url.pathname).toBe('/embed/abc123');
    expect(url.searchParams.get('autoplay')).toBe('1');
    expect(url.searchParams.get('mute')).toBe('1');
    expect(url.searchParams.get('playsinline')).toBe('1');
    expect(url.searchParams.get('enablejsapi')).toBe('1');
    expect(url.searchParams.get('origin')).toBe('https://example.com');
    expect(url.searchParams.get('playlist')).toBe('abc123');
  });

  it('preloads adjacent players but not the whole feed', () => {
    expect(inFeedPreloadWindow(3, 3)).toBe(true);
    expect(inFeedPreloadWindow(2, 3)).toBe(true);
    expect(inFeedPreloadWindow(4, 3)).toBe(true);
    expect(inFeedPreloadWindow(1, 3)).toBe(false);
    expect(inFeedPreloadWindow(5, 3)).toBe(false);
  });

  it('chooses the most visible player only after it crosses 51 percent', () => {
    const ids = ['a', 'b', 'c'];
    expect(mostVisibleVideoId(ids, new Map([['a', 0.49], ['b', 0.5], ['c', 0.1]]))).toBeNull();
    expect(mostVisibleVideoId(ids, new Map([['a', 0.2], ['b', 0.64], ['c', 0.55]]))).toBe('b');
  });
});
