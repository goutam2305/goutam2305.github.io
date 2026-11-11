import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';

const errors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const collected = [];
  errors.set(page, collected);
  page.on('pageerror', (error) => collected.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') collected.push(message.text()); });
  page.on('response', (response) => { if (response.status() >= 400) collected.push(`${response.status()} ${response.url()}`); });
  await page.addInitScript(() => localStorage.setItem('goutam-lab-theme', 'light'));
});
test.afterEach(async ({ page }) => expect(errors.get(page)).toEqual([]));

test('only E-Z Topology is listed; light/dark themes and the compact filter work', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.tool-card')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'E-Z Topology' })).toBeVisible();
  await expect(page.getByText('Segmentation', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Generate Mesh', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('menu')).toHaveCount(0);
  await page.screenshot({ path: 'artifacts/gallery-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Filter tools: All tools' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.screenshot({ path: 'artifacts/filter-open.png' });
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', { name: 'Available' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Filter tools: All tools' })).toBeFocused();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: 'artifacts/gallery-dark.png', fullPage: true });
});

test('all tool chapters have usable recordings and drawing really animates', async ({ page }) => {
  await page.goto('/#/tools/ez-topology');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('tab')).toHaveCount(10);
  await expect(page.getByRole('link', { name: 'Read documentation' })).toBeVisible();
  const paused = await page.locator('.demo-visual').screenshot();
  await page.getByRole('button', { name: 'Play Draw demo' }).click();
  await expect(page.locator('.demo-visual img')).toHaveAttribute('src', /draw\.gif$/);
  await page.waitForTimeout(1400);
  const playing = await page.locator('.demo-visual').screenshot();
  expect(createHash('sha256').update(paused).digest('hex')).not.toBe(createHash('sha256').update(playing).digest('hex'));
  await page.getByRole('button', { name: 'Pause Draw demo' }).click();
  await expect(page.locator('.demo-visual img')).toHaveAttribute('src', /draw\.webp$/);
  for (const name of ['Select', 'Strips', 'Strokes', 'Patches', 'Connect boundaries', 'Contours', 'Loops', 'Tweak', 'Relax']) {
    await page.getByRole('tab', { name, exact: true }).click();
    await expect(page.getByRole('button', { name: `Play ${name} demo` })).toBeVisible();
    await expect(page.getByRole('table', { name: `${name} settings` })).toBeVisible();
  }
  await page.getByRole('tab', { name: 'Patches', exact: true }).click();
  await page.screenshot({ path: 'artifacts/product-patches.png', fullPage: true });
});

test('documentation, chapter deep links and downloads work', async ({ page }) => {
  await page.goto('/#/docs/ez-topology?section=connect');
  await expect(page.getByRole('heading', { level: 1, name: /E-Z Topology documentation/ })).toBeAttached();
  await expect(page.locator('#doc-connect')).toBeFocused();
  await expect(page.locator('.doc-content .demo-player')).toHaveCount(10);
  const markdown = await page.request.get('/docs/E-Z-Topology-Guide.md');
  expect(markdown.ok()).toBeTruthy();
  expect(await markdown.text()).toContain('## Connect boundaries');
  const pdf = await page.request.get('/docs/E-Z-Topology-Guide.pdf');
  expect(pdf.ok()).toBeTruthy();
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  const [pdfDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'PDF', exact: true }).click()]);
  expect(pdfDownload.suggestedFilename()).toBe('E-Z-Topology-Guide.pdf');
  const [markdownDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Download guide' }).click()]);
  expect(markdownDownload.suggestedFilename()).toBe('E-Z-Topology-Guide.md');
  await page.getByRole('link', { name: 'Draw', exact: true }).click();
  await expect(page.locator('#doc-draw')).toBeFocused();
  await page.evaluate(() => { document.activeElement.blur(); window.scrollTo(0, 0); });
  await page.getByRole('link', { name: 'Draw', exact: true }).click();
  await expect(page.locator('#doc-draw')).toBeFocused();
  await page.screenshot({ path: 'artifacts/documentation-draw.png' });
});

for (const width of [390, 320]) {
  test(`mobile ${width}px has no horizontal overflow in gallery, product or docs`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const url of ['/', '/#/tools/ez-topology', '/#/docs/ez-topology']) {
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
      if (url.includes('/tools/')) {
        await page.getByRole('tab', { name: 'Connect boundaries' }).click();
        await expect(page.getByRole('button', { name: 'Play Connect boundaries demo' })).toBeVisible();
      }
    }
    await page.screenshot({ path: `artifacts/documentation-mobile-${width}.png` });
  });
}

test('reduced motion starts every documentation example paused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('/#/docs/ez-topology');
  for (const image of await page.locator('.demo-visual img').all()) await expect(image).toHaveAttribute('src', /\.webp$/);
});
