import test from 'node:test';
import assert from 'node:assert/strict';
import { projects, filterProjects, getDownloadUrl, parseRoute, getInitialTheme } from '../src/projects.js';

test('E-Z Topology is first; Maya is planned, not a current platform', () => {
  assert.equal(projects[0].name, 'E-Z Topology');
  assert.equal(projects.length, 1);
  assert.equal(projects[0].documentationUrl, '#/docs/ez-topology');
  assert.deepEqual(projects[0].platforms, ['3ds Max']);
  assert.deepEqual(projects[0].plannedPlatforms, ['Maya']);
  assert.equal(new Set(projects.map((p) => p.id)).size, projects.length);
});

test('available means an actual HTTPS release, not a beta status badge', () => {
  assert.deepEqual(filterProjects(projects, 'available'), []);
  const released = { ...projects[0], downloadUrl: 'https://example.com/releases/tool.zip' };
  assert.deepEqual(filterProjects([released, ...projects], 'available'), [released]);
  for (const downloadUrl of ['javascript:alert(1)', '/missing.zip', 'http://example.com/tool.zip', 'not a url']) {
    assert.equal(getDownloadUrl({ downloadUrl }), null);
  }
});

test('filters preserve ordering and expose the expected development projects', () => {
  assert.deepEqual(filterProjects(projects, 'all'), projects);
  assert.deepEqual(filterProjects(projects, 'development'), []);
  assert.deepEqual(filterProjects(projects, 'unknown'), projects);
});

test('static hash routes support direct links and reject malformed paths', () => {
  for (const hash of ['', '#', '#/', '#/tools']) assert.equal(parseRoute(hash).page, 'tools');
  assert.equal(parseRoute('#/about').page, 'about');
  assert.equal(parseRoute('#/tools/ez-topology').project.name, 'E-Z Topology');
  assert.equal(parseRoute('#/docs/ez-topology').page, 'documentation');
  assert.equal(parseRoute('#/docs/ez-topology?section=patches').section, 'patches');
  for (const hash of ['#/tools/unknown', '#/tools/segmentation', '#/tools/generate-mesh', '#/tools/%zz', '#/tools/../../about', '#/tutorials']) {
    assert.equal(parseRoute(hash).page, 'not-found');
  }
});

test('theme uses explicit preference before the system and survives blocked storage', () => {
  assert.equal(getInitialTheme({ getItem: () => 'dark' }, false), 'dark');
  assert.equal(getInitialTheme({ getItem: () => 'light' }, true), 'light');
  assert.equal(getInitialTheme({ getItem: () => 'unknown' }, true), 'dark');
  assert.equal(getInitialTheme({ getItem: () => { throw new Error('blocked'); } }, false), 'light');
  assert.equal(getInitialTheme(undefined, true), 'dark');
});
