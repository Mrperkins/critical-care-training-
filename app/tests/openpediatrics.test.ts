import { describe, expect, it } from 'vitest';
import { OPENPEDIATRICS_RESOURCES } from '../src/videos/openpediatrics';
import { VIDEO_LIBRARY, canAutoplayInFeed, videoProvider, videoSourceUrl } from '../src/videos/catalog';

describe('OPENPediatrics learning references', () => {
  it('includes the original ventilator simulator and four public supporting lessons', () => {
    expect(OPENPEDIATRICS_RESOURCES).toHaveLength(5);
    expect(OPENPEDIATRICS_RESOURCES.some(r => r.id === 'openpediatrics-ventilator-simulator')).toBe(true);
    const titles = OPENPEDIATRICS_RESOURCES.map(x=>x.title);
    expect(titles).toEqual(expect.arrayContaining([
      expect.stringContaining('Ventilator Simulator'),
      expect.stringContaining('Modes of Mechanical Ventilation'),
      expect.stringContaining('General Ventilator Set-Up'),
      expect.stringContaining('Ventilator Waveforms'),
      expect.stringContaining('Introduction to Mechanical Ventilation'),
    ]));
  });
  it('keeps provider learning content on the original educator website instead of bundling or autoplaying it', () => {
    for (const item of OPENPEDIATRICS_RESOURCES) {
      expect(item.provider).toBe('external');
      expect(item.sourceClass).toBe('educator');
      expect(item.sourceUrl).toMatch(/^https:\/\/www\.openpediatrics\.org\//);
      expect(item.mediaUrl).toBeUndefined();
      expect(item.embedUrl).toBeUndefined();
      expect(videoProvider(item)).toBe('external');
      expect(canAutoplayInFeed(item)).toBe(false);
      expect(videoSourceUrl(item)).toBe(item.sourceUrl);
    }
  });
  it('places all references in the browsable clinical resource catalog', () => {
    for (const item of OPENPEDIATRICS_RESOURCES) {
      const match = VIDEO_LIBRARY.find(x => x.id === item.id);
      expect(match).toBe(item);
      expect(match?.reviewStatus).toBe('listed');
    }
  });
});
