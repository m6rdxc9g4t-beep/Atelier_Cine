import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import ProfileMenu from './ProfileMenu.jsx';
import { useLibrary } from '../hooks/useLibrary.jsx';

/** Badge « Mode démo » : état à signaler (ambre), cliquable vers les Paramètres. */
function DemoBadge() {
  const { isDemo, demoPref, apiReachable, hasReal } = useLibrary();
  if (!isDemo) return null;
  return (
    <Link
      to="/settings#mediatheque"
      className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-xs font-medium text-warn transition-colors hover:bg-surface-2"
      title={
        demoPref === 'on'
          ? 'Catalogue de démonstration forcé dans les Paramètres'
          : !apiReachable
            ? 'Backend injoignable : catalogue de démonstration affiché'
            : !hasReal
              ? 'Aucun média trouvé dans tes dossiers : catalogue de démonstration affiché'
              : 'Catalogue de démonstration'
      }
    >
      <span aria-hidden className="size-2 rounded-full bg-current" />
      Mode démo
    </Link>
  );
}

/**
 * Barre haute de 44 px, collante et translucide : titre de la vue (+ compteur), outils de la vue,
 * badge « Mode démo » et profil. Sur téléphone, l'icône de l'app ouvre « À propos ».
 */
export default function TopBar({ title, count, children }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page/88 backdrop-blur-[10px] backdrop-saturate-[1.4]">
      <div className="flex h-topbar items-center gap-3 px-4 md:px-5">
        {/* .atelier-brand pose son propre display : on masque donc l'enveloppe, pas le bouton. */}
        <span className="flex md:hidden">
          <Logo compact />
        </span>
        <h1 className="flex min-w-0 items-baseline gap-2 text-sm font-semibold">
          <span className="truncate">{title}</span>
          {count != null && <span className="text-meta font-medium text-faint tabular-nums">{count}</span>}
        </h1>
        <div className="flex-1" />
        {children && <div className="hidden items-center gap-2 md:flex">{children}</div>}
        <DemoBadge />
        <ProfileMenu />
      </div>
      {children && <div className="flex items-center gap-2 px-4 pb-3 md:hidden">{children}</div>}
    </header>
  );
}
