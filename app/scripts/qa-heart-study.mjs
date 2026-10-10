/**
 * Real-browser smoke QA of PR #35. Screenshots are from the production bundle,
 * not a concept render. Run after npm run build and playwright install chromium.
 */
import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist/pub');
const output = path.resolve('qa-output');
await fs.mkdir(output, { recursive: true });
const server = spawn('python3', ['-m', 'http.server', '8879', '--bind', '127.0.0.1', '--directory', root], { stdio: 'ignore' });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let browser;
try {
  await sleep(1000);
  browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'] });
  for (const spec of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 820, height: 1180 },
    { name: 'phone', width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport: { width: spec.width, height: spec.height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const fatal = [];
    page.on('pageerror', (e) => fatal.push(e.message));
    await page.goto('http://127.0.0.1:8879/?module=heart', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const study = page.getByRole('region', { name: 'Synchronized cardiac electrical study' });
    await expect(study).toBeVisible({ timeout: 30000 });
    const heartCanvas = page.locator('.scene-pane canvas').first();
    const strip = page.locator('section[aria-label="Cardiac live ECG strip"]');
    await expect(strip).toBeAttached();
    // On mobile the Lessons tab intentionally hides the Scene DOM from the accessibility tree.
    // Verify DOM presence now; verify actual visibility after switching to Scene below.
    await expect(strip.locator('svg.heart-strip-wave')).toBeAttached();
    await expect(strip.locator('.heart-strip-info strong')).toContainText('LIVE ECG');
    if (spec.name === 'desktop') {
      await expect(heartCanvas).toBeAttached({ timeout: 30000 });
      await expect(heartCanvas).toBeVisible({ timeout: 30000 });
      await expect(strip).toBeVisible();
      const heartRect = await page.locator('.heart-scene-pane > .scene-wrap').boundingBox();
      const stripRect = await strip.boundingBox();
      if (!heartRect || !stripRect || stripRect.x < heartRect.x + heartRect.width - 3 || stripRect.y > heartRect.y + heartRect.height) {
        throw new Error('ECG must be visible directly to the RIGHT of the 3D heart on desktop');
      }
    } else {
      // Mobile intentionally unmounts the WebGL canvas on Lessons for GPU/memory safety.
      await expect(heartCanvas).toHaveCount(0);
    }
    await page.screenshot({ path: path.join(output, 'heart-before-' + spec.name + '.png'), fullPage: true, animations: 'disabled' });
    await study.locator('input[type="checkbox"]').check();
    await expect(study.getByLabel('Scrub cardiac cycle')).toBeVisible();
    await study.getByLabel('Playback speed').selectOption('0.25');
    const scrub = study.getByLabel('Scrub cardiac cycle');
    await scrub.focus();
    await scrub.press('ArrowRight');
    await expect(study.getByRole('button', { name: 'Play' })).toBeVisible();
    await study.getByLabel('ECG lead').selectOption('V1');
    await expect(study.getByRole('img', { name: /lead V1 electrocardiogram/i })).toBeVisible();
    await study.getByText('View all 12 synchronized leads').click();
    await expect(study.getByRole('button', { name: 'Select lead V6' })).toBeVisible();
    await study.getByRole('button', { name: 'Select lead V6' }).click();
    await expect(study.getByRole('img', { name: /lead V6 electrocardiogram/i })).toBeVisible();
    await study.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, 'heart-study-' + spec.name + '.png'), fullPage: true, animations: 'disabled' });
    if (spec.name !== 'desktop') {
      const sceneTab = page.getByRole('button', {name: 'Scene', exact: true}).first();
      await expect(sceneTab).toBeVisible();
      await sceneTab.click();
    }
    await expect(heartCanvas).toBeVisible({ timeout: 30000 });
    await expect(strip).toBeVisible();
    if (spec.name !== 'desktop') {
      const heartRect = await page.locator('.heart-scene-pane > .scene-wrap').boundingBox();
      const stripRect = await strip.boundingBox();
      if (!heartRect || !stripRect || stripRect.y < heartRect.y + heartRect.height - 3) {
        throw new Error('On touch screens ECG must be visible directly BELOW the heart');
      }
    }
    // Capture one stable frame after the mobile Scene tab has remounted its canvas.
    // Inspect actual saved pixels rather than probing a continuously animated WebGL element.
    await page.waitForTimeout(2200);
    const sceneScreenshot = path.join(output, 'heart-3d-plus-ecg-' + spec.name + '.png');
    await page.screenshot({ path: sceneScreenshot, fullPage: false, animations: 'allow', timeout: 60000 });
    const { data, info } = await sharp(sceneScreenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let sampledRed = 0;
    for (let i = 0; i < data.length; i += info.channels * 4) {
      const red = data[i], green = data[i + 1], blue = data[i + 2];
      if (red > 90 && red > green * 1.28 && red > blue * 1.2) sampledRed++;
    }
    console.log(spec.name, 'rendered heart-coloured pixel samples:', sampledRed);
    if (sampledRed < 300) throw new Error(spec.name + ': 3D anatomy is blank in actual screenshot (only ' + sampledRed + ' red pixels)');
    if (fatal.length) throw new Error(spec.name + ' uncaught errors: ' + fatal.join('; '));
    await context.close();
  }
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
