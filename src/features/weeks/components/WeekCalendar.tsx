"use client";

import { useId, useState } from "react";
import { draftInput, startDraft, tapDay, type Draft } from "@/domain/week-draft";
import { addMonths, canGoNext, monthGrid, monthOf } from "@/domain/week-month";
import { planWeekRange, type OpeningRef } from "@/domain/week-range";
import { CalendarGrid } from "./CalendarGrid";
import { DraftPanel } from "./DraftPanel";
import { MonthHeader } from "./MonthHeader";
import { useGridFocus } from "./use-grid-focus";
import { WeekLegend } from "./WeekLegend";

// Calendario mensual de semanas: las semanas marcadas se ven como bandas de color. Tocar un día selecciona
// su semana (o crea una en un día sin semana); con una semana abierta, cada toque mueve el borde elegido
// y las bandas muestran cómo quedaría. Nada se guarda hasta pulsar «Guardar semana».
// `today` y las fechas llegan del servidor (nunca se usa el reloj del navegador: evita desajustes de zona horaria).
export function WeekCalendar({ openings, today, readOnly }: { openings: OpeningRef[]; today: string; readOnly: boolean }) {
  const labelId = useId();
  const gridId = useId();
  const [month, setMonth] = useState(monthOf(today));
  const [draft, setDraft] = useState<Draft | null>(null);
  const focus = useGridFocus(gridId, today, month, setMonth);

  const plan = draft ? planWeekRange(openings, draftInput(draft), today) : null;
  const dates = plan?.ok ? plan.after : openings.map((o) => o.date);
  const grid = monthGrid(month, dates, today, draft ? { from: draft.from, last: draft.last } : undefined);

  const pick = (date: string) => setDraft(draft ? tapDay(draft, date, today) : startDraft(openings, date, today));
  const pickWeek = (from: string) => setDraft(startDraft(openings, from, today));
  const close = () => setDraft(null);

  return (
    <div className="flex flex-col gap-3" onKeyDown={(e) => e.key === "Escape" && close()}>
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
      <WeekLegend weeks={grid.weeks} selectedFrom={draft?.from ?? null} readOnly={readOnly} onPick={pickWeek} />
      {!draft && (
        <p className="text-[0.8125rem] text-tinta-2">
          {openings.length === 0 ? "Toca el día en que llegó el queso." : "Toca un día para elegir su semana. El punto marca el día que llegó el queso."}
        </p>
      )}
      {draft && plan && <DraftPanel draft={draft} plan={plan} openings={openings} today={today} onChange={setDraft} onClose={close} />}
    </div>
  );
}
