import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyThemeColor,
  readResolvedTheme,
  readThemePreference,
  setThemePreference,
  syncDesktopTheme,
} from '../lib/theme.js';

const ThemeContext = createContext(null);

/**
 * Préférence de thème partagée (Paramètres, menu du profil), branchée sur `window.atelierTheme`.
 * Suit aussi les changements faits ailleurs : réglage du système, autre onglet ou autre app de la suite.
 */
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readThemePreference);
  const [resolved, setResolved] = useState(readResolvedTheme);

  useEffect(() => {
    const sync = () => {
      setPreference(readThemePreference());
      setResolved(readResolvedTheme());
    };
    // atelier-theme.js réapplique le thème du système ou d'un autre onglet sans émettre d'événement :
    // on observe donc aussi les marqueurs de <html>.
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-theme-pref'] });
    window.addEventListener('atelier-theme', sync);
    sync();
    return () => {
      observer.disconnect();
      window.removeEventListener('atelier-theme', sync);
    };
  }, []);

  useEffect(() => applyThemeColor(resolved), [resolved]);
  useEffect(() => syncDesktopTheme(preference), [preference]);

  const setTheme = useCallback((next) => setThemePreference(next), []);

  const value = useMemo(() => ({ preference, resolved, setTheme }), [preference, resolved, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>');
  return ctx;
}
