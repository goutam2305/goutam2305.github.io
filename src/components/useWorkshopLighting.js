import { useEffect } from 'react';
import { getLightResponse } from '../workshopLighting';

const angleOf = element => {
  if (!element) return 0;
  const transform = getComputedStyle(element).transform;
  if (!transform || transform === 'none') return 0;
  const values = transform.slice(transform.indexOf('(') + 1, -1).split(',').map(Number);
  return Math.atan2(values[1], values[0]) * 180 / Math.PI;
};

export function useWorkshopLighting(sceneRef, lit, stopped) {
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    let objects = [];
    let frame = 0;
    let near = true;
    const refresh = () => { objects = [...scene.querySelectorAll('[data-light-surface], .tool-card')]; };
    const draw = () => {
      frame = 0;
      const bulb = scene.querySelector('.workshop-bulb-anchor');
      if (!bulb) return;
      const bounds = scene.getBoundingClientRect();
      const point = bulb.getBoundingClientRect();
      const angle = angleOf(scene.querySelector('.workshop-lamp-physics')) + angleOf(scene.querySelector('.workshop-lamp-swing'));
      const light = { x: point.left + point.width / 2 - bounds.left, y: point.top + point.height / 2 - bounds.top, angle };
      scene.style.setProperty('--light-x', `${light.x.toFixed(2)}px`);
      scene.style.setProperty('--light-y', `${light.y.toFixed(2)}px`);
      scene.style.setProperty('--light-angle', `${angle.toFixed(3)}deg`);
      scene.style.setProperty('--bulb-view-x', `${(point.left + point.width / 2).toFixed(2)}px`);
      scene.style.setProperty('--bulb-view-y', `${(point.top + point.height / 2).toFixed(2)}px`);
      scene.style.setProperty('--beam-view-x', `${(point.left + point.width / 2 - Math.sin(angle * Math.PI / 180) * 240).toFixed(2)}px`);
      scene.style.setProperty('--beam-view-y', `${(point.top + point.height / 2 + Math.cos(angle * Math.PI / 180) * 240).toFixed(2)}px`);
      scene.style.setProperty('--beam-x', `${(light.x - Math.sin(angle * Math.PI / 180) * 240).toFixed(2)}px`);
      scene.style.setProperty('--beam-y', `${(light.y + Math.cos(angle * Math.PI / 180) * 240).toFixed(2)}px`);
      for (const object of objects) {
        const box = object.getBoundingClientRect();
        const rect = { left: box.left - bounds.left, top: box.top - bounds.top, width: box.width, height: box.height };
        const response = lit ? getLightResponse(light, rect) : { intensity: 0, shadowX: 0, shadowY: 0, shadowOpacity: 0 };
        const mirrored = object.dataset.lightMirrored === 'true';
        const localX = light.x - rect.left - Math.sin(angle * Math.PI / 180) * 90;
        const maskX = (mirrored ? rect.width - localX : localX) - 180;
        object.style.setProperty('--lit-mask-x', `${maskX.toFixed(2)}px`);
        object.style.setProperty('--lit-mask-y', `${(light.y - rect.top - 12).toFixed(2)}px`);
        object.style.setProperty('--surface-x', `${((mirrored ? rect.width - localX : localX)).toFixed(2)}px`);
        object.style.setProperty('--surface-y', `${(light.y - rect.top + 220).toFixed(2)}px`);
        object.style.setProperty('--light-level', response.intensity.toFixed(3));
        object.style.setProperty('--shadow-x', `${(response.shadowX * (mirrored ? -1 : 1)).toFixed(2)}px`);
        object.style.setProperty('--shadow-y', `${response.shadowY.toFixed(2)}px`);
        object.style.setProperty('--shadow-alpha', response.shadowOpacity.toFixed(3));
      }
      if (lit && !stopped && near) frame = window.requestAnimationFrame(draw);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(draw); };
    refresh();
    draw();
    const mutation = window.MutationObserver ? new MutationObserver(() => { refresh(); schedule(); }) : null;
    mutation?.observe(scene, { childList: true, subtree: true });
    const visibility = window.IntersectionObserver ? new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (near) schedule();
    }, { rootMargin: '500px' }) : null;
    const lamp = scene.querySelector('.workshop-lamp-mount');
    if (lamp) visibility?.observe(lamp);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      mutation?.disconnect();
      visibility?.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule);
    };
  }, [sceneRef, lit, stopped]);
}
