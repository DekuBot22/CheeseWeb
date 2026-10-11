import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Sparkline } from "./Sparkline";

export function Stat({
  label,
  value,
  hint,
  delta,
  spark,
  emphasis = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  delta?: ReactNode;
  spark?: number[];
  emphasis?: "default" | "hero";
  className?: string;
}) {
  return (
    <div className={cx("rounded-lg border border-linea bg-hoja p-4 shadow-hoja md:p-5", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-tinta-3">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p
          className={cx(
            // Texto claro sobre negro engorda a la vista: peso 500 en cifras grandes.
            "num font-medium leading-none text-tinta",
            emphasis === "hero" ? "font-display text-[2.5rem] tracking-[-0.01em]" : "text-[1.75rem]"
          )}
        >
          {value}
        </p>
        {spark && <Sparkline values={spark} />}
      </div>
      {delta && <div className="mt-2">{delta}</div>}
      {hint && <p className="mt-1 text-[0.8125rem] text-tinta-2">{hint}</p>}
    </div>
  );
}
