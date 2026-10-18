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
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent px-5 py-4 mac-window:pt-11">
        <button
          type="button"
          onClick={back}
          className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-white"
        >
          <ArrowLeft className="size-4" /> Retour
        </button>
        {item && (
          <p className="truncate font-display text-lg font-semibold">
            {item.title}
            {isDemo && <span className="ml-3 align-middle text-xs font-normal tracking-wide text-amber-200/90 uppercase">Démo · bande-annonce</span>}
          </p>
        )}
      </div>

      {message ? (
        <div className="grid h-full place-items-center px-6 text-center">
          <div className="max-w-md">
            {failed && <AlertTriangle className="mx-auto mb-4 size-10 text-amber-300" />}
            <h1 className="font-display text-3xl font-semibold">{message.title}</h1>
            <p className="mt-3 text-neutral-400">{message.text}</p>
            <Link to="/settings" className="mt-6 inline-block text-sm text-neutral-300 underline underline-offset-4 hover:text-white">
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
