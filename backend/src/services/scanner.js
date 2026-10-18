import { opendir, stat } from 'node:fs/promises';
import path from 'node:path';
import { VIDEO_EXTENSIONS, SUBTITLE_EXTENSIONS } from '../config.js';
import { parseMediaName, parseSeasonFolder } from '../utils/filenameParser.js';
import { stableId } from '../utils/ids.js';
import { probeFile } from './probe.js';

/** Dossiers système (NAS Synology/QNAP, Windows, macOS) à ne jamais parcourir. */
const IGNORED_DIRS = new Set([
  '@eadir',
  '#recycle',
  '@recycle',
  '$recycle.bin',
  'system volume information',
  '.trash',
  '.trashes',
  '.@__thumb',
  'lost+found',
  'extras',
  'featurettes',
  'trailers',
  'samples',
  'sample',
]);
const IMAGE_NAMES = {
  poster: ['poster', 'folder', 'cover', 'movie'],
  backdrop: ['fanart', 'backdrop', 'background'],
};
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Parcours récursif asynchrone. Ne suit pas les liens symboliques vers des dossiers
 * (évite les boucles) ; les erreurs d'accès sont collectées sans interrompre le scan.
 * @yields {{ fullPath: string, name: string, dir: string, ext: string, depth: number, dirent: import('node:fs').Dirent }}
 */
async function* walk(root, { maxDepth, errors }, depth = 0) {
  let dir;
  try {
    dir = await opendir(root);
  } catch (err) {
    errors.push({ path: root, code: err.code, message: describeFsError(err) });
    return;
  }
  try {
    for await (const dirent of dir) {
      const name = dirent.name;
      if (name.startsWith('.')) continue;
      const fullPath = path.join(root, name);

      if (dirent.isDirectory()) {
        if (IGNORED_DIRS.has(name.toLowerCase())) continue;
        if (depth + 1 > maxDepth) continue;
        yield* walk(fullPath, { maxDepth, errors }, depth + 1);
      } else if (dirent.isFile() || dirent.isSymbolicLink()) {
        yield { fullPath, name, dir: root, ext: path.extname(name).toLowerCase(), depth, dirent };
      }
    }
  } catch (err) {
    // Ex. NAS déconnecté en plein parcours
    errors.push({ path: root, code: err.code, message: describeFsError(err) });
  }
}

function describeFsError(err) {
  switch (err.code) {
    case 'ENOENT':
      return 'Dossier introuvable (NAS non monté ou chemin erroné ?)';
    case 'EACCES':
    case 'EPERM':
      return 'Accès refusé (droits de lecture manquants)';
    case 'ENOTDIR':
      return "Le chemin n'est pas un dossier";
    case 'ETIMEDOUT':
    case 'EHOSTDOWN':
    case 'EIO':
      return 'Le partage réseau ne répond pas';
    default:
      return err.message;
  }
}

async function safeStat(p) {
  try {
    return await stat(p);
  } catch {
    return null;
  }
}

const isSampleFile = (name, size) => /\bsample\b/i.test(name) && size < 300 * 1024 * 1024;

/** Regroupe tous les fichiers d'un dossier (vidéos, sous-titres, images) pour les associer entre eux. */
async function collect(root, opts) {
  const byDir = new Map();
  for await (const entry of walk(root, opts)) {
    if (!byDir.has(entry.dir)) byDir.set(entry.dir, []);
    byDir.get(entry.dir).push(entry);
  }
  return byDir;
}

function findSidecars(siblings, videoName) {
  const stem = path.basename(videoName, path.extname(videoName)).toLowerCase();
  const subtitles = siblings
    .filter((s) => SUBTITLE_EXTENSIONS.has(s.ext) && s.name.toLowerCase().startsWith(stem))
    .map((s) => {
      // Film.fr.srt -> "fr"
      const lang = s.name.slice(stem.length, -s.ext.length).replace(/^[._-]/, '') || null;
      return { path: s.fullPath, lang, format: s.ext.slice(1) };
    });

  const image = (kind) => {
    const candidates = [...IMAGE_NAMES[kind].map((n) => n), `${stem}-${kind}`, kind === 'poster' ? stem : null].filter(Boolean);
    const found = siblings.find((s) => IMAGE_EXT.includes(s.ext) && candidates.includes(path.basename(s.name, s.ext).toLowerCase()));
    return found?.fullPath ?? null;
  };

  return { subtitles, posterPath: image('poster'), backdropPath: image('backdrop') };
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return results;
}

async function enrichWithProbe(target, filePath) {
  const info = await probeFile(filePath);
  if (!info) return;
  if (info.durationMin) target.durationMin = info.durationMin;
  if (info.quality.length) target.quality = info.quality;
  target.tech = info.tech;
}

/* ------------------------------------------------------------------ */
/* Films                                                               */
/* ------------------------------------------------------------------ */

