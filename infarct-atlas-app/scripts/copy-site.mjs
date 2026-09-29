// Copies the self-contained build (dist/index.html) to /infarct-atlas/index.html, which GitHub Pages serves.
import fs from 'node:fs';
import path from 'node:path';
const APP = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = path.join(APP, 'dist/index.html'); const dst = path.resolve(APP, '../infarct-atlas/index.html');
if (!fs.existsSync(src)) { console.error('run the build first'); process.exit(1); }
const html = fs.readFileSync(src, 'utf8');
if (/var (\w+)=var \1=/.test(html)) { console.error('malformed bundle (duplicated declaration) — refusing to publish'); process.exit(1); }
fs.copyFileSync(src, dst); console.log('infarct-atlas/index.html updated', (html.length / 1e6).toFixed(2), 'MB');
