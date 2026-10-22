import Link from "next/link";
import { cx } from "@/lib/cx";
import { LinkPending } from "./LinkPending";

// Estilos compartidos con SegmentedButtons (la versión con botones y estado local).
export const SEGMENT_GROUP = "inline-flex rounded-sm border border-linea bg-hoja-2 p-0.5";

export function segmentClasses(active: boolean) {
  return cx(
    "presionable relative flex h-10 items-center rounded-[4px] border px-3 text-xs/4 font-medium whitespace-nowrap md:h-7",
    active ? "border-linea bg-hoja-3 text-tinta" : "border-transparent text-tinta-3 hover:text-tinta"
  );
}

// Selector por enlaces (funciona sin JS y respeta el botón "atrás").
export function SegmentedControl({
  options,
  value,
  label,
}: {
  options: { value: string; label: string; href: string }[];
  value: string;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className={SEGMENT_GROUP}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Link
            key={o.value}
            href={o.href}
            aria-current={active ? "true" : undefined}
            className={segmentClasses(active)}
          >
            {o.label}
            <LinkPending />
          </Link>
        );
      })}
    </div>
  );
}
