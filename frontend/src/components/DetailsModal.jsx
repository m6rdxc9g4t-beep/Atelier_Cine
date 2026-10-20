import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import MetaLine from './MetaLine.jsx';
import SpaceScene from './SpaceScene.jsx';
import { generateArtwork } from '../lib/artwork.js';

/** Fiche détaillée ("Plus d'infos") basée sur <dialog> natif : Échap et focus gérés par le navigateur. */
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
      className="m-auto w-[min(48rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-ink-850 p-0 text-fg shadow-2xl neon-panel-strong backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {item && (
        <article>
          <div className="relative aspect-video">
            {item.id === 'm-orbit' && !item.backdrop ? (
              <SpaceScene className="absolute inset-0 size-full" />
            ) : (
              <img src={item.backdrop ?? art} alt="" className="absolute inset-0 size-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/20 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-black/60 hover:bg-black/80"
            >
              <X className="size-5" />
            </button>
            <h2 className="absolute bottom-4 left-6 font-display text-4xl font-semibold sm:text-5xl">{item.title}</h2>
          </div>

          <div className="space-y-5 px-6 pt-2 pb-7">
            <MetaLine item={item} />
            <div className="flex gap-3">
              <Link
                to={`/watch/${item.id}`}
                onClick={onClose}
                className="inline-flex items-center gap-2 btn-signature rounded-md px-6 py-2.5 font-semibold transition"
              >
                <Play className="size-5" fill="currentColor" /> Regarder
              </Link>
            </div>
            {item.synopsis && <p className="leading-relaxed text-neutral-300">{item.synopsis}</p>}
            {item.genres?.length > 0 && (
              <p className="text-sm text-neutral-400">
                <span className="text-neutral-500">Genres : </span>
                {item.genres.join(', ')}
              </p>
            )}
            {item.type === 'show' && item.episodes && (
              <p className="text-sm text-neutral-400">
                {item.seasons} saison{item.seasons > 1 ? 's' : ''} · {item.episodes} épisodes
              </p>
            )}
            {item.path && <p className="truncate font-mono text-xs text-neutral-500" title={item.path}>{item.path}</p>}
          </div>
        </article>
      )}
    </dialog>
  );
}
