export default function CheeseWedge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 104" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="wedgeRind" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-corteza)" />
          <stop offset="1" stopColor="var(--color-curado)" />
        </linearGradient>
        <pattern id="wedgeHoles" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="5" r="1.7" fill="var(--color-tinta)" opacity="0.16" />
          <circle cx="12" cy="12" r="1.2" fill="var(--color-tinta)" opacity="0.12" />
        </pattern>
      </defs>
      <path d="M10 92 L58 8 L110 92 Q60 106 10 92 Z" fill="url(#wedgeRind)" />
      <path d="M10 92 L58 8 L110 92 Q60 106 10 92 Z" fill="url(#wedgeHoles)" />
      <path
        d="M10 92 Q60 106 110 92"
        fill="none"
        stroke="var(--color-cuajada)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
