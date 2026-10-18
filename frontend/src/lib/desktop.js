/**
 * Pont vers l'app Mac (exposé par desktop/src/preload.cjs).
 * Dans un navigateur classique, `desktop` vaut null et l'interface reste 100 % web.
 */
export const desktop = typeof window !== 'undefined' && window.atelier?.desktop ? window.atelier : null;

if (desktop && typeof document !== 'undefined') {
  document.documentElement.classList.add('is-desktop', `is-${desktop.platform}`);
}
