import { useEffect, useState } from 'react';
import { clockAngles } from '../workshopHardware';
import { useWrenchPhysics } from './useWrenchPhysics';

const asset = name => `${import.meta.env?.BASE_URL ?? './'}assets/workshop/${name}`;

function SteamPipe({ stopped }) {
  const [steaming, setSteaming] = useState(false);
  useEffect(() => {
    let next;
    let end;
    setSteaming(false);
    if (!stopped) {
      const schedule = () => { next = window.setTimeout(() => {
        setSteaming(true);
        end = window.setTimeout(() => { setSteaming(false); schedule(); }, 2200);
      }, 5500 + Math.random() * 8000); };
      schedule();
    }
    return () => { window.clearTimeout(next); window.clearTimeout(end); };
  }, [stopped]);
  return <span className="hardware-pipe" data-steaming={steaming} aria-hidden="true">
    <span className="hardware-pipe-art" data-light-surface><span className="scene-lit" /></span>
    {steaming && <span className="pipe-steam" style={{ backgroundImage: `url("${asset('steam.png')}")` }} />}
  </span>;
}

function Wrench({ stopped, short, attention }) {
  const physics = useWrenchPhysics(stopped, element => {
    if (attention) attention.current = { element, until: performance.now() + 2400 };
  });
  return <button type="button" className={`workshop-wrench ${short ? 'wrench-short' : 'wrench-long'}`} ref={physics.mount} {...physics.handlers}
    aria-label={`Swing ${short ? 'short' : 'long'} wrench`} title="Drag and release, or nudge with arrow keys">
    <span className="wrench-sprite" data-light-surface aria-hidden="true"><span className="scene-lit" /></span>
  </button>;
}

function WorkshopClock({ stopped }) {
  const [date, setDate] = useState(() => new Date());
  useEffect(() => {
    let timer;
    const tick = () => { setDate(new Date()); if (!stopped) timer = window.setTimeout(tick, 1000 - Date.now() % 1000); };
    tick();
    return () => window.clearTimeout(timer);
  }, [stopped]);
  const angles = clockAngles(date);
  const art = { '--clock-art': `url("${asset('clock-parts.png')}")` };
  return <time className="hardware-clock" dateTime={date.toISOString()} aria-label={`Workshop clock, ${date.toLocaleTimeString()}`} style={art}>
    <span className="clock-pendulum" aria-hidden="true" />
    <span className="clock-face" aria-hidden="true" data-light-surface><span className="scene-lit" /></span>
    <span className="clock-hour clock-hand" aria-hidden="true" style={{ transform: `rotate(${angles.hour}deg)` }} />
    <span className="clock-minute clock-hand" aria-hidden="true" style={{ transform: `rotate(${angles.minute}deg)` }} />
    <span className="clock-second clock-hand" aria-hidden="true" style={{ transform: `rotate(${angles.second}deg)` }} />
    <span className="clock-pin" aria-hidden="true" />
  </time>;
}

export function WorkshopHardware({ stopped, attention }) {
  return <div className="workshop-hardware">
    <SteamPipe stopped={stopped} />
    <div className="hardware-tools">
      <span className="wrench-rack" aria-hidden="true" data-light-surface><span className="scene-lit" /></span>
      <Wrench stopped={stopped} attention={attention} /><Wrench stopped={stopped} attention={attention} short />
      <span className="wrench-pin wrench-pin-long" aria-hidden="true" />
      <span className="wrench-pin wrench-pin-short" aria-hidden="true" />
    </div>
    <WorkshopClock stopped={stopped} />
    <span className="hardware-bracket" aria-hidden="true" data-light-surface><span className="scene-lit" /></span>
  </div>;
}
