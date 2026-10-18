import { access, constants, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';

/**
 * Réglages modifiables depuis l'interface (data/settings.json).
 * Ils priment sur les variables d'environnement MEDIA_MOVIES_DIRS / MEDIA_SHOWS_DIRS.
 */

const MAX_DIRS = 20;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  err.expose = true;
  return err;
}

export async function loadSettings() {
  try {
    const saved = JSON.parse(await readFile(config.settingsFile, 'utf8'));
    if (saved.mediaDirs) {
      config.mediaDirs = { movies: saved.mediaDirs.movies ?? [], shows: saved.mediaDirs.shows ?? [] };
      config.mediaDirsSource = 'settings';
    }
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn(`[réglages] fichier illisible, ignoré : ${err.message}`);
  }
}

function cleanList(list, label) {
  if (!Array.isArray(list)) throw httpError(400, `${label} : une liste de chemins est attendue`);
  const out = [];
  for (const raw of list) {
    if (typeof raw !== 'string') throw httpError(400, `${label} : chemin invalide`);
    const p = raw.trim().replace(/[\\/]+$/, '') || raw.trim();
    if (!p) continue;
    if (!path.isAbsolute(p)) throw httpError(400, `${label} : « ${p} » doit être un chemin complet (ex. /Volumes/NAS/Films)`);
    const norm = path.normalize(p);
    if (!out.includes(norm)) out.push(norm);
  }
  if (out.length > MAX_DIRS) throw httpError(400, `${label} : ${MAX_DIRS} dossiers maximum`);
  return out;
}

async function dirStatus(p) {
  try {
    const st = await stat(p);
    if (!st.isDirectory()) return { exists: true, readable: false, message: "Ce n'est pas un dossier" };
    await access(p, constants.R_OK);
    return { exists: true, readable: true };
  } catch (err) {
    if (err.code === 'ENOENT') return { exists: false, readable: false, message: 'Introuvable (NAS non monté ?)' };
    return { exists: true, readable: false, message: 'Accès refusé' };
  }
}

export async function getSettings() {
  const check = async (kind) =>
    Promise.all(config.mediaDirs[kind].map(async (p) => ({ path: p, kind, ...(await dirStatus(p)) })));
  return {
    mediaDirs: config.mediaDirs,
    source: config.mediaDirsSource, // 'settings' | 'env' | 'default'
    dirStatus: [...(await check('movies')), ...(await check('shows'))],
    runtime: config.runtime,
    dataDir: config.dataDir,
  };
}

export async function updateSettings(body = {}) {
  const movies = cleanList(body.mediaDirs?.movies ?? config.mediaDirs.movies, 'Films');
  const shows = cleanList(body.mediaDirs?.shows ?? config.mediaDirs.shows, 'Séries');

  await mkdir(path.dirname(config.settingsFile), { recursive: true });
  const tmp = `${config.settingsFile}.tmp`;
  await writeFile(tmp, JSON.stringify({ mediaDirs: { movies, shows } }, null, 2));
  await rename(tmp, config.settingsFile);

  config.mediaDirs = { movies, shows };
  config.mediaDirsSource = 'settings';
  return getSettings();
}
