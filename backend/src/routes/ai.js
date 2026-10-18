import { Router } from 'express';
import { getItem } from '../services/libraryStore.js';
import { ollamaStatus, summarizeMedia } from '../services/ollama.js';

const router = Router();

// GET /api/ai/status — Ollama joignable ? modèle installé ?
router.get('/ai/status', async (req, res) => {
  res.json(await ollamaStatus());
});

// POST /api/ai/summary/:id — génère synopsis + genres + tags pour un média
router.post('/ai/summary/:id', async (req, res) => {
  const item = getItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'Média introuvable' });

  const status = await ollamaStatus();
  if (!status.available) return res.status(503).json({ error: 'Ollama ne répond pas', detail: status.error });

  res.json(await summarizeMedia(item));
});

export default router;
