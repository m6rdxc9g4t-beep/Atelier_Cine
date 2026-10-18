/**
 * Générateur d'affiches procédurales (SVG -> data URI).
 * Sert de visuel de remplacement tant qu'un média n'a pas d'affiche réelle
 * (plus tard : affiche extraite du NAS ou récupérée via une source de métadonnées).
 * Déterministe : un même `seed` produit toujours la même image.
 */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const PALETTES = [
  ['#0b1d2e', '#1f4e6b', '#f2a65a'], // nuit / ambre
  ['#1a0f1f', '#5b1e3a', '#ff6b4a'], // braise
  ['#0d1a14', '#24503b', '#d6e7a1'], // forêt
  ['#10131c', '#3a4560', '#c8d3e6'], // acier
  ['#1d0b0b', '#7a1f1a', '#ffb347'], // incendie
  ['#08121f', '#163a63', '#7fd3ff'], // océan
  ['#1b1407', '#6b4a14', '#f5d27a'], // désert
  ['#140b24', '#3d1f6b', '#ff7ad9'], // néon
];

const MOTIFS = ['skyline', 'mountains', 'sun', 'planet', 'waves', 'forest', 'road'];

const stars = (r, w, h, n, maxY = h) =>
  Array.from({ length: n }, () => {
    const x = (r() * w).toFixed(1);
    const y = (r() * maxY).toFixed(1);
    const s = (r() * 1.4 + 0.3).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${s}" fill="#fff" opacity="${(r() * 0.7 + 0.2).toFixed(2)}"/>`;
  }).join('');

function motifSvg(motif, r, w, h, [dark, mid, light]) {
  switch (motif) {
    case 'skyline': {
      let x = -10;
      let out = `<circle cx="${w * (0.25 + r() * 0.5)}" cy="${h * 0.3}" r="${w * 0.16}" fill="${light}" opacity="0.85"/>`;
      while (x < w) {
        const bw = 18 + r() * 42;
        const bh = h * (0.18 + r() * 0.4);
        out += `<rect x="${x}" y="${h - bh}" width="${bw}" height="${bh}" fill="${dark}"/>`;
        for (let wy = h - bh + 8; wy < h - 6; wy += 9) {
          for (let wx = x + 4; wx < x + bw - 4; wx += 7) {
            if (r() > 0.72) out += `<rect x="${wx}" y="${wy}" width="3" height="4" fill="${light}" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`;
          }
        }
        x += bw + 2;
      }
      return out;
    }
    case 'mountains': {
      let out = `<circle cx="${w * 0.7}" cy="${h * 0.28}" r="${w * 0.1}" fill="${light}" opacity="0.9"/>`;
      for (let layer = 0; layer < 4; layer++) {
        const base = h * (0.5 + layer * 0.13);
        let d = `M0 ${h} L0 ${base}`;
        for (let px = 0; px <= w; px += w / 6) {
          d += ` L${px.toFixed(1)} ${(base - r() * h * 0.22).toFixed(1)}`;
        }
        d += ` L${w} ${h} Z`;
        out += `<path d="${d}" fill="${layer < 2 ? mid : dark}" opacity="${0.55 + layer * 0.15}"/>`;
      }
      return out;
    }
    case 'sun': {
      const cy = h * 0.52;
      let out = `<circle cx="${w / 2}" cy="${cy}" r="${w * 0.3}" fill="url(#glow)"/>`;
      for (let i = 0; i < 6; i++) {
        out += `<rect x="0" y="${cy + i * 10}" width="${w}" height="${2 + i}" fill="${dark}"/>`;
      }
      out += `<rect x="0" y="${h * 0.66}" width="${w}" height="${h * 0.34}" fill="${dark}"/>`;
      for (let i = 0; i < 9; i++) {
        const y = h * 0.66 + (i * i * h * 0.34) / 64;
        out += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${light}" stroke-opacity="0.35"/>`;
      }
      for (let i = -6; i <= 6; i++) {
        out += `<line x1="${w / 2}" y1="${h * 0.66}" x2="${w / 2 + i * w * 0.22}" y2="${h}" stroke="${light}" stroke-opacity="0.35"/>`;
      }
      return out;
    }
    case 'planet': {
      const cx = w * (0.35 + r() * 0.3);
      const cy = h * 0.42;
      const pr = w * 0.26;
      return (
        stars(r, w, h, 60) +
        `<circle cx="${cx}" cy="${cy}" r="${pr}" fill="url(#planet)"/>` +
        `<ellipse cx="${cx}" cy="${cy}" rx="${pr * 1.7}" ry="${pr * 0.32}" fill="none" stroke="${light}" stroke-width="3" opacity="0.6" transform="rotate(-14 ${cx} ${cy})"/>` +
        `<rect x="0" y="${h * 0.8}" width="${w}" height="${h * 0.2}" fill="${dark}"/>`
      );
    }
    case 'waves': {
      let out = `<circle cx="${w * 0.5}" cy="${h * 0.3}" r="${w * 0.13}" fill="${light}" opacity="0.8"/>`;
      for (let i = 0; i < 6; i++) {
        const y = h * (0.5 + i * 0.09);
        const amp = 6 + r() * 10;
        let d = `M0 ${y}`;
        for (let px = 0; px <= w; px += 20) d += ` Q${px + 10} ${y - amp} ${px + 20} ${y}`;
        d += ` L${w} ${h} L0 ${h} Z`;
        out += `<path d="${d}" fill="${i % 2 ? mid : dark}" opacity="${0.5 + i * 0.1}"/>`;
      }
      return out;
    }
    case 'forest': {
      let out = `<rect width="${w}" height="${h}" fill="url(#fog)"/>`;
      for (let layer = 0; layer < 3; layer++) {
        for (let i = 0; i < 9; i++) {
          const tx = r() * w;
          const th = h * (0.25 + r() * 0.3) * (1 + layer * 0.3);
          const base = h * (0.72 + layer * 0.12);
          const tw = th * 0.28;
          out += `<path d="M${tx} ${base - th} L${tx + tw} ${base} L${tx - tw} ${base} Z" fill="${layer === 2 ? dark : mid}" opacity="${0.45 + layer * 0.25}"/>`;
        }
      }
      return out + `<rect x="0" y="${h * 0.92}" width="${w}" height="${h * 0.08}" fill="${dark}"/>`;
    }
    case 'road':
    default: {
      const hz = h * 0.48;
      let out = `<rect x="0" y="${hz}" width="${w}" height="${h - hz}" fill="${dark}"/>`;
      out += `<path d="M${w * 0.47} ${hz} L${w * 0.53} ${hz} L${w * 0.95} ${h} L${w * 0.05} ${h} Z" fill="${mid}" opacity="0.6"/>`;
      for (let i = 0; i < 6; i++) {
        const t1 = i / 6;
        const t2 = t1 + 0.08;
        const y1 = hz + (h - hz) * t1 * t1;
        const y2 = hz + (h - hz) * t2 * t2;
        out += `<path d="M${w / 2 - 1 - t1 * 4} ${y1} L${w / 2 + 1 + t1 * 4} ${y1} L${w / 2 + 1 + t2 * 4} ${y2} L${w / 2 - 1 - t2 * 4} ${y2} Z" fill="${light}"/>`;
      }
      out += `<circle cx="${w * 0.5}" cy="${hz}" r="${w * 0.08}" fill="${light}" opacity="0.7"/>`;
      return out;
    }
  }
}

