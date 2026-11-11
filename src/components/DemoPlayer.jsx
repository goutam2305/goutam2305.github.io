import { useEffect, useRef, useState } from 'react';
import { Play } from '@phosphor-icons/react/dist/csr/Play';
import { Pause } from '@phosphor-icons/react/dist/csr/Pause';
import manifest from '../demoManifest.json';
import { useMediaQuery } from '../useMediaQuery';

const localAsset = (name) => `${import.meta.env?.BASE_URL ?? './'}${name}`;

export function DemoPlayer({ id, title }) {
  const demo = manifest[id];
  const visual = useRef(null);
  const [inView, setInView] = useState(() => !window.IntersectionObserver);
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden');
  const [choice, setChoice] = useState(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const printing = useMediaQuery('print');
  const wantsMotion = choice ?? !reducedMotion;
  const playing = inView && visible && wantsMotion && !printing;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!window.IntersectionObserver || !visual.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= .12), { threshold: [0, .12] });
    observer.observe(visual.current);
    return () => observer.disconnect();
  }, [id]);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  if (!demo) return <div className="demo-pending"><p>A real 3ds Max recording for {title} is being prepared.</p></div>;
  return (
    <figure className="demo-player" data-playing={playing} data-paused={!wantsMotion}>
      <div className="demo-visual" ref={visual} style={{ aspectRatio: `${demo.width} / ${demo.height}` }}>
        {failed ? <p role="status">This recording could not be loaded. Try downloading the GIF below.</p> : (
          <img src={localAsset(playing ? demo.src : demo.poster)} width={demo.width} height={demo.height}
            alt={`${title}: ${demo.description}`} loading="lazy" onError={() => setFailed(true)} />
        )}
        {!failed && <button className="demo-motion-toggle" onClick={() => setChoice(!wantsMotion)}
          aria-label={`${wantsMotion ? 'Pause' : 'Resume'} ${title} animation`} title={wantsMotion ? 'Pause animation' : 'Resume animation'} aria-pressed={!wantsMotion}>
          {wantsMotion ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
        </button>}
      </div>
      <div className="demo-controls">
        <a href={localAsset(demo.src)} download={`E-Z-Topology-${id}.gif`}>Download GIF</a>
      </div>
      <figcaption>Recorded in 3ds Max 2026 · Scripted demonstration</figcaption>
    </figure>
  );
}
