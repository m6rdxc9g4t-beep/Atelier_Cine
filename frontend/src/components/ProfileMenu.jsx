import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, Pencil, Plus, Settings } from 'lucide-react';
import Avatar from './Avatar.jsx';
import ProfilesDialog from './ProfilesDialog.jsx';
import { useProfiles } from '../hooks/useProfiles.jsx';

/** Avatar en haut à droite : menu pour changer de profil, en ajouter ou les gérer. */
export default function ProfileMenu() {
  const { profiles, active, setActiveId } = useProfiles();
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

  const item = 'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-neutral-200 transition hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={active ? `Profil : ${active.name}. Changer de profil` : 'Choisir un profil'}
        className="group flex items-center gap-2 rounded-full p-1 text-neutral-300 transition hover:text-white focus-visible:outline-2 focus-visible:outline-white"
      >
        <Avatar profile={active} className="ring-2 ring-white/15 transition group-hover:ring-white/40" />
        <ChevronDown className={`size-5 transition ${open ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-2 w-64 origin-top-right rounded-xl border border-white/10 bg-ink-850/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-md"
        >
          <p className="px-3 pt-1 pb-2 text-xs font-medium tracking-wide text-neutral-500 uppercase">Qui regarde ?</p>
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
              className={item}
            >
              <Avatar profile={p} size="sm" />
              <span className="flex-1 truncate">{p.name}</span>
              {p.id === active?.id && <Check className="size-4 text-white" />}
            </button>
          ))}

          {profiles.length < 8 && (
            <button type="button" role="menuitem" onClick={() => (setDialog('add'), setOpen(false))} className={item}>
              <span className="grid size-8 place-items-center rounded-md border border-dashed border-white/30">
                <Plus className="size-4" />
              </span>
              Ajouter un profil
            </button>
          )}

          <div className="my-2 h-px bg-white/10" />
          <button type="button" role="menuitem" onClick={() => (setDialog('manage'), setOpen(false))} className={item}>
            <Pencil className="size-4 text-neutral-400" /> Gérer les profils
          </button>
          <Link to="/settings" role="menuitem" onClick={() => setOpen(false)} className={item}>
            <Settings className="size-4 text-neutral-400" /> Paramètres
          </Link>
        </div>
      )}

      <ProfilesDialog mode={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
