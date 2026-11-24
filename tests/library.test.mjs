import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { catalog, projects, parseRoute, getDownloadUrl } from '../src/projects.js';

test('the three approved free releases resolve to intact distribution packages', () => {
  const free = catalog.filter((p) => p.release);
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
  assert.deepEqual(names.filter(name => /\.mzp$/i.test(name)).map(name => name.replaceAll('\\', '/')).sort(), catalog.filter(project => project.release).map(project => `downloads/${project.release.fileName}`).sort());
});

test('only EasyViewer and E-Z Topology are on the site; hidden tools have no page or guide route', () => {
  assert.deepEqual(projects.map((p) => p.id), ['easyviewer', 'ez-topology']);
  assert.deepEqual(catalog.filter((p) => p.hidden).map((p) => p.id), ['ez-stitchnseam', 'ez-reference']);
  for (const { id } of catalog.filter((p) => p.hidden)) {
    for (const hash of [`#/tools/${id}`, `#/docs/${id}`, `#/docs/${id}?section=overview`]) assert.equal(parseRoute(hash).page, 'not-found', hash);
  }
});

test('product documentation routes resolve to their own project', () => {
  for (const { id } of projects.filter((p) => p.id !== 'ez-topology')) {
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

test('paid product guides never show 3ds Max install steps or free-beta terms', async () => {
  const { libraryGuides } = await import('../src/libraryGuides.js');
  const wrong = /3ds ?Max|\bMZP\b|into Max|free beta|software terms|free personal/i;
  for (const project of projects.filter((item) => item.tier === 'paid')) {
    const guide = libraryGuides[project.id];
    assert.ok(guide.platform && guide.availability && guide.installNote, `${project.id} needs its own platform, availability and installNote`);
    assert.doesNotMatch(JSON.stringify(guide), wrong);
    assert.doesNotMatch(JSON.stringify(project), wrong);
    const file = readFileSync(`public/${guide.document}`, 'utf8');
    assert.doesNotMatch(file, wrong);
    assert.ok(file.includes(guide.platform) && file.includes(guide.installNote), `${guide.document} is out of date`);
  }
});

test('software terms cover exactly the free tools and exclude every paid product', async () => {
  const { termsSections, termsText } = await import('../src/terms.js');
  const section = (title) => termsSections.find(([name]) => name === title)[1];
  const scope = section('What these terms cover');
  const paid = section('Paid products');
  for (const project of catalog) {
    assert.equal(scope.includes(project.name), project.tier === 'free' && !project.hidden, `${project.name} in the terms scope`);
    assert.equal(paid.includes(project.name), project.tier === 'paid', `${project.name} in the paid section`);
  }
  assert.match(paid, /licensed only through Fab/);
  assert.doesNotMatch(termsText, /GOUTAM Lab tools/, 'grants must name the free beta tools, not every GOUTAM Lab tool');
  assert.equal(readFileSync('public/docs/GOUTAM-Lab-Software-Terms.txt', 'utf8').replaceAll('\r\n', '\n'), termsText);
});

test('paid products are sold on Fab only and free tools are downloaded here only', async () => {
  const { getStoreUrl } = await import('../src/projects.js');
  for (const project of projects) {
    if (project.tier === 'paid') {
      assert.equal(getDownloadUrl(project), null, `${project.id} must not be downloadable from the site`);
      assert.ok(getStoreUrl(project));
      assert.match(project.support, /licensed only through Fab/);
    } else {
      assert.equal(project.tier, 'free');
      assert.ok(getDownloadUrl(project));
      assert.equal(getStoreUrl(project), null);
    }
  }
});
