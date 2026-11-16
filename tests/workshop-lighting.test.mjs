import test from 'node:test';
import assert from 'node:assert/strict';
import { getLightResponse } from '../src/workshopLighting.js';

test('scene shadows point away from the lamp on either side', () => {
  const object = { left: 160, top: 160, width: 40, height: 50 };
  assert.ok(getLightResponse({ x: 100, y: 80, angle: 0 }, object).shadowX > 0);
  assert.ok(getLightResponse({ x: 260, y: 80, angle: 0 }, object).shadowX < 0);
});

test('a rightward lamp swing illuminates objects to its right', () => {
  const object = { left: 200, top: 230, width: 35, height: 50 };
  const right = getLightResponse({ x: 100, y: 100, angle: -35 }, object);
  const left = getLightResponse({ x: 100, y: 100, angle: 35 }, object);
  assert.ok(right.intensity > left.intensity * 1.7);
});

test('lighting falls off at distance and uses the nearest part of long scenery', () => {
  const light = { x: 1200, y: 120, angle: 0 };
  const rope = getLightResponse(light, { left: 20, top: 200, width: 1380, height: 40 });
  const far = getLightResponse(light, { left: 20, top: 2000, width: 40, height: 60 });
  assert.ok(rope.intensity > .5);
  assert.ok(far.intensity > 0 && far.intensity < .03);
  assert.ok(far.shadowOpacity < .03);
});

test('light fades continuously beyond the old cone endpoint', () => {
  const light = { x: 100, y: 0, angle: 0 };
  const at = y => getLightResponse(light, { left: 95, top: y, width: 10, height: 10 }).intensity;
  assert.ok(at(500) > .15, 'a wall surface beyond 460px still receives light');
  assert.ok(at(900) > 0 && at(900) < at(500));
  assert.ok(Math.abs(at(459) - at(461)) < .01);
});

test('a long rope casts its shadow below the illuminated section', () => {
  const response = getLightResponse({ x: 1200, y: 130, angle: 0 }, { left: 20, top: 190, width: 1400, height: 40 });
  assert.ok(response.shadowY > Math.abs(response.shadowX) * 2);
});

test('hardware above the shade receives only weak bounced light', () => {
  const response = getLightResponse({ x: 1250, y: 135, angle: 0 }, { left: 1220, top: 22, width: 190, height: 129 });
  assert.ok(response.intensity < .12);
});
