import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Préférence de thème commune à la suite (docs/SUITE.md §1.5 d'Atelier_Projets) : la copie verbatim de
 * `src/brand/atelier-theme.js` est insérée telle quelle dans <head>, en script bloquant, pour poser
 * le thème avant le premier affichage (en dev comme dans `dist/`, servi par Express ou par l'app Mac).
 *
 * Juste avant, une reprise unique de l'ancienne préférence de Ciné (localStorage « atelier-cine-theme ») :
 * si aucune préférence commune n'existe encore, elle devient la préférence commune de ce navigateur,
 * puis l'ancienne clé est supprimée.
 */
const LEGACY_THEME = `(function () {
  try {
    var old = localStorage.getItem('atelier-cine-theme');
    if (old === null) return;
    localStorage.removeItem('atelier-cine-theme');
    var known = /(?:^|; )atelier_theme=/.test(document.cookie) || localStorage.getItem('atelier:theme') !== null;
    if (!known && (old === 'light' || old === 'dark' || old === 'system')) localStorage.setItem('atelier:theme', old);
  } catch (e) {}
})();`;

function atelierTheme() {
  const file = new URL('./src/brand/atelier-theme.js', import.meta.url);
  return {
    name: 'atelier-theme',
    transformIndexHtml: () => [
      { tag: 'script', children: LEGACY_THEME, injectTo: 'head' },
      { tag: 'script', children: readFileSync(file, 'utf8'), injectTo: 'head' },
    ],
  };
}

// En dev, toutes les requêtes /api partent vers le serveur Express.
export default defineConfig({
  plugins: [atelierTheme(), react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
