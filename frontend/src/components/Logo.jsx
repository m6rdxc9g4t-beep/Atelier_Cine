import { useId, useRef } from 'react';
import { Clapperboard, X } from 'lucide-react';

/**
 * Marque commune de la suite Atelier (src/brand/atelier-brand.css, docs/SUITE.md §1.6) :
 * icône carrée en dégradé de la signature, glyphe Lucide `clapperboard` blanc, puis « Atelier Ciné ».
 * Un clic ouvre la fenêtre « À propos ». `compact` : icône seule (barre haute du téléphone).
 */
export default function Logo({ compact = false, className = '' }) {
  const dialog = useRef(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        className={`atelier-brand select-none ${className}`}
        aria-haspopup="dialog"
        aria-label={compact ? 'Atelier Ciné : à propos' : undefined}
        title="À propos d'Atelier Ciné"
        onClick={() => dialog.current?.showModal()}
      >
        <span className="atelier-brand__tile" aria-hidden="true">
          <Clapperboard />
        </span>
        {!compact && (
          <span className="atelier-brand__name">
            <span className="atelier-brand__prefix">Atelier </span>Ciné
          </span>
        )}
      </button>

      <dialog
        ref={dialog}
        className="atelier-about"
        aria-labelledby={titleId}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        <div className="atelier-about__panel">
          <button type="button" className="atelier-about__close" aria-label="Fermer" onClick={() => dialog.current?.close()}>
            <X className="size-4" aria-hidden />
          </button>
          <span className="atelier-about__icon atelier-brand__tile" aria-hidden="true">
            <Clapperboard />
          </span>
          <h2 id={titleId} className="atelier-about__name">
            <span className="atelier-brand__prefix">Atelier </span>Ciné
          </h2>
          <p className="atelier-about__tagline">
            Ta médiathèque personnelle façon streaming : tes films et séries, enrichis par une IA locale.
          </p>
          <p className="atelier-about__suite">Suite Atelier · 100 % local</p>
        </div>
      </dialog>
    </>
  );
}
