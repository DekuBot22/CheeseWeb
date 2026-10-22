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
    <div className={cx("rounded-lg border border-linea bg-hoja p-4 md:p-5", className)}>
      <p className="text-xs/4 font-medium text-tinta-3">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p
          className={cx(
            "num font-semibold text-tinta",
            emphasis === "hero" ? "text-[2rem]/9 tracking-[-0.01em]" : "text-2xl/7"
          )}
        >
          {value}
        </p>
        {spark && <Sparkline values={spark} />}
      </div>
      {delta && <div className="mt-1">{delta}</div>}
      {hint && <p className="mt-1 text-[0.6875rem]/[0.875rem] font-medium text-tinta-3">{hint}</p>}
    </div>
  );
}
