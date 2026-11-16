import { useEffect, useRef } from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Only active drags and their settling motion request frames. No page re-render per frame.
export function useLampPhysics(stopped, toggleTheme) {
  const mount = useRef(null);
  const state = useRef({ angle: 0, velocity: 0, drop: 0, dropVelocity: 0, pull: 0, pullVelocity: 0, drag: null, frame: 0, time: 0, suppressUntil: 0 });
  const publish = () => {
    const s = state.current;
    const node = mount.current;
    if (!node) return;
    node.style.setProperty('--lamp-angle', `${s.angle.toFixed(3)}deg`);
    node.style.setProperty('--lamp-drop', `${s.drop.toFixed(3)}px`);
    node.style.setProperty('--cord-stretch', (1 + s.pull / 42).toFixed(4));
    node.style.setProperty('--cord-pull', `${s.pull.toFixed(3)}px`);
  };
  const settle = (time) => {
    const s = state.current;
    s.frame = 0;
    if (s.drag) return;
    const dt = s.time ? Math.min((time - s.time) / 1000, .032) : 1 / 60;
    s.time = time;
    s.velocity += (-Math.sin(s.angle * Math.PI / 180) * 180 / Math.PI * 24 - s.velocity * 4.3) * dt;
    s.angle += s.velocity * dt;
    if (Math.abs(s.angle) > 42) { s.angle = Math.sign(s.angle) * 42; s.velocity *= -.18; }
    s.dropVelocity += (-s.drop * 110 - s.dropVelocity * 17) * dt;
    s.drop += s.dropVelocity * dt;
    s.pullVelocity += (-s.pull * 145 - s.pullVelocity * 15) * dt;
    s.pull += s.pullVelocity * dt;
    publish();
    const energy = Math.abs(s.angle) + Math.abs(s.velocity) + Math.abs(s.drop) + Math.abs(s.dropVelocity) + Math.abs(s.pull) + Math.abs(s.pullVelocity);
    if (energy > .08) s.frame = window.requestAnimationFrame(settle);
    else {
      Object.assign(s, { angle: 0, velocity: 0, drop: 0, dropVelocity: 0, pull: 0, pullVelocity: 0, time: 0 });
      publish();
    }
  };
  const reset = () => {
    const s = state.current;
    if (s.frame) window.cancelAnimationFrame(s.frame);
    const drag = s.drag;
    s.drag = null;
    if (drag?.target.hasPointerCapture?.(drag.id)) drag.target.releasePointerCapture(drag.id);
    Object.assign(s, { angle: 0, velocity: 0, drop: 0, dropVelocity: 0, pull: 0, pullVelocity: 0, drag: null, frame: 0, time: 0 });
    mount.current?.removeAttribute('data-grabbed');
    publish();
  };
  useEffect(() => { if (stopped) reset(); }, [stopped]);
  useEffect(() => () => {
    if (state.current.frame) window.cancelAnimationFrame(state.current.frame);
  }, []);

  const start = (event, mode) => {
    if (stopped || event.button !== 0 || state.current.drag) return;
    const s = state.current;
    const rect = mount.current.getBoundingClientRect();
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setAttribute('data-pointer-focus', 'true');
    event.currentTarget.setPointerCapture?.(event.pointerId);
    if (s.frame) window.cancelAnimationFrame(s.frame);
    s.frame = 0;
    const anchorX = rect.left + rect.width * .494;
    s.drag = { id: event.pointerId, target: event.currentTarget, mode, x: event.clientX, y: event.clientY, scale: rect.width / (mount.current.offsetWidth || rect.width || 1) || 1, anchorX, anchorY: rect.top, startAngle: s.angle, startDrop: s.drop, startPull: s.pull, pointerAngle: Math.atan2(event.clientX - anchorX, Math.max(28, event.clientY - rect.top)) * 180 / Math.PI, lastAngle: s.angle, lastTime: event.timeStamp, moved: 0 };
    mount.current.setAttribute('data-grabbed', mode);
  };
  const move = (event) => {
    const s = state.current;
    const drag = s.drag;
    if (!drag || event.pointerId !== drag.id) return;
    const dx = (event.clientX - drag.x) / drag.scale;
    const dy = (event.clientY - drag.y) / drag.scale;
    drag.moved = Math.max(drag.moved, Math.hypot(event.clientX - drag.x, event.clientY - drag.y));
    const pointerAngle = Math.atan2(event.clientX - drag.anchorX, Math.max(28, event.clientY - drag.anchorY)) * 180 / Math.PI;
    const angle = drag.mode === 'cord' ? clamp(drag.startAngle - dx * .2, -14, 14) : clamp(drag.startAngle - (pointerAngle - drag.pointerAngle), -38, 38);
    const dt = Math.max(.008, (event.timeStamp - drag.lastTime) / 1000);
    s.velocity = clamp((angle - drag.lastAngle) / dt, -240, 240);
    s.angle = angle;
    s.drop = drag.mode === 'lamp' ? clamp(drag.startDrop + dy * .12, -4, 12) : drag.startDrop + clamp(dy * .04, 0, 2);
    s.pull = drag.mode === 'cord' ? clamp(drag.startPull + dy, 0, 30) : 0;
    drag.lastAngle = angle;
    drag.lastTime = event.timeStamp;
    publish();
  };
  const release = (event, cancelled = false) => {
    const s = state.current;
    const drag = s.drag;
    if (!drag || event.pointerId !== drag.id) return;
    s.drag = null;
    mount.current?.removeAttribute('data-grabbed');
    if (drag.target.hasPointerCapture?.(drag.id)) drag.target.releasePointerCapture(drag.id);
    if (cancelled || drag.moved > 4) {
      s.suppressUntil = performance.now() + 500;
      if (!cancelled && drag.mode === 'cord' && s.pull >= 12) toggleTheme();
    }
    s.time = 0;
    if (!stopped) s.frame = window.requestAnimationFrame(settle);
  };
  const activate = (event, mode) => {
    if (!event.detail) event.currentTarget.removeAttribute('data-pointer-focus');
    if (event.detail && state.current.drag) { event.preventDefault(); return; }
    if (event.detail && performance.now() < state.current.suppressUntil) { event.preventDefault(); return; }
    if (mode === 'cord') toggleTheme();
    else if (!event.detail && !stopped) {
      state.current.velocity = 70;
      state.current.time = 0;
      if (!state.current.frame) state.current.frame = window.requestAnimationFrame(settle);
    }
  };
  const nudge = event => {
    event.currentTarget.removeAttribute('data-pointer-focus');
    if (stopped || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    state.current.velocity = clamp(state.current.velocity + (event.key === 'ArrowLeft' ? 80 : -80), -180, 180);
    state.current.time = 0;
    if (!state.current.frame) state.current.frame = window.requestAnimationFrame(settle);
  };
  const handlers = mode => ({ onPointerDown: event => start(event, mode), onPointerMove: move, onPointerUp: event => release(event), onPointerCancel: event => release(event, true), onLostPointerCapture: event => release(event, true), onClick: event => activate(event, mode), onKeyDown: event => event.currentTarget.removeAttribute('data-pointer-focus'), onBlur: event => event.currentTarget.removeAttribute('data-pointer-focus') });
  const autoPull = () => {
    const s = state.current;
    if (stopped || s.drag) return false;
    if (s.frame) window.cancelAnimationFrame(s.frame);
    Object.assign(s, { pull: 24, pullVelocity: 0, drop: 2, velocity: 12, time: 0 });
    publish();
    toggleTheme();
    s.frame = window.requestAnimationFrame(settle);
    return true;
  };
  return { mount, nudge, autoPull, lampHandlers: handlers('lamp'), cordHandlers: handlers('cord') };
}
