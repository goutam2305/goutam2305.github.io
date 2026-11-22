import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { projects, parseRoute, getDownloadUrl } from '../src/projects.js';

test('the three approved free releases resolve to intact distribution packages', () => {
  const free = projects.filter((p) => p.release);
  assert.deepEqual(free.map((p) => p.id), ['ez-topology', 'ez-stitchnseam', 'ez-reference']);
  for (const project of free) {
    assert.ok(getDownloadUrl(project).endsWith(project.release.fileName));
    const data = readFileSync(`public/downloads/${project.release.fileName}`);
    assert.equal(data.length, project.release.bytes);
    assert.equal(createHash('sha256').update(data).digest('hex'), project.release.sha256);
    assert.deepEqual(project.platforms, ['3ds Max']);
    assert.ok(project.documentationUrl.endsWith(project.id));
    assert.ok(project.features.length >= 3);
  }
});

test('website assets allow only the approved MZPs and exclude loose private runtimes', () => {
  const names = readdirSync('public', { recursive: true });
  assert.deepEqual(names.filter((name) => /\.(?:mse|mcr|dll|py|pyc|cs|ms)$/i.test(name)), []);
  assert.deepEqual(names.filter(name => /\.mzp$/i.test(name)).map(name => name.replaceAll('\\', '/')).sort(), projects.filter(project => project.release).map(project => `downloads/${project.release.fileName}`).sort());
});

test('new tool documentation routes resolve to their own project', () => {
  for (const id of ['ez-stitchnseam', 'ez-reference', 'easyviewer']) {
    const route = parseRoute(`#/docs/${id}?section=overview`);
    assert.equal(route.page, 'product-documentation');
    assert.equal(route.project.id, id);
    assert.equal(route.section, 'overview');
  }
});

test('each new guide contains settings and an attached document without topology instructions', async () => {
  assert.ok(existsSync('src/libraryGuides.js'), 'Independent library guides are missing');
  const { libraryGuides } = await import('../src/libraryGuides.js');
  for (const id of ['ez-stitchnseam', 'ez-reference', 'easyviewer']) {
    const guide = libraryGuides[id];
    assert.ok(guide.sections.length >= 3);
    assert.ok(guide.sections.every((s) => s.steps.length >= 2 && s.settings.length >= 2));
    assert.ok(existsSync(`public/${guide.document}`));
    assert.doesNotMatch(readFileSync(`public/${guide.document}`, 'utf8'), /Ashley|RetopoFlow|local_content_browser/);
    assert.doesNotMatch(readFileSync(`public/${guide.document}`, 'utf8'), /unavailable until release approval|installer will appear after release approval/i);
  }
  assert.ok(libraryGuides['ez-stitchnseam'].comingSoon.includes('Seam generation'));
  assert.ok(libraryGuides['ez-stitchnseam'].comingSoon.includes('Hole generation'));
});

test('EasyViewer links to its Fab listing and has no local download', async () => {
  const { getStoreUrl } = await import('../src/projects.js');
  const viewer = projects.find((p) => p.id === 'easyviewer');
  assert.equal(viewer.downloadUrl, null);
  assert.ok(getStoreUrl(viewer).startsWith('https://www.fab.com/'));
  assert.equal(getStoreUrl({ storeUrl: 'https://evil.example/fab' }), null);
});

test('EasyViewer gallery images exist and each has a title and caption', () => {
  const viewer = projects.find((p) => p.id === 'easyviewer');
  assert.ok(viewer.gallery.length >= 3 && viewer.gallery.length <= 5);
  for (const shot of viewer.gallery) {
    assert.ok(existsSync(`public/${shot.src.replace(/^.*?assets\//, 'assets/')}`), shot.src);
    assert.ok(shot.title && shot.text && shot.alt);
  }
});
