import { memo, useId, useMemo } from 'react';
import { hashString } from '../lib/artwork.js';

/**
 * Décor de la bannière "ORBIT" : planète en orbite haute, lune, vaisseaux.
 * 100 % SVG (aucune image externe) — remplacé par la vraie image de fond
 * dès qu'un média possède un `backdrop`.
 */

function Starfield({ seed, count = 220 }) {
  const stars = useMemo(() => {
    let s = hashString(seed);
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    return Array.from({ length: count }, () => ({
      x: rnd() * 1600,
      y: rnd() * 900,
      r: rnd() < 0.08 ? 1.6 : rnd() * 0.9 + 0.3,
      o: rnd() * 0.6 + 0.2,
    }));
  }, [seed, count]);
  return (
    <g>
      {stars.map((st, i) => (
        <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#dfe8ff" opacity={st.o} />
      ))}
    </g>
  );
}

/** Vaisseau dessiné vers la gauche, ~400×160 en coordonnées locales. */
function Ship({ id, transform, lit = 1 }) {
  return (
    <g transform={transform}>
      {/* aile basse */}
      <path d="M140 102 L215 152 L330 156 L318 112 Z" fill={`url(#${id}-hullDark)`} />
      {/* coque */}
      <path
        d="M0 80 L52 58 L150 48 L262 42 L352 56 L396 72 L398 90 L352 104 L262 118 L150 112 L52 102 Z"
        fill={`url(#${id}-hull)`}
      />
      {/* pont supérieur */}
      <path d="M110 52 L168 26 L292 24 L330 48 L262 44 Z" fill={`url(#${id}-hullTop)`} />
      <rect x="208" y="12" width="56" height="15" rx="3" fill="#2b3442" />
      <rect x="214" y="16" width="44" height="3" rx="1.5" fill="#9fd4ff" opacity={0.55 * lit} />
      {/* aile haute */}
      <path d="M170 46 L236 4 L320 2 L300 40 Z" fill={`url(#${id}-hullDark)`} opacity="0.95" />
      {/* nacelles moteur */}
      <rect x="350" y="52" width="48" height="20" rx="4" fill="#232a35" />
      <rect x="350" y="90" width="48" height="20" rx="4" fill="#232a35" />
      <circle cx="400" cy="62" r="7" fill="#8fd0ff" opacity={0.9 * lit} filter={`url(#${id}-engine)`} />
      <circle cx="400" cy="100" r="7" fill="#8fd0ff" opacity={0.9 * lit} filter={`url(#${id}-engine)`} />
      {/* détails de panneaux */}
      <g stroke="#0b0f15" strokeOpacity="0.55" strokeWidth="1.2" fill="none">
        <path d="M60 80 L360 80" />
        <path d="M150 50 L150 112 M220 46 L220 116 M290 46 L290 112" />
        <path d="M80 66 L130 66 M240 96 L330 96" />
      </g>
      {/* liseré éclairé par la planète */}
      <path d="M0 80 L52 58 L150 48 L262 42 L352 56 L396 72" fill="none" stroke="#cfe3ff" strokeOpacity={0.45 * lit} strokeWidth="1.5" />
      {/* feux de position */}
      {[70, 120, 186, 248, 312].map((x, i) => (
        <circle key={x} cx={x} cy={i % 2 ? 92 : 70} r="1.8" fill="#fff" opacity={0.8 * lit} />
      ))}
      <circle cx="6" cy="80" r="2.4" fill="#ff4d4d" opacity={0.9 * lit} />
    </g>
  );
}

