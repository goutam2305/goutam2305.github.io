const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const between = (min, max, random) => min + (max - min) * random();

export function createFireflies(count, bounds, random = Math.random) {
  return Array.from({ length: count }, (_, i) => ({
    x: between(bounds.left, bounds.right, random), y: between(bounds.top, bounds.bottom, random),
    vx: 0, vy: 0, targetX: 0, targetY: 0, remaining: 0, mode: 'wander',
    phase: random() * Math.PI * 2, pace: between(24, 48, random), index: i,
  }));
}

// Independent, gently steered flights. Targets change instead of replaying a path.
export function stepFireflies(flies, elapsed, bounds, lamp, time, random = Math.random) {
  const dt = clamp(elapsed, 0, .05);
  const center = { x: bounds.left + (bounds.right - bounds.left) * (.5 + .22 * Math.sin(time * .045)), y: bounds.top + (bounds.bottom - bounds.top) * .42 };
  for (const fly of flies) {
    fly.remaining -= dt;
    const distance = Math.hypot(fly.targetX - fly.x, fly.targetY - fly.y);
    const orbiting = lamp.lit && (fly.index + Math.floor(time / 28)) % flies.length < Math.min(5, flies.length);
    if (orbiting) {
      const theta = fly.phase + time * (.42 + fly.index * .055) * (fly.index % 2 ? -1 : 1);
      const radius = 34 + fly.index * 5 + Math.sin(time * .7 + fly.phase) * 9;
      fly.mode = 'lamp';
      fly.targetX = clamp(lamp.x + Math.cos(theta) * radius, bounds.left, bounds.right);
      fly.targetY = clamp(lamp.y + 12 + Math.sin(theta) * radius * .68, bounds.top, bounds.bottom);
      fly.remaining = 0;
    } else if (fly.remaining <= 0 || distance < 14 || fly.mode === 'lamp') {
      const pick = random();
      fly.mode = pick > .78 ? 'gather' : 'wander';
      const aim = fly.mode === 'lamp' ? lamp : center;
      const spread = fly.mode === 'lamp' ? 70 : 110;
      fly.targetX = fly.mode === 'wander' ? between(bounds.left, bounds.right, random) : aim.x + between(-spread, spread, random);
      fly.targetY = fly.mode === 'wander' ? between(bounds.top, bounds.bottom, random) : aim.y + between(-spread * .6, spread * .8, random);
      fly.targetX = clamp(fly.targetX, bounds.left, bounds.right);
      fly.targetY = clamp(fly.targetY, bounds.top, bounds.bottom);
      fly.remaining = between(3, 9, random);
      fly.pace = between(22, 54, random);
    }
    const dx = fly.targetX - fly.x;
    const dy = fly.targetY - fly.y;
    const length = Math.hypot(dx, dy) || 1;
    const dart = Math.sin(time * 3.1 + fly.phase) * 9;
    const speed = (orbiting ? clamp(length * 3.2, 54, 360) : fly.pace) * (.8 + .2 * Math.sin(time * .7 + fly.phase));
    fly.vx += (dx / length * speed + dart - fly.vx) * Math.min(1, dt * 2.2);
    fly.vy += (dy / length * speed + Math.cos(time * 2.4 + fly.phase) * 11 - fly.vy) * Math.min(1, dt * 2.2);
    fly.x = clamp(fly.x + fly.vx * dt, bounds.left, bounds.right);
    fly.y = clamp(fly.y + fly.vy * dt, bounds.top, bounds.bottom);
  }
}
