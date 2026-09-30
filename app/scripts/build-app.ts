/** Bundles the app. dist/index.html is fully self-contained (bundle + anatomy GLBs + mappings + narration inlined). */
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(ROOT, 'dist'); fs.mkdirSync(out, { recursive: true });
const res = await build({ entryPoints: [path.join(ROOT, 'src/main.tsx')], bundle: true, minify: true, format: 'iife', target: ['es2020'], write: false, outdir: out, loader: { '.css': 'css' }, define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', legalComments: 'none', logLevel: 'warning' });
const js = res.outputFiles.find((f) => f.path.endsWith('.js'))!.text; const css = res.outputFiles.find((f) => f.path.endsWith('.css'))?.text ?? '';
fs.writeFileSync(path.join(out, 'bundle.js'), js); fs.writeFileSync(path.join(out, 'bundle.css'), css);
const inline: string[] = [];
const add = (glob: string, file: string, json = false) => { const p = path.join(ROOT, file); if (!fs.existsSync(p)) return; inline.push(`window.${glob}=${json ? fs.readFileSync(p, 'utf8') : JSON.stringify(fs.readFileSync(p).toString('base64'))};`); };
add('__RESP_GLB__', 'public/models/resp.glb'); add('__RESP_MAP__', 'public/models/resp.mapping.json', true);
add('__BODY_GLB__', 'public/models/body.glb'); add('__BODY_MAP__', 'public/models/body.mapping.json', true);
add('__MICRO_GLB__', 'public/models/micro.glb'); add('__MICRO_MAP__', 'public/models/micro.mapping.json', true);
add('__LINES_GLB__', 'public/models/lines.glb'); add('__LINES_MAP__', 'public/models/lines.mapping.json', true);
add('__VO__', 'public/vo/vo.json', true);
const head = `<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<title>Critical Care Physiology</title>\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,500;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">\n<style>${css}</style>`;
const html = `${head}\n<div id="root"></div>\n<script>${inline.join('\n')}</script>\n<script>${js.replace(/<\/script/g, '<\\/script')}</script>\n`;
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, 'dev.html'), `${head}<div id="root"></div><script src="bundle.js"></script>`);
// publishable multi-file version: small page + separate model / narration files
const pub = path.join(out, 'pub'); fs.rmSync(pub, { recursive: true, force: true }); fs.mkdirSync(path.join(pub, 'models'), { recursive: true }); fs.mkdirSync(path.join(pub, 'vo'), { recursive: true });
for (const f of ['resp.glb', 'resp.mapping.json', 'micro.glb', 'micro.mapping.json', 'body.glb', 'body.mapping.json', 'lines.glb', 'lines.mapping.json']) { const p = path.join(ROOT, 'public/models', f); if (fs.existsSync(p)) { if (f.endsWith('.glb')) fs.writeFileSync(path.join(pub, 'models', f + '.txt'), fs.readFileSync(p).toString('base64')); else fs.copyFileSync(p, path.join(pub, 'models', f)); } }
let voIds: string[] = []; const voJson = path.join(ROOT, 'public/vo/vo.json');
if (fs.existsSync(voJson)) { const vo: Record<string, string> = JSON.parse(fs.readFileSync(voJson, 'utf8')); voIds = Object.keys(vo); for (const [id, b64] of Object.entries(vo)) fs.writeFileSync(path.join(pub, 'vo', id + '.mp3'), Buffer.from(b64, 'base64')); }
fs.writeFileSync(path.join(pub, 'index.html'), `${head}\n<div id="root"></div>\n<script>window.__VO_IDS__=${JSON.stringify(voIds)};window.__B64_MODELS__=true;</script>\n<script>${js.replace(/<\/script/g, '<\\/script')}</script>\n`);
console.log('bundle', (js.length / 1e6).toFixed(2), 'MB · index.html', (html.length / 1e6).toFixed(2), 'MB');
