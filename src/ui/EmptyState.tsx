import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

// Estado vacío (cuña de queso en ámbar) o de error (triángulo rojo): el ícono va en un
// círculo de 88 px dentro de una tarjeta plana.
export function EmptyState({
  title,
  description,
  action,
  tone = "vacio",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "vacio" | "error";
}) {
  const error = tone === "error";
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-linea bg-hoja px-6 py-10 text-center">
      <span
        aria-hidden="true"
        className={cx(
          "mb-2 flex size-[5.5rem] items-center justify-center rounded-full border",
          error ? "border-debe-borde bg-debe-bg text-debe" : "border-linea bg-hoja-2 text-acento"
        )}
      >
        {error ? (
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M18 6.5 31 29H5L18 6.5Z M18 14.5v7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="18" cy="25" r="1" fill="currentColor" />
          </svg>
        ) : (
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M5 25.5 31 20v-7L5 8v17.5Z M31 13 18 10.5v12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="11" cy="17" r="1.5" fill="currentColor" />
            <circle cx="25" cy="17" r="1.2" fill="currentColor" />
          </svg>
        )}
      </span>
      <p className="text-[0.9375rem]/[1.375rem] font-semibold text-tinta">{title}</p>
      {description && <p className="max-w-sm text-[0.8125rem]/[1.125rem] text-tinta-2">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
