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
          className="grid size-6 place-items-center rounded-full ring-offset-2 ring-offset-surface transition-shadow aria-checked:ring-2 aria-checked:ring-brand"
          style={{ background: c }}
        >
          {value === c && <Check aria-hidden className="size-3.5 text-white" strokeWidth={2.5} />}
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
    <li className="border-b border-line py-3 first:pt-0 last:border-b-0">
      <div className="flex items-center gap-3">
        <Avatar profile={profile} size="lg" />
        <input
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() !== profile.name && save({ name })}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          aria-label="Nom du profil"
          className="input flex-1"
        />
        {canDelete &&
          (confirm ? (
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => remove(profile.id).catch((err) => setError(err.message))}
                className="btn border-transparent bg-down text-white hover:brightness-95"
              >
                Supprimer
              </button>
              <button type="button" onClick={() => setConfirm(false)} className="btn btn-ghost">
                Annuler
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirm(true)}
              aria-label={`Supprimer le profil ${profile.name}`}
              className="btn btn-ghost btn-icon"
            >
              <Trash2 aria-hidden />
            </button>
          ))}
      </div>
      <div className="mt-2.5 pl-[3.75rem]">
        <ColorPicker value={profile.color} onChange={(color) => save({ color })} />
      </div>
      {error && (
        <p className="mt-2 pl-[3.75rem] text-sm text-down" role="alert">
          {error}
        </p>
      )}
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
    <form onSubmit={submit} className="rounded-md border border-line bg-page p-3">
      <div className="flex items-center gap-3">
        <Avatar profile={{ name: name || '+', color }} size="lg" />
        <input
          value={name}
          maxLength={20}
          autoFocus={autoFocus}
          onChange={(e) => (setName(e.target.value), setError(null))}
          placeholder="Prénom du nouveau profil"
          aria-label="Nom du nouveau profil"
          className="input flex-1"
        />
        <button type="submit" disabled={!name.trim()} className="btn btn-primary">
          <Plus aria-hidden /> Ajouter
        </button>
      </div>
      <div className="mt-2.5 pl-[3.75rem]">
        <ColorPicker value={color} onChange={setColor} />
      </div>
      {error && (
        <p className="mt-2 pl-[3.75rem] text-sm text-down" role="alert">
          {error}
        </p>
      )}
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
      aria-label={mode === 'add' ? 'Nouveau profil' : 'Gérer les profils'}
      className="pop m-auto w-[min(32rem,calc(100vw-2rem))] p-0 text-fg"
    >
      {mode && (
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{mode === 'add' ? 'Nouveau profil' : 'Gérer les profils'}</h2>
            <button type="button" onClick={onClose} aria-label="Fermer" className="btn btn-ghost btn-icon -mr-1.5">
              <X aria-hidden />
            </button>
          </div>

          {mode === 'manage' && (
            <ul className="mb-4 max-h-[50vh] overflow-y-auto">
              {profiles.map((p) => (
                <ProfileRow key={p.id} profile={p} canDelete={profiles.length > 1} />
              ))}
            </ul>
          )}

          {profiles.length < 8 && <AddProfileForm autoFocus={mode === 'add'} onDone={mode === 'add' ? onClose : undefined} />}

          {storageMode === 'local' && (
            <p className="mt-3 text-xs text-muted">
              Backend injoignable : les profils sont enregistrés dans ce navigateur uniquement.
            </p>
          )}
        </div>
      )}
    </dialog>
  );
}
