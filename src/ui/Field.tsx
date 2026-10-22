import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

const CONTROL =
  "w-full rounded-sm border border-linea-fuerte bg-papel px-3 caret-acento text-sm text-tinta placeholder:text-tinta-3 " +
  "disabled:opacity-60 aria-[invalid=true]:border-debe";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-tinta">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-desc`} className="text-[0.8125rem] text-tinta-2">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-desc`} role="alert" className="aparece text-[0.8125rem] font-medium text-debe">
          {error}
        </p>
      )}
    </div>
  );
}

// En campos numéricos la rueda del mouse cambia el valor si el campo está enfocado:
// al desplazar la hoja se alteraban cantidades y totales sin querer. Se suelta el
// foco para que la rueda solo desplace la página.
export function Input({ className, onWheel, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(CONTROL, "h-11 md:h-9", className)}
      onWheel={(e) => {
        if (e.currentTarget.type === "number") e.currentTarget.blur();
        onWheel?.(e);
      }}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(CONTROL, "h-11 md:h-9", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(CONTROL, "min-h-24 py-2", className)} {...props} />;
}
