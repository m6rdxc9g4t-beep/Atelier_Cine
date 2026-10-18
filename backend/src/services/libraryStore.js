import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { scanLibrary } from './scanner.js';

/**
 * Médiathèque en mémoire, persistée dans data/library.json.
 * Les champs `_files` (chemins internes) ne sortent jamais par l'API publique.
 */

let state = { scannedAt: null, movies: [], shows: [], errors: [] };
let fileIndex = new Map(); // id -> { video, poster, backdrop, subtitles }
let scanning = null;

function rebuildIndex() {
  fileIndex = new Map();
  for (const m of state.movies) fileIndex.set(m.id, m._files);
  for (const s of state.shows) {
    fileIndex.set(s.id, s._files);
    for (const e of s.episodeList) fileIndex.set(e.id, e._files);
  }
}

function pickFeatured(movies) {
  const byRecent = [...movies].sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''));
  const is4k = (m) => m.quality.includes('4K Ultra HD');
  return (
    byRecent.find((m) => is4k(m) && m.backdrop) ??
    byRecent.find((m) => m.backdrop) ??
    byRecent.find(is4k) ??
    byRecent[0]
  )?.id ?? null;
}

const strip = (obj) => {
  if (Array.isArray(obj)) return obj.map(strip);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [k, strip(v)]));
  }
  return obj;
};

export async function loadLibrary() {
  try {
    state = JSON.parse(await readFile(config.libraryFile, 'utf8'));
    rebuildIndex();
    return true;
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn(`[library] index illisible, il sera régénéré : ${err.message}`);
    return false;
  }
}

async function persist() {
  await mkdir(path.dirname(config.libraryFile), { recursive: true });
  const tmp = `${config.libraryFile}.tmp`;
  await writeFile(tmp, JSON.stringify(state, null, 2));
  await rename(tmp, config.libraryFile); // écriture atomique
}

/** Lance un scan ; si un scan est déjà en cours, renvoie le même. */
export function rescan() {
  if (scanning) return scanning;
  scanning = (async () => {
    try {
      const result = await scanLibrary(config.mediaDirs, config.scan);
      state = {
        scannedAt: new Date().toISOString(),
        movies: result.movies,
        shows: result.shows,
        errors: result.errors,
      };
      rebuildIndex();
      await persist();
      return {
        durationMs: result.durationMs,
        counts: {
          movies: result.movies.length,
          shows: result.shows.length,
          episodes: result.shows.reduce((n, s) => n + s.episodes, 0),
        },
        errors: result.errors,
      };
    } finally {
      scanning = null;
    }
  })();
  return scanning;
}

export const isScanning = () => Boolean(scanning);

export function getPublicLibrary() {
  return {
    scannedAt: state.scannedAt,
    featuredId: pickFeatured(state.movies),
    movies: strip(state.movies),
    shows: strip(state.shows).map(({ episodeList, ...show }) => show), // liste allégée
    errors: state.errors,
  };
}

export function getItem(id) {
  const all = [...state.movies, ...state.shows];
  const item = all.find((m) => m.id === id);
  return item ? strip(item) : null;
}

export function getFiles(id) {
  return fileIndex.get(id) ?? null;
}
