import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { config } from '../config.js';

/**
 * Profils de la maison (façon Netflix), persistés dans data/profiles.json
 * pour être partagés entre tous les appareils qui utilisent l'API.
 */

export const PROFILE_COLORS = ['#e5323b', '#2f80ed', '#27ae60', '#f2994a', '#9b51e0', '#eb5793', '#00a5a8', '#8d6e63'];
export const MAX_PROFILES = 8;

const file = () => config.profilesFile;
let cache = null;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  err.expose = true;
  return err;
}

function validateName(name, profiles, selfId = null) {
  if (typeof name !== 'string') throw httpError(400, 'Le nom est obligatoire');
  const clean = name.trim().replace(/\s+/g, ' ');
  if (!clean) throw httpError(400, 'Le nom est obligatoire');
  if (clean.length > 20) throw httpError(400, 'Le nom doit faire 20 caractères maximum');
  if (profiles.some((p) => p.id !== selfId && p.name.toLowerCase() === clean.toLowerCase())) {
    throw httpError(409, 'Un profil porte déjà ce nom');
  }
  return clean;
}

function validateColor(color) {
  if (color === undefined) return undefined;
  if (typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color)) throw httpError(400, 'Couleur invalide (format #rrggbb)');
  return color.toLowerCase();
}

async function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(file(), 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn(`[profils] fichier illisible, recréé : ${err.message}`);
    cache = [{ id: randomUUID(), name: 'François', color: PROFILE_COLORS[0], kids: false, createdAt: new Date().toISOString() }];
    await save();
  }
  return cache;
}

async function save() {
  await mkdir(path.dirname(file()), { recursive: true });
  const tmp = `${file()}.tmp`;
  await writeFile(tmp, JSON.stringify(cache, null, 2));
  await rename(tmp, file());
}

export async function listProfiles() {
  return load();
}

export async function createProfile({ name, color, kids = false } = {}) {
  const profiles = await load();
  if (profiles.length >= MAX_PROFILES) throw httpError(400, `${MAX_PROFILES} profils maximum`);
  const profile = {
    id: randomUUID(),
    name: validateName(name, profiles),
    color: validateColor(color) ?? PROFILE_COLORS[profiles.length % PROFILE_COLORS.length],
    kids: Boolean(kids),
    createdAt: new Date().toISOString(),
  };
  profiles.push(profile);
  await save();
  return profile;
}

export async function updateProfile(id, { name, color, kids } = {}) {
  const profiles = await load();
  const profile = profiles.find((p) => p.id === id);
  if (!profile) throw httpError(404, 'Profil introuvable');
  if (name !== undefined) profile.name = validateName(name, profiles, id);
  if (color !== undefined) profile.color = validateColor(color);
  if (kids !== undefined) profile.kids = Boolean(kids);
  await save();
  return profile;
}

export async function deleteProfile(id) {
  const profiles = await load();
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx === -1) throw httpError(404, 'Profil introuvable');
  if (profiles.length === 1) throw httpError(400, 'Impossible de supprimer le dernier profil');
  profiles.splice(idx, 1);
  await save();
}

/** Pour les tests : oublie le cache mémoire. */
export function _resetCache() {
  cache = null;
}
