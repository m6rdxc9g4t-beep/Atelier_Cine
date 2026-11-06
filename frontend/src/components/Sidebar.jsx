import { NavLink } from 'react-router-dom';
import { Clapperboard, Clock3, House, Monitor, Moon, Settings, Sun, Tv } from 'lucide-react';
import Logo from './Logo.jsx';
import { useLibrary } from '../hooks/useLibrary.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { THEME_OPTIONS } from '../lib/theme.js';

export const NAV_ITEMS = [
  { to: '/', label: 'Accueil', icon: House, end: true },
  { to: '/movies', label: 'Films', icon: Clapperboard, count: (lib) => lib.movies.length },
  { to: '/shows', label: 'Séries', icon: Tv, count: (lib) => lib.shows.length },
  { to: '/recent', label: 'Récents', icon: Clock3 },
  { to: '/settings', label: 'Paramètres', icon: Settings },
];

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

/** Choix du thème en pied de barre latérale, comme au portail (Système / Clair / Sombre). */
function ThemeSwitch() {
  const { preference, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Thème" className="seg">
      {THEME_OPTIONS.map((o) => {
        const Icon = THEME_ICONS[o.value];
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={preference === o.value}
            aria-label={`Thème ${o.label.toLowerCase()}`}
            title={o.label}
            onClick={() => setTheme(o.value)}
          >
            <Icon aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

/** Barre latérale fixe (≥ md) ; devient une barre d'onglets en bas sur téléphone. */
export default function Sidebar() {
  const { library } = useLibrary();

  return (
    <>
      <aside className="sticky top-0 z-40 hidden h-screen flex-col overflow-y-auto border-r border-line bg-sidebar px-2 pt-3 pb-2 md:flex mac-window:pt-11">
        <div className="px-2 pb-3">
          <Logo />
        </div>

        <nav aria-label="Navigation principale" className="flex flex-col gap-px">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, count }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'group flex h-[30px] items-center gap-2.5 rounded-md px-2 text-sm leading-none font-medium transition-colors duration-[120ms]',
                  isActive ? 'bg-surface-3 text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon aria-hidden className={`size-4 shrink-0 ${isActive ? 'text-fg' : 'text-faint group-hover:text-muted'}`} strokeWidth={1.75} />
                  <span className="flex-1 truncate">{label}</span>
                  {count && count(library) > 0 && (
                    <span className="text-meta font-medium text-faint tabular-nums">{count(library)}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-1 pt-3">
          <ThemeSwitch />
        </div>
      </aside>

      {/* Barre d'onglets du téléphone */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium ${isActive ? 'text-fg' : 'text-faint'}`
            }
          >
            <Icon aria-hidden className="size-5" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
