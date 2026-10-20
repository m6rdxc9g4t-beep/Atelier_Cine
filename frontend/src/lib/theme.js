/**
 * Thème de l'interface (contrat de la suite Atelier) :
 * - sombre : <html class="dark" data-theme="dark"> ;
 * - clair  : <html data-theme="light">, sans classe `dark`.
 * Préférence Clair / Sombre / Système mémorisée dans localStorage (`atelier-cine-theme`).
 * Défaut : Sombre (app de cinéma). Le script inline de index.html applique la même logique
 * avant le premier rendu pour éviter un flash.
 */
import { desktop } from './desktop.js';

export const THEME_STORAGE_KEY = 'atelier-cine-theme';
export const DEFAULT_THEME = 'dark';

export const THEME_OPTIONS = [
  { value: 'light', label: 'Clair', hint: 'Fond clair teinté de magenta, cartes blanches.' },
  { value: 'dark', label: 'Sombre', hint: 'Fond quasi noir, néons magenta : l’ambiance salle de cinéma.' },
  { value: 'system', label: 'Système', hint: 'Suit le réglage clair ou sombre de ton appareil, et change avec lui.' },
];

/** Couleur de la barre du navigateur / de la fenêtre ≈ --atelier-bg de Ciné dans chaque thème. */
export const THEME_COLORS = { dark: '#120b10', light: '#fcf3f6' };

const isPreference = (v) => v === 'light' || v === 'dark' || v === 'system';

export function readThemePreference() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return isPreference(v) ? v : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function writeThemePreference(pref) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    /* stockage indisponible : le choix vaut pour cette visite */
  }
}

export const systemPrefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

export const resolveTheme = (pref, systemDark) => (pref === 'system' ? (systemDark ? 'dark' : 'light') : pref);

/** Pose les deux marqueurs de thème sur <html> et met à jour theme-color. */
export function applyTheme(resolved) {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolved]);
}

/** App Mac : la fenêtre native suit le choix (couleur de fond, au prochain démarrage aussi). */
export function syncDesktopTheme(pref) {
  desktop?.setTheme?.(pref);
}
