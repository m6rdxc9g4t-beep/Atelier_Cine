import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMediaName, parseSeasonFolder } from '../src/utils/filenameParser.js';

test('film au format "scène"', () => {
  const r = parseMediaName('Le.Dernier.Phare.2020.2160p.HDR.BluRay.x265.mkv');
  assert.equal(r.title, 'Le Dernier Phare');
  assert.equal(r.year, 2020);
  assert.deepEqual(r.quality, ['4K Ultra HD', 'HDR']);
  assert.equal(r.season, null);
});

test('dossier "Titre (Année)"', () => {
  const r = parseMediaName('ORBIT (2024)');
  assert.equal(r.title, 'ORBIT');
  assert.equal(r.year, 2024);
});

test('titre qui commence par une année', () => {
  const r = parseMediaName('1917.2019.1080p.mkv');
  assert.equal(r.title, '1917');
  assert.equal(r.year, 2019);
});

test('épisode SxxEyy', () => {
  const r = parseMediaName('Station.Kepler.S01E03.1080p.WEB-DL.mkv');
  assert.equal(r.title, 'Station Kepler');
  assert.equal(r.season, 1);
  assert.equal(r.episode, 3);
});

test('épisode 2x07 avec tirets', () => {
  const r = parseMediaName('Cap Sud - 2x07 - La tempête.mp4');
  assert.equal(r.title, 'Cap Sud');
  assert.equal(r.season, 2);
  assert.equal(r.episode, 7);
  assert.equal(r.episodeTitle, 'La tempête');
});

test('double épisode', () => {
  const r = parseMediaName('Route.7.S04E01E02.720p.mkv');
  assert.equal(r.episode, 1);
  assert.equal(r.episodeEnd, 2);
});

test('dossiers de saison', () => {
  assert.equal(parseSeasonFolder('Saison 2'), 2);
  assert.equal(parseSeasonFolder('Season 01'), 1);
  assert.equal(parseSeasonFolder('S3'), 3);
  assert.equal(parseSeasonFolder('Bonus'), null);
});
