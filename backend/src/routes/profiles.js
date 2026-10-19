import { Router } from 'express';
import { createProfile, deleteProfile, listProfiles, PROFILE_COLORS, updateProfile } from '../services/profileStore.js';

const router = Router();

// GET /api/profiles — liste + palette de couleurs disponibles
router.get('/profiles', async (req, res) => {
  res.json({ profiles: await listProfiles(), colors: PROFILE_COLORS });
});

// POST /api/profiles — { name, color?, kids? }
router.post('/profiles', async (req, res) => {
  res.status(201).json(await createProfile(req.body));
});

// PATCH /api/profiles/:id — { name?, color?, kids? }
router.patch('/profiles/:id', async (req, res) => {
  res.json(await updateProfile(req.params.id, req.body));
});

// DELETE /api/profiles/:id
router.delete('/profiles/:id', async (req, res) => {
  await deleteProfile(req.params.id);
  res.status(204).end();
});

export default router;
