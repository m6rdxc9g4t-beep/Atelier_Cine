export default function Logo({ className = '' }) {
  return (
    <span className={`font-display text-[1.5rem] leading-none font-bold tracking-tight whitespace-nowrap select-none ${className}`}>
      <span className="text-brand">Atelier</span>
      <span className="text-white">_Ciné</span>
    </span>
  );
}
