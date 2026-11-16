import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';

const errors = new WeakMap();

test('navigation and lamp form one seamless workshop frame', async ({ page }) => {
  await page.goto('/');
  const appearance = await page.locator('.site-header').evaluate(el => ({ border: getComputedStyle(el).borderBottomWidth, shadow: getComputedStyle(el).boxShadow }));
  expect(appearance.border).toBe('0px');
  expect(appearance.shadow).toBe('none');
  expect(await page.locator('.site-header').evaluate(el => getComputedStyle(el).backgroundColor)).toBe(await page.locator('.workshop-canopy').evaluate(el => getComputedStyle(el).backgroundColor));
});

test('one uninterrupted light field spans the canopy and project reading surface', async ({ page }) => {
  await page.goto('/');
  await page.locator('.workshop-cord').click();
  const illumination = await page.locator('.workshop-light-field').evaluate(el => ({ position: getComputedStyle(el).position, z: Number(getComputedStyle(el).zIndex) }));
  expect(illumination.position).toBe('fixed');
  expect(illumination.z).toBeGreaterThan(await page.locator('.workshop-top').evaluate(el => Number(getComputedStyle(el).zIndex)));
  expect(await page.locator('.workshop-top').evaluate(el => getComputedStyle(el, '::before').backgroundImage)).toBe('none');
  await page.goto('/#/tools/ez-topology');
  await expect.poll(() => page.locator('.workshop-light-field').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.9);
  expect(await page.locator('.workshop-wall').evaluate(el => getComputedStyle(el).display)).toBe('none');
});

test('page fills the viewport without scrollbar chrome and still scrolls naturally', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.goto('/');
  expect(await page.locator('html').evaluate(el => getComputedStyle(el).scrollbarWidth)).toBe('none');
  expect(await page.locator('.workshop-scene').evaluate(el => el.getBoundingClientRect().right)).toBe(1920);
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 250);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  await page.keyboard.press('PageDown');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test('a native preview resizes with its browser window instead of leaving unused space', async ({ browser }) => {
  const context = await browser.newContext({ viewport: null });
  try {
    const native = await context.newPage();
    await native.goto('http://127.0.0.1:4173/');
    expect(native.viewportSize()).toBeNull();
    const session = await context.newCDPSession(native);
    const { windowId } = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
    let previousWidth;
    for (const width of [1200, 1600]) {
      await session.send('Browser.setWindowBounds', { windowId, bounds: { width, height: 900 } });
      // Window bounds include the OS frame; the page must fill the client area.
      await expect.poll(() => native.evaluate(() => innerWidth)).toBeGreaterThan(width - 40);
      const clientWidth = await native.evaluate(() => innerWidth);
      expect(clientWidth).toBeLessThanOrEqual(width);
      expect(await native.locator('.workshop-scene').evaluate(el => el.getBoundingClientRect().right)).toBe(clientWidth);
      expect(await native.evaluate(() => document.documentElement.clientWidth)).toBe(clientWidth);
      if (previousWidth) expect(Math.abs(clientWidth - previousWidth - 400)).toBeLessThan(3);
      previousWidth = clientWidth;
    }
  } finally { await context.close(); }
});

