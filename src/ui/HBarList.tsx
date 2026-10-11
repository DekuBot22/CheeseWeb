import Link from "next/link";
import type { ReactNode } from "react";

export interface HBarItem {
  label: string;
  value: number;
  valueLabel: ReactNode;
  sub?: string;
  color?: string;
  href?: string;
}

// Lista de barras horizontales (top deudores, antigüedad de la deuda).
export function HBarList({ items }: { items: HBarItem[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((it) => {
        const name = it.href ? (
          <Link href={it.href} className="font-medium text-tinta hover:underline">
            {it.label}
          </Link>
        ) : (
          <span className="font-medium text-tinta">{it.label}</span>
        );
        return (
          <li key={it.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">
                {name}
                {it.sub && <span className="ml-2 text-xs text-tinta-3">{it.sub}</span>}
              </span>
              <span className="num shrink-0 font-semibold text-tinta">{it.valueLabel}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-hoja-2">
              <div
                className="h-2 rounded-full"
                style={{ width: `${Math.max((it.value / max) * 100, 2)}%`, background: it.color ?? "var(--acento)" }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
