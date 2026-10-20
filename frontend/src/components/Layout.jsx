import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import ProfileMenu from './ProfileMenu.jsx';
import Logo from './Logo.jsx';
import { useLibrary } from '../hooks/useLibrary.jsx';

export default function Layout() {
  const { isDemo, demoPref, apiReachable, hasReal } = useLibrary();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-ink-950">
      <Sidebar />

      {/* En-tête flottant (logo mobile + profil) */}
      <header className={`pointer-events-none fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-5 py-3 transition-colors duration-300 md:left-sidebar md:justify-end md:px-8 md:py-4 ${
          scrolled ? 'border-b border-line bg-ink-950/85 backdrop-blur-md neon-panel' : 'bg-gradient-to-b from-ink-950/60 to-transparent'
        }`}>
        <span className="pointer-events-auto md:hidden">
          <Logo />
        </span>
        <div className="pointer-events-auto flex items-center gap-4">
          {isDemo && (
            <Link
              to="/settings#mediatheque"
              className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200 transition hover:border-amber-300/60 hover:bg-amber-400/20 hover:text-amber-100"
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
              Mode démo
            </Link>
          )}
          <ProfileMenu />
        </div>
      </header>

      <main className="pb-24 md:pb-12 md:pl-sidebar">
        <Outlet />
      </main>
    </div>
  );
}
