// Regroupe le processus principal Electron + le backend Express (et ses dépendances)
// en un seul fichier : l'app n'embarque ainsi aucun node_modules.
import { build } from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist-electron');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await build({
  entryPoints: [path.join(root, 'src', 'main.js')],
  outfile: path.join(out, 'main.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  external: ['electron'],
  // Express et ses dépendances sont en CommonJS : on leur fournit `require`.
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  legalComments: 'none',
  logLevel: 'warning',
});
await copyFile(path.join(root, 'src', 'preload.cjs'), path.join(out, 'preload.cjs'));
console.log('✓ dist-electron/main.mjs + preload.cjs');
