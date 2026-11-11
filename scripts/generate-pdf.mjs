import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
  await page.addInitScript(() => localStorage.setItem('goutam-lab-theme', 'light'));
  await page.goto('http://127.0.0.1:4173/#/docs/ez-topology', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(async (image) => {
      image.loading = 'eager';
      await image.decode();
    }));
  });
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  await mkdir('public/docs', { recursive: true });
  const pdf = await page.pdf({
    path: 'public/docs/E-Z-Topology-Guide.pdf',
    format: 'A4', printBackground: true,
    margin: { top: '17mm', bottom: '20mm', left: '16mm', right: '16mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="font:9px monospace;width:100%;text-align:center;color:#666">GOUTAM Lab · E-Z Topology — <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('Invalid PDF output');
  console.log(JSON.stringify({ file: 'public/docs/E-Z-Topology-Guide.pdf', bytes: pdf.length }));
} finally { await browser.close(); }
