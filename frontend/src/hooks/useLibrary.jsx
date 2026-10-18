import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, storage } from '../lib/api.js';
import { mockLibrary } from '../data/mockLibrary.js';

const LibraryContext = createContext(null);
const DEMO_KEY = 'atelier-cine.demo';
const EMPTY = { featuredId: null, movies: [], shows: [] };

/**
 * Charge la médiathèque depuis l'API.
 * Catalogue de démonstration selon la préférence `demo` :
 *  - 'auto'  (défaut) : affiché tant que l'API ne répond pas ou ne trouve aucun média
 *  - 'on'    : toujours affiché (pratique pour tester l'interface)
 *  - 'off'   : jamais ; une page vide guide vers les Paramètres
 */
export function LibraryProvider({ children }) {
  const [apiData, setApiData] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'unreachable'
  const [error, setError] = useState(null);
  const [demoPref, setDemoPrefState] = useState(() => storage.get(DEMO_KEY, 'auto'));

  const setDemoPref = useCallback((v) => {
    setDemoPrefState(v);
    storage.set(DEMO_KEY, v);
  }, []);

  const load = useCallback(async () => {
    try {
      setApiData(await api.library());
      setStatus('ok');
      setError(null);
    } catch (err) {
      setApiData(null);
      setStatus('unreachable');
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const hasReal = Boolean(apiData && (apiData.movies?.length || apiData.shows?.length));
    const isDemo = demoPref === 'on' || (demoPref === 'auto' && !hasReal);
    const library = isDemo ? mockLibrary : (apiData ?? EMPTY);

    const all = [...library.movies, ...library.shows];
    const byId = new Map(all.map((m) => [m.id, m]));
    const featured = byId.get(library.featuredId) ?? library.movies[0] ?? library.shows[0] ?? null;
    const continueWatching = all
      .filter((m) => m.progress > 0 && m.progress < 0.97)
      .sort((a, b) => (b.lastWatchedAt ?? '').localeCompare(a.lastWatchedAt ?? '') || b.progress - a.progress);
    const recent = [...all].sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''));

    return {
      library,
      isDemo,
      source: isDemo ? 'demo' : 'api', // compat
      status,
      apiReachable: status === 'ok',
      hasReal,
      scanErrors: apiData?.errors ?? [],
      scannedAt: apiData?.scannedAt ?? null,
      demoPref,
      setDemoPref,
      error,
      reload: load,
      all,
      byId,
      featured,
      continueWatching,
      recent,
    };
  }, [apiData, status, demoPref, setDemoPref, error, load]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary doit être utilisé dans <LibraryProvider>');
  return ctx;
}