test('workshop hardware is spaced out, ticking and physically interactive', async ({ page }) => {
  await page.goto('/');
  // Moving artwork must contain only metal tools, never the fixed wooden rack.
  expect(await page.locator('.wrench-sprite').first().evaluate(el => getComputedStyle(el).backgroundImage)).toContain('wrenches.png');
  const rack = await page.locator('.wrench-rack').boundingBox();
  // Each ring's hinge must sit inside the wooden face, not hang below it.
  const hinges = await page.locator('.workshop-wrench').evaluateAll(tools => tools.map(tool => {
    const frame = tool.parentElement.getBoundingClientRect();
    const [x, y] = getComputedStyle(tool).transformOrigin.split(' ').map(parseFloat);
    return { x: frame.left + tool.offsetLeft + x, y: frame.top + tool.offsetTop + y };
  }));
  for (const hinge of hinges) {
    expect(hinge.x).toBeGreaterThan(rack.x + 8);
    expect(hinge.x).toBeLessThan(rack.x + rack.width - 8);
    expect(hinge.y).toBeGreaterThan(rack.y + 8);
    expect(hinge.y).toBeLessThan(rack.y + rack.height - 8);
  }
  const pipe = await page.locator('.hardware-pipe').boundingBox();
  const logo = await page.locator('.brand-lockup').boundingBox();
  expect(Math.abs(pipe.x - logo.x)).toBeLessThan(25);
  expect(pipe.y).toBeGreaterThan(logo.y + logo.height - 5);
  const clock = page.locator('.hardware-clock');
  const seconds = await page.locator('.clock-second').getAttribute('style');
  await expect.poll(() => page.locator('.clock-second').getAttribute('style')).not.toBe(seconds);
  const pendulum = await page.locator('.clock-pendulum').evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(250);
  expect(await page.locator('.clock-pendulum').evaluate(el => getComputedStyle(el).transform)).not.toBe(pendulum);
  const wrench = page.getByRole('button', { name: 'Swing long wrench' });
  const box = await wrench.boundingBox();
  const dial = await clock.boundingBox();
  expect(Math.abs(dial.x - box.x)).toBeGreaterThan(85);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * .8);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 28, box.y + box.height * .8, { steps: 8 });
  expect(await wrench.evaluate(el => Math.abs(parseFloat(el.style.getPropertyValue('--wrench-angle'))))).toBeGreaterThan(10);
  expect(await page.locator('.wrench-rack').boundingBox()).toEqual(rack);
  await page.mouse.up();
  await expect.poll(() => wrench.evaluate(el => Math.abs(parseFloat(el.style.getPropertyValue('--wrench-angle')))), { timeout: 7000 }).toBeLessThan(1);
});

test('steam has quiet gaps and hardware pauses when the page is hidden', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => { Math.random = () => .5; });
  await page.goto('/');
  await expect(page.locator('.hardware-pipe')).toHaveAttribute('data-steaming', 'false');
  await page.clock.fastForward(9600);
  await expect(page.locator('.hardware-pipe')).toHaveAttribute('data-steaming', 'true');
  await page.clock.fastForward(2300);
  await expect(page.locator('.hardware-pipe')).toHaveAttribute('data-steaming', 'false');
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  const time = await page.locator('.clock-second').getAttribute('style');
  await page.clock.fastForward(15000);
  await expect(page.locator('.hardware-pipe')).toHaveAttribute('data-steaming', 'false');
  expect(await page.locator('.clock-second').getAttribute('style')).toBe(time);
  expect(await page.locator('.clock-pendulum').evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');
});

test('a wrench nudge gets a directional glance before the mechanic resumes its project route', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.locator('.tool-card-link').first().hover();
  const actor = page.locator('.workshop-mechanic');
  await expect(actor).toHaveAttribute('data-project', 'ez-topology');
  const wrench = page.getByRole('button', { name: 'Swing long wrench' });
  await wrench.focus();
  await page.keyboard.press('ArrowLeft');
  await page.clock.runFor(80);
  await expect(actor).toHaveAttribute('data-attention', 'wrench');
  await expect(actor).toHaveAttribute('data-look', /left|right|up|down/);
  expect(await page.locator('.mechanic-sprite').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('mechanic-gaze.png');
  await expect(actor).toHaveAttribute('data-project', 'ez-topology');
  await page.clock.runFor(2800);
  await expect(actor).not.toHaveAttribute('data-attention', 'wrench');
  await expect(actor).toHaveAttribute('data-project', 'ez-topology');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.workshop-scene')).toHaveAttribute('data-motion', 'paused');
  const paused = await actor.getAttribute('style');
  await page.clock.runFor(5000);
  expect(await actor.getAttribute('style')).toBe(paused);
});

test('repeat project visits vary the drop position, depth and direction without rerolling on scroll', async ({ page }) => {
  await page.clock.install();
  // Constant input isolates visit selection from unrelated firefly timing.
  // The chooser still alternates eligible zones/depths after each visit.
  await page.addInitScript(() => { Math.random = () => .6; });
  await page.goto('/');
  const actor = page.locator('.workshop-mechanic');
  const card = page.locator('.tool-card').first();
  const visits = [];
  for (let i = 0; i < 5; i++) {
    await page.locator('.brand-lockup').hover();
    await card.hover();
    for (let step = 0; step < 180; step++) {
      await page.clock.runFor(100);
      if (/weld|tighten|hammer|inspect|adjust|reconsider/.test(await actor.getAttribute('data-action'))) break;
    }
    await expect(actor).toHaveAttribute('data-action', /weld|tighten|hammer|inspect|adjust|reconsider/);
    const position = await actor.boundingBox();
    const zone = await actor.getAttribute('data-work-zone');
    visits.push({ x: position.x, y: position.y, zone, facing: await actor.evaluate(el => el.style.getPropertyValue('--facing')) });
    await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
    await page.clock.runFor(32);
    expect(await actor.getAttribute('data-work-zone')).toBe(zone);
    const after = await actor.boundingBox();
    expect(Math.abs(after.x - position.x) + Math.abs(after.y - position.y)).toBeLessThan(1);
  }
  // Five real-time visits need not hit every zone; exhaustive seeded coverage
  // and work-facing decisions are checked in workshop-life.test.mjs.
  expect(new Set(visits.map(visit => visit.zone)).size).toBeGreaterThanOrEqual(2);
  expect(new Set(visits.map(visit => visit.facing)).size).toBe(2);
  expect(Math.max(...visits.map(visit => visit.x)) - Math.min(...visits.map(visit => visit.x))).toBeGreaterThan(100);
  expect(Math.max(...visits.map(visit => visit.y)) - Math.min(...visits.map(visit => visit.y))).toBeGreaterThan(60);
});

