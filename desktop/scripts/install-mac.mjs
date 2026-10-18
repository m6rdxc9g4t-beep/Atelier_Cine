// Installe l'app construite (desktop/release/mac*/Atelier_Cine.app) dans /Applications,
// vérifie qu'elle démarre (journal dans desktop/release/last-launch.log), puis l'ouvre.
import { execFileSync, spawn } from 'node:child_process';
import { createWriteStream, existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform !== 'darwin') {
  console.error("L'installation dans /Applications ne fonctionne que sur macOS.");
  process.exit(1);
}

const APP = 'Atelier_Cine.app';
const BUNDLE_ID = 'fr.ateliercine.app';
const release = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'release');
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

// 1. Fermer une version en cours et retirer les anciennes installations
//    (dont « Atelier_Ciné.app » des premières versions, sous ses deux formes Unicode).
try {
  execFileSync('osascript', ['-e', `tell application id "${BUNDLE_ID}" to quit`], { stdio: 'ignore', timeout: 5000 });
} catch {
  /* l'app ne tournait pas */
}
for (const old of [APP, 'Atelier_Ciné.app'.normalize('NFC'), 'Atelier_Ciné.app'.normalize('NFD')]) {
  execFileSync('rm', ['-rf', path.join('/Applications', old)]);
}

// 2. Copier
const target = path.join('/Applications', APP);
execFileSync('ditto', [built, target]);
console.log(`✓ Installée : ${target}`);

// 3. Test de démarrage : 6 s avec les journaux d'Electron activés
const exe = path.join(target, 'Contents', 'MacOS', 'Atelier_Cine');
const logFile = path.join(release, 'last-launch.log');
const log = createWriteStream(logFile);
const child = spawn(exe, [], { env: { ...process.env, ELECTRON_ENABLE_LOGGING: '1' } });
child.stdout.pipe(log);
child.stderr.pipe(log);

const exited = await new Promise((resolve) => {
  const timer = setTimeout(() => resolve(null), 6000);
  child.on('exit', (code, signal) => {
    clearTimeout(timer);
    resolve({ code, signal });
  });
});

if (exited) {
  log.end();
  await new Promise((r) => setTimeout(r, 200));
  console.error(`✗ L'app s'est arrêtée au démarrage (${exited.signal ?? `code ${exited.code}`}).`);
  console.error(`  Journal : ${logFile}`);
  console.error(readFileSync(logFile, 'utf8').split('\n').slice(-25).join('\n'));
  process.exit(1);
}

child.kill();
await new Promise((r) => setTimeout(r, 800));
log.end();
console.log('✓ Démarrage vérifié');

// 4. Ouvrir normalement
execFileSync('open', [target]);
