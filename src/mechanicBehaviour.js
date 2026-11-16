export function ropeHeightAt(x, rope) {
  const u = Math.max(0, Math.min(1, (x - rope.left) / (rope.width || 1)));
  return rope.top + rope.height * (.12 + .7 * (1 - (u * 2 - 1) ** 2));
}

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const pick = (options, random) => options[Math.min(options.length - 1, Math.floor(random() * options.length))];

// Samples belong to a visit, not a frame or layout measurement.
export function chooseProjectVisit(previous, random = Math.random) {
  const zone = pick(['left', 'middle', 'right'].filter(zone => zone !== previous?.zone), random);
  const depthBand = pick([0, 1, 2].filter(band => band !== previous?.depthBand), random);
  const u = ({ left: .12, middle: .42, right: .72 })[zone] + random() * .16;
  const v = .15 + depthBand * .25 + random() * .2;
  return { zone, depthBand, u, v, facing: zone === 'left' ? 1 : zone === 'right' ? -1 : random() < .5 ? -1 : 1 };
}

export function projectVisitPoint(rect, viewport, rope, visit) {
  const x = clamp(rect.left + rect.width * visit.u, 35, viewport.width - 35);
  const bottom = Math.min(rect.bottom, viewport.height - 14);
  const top = Math.min(bottom, Math.max(rect.top + 80, viewport.canopyBottom + 90, ropeHeightAt(x, rope) + 90));
  return { x, y: top + (bottom - top) * visit.v };
}

export function lookAtPoint(head, target) {
  const dx = target.x - head.x;
  const dy = target.y - head.y;
  const facing = dx < 0 ? -1 : 1;
  const vertical = Math.abs(dy) > 36 && Math.abs(dy) > Math.abs(dx) * .3 ? dy < 0 ? 'up' : 'down' : '';
  if (Math.abs(dx) < 28) return { direction: vertical || 'front', facing: 1, sprite: vertical === 'up' ? 4 : vertical === 'down' ? 5 : 0 };
  return { direction: `${vertical ? `${vertical}-` : ''}${facing < 0 ? 'left' : 'right'}`, facing, sprite: vertical === 'up' ? 2 : vertical === 'down' ? 3 : 1 };
}

export function chooseIdleLook(previous, random = Math.random) {
  const direction = pick(['front', 'left', 'right', 'up', 'down'].filter(direction => direction !== previous?.direction), random);
  return { direction, facing: direction === 'left' ? -1 : 1, sprite: direction === 'front' ? pick([0, 6, 7], random) : direction === 'up' ? 4 : direction === 'down' ? 5 : 1, duration: 1800 + random() * 2700 };
}

export function canAutotoggleLamp({ visible, idleFor, lastSwitchAgo }) {
  return visible && idleFor >= 45 && lastSwitchAgo >= 120;
}

export function projectAction(status, random = Math.random, previous = '') {
  if (!['beta', 'development', 'in-progress'].includes(status)) return 'inspect';
  const choices = ['tighten', 'hammer', 'weld', 'inspect', 'adjust', 'reconsider'].filter(action => action !== previous);
  return choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
}

export function placeMechanicBubble(head, size, viewport, lamp) {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const candidates = [
    { left: head.x - size.width / 2, top: head.y - size.height - 12 },
    { left: head.x - size.width - 36, top: head.y - size.height / 2 },
    { left: head.x + 36, top: head.y - size.height / 2 },
    { left: head.x - size.width / 2, top: head.y + 30 },
  ].map(point => ({ left: clamp(point.left, 8, viewport.width - size.width - 8), top: clamp(point.top, viewport.top + 8, viewport.height - size.height - 8) }));
  const overlaps = p => lamp && p.left < lamp.left + lamp.width + 8 && p.left + size.width > lamp.left - 8 && p.top < lamp.top + lamp.height + 8 && p.top + size.height > lamp.top - 8;
  return candidates.find(point => !overlaps(point)) ?? candidates[0];
}

export function chooseActivity({ cards, lampVisible, userIdleFor, lastSwitchAgo, lastAction }, random = Math.random) {
  const choices = ['wander', 'think', 'rest', 'watch', 'adjust'];
  if (cards.length) choices.push('project', 'project', 'project');
  if (canAutotoggleLamp({ visible: lampVisible, idleFor: userIdleFor, lastSwitchAgo })) choices.push('lamp');
  const eligible = choices.filter(kind => kind !== lastAction);
  const kind = eligible[Math.min(eligible.length - 1, Math.floor(random() * eligible.length))];
  return { kind, targetId: kind === 'project' ? cards[Math.min(cards.length - 1, Math.floor(random() * cards.length))].id : undefined };
}

const lines = {
  tighten: ['A quarter turn…', 'That was a little loose.', 'Snug enough.', 'Easy does it.'],
  hammer: ['Just a gentle tap.', 'A little persuasion.', 'That fits better.', 'Measure twice.'],
  adjust: ['Better view now.', 'Ready for the next bit.', 'Safety first.'],
  weld: ['A tiny adjustment…', 'Steady hands.', 'One more little fix.', 'That should hold.', 'Making progress.'],
  inspect: ['Let’s have a look.', 'Hmm. Interesting.', 'Checking the details.', 'Looks promising.', 'How does this fit?'],
  reconsider: ['Maybe after a break.', 'Another way, perhaps…', 'I’ll come back to this.', 'Where did I leave that tool?'],
  think: ['Now, where was I?', 'I have an idea…', 'What if…', 'Something to try later.'],
  rest: ['Just a moment.', 'Good time for a breather.', 'Let that cool down.', 'A little pause.'],
  watch: ['Did you see that glow?', 'There they go again.', 'Busy little neighbours.'],
  wander: ['What’s over here?', 'Back in a moment.', 'Taking the scenic route.'],
  lampOn: ['A little light helps.', 'Much better.', 'Let’s see what we’re doing.'],
  lampOff: ['A change of atmosphere.', 'Let’s try it this way.', 'Giving the bulb a rest.'],
};

export function chooseBubble(action, { projectName, lit, lastText } = {}, random = Math.random) {
  if (random() < .42) return null;
  const source = action === 'lamp' ? lines[lit ? 'lampOff' : 'lampOn'] : lines[action];
  if (!source) return null;
  const options = source.filter(text => text !== lastText);
  if (projectName && action === 'inspect' && `${projectName}… let’s see.` !== lastText) options.push(`${projectName}… let’s see.`);
  return { text: options[Math.min(options.length - 1, Math.floor(random() * options.length))], kind: random() < .45 ? 'thought' : 'speech' };
}
