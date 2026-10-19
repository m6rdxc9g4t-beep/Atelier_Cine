// npm run scan — indexe les dossiers configurés sans lancer le serveur.
import { rescan } from '../services/libraryStore.js';
import { config } from '../config.js';
import { loadSettings } from '../services/settingsStore.js';

await loadSettings();
const r = await rescan();
console.log(`Films  : ${config.mediaDirs.movies.join(' ; ')}`);
console.log(`Séries : ${config.mediaDirs.shows.join(' ; ')}`);
console.log(`→ ${r.counts.movies} films, ${r.counts.shows} séries, ${r.counts.episodes} épisodes en ${r.durationMs} ms`);
for (const e of r.errors) console.warn(`⚠ ${e.path} — ${e.message}`);
console.log(`Index écrit dans ${config.libraryFile}`);
