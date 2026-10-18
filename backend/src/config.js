import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const BACKEND_ROOT = path.resolve(here, '..');

const splitDirs = (value) =>
  (value ?? '')
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => path.resolve(BACKEND_ROOT, d));

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  mediaDirs: {
    movies: splitDirs(process.env.MEDIA_MOVIES_DIRS ?? './sample-media/Films'),
    shows: splitDirs(process.env.MEDIA_SHOWS_DIRS ?? './sample-media/Series'),
  },
  scan: {
    maxDepth: Number(process.env.SCAN_MAX_DEPTH ?? 8),
    probe: process.env.SCAN_PROBE === 'true', // ffprobe sur chaque fichier (plus lent)
  },
  libraryFile: path.join(BACKEND_ROOT, 'data', 'library.json'),
  profilesFile: process.env.PROFILES_FILE ?? path.join(BACKEND_ROOT, 'data', 'profiles.json'),
  envFile: path.join(BACKEND_ROOT, '.env'),
  frontendDist: path.resolve(BACKEND_ROOT, '..', 'frontend', 'dist'),
  ollama: {
    url: process.env.OLLAMA_URL ?? 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL ?? 'llama3',
  },
};

export const VIDEO_EXTENSIONS = new Set(['.mkv', '.mp4', '.m4v', '.avi', '.mov', '.webm', '.ts', '.m2ts', '.wmv']);
export const SUBTITLE_EXTENSIONS = new Set(['.srt', '.vtt', '.ass', '.ssa']);
