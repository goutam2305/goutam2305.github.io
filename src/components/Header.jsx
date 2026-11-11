import { Moon } from '@phosphor-icons/react/dist/csr/Moon';
import { Sun } from '@phosphor-icons/react/dist/csr/Sun';

export function Header({ page, theme, toggleTheme }) {
  const label = `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`;
  return (
    <header className="site-header">
      <a href="#/" className="wordmark" aria-label="GOUTAM Lab home">GOUTAM Lab<span className="brand-cursor" aria-hidden="true">_</span></a>
      <div className="header-actions">
        <nav aria-label="Main navigation">
          <a href="#/" aria-current={page === 'tools' || page === 'project' ? 'page' : undefined}>Tools</a>
          <a href="#/about" aria-current={page === 'about' ? 'page' : undefined}>About</a>
        </nav>
        <button className="icon-button theme-toggle" onClick={toggleTheme} aria-label={label} title={label} aria-pressed={theme === 'dark'}>
          {theme === 'light' ? <Moon size={23} weight="regular" /> : <Sun size={24} weight="regular" />}
        </button>
      </div>
    </header>
  );
}
