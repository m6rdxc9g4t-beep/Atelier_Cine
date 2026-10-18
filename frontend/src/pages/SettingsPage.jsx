import { useEffect, useState } from 'react';
import { CheckCircle2, FolderSearch, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { useLibrary } from '../hooks/useLibrary.jsx';

function Status({ ok, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${ok ? 'text-emerald-400' : 'text-neutral-400'}`}>
      {ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
      {children}
    </span>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-xl border border-white/5 bg-ink-850 p-6">
      <h2 className="mb-4 font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { reload, source, library } = useLibrary();
  const [health, setHealth] = useState(null);
  const [ollama, setOllama] = useState(null);
  const [scan, setScan] = useState({ state: 'idle' });

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(false));
    api.ollamaStatus().then(setOllama).catch(() => setOllama(false));
  }, []);

  const runScan = async () => {
    setScan({ state: 'running' });
    try {
      const res = await api.scan();
      setScan({ state: 'done', res });
      reload();
    } catch (err) {
      setScan({ state: 'error', message: err.message });
    }
  };

  return (
    <div className="max-w-3xl space-y-6 px-5 pt-24 sm:px-10 lg:px-16">
      <h1 className="font-display text-4xl font-semibold">Paramètres</h1>

      <Panel title="Médiathèque">
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
          <Status ok={!!health}>{health ? 'API connectée' : 'API injoignable (npm run dev:api)'}</Status>
          <span className="text-sm text-neutral-400">
            {source === 'api' ? `${library.movies.length} films · ${library.shows.length} séries indexés` : 'Catalogue de démonstration affiché'}
          </span>
        </div>

        {health?.mediaDirs && (
          <ul className="mb-5 space-y-1 font-mono text-xs text-neutral-400">
            {health.mediaDirs.movies.map((d) => (
              <li key={d}>🎬 {d}</li>
            ))}
            {health.mediaDirs.shows.map((d) => (
              <li key={d}>📺 {d}</li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={runScan}
          disabled={!health || scan.state === 'running'}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 font-semibold transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {scan.state === 'running' ? <Loader2 className="size-4 animate-spin" /> : <FolderSearch className="size-4" />}
          Scanner les dossiers
        </button>

        {scan.state === 'done' && (
          <p className="mt-3 text-sm text-neutral-300">
            Scan terminé en {scan.res.durationMs} ms — {scan.res.counts.movies} films, {scan.res.counts.shows} séries,{' '}
            {scan.res.counts.episodes} épisodes.
            {scan.res.errors?.length > 0 && <span className="text-amber-300"> {scan.res.errors.length} dossier(s) inaccessible(s).</span>}
          </p>
        )}
        {scan.state === 'error' && <p className="mt-3 text-sm text-red-400">{scan.message}</p>}
      </Panel>

      <Panel title="IA locale (Ollama)">
        <div className="flex flex-wrap items-center gap-4">
          <Status ok={ollama?.available}>
            {ollama?.available ? `Ollama disponible — modèle ${ollama.model}` : 'Ollama non détecté'}
          </Status>
          <button
            type="button"
            onClick={() => api.ollamaStatus().then(setOllama).catch(() => setOllama(false))}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white"
          >
            <RefreshCw className="size-3.5" /> Revérifier
          </button>
        </div>
        {ollama?.models?.length > 0 && (
          <p className="mt-3 text-xs text-neutral-500">Modèles installés : {ollama.models.join(', ')}</p>
        )}
      </Panel>
    </div>
  );
}
