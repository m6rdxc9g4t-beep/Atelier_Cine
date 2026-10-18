import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api.js';
import { useLibrary } from '../hooks/useLibrary.jsx';

/** Lecteur HTML5 natif. Le flux vient de GET /api/stream/:id (requêtes Range). */
export default function WatchPage() {
  const { id } = useParams();
  const { byId, source } = useLibrary();
  const item = byId.get(id);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Link
        to="/"
        className="absolute top-5 left-5 z-10 inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm hover:bg-black/80"
      >
        <ArrowLeft className="size-4" /> Retour
      </Link>

      {source === 'api' && item?.type === 'movie' ? (
        <video src={api.streamUrl(id)} controls autoPlay className="size-full bg-black" />
      ) : (
        <div className="grid h-full place-items-center px-6 text-center">
          <div>
            <h1 className="font-display text-4xl font-semibold">{item?.title ?? 'Titre introuvable'}</h1>
            <p className="mt-3 max-w-md text-neutral-400">
              {source === 'api'
                ? 'La lecture des épisodes arrive à la prochaine étape (choix saison/épisode).'
                : "Mode démo : lance le backend et configure un dossier vidéo pour lire tes propres fichiers."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