/**
 * @param {object} opts
 * @param {string} opts.seed      identifiant stable (ex. id du média)
 * @param {'poster'|'landscape'} [opts.format]
 * @param {number} [opts.palette] index de palette (sinon dérivé du seed)
 * @param {string} [opts.motif]   motif (sinon dérivé du seed)
 */
export function generateArtwork({ seed, format = 'poster', palette, motif } = {}) {
  const h0 = hashString(String(seed));
  const r = mulberry32(h0);
  const [w, h] = format === 'poster' ? [200, 300] : [320, 180];
  const pal = PALETTES[(palette ?? h0) % PALETTES.length];
  const mot = motif ?? MOTIFS[(h0 >> 3) % MOTIFS.length];
  const [dark, mid, light] = pal;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="0.65" stop-color="${mid}"/><stop offset="1" stop-color="${light}" stop-opacity="0.55"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="${light}"/><stop offset="0.7" stop-color="${light}" stop-opacity="0.85"/><stop offset="1" stop-color="${mid}" stop-opacity="0"/></radialGradient>
<radialGradient id="planet" cx="0.35" cy="0.3"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient>
<linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0.3" stop-color="${light}" stop-opacity="0"/><stop offset="0.75" stop-color="${light}" stop-opacity="0.35"/></linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.75"/></linearGradient>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.08 0"/></filter>
</defs>
<rect width="${w}" height="${h}" fill="url(#sky)"/>
${motifSvg(mot, r, w, h, pal)}
<rect width="${w}" height="${h}" fill="url(#shade)"/>
<rect width="${w}" height="${h}" filter="url(#grain)"/>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
