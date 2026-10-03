// Copies the publishable build (dist/pub) over the repository root, which GitHub Pages serves.
// Leaves repo-root content the build does not own (infarct-atlas/, models/cell/, models/molecular/, manifests, tools/) untouched.
import fs from 'node:fs';
import path from 'node:path';
const APP = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = path.resolve(APP, '..'); const PUB = path.join(APP, 'dist/pub');
if (!fs.existsSync(path.join(PUB, 'index.html'))) { console.error('run the build first'); process.exit(1); }
for (const f of ['index.html', 'sw.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png']) fs.copyFileSync(path.join(PUB, f), path.join(SITE, f));
for (const dir of ['models', 'vo']) for (const f of fs.readdirSync(path.join(PUB, dir))) fs.copyFileSync(path.join(PUB, dir, f), path.join(SITE, dir, f));
console.log('site updated from', PUB);
