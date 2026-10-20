import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import MediaCard from '../components/MediaCard.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import { useLibrary } from '../hooks/useLibrary.jsx';

const VIEWS = {
  movies: { title: 'Films', pick: (ctx) => ctx.library.movies },
  shows: { title: 'Séries', pick: (ctx) => ctx.library.shows },
  recent: { title: 'Ajoutés récemment', pick: (ctx) => ctx.recent.slice(0, 40) },
};

/** Grille de posters pour /movies, /shows et /recent. */
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
    <div className="px-5 pt-24 sm:px-10 lg:px-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold halo-text">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            {items.length} titre{items.length > 1 ? 's' : ''}
          </p>
        </div>
        <label className="flex w-full items-center gap-2 rounded-md border border-edge-soft bg-field px-3 py-2 text-sm focus-field sm:w-72">
          <Search className="size-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titre ou genre…"
            className="w-full bg-transparent outline-none placeholder:text-muted/80"
          />
        </label>
      </div>

      {items.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-5 sm:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} onSelect={setSelected} className="w-full" />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-muted">Aucun titre ne correspond.</p>
      )}

      <DetailsModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
