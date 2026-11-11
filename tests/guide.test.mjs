import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { toolGuide, sharedSettings, shortcuts } from '../src/guide.js';
import manifest from '../src/demoManifest.json' with { type: 'json' };

test('guide covers all nine toolbar tools plus connecting boundaries', () => {
  assert.deepEqual(toolGuide.map((tool) => tool.id), ['draw', 'select', 'strips', 'strokes', 'patches', 'connect', 'contours', 'loops', 'tweak', 'relax']);
  for (const tool of toolGuide) {
    assert.ok(tool.steps.length >= 4, tool.id);
    assert.ok(tool.settings.length >= 2, tool.id);
    assert.ok(tool.notes.length >= 1, tool.id);
  }
  assert.equal(sharedSettings.length, 14);
  assert.equal(shortcuts.length, 27);
});

test('every chapter has a real GIF and poster with accurate dimensions', async () => {
  for (const tool of toolGuide) {
    const demo = manifest[tool.id];
    assert.ok(demo, tool.id);
    const bytes = await readFile(`public/${demo.src}`);
    assert.match(bytes.subarray(0, 6).toString(), /^GIF8[79]a$/);
    assert.equal(bytes.readUInt16LE(6), demo.width);
    assert.equal(bytes.readUInt16LE(8), demo.height);
    assert.ok(bytes.length < 3_000_000, `${tool.id} GIF should remain lightweight`);
    assert.ok((await stat(`public/${demo.poster}`)).size > 1000);
  }
});

test('the attached guide includes each tool, settings and shortcut reference', async () => {
  const guide = (await readFile('public/docs/E-Z-Topology-Guide.md', 'utf8')).replaceAll('\r\n', '\n');
  for (const tool of toolGuide) assert.ok(guide.includes(`## ${tool.name}\n`), tool.id);
  assert.ok(guide.includes('## Shared settings'));
  assert.ok(guide.includes('## Shortcut reference'));
  assert.ok(guide.includes('Maya support is planned'));
  const pdf = await readFile('public/docs/E-Z-Topology-Guide.pdf');
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.ok(pdf.length > 10000);
});
