import { useState } from 'react';
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { DownloadSimple } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import { SlidersHorizontal } from '@phosphor-icons/react/dist/csr/SlidersHorizontal';
import { BookOpen } from '@phosphor-icons/react/dist/csr/BookOpen';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/csr/ArrowSquareOut';
import { ToolCard } from './components/ToolCard';
import { ToolGuide } from './components/ToolGuide';
import { LibraryGuide } from './components/LibraryGuide';
import { DownloadButton } from './components/DownloadButton';
import { ProjectGallery } from './components/ProjectGallery';
import { filterProjects, getDownloadUrl, getStoreUrl, projects, tiers } from './projects';
import { about } from './about';
import { JourneyMap, JourneyCard } from './components/JourneyMap';

export function ToolsPage({ filter, setFilter }) {
  const visible = filterProjects(projects, filter);
  return (
    <>
      {visible.length ? tiers.map((tier) => {
        const items = visible.filter((project) => project.tier === tier.id);
        if (!items.length) return null;
        return (
          <section className="tier-section" key={tier.id} aria-labelledby={`tier-${tier.id}`} data-tier={tier.id}>
            <header className="tier-heading">
              <div><p className="eyebrow">{tier.eyebrow}</p><h2 id={`tier-${tier.id}`}>{tier.title} <span className="tier-count">{items.length}</span></h2></div>
              <p className="tier-note">{tier.note}</p>
            </header>
            <div className="project-grid">{items.map((project, index) => <ToolCard key={project.id} project={project} index={index} />)}</div>
          </section>
        );
      }) : (
        <div className="empty-state">
          <SlidersHorizontal size={30} weight="light" aria-hidden="true" />
          <h2>{filter === 'available' ? 'Getting ready to share.' : 'No tools in this view.'}</h2>
          <p>{filter === 'available' ? 'Public downloads are being prepared. Explore the tool previews and documentation while the builds are tested.' : 'The current tools are in beta. Show all tools to explore their previews.'}</p>
          <button className="text-button" onClick={() => { setFilter('all'); document.getElementById('tools-heading')?.focus(); }}>Show all tools <ArrowUpRight size={20} aria-hidden="true" /></button>
        </div>
      )}
    </>
  );
}

export function ProjectPage({ project }) {
  const download = getDownloadUrl(project);
  const store = getStoreUrl(project);
  return (
    <div className="project-page">
      <a className="back-link" href="#/"><ArrowLeft size={18} aria-hidden="true" /> All tools</a>
      <div className="project-intro">
        <div>
          <p className="eyebrow">{project.badge} / {project.platforms.join(', ')}</p>
          <h1>{project.name}</h1>
          <p className="project-lead">{project.introduction}</p>
          <div className="project-platforms">{project.platforms.map((platform) => <span className="platform-tag" key={platform}>{platform}</span>)}
            {project.plannedPlatforms.length > 0 && <span className="planned-inline">{project.plannedPlatforms.join(', ')} support planned</span>}
          </div>
          <div className="release-note">
            <a className="documentation-button" href={project.documentationUrl}><BookOpen size={20} aria-hidden="true" /> Read documentation</a>
            {store ? <a className="documentation-button store-button" href={store} target="_blank" rel="noopener noreferrer"><ArrowSquareOut size={20} aria-hidden="true" /> {project.storeLabel}</a> : download ? <DownloadButton key={project.id} project={project} /> : (
              <><span className="release-state"><DownloadSimple size={20} aria-hidden="true" /> {project.status === 'beta' ? 'Public download coming soon' : 'In development'}</span>
                <p>{project.status === 'beta' ? 'The first public build will be listed here when it is ready.' : 'Explore the preview. A public build is not available yet.'}</p></>
            )}
          </div>
        </div>
        <figure className="project-figure">
          <img src={project.image} alt={project.imageAlt} width="1200" height="800" fetchPriority="high" />
          <figcaption>{store ? 'Demo scene' : 'Illustrative preview'}</figcaption>
        </figure>
      </div>
      <ProjectGallery project={project} />
      <section className="project-features" aria-label="Highlights">
        {project.features.map(([title, text]) => <div key={title}><h2>{title}</h2><p>{text}</p></div>)}
      </section>
      <section className="support-note"><h2>Platform support</h2><p>{project.support}</p></section>
      {project.id === 'ez-topology' ? <ToolGuide /> : <LibraryGuide key={project.id} project={project} />}
    </div>
  );
}

export function AboutPage() {
  const [photoOk, setPhotoOk] = useState(true);
  const [selected, setSelected] = useState(about.journey.find((stop) => stop.now)?.id ?? about.journey[0].id);
  const index = about.journey.findIndex((stop) => stop.id === selected);
  const select = (id, reveal) => {
    setSelected(id);
    if (!reveal) return;
    const card = document.getElementById('journey-card');
    const rect = card?.getBoundingClientRect();
    if (rect && (rect.top < 0 || rect.bottom > window.innerHeight)) {
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      card.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' });
    }
  };
  return (
    <article className="about-page">
      <header className="about-hero">
        <div className="about-copy">
          <h1 className="about-title">About<br /><span>me</span></h1>
          <p className="about-lead">{about.lead}</p>
          {about.intro.map((text) => <p key={text}>{text}</p>)}
        </div>
        <figure className="about-photo player-card">
          <div className="player-bar"><span>Player 1</span><span className="player-blink">● Online</span></div>
          <div className="player-screen">
            {photoOk ? <img src={about.photo} alt={about.photoAlt} width="400" height="400" onError={() => setPhotoOk(false)} />
              : <div className="photo-placeholder" aria-label="Photo coming soon"><span>G</span><small>photo coming soon</small></div>}
          </div>
          <figcaption className="player-stats">
            <span><b>Gowthaman</b> aka Goutam</span>
            <span>Class: 3D artist · Tool maker</span>
            <span className="player-xp" aria-hidden="true"><i style={{ width: '72%' }} /></span>
          </figcaption>
        </figure>
        <JourneyCard stop={about.journey[index]} index={index} total={about.journey.length} />
      </header>

      <section className="about-section journey-section" aria-labelledby="journey-heading">
        <div className="journey-heading"><div><p className="eyebrow">The journey</p><h2 id="journey-heading">From engineer to tool maker.</h2></div><p className="tier-note">Pick a level on the map to read that chapter.</p></div>
        <JourneyMap stops={about.journey} selected={selected} onSelect={select} />
      </section>

      <section className="about-section" aria-labelledby="clock-heading">
        <p className="eyebrow">Off the clock</p>
        <h2 id="clock-heading">What keeps me curious.</h2>
        <p className="section-lead">Most of my free time still goes into making things, in 3D, in wood or with a soldering iron, with some sport and a good movie in between.</p>
        <div className="principles off-clock">{about.offClock.map(([title, text]) => <div key={title}><h3>{title}</h3><p>{text}</p></div>)}</div>
      </section>

      <section className="about-section about-next" aria-labelledby="next-heading">
        <p className="eyebrow">What’s next</p>
        <h2 id="next-heading">{about.next.title}</h2>
        {about.next.text.map((text) => <p key={text}>{text}</p>)}
        <a className="documentation-button" href="#/">See the tools <ArrowUpRight size={20} aria-hidden="true" /></a>
      </section>
    </article>
  );
}

export function NotFoundPage() {
  return <div className="empty-state"><p className="eyebrow">Page not found</p><h1>This page isn’t in the lab.</h1><p>Let’s get you back to the tools.</p><a className="back-link" href="#/"><ArrowLeft size={18} aria-hidden="true" /> All tools</a></div>;
}
