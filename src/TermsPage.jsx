import { termsSections, termsVersion } from './terms';
export function TermsPage() {
  return <article className="terms-page"><a className="back-link" href="#/">← All tools</a><p className="eyebrow">GOUTAM Lab · Version {termsVersion}</p><h1>Software terms</h1><p className="project-lead">For the free beta tools on this website. EasyViewer is a paid product, licensed only through Fab.</p>{termsSections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}<a className="documentation-button" href={`${import.meta.env?.BASE_URL ?? './'}docs/GOUTAM-Lab-Software-Terms.txt`} download>Download the terms</a></article>;
}
