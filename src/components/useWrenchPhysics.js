import { useEffect, useRef } from 'react';
import { stepWrench } from '../workshopHardware';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function useWrenchPhysics(stopped, onInteract) {
  const mount = useRef(null);
  const state = useRef({ angle: 0, velocity: 0, frame: 0, time: 0, drag: null });
  const paint = () => mount.current?.style.setProperty('--wrench-angle', `${state.current.angle.toFixed(3)}deg`);
  const step = time => {
    const s = state.current;
    s.frame = 0;
    if (s.drag) return;
    stepWrench(s, s.time ? (time - s.time) / 1000 : 1 / 60);
    s.time = time;
    if (Math.abs(s.angle) + Math.abs(s.velocity) < .08) { s.angle = 0; s.velocity = 0; s.time = 0; }
    else s.frame = window.requestAnimationFrame(step);
    paint();
  };
  const settle = () => { state.current.time = 0; if (!state.current.frame) state.current.frame = window.requestAnimationFrame(step); };
  const reset = () => {
    const s = state.current;
    window.cancelAnimationFrame(s.frame);
    const drag = s.drag;
    s.drag = null;
    if (drag && mount.current?.hasPointerCapture?.(drag.id)) mount.current.releasePointerCapture(drag.id);
    Object.assign(s, { angle: 0, velocity: 0, frame: 0, time: 0 });
    mount.current?.removeAttribute('data-grabbed');
    paint();
  };
  useEffect(() => { if (stopped) reset(); }, [stopped]);
  useEffect(() => () => window.cancelAnimationFrame(state.current.frame), []);
  const release = event => {
    const s = state.current;
    if (s.drag?.id !== event.pointerId) return;
    const distance = s.drag.distance;
    s.drag = null;
    mount.current?.removeAttribute('data-grabbed');
    if (mount.current?.hasPointerCapture?.(event.pointerId)) mount.current.releasePointerCapture(event.pointerId);
    if (!stopped) { onInteract?.(mount.current); if (distance < 3) s.velocity = 60; settle(); }
  };
  return { mount, handlers: {
    onPointerDown: event => {
      const s = state.current;
      if (stopped || event.button !== 0 || s.drag) return;
      onInteract?.(event.currentTarget);
      event.preventDefault();
      const box = event.currentTarget.getBoundingClientRect();
      const pivotY = box.top + 15;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      event.currentTarget.focus({ preventScroll: true });
      event.currentTarget.setAttribute('data-pointer-focus', 'true');
      window.cancelAnimationFrame(s.frame); s.frame = 0;
      s.drag = { id: event.pointerId, startX: event.clientX, y: pivotY, pivot: box.left + box.width / 2, pointerAngle: Math.atan2(event.clientX - box.left - box.width / 2, Math.max(12, event.clientY - pivotY)) * 180 / Math.PI, startAngle: s.angle, previous: s.angle, time: event.timeStamp, distance: 0 };
      event.currentTarget.setAttribute('data-grabbed', 'true');
    },
    onPointerMove: event => {
      const s = state.current;
      const drag = s.drag;
      if (drag?.id !== event.pointerId) return;
      onInteract?.(event.currentTarget);
      const angle = Math.atan2(event.clientX - drag.pivot, Math.max(12, event.clientY - drag.y)) * 180 / Math.PI;
      s.angle = clamp(drag.startAngle - (angle - drag.pointerAngle), -44, 44);
      s.velocity = clamp((s.angle - drag.previous) / Math.max(.008, (event.timeStamp - drag.time) / 1000), -190, 190);
      drag.distance = Math.max(drag.distance, Math.abs(event.clientX - drag.startX));
      drag.previous = s.angle; drag.time = event.timeStamp;
      paint();
    },
    onPointerUp: release,
    onPointerCancel: event => { if (state.current.drag?.id === event.pointerId) reset(); },
    onLostPointerCapture: event => { if (state.current.drag?.id === event.pointerId) reset(); },
    onClick: event => { if (!event.detail && !stopped && !state.current.drag) { onInteract?.(event.currentTarget); state.current.velocity = 60; settle(); } },
    onKeyDown: event => {
      event.currentTarget.removeAttribute('data-pointer-focus');
      if (stopped || state.current.drag || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      onInteract?.(event.currentTarget);
      event.preventDefault(); state.current.velocity = clamp(state.current.velocity + (event.key === 'ArrowLeft' ? 65 : -65), -150, 150); settle();
    },
    onBlur: event => event.currentTarget.removeAttribute('data-pointer-focus'),
  } };
}
