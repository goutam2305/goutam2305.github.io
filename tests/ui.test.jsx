import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// DOM-level tests only: no browser process, automation driver or external requests.
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://127.0.0.1:4173/', pretendToBeVisual: true });
for (const key of ['window', 'document', 'HTMLElement', 'Node', 'MutationObserver', 'localStorage']) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true });
}
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const mediaListeners = new Set();
const media = {
  matches: false,
  addEventListener(event, listener) { if (event === 'change') mediaListeners.add(listener); },
  removeEventListener(event, listener) { if (event === 'change') mediaListeners.delete(listener); },
};
window.matchMedia = () => media;
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};

const { render, screen, cleanup, within, waitFor, act } = await import('@testing-library/react');
const { default: userEvent } = await import('@testing-library/user-event');
const { App } = await import('../src/App.jsx');
const user = () => userEvent.setup({ document });

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  document.documentElement.removeAttribute('data-theme');
  media.matches = false;
});

test('gallery has only E-Z Topology, Tools/About navigation and a quiet footer', () => {
  render(<App />);
  const navigation = screen.getByRole('navigation', { name: 'Main navigation' });
  assert.deepEqual(within(navigation).getAllByRole('link').map((link) => link.textContent), ['Tools', 'About']);
  assert.equal(screen.getAllByRole('article').length, 1);
  assert.equal(screen.getAllByRole('img').length, 1);
  assert.equal(screen.queryByText('Segmentation'), null);
  assert.equal(screen.queryByText('Generate Mesh'), null);
  assert.equal(screen.getByRole('heading', { name: 'E-Z Topology' }).tagName, 'H2');
  assert.equal(screen.getByRole('contentinfo').querySelectorAll('nav, a').length, 0);
  assert.ok(screen.getByRole('button', { name: 'Back to top' }));
  assert.equal(screen.queryByRole('menu'), null);
  assert.equal(screen.queryByText('Tutorials'), null);
});

test('filter supports arrows, Escape and focus restoration', async () => {
  render(<App />);
  const input = user();
  const trigger = screen.getByRole('button', { name: 'Filter tools: All tools' });
  await input.click(trigger);
  const all = screen.getByRole('menuitemradio', { name: 'All tools' });
  assert.equal(document.activeElement, all);
  await input.keyboard('{ArrowDown}');
  assert.equal(document.activeElement, screen.getByRole('menuitemradio', { name: 'Available' }));
  await input.keyboard('{End}');
  assert.equal(document.activeElement, screen.getByRole('menuitemradio', { name: 'In development' }));
  await input.keyboard('{Escape}');
  assert.equal(screen.queryByRole('menu'), null);
  assert.equal(document.activeElement, trigger);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
});

test('selection filters results, indicates active filtering and restores trigger focus', async () => {
  render(<App />);
  const input = user();
  await input.click(screen.getByRole('button', { name: 'Filter tools: All tools' }));
  await input.click(screen.getByRole('menuitemradio', { name: 'In development' }));
  assert.equal(screen.queryAllByRole('article').length, 0);
  assert.equal(screen.queryByRole('heading', { name: 'E-Z Topology' }), null);
  const trigger = screen.getByRole('button', { name: 'Filter tools: In development' });
  assert.equal(document.activeElement, trigger);
  assert.equal(screen.queryByRole('menu'), null);
});

test('Available has an honest empty state until a public release exists, with a working reset', async () => {
  render(<App />);
  const input = user();
  await input.click(screen.getByRole('button', { name: 'Filter tools: All tools' }));
  await input.click(screen.getByRole('menuitemradio', { name: 'Available' }));
  assert.equal(screen.queryAllByRole('article').length, 0);
  assert.ok(screen.getByRole('heading', { name: 'Getting ready to share.' }));
  await input.click(screen.getByRole('button', { name: 'Show all tools' }));
  assert.equal(screen.getAllByRole('article').length, 1);
  assert.equal(document.activeElement, screen.getByRole('heading', { name: 'Tools' }));
});

test('filter dismisses on outside pointer interaction', async () => {
  render(<App />);
  const input = user();
  await input.click(screen.getByRole('button', { name: 'Filter tools: All tools' }));
  await input.click(screen.getByRole('heading', { name: 'Tools' }));
  assert.equal(screen.queryByRole('menu'), null);
});

