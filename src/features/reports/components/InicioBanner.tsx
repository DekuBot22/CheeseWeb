"use client";

import { useState } from "react";
import type { OpenWeekHint, WeekContext } from "@/domain/week-hint";
import { shortenedPreviousWeek } from "@/domain/week-hint";
import { plural } from "@/lib/format";
import { Banner } from "@/ui/Banner";
import { Button, ButtonLink } from "@/ui/Button";
import { Sheet } from "@/ui/Sheet";
import { OpenWeekForm } from "@/features/weeks/components/OpenWeekForm";
import { useOpenWeek } from "@/features/weeks/components/use-open-week";

// Avisos del Inicio en un solo cuadro: "¿Llegó el queso?" (con sus botones para abrir la
// semana) y lo que falta configurar en Ajustes. `notes` ya viene redactado del servidor.
// Abrir una semana a mano a cualquier hora se hace desde Ajustes.
export function InicioBanner({
  week,
  hint,
  notes,
}: {
  week: WeekContext;
  hint: OpenWeekHint;
  notes: string[];
}) {
  const [open, setOpen] = useState(false);
  const { openWeek, loading } = useOpenWeek();
  const { today, lastOpening } = week;
  // "Abrir hoy" abre directo, salvo que corte una semana automática: ahí se confirma en la hoja.
  const needsConfirm = !lastOpening && shortenedPreviousWeek(today, today) !== null;

  if (notes.length === 0) return null;

  return (
    <>
      <Banner
        title={`${plural(notes.length, "cosa")} por revisar`}
        actions={
          hint ? (
            <>
              <Button size="sm" loading={loading} onClick={() => (needsConfirm ? setOpen(true) : void openWeek(today))}>
                Abrir hoy
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                Otro día
              </Button>
            </>
          ) : (
            <ButtonLink size="sm" variant="secondary" href="/admin/ajustes">
              Ir a Ajustes
            </ButtonLink>
          )
        }
      >
        {notes.join(" · ")}
      </Banner>

      <Sheet open={open} onClose={() => setOpen(false)} title="Abrir semana nueva">
        <OpenWeekForm today={today} lastOpening={lastOpening} onDone={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
