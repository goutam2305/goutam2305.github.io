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

test('a second pointer cannot interrupt the hanging tag pull', async () => {
  render(<App />);
  const tag = screen.getByRole('button', { name: 'Filter tools: All tools' });
  const pointer = (type, id, y) => {
    const event = new window.MouseEvent(type, { bubbles: true, button: 0, clientY: y });
    Object.defineProperty(event, 'pointerId', { value: id });
    tag.dispatchEvent(event);
  };
  await act(async () => {
    pointer('pointerdown', 1, 40);
    pointer('pointerdown', 2, 80);
    pointer('pointerup', 2, 80);
    tag.dispatchEvent(new window.MouseEvent('click', { bubbles: true, detail: 1 }));
    pointer('pointercancel', 2, 80);
  });
  assert.ok(!screen.queryByRole('menu'));
  await act(async () => {
    pointer('pointermove', 1, 64);
    pointer('pointerup', 1, 64);
  });
  assert.ok(screen.getByRole('menu'));
});

test('a documentation deep link waits for fonts before positioning the chapter', async () => {
  let finishFonts;
  const ready = new Promise(resolve => { finishFonts = resolve; });
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready } });
  window.history.replaceState(null, '', '/#/docs/ez-topology?section=connect');
  render(<App />);
  try {
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 60)); });
    assert.notEqual(document.activeElement.id, 'doc-connect');
    await act(async () => { finishFonts(); await ready; });
    await waitFor(() => assert.equal(document.activeElement.id, 'doc-connect'));
  } finally {
    finishFonts();
    Object.defineProperty(document, 'fonts', { configurable: true, value: undefined });
  }
});

test('a focused mechanic request remains intact while the document is hidden', async () => {
  const { container } = render(<App />);
  // JSDOM has no layout; give this interaction test a visible project surface.
  container.querySelector('.tool-card').getBoundingClientRect = () => ({ left: 40, right: 440, top: 300, bottom: 900, width: 400, height: 600 });
  await act(async () => { container.querySelector('.tool-card-link').focus(); });
  const actor = container.querySelector('.workshop-mechanic');
  assert.equal(actor.dataset.project, 'easyviewer');
  try {
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new window.Event('visibilitychange'));
    });
    assert.equal(actor.dataset.project, 'easyviewer');
  } finally {
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
      document.dispatchEvent(new window.Event('visibilitychange'));
    });
  }
  assert.equal(actor.dataset.project, 'easyviewer');
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  document.documentElement.removeAttribute('data-theme');
  media.matches = false;
});

