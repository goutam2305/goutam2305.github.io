import test from 'node:test';
import assert from 'node:assert/strict';
import { createFireflies, stepFireflies } from '../src/fireflyMotion.js';
import { chooseActivity, chooseBubble, projectAction, canAutotoggleLamp, ropeHeightAt } from '../src/mechanicBehaviour.js';
import * as behaviour from '../src/mechanicBehaviour.js';

const seeded = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const bounds = { left: 24, right: 1200, top: 30, bottom: 900 };

test('project visits cover both sides and the middle with varied depths and working directions', () => {
  const random = seeded(23);
  const zones = new Set();
  const depths = new Set();
  const facings = new Set();
  let previous;
  for (let i = 0; i < 80; i++) {
    const visit = behaviour.chooseProjectVisit(previous, random);
    assert.notEqual(visit.zone, previous?.zone);
    assert.notEqual(visit.depthBand, previous?.depthBand);
    assert.ok(visit.u >= .12 && visit.u <= .88 && visit.v >= .15 && visit.v <= .85);
    zones.add(visit.zone); depths.add(visit.depthBand); facings.add(visit.facing);
    previous = visit;
  }
  assert.deepEqual([...zones].sort(), ['left', 'middle', 'right']);
  assert.equal(depths.size, 3);
  assert.deepEqual([...facings].sort(), [-1, 1]);
});

test('a visit keeps its selected position across layout updates and stays visible on a narrow card strip', () => {
  const visit = { u: .5, v: .7, facing: -1 };
  const rect = { left: 40, right: 440, top: 300, bottom: 950, width: 400, height: 650 };
  const viewport = { width: 800, height: 900, canopyBottom: 260 };
  const rope = { left: 20, top: 210, width: 760, height: 48 };
  const point = behaviour.projectVisitPoint(rect, viewport, rope, visit);
  assert.equal(point.x, 240);
  assert.deepEqual(point, behaviour.projectVisitPoint(rect, viewport, rope, visit));
  const moved = behaviour.projectVisitPoint({ ...rect, top: 280, bottom: 930 }, viewport, rope, visit);
  assert.equal(moved.x, point.x);
  const narrow = behaviour.projectVisitPoint({ ...rect, top: 790, bottom: 1400 }, viewport, rope, visit);
  assert.ok(narrow.y <= 886 && narrow.y - 88 >= viewport.canopyBottom);
  const mobile = behaviour.projectVisitPoint({ left: 24, top: 240, bottom: 850, width: 272 }, { width: 320, height: 640, canopyBottom: 206 }, { left: 12, top: 170, width: 296, height: 40 }, { ...visit, u: .88 });
  assert.ok(mobile.x >= 35 && mobile.x <= 285 && mobile.y <= 626);
});

test('gaze follows a target in both axes and idle looks include forward without immediate repeats', () => {
  const head = { x: 300, y: 300 };
  assert.equal(behaviour.lookAtPoint(head, { x: 600, y: 300 }).direction, 'right');
  assert.equal(behaviour.lookAtPoint(head, { x: 100, y: 300 }).facing, -1);
  assert.equal(behaviour.lookAtPoint(head, { x: 100, y: 100 }).direction, 'up-left');
  assert.equal(behaviour.lookAtPoint(head, { x: 300, y: 100 }).sprite, 4);
  assert.equal(behaviour.lookAtPoint(head, { x: 300, y: 500 }).sprite, 5);
  const random = seeded(15);
  let previous;
  const directions = new Set();
  for (let i = 0; i < 60; i++) {
    const look = behaviour.chooseIdleLook(previous, random);
    assert.notEqual(look.direction, previous?.direction);
    assert.ok(look.duration >= 1800 && look.duration <= 4500);
    directions.add(look.direction); previous = look;
  }
  assert.ok(['front', 'left', 'right', 'up', 'down'].every(direction => directions.has(direction)));
});

test('the mechanic follows the sag of the rope rather than floating above it', () => {
  const rope = { left: 20, width: 1000, top: 174, height: 48 };
  assert.ok(ropeHeightAt(520, rope) - ropeHeightAt(20, rope) > 25);
  assert.equal(ropeHeightAt(20, rope), ropeHeightAt(1020, rope));
  assert.ok(ropeHeightAt(520, rope) < 222);
});

test('fireflies wander independently, visit the lamp and remain inside the workshop', () => {
  const random = seeded(17);
  const flies = createFireflies(7, bounds, random);
  const modes = new Set();
  let maxDistance = 0;
  for (let step = 0; step < 3600; step++) {
    stepFireflies(flies, 1 / 30, bounds, { x: 1000, y: 130, lit: true }, step / 30, random);
    for (const fly of flies) {
      modes.add(fly.mode);
      maxDistance = Math.max(maxDistance, Math.hypot(fly.x - 1000, fly.y - 130));
      assert.ok(fly.x >= bounds.left && fly.x <= bounds.right);
      assert.ok(fly.y >= bounds.top && fly.y <= bounds.bottom);
      assert.ok(Number.isFinite(fly.vx + fly.vy));
    }
  }
  assert.ok(modes.has('lamp') && modes.has('wander') && modes.has('gather'));
  assert.ok(maxDistance > 500, 'some flies leave the lamp by a meaningful distance');
  assert.ok(new Set(flies.map(fly => Math.round(fly.x))).size >= 6);
});

