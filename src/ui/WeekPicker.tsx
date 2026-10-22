import Link from "next/link";
import { cx } from "@/lib/cx";
import { IconChevronLeft, IconChevronRight } from "./icons";

const ARROW =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-linea bg-hoja text-tinta hover:bg-hoja-2 md:h-8 md:w-8";

// Navegación entre semanas. En móvil ocupa todo el ancho (flechas en los extremos).
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
    <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-start">
      <Link href={prevHref} aria-label="Semana anterior" className={ARROW}>
        <IconChevronLeft />
      </Link>
      <div className="min-w-36 text-center">
        <p className="num text-sm/5 font-medium text-tinta">{label}</p>
        <p className="text-[0.6875rem]/[0.875rem] font-medium text-tinta-3">{isCurrent ? "Semana actual" : caption}</p>
      </div>
      {isCurrent || !nextHref ? (
        <span aria-hidden="true" className={cx(ARROW, "opacity-40")}>
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
