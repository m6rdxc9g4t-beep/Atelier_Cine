import { ChevronDown } from 'lucide-react';

/** Avatar en haut à droite. Initiales en attendant la gestion des profils. */
export default function ProfileMenu({ name = 'François' }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      className="group flex items-center gap-2 rounded-full p-1 text-neutral-300 transition hover:text-white focus-visible:outline-2 focus-visible:outline-white"
      aria-label={`Profil de ${name}`}
    >
      <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-brand to-[#6b1418] font-display text-sm font-semibold text-white ring-2 ring-white/15">
        {initials}
      </span>
      <ChevronDown className="size-5 transition group-hover:translate-y-0.5" />
    </button>
  );
}
