import { formatDuration, formatSeasons } from '../lib/format.js';

function Badge({ children }) {
  return (
    <span className="rounded-md border border-edge-soft px-2 py-0.5 text-[0.9em] leading-tight text-fg/90">
      {children}
    </span>
  );
}

/** "2024 [13+] 2h 15m [4K Ultra HD] [HDR]" */
export default function MetaLine({ item, className = '' }) {
  const duration = item.type === 'show' ? formatSeasons(item) : formatDuration(item.durationMin);
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-fg/80 ${className}`}>
      {item.year && <span>{item.year}</span>}
      {item.rating && <Badge>{item.rating}</Badge>}
      {duration && <span>{duration}</span>}
      {item.quality?.length > 0 && (
        <span className="flex gap-2">
          {item.quality.map((q) => (
            <Badge key={q}>{q}</Badge>
          ))}
        </span>
      )}
    </div>
  );
}
