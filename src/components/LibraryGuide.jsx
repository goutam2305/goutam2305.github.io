import { useState } from 'react';
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { DownloadSimple } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import { Printer } from '@phosphor-icons/react/dist/csr/Printer';
import { libraryGuides } from '../libraryGuides';
import { ToolInstructions } from './ToolGuide';
import { scrollToChapter } from '../chapterNavigation';

const localAsset = (path) => `${import.meta.env?.BASE_URL ?? './'}${path}`;

export function LibraryGuide({ project }) {
  const guide = libraryGuides[project.id];
  const [selected, setSelected] = useState(guide.sections[0].id);
  const section = guide.sections.find((item) => item.id === selected) ?? guide.sections[0];
  const keyNavigate = (event) => {
    const index = guide.sections.findIndex((item) => item.id === section.id);
    const next = event.key === 'ArrowRight' ? (index + 1) % guide.sections.length
      : event.key === 'ArrowLeft' ? (index - 1 + guide.sections.length) % guide.sections.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? guide.sections.length - 1 : null;
    if (next !== null) {
      event.preventDefault();
      setSelected(guide.sections[next].id);
      event.currentTarget.querySelector(`[data-chapter="${guide.sections[next].id}"]`)?.focus();
    }
  };
  return (
    <section className="tool-guide" aria-labelledby="library-guide-heading">
      <div className="section-heading"><div><p className="eyebrow">Inside the tool</p><h2 id="library-guide-heading">Find your workflow.</h2></div><a className="back-link" href={project.documentationUrl}>Full documentation <ArrowRight size={18} aria-hidden="true" /></a></div>
      <p className="guide-introduction">{guide.introduction}</p>
      <div className="guide-tabs" role="tablist" aria-label={`${project.name} workflows`} onKeyDown={keyNavigate}>
        {guide.sections.map((item) => <button key={item.id} role="tab" id={`library-tab-${item.id}`} data-chapter={item.id}
          aria-selected={section.id === item.id} aria-controls={`library-panel-${item.id}`} tabIndex={section.id === item.id ? 0 : -1}
          onClick={() => setSelected(item.id)}>{item.name}</button>)}
      </div>
      <div className="guide-panel" role="tabpanel" id={`library-panel-${section.id}`} aria-labelledby={`library-tab-${section.id}`} tabIndex={0}>
        <div className="guide-demo"><h3>{section.name}</h3><p>{section.summary}</p><a className="back-link" href={`${project.documentationUrl}?section=${section.id}`}>Read this chapter <ArrowRight size={18} aria-hidden="true" /></a>
          {guide.comingSoon.length > 0 && <p className="tool-notes">Coming soon: {guide.comingSoon.join(' and ').toLowerCase()}. These features are not available in this beta.</p>}
        </div><ToolInstructions tool={section} />
      </div>
    </section>
  );
}

export function LibraryDocumentationPage({ project, section }) {
  const guide = libraryGuides[project.id];
  const chapterUrl = (id) => `${project.documentationUrl}?section=${id}`;
  return (
    <article className="documentation-page">
      <a className="back-link doc-back" href={`#/tools/${project.id}`}><ArrowLeft size={18} aria-hidden="true" /> {project.name}</a>
      <div className="doc-intro"><p className="eyebrow">User guide · {guide.platform ?? '3ds Max 2026'}</p><h1>{project.name}<br />documentation</h1><p>{guide.introduction}</p>
        <div className="doc-downloads"><a href={localAsset(guide.document)} download><DownloadSimple size={18} aria-hidden="true" /> Download guide</a><button onClick={() => window.print()}><Printer size={18} aria-hidden="true" /> Print</button></div>
        <small>{guide.installNote ?? <>Download the free MZP from the <a href={`#/tools/${project.id}`}>tool page</a>. Accept the software terms, then drag the file into Max to install.</>}</small>
      </div>
      <div className="doc-layout"><nav className="doc-toc" aria-label="Documentation chapters"><p>On this page</p>{guide.sections.map((item) => <a key={item.id} href={chapterUrl(item.id)} aria-current={section === item.id ? 'location' : undefined}
        onClick={(event) => { if (window.location.hash === chapterUrl(item.id)) { event.preventDefault(); scrollToChapter(item.id); } }}>{item.name}</a>)}</nav>
        <div className="doc-content">{guide.sections.map((item) => <section className="doc-chapter" key={item.id}><h2 id={`doc-${item.id}`} tabIndex={-1}>{item.name}</h2><p className="chapter-summary">{item.summary}</p><ToolInstructions tool={item} /></section>)}
          {guide.comingSoon.length > 0 && <section><h2>Coming soon</h2><ul>{guide.comingSoon.map((name) => <li key={name}>{name} — not available in this beta.</li>)}</ul></section>}
        </div>
      </div>
    </article>
  );
}
