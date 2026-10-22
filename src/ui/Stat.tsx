import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Sparkline } from "./Sparkline";

// Cifra suelta en su tarjeta: 20 px en móvil y 24 px desde md. `delta` va al lado de la cifra.
export function Stat({
  label,
  value,
  hint,
  delta,
  spark,
  emphasis = "default",
  compact = false,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  delta?: ReactNode;
  spark?: number[];
  emphasis?: "default" | "hero";
  // Cifra más chica en móvil, para tres tarjetas en fila (detalle de cliente).
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("rounded-lg border border-linea bg-hoja p-4 md:p-5", className)}>
      <p className="text-xs/4 font-medium text-tinta-3">{label}</p>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p
            className={cx(
              "num font-semibold text-tinta",
              emphasis === "hero"
                ? "text-[2rem]/9 tracking-[-0.01em]"
                : compact
                  ? "text-base/6 md:text-2xl/7"
                  : "text-xl/7 md:text-2xl/7"
            )}
          >
            {value}
          </p>
          {delta}
        </div>
        {spark && <Sparkline values={spark} />}
      </div>
      {hint && <p className="mt-1 text-[0.8125rem]/[1.125rem] text-tinta-2">{hint}</p>}
    </div>
  );
}
