import test from 'node:test';
import assert from 'node:assert/strict';
import * as hardware from '../src/workshopHardware.js';

test('clock hands represent the actual hour, minute and ticking second', () => {
  assert.equal(typeof hardware.clockAngles, 'function');
  const angles = hardware.clockAngles(new Date(2026, 10, 16, 12, 15, 30));
  assert.ok(Math.abs(angles.hour - 7.75) < 1e-10);
  assert.equal(angles.minute, 93);
  assert.equal(angles.second, 180);
});

test('a released hanging wrench loses energy and stays within safe angles', () => {
  assert.equal(typeof hardware.stepWrench, 'function');
  const state = { angle: 40, velocity: 180 };
  for (let i = 0; i < 600; i++) {
    hardware.stepWrench(state, 1 / 60);
    assert.ok(Math.abs(state.angle) <= 48);
  }
  assert.ok(Math.abs(state.angle) + Math.abs(state.velocity) < .1);
});
