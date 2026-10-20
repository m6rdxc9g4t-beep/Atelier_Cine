import { useMemo } from 'react';
import { generateArtwork } from '../lib/artwork.js';

/** Affiche verticale (format 2:3) — utilisée par "Mes Films", "Mes Séries" et les grilles. */
export default function MediaCard({ item, onSelect, className = 'w-36 sm:w-40 xl:w-44' }) {
  const art = useMemo(
    () => item.poster ?? generateArtwork({ seed: item.id, format: 'poster', ...item.art }),
    [item.poster, item.id, item.art],
  );

  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className={`group relative shrink-0 snap-start overflow-hidden rounded-lg bg-ink-800 text-left shadow-lg shadow-black/40 outline-none
        ring-neon transition duration-300 hover:shadow-[var(--atelier-glow-strong)] focus-visible:shadow-[var(--atelier-glow-strong)] hover:z-10 hover:scale-[1.04] hover:ring-[3px] focus-visible:scale-[1.04] focus-visible:ring-[3px] ${className}`}
      aria-label={`${item.title}${item.year ? ` (${item.year})` : ''}`}
    >
      <div className="aspect-[2/3] w-full">
        <img src={art} alt="" loading="lazy" className="size-full object-cover" />
      </div>

      {/* Titre incrusté seulement si l'affiche est générée */}
      {!item.poster && (
        <div className="absolute inset-x-0 bottom-0 p-3 pb-4 text-center">
          <p className="font-display text-[1.05rem] leading-tight font-bold tracking-wide text-white uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] sm:text-lg">
            {item.title}
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-2 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        {item.quality?.includes('4K Ultra HD') && (
          <span className="rounded bg-black/70 px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide">4K</span>
        )}
        {item.year && <span className="rounded bg-black/70 px-1.5 py-0.5 text-[0.65rem]">{item.year}</span>}
      </div>
    </button>
  );
}
