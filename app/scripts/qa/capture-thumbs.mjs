// Captures one still per library module from the running app (serve dist/pub on :4173 first):
//   npx http-server dist/pub -p 4173 -s &  then  node scripts/qa/capture-thumbs.mjs /tmp/thumbs [id,id]
// then  python3 scripts/qa/thumbs-to-jpg.py /tmp/thumbs public/thumbs
import { chromium } from '@playwright/test';
const out = process.argv[2]; const only = process.argv[3] ? process.argv[3].split(',') : null;
const M = (m, extra = '') => `__ui.getState().set({module:'${m}',mode:'explore',atlasDisease:null});${extra}`;
const click = (t) => `[...document.querySelectorAll('.workspace button')].find(b=>b.textContent.trim().startsWith(${JSON.stringify(t)}))?.click();`;
const vent = (sc, view) => M('vent') + `||__CCVent.load('${sc}');__ui.getState().set({ventView:'${view}',ventCut:'none'})`;
const R = {
  'vent-foundations': vent('normal', 'front'), 'vent-pressure': vent('ett', 'airway'), 'vent-ards': vent('ards', 'side'),
  'vent-waveforms': vent('asthma', 'front') + `;__ui.getState().set({ventCut:'mid'})`, 'vent-ptx': vent('ptx', 'front'), 'vent-desat': vent('mainstem', 'airway'),
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
const HIDE = `.scene-wrap button,.scene-pane button,.scene-tools2,.scene-primary-tools,.scene-tools,.alv-focus,.legend,.lchip,.view-btns,.st-hint,.alv-hud,.wave-wrap,.cardiac-views,.img-note,.credit,.label-info,.mi-hint{visibility:hidden!important}`;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [id, js] of Object.entries(R)) {
  if (only && !only.includes(id)) continue;
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => { window.__NO_SW__ = true; });
  await p.goto('http://localhost:4173/'); await p.waitForSelector('#library-main');
  for (const part of js.split('||')) { await p.evaluate(`(async()=>{${part}})()`); await p.waitForTimeout(8000); }
  await p.addStyleTag({ content: HIDE }); await p.waitForTimeout(600);
  const el = (await p.$('.atlas-visual-3d')) || (await p.$('.workspace .scene-wrap')) || (await p.$('.workspace canvas')) || (await p.$('.workspace .scene-pane'));
  if (!el) { console.log('no scene', id); await p.close(); continue; }
  const bb = await el.boundingBox(); await p.screenshot({ path: `${out}/${id}.png`, clip: { x: bb.x, y: bb.y, width: Math.min(bb.width, 1440 - bb.x), height: Math.min(bb.height, 900 - bb.y) } }); await p.close(); console.log('ok', id);
}
await b.close();
