import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type Tone = "debe" | "parcial" | "pagado" | "pendiente" | "listo" | "neutral" | "aviso";

const TONES: Record<Tone, string> = {
  debe: "bg-debe-bg text-debe border-debe-borde",
  parcial: "bg-aviso-bg text-aviso border-aviso-borde",
  pagado: "bg-cobrado-bg text-cobrado border-cobrado-borde",
  pendiente: "bg-aviso-bg text-aviso border-aviso-borde",
  listo: "bg-cobrado-bg text-cobrado border-cobrado-borde",
  aviso: "bg-aviso-bg text-aviso border-aviso-borde",
  neutral: "bg-hoja-2 text-tinta-2 border-linea",
};

// El estado nunca se comunica solo con color: cada tono lleva su símbolo.
const ICONS: Record<Tone, string> = {
  debe: "●",
  parcial: "◐",
  pagado: "✓",
  pendiente: "○",
  listo: "✓",
  aviso: "!",
  neutral: "",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        TONES[tone],
        className
      )}
    >
      {ICONS[tone] && <span aria-hidden="true">{ICONS[tone]}</span>}
      {children}
    </span>
  );
}
