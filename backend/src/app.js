import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import libraryRoutes from './routes/library.js';
import streamRoutes from './routes/stream.js';
import aiRoutes from './routes/ai.js';
import profileRoutes from './routes/profiles.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      version: '0.2.0',
      mediaDirs: config.mediaDirs,
      envFileFound: existsSync(config.envFile), // false = chemins par défaut (.env absent)
    });
  });

  app.use('/api', libraryRoutes);
  app.use('/api', streamRoutes);
  app.use('/api', aiRoutes);
  app.use('/api', profileRoutes);

  app.use('/api', (req, res) => res.status(404).json({ error: `Route inconnue : ${req.method} ${req.originalUrl}` }));

  // En production, Express sert aussi le build du frontend (npm run build).
  if (existsSync(config.frontendDist)) {
    app.use(express.static(config.frontendDist));
    app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(config.frontendDist, 'index.html')));
  }

  // Express 5 transmet automatiquement les erreurs des handlers async ici.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(`[api] ${req.method} ${req.originalUrl}`, err);
    res.status(err.status ?? 500).json({ error: err.expose ? err.message : 'Erreur interne du serveur' });
  });

  return app;
}