test('height-only window changes keep the mechanic visible at its selected project spot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.clock.install();
  await page.addInitScript(() => { Math.random = () => .999; });
  await page.goto('/');
  await page.locator('.tool-card-link').first().focus();
  const actor = page.locator('.workshop-mechanic');
  for (let step = 0; step < 180; step++) {
    await page.clock.runFor(100);
    if (/weld|tighten|hammer|inspect|adjust|reconsider/.test(await actor.getAttribute('data-action'))) break;
  }
  const zone = await actor.getAttribute('data-work-zone');
  await page.setViewportSize({ width: 1440, height: 520 });
  await page.clock.runFor(100);
  const box = await actor.boundingBox();
  expect(box.y + box.height).toBeLessThanOrEqual(520);
  await expect(actor).toHaveAttribute('data-work-zone', zone);
  await expect(actor).toHaveAttribute('data-project', 'ez-topology');
});

test('a wrench moved during a long descent is noticed after he reaches a safe working pause', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => { Math.random = () => .999; });
  await page.goto('/');
  await page.locator('.tool-card-link').first().focus();
  const actor = page.locator('.workshop-mechanic');
  for (let step = 0; step < 120; step++) {
    await page.clock.runFor(100);
    if (await actor.getAttribute('data-action') === 'climb') break;
  }
  await page.getByRole('button', { name: 'Swing long wrench' }).focus();
  await page.keyboard.press('ArrowRight');
  for (let step = 0; step < 100; step++) {
    await page.clock.runFor(100);
    if (await actor.getAttribute('data-action') !== 'climb') break;
  }
  await expect(actor).toHaveAttribute('data-attention', 'wrench');
  expect(await page.locator('.mechanic-sprite').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('mechanic-gaze.png');
  await expect(actor).toHaveAttribute('data-project', 'ez-topology');
});

test('reduced-motion lighting remains attached to the sticky lamp when scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.workshop-cord').click();
  await page.evaluate(() => {
    const grid = document.querySelector('.project-grid');
    const original = grid.firstElementChild;
    for (let i = 0; i < 6; i++) grid.append(original.cloneNode(true));
  });
  await page.waitForTimeout(150);
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect.poll(() => page.locator('.workshop-scene').evaluate(el => {
    const bulb = document.querySelector('.workshop-bulb-anchor').getBoundingClientRect();
    return Math.abs(parseFloat(el.style.getPropertyValue('--light-y')) - (bulb.top + bulb.height / 2 - el.getBoundingClientRect().top));
  })).toBeLessThan(3);
});

test('a project with only a narrow visible strip does not send the mechanic offscreen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.clock.install();
  await page.goto('/');
  await page.evaluate(() => {
    const grid = document.querySelector('.project-grid');
    const original = grid.firstElementChild;
    for (let i = 1; i < 6; i++) {
      const copy = original.cloneNode(true);
      copy.dataset.projectId = `partial-${i}`;
      grid.append(copy);
    }
    const target = grid.children[3];
    window.scrollTo(0, target.getBoundingClientRect().top + scrollY - 852);
  });
  const target = await page.locator('.tool-card').nth(3).boundingBox();
  await page.mouse.move(target.x + 100, 868);
  await page.clock.runFor(8000);
  const actor = await page.locator('.workshop-mechanic').boundingBox();
  expect(actor.y).toBeGreaterThanOrEqual(80);
  expect(actor.y + actor.height).toBeLessThanOrEqual(900);
});

