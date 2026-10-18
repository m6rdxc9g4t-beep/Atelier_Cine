import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import { getFiles } from '../services/libraryStore.js';

const router = Router();

const MIME = {
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.ts': 'video/mp2t',
  '.m2ts': 'video/mp2t',
};

/**
 * GET /api/stream/:id — lecture directe avec support des requêtes Range (seek dans le lecteur).
 * Le client n'envoie jamais de chemin : seul un id présent dans l'index est servi.
 * Le transcodage FFmpeg (formats non lisibles par le navigateur) viendra dans une étape suivante.
 */
router.get('/stream/:id', async (req, res) => {
  const files = getFiles(req.params.id);
  if (!files?.video) return res.status(404).json({ error: 'Vidéo introuvable' });

  let info;
  try {
    info = await stat(files.video);
  } catch {
    return res.status(410).json({ error: "Le fichier n'est plus accessible (NAS déconnecté ?)" });
  }

  const size = info.size;
  const type = MIME[path.extname(files.video).toLowerCase()] ?? 'application/octet-stream';
  const range = req.headers.range;

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Type', type);

  if (!range) {
    res.setHeader('Content-Length', size);
    return createReadStream(files.video).pipe(res);
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  let start = match?.[1] ? Number(match[1]) : NaN;
  let end = match?.[2] ? Number(match[2]) : size - 1;
  if (match && !match[1] && match[2]) {
    // bytes=-500 : les 500 derniers octets
    start = Math.max(0, size - Number(match[2]));
    end = size - 1;
  }
  if (!match || Number.isNaN(start) || start >= size || end < start) {
    res.setHeader('Content-Range', `bytes */${size}`);
    return res.status(416).end();
  }
  end = Math.min(end, size - 1);

  res.status(206);
  res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
  res.setHeader('Content-Length', end - start + 1);
  const stream = createReadStream(files.video, { start, end });
  stream.on('error', () => res.destroy());
  req.on('close', () => stream.destroy());
  stream.pipe(res);
});

// GET /api/artwork/:id/:kind — affiche ou fond trouvés à côté de la vidéo (poster.jpg, fanart.jpg…)
router.get('/artwork/:id/:kind', (req, res) => {
  const files = getFiles(req.params.id);
  const file = req.params.kind === 'poster' ? files?.poster : req.params.kind === 'backdrop' ? files?.backdrop : null;
  if (!file) return res.status(404).end();
  res.sendFile(file, { maxAge: '7d' }, (err) => err && !res.headersSent && res.status(404).end());
});

export default router;
