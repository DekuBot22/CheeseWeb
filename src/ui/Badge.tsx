import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Dot, type DotTone } from "./Dot";

type Tone = "debe" | "parcial" | "pagado" | "pendiente" | "listo" | "neutral" | "aviso" | "info";

// Cada estado de pedido se traduce al color del punto del diseño.
const DOTS: Record<Tone, DotTone> = {
  debe: "debe",
  parcial: "aviso",
  pagado: "cobrado",
  pendiente: "info",
  listo: "cobrado",
  aviso: "aviso",
  info: "info",
  neutral: "neutro",
};

// El estado nunca se comunica solo con color: el punto acompaña siempre a un texto.
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
        "inline-flex h-6 items-center gap-1.5 rounded-full border border-linea px-2 text-xs/4 font-medium whitespace-nowrap text-tinta",
        className
      )}
    >
      <Dot tone={DOTS[tone]} className="transition-colors duration-(--dur-rapida)" />
      {children}
    </span>
  );
}
