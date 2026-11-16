export function clockAngles(date) {
  const second = date.getSeconds();
  const minute = date.getMinutes() + second / 60;
  return { hour: ((date.getHours() % 12) + minute / 60) * 30, minute: minute * 6, second: second * 6 };
}

export function stepWrench(state, elapsed) {
  const dt = Math.max(0, Math.min(.032, elapsed));
  state.velocity += (-Math.sin(state.angle * Math.PI / 180) * 180 / Math.PI * 32 - state.velocity * 5) * dt;
  state.angle += state.velocity * dt;
  if (Math.abs(state.angle) > 48) { state.angle = Math.sign(state.angle) * 48; state.velocity *= -.2; }
}
