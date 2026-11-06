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
    <li className="flex min-h-10 items-center gap-3 border-b border-line px-3 py-1.5 last:border-b-0">
      {status ? (
        ok ? (
          <CheckCircle2 className="size-4 shrink-0 text-faint" strokeWidth={1.75} aria-label="Accessible" />
        ) : (
          <AlertTriangle className="size-4 shrink-0 text-warn" strokeWidth={1.75} aria-label={status.message} />
        )
      ) : (
        <span className="size-3.5 shrink-0 rounded-full border-[1.5px] border-faint" aria-label="Pas encore enregistré" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-xs text-fg" title={path}>
          {path}
        </span>
        {status && !ok && <span className="block text-xs text-warn">{status.message}</span>}
      </span>
      <button type="button" onClick={onRemove} aria-label={`Retirer ${path}`} className="btn btn-ghost btn-icon size-[26px]">
        <X aria-hidden />
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
        className="btn"
      >
        <FolderOpen aria-hidden /> Ajouter un dossier…
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
        className="input h-[30px] flex-1 font-mono text-xs"
      />
      <button type="submit" disabled={!value.trim()} className="btn">
        <Plus aria-hidden /> Ajouter
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

  if (saved === false) return <p className="text-sm text-muted">Le serveur ne répond pas : impossible de modifier les dossiers pour l'instant.</p>;
  if (!saved || !draft) return <Loader2 aria-label="Chargement des dossiers" className="size-4 animate-spin text-faint" />;

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
    <div className="space-y-4">
      {KINDS.map((kind) => (
        <div key={kind.key}>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
            <kind.icon aria-hidden className="size-4 text-faint" strokeWidth={1.75} /> {kind.label}
          </h3>
          {draft[kind.key].length > 0 ? (
            <ul className="mb-2 rounded-md border border-line bg-field">
              {draft[kind.key].map((p) => (
                <DirRow key={p} path={p} status={statusOf(p)} onRemove={() => update(kind.key, draft[kind.key].filter((x) => x !== p))} />
              ))}
            </ul>
          ) : (
            <p className="mb-2 text-xs text-faint">Aucun dossier.</p>
          )}
          <AddDir kind={kind} onAdd={(p) => !draft[kind.key].includes(p) && update(kind.key, [...draft[kind.key], p])} />
        </div>
      ))}

      <p className="text-xs text-muted">
        Sur Mac, un NAS ou un disque externe branché apparaît dans <code>/Volumes</code>. Un dossier
        momentanément absent (NAS éteint) peut rester dans la liste : il sera repris au prochain scan.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} disabled={!dirty || state.status === 'saving'} className="btn btn-primary">
          {state.status === 'saving' && <Loader2 aria-hidden className="animate-spin" />}
          Enregistrer et scanner
        </button>
        {dirty && (
          <button type="button" onClick={() => setDraft(saved.mediaDirs)} className="btn btn-ghost">
            Annuler les modifications
          </button>
        )}
        {state.status === 'done' && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted tabular-nums" role="status">
            <CheckCircle2 aria-hidden className="size-4 text-faint" strokeWidth={1.75} />
            Enregistré — {state.scan.counts.movies} films, {state.scan.counts.shows} séries trouvés.
          </span>
        )}
        {state.status === 'error' && (
          <span className="text-sm text-down" role="alert">
            {state.message}
          </span>
        )}
      </div>
    </div>
  );
}
