// Captures one wide hero still per library module from the running app (serve dist/pub on :4173 first):
//   npx http-server dist/pub -p 4173 -s &  then  node scripts/qa/capture-heroes.mjs /tmp/heroes [id,id]
// then  python3 scripts/qa/heroes-to-jpg.py /tmp/heroes public/heroes
// Same scene recipes as capture-thumbs.mjs; side panes are hidden so the scene fills a wide 1920×1080 stage.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const out = process.argv[2]; const only = process.argv[3] ? process.argv[3].split(',') : null;
const M = (m, extra = '') => `__ui.getState().set({module:'${m}',mode:'explore',atlasDisease:null});${extra}`;
const click = (t) => `[...document.querySelectorAll('.workspace button')].find(b=>b.textContent.trim().startsWith(${JSON.stringify(t)}))?.click();`;
const vent = (sc, view) => M('vent') + `||__CCVent.load('${sc}');__ui.getState().set({ventView:'${view}',ventCut:'none'})`;
const R = {
  'vent-foundations': vent('normal', 'front'), 'vent-pressure': vent('ett', 'airway'), 'vent-ards': vent('ards', 'side'),
  'vent-waveforms': vent('asthma', 'front'), 'vent-ptx': vent('ptx', 'front'), 'vent-desat': vent('mainstem', 'airway'),
  'gas-basics': M('abg') + '||' + click('Alveolus'), 'gas-dka': M('abg') + '||' + click('Kidney'), 'gas-lytes': M('labs') + '||' + click('Body'), 'gas-bleeding': M('labs') + '||' + click('Cells'),
  'lines-artline': M('lines') + '||' + click('Art line'), 'lines-cvp': M('lines') + '||' + click('CVC'), 'lines-shock': M('lines') + '||' + click('Heart'), 'lines-bleed': M('lines') + '||' + click('Vessels'), 'lines-devices': M('lines') + '||' + click('Bedside'),
  'cardiac-mi': M('heart') + `||(await __qa.heart()).getState().set({section:'coronary'})`,
  'cardiac-congenital': M('heart') + `||(await __qa.heart()).getState().set({section:'structure',cut:'slice',target:'heart.four_chamber'})`,
  'neuro-stroke': M('neuro') + `||(await __qa.neuro()).getState().set({cut:false,glass:true,target:'brain.whole'})`,
  'neuro-icp': M('neuro') + `||(await __qa.neuro()).getState().set({cut:true,slice:0.05})`,
  'abd-fast': M('abdomen') + '||' + click('3D anatomy'), 'abd-aorta': M('abdomen') + '||' + click('3D anatomy') + `(await __qa.abd()).getState().set({target:'abdomen.aorta'})`, 'abd-gut': M('abdomen') + '||' + click('3D anatomy') + `(await __qa.abd()).getState().set({target:'abdomen.bowel'})`,
  'peds-sick-child': M('pediatrics') + '||' + click('Affected anatomy'),
  'peds-newborn': M('heart') + `||(await __qa.heart()).getState().set({section:'structure',cut:'closed',target:'heart.whole_heart'})`,
  'ob-pregnancy': M('womens') + `||__ui.getState().set({atlasDisease:'fetal-placental-circulation'})||` + click('Affected anatomy'),
  'pharm-moa': M('moa'),
};
const HIDE = `.side-pane,.step-rail,.lib-player{display:none!important}.stage{grid-template-columns:minmax(0,1fr)!important}.scene-wrap button,.scene-pane button,.scene-tools2,.scene-primary-tools,.scene-tools,.alv-focus,.legend,.lchip,.view-btns,.st-hint,.alv-hud,.cardiac-views,.img-note,.credit,.label-info,.mi-hint{visibility:hidden!important}`;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [id, js] of Object.entries(R)) {
  if (only && !only.includes(id)) continue;
  if (fs.existsSync(`${out}/${id}.png`)) continue; // resume: keep earlier captures
  try {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.addInitScript(() => { window.__NO_SW__ = true; });
  await p.goto('http://localhost:4173/'); await p.waitForSelector('#library-main');
  for (const part of js.split('||')) { await p.evaluate(`(async()=>{${part}})()`); await p.waitForTimeout(8000); }
  await p.addStyleTag({ content: HIDE }); await p.evaluate(() => window.dispatchEvent(new Event('resize'))); await p.waitForTimeout(2500);
  // For waveforms, capture the real pressure/flow/volume canvas rather than the lung model.
  const el = (await p.$('.atlas-visual-3d')) || (await p.$('.workspace .scene-wrap')) || (await p.$('.workspace canvas')) || (await p.$('.workspace .scene-pane'));
  if (!el) { console.log('no scene', id); await p.close(); continue; }
  const bb = await el.boundingBox(); await p.screenshot({ timeout: 120000, path: `${out}/${id}.png`, clip: { x: bb.x, y: bb.y, width: Math.min(bb.width, 1920 - bb.x), height: Math.min(bb.height, 1080 - bb.y) } }); await p.close(); console.log('ok', id);
  } catch (err) { console.log('failed', id, String(err).split('\n')[0]); }
}
await b.close();
