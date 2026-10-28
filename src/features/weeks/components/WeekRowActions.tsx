"use client";

import { useState } from "react";
import type { OpeningRef } from "@/domain/week-range";
import { formatDay } from "@/lib/format";
import { Button } from "@/ui/Button";
import { Sheet } from "@/ui/Sheet";
import { VoidOpeningForm } from "./VoidOpeningForm";
import { WeekRangeForm } from "./WeekRangeForm";

// Botones de una semana abierta a mano: editar su inicio y fin, o anular la apertura.
export function WeekRowActions({
  id,
  from,
  until,
  openings,
  today,
}: {
  id: string;
  from: string;
  until: string | null;
  openings: OpeningRef[];
  today: string;
}) {
  const [mode, setMode] = useState<"editar" | "anular" | null>(null);
  const close = () => setMode(null);

  return (
    <>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" aria-label={`Editar la semana del ${formatDay(from)}`} onClick={() => setMode("editar")}>
          Editar
        </Button>
        <Button size="sm" variant="ghost" aria-label={`Anular la apertura del ${formatDay(from)}`} onClick={() => setMode("anular")}>
          Anular
        </Button>
      </div>
      <Sheet open={mode === "editar"} onClose={close} title="Editar semana">
        <WeekRangeForm openings={openings} today={today} editing={{ id, from, until }} onDone={close} />
      </Sheet>
      <Sheet open={mode === "anular"} onClose={close} title="Anular apertura">
        <VoidOpeningForm id={id} from={from} onDone={close} />
      </Sheet>
    </>
  );
}