test('a long suspended frame cannot fling insects outside a resized viewport', () => {
  const random = seeded(4);
  const flies = createFireflies(7, bounds, random);
  const mobile = { left: 18, right: 302, top: 20, bottom: 600 };
  stepFireflies(flies, 120, mobile, { x: 250, y: 100, lit: false }, 120, random);
  assert.ok(flies.every(fly => fly.x >= 18 && fly.x <= 302 && fly.y >= 20 && fly.y <= 600));
});

test('five fireflies stay in irregular lamp orbits while two remain free to roam', () => {
  const random = seeded(91);
  const flies = createFireflies(7, bounds, random);
  const lamp = { x: 1050, y: 130, lit: true };
  let nearSamples = 0;
  let samples = 0;
  for (let step = 0; step < 3600; step++) {
    stepFireflies(flies, 1 / 30, bounds, lamp, step / 30, random);
    if (step > 600) {
      samples++;
      nearSamples += flies.filter(fly => Math.hypot(fly.x - lamp.x, fly.y - lamp.y) < 120).length;
    }
  }
  assert.ok(nearSamples / samples > 4.3);
  assert.equal(flies.filter(fly => fly.mode === 'lamp').length, 5);
  assert.ok(flies.some(fly => Math.hypot(fly.x - lamp.x, fly.y - lamp.y) > 200));
});

test('head-anchored bubbles avoid the lamp and remain inside a mobile viewport', () => {
  const { placeMechanicBubble } = behaviour;
  assert.equal(typeof placeMechanicBubble, 'function');
  const result = placeMechanicBubble({ x: 300, y: 150 }, { width: 136, height: 52 }, { width: 390, height: 844, top: 80 }, { left: 275, top: 90, width: 80, height: 75 });
  assert.ok(result.left >= 8 && result.left + 136 <= 382);
  assert.ok(result.top >= 88 && result.top + 52 <= 836);
  assert.ok(result.left + 136 <= 275 || result.left >= 355 || result.top >= 165 || result.top + 52 <= 90);
  const moved = placeMechanicBubble({ x: 100, y: 450 }, { width: 136, height: 52 }, { width: 390, height: 844, top: 80 });
  assert.ok(Math.abs(moved.top + 52 - 450) < 20);
});

test('mechanic varies intentions and only welds unfinished projects', () => {
  const random = seeded(8);
  const cards = [{ id: 'beta', status: 'beta' }, { id: 'released', status: 'available' }];
  const kinds = new Set();
  let lastAction = '';
  for (let i = 0; i < 100; i++) {
    const action = chooseActivity({ cards, lampVisible: true, userIdleFor: 100, lastSwitchAgo: 200, lastAction }, random);
    assert.notEqual(action.kind, lastAction);
    kinds.add(action.kind);
    lastAction = action.kind;
    assert.equal(projectAction('available', random), 'inspect');
  }
  assert.ok(kinds.has('lamp') && kinds.has('project') && kinds.has('think') && kinds.has('rest'));
  const decisions = new Set(Array.from({length: 80}, () => projectAction('beta', random)));
  assert.ok(['weld', 'tighten', 'hammer', 'inspect', 'reconsider'].every(action => decisions.has(action)));
  let previous = 'weld';
  for (let i = 0; i < 80; i++) {
    const next = projectAction('beta', random, previous);
    assert.notEqual(next, previous);
    previous = next;
  }
});

test('speech is contextual, optional, nonrepeating and can be a thought', () => {
  const random = seeded(2);
  const kinds = new Set();
  let previous = '';
  let silence = 0;
  for (let i = 0; i < 100; i++) {
    const bubble = chooseBubble('weld', { projectName: 'Test project', lastText: previous }, random);
    if (!bubble) { silence++; continue; }
    assert.notEqual(bubble.text, previous);
    assert.ok(!/lights? (on|off)/i.test(bubble.text));
    previous = bubble.text;
    kinds.add(bubble.kind);
  }
  assert.ok(silence > 10 && silence < 90);
  assert.ok(kinds.has('thought') && kinds.has('speech'));
});

test('autonomous switching respects recent users, cooldowns and visibility', () => {
  const safe = { visible: true, idleFor: 60, lastSwitchAgo: 180 };
  assert.equal(canAutotoggleLamp(safe), true);
  assert.equal(canAutotoggleLamp({ ...safe, visible: false }), false);
  assert.equal(canAutotoggleLamp({ ...safe, idleFor: 10 }), false);
  assert.equal(canAutotoggleLamp({ ...safe, lastSwitchAgo: 30 }), false);
});
