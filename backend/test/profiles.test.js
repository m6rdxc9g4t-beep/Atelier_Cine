import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

process.env.PROFILES_FILE = path.join(await mkdtemp(path.join(tmpdir(), 'atelier-profils-')), 'profiles.json');
const store = await import('../src/services/profileStore.js');

before(() => store._resetCache());

test('crée un profil par défaut au premier lancement', async () => {
  const list = await store.listProfiles();
  assert.equal(list.length, 1);
  assert.ok(list[0].id && list[0].name && list[0].color);
});

test('ajoute, renomme puis supprime un profil', async () => {
  const p = await store.createProfile({ name: '  Léa  ' });
  assert.equal(p.name, 'Léa');
  const u = await store.updateProfile(p.id, { name: 'Léa B.', color: '#2F80ED', kids: true });
  assert.equal(u.color, '#2f80ed');
  assert.equal(u.kids, true);
  await store.deleteProfile(p.id);
  assert.equal((await store.listProfiles()).length, 1);
});

test('refuse les doublons, les noms vides et la suppression du dernier profil', async () => {
  const [first] = await store.listProfiles();
  await assert.rejects(store.createProfile({ name: first.name.toUpperCase() }), { status: 409 });
  await assert.rejects(store.createProfile({ name: '   ' }), { status: 400 });
  await assert.rejects(store.deleteProfile(first.id), { status: 400 });
});

test('persiste sur disque', async () => {
  await store.createProfile({ name: 'Invité' });
  store._resetCache();
  assert.ok((await store.listProfiles()).some((p) => p.name === 'Invité'));
});
