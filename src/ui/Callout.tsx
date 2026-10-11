import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

const TONES = {
  aviso: "border-aviso-borde bg-aviso-bg text-aviso",
  debe: "border-debe-borde bg-debe-bg text-debe",
  info: "border-info-borde bg-info-bg text-info",
} as const;

export function Callout({
  tone = "aviso",
  children,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <p role="note" className={cx("rounded-md border px-3 py-2 text-[0.8125rem]", TONES[tone])}>
      {children}
    </p>
  );
}
