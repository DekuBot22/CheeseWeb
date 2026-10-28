"use client";

import { useId, useState } from "react";
import { draftInput, startDraft, type Draft } from "@/domain/week-draft";
import { addMonths, canGoNext, monthGrid, monthOf } from "@/domain/week-month";
import { planWeekRange, rangeSummary, type OpeningRef } from "@/domain/week-range";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { CalendarGrid } from "./CalendarGrid";
import { MonthHeader } from "./MonthHeader";
import { useGridFocus } from "./use-grid-focus";
import { WeekLegend } from "./WeekLegend";

// Resumen de la semana seleccionada: el del dominio si es válida, o el error de `planWeekRange`.
function DraftSummary({ draft, openings, today, onCancel }: { draft: Draft; openings: OpeningRef[]; today: string; onCancel: () => void }) {
  const input = draftInput(draft);
  const plan = planWeekRange(openings, input, today);
  return (
    <div className="aparece flex flex-col gap-2">
      <div aria-live="polite">
        <Callout tone={plan.ok || plan.error === "Esa semana ya está así" ? "info" : "debe"}>
          {plan.ok ? rangeSummary(input.from, input.until) : plan.error}
        </Callout>
      </div>
      <Button size="sm" variant="ghost" className="self-start" onClick={onCancel}>
        Cerrar
      </Button>
    </div>
  );
}

// Calendario mensual de semanas: las semanas marcadas se ven como bandas de color y se pueden seleccionar.
// `today` y las fechas llegan del servidor (nunca se usa el reloj del navegador: evita desajustes de zona horaria).
export function WeekCalendar({ openings, today, readOnly }: { openings: OpeningRef[]; today: string; readOnly: boolean }) {
  const labelId = useId();
  const gridId = useId();
  const [month, setMonth] = useState(monthOf(today));
  const [draft, setDraft] = useState<Draft | null>(null);
  const focus = useGridFocus(gridId, today, month, setMonth);

  const dates = openings.map((o) => o.date);
  const grid = monthGrid(month, dates, today, draft ? { from: draft.from, last: draft.last } : undefined);
  const pick = (date: string) => setDraft(startDraft(openings, date, today));

  return (
    <div className="flex flex-col gap-3" onKeyDown={(e) => e.key === "Escape" && setDraft(null)}>
      <MonthHeader
        label={grid.label}
        labelId={labelId}
        canNext={canGoNext(month, today)}
        isCurrent={month === monthOf(today)}
        onPrev={() => setMonth(addMonths(month, -1))}
        onNext={() => setMonth(addMonths(month, 1))}
        onToday={() => setMonth(monthOf(today))}
      />
      <CalendarGrid grid={grid} gridId={gridId} labelId={labelId} focus={focus} readOnly={readOnly} onPick={pick} />
      <WeekLegend weeks={grid.weeks} selectedFrom={draft?.from ?? null} readOnly={readOnly} onPick={pick} />
      <p className="text-[0.8125rem] text-tinta-2">
        {dates.length === 0 ? "Toca el día en que llegó el queso." : "Toca un día para ver su semana. El punto marca el día que llegó el queso."}
      </p>
      {draft && <DraftSummary draft={draft} openings={openings} today={today} onCancel={() => setDraft(null)} />}
    </div>
  );
}
