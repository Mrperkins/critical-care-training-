import { describe, expect, it } from 'vitest';
import { buildFeedEmbedUrl, inFeedPreloadWindow, mostVisibleVideoId } from '../src/videos/feed';
import { VIDEO_LIBRARY, canAutoplayInFeed, videoMatchesSkill, videoProvider, videoSourceUrl } from '../src/videos/catalog';

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
    const required = ['ventilators','infusion','chest-drains','evd-icp','arterial-lines','central-lines','hfnc','iabp','ecmo','monitor-defib'] as const;
    for (const skill of required) {
      expect(VIDEO_LIBRARY.filter((video) => video.reviewStatus === 'listed' && videoMatchesSkill(video, skill)).length).toBeGreaterThan(0);
    }
  });

  it('supports official manufacturer-hosted sources without pretending they are YouTube', () => {
    const infusomat = VIDEO_LIBRARY.find((video) => video.id === 'bbraun-infusomat-space-official-media')!;
    const mri = VIDEO_LIBRARY.find((video) => video.id === 'bbraun-spaceplus-mri-handling')!;
    expect(videoProvider(infusomat)).toBe('external');
    expect(infusomat.sourceClass).toBe('manufacturer');
    expect(videoSourceUrl(infusomat)).toContain('bbraun.com');
    expect(canAutoplayInFeed(infusomat)).toBe(false);
    expect(videoMatchesSkill(infusomat, 'infusion')).toBe(true);
    expect(videoSourceUrl(mri)).toContain('registration-form-for-mri-video');
  });

  it('keeps provider support ready for native and embeddable manufacturer media', () => {
    const native = { ...VIDEO_LIBRARY[0], provider: 'html5' as const, mediaUrl: 'https://example.com/device.mp4', youtubeId: undefined };
    const embedded = { ...VIDEO_LIBRARY[0], provider: 'embed' as const, embedUrl: 'https://example.com/embed/device', youtubeId: undefined };
    expect(canAutoplayInFeed(native)).toBe(true);
    expect(canAutoplayInFeed(embedded)).toBe(true);
  });

  it('ships official resources for priority critical-care manufacturers', () => {
    const requiredManufacturers = ['B. Braun','Eitan Medical','F&P Healthcare','Hamilton Medical','ZOLL','Stryker','Getinge','Medtronic'];
    for (const manufacturer of requiredManufacturers) {
      const resources = VIDEO_LIBRARY.filter((video) =>
        video.reviewStatus === 'listed'
        && video.sourceClass === 'manufacturer'
        && video.channel === manufacturer
      );
      expect(resources.length, manufacturer).toBeGreaterThan(0);
      expect(resources.some((video) => videoSourceUrl(video).startsWith('https://'))).toBe(true);
    }
  });

  it('keeps autoplay feed content playable even as external manufacturer resources grow', () => {
    const external = VIDEO_LIBRARY.find((video) => video.id === 'hamilton-t1-official-training-hub')!;
    const youtubeManufacturer = VIDEO_LIBRARY.find((video) => video.id === 'airvo2-setup-official')!;
    expect(canAutoplayInFeed(external)).toBe(false);
    expect(videoProvider(external)).toBe('external');
    expect(canAutoplayInFeed(youtubeManufacturer)).toBe(true);
    expect(videoProvider(youtubeManufacturer)).toBe('youtube');
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
    const lifepak = VIDEO_LIBRARY.find((video) => video.id === 'stryker-lifepak15-training-hub')!;
    const ltv = VIDEO_LIBRARY.find((video) => video.id === 'zoll-ltv-resources')!;
    const cardiohelp = VIDEO_LIBRARY.find((video) => video.id === 'getinge-cardiohelp-howto')!;
    expect(videoMatchesSkill(lifepak, 'monitor-defib')).toBe(true);
    expect(videoMatchesSkill(ltv, 'ventilators')).toBe(true);
    expect(videoMatchesSkill(cardiohelp, 'ecmo')).toBe(true);
  });
});
