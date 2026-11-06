import { useMemo } from 'react';
import { generateArtwork } from '../lib/artwork.js';

/**
 * Affiche verticale (2:3) suivie du titre et de l'année — « Mes Films », « Mes Séries » et les grilles.
 * L'affiche (ou la vignette générée, sans texte) porte la couleur ; la légende reste dans le système.
 */
export default function MediaCard({ item, onSelect, className = 'w-[136px] sm:w-[148px] xl:w-[160px]' }) {
  const art = useMemo(
    () => item.poster ?? generateArtwork({ seed: item.id, format: 'poster', ...item.art }),
    [item.poster, item.id, item.art],
  );
  const is4k = item.quality?.includes('4K Ultra HD');
  const meta = [item.year, item.genres?.[0]].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className={`group shrink-0 snap-start text-left outline-none ${className}`}
      aria-label={`${item.title}${item.year ? ` (${item.year})` : ''}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface-2 outline-offset-2 outline-brand group-focus-visible:outline-2">
        <img
          src={art}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-[filter] duration-200 group-hover:brightness-110"
        />
        {/* Filet intérieur : l'affiche garde un bord net sur fond clair comme sombre. */}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-black/10 ring-inset dark:ring-white/6" />
        {is4k && (
          <span className="absolute top-1.5 left-1.5 rounded-sm bg-black/65 px-1 py-px text-[10px] leading-4 font-semibold text-white">
            4K
          </span>
        )}
      </div>
      <p className="mt-2 truncate text-sm leading-tight font-medium text-fg">{item.title}</p>
      {meta && <p className="mt-0.5 truncate text-xs text-faint tabular-nums">{meta}</p>}
    </button>
  );
}
