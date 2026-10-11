import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-acento text-sobre-acento hover:bg-acento-hover",
  secondary: "border border-linea-fuerte bg-hoja text-tinta hover:bg-hoja-2",
  ghost: "text-tinta-2 hover:bg-hoja-2 hover:text-tinta",
  danger: "bg-debe text-sobre-acento hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-11 px-3 text-sm md:h-9",
  md: "h-11 px-4 text-sm",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cx(
    "presionable inline-flex items-center justify-center gap-2 rounded-md font-semibold",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

export function Button({
  variant,
  size,
  loading,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {loading ? "Guardando…" : children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
