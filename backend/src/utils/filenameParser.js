import path from 'node:path';

/**
 * Déduit titre / année / qualité / saison-épisode à partir d'un nom de fichier
 * ou de dossier "à la scène" : `Le.Dernier.Phare.2020.2160p.HDR.mkv`,
 * `Station Kepler - S01E03 - Panne.mkv`, `Cap Sud 2x07.mp4`…
 */

const QUALITY_PATTERNS = [
  [/\b(2160p|4k|uhd)\b/i, '4K Ultra HD'],
  [/\b1080p\b/i, '1080p'],
  [/\b720p\b/i, '720p'],
  [/\b480p\b/i, '480p'],
];
const HDR_PATTERN = /\b(hdr10\+?|hdr|dolby[ .]?vision|dv)\b/i;

// Tout ce qui suit l'un de ces marqueurs n'appartient plus au titre.
const NOISE =
  /\b(2160p|1080p|720p|480p|4k|uhd|hdr\w*|dv|bluray|blu-ray|bdrip|brrip|web[- .]?dl|webrip|web|hdtv|dvdrip|remux|x264|x265|h\.?264|h\.?265|hevc|avc|aac\d?|ac3|dts\w*|truehd|atmos|10bit|multi|vff|vfq|vfi|vostfr|truefrench|french|subfrench|proper|repack|extended|unrated|imax)\b/i;

const EPISODE_PATTERNS = [
  /\bS(\d{1,2})[ ._-]?E(\d{1,3})(?:[ ._-]?E?(\d{1,3}))?\b/i, // S01E02, S01E02E03
  /\b(\d{1,2})x(\d{2,3})\b/i, // 1x02
  /\bSaison[ ._-]?(\d{1,2})[ ._-]+(?:Episode|Ep|É?pisode)[ ._-]?(\d{1,3})\b/i,
];

const YEAR = /(?:^|[\s.(\[_-])((?:19|20)\d{2})(?=$|[\s.)\]_-])/;

function clean(raw) {
  return raw
    .replace(/[._]+/g, ' ')
    .replace(/\s*[-–]\s*$/g, '')
    .replace(/[([{]\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function parseQuality(name) {
  const quality = [];
  for (const [re, label] of QUALITY_PATTERNS) {
    if (re.test(name)) {
      quality.push(label);
      break;
    }
  }
  if (HDR_PATTERN.test(name)) quality.push('HDR');
  return quality;
}

/**
 * @param {string} fileOrDirName nom de fichier (avec ou sans extension) ou de dossier
 * @returns {{ title: string, year: number|null, quality: string[], season: number|null, episode: number|null, episodeEnd: number|null, episodeTitle: string|null }}
 */
export function parseMediaName(fileOrDirName) {
  const base = path.basename(fileOrDirName, path.extname(fileOrDirName));
  let titlePart = base;

  let season = null;
  let episode = null;
  let episodeEnd = null;
  let episodeTitle = null;
  for (const re of EPISODE_PATTERNS) {
    const m = base.match(re);
    if (m) {
      season = Number(m[1]);
      episode = Number(m[2]);
      episodeEnd = m[3] ? Number(m[3]) : null;
      titlePart = base.slice(0, m.index);
      // "Série - 2x01 - Le retour.1080p" -> "Le retour"
      let after = base.slice(m.index + m[0].length);
      const n = after.match(NOISE);
      if (n) after = after.slice(0, n.index);
      episodeTitle = clean(after.replace(/^[\s._-]+/, '')) || null;
      break;
    }
  }

  // On garde la dernière année trouvée, jamais celle en tout début de nom (film intitulé "1917").
  let year = null;
  const years = [...titlePart.matchAll(new RegExp(YEAR, 'g'))].filter((m) => m.index > 0);
  const y = years.at(-1);
  if (y) {
    year = Number(y[1]);
    titlePart = titlePart.slice(0, y.index);
  }

  const noise = titlePart.match(NOISE);
  if (noise) titlePart = titlePart.slice(0, noise.index);

  const title = clean(titlePart) || clean(base);
  return { title, year, quality: parseQuality(base), season, episode, episodeEnd, episodeTitle };
}

/** Repère un dossier "Saison 1", "Season 02", "S03". */
export function parseSeasonFolder(dirName) {
  const m = dirName.match(/^(?:saison|season|s)[ ._-]?(\d{1,2})$/i);
  return m ? Number(m[1]) : null;
}
