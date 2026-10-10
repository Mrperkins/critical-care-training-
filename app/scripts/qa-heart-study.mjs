/**
 * Real-browser smoke QA of PR #35. Screenshots are from the production bundle,
 * not a concept render. Run after npm run build and playwright install chromium.
 */
import { chromium, expect } from '@playwright/test';
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
    await expect(page.locator('.scene-pane canvas').first()).toBeVisible({ timeout: 30000 });
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
    if (fatal.length) throw new Error(spec.name + ' uncaught errors: ' + fatal.join('; '));
    await context.close();
  }
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
