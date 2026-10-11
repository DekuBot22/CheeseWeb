import { formatCOP } from "@/lib/format";
import { cx } from "@/lib/cx";

type Tone = "auto" | "neutral" | "debe" | "cobrado";

// Dinero en pesos con cifras tabulares. Los negativos usan el signo menos
// tipográfico (U+2212) y, con tone="auto", salen en rojo.
export function Money({
  value,
  tone = "neutral",
  className,
}: {
  value: number;
  tone?: Tone;
  className?: string;
}) {
  const negative = value < 0;
  const text = `${negative ? "−" : ""}${formatCOP(Math.abs(value))}`;
  const color =
    tone === "debe"
      ? "text-debe"
      : tone === "cobrado"
        ? "text-cobrado"
        : tone === "auto" && negative
          ? "text-debe"
          : "";
  return <span className={cx("num", color, className)}>{text}</span>;
}
