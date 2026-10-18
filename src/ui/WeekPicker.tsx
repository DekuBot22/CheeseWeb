import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "./icons";

const ARROW =
  "flex h-11 w-11 items-center justify-center rounded-md border border-linea-fuerte bg-hoja text-tinta hover:bg-hoja-2 md:h-9 md:w-9";

export function WeekPicker({
  label,
  caption,
  isCurrent,
  prevHref,
  nextHref,
}: {
  label: string;
  // Texto bajo la fecha cuando no es la semana actual (p. ej. "Sáb a vie" o "9 días").
  caption: string;
  isCurrent: boolean;
  prevHref: string;
  nextHref?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link href={prevHref} aria-label="Semana anterior" className={ARROW}>
        <IconChevronLeft />
      </Link>
      <div className="min-w-40 text-center">
        <p className="num text-sm font-semibold text-tinta">{label}</p>
        <p className="text-xs text-tinta-3">{isCurrent ? "Semana actual" : caption}</p>
      </div>
      {isCurrent || !nextHref ? (
        <span aria-hidden="true" className={`${ARROW} opacity-40`}>
          <IconChevronRight />
        </span>
      ) : (
        <Link href={nextHref} aria-label="Semana siguiente" className={ARROW}>
          <IconChevronRight />
        </Link>
      )}
    </div>
  );
}
