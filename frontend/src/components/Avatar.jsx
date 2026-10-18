import { initials } from '../hooks/useProfiles.jsx';

const SIZES = { sm: 'size-8 text-xs rounded-md', md: 'size-11 text-sm rounded-full', lg: 'size-14 text-lg rounded-lg' };

export default function Avatar({ profile, size = 'md', className = '' }) {
  const color = profile?.color ?? '#3a3b42';
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center font-display font-semibold text-white ${SIZES[size]} ${className}`}
      style={{ background: `linear-gradient(140deg, ${color}, color-mix(in srgb, ${color} 45%, #000))` }}
    >
      {initials(profile?.name)}
    </span>
  );
}
