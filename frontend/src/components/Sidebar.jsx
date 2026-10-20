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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-sidebar flex-col border-r border-line bg-ink-850/95 backdrop-blur neon-panel md:flex">
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
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon',
                  isActive ? 'bg-brand-soft text-brand-light' : 'text-neutral-400 hover:bg-neon/5 hover:text-fg',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {/* Barre signature collée au bord de l'écran, comme sur la maquette */}
                  <span
                    aria-hidden
                    className={`absolute top-0 -left-3.5 h-full w-1.5 rounded-r bg-brand shadow-[var(--atelier-signature-glow)] transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <Icon
                    className="size-7"
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
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line bg-ink-850/95 pb-[env(safe-area-inset-bottom)] backdrop-blur neon-panel md:hidden"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.7rem] ${isActive ? 'text-brand-light' : 'text-neutral-500'}`
            }
          >
            {({ isActive }) => (
              <>
                <span aria-hidden className={`absolute top-0 h-0.5 w-8 rounded-b bg-brand ${isActive ? '' : 'hidden'}`} />
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
