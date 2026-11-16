import { test, expect } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';

test('protected library releases have independent workflows and direct installer downloads', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.tool-card')).toHaveCount(3);
  await expect(page.getByRole('heading', { level: 2, name: 'E-Z Topology' })).toBeVisible();
  for (const [id, name, lastTab] of [
    ['ez-stitchnseam', 'E-Z StitchNSeam', 'Materials & delivery'],
    ['ez-reference', 'E-Z Reference', 'Keep images with the scene'],
  ]) {
    await page.goto(`/#/tools/${id}`);
    await expect(page).toHaveTitle(`${name} — GOUTAM Lab`);
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download .mzp', exact: true })).toBeVisible();
    await expect(page.getByRole('tab')).toHaveCount(4);
    await expect(page.getByRole('tablist', { name: 'E-Z Topology tools' })).toHaveCount(0);
    await page.getByRole('tab', { name: lastTab, exact: true }).click();
    await expect(page.getByRole('tabpanel')).toContainText(lastTab);
    await page.getByRole('link', { name: 'Read documentation', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/#/docs/${id}$`));
    await expect(page.getByRole('heading', { level: 1 })).toContainText(name);
    await expect(page.getByRole('link', { name: 'Download guide', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Draw', exact: true })).toHaveCount(0);
  }
  await expect(page.locator('.page-view')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: path.join(os.tmpdir(), 'goutam-library-reference-desktop.png'), fullPage: false });
  expect(errors).toEqual([]);
});

test('reference documentation deep links and mobile layout remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/docs/ez-reference?section=calibration');
  await expect(page.getByRole('heading', { name: 'View, size & opacity', exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'View, size & opacity', exact: true })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
  await page.screenshot({ path: path.join(os.tmpdir(), 'goutam-library-reference-mobile.png'), fullPage: false });
  await page.goto('/#/tools/ez-stitchnseam');
  await page.getByRole('tab', { name: 'Patterns & thread', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toContainText('0.01 mm');
  await expect(page.getByRole('tabpanel')).toContainText('not available in the stitch beta');
  await expect(page.getByRole('link', { name: 'Download free', exact: true })).toHaveCount(0);
});
