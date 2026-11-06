import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api.js';
import { useLibrary } from '../hooks/useLibrary.jsx';

// Deux encodages : MP4/H.264 (Safari, Chrome, Edge) et WebM/VP9 (Firefox, Chromium sans codecs propriétaires).
const DEMO_SOURCES = [
  { src: '/demo/orbit-teaser.mp4', type: 'video/mp4' },
  { src: '/demo/orbit-teaser.webm', type: 'video/webm' },
];

/**
 * Lecteur HTML5 natif.
 * - Mode démo : bande-annonce de démonstration embarquée (frontend/public/demo).
 * - Médiathèque réelle : flux de GET /api/stream/:id (requêtes Range).
 */
export default function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { byId, isDemo, status } = useLibrary();
  const [failed, setFailed] = useState(false);
  const item = byId.get(id);

  const back = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));
  const sources = isDemo ? DEMO_SOURCES : item?.type === 'movie' ? [{ src: api.streamUrl(id) }] : null;

  let message = null;
  if (status === 'loading') message = null;
  else if (!item) message = { title: 'Titre introuvable', text: "Ce média n'existe plus dans la médiathèque. Relance un scan depuis les Paramètres." };
  else if (!sources) message = { title: item.title, text: 'La lecture des épisodes arrive à la prochaine étape (choix de la saison et de l\'épisode).' };
  else if (failed)
    message = {
      title: 'Lecture impossible',
      text: isDemo
        ? 'La vidéo de démonstration ne peut pas être lue ici (fichiers dans frontend/public/demo).'
        : "Le navigateur ne sait pas lire ce fichier (format ou codec non pris en charge, ou fichier vide). Le transcodage FFmpeg arrive dans une prochaine étape.",
    };

  return (
    // Le lecteur reste noir dans les deux thèmes ; seuls la barre du haut et les contrôles natifs se posent dessus.
    <div data-theme="dark" className="dark fixed inset-0 z-50 bg-black text-fg">
      <div className="absolute inset-x-0 top-0 z-10 flex h-14 items-center gap-3 bg-gradient-to-b from-black/75 to-transparent px-3 md:px-4 mac-window:pl-20">
        <button
          type="button"
          onClick={back}
          className="inline-flex h-[30px] items-center gap-1.5 rounded-md px-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft aria-hidden className="size-4" /> Retour
        </button>
        {item && (
          <p className="flex min-w-0 items-baseline gap-2 text-sm font-semibold text-white">
            <span className="truncate">{item.title}</span>
            {isDemo && <span className="shrink-0 text-xs font-medium text-warn">Démo · bande-annonce</span>}
          </p>
        )}
      </div>

      {message ? (
        <div className="grid h-full place-items-center px-6 text-center">
          <div className="max-w-md">
            {failed && <AlertTriangle aria-hidden className="mx-auto mb-3 size-6 text-warn" strokeWidth={1.75} />}
            <h1 className="text-xl font-semibold tracking-[-0.012em]">{message.title}</h1>
            <p className="mt-2 text-muted">{message.text}</p>
            <Link to="/settings" className="mt-5 inline-block text-sm font-medium text-brand-ink underline hover:text-fg">
              Ouvrir les Paramètres
            </Link>
          </div>
        </div>
      ) : (
        sources && (
          // Avec plusieurs <source>, le navigateur essaie chacune dans l'ordre : seule l'erreur
          // de la dernière signifie qu'aucune n'est lisible.
          <video key={id} controls autoPlay playsInline className="size-full bg-black">
            {sources.map((s, i) => (
              <source key={s.src} src={s.src} type={s.type} onError={i === sources.length - 1 ? () => setFailed(true) : undefined} />
            ))}
          </video>
        )
      )}
    </div>
  );
}
