import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

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
        tone === "default" ? "bg-hoja shadow-hoja" : "bg-hoja-2",
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
    <header className="flex items-start justify-between gap-3 border-b border-linea px-4 py-3 md:px-5">
      <div>
        <h2 className="font-display text-lg/7 font-semibold text-tinta">{title}</h2>
        {subtitle && <p className="text-[0.8125rem] text-tinta-2">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("p-4 md:p-5", className)}>{children}</div>;
}
