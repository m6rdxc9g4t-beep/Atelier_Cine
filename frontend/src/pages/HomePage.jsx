import { useState } from 'react';
import HeroBanner from '../components/HeroBanner.jsx';
import Carousel from '../components/Carousel.jsx';
import ContinueCard from '../components/ContinueCard.jsx';
import MediaCard from '../components/MediaCard.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import { useLibrary } from '../hooks/useLibrary.jsx';

export default function HomePage() {
  const { featured, continueWatching, library } = useLibrary();
  const [selected, setSelected] = useState(null);

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

        <Carousel title="Mes Films">
          {library.movies.map((item) => (
            <MediaCard key={item.id} item={item} onSelect={setSelected} />
          ))}
        </Carousel>

        <Carousel title="Mes Séries">
          {library.shows.map((item) => (
            <MediaCard key={item.id} item={item} onSelect={setSelected} />
          ))}
        </Carousel>
      </div>

      <DetailsModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
