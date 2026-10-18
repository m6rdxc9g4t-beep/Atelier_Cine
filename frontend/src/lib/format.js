export function formatDuration(minutes) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (!h) return `${m}m`;
  return m ? `${h}h ${String(m).padStart(2, '0')}m` : `${h}h`;
}

export function formatSeasons(item) {
  if (!item.seasons) return null;
  return `${item.seasons} saison${item.seasons > 1 ? 's' : ''}`;
}

export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}