test('wheel activity postpones a pending autonomous light switch', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => { Math.random = () => .999; });
  await page.goto('/');
  await page.clock.fastForward(125000);
  await page.mouse.wheel(0, 80);
  await page.clock.fastForward(25000);
  await page.clock.runFor(3500);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('the hanging project tag opens with a pull and interior reading stays clear', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.lamp-filter-control')).toHaveCount(0);
  const tag = await page.locator('.project-tag').boundingBox();
  await page.mouse.move(tag.x + tag.width / 2, tag.y + tag.height / 2);
  await page.mouse.down();
  await page.mouse.move(tag.x + tag.width / 2, tag.y + tag.height / 2 + 13, { steps: 6 });
  await page.mouse.up();
  await expect(page.getByRole('menu', { name: 'Filter tools' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.project-tag')).toBeFocused();
  await page.goto('/#/tools/ez-topology');
  await page.locator('.guide-tabs').scrollIntoViewIfNeeded();
  expect(await page.locator('.workshop-wall').evaluate(el => getComputedStyle(el).display)).toBe('none');
  const canopyBottom = await page.locator('.workshop-canopy').evaluate(el => el.getBoundingClientRect().bottom);
  expect(await page.locator('.workshop-firefly').evaluateAll(els => Math.max(...els.map(el => el.getBoundingClientRect().bottom)))).toBeLessThan(canopyBottom + 22);
});

test('the mechanic uses an inspection pose with a head-anchored bubble above the scenery', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => .6; });
  await page.goto('/');
  await page.locator('.tool-card-link').first().focus();
  await expect(page.locator('.workshop-mechanic')).toHaveAttribute('data-action', 'inspect', { timeout: 15000 });
  await expect(page.locator('.mechanic-bubble')).toBeVisible();
  expect(await page.locator('.mechanic-sprite').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('mechanic-activities.png');
  const actor = await page.locator('.workshop-mechanic').boundingBox();
  const bubble = await page.locator('.mechanic-bubble').boundingBox();
  expect(Math.hypot(bubble.x + bubble.width / 2 - actor.x - 32, bubble.y + bubble.height - actor.y - 28)).toBeLessThan(180);
  expect(await page.locator('.workshop-actors').evaluate(el => Number(getComputedStyle(el).zIndex))).toBeGreaterThan(await page.locator('.workshop-top').evaluate(el => Number(getComputedStyle(el).zIndex)));
});
test.beforeEach(async ({ page }) => {
  const collected = [];
  errors.set(page, collected);
  page.on('pageerror', (error) => collected.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') collected.push(message.text()); });
  page.on('response', (response) => { if (response.status() >= 400) collected.push(`${response.status()} ${response.url()}`); });
  await page.addInitScript(() => localStorage.setItem('goutam-lab-theme', 'light'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
});
test.afterEach(async ({ page }) => expect(errors.get(page)).toEqual([]));

test('the approved tool library, light/dark themes and compact filter work', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.tool-card')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'E-Z Topology' })).toBeVisible();
  await expect(page.getByText('Segmentation', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Generate Mesh', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('menu')).toHaveCount(0);
  expect(await page.locator('body').evaluate((element) => getComputedStyle(element).fontFamily)).toContain('IBM Plex Mono');
  expect(await page.locator('.brand-cursor').evaluate((element) => getComputedStyle(element).animationName)).toBe('cursor-blink');
  await page.getByRole('button', { name: 'Pause logo cursor' }).click();
  expect(await page.locator('.brand-cursor').evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Resume logo cursor' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume logo cursor' }).click();
  expect(await page.locator('.brand-cursor').evaluate((element) => getComputedStyle(element).animationName)).toBe('cursor-blink');
  const surfaces = await page.evaluate(() => ['.site-header', 'html', '.site-footer'].map((selector) => getComputedStyle(document.querySelector(selector)).backgroundColor));
  expect(new Set(surfaces).size).toBe(3);
  await page.screenshot({ path: 'artifacts/gallery-light.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Filter tools: All tools' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.screenshot({ path: 'artifacts/filter-open.png' });
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', { name: 'Available' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Filter tools: All tools' })).toBeFocused();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: 'artifacts/gallery-dark.png', fullPage: true, animations: 'disabled' });
});

