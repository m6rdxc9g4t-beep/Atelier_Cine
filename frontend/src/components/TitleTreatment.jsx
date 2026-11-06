/**
 * Titre de la bannière, posé sur l'image. Avec `slashedO`, le premier O est barré (Ø) comme sur
 * la maquette d'ORBIT ; le texte reste lisible par les lecteurs d'écran.
 * Même police que l'interface (Inter 600) ; la taille s'adapte à la longueur du titre.
 */
export default function TitleTreatment({ title, slashedO = false, className = '' }) {
  const idx = slashedO ? title.toUpperCase().indexOf('O') : -1;
  const size =
    title.length <= 8
      ? 'text-[clamp(2.75rem,6vw,4.75rem)]'
      : title.length <= 16
        ? 'text-[clamp(2.25rem,4.4vw,3.5rem)]'
        : 'text-[clamp(1.75rem,3.2vw,2.5rem)]';
  return (
    <h2 aria-label={title} className={`max-w-[18ch] leading-none font-semibold tracking-[-0.025em] text-balance ${size} ${className}`}>
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
    </h2>
  );
}
