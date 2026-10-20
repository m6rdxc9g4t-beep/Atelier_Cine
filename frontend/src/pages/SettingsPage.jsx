import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, FolderSearch, Loader2, Pencil, RefreshCw, XCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { useLibrary } from '../hooks/useLibrary.jsx';
import { useProfiles } from '../hooks/useProfiles.jsx';
import Avatar from '../components/Avatar.jsx';
import ProfilesDialog from '../components/ProfilesDialog.jsx';
import FoldersEditor from '../components/FoldersEditor.jsx';
import { desktop } from '../lib/desktop.js';

function Status({ ok, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
      {ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
      {children}
    </span>
  );
}

function Panel({ id, title, children, action }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl atelier-card p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const DEMO_OPTIONS = [
  { value: 'auto', label: 'Automatique', hint: 'Affiché tant qu’aucun film ou série n’est trouvé dans tes dossiers.' },
  { value: 'on', label: 'Toujours', hint: 'Pratique pour tester l’interface, même avec une médiathèque remplie.' },
  { value: 'off', label: 'Jamais', hint: 'Seulement tes fichiers. Une page vide s’affiche s’il n’y a rien.' },
];

export default function SettingsPage() {
  const { reload, isDemo, hasReal, library, scannedAt, demoPref, setDemoPref, apiReachable } = useLibrary();
  const { profiles, active, setActiveId, mode: profilesMode } = useProfiles();
  const { hash } = useLocation();
  const [ollama, setOllama] = useState(null);
  const [scan, setScan] = useState({ state: 'idle' });
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
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

  const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
  const counts = hasReal && !isDemo ? `${plural(library.movies.length, 'film')} · ${plural(library.shows.length, 'série')}` : null;

  return (
    <div className="max-w-3xl space-y-6 px-5 pt-24 sm:px-10 lg:px-16">
      <h1 className="font-display text-4xl font-semibold halo-text">Paramètres</h1>

      <Panel id="profils" title="Profils" action={
        <button type="button" onClick={() => setDialog('manage')} className="inline-flex items-center gap-1.5 text-sm text-brand-ink hover:text-fg">
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
              className="group flex w-20 flex-col items-center gap-2 text-sm text-muted aria-pressed:text-fg"
            >
              <Avatar profile={p} size="lg" className="ring-offset-2 ring-offset-surface transition group-hover:scale-105 group-aria-pressed:ring-2 group-aria-pressed:ring-brand" />
              <span className="w-full truncate">{p.name}</span>
            </button>
          ))}
          {profiles.length < 8 && (
            <button type="button" onClick={() => setDialog('add')} className="flex w-20 flex-col items-center gap-2 text-sm text-muted/80 hover:text-fg">
              <span className="grid size-14 place-items-center rounded-lg border border-dashed border-edge-soft text-2xl">+</span>
              Ajouter
            </button>
          )}
        </div>
        {profilesMode === 'local' && (
          <p className="mt-4 text-xs text-muted/80">Backend injoignable : profils enregistrés dans ce navigateur uniquement.</p>
        )}
      </Panel>

      <Panel id="mediatheque" title="Médiathèque">
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
          <Status ok={apiReachable}>{apiReachable ? (desktop ? 'Serveur intégré actif' : 'API connectée') : desktop ? 'Serveur intégré injoignable — relance l’app' : 'API injoignable — lance « npm run dev » à la racine du projet'}</Status>
          {counts && <span className="text-sm text-muted">{counts} indexés</span>}
          {scannedAt && <span className="text-sm text-muted/80">Dernier scan : {new Date(scannedAt).toLocaleString('fr-FR')}</span>}
        </div>

        <FoldersEditor onSaved={() => reload()} />

        <div className="mt-6 border-t border-line pt-5">
        <button
          type="button"
          onClick={runScan}
          disabled={!apiReachable || scan.state === 'running'}
          className="inline-flex items-center gap-2 rounded-md border border-edge-soft px-4 py-2 text-sm font-semibold transition hover:border-edge disabled:cursor-not-allowed disabled:opacity-40"
        >
          {scan.state === 'running' ? <Loader2 className="size-4 animate-spin" /> : <FolderSearch className="size-4" />}
          Rescanner maintenant
        </button>
        <span className="ml-3 text-xs text-muted/80">Après avoir ajouté des fichiers dans tes dossiers.</span>

        {scan.state === 'done' && (
          <p className="mt-3 text-sm text-fg/80">
            Scan terminé en {scan.res.durationMs} ms — {scan.res.counts.movies} films, {scan.res.counts.shows} séries, {scan.res.counts.episodes} épisodes.
          </p>
        )}
        {scan.state === 'error' && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{scan.message}</p>}
        </div>

        {desktop && (
          <button type="button" onClick={() => desktop.openDataFolder()} className="mt-4 text-xs text-muted/80 underline underline-offset-4 hover:text-fg">
            Ouvrir le dossier des données de l'app dans le Finder
          </button>
        )}
      </Panel>

      <Panel id="demo" title="Catalogue de démonstration">
        <div role="radiogroup" aria-label="Affichage du catalogue de démonstration" className="inline-flex rounded-lg border border-edge-soft bg-field p-1">
          {DEMO_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={demoPref === o.value}
              onClick={() => setDemoPref(o.value)}
              className="rounded-md px-4 py-1.5 text-sm text-muted transition hover:text-fg aria-checked:bg-brand-soft aria-checked:font-semibold aria-checked:text-brand-ink"
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">{DEMO_OPTIONS.find((o) => o.value === demoPref)?.hint}</p>
        <p className="mt-1 text-sm text-muted/80">
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
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
          >
            <RefreshCw className="size-3.5" /> Revérifier
          </button>
        </div>
        {ollama?.models?.length > 0 && <p className="mt-3 text-xs text-muted/80">Modèles installés : {ollama.models.join(', ')}</p>}
      </Panel>

      <ProfilesDialog mode={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
