import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { canAutotoggleLamp, chooseActivity, chooseBubble, projectAction, ropeHeightAt, placeMechanicBubble, chooseProjectVisit, projectVisitPoint, lookAtPoint, chooseIdleLook } from '../mechanicBehaviour';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const src = `${import.meta.env?.BASE_URL ?? './'}assets/workshop/mechanic-helmeted.png`;
const extraSrc = `${import.meta.env?.BASE_URL ?? './'}assets/workshop/mechanic-activities.png`;
const gazeSrc = `${import.meta.env?.BASE_URL ?? './'}assets/workshop/mechanic-gaze.png`;

// A little resident, rather than a timeline: decisions occur on arrival and can
// change. Transforms stay outside React; only intentions and bubbles re-render.
export function WorkshopMechanic({ sceneRef, lampControl, attention, stopped, theme }) {
  const actor = useRef(null);
  const rope = useRef(null);
  const bubbleNode = useRef(null);
  const bubbleSize = useRef({ width: 160, height: 48 });
  const current = useRef({ theme });
  current.current = { theme };
  const memory = useRef({ lastHuman: performance.now(), lastSwitch: performance.now(), lastText: '', lastAction: '', visits: new Map(), theme });
  const simulation = useRef(null);
  const [view, setView] = useState({ action: 'rest', project: '', bubble: null });
  useLayoutEffect(() => {
    if (bubbleNode.current) bubbleSize.current = { width: bubbleNode.current.offsetWidth || 160, height: bubbleNode.current.offsetHeight || 48 };
  }, [view.bubble]);

  useEffect(() => {
    if (memory.current.theme !== theme) {
      memory.current.theme = theme;
      memory.current.lastSwitch = performance.now();
    }
  }, [theme]);

  useEffect(() => {
    const scene = sceneRef.current;
    let frame = 0;
    let previous = 0;
    let geometry;
    const saved = simulation.current;
    let route = saved?.route ?? [];
    let goal = saved?.goal ?? null;
    let hovered = saved?.hovered?.isConnected ? saved.hovered : null;
    let focused = document.activeElement?.closest?.('.tool-card');
    if (!scene.contains(focused)) focused = null;
    let activeRequest = focused || hovered;
    let mode = saved?.mode ?? 'rest';
    let finish = performance.now() + (saved?.remaining ?? 1800);
    let bubbleUntil = 0;
    let bubble = null;
    let pulled = saved?.pulled ?? false;
    let near = true;
    let facing = saved?.facing ?? 1;
    let idleLook = saved?.idleLook ?? { direction: 'front', facing: 1, sprite: 0 };
    let nextLook = performance.now() + 1800;
    let idleLookUntil = performance.now() + 1400;
    let poseTime = saved?.poseTime ?? 0;
    let position = saved?.position ?? { x: 0, y: 0 };
    const cards = () => [...scene.querySelectorAll('.tool-card[data-project-id]')];
    const visible = element => {
      const rect = element?.getBoundingClientRect();
      const floor = element?.classList.contains('tool-card') ? geometry?.canopyBottom ?? 260 : geometry?.headerBottom ?? 80;
      if (element?.classList.contains('tool-card') && rect && Math.min(rect.bottom, window.innerHeight - 14) - Math.max(rect.top, floor + 24) < 96) return false;
      return !!rect && rect.width > 0 && rect.bottom > floor + 24 && rect.top < window.innerHeight - 30;
    };
    const measure = () => {
      const bounds = { left: 0, top: 0, width: scene.getBoundingClientRect().width };
      const line = scene.querySelector('.workshop-rope').getBoundingClientRect();
      const lamp = scene.querySelector('.workshop-pull-knob').getBoundingClientRect();
      geometry = { bounds, width: bounds.width, height: window.innerHeight, canopyBottom: scene.querySelector('.workshop-canopy').getBoundingClientRect().bottom, headerBottom: document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 80, rope: { left: line.left, top: line.top, width: line.width, height: line.height }, lampX: lamp.left + lamp.width / 2, lampY: lamp.top + lamp.height / 2 };
    };
    const ropeY = x => ropeHeightAt(x, geometry.rope);
    const publish = () => {
      setView({ action: mode, project: goal?.card?.dataset.projectId ?? '', bubble });
    };
    const speak = action => {
      bubble = chooseBubble(action, { projectName: goal?.card?.dataset.projectName, lit: current.current.theme === 'dark', lastText: memory.current.lastText });
      if (bubble) { memory.current.lastText = bubble.text; bubbleUntil = performance.now() + 3300 + Math.random() * 1400; }
    };
    const enter = (action, duration = 2500, talk = true) => {
      mode = action;
      finish = performance.now() + duration;
      if (talk) speak(action);
      else bubble = null;
      publish();
    };
    const nextWork = status => {
      const next = projectAction(status, Math.random, memory.current.lastWork);
      memory.current.lastWork = next;
      return next;
    };
    const pointFor = (card, sample = goal.visit) => projectVisitPoint(card.getBoundingClientRect(), { width: geometry.width, height: window.innerHeight, canopyBottom: geometry.canopyBottom }, geometry.rope, sample);
    const go = (nextGoal, target) => {
      goal = { ...nextGoal, target };
      route = [];
      if (position.y > ropeY(position.x) + 3) route.push({ x: position.x, y: ropeY(position.x), phase: 'climb' });
      route.push({ x: target.x, y: ropeY(target.x), phase: 'walk' });
      if (Math.abs(target.y - ropeY(target.x)) > 3) route.push({ ...target, phase: 'climb' });
      enter(route[0].phase, 0, false);
    };
    const visit = (card, sample) => {
      if (!card?.isConnected) return;
      measure();
      if (!sample) {
        sample = chooseProjectVisit(memory.current.visits.get(card.dataset.projectId));
        memory.current.visits.set(card.dataset.projectId, sample);
      }
      go({ kind: 'project', card, visit: sample }, pointFor(card, sample));
    };
    const request = () => {
      const card = focused || hovered;
      if (card === activeRequest) return;
      activeRequest = card;
      if (card && !stopped && visible(card)) visit(card);
    };
    const cancelGoal = () => {
      goal = null;
      activeRequest = null;
      route = [];
      const x = clamp(position.x, 35, geometry.width - 35);
      go({ kind: 'wander' }, { x, y: ropeY(x) });
    };
    const arrive = () => {
      if (goal?.kind === 'project') {
        if (!goal.card.isConnected) { cancelGoal(); return; }
        // Even at a requested project he may inspect or reconsider instead of
        // welding. Completed projects can only receive an inspection.
        const action = nextWork(goal.card.dataset.projectStatus);
        // Hover lift can finish while travelling; settle at the same sampled
        // spot on the card's current surface before starting the work pose.
        goal.target = pointFor(goal.card);
        position = { ...goal.target };
        facing = goal.visit.facing;
        enter(action, 4300 + Math.random() * 3800);
      } else if (goal?.kind === 'lamp') {
        pulled = false;
        enter('lamp', 1500, false);
      } else enter(goal?.kind ?? 'rest', 2200 + Math.random() * 4000);
    };
    const decide = now => {
      const requested = focused || hovered;
      if (requested?.isConnected && visible(requested)) {
        if (goal?.card !== requested || Math.random() < .65 && mode !== 'think') visit(requested);
        else if (mode === 'think') enter(nextWork(requested.dataset.projectStatus), 4500 + Math.random() * 4000);
        else enter('think', 1400 + Math.random() * 2400);
        return;
      }
      measure();
      const candidates = cards().filter(visible);
      const choice = chooseActivity({ cards: candidates.map(card => ({ id: card.dataset.projectId, status: card.dataset.projectStatus })), lampVisible: visible(scene.querySelector('.workshop-lamp')), userIdleFor: (now - memory.current.lastHuman) / 1000, lastSwitchAgo: (now - memory.current.lastSwitch) / 1000, lastAction: memory.current.lastAction });
      memory.current.lastAction = choice.kind;
      if (choice.kind === 'project') { visit(candidates.find(card => card.dataset.projectId === choice.targetId)); return; }
      if (choice.kind === 'lamp') {
        const x = clamp(geometry.lampX - 25, 35, geometry.width - 35);
        go({ kind: 'lamp' }, { x, y: Math.max(geometry.lampY + 62, ropeY(x)) }); return;
      }
      const x = choice.kind === 'wander' ? 40 + Math.random() * Math.max(0, geometry.width - 80) : clamp(position.x, 35, geometry.width - 35);
      go({ kind: choice.kind }, { x, y: ropeY(x) });
    };
    const attentionTarget = time => {
      const request = attention?.current;
      if (stopped || !(request?.until > time) || !request.element?.isConnected) return null;
      const rect = request.element.getBoundingClientRect();
      return rect.width && rect.height ? request.element : null;
    };
    const paint = time => {
      if (!stopped) poseTime = time;
      actor.current.style.transform = `translate3d(${(position.x - 32).toFixed(2)}px,${(position.y - 88).toFixed(2)}px,0)`;
      if (bubbleNode.current) {
        const head = { x: position.x, y: position.y - 60 };
        const lamp = scene.querySelector('.workshop-shade').getBoundingClientRect();
        const point = placeMechanicBubble(head, bubbleSize.current, { width: geometry.width, height: window.innerHeight, top: geometry.headerBottom }, lamp);
        bubbleNode.current.style.transform = `translate3d(${point.left.toFixed(2)}px,${point.top.toFixed(2)}px,0)`;
        bubbleNode.current.style.setProperty('--bubble-tail', `${clamp(head.x - point.left - 4, 10, bubbleSize.current.width - 16)}px`);
        bubbleNode.current.dataset.placement = point.left + bubbleSize.current.width < head.x ? 'left' : point.left > head.x ? 'right' : point.top > head.y ? 'below' : 'above';
      }
      const noticed = attentionTarget(time);
      let look = null;
      if (noticed && !['climb', 'lamp'].includes(mode)) {
        const target = noticed.getBoundingClientRect();
        look = lookAtPoint({ x: position.x, y: position.y - 60 }, { x: target.left + target.width / 2, y: target.top + target.height / 2 });
      } else if (!route.length && ['rest', 'think', 'watch', 'reconsider', 'wander'].includes(mode)) {
        if (!stopped && time >= nextLook) { idleLook = chooseIdleLook(idleLook); nextLook = time + idleLook.duration; idleLookUntil = time + 900 + Math.random() * 800; }
        if (time < idleLookUntil) look = idleLook;
      }
      actor.current.dataset.looking = String(!!look);
      actor.current.dataset.look = look?.direction ?? (facing < 0 ? 'left' : 'right');
      actor.current.dataset.attention = noticed ? 'wrench' : '';
      actor.current.dataset.workZone = goal?.visit?.zone ?? '';
      actor.current.style.setProperty('--facing', look?.facing ?? facing);
      const cycle = Math.floor(poseTime / 360) % 2;
      const extra = ['tighten', 'hammer', 'inspect', 'adjust', 'rest'].includes(mode);
      const sprite = look ? look.sprite : extra ? mode === 'tighten' ? cycle : mode === 'hammer' ? 2 + cycle : mode === 'inspect' ? 4 : mode === 'adjust' ? 5 : 6 + Math.floor(poseTime / 900) % 2 : mode === 'walk' ? 1 + Math.floor(poseTime / 170) % 2 : mode === 'climb' ? 4 + Math.floor(poseTime / 210) % 2 : mode === 'weld' ? 6 : mode === 'lamp' ? 7 : ['think', 'reconsider', 'watch'].includes(mode) ? 3 : 0;
      actor.current.style.setProperty('--mechanic-art', `url("${look ? gazeSrc : extra ? extraSrc : src}")`);
      actor.current.style.setProperty('--sprite-x', `${(sprite % 4) * 100 / 3}%`);
      actor.current.style.setProperty('--sprite-y', sprite >= 4 ? '100%' : '0%');
      const down = position.y > ropeY(position.x) + 4;
      rope.current.style.display = down ? 'block' : 'none';
      rope.current.style.left = `${position.x}px`;
      rope.current.style.top = `${ropeY(position.x)}px`;
      rope.current.style.height = `${Math.max(0, position.y - ropeY(position.x) - 18)}px`;
    };
    const step = time => {
      frame = 0;
      if (stopped || !near) return;
      const dt = previous ? Math.min((time - previous) / 1000, .04) : 0;
      previous = time;
      if (goal?.card && (!goal.card.isConnected || !visible(goal.card))) {
        hovered = null; focused = null; cancelGoal();
      }
      const noticed = attentionTarget(time);
      if (noticed && ['climb', 'lamp'].includes(mode)) {
        // Keep the invitation until his hands are free to glance safely.
        attention.current.until = Math.max(attention.current.until, time + 1400);
      }
      if (noticed && !['climb', 'lamp'].includes(mode)) {
        // Notice the visitor without abandoning or shortening the current job.
        finish += dt * 1000;
      } else if (route.length) {
        const target = route[0];
        const dx = target.x - position.x;
        const dy = target.y - position.y;
        const distance = Math.hypot(dx, dy);
        const speed = target.phase === 'walk' ? 185 : Math.min(430, 155 + distance * .15);
        if (dx) facing = dx > 0 ? 1 : -1;
        else if (goal?.visit) facing = goal.visit.facing;
        if (distance <= speed * dt + .5) {
          position = { x: target.x, y: target.y };
          route.shift();
          if (route.length) enter(route[0].phase, 0, false);
          else arrive();
        } else { position.x += dx / distance * speed * dt; position.y += dy / distance * speed * dt; }
        if (target.phase === 'walk') position.y = ropeY(position.x);
      } else if (mode === 'lamp' && !pulled && time >= finish - 650) {
        pulled = true;
        const safe = canAutotoggleLamp({ visible: visible(scene.querySelector('.workshop-lamp')), idleFor: (time - memory.current.lastHuman) / 1000, lastSwitchAgo: (time - memory.current.lastSwitch) / 1000 });
        if (safe && lampControl.current?.pull()) {
          memory.current.lastSwitch = time;
          speak('lamp');
          // Let the lamp action finish before the next route clears its bubble.
          finish = time + (bubble ? 3000 : 900);
          publish();
        }
        else enter('reconsider', 2200);
      } else if (time >= finish) decide(time);
      if (bubble && time > bubbleUntil) { bubble = null; publish(); }
      paint(time);
      frame = window.requestAnimationFrame(step);
    };
    const over = event => {
      const card = event.target.closest?.('.tool-card');
      if (card) { hovered = card; request(); }
    };
    const out = event => {
      if (hovered && !hovered.contains(event.relatedTarget)) hovered = null;
      request();
    };
    const focusIn = event => { focused = event.target.closest?.('.tool-card'); request(); };
    const focusOut = event => { if (!focused?.contains(event.relatedTarget)) focused = null; request(); };
    const human = () => { memory.current.lastHuman = performance.now(); };
    const changed = () => {
      measure();
      if (hovered && !hovered.isConnected) hovered = null;
      if (focused && !focused.isConnected) focused = null;
      if (goal?.card && !goal.card.isConnected) cancelGoal();
      else if (goal?.card) {
        const target = pointFor(goal.card);
        if (!goal.target || Math.hypot(target.x - goal.target.x, target.y - goal.target.y) > 3) visit(goal.card, goal.visit);
      }
    };
    const resized = () => {
      const { width, height } = geometry;
      measure();
      if (Math.abs(width - geometry.width) < 1 && height === geometry.height) { paint(performance.now()); return; }
      position.x = clamp(position.x, 35, geometry.width - 35);
      position.y = Math.min(position.y, geometry.height - 14);
      if (goal?.card?.isConnected && visible(goal.card)) {
        if (route.length) visit(goal.card, goal.visit);
        else { goal.target = pointFor(goal.card); position = { ...goal.target }; }
      }
      else cancelGoal();
      paint(performance.now());
    };
    const scrolled = () => {
      measure();
      const requested = focused || hovered;
      if (!stopped && requested?.isConnected && visible(requested) && goal?.card !== requested) {
        activeRequest = requested;
        visit(requested);
      }
      if (goal?.card) {
        if (!goal.card.isConnected || !visible(goal.card)) { hovered = null; focused = null; cancelGoal(); }
        else {
          const target = pointFor(goal.card);
          goal.target = target;
          if (!route.length) position = { ...target };
          else {
            const last = route[route.length - 1];
            if (last.phase === 'climb') Object.assign(last, target);
          }
        }
      } else if (!route.length) position.y = ropeY(position.x);
      paint(performance.now());
    };
    measure();
    if (!saved) {
      const x = clamp(geometry.lampX - 100, 40, geometry.width - 40);
      position = { x, y: ropeY(x) };
    }
    if (activeRequest && goal?.card !== activeRequest && !stopped) visit(activeRequest);
    paint(0);
    publish();
    const observer = window.IntersectionObserver ? new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (!near) { window.cancelAnimationFrame(frame); frame = 0; }
      else if (!stopped && !frame) { previous = 0; frame = window.requestAnimationFrame(step); }
    }) : null;
    observer?.observe(scene);
    const mutation = new MutationObserver(changed);
    const gallery = scene.querySelector('.site-main');
    if (gallery) mutation.observe(gallery, { childList: true, subtree: true });
    const layout = window.ResizeObserver ? new ResizeObserver(changed) : null;
    if (gallery) layout?.observe(gallery);
    scene.addEventListener('pointerover', over);
    scene.addEventListener('pointerout', out);
    scene.addEventListener('focusin', focusIn);
    scene.addEventListener('focusout', focusOut);
    for (const name of ['pointerdown', 'keydown', 'pointermove', 'wheel', 'touchstart', 'touchmove']) window.addEventListener(name, human, { passive: true });
    window.addEventListener('resize', resized);
    window.addEventListener('scroll', scrolled, { passive: true });
    if (!stopped) frame = window.requestAnimationFrame(step);
    return () => {
      simulation.current = { position: { ...position }, route: [...route], goal, mode, hovered, pulled, facing, idleLook, poseTime, remaining: stopped ? saved?.remaining ?? 1800 : Math.max(0, finish - performance.now()) };
      window.cancelAnimationFrame(frame);
      observer?.disconnect(); mutation.disconnect(); layout?.disconnect();
      scene.removeEventListener('pointerover', over); scene.removeEventListener('pointerout', out);
      scene.removeEventListener('focusin', focusIn); scene.removeEventListener('focusout', focusOut);
      for (const name of ['pointerdown', 'keydown', 'pointermove', 'wheel', 'touchstart', 'touchmove']) window.removeEventListener(name, human);
      window.removeEventListener('resize', resized);
      window.removeEventListener('scroll', scrolled);
    };
  }, [sceneRef, lampControl, attention, stopped]);

  return <div className="workshop-actors">
    <span className="mechanic-drop-rope" ref={rope} aria-hidden="true" />
    <div className="workshop-mechanic" ref={actor} data-action={view.action} data-project={view.project} aria-hidden="true">
      <span className="mechanic-sprite" />
      <span className="mechanic-sparks"><i /><i /><i /><i /></span>
    </div>
    {view.bubble && <span ref={bubbleNode} className={`mechanic-bubble ${view.bubble.kind}`}>{view.bubble.text}</span>}
  </div>;
}
