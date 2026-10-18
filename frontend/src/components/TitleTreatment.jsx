/**
 * Titre "logo" de la bannière. Avec `slashedO`, le premier O est barré (Ø) comme sur
 * la maquette d'ORBIT ; le texte reste lisible par les lecteurs d'écran.
 * La taille s'adapte à la longueur du titre.
 */
export default function TitleTreatment({ title, slashedO = false, className = '' }) {
  const idx = slashedO ? title.toUpperCase().indexOf('O') : -1;
  const size =
    title.length <= 8
      ? 'text-[clamp(3.5rem,9vw,8.5rem)]'
      : title.length <= 16
        ? 'text-[clamp(2.75rem,6.5vw,6rem)]'
        : 'text-[clamp(2.25rem,4.5vw,4.25rem)]';
  return (
    <h1 aria-label={title} className={`max-w-[18ch] font-display font-semibold tracking-[0.06em] text-balance uppercase ${size} ${className}`}>
      <span aria-hidden>
        {[...title].map((ch, i) =>
          i === idx ? (
            <span key={i} className="relative inline-block">
              {ch}
              <span className="absolute top-1/2 left-1/2 h-[0.075em] w-[0.88em] -translate-x-1/2 -translate-y-1/2 -rotate-[58deg] rounded-full bg-current" />
            </span>
          ) : (
            <span key={i}>{ch}</span>
          ),
        )}
      </span>
    </h1>
  );
}
