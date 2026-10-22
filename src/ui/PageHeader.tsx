import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl/8 font-semibold tracking-[-0.015em] text-tinta">{title}</h1>
        {subtitle && <p className="text-[0.8125rem]/[1.125rem] text-tinta-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
