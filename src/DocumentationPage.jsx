import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { DownloadSimple } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import { Printer } from '@phosphor-icons/react/dist/csr/Printer';
import { DemoPlayer } from './components/DemoPlayer';
import { SettingsTable, ToolInstructions } from './components/ToolGuide';
import { feedback, gettingStarted, guideDate, guideVersion, limitations, sharedSettings, shortcuts, toolGuide, troubleshooting } from './guide';
import { scrollToChapter } from './chapterNavigation';

const localAsset = (name) => `${import.meta.env?.BASE_URL ?? './'}${name}`;
const chapterUrl = (id) => `#/docs/ez-topology?section=${id}`;
const chapters = [['getting-started', 'Getting started'], ['feedback', 'Viewport feedback'], ...toolGuide.map((tool) => [tool.id, tool.name]), ['settings', 'Shared settings'], ['shortcuts', 'Shortcut reference'], ['troubleshooting', 'Troubleshooting'], ['limits', 'Current limits']];

export function DocumentationPage({ section }) {
  return (
    <article className="documentation-page">
      <a className="back-link doc-back" href="#/tools/ez-topology"><ArrowLeft size={18} aria-hidden="true" /> E-Z Topology</a>
      <div className="doc-intro"><p className="eyebrow">User guide · Beta {guideVersion}</p><h1>E-Z Topology<br />documentation</h1><p>From your first quad to connected patches. A practical guide to the tools, settings and controls in the current 3ds Max beta.</p>
        <div className="doc-downloads">
          <a href={localAsset('docs/E-Z-Topology-Guide.md')} download><DownloadSimple size={18} aria-hidden="true" /> Download guide</a>
          <a href={localAsset('docs/E-Z-Topology-Guide.pdf')} download><DownloadSimple size={18} aria-hidden="true" /> PDF</a>
          <button onClick={() => window.print()}><Printer size={18} aria-hidden="true" /> Print</button>
        </div><small>3ds Max 2026 · Updated {guideDate} · Maya support is planned.</small>
      </div>
      <div className="doc-layout">
        <nav className="doc-toc" aria-label="Documentation chapters"><p>On this page</p>{chapters.map(([id, name]) => <a key={id} href={chapterUrl(id)} aria-current={section === id ? 'location' : undefined}
          onClick={(event) => { if (window.location.hash === chapterUrl(id)) { event.preventDefault(); scrollToChapter(id); } }}>{name}</a>)}</nav>
        <div className="doc-content">
          <section><h2 id="doc-getting-started" tabIndex={-1}>Getting started</h2><ol className="setup-steps">{gettingStarted.map(([title, text]) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}</ol><p className="doc-callout">Strips and paired rails create geometry automatically. A green patch is a preview: Enter confirms it. There is no separate Build Mesh button for everyday drawing.</p></section>
          <section><h2 id="doc-feedback" tabIndex={-1}>Read the viewport</h2><SettingsTable rows={feedback} title="Viewport feedback" /><p>Orbit with Alt + middle-drag, pan with middle-drag and zoom with the wheel. F / P / T / L / B keep their native 3ds Max view commands.</p></section>
          {toolGuide.map((tool) => <section className="doc-chapter" key={tool.id}><h2 id={`doc-${tool.id}`} tabIndex={-1}>{tool.name}</h2><p className="chapter-summary">{tool.summary}</p>{tool.toolbar && <p className="tool-parent">Use the {tool.toolbar} tool for this workflow.</p>}<DemoPlayer id={tool.id} title={tool.name} /><p className="demo-result">{tool.result}</p><ToolInstructions tool={tool} /></section>)}
          <section><h2 id="doc-settings" tabIndex={-1}>Shared settings</h2><p>Right-click the selected tool or click Settings. Open the collapsed Surface / Display section for these shared controls. Current-tool settings appear above it.</p><SettingsTable rows={sharedSettings} title="Surface and display settings" /><p>Press Enter or leave a numeric field to apply an edit. Esc discards an unconfirmed field edit and closes the popup. Irrelevant fields are hidden when switching tools.</p></section>
          <section><h2 id="doc-shortcuts" tabIndex={-1}>Shortcut reference</h2><SettingsTable rows={shortcuts} title="Keyboard and mouse shortcuts" /><p>Modifier gestures depend on the active tool. Custom tool-switch shortcuts are optional; reserved native commands cannot be overwritten.</p></section>
          <section><h2 id="doc-troubleshooting" tabIndex={-1}>Troubleshooting</h2>{troubleshooting.map(([title, text]) => <div className="troubleshooting-item" key={title}><h3>{title}</h3><p>{text}</p></div>)}</section>
          <section><h2 id="doc-limits" tabIndex={-1}>Current limits</h2><ul>{limitations.map((text) => <li key={text}>{text}</li>)}</ul><p className="documentation-note">The short examples are authentic captures from a separate 3ds Max test scene, using scripted input to the beta tools. They illustrate individual operations; they are not recordings of a complete production model.</p></section>
        </div>
      </div>
    </article>
  );
}
