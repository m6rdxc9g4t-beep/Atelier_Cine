import { Info, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import SpaceScene from './SpaceScene.jsx';
import MetaLine from './MetaLine.jsx';
import TitleTreatment from './TitleTreatment.jsx';
import { generateArtwork } from '../lib/artwork.js';

function Backdrop({ item }) {
  if (item.backdrop) {
    return <img src={item.backdrop} alt="" className="absolute inset-0 size-full object-cover object-right" />;
  }
  if (item.art?.motif === 'planet' || item.id === 'm-orbit') {
    return <SpaceScene className="absolute inset-0 size-full" />;
  }
  return (
    <img
      src={generateArtwork({ seed: item.id, format: 'landscape', ...item.art })}
      alt=""
      className="absolute inset-0 size-full object-cover"
    />
  );
}

export default function HeroBanner({ item, onMoreInfo }) {
  if (!item) return null;
  return (
    <section aria-label={`À l'affiche : ${item.title}`} className="relative isolate min-h-[34rem] h-[78vh] max-h-[52rem] overflow-hidden">
      <Backdrop item={item} />

      {/* Dégradés de lisibilité : gauche + bas vers le fond de page */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/55 to-transparent md:via-ink-950/35" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-center px-5 pb-28 sm:px-10 lg:px-16">
        <TitleTreatment
          title={item.title}
          slashedO={item.titleStyle === 'slashed-o'}
          className="leading-[0.95] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
        />

        <MetaLine item={item} className="mt-6 text-lg" />

        {item.synopsis && (
          <p className="mt-5 hidden max-w-xl text-base leading-relaxed text-neutral-300 lg:block">{item.synopsis}</p>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to={`/watch/${item.id}`}
            className="inline-flex items-center gap-3 rounded-md bg-white px-7 py-3.5 text-lg font-semibold text-black transition hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Play className="size-6" fill="currentColor" />
            Regarder
          </Link>
          <button
            type="button"
            onClick={() => onMoreInfo?.(item)}
            className="inline-flex items-center gap-3 rounded-md border border-white/20 bg-neutral-500/40 px-7 py-3.5 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-neutral-500/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Info className="size-6" />
            Plus d'infos
          </button>
        </div>
      </div>
    </section>
  );
}
