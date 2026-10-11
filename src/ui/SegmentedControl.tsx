import Link from "next/link";
import { cx } from "@/lib/cx";

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
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-md border border-linea-fuerte bg-hoja p-0.5"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Link
            key={o.value}
            href={o.href}
            aria-current={active ? "true" : undefined}
            className={cx(
              "flex h-10 items-center rounded-sm px-3 text-sm font-medium whitespace-nowrap md:h-8",
              active
                ? "bg-acento-suave text-acento ring-1 ring-inset ring-acento/40"
                :"text-tinta-2 hover:bg-hoja-2 hover:text-tinta"
            )}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}
