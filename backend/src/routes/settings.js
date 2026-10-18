import { Router } from 'express';
import { getSettings, updateSettings } from '../services/settingsStore.js';
import { rescan } from '../services/libraryStore.js';

const router = Router();

// GET /api/settings — dossiers médias + état de chacun (trouvé, lisible)
router.get('/settings', async (req, res) => {
  res.json(await getSettings());
});

// PUT /api/settings — { mediaDirs: { movies: [...], shows: [...] } } ; relance un scan
router.put('/settings', async (req, res) => {
  const settings = await updateSettings(req.body);
  const scan = await rescan();
  res.json({ ...settings, scan });
});

export default router;
