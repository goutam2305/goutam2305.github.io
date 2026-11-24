import { test, expect } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';
import { catalog, projects } from '../../src/projects.js';
import { libraryGuides } from '../../src/libraryGuides.js';

const guided = (items) => items.filter((project) => libraryGuides[project.id]);

test('each product with its own guide has an independent workflow, documentation and the right way to get it', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.tool-card')).toHaveCount(projects.length);
  for (const { id, name, tier } of guided(projects)) {
    const { sections } = libraryGuides[id];
    const lastTab = sections.at(-1).name;
    await page.goto(`/#/tools/${id}`);
    await expect(page).toHaveTitle(`${name} — GOUTAM Lab`);
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    const download = page.getByRole('link', { name: 'Download .mzp', exact: true });
    const store = page.locator('.store-button');
    await expect(tier === 'free' ? download : store).toBeVisible();
    await expect(tier === 'free' ? store : download).toHaveCount(0);
    await expect(page.getByRole('tab')).toHaveCount(sections.length);
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
  await page.screenshot({ path: path.join(os.tmpdir(), 'goutam-library-desktop.png'), fullPage: false });
  expect(errors).toEqual([]);
});

test('hidden tools have no card, and their old tool and guide links show the not-found page', async ({ page }) => {
  await page.goto('/');
  for (const { id, name } of catalog.filter((project) => project.hidden)) {
    await page.goto('/');
    await expect(page.getByText(name)).toHaveCount(0);
    for (const url of [`/#/tools/${id}`, `/#/docs/${id}`, `/#/docs/${id}?section=overview`]) {
      await page.goto(url);
      await expect(page.getByRole('heading', { level: 1, name: 'This page isn’t in the lab.' })).toBeVisible();
    }
  }
});

test('guide deep links and mobile layout remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const { id } of guided(projects)) {
    const section = libraryGuides[id].sections[1];
    await page.goto(`/#/docs/${id}?section=${section.id}`);
    await expect(page.getByRole('heading', { name: section.name, exact: true })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
    await page.goto(`/#/tools/${id}`);
    await page.getByRole('tab', { name: section.name, exact: true }).click();
    await expect(page.getByRole('tabpanel')).toContainText(section.summary);
    if (libraryGuides[id].comingSoon.length) await expect(page.getByRole('tabpanel')).toContainText(`not available in ${libraryGuides[id].betaName ?? 'this beta'}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
  }
});
