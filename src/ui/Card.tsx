import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

// Tarjeta plana: borde fino y sin sombra (la elevación solo la tienen las hojas y los avisos).
export function Card({
  tone = "default",
  className,
  children,
}: {
  tone?: "default" | "sunken";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cx(
        "rounded-lg border border-linea",
        tone === "default" ? "bg-hoja" : "bg-hoja-2",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 md:px-5 md:pt-5">
      <div className="min-w-0 flex-1 basis-60">
        <h2 className="text-[0.9375rem]/[1.375rem] font-semibold text-tinta">{title}</h2>
        {subtitle && <p className="text-[0.8125rem]/[1.125rem] text-tinta-2">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("p-4 md:p-5", className)}>{children}</div>;
}
