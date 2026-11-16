import { useLampPhysics } from './useLampPhysics';
import { useEffect } from 'react';

const asset = name => `${import.meta.env?.BASE_URL ?? './'}assets/workshop/${name}`;

export function WorkshopLamp({ theme, toggleTheme, stopped, lampControl }) {
  const lit = theme === 'dark';
  const physics = useLampPhysics(stopped, toggleTheme);
  useEffect(() => {
    if (!lampControl) return;
    lampControl.current = { pull: physics.autoPull };
    return () => { lampControl.current = null; };
  });
  const label = `Switch to ${lit ? 'light' : 'dark'} theme`;
  return (
    <div className="workshop-lamp-anchor">
      <div className="workshop-lamp-mount" ref={physics.mount} data-lit={lit}>
        <button className="workshop-lamp" type="button" {...physics.lampHandlers}
          onKeyDown={physics.nudge} aria-label="Swing workshop lamp" title="Grab the shade to swing it · use arrow keys to nudge">
          <span className="workshop-lamp-physics">
            <span className="workshop-lamp-swing">
              <span className="workshop-suspension" aria-hidden="true" />
              <span className="workshop-shade" aria-hidden="true" data-lit={lit}>
                <img src={asset(lit ? 'lamp-body-on.png' : 'lamp-body.png')} alt="" width="1536" height="1024" draggable="false" />
                <span className="workshop-bulb-anchor" />
              </span>
            </span>
          </span>
        </button>
        <div className="workshop-lamp-physics cord-hit-area">
          <button className="workshop-cord" type="button" {...physics.cordHandlers}
            aria-label={label} aria-pressed={lit} data-lit={lit}
            title="Pull the handle down to switch the light · Enter also works">
            <span className="workshop-pull-strand" aria-hidden="true" />
            <span className="workshop-pull-knob" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