test('all tool chapters have usable recordings and drawing really animates', async ({ page }) => {
  await page.goto('/#/tools/ez-topology');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('tab')).toHaveCount(10);
  await expect(page.getByRole('link', { name: 'Read documentation' })).toBeVisible();
  await expect(page.locator('.demo-visual img')).toHaveAttribute('src', /draw\.webp$/);
  await page.locator('.demo-visual').scrollIntoViewIfNeeded();
  await expect(page.locator('.demo-visual img')).toHaveAttribute('src', /draw\.gif$/);
  const initial = await page.locator('.demo-visual').screenshot();
  await page.waitForTimeout(1400);
  const playing = await page.locator('.demo-visual').screenshot();
  expect(createHash('sha256').update(initial).digest('hex')).not.toBe(createHash('sha256').update(playing).digest('hex'));
  await page.getByRole('button', { name: 'Pause Draw animation' }).click();
  await expect(page.locator('.demo-visual img')).toHaveAttribute('src', /draw\.webp$/);
  await page.getByRole('button', { name: 'Resume Draw animation' }).click();
  await expect(page.locator('.demo-visual img')).toHaveAttribute('src', /draw\.gif$/);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator('.demo-visual img')).toHaveAttribute('src', /draw\.webp$/);
  for (const name of ['Select', 'Strips', 'Strokes', 'Patches', 'Connect boundaries', 'Contours', 'Loops', 'Tweak', 'Relax']) {
    await page.getByRole('tab', { name, exact: true }).click();
    await page.locator('.demo-visual').scrollIntoViewIfNeeded();
    await expect(page.locator('.demo-player')).toHaveAttribute('data-playing', 'true');
    await expect(page.getByRole('button', { name: `Pause ${name} animation` })).toHaveCount(1);
    await expect(page.getByRole('table', { name: `${name} settings` })).toBeVisible();
  }
  await page.getByRole('tab', { name: 'Patches', exact: true }).click();
  await page.screenshot({ path: 'artifacts/product-patches.png', fullPage: true, animations: 'disabled' });
});

test('documentation, chapter deep links and downloads work', async ({ page }) => {
  await page.goto('/#/docs/ez-topology?section=connect');
  await expect(page.getByRole('heading', { level: 1, name: /E-Z Topology documentation/ })).toBeAttached();
  await expect(page.locator('#doc-connect')).toBeFocused();
  await expect.poll(() => page.getByRole('progressbar', { name: 'Reading progress' }).getAttribute('aria-valuenow').then(Number)).toBeGreaterThan(0);
  expect(await page.locator('.site-header').evaluate((element) => element.getBoundingClientRect().top)).toBe(0);
  expect(await page.locator('#doc-connect').evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(260);
  expect(await page.locator('#doc-connect').evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(300);
  await expect(page.locator('.doc-content .demo-player')).toHaveCount(10);
  const markdown = await page.request.get('/docs/E-Z-Topology-Guide.md');
  expect(markdown.ok()).toBeTruthy();
  expect(await markdown.text()).toContain('## Connect boundaries');
  const pdf = await page.request.get('/docs/E-Z-Topology-Guide.pdf');
  expect(pdf.ok()).toBeTruthy();
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  const [pdfDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'PDF', exact: true }).click()]);
  expect(pdfDownload.suggestedFilename()).toBe('E-Z-Topology-Guide.pdf');
  const [markdownDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Download guide' }).click()]);
  expect(markdownDownload.suggestedFilename()).toBe('E-Z-Topology-Guide.md');
  await page.getByRole('link', { name: 'Draw', exact: true }).click();
  await expect(page.locator('#doc-draw')).toBeFocused();
  await page.evaluate(() => { document.activeElement.blur(); window.scrollTo(0, 0); });
  await page.getByRole('link', { name: 'Draw', exact: true }).click();
  await expect(page.locator('#doc-draw')).toBeFocused();
  await page.screenshot({ path: 'artifacts/documentation-draw.png' });
});

for (const width of [390, 320]) {
  test(`mobile ${width}px has no horizontal overflow in gallery, product or docs`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const url of ['/', '/#/tools/ez-topology', '/#/docs/ez-topology']) {
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
      expect(await page.evaluate(() => document.querySelector('.header-actions').getBoundingClientRect().right <= document.querySelector('.header-inner').getBoundingClientRect().right + 1)).toBeTruthy();
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
      if (url === '/') {
        const cord = await page.locator('.workshop-cord').boundingBox();
        expect(cord.width).toBeGreaterThanOrEqual(44);
        expect(cord.height).toBeGreaterThanOrEqual(44);
      }
      if (url.includes('/tools/')) {
        await page.getByRole('tab', { name: 'Connect boundaries' }).click();
        await page.locator('.demo-visual').scrollIntoViewIfNeeded();
        await expect(page.locator('.demo-player')).toHaveAttribute('data-playing', 'true');
      }
    }
    await page.screenshot({ path: `artifacts/documentation-mobile-${width}.png` });
  });
}

