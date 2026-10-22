import { cx } from "@/lib/cx";

export type DotTone = "neutro" | "cobrado" | "aviso" | "debe" | "info" | "cat1" | "cat2" | "cat3" | "cat4";

const COLORS: Record<DotTone, string> = {
  neutro: "bg-tinta-3",
  cobrado: "bg-cobrado",
  aviso: "bg-aviso",
  debe: "bg-debe",
  info: "bg-info",
  cat1: "bg-cat-1",
  cat2: "bg-cat-2",
  cat3: "bg-cat-3",
  cat4: "bg-cat-4",
};

// Punto de 6 px del diseño: lo usan Badge, Banner, DotItem y el tipo de queso. Es decorativo:
// el estado o la categoría siempre van también en el texto de al lado, nunca solo en el color.
export function Dot({ tone = "neutro", className }: { tone?: DotTone; className?: string }) {
  return <span aria-hidden="true" className={cx("inline-block size-1.5 shrink-0 rounded-full", COLORS[tone], className)} />;
}
