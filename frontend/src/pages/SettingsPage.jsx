import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Copy, FolderSearch, Loader2, Pencil, RefreshCw, XCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { useLibrary } from '../hooks/useLibrary.jsx';
import { useProfiles } from '../hooks/useProfiles.jsx';
import Avatar from '../components/Avatar.jsx';
import ProfilesDialog from '../components/ProfilesDialog.jsx';

function Status({ ok, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${ok ? 'text-emerald-400' : 'text-neutral-400'}`}>
      {ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
      {children}
    </span>
  );
}

function Panel({ id, title, children, action }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-white/5 bg-ink-850 p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const copy = () =>
    navigator.clipboard?.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-md bg-black/50 p-3 pr-10 font-mono text-xs leading-relaxed text-neutral-200">{children}</pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copier"
        className="absolute top-2 right-2 grid size-7 place-items-center rounded text-neutral-400 hover:bg-white/10 hover:text-white"
      >
        {copied ? <CheckCircle2 className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

const DEMO_OPTIONS = [
  { value: 'auto', label: 'Automatique', hint: 'Affiché tant qu’aucun film ou série n’est trouvé dans tes dossiers.' },
  { value: 'on', label: 'Toujours', hint: 'Pratique pour tester l’interface, même avec une médiathèque remplie.' },
  { value: 'off', label: 'Jamais', hint: 'Seulement tes fichiers. Une page vide s’affiche s’il n’y a rien.' },
];

export default function SettingsPage() {
  const { reload, isDemo, hasReal, library, scanErrors, scannedAt, demoPref, setDemoPref, apiReachable } = useLibrary();
  const { profiles, active, setActiveId, mode: profilesMode } = useProfiles();
  const { hash } = useLocation();
  const [health, setHealth] = useState(null);
  const [ollama, setOllama] = useState(null);
  const [scan, setScan] = useState({ state: 'idle' });
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(false));
    api.ollamaStatus().then(setOllama).catch(() => setOllama(false));
  }, []);

  // Arrivée depuis le badge "Mode démo" : on fait défiler jusqu'au bon panneau.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

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

  const errors = scan.state === 'done' ? scan.res.errors : scanErrors;
  const counts = hasReal && !isDemo ? `${library.movies.length} films · ${library.shows.length} séries` : null;

  return (
    <div className="max-w-3xl space-y-6 px-5 pt-24 sm:px-10 lg:px-16">
      <h1 className="font-display text-4xl font-semibold">Paramètres</h1>

      <Panel id="profils" title="Profils" action={
        <button type="button" onClick={() => setDialog('manage')} className="inline-flex items-center gap-1.5 text-sm text-neutral-300 hover:text-white">
          <Pencil className="size-4" /> Gérer
        </button>
      }>
        <div className="flex flex-wrap gap-4">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveId(p.id)}
              aria-pressed={p.id === active?.id}
              className="group flex w-20 flex-col items-center gap-2 text-sm text-neutral-400 aria-pressed:text-white"
            >
              <Avatar profile={p} size="lg" className="ring-offset-2 ring-offset-ink-850 transition group-hover:scale-105 group-aria-pressed:ring-2 group-aria-pressed:ring-white" />
              <span className="w-full truncate">{p.name}</span>
            </button>
          ))}
          {profiles.length < 8 && (
            <button type="button" onClick={() => setDialog('add')} className="flex w-20 flex-col items-center gap-2 text-sm text-neutral-500 hover:text-white">
              <span className="grid size-14 place-items-center rounded-lg border border-dashed border-white/25 text-2xl">+</span>
              Ajouter
            </button>
          )}
        </div>
        {profilesMode === 'local' && (
          <p className="mt-4 text-xs text-neutral-500">Backend injoignable : profils enregistrés dans ce navigateur uniquement.</p>
        )}
      </Panel>

      <Panel id="mediatheque" title="Médiathèque">
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
          <Status ok={apiReachable}>{apiReachable ? 'API connectée' : 'API injoignable — lance « npm run dev » à la racine du projet'}</Status>
          {counts && <span className="text-sm text-neutral-400">{counts} indexés</span>}
          {scannedAt && <span className="text-sm text-neutral-500">Dernier scan : {new Date(scannedAt).toLocaleString('fr-FR')}</span>}
        </div>

        {health?.mediaDirs && (
          <ul className="mb-4 space-y-1 font-mono text-xs text-neutral-400">
            {health.mediaDirs.movies.map((d) => (
              <li key={d}>🎬 {d}</li>
            ))}
            {health.mediaDirs.shows.map((d) => (
              <li key={d}>📺 {d}</li>
            ))}
          </ul>
        )}

        {errors?.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-400/25 bg-amber-400/5 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-200">
              <AlertTriangle className="size-4" /> {errors.length} dossier{errors.length > 1 ? 's' : ''} inaccessible{errors.length > 1 ? 's' : ''}
            </p>
            <ul className="space-y-1 text-xs text-neutral-300">
              {errors.map((e) => (
                <li key={e.path}>
                  <span className="font-mono text-neutral-400">{e.path}</span> — {e.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {health && (health.envFileFound === false || errors?.length > 0) && (
          <div className="mb-5 space-y-3 text-sm text-neutral-300">
            <p>
              {health.envFileFound === false ? (
                <>Aucun fichier <code className="rounded bg-white/10 px-1">backend/.env</code> : l'API cherche dans le dossier d'exemple. </>
              ) : null}
              Indique tes vrais dossiers (sur Mac, un NAS monté est dans <code className="rounded bg-white/10 px-1">/Volumes</code>) :
            </p>
            <CodeBlock>{`cp .env.example backend/.env\nopen -e backend/.env`}</CodeBlock>
            <CodeBlock>{`MEDIA_MOVIES_DIRS=/Volumes/NAS/Films\nMEDIA_SHOWS_DIRS=/Volumes/NAS/Series`}</CodeBlock>
            <p className="text-xs text-neutral-500">
              Puis redémarre (<kbd>Ctrl</kbd>+<kbd>C</kbd> et <code>npm run dev</code>). Pour juste tester le scan : <code>npm run sample -w backend</code>.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={runScan}
          disabled={!apiReachable || scan.state === 'running'}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 font-semibold transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {scan.state === 'running' ? <Loader2 className="size-4 animate-spin" /> : <FolderSearch className="size-4" />}
          Scanner les dossiers
        </button>

        {scan.state === 'done' && (
          <p className="mt-3 text-sm text-neutral-300">
            Scan terminé en {scan.res.durationMs} ms — {scan.res.counts.movies} films, {scan.res.counts.shows} séries, {scan.res.counts.episodes} épisodes.
          </p>
        )}
        {scan.state === 'error' && <p className="mt-3 text-sm text-red-400">{scan.message}</p>}
      </Panel>

      <Panel id="demo" title="Catalogue de démonstration">
        <div role="radiogroup" aria-label="Affichage du catalogue de démonstration" className="inline-flex rounded-lg border border-white/10 bg-black/30 p-1">
          {DEMO_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={demoPref === o.value}
              onClick={() => setDemoPref(o.value)}
              className="rounded-md px-4 py-1.5 text-sm text-neutral-400 transition hover:text-white aria-checked:bg-white aria-checked:font-semibold aria-checked:text-black"
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-neutral-400">{DEMO_OPTIONS.find((o) => o.value === demoPref)?.hint}</p>
        <p className="mt-1 text-sm text-neutral-500">
          {isDemo ? 'Actuellement : catalogue de démonstration affiché (la lecture joue une bande-annonce d’exemple).' : 'Actuellement : ta médiathèque est affichée.'}
        </p>
      </Panel>

      <Panel id="ia" title="IA locale (Ollama)">
        <div className="flex flex-wrap items-center gap-4">
          <Status ok={ollama?.available}>
            {ollama?.available ? `Ollama disponible — modèle ${ollama.model}${ollama.modelInstalled ? '' : ' (non installé)'}` : 'Ollama non détecté'}
          </Status>
          <button
            type="button"
            onClick={() => api.ollamaStatus().then(setOllama).catch(() => setOllama(false))}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white"
          >
            <RefreshCw className="size-3.5" /> Revérifier
          </button>
        </div>
        {ollama?.models?.length > 0 && <p className="mt-3 text-xs text-neutral-500">Modèles installés : {ollama.models.join(', ')}</p>}
      </Panel>

      <ProfilesDialog mode={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
