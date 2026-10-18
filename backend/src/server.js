import { createApp } from './app.js';
import { config } from './config.js';
import { loadLibrary, rescan } from './services/libraryStore.js';

const app = createApp();

app.listen(config.port, async () => {
  console.log(`🎬 Atelier_Ciné API → http://localhost:${config.port}/api`);
  console.log(`   Films  : ${config.mediaDirs.movies.join(' ; ') || '(aucun dossier)'}`);
  console.log(`   Séries : ${config.mediaDirs.shows.join(' ; ') || '(aucun dossier)'}`);

  // Index existant chargé tout de suite, puis rafraîchi en tâche de fond.
  const hadIndex = await loadLibrary();
  console.log(hadIndex ? '   Index chargé depuis data/library.json' : '   Aucun index : premier scan…');
  rescan()
    .then((r) => {
      console.log(`   Scan : ${r.counts.movies} films, ${r.counts.shows} séries (${r.counts.episodes} épisodes) en ${r.durationMs} ms`);
      for (const e of r.errors) console.warn(`   ⚠ ${e.path} — ${e.message}`);
    })
    .catch((err) => console.error('   Scan impossible :', err));
});
