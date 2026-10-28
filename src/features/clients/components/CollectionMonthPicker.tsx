import Link from "next/link";
import { cx } from "@/lib/cx";
import { formatMonth } from "@/lib/format";
import { IconChevronLeft, IconChevronRight } from "@/ui/icons";

const ARROW =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-linea bg-hoja text-tinta hover:bg-hoja-2 md:h-8 md:w-8";

const href = (month: string, current: string) => (month === current ? "/admin/clientes/cobro" : `/admin/clientes/cobro?mes=${month}`);

// Mes anterior / siguiente entre los meses que tienen deuda (más el actual). `months` va del más nuevo al más viejo.
export function CollectionMonthPicker({ month, months, current }: { month: string; months: string[]; current: string }) {
  const i = months.indexOf(month);
  const older = months[i + 1];
  const newer = i > 0 ? months[i - 1] : undefined;

  return (
    <div className="mb-4 flex w-full items-center justify-between gap-2 md:w-auto md:justify-start">
      {older ? (
        <Link href={href(older, current)} aria-label={`Mes anterior: ${formatMonth(older)}`} className={ARROW}>
          <IconChevronLeft />
        </Link>
      ) : (
        <span aria-hidden="true" className={cx(ARROW, "opacity-40")}>
          <IconChevronLeft />
        </span>
      )}
      <div className="min-w-40 text-center">
        <p className="text-sm/5 font-medium capitalize text-tinta">{formatMonth(month)}</p>
        <p className="text-[0.6875rem]/[0.875rem] font-medium text-tinta-3">{month === current ? "Mes actual" : "Mes pasado"}</p>
      </div>
      {newer ? (
        <Link href={href(newer, current)} aria-label={`Mes siguiente: ${formatMonth(newer)}`} className={ARROW}>
          <IconChevronRight />
        </Link>
      ) : (
        <span aria-hidden="true" className={cx(ARROW, "opacity-40")}>
          <IconChevronRight />
        </span>
      )}
    </div>
  );
}
