import { useId, useRef } from 'react';
import { Play } from 'lucide-react';
import '../brand/atelier-brand.css';
import logo from '../brand/logo-atelier-cine.webp';

/** Marque commune de la suite Atelier (voir src/brand/atelier-brand.css) : un clic ouvre « À propos ». */
export default function Logo({ className = '' }) {
  const dialog = useRef(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        className={`atelier-brand select-none ${className}`}
        aria-haspopup="dialog"
        title="À propos d'Atelier Ciné"
        onClick={() => dialog.current?.showModal()}
      >
        <span className="atelier-brand__tile" aria-hidden="true">
          <Play />
        </span>
        <span className="atelier-brand__name">
          <span className="atelier-brand__prefix">atelier_</span>Ciné
        </span>
      </button>

      <dialog
        ref={dialog}
        className="atelier-about"
        aria-labelledby={titleId}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        <div className="atelier-about__panel">
          <button type="button" className="atelier-about__close" aria-label="Fermer" onClick={() => dialog.current?.close()}>
            ×
          </button>
          <img className="atelier-about__logo" src={logo} alt="Logo Atelier Ciné" width="576" height="477" />
          <h2 id={titleId} className="atelier-about__name">
            <span className="atelier-brand__prefix">atelier_</span>Ciné
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
