import { describe, expect, it } from 'vitest';
import { buildFeedEmbedUrl, inFeedPreloadWindow, mostVisibleVideoId } from '../src/videos/feed';
import { VIDEO_LIBRARY, videoMatchesSkill } from '../src/videos/catalog';

describe('critical-care video feed', () => {
  it('builds an autoplay-safe first-player URL', () => {
    const url = new URL(buildFeedEmbedUrl('abc123', 'https://example.com', true));
    expect(url.hostname).toBe('www.youtube-nocookie.com');
    expect(url.pathname).toBe('/embed/abc123');
    expect(url.searchParams.get('autoplay')).toBe('1');
    expect(url.searchParams.get('mute')).toBe('1');
    expect(url.searchParams.get('playsinline')).toBe('1');
    expect(url.searchParams.get('enablejsapi')).toBe('1');
    expect(url.searchParams.get('controls')).toBe('0');
    expect(url.searchParams.get('disablekb')).toBe('1');
    expect(url.searchParams.get('cc_load_policy')).toBe('1');
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

  it('ships more than one Short and a useful Lecturio Nursing skills shelf', () => {
    const shorts = VIDEO_LIBRARY.filter((video) => video.reviewStatus === 'listed' && video.format === 'short');
    const lecturioSkills = VIDEO_LIBRARY.filter((video) =>
      video.reviewStatus === 'listed'
      && video.channel === 'Lecturio Nursing'
      && videoMatchesSkill(video, 'all')
    );
    expect(shorts.length).toBeGreaterThanOrEqual(2);
    expect(lecturioSkills.length).toBeGreaterThanOrEqual(7);
  });

  it('keeps every device-first skills shelf populated', () => {
    const required = ['ventilators','infusion','chest-drains','evd-icp','arterial-lines','central-lines','hfnc','iabp','ecmo'] as const;
    for (const skill of required) {
      expect(VIDEO_LIBRARY.filter((video) => video.reviewStatus === 'listed' && videoMatchesSkill(video, skill)).length).toBeGreaterThan(0);
    }
  });

  it('routes device and procedure videos into useful skill collections', () => {
    const chestTube = VIDEO_LIBRARY.find((video) => video.id === 'lecturio-nursing-chest-tube')!;
    const ivStart = VIDEO_LIBRARY.find((video) => video.id === 'lecturio-nursing-iv-start')!;
    const trach = VIDEO_LIBRARY.find((video) => video.id === 'lecturio-nursing-trach-care')!;
    const ng = VIDEO_LIBRARY.find((video) => video.id === 'lecturio-nursing-ng-insertion')!;
    expect(videoMatchesSkill(chestTube, 'chest-drains')).toBe(true);
    expect(videoMatchesSkill(ivStart, 'iv-vascular')).toBe(true);
    expect(videoMatchesSkill(trach, 'airway-trach')).toBe(true);
    expect(videoMatchesSkill(ng, 'tubes')).toBe(true);
  });
});
