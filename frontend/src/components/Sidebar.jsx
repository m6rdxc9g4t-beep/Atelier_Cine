import { NavLink } from 'react-router-dom';
import { Clapperboard, Clock3, House, Settings, Tv } from 'lucide-react';
import Logo from './Logo.jsx';

export const NAV_ITEMS = [
  { to: '/', label: 'Accueil', icon: House, end: true },
  { to: '/movies', label: 'Films', icon: Clapperboard },
  { to: '/shows', label: 'Séries', icon: Tv },
  { to: '/recent', label: 'Récents', icon: Clock3 },
  { to: '/settings', label: 'Paramètres', icon: Settings },
];

/** Menu latéral fixe (≥ md) ; devient une barre d'onglets en bas sur mobile. */
export default function Sidebar() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-sidebar flex-col border-r border-edge-soft bg-sidebar md:flex">
        <div className="px-6 pt-8 pb-14 mac-window:pt-14 mac-window:pb-10">
          <Logo />
        </div>

        <nav aria-label="Navigation principale" className="flex flex-col gap-3 px-3.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'group relative flex flex-col items-center gap-2 rounded-lg py-4 text-[0.95rem] transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                  isActive ? 'atelier-nav-active' : 'text-muted hover:bg-brand-faint hover:text-fg',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {/* Entrée active : barre de couleur à gauche + fond en transparence (.atelier-nav-active) */}
                  <Icon
                    className={`size-7 ${isActive ? 'text-brand-ink' : ''}`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    fill={isActive ? 'currentColor' : 'none'}
                    fillOpacity={isActive ? 0.15 : 0}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Barre de navigation mobile */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-edge-soft bg-sidebar/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.7rem] ${isActive ? 'text-brand-ink' : 'text-muted/80'}`
            }
          >
            {({ isActive }) => (
              <>
                <span aria-hidden className={`absolute top-0 h-0.5 w-8 rounded-b bg-brand shadow-[var(--atelier-signature-glow)] ${isActive ? '' : 'hidden'}`} />
                <Icon className="size-5" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