export async function scanMovies(roots, { maxDepth = 8, probe = false } = {}) {
  const errors = [];
  const movies = [];

  for (const root of roots) {
    const byDir = await collect(root, { maxDepth, errors });

    for (const [dir, entries] of byDir) {
      for (const entry of entries) {
        if (!VIDEO_EXTENSIONS.has(entry.ext)) continue;
        const st = await safeStat(entry.fullPath);
        if (!st?.isFile() || isSampleFile(entry.name, st.size)) continue;

        // "Titre (2020)/fichier.mkv" : le nom du dossier est souvent plus propre que celui du fichier.
        const fromFile = parseMediaName(entry.name);
        const fromDir = dir !== root ? parseMediaName(path.basename(dir)) : null;
        const best = fromDir?.year && !fromFile.year ? fromDir : fromFile;

        const sidecars = findSidecars(entries, entry.name);
        const id = stableId('m', entry.fullPath);
        movies.push({
          id,
          type: 'movie',
          title: best.title,
          year: best.year ?? fromDir?.year ?? null,
          quality: fromFile.quality.length ? fromFile.quality : (fromDir?.quality ?? []),
          durationMin: null,
          rating: null,
          genres: [],
          synopsis: null,
          poster: sidecars.posterPath ? `/api/artwork/${id}/poster` : null,
          backdrop: sidecars.backdropPath ? `/api/artwork/${id}/backdrop` : null,
          progress: null,
          addedAt: (st.birthtime?.getTime() ? st.birthtime : st.mtime).toISOString(),
          sizeBytes: st.size,
          path: entry.fullPath,
          subtitles: sidecars.subtitles.map(({ lang, format }) => ({ lang, format })),
          _files: { video: entry.fullPath, poster: sidecars.posterPath, backdrop: sidecars.backdropPath, subtitles: sidecars.subtitles },
        });
      }
    }
  }

  if (probe) await mapLimit(movies, 4, (m) => enrichWithProbe(m, m.path));
  return { movies, errors };
}

/* ------------------------------------------------------------------ */
/* Séries                                                              */
/* ------------------------------------------------------------------ */

export async function scanShows(roots, { maxDepth = 8, probe = false } = {}) {
  const errors = [];
  const shows = new Map(); // clé = dossier de la série (ou titre si fichiers à la racine)

  for (const root of roots) {
    const byDir = await collect(root, { maxDepth, errors });

    for (const [dir, entries] of byDir) {
      // Le 1er niveau sous la racine est le dossier de la série.
      const rel = path.relative(root, dir);
      const parts = rel ? rel.split(path.sep) : [];
      const showDir = parts.length ? path.join(root, parts[0]) : null;
      const seasonFromFolder = parts.length > 1 ? parseSeasonFolder(parts.at(-1)) : null;

      for (const entry of entries) {
        if (!VIDEO_EXTENSIONS.has(entry.ext)) continue;
        const st = await safeStat(entry.fullPath);
        if (!st?.isFile() || isSampleFile(entry.name, st.size)) continue;

        const parsed = parseMediaName(entry.name);
        const showInfo = showDir ? parseMediaName(parts[0]) : parsed;
        const key = showDir ?? `${root}::${showInfo.title.toLowerCase()}`;

        if (!shows.has(key)) {
          const showSiblings = byDir.get(showDir) ?? [];
          const art = findSidecars(showSiblings, '__show__');
          const id = stableId('s', key);
          shows.set(key, {
            id,
            type: 'show',
            title: showInfo.title,
            year: showInfo.year,
            quality: [],
            rating: null,
            genres: [],
            synopsis: null,
            poster: art.posterPath ? `/api/artwork/${id}/poster` : null,
            backdrop: art.backdropPath ? `/api/artwork/${id}/backdrop` : null,
            progress: null,
            addedAt: null,
            path: showDir ?? root,
            seasons: 0,
            episodes: 0,
            episodeList: [],
            _files: { poster: art.posterPath, backdrop: art.backdropPath },
          });
        }

        const show = shows.get(key);
        const season = parsed.season ?? seasonFromFolder ?? 1;
        const sidecars = findSidecars(entries, entry.name);
        const addedAt = (st.birthtime?.getTime() ? st.birthtime : st.mtime).toISOString();

        show.episodeList.push({
          id: stableId('e', entry.fullPath),
          season,
          episode: parsed.episode,
          episodeEnd: parsed.episodeEnd,
          title: parsed.episodeTitle,
          quality: parsed.quality,
          sizeBytes: st.size,
          addedAt,
          path: entry.fullPath,
          subtitles: sidecars.subtitles.map(({ lang, format }) => ({ lang, format })),
          _files: { video: entry.fullPath, subtitles: sidecars.subtitles },
        });
        if (!show.addedAt || addedAt > show.addedAt) show.addedAt = addedAt; // "Récents" = dernier épisode ajouté
        for (const q of parsed.quality) if (!show.quality.includes(q)) show.quality.push(q);
      }
    }
  }

  const list = [...shows.values()].map((show) => {
    show.episodeList.sort((a, b) => a.season - b.season || (a.episode ?? 0) - (b.episode ?? 0));
    show.seasons = new Set(show.episodeList.map((e) => e.season)).size;
    show.episodes = show.episodeList.length;
    return show;
  });

  if (probe) {
    const episodes = list.flatMap((s) => s.episodeList);
    await mapLimit(episodes, 4, (e) => enrichWithProbe(e, e.path));
  }
  return { shows: list, errors };
}

export async function scanLibrary({ movies: movieRoots, shows: showRoots }, opts) {
  const started = Date.now();
  const [m, s] = await Promise.all([scanMovies(movieRoots, opts), scanShows(showRoots, opts)]);
  return {
    movies: m.movies,
    shows: s.shows,
    errors: [...m.errors, ...s.errors],
    durationMs: Date.now() - started,
  };
}
