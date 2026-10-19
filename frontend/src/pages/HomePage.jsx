import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderSearch, Sparkles } from 'lucide-react';
import HeroBanner from '../components/HeroBanner.jsx';
import Carousel from '../components/Carousel.jsx';
import ContinueCard from '../components/ContinueCard.jsx';
import MediaCard from '../components/MediaCard.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import { useLibrary } from '../hooks/useLibrary.jsx';

export default function HomePage() {
  const { featured, continueWatching, library, setDemoPref } = useLibrary();
  const [selected, setSelected] = useState(null);

  // Démo désactivée et médiathèque vide : on guide vers la configuration.
  if (!featured) {
    return (
      <div className="grid min-h-[80vh] place-items-center px-6 text-center">
        <div className="max-w-lg">
          <h1 className="font-display text-4xl font-semibold">Ta médiathèque est vide</h1>
          <p className="mt-4 text-neutral-400">
            Aucun film ni série n'a été trouvé dans les dossiers configurés. Indique où se trouvent tes vidéos dans{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">backend/.env</code>, puis relance un scan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/settings#mediatheque" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 font-semibold text-black hover:bg-white/85">
              <FolderSearch className="size-5" /> Configurer mes dossiers
            </Link>
            <button
              type="button"
              onClick={() => setDemoPref('auto')}
              className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
            >
              <Sparkles className="size-5" /> Voir la démo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroBanner item={featured} onMoreInfo={setSelected} />

      {/* Les rangées remontent sur le bas de la bannière, comme sur la maquette */}
      <div className="relative z-10 -mt-32 space-y-10">
        {continueWatching.length > 0 && (
          <Carousel title="Continuer la lecture">
            {continueWatching.map((item) => (
              <ContinueCard key={item.id} item={item} />
            ))}
          </Carousel>
        )}

        {library.movies.length > 0 && (
          <Carousel title="Mes Films">
            {library.movies.map((item) => (
              <MediaCard key={item.id} item={item} onSelect={setSelected} />
            ))}
          </Carousel>
        )}

        {library.shows.length > 0 && (
          <Carousel title="Mes Séries">
            {library.shows.map((item) => (
              <MediaCard key={item.id} item={item} onSelect={setSelected} />
            ))}
          </Carousel>
        )}
      </div>

      <DetailsModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
