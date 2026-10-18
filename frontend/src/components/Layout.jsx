import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import ProfileMenu from './ProfileMenu.jsx';
import Logo from './Logo.jsx';
import { useLibrary } from '../hooks/useLibrary.jsx';

export default function Layout() {
  const { source } = useLibrary();
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
          scrolled ? 'bg-ink-950/85 backdrop-blur-md' : 'bg-gradient-to-b from-black/50 to-transparent'
        }`}>
        <span className="pointer-events-auto md:hidden">
          <Logo />
        </span>
        <div className="pointer-events-auto flex items-center gap-4">
          {source === 'demo' && (
            <span
              className="hidden rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200 sm:inline"
              title="Le backend n'est pas joignable ou la médiathèque est vide : affichage du catalogue de démonstration."
            >
              Mode démo
            </span>
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
