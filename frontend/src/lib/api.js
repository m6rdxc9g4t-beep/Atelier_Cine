// Petit client pour l'API Express (proxifiée par Vite sur /api en développement).

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur API ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => request('/health'),
  library: () => request('/library'),
  scan: () => request('/scan', { method: 'POST' }),
  ollamaStatus: () => request('/ai/status'),
  streamUrl: (id) => `/api/stream/${encodeURIComponent(id)}`,
};
