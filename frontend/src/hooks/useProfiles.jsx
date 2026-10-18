import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, storage } from '../lib/api.js';

/**
 * Profils de la maison. Source de vérité : l'API (partagée entre appareils).
 * Si le backend ne répond pas, les profils vivent dans le navigateur (localStorage).
 * Le profil actif est mémorisé par appareil.
 */

const ProfilesContext = createContext(null);

const ACTIVE_KEY = 'atelier-cine.activeProfile';
const LOCAL_KEY = 'atelier-cine.localProfiles';
export const PROFILE_COLORS = ['#e5323b', '#2f80ed', '#27ae60', '#f2994a', '#9b51e0', '#eb5793', '#00a5a8', '#8d6e63'];

const DEFAULT_LOCAL = [{ id: 'local-1', name: 'François', color: PROFILE_COLORS[0], kids: false }];

function localError(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

/** Même règles que le backend, pour le mode hors-ligne. */
function checkName(name, profiles, selfId) {
  const clean = (name ?? '').trim().replace(/\s+/g, ' ');
  if (!clean) throw localError('Le nom est obligatoire');
  if (clean.length > 20) throw localError('Le nom doit faire 20 caractères maximum');
  if (profiles.some((p) => p.id !== selfId && p.name.toLowerCase() === clean.toLowerCase())) throw localError('Un profil porte déjà ce nom');
  return clean;
}

export function ProfilesProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [activeId, setActiveIdState] = useState(() => storage.get(ACTIVE_KEY));
  const [mode, setMode] = useState('loading'); // 'api' | 'local' | 'loading'

  const setActiveId = useCallback((id) => {
    setActiveIdState(id);
    storage.set(ACTIVE_KEY, id);
  }, []);

  const saveLocal = useCallback((list) => {
    setProfiles(list);
    storage.set(LOCAL_KEY, list);
  }, []);

  const load = useCallback(async () => {
    try {
      const { profiles: list } = await api.profiles();
      setProfiles(list);
      setMode('api');
    } catch {
      setProfiles(storage.get(LOCAL_KEY, DEFAULT_LOCAL));
      setMode('local');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async ({ name, color }) => {
      if (mode === 'api') {
        const p = await api.createProfile({ name, color });
        setProfiles((list) => [...list, p]);
        return p;
      }
      if (profiles.length >= 8) throw localError('8 profils maximum');
      const p = {
        id: `local-${Date.now()}`,
        name: checkName(name, profiles),
        color: color ?? PROFILE_COLORS[profiles.length % PROFILE_COLORS.length],
        kids: false,
      };
      saveLocal([...profiles, p]);
      return p;
    },
    [mode, profiles, saveLocal],
  );

  const update = useCallback(
    async (id, patch) => {
      if (mode === 'api') {
        const p = await api.updateProfile(id, patch);
        setProfiles((list) => list.map((x) => (x.id === id ? p : x)));
        return p;
      }
      const next = profiles.map((x) =>
        x.id === id ? { ...x, ...patch, ...(patch.name !== undefined ? { name: checkName(patch.name, profiles, id) } : {}) } : x,
      );
      saveLocal(next);
      return next.find((x) => x.id === id);
    },
    [mode, profiles, saveLocal],
  );

  const remove = useCallback(
    async (id) => {
      if (profiles.length <= 1) throw localError('Impossible de supprimer le dernier profil');
      if (mode === 'api') await api.deleteProfile(id);
      const next = profiles.filter((x) => x.id !== id);
      if (mode === 'api') setProfiles(next);
      else saveLocal(next);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
    },
    [mode, profiles, saveLocal, activeId, setActiveId],
  );

  const value = useMemo(() => {
    const active = profiles.find((p) => p.id === activeId) ?? profiles[0] ?? null;
    return { profiles, active, setActiveId, create, update, remove, mode, reload: load };
  }, [profiles, activeId, setActiveId, create, update, remove, mode, load]);

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
}

export function useProfiles() {
  const ctx = useContext(ProfilesContext);
  if (!ctx) throw new Error('useProfiles doit être utilisé dans <ProfilesProvider>');
  return ctx;
}

export function initials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}
