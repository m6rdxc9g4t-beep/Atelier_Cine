import { Play } from 'lucide-react';
import '../brand/atelier-brand.css';

/** Marque commune de la suite Atelier (voir src/brand/atelier-brand.css). */
export default function Logo({ className = '' }) {
  return (
    <span className={`atelier-brand select-none ${className}`}>
      <span className="atelier-brand__tile" aria-hidden="true">
        <Play />
      </span>
      <span className="atelier-brand__name">
        <span className="atelier-brand__prefix">atelier_</span>Ciné
      </span>
    </span>
  );
}
