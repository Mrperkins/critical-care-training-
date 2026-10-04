import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

const sw = fs.readFileSync('site/sw.js', 'utf8');
describe('offline support', () => {
  it('the service worker is versioned at build time and precaches files that exist on the site', () => {
    expect(sw.match(/__VERSION__/g)?.length).toBe(1);
    const core = JSON.parse(sw.match(/const CORE = (\[[^\]]+\])/s)![1].replace(/'/g, '"'));
    const build = fs.readFileSync('scripts/build-app.ts', 'utf8');
    for (const f of core.filter((x: string) => x !== './' && !x.startsWith('models/resp'))) {
      if (f === 'audio/index.html') expect(build, 'generated audio shell').toMatch(/path\.join\(audioDir, 'index\.html'\)/);
      else expect(fs.existsSync(`../${f}`) || fs.existsSync(`site/${f}`), f).toBe(true);
    }
  });
  it('answers media range requests from cache and keeps index.html network-first', () => {
    expect(sw).toMatch(/status: 206/); expect(sw).toMatch(/req\.mode === 'navigate'/);
  });
  it('web manifests are installable', () => {
    const m = JSON.parse(fs.readFileSync('site/manifest.webmanifest', 'utf8'));
    expect(m.display).toBe('standalone'); expect(m.start_url).toBe('./');
    for (const i of m.icons) expect(fs.existsSync(`site/${i.src}`)).toBe(true);
    const audio = JSON.parse(fs.readFileSync('site/audio-manifest.webmanifest', 'utf8'));
    expect(audio.display).toBe('standalone'); expect(audio.start_url).toBe('./'); expect(audio.scope).toBe('./');
    const build = fs.readFileSync('scripts/build-app.ts', 'utf8');
    expect(build).toMatch(/rel="manifest"/);
    expect(build).toMatch(/audio-manifest\.webmanifest/);
  });
});
