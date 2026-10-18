import { createApp } from './app.js';
import { config } from './config.js';
import { loadLibrary, rescan } from './services/libraryStore.js';
import { loadSettings } from './services/settingsStore.js';

/**
 * Démarre l'API (et le frontend compilé s'il existe).
 * Utilisé par `npm start` / `npm run dev` et par l'app Mac (desktop/).
 * @param {{ port?: number, host?: string, quiet?: boolean }} [opts] port 0 = port libre au hasard
 * @returns {Promise<{ server: import('node:http').Server, port: number, url: string }>}
 */
export async function startServer({ port = config.port, host, quiet = false } = {}) {
  const log = quiet ? () => {} : console.log;
  await loadSettings();
  const app = createApp();

  const server = await new Promise((resolve, reject) => {
    const s = app.listen(port, host, () => resolve(s));
    s.once('error', reject);
  });
  const actualPort = server.address().port;
  const url = `http://${host && host !== '0.0.0.0' ? host : 'localhost'}:${actualPort}`;

  log(`🎬 Atelier_Ciné API → ${url}/api`);
  log(`   Films  : ${config.mediaDirs.movies.join(' ; ') || '(aucun dossier)'}`);
  log(`   Séries : ${config.mediaDirs.shows.join(' ; ') || '(aucun dossier)'}`);

  // Index existant chargé tout de suite, puis rafraîchi en tâche de fond.
  const hadIndex = await loadLibrary();
  log(hadIndex ? '   Index chargé' : '   Aucun index : premier scan…');
  rescan()
    .then((r) => {
      log(`   Scan : ${r.counts.movies} films, ${r.counts.shows} séries (${r.counts.episodes} épisodes) en ${r.durationMs} ms`);
      for (const e of r.errors) log(`   ⚠ ${e.path} — ${e.message}`);
    })
    .catch((err) => console.error('   Scan impossible :', err));

  return { server, port: actualPort, url };
}
