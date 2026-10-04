/** Bundles the app. `dist/index.html` is fully self-contained (bundle + heart GLB + mapping inlined). */
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(ROOT, 'dist'); fs.mkdirSync(out, { recursive: true });
const res = await build({ entryPoints: [path.join(ROOT, 'src/main.tsx')], bundle: true, minify: true, format: 'iife', target: ['es2020'], write: false, outdir: out, loader: { '.css': 'css' }, define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', legalComments: 'none', logLevel: 'warning' });
const js = res.outputFiles.find((f) => f.path.endsWith('.js'))!.text; const css = res.outputFiles.find((f) => f.path.endsWith('.css'))?.text ?? '';
fs.writeFileSync(path.join(out, 'bundle.js'), js); fs.writeFileSync(path.join(out, 'bundle.css'), css);
const glb = fs.readFileSync(path.join(ROOT, 'public/models/heart/heart.glb')).toString('base64');
const map = fs.readFileSync(path.join(ROOT, 'public/models/heart/heart.mapping.json'), 'utf8');
const head = `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<title>Infarct Atlas</title>\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap" rel="stylesheet">\n<style>${css}</style>`;
const html = `${head}\n<div id="root"></div>\n<script>window.__HEART_MAP__=${map};window.__HEART_GLB__=${JSON.stringify(glb)};</script>\n<script>${js.replace(/<\/script/g, '<\\/script')}</script>\n`;
fs.writeFileSync(path.join(out, 'index.html'), html);
// dev page that loads the GLB from public/models (the one-file asset swap path)
fs.writeFileSync(path.join(out, 'dev.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head}<div id="root"></div><script src="bundle.js"></script>`);
console.log('bundle', (js.length / 1e6).toFixed(2), 'MB · index.html', (html.length / 1e6).toFixed(2), 'MB');
