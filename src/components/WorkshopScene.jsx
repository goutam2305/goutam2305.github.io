import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../useMediaQuery';
import { WorkshopLamp } from './WorkshopLamp';
import { FilterMenu } from './FilterMenu';
import { useWorkshopLighting } from './useWorkshopLighting';
import { WorkshopFireflies } from './WorkshopFireflies';
import { WorkshopMechanic } from './WorkshopMechanic';
import { filterProjects, projects } from '../projects';
import { Header } from './Header';
import { WorkshopHardware } from './WorkshopHardware';

const asset = (name) => `${import.meta.env?.BASE_URL ?? './'}assets/workshop/${name}`;
const sceneArt = {
  '--rail-art': `url("${asset('ivy-rail.png')}")`,
  '--hardware-art': `url("${asset('hardware.png')}")`,
  '--wrench-art': `url("${asset('wrenches.png')}")`,
  '--rope-art': `url("${asset('rope.png')}")`,
  '--pavement-art': `url("${asset('pavement.png')}")`,
  '--wall-art': `url("${asset('wall.png')}")`,
  '--sprig-art': `url("${asset('ivy-sprig.png')}")`,
  '--glow-art': `url("${asset('lamp-glow.png')}")`,
  '--cord-art': `url("${asset('pull-cord.png')}")`,
  '--knob-art': `url("${asset('pull-knob.png')}")`,
};

export function useWorkshopMotion() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [hidden, setHidden] = useState(() => document.visibilityState === 'hidden');
  useEffect(() => {
    const update = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return { reduced, stopped: reduced || hidden };
}

function WorkshopRope({ stopped }) {
  const rope = useRef(null);
  const spring = useRef({ value: 0, velocity: 0, target: 0, time: 0, frame: 0, drag: null });
  const paint = () => rope.current?.style.setProperty('--rope-stretch', (1 + spring.current.value / 40).toFixed(4));
  const step = time => {
    const s = spring.current;
    s.frame = 0;
    const dt = s.time ? Math.min((time - s.time) / 1000, .032) : 1 / 60;
    s.time = time;
    s.velocity += ((s.target - s.value) * 100 - s.velocity * 12) * dt;
    s.value += s.velocity * dt;
    paint();
    if (Math.abs(s.target - s.value) + Math.abs(s.velocity) > .05) s.frame = window.requestAnimationFrame(step);
    else { s.value = s.target; s.velocity = 0; s.time = 0; paint(); }
  };
  const aim = value => {
    const s = spring.current;
    s.target = Math.max(-4, Math.min(22, value));
    if (!s.frame) { s.time = 0; s.frame = window.requestAnimationFrame(step); }
  };
  useEffect(() => {
    if (!stopped) return;
    const s = spring.current;
    if (s.frame) window.cancelAnimationFrame(s.frame);
    const drag = s.drag;
    s.drag = null;
    if (drag && rope.current?.hasPointerCapture?.(drag.id)) rope.current.releasePointerCapture(drag.id);
    Object.assign(s, { value: 0, velocity: 0, target: 0, frame: 0, time: 0 });
    paint();
  }, [stopped]);
  useEffect(() => () => { if (spring.current.frame) window.cancelAnimationFrame(spring.current.frame); }, []);
  const release = event => {
    const s = spring.current;
    if (s.drag && s.drag.id !== event.pointerId) return;
    s.drag = null;
    if (rope.current?.hasPointerCapture?.(event.pointerId)) rope.current.releasePointerCapture(event.pointerId);
    if (!stopped) aim(0);
  };
  return (
    <div className="workshop-rope" ref={rope} aria-hidden="true"
      onPointerDown={event => {
        if (stopped || event.button !== 0 || spring.current.drag) return;
        event.preventDefault();
        spring.current.drag = { id: event.pointerId, y: event.clientY, value: spring.current.value };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (stopped) return;
        const s = spring.current;
        if (s.drag && s.drag.id !== event.pointerId) return;
        if (s.drag) aim(s.drag.value + event.clientY - s.drag.y);
        else aim(Math.max(0, event.clientY - rope.current.getBoundingClientRect().top - 24) * .2);
      }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
      onPointerLeave={() => { if (!stopped && !spring.current.drag) aim(0); }}>
      <span className="workshop-rope-art" data-light-surface data-shadow-local><span className="scene-lit" /></span>
    </div>
  );
}

export function WorkshopScene({ children, theme, toggleTheme, motion, page, filter, onFilterChange }) {
  const scene = useRef(null);
  const lampControl = useRef(null);
  const attention = useRef(null);
  useWorkshopLighting(scene, theme === 'dark', motion.stopped);
  const count = filterProjects(projects, filter).length;
  return (
    <div className="workshop-scene" ref={scene} style={sceneArt} data-page={page}
      data-lit={theme === 'dark'} data-motion={motion.stopped ? 'paused' : 'running'}>
      <div className="workshop-wall" aria-hidden="true" />
      <div className="workshop-light-field" aria-hidden="true" />
      <div className="workshop-rail rail-left" aria-hidden="true" data-light-surface data-shadow-local>
        <span className="scene-lit" />
        {[8, 23, 39, 58, 76, 91].map((top, index) => <span className="workshop-ivy-sprig" key={top} style={{ top: `${top}%`, '--leaf-delay': `${index * -.7}s` }} />)}
      </div>
      <div className="workshop-rail rail-right" aria-hidden="true" data-light-surface data-shadow-local data-light-mirrored="true">
        <span className="scene-lit" />
        {[4, 19, 36, 52, 71, 89].map((top, index) => <span className="workshop-ivy-sprig" key={top} style={{ top: `${top}%`, '--leaf-delay': `${index * -.9}s` }} />)}
      </div>
      <div className="workshop-top">
      <Header page={page} />
      <div className="workshop-canopy">
      {page === 'tools' && <div className="gallery-heading">
        <div className="gallery-title"><h1 id="tools-heading" tabIndex={-1}>Tools</h1><span className="project-count" role="status" aria-live="polite">{count} {count === 1 ? 'project' : 'projects'}</span></div>
        <FilterMenu value={filter} onChange={onFilterChange} />
      </div>}
      <WorkshopHardware stopped={motion.stopped} attention={attention} />
      <WorkshopLamp theme={theme} toggleTheme={toggleTheme} stopped={motion.stopped} lampControl={lampControl} />
      <WorkshopRope stopped={motion.stopped} />
      </div>
      </div>
      <WorkshopFireflies sceneRef={scene} stopped={motion.stopped} page={page} />
      {page === 'tools' && <WorkshopMechanic sceneRef={scene} lampControl={lampControl} attention={attention} stopped={motion.stopped} theme={theme} />}
      {children}
      <div className="workshop-pavement" aria-hidden="true" data-light-surface data-shadow-local><span className="scene-lit" /></div>
    </div>
  );
}
