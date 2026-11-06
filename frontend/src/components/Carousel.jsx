import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Rangée horizontale défilante (clavier, trackpad, tactile). Les flèches vivent dans l'en-tête de la rangée,
 * à droite du titre : elles ne couvrent jamais les affiches.
 */
export default function Carousel({ title, count, children, action }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    const ro = new ResizeObserver(update);
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [update, children]);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section aria-label={title}>
      <div className="mb-2.5 flex h-[30px] items-center gap-2 px-4 md:px-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        {count != null && <span className="text-meta font-medium text-faint tabular-nums">{count}</span>}
        <div className="flex-1" />
        {action}
        {(canPrev || canNext) && (
          <div className="hidden gap-0.5 md:flex">
            <button type="button" aria-label={`Précédent — ${title}`} disabled={!canPrev} onClick={() => scrollBy(-1)} className="btn btn-ghost btn-icon">
              <ChevronLeft aria-hidden />
            </button>
            <button type="button" aria-label={`Suivant — ${title}`} disabled={!canNext} onClick={() => scrollBy(1)} className="btn btn-ghost btn-icon">
              <ChevronRight aria-hidden />
            </button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        onScroll={update}
        className="scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4 pt-1 pb-1 md:scroll-px-5 md:gap-4 md:px-5"
      >
        {children}
      </div>
    </section>
  );
}
