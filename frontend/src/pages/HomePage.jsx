import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, FolderSearch, Sparkles } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import HeroBanner from '../components/HeroBanner.jsx';
import Carousel from '../components/Carousel.jsx';
import ContinueCard from '../components/ContinueCard.jsx';
import MediaCard from '../components/MediaCard.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import { useLibrary } from '../hooks/useLibrary.jsx';

export default function HomePage() {
  const { featured, continueWatching, library, setDemoPref, status } = useLibrary();
  const [selected, setSelected] = useState(null);

  // Premier chargement : la barre seule, le contenu arrive (évite d'afficher « vide » une fraction de seconde).
  if (!featured && status === 'loading') {
    return (
      <>
        <TopBar title="Accueil" />
        <div className="p-4 md:p-5" aria-busy="true">
          <div className="h-[clamp(26rem,62vh,36rem)] animate-pulse rounded-lg bg-surface-2" />
        </div>
      </>
    );
  }

  // Démo désactivée et médiathèque vide : on guide vers la configuration.
  if (!featured) {
    return (
      <>
        <TopBar title="Accueil" />
        <div className="grid min-h-[70vh] place-items-center px-6 text-center">
          <div className="max-w-md">
            <Film aria-hidden className="mx-auto size-6 text-faint" strokeWidth={1.75} />
            <h2 className="mt-3 text-lg font-semibold">Ta médiathèque est vide</h2>
            <p className="mt-1.5 text-muted">
              Aucun film ni série n'a été trouvé dans les dossiers configurés. Indique où se trouvent tes vidéos dans{' '}
              <code>backend/.env</code>, puis relance un scan.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link to="/settings#mediatheque" className="btn btn-primary">
                <FolderSearch aria-hidden /> Configurer mes dossiers
              </Link>
              <button type="button" onClick={() => setDemoPref('auto')} className="btn">
                <Sparkles aria-hidden /> Voir la démo
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Accueil" />

      <div className="p-4 md:p-5">
        <HeroBanner item={featured} onMoreInfo={setSelected} />
      </div>

      <div className="space-y-7 pt-2 pb-8">
        {continueWatching.length > 0 && (
          <Carousel title="Continuer la lecture" count={continueWatching.length}>
            {continueWatching.map((item) => (
              <ContinueCard key={item.id} item={item} />
            ))}
          </Carousel>
        )}

        {library.movies.length > 0 && (
          <Carousel title="Mes Films" count={library.movies.length}>
            {library.movies.map((item) => (
              <MediaCard key={item.id} item={item} onSelect={setSelected} />
            ))}
          </Carousel>
        )}

        {library.shows.length > 0 && (
          <Carousel title="Mes Séries" count={library.shows.length}>
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
