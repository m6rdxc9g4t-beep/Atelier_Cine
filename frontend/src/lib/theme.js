/**
 * Thème de l'interface : préférence commune à la suite Atelier (docs/SUITE.md §1.5).
 * La copie verbatim `src/brand/atelier-theme.js`, insérée en tête de <head> (vite.config.js), pose le thème
 * avant l'affichage et expose `window.atelierTheme` :
 * - sombre : <html class="dark" data-theme="dark"> ; clair : <html data-theme="light">, sans classe `dark` ;
 * - préférence Système / Clair / Sombre : cookie `atelier_theme` sur le VPS, sinon localStorage `atelier:theme` ;
 * - événement `atelier-theme` sur window à chaque changement.
 */
import { desktop } from './desktop.js';

export const THEME_OPTIONS = [
  { value: 'system', label: 'Système', hint: 'Suit le réglage clair ou sombre de ton appareil, et change avec lui.' },
  { value: 'light', label: 'Clair', hint: 'Fond clair et neutre, pour les pièces éclairées.' },
  { value: 'dark', label: 'Sombre', hint: 'Fond quasi noir : l’ambiance salle de cinéma.' },
];

/** Couleur de la barre du navigateur / de la fenêtre = --atelier-bg dans chaque thème. */
export const THEME_COLORS = { dark: '#0f1012', light: '#fbfbfc' };

const api = () => (typeof window !== 'undefined' ? window.atelierTheme : undefined);
const isPreference = (v) => v === 'light' || v === 'dark' || v === 'system';

export function readThemePreference() {
  const pref = api()?.get();
  return isPreference(pref) ? pref : 'system';
}

export function readResolvedTheme() {
  return api()?.resolved() ?? (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

/** Enregistre la préférence (commune à la suite) et l'applique. */
export function setThemePreference(pref) {
  if (!isPreference(pref)) return;
  const theme = api();
  if (theme) {
    theme.set(pref);
    return;
  }
  // Repli si le script commun n'a pas été chargé : marqueurs seulement, pour cette visite.
  const dark = pref === 'dark' || (pref === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.dataset.theme = dark ? 'dark' : 'light';
  root.dataset.themePref = pref;
  root.style.colorScheme = dark ? 'dark' : 'light';
}

/** Couleur de la barre du navigateur selon le thème appliqué. */
export function applyThemeColor(resolved) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolved]);
}

/** App Mac : la fenêtre native suit le choix (couleur de fond, au prochain démarrage aussi). */
export function syncDesktopTheme(pref) {
  desktop?.setTheme?.(pref);
}
