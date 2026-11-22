import { useState } from 'react';
import { CaretLeft } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRight } from '@phosphor-icons/react/dist/csr/CaretRight';

// Screenshot gallery for a project page: one large image, previous / next, and a thumbnail strip.
export function ProjectGallery({ project }) {
  const items = project.gallery ?? [];
  const [index, setIndex] = useState(0);
  if (!items.length) return null;
  const go = (next) => setIndex((next + items.length) % items.length);
  const current = items[index];
  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
  };
  return (
    <section className="project-gallery" aria-roledescription="carousel" aria-labelledby="gallery-heading" onKeyDown={onKeyDown}>
      <div className="section-heading"><div><p className="eyebrow">Screenshots</p><h2 id="gallery-heading">See it in action.</h2></div>
        <span className="gallery-counter" aria-live="polite">{index + 1} / {items.length}</span></div>
      <div className="gallery-body">
      <div className="gallery-stage">
        <img key={current.src} src={current.src} alt={current.alt} width="1600" height="900" />
        <button type="button" className="gallery-nav prev" onClick={() => go(index - 1)} aria-label="Previous screenshot"><CaretLeft size={26} weight="bold" aria-hidden="true" /></button>
        <button type="button" className="gallery-nav next" onClick={() => go(index + 1)} aria-label="Next screenshot"><CaretRight size={26} weight="bold" aria-hidden="true" /></button>
      </div>
      </div>
      <div className="gallery-footer">
      <div className="gallery-caption"><h3>{current.title}</h3><p>{current.text}</p></div>
      <div className="gallery-thumbs" role="group" aria-label="Choose a screenshot">
        {items.map((item, i) => (
          <button key={item.src} type="button" className="gallery-thumb" aria-current={i === index ? 'true' : undefined}
            aria-label={`Screenshot ${i + 1}: ${item.title}`} onClick={() => setIndex(i)}>
            <img src={item.src} alt="" width="160" height="90" loading="lazy" />
          </button>
        ))}
      </div>
      </div>
    </section>
  );
}
