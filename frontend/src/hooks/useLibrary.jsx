import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { mockLibrary } from '../data/mockLibrary.js';

const LibraryContext = createContext(null);

/**
 * Charge la médiathèque depuis l'API. Si le backend ne répond pas,
 * bascule sur le catalogue de démonstration pour que l'UI reste utilisable.
 */
export function LibraryProvider({ children }) {
  const [library, setLibrary] = useState(mockLibrary);
  const [source, setSource] = useState('loading'); // 'api' | 'demo' | 'loading'
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.library();
      const empty = !data.movies?.length && !data.shows?.length;
      if (empty) {
        setLibrary(mockLibrary);
        setSource('demo');
      } else {
        setLibrary(data);
        setSource('api');
      }
      setError(null);
    } catch (err) {
      setLibrary(mockLibrary);
      setSource('demo');
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const all = [...library.movies, ...library.shows];
    const byId = new Map(all.map((m) => [m.id, m]));
    const featured = byId.get(library.featuredId) ?? library.movies[0] ?? library.shows[0] ?? null;
    const continueWatching = all
      .filter((m) => m.progress > 0 && m.progress < 0.97)
      .sort((a, b) => (b.lastWatchedAt ?? '').localeCompare(a.lastWatchedAt ?? '') || b.progress - a.progress);
    const recent = [...all].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    return { library, source, error, reload: load, all, byId, featured, continueWatching, recent };
  }, [library, source, error, load]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary doit être utilisé dans <LibraryProvider>');
  return ctx;
}
