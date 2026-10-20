import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { generateArtwork } from '../lib/artwork.js';

/** Carte paysage 16:9 avec barre de progression (couleur signature) — "Continuer la lecture". */
export default function ContinueCard({ item }) {
  const art = useMemo(
    () => item.backdrop ?? generateArtwork({ seed: `${item.id}-still`, format: 'landscape', ...item.art }),
    [item.backdrop, item.id, item.art],
  );
  const pct = Math.round((item.progress ?? 0) * 100);
  const remaining = item.durationMin ? Math.max(1, Math.round(item.durationMin * (1 - item.progress))) : null;

  return (
    <Link
      to={`/watch/${item.id}`}
      className="group relative w-64 shrink-0 snap-start overflow-hidden rounded-md bg-ink-800 shadow-lg shadow-black/40 outline-none ring-neon transition hover:shadow-[var(--atelier-glow-strong)] hover:ring-2 focus-visible:ring-2 sm:w-72 xl:w-80"
      aria-label={`Reprendre ${item.title} — ${pct} % vus`}
    >
      <div className="relative aspect-video">
        <img src={art} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/10 to-transparent p-3 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="mr-3 grid size-9 shrink-0 place-items-center rounded-full bg-brand text-[var(--atelier-signature-contrast)]">
            <Play className="size-4 translate-x-px" fill="currentColor" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{item.title}</span>
            <span className="block text-xs text-neutral-300">
              {item.type === 'show' ? `Saison ${item.resume?.season ?? 1} · Épisode ${item.resume?.episode ?? 1}` : remaining ? `Encore ${remaining} min` : `${pct} %`}
            </span>
          </span>
        </div>
      </div>
      <div className="h-1 bg-neon/15" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-brand shadow-[var(--atelier-signature-glow)]" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
