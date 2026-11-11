import { useRef, useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { toolGuide } from '../guide';
import { DemoPlayer } from './DemoPlayer';

export function SettingsTable({ rows, title = 'Settings' }) {
  return (
    <div className="settings-table-wrap">
      <table className="settings-table"><caption className="sr-only">{title}</caption>
        <thead><tr><th scope="col">Setting</th><th scope="col">What it does</th></tr></thead>
        <tbody>{rows.map(([name, text]) => <tr key={name}><th scope="row">{name}</th><td>{text}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function ToolInstructions({ tool, showNotes = true }) {
  return (
    <div className="tool-instructions">
      <h3>How to use it</h3>
      <ol>{tool.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <h3>Settings & controls</h3>
      <SettingsTable rows={tool.settings} title={`${tool.name} settings`} />
      {showNotes && <div className="tool-notes"><h3>Keep in mind</h3>{tool.notes.map((note) => <p key={note}>{note}</p>)}</div>}
    </div>
  );
}

export function ToolGuide() {
  const [selected, setSelected] = useState(toolGuide[0].id);
  const tabs = useRef(null);
  const tool = toolGuide.find((item) => item.id === selected);
  const navigate = (event) => {
    const index = toolGuide.findIndex((item) => item.id === selected);
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % toolGuide.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + toolGuide.length) % toolGuide.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = toolGuide.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      setSelected(toolGuide[next].id);
      tabs.current.querySelector(`#tool-tab-${toolGuide[next].id}`).focus();
    }
  };
  return (
    <section className="tool-guide" aria-labelledby="tool-guide-heading">
      <div className="section-heading"><div><p className="eyebrow">Inside the tool</p><h2 id="tool-guide-heading">See how it works.</h2></div><a className="back-link" href="#/docs/ez-topology">Full documentation <ArrowRight size={18} aria-hidden="true" /></a></div>
      <p className="guide-introduction">Choose a tool to see its recording, workflow and settings. The examples use the current 3ds Max beta.</p>
      <div className="guide-tabs" role="tablist" aria-label="E-Z Topology tools" ref={tabs} onKeyDown={navigate}>
        {toolGuide.map((item) => <button key={item.id} role="tab" id={`tool-tab-${item.id}`} aria-selected={selected === item.id}
          tabIndex={selected === item.id ? 0 : -1} aria-controls={`tool-panel-${item.id}`} onClick={() => setSelected(item.id)}>{item.name}</button>)}
      </div>
      <div className="guide-panel" key={tool.id} role="tabpanel" id={`tool-panel-${tool.id}`} aria-labelledby={`tool-tab-${tool.id}`} tabIndex={0}>
        <div className="guide-demo"><h3>{tool.name}</h3><p>{tool.summary}</p><DemoPlayer key={tool.id} id={tool.id} title={tool.name} /><p className="demo-result">{tool.result}</p>{tool.toolbar && <p className="tool-parent">This workflow uses the {tool.toolbar} tool.</p>}</div>
        <ToolInstructions tool={tool} />
      </div>
    </section>
  );
}
