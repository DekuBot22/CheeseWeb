"use client";

import { useId, useState } from "react";
import { addDays } from "@/domain/week-calendar";
import { shortenedPreviousWeek } from "@/domain/week-hint";
import { formatDay, plural } from "@/lib/format";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Field, Input } from "@/ui/Field";
import { EffectNotice } from "./EffectNotice";
import { useOpenWeek } from "./use-open-week";

// Formulario de "Abrir semana nueva": fecha (después de la última apertura, hasta hoy) y nota opcional.
export function OpenWeekForm({
  today,
  lastOpening,
  onDone,
}: {
  today: string;
  lastOpening: string | null;
  onDone: () => void;
}) {
  const uid = useId();
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const { openWeek, loading, error } = useOpenWeek(onDone);
  // Solo la primera apertura a mano corta la semana automática anterior.
  const cut = !lastOpening && date ? shortenedPreviousWeek(date, today) : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void openWeek(date, note.trim());
      }}
      className="flex flex-col gap-4"
    >
      <Field
        label="Primer día de la semana"
        htmlFor={`${uid}-fecha`}
        hint="Normalmente el día que llega el queso. Puede ser una fecha pasada."
        error={error}
      >
        <Input
          id={`${uid}-fecha`}
          type="date"
          required
          value={date}
          min={lastOpening ? addDays(lastOpening, 1) : undefined}
          max={today}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>

      <Field label="Nota (opcional)" htmlFor={`${uid}-nota`}>
        <Input
          id={`${uid}-nota`}
          type="text"
          maxLength={300}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej. El queso llegó el domingo"
        />
      </Field>

      {date && date <= today && (!lastOpening || date > lastOpening) && (
        <EffectNotice params={{ action: "abrir", date }} />
      )}

      {cut !== null && (
        <Callout tone="info">
          Es tu primera semana marcada a mano: la semana anterior (sábado a viernes) queda de solo {plural(cut, "día")},
          hasta el {formatDay(addDays(date, -1))}.
        </Callout>
      )}

      <Button type="submit" size="sm" className="w-full" loading={loading} disabled={!date}>
        Abrir semana nueva
      </Button>
    </form>
  );
}
