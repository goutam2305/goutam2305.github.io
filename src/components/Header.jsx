import { Moon } from '@phosphor-icons/react/dist/csr/Moon';
import { Sun } from '@phosphor-icons/react/dist/csr/Sun';
import { useEffect, useRef, useState } from 'react';

export function Header({ page, theme, toggleTheme }) {
  const label = `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`;
  const header = useRef(null);
  const progress = useRef(null);
  const [cursorPaused, setCursorPaused] = useState(() => {
    try { return localStorage.getItem('goutam-lab-cursor-paused') === '1'; } catch { return false; }
  });
  const toggleCursor = () => {
    const paused = !cursorPaused;
    setCursorPaused(paused);
    try { localStorage.setItem('goutam-lab-cursor-paused', paused ? '1' : '0'); } catch { /* Still works without storage. */ }
  };
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      header.current?.classList.toggle('is-scrolled', window.scrollY > 24);
      if (progress.current) {
        const distance = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const fraction = distance ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0;
        progress.current.style.setProperty('--progress', fraction);
        progress.current.setAttribute('aria-valuenow', Math.round(fraction * 100));
      }
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const resize = window.ResizeObserver ? new ResizeObserver(schedule) : null;
    resize?.observe(document.body);
    schedule();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
      resize?.disconnect();
    };
  }, [page]);
  return (
    <header className="site-header" ref={header}>
      <div className="header-inner">
      <div className="brand-lockup"><a href="#/" className="wordmark" aria-label="GOUTAM Lab home">GOUTAM Lab</a>
        <button className="cursor-button" aria-label={`${cursorPaused ? 'Resume' : 'Pause'} logo cursor`} title={`${cursorPaused ? 'Resume' : 'Pause'} logo cursor`} aria-pressed={cursorPaused} onClick={toggleCursor}>
          <span className={`brand-cursor${cursorPaused ? ' cursor-paused' : ''}`} aria-hidden="true">_</span>
        </button>
      </div>
      <div className="header-actions">
        <nav aria-label="Main navigation">
          <a href="#/" aria-current={['tools', 'project', 'documentation'].includes(page) ? 'page' : undefined}>Tools</a>
          <a href="#/about" aria-current={page === 'about' ? 'page' : undefined}>About</a>
        </nav>
        <button className="icon-button theme-toggle" onClick={toggleTheme} aria-label={label} title={label} aria-pressed={theme === 'dark'}>
          {theme === 'light' ? <Moon size={23} weight="regular" /> : <Sun size={24} weight="regular" />}
        </button>
      </div>
      </div>
      {page === 'documentation' && <div className="reading-progress" ref={progress} role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}><span /></div>}
    </header>
  );
}
