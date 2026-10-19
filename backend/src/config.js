import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const BACKEND_ROOT = path.resolve(here, '..');

const splitDirs = (value, base = BACKEND_ROOT) =>
  (value ?? '')
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => path.resolve(base, d));

// L'app Mac range ses données dans ~/Library/Application Support/Atelier_Ciné ;
// en mode serveur, elles restent dans backend/data.
const DATA_DIR = process.env.ATELIER_DATA_DIR ?? path.join(BACKEND_ROOT, 'data');
const DESKTOP = process.env.ATELIER_RUNTIME === 'desktop';

export const config = {
  runtime: DESKTOP ? 'desktop' : 'server',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  // Valeurs initiales venant de l'environnement ; remplacées par data/settings.json
  // dès que les dossiers sont réglés depuis l'interface (voir services/settingsStore.js).
  mediaDirs: {
    movies: splitDirs(process.env.MEDIA_MOVIES_DIRS ?? (DESKTOP ? '' : './sample-media/Films')),
    shows: splitDirs(process.env.MEDIA_SHOWS_DIRS ?? (DESKTOP ? '' : './sample-media/Series')),
  },
  mediaDirsSource: process.env.MEDIA_MOVIES_DIRS || process.env.MEDIA_SHOWS_DIRS ? 'env' : 'default',
  scan: {
    maxDepth: Number(process.env.SCAN_MAX_DEPTH ?? 8),
    probe: process.env.SCAN_PROBE === 'true', // ffprobe sur chaque fichier (plus lent)
  },
  dataDir: DATA_DIR,
  libraryFile: path.join(DATA_DIR, 'library.json'),
  profilesFile: process.env.PROFILES_FILE ?? path.join(DATA_DIR, 'profiles.json'),
  settingsFile: process.env.SETTINGS_FILE ?? path.join(DATA_DIR, 'settings.json'),
  envFile: process.env.ATELIER_ENV_FILE ?? path.join(BACKEND_ROOT, '.env'),
  frontendDist: process.env.ATELIER_FRONTEND_DIST ?? path.resolve(BACKEND_ROOT, '..', 'frontend', 'dist'),
  ollama: {
    url: process.env.OLLAMA_URL ?? 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL ?? 'llama3',
  },
};

export const VIDEO_EXTENSIONS = new Set(['.mkv', '.mp4', '.m4v', '.avi', '.mov', '.webm', '.ts', '.m2ts', '.wmv']);
export const SUBTITLE_EXTENSIONS = new Set(['.srt', '.vtt', '.ass', '.ssa']);
