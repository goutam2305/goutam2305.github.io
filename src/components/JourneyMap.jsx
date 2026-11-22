// Career journey drawn as a retro level map. Each stop is a button; the parent shows the selected stop.
const W = 1200;
const H = 300;

// Hand-placed stops (x in 0-1200, y in 0-300) so the trail wanders like an old game map.
const LAYOUT = [[90, 92], [245, 205], [395, 118], [550, 222], [700, 88], [830, 200], [1075, 112]];

function points(count) {
  if (count === LAYOUT.length) return LAYOUT.map(([x, y]) => ({ x, y }));
  const step = (W - 220) / (count - 1);
  return Array.from({ length: count }, (_, i) => ({ x: 110 + i * step, y: i % 2 ? 205 : 95 }));
}

// Right-angle path segments with a different bend point per leg, like pixel-map roads.
const BENDS = [0.35, 0.62, 0.5, 0.28, 0.7, 0.45];
function trail(pts) {
  return pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const bx = prev.x + (p.x - prev.x) * BENDS[(i - 1) % BENDS.length];
    return `${d} H ${bx} V ${p.y} H ${p.x}`;
  }, '');
}

export function JourneyMap({ stops, selected, onSelect }) {
  const pts = points(stops.length);
  const selectedIndex = stops.findIndex((stop) => stop.id === selected);
  const keyNavigate = (event, index) => {
    const next = ['ArrowRight', 'ArrowDown'].includes(event.key) ? Math.min(index + 1, stops.length - 1)
      : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? Math.max(index - 1, 0)
        : event.key === 'Home' ? 0 : event.key === 'End' ? stops.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    onSelect(stops[next].id, false);
    event.currentTarget.parentElement.querySelectorAll('.journey-stop')[next]?.focus();
  };
  return (
    <div className="journey-map">
      <svg className="journey-trail" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={trail(pts)} className="trail-base" />
        <path d={trail(pts.slice(0, selectedIndex + 1))} className="trail-walked" />
      </svg>
      <div className="journey-stops" role="tablist" aria-label="Career journey" aria-orientation="horizontal">
        {stops.map((stop, i) => (
          <button key={stop.id} type="button" role="tab" id={`stop-${stop.id}`}
            className={`journey-stop${stop.id === selected ? ' is-selected' : ''}${stop.now ? ' is-now' : ''}${i % 2 ? ' is-low' : ''}`}
            style={{ '--x': `${(pts[i].x / W) * 100}%`, '--y': `${(pts[i].y / H) * 100}%` }}
            aria-selected={stop.id === selected} aria-controls="journey-card" tabIndex={stop.id === selected ? 0 : -1}
            onClick={() => onSelect(stop.id, true)} onKeyDown={(event) => keyNavigate(event, i)}>
            <span className="stop-node" aria-hidden="true">{i + 1}</span>
            <span className="stop-label"><small>{stop.when}</small>{stop.short}</span>
            {stop.now && <span className="stop-here" aria-hidden="true">You are here</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function JourneyCard({ stop, index, total }) {
  return (
    <div className="journey-card" id="journey-card" role="tabpanel" aria-labelledby={`stop-${stop.id}`} aria-live="polite">
      <div className="journey-card-top"><span>Level {index + 1} / {total}</span><span>{stop.when} · {stop.place}</span></div>
      <div className="journey-card-body" key={stop.id}>
        <h2>{stop.title}</h2>
        <p className="journey-role">{stop.role}</p>
        <p>{stop.text}</p>
        <div className="journey-tags">{stop.tags.map((tag) => <span key={tag} className="platform-tag">{tag}</span>)}</div>
      </div>
    </div>
  );
}
