import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Dot, type DotTone } from "./Dot";

// Fila de lista con punto de color ("Por revisar"). La última no lleva línea inferior.
export function DotItem({
  tone = "neutro",
  title,
  children,
  className,
}: {
  tone?: DotTone;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <li className={cx("flex items-start gap-3 border-b border-linea-suave py-3 last:border-b-0", className)}>
      <Dot tone={tone} className="mt-[0.3125rem]" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[0.8125rem]/[1.125rem] font-semibold text-tinta">{title}</p>
        {children && <p className="text-xs/4 text-tinta-2">{children}</p>}
      </div>
    </li>
  );
}
