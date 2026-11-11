import { useState } from 'react';
import { Play } from '@phosphor-icons/react/dist/csr/Play';
import { Pause } from '@phosphor-icons/react/dist/csr/Pause';
import manifest from '../demoManifest.json';

const localAsset = (name) => `${import.meta.env?.BASE_URL ?? './'}${name}`;

export function DemoPlayer({ id, title }) {
  const demo = manifest[id];
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!demo) return <div className="demo-pending"><p>A real 3ds Max recording for {title} is being prepared.</p></div>;
  return (
    <figure className="demo-player">
      <div className="demo-visual" style={{ aspectRatio: `${demo.width} / ${demo.height}` }}>
        {failed ? <p role="status">This recording could not be loaded. Try downloading the GIF below.</p> : (
          <img src={localAsset(playing ? demo.src : demo.poster)} width={demo.width} height={demo.height}
            alt={`${title}: ${demo.description}`} loading="lazy" onError={() => setFailed(true)} />
        )}
      </div>
      <div className="demo-controls">
        <button className="demo-play-button" onClick={() => setPlaying(!playing)} aria-label={`${playing ? 'Pause' : 'Play'} ${title} demo`} aria-pressed={playing}>
          {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}{playing ? 'Pause demo' : 'Play demo'}
        </button>
        <a href={localAsset(demo.src)} download={`E-Z-Topology-${id}.gif`}>Download GIF</a>
      </div>
      <figcaption>Recorded in 3ds Max 2026 · Scripted demonstration</figcaption>
    </figure>
  );
}
