import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Dot, type DotTone } from "./Dot";

const TONES = {
  aviso: { box: "border-aviso-borde bg-aviso-bg", dot: "aviso" },
  peligro: { box: "border-debe-borde bg-debe-bg", dot: "debe" },
  info: { box: "border-info-borde bg-info-bg", dot: "info" },
} as const satisfies Record<string, { box: string; dot: DotTone }>;

// Aviso de página: punto de color, título, detalle y hasta dos acciones. En PC las acciones
// van a la derecha; en móvil bajan a todo el ancho, repartidas por igual.
export function Banner({
  tone = "aviso",
  title,
  children,
  actions,
  className,
}: {
  tone?: keyof typeof TONES;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div
      role="note"
      className={cx("flex flex-wrap items-start gap-x-3 gap-y-3 rounded-md border p-4 sm:py-3", t.box, className)}
    >
      <Dot tone={t.dot} className="mt-1.5" />
      <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
        <p className="text-[0.8125rem]/[1.125rem] font-semibold text-tinta">{title}</p>
        {children && <div className="text-xs/4 text-tinta-2">{children}</div>}
      </div>
      {actions && (
        <div className="flex w-full gap-2 sm:w-auto sm:shrink-0 sm:self-center [&>*]:flex-1 sm:[&>*]:flex-none">
          {actions}
        </div>
      )}
    </div>
  );
}