test('reduced motion starts every documentation example paused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('/#/docs/ez-topology');
  await page.getByRole('link', { name: 'Draw', exact: true }).click();
  for (const image of await page.locator('.demo-visual img').all()) await expect(image).toHaveAttribute('src', /\.webp$/);
  expect(await page.locator('.brand-cursor').evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  expect(await page.locator('.workshop-lamp-swing').evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  await expect(page.getByRole('button', { name: 'Pause scene animation' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Resume Draw animation' }).click();
  await expect(page.locator('#doc-draw').locator('..').locator('.demo-visual img')).toHaveAttribute('src', /draw\.gif$/);
  await page.emulateMedia({ media: 'print' });
  for (const image of await page.locator('.demo-visual img').all()) await expect(image).toHaveAttribute('src', /\.webp$/);
});

test('hidden pages stop animation and visible pages resume it', async ({ page }) => {
  await page.goto('/#/tools/ez-topology');
  await page.locator('.demo-visual').scrollIntoViewIfNeeded();
  await expect(page.locator('.demo-player')).toHaveAttribute('data-playing', 'true');
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.locator('.demo-player')).toHaveAttribute('data-playing', 'false');
  await expect(page.locator('.workshop-scene')).toHaveAttribute('data-motion', 'paused');
  expect(await page.locator('.workshop-lamp-swing').evaluate((element) => getComputedStyle(element).animationPlayState)).toBe('paused');
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.locator('.demo-player')).toHaveAttribute('data-playing', 'true');
});

test('cord owns theme switching and the scene stays alive without pause controls', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('goutam-lab-scene-paused', '1'));
  await page.goto('/');
  const lamp = page.locator('.workshop-lamp');
  const before = await lamp.boundingBox();
  await page.waitForTimeout(250);
  expect(await lamp.boundingBox()).toEqual(before);
  await lamp.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const cord = page.locator('.workshop-cord');
  await cord.click();
  await expect(cord).toHaveAttribute('data-lit', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect.poll(() => page.locator('.workshop-light-field').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.5);
  await expect(page.locator('.workshop-firefly img')).toHaveCount(7);
  await expect(page.locator('.workshop-firefly img').first()).toHaveAttribute('src', /firefly\.png$/);
  await expect(page.locator('.workshop-shade img')).toHaveAttribute('src', /lamp-body-on\.png$/);
  await expect(page.getByRole('button', { name: /scene animation/ })).toHaveCount(0);
  expect(await page.locator('.workshop-lamp-swing').evaluate(el => getComputedStyle(el).animationPlayState)).toBe('running');
  expect(await page.locator('.brand-cursor').evaluate(el => getComputedStyle(el).animationName)).toBe('cursor-blink');
});

test('surface light has no floating cone edge and fireflies move independently', async ({ page }) => {
  await page.goto('/');
  await page.locator('.workshop-cord').click();
  const field = await page.locator('.workshop-light-field').evaluate(el => {
    const s = getComputedStyle(el);
    return { height: el.offsetHeight, sceneHeight: innerHeight, image: s.backgroundImage };
  });
  expect(field.height).toBe(field.sceneHeight);
  expect(field.image).toContain('radial-gradient');
  expect(field.image).not.toContain('lamp-glow');
  const before = await page.locator('.workshop-firefly').evaluateAll(els => els.map(el => el.style.transform));
  await page.waitForTimeout(1000);
  const after = await page.locator('.workshop-firefly').evaluateAll(els => els.map(el => el.style.transform));
  expect(new Set(after).size).toBe(7);
  expect(after.filter((value, index) => value !== before[index]).length).toBe(7);
  expect(await page.locator('.workshop-rope-art').evaluate(el => Number(el.style.getPropertyValue('--shadow-alpha')))).toBeGreaterThan(.4);
});

test('mechanic visits a hovered project without blocking its link and cancels on navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.workshop-mechanic')).toBeVisible();
  await page.locator('.tool-card').first().hover();
  await expect(page.locator('.workshop-mechanic')).toHaveAttribute('data-project', 'ez-topology');
  await expect.poll(() => page.locator('.workshop-mechanic').getAttribute('data-action'), { timeout: 15000 }).toMatch(/weld|tighten|hammer|inspect|adjust|reconsider/);
  expect(await page.locator('.mechanic-drop-rope').evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(20);
  await page.locator('.tool-card-link').first().click();
  await expect(page.locator('.workshop-mechanic')).toHaveCount(0);
});

