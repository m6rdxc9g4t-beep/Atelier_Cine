import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, Monitor, Moon, Pencil, Plus, Settings, Sun } from 'lucide-react';
import Avatar from './Avatar.jsx';
import ProfilesDialog from './ProfilesDialog.jsx';
import { useProfiles } from '../hooks/useProfiles.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { THEME_OPTIONS } from '../lib/theme.js';

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

/** Avatar en haut à droite : menu pour changer de profil, en ajouter ou les gérer. */
export default function ProfileMenu() {
  const { profiles, active, setActiveId } = useProfiles();
  const { preference: themePref, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(null); // null | 'manage' | 'add'
  const rootRef = useRef(null);

  // Fermeture au clic extérieur et à la touche Échap
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={active ? `Profil : ${active.name}. Changer de profil` : 'Choisir un profil'}
        className="flex h-[30px] items-center gap-1 rounded-md pr-1 pl-1 text-faint transition-colors hover:bg-surface-2 hover:text-fg aria-expanded:bg-surface-2"
      >
        <Avatar profile={active} size="sm" />
        <ChevronDown aria-hidden className={`size-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="pop absolute top-full right-0 z-50 mt-1.5 w-60 p-1">
          <p className="px-2 pt-1.5 pb-1 text-meta font-medium text-faint">Qui regarde ?</p>
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              role="menuitemradio"
              aria-checked={p.id === active?.id}
              onClick={() => {
                setActiveId(p.id);
                setOpen(false);
              }}
              className="menu-item"
            >
              <Avatar profile={p} size="xs" />
              <span className="flex-1 truncate">{p.name}</span>
              {p.id === active?.id && <Check aria-hidden className="size-4 text-brand-ink" />}
            </button>
          ))}

          {profiles.length < 8 && (
            <button type="button" role="menuitem" onClick={() => (setDialog('add'), setOpen(false))} className="menu-item">
              <Plus aria-hidden />
              Ajouter un profil
            </button>
          )}

          <div className="-mx-1 my-1 h-px bg-line" />
          <div role="group" aria-label="Thème" className="flex h-[34px] items-center gap-2 px-2">
            <span className="flex-1 text-sm text-fg">Thème</span>
            <div className="seg">
              {THEME_OPTIONS.map((o) => {
                const Icon = THEME_ICONS[o.value];
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={themePref === o.value}
                    aria-label={`Thème ${o.label.toLowerCase()}`}
                    title={o.label}
                    onClick={() => setTheme(o.value)}
                  >
                    <Icon aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="-mx-1 my-1 h-px bg-line" />
          <button type="button" role="menuitem" onClick={() => (setDialog('manage'), setOpen(false))} className="menu-item">
            <Pencil aria-hidden /> Gérer les profils
          </button>
          <Link to="/settings" role="menuitem" onClick={() => setOpen(false)} className="menu-item">
            <Settings aria-hidden /> Paramètres
          </Link>
        </div>
      )}

      <ProfilesDialog mode={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
