import { initials } from '../hooks/useProfiles.jsx';

const SIZES = {
  xs: 'size-5 text-[10px]',
  sm: 'size-6 text-[11px]',
  md: 'size-8 text-xs',
  lg: 'size-12 text-base',
};

/** Pastille ronde du profil, dans la couleur choisie pour lui (donnée du profil). */
export default function Avatar({ profile, size = 'md', className = '' }) {
  const color = profile?.color ?? '#5f636c';
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full leading-none font-semibold text-white ${SIZES[size]} ${className}`}
      style={{ background: color }}
    >
      {initials(profile?.name)}
    </span>
  );
}