test('theme follows a saved preference, switches and survives remount', async () => {
  localStorage.setItem('goutam-lab-theme', 'dark');
  render(<App />);
  assert.equal(document.documentElement.dataset.theme, 'dark');
  await user().click(screen.getByRole('button', { name: 'Switch to light theme' }));
  assert.equal(document.documentElement.dataset.theme, 'light');
  assert.equal(localStorage.getItem('goutam-lab-theme'), 'light');
  cleanup();
  render(<App />);
  assert.equal(document.documentElement.dataset.theme, 'light');
});

test('storage restrictions do not stop startup or erase an explicit theme on a system change', async () => {
  const prototype = Object.getPrototypeOf(localStorage);
  const get = prototype.getItem;
  const set = prototype.setItem;
  prototype.getItem = () => { throw new Error('Restricted storage'); };
  prototype.setItem = () => { throw new Error('Restricted storage'); };
  try {
    render(<App />);
    await user().click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    assert.equal(document.documentElement.dataset.theme, 'dark');
    await act(async () => {
      media.matches = true;
      mediaListeners.forEach((listener) => listener());
      media.matches = false;
      mediaListeners.forEach((listener) => listener());
    });
    assert.equal(document.documentElement.dataset.theme, 'dark');
  } finally {
    prototype.getItem = get;
    prototype.setItem = set;
  }
});

test('tool and About navigation work without inventing download links', async () => {
  render(<App />);
  const input = user();
  await input.click(screen.getByRole('link', { name: 'E-Z Topology' }));
  await waitFor(() => assert.ok(screen.getByRole('heading', { level: 1, name: 'E-Z Topology' })));
  assert.ok(screen.getByText('Public download coming soon'));
  assert.equal(screen.queryByRole('link', { name: 'Download free' }), null);
  assert.equal(document.title, 'E-Z Topology — GOUTAM Lab');
  await input.click(within(screen.getByRole('navigation')).getByRole('link', { name: 'About' }));
  await waitFor(() => assert.ok(screen.getByRole('heading', { level: 1, name: /Useful tools\.\s*Made for 3D artists\./ })));
  assert.equal(document.title, 'About — GOUTAM Lab');
  assert.equal(screen.getByRole('link', { name: 'GitHub' }).getAttribute('rel'), 'noopener noreferrer');
});

test('direct project links and unknown routes display the correct page', async () => {
  window.history.replaceState(null, '', '/#/tools/ez-topology');
  render(<App />);
  assert.ok(screen.getByRole('heading', { level: 1, name: 'E-Z Topology' }));
  await act(async () => {
    window.history.replaceState(null, '', '/#/missing');
    window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  });
  assert.ok(screen.getByRole('heading', { name: 'This page isn’t in the lab.' }));
});

test('each tool tab exposes its guide and a controllable recorded demo', async () => {
  window.history.replaceState(null, '', '/#/tools/ez-topology');
  render(<App />);
  const input = user();
  assert.equal(screen.getAllByRole('tab').length, 10);
  await input.click(screen.getByRole('tab', { name: 'Patches' }));
  assert.ok(screen.getByRole('button', { name: 'Pause Patches animation' }));
  await input.click(screen.getByRole('button', { name: 'Pause Patches animation' }));
  assert.ok(screen.getByRole('button', { name: 'Resume Patches animation' }));
  await input.click(screen.getByRole('tab', { name: 'Connect boundaries' }));
  assert.ok(screen.getByRole('button', { name: 'Pause Connect boundaries animation' }));
  assert.ok(screen.getByRole('table', { name: 'Connect boundaries settings' }));
});

test('documentation is linked from the product and includes downloadable guides', async () => {
  window.history.replaceState(null, '', '/#/tools/ez-topology');
  render(<App />);
  await user().click(screen.getByRole('link', { name: 'Read documentation' }));
  await waitFor(() => assert.ok(screen.getByRole('heading', { level: 1, name: /E-Z Topology\s*documentation/ })));
  assert.ok(screen.getByRole('navigation', { name: 'Documentation chapters' }));
  assert.ok(screen.getByRole('link', { name: 'Download guide' }).getAttribute('download') !== null);
  assert.ok(screen.getByRole('link', { name: 'PDF' }).href.endsWith('.pdf'));
  assert.equal(screen.getAllByRole('figure').length, 10);
});
