import { useEffect, useRef, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { PROFILE_COLORS, useProfiles } from '../hooks/useProfiles.jsx';

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Couleur du profil">
      {PROFILE_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={`Couleur ${c}`}
          onClick={() => onChange(c)}
          className="grid size-7 place-items-center rounded-full ring-offset-2 ring-offset-ink-850 transition hover:scale-110 aria-checked:ring-2 aria-checked:ring-white"
          style={{ background: c }}
        >
          {value === c && <Check className="size-3.5 text-white" />}
        </button>
      ))}
    </div>
  );
}

function ProfileRow({ profile, canDelete }) {
  const { update, remove } = useProfiles();
  const [name, setName] = useState(profile.name);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => setName(profile.name), [profile.name]);

  const save = async (patch) => {
    try {
      setError(null);
      await update(profile.id, patch);
    } catch (err) {
      setError(err.message);
      setName(profile.name);
    }
  };

  return (
    <li className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <Avatar profile={profile} size="lg" />
        <input
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() !== profile.name && save({ name })}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          aria-label="Nom du profil"
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-ink-900 px-3 py-2 outline-none focus:border-white/40"
        />
        {canDelete &&
          (confirm ? (
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => remove(profile.id).catch((err) => setError(err.message))}
                className="rounded-md bg-brand px-3 py-2 text-xs font-semibold hover:bg-brand-dark"
              >
                Supprimer
              </button>
              <button type="button" onClick={() => setConfirm(false)} className="rounded-md px-2 py-2 text-xs text-neutral-400 hover:text-white">
                Annuler
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirm(true)}
              aria-label={`Supprimer le profil ${profile.name}`}
              className="grid size-9 place-items-center rounded-md text-neutral-400 hover:bg-white/10 hover:text-white"
            >
              <Trash2 className="size-4" />
            </button>
          ))}
      </div>
      <div className="mt-3 pl-[4.25rem]">
        <ColorPicker value={profile.color} onChange={(color) => save({ color })} />
      </div>
      {error && <p className="mt-2 pl-[4.25rem] text-sm text-red-400">{error}</p>}
    </li>
  );
}

function AddProfileForm({ onDone, autoFocus }) {
  const { create, profiles, setActiveId } = useProfiles();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROFILE_COLORS[profiles.length % PROFILE_COLORS.length]);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const p = await create({ name, color });
      setActiveId(p.id);
      setName('');
      onDone?.();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-dashed border-white/15 p-4">
      <div className="flex items-center gap-3">
        <Avatar profile={{ name: name || '+', color }} size="lg" />
        <input
          value={name}
          maxLength={20}
          autoFocus={autoFocus}
          onChange={(e) => (setName(e.target.value), setError(null))}
          placeholder="Prénom du nouveau profil"
          aria-label="Nom du nouveau profil"
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-ink-900 px-3 py-2 outline-none placeholder:text-neutral-500 focus:border-white/40"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/85 disabled:opacity-40"
        >
          <Plus className="size-4" /> Ajouter
        </button>
      </div>
      <div className="mt-3 pl-[4.25rem]">
        <ColorPicker value={color} onChange={setColor} />
      </div>
      {error && <p className="mt-2 pl-[4.25rem] text-sm text-red-400">{error}</p>}
    </form>
  );
}

/** Fenêtre de gestion : renommer, changer la couleur, supprimer, ajouter. */
export default function ProfilesDialog({ mode, onClose }) {
  const ref = useRef(null);
  const { profiles, mode: storageMode } = useProfiles();

  useEffect(() => {
    const dlg = ref.current;
    if (mode && dlg && !dlg.open) dlg.showModal();
    if (!mode && dlg?.open) dlg.close();
  }, [mode]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-xl bg-ink-850 p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {mode && (
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">{mode === 'add' ? 'Nouveau profil' : 'Gérer les profils'}</h2>
            <button type="button" onClick={onClose} aria-label="Fermer" className="grid size-9 place-items-center rounded-full hover:bg-white/10">
              <X className="size-5" />
            </button>
          </div>

          {mode === 'manage' && (
            <ul className="mb-4 max-h-[50vh] space-y-3 overflow-y-auto">
              {profiles.map((p) => (
                <ProfileRow key={p.id} profile={p} canDelete={profiles.length > 1} />
              ))}
            </ul>
          )}

          {profiles.length < 8 && <AddProfileForm autoFocus={mode === 'add'} onDone={mode === 'add' ? onClose : undefined} />}

          {storageMode === 'local' && (
            <p className="mt-4 text-xs text-neutral-500">
              Backend injoignable : les profils sont enregistrés dans ce navigateur uniquement.
            </p>
          )}
        </div>
      )}
    </dialog>
  );
}
