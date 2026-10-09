/** Bundles the app. dist/index.html is fully self-contained (bundle + anatomy GLBs + mappings + narration inlined). */
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { MENTAL_REPS } from '../src/audio/catalog';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(ROOT, 'dist'); fs.mkdirSync(out, { recursive: true });
const res = await build({ entryPoints: [path.join(ROOT, 'src/main.tsx')], bundle: true, minify: true, format: 'iife', target: ['es2020'], write: false, outdir: out, loader: { '.css': 'css' }, define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', legalComments: 'none', logLevel: 'warning' });
const js = res.outputFiles.find((f) => f.path.endsWith('.js'))!.text; const css = res.outputFiles.find((f) => f.path.endsWith('.css'))?.text ?? '';
fs.writeFileSync(path.join(out, 'bundle.js'), js); fs.writeFileSync(path.join(out, 'bundle.css'), css);
const inline: string[] = [];
const add = (glob: string, file: string, json = false) => { const p = path.join(ROOT, file); if (!fs.existsSync(p)) return; inline.push(`window.${glob}=${json ? fs.readFileSync(p, 'utf8') : JSON.stringify(fs.readFileSync(p).toString('base64'))};`); };
add('__RESP_GLB__', 'public/models/resp.glb'); add('__RESP_MAP__', 'public/models/resp.mapping.json', true);
add('__AIRWAY_GLB__', 'public/models/bedside-airway.glb');
add('__VENTILATOR_GLB__', 'public/models/medical-ventilator.glb');
add('__BODY_GLB__', 'public/models/body.glb'); add('__BODY_MAP__', 'public/models/body.mapping.json', true);
add('__BODYF_GLB__', 'public/models/body-f.glb'); add('__BODYF_MAP__', 'public/models/body-f.mapping.json', true);
add('__MICRO_GLB__', 'public/models/micro.glb'); add('__MICRO_MAP__', 'public/models/micro.mapping.json', true);
add('__LINES_GLB__', 'public/models/lines.glb'); add('__LINES_MAP__', 'public/models/lines.mapping.json', true);
add('__VO__', 'public/vo/vo.json', true);
const head = `<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<title>Critical Care Physiology</title>\n<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#05090d"><link rel="apple-touch-icon" href="icon-192.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400;500;600&family=Atkinson+Hyperlegible+Next:wght@400;500;600;700&display=swap" rel="stylesheet">\n<style>${css}</style>`;
const html = `${head}\n<div id="root"></div>\n<script>${inline.join('\n')}</script>\n<script>${js.replace(/<\/script/g, '<\\/script')}</script>\n`;
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, 'dev.html'), `${head}<div id="root"></div><script src="bundle.js"></script>`);
// publishable multi-file version: small page + separate model / narration files
const pub = path.join(out, 'pub'); fs.rmSync(pub, { recursive: true, force: true }); fs.mkdirSync(path.join(pub, 'models'), { recursive: true }); fs.mkdirSync(path.join(pub, 'vo'), { recursive: true });
for (const f of ['medical-ventilator.glb', 'medical-ventilator.provenance.json', 'bedside-airway.glb', 'bedside-airway.provenance.json', 'resp.glb', 'resp.mapping.json', 'micro.glb', 'micro.mapping.json', 'body.glb', 'body.mapping.json', 'body-f.glb', 'body-f.mapping.json', 'lines.glb', 'lines.mapping.json']) { const p = path.join(ROOT, 'public/models', f); if (fs.existsSync(p)) { if (f.endsWith('.glb')) fs.writeFileSync(path.join(pub, 'models', f + '.txt'), fs.readFileSync(p).toString('base64')); else fs.copyFileSync(p, path.join(pub, 'models', f)); } }
let voIds: string[] = []; const voJson = path.join(ROOT, 'public/vo/vo.json');
if (fs.existsSync(voJson)) { const vo: Record<string, string> = JSON.parse(fs.readFileSync(voJson, 'utf8')); voIds = Object.keys(vo); for (const [id, b64] of Object.entries(vo)) fs.writeFileSync(path.join(pub, 'vo', id + '.mp3'), Buffer.from(b64, 'base64')); }
fs.writeFileSync(path.join(pub, 'index.html'), `${head}\n<div id="root"></div>\n<script>window.__VO_IDS__=${JSON.stringify(voIds)};window.__B64_MODELS__=true;</script>\n<script>${js.replace(/<\/script/g, '<\\/script')}</script>\n`);

