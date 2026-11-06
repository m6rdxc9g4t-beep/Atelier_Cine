import { formatDuration, formatSeasons } from '../lib/format.js';

function Badge({ children }) {
  return (
    <span className="inline-flex h-5 items-center rounded-sm border border-edge-soft px-1.5 text-xs leading-none font-medium text-fg">
      {children}
    </span>
  );
}

/** "2024 [13+] 2h 15m [4K Ultra HD] [HDR]" */
export default function MetaLine({ item, className = '' }) {
  const duration = item.type === 'show' ? formatSeasons(item) : formatDuration(item.durationMin);
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted tabular-nums ${className}`}>
      {item.year && <span>{item.year}</span>}
      {item.rating && <Badge>{item.rating}</Badge>}
      {duration && <span>{duration}</span>}
      {item.quality?.length > 0 && (
        <span className="flex gap-1.5">
          {item.quality.map((q) => (
            <Badge key={q}>{q}</Badge>
          ))}
        </span>
      )}
    </div>
  );
}
