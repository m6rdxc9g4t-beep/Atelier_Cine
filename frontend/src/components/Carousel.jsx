import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Rangée horizontale défilante avec flèches au survol (clavier + tactile OK). */
export default function Carousel({ title, children, action }) {
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

  const arrow =
    'absolute top-0 bottom-0 z-20 hidden w-12 items-center justify-center bg-ink-950/60 text-neon opacity-0 transition group-hover/row:opacity-100 hover:bg-ink-950/80 focus-visible:opacity-100 md:flex';

  return (
    <section className="group/row relative" aria-label={title}>
      <div className="mb-3 flex items-baseline justify-between px-5 sm:px-10 lg:px-16">
        <h2 className="font-display text-xl font-semibold text-fg sm:text-2xl">{title}</h2>
        {action}
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          onScroll={update}
          className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 py-3 scroll-px-5 sm:gap-5 sm:px-10 sm:scroll-px-10 lg:gap-6 lg:px-16 lg:scroll-px-16"
        >
          {children}
        </div>

        {canPrev && (
          <button type="button" aria-label={`Précédent — ${title}`} onClick={() => scrollBy(-1)} className={`${arrow} left-0`}>
            <ChevronLeft className="size-8" />
          </button>
        )}
        {canNext && (
          <button type="button" aria-label={`Suivant — ${title}`} onClick={() => scrollBy(1)} className={`${arrow} right-0`}>
            <ChevronRight className="size-8" />
          </button>
        )}
      </div>
    </section>
  );
}