// Standalone Critical Care Audio / Mental Reps learner surface.
// It intentionally does not load the heavy Three.js anatomy bundle; it links back to the physiology app.
const audioRes = await build({
  entryPoints: [path.join(ROOT, 'src/audio/main.tsx')], bundle: true, minify: true, format: 'iife',
  target: ['es2020'], write: false, outdir: out, loader: { '.css': 'css' },
  define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', legalComments: 'none', logLevel: 'warning',
});
const audioJs = audioRes.outputFiles.find((f) => f.path.endsWith('.js'))!.text;
const audioCss = audioRes.outputFiles.find((f) => f.path.endsWith('.css'))?.text ?? '';
const audioDir = path.join(pub, 'audio'); fs.mkdirSync(audioDir, { recursive: true });
const audioVoice = path.join(ROOT, 'public/audio/voice');
const expectedRepHash = new Map<string, string>(MENTAL_REPS.flatMap((rep) => rep.beats.map((beat) => [
  `rep.${rep.id}.${beat.id}`,
  createHash('sha256').update(beat.narration.replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 16),
] as const)));
let audioVoiceAssets: Record<string, { file: string; reviewed: boolean; transcriptHash?: string }> = {};
if (fs.existsSync(audioVoice)) {
  fs.cpSync(audioVoice, path.join(audioDir, 'voice'), { recursive: true, force: true });
  const voiceManifest = path.join(audioVoice, 'manifest.json');
  if (fs.existsSync(voiceManifest)) {
    const parsed = JSON.parse(fs.readFileSync(voiceManifest, 'utf8')) as { assets?: { id: string; file: string; transcriptHash?: string; reviewed?: boolean }[] };
    audioVoiceAssets = Object.fromEntries((parsed.assets ?? []).filter((a) => {
      if (!a.id.startsWith('rep.')) return true;
      const expected = expectedRepHash.get(a.id);
      return !!expected && a.transcriptHash === expected;
    }).map((a) => [a.id, { file: a.file, reviewed: a.reviewed === true, transcriptHash: a.transcriptHash }]));
  }
}
fs.copyFileSync(path.join(ROOT, 'site', 'audio-manifest.webmanifest'), path.join(audioDir, 'manifest.webmanifest'));
const audioHead = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Critical Care Audio</title>
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#070a0d">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400;500;600&family=Atkinson+Hyperlegible+Next:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${audioCss}</style>`;
fs.writeFileSync(path.join(audioDir, 'index.html'), `${audioHead}<div id="root"></div><script>window.__CC_AUDIO_ASSETS__=${JSON.stringify(audioVoiceAssets)};</script><script>${audioJs.replace(/<\/script/g, '<\\/script')}</script>\n`);

// offline support: service worker (versioned by the bundle hash), web manifest, icons
const ver = (await import('node:crypto')).createHash('sha256').update(js).update(css).digest('hex').slice(0, 12);
fs.writeFileSync(path.join(pub, 'sw.js'), fs.readFileSync(path.join(ROOT, 'site/sw.js'), 'utf8').replaceAll('__VERSION__', ver));
for (const f of ['manifest.webmanifest', 'icon-192.png', 'icon-512.png']) fs.copyFileSync(path.join(ROOT, 'site', f), path.join(pub, f));
console.log('bundle', (js.length / 1e6).toFixed(2), 'MB · index.html', (html.length / 1e6).toFixed(2), 'MB');
