import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { generateArtwork } from '../lib/artwork.js';

/** Vignette 16:9 avec barre de progression (signature), puis titre et reste à voir — « Continuer la lecture ». */
export default function ContinueCard({ item }) {
  const art = useMemo(
    () => item.backdrop ?? generateArtwork({ seed: `${item.id}-still`, format: 'landscape', ...item.art }),
    [item.backdrop, item.id, item.art],
  );
  const pct = Math.round((item.progress ?? 0) * 100);
  const remaining = item.durationMin ? Math.max(1, Math.round(item.durationMin * (1 - item.progress))) : null;
  const detail =
    item.type === 'show'
      ? `Saison ${item.resume?.season ?? 1} · Épisode ${item.resume?.episode ?? 1}`
      : remaining
        ? `Encore ${remaining} min`
        : `${pct} %`;

  return (
    <Link
      to={`/watch/${item.id}`}
      className="group w-[248px] shrink-0 snap-start outline-none sm:w-[272px] xl:w-[296px]"
      aria-label={`Reprendre ${item.title} — ${pct} % vus`}
    >
      <div className="relative aspect-video overflow-hidden rounded-md bg-surface-2 outline-offset-2 outline-brand group-focus-visible:outline-2">
        <img src={art} alt="" loading="lazy" className="size-full object-cover transition-[filter] duration-200 group-hover:brightness-110" />
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-black/10 ring-inset dark:ring-white/6" />
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 grid size-10 -translate-1/2 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <Play className="size-4 translate-x-px" fill="currentColor" />
        </span>
        <div
          className="absolute inset-x-0 bottom-0 h-[3px] bg-black/45"
          role="progressbar"
          aria-label="Progression"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <p className="mt-2 truncate text-sm leading-tight font-medium text-fg">{item.title}</p>
      <p className="mt-0.5 truncate text-xs text-faint tabular-nums">{detail}</p>
    </Link>
  );
}
