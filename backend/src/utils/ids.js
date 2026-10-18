import { createHash } from 'node:crypto';

/** Identifiant court et stable dérivé du chemin : un même fichier garde le même id entre deux scans. */
export function stableId(prefix, value) {
  const hash = createHash('sha1').update(value.normalize('NFC').toLowerCase()).digest('hex').slice(0, 12);
  return `${prefix}-${hash}`;
}

export function slugify(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