function ShipDefs({ id }) {
  return (
    <>
      <linearGradient id={`${id}-hull`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5d6878" />
        <stop offset="0.45" stopColor="#323a47" />
        <stop offset="1" stopColor="#151a22" />
      </linearGradient>
      <linearGradient id={`${id}-hullTop`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7a8597" />
        <stop offset="1" stopColor="#3a4352" />
      </linearGradient>
      <linearGradient id={`${id}-hullDark`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a4250" />
        <stop offset="1" stopColor="#12161d" />
      </linearGradient>
      <filter id={`${id}-engine`} x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
    </>
  );
}

function SpaceScene({ className = '' }) {
  const id = useId().replace(/:/g, '');
  // Planète : centre hors cadre en haut à droite, limbe qui descend vers le bord droit.
  const P = { cx: 1700, cy: -356, r: 922 };

  return (
    <svg
      className={className}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMaxYMid slice"
      role="img"
      aria-label="Vaisseaux en orbite au-dessus d'une planète"
    >
      <defs>
        <radialGradient id={`${id}-space`} cx="0.75" cy="0.45" r="0.9">
          <stop offset="0" stopColor="#1b2a3d" />
          <stop offset="0.5" stopColor="#0b111b" />
          <stop offset="1" stopColor="#05070b" />
        </radialGradient>
        <radialGradient id={`${id}-planet`} cx="0.62" cy="0.18" r="0.95">
          <stop offset="0" stopColor="#a9c3d8" />
          <stop offset="0.35" stopColor="#5f7f9b" />
          <stop offset="0.7" stopColor="#2a3d52" />
          <stop offset="1" stopColor="#0d1520" />
        </radialGradient>
        <radialGradient id={`${id}-moon`} cx="0.7" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#c9d4e0" />
          <stop offset="0.55" stopColor="#56677a" />
          <stop offset="1" stopColor="#0d131b" />
        </radialGradient>
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fa3c4" stopOpacity="0" />
          <stop offset="0.55" stopColor="#6f93b5" stopOpacity="0.28" />
          <stop offset="1" stopColor="#0b1018" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-clouds`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves="5" seed="7" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.55" />
        </filter>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id={`${id}-softblur`}>
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <linearGradient id={`${id}-hazeFade`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.2" />
        </linearGradient>
        <mask id={`${id}-hazeMask`}>
          <rect x="0" y="480" width="1600" height="420" fill={`url(#${id}-hazeFade)`} />
        </mask>
        <clipPath id={`${id}-planetClip`}>
          <circle cx={P.cx} cy={P.cy} r={P.r} />
        </clipPath>
        <ShipDefs id={id} />
      </defs>

      <rect width="1600" height="900" fill={`url(#${id}-space)`} />
      <Starfield seed="orbit" />

      {/* Planète + nuages + terminateur */}
      <g>
        <circle cx={P.cx} cy={P.cy} r={P.r + 18} fill="#7fb4ff" opacity="0.35" filter={`url(#${id}-blur)`} />
        <circle cx={P.cx} cy={P.cy} r={P.r} fill={`url(#${id}-planet)`} />
        <g clipPath={`url(#${id}-planetClip)`}>
          <rect x="700" y="-400" width="1000" height="1000" filter={`url(#${id}-clouds)`} opacity="0.55" />
          {/* ombre côté nuit */}
          <circle cx={P.cx - 260} cy={P.cy + 260} r={P.r} fill="none" stroke="#04070c" strokeWidth="420" opacity="0.55" filter={`url(#${id}-blur)`} />
        </g>
        <circle cx={P.cx} cy={P.cy} r={P.r} fill="none" stroke="#d8ecff" strokeOpacity="0.75" strokeWidth="2.5" filter={`url(#${id}-softblur)`} />
      </g>

      {/* Lune, devant le limbe de la planète */}
      <circle cx="1163" cy="112" r="42" fill="#04070c" opacity="0.6" filter={`url(#${id}-softblur)`} />
      <circle cx="1160" cy="108" r="40" fill={`url(#${id}-moon)`} />

      {/* Mer de nuages basse */}
      <rect x="0" y="470" width="1600" height="430" fill={`url(#${id}-haze)`} />
      <rect x="0" y="480" width="1600" height="420" filter={`url(#${id}-clouds)`} opacity="0.14" mask={`url(#${id}-hazeMask)`} />

      {/* Vaisseaux (du plus lointain au plus proche) */}
      <Ship id={id} transform="translate(1340 210) scale(0.28) rotate(-4)" lit={0.6} />
      <Ship id={id} transform="translate(780 220) scale(0.72) rotate(-5)" lit={0.8} />
      <Ship id={id} transform="translate(640 600) scale(0.62) rotate(4)" lit={0.5} />
      <Ship id={id} transform="translate(1020 420) scale(1.3) rotate(12)" />
    </svg>
  );
}

export default memo(SpaceScene);
