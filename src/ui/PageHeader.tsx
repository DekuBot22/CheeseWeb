import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

// `stretchActions`: en móvil las acciones ocupan todo el ancho, repartidas por igual
// (Inicio, con sus tres botones). En PC siempre van a la derecha.
export function PageHeader({
  title,
  subtitle,
  actions,
  stretchActions = false,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  stretchActions?: boolean;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-4 md:mb-6">
      <div className="flex flex-col gap-0.5 md:gap-1">
        <h1 className="text-xl/7 font-semibold tracking-[-0.015em] text-tinta md:text-2xl/8">{title}</h1>
        {subtitle && <p className="text-[0.8125rem]/[1.125rem] text-tinta-2">{subtitle}</p>}
      </div>
      {actions && (
        <div
          className={cx(
            "flex flex-wrap items-center gap-2",
            stretchActions && "w-full flex-nowrap md:w-auto [&>*]:flex-1 md:[&>*]:flex-none"
          )}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
