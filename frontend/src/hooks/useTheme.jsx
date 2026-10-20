import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyTheme,
  readThemePreference,
  resolveTheme,
  syncDesktopTheme,
  systemPrefersDark,
  writeThemePreference,
} from '../lib/theme.js';

const ThemeContext = createContext(null);

/** Préférence de thème partagée (Paramètres, menu du profil). */
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readThemePreference);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // « Système » réagit aux changements de réglage de l'appareil.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved = resolveTheme(preference, systemDark);

  useEffect(() => applyTheme(resolved), [resolved]);
  useEffect(() => syncDesktopTheme(preference), [preference]);

  const setTheme = useCallback((next) => {
    setPreference(next);
    writeThemePreference(next);
  }, []);

  const value = useMemo(() => ({ preference, resolved, setTheme }), [preference, resolved, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>');
  return ctx;
}
