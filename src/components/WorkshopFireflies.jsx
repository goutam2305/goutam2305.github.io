import { useEffect, useRef } from 'react';
import { createFireflies, stepFireflies } from '../fireflyMotion';

const src = `${import.meta.env?.BASE_URL ?? './'}assets/workshop/firefly.png`;

export function WorkshopFireflies({ sceneRef, stopped, page }) {
  const layer = useRef(null);
  useEffect(() => {
    const scene = sceneRef.current;
    const nodes = [...layer.current.children];
    let frame = 0;
    let last = 0;
    let near = true;
    let bounds;
    let flies;
    const measure = () => {
      const header = document.querySelector('.site-header')?.getBoundingClientRect();
      const canopy = scene.querySelector('.workshop-canopy').getBoundingClientRect();
      bounds = { left: 24, right: Math.max(24, window.innerWidth - 24), top: Math.max(24, (header?.bottom ?? 80) + 6), bottom: page === 'tools' ? window.innerHeight - 24 : canopy.bottom - 8 };
      bounds.bottom = Math.max(bounds.top + 30, bounds.bottom);
    };
    const draw = time => {
      frame = 0;
      const dt = last ? (time - last) / 1000 : 0;
      last = time;
      const bulb = scene.querySelector('.workshop-bulb-anchor').getBoundingClientRect();
      stepFireflies(flies, dt, bounds, { x: bulb.left, y: bulb.top, lit: scene.dataset.lit === 'true' }, time / 1000);
      flies.forEach((fly, i) => {
        const node = nodes[i];
        node.style.transform = `translate3d(${fly.x.toFixed(2)}px,${fly.y.toFixed(2)}px,0) rotate(${(Math.sin(time / 800 + fly.phase) * 15).toFixed(1)}deg) scaleX(${fly.vx > 0 ? -1 : 1})`;
        node.style.setProperty('--fly-glow', (.25 + .75 * Math.pow((Math.sin(time / (700 + i * 90) + fly.phase) + 1) / 2, 3)).toFixed(3));
        node.dataset.flight = fly.mode;
      });
      if (!stopped && near) frame = window.requestAnimationFrame(draw);
    };
    const schedule = () => { measure(); if (!stopped && near && !frame) { last = 0; frame = window.requestAnimationFrame(draw); } };
    measure();
    flies = createFireflies(7, bounds);
    draw(0);
    const observer = window.IntersectionObserver ? new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (near) schedule();
      else if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
    }) : null;
    observer?.observe(scene);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => { window.cancelAnimationFrame(frame); observer?.disconnect(); window.removeEventListener('resize', schedule); window.removeEventListener('scroll', schedule); };
  }, [sceneRef, stopped, page]);
  return <div className="workshop-fireflies" ref={layer} aria-hidden="true">
    {Array.from({ length: 7 }, (_, i) => <span className="workshop-firefly" key={i} style={{ '--wing-delay': `${i * -.13}s` }}><img src={src} alt="" width="1402" height="1122" /><span className="firefly-glimmer" /></span>)}
  </div>;
}
