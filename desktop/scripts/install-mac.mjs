// Copie l'app construite (desktop/release/mac*/Atelier_Ciné.app) dans /Applications puis la lance.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform !== 'darwin') {
  console.error("L'installation dans /Applications ne fonctionne que sur macOS.");
  process.exit(1);
}

const release = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'release');
const APP = 'Atelier_Ciné.app';
const built = existsSync(release)
  ? readdirSync(release)
      .filter((d) => d.startsWith('mac'))
      .map((d) => path.join(release, d, APP))
      .find((p) => existsSync(p))
  : null;

if (!built) {
  console.error("Aucune app construite. Lance d'abord : npm run app:build");
  process.exit(1);
}

const target = path.join('/Applications', APP);
try {
  execFileSync('osascript', ['-e', 'tell application "Atelier_Ciné" to quit'], { stdio: 'ignore' });
} catch {
  /* l'app ne tournait pas */
}
execFileSync('rm', ['-rf', target]);
execFileSync('ditto', [built, target]);
console.log(`✓ Installée : ${target}`);
execFileSync('open', [target]);
