import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-linea-fuerte px-6 py-10 text-center">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="text-tinta-3">
        <path
          d="M4 28 36 22V14L4 8z M4 8v20 M36 14 20 11 M20 11v14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="18" r="1.6" fill="currentColor" />
        <circle cx="27" cy="19" r="1.3" fill="currentColor" />
      </svg>
      <p className="font-display text-lg font-semibold text-tinta">{title}</p>
      {description && <p className="max-w-sm text-sm text-tinta-2">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
