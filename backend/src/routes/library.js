import { Router } from 'express';
import { getItem, getPublicLibrary, isScanning, rescan } from '../services/libraryStore.js';

const router = Router();

// GET /api/library — tout le catalogue (films + séries sans la liste d'épisodes)
router.get('/library', (req, res) => {
  res.json({ ...getPublicLibrary(), scanning: isScanning() });
});

// GET /api/library/:id — fiche complète (avec épisodes pour une série)
router.get('/library/:id', (req, res) => {
  const item = getItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'Média introuvable' });
  res.json(item);
});

// POST /api/scan — relance l'indexation des dossiers configurés
router.post('/scan', async (req, res) => {
  const result = await rescan();
  res.json(result);
});

export default router;
