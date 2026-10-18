"use client";

import { useState } from "react";
import { shortenedPreviousWeek, type OpenWeekHint } from "@/domain/week-hint";
import { cx } from "@/lib/cx";
import { formatDay, plural } from "@/lib/format";
import { Button } from "@/ui/Button";
import { Sheet } from "@/ui/Sheet";
import { OpenWeekForm } from "./OpenWeekForm";
import { useOpenWeek } from "./use-open-week";

export interface WeekPromptState {
  hint: OpenWeekHint;
  elapsed: number;
  from: string;
  today: string;
  lastOpening: string | null;
}

const MESSAGES = {
  compra: "Hoy registraste una compra. ¿Llegó el queso? Abre la semana nueva.",
  largo: "Esta semana ya lleva muchos días. ¿Llegó el queso? Abre la semana nueva.",
} as const;

// Estado de la semana en curso en Inicio, con el aviso "¿Llegó el queso?" cuando toca abrir otra.
export function WeekPrompt({ week }: { week: WeekPromptState }) {
  const [open, setOpen] = useState(false);
  const { openWeek, loading } = useOpenWeek();
  const { hint, today, lastOpening } = week;
  // "Abrir hoy" abre directo, salvo que corte una semana automática: ahí se confirma en la hoja.
  const needsConfirm = !lastOpening && shortenedPreviousWeek(today, today) !== null;

  return (
    <>
      <div
        className={cx(
          "flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm",
          hint ? "border-aviso-borde bg-aviso-bg text-aviso" : "border-linea bg-hoja-2 text-tinta-2"
        )}
      >
        <p>
          {hint ? MESSAGES[hint] : `Semana en curso · ${plural(week.elapsed, "día")} · desde el ${formatDay(week.from)}`}
        </p>
        <div className="flex gap-2">
          {hint && (
            <Button size="sm" loading={loading} onClick={() => (needsConfirm ? setOpen(true) : void openWeek(today))}>
              Abrir hoy
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
            {hint ? "Otro día" : "Abrir semana nueva"}
          </Button>
        </div>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Abrir semana nueva">
        <OpenWeekForm today={today} lastOpening={lastOpening} onDone={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
