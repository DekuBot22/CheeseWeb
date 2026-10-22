import { cx } from "@/lib/cx";

export type DotTone = "neutro" | "cobrado" | "aviso" | "debe" | "info";

const COLORS: Record<DotTone, string> = {
  neutro: "bg-tinta-3",
  cobrado: "bg-cobrado",
  aviso: "bg-aviso",
  debe: "bg-debe",
  info: "bg-info",
};

// Punto de 6 px del diseño: lo usan Badge, Banner y DotItem. Es decorativo: el estado
// siempre va también en el texto de al lado, nunca solo en el color.
export function Dot({ tone = "neutro", className }: { tone?: DotTone; className?: string }) {
  return <span aria-hidden="true" className={cx("inline-block size-1.5 shrink-0 rounded-full", COLORS[tone], className)} />;
}
