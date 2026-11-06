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

/**
 * Bannière « À l'affiche » : l'image du titre mène, l'interface se pose dessus avec un simple voile
 * de lisibilité. C'est un « écran » : toujours dans le thème sombre, quel que soit celui de l'app.
 */
export default function HeroBanner({ item, onMoreInfo }) {
  if (!item) return null;
  return (
    <section
      data-theme="dark"
      aria-label={`À l'affiche : ${item.title}`}
      className="dark relative isolate h-[clamp(26rem,62vh,36rem)] overflow-hidden rounded-lg bg-black text-fg"
    >
      <Backdrop item={item} />

      {/* Voile de lisibilité : gauche et bas, vers le noir de l'image (pas de couleur). */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:via-black/25" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-white/8 ring-inset" />

      <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-8 lg:p-10">
        <TitleTreatment title={item.title} slashedO={item.titleStyle === 'slashed-o'} className="text-white" />

        <MetaLine item={item} className="mt-4 text-sm text-white/75" />

        {item.synopsis && (
          <p className="mt-3 hidden max-w-[56ch] text-base text-white/80 lg:block">{item.synopsis}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link to={`/watch/${item.id}`} className="btn btn-primary btn-lg">
            <Play fill="currentColor" aria-hidden />
            Regarder
          </Link>
          <button type="button" onClick={() => onMoreInfo?.(item)} className="btn btn-lg">
            <Info aria-hidden />
            Plus d'infos
          </button>
        </div>
      </div>
    </section>
  );
}
