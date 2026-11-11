import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from '@phosphor-icons/react/dist/csr/ArrowUp';
import { Header } from './components/Header';
import { AboutPage, NotFoundPage, ProjectPage, ToolsPage } from './pages';
import { parseRoute } from './projects';
import { useTheme } from './useTheme';
import { DocumentationPage } from './DocumentationPage';
import { scrollToChapter } from './chapterNavigation';

export function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  const [filter, setFilter] = useState('all');
  const [theme, toggleTheme] = useTheme();
  const main = useRef(null);
  const firstRender = useRef(true);
  const route = parseRoute(hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => {
    const label = route.page === 'project' ? route.project.name : route.page === 'documentation' ? 'E-Z Topology documentation' : route.page === 'about' ? 'About' : route.page === 'not-found' ? 'Page not found' : 'Tools';
    document.title = `${label} — GOUTAM Lab`;
    if (firstRender.current) { firstRender.current = false; if (!(route.page === 'documentation' && route.section)) return; }
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.current?.focus({ preventScroll: true });
    if (route.page === 'documentation' && route.section) {
      const frame = window.requestAnimationFrame(() => scrollToChapter(route.section));
      return () => window.cancelAnimationFrame(frame);
    }
  }, [hash]);
  const backToTop = () => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
    main.current?.focus({ preventScroll: true });
  };
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); main.current?.focus(); }}>Skip to content</a>
      <Header page={route.page} theme={theme} toggleTheme={toggleTheme} />
      <main className="site-main" id="main-content" ref={main} tabIndex={-1}>
        <div className="page-view" key={route.page}>
        {route.page === 'tools' && <ToolsPage filter={filter} setFilter={setFilter} />}
        {route.page === 'project' && <ProjectPage project={route.project} />}
        {route.page === 'about' && <AboutPage />}
        {route.page === 'documentation' && <DocumentationPage section={route.section} />}
        {route.page === 'not-found' && <NotFoundPage />}
        </div>
      </main>
      <footer className="site-footer"><div className="footer-inner"><div className="footer-identity"><span className="footer-wordmark">GOUTAM Lab</span><small>© {new Date().getFullYear()} · Independent 3D tools.</small></div><button className="back-to-top" onClick={backToTop} aria-label="Back to top" title="Back to top"><span>Back to top</span><ArrowUp size={20} aria-hidden="true" /></button></div></footer>
    </div>
  );
}