test('a manual switch keeps priority over a pending autonomous lamp visit', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => { Math.random = () => .999; });
  await page.goto('/');
  await page.clock.fastForward(125000);
  await page.locator('.workshop-cord').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.clock.fastForward(46000);
  await page.clock.runFor(3500);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('an idle mechanic can physically pull the cord and explain the action', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => { Math.random = () => .999; });
  await page.goto('/');
  await page.evaluate(() => {
    window.cordPeak = 0;
    const mount = document.querySelector('.workshop-lamp-mount');
    new MutationObserver(() => { window.cordPeak = Math.max(window.cordPeak, parseFloat(mount.style.getPropertyValue('--cord-pull')) || 0); }).observe(mount, { attributes: true, attributeFilter: ['style'] });
  });
  await page.clock.fastForward(125000);
  await page.clock.runFor(3000);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => window.cordPeak)).toBeGreaterThan(12);
  await expect(page.locator('.mechanic-bubble')).toBeVisible();
});

test('focused project work survives a hidden tab and retargets a moved card', async ({ page }) => {
  await page.goto('/');
  await page.locator('.tool-card-link').first().focus();
  await expect(page.locator('.workshop-mechanic')).toHaveAttribute('data-project', 'ez-topology');
  await page.waitForTimeout(700);
  const before = await page.locator('.workshop-mechanic').evaluate(el => el.style.transform);
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.locator('.workshop-scene')).toHaveAttribute('data-motion', 'paused');
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(300);
  await expect(page.locator('.workshop-mechanic')).toHaveAttribute('data-project', 'ez-topology');
  const after = await page.locator('.workshop-mechanic').evaluate(el => el.style.transform);
  // A resumed route continues from where it was paused, rather than respawning.
  const x = value => Number(value.match(/translate3d\(([-.\d]+)/)[1]);
  expect(x(after)).toBeLessThanOrEqual(x(before) + 5);
  await expect.poll(() => page.locator('.workshop-mechanic').getAttribute('data-action'), { timeout: 15000 }).toMatch(/weld|tighten|hammer|inspect|adjust|reconsider/);
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const grid = document.querySelector('.project-grid');
    const original = grid.firstElementChild;
    for (let i = 0; i < 3; i++) {
      const copy = original.cloneNode(true);
      copy.dataset.projectId = `reflow-${i}`;
      grid.insertBefore(copy, original);
    }
  });
  await expect(page.locator('.workshop-mechanic')).toHaveAttribute('data-project', 'ez-topology');
  await expect.poll(() => page.locator('.workshop-mechanic').getAttribute('data-action')).toMatch(/climb|walk/);
});

