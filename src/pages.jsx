import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { DownloadSimple } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import { SlidersHorizontal } from '@phosphor-icons/react/dist/csr/SlidersHorizontal';
import { FilterMenu } from './components/FilterMenu';
import { ToolCard } from './components/ToolCard';
import { filterProjects, getDownloadUrl, projects } from './projects';

export function ToolsPage({ filter, setFilter }) {
  const visible = filterProjects(projects, filter);
  return (
    <>
      <div className="gallery-heading">
        <div className="gallery-title"><h1 id="tools-heading" tabIndex={-1}>Tools</h1><span className="project-count" role="status" aria-live="polite">{visible.length} {visible.length === 1 ? 'project' : 'projects'}</span></div>
        <FilterMenu value={filter} onChange={setFilter} />
      </div>
      {visible.length ? (
        <div className="project-grid">{visible.map((project, index) => <ToolCard key={project.id} project={project} index={index} />)}</div>
      ) : (
        <div className="empty-state">
          <SlidersHorizontal size={30} weight="light" aria-hidden="true" />
          <h2>Getting ready to share.</h2>
          <p>Public downloads are being prepared. In the meantime, take a look at what’s in the lab.</p>
          <button className="text-button" onClick={() => { setFilter('all'); document.getElementById('tools-heading')?.focus(); }}>Show all tools <ArrowUpRight size={20} aria-hidden="true" /></button>
        </div>
      )}
    </>
  );
}

export function ProjectPage({ project }) {
  const download = getDownloadUrl(project);
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
            {download ? <a className="primary-button" href={download}><DownloadSimple size={20} aria-hidden="true" /> Download free</a> : (
              <><span className="release-state"><DownloadSimple size={20} aria-hidden="true" /> {project.status === 'beta' ? 'Public download coming soon' : 'In development'}</span>
                <p>{project.status === 'beta' ? 'The first public build will be listed here when it is ready.' : 'Explore the preview. A public build is not available yet.'}</p></>
            )}
          </div>
        </div>
        <figure className="project-figure">
          <img src={project.image} alt={project.imageAlt} width="1200" height="800" fetchPriority="high" />
          <figcaption>Illustrative preview</figcaption>
        </figure>
      </div>
      <section className="project-features" aria-label="Highlights">
        {project.features.map(([title, text]) => <div key={title}><h2>{title}</h2><p>{text}</p></div>)}
      </section>
      <section className="support-note"><h2>Platform support</h2><p>{project.support}</p></section>
    </div>
  );
}

export function AboutPage() {
  return (
    <article className="about-page">
      <p className="eyebrow">About the lab</p>
      <h1>Useful tools.<br />Made for 3D artists.</h1>
      <p className="about-lead">GOUTAM Lab is an independent home for practical 3D tools, experiments and the ideas behind them.</p>
      <p>The focus right now is <a href="#/tools/ez-topology">E-Z Topology</a>: a free retopology tool being built for 3ds Max. The aim is to make rebuilding a mesh feel clear, flexible and part of the artist’s everyday workflow.</p>
      <p>Alongside it, the lab is exploring ways to organise generated meshes into parts and bring local image-to-3D generation into the modeling process.</p>
      <p>Further ahead, I want to explore real-time rendering for DCC applications. For now, the work starts with better meshes.</p>
      <div className="about-bottom"><span>Independent work. Shared for free.</span><a href="https://github.com/goutam2305" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={18} aria-hidden="true" /></a></div>
    </article>
  );
}

export function NotFoundPage() {
  return <div className="empty-state"><p className="eyebrow">Page not found</p><h1>This page isn’t in the lab.</h1><p>Let’s get you back to the tools.</p><a className="back-link" href="#/"><ArrowLeft size={18} aria-hidden="true" /> All tools</a></div>;
}
