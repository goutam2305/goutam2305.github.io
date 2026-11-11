import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';

export function ToolCard({ project, index }) {
  return (
    <article className="tool-card">
      <a href={`#/tools/${project.id}`} className="tool-card-link" aria-labelledby={`title-${project.id}`}>
        <div className="tool-art">
          <img src={project.image} alt={project.imageAlt} width="1200" height="800" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} />
          <span className={`status-badge ${project.status}`}>{project.badge}</span>
        </div>
        <div className="tool-copy">
          <h2 id={`title-${project.id}`}>{project.name}</h2>
          <p className="tool-description">{project.description}</p>
          <div className="platforms">{project.platforms.map((platform) => <span key={platform} className="platform-tag">{platform}</span>)}</div>
          <p className="planned-platform">{project.plannedPlatforms.length ? `${project.plannedPlatforms.join(', ')} support planned` : '\u00a0'}</p>
          <span className="tool-link">View tool <ArrowUpRight size={20} weight="regular" aria-hidden="true" /></span>
        </div>
      </a>
    </article>
  );
}
