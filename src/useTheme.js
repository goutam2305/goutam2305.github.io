import { useEffect, useRef, useState } from 'react';
import { getInitialTheme } from './projects';

function storedTheme() {
  try { return localStorage.getItem('goutam-lab-theme'); } catch { return null; }
}

export function useTheme() {
  const explicitPreference = useRef(null);
  const [theme, setTheme] = useState(() => {
    let storage;
    try { storage = window.localStorage; } catch { /* Optional preference. */ }
    return getInitialTheme(storage, window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const followSystem = () => {
      if (!explicitPreference.current && !['light', 'dark'].includes(storedTheme())) setTheme(media?.matches ? 'dark' : 'light');
    };
    const syncStorage = (event) => {
      if (event.key === 'goutam-lab-theme' || event.key === null) {
        const saved = event.key === null ? null : event.newValue;
        explicitPreference.current = ['light', 'dark'].includes(saved) ? saved : null;
        setTheme(explicitPreference.current ?? (media?.matches ? 'dark' : 'light'));
      }
    };
    media?.addEventListener('change', followSystem);
    window.addEventListener('storage', syncStorage);
    return () => {
      media?.removeEventListener('change', followSystem);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    explicitPreference.current = next;
    try { localStorage.setItem('goutam-lab-theme', next); } catch { /* Switching still works. */ }
    setTheme(next);
  };
  return [theme, toggleTheme];
}
