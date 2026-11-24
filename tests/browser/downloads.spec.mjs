import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { projects } from '../../src/projects.js';

test('each free tool on the site downloads its exact MZP after terms consent without email or a repository page', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const { id } of projects.filter((project) => project.tier === 'free')) {
    await page.goto(`/#/tools/${id}`);
    await page.evaluate(() => localStorage.removeItem('goutam-lab-terms'));
    await page.getByRole('link', { name: 'Download .mzp', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/personal and commercial/i).first()).toBeVisible();
    await expect(dialog.getByRole('textbox')).toHaveCount(0);
    const accept = dialog.getByRole('button', { name: 'Agree & download' });
    await expect(accept).toBeDisabled();
    await dialog.getByRole('checkbox').check();
    const received = page.waitForEvent('download');
    await accept.click();
    const download = await received;
    expect(download.suggestedFilename()).toMatch(/^E-Z-[A-Za-z]+-[\d.]+-beta\.1\.mzp$/);
    const local = await download.path();
    const bytes = readFileSync(local);
    const expected = readFileSync(`public/downloads/${download.suggestedFilename()}`);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(createHash('sha256').update(expected).digest('hex'));
    expect(bytes.subarray(0, 2).toString()).toBe('PK');
    await expect(dialog).toHaveCount(0);
    expect(page.url()).toContain(`/#/tools/${id}`);
    await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test('download terms can be cancelled and read on mobile without losing the project', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/tools/ez-topology');
  const trigger = page.getByRole('link', { name: 'Download .mzp', exact: true });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.getByRole('link', { name: 'Software terms', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Software terms', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
