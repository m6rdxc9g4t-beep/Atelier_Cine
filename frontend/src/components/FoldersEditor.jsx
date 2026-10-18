import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clapperboard, FolderOpen, Loader2, Plus, Tv, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { desktop } from '../lib/desktop.js';

const KINDS = [
  { key: 'movies', label: 'Films', icon: Clapperboard, pickTitle: 'Choisir un dossier de films' },
  { key: 'shows', label: 'Séries', icon: Tv, pickTitle: 'Choisir un dossier de séries' },
];

function DirRow({ path, status, onRemove }) {
  const ok = status?.readable;
  return (
    <li className="flex items-center gap-3 rounded-md bg-black/25 px-3 py-2">
      {status ? (
        ok ? (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-label="Accessible" />
        ) : (
          <AlertTriangle className="size-4 shrink-0 text-amber-300" aria-label={status.message} />
        )
      ) : (
        <span className="size-4 shrink-0 rounded-full border border-white/20" aria-label="Pas encore enregistré" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-xs text-neutral-200" title={path}>
          {path}
        </span>
        {status && !ok && <span className="block text-xs text-amber-200/80">{status.message}</span>}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer ${path}`}
        className="grid size-7 shrink-0 place-items-center rounded text-neutral-400 hover:bg-white/10 hover:text-white"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}

function AddDir({ kind, onAdd }) {
  const [value, setValue] = useState('');

  if (desktop) {
    return (
      <button
        type="button"
        onClick={async () => {
          const picked = await desktop.pickFolder(kind.pickTitle);
          if (picked) onAdd(picked);
        }}
        className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-sm text-neutral-200 hover:border-white/40 hover:text-white"
      >
        <FolderOpen className="size-4" /> Ajouter un dossier…
      </button>
    );
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onAdd(value.trim());
        setValue('');
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={kind.key === 'movies' ? '/Volumes/NAS/Films' : '/Volumes/NAS/Series'}
        aria-label={`Nouveau dossier de ${kind.label.toLowerCase()}`}
        className="min-w-0 flex-1 rounded-md border border-white/10 bg-ink-900 px-3 py-1.5 font-mono text-xs outline-none placeholder:text-neutral-600 focus:border-white/40"
      />
      <button type="submit" disabled={!value.trim()} className="inline-flex items-center gap-1 rounded-md border border-white/15 px-3 text-sm hover:border-white/40 disabled:opacity-40">
        <Plus className="size-4" /> Ajouter
      </button>
    </form>
  );
}

/** Choix des dossiers films / séries, enregistrés côté API (data/settings.json) puis scannés. */
export default function FoldersEditor({ onSaved }) {
  const [saved, setSaved] = useState(null); // réponse de GET /api/settings
  const [draft, setDraft] = useState(null);
  const [state, setState] = useState({ status: 'idle' });

  useEffect(() => {
    api
      .settings()
      .then((s) => {
        setSaved(s);
        setDraft(s.mediaDirs);
      })
      .catch(() => setSaved(false));
  }, []);

  if (saved === false) return <p className="text-sm text-neutral-400">Le serveur ne répond pas : impossible de modifier les dossiers pour l'instant.</p>;
  if (!saved || !draft) return <Loader2 className="size-5 animate-spin text-neutral-500" />;

  const statusOf = (p) => saved.dirStatus.find((d) => d.path === p);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved.mediaDirs);
  const update = (key, list) => {
    setDraft((d) => ({ ...d, [key]: list }));
    setState({ status: 'idle' });
  };

  const save = async () => {
    setState({ status: 'saving' });
    try {
      const res = await api.saveSettings({ mediaDirs: draft });
      setSaved(res);
      setDraft(res.mediaDirs);
      setState({ status: 'done', scan: res.scan });
      onSaved?.(res);
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-5">
      {KINDS.map((kind) => (
        <div key={kind.key}>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-200">
            <kind.icon className="size-4 text-neutral-400" /> {kind.label}
          </h3>
          {draft[kind.key].length > 0 ? (
            <ul className="mb-2 space-y-1.5">
              {draft[kind.key].map((p) => (
                <DirRow key={p} path={p} status={statusOf(p)} onRemove={() => update(kind.key, draft[kind.key].filter((x) => x !== p))} />
              ))}
            </ul>
          ) : (
            <p className="mb-2 text-xs text-neutral-500">Aucun dossier.</p>
          )}
          <AddDir kind={kind} onAdd={(p) => !draft[kind.key].includes(p) && update(kind.key, [...draft[kind.key], p])} />
        </div>
      ))}

      <p className="text-xs text-neutral-500">
        Sur Mac, un NAS ou un disque externe branché apparaît dans <code className="rounded bg-white/10 px-1">/Volumes</code>. Un dossier
        momentanément absent (NAS éteint) peut rester dans la liste : il sera repris au prochain scan.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || state.status === 'saving'}
          className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state.status === 'saving' && <Loader2 className="size-4 animate-spin" />}
          Enregistrer et scanner
        </button>
        {dirty && (
          <button type="button" onClick={() => setDraft(saved.mediaDirs)} className="text-sm text-neutral-400 hover:text-white">
            Annuler les modifications
          </button>
        )}
        {state.status === 'done' && (
          <span className="text-sm text-emerald-400">
            Enregistré — {state.scan.counts.movies} films, {state.scan.counts.shows} séries trouvés.
          </span>
        )}
        {state.status === 'error' && <span className="text-sm text-red-400">{state.message}</span>}
      </div>
    </div>
  );
}
