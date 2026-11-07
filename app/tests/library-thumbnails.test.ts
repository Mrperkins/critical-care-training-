import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { MODULES } from '../src/library/modules';
import { CLINICAL_THUMBS } from '../src/library/clinicalThumbs';

const manifest = JSON.parse(fs.readFileSync('../imaging/real/manifest.json', 'utf8')) as {
  accepted: string[];
  items: { id: string; file: string; poster?: string; license: string; credit: string; licenseUrl: string }[];
};

describe('library thumbnail sources', () => {
  it('every module retains an original app-rendered screenshot fallback', () => {
    for (const m of MODULES) expect(fs.existsSync(`public/thumbs/${m.id}.jpg`), m.id).toBe(true);
  });
  it('real thumbnails are shipped, correctly attributed and allowed by the existing media policy', () => {
    for (const [module, art] of Object.entries(CLINICAL_THUMBS)) {
      expect(MODULES.some((m) => m.id === module), module).toBe(true);
      const item = manifest.items.find((i) => i.id === art.id);
      expect(item, module).toBeTruthy();
      expect(art.file, module).toBe(item!.poster && item!.file.endsWith('.mp4') ? item!.poster : item!.file);
      expect(fs.existsSync(`../imaging/real/${art.file}`), module).toBe(true);
      expect(manifest.accepted, module).toContain(item!.license);
      expect(art.license, module).toBe(item!.license);
      expect(art.credit, module).toBe(item!.credit);
      expect(art.licenseUrl, module).toBe(item!.licenseUrl);
      expect(art.sourceUrl.length, module).toBeGreaterThan(5);
    }
  });
});