test('gallery has the four tools, Tools/About me navigation and a quiet footer', () => {
  render(<App />);
  const navigation = screen.getByRole('navigation', { name: 'Main navigation' });
  assert.deepEqual(within(navigation).getAllByRole('link').map((link) => link.textContent), ['Tools', 'About me']);
  assert.equal(screen.getAllByRole('article').length, 4);
  assert.equal(screen.getAllByRole('img').length, 4);
  assert.equal(screen.queryByText('Segmentation'), null);
  assert.equal(screen.queryByText('Generate Mesh'), null);
  assert.equal(screen.getByRole('heading', { name: 'E-Z Topology' }).tagName, 'H2');
  assert.equal(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Software terms' }).getAttribute('href'), '#/terms');
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

test('Available shows the available tools and the filter can return to All tools', async () => {
  render(<App />);
  const input = user();
  await input.click(screen.getByRole('button', { name: 'Filter tools: All tools' }));
  await input.click(screen.getByRole('menuitemradio', { name: 'Available' }));
  assert.equal(screen.queryAllByRole('article').length, 4);
  await input.click(screen.getByRole('button', { name: 'Filter tools: Available' }));
  await input.click(screen.getByRole('menuitemradio', { name: 'All tools' }));
  assert.equal(screen.getAllByRole('article').length, 4);
  assert.equal(document.activeElement, screen.getByRole('button', { name: 'Filter tools: All tools' }));
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

test('workshop lamp switches its light and the persisted theme together', async () => {
  render(<App />);
  const lamp = screen.getByRole('button', { name: 'Switch to dark theme' });
  assert.ok(lamp.classList.contains('workshop-cord'));
  assert.equal(lamp.getAttribute('data-lit'), 'false');
  await user().click(lamp);
  assert.equal(document.documentElement.dataset.theme, 'dark');
  assert.equal(lamp.getAttribute('data-lit'), 'true');
  assert.equal(localStorage.getItem('goutam-lab-theme'), 'dark');
  assert.ok(screen.getByRole('button', { name: 'Switch to light theme' }));
  assert.ok(screen.getByRole('button', { name: 'Pause logo cursor' }));
});

test('scene stays alive without header pause controls or legacy pause preference', async () => {
  localStorage.setItem('goutam-lab-scene-paused', '1');
  const { container } = render(<App />);
  assert.equal(container.querySelector('.workshop-scene').getAttribute('data-motion'), 'running');
  assert.equal(screen.queryByRole('button', { name: 'Pause scene animation' }), null);
  assert.equal(screen.queryByRole('button', { name: 'Resume scene animation' }), null);
  assert.ok(screen.getByRole('button', { name: 'Pause logo cursor' }));
});

test('a second pointer cannot switch the cord while the first pointer holds the shade', async () => {
  render(<App />);
  const shade = screen.getByRole('button', { name: 'Swing workshop lamp' });
  const cord = screen.getByRole('button', { name: 'Switch to dark theme' });
  const pointer = (target, type, id) => {
    const event = new window.MouseEvent(type, { bubbles: true, button: 0, clientX: 60, clientY: 80 });
    Object.defineProperty(event, 'pointerId', { value: id });
    target.dispatchEvent(event);
  };
  await act(async () => {
    pointer(shade, 'pointerdown', 1);
    pointer(cord, 'pointerdown', 2);
    pointer(cord, 'pointerup', 2);
    cord.dispatchEvent(new window.MouseEvent('click', { bubbles: true, detail: 1 }));
    pointer(shade, 'pointercancel', 1);
  });
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

test('tool and About navigation show the real download without repository links', async () => {
  render(<App />);
  const input = user();
  await input.click(screen.getByRole('link', { name: 'E-Z Topology' }));
  await waitFor(() => assert.ok(screen.getByRole('heading', { level: 1, name: 'E-Z Topology' })));
  assert.ok(screen.getByRole('link', { name: 'Download .mzp' }).getAttribute('href').endsWith('.mzp'));
  assert.equal(document.title, 'E-Z Topology — GOUTAM Lab');
  await input.click(within(screen.getByRole('navigation', { name: 'Main navigation' })).getByRole('link', { name: 'About me' }));
  await waitFor(() => assert.ok(screen.getByRole('heading', { level: 1, name: /About\s*me/ })));
  assert.equal(document.title, 'About me — GOUTAM Lab');
  assert.equal(screen.queryByRole('link', { name: 'GitHub' }), null);
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

test('EasyViewer page gallery steps through screenshots with buttons and thumbnails', async () => {
  window.history.replaceState(null, '', '/#/tools/easyviewer');
  render(<App />);
  const input = user();
  const gallery = () => screen.getByRole('region', { name: 'See it in action.' });
  assert.ok(within(gallery()).getByRole('heading', { name: 'EasyViewer 3.0' }));
  await input.click(screen.getByRole('button', { name: 'Next screenshot' }));
  assert.ok(within(gallery()).getByRole('heading', { name: 'Focus on a detail' }));
  await input.click(screen.getByRole('button', { name: 'Previous screenshot' }));
  await input.click(screen.getByRole('button', { name: 'Previous screenshot' }));
  assert.ok(within(gallery()).getByRole('heading', { name: 'Item inspection' }));
  await input.click(screen.getByRole('button', { name: /Screenshot 3: Turntable mode/ }));
  assert.ok(within(gallery()).getByRole('heading', { name: 'Turntable mode' }));
  assert.equal(screen.getByText('3 / 4').textContent, '3 / 4');
});
