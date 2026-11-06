import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import MetaLine from './MetaLine.jsx';
import SpaceScene from './SpaceScene.jsx';
import { generateArtwork } from '../lib/artwork.js';

/** Fiche détaillée (« Plus d'infos ») basée sur <dialog> natif : Échap et focus gérés par le navigateur. */
export default function DetailsModal({ item, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dlg = ref.current;
    if (item && dlg && !dlg.open) dlg.showModal();
    if (!item && dlg?.open) dlg.close();
  }, [item]);

  const art = useMemo(
    () => (item && !item.backdrop ? generateArtwork({ seed: `${item.id}-still`, format: 'landscape', ...item.art }) : null),
    [item],
  );

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={item?.title}
      className="pop m-auto max-h-[calc(100dvh-2rem)] w-[min(44rem,calc(100vw-2rem))] overflow-y-auto p-0 text-fg"
    >
      {item && (
        <article>
          <div className="relative aspect-video bg-black">
            {item.id === 'm-orbit' && !item.backdrop ? (
              <SpaceScene className="absolute inset-0 size-full" />
            ) : (
              <img src={item.backdrop ?? art} alt="" className="absolute inset-0 size-full object-cover" />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-3 right-3 grid size-[30px] place-items-center rounded-md bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>

          <div className="px-5 pt-4 pb-5 sm:px-6">
            <h2 className="text-xl font-semibold tracking-[-0.012em]">{item.title}</h2>
            <MetaLine item={item} className="mt-2" />
            <div className="mt-4 flex gap-2">
              <Link to={`/watch/${item.id}`} onClick={onClose} className="btn btn-primary">
                <Play fill="currentColor" aria-hidden /> Regarder
              </Link>
            </div>
            {item.synopsis && <p className="mt-4 max-w-[65ch] text-base text-fg">{item.synopsis}</p>}
            {(item.genres?.length > 0 || (item.type === 'show' && item.episodes) || item.path) && (
            <dl className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
              {item.genres?.length > 0 && (
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-faint">Genres</dt>
                  <dd className="text-muted">{item.genres.join(', ')}</dd>
                </div>
              )}
              {item.type === 'show' && item.episodes && (
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-faint">Saisons</dt>
                  <dd className="text-muted tabular-nums">
                    {item.seasons} saison{item.seasons > 1 ? 's' : ''} · {item.episodes} épisodes
                  </dd>
                </div>
              )}
              {item.path && (
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-faint">Fichier</dt>
                  <dd className="min-w-0 truncate font-mono text-xs leading-5 text-muted" title={item.path}>
                    {item.path}
                  </dd>
                </div>
              )}
            </dl>
            )}
          </div>
        </article>
      )}
    </dialog>
  );
}
