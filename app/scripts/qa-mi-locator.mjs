/**
 * Real-browser QA of the MI Locator inside the Cardiac tab (production bundle; run after `npm run build`).
 * Desktop: the 3D heart and the 12-lead ECG sit side by side. Tablet/phone: the heart sits directly above the ECG in
 * the Scene tab. On every viewport: the shared high-detail heart registers, an inferior STEMI evolves on the ECG and
 * is explained in the side pane, and the heart actually renders (pixels sampled from the saved screenshot).
 */
import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist/pub');
const output = path.resolve('qa-output');
await fs.mkdir(output, { recursive: true });
const server = spawn('python3', ['-m', 'http.server', '8881', '--bind', '127.0.0.1', '--directory', root], { stdio: 'ignore' });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const box = async (loc) => { const b = await loc.boundingBox(); if (!b) throw new Error('not laid out'); return b; };
async function pixels(file, rect) {
  const img = sharp(file).extract({ left: Math.round(rect.x), top: Math.round(rect.y), width: Math.max(1, Math.round(rect.width)), height: Math.max(1, Math.round(rect.height)) });
  const { data, info } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let red = 0, paper = 0, n = 0;
  for (let i = 0; i < data.length; i += info.channels * 3) { const r = data[i], g = data[i + 1], b = data[i + 2]; n++; if (r > 80 && r > g * 1.28 && r > b * 1.2) red++; if (r > 225 && g > 210 && b > 195) paper++; }
  return { red, paper, n };
}
let browser;
try {
  await sleep(1000);
  browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  for (const spec of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'tablet', width: 820, height: 1180 }, { name: 'phone', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport: { width: spec.width, height: spec.height }, deviceScaleFactor: 1 });
    const page = await context.newPage(); const fatal = [];
    page.on('pageerror', (e) => fatal.push(e.message));
    await page.addInitScript(() => { window.__NO_SW__ = true; });
    await page.goto('http://127.0.0.1:8881/?module=heart&view=mi', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const view = page.getByRole('main', { name: 'MI Locator' });
    await expect(view).toBeAttached({ timeout: 30000 });
    if (spec.name !== 'desktop') { const scene = page.getByRole('button', { name: 'Scene', exact: true }).first(); await expect(scene).toBeVisible(); await scene.click(); }
    await expect(page.getByRole('button', { name: 'MI Locator' })).toHaveAttribute('aria-pressed', 'true');
    const heart = page.locator('.mi-heart'); const ecg = page.locator('section[aria-label="12-lead ECG"]');
    await expect(heart.locator('canvas').first()).toBeVisible({ timeout: 60000 });
    await expect(ecg.locator('canvas')).toBeVisible();
    await page.waitForFunction(() => window.__mi && window.__mi.shared() !== null, null, { timeout: 60000 });
    const shared = await page.evaluate(() => window.__mi.shared());
    const stats = await page.evaluate(() => window.__mi.stats());
    console.log(spec.name, 'shared high-detail heart:', shared, stats.map((s) => `${s.id} p95 ${s.p95Mm.toFixed(1)} mm`).join(', '), 'transfer', await page.evaluate(() => window.__mi.transferMs()), 'ms');
    if (!shared) throw new Error(spec.name + ': MI Locator fell back to the light coronary heart');
    const h = await box(heart), e = await box(ecg);
    if (spec.name === 'desktop') {
      if (e.x < h.x + h.width - 2 || Math.abs(e.y - h.y) > 4) throw new Error('desktop: the ECG must sit directly to the right of the heart');
      if (h.width < 360 || e.width < 360 || h.height < 420) throw new Error(`desktop: panes too small (heart ${h.width}×${h.height}, ECG ${e.width})`);
    } else if (e.y < h.y + h.height - 2 || Math.abs(e.x - h.x) > 4) throw new Error(spec.name + ': the ECG must sit directly below the heart');
    // an inferior STEMI, fully evolved
    await page.evaluate(() => window.__mi.territory('inferior', 1));
    await expect(page.locator('.mi-ecg-stage')).toHaveText(/ST elevation|Evolving STEMI/, { timeout: 20000 });
    await expect(page.locator('aside.mi-side .h2').first()).toHaveText('Inferior');
    await page.waitForTimeout(2500);
    const file = path.join(output, `mi-locator-${spec.name}.png`);
    await page.screenshot({ path: file, fullPage: false, timeout: 120000 });
    const hp = await pixels(file, await box(heart)); const vis = await box(ecg); const ep = await pixels(file, { x: vis.x, y: vis.y, width: vis.width, height: Math.min(vis.height, spec.height - vis.y) });
    console.log(spec.name, 'heart red samples', hp.red, '· ECG paper samples', ep.paper, '/', ep.n);
    if (hp.red < 300) throw new Error(spec.name + ': the 3D heart is blank in the screenshot');
    if (ep.paper < ep.n * 0.3) throw new Error(spec.name + ': the ECG paper is not visible');
    if (spec.name === 'desktop') {
      // STEMI equivalents: left main / aVR opens the short-axis slice; the ECG stage names the pattern
      await page.evaluate(() => window.__mi.territory('leftMain', 1));
      await expect(page.locator('.mi-ecg-stage')).toHaveText(/Left main/, { timeout: 20000 });
      await expect(page.locator('aside.mi-side .h2').first()).toHaveText(/Left main/);
      if (!(await page.evaluate(() => window.__mi.store.getState().slice))) throw new Error('left main pattern should open the short-axis slice');
      await page.waitForTimeout(6000);
      await page.screenshot({ path: path.join(output, 'mi-locator-leftmain-slice-desktop.png'), fullPage: false, timeout: 120000 });
      await page.evaluate(() => { window.__mi.store.getState().set({ slice: false }); window.__mi.territory('wellensB', 1); });
      await expect(page.locator('.mi-ecg-stage')).toHaveText(/Wellens B/, { timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(output, 'mi-locator-wellens-desktop.png'), fullPage: false, timeout: 120000 });
      await page.evaluate(() => { window.__mi.store.getState().set({ conduction: true }); });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(output, 'mi-locator-conduction-desktop.png'), fullPage: false, timeout: 120000 });
      await page.getByRole('button', { name: 'Heart & flow' }).click({ noWaitAfter: true, timeout: 60000 });
      await expect(page.locator('section[aria-label="Cardiac live ECG strip"]')).toBeAttached({ timeout: 90000 });
    }
    if (fatal.length) throw new Error(spec.name + ' uncaught errors: ' + fatal.join('; '));
    await context.close();
  }
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
