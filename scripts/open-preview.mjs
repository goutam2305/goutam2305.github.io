import { chromium } from '@playwright/test';

// A live preview must follow the actual browser window. Fixed viewports belong
// in screenshot tests; emulating one here leaves unused space after maximizing.
const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--start-maximized'] });
process.on('SIGINT', () => { void browser.close(); });
try {
  const page = await browser.newPage({ viewport: null });
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(() => document.fonts.ready);
  console.log(JSON.stringify({ preview: page.url(), viewport: page.viewportSize(), window: await page.evaluate(() => ({ width: innerWidth, height: innerHeight, document: document.documentElement.clientWidth })) }));
  await new Promise(resolve => browser.on('disconnected', resolve));
} catch (error) {
  await browser.close();
  throw error;
}
