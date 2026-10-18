import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const dir = await mkdtemp(path.join(tmpdir(), 'atelier-reglages-'));
process.env.SETTINGS_FILE = path.join(dir, 'settings.json');
const { config } = await import('../src/config.js');
const store = await import('../src/services/settingsStore.js');

test('enregistre les dossiers, signale ceux qui manquent, et les recharge', async () => {
  const films = path.join(dir, 'Films');
  await mkdir(films);
  const s = await store.updateSettings({ mediaDirs: { movies: [films + '/', films], shows: ['/Volumes/NAS-absent/Series'] } });
  assert.deepEqual(s.mediaDirs.movies, [films]); // slash final retiré, doublon supprimé
  assert.equal(s.dirStatus.find((d) => d.kind === 'movies').readable, true);
  assert.equal(s.dirStatus.find((d) => d.kind === 'shows').exists, false);

  config.mediaDirs = { movies: [], shows: [] };
  await store.loadSettings();
  assert.deepEqual(config.mediaDirs.movies, [films]);
  assert.equal(config.mediaDirsSource, 'settings');
});

test('refuse les chemins relatifs', async () => {
  await assert.rejects(store.updateSettings({ mediaDirs: { movies: ['Films'], shows: [] } }), { status: 400 });
});
