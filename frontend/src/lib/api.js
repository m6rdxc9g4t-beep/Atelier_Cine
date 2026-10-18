// Petit client pour l'API Express (proxifiée par Vite sur /api en développement).

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Erreur API ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  health: () => request('/health'),
  library: () => request('/library'),
  scan: () => request('/scan', { method: 'POST' }),
  ollamaStatus: () => request('/ai/status'),
  streamUrl: (id) => `/api/stream/${encodeURIComponent(id)}`,

  profiles: () => request('/profiles'),
  createProfile: (data) => request('/profiles', { method: 'POST', body: data }),
  updateProfile: (id, data) => request(`/profiles/${id}`, { method: 'PATCH', body: data }),
  deleteProfile: (id) => request(`/profiles/${id}`, { method: 'DELETE' }),
};

/** Lecture/écriture localStorage qui ne plante jamais (navigation privée, stockage bloqué…). */
export const storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* stockage indisponible : on garde l'état en mémoire */
    }
  },
};