test('workshop grows with eighteen cards and its full-size canopy stays visible while scrolling', async ({ page }) => {
  await page.goto('/');
  const initialLamp = await page.locator('.workshop-lamp-mount').boundingBox();
  await page.evaluate(() => {
    const grid = document.querySelector('.project-grid');
    const card = grid.firstElementChild;
    for (let index = grid.children.length; index < 18; index++) {
      const copy = card.cloneNode(true);
      copy.querySelector('h2').textContent = `Layout check ${index}`;
      copy.querySelector('h2').id = `layout-check-${index}`;
      copy.querySelector('a').setAttribute('aria-labelledby', `layout-check-${index}`);
      grid.append(copy);
    }
  });
  await expect(page.locator('.tool-card')).toHaveCount(18);
  const layout = await page.evaluate(() => {
    const last = document.querySelector('.tool-card:last-child').getBoundingClientRect();
    const rail = document.querySelector('.rail-left').getBoundingClientRect();
    const floor = document.querySelector('.workshop-pavement').getBoundingClientRect();
    return { last: last.bottom, rail: rail.bottom, floor: floor.top, height: document.querySelector('.workshop-scene').getBoundingClientRect().height };
  });
  expect(layout.rail).toBeGreaterThan(layout.last);
  expect(layout.floor).toBeGreaterThan(layout.last);
  expect(layout.height).toBeGreaterThan(3000);
  await page.locator('.tool-card').last().scrollIntoViewIfNeeded();
  await expect(page.locator('.is-docked')).toHaveCount(0);
  const scrolledLamp = await page.locator('.workshop-lamp-mount').boundingBox();
  expect(scrolledLamp.width).toBe(initialLamp.width);
  expect(scrolledLamp.height).toBe(initialLamp.height);
  expect(Math.abs(scrolledLamp.y - initialLamp.y)).toBeLessThan(2);
  const canopy = await page.locator('.workshop-canopy').boundingBox();
  const header = await page.locator('.site-header').boundingBox();
  expect(Math.abs(canopy.y - (header.y + header.height))).toBeLessThan(2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test('cursor physics supports cord pulling, lamp swinging and keyboard theme control', async ({ page }) => {
  await page.goto('/');
  const cord = page.locator('.workshop-cord');
  await expect(cord).toBeVisible();
  const knobBox = await page.locator('.workshop-pull-knob').boundingBox();
  const x = knobBox.x + knobBox.width / 2;
  const y = knobBox.y + knobBox.height / 2;
  expect(await page.evaluate(({x, y}) => document.elementFromPoint(x, y)?.closest('button')?.classList.contains('workshop-cord'), {x, y})).toBeTruthy();
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 2, y + 26, { steps: 8 });
  expect(await page.locator('.workshop-lamp-mount').evaluate(el => parseFloat(el.style.getPropertyValue('--cord-pull')))).toBeGreaterThan(12);
  await page.mouse.up();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect.poll(() => page.locator('.workshop-lamp-mount').evaluate(el => Math.abs(parseFloat(el.style.getPropertyValue('--cord-pull'))))).toBeLessThan(1);
  const lightMaskBefore = await page.locator('.workshop-rope-art').evaluate(el => parseFloat(el.style.getPropertyValue('--lit-mask-x')));
  const lamp = await page.locator('.workshop-lamp').boundingBox();
  await page.mouse.move(lamp.x + lamp.width * .82, lamp.y + lamp.height * .57);
  await page.mouse.down();
  await page.mouse.move(lamp.x + lamp.width * .82 + 1, lamp.y + lamp.height * .57);
  expect(await page.locator('.workshop-lamp-mount').evaluate(el => Math.abs(parseFloat(el.style.getPropertyValue('--lamp-angle'))))).toBeLessThan(2);
  await page.mouse.move(lamp.x + lamp.width * .82 + 48, lamp.y + lamp.height * .6, { steps: 10 });
  expect(await page.locator('.workshop-lamp-mount').evaluate(el => parseFloat(el.style.getPropertyValue('--lamp-angle')))).toBeLessThan(-10);
  await expect.poll(() => page.locator('.workshop-scene').evaluate(el => parseFloat(el.style.getPropertyValue('--light-angle')))).toBeLessThan(-10);
  const lightMaskAfter = await page.locator('.workshop-rope-art').evaluate(el => parseFloat(el.style.getPropertyValue('--lit-mask-x')));
  expect(Math.abs(lightMaskAfter - lightMaskBefore)).toBeGreaterThan(20);
  expect(await page.locator('.workshop-rope-art').evaluate(el => parseFloat(el.style.getPropertyValue('--shadow-alpha')))).toBeGreaterThan(0);
  expect(await page.locator('.workshop-rope-art').evaluate(el => getComputedStyle(el, '::before').maskImage)).toContain('radial-gradient');
  await page.mouse.up();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect.poll(() => page.locator('.workshop-lamp-mount').evaluate(el => Math.abs(parseFloat(el.style.getPropertyValue('--lamp-angle')))), { timeout: 6000 }).toBeLessThan(.3);
  await cord.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const rope = await page.locator('.workshop-rope').boundingBox();
  await page.mouse.move(rope.x + rope.width / 2, rope.y + 28);
  await page.mouse.down();
  await page.mouse.move(rope.x + rope.width / 2, rope.y + 45, { steps: 8 });
  await expect.poll(() => page.locator('.workshop-rope').evaluate(el => parseFloat(el.style.getPropertyValue('--rope-stretch')))).toBeGreaterThan(1.15);
  await page.mouse.up();
  await page.mouse.move(20, 20);
  await expect.poll(() => page.locator('.workshop-rope').evaluate(el => Math.abs(parseFloat(el.style.getPropertyValue('--rope-stretch')) - 1))).toBeLessThan(.02);
  await page.locator('.workshop-lamp').focus();
  for (let index = 0; index < 35; index++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  expect(await page.locator('.workshop-lamp-mount').evaluate(el => Math.abs(parseFloat(el.style.getPropertyValue('--lamp-angle'))))).toBeLessThanOrEqual(42.1);
});
