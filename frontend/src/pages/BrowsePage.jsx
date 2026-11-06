import { useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import MediaCard from '../components/MediaCard.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import { useLibrary } from '../hooks/useLibrary.jsx';

const VIEWS = {
  movies: { title: 'Films', pick: (ctx) => ctx.library.movies },
  shows: { title: 'Séries', pick: (ctx) => ctx.library.shows },
  recent: { title: 'Ajoutés récemment', pick: (ctx) => ctx.recent.slice(0, 40) },
};

/** Grille d'affiches pour /movies, /shows et /recent ; la recherche vit dans la barre haute. */
export default function BrowsePage({ view }) {
  const ctx = useLibrary();
  const { title, pick } = VIEWS[view];
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = pick(ctx);
    return q ? list.filter((m) => m.title.toLowerCase().includes(q) || m.genres?.some((g) => g.toLowerCase().includes(q))) : list;
  }, [ctx, pick, query]);

  return (
    <>
      <TopBar title={title} count={items.length}>
        <label className="input flex h-[30px] w-full items-center gap-2 px-2.5 text-sm md:w-64">
          <Search aria-hidden className="size-4 shrink-0 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titre ou genre…"
            aria-label={`Rechercher dans ${title.toLowerCase()}`}
            className="w-full min-w-0 bg-transparent outline-none placeholder:text-faint"
          />
        </label>
      </TopBar>

      <div className="px-4 pt-4 pb-8 md:px-5 md:pt-5">
        {items.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-x-3 gap-y-5 sm:grid-cols-[repeat(auto-fill,minmax(148px,1fr))] md:gap-x-4">
            {items.map((item) => (
              <MediaCard key={item.id} item={item} onSelect={setSelected} className="w-full" />
            ))}
          </div>
        ) : (
          <div className="grid place-items-center py-24 text-center">
            <SearchX aria-hidden className="size-6 text-faint" strokeWidth={1.75} />
            <p className="mt-3 text-lg font-semibold">Aucun titre ne correspond.</p>
            {query && (
              <button type="button" onClick={() => setQuery('')} className="btn mt-4">
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>

      <DetailsModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
