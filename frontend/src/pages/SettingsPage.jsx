import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, CircleAlert, FolderSearch, Loader2, Monitor, Moon, Pencil, Plus, RefreshCw, Sun, XCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { useLibrary } from '../hooks/useLibrary.jsx';
import { useProfiles } from '../hooks/useProfiles.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { THEME_OPTIONS } from '../lib/theme.js';
import TopBar from '../components/TopBar.jsx';
import Avatar from '../components/Avatar.jsx';
import ProfilesDialog from '../components/ProfilesDialog.jsx';
import FoldersEditor from '../components/FoldersEditor.jsx';
import { desktop } from '../lib/desktop.js';

/**
 * État d'un service. Nominal = neutre (règle du témoin muet) ; « down » = rouge ; « off » = gris (facultatif absent).
 */
function Status({ tone = 'ok', children }) {
  const Icon = tone === 'ok' ? CheckCircle2 : tone === 'down' ? CircleAlert : XCircle;
  const color = tone === 'down' ? 'text-down' : 'text-muted';
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${color} ${tone === 'down' ? 'font-medium' : ''}`}>
      <Icon aria-hidden className={`size-4 shrink-0 ${tone === 'down' ? '' : 'text-faint'}`} strokeWidth={1.75} />
      {children}
    </span>
  );
}

function Panel({ id, title, children, action }) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="scroll-mt-16">
      <div className="mb-2.5 flex h-[30px] items-center justify-between gap-4">
        <h2 id={`${id}-titre`} className="text-lg font-semibold">
          {title}
        </h2>
        {action}
      </div>
      <div className="atelier-card p-4">{children}</div>
    </section>
  );
}

function Hint({ children, className = '' }) {
  return <p className={`text-sm text-muted ${className}`}>{children}</p>;
}

const DEMO_OPTIONS = [
  { value: 'auto', label: 'Automatique', hint: 'Affiché tant qu’aucun film ou série n’est trouvé dans tes dossiers.' },
  { value: 'on', label: 'Toujours', hint: 'Pratique pour tester l’interface, même avec une médiathèque remplie.' },
  { value: 'off', label: 'Jamais', hint: 'Seulement tes fichiers. Une page vide s’affiche s’il n’y a rien.' },
];

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

export default function SettingsPage() {
  const { reload, isDemo, hasReal, library, scannedAt, demoPref, setDemoPref, apiReachable } = useLibrary();
  const { profiles, active, setActiveId, mode: profilesMode } = useProfiles();
  const { preference: themePref, resolved: theme, setTheme } = useTheme();
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
    <>
      <TopBar title="Paramètres" />

      <div className="max-w-[720px] space-y-7 px-4 pt-5 pb-10 md:px-5">
        <Panel
          id="profils"
          title="Profils"
          action={
            <button type="button" onClick={() => setDialog('manage')} className="btn btn-ghost">
              <Pencil aria-hidden /> Gérer
            </button>
          }
        >
          <div className="flex flex-wrap gap-3">
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveId(p.id)}
                aria-pressed={p.id === active?.id}
                className="group flex w-[72px] flex-col items-center gap-2 rounded-md py-1.5 text-sm text-muted transition-colors hover:text-fg aria-pressed:font-medium aria-pressed:text-fg"
              >
                <Avatar
                  profile={p}
                  size="lg"
                  className="ring-offset-2 ring-offset-surface group-aria-pressed:ring-2 group-aria-pressed:ring-brand"
                />
                <span className="w-full truncate text-center">{p.name}</span>
              </button>
            ))}
            {profiles.length < 8 && (
              <button
                type="button"
                onClick={() => setDialog('add')}
                className="group flex w-[72px] flex-col items-center gap-2 rounded-md py-1.5 text-sm text-muted transition-colors hover:text-fg"
              >
                <span className="grid size-12 place-items-center rounded-full border border-dashed border-edge-soft text-faint transition-colors group-hover:border-faint group-hover:text-fg">
                  <Plus aria-hidden className="size-5" strokeWidth={1.75} />
                </span>
                Ajouter
              </button>
            )}
          </div>
          {profilesMode === 'local' && (
            <Hint className="mt-3 border-t border-line pt-3">Backend injoignable : profils enregistrés dans ce navigateur uniquement.</Hint>
          )}
        </Panel>

        <Panel id="apparence" title="Apparence">
          <div role="radiogroup" aria-label="Thème de l’interface" className="seg">
            {THEME_OPTIONS.map((o) => {
              const Icon = THEME_ICONS[o.value];
              return (
                <button key={o.value} type="button" role="radio" aria-checked={themePref === o.value} onClick={() => setTheme(o.value)}>
                  <Icon aria-hidden />
                  {o.label}
                </button>
              );
            })}
          </div>
          <Hint className="mt-3 text-fg">{THEME_OPTIONS.find((o) => o.value === themePref)?.hint}</Hint>
          {themePref === 'system' && <Hint className="mt-1">Actuellement : thème {theme === 'dark' ? 'sombre' : 'clair'}.</Hint>}
          <Hint className="mt-1">Le lecteur vidéo reste toujours sur fond noir.</Hint>
        </Panel>

        <Panel id="mediatheque" title="Médiathèque">
          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <Status tone={apiReachable ? 'ok' : 'down'}>
              {apiReachable
                ? desktop
                  ? 'Serveur intégré actif'
                  : 'API connectée'
                : desktop
                  ? 'Serveur intégré injoignable — relance l’app'
                  : 'API injoignable — lance « npm run dev » à la racine du projet'}
            </Status>
            {counts && <span className="text-sm text-muted tabular-nums">{counts} indexés</span>}
            {scannedAt && (
              <span className="text-sm text-faint tabular-nums">Dernier scan : {new Date(scannedAt).toLocaleString('fr-FR')}</span>
            )}
          </div>

          <FoldersEditor onSaved={() => reload()} />

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-4">
            <button type="button" onClick={runScan} disabled={!apiReachable || scan.state === 'running'} className="btn">
              {scan.state === 'running' ? <Loader2 aria-hidden className="animate-spin" /> : <FolderSearch aria-hidden />}
              Rescanner maintenant
            </button>
            <span className="text-xs text-faint">Après avoir ajouté des fichiers dans tes dossiers.</span>
          </div>
          {scan.state === 'done' && (
            <p className="mt-3 text-sm text-muted tabular-nums" role="status">
              Scan terminé en {scan.res.durationMs} ms — {scan.res.counts.movies} films, {scan.res.counts.shows} séries, {scan.res.counts.episodes} épisodes.
            </p>
          )}
          {scan.state === 'error' && (
            <p className="mt-3 text-sm text-down" role="alert">
              {scan.message}
            </p>
          )}

          {desktop && (
            <button type="button" onClick={() => desktop.openDataFolder()} className="mt-3 text-xs text-muted underline hover:text-fg">
              Ouvrir le dossier des données de l'app dans le Finder
            </button>
          )}
        </Panel>

        <Panel id="demo" title="Catalogue de démonstration">
          <div role="radiogroup" aria-label="Affichage du catalogue de démonstration" className="seg">
            {DEMO_OPTIONS.map((o) => (
              <button key={o.value} type="button" role="radio" aria-checked={demoPref === o.value} onClick={() => setDemoPref(o.value)}>
                {o.label}
              </button>
            ))}
          </div>
          <Hint className="mt-3 text-fg">{DEMO_OPTIONS.find((o) => o.value === demoPref)?.hint}</Hint>
          <Hint className="mt-1">
            {isDemo
              ? 'Actuellement : catalogue de démonstration affiché (la lecture joue une bande-annonce d’exemple).'
              : 'Actuellement : ta médiathèque est affichée.'}
          </Hint>
        </Panel>

        <Panel id="ia" title="IA locale (Ollama)">
          <div className="flex flex-wrap items-center gap-3">
            <Status tone={ollama?.available ? 'ok' : 'off'}>
              {ollama === null
                ? 'Vérification…'
                : ollama?.available
                  ? `Ollama disponible — modèle ${ollama.model}${ollama.modelInstalled ? '' : ' (non installé)'}`
                  : 'Ollama non détecté'}
            </Status>
            <button
              type="button"
              onClick={() => api.ollamaStatus().then(setOllama).catch(() => setOllama(false))}
              className="btn btn-ghost"
            >
              <RefreshCw aria-hidden /> Revérifier
            </button>
          </div>
          {ollama?.models?.length > 0 && <p className="mt-3 text-xs text-muted">Modèles installés : {ollama.models.join(', ')}</p>}
        </Panel>

        <ProfilesDialog mode={dialog} onClose={() => setDialog(null)} />
      </div>
    </>
  );
}
