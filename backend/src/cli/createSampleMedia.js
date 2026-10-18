// npm run sample -w backend — crée une fausse médiathèque (fichiers vides) pour tester le scan.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BACKEND_ROOT } from '../config.js';

const root = path.join(BACKEND_ROOT, 'sample-media');
const files = [
  'Films/ORBIT (2024)/Orbit.2024.2160p.HDR.WEB-DL.mkv',
  'Films/ORBIT (2024)/Orbit.2024.2160p.HDR.WEB-DL.fr.srt',
  'Films/Le Dernier Phare (2020)/Le.Dernier.Phare.2020.1080p.BluRay.x264.mkv',
  'Films/Ligne.de.Fuite.2021.1080p.WEBRip.mp4',
  'Films/Sable Rouge (2024)/Sable Rouge.mkv',
  'Films/Sable Rouge (2024)/sample-sable-rouge.mkv',
  'Films/@eaDir/thumb.mkv',
  'Series/Station Kepler/Saison 1/Station.Kepler.S01E01.2160p.mkv',
  'Series/Station Kepler/Saison 1/Station.Kepler.S01E02.2160p.mkv',
  'Series/Station Kepler/Saison 2/Station Kepler - 2x01 - Retour.mkv',
  'Series/Cap Sud/Cap.Sud.S01E01.720p.mp4',
  'Series/Cap Sud/Cap.Sud.S01E02.720p.mp4',
  'Series/Les.Veilleurs.S02E05.1080p.WEB-DL.mkv',
];

for (const rel of files) {
  const full = path.join(root, rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, '');
}
console.log(`Médiathèque d'exemple créée dans ${root} (${files.length} fichiers)`);
